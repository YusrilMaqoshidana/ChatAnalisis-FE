<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  description?: string
  skipped?: boolean
}>()
</script>

<template>
  <div class="bg-surface/50 border border-border/80 hover:border-border rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between space-y-2 shadow-sm">
    <div class="space-y-1">
      <span class="text-xs font-semibold text-muted uppercase tracking-wider">{{ label }}</span>
      <div v-if="skipped || (typeof value === 'number' && value === 0 && label !== 'Topic Diversity')" class="flex items-center gap-2">
        <span class="text-2xl font-bold text-muted/50">—</span>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border text-muted/80 font-mono">Dilewati</span>
      </div>
      <div v-else class="text-3xl font-extrabold text-accent">
        {{ value }}
      </div>
    </div>
    <p v-if="description" class="text-xs text-muted/80 leading-relaxed font-light">
      {{ description }}
    </p>
  </div>
</template>
