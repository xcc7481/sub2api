<template>
  <div class="dashboard-state" :role="status === 'loading' ? 'status' : undefined">
    <LoadingSpinner v-if="status === 'loading'" aria-hidden="true" />
    <p :role="status === 'error' ? 'alert' : undefined">
      {{ message || t(defaultMessages[status]) }}
    </p>
    <button v-if="status === 'error' && retry" type="button" class="btn btn-secondary" @click="emit('retry')">
      {{ t('common.refresh') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LoadingSpinner from './LoadingSpinner.vue'

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
