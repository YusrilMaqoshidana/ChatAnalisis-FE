<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Slider from 'primevue/slider'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps<{
  enabled: boolean
  modelValue: [number, number]
  startDate: string
  endDate: string
  chartData?: { labels: string[]; values: number[] }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: [number, number]): void
}>()

// Two-way binding for slider value
const sliderValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const dateRangeLabel = computed(() => {
  if (props.startDate && props.endDate) {
    return `${props.startDate} - ${props.endDate}`
  }
  return 'Juni - Juli 2026'
})

const initChart = () => {
  if (!canvasRef.value) return
  
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  // Create gradient for preview sparkline
  const gradient = ctx.createLinearGradient(0, 0, 0, 80)
  gradient.addColorStop(0, 'rgba(94, 201, 192, 0.4)') // --color-accent-alt with opacity
  gradient.addColorStop(1, 'rgba(94, 201, 192, 0)')

  const labels = props.chartData?.labels || Array.from({ length: 15 }, (_, i) => `Day ${i + 1}`)
  const values = props.chartData?.values || [12, 19, 32, 25, 45, 38, 52, 60, 48, 56, 72, 64, 50, 42, 45]

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: '#5EC9C0', // --color-accent-alt
        backgroundColor: gradient,
        borderWidth: 1.5,
        fill: true,
        pointRadius: 0,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  })
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

// Re-initialize preview chart on state changes or chartData changes
watch(
  () => props.enabled,
  (newVal) => {
    if (newVal) {
      setTimeout(() => {
        initChart()
      }, 100)
    } else {
      destroyChart()
    }
  }
)

watch(
  () => props.chartData,
  () => {
    if (props.enabled) {
      destroyChart()
      initChart()
    }
  },
  { deep: true }
)

onMounted(() => {
  if (props.enabled) {
    initChart()
  }
})

onBeforeUnmount(() => {
  destroyChart()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Title -->
    <div class="flex items-center justify-between">
      <span :class="[enabled ? 'text-ink font-bold' : 'text-muted/60', 'text-sm transition-colors flex items-center gap-2']">
        <i :class="[enabled ? 'pi pi-calendar text-accent' : 'pi-circle text-muted/40', 'text-sm']"></i>
        Tahap 2: Filter Rentang Waktu
      </span>
    </div>

    <!-- Active container when enabled -->
    <div :class="[!enabled ? 'opacity-40 pointer-events-none' : '', 'space-y-4 transition-all duration-300']">
      <!-- Sparkline density graph -->
      <div class="bg-bg/60 border border-border rounded-xl p-3 space-y-2">
        <span class="text-[10px] text-muted flex items-center justify-between">
          <span>Distribusi Kepadatan Pesan Percakapan</span>
          <span class="font-mono">{{ dateRangeLabel }}</span>
        </span>
        <div class="h-[60px] relative w-full">
          <canvas ref="canvasRef"></canvas>
          <div 
            v-if="!enabled" 
            class="absolute inset-0 flex items-center justify-center bg-bg/80 rounded-lg text-[10px] text-muted font-medium"
          >
            Silakan unggah file chat untuk melihat grafik aktivitas
          </div>
        </div>
      </div>

      <!-- PrimeVue Slider Range -->
      <div class="px-2 py-4">
        <Slider 
          v-model="sliderValue" 
          :range="true"
          class="w-full"
        />
      </div>

      <!-- Start & End Date Indicator Boxes -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-bg/40 border border-border/80 rounded-xl p-3 space-y-1">
          <span class="text-[10px] text-muted uppercase font-bold tracking-wider">Tanggal Mulai</span>
          <div class="text-xs font-bold text-ink truncate">{{ startDate }}</div>
        </div>
        <div class="bg-bg/40 border border-border/80 rounded-xl p-3 space-y-1">
          <span class="text-[10px] text-muted uppercase font-bold tracking-wider">Tanggal Akhir</span>
          <div class="text-xs font-bold text-ink truncate">{{ endDate }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Overwrite PrimeVue Slider default styling elements */
:deep(.p-slider) {
  background-color: var(--color-border) !important;
  height: 4px !important;
}

:deep(.p-slider-range) {
  background-color: var(--color-accent) !important; /* Ember Accent */
}

:deep(.p-slider-handle) {
  background-color: var(--color-surface) !important;
  border: 2px solid var(--color-accent) !important;
  width: 16px !important;
  height: 16px !important;
  margin-top: -6px !important;
  cursor: grab !important;
  transition: transform 0.1s, box-shadow 0.1s !important;
}

:deep(.p-slider-handle:hover) {
  transform: scale(1.1) !important;
  box-shadow: 0 0 0 4px rgba(224, 167, 94, 0.2) !important;
}

:deep(.p-slider-handle:active) {
  cursor: grabbing !important;
  transform: scale(1.1) !important;
}
</style>
