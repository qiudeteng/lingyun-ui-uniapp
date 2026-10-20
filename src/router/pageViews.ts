import { ref } from 'vue'
import { LINGYUN_PAGE_NAV, normalizeLingyunPagePath } from '@/router/pageNav'

export interface LingyunPageViewOptions {
  path: string
  title: string
  /** 承载右侧视图的真实页面。该页面必须放置 app-page-view-host。 */
  host?: string
  bodyScroll?: boolean
  pageScroll?: boolean
}

interface NormalizedPageViewOptions {
  path: string
  title: string
  host: string
  bodyScroll: boolean
  pageScroll: boolean
}

const DEFAULT_HOST = '/pages/index/index'
const DEMO_HOST = '/pages/demo/demo'
const views = new Map<string, NormalizedPageViewOptions>()
const pageViewVersion = ref(0)

function normalizeOptions(options: LingyunPageViewOptions): NormalizedPageViewOptions | null {
  const path = normalizeLingyunPagePath(options.path)
  if (!path) return null
  const hostPath = normalizeLingyunPagePath(options.host || DEFAULT_HOST)
  return {
    path,
    title: String(options.title || ''),
    host: hostPath ? `/${hostPath}` : DEFAULT_HOST,
    bodyScroll: options.bodyScroll !== false,
    pageScroll: options.pageScroll !== false,
  }
}

/**
 * 登记宽屏小程序右侧视图。
 * 小程序组件必须静态编译，调用方还需在 app-page-view-host.vue 中声明对应分支。
 */
export function registerLingyunPageView(options: LingyunPageViewOptions): void {
  const normalized = normalizeOptions(options)
  if (!normalized) return
  views.set(normalized.path, normalized)
  pageViewVersion.value += 1
}

export function registerLingyunPageViews(options: LingyunPageViewOptions[]): void {
  options.forEach((item) => {
    const normalized = normalizeOptions(item)
    if (normalized) views.set(normalized.path, normalized)
  })
  pageViewVersion.value += 1
}

export function getLingyunPageView(path: string): NormalizedPageViewOptions | null {
  pageViewVersion.value
  return views.get(normalizeLingyunPagePath(path)) || null
}

export function hasLingyunPageView(path: string): boolean {
  return !!getLingyunPageView(path)
}

export function useLingyunPageViewVersion() {
  return pageViewVersion
}

registerLingyunPageViews(
  LINGYUN_PAGE_NAV.flatMap((section) =>
    section.items.map((item) => ({
      path: item.url,
      title: item.title,
      host: DEMO_HOST,
      bodyScroll: ![
        '/pages/demo/search-bar',
        '/pages/demo/refresh',
        '/pages/demo/indexed-list',
      ].includes(item.url),
      pageScroll: ![
        '/pages/demo/swipe-actions',
        '/pages/demo/indexed-list',
      ].includes(item.url),
    })),
  ),
)

registerLingyunPageView({
  path: '/pages/demo/workbench',
  title: '工作台',
  host: DEMO_HOST,
})
