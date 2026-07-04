<script setup lang="ts">
defineProps<{
  sender: string
  content: string
  timestamp: string
}>()

defineEmits<{
  (e: 'click'): void
}>()
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
      <div class="flex justify-between items-baseline gap-2">
        <span class="text-xs font-bold text-ink/90 group-hover:text-accent transition-colors">
          {{ sender }}
        </span>
        <span class="text-[10px] text-muted font-mono whitespace-nowrap">
          {{ timestamp }}
        </span>
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
