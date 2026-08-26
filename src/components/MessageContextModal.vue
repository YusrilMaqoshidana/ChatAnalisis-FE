<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'

interface ContextMessage {
  sender: string
  content: string
  timestamp: string
  isFocused: boolean
}

const props = defineProps<{
  visible: boolean
  focusedMessage: {
    sender: string
    content: string
    timestamp: string
  } | null
  contextMessages: ContextMessage[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const localVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// Check if the sender is the one who sent the focused message
const isFocusedSender = (sender: string) => {
  return sender === props.focusedMessage?.sender
}

// Generate consistent dynamic name color classes based on sender name
const getSenderColorClass = (sender: string) => {
  const colors = [
    'text-[#E0A75E]', // Amber / Accent
    'text-[#5EC9C0]', // Teal / Accent Alt
    'text-blue-400',
    'text-purple-400',
    'text-pink-400',
    'text-orange-400',
    'text-green-400',
    'text-indigo-400'
  ]
  
  let hash = 0
  for (let i = 0; i < sender.length; i++) {
    hash = sender.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}
</script>

<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    header="Timeline Asli Percakapan"
    :style="{ width: '500px' }"
    :breakpoints="{ '640px': '95vw' }"
    dismissableMask
    class="whatsapp-modal"
  >
    <!-- Chat stream wrapper -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 space-y-3 text-center">
      <i class="pi pi-spin pi-spinner text-3xl text-accent"></i>
      <p class="text-sm text-muted font-medium">Memuat konteks percakapan...</p>
    </div>
    <div v-else-if="contextMessages.length === 0" class="flex flex-col items-center justify-center py-12 space-y-2 text-center">
      <i class="pi pi-inbox text-2xl text-muted"></i>
      <p class="text-sm text-muted font-medium">Tidak ada konteks pesan tersedia.</p>
    </div>
    <div v-else class="flex flex-col gap-3 py-2 max-h-[60vh] overflow-y-auto px-1 scrollable-chat">
      <div 
        v-for="(msg, idx) in contextMessages" 
        :key="idx"
        :class="[
          'flex w-full',
          isFocusedSender(msg.sender) ? 'justify-end' : 'justify-start'
        ]"
      >
        <!-- Chat Bubble -->
        <div 
          :class="[
            'relative max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md flex flex-col space-y-1',
            isFocusedSender(msg.sender) 
              ? 'bg-[#005c4b] text-ink rounded-tr-none' 
              : 'bg-[#202c33] text-ink rounded-tl-none',
            msg.isFocused 
              ? 'ring-2 ring-accent border-accent/40 bg-opacity-95' 
              : ''
          ]"
        >
          <!-- Focus indicator badge -->
          <span 
            v-if="msg.isFocused" 
            class="absolute -top-2.5 left-3 text-[9px] font-bold text-bg bg-accent px-1.5 py-0.5 rounded-full uppercase"
          >
            Pesan Terpilih
          </span>

          <!-- Sender Name (only show on left-aligned or new sender block) -->
          <span 
            v-if="!isFocusedSender(msg.sender)"
            :class="['text-xs font-bold font-sans tracking-wide', getSenderColorClass(msg.sender)]"
          >
            {{ msg.sender }}
          </span>
          <span 
            v-else
            class="text-[10px] font-bold text-accent-alt/90 text-right"
          >
            Anda (Fokus)
          </span>

          <!-- Content -->
          <p class="text-sm text-ink/95 leading-relaxed break-words font-light">
            {{ msg.content }}
          </p>

          <!-- Timestamp -->
          <span class="text-[9px] text-muted/70 text-right block font-mono self-end">
            {{ msg.timestamp }}
          </span>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* Override PrimeVue Dialog styles specifically for the WhatsApp dark theme look */
:deep(.p-dialog) {
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 1.25rem !important;
  color: var(--color-text) !important;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
}

:deep(.p-dialog-header) {
  background-color: var(--color-surface) !important;
  color: var(--color-text) !important;
  border-bottom: 1px solid var(--color-border) !important;
  padding: 1.25rem 1.5rem !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.p-dialog-title) {
  font-weight: 700 !important;
  font-size: 1.05rem !important;
  letter-spacing: -0.025em;
  color: var(--color-text) !important;
}

:deep(.p-dialog-content) {
  background-color: #0b141a !important; /* Authentic WhatsApp Dark Mode background */
  background-image: radial-gradient(rgba(44, 48, 63, 0.15) 1px, transparent 1px);
  background-size: 16px 16px;
  padding: 1.5rem 1.25rem !important;
}

:deep(.p-dialog-close-button) {
  width: 2rem !important;
  height: 2rem !important;
  border-radius: 50% !important;
  background: transparent !important;
  border: none !important;
  color: var(--color-text-muted) !important;
  transition: all 0.2s !important;
}

:deep(.p-dialog-close-button:hover) {
  background: rgba(255, 255, 255, 0.05) !important;
  color: var(--color-text) !important;
}

/* Custom scrollbar for chat dialog */
.scrollable-chat::-webkit-scrollbar {
  width: 5px;
}
.scrollable-chat::-webkit-scrollbar-track {
  background: transparent;
}
.scrollable-chat::-webkit-scrollbar-thumb {
  background: #2c303f;
  border-radius: 3px;
}
.scrollable-chat::-webkit-scrollbar-thumb:hover {
  background: #3f455c;
}
</style>
