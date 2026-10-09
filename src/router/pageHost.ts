import { reactive } from 'vue'
import {
  getLingyunNavLayout,
  LINGYUN_TOOLBAR_BAR_DESIGN_PX,
} from '@/uni_modules/lingyun-ui/components/lingyun-toolbars/getLingyunNavSafeInset'
import { hasLingyunPage, normalizeLingyunPagePath } from '@/router/pageNav'

/** 宽屏小程序侧栏切页时留在当前页，只换右侧内容，侧栏不随 redirectTo 拆掉。 */
export const pageHostState = reactive({
  /** 非空时当前页右侧改成这个地址对应的内容。 */
  url: '',
  /** 侧栏高亮。空则跟真实路由。 */
  path: '',
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
  if (path === 'pages/404/404') {
    pageHostState.url = full
    return
  }
  pageHostState.url = path && path !== currentRoute() ? full : ''
}

export function clearLingyunPageHost(): void {
  pageHostState.url = ''
  pageHostState.path = ''
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
 * 宽屏小程序：404 和当前页直接留在本页切换。
 * 其它已注册页面返回 false，调用方再走路由。
 */
export function openLingyunHostedPage(url: string, highlight?: string): boolean {
  // #ifdef MP-WEIXIN
  if (!isLingyunWideNav()) return false
  if (!hasLingyunPage(url)) return false
  const path = normalizeLingyunPagePath(url)
  if (path !== 'pages/404/404' && path !== currentRoute()) return false
  setLingyunPageHost(url, highlight)
  return true
  // #endif
  // #ifndef MP-WEIXIN
  return false
  // #endif
}
