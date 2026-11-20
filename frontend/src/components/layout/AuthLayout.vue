<template>
  <div class="flex min-h-svh flex-col bg-ui-canvas text-ui-ink">
    <header class="border-b border-ui-line">
      <div class="mx-auto flex min-h-16 max-w-7xl items-center px-4 py-2 sm:px-8 lg:px-12">
        <router-link to="/home" class="inline-flex min-h-11 max-w-full items-center gap-3 rounded-md font-semibold">
          <img :src="siteLogo || '/logo.svg'" alt="" class="h-8 w-8 shrink-0 object-contain" />
          <span class="min-w-0 [overflow-wrap:anywhere]">{{ siteName }}</span>
        </router-link>
      </div>
    </header>

    <main class="flex flex-1 flex-col items-center px-4 pb-8 pt-10 sm:px-8 sm:pt-16">
      <div class="auth-panel">
        <slot />
        <div v-if="$slots.footer" class="mt-7 border-t border-ui-line pt-5 text-center text-sm">
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
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import { useI18n } from 'vue-i18n'
import { sanitizeUrl } from '@/utils/url'

const appStore = useAppStore()
const { t } = useI18n()

const siteName = computed(() => appStore.siteName || 'Sub2API')
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const currentYear = computed(() => new Date().getFullYear())

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>
