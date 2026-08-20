// ─── Session management ───────────────────────────────────────────────────────
export function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem('chat_analisis_session_id')
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now()
    sessionStorage.setItem('chat_analisis_session_id', sessionId)
  }
  return sessionId
}

export function clearSessionId(): void {
  sessionStorage.removeItem('chat_analisis_session_id')
}
