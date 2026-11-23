<template>
  <div class="card">
    <div class="card-header">
      <h2 class="text-base font-semibold tracking-tight text-ui-ink">{{ t('dashboard.quickActions') }}</h2>
    </div>
    <div class="space-y-2.5 p-4">
      <button type="button" @click="router.push('/keys')" class="dashboard-action group">
        <div class="dashboard-action-icon">
          <Icon name="key" size="sm" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-ui-ink">{{ t('dashboard.createApiKey') }}</p>
          <p class="text-xs text-ui-subdued">{{ t('dashboard.generateNewKey') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="sm"
          class="shrink-0 text-ui-subdued transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ui-action motion-reduce:transition-none"
          aria-hidden="true"
        />
      </button>

      <button type="button" @click="router.push('/usage')" class="dashboard-action group">
        <div class="dashboard-action-icon">
          <Icon name="chart" size="sm" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-ui-ink">{{ t('dashboard.viewUsage') }}</p>
          <p class="text-xs text-ui-subdued">{{ t('dashboard.checkDetailedLogs') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="sm"
          class="shrink-0 text-ui-subdued transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ui-action motion-reduce:transition-none"
          aria-hidden="true"
        />
      </button>

      <button v-if="canUseBatchImage" type="button" @click="router.push('/batch-image')" class="dashboard-action group">
        <div class="dashboard-action-icon">
          <Icon name="sparkles" size="sm" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-ui-ink">{{ t('dashboard.batchImageAgent') }}</p>
          <p class="text-xs text-ui-subdued">{{ t('dashboard.batchImageAgentDesc') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="sm"
          class="shrink-0 text-ui-subdued transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ui-action motion-reduce:transition-none"
          aria-hidden="true"
        />
      </button>

      <button type="button" @click="router.push('/redeem')" class="dashboard-action group">
        <div class="dashboard-action-icon">
          <Icon name="gift" size="sm" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-ui-ink">{{ t('dashboard.redeemCode') }}</p>
          <p class="text-xs text-ui-subdued">{{ t('dashboard.addBalanceWithCode') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="sm"
          class="shrink-0 text-ui-subdued transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ui-action motion-reduce:transition-none"
          aria-hidden="true"
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
