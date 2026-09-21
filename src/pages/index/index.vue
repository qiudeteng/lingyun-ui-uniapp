<template>
  <lingyun-app-page title="凌云UI" :show-back="false">
    <view class="page">
      <view class="hero">
        <text class="hero__title">欢迎来到 凌云UI</text>
        <text class="hero__desc">一套对齐 Apple Liquid Glass 的 uni-app 多端组件库</text>
        <text class="hero__desc">内置 AGENTS.md 协作规约与 design/ 设计规范，对 AI 编码友好：约定清晰、路径对应、自检可循</text>
        <view class="theme-switch">
          <lingyun-segmented-control v-model="themePreference" :items="themeOptions" />
        </view>
        <text class="theme-hint">当前：{{ resolvedLabel }}</text>
      </view>

      <lingyun-list
        v-for="section in sections"
        :key="section.title"
        :header="section.title"
        header-type="nested"
      >
        <lingyun-list-item
          v-for="item in section.items"
          :key="item.url"
          :title="item.title"
          :note="item.note"
          accessory="disclosure"
          @click="go(item.url)"
        />
      </lingyun-list>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useThemeStore } from '@/stores/theme'
  import type { ThemePreference } from '@/utils/theme'
  import { LINGYUN_PAGE_NAV } from '@/router/pageNav'

  const themeStore = useThemeStore()
  const sections = LINGYUN_PAGE_NAV

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
    uni.navigateTo({ url })
  }
</script>

<style lang="scss">
  @import '@/uni_modules/lingyun-ui/styles/variables.scss';

  .page {
    padding: 0 0 40px;
    box-sizing: border-box;
    min-height: 100%;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
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
