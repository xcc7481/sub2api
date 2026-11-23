<template>
  <header class="sticky top-0 z-30 border-b border-ui-line bg-ui-surface/80 backdrop-blur-xl backdrop-saturate-150">
    <div class="flex h-16 items-center justify-between gap-2 px-3 sm:px-5 md:px-6">
      <!-- Left: Mobile Menu Toggle + Page Title -->
      <div class="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
        <button
          ref="mobileMenuButton"
          type="button"
          @click="toggleMobileSidebar"
          class="btn btn-ghost btn-icon min-h-11 min-w-11 lg:hidden"
          :aria-label="t('common.toggleMenu')"
          :aria-expanded="appStore.mobileOpen"
          aria-controls="app-sidebar"
        >
          <Icon name="menu" size="md" />
        </button>

        <div class="min-w-0">
          <h1 :title="pageTitle" class="truncate text-base font-semibold tracking-tight text-ui-ink lg:text-lg">
            {{ pageTitle }}
          </h1>
          <p v-if="pageDescription" class="hidden truncate text-xs text-ui-subdued lg:block">
            {{ pageDescription }}
          </p>
        </div>
      </div>

      <!-- Right: Announcements + Docs + Language + Subscriptions + Balance + User Dropdown -->
      <div class="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
        <!-- Announcement Bell -->
        <AnnouncementBell v-if="user" />

        <!-- Docs Link -->
        <a
          v-if="docUrl"
          :href="docUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="hidden min-h-9 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ui-subdued transition-colors hover:bg-ui-muted/80 hover:text-ui-ink sm:flex"
        >
          <Icon name="book" size="sm" aria-hidden="true" />
          <span class="hidden sm:inline">{{ t('nav.docs') }}</span>
        </a>

        <!-- Model Plaza Entry (icon only below sm) -->
        <router-link
          v-if="user && modelPlazaEnabled"
          :to="{ path: '/model-plaza', query: { embedded: '1' } }"
          :title="t('nav.modelPlaza')"
          :aria-label="t('nav.modelPlaza')"
          class="flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ui-subdued transition-colors hover:bg-ui-muted/80 hover:text-ui-ink"
        >
          <Icon name="grid" size="sm" aria-hidden="true" />
          <span class="hidden sm:inline">{{ t('nav.modelPlaza') }}</span>
        </router-link>

        <!-- Language Switcher -->
        <LocaleSwitcher />

        <!-- Subscription Progress (for users with active subscriptions; not mounted at all when the feature is off) -->
        <SubscriptionProgressMini v-if="user && subscriptionFeatureEnabled" />

        <!-- Balance Display (accessible click/keyboard disclosure, not hover-only) -->
        <div
          v-if="user"
          ref="balanceRef"
          class="relative hidden sm:block"
        >
          <button
            ref="balanceButtonRef"
            type="button"
            class="flex min-h-9 items-center gap-2 rounded-lg border border-ui-action/15 bg-ui-selected/85 px-3 py-1.5 text-left transition-colors hover:border-ui-action/30 hover:bg-ui-selected"
            :aria-expanded="balanceOpen"
            aria-controls="header-balance-popover"
            :aria-label="`${t('common.balance')}: ${formatHeaderMoney(availableBalance)}`"
            @click="toggleBalance"
          >
            <svg
              class="h-4 w-4 shrink-0 text-ui-action"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.6"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
              />
            </svg>
            <span class="font-mono text-sm font-semibold tabular-nums text-ui-action">
              {{ formatHeaderMoney(availableBalance) }}
            </span>
            <span
              v-if="frozenBalance > 0"
              class="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
            >
              {{ balanceFrozenLabel }}
            </span>
          </button>

          <transition name="dropdown">
            <div
              v-if="balanceOpen"
              id="header-balance-popover"
              role="region"
              :aria-label="t('common.balance')"
              class="dropdown right-0 mt-2 w-60 p-3.5 text-xs tabular-nums"
            >
              <div class="flex items-center justify-between gap-3">
                <span class="text-ui-subdued">{{ balanceAvailableText }}</span>
                <span class="font-mono font-medium text-ui-ink">{{ formatHeaderMoney(availableBalance) }}</span>
              </div>
              <div class="mt-2 flex items-center justify-between gap-3">
                <span class="text-ui-subdued">{{ balanceFrozenText }}</span>
                <span class="font-mono font-medium text-amber-700 dark:text-amber-300">{{ formatHeaderMoney(frozenBalance) }}</span>
              </div>
              <div class="mt-2.5 border-t border-ui-line pt-2.5">
                <div class="flex items-center justify-between gap-3">
                  <span class="font-medium text-ui-subdued">{{ balanceTotalText }}</span>
                  <span class="font-mono font-semibold text-ui-ink">{{ formatHeaderMoney(totalBalance) }}</span>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- User Dropdown -->
        <div v-if="user" class="relative" ref="dropdownRef">
          <button
            ref="userMenuButtonRef"
            type="button"
            @click="toggleDropdown"
            class="flex min-h-10 items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-ui-muted/80"
            :aria-label="t('common.userMenu')"
            :aria-expanded="dropdownOpen"
            aria-haspopup="menu"
          >
            <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ui-action/20 bg-ui-selected text-xs font-semibold text-ui-action">
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                :alt="displayName"
                class="h-full w-full object-cover"
              >
              <span v-else>{{ userInitials }}</span>
            </div>
            <div class="hidden text-left md:block">
              <div class="max-w-32 truncate text-sm font-medium leading-tight text-ui-ink">
                {{ displayName }}
              </div>
              <div class="text-[11px] leading-tight text-ui-subdued">
                {{ t('admin.users.roles.' + user.role) }}
              </div>
            </div>
            <Icon
              name="chevronDown"
              size="xs"
              class="hidden text-ui-subdued transition-transform duration-150 md:block"
              :class="{ 'rotate-180': dropdownOpen }"
              aria-hidden="true"
            />
          </button>

          <!-- Dropdown Menu -->
          <transition name="dropdown">
            <div v-if="dropdownOpen" role="menu" class="dropdown right-0 mt-2 w-60">
              <!-- User Info -->
              <div class="border-b border-ui-line px-4 py-3">
                <div class="truncate text-sm font-semibold text-ui-ink">
                  {{ displayName }}
                </div>
                <div class="truncate text-xs text-ui-subdued">{{ user.email }}</div>
              </div>

              <!-- Balance (mobile only) -->
              <div class="border-b border-ui-line px-4 py-2.5 sm:hidden">
                <div class="text-xs text-ui-subdued">
                  {{ t('common.balance') }}
                </div>
                <div class="font-mono text-sm font-semibold tabular-nums text-ui-action">
                  {{ formatHeaderMoney(availableBalance) }}
                </div>
                <div v-if="frozenBalance > 0" class="mt-1 font-mono text-xs tabular-nums text-amber-700 dark:text-amber-300">
                  {{ balanceFrozenText }} {{ formatHeaderMoney(frozenBalance) }}
                </div>
              </div>

              <div class="py-1">
                <router-link to="/profile" role="menuitem" @click="closeDropdown" class="dropdown-item">
                  <Icon name="user" size="sm" class="text-ui-subdued" aria-hidden="true" />
                  {{ t('nav.profile') }}
                </router-link>

                <router-link to="/keys" role="menuitem" @click="closeDropdown" class="dropdown-item">
                  <Icon name="key" size="sm" class="text-ui-subdued" aria-hidden="true" />
                  {{ t('nav.apiKeys') }}
                </router-link>

                <a
                  v-if="authStore.isAdmin"
                  href="https://github.com/Wei-Shaw/sub2api"
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  @click="closeDropdown"
                  class="dropdown-item"
                >
                  <svg class="h-4 w-4 text-ui-subdued" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    />
                  </svg>
                  {{ t('nav.github') }}
                </a>
              </div>

              <!-- Contact Support (only show if configured) -->
              <div
                v-if="contactInfo"
                class="border-t border-ui-line px-4 py-2.5"
              >
                <div class="flex items-center gap-2 text-xs text-ui-subdued">
                  <svg
                    class="h-3.5 w-3.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                    />
                  </svg>
                  <span>{{ t('common.contactSupport') }}:</span>
                  <span class="truncate font-medium text-ui-ink">{{ contactInfo }}</span>
                </div>
              </div>

              <div v-if="showOnboardingButton" class="border-t border-ui-line py-1">
                <button type="button" role="menuitem" @click="handleReplayGuide" class="dropdown-item w-full">
                  <svg class="h-4 w-4 text-ui-subdued" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 14a1 1 0 110 2 1 1 0 010-2zm1.07-7.75c0-.6-.49-1.25-1.32-1.25-.7 0-1.22.4-1.43 1.02a1 1 0 11-1.9-.62A3.41 3.41 0 0111.8 5c2.02 0 3.25 1.4 3.25 2.9 0 2-1.83 2.55-2.43 3.12-.43.4-.47.75-.47 1.23a1 1 0 01-2 0c0-1 .16-1.82 1.1-2.7.69-.64 1.82-1.05 1.82-2.06z"
                    />
                  </svg>
                  {{ $t('onboarding.restartTour') }}
                </button>
              </div>

              <div class="border-t border-ui-line py-1">
                <button
                  type="button"
                  role="menuitem"
                  @click="handleLogout"
                  class="dropdown-item w-full text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/35"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  {{ t('nav.logout') }}
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore, useAuthStore, useOnboardingStore } from '@/stores'
import { useAdminSettingsStore } from '@/stores/adminSettings'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import SubscriptionProgressMini from '@/components/common/SubscriptionProgressMini.vue'
import AnnouncementBell from '@/components/common/AnnouncementBell.vue'
import Icon from '@/components/icons/Icon.vue'
import { sanitizeUrl } from '@/utils/url'
import { FeatureFlags, isFeatureFlagEnabled } from '@/utils/featureFlags'
import { resolveRouteMetaKeys } from '@/router/title'
import { resolveSiteBillingMode } from '@/utils/siteBillingMode'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const adminSettingsStore = useAdminSettingsStore()
const onboardingStore = useOnboardingStore()
const mobileMenuButton = ref<HTMLButtonElement | null>(null)

