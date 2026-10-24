import { toRef } from 'vue'
import {
  configureLingyunPageNav,
  setLingyunLayoutOverride,
  setLingyunPageConfig,
  type LingyunDuoPose,
} from '@/uni_modules/lingyun-ui'
import { DEMO_PAGE_CONFIG } from './pageTabs'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { pageRequiresLogin } from '@/router/guards'
import {
  LINGYUN_PAGE_NAV_GUEST_HOME,
  LINGYUN_PAGE_NAV_HOME,
  clearLingyunPageNavIntent,
  getLingyunPageNavIntent,
  getLingyunPageNavProfile,
  getLingyunPageNavScrollTop,
  getLingyunPageNavSections,
  resolveLingyunPageUrl,
  setLingyunPageNavIntent,
  setLingyunPageNavScrollTop,
  useLingyunPageNavIntent,
} from '@/router/pageNav'
import {
  clearLingyunPageHost,
  ensureLingyunWidePageHost,
  hostedFromText,
  hostedPagePath,
  isLingyunTabHostRoute,
  openLingyunHostedPage,
  openLingyunTabHostPage,
  pageHostState,
} from '@/router/pageHost'

const PREVIEW_DUO_POSES = new Set<string>([
  'outer-portrait',
  'outer-landscape',
  'inner-portrait',
  'inner-portrait-folded',
  'inner-landscape',
  'inner-landscape-folded',
])

/**
 * 文档预览 iframe 的原生滚动条会占 15px，隐藏后补一个不占布局的悬浮指示条。
 * 仅 iframe 预览环境调用；正常 H5 / 小程序不受影响。
 */
function installLingyunPreviewScrollbar(): void {
  // #ifdef H5
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  if (document.querySelector('.lingyun-preview-scrollbar')) return
  const attach = (): void => {
    if (!document.body) return
    const rail = document.createElement('div')
    rail.className = 'lingyun-preview-scrollbar'
    const thumb = document.createElement('div')
    thumb.className = 'lingyun-preview-scrollbar__thumb'
    rail.appendChild(thumb)
    document.body.appendChild(rail)
    let raf = 0
    const update = (): void => {
      raf = 0
      const viewH = window.innerHeight
      const total = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      )
      if (total <= viewH + 1) {
        rail.style.display = 'none'
        return
      }
      rail.style.display = 'block'
      const trackH = Math.max(0, viewH - 8)
      const thumbH = Math.max(24, (viewH / total) * trackH)
      const maxTop = Math.max(0, trackH - thumbH)
      const maxScroll = Math.max(1, total - viewH)
      const scrollTop =
        window.scrollY ||
        (document.scrollingElement && document.scrollingElement.scrollTop) ||
        document.body.scrollTop ||
        0
      thumb.style.height = `${thumbH}px`
      thumb.style.transform = `translateY(${
        (Math.max(0, Math.min(maxScroll, scrollTop)) / maxScroll) * maxTop
      }px)`
    }
    const queue = (): void => {
      if (raf) return
      raf = window.setTimeout(update, 16)
    }
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    try {
      const observer = new MutationObserver(queue)
      observer.observe(document.body, { childList: true, subtree: true })
    } catch {
      /* 旧浏览器忽略 */
    }
    window.addEventListener('load', queue, { once: true })
    ;[200, 600, 1200, 2000].forEach((delay) => setTimeout(queue, delay))
    update()

    let dragging = false
    const scrollToPointer = (clientY: number): void => {
      const rect = rail.getBoundingClientRect()
      if (!rect.height) return
      const total = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      )
      const maxScroll = total - window.innerHeight
      if (maxScroll <= 0) return
      const ratio = Math.max(
        0,
        Math.min(1, (clientY - rect.top) / rect.height),
      )
      window.scrollTo(0, ratio * maxScroll)
    }
    rail.addEventListener('pointerdown', (event: PointerEvent) => {
      dragging = true
      try {
        rail.setPointerCapture(event.pointerId)
      } catch {
        /* 旧浏览器忽略 */
      }
      scrollToPointer(event.clientY)
      event.preventDefault()
    })
    rail.addEventListener('pointermove', (event: PointerEvent) => {
      if (!dragging) return
      scrollToPointer(event.clientY)
      event.preventDefault()
    })
    const endDrag = (): void => {
      dragging = false
    }
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
  }
  if (document.body) attach()
  else window.addEventListener('DOMContentLoaded', attach, { once: true })
  // #endif
}

