// src/types/results.ts

export interface Metrics {
  topic_diversity: number
  c_npmi: number
  embedding_density: number
  intra_topic_similarity: number
}

export interface Topic {
  topic_id: number
  label: string
  message_count: number
  keywords?: string[]
}

export interface SenderStat {
  name: string
  message_count: number
}

export interface ActiveDate {
  date: string
  count: number
}

export interface ActiveHour {
  hour: number
  count: number
}

export interface ResultsSummary {
  metrics: Metrics
  topic_count: number
  topics: Topic[]
  top_senders: SenderStat[]
  active_dates: ActiveDate[]
  active_hours: ActiveHour[]
}

export interface Message {
  message_id: string
  sender: string
  content: string
  timestamp: string
}

export interface TopicDetail {
  topic_id: number
  label: string
  messages: Message[]
}

export interface MessageContext {
  focused_message: Message
  context_messages: (Message & { is_focused: boolean })[]
}