watch(() => appStore.mobileOpen, (open, wasOpen) => {
  if (!open && wasOpen && mobileMenuButton.value?.offsetWidth) {
    mobileMenuButton.value.focus({ preventScroll: true })
  }
}, { flush: 'post' })

const user = computed(() => authStore.user)
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const userMenuButtonRef = ref<HTMLButtonElement | null>(null)
const balanceOpen = ref(false)
const balanceRef = ref<HTMLElement | null>(null)
const balanceButtonRef = ref<HTMLButtonElement | null>(null)

const contactInfo = computed(() => appStore.contactInfo)
const docUrl = computed(() => sanitizeUrl(appStore.docUrl))
const modelPlazaEnabled = computed(() => isFeatureFlagEnabled(FeatureFlags.modelPlaza))
const avatarUrl = computed(() => user.value?.avatar_url?.trim() || '')
const availableBalance = computed(() => Number(user.value?.balance || 0))
const frozenBalance = computed(() => Number(user.value?.frozen_balance || 0))
const totalBalance = computed(() => availableBalance.value + frozenBalance.value)
const balanceAvailableText = computed(() => t('common.availableBalance') === 'common.availableBalance' ? '可用余额' : t('common.availableBalance'))
const balanceFrozenText = computed(() => t('common.frozenBalance') === 'common.frozenBalance' ? '冻结金额' : t('common.frozenBalance'))
const balanceTotalText = computed(() => t('common.totalBalance') === 'common.totalBalance' ? '总余额' : t('common.totalBalance'))
const balanceFrozenLabel = computed(() => `${balanceFrozenText.value} ${formatHeaderMoney(frozenBalance.value)}`)

