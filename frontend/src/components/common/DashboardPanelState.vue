<template>
  <div class="dashboard-state" :role="status === 'loading' ? 'status' : undefined">
    <LoadingSpinner v-if="status === 'loading'" aria-hidden="true" />
    <div
      v-else-if="status === 'error'"
      class="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
      aria-hidden="true"
    >
      <Icon name="exclamationCircle" size="md" />
    </div>
    <div
      v-else
      class="flex h-9 w-9 items-center justify-center rounded-lg border border-ui-line bg-ui-surface text-ui-subdued"
      aria-hidden="true"
    >
      <Icon name="inbox" size="sm" />
    </div>
    <p
      :role="status === 'error' ? 'alert' : undefined"
      class="max-w-xs text-sm"
      :class="status === 'error' ? 'font-medium text-ui-ink' : 'text-ui-subdued'"
    >
      {{ message || t(defaultMessages[status]) }}
    </p>
    <button
      v-if="status === 'error' && retry"
      type="button"
      class="btn btn-secondary btn-sm mt-1"
      @click="emit('retry')"
    >
      {{ t('common.refresh') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LoadingSpinner from './LoadingSpinner.vue'
import Icon from '@/components/icons/Icon.vue'

defineProps<{
  status: 'loading' | 'error' | 'empty'
  message?: string
  retry?: boolean
}>()
const emit = defineEmits<{ retry: [] }>()
const { t } = useI18n()
const defaultMessages = {
  loading: 'common.loading',
  error: 'dashboard.failedToLoadCharts',
  empty: 'dashboard.noUsageForPeriod'
}
</script>
