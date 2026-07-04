<script setup lang="ts">
defineProps<{
  file: File | null
}>()
</script>

<template>
  <div class="space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <span class="text-sm font-bold text-ink flex items-center gap-2">
        <i :class="[file ? 'pi pi-check-circle text-accent-alt' : 'pi pi-circle text-muted/60', 'text-sm']"></i>
        Tahap 1: Unggah Berkas
      </span>
      <span v-if="file" class="text-xs text-accent-alt font-semibold">Ready</span>
      <span v-else class="text-xs text-muted">Belum ada berkas</span>
    </div>
    
    <!-- File Details Card -->
    <div 
      v-if="file" 
      class="bg-surface/50 border border-border/80 rounded-xl p-3 flex items-center justify-between text-xs transition-all duration-300"
    >
      <div class="flex items-center gap-2 min-w-0">
        <i class="pi pi-file text-accent text-sm flex-shrink-0"></i>
        <span class="text-ink font-semibold truncate block">{{ file.name }}</span>
      </div>
      <span class="text-muted flex-shrink-0 font-mono pl-2">
        {{ (file.size / 1024).toFixed(1) }} KB
      </span>
    </div>
  </div>
</template>
