import { computed, onMounted, onUnmounted, ref } from 'vue'

/** 窄屏图例改到底部，避免右侧挤占绘图区 */
const PHONE_MAX_WIDTH = 600

export function useLegendAtBottom() {
  const windowWidth = ref(375)

  function readWindowWidth(override?: number) {
    if (typeof override === 'number' && override > 0) {
      windowWidth.value = override
      return
    }
    try {
      const win =
        typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
      windowWidth.value = Number(win.windowWidth) || 375
    } catch {
      windowWidth.value = 375
    }
  }

  function onWindowResize(res: { size?: { windowWidth?: number }; windowWidth?: number }) {
    const fromSize = Number(res?.size?.windowWidth)
    const direct = Number(res?.windowWidth)
    readWindowWidth(fromSize > 0 ? fromSize : direct)
  }

  onMounted(() => {
    readWindowWidth()
    uni.onWindowResize?.(onWindowResize)
  })

  onUnmounted(() => {
    uni.offWindowResize?.(onWindowResize)
  })

  const legendAtBottom = computed(() => windowWidth.value < PHONE_MAX_WIDTH)
  return { legendAtBottom }
}
