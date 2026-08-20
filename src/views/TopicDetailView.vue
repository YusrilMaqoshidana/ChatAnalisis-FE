<script setup lang="ts">
// src/views/TopicDetailView.vue
// ─── MVI: View Layer for Topic Detail Page ───────────────────────────────────
//
// The View reads state from the store and dispatches typed Intents.
// Local UI state (modal visibility, loading flags) stays in the View
// since it is purely presentational and does not affect the global model.
// ─────────────────────────────────────────────────────────────────────────────

import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useResultsStore } from '@/stores/results'
import type { MessageContext } from '@/stores/results'
import type { Message } from '@/types/results'
import { ResultsIntentCreators } from '@/intents/results.intents'
import MessageListItem from '@/components/MessageListItem.vue'
import MessageContextModal from '@/components/MessageContextModal.vue'

const route = useRoute()
const store = useResultsStore()

// ── Derived state from route ──────────────────────────────────────────────────
const topicId = computed(() => parseInt(route.params.topicId as string))

const topic = computed(() => store.topics.find((t) => t.topicId === topicId.value))

// ── Local UI state ────────────────────────────────────────────────────────────
// These are view-only states (loading indicators, modal visibility).
// They live in the View — not in the global Model — since they are transient UI.
const topicMessages = ref<Message[]>([])
const isMessagesLoading = ref(false)
const modalVisible = ref(false)
const focusedMessage = ref<{ sender: string; content: string; timestamp: string } | null>(null)
const contextMessages = ref<MessageContext[]>([])
const isContextLoading = ref(false)

const sortedMessages = computed(() => {
  if (!topicMessages.value) return []
  if (!topic.value || !topic.value.keywords || topic.value.keywords.length === 0) {
    return topicMessages.value
  }

  const list = [...topicMessages.value]
  const keywords = topic.value.keywords.map((kw) => kw.toLowerCase().trim())

  const countKeywordMatches = (content: string) => {
    if (!content) return 0
    const lowerContent = content.toLowerCase()
    let count = 0
    for (const kw of keywords) {
      if (lowerContent.includes(kw)) {
        count++
      }
    }
    return count
  }

  return list.sort((a, b) => {
    const matchesA = countKeywordMatches(a.content)
    const matchesB = countKeywordMatches(b.content)
    if (matchesA !== matchesB) {
      return matchesB - matchesA
    }
    return a.id - b.id
  })
})

// ── Intent Dispatchers ───────────────────────────────────────────────────────
watch(
  topicId,
  async (newId) => {
    if (isNaN(newId)) return
    isMessagesLoading.value = true
    try {
      // If store topics are empty (e.g. page refreshed), fetch overview first
      if (store.topics.length === 0) {
        await store.dispatch(ResultsIntentCreators.fetchOverview())
      }
      // Dispatch intent and receive returned messages (typed as Message[])
      const result = await store.dispatch(ResultsIntentCreators.fetchTopicMessages(newId))
      topicMessages.value = (result as Message[]) ?? []
    } catch (err: unknown) {
      console.error('Error loading topic detail messages:', err)
    } finally {
      isMessagesLoading.value = false
    }
  },
  { immediate: true },
)

const onMessageClick = async (msg: {
  id: number
  sender: string
  content: string
  timestamp: string
}) => {
  focusedMessage.value = {
    sender: msg.sender,
    content: msg.content,
    timestamp: msg.timestamp,
  }
  isContextLoading.value = true
  contextMessages.value = []
  modalVisible.value = true

  try {
    const backendMsgId = `msg_${msg.id}`
    const result = await store.dispatch(ResultsIntentCreators.fetchMessageContext(backendMsgId))
    contextMessages.value = (result as MessageContext[]) ?? []
  } catch (err: unknown) {
    console.error('Error fetching message context:', err)
  } finally {
    isContextLoading.value = false
  }
}

// Back navigation is handled directly in the template via $router.push('/results')
// since it is purely presentational with no side effects on the model.
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Back Navigation -->
    <div>
      <button
        @click="$router.push('/results')"
        class="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors duration-200 cursor-pointer"
      >
        <i class="pi pi-arrow-left text-xs"></i>
        Kembali ke Dashboard
      </button>
    </div>

    <!-- Topic Header Card -->
    <div
      v-if="topic"
      class="bg-surface/30 border border-border/80 rounded-2xl p-6 md:p-8 space-y-4"
    >
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="space-y-2">
          <span class="text-xs font-bold text-accent uppercase tracking-wider"
            >DETAIL KLASTER #{{ topic.topicId }}</span
          >
          <h1 class="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            {{ topic.label }}
          </h1>
        </div>
        <div class="bg-accent/10 border border-accent/20 rounded-xl px-4 py-2 text-right">
          <div class="text-xs text-muted">Jumlah Pesan</div>
          <div class="text-lg font-black text-accent">{{ topic.messageCount }} pesan</div>
        </div>
      </div>

      <!-- Keywords description -->
      <div class="flex flex-wrap gap-2 pt-2 border-t border-border/50">
        <span class="text-xs text-muted font-medium self-center mr-1">Kata Kunci Utama:</span>
        <span
          v-for="kw in topic.keywords"
          :key="kw"
          class="px-2.5 py-0.5 rounded-lg bg-surface text-xs text-muted font-mono"
        >
          #{{ kw }}
        </span>
      </div>
    </div>

    <div v-else class="text-center py-12 bg-surface/30 border border-border/85 rounded-2xl">
      <i class="pi pi-exclamation-circle text-accent text-3xl mb-2"></i>
      <h3 class="text-lg font-bold text-ink">Klaster topik tidak ditemukan</h3>
      <p class="text-sm text-muted">Silakan kembali ke dashboard hasil analisis.</p>
    </div>

    <!-- Messages Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-ink flex items-center gap-2">
          <i class="pi pi-comments text-accent"></i>
          Daftar Pesan dalam Topik
        </h2>
        <span class="text-xs text-muted">{{ topicMessages.length }} pesan teridentifikasi</span>
      </div>

      <!-- Message List -->
      <div class="space-y-3">
        <MessageListItem
          v-for="msg in sortedMessages"
          :key="msg.id"
          :sender="msg.sender"
          :content="msg.content"
          :timestamp="msg.timestamp"
          @click="onMessageClick(msg)"
        />
      </div>
    </div>

    <!-- Message Context Modal -->
    <MessageContextModal
      v-model:visible="modalVisible"
      :focusedMessage="focusedMessage"
      :contextMessages="contextMessages"
    />
  </div>
</template>
