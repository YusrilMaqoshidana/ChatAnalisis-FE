// src/services/chatParser.ts
import JSZip from 'jszip'

// ─── Invisible / special character normalization ───────────────────────────────
const INVISIBLE_CHARS = [
  "\u200b", "\u200c", "\u200d", "\u2060", "\ufeff",
  "\u2068", "\u2069", "\u202a", "\u202b", "\u202c",
  "\u200e", "\u200f",
]
const SPACE_LIKE_CHARS = ["\u00a0", "\u202f", "\u2009", "\u2007"]

// ─── Regex Patterns ───────────────────────────────────────────────────────────
import type { ParsedMessage } from '@/types/chat'

const ANDROID_ID_12H_MSG = /^(\d{2}\/\d{2}\/\d{2})\s+(\d{1,2}\.\d{2})\s+([AP]M)\s+-\s+(.*?):\s+(.*)$/
const ANDROID_ID_24H_MSG = /^(\d{2}\/\d{2}\/\d{2})\s+(\d{1,2}\.\d{2})\s+-\s+(.*?):\s+(.*)$/
const ANDROID_EN_12H_MSG = /^(\d{1,2}\/\d{1,2}\/\d{2}),\s+(\d{1,2}:\d{2})\s+([ap]m)\s+-\s+(.*?):\s+(.*)$/

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
  return result.replace(/\s+/g, " ").trim()
}

// ─── Format detection ─────────────────────────────────────────────────────────
function detectFormat(lines: string[]): string {
  for (const raw of lines) {
    const line = normalizeLine(raw)
    if (!line) continue
    if (/^\d{1,2}\/\d{1,2}\/\d{2},\s+\d{1,2}:\d{2}\s+[ap]m/i.test(line)) {
      return "android_en_12h"
    }
    if (/^\d{2}\/\d{2}\/\d{2}\s+\d{1,2}\.\d{2}\s+[AP]M/i.test(line)) {
      return "android_id_12h"
    }
    if (/^\d{2}\/\d{2}\/\d{2}\s+\d{1,2}\.\d{2}\s+-/i.test(line)) {
      return "android_id_24h"
    }
  }
  return "android_id_24h"
}

// ─── Timestamp conversion to ISO 8601 ─────────────────────────────────────────
function parseTimestampToISO(rawTimestamp: string, fmt: string): string {
  const cleaned = rawTimestamp.replace(/,/g, "").replace(/\s+/g, " ").trim()
  const parts = cleaned.split(" ")
  if (parts.length < 2) {
    throw new Error(`Timestamp tidak valid: ${rawTimestamp}`)
  }

  const datePart = parts[0] || ""
  const timePart = parts[1] || ""
  const meridiemPart = parts[2] || ""

  const dateSplits = datePart.split("/")
  if (dateSplits.length !== 3) {
    throw new Error(`Format tanggal tidak valid: ${datePart}`)
  }

  const day = parseInt(dateSplits[0] || "0", 10)
  const month = parseInt(dateSplits[1] || "0", 10)
  const year2d = parseInt(dateSplits[2] || "0", 10)
  const year = year2d < 100 ? 2000 + year2d : year2d

  const timeSplits = timePart.includes(".") ? timePart.split(".") : timePart.split(":")
  if (timeSplits.length !== 2) {
    throw new Error(`Format waktu tidak valid: ${timePart}`)
  }

  let hour = parseInt(timeSplits[0] || "0", 10)
  const minute = parseInt(timeSplits[1] || "0", 10)

  if (fmt === "android_id_12h" || fmt === "android_en_12h") {
    if (meridiemPart) {
      const med = meridiemPart.toUpperCase()
      if (med === "PM" && hour < 12) {
        hour += 12
      } else if (med === "AM" && hour === 12) {
        hour = 0
      }
    }
  }

  const pad = (num: number) => String(num).padStart(2, '0')
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`
}

// ─── Line checkers and parsers ────────────────────────────────────────────────
function tryParseAndroidId12h(line: string): ParsedMessage | null {
  const m = line.match(ANDROID_ID_12H_MSG)
  if (m && m[1] && m[2] && m[3] && m[4] && m[5]) {
    const tanggal = m[1]
    const jam = m[2]
    const meridiem = m[3]
    const sender = m[4]
    const pesan = m[5]
    const rawTs = `${tanggal} ${jam} ${meridiem}`
    try {
      return {
        timestamp: parseTimestampToISO(rawTs, "android_id_12h"),
        sender: sender.trim(),
        pesan: pesan
      }
    } catch {
      return null
    }
  }
  return null
}

function tryParseAndroidId24h(line: string): ParsedMessage | null {
  const m = line.match(ANDROID_ID_24H_MSG)
  if (m && m[1] && m[2] && m[3] && m[4]) {
    const tanggal = m[1]
    const jam = m[2]
    const sender = m[3]
    const pesan = m[4]
    const rawTs = `${tanggal} ${jam}`
    try {
      return {
        timestamp: parseTimestampToISO(rawTs, "android_id_24h"),
        sender: sender.trim(),
        pesan: pesan
      }
    } catch {
      return null
    }
  }
  return null
}

function tryParseAndroidEn12h(line: string): ParsedMessage | null {
  const m = line.match(ANDROID_EN_12H_MSG)
  if (m && m[1] && m[2] && m[3] && m[4] && m[5]) {
    const tanggal = m[1]
    const jam = m[2]
    const meridiem = m[3]
    const sender = m[4]
    const pesan = m[5]
    const rawTs = `${tanggal} ${jam} ${meridiem}`
    try {
      return {
        timestamp: parseTimestampToISO(rawTs, "android_en_12h"),
        sender: sender.trim(),
        pesan: pesan
      }
    } catch {
      return null
    }
  }
  return null
}

function isTimestampLine(line: string, fmt: string): boolean {
  if (fmt === "android_en_12h") {
    return /^\d{1,2}\/\d{1,2}\/\d{2},\s+\d{1,2}:\d{2}\s+[ap]m/i.test(line)
  }
  if (fmt === "android_id_12h") {
    return /^\d{2}\/\d{2}\/\d{2}\s+\d{1,2}\.\d{2}\s+[AP]M/i.test(line)
  }
  return /^\d{2}\/\d{2}\/\d{2}\s+\d{1,2}\.\d{2}\s+-/i.test(line)
}

// ─── Main Parser ──────────────────────────────────────────────────────────────
export async function parsingTxtToMessages(fileContent: string): Promise<ParsedMessage[]> {
  const lines = fileContent.split(/\r?\n/)
  const fmt = detectFormat(lines)
  console.log(`[INFO] Format terdeteksi: {fmt}`)

  const parseFnMap: Record<string, (line: string) => ParsedMessage | null> = {
    "android_id_12h": tryParseAndroidId12h,
    "android_id_24h": tryParseAndroidId24h,
    "android_en_12h": tryParseAndroidEn12h,
  }
  const parseFn = parseFnMap[fmt] || tryParseAndroidId24h

  const messages: ParsedMessage[] = []
  let currentMsg: ParsedMessage | null = null

  for (const raw of lines) {
    const line = normalizeLine(raw)
    if (!line) continue

    const parsed = parseFn(line)
    if (parsed !== null) {
      if (currentMsg !== null) {
        messages.push(currentMsg)
      }
      currentMsg = parsed
    } else if (isTimestampLine(line, fmt)) {
      if (currentMsg !== null) {
        messages.push(currentMsg)
      }
      currentMsg = null
    } else {
      if (currentMsg !== null) {
        currentMsg.pesan = `${currentMsg.pesan}\n${line}`.trim()
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



