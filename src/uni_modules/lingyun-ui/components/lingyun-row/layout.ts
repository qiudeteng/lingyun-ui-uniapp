import { reactive } from 'vue'

/**
 * 24 分栏的断点，对齐 Element Plus Layout。
 * xs 为宽度小于 sm。判断用窗口宽度，不用 CSS 媒体查询（微信里媒体查询看的是整屏）。
 */
export const LINGYUN_LAYOUT_BREAKPOINT = {
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1920,
} as const

export type LingyunColProp = 'span' | 'offset' | 'push' | 'pull'

export type LingyunColSize = Partial<Record<LingyunColProp, number>>

export type LingyunColSetting = number | LingyunColSize | null | undefined

export const layoutViewport = reactive({ width: 0 })

let listening = false

function positive(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function widthFromResize(res?: unknown): number {
  if (!res || typeof res !== 'object') return 0
  const rec = res as { size?: { windowWidth?: number }; windowWidth?: number }
  return positive(rec.size && rec.size.windowWidth) || positive(rec.windowWidth)
}

export function readLayoutWidth(): number {
  try {
    const win =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    const width = positive((win as { windowWidth?: number }).windowWidth)
    if (width > 0) layoutViewport.width = width
  } catch {
    /* 端上尚未就绪 */
  }
  return layoutViewport.width
}

/** 监听窗口变化。多列共用这一份宽度。 */
export function watchLayoutWidth(): void {
  readLayoutWidth()
  if (listening) return
  listening = true
  try {
    if (typeof uni.onWindowResize === 'function') {
      uni.onWindowResize((res) => {
        const width = widthFromResize(res)
        if (width > 0) layoutViewport.width = width
        else readLayoutWidth()
      })
    }
  } catch {
    /* 当前端没有这个监听 */
  }
  // #ifdef H5
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      readLayoutWidth()
    })
  }
  // #endif
}

function applySize(setting: LingyunColSetting, prop: LingyunColProp, fallback: number): number {
  if (setting == null) return fallback
  if (typeof setting === 'number') return prop === 'span' ? setting : fallback
  const next = setting[prop]
  return typeof next === 'number' && Number.isFinite(next) ? next : fallback
}

/**
 * 当前窗口下这一列的 span / offset / push / pull。
 * 大档覆盖小档，和 Element Plus 的 min-width 媒体查询相同。xs 只在小于 768 时生效。
 */
export function resolveColProp(
  width: number,
  prop: LingyunColProp,
  base: number,
  xs: LingyunColSetting,
  sm: LingyunColSetting,
  md: LingyunColSetting,
  lg: LingyunColSetting,
  xl: LingyunColSetting,
): number {
  let value = Number.isFinite(base) ? base : prop === 'span' ? 24 : 0
  if (!(width > 0)) return value
  if (width < LINGYUN_LAYOUT_BREAKPOINT.sm) value = applySize(xs, prop, value)
  const tiers: Array<[number, LingyunColSetting]> = [
    [LINGYUN_LAYOUT_BREAKPOINT.sm, sm],
    [LINGYUN_LAYOUT_BREAKPOINT.md, md],
    [LINGYUN_LAYOUT_BREAKPOINT.lg, lg],
    [LINGYUN_LAYOUT_BREAKPOINT.xl, xl],
  ]
  for (const [min, setting] of tiers) {
    if (width >= min) value = applySize(setting, prop, value)
  }
  return value
}
