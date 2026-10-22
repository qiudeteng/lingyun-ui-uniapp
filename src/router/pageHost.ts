import { reactive } from 'vue'
import {
  getLingyunNavLayout,
  LINGYUN_TOOLBAR_BAR_DESIGN_PX,
} from '@/uni_modules/lingyun-ui/components/lingyun-toolbars/getLingyunNavSafeInset'
import { hasLingyunPage, normalizeLingyunPagePath } from '@/router/pageNav'
import { getLingyunPageView } from '@/router/pageViews'

/** 宽屏小程序侧栏切页时留在当前页，只换右侧内容，侧栏不随 redirectTo 拆掉。 */
export const pageHostState = reactive({
  /** 非空时当前页右侧改成这个地址对应的内容。 */
  url: '',
  /** 侧栏高亮。空则跟真实路由。 */
  path: '',
  /** 实际承载右侧视图的页面。 */
  host: '',
})

function currentRoute(): string {
  try {
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1] as { route?: string } | undefined
    return normalizeLingyunPagePath(cur?.route || '')
  } catch {
    return ''
  }
}

/** 首页 / 目录：可以在页内承载一级 Tab 内容的宿主页。 */
export function isLingyunTabHostRoute(path: string): boolean {
  const route = normalizeLingyunPagePath(path)
  return route === 'pages/index/index' || route === 'pages/demo/demo'
}

export function isLingyunWideNav(): boolean {
  return !!getLingyunNavLayout(LINGYUN_TOOLBAR_BAR_DESIGN_PX).regular
}

export function setLingyunPageHost(url: string, highlight?: string): void {
  const full = url.charAt(0) === '/' ? url : `/${url}`
  const path = normalizeLingyunPagePath(full)
  pageHostState.path = normalizeLingyunPagePath(highlight || path)
  pageHostState.host = getLingyunPageView(path)?.host || ''
  if (path === 'pages/404/404') {
    pageHostState.url = full
    return
  }
  pageHostState.url = path && path !== currentRoute() ? full : ''
}

export function clearLingyunPageHost(): void {
  pageHostState.url = ''
  pageHostState.path = ''
  pageHostState.host = ''
}

/**
 * 首页 / 目录这类宿主页内切换一级 Tab 时只改地址栏。
 * 页面实例、Tab 栏和页面栈都不动；小程序没有地址栏，只保留宿主状态。
 * H5 地址保持在宿主路由上，用 `?tab=` 记录当前一级 Tab，
 * 避免地址先跳到工作台、路由栈却仍是宿主页，返回时多出一层。
 */
function syncLingyunHostUrl(url: string): void {
  // #ifdef H5
  if (typeof window === 'undefined') return
  const route = currentRoute()
  if (!isLingyunTabHostRoute(route)) return
  const raw = String(url || '').trim()
  const path = normalizeLingyunPagePath(raw)
  const query = raw.split('?')[1] || ''
  const tabPart = query.split('&').find((item) => item.startsWith('tab='))
  let tab = tabPart ? tabPart.slice('tab='.length) : ''
  try {
    tab = tab ? decodeURIComponent(tab) : ''
  } catch {
    /* 保留原始值 */
  }
  const fullPath = path
    ? `/${route}${tab ? `?tab=${encodeURIComponent(tab)}` : ''}`
    : '/'
  const hash = path ? `#${fullPath}` : '#/'
  try {
    const pages =
      typeof getCurrentPages === 'function' ? getCurrentPages() : []
    const page = pages[pages.length - 1] as
      | {
          route?: string
          options?: Record<string, string>
          $page?: {
            options?: Record<string, string>
            fullPath?: string
          }
        }
      | undefined
    if (page && normalizeLingyunPagePath(page.route || '') === route) {
      const options = { ...(page.options || {}) }
      if (tab) options.tab = tab
      else delete options.tab
      page.options = options
      if (page.$page) {
        const pageOptions = { ...(page.$page.options || {}) }
        if (tab) pageOptions.tab = tab
        else delete pageOptions.tab
        page.$page.options = pageOptions
        page.$page.fullPath = fullPath
      }
      const state = window.history.state
      if (state && typeof state === 'object') state.current = fullPath
    }
  } catch {
    /* 宿主页面对象不可写时只保证地址栏同步 */
  }
  if (window.location.hash === hash) return
  try {
    window.history.replaceState(window.history.state, '', hash)
  } catch {
    /* 地址栏同步失败不影响页内切换 */
  }
  // #endif
}

/**
 * 一级 Tab 在当前宿主页内切换：
 * - 首页保留自己的内容，清空宿主视图即可；
 * - 其他 Tab 渲染到宿主页的 app-page-view-host，不 reLaunch。
 * 当前页不是宿主页时返回 false，由调用方继续走路由。
 */
export function openLingyunTabHostPage(url: string, highlight?: string): boolean {
  const route = currentRoute()
  if (!isLingyunTabHostRoute(route)) return false
  const full = url.charAt(0) === '/' ? url : `/${url}`
  const path = normalizeLingyunPagePath(full)
  if (!path) return false
  if (path === route) {
    clearLingyunPageHost()
    syncLingyunHostUrl('')
    return true
  }
  const view = getLingyunPageView(path)
  if (!view && path !== 'pages/404/404') return false
  /* 宿主视图必须指向 target；highlight 只是侧栏选中，不能覆盖内容路径 */
  setLingyunPageHost(full, path)
  syncLingyunHostUrl(full)
  return true
}

export function hostedPagePath(): string {
  return normalizeLingyunPagePath(pageHostState.url)
}

export function hostedFromText(): string {
  const query = pageHostState.url.split('?')[1] || ''
  const part = query.split('&').find((item) => item.startsWith('from='))
  if (!part) return ''
  let next = part.slice('from='.length)
  for (let i = 0; i < 2; i += 1) {
    try {
      const decoded = decodeURIComponent(next)
      if (decoded === next) break
      next = decoded
    } catch {
      break
    }
  }
  return next
}

/**
 * 宽屏小程序：已注册视图只切换常驻宿主的右侧内容。
 * 若当前还不是对应宿主页，只替换一次宿主页；后续 Tab 切换不再走页面路由。
 */
export function openLingyunHostedPage(url: string, highlight?: string): boolean {
  // #ifdef MP-WEIXIN
  if (!isLingyunWideNav()) return false
  const path = normalizeLingyunPagePath(url)
  const view = getLingyunPageView(path)
  if (!hasLingyunPage(url) && !view) return false
  if (!view && path === currentRoute()) {
    clearLingyunPageHost()
    return true
  }
  if (path !== 'pages/404/404' && !view) return false
  setLingyunPageHost(url, highlight)
  const host = view?.host || ''
  if (host && normalizeLingyunPagePath(host) !== currentRoute()) {
    uni.redirectTo({
      url: host,
      fail: () => {
        clearLingyunPageHost()
        uni.redirectTo({ url })
      },
    })
  }
  return true
  // #endif
  // #ifndef MP-WEIXIN
  return false
  // #endif
}

/**
 * 宽屏直接进入内容页时，立即归并到它登记的常驻宿主页。
 * 这样用户第一次点击左栏前就已经进入 Tab 容器。
 */
export function ensureLingyunWidePageHost(): boolean {
  // #ifdef MP-WEIXIN
  if (!isLingyunWideNav()) return false
  const route = currentRoute()
  const view = getLingyunPageView(route)
  if (!view || normalizeLingyunPagePath(view.host) === route) return false
  return openLingyunHostedPage(`/${route}`, `/${route}`)
  // #endif
  // #ifndef MP-WEIXIN
  return false
  // #endif
}
