<template>
  <div class="flex min-h-svh flex-col bg-ui-canvas text-ui-ink">
    <header class="border-b border-ui-line bg-ui-surface/80 backdrop-blur-xl backdrop-saturate-150">
      <div class="mx-auto flex min-h-16 max-w-[78rem] items-center justify-between gap-3 px-4 py-2 sm:px-8 lg:px-12">
        <router-link
          to="/home"
          class="inline-flex min-h-10 min-w-0 items-center gap-2.5 rounded-lg text-sm font-semibold tracking-tight text-ui-ink transition-colors hover:text-ui-action"
        >
          <img :src="siteLogo || '/logo.svg'" alt="" class="h-7 w-7 shrink-0 rounded-lg object-contain" />
          <span class="min-w-0 truncate">{{ siteName }}</span>
        </router-link>

        <div class="flex shrink-0 items-center gap-1">
          <LocaleSwitcher />
          <button
            type="button"
            class="btn btn-ghost btn-icon"
            :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
            :aria-label="isDark ? t('home.switchToLight') : t('home.switchToDark')"
            @click="toggleTheme"
          >
            <Icon :name="isDark ? 'sun' : 'moon'" size="md" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>

    <main class="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
      <div class="auth-panel">
        <slot />
        <div v-if="$slots.footer" class="mt-6 border-t border-ui-line pt-5 text-center text-sm text-ui-subdued">
          <slot name="footer" />
        </div>
      </div>
      <p class="mt-6 max-w-md break-words text-center text-xs text-ui-subdued">
        &copy; {{ currentYear }} {{ siteName }}. {{ t('home.footer.allRightsReserved') }}
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '@/stores'
import { useI18n } from 'vue-i18n'
import { sanitizeUrl } from '@/utils/url'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'

const appStore = useAppStore()
const { t } = useI18n()

const siteName = computed(() => appStore.siteName || 'Sub2API')
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const currentYear = computed(() => new Date().getFullYear())
const isDark = ref(document.documentElement.classList.contains('dark'))

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>
