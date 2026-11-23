<template>
  <div class="space-y-4">
    <!-- Date Range Filter -->
    <div class="dashboard-toolbar">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-medium text-ui-subdued">{{ t('dashboard.timeRange') }}:</span>
        <DateRangePicker :start-date="startDate" :end-date="endDate" @update:startDate="$emit('update:startDate', $event)" @update:endDate="$emit('update:endDate', $event)" @change="$emit('dateRangeChange', $event)" />
      </div>
      <button type="button" @click="$emit('refresh')" :disabled="loading" class="btn btn-secondary">
        {{ t('common.refresh') }}
      </button>
      <div class="flex items-center gap-2 md:ml-auto">
        <span class="text-xs font-medium text-ui-subdued">{{ t('dashboard.granularity') }}:</span>
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
      <div class="card min-w-0 p-5">
        <h3 class="mb-4 text-base font-semibold tracking-tight text-ui-ink">{{ t('dashboard.modelDistribution') }}</h3>
        <DashboardPanelState v-if="loading" status="loading" />
        <DashboardPanelState v-else-if="failed" status="error" retry @retry="$emit('retryCharts')" />
        <div v-else-if="modelData" class="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <div class="h-48 w-48 shrink-0">
            <Doughnut :data="modelData" :options="doughnutOptions" />
          </div>
          <div class="max-h-48 w-full min-w-0 flex-1 overflow-auto">
            <table class="w-full text-xs tabular-nums">
              <thead>
                <tr class="text-ui-subdued">
                  <th class="pb-2 text-left font-semibold">{{ t('dashboard.model') }}</th>
                  <th class="pb-2 text-right font-semibold">{{ t('dashboard.requests') }}</th>
                  <th class="pb-2 text-right font-semibold">{{ t('dashboard.tokens') }}</th>
                  <th class="pb-2 text-right font-semibold">{{ t('dashboard.actual') }}</th>
                  <th class="pb-2 text-right font-semibold">{{ t('dashboard.standard') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="model in models" :key="model.model" class="border-t border-ui-line/80">
                  <td class="max-w-[110px] truncate py-1.5 font-medium text-ui-ink" :title="model.model">{{ model.model }}</td>
                  <td class="py-1.5 text-right text-ui-subdued">{{ formatNumber(model.requests) }}</td>
                  <td class="py-1.5 text-right text-ui-subdued">{{ formatTokens(model.total_tokens) }}</td>
                  <td class="py-1.5 text-right font-medium text-ui-action">${{ formatCost(model.actual_cost) }}</td>
                  <td class="py-1.5 text-right text-ui-subdued">${{ formatCost(model.cost) }}</td>
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
import { useMutationObserver, usePreferredReducedMotion } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardPanelState from '@/components/common/DashboardPanelState.vue'
import DateRangePicker from '@/components/common/DateRangePicker.vue'
import Select from '@/components/common/Select.vue'
import { Doughnut } from 'vue-chartjs'
import TokenUsageTrend from '@/components/charts/TokenUsageTrend.vue'
import { getEditorialChartPalette } from '@/utils/chartTheme'
import type { TrendDataPoint, ModelStat } from '@/types'
import { formatCostFixed as formatCost, formatNumberLocaleString as formatNumber, formatTokensK as formatTokens } from '@/utils/format'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{ loading: boolean, failed: boolean, startDate: string, endDate: string, granularity: string, trend: TrendDataPoint[], models: ModelStat[] }>()
defineEmits(['update:startDate', 'update:endDate', 'update:granularity', 'dateRangeChange', 'granularityChange', 'refresh', 'retryCharts'])
const { t } = useI18n()

const themeRoot = document.documentElement
const isDarkMode = ref(themeRoot.classList.contains('dark'))
useMutationObserver(themeRoot, () => {
  isDarkMode.value = themeRoot.classList.contains('dark')
}, { attributes: true, attributeFilter: ['class'] })

const palette = computed(() => getEditorialChartPalette(isDarkMode.value))

const modelData = computed(() => !props.models?.length ? null : {
  labels: props.models.map((m: ModelStat) => m.model),
  datasets: [{
    data: props.models.map((m: ModelStat) => m.total_tokens),
    backgroundColor: [...palette.value.series],
    borderWidth: 0
  }]
})

const reducedMotion = usePreferredReducedMotion()
const doughnutOptions = computed(() => ({
  responsive: true,
  cutout: '64%',
  animation: reducedMotion.value === 'reduce' ? false as const : undefined,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: palette.value.tooltipBg,
      titleColor: palette.value.tooltipTitle,
      bodyColor: palette.value.tooltipBody,
      borderColor: palette.value.tooltipBorder,
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (context: any) => `${context.label}: ${formatTokens(context.parsed)} tokens`
      }
    }
  }
}))
</script>
