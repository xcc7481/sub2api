<template>
  <div v-if="hasHomeContent" class="min-h-screen">
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContent.trim()"
      class="h-screen w-full border-0"
      allowfullscreen
    ></iframe>
    <!-- Custom full-page HTML is supplied by an administrator. -->
    <div v-else v-html="homeContent"></div>
  </div>

  <div
    v-else
    :data-testid="compactHomeEnabled ? 'compact-home' : undefined"
    class="flex min-h-screen flex-col bg-ui-canvas text-ui-ink"
  >
    <header class="sticky top-0 z-20 border-b border-ui-line bg-ui-surface/80 backdrop-blur-xl backdrop-saturate-150">
      <nav class="gateway-container flex min-h-16 flex-wrap items-center justify-between gap-2 py-2 lg:min-h-[4.25rem]">
        <div class="flex min-w-0 flex-1 basis-24 items-center gap-2.5">
          <img :src="siteLogo || '/logo.svg'" alt="" class="h-7 w-7 shrink-0 rounded-lg object-contain" />
          <span :title="siteName" class="truncate text-sm font-semibold tracking-tight text-ui-ink">{{ siteName }}</span>
        </div>
        <div class="ml-auto flex max-w-full flex-wrap items-center justify-end gap-1 sm:gap-1.5">
          <LocaleSwitcher />
          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-icon"
            :title="t('home.viewDocs')"
            :aria-label="t('home.viewDocs')"
          >
            <Icon name="book" size="md" aria-hidden="true" />
          </a>
          <router-link
            v-if="showModelPlazaEntry"
            to="/model-plaza"
            class="btn btn-ghost min-h-10 px-2.5"
            :title="t('nav.modelPlaza')"
            :aria-label="t('nav.modelPlaza')"
          >
            <Icon name="grid" size="md" aria-hidden="true" />
            <span class="hidden sm:inline">{{ t('nav.modelPlaza') }}</span>
          </router-link>
          <button
            type="button"
            class="btn btn-ghost btn-icon"
            :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
            :aria-label="isDark ? t('home.switchToLight') : t('home.switchToDark')"
            @click="toggleTheme"
          >
            <Icon :name="isDark ? 'sun' : 'moon'" size="md" aria-hidden="true" />
          </button>
          <router-link
            :to="isAuthenticated ? dashboardPath : '/login'"
            class="btn btn-secondary min-h-10 py-2"
          >
            {{ isAuthenticated ? t('home.dashboard') : t('home.login') }}
          </router-link>
        </div>
      </nav>
    </header>

    <main v-if="compactHomeEnabled" class="flex min-w-0 flex-1 items-center justify-center px-5 py-16 sm:px-8">
      <div class="min-w-0 max-w-xl text-center">
        <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-ui-line bg-ui-surface p-2 shadow-card">
          <img :src="siteLogo || '/logo.svg'" alt="" class="h-full w-full rounded-xl object-contain" />
        </div>
        <h1 class="break-words text-4xl font-semibold tracking-tight text-ui-ink sm:text-5xl">{{ siteName }}</h1>
        <p class="mx-auto mt-4 max-w-prose whitespace-pre-wrap break-words text-base leading-relaxed text-ui-subdued">
          {{ siteSubtitle }}
        </p>
        <router-link :to="isAuthenticated ? dashboardPath : '/login'" class="btn btn-primary btn-lg mt-8">
          {{ isAuthenticated ? t('home.goToDashboard') : t('home.login') }}
          <Icon name="arrowRight" size="sm" aria-hidden="true" />
        </router-link>
      </div>
    </main>

    <main v-else class="gateway-container flex-1">
      <section class="gateway-hero">
        <div class="min-w-0">
          <p class="gateway-eyebrow">
            <span class="h-1.5 w-1.5 rounded-full bg-ui-action" aria-hidden="true"></span>
            <span>{{ t('home.gatewayBadge') }}</span>
          </p>
          <h1 class="gateway-heading">
            {{ t('home.gatewayTitle') }}
            <span class="block text-ui-action">{{ t('home.gatewayTitleAccent') }}</span>
          </h1>
          <p class="gateway-intro">
            {{ siteSubtitle }}
          </p>
          <div class="mt-7 flex flex-wrap items-center gap-3">
            <router-link :to="isAuthenticated ? dashboardPath : '/login'" class="btn btn-primary btn-lg">
              {{ isAuthenticated ? t('home.goToDashboard') : t('home.getStarted') }}
              <Icon name="arrowRight" size="sm" aria-hidden="true" />
            </router-link>
            <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-lg">
              {{ t('home.viewDocs') }}
              <Icon name="externalLink" size="sm" aria-hidden="true" />
            </a>
          </div>

          <section aria-labelledby="home-providers-title" class="gateway-models">
            <h2 id="home-providers-title" class="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-ui-subdued">
              {{ t('home.providers.title') }}
            </h2>
            <ul class="flex flex-wrap items-center gap-x-5 gap-y-2">
              <li
                v-for="provider in providers"
                :key="provider"
                class="flex items-center gap-2 text-sm font-medium text-ui-ink"
              >
                <span class="h-1 w-1 rounded-full bg-ui-control-hover" aria-hidden="true"></span>
                <span>{{ t(`home.providers.${provider}`) }}</span>
              </li>
            </ul>
          </section>
        </div>

        <figure class="gateway-request">
          <figcaption class="gateway-request-caption">{{ t('home.apiExample') }}</figcaption>
          <div class="gateway-protocol-tabs" role="tablist" :aria-label="t('home.apiExample')">
            <button
              v-for="example in protocolExamples"
              :key="example.id"
              type="button"
              role="tab"
              :aria-selected="activeProtocolId === example.id"
              class="gateway-protocol-tab"
              :class="{ 'gateway-protocol-tab-active': activeProtocolId === example.id }"
              @click="selectProtocol(example.id)"
            >
              {{ example.label }}
            </button>
          </div>
          <div class="gateway-request-body">
            <div class="flex flex-wrap items-center gap-2.5 border-b border-ui-line/80 pb-3 font-semibold">
              <span class="gateway-request-method">{{ activeProtocol.method }}</span>
              <code class="break-all text-ui-ink">{{ activeProtocol.endpoint }}</code>
            </div>
            <pre><code><span v-for="(part, index) in activeRequestParts" :key="index" :class="part.style">{{ part.text }}</span></code></pre>
          </div>
          <div class="gateway-request-footer">
            <span class="font-mono text-xs text-ui-subdued">application/json</span>
            <button type="button" class="gateway-copy" @click="copyRequest" aria-live="polite">
              <Icon :name="copied && !copyFailed ? 'check' : 'copy'" size="sm" aria-hidden="true" />
              {{ copyFailed ? t('common.copyFailed') : copied ? t('common.copied') : t('home.copyRequest') }}
            </button>
          </div>
        </figure>
      </section>

      <section aria-labelledby="home-features-title" class="gateway-features">
        <div class="min-w-0">
          <p class="font-mono text-xs uppercase tracking-[0.1em] text-ui-action">01 — 03</p>
          <h2 id="home-features-title" class="mt-2 text-2xl font-semibold tracking-tight text-ui-ink sm:text-[1.75rem]">
            {{ t('home.features.title') }}
          </h2>
        </div>
        <div class="grid min-w-0 gap-y-6 sm:grid-cols-3 sm:gap-x-8">
          <article
            v-for="(feature, idx) in features"
            :key="feature.title"
            class="gateway-feature-item"
          >
            <div class="mb-3 flex items-center justify-between gap-2">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-ui-line bg-ui-surface text-ui-action shadow-card">
                <Icon :name="feature.icon" size="sm" aria-hidden="true" />
              </div>
              <span class="font-mono text-xs font-medium text-ui-subdued">0{{ idx + 1 }}</span>
            </div>
            <h3 class="text-base font-semibold tracking-tight text-ui-ink">
              {{ t(`home.features.${feature.title}`) }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-ui-subdued">
              {{ t(`home.features.${feature.description}`) }}
            </p>
          </article>
        </div>
      </section>
    </main>

    <footer class="border-t border-ui-line bg-ui-surface/40">
      <div
        class="gateway-container py-5 text-xs text-ui-subdued"
        :class="{ 'text-center': compactHomeEnabled }"
      >
        <p class="break-words">
          &copy; {{ currentYear }} {{ siteName }}<template v-if="!compactHomeEnabled">. {{ t('home.footer.allRightsReserved') }}</template>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { sanitizeUrl } from '@/utils/url'
import { FeatureFlags, isFeatureFlagEnabled } from '@/utils/featureFlags'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copyToClipboard } = useClipboard({ notify: false })
const copyFailed = ref(false)

