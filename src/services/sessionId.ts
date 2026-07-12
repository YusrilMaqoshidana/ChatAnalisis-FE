// ─── Session management ───────────────────────────────────────────────────────
export function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('chat_analisis_session_id')
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now()
    localStorage.setItem('chat_analisis_session_id', sessionId)
  }
  return sessionId
}

export function clearSessionId(): void {
  localStorage.removeItem('chat_analisis_session_id')
}
