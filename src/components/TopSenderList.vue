<script setup lang="ts">
import { computed } from 'vue'

interface Sender {
  name: string
  messageCount: number
  avatarInitial?: string
}

const props = defineProps<{
  senders: Sender[]
}>()

// Calculate the maximum message count to compute relative percentages
const maxMessages = computed(() => {
  if (!props.senders || props.senders.length === 0) return 1
  return Math.max(...props.senders.map(s => s.messageCount))
})
</script>

<template>
  <div class="bg-surface/30 border border-border/80 rounded-2xl p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-bold text-ink flex items-center gap-2">
        <i class="pi pi-trophy text-accent"></i>
        Pengirim Teraktif
      </h3>
      <span class="text-xs text-muted">Berdasarkan volume pesan</span>
    </div>

    <div class="space-y-4">
      <div 
        v-for="(sender, index) in senders" 
        :key="sender.name"
        class="flex items-center gap-4"
      >
        <!-- Rank -->
        <div class="w-6 text-center flex-shrink-0">
          <span 
            v-if="index === 0" 
            class="text-xs font-bold text-[#E0A75E] bg-[#E0A75E]/10 border border-[#E0A75E]/30 w-6 h-6 rounded-full flex items-center justify-center"
          >
            1
          </span>
          <span 
            v-else-if="index === 1" 
            class="text-xs font-bold text-[#5EC9C0] bg-[#5EC9C0]/10 border border-[#5EC9C0]/30 w-6 h-6 rounded-full flex items-center justify-center"
          >
            2
          </span>
          <span 
            v-else
            class="text-xs font-semibold text-muted bg-surface/50 border border-border w-6 h-6 rounded-full flex items-center justify-center"
          >
            {{ index + 1 }}
          </span>
        </div>

        <!-- Avatar -->
        <div class="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-bold text-ink uppercase flex-shrink-0">
          {{ sender.avatarInitial || sender.name.substring(0, 2) }}
        </div>

        <!-- Details & Relative Progress -->
        <div class="flex-grow min-w-0 space-y-1">
          <div class="flex justify-between items-baseline gap-2">
            <span class="text-sm font-semibold text-ink truncate block">
              {{ sender.name }}
            </span>
            <span class="text-xs font-bold text-accent whitespace-nowrap">
              {{ sender.messageCount }} <span class="text-[10px] text-muted font-normal">pesan</span>
            </span>
          </div>

          <!-- Relative Progress Bar -->
          <div class="w-full h-1.5 bg-bg border border-border/30 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-accent/70 to-accent rounded-full transition-all duration-500"
              :style="{ width: `${(sender.messageCount / maxMessages) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
