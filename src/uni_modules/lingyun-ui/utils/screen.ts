/**
 * 全局 `lingyun`：当前屏幕档、系统、是否折叠屏、折叠状态、硬件类型。
 * `app.use(lingyunUi)` 时挂上，模板里可写 `lingyun.os == 'ios'`。
 * 折叠、旋转、拉窗口会改这些字符串，页面上的判断会跟着更新。
 */
import type { App } from 'vue'
import { reactive } from 'vue'
import {
  resolveLingyunSnapshot,
  type LingyunEnv,
  type LingyunScreenInput,
} from './screenResolve'

export type {
  LingyunDevice,
  LingyunEnv,
  LingyunFold,
  LingyunFoldable,
  LingyunOs,
  LingyunScreen,
} from './screenResolve'

export const lingyun = reactive<LingyunEnv>({
  screen: '',
  os: '',
  foldable: '',
  fold: '',
  device: '',
})

let minShort = 0
let maxShort = 0
let listening = false

function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function rememberShort(width: number, height: number): void {
  const short = Math.min(width, height)
  if (!(short > 0)) return
  minShort = minShort > 0 ? Math.min(minShort, short) : short
  maxShort = Math.max(maxShort, short)
}

function readResize(res?: unknown): { windowWidth: number; windowHeight: number } {
  if (!res || typeof res !== 'object') return { windowWidth: 0, windowHeight: 0 }
  const rec = res as {
    size?: { windowWidth?: number; windowHeight?: number }
    windowWidth?: number
    windowHeight?: number
  }
  return {
    windowWidth: num(rec.size && rec.size.windowWidth) || num(rec.windowWidth),
    windowHeight: num(rec.size && rec.size.windowHeight) || num(rec.windowHeight),
  }
}

function readDevice(): Pick<
  LingyunScreenInput,
  'brand' | 'model' | 'osName' | 'platform' | 'system' | 'deviceType'
> {
  const empty = { brand: '', model: '', osName: '', platform: '', system: '', deviceType: '' }
  try {
    const sys =
      typeof uni.getDeviceInfo === 'function' ? uni.getDeviceInfo() : uni.getSystemInfoSync()
    const rec = sys as {
      deviceBrand?: string
      brand?: string
      deviceModel?: string
      model?: string
      osName?: string
      platform?: string
      system?: string
      deviceType?: string
    }
    empty.brand = text(rec.deviceBrand || rec.brand)
    empty.model = text(rec.deviceModel || rec.model)
    empty.osName = text(rec.osName)
    empty.platform = text(rec.platform)
    empty.system = text(rec.system)
    empty.deviceType = text(rec.deviceType)
  } catch {
    /* 端上尚未就绪 */
  }

  // #ifdef H5
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || ''
    const plat = navigator.platform || ''
    if (!empty.model) empty.model = ua
    if (!empty.platform) empty.platform = plat
    if (!empty.system) empty.system = ua
    if (!empty.deviceType && /iPad/.test(ua)) empty.deviceType = 'pad'
    if (!empty.deviceType && /Mac/.test(plat) && navigator.maxTouchPoints > 1) {
      empty.deviceType = 'pad'
      if (!empty.osName) empty.osName = 'ios'
    }
  }
  // #endif

  return empty
}

function readWindow(): Pick<
  LingyunScreenInput,
  'windowWidth' | 'windowHeight' | 'screenWidth' | 'screenHeight'
> {
  const empty = { windowWidth: 0, windowHeight: 0, screenWidth: 0, screenHeight: 0 }
  try {
    const win =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    const rec = win as {
      windowWidth?: number
      windowHeight?: number
      screenWidth?: number
      screenHeight?: number
    }
    empty.windowWidth = num(rec.windowWidth)
    empty.windowHeight = num(rec.windowHeight)
    empty.screenWidth = num(rec.screenWidth)
    empty.screenHeight = num(rec.screenHeight)
  } catch {
    /* 端上尚未就绪 */
  }
  return empty
}

/** 重新读取设备与窗口。折叠回调里的新宽高优先于 getWindowInfo（展开当下经常还是旧值）。 */
export function refreshLingyunScreen(resize?: unknown): void {
  const device = readDevice()
  const win = readWindow()
  const resized = readResize(resize)
  const windowWidth = resized.windowWidth || win.windowWidth
  const windowHeight = resized.windowHeight || win.windowHeight
  rememberShort(windowWidth, windowHeight)
  const next = resolveLingyunSnapshot({
    ...device,
    windowWidth,
    windowHeight,
    screenWidth: win.screenWidth,
    screenHeight: win.screenHeight,
    minShort,
    maxShort,
  })
  lingyun.screen = next.screen
  lingyun.os = next.os
  lingyun.foldable = next.foldable
  lingyun.fold = next.fold
  lingyun.device = next.device
}

/** 挂到模板全局与 `uni.lingyun`，并监听窗口尺寸变化。 */
export function installLingyunScreen(app?: App): void {
  refreshLingyunScreen()
  const host = uni as typeof uni & { lingyun: LingyunEnv }
  host.lingyun = lingyun
  if (app) app.config.globalProperties.lingyun = lingyun
  if (listening) return
  listening = true
  try {
    if (typeof uni.onWindowResize === 'function') {
      uni.onWindowResize((res) => {
        refreshLingyunScreen(res)
      })
    }
  } catch {
    /* 当前端没有这个监听 */
  }
  // #ifdef H5
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      refreshLingyunScreen()
    })
  }
  // #endif
}