/** 从 iframe 地址的 hash query 读取初始 Duo 姿态，首帧就按 Duo 渲染，避免先闪一下手机布局 */
function readPreviewDuoPose(): LingyunDuoPose | '' {
  if (typeof window === 'undefined') return ''
  const hash = String(window.location.hash || '')
  const query = hash.split('?')[1] || ''
  const part = query.split('&').find((item) => item.startsWith('__lyDuo='))
  if (!part) return ''
  let value = part.slice('__lyDuo='.length)
  try {
    value = decodeURIComponent(value)
  } catch {
    /* 保留原始值 */
  }
  return PREVIEW_DUO_POSES.has(value) ? (value as LingyunDuoPose) : ''
}

/**
 * 文档站的实时预览框通过 postMessage 驱动设备模拟。
 * 只允许明确的 Duo 姿态；其他情况清空 override，让页面回到按窗口宽度布局。
 */
function installLingyunLayoutPreviewBridge(): void {
  // #ifdef H5
  if (typeof window === 'undefined' || window.parent === window) return
  if ((window as Window & { __lingyunLayoutPreviewBound?: boolean }).__lingyunLayoutPreviewBound) {
    return
  }
  ;(window as Window & { __lingyunLayoutPreviewBound?: boolean }).__lingyunLayoutPreviewBound =
    true
  document.documentElement.classList.add('lingyun-preview-embedded')
  installLingyunPreviewScrollbar()
  const initialPose = readPreviewDuoPose()
  if (initialPose) {
    setLingyunLayoutOverride({ formFactor: 'duo', duoPose: initialPose })
  }
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.source && event.source !== window.parent) return
    const data = event.data as
      | { type?: string; formFactor?: string; duoPose?: string }
      | null
      | undefined
    if (!data || data.type !== 'lingyun-layout-preview') return
    if (
      data.formFactor === 'duo' &&
      data.duoPose &&
      PREVIEW_DUO_POSES.has(data.duoPose)
    ) {
      setLingyunLayoutOverride({
        formFactor: 'duo',
        duoPose: data.duoPose as LingyunDuoPose,
      })
      return
    }
    setLingyunLayoutOverride(null)
  })
  try {
    window.parent.postMessage({ type: 'lingyun-layout-preview-ready' }, '*')
  } catch {
    /* 父页面可能已离开；忽略 */
  }
  // #endif
}

/** 把宿主工程的业务状态与路由能力注入 lingyun-ui；组件包本身不反向依赖这些文件。 */
export function configureLingyunUi(): void {
  /*
   * 接入已有型号判断时在这里注入（未接入时页面壳使用 lingyun.formFactor / duoPose 兜底）：
   * configureLingyunLayout({
   *   getFormFactor: () => detectFormFactor(),
   *   getDuoPose: () => detectDuoPose(),
   * })
   */
  configureLingyunPageNav({
    home: LINGYUN_PAGE_NAV_HOME,
    guestHome: LINGYUN_PAGE_NAV_GUEST_HOME,
    isLogin: () => useAuthStore().isLogin,
    pageRequiresLogin,
    getSections: getLingyunPageNavSections,
    getProfile: getLingyunPageNavProfile,
    getStoreOptions: () => useUserStore().storeOptions,
    getStoreName: () => useUserStore().storeName,
    getStoreId: () => useUserStore().storeId,
    selectStore: (id) => useUserStore().selectStore(id),
    resolvePageUrl: resolveLingyunPageUrl,
    openHostedPage: openLingyunHostedPage,
    openTabPage: openLingyunTabHostPage,
    isTabHostPage: isLingyunTabHostRoute,
    clearHostedPage: clearLingyunPageHost,
    getHostedPath: () => pageHostState.path,
    getHostedUrl: () => pageHostState.url,
    ensureWidePageHost: ensureLingyunWidePageHost,
    hostedPagePath,
    hostedFromText,
    getIntent: getLingyunPageNavIntent,
    setIntent: setLingyunPageNavIntent,
    clearIntent: clearLingyunPageNavIntent,
    useIntent: useLingyunPageNavIntent,
    getScrollTop: getLingyunPageNavScrollTop,
    setScrollTop: setLingyunPageNavScrollTop,
    onRouteChange: (cb) => router.onRouteChange((to) => cb(to.path)),
    useHostedPath: () => toRef(pageHostState, 'path'),
  })
  setLingyunPageConfig(DEMO_PAGE_CONFIG)
  installLingyunLayoutPreviewBridge()
}
