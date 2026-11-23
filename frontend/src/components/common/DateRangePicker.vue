<template>
  <div class="relative" ref="containerRef">
    <button
      type="button"
      @click="toggle"
      :aria-expanded="isOpen"
      :class="['date-picker-trigger', isOpen && 'date-picker-trigger-open']"
    >
      <span class="date-picker-icon">
        <Icon name="calendar" size="sm" />
      </span>
      <span class="date-picker-value">
        {{ displayValue }}
      </span>
      <span class="date-picker-chevron">
        <Icon
          name="chevronDown"
          size="sm"
          :class="['transition-transform duration-200', isOpen && 'rotate-180']"
        />
      </span>
    </button>

    <Transition name="date-picker-dropdown">
      <div v-if="isOpen" ref="dropdownRef" class="date-picker-dropdown" :style="{ left: dropdownOffset + 'px' }">
        <!-- Quick presets -->
        <div class="date-picker-presets">
          <button
            v-for="preset in presets"
            :key="preset.value"
            @click="selectPreset(preset)"
            :class="['date-picker-preset', isPresetActive(preset) && 'date-picker-preset-active']"
          >
            {{ t(preset.labelKey) }}
          </button>
        </div>

        <div class="date-picker-divider"></div>

        <!-- Custom date range inputs -->
        <div class="date-picker-custom">
          <div class="date-picker-field">
            <label :for="dateInputId + '-start'" class="date-picker-label">{{ t('dates.startDate') }}</label>
            <input
              :id="dateInputId + '-start'"
              type="date"
              v-model="localStartDate"
              :max="localEndDate || tomorrow()"
              class="date-picker-input"
              @change="onDateChange"
            />
          </div>
          <div class="date-picker-separator">
            <Icon name="arrowRight" size="sm" class="text-gray-400" />
          </div>
          <div class="date-picker-field">
            <label :for="dateInputId + '-end'" class="date-picker-label">{{ t('dates.endDate') }}</label>
            <input
              :id="dateInputId + '-end'"
              type="date"
              v-model="localEndDate"
              :min="localStartDate"
              :max="tomorrow()"
              class="date-picker-input"
              @change="onDateChange"
            />
          </div>
        </div>

        <!-- Apply button -->
        <div class="date-picker-actions">
          <button @click="apply" class="date-picker-apply">
            {{ t('dates.apply') }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'

interface DatePreset {
  labelKey: string
  value: string
  getRange: () => { start: string; end: string }
}

interface Props {
  startDate: string
  endDate: string
}

interface Emits {
  (e: 'update:startDate', value: string): void
  (e: 'update:endDate', value: string): void
  (e: 'change', range: { startDate: string; endDate: string; preset: string | null }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t, locale } = useI18n()
const dateInputId = useId()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownOffset = ref(0)
const localStartDate = ref(props.startDate)
const localEndDate = ref(props.endDate)
const activePreset = ref<string | null>('last24Hours')

const today = () => formatDateToString(new Date())

// Tomorrow's date - used for max date to handle timezone differences
// When user is in a timezone behind the server, "today" on server might be "tomorrow" locally
const tomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return formatDateToString(d)
}

// Helper function to format date to YYYY-MM-DD using local timezone
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const presets: DatePreset[] = [
  {
    labelKey: 'dates.today',
    value: 'today',
    getRange: () => {
      const t = today()
      return { start: t, end: t }
    }
  },
  {
    labelKey: 'dates.yesterday',
    value: 'yesterday',
    getRange: () => {
      const d = new Date()
      d.setDate(d.getDate() - 1)
      const yesterday = formatDateToString(d)
      return { start: yesterday, end: yesterday }
    }
  },
  {
    labelKey: 'dates.last24Hours',
    value: 'last24Hours',
    getRange: () => {
      const end = new Date()
      const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
      return {
        start: formatDateToString(start),
        end: formatDateToString(end)
      }
    }
  },
  {
    labelKey: 'dates.last7Days',
    value: '7days',
    getRange: () => {
      const end = today()
      const d = new Date()
      d.setDate(d.getDate() - 6)
      const start = formatDateToString(d)
      return { start, end }
    }
  },
  {
    labelKey: 'dates.last14Days',
    value: '14days',
    getRange: () => {
      const end = today()
      const d = new Date()
      d.setDate(d.getDate() - 13)
      const start = formatDateToString(d)
      return { start, end }
    }
  },
  {
    labelKey: 'dates.last30Days',
    value: '30days',
    getRange: () => {
      const end = today()
      const d = new Date()
      d.setDate(d.getDate() - 29)
      const start = formatDateToString(d)
      return { start, end }
    }
  },
  {
    labelKey: 'dates.thisMonth',
    value: 'thisMonth',
    getRange: () => {
      const now = new Date()
      const start = formatDateToString(new Date(now.getFullYear(), now.getMonth(), 1))
      return { start, end: today() }
    }
  },
  {
    labelKey: 'dates.lastMonth',
    value: 'lastMonth',
    getRange: () => {
      const now = new Date()
      const start = formatDateToString(new Date(now.getFullYear(), now.getMonth() - 1, 1))
      const end = formatDateToString(new Date(now.getFullYear(), now.getMonth(), 0))
      return { start, end }
    }
  }
]

const displayValue = computed(() => {
  if (activePreset.value) {
    const preset = presets.find((p) => p.value === activePreset.value)
    if (preset) return t(preset.labelKey)
  }

  if (localStartDate.value && localEndDate.value) {
    if (localStartDate.value === localEndDate.value) {
      return formatDate(localStartDate.value)
    }
    return `${formatDate(localStartDate.value)} - ${formatDate(localEndDate.value)}`
  }

  return t('dates.selectDateRange')
})

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00')
  const dateLocale = locale.value === 'zh' ? 'zh-CN' : 'en-US'
  return date.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })
}

