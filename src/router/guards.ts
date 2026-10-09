/**
 * 全局路由守卫（uni-router）
 *
 * 业务页在 pages.json 对应路由 meta.requireAuth = true（或守卫里按 path 判断）后才会强制登录。
 * Demo / 组件预览页默认不拦。
 */
import type { Router } from '@meng-xi/uni-router'
import { appConfig } from '@/config'
import { isLoggedIn } from '@/utils/auth'

const PUBLIC_PATHS = [
  '/pages/login/login',
  '/pages/login/user-agreement',
  '/pages/login/privacy-policy',
]

function normalizePath(path: string): string {
  if (!path) return ''
  return path.startsWith('/') ? path : `/${path}`
}

export function setupRouterGuards(router: Router): void {
  router.beforeEach((to) => {
    const path = normalizePath(String(to.path || ''))
    if (PUBLIC_PATHS.includes(path)) return
    const requireAuth = !!(to.meta as { requireAuth?: boolean } | undefined)?.requireAuth
    if (requireAuth && !isLoggedIn()) {
      uni.setStorageSync('backurl', path.replace(/^\//, ''))
      return { path: appConfig.loginPath }
    }
  })
}

/**
 * 冷启动补跑登录检查。
 * 首屏由框架直接打开，不经过 beforeEach。
 * onLaunch 时页面栈可能还是空的，所以会短间隔重试到页面出现。
 * 用当前页路径 resolve 出 meta，再 reLaunch。不要走 guardRoute：
 * 它内部的 relaunch 会被拦截器收成一次未完成的导航，页面停在原地。
 */
const COLD_START_RETRY_MS = 16
const COLD_START_RETRY_MAX = 50

let coldStartChecked = false
let coldStartTries = 0
let coldStartTimer: ReturnType<typeof setTimeout> | null = null

export function guardColdStart(router: Router): void {
  if (coldStartChecked) return
  const pages = getCurrentPages()
  if (!pages.length) {
    if (coldStartTries >= COLD_START_RETRY_MAX || coldStartTimer != null) return
    coldStartTries += 1
    coldStartTimer = setTimeout(() => {
      coldStartTimer = null
      guardColdStart(router)
    }, COLD_START_RETRY_MS)
    return
  }
  coldStartChecked = true
  const path = normalizePath(String(pages[pages.length - 1].route || ''))
  if (!path || PUBLIC_PATHS.includes(path)) return
  const resolved = router.resolve(path)
  const requireAuth = !!(resolved.meta as { requireAuth?: boolean } | undefined)?.requireAuth
  if (!requireAuth || isLoggedIn()) return
  uni.setStorageSync('backurl', path.replace(/^\//, ''))
  uni.reLaunch({ url: appConfig.loginPath })
}
