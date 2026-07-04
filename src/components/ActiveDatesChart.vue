<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface DateData {
  date: string
  count: number
}

const props = defineProps<{
  data: DateData[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const initChart = () => {
  if (!canvasRef.value) return

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  // Create gradient for the area under the line
  const gradient = ctx.createLinearGradient(0, 0, 0, 300)
  gradient.addColorStop(0, 'rgba(224, 167, 94, 0.3)') // --color-accent with opacity
  gradient.addColorStop(1, 'rgba(224, 167, 94, 0)')

  const labels = props.data.map(item => item.date)
  const values = props.data.map(item => item.count)

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Jumlah Pesan',
          data: values,
          borderColor: '#E0A75E', // --color-accent
          backgroundColor: gradient,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#E0A75E',
          pointBorderColor: '#12141C', // --color-bg
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
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
          backgroundColor: '#1B1E2A', // --color-surface
          titleColor: '#E8E6E1', // --color-text
          bodyColor: '#E8E6E1',
          borderColor: '#2C303F', // --color-border
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
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
            color: '#8B8F9E', // --color-text-muted
            font: {
              size: 11,
              family: "'Inter', sans-serif"
            }
          }
        },
        y: {
          grid: {
            color: '#2C303F', // --color-border
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

watch(
  () => props.data,
  (newData) => {
    if (chartInstance && chartInstance.data.datasets?.[0]) {
      chartInstance.data.labels = newData.map(item => item.date)
      chartInstance.data.datasets[0].data = newData.map(item => item.count)
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
        <i class="pi pi-calendar text-accent"></i>
        Tren Aktivitas Harian
      </h3>
      <span class="text-xs text-muted">Jumlah pesan per tanggal</span>
    </div>
    <div class="h-64 relative w-full">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>
