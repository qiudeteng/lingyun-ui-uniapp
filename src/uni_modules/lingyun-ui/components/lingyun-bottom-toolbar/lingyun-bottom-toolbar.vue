<template>
  <view class="lingyun-bottom-toolbar" :class="rootClass">
    <view v-if="fixed" class="lingyun-bottom-toolbar__spacer" :style="spacerStyle" />
    <view class="lingyun-bottom-toolbar__card" :style="cardStyle">
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'
import { inject } from 'vue'
import { LINGYUN_APP_PAGE_NAV_INSET } from '../lingyun-app-page/useLingyunAppPageScroll'
import { useLingyunTheme } from '../../utils/theme'

/** 与 lingyun-goods-nav cart 胶囊一致：左右 12，底边 8 */
const EDGE_X_PX = 12
const EDGE_BOTTOM_PX = 8

/**
 * lingyun-bottom-toolbar
 * @description 底部玻璃栏。定位和材质对齐 lingyun-goods-nav 的购物车胶囊，
 * 栏内不预设按钮或排版，内容全部由默认插槽决定。
 *
 * @property {Boolean} fixed 贴底悬浮（默认 true）
 * @property {Boolean} safeArea 底部安全区（默认 true）
 */
defineOptions({
  name: 'LingyunBottomToolbar',
})

const props = defineProps({
  fixed: {
    type: Boolean,
    default: true,
  },
  safeArea: {
    type: Boolean,
    default: true,
  },
})

const instance = getCurrentInstance()

const pageNavInset = inject(LINGYUN_APP_PAGE_NAV_INSET, ref(0))

const safeBottom = ref(0)
const spacerPx = ref(0)
const _resizeHandler = ref<(() => void) | null>(null)
const _measureTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const themeClass = computed((): string => {
  try {
    return useLingyunTheme().rootClass || 'theme-light'
  } catch {
    return 'theme-light'
  }
})

const rootClass = computed((): string[] => {
  return [
    themeClass.value,
    props.fixed ? 'lingyun-bottom-toolbar--fixed' : '',
  ].filter(Boolean)
})

const bottomGapPx = computed((): number => {
  return EDGE_BOTTOM_PX + (props.safeArea ? safeBottom.value : 0)
})

const cardStyle = computed((): Record<string, string> => {
  if (!props.fixed) {
    return {
      margin: `0 ${EDGE_X_PX}px ${bottomGapPx.value}px`,
    }
  }
  const inset = Math.max(0, Number(pageNavInset.value) || 0)
  return {
    left: `${inset + EDGE_X_PX}px`,
    right: `${EDGE_X_PX}px`,
    bottom: `${bottomGapPx.value}px`,
  }
})

const spacerStyle = computed((): Record<string, string> => {
  return { height: `${spacerPx.value}px` }
})

function syncSafe(): void {
  try {
    const info =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    const inset = info && info.safeAreaInsets
    safeBottom.value = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
  } catch {
    safeBottom.value = 0
  }
}

function measure(): void {
  if (!props.fixed) {
    spacerPx.value = 0
    return
  }
  const query = uni.createSelectorQuery().in(instance?.proxy as never)
  query
    .select('.lingyun-bottom-toolbar__card')
    .boundingClientRect((rect) => {
      const box = Array.isArray(rect) ? rect[0] : rect
      const height = box && box.height ? Math.ceil(box.height) : 0
      const next = height > 0 ? height + bottomGapPx.value : 0
      if (next !== spacerPx.value) spacerPx.value = next
    })
    .exec()
}

function scheduleMeasure(): void {
  if (_measureTimer.value) return
  _measureTimer.value = setTimeout(() => {
    _measureTimer.value = null
    measure()
  }, 0)
}

function bindResize(): void {
  if (_resizeHandler.value) return
  const handler = () => {
    syncSafe()
    scheduleMeasure()
  }
  _resizeHandler.value = handler
  try {
    if (typeof uni.onWindowResize === 'function') uni.onWindowResize(handler)
  } catch {
    /* 端不支持 */
  }
}

function unbindResize(): void {
  const handler = _resizeHandler.value
  try {
    if (handler && typeof uni.offWindowResize === 'function') uni.offWindowResize(handler)
  } catch {
    /* 端不支持 */
  }
  _resizeHandler.value = null
}

watch(() => props.fixed, () => {
  scheduleMeasure()
})

watch(() => props.safeArea, () => {
  scheduleMeasure()
})

onMounted(() => {
  syncSafe()
  bindResize()
  scheduleMeasure()
})

onUpdated(() => {
  scheduleMeasure()
})

onBeforeUnmount(() => {
  unbindResize()
  if (_measureTimer.value) {
    clearTimeout(_measureTimer.value)
    _measureTimer.value = null
  }
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

/* 材质与 lingyun-tabbars 同一套控件玻璃。不要改成 surface 的 0.72 / 0.7，那是挡字实底。 */
.lingyun-bottom-toolbar__card {
  box-sizing: border-box;
  width: auto;
  isolation: isolate;
  @include lingyun-glass-control;
  border-radius: 31px;
}

.lingyun-bottom-toolbar--fixed .lingyun-bottom-toolbar__card {
  position: fixed;
  z-index: 900;
}

.lingyun-bottom-toolbar__spacer {
  width: 100%;
}
</style>
