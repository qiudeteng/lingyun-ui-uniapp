<template>
  <scroll-view
    class="lingyun-refresh"
    :style="scrollerStyle"
    scroll-y
    :refresher-enabled="enabled"
    :refresher-triggered="refreshing"
    :refresher-threshold="threshold"
    :refresher-background="resolvedRefresherBg"
    :refresher-default-style="resolvedRefresherStyle"
    :show-scrollbar="false"
    @refresherrefresh="onRefresh"
    @refresherrestore="onRestore"
    @refresherabort="onRestore"
  >
    <slot />
  </scroll-view>
</template>

<script>
import { useThemeStore } from '@/stores/theme'

/**
 * lingyun-refresh
 * @description 包装 scroll-view refresher；暗黑下须设 refresher-background（默认白）
 * @see design/REFRESH.md
 */
export default {
  name: 'LingyunRefresh',
  emits: ['update:refreshing', 'refresh'],
  props: {
    refreshing: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },
    threshold: { type: Number, default: 45 },
    height: { type: [String, Number], default: '100%' },
    /** 覆盖下拉区背景；空则跟主题 Grouped Primary */
    refresherBackground: { type: String, default: '' },
    /** black | white | none；空则跟主题自动选 */
    refresherDefaultStyle: { type: String, default: '' },
  },
  computed: {
    isDark() {
      try {
        return useThemeStore().resolved === 'dark'
      } catch {
        return false
      }
    },
    resolvedRefresherBg() {
      if (this.refresherBackground) return this.refresherBackground
      return this.isDark ? '#000000' : '#f2f2f7'
    },
    resolvedRefresherStyle() {
      if (this.refresherDefaultStyle) return this.refresherDefaultStyle
      // 微信：black=深色菊花（浅底），white=浅色菊花（深底）
      return this.isDark ? 'white' : 'black'
    },
    scrollerStyle() {
      const h = this.height
      return {
        height: typeof h === 'number' ? `${h}px` : h || '100%',
        backgroundColor: this.resolvedRefresherBg,
      }
    },
  },
  methods: {
    onRefresh() {
      this.$emit('update:refreshing', true)
      this.$emit('refresh')
    },
    onRestore() {
      /* 由业务把 refreshing 设回 false */
    },
  },
}
</script>

<style lang="scss">
.lingyun-refresh {
  width: 100%;
  box-sizing: border-box;
}
</style>