const authStore = useAuthStore()
const appStore = useAppStore()

// Site settings - directly from appStore (already initialized from injected config)
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Sub2API')
const siteLogo = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const siteSubtitle = computed(() => {
  const subtitle = appStore.cachedPublicSettings?.site_subtitle?.trim()
  return subtitle && subtitle !== 'Subscription to API Conversion Platform'
    ? subtitle
    : t('home.heroDescription')
})
const docUrl = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.doc_url || appStore.docUrl || ''))
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')
const hasHomeContent = computed(() => homeContent.value.trim().length > 0)
const compactHomeEnabled = computed(() => appStore.cachedPublicSettings?.compact_home_enabled === true)
const modelPlazaEnabled = computed(() => isFeatureFlagEnabled(FeatureFlags.modelPlaza))

// Check if homeContent is a URL (for iframe display)
const isHomeContentUrl = computed(() => {
  const content = homeContent.value.trim()
  return content.startsWith('http://') || content.startsWith('https://')
})

// Theme
const isDark = ref(document.documentElement.classList.contains('dark'))

// Auth state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const modelPlazaRequiresAuth = computed(
  () => appStore.cachedPublicSettings?.model_plaza_require_auth === true,
)
const showModelPlazaEntry = computed(
  () => modelPlazaEnabled.value && (isAuthenticated.value || !modelPlazaRequiresAuth.value),
)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => isAdmin.value ? '/admin/dashboard' : '/dashboard')

