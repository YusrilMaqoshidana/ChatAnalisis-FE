<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  sender: string
  content: string
  timestamp: string
  date?: string
}>()

defineEmits<{
  (e: 'click'): void
}>()

const formattedDate = computed(() => {
  if (!props.date) return ''
  const trimmed = props.date.trim()
  const datePart = trimmed.split('T')[0] ?? trimmed.split(' ')[0] ?? ''

  if (/^\d{4}-\d{2}-\d{2}/.test(datePart)) {
    const parts = datePart.split('-')
    const year = parts[0] ?? ''
    const month = parts[1] ?? ''
    const day = parts[2] ?? ''
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const mIdx = parseInt(month, 10) - 1
    if (mIdx >= 0 && mIdx < 12 && day && year) {
      return `${parseInt(day, 10)} ${months[mIdx]} ${year}`
    }
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(trimmed)) {
    const parts = trimmed.split('/')
    const day = parts[0] ?? ''
    const month = parts[1] ?? ''
    let year = parts[2] ?? ''
    if (year.length === 2) year = '20' + year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const mIdx = parseInt(month, 10) - 1
    if (mIdx >= 0 && mIdx < 12 && day && year) {
      return `${parseInt(day, 10)} ${months[mIdx]} ${year}`
    }
  }

  return trimmed
})
</script>

<template>
  <div 
    @click="$emit('click')"
    class="group cursor-pointer bg-surface/20 border border-border/50 hover:border-accent/40 hover:bg-surface/40 p-4 rounded-xl flex items-start gap-4 transition-all duration-200"
  >
    <!-- Left side Avatar Initial (for quick scan) -->
    <div class="w-8 h-8 rounded-full bg-border/40 border border-border/80 flex items-center justify-center text-[10px] font-bold text-muted uppercase group-hover:text-accent group-hover:border-accent/20 flex-shrink-0 transition-colors">
      {{ sender.substring(0, 2) }}
    </div>

    <!-- Message Body -->
    <div class="flex-grow min-w-0 space-y-1">
      <div class="flex justify-between items-start gap-2">
        <span class="text-xs font-bold text-ink/90 group-hover:text-accent transition-colors pt-0.5">
          {{ sender }}
        </span>
        <div class="text-[10px] text-muted font-mono whitespace-nowrap text-right flex flex-col items-end leading-tight">
          <span v-if="formattedDate" class="text-[9.5px] text-muted/80">{{ formattedDate }}</span>
          <span class="text-accent/90 font-semibold">{{ timestamp }}</span>
        </div>
      </div>
      <p class="text-sm text-muted group-hover:text-ink transition-colors line-clamp-2 leading-relaxed">
        {{ content }}
      </p>
    </div>

    <!-- Click Indicator -->
    <div class="self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-accent flex-shrink-0">
      <i class="pi pi-comments text-xs"></i>
    </div>
  </div>
</template>
