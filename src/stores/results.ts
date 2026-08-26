// src/stores/results.ts
// ─── MVI: Intent Processor for Results Feature ──────────────────────────────
//
// In MVI (Model-View-Intent), the Store serves as the "Intent Processor":
//   - It holds the reactive Model (state).
//   - It exposes a single `dispatch(intent)` method to process all intents.
//   - It exposes derived read-only state (Computed) for the View.
//   - Views must NOT mutate state directly — they only dispatch intents.
//
// Data flow: View → Intent → dispatch() → State mutation + Side Effects → View re-renders
// ─────────────────────────────────────────────────────────────────────────────────────────

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  // Domain Models (UI layer)
  Topic,
  Sender,
  ActiveDate,
  ActiveHour,
  Message,
  // DTOs (Backend response shapes) — used for typing API response mappings
  TopicDTO,
  SenderStatDTO,
  ActiveDateDTO,
  ActiveHourDTO,
  MessageDTO,
} from '@/types/results'
import { fetchResults, fetchTopicDetail, fetchMessageContext, deleteResults } from '@/services/api'
import { getOrCreateSessionId, clearSessionId } from '@/services/sessionId'
import router from '@/router'
import { ResultsIntent } from '@/intents/results.intents'
import type { ResultsIntentAction } from '@/intents/results.intents'
import { createInitialResultsModel } from '@/models/results.model'
import { useUploadStore } from '@/stores/upload'
import { UploadIntentCreators } from '@/intents/upload.intents'

// ─── Mapper Functions ──────────────────────────────────────────────────────────
// Pure functions that transform backend DTOs → frontend domain models.
// Centralizing them here removes all `any` casts and makes transformations testable.

function mapTopicDTOToModel(dto: TopicDTO, totalMessages: number): Topic {
  return {
    topicId: dto.topic_id,
    label: dto.label,
    messageCount: dto.message_count,
    keywords: dto.keywords ?? [],
    percentage:
      totalMessages > 0
        ? parseFloat(((dto.message_count / totalMessages) * 100).toFixed(1))
        : 0,
    sentiment: 'Netral',
    sentimentColor: 'text-[#8B8F9E] border-[#2C303F] bg-[#1B1E2A]/50',
  }
}

function mapSenderDTOToModel(dto: SenderStatDTO): Sender {
  return {
    name: dto.name,
    messageCount: dto.message_count,
    avatarInitial: dto.name
      .replace('User-', '')
      .replace('Pengirim-', '')
      .substring(0, 2)
      .toUpperCase(),
  }
}

function mapActiveDateDTOToModel(dto: ActiveDateDTO): ActiveDate {
  return { date: dto.date, count: dto.count }
}

function mapActiveHourDTOToModel(dto: ActiveHourDTO): ActiveHour {
  return { hour: dto.hour, count: dto.count }
}

function mapMessageDTOToModel(dto: MessageDTO, topicId: number): Message {
  return {
    id: parseInt(dto.message_id.replace('msg_', ''), 10),
    sender: dto.sender,
    content: dto.content,
    timestamp: dto.timestamp.split(' ').pop()?.substring(0, 5) ?? dto.timestamp,
    topicId,
    date: dto.timestamp.split(' ')[0] ?? '',
  }
}

// ─── Context Message Type ──────────────────────────────────────────────────────
// Local domain type for message context entries (used in TopicDetailView modal).
export interface MessageContext {
  sender: string
  content: string
  timestamp: string
  isFocused: boolean
}

