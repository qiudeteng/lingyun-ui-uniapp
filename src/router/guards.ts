/**
 * 全局路由守卫（uni-router）
 *
 * 当前工程为组件库演示站：不做登录鉴权，任意页面可直接进入。
 */
import type { Router } from '@meng-xi/uni-router'

function normalizePath(path: string): string {
  if (!path) return ''
  const withSlash = path.startsWith('/') ? path : `/${path}`
  return withSlash.split('?')[0].split('#')[0]
}

/** 冷启动时页面栈可能还空，回退到启动路径。 */
export function readEntryPath(): string {
  let raw = ''
  try {
    const pages = getCurrentPages()
    raw = pages.length ? String(pages[pages.length - 1].route || '') : ''
    if (!raw) raw = String(uni.getLaunchOptionsSync()?.path || '')
  } catch {
    raw = ''
  }
  return normalizePath(raw.split('?')[0])
}

/** 演示站关闭鉴权：永远不要求登录。 */
export function pageRequiresLogin(_path?: string): boolean {
  return false
}

export function setupRouterGuards(_router: Router): void {
  // 演示站不注册 beforeEach 登录拦截
}

/** 冷启动不再跳登录页。 */
export function guardColdStart(): void {
  // no-op
}
