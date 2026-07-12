// src/types/results.ts

// ─── DTOs (Data Transfer Objects from Backend) ──────────────────────────────
export interface MetricsDTO {
  topic_diversity: number
  c_npmi: number
  embedding_density: number
  intra_topic_similarity: number
}

export interface TopicDTO {
  topic_id: number
  label: string
  message_count: number
  keywords?: string[]
}

export interface SenderStatDTO {
  name: string
  message_count: number
}

export interface ActiveDateDTO {
  date: string
  count: number
}

export interface ActiveHourDTO {
  hour: number
  count: number
}

export interface ResultsSummaryDTO {
  metrics: MetricsDTO
  topic_count: number
  topics: TopicDTO[]
  top_senders: SenderStatDTO[]
  active_dates: ActiveDateDTO[]
  active_hours: ActiveHourDTO[]
}

export interface MessageDTO {
  message_id: string
  sender: string
  content: string
  timestamp: string
}

export interface TopicDetailDTO {
  topic_id: number
  label: string
  messages: MessageDTO[]
}

export interface MessageContextDTO {
  focused_message: MessageDTO
  context_messages: (MessageDTO & { is_focused: boolean })[]
}


// ─── Domain Models (Used by Frontend UI / Store) ─────────────────────────────
export interface EvaluationMetrics {
  topicDiversity: number
  cnpmi: number
  embeddingDensity: number
  intraTopicSimilarity: number
}

export interface Topic {
  topicId: number
  label: string
  messageCount: number
  keywords: string[]
  percentage: number
  sentiment: string
  sentimentColor: string
}

export interface Sender {
  name: string
  messageCount: number
  avatarInitial: string
}

export interface ActiveDate {
  date: string
  count: number
}

export interface ActiveHour {
  hour: number
  count: number
}

export interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  topicId: number
  date: string
}
