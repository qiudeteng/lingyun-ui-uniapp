/**
 * 全局页面壳配置（一级导航 tabs、页面覆盖、Tab 栏外观）。
 * 宿主通过 `setLingyunPageConfig` 注入，组件包不反向依赖宿主。
 */
import { reactive, ref } from 'vue'
import {
  normalizeLingyunPagePath,
  type LingyunPageNavChild,
  type LingyunPageNavSection,
} from './pageNavAdapter'
import type {
  LingyunPageConfig,
  LingyunPageOverride,
  LingyunPageTab,
  LingyunPageTabChild,
} from './pageLayout'

function defaultConfig(): LingyunPageConfig {
  return {
    tabs: [],
    sidebarTitle: '',
    workspaceUrl: '',
    layout: { navMode: 'auto' },
    pages: {},
    tabbar: { safeArea: true, variant: 'default' },
  }
}

const state = reactive<LingyunPageConfig>(defaultConfig())
/** 当前工作台对应的一级 Tab key；工作台路径被多个 Tab 共用 */
const workspaceTabKey = ref('')

function normalizeTabChildren(
  children: LingyunPageTabChild[] | undefined,
): LingyunPageTabChild[] {
  return (children || [])
    .filter((child) => !!child && !!child.key)
    .map((child) => ({
      ...child,
      children: normalizeTabChildren(child.children),
    }))
    .filter((child) => !!child.url || child.children.length > 0)
}

function validTabs(tabs: LingyunPageTab[]): LingyunPageTab[] {
  return tabs
    .filter((tab) => !!tab && !!tab.key && !!tab.url)
    .map((tab) => ({
      ...tab,
      children: normalizeTabChildren(tab.children),
    }))
}

/** 增量更新；tabs 整体替换，pages 按路径合并 */
export function setLingyunPageConfig(next: Partial<LingyunPageConfig>): void {
  if (!next) return
  if (Array.isArray(next.tabs)) state.tabs = validTabs(next.tabs)
  if (next.sidebarTitle !== undefined) state.sidebarTitle = String(next.sidebarTitle || '')
  if (next.workspaceUrl !== undefined) state.workspaceUrl = String(next.workspaceUrl || '')
  if (next.layout) state.layout = { ...state.layout, ...next.layout }
  if (next.tabbar) state.tabbar = { ...state.tabbar, ...next.tabbar }
  if (next.pages) {
    const pages = state.pages || (state.pages = {})
    Object.entries(next.pages).forEach(([key, value]) => {
      const path = normalizeLingyunPagePath(key)
      if (!path || !value) return
      pages[path] = { ...(pages[path] || {}), ...value }
    })
  }
}

export function getLingyunPageConfig(): LingyunPageConfig {
  return state
}

export function useLingyunPageConfig(): LingyunPageConfig {
  return state
}

export function resetLingyunPageConfig(): void {
  const defaults = defaultConfig()
  state.tabs = defaults.tabs
  state.sidebarTitle = defaults.sidebarTitle
  state.workspaceUrl = defaults.workspaceUrl
  state.layout = defaults.layout
  state.tabbar = defaults.tabbar
  workspaceTabKey.value = ''
  const pages = state.pages || {}
  Object.keys(pages).forEach((key) => {
    delete pages[key]
  })
}

export function getLingyunPageOverride(path: string): LingyunPageOverride | null {
  const key = normalizeLingyunPagePath(path)
  if (!key || !state.pages) return null
  return state.pages[key] || null
}

