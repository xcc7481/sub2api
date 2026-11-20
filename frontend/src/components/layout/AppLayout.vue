<template>
  <div class="min-h-screen bg-ui-canvas">
    <a v-if="isDesktop || !appStore.mobileOpen" href="#app-main" class="sr-only z-50 rounded-lg bg-ui-surface px-4 py-2 text-primary-700 focus:not-sr-only focus:fixed focus:left-4 focus:top-3 dark:text-primary-300">
      {{ t('common.skipToContent') }}
    </a>
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div
      class="relative min-h-screen"
      :class="[sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64']"
      :inert="!isDesktop && appStore.mobileOpen"
    >
      <!-- Header -->
      <AppHeader />

      <!-- Main Content -->
      <main id="app-main" tabindex="-1" class="min-w-0 p-4 md:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/styles/onboarding.css'
import { computed, onMounted, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingTour } from '@/composables/useOnboardingTour'
import { useOnboardingStore } from '@/stores/onboarding'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const appStore = useAppStore()
const { t } = useI18n()
const isDesktop = useMediaQuery('(min-width: 1024px)')
const authStore = useAuthStore()
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const isAdmin = computed(() => authStore.user?.role === 'admin')

const { replayTour } = useOnboardingTour({
  storageKey: isAdmin.value ? 'admin_guide' : 'user_guide',
  autoStart: true
})

const onboardingStore = useOnboardingStore()

watch(isDesktop, (desktop) => {
  if (desktop && appStore.mobileOpen) appStore.setMobileOpen(false)
})

onMounted(() => {
  onboardingStore.setReplayCallback(replayTour)
})

defineExpose({ replayTour })
</script>
