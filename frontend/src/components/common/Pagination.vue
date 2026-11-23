<template>
  <div
    class="flex items-center justify-between border border-ui-line bg-ui-surface px-4 py-3 tabular-nums sm:px-5"
    style="border-radius: var(--ui-radius-panel); box-shadow: var(--ui-shadow-panel)"
  >
    <div class="flex flex-1 items-center justify-between gap-2 sm:hidden">
      <!-- Mobile pagination -->
      <button
        type="button"
        @click="goToPage(page - 1)"
        :disabled="page === 1"
        class="inline-flex min-h-10 items-center justify-center rounded-lg border border-ui-control bg-ui-surface px-3.5 py-2 text-xs font-medium text-ui-ink transition-colors hover:border-ui-control-hover hover:bg-ui-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ t('pagination.previous') }}
      </button>
      <span class="text-xs font-medium text-ui-subdued">
        {{ t('pagination.pageOf', { page, total: totalPages }) }}
      </span>
      <button
        type="button"
        @click="goToPage(page + 1)"
        :disabled="page === totalPages"
        class="inline-flex min-h-10 items-center justify-center rounded-lg border border-ui-control bg-ui-surface px-3.5 py-2 text-xs font-medium text-ui-ink transition-colors hover:border-ui-control-hover hover:bg-ui-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ t('pagination.next') }}
      </button>
    </div>

    <div class="hidden sm:flex sm:flex-1 sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
      <!-- Desktop pagination info -->
      <div class="flex flex-wrap items-center gap-4">
        <p class="text-sm text-ui-subdued">
          {{ t('pagination.showing') }}
          <span class="font-semibold text-ui-ink">{{ fromItem }}</span>
          {{ t('pagination.to') }}
          <span class="font-semibold text-ui-ink">{{ toItem }}</span>
          {{ t('pagination.of') }}
          <span class="font-semibold text-ui-ink">{{ total }}</span>
          {{ t('pagination.results') }}
        </p>

        <!-- Page size selector -->
        <div v-if="showPageSizeSelector" class="flex items-center gap-2">
          <span class="text-sm text-ui-subdued"
            >{{ t('pagination.perPage') }}:</span
          >
          <div class="page-size-select w-20">
            <Select
              :model-value="pageSize"
              :options="pageSizeSelectOptions"
              @update:model-value="handlePageSizeChange"
            />
          </div>
        </div>

        <div v-if="showJump" class="flex items-center gap-2">
          <span class="text-sm text-ui-subdued">{{ t('pagination.jumpTo') }}</span>
          <input
            v-model="jumpPage"
            type="number"
            min="1"
            :max="totalPages"
            class="input w-20 py-1.5 text-sm"
            :placeholder="t('pagination.jumpPlaceholder')"
            @keyup.enter="submitJump"
          />
          <button type="button" class="btn btn-ghost btn-sm" @click="submitJump">
            {{ t('pagination.jumpAction') }}
          </button>
        </div>
      </div>

      <!-- Desktop pagination buttons -->
      <nav
        class="relative z-0 inline-flex items-center gap-1"
        aria-label="Pagination"
      >
        <!-- Previous button -->
        <button
          type="button"
          @click="goToPage(page - 1)"
          :disabled="page === 1"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ui-control bg-ui-surface text-ui-subdued transition-colors hover:border-ui-control-hover hover:bg-ui-muted/70 hover:text-ui-ink disabled:cursor-not-allowed disabled:opacity-45"
          :aria-label="t('pagination.previous')"
        >
          <Icon name="chevronLeft" size="sm" aria-hidden="true" />
        </button>

        <!-- Page numbers -->
        <button
          v-for="(pageNum, index) in visiblePages"
          :key="`${pageNum}-${index}`"
          type="button"
          @click="typeof pageNum === 'number' && goToPage(pageNum)"
          :disabled="typeof pageNum !== 'number'"
          :class="[
            'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-colors',
            pageNum === page
              ? 'border-ui-action/30 bg-ui-selected font-semibold text-ui-action'
              : typeof pageNum === 'number'
                ? 'border-transparent bg-transparent text-ui-ink hover:border-ui-line hover:bg-ui-muted/70'
                : 'cursor-default border-transparent text-ui-subdued'
          ]"
          :aria-label="
            typeof pageNum === 'number' ? t('pagination.goToPage', { page: pageNum }) : undefined
          "
          :aria-current="pageNum === page ? 'page' : undefined"
        >
          {{ pageNum }}
        </button>

        <!-- Next button -->
        <button
          type="button"
          @click="goToPage(page + 1)"
          :disabled="page === totalPages"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ui-control bg-ui-surface text-ui-subdued transition-colors hover:border-ui-control-hover hover:bg-ui-muted/70 hover:text-ui-ink disabled:cursor-not-allowed disabled:opacity-45"
          :aria-label="t('pagination.next')"
        >
          <Icon name="chevronRight" size="sm" aria-hidden="true" />
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import Select from './Select.vue'
import { getConfiguredTablePageSizeOptions, normalizeTablePageSize } from '@/utils/tablePreferences'
import { setPersistedPageSize } from '@/composables/usePersistedPageSize'

const { t } = useI18n()

interface Props {
  total: number
  page: number
  pageSize: number
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
  showJump?: boolean
}

interface Emits {
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', pageSize: number): void
}

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => getConfiguredTablePageSizeOptions(),
  showPageSizeSelector: true,
  showJump: false
})

const emit = defineEmits<Emits>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const fromItem = computed(() => {
  if (props.total === 0) return 0
  return (props.page - 1) * props.pageSize + 1
})

const toItem = computed(() => {
  const to = props.page * props.pageSize
  return to > props.total ? props.total : to
})

const pageSizeSelectOptions = computed(() => {
  const options = Array.from(
    new Set([
      ...getConfiguredTablePageSizeOptions(),
      normalizeTablePageSize(props.pageSize)
    ])
  ).sort((a, b) => a - b)

  return options.map((size) => ({
    value: size,
    label: String(size)
  }))
})

const jumpPage = ref('')

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const maxVisible = 7
  const total = totalPages.value

  if (total <= maxVisible) {
    // Show all pages if total is small
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    const start = Math.max(2, props.page - 2)
    const end = Math.min(total - 1, props.page + 2)

    // Add ellipsis before if needed
    if (start > 2) {
      pages.push('...')
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis after if needed
    if (end < total - 1) {
      pages.push('...')
    }

    // Always show last page
    pages.push(total)
  }

  return pages
})

const goToPage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value && newPage !== props.page) {
    emit('update:page', newPage)
  }
}

const handlePageSizeChange = (value: string | number | boolean | null) => {
  if (value === null || typeof value === 'boolean') return
  const newPageSize = normalizeTablePageSize(typeof value === 'string' ? parseInt(value, 10) : value)
  setPersistedPageSize(newPageSize)
  emit('update:pageSize', newPageSize)
}

const submitJump = () => {
  const value = String(jumpPage.value).trim()
  if (!value) return
  const pageNum = Number.parseInt(value, 10)
  if (Number.isNaN(pageNum)) return
  const nextPage = Math.min(Math.max(pageNum, 1), totalPages.value)
  jumpPage.value = ''
  goToPage(nextPage)
}
</script>

<style scoped>
.page-size-select :deep(.select-trigger) {
  @apply px-3 py-1.5 text-sm;
}
</style>
