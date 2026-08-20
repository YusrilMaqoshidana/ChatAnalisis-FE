// src/intents/results.intents.ts
// ─── MVI: Intent Definitions for Results Feature ────────────────────────────
// Intents are typed action descriptors dispatched from the View layer.

// ─── Intent Type Enum ────────────────────────────────────────────────────────
export const enum ResultsIntent {
  FETCH_OVERVIEW = 'results/FETCH_OVERVIEW',
  FETCH_TOPIC_MESSAGES = 'results/FETCH_TOPIC_MESSAGES',
  FETCH_MESSAGE_CONTEXT = 'results/FETCH_MESSAGE_CONTEXT',
  SET_ANALYZED = 'results/SET_ANALYZED',
  NAVIGATE_TO_UPLOAD = 'results/NAVIGATE_TO_UPLOAD',
  NAVIGATE_TO_TOPIC = 'results/NAVIGATE_TO_TOPIC',
}

// ─── Intent Payload Types ────────────────────────────────────────────────────
export interface FetchTopicMessagesPayload {
  topicId: number
}

export interface FetchMessageContextPayload {
  messageId: string
}

export interface SetAnalyzedPayload {
  value: boolean
}

export interface NavigateToTopicPayload {
  topicId: string | number
}

// ─── Intent Union Type ───────────────────────────────────────────────────────
export type ResultsIntentAction =
  | { type: ResultsIntent.FETCH_OVERVIEW }
  | { type: ResultsIntent.FETCH_TOPIC_MESSAGES; payload: FetchTopicMessagesPayload }
  | { type: ResultsIntent.FETCH_MESSAGE_CONTEXT; payload: FetchMessageContextPayload }
  | { type: ResultsIntent.SET_ANALYZED; payload: SetAnalyzedPayload }
  | { type: ResultsIntent.NAVIGATE_TO_UPLOAD }
  | { type: ResultsIntent.NAVIGATE_TO_TOPIC; payload: NavigateToTopicPayload }

// ─── Intent Creator Factory Functions ───────────────────────────────────────
export const ResultsIntentCreators = {
  fetchOverview: (): ResultsIntentAction => ({
    type: ResultsIntent.FETCH_OVERVIEW,
  }),
  fetchTopicMessages: (topicId: number): ResultsIntentAction => ({
    type: ResultsIntent.FETCH_TOPIC_MESSAGES,
    payload: { topicId },
  }),
  fetchMessageContext: (messageId: string): ResultsIntentAction => ({
    type: ResultsIntent.FETCH_MESSAGE_CONTEXT,
    payload: { messageId },
  }),
  setAnalyzed: (value: boolean): ResultsIntentAction => ({
    type: ResultsIntent.SET_ANALYZED,
    payload: { value },
  }),
  navigateToUpload: (): ResultsIntentAction => ({
    type: ResultsIntent.NAVIGATE_TO_UPLOAD,
  }),
  navigateToTopic: (topicId: string | number): ResultsIntentAction => ({
    type: ResultsIntent.NAVIGATE_TO_TOPIC,
    payload: { topicId },
  }),
}
