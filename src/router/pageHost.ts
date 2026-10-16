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
