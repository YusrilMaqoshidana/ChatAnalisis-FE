<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface HourData {
  hour: number
  count: number
}

const props = defineProps<{
  data: HourData[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const initChart = () => {
  if (!canvasRef.value) return

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  // Create gradient for the bars
  const gradient = ctx.createLinearGradient(0, 0, 0, 300)
  gradient.addColorStop(0, '#5EC9C0') // --color-accent-alt
  gradient.addColorStop(1, 'rgba(94, 201, 192, 0.2)')

  // Ensure all 24 hours are represented, mapping props.data or using standard 0-23
  const hoursMap = new Map(props.data.map(item => [item.hour, item.count]))
  const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  const values = Array.from({ length: 24 }, (_, i) => hoursMap.get(i) || 0)

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Jumlah Pesan',
          data: values,
          backgroundColor: gradient,
          borderColor: '#5EC9C0',
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: '#5EC9C0',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#1B1E2A',
          titleColor: '#E8E6E1',
          bodyColor: '#E8E6E1',
          borderColor: '#2C303F',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => tooltipItems && tooltipItems[0] ? `Pukul ${tooltipItems[0].label}` : '',
            label: (context) => ` ${context.parsed.y} pesan`
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#8B8F9E',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 12, // Show every 2 hours on mobile to avoid overlapping
            font: {
              size: 10,
              family: "'Inter', sans-serif"
            }
          }
        },
        y: {
          grid: {
            color: '#2C303F',
            lineWidth: 0.8,
          },
          border: {
            dash: [4, 4]
          },
          ticks: {
            color: '#8B8F9E',
            font: {
              size: 11,
              family: "'Inter', sans-serif"
            },
            precision: 0
          }
        }
      }
    }
  })
}

// Watch data prop to update chart
watch(
  () => props.data,
  (newData) => {
    if (chartInstance && chartInstance.data.datasets?.[0]) {
      const hoursMap = new Map(newData.map(item => [item.hour, item.count]))
      const values = Array.from({ length: 24 }, (_, i) => hoursMap.get(i) || 0)
      chartInstance.data.datasets[0].data = values
      chartInstance.update()
    }
  },
  { deep: true }
)

onMounted(() => {
  initChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<template>
  <div class="bg-surface/30 border border-border/80 rounded-2xl p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-bold text-ink flex items-center gap-2">
        <i class="pi pi-clock text-accent-alt"></i>
        Distribusi Waktu Chat
      </h3>
      <span class="text-xs text-muted">Aktivitas berdasarkan jam (24 Jam)</span>
    </div>
    <div class="h-64 relative w-full">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>
