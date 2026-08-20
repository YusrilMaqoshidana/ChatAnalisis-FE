import type { ParsedMessage } from "@/types/chat"

// ─── Anonymization Logic ──────────────────────────────────────────────────────
const SYSTEM_SENDER = "SYSTEM"
const USER_PREFIX = "User-"
const ANONYMIZATION_SALT = "chat-analisis-v1"
const PHONE_PATTERN = /^\+\d{8,15}$/

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

function normalizeSender(sender: string): string {
  return sender.trim().toLowerCase()
}

function isPhoneNumber(normalizedSender: string): boolean {
  const cleaned = normalizedSender.replace(/[^\d+]/g, '')
  return PHONE_PATTERN.test(cleaned)
}

function extractLastFour(normalizedSender: string): string {
  const digits = normalizedSender.replace(/\D/g, '')
  return digits.length >= 4 ? digits.slice(-4) : digits.padStart(4, '0')
}

async function hashPrefix(normalizedSender: string): Promise<string> {
  const raw = `${ANONYMIZATION_SALT}:${normalizedSender}`
  const hashed = await sha256(raw)
  return hashed.slice(0, 4)
}

export async function anonymizeSender(sender: string): Promise<string> {
  const original = sender.trim()
  if (original === SYSTEM_SENDER || original === "") {
    return original
  }
  const normalized = normalizeSender(original)
  const prefix = await hashPrefix(normalized)
  if (isPhoneNumber(normalized)) {
    return `${USER_PREFIX}${prefix}·${extractLastFour(normalized)}`
  }
  return `${USER_PREFIX}${prefix}`
}

export async function anonymizeMessages(messages: ParsedMessage[]): Promise<ParsedMessage[]> {
  // 1. Extract unique senders
  const uniqueSendersSet = new Set<string>()
  for (const m of messages) {
    const s = m.sender.trim()
    if (s && s !== SYSTEM_SENDER && !s.startsWith(USER_PREFIX)) {
      uniqueSendersSet.add(s)
    }
  }
  const uniqueSenders = Array.from(uniqueSendersSet)
  
  // Sort descending by length to replace longest names first (prevent partial matching)
  uniqueSenders.sort((a, b) => b.length - a.length)

  // 2. Precompute anonymized names
  const senderMap: Record<string, string> = {}
  for (const sender of uniqueSenders) {
    senderMap[sender] = await anonymizeSender(sender)
  }

  // 3. Anonymize senders and mentions in the messages
  const anonymized: ParsedMessage[] = []
  
  // Helper to escape regex special characters
  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  for (const m of messages) {
    const trimmedSender = m.sender.trim()
    const anonSender = senderMap[trimmedSender] || (trimmedSender.startsWith(USER_PREFIX) ? trimmedSender : await anonymizeSender(m.sender))
    
    let anonPesan = m.pesan
    if (uniqueSenders.length > 0) {
      for (const origName of uniqueSenders) {
        const anonName = senderMap[origName]
        const escaped = escapeRegExp(origName)
        // Match @name with optional spacing, like @ Name or @name
        const regex = new RegExp(`@\\s*${escaped}(?=\\b|$)`, 'gi')
        anonPesan = anonPesan.replace(regex, `@${anonName}`)
      }
    }

    anonymized.push({
      ...m,
      sender: anonSender,
      pesan: anonPesan
    })
  }

  return anonymized
}
