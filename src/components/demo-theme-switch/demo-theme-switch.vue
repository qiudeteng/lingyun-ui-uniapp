<template>
  <view v-if="visible" class="demo-theme-switch" :style="rootStyle">
    <lingyun-segmented-control v-model="preference" size="small" :items="items" />
  </view>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
  import { onHide, onShow } from '@dcloudio/uni-app'
  import router from '@/router'
  import { useThemeStore } from '@/stores/theme'
  import type { ThemePreference } from '@/utils/theme'
  import { demoThemeSwitchOwners } from './owners'

  /** H5 的 uni.navigateTo 走 history.pushState，不触发 hashchange，须订阅路由实例 */
  let stopRouteChange: (() => void) | null = null

  const items = [
    { key: 'light', text: '浅色' },
    { key: 'dark', text: '暗黑' },
    { key: 'system', text: '自动' },
  ]

  const id = Symbol('demo-theme-switch')
  const themeStore = useThemeStore()
  const topPx = ref<number | null>(null)

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
  const rootStyle = computed(() => (
    topPx.value == null ? {} : { top: `${topPx.value}px` }
  ))

  function currentRoute(): string {
    /* #ifdef H5 */
    // H5 路由变化时 getCurrentPages() 可能还是旧页面，优先读地址栏
    const hash = String(window.location.hash || '').replace(/^#\/?/, '').split('?')[0]
    if (hash) return hash
    /* #endif */
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1] as { route?: string } | undefined
    return String(cur?.route || '').replace(/^\//, '')
  }

  function syncRoute(route = currentRoute()): void {
    const path = String(route || '').replace(/^\//, '').split('?')[0]
    if (!path.startsWith('pages/demo/')) {
      release()
      return
    }
    if (demoThemeSwitchOwners.value.includes(id)) return
    demoThemeSwitchOwners.value = [...demoThemeSwitchOwners.value, id]
  }

  function release(): void {
    if (!demoThemeSwitchOwners.value.includes(id)) return
    demoThemeSwitchOwners.value = demoThemeSwitchOwners.value.filter((item) => item !== id)
  }

  function syncH5Top(): void {
    /* #ifdef H5 */
    const toolbar = typeof document === 'undefined'
      ? null
      : document.querySelector('.lingyun-toolbars')
    const bottom = toolbar ? toolbar.getBoundingClientRect().bottom : 60
    topPx.value = Math.max(0, bottom) + 8
    /* #endif */
  }

  function applyRoute(route?: string): void {
    syncRoute(route || currentRoute())
    nextTick(syncH5Top)
  }

  /** 路由事件触发时地址栏 hash 可能还没更新，新路由直接用 to.path */
  function onRouterRouteChange(to: { path?: string }): void {
    applyRoute(to?.path)
  }

  function onHashChange(): void {
    applyRoute()
  }

  onMounted(() => {
    applyRoute()
    stopRouteChange = router.onRouteChange(onRouterRouteChange)
    /* #ifdef H5 */
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('resize', syncH5Top)
    /* #endif */
  })
  onShow(syncRoute)
  onHide(release)
  onBeforeUnmount(() => {
    stopRouteChange?.()
    stopRouteChange = null
    /* #ifdef H5 */
    window.removeEventListener('hashchange', onHashChange)
    window.removeEventListener('resize', syncH5Top)
    /* #endif */
    release()
  })
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
