/**
 * 全局路由守卫（uni-router）
 *
 * 业务页在 pages.json 对应路由 meta.requireAuth = true（或守卫里按 path 判断）后才会强制登录。
 * Demo / 组件预览页默认不拦。
 */
import type { Router } from '@meng-xi/uni-router'
import { appConfig } from '@/config'
import { routes } from '@/router.config'
import { isLoggedIn } from '@/utils/auth'

const PUBLIC_PATHS = [
  '/pages/login/login'
]

function normalizePath(path: string): string {
  if (!path) return ''
  return path.startsWith('/') ? path : `/${path}`
}

function routeRequiresAuth(path: string): boolean {
  const normalized = normalizePath(path)
  const route = routes.find((item) => item.path === normalized)
  return !!(route?.meta as { requireAuth?: boolean } | undefined)?.requireAuth
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

/** 当前页需要登录且本地没有 token。供页面壳在首屏绘制前藏起内容和侧栏。 */
export function pageRequiresLogin(path?: string): boolean {
  const normalized = normalizePath(path || readEntryPath())
  if (!normalized || PUBLIC_PATHS.includes(normalized)) return false
  return routeRequiresAuth(normalized) && !isLoggedIn()
}

function rememberBackUrl(path: string): void {
  uni.setStorageSync('backurl', path.replace(/^\//, ''))
}

export function setupRouterGuards(router: Router): void {
  router.beforeEach((to) => {
    const path = normalizePath(String(to.path || ''))
    if (!pageRequiresLogin(path)) return
    rememberBackUrl(path)
    return { path: appConfig.loginPath }
  })
}

/**
 * 冷启动补跑登录检查。
 * 首屏由框架直接打开，不经过 beforeEach。
 * onLaunch 时页面栈可能还是空的，所以会短间隔重试到能读到路径。
 * 直接 reLaunch。不要走 guardRoute：它内部的跳转会被拦截器收成一次未完成的导航。
 */
const COLD_START_RETRY_MS = 16
const COLD_START_RETRY_MAX = 50

let coldStartChecked = false
let coldStartTries = 0
let coldStartTimer: ReturnType<typeof setTimeout> | null = null

export function guardColdStart(): void {
  if (coldStartChecked) return
  const path = readEntryPath()
  if (!path) {
    if (coldStartTries >= COLD_START_RETRY_MAX || coldStartTimer != null) return
    coldStartTries += 1
    coldStartTimer = setTimeout(() => {
      coldStartTimer = null
      guardColdStart()
    }, COLD_START_RETRY_MS)
    return
  }
  coldStartChecked = true
  if (!pageRequiresLogin(path)) return
  rememberBackUrl(path)
  uni.reLaunch({ url: appConfig.loginPath })
}
