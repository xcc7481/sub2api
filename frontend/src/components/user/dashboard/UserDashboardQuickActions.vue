<template>
  <div class="card">
    <div class="card-header">
      <h2 class="text-base font-semibold tracking-tight">{{ t('dashboard.quickActions') }}</h2>
    </div>
    <div class="space-y-3 p-4">
      <button type="button" @click="router.push('/keys')" class="dashboard-action group">
        <div class="dashboard-action-icon">
          <Icon name="key" size="md" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('dashboard.createApiKey') }}</p>
          <p class="text-xs text-gray-500 dark:text-dark-400">{{ t('dashboard.generateNewKey') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="md"
          class="shrink-0 text-gray-500 group-hover:text-primary-600 dark:text-dark-400 dark:group-hover:text-primary-400"
        />
      </button>

      <button type="button" @click="router.push('/usage')" class="dashboard-action group">
        <div class="dashboard-action-icon">
          <Icon name="chart" size="md" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('dashboard.viewUsage') }}</p>
          <p class="text-xs text-gray-500 dark:text-dark-400">{{ t('dashboard.checkDetailedLogs') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="md"
          class="shrink-0 text-gray-500 group-hover:text-primary-600 dark:text-dark-400 dark:group-hover:text-primary-400"
        />
      </button>

      <button v-if="canUseBatchImage" type="button" @click="router.push('/batch-image')" class="dashboard-action group">
        <div class="dashboard-action-icon">
          <Icon name="sparkles" size="md" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('dashboard.batchImageAgent') }}</p>
          <p class="text-xs text-gray-500 dark:text-dark-400">{{ t('dashboard.batchImageAgentDesc') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="md"
          class="shrink-0 text-gray-500 group-hover:text-primary-600 dark:text-dark-400 dark:group-hover:text-primary-400"
        />
      </button>

      <button type="button" @click="router.push('/redeem')" class="dashboard-action group">
        <div class="dashboard-action-icon">
          <Icon name="gift" size="md" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('dashboard.redeemCode') }}</p>
          <p class="text-xs text-gray-500 dark:text-dark-400">{{ t('dashboard.addBalanceWithCode') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="md"
          class="shrink-0 text-gray-500 group-hover:text-primary-600 dark:text-dark-400 dark:group-hover:text-primary-400"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { useBatchImageAccess } from '@/composables/useBatchImageAccess'
const router = useRouter()
const { t } = useI18n()
const { canUseBatchImage, refreshBatchImageAccess } = useBatchImageAccess()

onMounted(() => {
  void refreshBatchImageAccess()
})
</script>
