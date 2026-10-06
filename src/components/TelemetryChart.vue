<template>
  <div class="rounded-2xl bg-gray-900/90 border border-gray-800 p-5 shadow-xl backdrop-blur-sm relative">
    <!-- Chart Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            DYNAMIC TELEMETRY STREAM
          </span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-slate-300 border border-gray-700">
            Last {{ history.length }}/20 Points
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-0.5">
          Real-time rolling multi-axis visualization (Smoothed Tension 0.4)
        </p>
      </div>

      <!-- Semantic Legend indicators -->
      <div class="flex items-center gap-4 text-xs font-mono">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-amber-500 shadow-glow-amber"></span>
          <span class="text-amber-400 font-medium">Temperature (°C)</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-cyan-500 shadow-glow-cyan"></span>
          <span class="text-cyan-400 font-medium">Humidity (%)</span>
        </div>
      </div>
    </div>

    <!-- Chart Canvas Container -->
    <div class="relative w-full h-72 sm:h-80">
      <div
        v-if="history.length === 0"
        class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-gray-950/40 rounded-xl border border-dashed border-gray-800"
      >
        <Activity class="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
        <span class="text-sm font-medium">Awaiting telemetry data packets...</span>
        <span class="text-xs text-slate-600 font-mono mt-1">Topic: iot/esp32/dht22/telemetry</span>
      </div>
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Activity } from 'lucide-vue-next'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  history: {
    type: Array,
    default: () => []
  }
})

const canvasRef = ref(null)
let chartInstance = null

function createGradients(ctx) {
  const tempGradient = ctx.createLinearGradient(0, 0, 0, 300)
  tempGradient.addColorStop(0, 'rgba(245, 158, 11, 0.35)')
  tempGradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)')

  const humGradient = ctx.createLinearGradient(0, 0, 0, 300)
  humGradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)')
  humGradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)')

  return { tempGradient, humGradient }
}

function initChart() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  const { tempGradient, humGradient } = createGradients(ctx)

  const labels = props.history.map(item => item.time)
  const tempData = props.history.map(item => item.temperature)
  const humData = props.history.map(item => item.humidity)

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: tempData,
          borderColor: '#F59E0B',
          backgroundColor: tempGradient,
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#F59E0B',
          pointBorderColor: '#111827',
          pointBorderWidth: 1.5,
          pointRadius: 3,
          pointHoverRadius: 5,
          yAxisID: 'yTemp'
        },
        {
          label: 'Humidity (%)',
          data: humData,
          borderColor: '#06B6D4',
          backgroundColor: humGradient,
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#06B6D4',
          pointBorderColor: '#111827',
          pointBorderWidth: 1.5,
          pointRadius: 3,
          pointHoverRadius: 5,
          yAxisID: 'yHum'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 300
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false // Using our custom header legend for better styling
        },
        tooltip: {
          backgroundColor: '#111827',
          borderColor: '#374151',
          borderWidth: 1,
          titleColor: '#F3F4F6',
          bodyColor: '#E5E7EB',
          bodyFont: {
            family: 'JetBrains Mono, monospace'
          },
          titleFont: {
            family: 'JetBrains Mono, monospace',
            weight: 'bold'
          },
          padding: 10,
          boxPadding: 4,
          usePointStyle: true
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(55, 65, 81, 0.3)',
            drawTicks: false
          },
          ticks: {
            color: '#94A3B8',
            font: {
              family: 'JetBrains Mono, monospace',
              size: 10
            },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 7
          }
        },
        yTemp: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Temp (°C)',
            color: '#F59E0B',
            font: {
              size: 11,
              family: 'JetBrains Mono, monospace',
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(55, 65, 81, 0.3)'
          },
          ticks: {
            color: '#F59E0B',
            font: {
              family: 'JetBrains Mono, monospace',
              size: 10
            },
            callback: (val) => `${val}°C`
          },
          suggestedMin: 15,
          suggestedMax: 40
        },
        yHum: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Humidity (%)',
            color: '#06B6D4',
            font: {
              size: 11,
              family: 'JetBrains Mono, monospace',
              weight: 'bold'
            }
          },
          grid: {
            drawOnChartArea: false // prevent overlapping grid lines
          },
          ticks: {
            color: '#06B6D4',
            font: {
              family: 'JetBrains Mono, monospace',
              size: 10
            },
            callback: (val) => `${val}%`
          },
          suggestedMin: 20,
          suggestedMax: 90
        }
      }
    }
  })
}

function updateChart() {
  if (!chartInstance) return
  chartInstance.data.labels = props.history.map(item => item.time)
  chartInstance.data.datasets[0].data = props.history.map(item => item.temperature)
  chartInstance.data.datasets[1].data = props.history.map(item => item.humidity)
  chartInstance.update('none') // Smooth update without jarring re-render
}

watch(
  () => props.history,
  () => {
    if (!chartInstance) {
      initChart()
    } else {
      updateChart()
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
