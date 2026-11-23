<template>
  <div class="card">
    <div class="card-header flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-base font-semibold tracking-tight text-ui-ink">{{ t('dashboard.recentUsage') }}</h2>
      <span class="badge badge-gray">{{ t('dashboard.last7Days') }}</span>
    </div>
    <div class="p-4 sm:p-5">
      <DashboardPanelState v-if="loading" status="loading" />
      <DashboardPanelState v-else-if="failed" status="error" :message="t('dashboard.failedToLoadRecent')" retry @retry="emit('retry')" />
      <div v-else-if="data.length === 0" class="dashboard-state">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-ui-line bg-ui-surface text-ui-subdued" aria-hidden="true">
          <Icon name="inbox" size="sm" />
        </div>
        <p class="font-medium text-ui-ink">{{ t('dashboard.noUsageRecords') }}</p>
        <p class="max-w-xs text-xs text-ui-subdued">{{ t('dashboard.startUsingApi') }}</p>
      </div>
      <div v-else class="divide-y divide-ui-line/80">
        <div v-for="log in data" :key="log.id" class="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 sm:flex-nowrap">
          <div class="flex min-w-0 items-center gap-3">
            <div class="dashboard-action-icon">
              <Icon name="beaker" size="sm" aria-hidden="true" />
            </div>
            <div class="min-w-0">
              <p class="truncate font-mono text-sm font-medium text-ui-ink" :title="log.model">{{ log.model }}</p>
              <p class="text-xs text-ui-subdued tabular-nums">{{ formatDateTime(log.created_at) }}</p>
            </div>
          </div>
          <div class="text-right tabular-nums">
            <p class="font-mono text-sm font-semibold">
              <span class="text-ui-action" :title="t('dashboard.actual')">${{ formatCost(log.actual_cost) }}</span>
              <span class="font-normal text-ui-subdued" :title="t('dashboard.standard')"> / ${{ formatCost(log.total_cost) }}</span>
            </p>
            <p class="text-xs text-ui-subdued">{{ (log.input_tokens + log.output_tokens).toLocaleString() }} tokens</p>
          </div>
        </div>

        <router-link to="/usage" class="flex items-center justify-center gap-1.5 pt-3.5 text-sm font-medium text-ui-action transition-colors hover:text-ui-action-hover">
          {{ t('dashboard.viewAllUsage') }}
          <Icon name="arrowRight" size="sm" aria-hidden="true" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DashboardPanelState from '@/components/common/DashboardPanelState.vue'
import Icon from '@/components/icons/Icon.vue'
import { formatDateTime } from '@/utils/format'
import type { UsageLog } from '@/types'

defineProps<{
  data: UsageLog[]
  loading: boolean
  failed: boolean
}>()
const emit = defineEmits<{ retry: [] }>()
const { t } = useI18n()
const formatCost = (c: number) => c.toFixed(4)
</script>