// 只在标准模式的管理员下显示新手引导按钮
const showOnboardingButton = computed(() => {
  return !authStore.isSimpleMode && user.value?.role === 'admin'
})

const userInitials = computed(() => {
  if (!user.value) return ''
  if (user.value.username) {
    return user.value.username.substring(0, 2).toUpperCase()
  }
  if (user.value.email) {
    const localPart = user.value.email.split('@')[0]
    return localPart.substring(0, 2).toUpperCase()
  }
  return ''
})

const displayName = computed(() => {
  if (!user.value) return ''
  return user.value.username || user.value.email?.split('@')[0] || ''
})

// 订阅功能关闭时不挂载顶栏订阅徽章（组件 onMounted 会拉取订阅接口）。
const subscriptionFeatureEnabled = computed(() => isFeatureFlagEnabled(FeatureFlags.subscription))

// /purchase 的标题/描述随站点计费模式切换，与 document.title 共用同一解析。
const routeMetaKeys = computed(() => resolveRouteMetaKeys(route, {
  billingMode: resolveSiteBillingMode(appStore.cachedPublicSettings),
}))

const pageTitle = computed(() => {
  if (route.name === 'CustomPage') {
    const id = route.params.id as string
    const publicItems = appStore.cachedPublicSettings?.custom_menu_items ?? []
    const menuItem = publicItems.find((item) => item.id === id)
      ?? (authStore.isAdmin ? adminSettingsStore.customMenuItems.find((item) => item.id === id) : undefined)
    if (menuItem?.label) return menuItem.label
  }
  const titleKey = routeMetaKeys.value.titleKey
  if (titleKey) {
    return t(titleKey)
  }
  return (route.meta.title as string) || ''
})

const pageDescription = computed(() => {
  const descKey = routeMetaKeys.value.descriptionKey
  if (descKey) {
    return t(descKey)
  }
  return (route.meta.description as string) || ''
})

function toggleMobileSidebar() {
  appStore.toggleMobileSidebar()
}

function toggleDropdown() {
  balanceOpen.value = false
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}

function toggleBalance() {
  dropdownOpen.value = false
  balanceOpen.value = !balanceOpen.value
}

function closeBalance() {
  balanceOpen.value = false
}

async function handleLogout() {
  closeDropdown()
  try {
    await authStore.logout()
  } catch (error) {
    console.error('Logout error:', error)
  }
  await router.push('/login')
}

function handleReplayGuide() {
  closeDropdown()
  onboardingStore.replay()
}

function formatHeaderMoney(value: number) {
  if (!Number.isFinite(value)) return '$0.00'
  return `$${value.toFixed(2)}`
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    closeDropdown()
  }
  if (balanceRef.value && !balanceRef.value.contains(target)) {
    closeBalance()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (dropdownOpen.value) {
    closeDropdown()
    userMenuButtonRef.value?.focus({ preventScroll: true })
  }
  if (balanceOpen.value) {
    closeBalance()
    balanceButtonRef.value?.focus({ preventScroll: true })
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
