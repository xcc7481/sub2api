<template>
  <div class="card p-5">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 class="text-base font-semibold tracking-tight text-ui-ink">
        {{ title || t('usage.endpointDistribution') }}
      </h3>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <div v-if="showSourceToggle" class="segmented-group">
          <button
            type="button"
            class="segmented-btn"
            :class="{ 'segmented-btn-active': source === 'inbound' }"
            @click="emit('update:source', 'inbound')"
          >
            {{ t('usage.inbound') }}
          </button>
          <button
            type="button"
            class="segmented-btn"
            :class="{ 'segmented-btn-active': source === 'upstream' }"
            @click="emit('update:source', 'upstream')"
          >
            {{ t('usage.upstream') }}
          </button>
          <button
            type="button"
            class="segmented-btn"
            :class="{ 'segmented-btn-active': source === 'path' }"
            @click="emit('update:source', 'path')"
          >
            {{ t('usage.path') }}
          </button>
        </div>

        <div v-if="showMetricToggle" class="segmented-group">
          <button
            type="button"
            class="segmented-btn"
            :class="{ 'segmented-btn-active': metric === 'tokens' }"
            @click="emit('update:metric', 'tokens')"
          >
            {{ t('admin.dashboard.metricTokens') }}
          </button>
          <button
            type="button"
            class="segmented-btn"
            :class="{ 'segmented-btn-active': metric === 'actual_cost' }"
            @click="emit('update:metric', 'actual_cost')"
          >
            {{ t('admin.dashboard.metricActualCost') }}
          </button>
        </div>
      </div>
    </div>
    <DashboardPanelState v-if="loading" status="loading" />
    <div v-else-if="displayEndpointStats.length > 0 && chartData" class="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div class="h-48 w-48 shrink-0">
        <Doughnut :data="chartData" :options="doughnutOptions" />
      </div>
      <div class="max-h-48 w-full min-w-0 flex-1 overflow-auto">
        <table class="w-full text-xs tabular-nums">
          <thead>
            <tr class="text-ui-subdued">
              <th class="pb-2 text-left font-semibold">{{ t('usage.endpoint') }}</th>
              <th class="pb-2 text-right font-semibold">{{ t('admin.dashboard.requests') }}</th>
              <th class="pb-2 text-right font-semibold">{{ t('admin.dashboard.tokens') }}</th>
              <th class="pb-2 text-right font-semibold">{{ t('admin.dashboard.actual') }}</th>
              <th v-if="showAccountCost" class="pb-2 text-right font-semibold">{{ t('admin.dashboard.accountCost') }}</th>
              <th class="pb-2 text-right font-semibold">{{ t('admin.dashboard.standard') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="item in displayEndpointStats" :key="item.endpoint">
              <tr
                class="border-t border-ui-line/80 transition-colors"
                :class="enableBreakdown ? 'cursor-pointer hover:bg-ui-canvas/80' : ''"
                @click="enableBreakdown && toggleBreakdown(item.endpoint)"
              >
                <td class="max-w-[180px] truncate py-1.5 font-mono font-medium" :class="enableBreakdown ? 'text-ui-action hover:text-ui-action-hover' : 'text-ui-ink'" :title="item.endpoint">
                  <span class="inline-flex items-center gap-1">
                    <svg v-if="enableBreakdown && expandedKey === item.endpoint" class="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    <svg v-else-if="enableBreakdown" class="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    {{ item.endpoint }}
                  </span>
                </td>
                <td class="py-1.5 text-right text-ui-subdued">
                  {{ formatNumber(item.requests) }}
                </td>
                <td class="py-1.5 text-right text-ui-subdued">
                  {{ formatTokens(item.total_tokens) }}
                </td>
                <td class="py-1.5 text-right font-medium text-ui-action">
                  ${{ formatCost(item.actual_cost) }}
                </td>
                <td v-if="showAccountCost" class="py-1.5 text-right text-amber-700 dark:text-amber-400">
                  ${{ formatCost(item.account_cost ?? 0) }}
                </td>
                <td class="py-1.5 text-right text-ui-subdued">
                  ${{ formatCost(item.cost) }}
                </td>
              </tr>
              <tr v-if="expandedKey === item.endpoint">
                <td :colspan="showAccountCost ? 6 : 5" class="p-0">
                  <UserBreakdownSubTable
                    :items="breakdownItems"
                    :loading="breakdownLoading"
                    :show-account-cost="showAccountCost"
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
    <DashboardPanelState v-else status="empty" :message="t('admin.dashboard.noDataAvailable')" />
  </div>
</template>

<script setup lang="ts">
import { useMutationObserver, usePreferredReducedMotion } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import DashboardPanelState from '@/components/common/DashboardPanelState.vue'
import UserBreakdownSubTable from './UserBreakdownSubTable.vue'
import { getEditorialChartPalette } from '@/utils/chartTheme'
import type { EndpointStat, UserBreakdownItem } from '@/types'
import { getUserBreakdown } from '@/api/admin/dashboard'

ChartJS.register(ArcElement, Tooltip, Legend)

const { t } = useI18n()

type DistributionMetric = 'tokens' | 'actual_cost'
type EndpointSource = 'inbound' | 'upstream' | 'path'

const props = withDefaults(
  defineProps<{
    endpointStats: EndpointStat[]
    upstreamEndpointStats?: EndpointStat[]
    endpointPathStats?: EndpointStat[]
    loading?: boolean
    title?: string
    metric?: DistributionMetric
    source?: EndpointSource
    showMetricToggle?: boolean
    showSourceToggle?: boolean
    enableBreakdown?: boolean
    showAccountCost?: boolean
    startDate?: string
    endDate?: string
    filters?: Record<string, any>
  }>(),
  {
    upstreamEndpointStats: () => [],
    endpointPathStats: () => [],
    loading: false,
    title: '',
    metric: 'tokens',
    source: 'inbound',
    showMetricToggle: false,
    showSourceToggle: false,
    enableBreakdown: true,
    showAccountCost: true
  }
)

const emit = defineEmits<{
  'update:metric': [value: DistributionMetric]
  'update:source': [value: EndpointSource]
}>()

const expandedKey = ref<string | null>(null)
const breakdownItems = ref<UserBreakdownItem[]>([])
const breakdownLoading = ref(false)

const toggleBreakdown = async (endpoint: string) => {
  if (expandedKey.value === endpoint) {
    expandedKey.value = null
    return
  }
  expandedKey.value = endpoint
  breakdownLoading.value = true
  breakdownItems.value = []
  try {
    const res = await getUserBreakdown({
      ...props.filters,
      start_date: props.startDate,
      end_date: props.endDate,
      endpoint,
      endpoint_type: props.source,
    })
    breakdownItems.value = res.users || []
  } catch {
    breakdownItems.value = []
  } finally {
    breakdownLoading.value = false
  }
}

const themeRoot = document.documentElement
const isDarkMode = ref(themeRoot.classList.contains('dark'))
useMutationObserver(themeRoot, () => {
  isDarkMode.value = themeRoot.classList.contains('dark')
}, { attributes: true, attributeFilter: ['class'] })

const palette = computed(() => getEditorialChartPalette(isDarkMode.value))

const displayEndpointStats = computed(() => {
  const sourceStats = props.source === 'upstream'
    ? props.upstreamEndpointStats
    : props.source === 'path'
      ? props.endpointPathStats
      : props.endpointStats
  if (!sourceStats?.length) return []

  const metricKey = props.metric === 'actual_cost' ? 'actual_cost' : 'total_tokens'
  return [...sourceStats].sort((a, b) => b[metricKey] - a[metricKey])
})

const chartData = computed(() => {
  if (!displayEndpointStats.value?.length) return null
  const colors = palette.value.series

  return {
    labels: displayEndpointStats.value.map((item) => item.endpoint),
    datasets: [
      {
        data: displayEndpointStats.value.map((item) =>
          props.metric === 'actual_cost' ? item.actual_cost : item.total_tokens
        ),
        backgroundColor: displayEndpointStats.value.map((_, i) => colors[i % colors.length]),
        borderWidth: 0
      }
    ]
  }
})

const reducedMotion = usePreferredReducedMotion()
const doughnutOptions = computed(() => ({
  responsive: true,
  cutout: '64%',
  animation: reducedMotion.value === 'reduce' ? false as const : undefined,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
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
          const value = context.raw as number
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
          const formattedValue = props.metric === 'actual_cost'
            ? `$${formatCost(value)}`
            : formatTokens(value)
          return `${context.label}: ${formattedValue} (${percentage}%)`
        }
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

const formatNumber = (value: number): string => {
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
