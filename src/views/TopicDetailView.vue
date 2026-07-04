<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResultsStore } from '@/stores/results'
import MessageListItem from '@/components/MessageListItem.vue'
import MessageContextModal from '@/components/MessageContextModal.vue'

const route = useRoute()
const router = useRouter()
const store = useResultsStore()

const topicId = computed(() => parseInt(route.params.topicId as string))

// Find current topic details
const topic = computed(() => {
  return store.topics.find((t) => t.topicId === topicId.value)
})

// Retrieve messages for this topic
const topicMessages = computed(() => {
  return store.getTopicMessages(topicId.value)
})

// Modal states
const modalVisible = ref(false)
const focusedMessage = ref<{ sender: string; content: string; timestamp: string } | null>(null)
const contextMessages = ref<
  Array<{ sender: string; content: string; timestamp: string; isFocused: boolean }>
>([])

// Handle message item click to trigger modal
const handleMessageClick = (msg: {
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
  // Retrieve the original timeline context
  contextMessages.value = store.getMessageContext(msg.id)
  modalVisible.value = true
}

const goBack = () => {
  router.push('/results')
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Back Navigation -->
    <div>
      <button
        @click="goBack"
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
          v-for="msg in topicMessages"
          :key="msg.id"
          :sender="msg.sender"
          :content="msg.content"
          :timestamp="msg.timestamp"
          @click="handleMessageClick(msg)"
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
