/**
 * 全局页面壳配置（一级导航 tabs、页面覆盖、Tab 栏外观）。
 * 宿主通过 `setLingyunPageConfig` 注入，组件包不反向依赖宿主。
 */
import { reactive } from 'vue'
import {
  normalizeLingyunPagePath,
  type LingyunPageNavSection,
} from './pageNavAdapter'
import type {
  LingyunPageConfig,
  LingyunPageOverride,
  LingyunPageTab,
} from './pageLayout'

function defaultConfig(): LingyunPageConfig {
  return {
    tabs: [],
    sidebarTitle: '',
    layout: { navMode: 'auto' },
    pages: {},
    tabbar: { safeArea: true, variant: 'default' },
  }
}

const state = reactive<LingyunPageConfig>(defaultConfig())

function validTabs(tabs: LingyunPageTab[]): LingyunPageTab[] {
  return tabs
    .filter((tab) => !!tab && !!tab.key && !!tab.url)
    .map((tab) => ({ ...tab }))
}

/** 增量更新；tabs 整体替换，pages 按路径合并 */
export function setLingyunPageConfig(next: Partial<LingyunPageConfig>): void {
  if (!next) return
  if (Array.isArray(next.tabs)) state.tabs = validTabs(next.tabs)
  if (next.sidebarTitle !== undefined) state.sidebarTitle = String(next.sidebarTitle || '')
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
  state.layout = defaults.layout
  state.tabbar = defaults.tabbar
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

export function matchLingyunPageTab(
  tabs: LingyunPageTab[],
  path: string,
): LingyunPageTab | null {
  const target = normalizeLingyunPagePath(path)
  if (!target) return null
  for (const tab of tabs) {
    if (normalizeLingyunPagePath(tab.url) === target) return tab
    const matches = Array.isArray(tab.match) ? tab.match : tab.match ? [tab.match] : []
    if (matches.some((item) => normalizeLingyunPagePath(item) === target)) return tab
  }
  return null
}

export function buildLingyunPageTabSections(
  tabs: LingyunPageTab[],
  title = '',
): LingyunPageNavSection[] {
  if (!tabs.length) return []
  return [
    {
      title,
      items: tabs.map((tab) => ({
        title: tab.text,
        url: tab.url,
        icon: tab.icon,
        badge: tab.badge,
        match: tab.match,
      })),
    },
  ]
}
