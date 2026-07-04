<script setup lang="ts">
const props = defineProps<{
  topicId: string | number
  label: string
  messageCount: number
  keywords?: string[]
}>()

const emit = defineEmits<{
  (e: 'click', topicId: string | number): void
}>()

const handleClick = () => {
  emit('click', props.topicId)
}
</script>

<template>
  <div 
    @click="handleClick"
    class="group cursor-pointer bg-surface/30 border border-border/80 hover:border-accent/50 hover:bg-surface/50 rounded-2xl p-6 transition-all duration-300 space-y-4 shadow-sm hover:shadow-lg hover:shadow-accent/5"
  >
    <!-- Topic Title & Message Count -->
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <span class="text-xs font-semibold text-muted tracking-wider uppercase">KLASTER #{{ topicId }}</span>
        <h3 class="text-lg font-bold text-ink group-hover:text-accent transition-colors duration-200">{{ label }}</h3>
      </div>
      <div class="text-right">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
          <i class="pi pi-envelope text-[10px]"></i>
          {{ messageCount }} pesan
        </span>
      </div>
    </div>

    <!-- Keywords & Badges -->
    <div v-if="keywords && keywords.length" class="flex flex-wrap gap-1.5 pt-2">
      <span 
        v-for="kw in keywords" 
        :key="kw"
        class="px-2 py-0.5 rounded-lg bg-surface border border-border text-[11px] text-muted font-mono"
      >
        #{{ kw }}
      </span>
    </div>
  </div>
</template>
