/**
 * 导航已停靠时，从当前页打开另一个已有页面：只盖住导航右侧的内容区，从右滑入。
 * 手机（导航未停靠）同一次调用走 navigateTo。
 * 页面组件由宿主注册。本文件不导入宿主页面。
 */
import { defineAsyncComponent, inject, reactive, type Component } from 'vue'
import {
  normalizeLingyunPagePath,
  openLingyunHostedPage,
  resolveLingyunPageUrl,
} from './pageNavAdapter'
import { LINGYUN_SCREEN_PAD_MIN } from './screenResolve'

export const LINGYUN_APP_PAGE_EMBEDDED = Symbol('lingyun-app-page-embedded')
export const LINGYUN_IN_CONTENT_COVER = Symbol('lingyun-in-content-cover')
export const LINGYUN_CONTENT_COVER_PATH = Symbol('lingyun-content-cover-path')

/** 当前组件是否画在内容区盖层里。盖层里的返回应关掉这一层，而不是 navigateBack。 */
export function useLingyunInContentCover(): boolean {
  return inject(LINGYUN_IN_CONTENT_COVER, false)
}

const LEAVE_MS = 340

export type LingyunContentCoverLayer = {
  key: number
  path: string
  url: string
}

const views = new Map<string, Component>()
let uidSeq = 0
let layerSeq = 0
let closeTimer: ReturnType<typeof setTimeout> | null = null

export const lingyunContentCover = reactive({
  navDocked: false,
  hostUid: 0,
  leaving: false,
  layers: [] as LingyunContentCoverLayer[],
})

export function nextLingyunContentCoverUid(): number {
  uidSeq += 1
  return uidSeq
}

/** 当前可见、且导航已停靠的页面壳登记为盖层宿主。 */
export function bindLingyunContentCoverHost(uid: number, docked: boolean): void {
  lingyunContentCover.navDocked = docked
  if (docked) lingyunContentCover.hostUid = uid
}

/**
 * 宿主启动时注册可盖入的页面。
 * 传入 import.meta.glob 的页面表，由 Vite 在宿主侧解析，组件包不引用这些文件。
 */
export function installLingyunContentCovers(
  modules: Record<string, () => Promise<unknown>>,
): void {
  // 小程序不支持 defineAsyncComponent，动态页面会变成 wx://not-found。盖层只在 H5 / App 注册。
  // #ifndef MP
  Object.keys(modules).forEach((file) => {
    const normalized = file.replace(/\\/g, '/')
    // 主包 pages/ 与分包 pagesStore、pagesEnterprise 等，路径都要能对上路由
    const matched = normalized.match(/(?:^|\/)((?:pages[A-Za-z]*)\/.+)\.vue$/)
    if (!matched) return
    const loader = modules[file]
    if (!loader) return
    views.set(
      matched[1],
      defineAsyncComponent(() =>
        loader().then((mod) => {
          const resolved = mod as { default?: Component }
          return resolved.default || (mod as Component)
        }),
      ),
    )
  })
  // #endif
}

export function getLingyunContentCoverView(path: string): Component | null {
  return views.get(normalizeLingyunPagePath(path)) || null
}

function windowWidth(): number {
  try {
    const info =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    return Number(info.windowWidth) || 0
  } catch {
    return 0
  }
}

/** 小程序不能用动态组件画盖层，导航已停靠时改走页内宿主。 */
function isMiniProgramCover(): boolean {
  let miniProgram = false
  // #ifdef MP
  miniProgram = true
  // #endif
  return miniProgram
}

function finishClose(): void {
  lingyunContentCover.layers.pop()
  lingyunContentCover.leaving = false
}

/**
 * 打开一个已有页面。
 * 导航停靠（窗口 ≥ 690 且左侧导航在）时压入内容区盖层，不 navigateTo。
 * 否则打开独立页面。
 */
export function openLingyunContentCover(url: string): void {
  const raw = String(url || '')
  const next = resolveLingyunPageUrl(raw) || (raw.startsWith('/') ? raw : `/${raw}`)
  const path = normalizeLingyunPagePath(next)
  const docked =
    lingyunContentCover.navDocked && windowWidth() >= LINGYUN_SCREEN_PAD_MIN
  if (!docked || !path) {
    if (next) uni.navigateTo({ url: next })
    return
  }
  if (isMiniProgramCover()) {
    if (openLingyunHostedPage(next, next)) return
    uni.navigateTo({ url: next })
    return
  }
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
    finishClose()
  }
  lingyunContentCover.leaving = false
  layerSeq += 1
  lingyunContentCover.layers.push({ key: layerSeq, path, url: next })
}

/** 关掉最上面一层。动画结束后才从栈里拿掉。 */
export function closeLingyunContentCover(): void {
  if (!lingyunContentCover.layers.length || lingyunContentCover.leaving) return
  lingyunContentCover.leaving = true
  closeTimer = setTimeout(() => {
    closeTimer = null
    finishClose()
  }, LEAVE_MS)
}
