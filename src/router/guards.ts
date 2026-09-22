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