// ─── Store ─────────────────────────────────────────────────────────────────────
export const useResultsStore = defineStore('results', () => {
  // ── Model (State) ──────────────────────────────────────────────────────────
  // Initialize from the canonical model shape defined in models/results.model.ts
  const _initial = createInitialResultsModel()
  const isAnalyzed = ref(_initial.isAnalyzed)
  const isLoading = ref(_initial.isLoading)
  const error = ref<string | null>(_initial.error)
  const metrics = ref(_initial.metrics)
  const topics = ref<Topic[]>(_initial.topics)
  const topSenders = ref<Sender[]>(_initial.topSenders)
  const activeDates = ref<ActiveDate[]>(_initial.activeDates)
  const activeHours = ref<ActiveHour[]>(_initial.activeHours)
  const allMessages = ref<Message[]>(_initial.allMessages)

  // ── Derived State (Computed) ───────────────────────────────────────────────
  const totalTopics = computed(() => topics.value.length)

  // ── Private Query Functions ────────────────────────────────────────────────
  // Read-only selectors — available directly to Views, no intent needed.
  const getTopicMessages = (topicId: number): Message[] =>
    allMessages.value.filter((msg) => msg.topicId === topicId)

  const getMessageContext = (messageId: number, range = 4): MessageContext[] => {
    const index = allMessages.value.findIndex((msg) => msg.id === messageId)
    if (index === -1) return []
    const start = Math.max(0, index - range)
    const end = Math.min(allMessages.value.length, index + range + 1)
    return allMessages.value.slice(start, end).map((msg) => ({
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp,
      isFocused: msg.id === messageId,
    }))
  }

  // ── Private Side-Effect Handlers ──────────────────────────────────────────
  const _handleFetchOverview = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const jobId = getOrCreateSessionId()
      const response = await fetchResults(jobId)
      const data = response.data.data

      if (!data) throw new Error('Data hasil analisis kosong.')

      metrics.value = {
        topicDiversity: data.metrics.topic_diversity,
        cnpmi: data.metrics.c_npmi,
        embeddingDensity: data.metrics.embedding_density,
        intraTopicSimilarity: data.metrics.intra_topic_similarity,
      }

      const totalMsgs = data.topics.reduce(
        (acc: number, curr: TopicDTO) => acc + curr.message_count,
        0,
      )
      topics.value = data.topics.map((t: TopicDTO) => mapTopicDTOToModel(t, totalMsgs))
      topSenders.value = data.top_senders.map((s: SenderStatDTO) => mapSenderDTOToModel(s))
      activeDates.value = data.active_dates.map((d: ActiveDateDTO) => mapActiveDateDTOToModel(d))
      activeHours.value = data.active_hours.map((h: ActiveHourDTO) => mapActiveHourDTOToModel(h))

      isAnalyzed.value = true
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string }; status?: number }; message?: string }
      console.error('Error fetching overview data:', err)
      error.value = apiErr.response?.data?.message ?? apiErr.message ?? 'Gagal memuat data metrik.'
      isAnalyzed.value = false
      if (apiErr.response?.status === 404) {
        clearSessionId()
        router.push('/upload')
      }
    } finally {
      isLoading.value = false
    }
  }

  const _handleFetchTopicMessages = async (topicId: number): Promise<Message[]> => {
    isLoading.value = true
    error.value = null
    try {
      const jobId = getOrCreateSessionId()
      const response = await fetchTopicDetail(jobId, topicId)
      const data = response.data.data
      if (!data) return []
      return data.messages.map((m: MessageDTO) => mapMessageDTOToModel(m, topicId))
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string }
      console.error(err)
      error.value = apiErr.response?.data?.message ?? apiErr.message ?? 'Gagal memuat detail topik.'
      return []
    } finally {
      isLoading.value = false
    }
  }

  const _handleFetchMessageContext = async (messageId: string): Promise<MessageContext[]> => {
    try {
      const jobId = getOrCreateSessionId()
      const response = await fetchMessageContext(jobId, messageId)
      const data = response.data.data
      if (!data) return []
      return data.context_messages.map(
        (m: MessageDTO & { is_focused: boolean }): MessageContext => ({
          sender: m.sender,
          content: m.content,
          timestamp: m.timestamp.split(' ').pop()?.substring(0, 5) ?? m.timestamp,
          isFocused: m.is_focused,
        }),
      )
    } catch (err: unknown) {
      console.error(err)
      return []
    }
  }

  const _handleNavigateToUpload = async (): Promise<void> => {
    const sessionId = sessionStorage.getItem('chat_analisis_session_id')
    if (sessionId) {
      try {
        await deleteResults(sessionId)
      } catch (err: unknown) {
        console.error('Failed to delete results from server:', err)
      }
    }
    clearSessionId()

    // Reset resultsStore model state
    const initialResults = createInitialResultsModel()
    isAnalyzed.value = initialResults.isAnalyzed
    isLoading.value = initialResults.isLoading
    error.value = initialResults.error
    metrics.value = initialResults.metrics
    topics.value = initialResults.topics
    topSenders.value = initialResults.topSenders
    activeDates.value = initialResults.activeDates
    activeHours.value = initialResults.activeHours
    allMessages.value = initialResults.allMessages

    // Reset uploadStore state to Step 1 via Intent Dispatcher
    const uploadStore = useUploadStore()
    uploadStore.dispatch(UploadIntentCreators.clearFile())

    router.push('/upload')
  }

  const _handleNavigateToTopic = (topicId: string | number): void => {
    router.push(`/results/topics/${topicId}`)
  }

  // ── Intent Dispatcher ──────────────────────────────────────────────────────
  // The single entry point for all state mutations from the View.
  // Return type is typed per intent case using overloads-style union.
  async function dispatch(intent: ResultsIntentAction): Promise<Message[] | MessageContext[] | void> {
    switch (intent.type) {
      case ResultsIntent.FETCH_OVERVIEW:
        await _handleFetchOverview()
        break
      case ResultsIntent.FETCH_TOPIC_MESSAGES:
        return await _handleFetchTopicMessages(intent.payload.topicId)
      case ResultsIntent.FETCH_MESSAGE_CONTEXT:
        return await _handleFetchMessageContext(intent.payload.messageId)
      case ResultsIntent.SET_ANALYZED:
        isAnalyzed.value = intent.payload.value
        break
      case ResultsIntent.NAVIGATE_TO_UPLOAD:
        await _handleNavigateToUpload()
        break
      case ResultsIntent.NAVIGATE_TO_TOPIC:
        _handleNavigateToTopic(intent.payload.topicId)
        break
      default:
        console.warn('[ResultsStore] Unknown intent dispatched:', intent)
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────
  // Only state refs, computed values, query functions, and dispatch are exposed.
  return {
    // Model (state)
    isAnalyzed,
    isLoading,
    error,
    metrics,
    topics,
    topSenders,
    activeDates,
    activeHours,
    allMessages,
    // Derived state
    totalTopics,
    // Query functions (selectors — read-only, no side effects)
    getTopicMessages,
    getMessageContext,
    // Intent Dispatcher
    dispatch,
  }
})
