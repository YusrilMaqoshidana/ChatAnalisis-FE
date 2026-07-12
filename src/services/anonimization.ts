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
  if (original === SYSTEM_SENDER) {
    return SYSTEM_SENDER
  }
  const normalized = normalizeSender(original)
  const prefix = await hashPrefix(normalized)
  if (isPhoneNumber(normalized)) {
    return `${USER_PREFIX}${prefix}·${extractLastFour(normalized)}`
  }
  return `${USER_PREFIX}${prefix}`
}

export async function anonymizeMessages(messages: ParsedMessage[]): Promise<ParsedMessage[]> {
  const anonymized: ParsedMessage[] = []
  for (const m of messages) {
    const anonSender = await anonymizeSender(m.sender)
    anonymized.push({
      ...m,
      sender: anonSender
    })
  }
  return anonymized
}