const isPresetActive = (preset: DatePreset): boolean => {
  return activePreset.value === preset.value
}

const selectPreset = (preset: DatePreset) => {
  const range = preset.getRange()
  localStartDate.value = range.start
  localEndDate.value = range.end
  activePreset.value = preset.value
}

const onDateChange = () => {
  // Check if current dates match any preset
  activePreset.value = null
  for (const preset of presets) {
    const range = preset.getRange()
    if (range.start === localStartDate.value && range.end === localEndDate.value) {
      activePreset.value = preset.value
      break
    }
  }
}

const toggle = () => {
  isOpen.value = !isOpen.value
}

function positionDropdown() {
  if (!isOpen.value || !containerRef.value || !dropdownRef.value) return

  const gutter = 16
  const anchorLeft = containerRef.value.getBoundingClientRect().left
  const maxLeft = document.documentElement.clientWidth - dropdownRef.value.offsetWidth - gutter
  dropdownOffset.value = Math.max(gutter, Math.min(anchorLeft, maxLeft)) - anchorLeft
}

const apply = () => {
  emit('update:startDate', localStartDate.value)
  emit('update:endDate', localEndDate.value)
  emit('change', {
    startDate: localStartDate.value,
    endDate: localEndDate.value,
    preset: activePreset.value
  })
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

// Restore the applied range after dismissal, including parent updates from Apply.
watch(isOpen, (open) => {
  if (open) {
    positionDropdown()
    return
  }
  localStartDate.value = props.startDate
  localEndDate.value = props.endDate
  onDateChange()
}, { flush: 'post' })

// Sync local state with props
watch(
  () => props.startDate,
  (val) => {
    localStartDate.value = val
    onDateChange()
  }
)

watch(
  () => props.endDate,
  (val) => {
    localEndDate.value = val
    onDateChange()
  }
)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('resize', positionDropdown)
  // Initialize active preset detection
  onDateChange()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', positionDropdown)
})
</script>

<style scoped>
.date-picker-trigger {
  @apply flex items-center gap-2 px-3 py-2 text-sm;
  border-radius: var(--ui-radius-control);
  @apply border border-ui-control bg-ui-surface text-ui-ink;
  @apply transition-colors duration-150 motion-reduce:transition-none;
  @apply hover:border-ui-control-hover focus:border-ui-focus;
  @apply cursor-pointer;
}

.date-picker-trigger:focus-visible {
  outline: none;
  border-color: rgb(var(--ui-focus));
  box-shadow: 0 0 0 3px rgb(var(--ui-focus) / 0.16);
}

.date-picker-trigger-open {
  @apply border-ui-focus;
  box-shadow: 0 0 0 3px rgb(var(--ui-focus) / 0.16);
}

.date-picker-icon {
  @apply text-ui-subdued;
}

.date-picker-value {
  @apply font-medium tabular-nums;
}

.date-picker-chevron {
  @apply text-ui-subdued;
}

.date-picker-dropdown {
  @apply absolute z-[100] mt-2 overflow-hidden border border-ui-line bg-ui-elevated;
  border-radius: var(--ui-radius-panel);
  box-shadow: var(--ui-shadow-popover);
  width: min(20rem, calc(100vw - 2rem));
}

.date-picker-presets {
  @apply grid grid-cols-2 gap-1 p-2;
}

.date-picker-preset {
  @apply rounded-md px-3 py-1.5 text-left text-xs font-medium text-ui-subdued transition-colors duration-150 hover:bg-ui-muted hover:text-ui-ink;
}

.date-picker-preset-active {
  @apply bg-ui-selected font-semibold text-ui-action hover:bg-ui-selected hover:text-ui-action;
}

.date-picker-divider {
  @apply border-t border-ui-line;
}

.date-picker-custom {
  @apply flex items-end gap-2 p-3;
}

.date-picker-field {
  @apply min-w-0 flex-1;
}

.date-picker-label {
  @apply mb-1 block text-xs font-medium text-ui-subdued;
}

.date-picker-input {
  @apply w-full min-w-0 rounded-md border border-ui-control bg-ui-canvas/70 px-2 py-1.5 text-sm text-ui-ink tabular-nums;
  @apply focus:border-ui-focus focus:outline-none;
}

.date-picker-input::-webkit-calendar-picker-indicator {
  @apply cursor-pointer opacity-60 hover:opacity-100;
  filter: invert(0.45);
}

.dark .date-picker-input::-webkit-calendar-picker-indicator {
  filter: invert(0.85);
}

.date-picker-separator {
  @apply flex items-center justify-center pb-1.5 text-ui-subdued;
}

.date-picker-actions {
  @apply flex justify-end p-2.5 pt-0;
}

.date-picker-apply {
  @apply px-4 py-1.5 text-sm font-medium bg-ui-action text-ui-on-action hover:bg-ui-action-hover transition-colors duration-150;
  border-radius: var(--ui-radius-control);
}

/* Dropdown animation */
.date-picker-dropdown-enter-active {
  transition:
    opacity 150ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.date-picker-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .date-picker-dropdown-enter-active {
    transition: none;
  }
}
</style>
