<template>
  <section class="dashboard-overview tabular-nums">
    <div class="dashboard-metrics">
      <!-- Total Requests -->
      <div class="dashboard-metric">
        <div class="flex items-start justify-between gap-2.5">
          <div class="dashboard-metric-icon">
            <Icon name="document" size="sm" aria-hidden="true" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium text-ui-subdued">{{ t('usage.totalRequests') }}</p>
            <p class="dashboard-metric-value">{{ stats?.total_requests?.toLocaleString() || '0' }}</p>
            <p class="text-xs text-ui-subdued">{{ t('usage.inSelectedRange') }}</p>
          </div>
        </div>
      </div>

      <!-- Total Tokens -->
      <div class="dashboard-metric">
        <div class="flex items-start justify-between gap-2.5">
          <div class="dashboard-metric-icon">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium text-ui-subdued">{{ t('usage.totalTokens') }}</p>
            <p class="dashboard-metric-value">{{ formatTokens(stats?.total_tokens || 0) }}</p>
            <p class="flex flex-wrap items-center gap-x-1 text-xs text-ui-subdued">
              <span>{{ t('usage.in') }}: {{ formatTokens(stats?.total_input_tokens || 0) }}</span>
              <span>/</span>
              <span>{{ t('usage.out') }}: {{ formatTokens(stats?.total_output_tokens || 0) }}</span>
              <span>/</span>
              <span class="group relative inline-flex cursor-help items-center gap-0.5 rounded focus-visible:outline-2" tabindex="0">
                <span>{{ cacheLabel() }}: {{ formatTokens(stats?.total_cache_tokens || 0) }}</span>
                <svg
                  class="h-3.5 w-3.5 text-ui-subdued"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span
                  class="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-56 -translate-x-1/2 rounded-xl border border-ui-line bg-ui-elevated p-3 text-left text-xs text-ui-ink group-hover:block group-focus:block"
                  style="box-shadow: var(--ui-shadow-popover)"
                >
                  <span class="mb-2 block font-semibold text-ui-ink">
                    {{ cacheDetailLabel() }}
                  </span>
                  <span class="flex items-center justify-between gap-3">
                    <span class="text-ui-subdued">{{ t('usage.cacheCreationTokensLabel') }}</span>
                    <span class="font-mono tabular-nums text-ui-ink">
                      {{ formatTokens(stats?.total_cache_creation_tokens || 0) }}
                    </span>
                  </span>
                  <span class="mt-1 flex items-center justify-between gap-3">
                    <span class="text-ui-subdued">{{ t('usage.cacheReadTokensLabel') }}</span>
                    <span class="font-mono tabular-nums text-ui-ink">
                      {{ formatTokens(stats?.total_cache_read_tokens || 0) }}
                    </span>
                  </span>
                </span>
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Total Cost -->
      <div class="dashboard-metric">
        <div class="flex items-start justify-between gap-2.5">
          <div class="dashboard-metric-icon">
            <Icon name="dollar" size="sm" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-ui-subdued">{{ t('usage.totalCost') }}</p>
            <p class="dashboard-metric-value text-ui-action">
              ${{ (stats?.total_actual_cost || 0).toFixed(4) }}
            </p>
            <p class="text-xs text-ui-subdued">
              <template v-if="showAccountCost && totalAccountCost != null">
                <span class="text-amber-700 dark:text-amber-400">{{ t('usage.accountCost') }} ${{ totalAccountCost.toFixed(4) }}</span>
                <span> · </span>
              </template>
              <span>
                {{ t('usage.standardCost') }}
                <span :class="{ 'line-through': strikeStandardCost }">${{ (stats?.total_cost || 0).toFixed(4) }}</span>
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Avg Duration -->
      <div class="dashboard-metric">
        <div class="flex items-start justify-between gap-2.5">
          <div class="dashboard-metric-icon">
            <Icon name="clock" size="sm" aria-hidden="true" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium text-ui-subdued">{{ t('usage.avgDuration') }}</p>
            <p class="dashboard-metric-value">{{ formatDuration(stats?.average_duration_ms || 0) }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AdminUsageStatsResponse } from '@/api/admin/usage'
import type { UsageStatsResponse } from '@/types'
import Icon from '@/components/icons/Icon.vue'

const props = withDefaults(defineProps<{
  stats: (AdminUsageStatsResponse | UsageStatsResponse) | null
  showAccountCost?: boolean
  strikeStandardCost?: boolean
}>(), {
  showAccountCost: true,
  strikeStandardCost: false,
})

const { t } = useI18n()

const totalAccountCost = computed(() => {
  const stats = props.stats as (AdminUsageStatsResponse & { total_account_cost?: number }) | null
  return stats?.total_account_cost ?? null
})
const showAccountCost = computed(() => props.showAccountCost)
const strikeStandardCost = computed(() => props.strikeStandardCost)

const formatDuration = (ms: number) =>
  ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`

const formatTokens = (value: number) => {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B'
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M'
  if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K'
  return value.toLocaleString()
}

const cacheLabel = () => t('usage.cacheTotal')
const cacheDetailLabel = () => t('usage.cacheBreakdown')
</script>
