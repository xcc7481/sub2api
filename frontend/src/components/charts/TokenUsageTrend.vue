<template>
  <div class="card p-5">
    <h3 class="mb-4 text-base font-semibold tracking-tight text-ui-ink">
      {{ t('admin.dashboard.tokenUsageTrend') }}
    </h3>
    <DashboardPanelState v-if="loading" status="loading" />
    <DashboardPanelState v-else-if="failed" status="error" retry @retry="emit('retry')" />
    <div v-else-if="trendData.length > 0 && chartData" class="h-56">
      <Line :data="chartData" :options="lineOptions" />
    </div>
    <DashboardPanelState v-else status="empty" :message="emptyMessage || t('admin.dashboard.noDataAvailable')" />
  </div>
</template>

<script setup lang="ts">
import { useMutationObserver, usePreferredReducedMotion } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'
import DashboardPanelState from '@/components/common/DashboardPanelState.vue'
import { getEditorialChartFontFamily, getEditorialChartPalette } from '@/utils/chartTheme'
import type { TrendDataPoint } from '@/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const { t } = useI18n()

const props = defineProps<{
  trendData: TrendDataPoint[]
  loading?: boolean
  failed?: boolean
  emptyMessage?: string
}>()
const emit = defineEmits<{ retry: [] }>()

const themeRoot = document.documentElement
const isDarkMode = ref(themeRoot.classList.contains('dark'))
useMutationObserver(themeRoot, () => {
  isDarkMode.value = themeRoot.classList.contains('dark')
}, { attributes: true, attributeFilter: ['class'] })

const palette = computed(() => getEditorialChartPalette(isDarkMode.value))
const chartFont = getEditorialChartFontFamily()

const chartData = computed(() => {
  if (!props.trendData?.length) return null
  const s = palette.value.semantic

  return {
    labels: props.trendData.map((d) => d.date),
    datasets: [
      {
        label: 'Input',
        data: props.trendData.map((d) => d.input_tokens),
        borderColor: s.input,
        backgroundColor: `${s.input}1c`,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.32
      },
      {
        label: 'Output',
        data: props.trendData.map((d) => d.output_tokens),
        borderColor: s.output,
        backgroundColor: `${s.output}1c`,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.32
      },
      {
        label: 'Cache Creation',
        data: props.trendData.map((d) => d.cache_creation_tokens),
        borderColor: s.cacheCreation,
        backgroundColor: `${s.cacheCreation}1c`,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.32
      },
      {
        label: 'Cache Read',
        data: props.trendData.map((d) => d.cache_read_tokens),
        borderColor: s.cacheRead,
        backgroundColor: `${s.cacheRead}1c`,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.32
      },
      {
        label: 'Cache Hit Rate',
        data: props.trendData.map((d) => {
          const totalPromptTokens = d.input_tokens + d.cache_read_tokens + d.cache_creation_tokens
          return totalPromptTokens > 0 ? (d.cache_read_tokens / totalPromptTokens) * 100 : 0
        }),
        borderColor: s.cacheHitRate,
        backgroundColor: `${s.cacheHitRate}1c`,
        borderWidth: 1.75,
        borderDash: [5, 5],
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: false,
        tension: 0.32,
        yAxisID: 'yPercent'
      }
    ]
  }
})

const reducedMotion = usePreferredReducedMotion()
const lineOptions = computed(() => ({
  responsive: true,
  animation: reducedMotion.value === 'reduce' ? false as const : undefined,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: palette.value.text,
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 6,
        boxHeight: 6,
        padding: 14,
        font: {
          family: chartFont,
          size: 11
        }
      }
    },
    tooltip: {
      backgroundColor: palette.value.tooltipBg,
      titleColor: palette.value.tooltipTitle,
      bodyColor: palette.value.tooltipBody,
      borderColor: palette.value.tooltipBorder,
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (context: any) => {
          if (context.dataset.yAxisID === 'yPercent') {
            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`
          }
          return `${context.dataset.label}: ${formatTokens(context.raw)}`
        },
        footer: (tooltipItems: any) => {
          const dataIndex = tooltipItems[0]?.dataIndex
          if (dataIndex !== undefined && props.trendData[dataIndex]) {
            const data = props.trendData[dataIndex]
            return `Actual: $${formatCost(data.actual_cost)} | Standard: $${formatCost(data.cost)}`
          }
          return ''
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: palette.value.grid
      },
      ticks: {
        color: palette.value.mutedText,
        font: {
          family: chartFont,
          size: 10
        }
      }
    },
    y: {
      grid: {
        color: palette.value.grid
      },
      ticks: {
        color: palette.value.mutedText,
        font: {
          family: chartFont,
          size: 10
        },
        callback: (value: string | number) => formatTokens(Number(value))
      }
    },
    yPercent: {
      position: 'right' as const,
      min: 0,
      max: 100,
      grid: {
        drawOnChartArea: false
      },
      ticks: {
        color: palette.value.semantic.cacheHitRate,
        font: {
          family: chartFont,
          size: 10
        },
        callback: (value: string | number) => `${value}%`
      }
    }
  }
}))

const formatTokens = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  }
  return value.toLocaleString()
}

const formatCost = (value: number): string => {
  if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'K'
  } else if (value >= 1) {
    return value.toFixed(2)
  } else if (value >= 0.01) {
    return value.toFixed(3)
  }
  return value.toFixed(4)
}
</script>
