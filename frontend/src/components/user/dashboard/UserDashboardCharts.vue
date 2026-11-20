<template>
  <div class="space-y-4">
    <!-- Date Range Filter -->
    <div class="dashboard-toolbar">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('dashboard.timeRange') }}:</span>
        <DateRangePicker :start-date="startDate" :end-date="endDate" @update:startDate="$emit('update:startDate', $event)" @update:endDate="$emit('update:endDate', $event)" @change="$emit('dateRangeChange', $event)" />
      </div>
      <button type="button" @click="$emit('refresh')" :disabled="loading" class="btn btn-secondary">
        {{ t('common.refresh') }}
      </button>
      <div class="flex items-center gap-2 md:ml-auto">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('dashboard.granularity') }}:</span>
        <div class="w-28">
          <Select
            :model-value="granularity"
            :aria-label="t('dashboard.granularity')"
            :options="[{ value: 'day', label: t('dashboard.day') }, { value: 'hour', label: t('dashboard.hour') }]"
            @update:model-value="$emit('update:granularity', $event)"
            @change="$emit('granularityChange')"
          />
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="dashboard-charts">
      <TokenUsageTrend
        :trend-data="trend"
        :loading="loading"
        :failed="failed"
        :empty-message="t('dashboard.noUsageForPeriod')"
        @retry="$emit('retryCharts')"
      />
      <!-- Model Distribution Chart -->
      <div class="card min-w-0 p-4">
        <h3 class="mb-4 text-base font-semibold tracking-tight">{{ t('dashboard.modelDistribution') }}</h3>
        <DashboardPanelState v-if="loading" status="loading" />
        <DashboardPanelState v-else-if="failed" status="error" retry @retry="$emit('retryCharts')" />
        <div v-else-if="modelData" class="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <div class="h-48 w-48 shrink-0">
            <Doughnut :data="modelData" :options="doughnutOptions" />
          </div>
          <div class="max-h-48 w-full min-w-0 flex-1 overflow-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="text-gray-500 dark:text-gray-400">
                  <th class="pb-2 text-left">{{ t('dashboard.model') }}</th>
                  <th class="pb-2 text-right">{{ t('dashboard.requests') }}</th>
                  <th class="pb-2 text-right">{{ t('dashboard.tokens') }}</th>
                  <th class="pb-2 text-right">{{ t('dashboard.actual') }}</th>
                  <th class="pb-2 text-right">{{ t('dashboard.standard') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="model in models" :key="model.model" class="border-t border-gray-100 dark:border-dark-700">
                  <td class="max-w-[100px] truncate py-1.5 font-medium text-gray-900 dark:text-white" :title="model.model">{{ model.model }}</td>
                  <td class="py-1.5 text-right text-gray-600 dark:text-gray-400">{{ formatNumber(model.requests) }}</td>
                  <td class="py-1.5 text-right text-gray-600 dark:text-gray-400">{{ formatTokens(model.total_tokens) }}</td>
                  <td class="py-1.5 text-right text-green-700 dark:text-green-400">${{ formatCost(model.actual_cost) }}</td>
                  <td class="py-1.5 text-right text-gray-500 dark:text-dark-400">${{ formatCost(model.cost) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <DashboardPanelState v-else status="empty" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardPanelState from '@/components/common/DashboardPanelState.vue'
import DateRangePicker from '@/components/common/DateRangePicker.vue'
import Select from '@/components/common/Select.vue'
import { Doughnut } from 'vue-chartjs'
import TokenUsageTrend from '@/components/charts/TokenUsageTrend.vue'
import type { TrendDataPoint, ModelStat } from '@/types'
import { formatCostFixed as formatCost, formatNumberLocaleString as formatNumber, formatTokensK as formatTokens } from '@/utils/format'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{ loading: boolean, failed: boolean, startDate: string, endDate: string, granularity: string, trend: TrendDataPoint[], models: ModelStat[] }>()
defineEmits(['update:startDate', 'update:endDate', 'update:granularity', 'dateRangeChange', 'granularityChange', 'refresh', 'retryCharts'])
const { t } = useI18n()

const modelData = computed(() => !props.models?.length ? null : {
  labels: props.models.map((m: ModelStat) => m.model),
  datasets: [{
    data: props.models.map((m: ModelStat) => m.total_tokens),
    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
  }]
})

const reducedMotion = usePreferredReducedMotion()
const doughnutOptions = computed(() => ({
  responsive: true,
  animation: reducedMotion.value === 'reduce' ? false as const : undefined,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => `${context.label}: ${formatTokens(context.parsed)} tokens`
      }
    }
  }
}))
</script>
