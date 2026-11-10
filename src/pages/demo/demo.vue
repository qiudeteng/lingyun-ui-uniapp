<template>
  <lingyun-app-page
    :title="hostedView?.title || '凌云UI'"
    :show-toolbar="!pageHostState.hideToolbar"
    :body-scroll="hostedView?.bodyScroll ?? true"
    :page-scroll="hostedView?.pageScroll ?? true"
  >
    <!-- #ifdef MP-WEIXIN -->
    <app-page-view-host v-if="pageHostState.path" />
    <!-- #endif -->
    <view v-if="showDirectory" class="directory">
      <view class="hero">
        <text class="hero__title">欢迎来到 凌云UI</text>
        <text class="hero__desc">一套对齐 Apple Liquid Glass 的 uni-app 多端组件库</text>
        <text class="hero__desc">内置 AGENTS.md 协作规约与 design/ 设计规范，对 AI 编码友好：约定清晰、路径对应、自检可循</text>
        <view class="theme-switch">
          <lingyun-segmented-control v-model="themePreference" :items="themeOptions" />
        </view>
        <text class="theme-hint">当前：{{ resolvedLabel }}</text>
      </view>

      <lingyun-section
        v-for="(section, index) in sections"
        :key="section.key"
        :title="section.title"
        :is-last="index === sections.length - 1"
      >
        <lingyun-list>
          <lingyun-list-item
            v-for="item in section.items"
            :key="item.url"
            :title="item.text || ''"
            :note="item.note || ''"
            accessory="disclosure"
            @click="go(item.url || '')"
          />
        </lingyun-list>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useThemeStore } from '@/stores/theme'
  import type { ThemePreference } from '@/utils/theme'
  import { getLingyunDemoHomeGroups } from '@/config/pageTabs'
  import { resolveLingyunPageUrl } from '@/router/pageNav'
  import { openLingyunHostedPage, pageHostState } from '@/router/pageHost'
  import { getLingyunPageView } from '@/router/pageViews'

  const themeStore = useThemeStore()
  const sections = getLingyunDemoHomeGroups()
  const hostedView = computed(() => getLingyunPageView(pageHostState.path))
  const showDirectory = computed(() => !pageHostState.path)

  const themeOptions = [
    { key: 'light', text: '浅色' },
    { key: 'dark', text: '暗黑' },
    { key: 'system', text: '自动' },
  ]

  const themePreference = computed({
    get: (): ThemePreference => themeStore.preference,
    set: (value: string | number) => {
      if (value === 'light' || value === 'dark' || value === 'system') {
        themeStore.setPreference(value)
      }
    },
  })

  const resolvedLabel = computed(() =>
    themeStore.resolved === 'dark' ? '暗黑模式' : '浅色模式',
  )

  function go(url: string): void {
    if (openLingyunHostedPage(url, url)) return
    const next = resolveLingyunPageUrl(url)
    if (!next) return
    if (openLingyunHostedPage(next, url)) return
    uni.navigateTo({ url: next })
  }
</script>

<style lang="scss">
  @import '@/uni_modules/lingyun-ui/styles/variables.scss';

  /*
   * 目录页自己的滚动内容。勿用通用 .page：宽屏宿主里会命中被托管的页面；
   * 背景交给 lingyun-app-page，页面滚动首子已有 min-height: 100vh。
   */
  .directory {
    box-sizing: border-box;
    padding: 0 0 40px;
  }

  .hero {
    padding: 24px 20px 8px;
  }

  .hero__title {
    display: block;
    font-size: 22px;
    font-weight: 600;
    color: var(--lingyun-label, #{$lingyun-main-color});
  }

  .hero__desc {
    display: block;
    margin-top: 8px;
    font-size: 14px;
    color: var(--lingyun-label-secondary, #{$lingyun-base-color});
  }

  .theme-switch {
    margin-top: 20px;
  }

  .theme-hint {
    display: block;
    margin-top: 8px;
    font-size: 12px;
    color: var(--lingyun-label-tertiary, #{$lingyun-secondary-color});
  }
</style>
