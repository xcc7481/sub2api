<template>
  <div class="relative" ref="dropdownRef">
    <button
      ref="triggerRef"
      type="button"
      @click="toggleDropdown"
      :disabled="switching"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      class="flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ui-subdued transition-colors hover:bg-ui-muted/80 hover:text-ui-ink motion-reduce:transition-none"
      :title="currentLocale?.name"
    >
      <span class="text-base" aria-hidden="true">{{ currentLocale?.flag }}</span>
      <span class="hidden sm:inline">{{ currentLocale?.code.toUpperCase() }}</span>
      <Icon
        name="chevronDown"
        size="xs"
        class="text-ui-subdued transition-transform duration-150 motion-reduce:transition-none"
        :class="{ 'rotate-180': isOpen }"
        aria-hidden="true"
      />
    </button>

    <transition name="dropdown">
      <div
        v-if="isOpen"
        role="listbox"
        class="dropdown right-0 mt-1.5 w-36 overflow-hidden py-1"
      >
        <button
          v-for="localeItem in availableLocales"
          :key="localeItem.code"
          type="button"
          role="option"
          :aria-selected="localeItem.code === currentLocaleCode"
          :disabled="switching"
          @click="selectLocale(localeItem.code)"
          class="flex w-full items-center gap-2 px-3 py-2 text-sm text-ui-ink transition-colors hover:bg-ui-muted/80"
          :class="{
            'bg-ui-selected font-medium text-ui-action':
              localeItem.code === currentLocaleCode
          }"
        >
          <span class="text-base" aria-hidden="true">{{ localeItem.flag }}</span>
          <span>{{ localeItem.name }}</span>
          <Icon v-if="localeItem.code === currentLocaleCode" name="check" size="sm" class="ml-auto text-ui-action" aria-hidden="true" />
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { setLocale, availableLocales } from '@/i18n'

const { locale } = useI18n()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const switching = ref(false)

const currentLocaleCode = computed(() => locale.value)
const currentLocale = computed(() => availableLocales.find((l) => l.code === locale.value))

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

async function selectLocale(code: string) {
  if (switching.value || code === currentLocaleCode.value) {
    isOpen.value = false
    return
  }
  switching.value = true
  try {
    await setLocale(code)
    isOpen.value = false
    // 分组名称等内容由后端按请求语言返回，整页刷新让已加载的数据换成新语言
    window.location.reload()
  } finally {
    switching.value = false
  }
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
    triggerRef.value?.focus({ preventScroll: true })
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 150ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(-4px);
}
</style>