function matchesOf(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

function childMatchesPath(child: LingyunPageTabChild, target: string): boolean {
  if (normalizeLingyunPagePath(child.url || '') === target) return true
  if (matchesOf(child.match).some((item) => normalizeLingyunPagePath(item) === target)) {
    return true
  }
  return (child.children || []).some((entry) => childMatchesPath(entry, target))
}

function tabMatchesPath(tab: LingyunPageTab, target: string): boolean {
  if (normalizeLingyunPagePath(tab.url) === target) return true
  if (matchesOf(tab.match).some((item) => normalizeLingyunPagePath(item) === target)) {
    return true
  }
  return (tab.children || []).some((child) => childMatchesPath(child, target))
}

/** 当前路径匹配的一级 Tab；子项路径也会归到父 Tab */
export function matchLingyunPageTab(
  tabs: LingyunPageTab[],
  path: string,
): LingyunPageTab | null {
  const target = normalizeLingyunPagePath(path)
  if (!target) return null
  for (const tab of tabs) {
    if (tabMatchesPath(tab, target)) return tab
  }
  return null
}

export function findLingyunPageTab(key: string): LingyunPageTab | null {
  const wanted = String(key || '')
  if (!wanted) return null
  return (state.tabs || []).find((tab) => tab.key === wanted) || null
}

export function getLingyunPageTabWorkspaceUrl(tab: LingyunPageTab): string {
  return normalizeLingyunPagePath(
    String(tab.workspaceUrl || state.workspaceUrl || '').trim(),
  )
}

/** 工作台 URL：固定页 + tab key，便于刷新/直达时恢复一级选中 */
export function buildLingyunPageTabWorkspaceUrl(tab: LingyunPageTab): string {
  const base = getLingyunPageTabWorkspaceUrl(tab)
  if (!base) return ''
  return `${base}?tab=${encodeURIComponent(tab.key)}`
}

export function isLingyunWorkspacePath(path: string): boolean {
  const target = normalizeLingyunPagePath(path)
  if (!target) return false
  if (state.workspaceUrl && normalizeLingyunPagePath(state.workspaceUrl) === target) {
    return true
  }
  return (state.tabs || []).some(
    (tab) =>
      !!tab.workspaceUrl &&
      normalizeLingyunPagePath(tab.workspaceUrl) === target,
  )
}

/**
 * 工作台页内切换一级 Tab 时同步 H5 地址栏。
 * 只改 history 与当前页 options，不触发路由，页面实例和 Tab 栏都不重建；
 * 同步 options 是为了从子页返回时仍落在切换后的 Tab，而不是旧地址。
 * 小程序没有地址栏，直接跳过。
 */
export function syncLingyunWorkspaceUrl(key: string): void {
  // #ifdef H5
  if (typeof window === 'undefined') return
  const tab = findLingyunPageTab(key)
  if (!tab) return
  const base = getLingyunPageTabWorkspaceUrl(tab)
  const url = buildLingyunPageTabWorkspaceUrl(tab)
  if (!base || !url) return
  const fullPath = `/${url.replace(/^\/+/, '')}`
  const hash = `#${fullPath}`

  let matched = false
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
    if (page && normalizeLingyunPagePath(page.route || '') === base) {
      matched = true
      const options = { ...(page.options || {}), tab: tab.key }
      page.options = options
      if (page.$page) {
        page.$page.options = { ...(page.$page.options || {}), tab: tab.key }
        page.$page.fullPath = fullPath
      }
      const state = window.history.state
      if (state && typeof state === 'object') {
        state.current = fullPath
      }
    }
  } catch {
    /* 宿主页面对象不可写时只保证地址栏同步 */
  }

  /* 只有当前真实页面就是工作台时才改地址，避免宿主页地址被换掉 */
  if (!matched || window.location.hash === hash) return
  try {
    window.history.replaceState(window.history.state, '', hash)
  } catch {
    /* 地址栏同步失败不影响页内切换 */
  }
  // #endif
}

export function setLingyunWorkspaceTabKey(key: string): void {
  workspaceTabKey.value = String(key || '')
}

export function getLingyunWorkspaceTabKey(): string {
  return workspaceTabKey.value
}

export function useLingyunWorkspaceTabKey() {
  return workspaceTabKey
}

function collectChildMatches(
  children: LingyunPageTabChild[],
  out: string[] = [],
): string[] {
  children.forEach((child) => {
    if (child.url) out.push(child.url)
    out.push(...matchesOf(child.match))
    collectChildMatches(child.children || [], out)
  })
  return out
}

function flattenNavChildren(children: LingyunPageTabChild[]): LingyunPageNavChild[] {
  const out: LingyunPageNavChild[] = []
  children.forEach((child) => {
    const nested = child.children || []
    if (nested.length) {
      out.push({
        key: `${child.key}__title`,
        title: child.text,
        kind: 'title',
      })
      out.push(...flattenNavChildren(nested))
      return
    }
    if (!child.url) return
    out.push({
      key: child.key,
      title: child.text,
      icon: child.icon,
      url: child.url,
      badge: child.badge,
      match: child.match,
    })
  })
  return out
}

export function buildLingyunPageTabSections(
  tabs: LingyunPageTab[],
  title = '',
  workspaceUrl = '',
): LingyunPageNavSection[] {
  if (!tabs.length) return []
  return [
    {
      title,
      items: tabs.map((tab) => {
        const rawChildren = tab.children || []
        const match = [
          ...matchesOf(tab.match),
          ...collectChildMatches(rawChildren),
        ]
        return {
          key: tab.key,
          title: tab.text,
          url: tab.url,
          icon: tab.icon,
          badge: tab.badge,
          match,
          children: flattenNavChildren(rawChildren),
          workspaceUrl: getLingyunPageTabWorkspaceUrl({
            ...tab,
            workspaceUrl: tab.workspaceUrl || workspaceUrl,
          }),
        }
      }),
    },
  ]
}
