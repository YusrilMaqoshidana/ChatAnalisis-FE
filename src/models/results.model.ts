// src/models/results.model.ts
// ─── MVI: Model (State Shape) for Results Feature ───────────────────────────
// The Model defines the complete, immutable-by-convention state shape.
// It is the single source of truth managed by the Pinia store.

import type {
  EvaluationMetrics,
  Topic,
  Sender,
  ActiveDate,
  ActiveHour,
  Message,
} from '@/types/results'

/**
 * ResultsModel: Complete state shape for the results/dashboard feature.
 * This represents the "M" in MVI — the application's data layer for results.
 */
export interface ResultsModel {
  // Session & loading state
  isAnalyzed: boolean
  isLoading: boolean
  error: string | null

  // Data state
  metrics: EvaluationMetrics
  topics: Topic[]
  topSenders: Sender[]
  activeDates: ActiveDate[]
  activeHours: ActiveHour[]
  allMessages: Message[]
}

/**
 * Default empty metrics — used as initial state.
 */
export const DEFAULT_METRICS: EvaluationMetrics = {
  topicDiversity: 0,
  cnpmi: 0,
  embeddingDensity: 0,
  intraTopicSimilarity: 0,
}

/**
 * Default empty topics dataset
 */
export const DEFAULT_TOPICS: Topic[] = []

/**
 * Default empty top senders dataset
 */
export const DEFAULT_TOP_SENDERS: Sender[] = []

/**
 * Default empty active dates dataset
 */
export const DEFAULT_ACTIVE_DATES: ActiveDate[] = []

/**
 * Default empty active hours dataset
 */
export const DEFAULT_ACTIVE_HOURS: ActiveHour[] = []

/**
 * Default empty messages dataset
 */
export const DEFAULT_MESSAGES: Message[] = []

/**
 * Initial state factory — always returns a fresh, default ResultsModel.
 */
export function createInitialResultsModel(): ResultsModel {
  return {
    isAnalyzed: !!sessionStorage.getItem('chat_analisis_session_id'),
    isLoading: false,
    error: null,
    metrics: { ...DEFAULT_METRICS },
    topics: [...DEFAULT_TOPICS],
    topSenders: [...DEFAULT_TOP_SENDERS],
    activeDates: [...DEFAULT_ACTIVE_DATES],
    activeHours: [...DEFAULT_ACTIVE_HOURS],
    allMessages: [...DEFAULT_MESSAGES],
  }
}
