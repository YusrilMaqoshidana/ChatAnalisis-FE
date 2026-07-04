<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  description?: string
}>()
</script>

<template>
  <div class="bg-surface/50 border border-border/80 hover:border-border rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between space-y-2 shadow-sm">
    <div class="space-y-1">
      <span class="text-xs font-semibold text-muted uppercase tracking-wider">{{ label }}</span>
      <div class="text-3xl font-extrabold text-accent">
        {{ value }}
      </div>
    </div>
    <p v-if="description" class="text-xs text-muted/80 leading-relaxed font-light">
      {{ description }}
    </p>
  </div>
</template>
