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

<script setup lang="ts">
import { computed } from 'vue'
import { type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'

/**
 * lingyun-refresh
 * @description 包装 scroll-view refresher；暗黑下须设 refresher-background（默认白）
 * @see design/REFRESH.md
 */
defineOptions({
  name: 'LingyunRefresh',
})

const props = defineProps({
  refreshing: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },
  threshold: { type: Number, default: 45 },
  height: { type: [String, Number] as PropType<string | number>, default: '100%' },
  /** 覆盖下拉区背景；空则跟主题 Grouped Primary */
  refresherBackground: { type: String, default: '' },
  /** black | white | none；空则跟主题自动选 */
  refresherDefaultStyle: { type: String, default: '' },
})

const emit = defineEmits(['update:refreshing', 'refresh'])

const isDark = computed(() => {
  try {
    return useLingyunTheme().resolved === 'dark'
  } catch {
    return false
  }
})

const resolvedRefresherBg = computed(() => {
  if (props.refresherBackground) return props.refresherBackground
  return isDark.value ? '#000000' : '#f2f2f7'
})

const resolvedRefresherStyle = computed(() => {
  if (props.refresherDefaultStyle) return props.refresherDefaultStyle
  // 微信：black=深色菊花（浅底），white=浅色菊花（深底）
  return isDark.value ? 'white' : 'black'
})

const scrollerStyle = computed(() => {
  const h = props.height
  return {
    height: typeof h === 'number' ? `${h}px` : h || '100%',
    backgroundColor: resolvedRefresherBg.value,
  }
})

function onRefresh() {
  emit('update:refreshing', true)
  emit('refresh')
}

function onRestore() {
  /* 由业务把 refreshing 设回 false */
}
</script>

<style lang="scss">
.lingyun-refresh {
  width: 100%;
  box-sizing: border-box;
}
</style>
