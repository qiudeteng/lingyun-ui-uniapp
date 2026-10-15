<template>
  <view v-if="visible" class="demo-theme-switch">
    <lingyun-segmented-control v-model="preference" size="small" :items="items" />
  </view>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount } from 'vue'
  import { onHide, onShow } from '@dcloudio/uni-app'
  import { useThemeStore } from '@/stores/theme'
  import type { ThemePreference } from '@/utils/theme'
  import { demoThemeSwitchOwners } from './owners'

  const items = [
    { key: 'light', text: '浅色' },
    { key: 'dark', text: '暗黑' },
    { key: 'system', text: '自动' },
  ]

  const id = Symbol('demo-theme-switch')
  const themeStore = useThemeStore()

  const preference = computed({
    get: (): ThemePreference => themeStore.preference,
    set: (value: string | number) => {
      if (value === 'light' || value === 'dark' || value === 'system') {
        themeStore.setPreference(value)
      }
    },
  })

  const visible = computed(
    () => demoThemeSwitchOwners.value[demoThemeSwitchOwners.value.length - 1] === id,
  )

  function currentRoute(): string {
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1] as { route?: string } | undefined
    return String(cur?.route || '').replace(/^\//, '')
  }

  function claim(): void {
    if (!currentRoute().startsWith('pages/demo/')) return
    if (demoThemeSwitchOwners.value.includes(id)) return
    demoThemeSwitchOwners.value = [...demoThemeSwitchOwners.value, id]
  }

  function release(): void {
    if (!demoThemeSwitchOwners.value.includes(id)) return
    demoThemeSwitchOwners.value = demoThemeSwitchOwners.value.filter((item) => item !== id)
  }

  onShow(claim)
  onHide(release)
  onBeforeUnmount(release)
</script>

<style lang="scss">
  .demo-theme-switch {
    position: fixed;
    z-index: 40;
    top: calc(var(--lingyun-app-page-inset-top, 88px) + 8px);
    right: 12px;
    width: 168px;
  }
</style>
