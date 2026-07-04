<script setup lang="ts">
interface AnalysisStep {
  id: number
  label: string
  status: 'pending' | 'running' | 'completed'
  timeElapsed?: string
}

defineProps<{
  visible: boolean
  steps: AnalysisStep[]
}>()
</script>

<template>
  <div class="space-y-3">
    <!-- Header Title -->
    <span :class="[visible ? 'text-ink font-bold' : 'text-muted/60', 'text-sm transition-colors flex items-center gap-2']">
      <i :class="[visible ? 'pi pi-spin pi-cog text-accent' : 'pi-circle text-muted/40', 'text-sm']"></i>
      Tahap 3: Generate Topik (Pemodelan AI)
    </span>

    <!-- Interactive Terminal Screen -->
    <div 
      v-if="visible"
      class="bg-[#0b141a] border border-border rounded-xl p-4 font-mono text-[11px] leading-relaxed space-y-2 text-[#E8E6E1]/90 shadow-inner transition-all duration-300"
    >
      <div class="text-muted border-b border-border/60 pb-1.5 flex justify-between">
        <span>topic-modeling-terminal:~/analysis</span>
        <span class="animate-pulse">● online</span>
      </div>
      
      <!-- Terminal Output Rows -->
      <div class="space-y-1.5 pt-1">
        <div 
          v-for="step in steps" 
          :key="step.id"
          class="flex items-start gap-2"
        >
          <!-- Status Symbols -->
          <span v-if="step.status === 'completed'" class="text-accent-alt font-extrabold flex-shrink-0">✔</span>
          <span v-else-if="step.status === 'running'" class="text-accent font-extrabold animate-pulse flex-shrink-0">❯</span>
          <span v-else class="text-muted/40 font-bold flex-shrink-0">○</span>
          
          <!-- Label and Status Cursor -->
          <div class="flex-grow min-w-0">
            <span :class="[
              step.status === 'completed' ? 'text-ink' : '',
              step.status === 'running' ? 'text-accent font-bold' : '',
              step.status === 'pending' ? 'text-muted/65' : ''
            ]">
              {{ step.label }}
            </span>
            <!-- Blink cursor during active execution -->
            <span v-if="step.status === 'running'" class="w-1.5 h-3.5 bg-accent inline-block animate-ping ml-1 self-center"></span>
          </div>
          
          <!-- Timestamp Duration -->
          <span v-if="step.status === 'completed'" class="text-[10px] text-muted/80 pl-2 flex-shrink-0 font-mono">
            ({{ step.timeElapsed }})
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
