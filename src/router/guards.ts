/**
 * 全局路由守卫（uni-router）
 *
 * 除 PUBLIC_PATHS 外，进入任何页面都要登录。
 * 名单支持通配符：`*` 匹配剩余路径（含斜杠），例如 `/pages/demo/*`。
 */
import type { Router } from '@meng-xi/uni-router'
import { appConfig } from '@/config'
import { isLoggedIn } from '@/utils/auth'

const PUBLIC_PATHS = [
  '/pages/login/login',
  '/pages/login/user-agreement',
  '/pages/login/privacy-policy',
  '/pages/demo/*',
]

function normalizePath(path: string): string {
  if (!path) return ''
  const withSlash = path.startsWith('/') ? path : `/${path}`
  return withSlash.split('?')[0].split('#')[0]
}

function escapeRegExp(value: string): string {
  return value.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
}

/** `*` 匹配任意剩余字符，包含 `/`。没有 `*` 时整段相等。 */
function matchPublicPath(path: string, pattern: string): boolean {
  const source = normalizePath(pattern)
  if (!source.includes('*')) return path === source
  const body = source.split('*').map(escapeRegExp).join('.*')
  return new RegExp(`^${body}$`).test(path)
}

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some((pattern) => matchPublicPath(path, pattern))
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
  if (!normalized || isPublicPath(normalized)) return false
  return !isLoggedIn()
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
