<template>
  <AppLayout>
    <div class="space-y-5 tabular-nums sm:space-y-6">
      <DashboardPanelState v-if="loading" status="loading" />
      <template v-else-if="stats">
        <UserDashboardStats
          :stats="stats"
          :balance="user?.balance ?? 0"
          :is-simple="authStore.isSimpleMode"
          :platform-quotas="platformQuotas"
        />
        <UserDashboardCharts
          v-model:start-date="startDate"
          v-model:end-date="endDate"
          v-model:granularity="granularity"
          :loading="loadingCharts"
          :failed="chartsFailed"
          :trend="trendData"
          :models="modelStats"
          @date-range-change="loadCharts"
          @granularity-change="loadCharts"
          @refresh="refreshAll"
          @retry-charts="loadCharts"
        />
        <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div class="min-w-0 xl:col-span-2">
            <UserDashboardRecentUsage :data="recentUsage" :loading="loadingUsage" :failed="usageFailed" @retry="loadRecent" />
          </div>
          <div class="min-w-0"><UserDashboardQuickActions /></div>
        </div>
      </template>
      <DashboardPanelState
        v-else
        status="error"
        :message="t('dashboard.failedToLoadOverview')"
        retry
        @retry="refreshAll"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { usageAPI, type UserDashboardStats as UserStatsType } from '@/api/usage'
import { getMyPlatformQuotas } from '@/api/user'
import AppLayout from '@/components/layout/AppLayout.vue'
import DashboardPanelState from '@/components/common/DashboardPanelState.vue'
import UserDashboardStats from '@/components/user/dashboard/UserDashboardStats.vue'
import UserDashboardCharts from '@/components/user/dashboard/UserDashboardCharts.vue'
import UserDashboardRecentUsage from '@/components/user/dashboard/UserDashboardRecentUsage.vue'
import UserDashboardQuickActions from '@/components/user/dashboard/UserDashboardQuickActions.vue'
import type { UsageLog, TrendDataPoint, ModelStat, PlatformQuotaItem } from '@/types'
import { formatDateLocalInput } from '@/utils/format'

const { t } = useI18n()
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const stats = ref<UserStatsType | null>(null)
const loading = ref(true)
const loadingUsage = ref(false)
const loadingCharts = ref(false)
const chartsFailed = ref(false)
const usageFailed = ref(false)
const trendData = ref<TrendDataPoint[]>([])
const modelStats = ref<ModelStat[]>([])
const recentUsage = ref<UsageLog[]>([])
const platformQuotas = ref<PlatformQuotaItem[] | null>(null)

const recentDateRange = () => {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - 6)
  return { start: formatDateLocalInput(start), end: formatDateLocalInput(today) }
}

const initialRange = recentDateRange()
const startDate = ref(initialRange.start)
const endDate = ref(initialRange.end)
const granularity = ref<'day' | 'hour'>('day')
let chartLoadSequence = 0

const loadStats = async () => {
  loading.value = !stats.value
  try {
    await authStore.refreshUser()
    stats.value = await usageAPI.getDashboardStats()
  } catch (error) {
    console.error('Failed to load dashboard stats:', error)
    if (stats.value) {
      stats.value = null
    }
  } finally {
    loading.value = false
  }
}

const loadCharts = async () => {
  const sequence = ++chartLoadSequence
  loadingCharts.value = true
  chartsFailed.value = false
  const dates = { start_date: startDate.value, end_date: endDate.value }
  try {
    const [trend, models] = await Promise.all([
      usageAPI.getDashboardTrend({ ...dates, granularity: granularity.value }),
      usageAPI.getDashboardModels(dates)
    ])
    if (sequence !== chartLoadSequence) return
    trendData.value = trend.trend ?? []
    modelStats.value = models.models ?? []
  } catch (error) {
    if (sequence !== chartLoadSequence) return
    chartsFailed.value = true
    console.error('Failed to load charts:', error)
  } finally {
    if (sequence === chartLoadSequence) loadingCharts.value = false
  }
}

const loadRecent = async () => {
  loadingUsage.value = true
  usageFailed.value = false
  try {
    const { start, end } = recentDateRange()
    const result = await usageAPI.getByDateRange(start, end)
    recentUsage.value = result.items.slice(0, 5)
  } catch (error) {
    usageFailed.value = true
    console.error('Failed to load recent usage:', error)
  } finally {
    loadingUsage.value = false
  }
}

const loadPlatformQuotas = async () => {
  try {
    const data = await getMyPlatformQuotas()
    platformQuotas.value = data.platform_quotas ?? []
  } catch (error) {
    console.warn('Failed to load platform quotas:', error)
    platformQuotas.value = []
  }
}

const refreshAll = () => {
  void Promise.all([loadStats(), loadCharts(), loadRecent(), loadPlatformQuotas()])
}

onMounted(refreshAll)
</script>
