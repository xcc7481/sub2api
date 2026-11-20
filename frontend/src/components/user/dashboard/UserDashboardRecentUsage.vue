<template>
  <div class="card">
    <div class="card-header flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-base font-semibold tracking-tight">{{ t('dashboard.recentUsage') }}</h2>
      <span class="badge badge-gray">{{ t('dashboard.last7Days') }}</span>
    </div>
    <div class="p-4 sm:p-6">
      <DashboardPanelState v-if="loading" status="loading" />
      <DashboardPanelState v-else-if="failed" status="error" :message="t('dashboard.failedToLoadRecent')" retry @retry="emit('retry')" />
      <div v-else-if="data.length === 0" class="dashboard-state">
        <p class="font-medium text-ui-ink">{{ t('dashboard.noUsageRecords') }}</p>
        <p>{{ t('dashboard.startUsingApi') }}</p>
      </div>
      <div v-else class="divide-y divide-ui-line">
        <div v-for="log in data" :key="log.id" class="flex flex-wrap items-center justify-between gap-3 py-2.5 sm:flex-nowrap">
          <div class="flex min-w-0 items-center gap-3">
            <div class="dashboard-action-icon">
              <Icon name="beaker" size="md" />
            </div>
            <div class="min-w-0">
              <p class="break-words text-sm font-medium text-gray-900 dark:text-white">{{ log.model }}</p>
              <p class="text-xs text-gray-500 dark:text-dark-400">{{ formatDateTime(log.created_at) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold">
              <span class="text-green-700 dark:text-green-400" :title="t('dashboard.actual')">${{ formatCost(log.actual_cost) }}</span>
              <span class="font-normal text-gray-500 dark:text-dark-400" :title="t('dashboard.standard')"> / ${{ formatCost(log.total_cost) }}</span>
            </p>
            <p class="text-xs text-gray-500 dark:text-dark-400">{{ (log.input_tokens + log.output_tokens).toLocaleString() }} tokens</p>
          </div>
        </div>

        <router-link to="/usage" class="flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          {{ t('dashboard.viewAllUsage') }}
          <Icon name="arrowRight" size="sm" />
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
