// src/services/chatParser.ts
import JSZip from 'jszip'
import type { ParsedMessage } from '@/types/chat'

// ─── Invisible / special character normalization ───────────────────────────────
const INVISIBLE_CHARS = [
  "\u200b", "\u200c", "\u200d", "\u2060", "\ufeff",
  "\u2068", "\u2069", "\u202a", "\u202b", "\u202c",
  "\u200e", "\u200f",
]
const SPACE_LIKE_CHARS = ["\u00a0", "\u202f", "\u2009", "\u2007"]

// ─── Universal WhatsApp Timestamp Regex ───────────────────────────────────────
// Mendukung berbagai format WhatsApp export (Android ID/EN 12h/24h, iOS, 2/4-digit tahun, dsb)
const TIMESTAMP_RE = /^(?:\[?(\d{1,4}[/.\-]\d{1,2}[/.\-]\d{1,4}),?\s+(\d{1,2}[:.]\d{2}(?:[:.]\d{2})?)(?:\s*([APap]\.?\s*[Mm]\.?))?\]?)(?:\s*-\s*|\s+)(.*)$/

// ─── Zip extraction ─────────────────────────────────────────────────────────
/**
 * Extracts a zip file and looks for the first txt file.
 * Returns the text content of that file.
 */
export async function extractTxtFromZip(file: File): Promise<{ name: string; content: string }> {
  const zip = new JSZip()
  const loadedZip = await zip.loadAsync(file)

  // Find the first file that ends with .txt
  const txtFileKey = Object.keys(loadedZip.files).find(key => key.toLowerCase().endsWith('.txt'))

  if (!txtFileKey) {
    throw new Error('Tidak ditemukan file .txt di dalam file ZIP.')
  }

  const txtFile = loadedZip.files[txtFileKey]
  if (!txtFile) {
    throw new Error('Gagal membaca file .txt di dalam ZIP.')
  }

  const content = await txtFile.async('string')
  return { name: txtFile.name, content }
}

// ─── Line normalization ───────────────────────────────────────────────────────
function normalizeLine(text: string): string {
  let result = text
  for (const ch of INVISIBLE_CHARS) {
    result = result.replaceAll(ch, "")
  }
  for (const ch of SPACE_LIKE_CHARS) {
    result = result.replaceAll(ch, " ")
  }
  return result.trim()
}

// ─── Format detection (Day First: DD/MM vs MM/DD) ─────────────────────────────
function detectDayFirstFromLines(lines: string[]): boolean {
  for (const raw of lines) {
    const line = normalizeLine(raw)
    const m = line.match(TIMESTAMP_RE)
    if (m && m[1]) {
      const dateStr = m[1]
      const parts = dateStr.split(/[/.\-]/).map(p => parseInt(p, 10))
      if (parts.length === 3) {
        const [p0, p1] = parts
        if (p0 !== undefined && p1 !== undefined) {
          if (p0 > 12 && p1 <= 12) return true
          if (p1 > 12 && p0 <= 12) return false
        }
      }
    }
  }
  return true // Default: DD/MM
}

// ─── Timestamp conversion to ISO 8601 (YYYY-MM-DDTHH:mm:ss) ────────────────────
function toIsoTimestamp(
  dateStr: string,
  timeStr: string,
  ampmStr?: string,
  dayFirst: boolean = true
): string {
  const dateParts = dateStr.split(/[/.\-]/).map(p => parseInt(p, 10))
  if (dateParts.length !== 3 || dateParts.some(isNaN)) {
    throw new Error(`Format tanggal tidak valid: ${dateStr}`)
  }

  let year: number, month: number, day: number
  const [d0, d1, d2] = dateParts as [number, number, number]

  if (d0 > 1000) {
    // Format YYYY-MM-DD
    year = d0
    month = d1
    day = d2
  } else if (d2 > 1000) {
    // Format DD/MM/YYYY atau MM/DD/YYYY
    year = d2
    if (dayFirst) {
      day = d0
      month = d1
    } else {
      month = d0
      day = d1
    }
  } else {
    // Format 2-digit tahun (YY) -> e.g. 22 -> 2022
    year = d2 < 100 ? 2000 + d2 : d2
    if (dayFirst) {
      day = d0
      month = d1
    } else {
      month = d0
      day = d1
    }
  }

  const timeParts = timeStr.split(/[:.]/).map(p => parseInt(p, 10))
  if (timeParts.length < 2 || timeParts.some(isNaN)) {
    throw new Error(`Format waktu tidak valid: ${timeStr}`)
  }

  let hour = timeParts[0]!
  const minute = timeParts[1]!
  const second = timeParts.length > 2 ? timeParts[2]! : 0

  if (ampmStr) {
    const ampm = ampmStr.toLowerCase().replace(/\./g, "").trim()
    if (ampm === "pm" && hour < 12) {
      hour += 12
    } else if (ampm === "am" && hour === 12) {
      hour = 0
    }
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`
}

// ─── Main Parser ──────────────────────────────────────────────────────────────
export async function parsingTxtToMessages(fileContent: string): Promise<ParsedMessage[]> {
  const lines = fileContent.split(/\r?\n/)
  const dayFirst = detectDayFirstFromLines(lines)

  const messages: ParsedMessage[] = []
  let currentMsg: ParsedMessage | null = null

  for (const raw of lines) {
    const line = normalizeLine(raw)
    if (!line) continue

    const m = line.match(TIMESTAMP_RE)
    if (m) {
      const dateStr = m[1] || ""
      const timeStr = m[2] || ""
      const ampmStr = m[3]
      const content = m[4] || ""

      const colonIdx = content.indexOf(": ")
      if (colonIdx !== -1) {
        const sender = content.substring(0, colonIdx).trim()
        const pesan = content.substring(colonIdx + 2).trim()

        try {
          const isoTs = toIsoTimestamp(dateStr, timeStr, ampmStr, dayFirst)
          if (currentMsg !== null) {
            messages.push(currentMsg)
          }
          currentMsg = {
            timestamp: isoTs,
            sender: sender,
            pesan: pesan,
          }
        } catch {
          if (currentMsg !== null) {
            messages.push(currentMsg)
          }
          currentMsg = null
        }
      } else {
        // System message line (group created, user added, encryption notice, etc.)
        if (currentMsg !== null) {
          messages.push(currentMsg)
        }
        currentMsg = null
      }
    } else {
      // Continuation line (multi-line message)
      if (currentMsg !== null) {
        currentMsg.pesan = `${currentMsg.pesan}\n${line}`
      }
    }
  }

  if (currentMsg !== null) {
    messages.push(currentMsg)
  }

  if (messages.length === 0) {
    throw new Error('Proses parsing tidak menghasilkan pesan obrolan. Periksa kesesuaian format file chat WhatsApp Anda.')
  }

  return messages
}

// ─── CSV Conversion ───────────────────────────────────────────────────────────
export function convertToCSV(messages: ParsedMessage[]): string {
  const headers = ["Timestamp", "Pengirim", "Pesan"]

  const escape = (val: string) => {
    const cleaned = val.replace(/"/g, '""')
    if (cleaned.includes(',') || cleaned.includes('"') || cleaned.includes('\n') || cleaned.includes('\r')) {
      return `"${cleaned}"`
    }
    return cleaned
  }

  const rows = messages.map(m => {
    return [escape(m.timestamp), escape(m.sender), escape(m.pesan)].join(",")
  })

  return [headers.join(","), ...rows].join("\n")
}



