<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed right-4 top-4 z-[9999] space-y-2.5"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup
        enter-active-class="transition ease-out duration-200 motion-reduce:transition-none"
        enter-from-class="opacity-0 translate-x-6 motion-reduce:translate-x-0"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition ease-in duration-150 motion-reduce:transition-none"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-6 motion-reduce:translate-x-0"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto min-w-[300px] max-w-md overflow-hidden rounded-xl border border-ui-line border-l-4 bg-ui-elevated',
            getBorderColor(toast.type)
          ]"
          style="box-shadow: var(--ui-shadow-popover)"
        >
          <div class="p-3.5 sm:p-4">
            <div class="flex items-start gap-3">
              <div class="mt-0.5 flex-shrink-0">
                <Icon
                  :name="getToastIconName(toast.type)"
                  size="md"
                  :class="getIconColor(toast.type)"
                  aria-hidden="true"
                />
              </div>

              <div class="min-w-0 flex-1">
                <p v-if="toast.title" class="text-sm font-semibold text-ui-ink">
                  {{ toast.title }}
                </p>
                <p
                  :class="[
                    'text-sm leading-relaxed',
                    toast.title ? 'mt-0.5 text-ui-subdued' : 'text-ui-ink'
                  ]"
                >
                  {{ toast.message }}
                </p>
              </div>

              <button
                type="button"
                @click="removeToast(toast.id)"
                class="-m-1 flex-shrink-0 rounded-md p-1.5 text-ui-subdued transition-colors hover:bg-ui-muted hover:text-ui-ink"
                aria-label="Close notification"
              >
                <Icon name="x" size="sm" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div v-if="toast.duration" class="h-0.5 bg-ui-muted">
            <div
              :class="['h-full toast-progress', getProgressBarColor(toast.type)]"
              :style="{ animationDuration: `${toast.duration}ms` }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/icons/Icon.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const toasts = computed(() => appStore.toasts)

const getToastIconName = (type: string): 'checkCircle' | 'xCircle' | 'exclamationTriangle' | 'infoCircle' => {
  switch (type) {
    case 'success':
      return 'checkCircle'
    case 'error':
      return 'xCircle'
    case 'warning':
      return 'exclamationTriangle'
    case 'info':
    default:
      return 'infoCircle'
  }
}

const getIconColor = (type: string): string => {
  const colors: Record<string, string> = {
    success: 'text-emerald-700 dark:text-emerald-400',
    error: 'text-red-700 dark:text-red-400',
    warning: 'text-amber-700 dark:text-amber-400',
    info: 'text-ui-action'
  }
  return colors[type] || colors.info
}

const getBorderColor = (type: string): string => {
  const colors: Record<string, string> = {
    success: 'border-l-emerald-600 dark:border-l-emerald-400',
    error: 'border-l-red-600 dark:border-l-red-400',
    warning: 'border-l-amber-600 dark:border-l-amber-400',
    info: 'border-l-ui-action'
  }
  return colors[type] || colors.info
}

const getProgressBarColor = (type: string): string => {
  const colors: Record<string, string> = {
    success: 'bg-emerald-600 dark:bg-emerald-400',
    error: 'bg-red-600 dark:bg-red-400',
    warning: 'bg-amber-600 dark:bg-amber-400',
    info: 'bg-ui-action'
  }
  return colors[type] || colors.info
}

const removeToast = (id: string) => {
  appStore.hideToast(id)
}
</script>

<style scoped>
.toast-progress {
  width: 100%;
  animation-name: toast-progress-shrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes toast-progress-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast-progress {
    animation: none;
  }
}
</style>