const features = [
  { icon: 'server', title: 'unifiedGateway', description: 'unifiedGatewayDesc' },
  { icon: 'users', title: 'multiAccount', description: 'multiAccountDesc' },
  { icon: 'chart', title: 'balanceQuota', description: 'balanceQuotaDesc' }
] as const

const providers = ['claude', 'gpt', 'gemini', 'antigravity'] as const

interface ProtocolExample {
  id: 'anthropic' | 'openai' | 'gemini'
  label: string
  method: string
  endpoint: string
  body: string
}

const protocolExamples: readonly ProtocolExample[] = [
  {
    id: 'anthropic',
    label: 'Anthropic',
    method: 'POST',
    endpoint: '/v1/messages',
    body: `{
  "model": "YOUR_MODEL",
  "max_tokens": 256,
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}`
  },
  {
    id: 'openai',
    label: 'OpenAI',
    method: 'POST',
    endpoint: '/v1/responses',
    body: `{
  "model": "YOUR_MODEL",
  "input": "Hello!"
}`
  },
  {
    id: 'gemini',
    label: 'Gemini',
    method: 'POST',
    endpoint: '/v1beta/models/YOUR_MODEL:generateContent',
    body: `{
  "contents": [
    { "role": "user", "parts": [{ "text": "Hello!" }] }
  ]
}`
  }
]

const activeProtocolId = ref<ProtocolExample['id']>('anthropic')
const activeProtocol = computed(
  () => protocolExamples.find((p) => p.id === activeProtocolId.value) ?? protocolExamples[0]
)

const activeRequestParts = computed(() =>
  activeProtocol.value.body.split(/("[^"]*")/).map((text, index, parts) => ({
    text,
    style:
      index % 2 === 0
        ? undefined
        : parts[index + 1]?.startsWith(':')
          ? 'text-ui-action font-medium'
          : 'text-ui-subdued'
  }))
)

function selectProtocol(id: ProtocolExample['id']) {
  activeProtocolId.value = id
  copyFailed.value = false
}

async function copyRequest() {
  copyFailed.value = !(await copyToClipboard(activeProtocol.value.body))
}

// Current year for footer
const currentYear = computed(() => new Date().getFullYear())

// Toggle theme
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
}

onMounted(() => {
  initTheme()

  // Check auth state
  authStore.checkAuth()

  // Ensure public settings are loaded (will use cache if already loaded from injected config)
  if (!appStore.publicSettingsLoaded) {
    appStore.fetchPublicSettings()
  }
})
</script>
