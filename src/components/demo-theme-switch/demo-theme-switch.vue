<template>
  <view v-if="visible" class="demo-theme-switch" :style="rootStyle">
    <lingyun-segmented-control v-model="preference" size="small" :items="items" />
  </view>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1] as { route?: string } | undefined
    const route = String(cur?.route || '').replace(/^\//, '')
    if (route) return route
    /* #ifdef H5 */
    return String(window.location.hash || '').replace(/^#\/?/, '').split('?')[0]
    /* #endif */
    /* #ifndef H5 */
    return ''
    /* #endif */
  }

  function syncRoute(): void {
    if (!currentRoute().startsWith('pages/demo/')) {
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

  function onH5RouteChange(): void {
    syncRoute()
    nextTick(syncH5Top)
  }

  onMounted(() => {
    syncRoute()
    nextTick(syncH5Top)
    /* #ifdef H5 */
    window.addEventListener('hashchange', onH5RouteChange)
    window.addEventListener('resize', syncH5Top)
    /* #endif */
  })
  onShow(syncRoute)
  onHide(release)
  onBeforeUnmount(() => {
    /* #ifdef H5 */
    window.removeEventListener('hashchange', onH5RouteChange)
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
