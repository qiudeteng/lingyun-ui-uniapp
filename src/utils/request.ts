/**
 * 基于 uni.request 的统一请求封装
 * 对齐 ../mobile/common/request.js：Appid / Timestamp / Sign / Authorization / Zip
 */
import { appConfig } from '@/config'
import { AppError } from './app-error'
import { formatToken, getToken } from './auth'
import { getSign } from './sign'
import { phpDecompress } from './zip'

export interface RequestOptions {
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown>
  header?: Record<string, string>
  showLoading?: boolean
}

interface ApiEnvelope {
  code?: number
  data?: unknown
  message?: string
  zip?: boolean | number
}

let loggingOut = false

function isEmptyPayload(data: unknown): boolean {
  if (data == null) return true
  if (typeof data !== 'object') return false
  return Object.keys(data as Record<string, unknown>).length === 0
}

function rememberBackUrl(): void {
  try {
    const launch = uni.getLaunchOptionsSync()
    const path = launch?.path || ''
    const query = launch?.query || {}
    const qs = Object.entries(query)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    uni.setStorageSync('backurl', path + (qs ? `?${qs}` : ''))
  } catch {
    /* H5 部分环境无 getLaunchOptionsSync */
  }
}

function kickToLogin(): void {
  if (loggingOut) return
  loggingOut = true
  rememberBackUrl()
  import('@/stores/auth')
    .then(({ useAuthStore }) => {
      const authStore = useAuthStore()
      if (authStore.isLogin) {
        authStore.logout()
      } else {
        uni.reLaunch({ url: appConfig.loginPath })
      }
    })
    .catch(() => {
      uni.reLaunch({ url: appConfig.loginPath })
    })
    .finally(() => {
      setTimeout(() => {
        loggingOut = false
      }, 800)
    })
}

function buildSignedBody(payload: Record<string, unknown> | undefined): {
  header: Record<string, string>
  data: Record<string, unknown>
} {
  const timestamp = Math.floor(Date.now() / 1000)
  const header: Record<string, string> = {
    Appid: String(appConfig.appid),
    Timestamp: String(timestamp),
    'Client-Type': appConfig.clientType,
    Zip: String(appConfig.zip),
  }
  if (isEmptyPayload(payload)) {
    header.Sign = getSign({
      appid: appConfig.appid,
      timestamp,
      secret: appConfig.secretKey,
    })
    return { header, data: {} }
  }
  header.Sign = getSign({
    data: payload,
    appid: appConfig.appid,
    timestamp,
    secret: appConfig.secretKey,
  })
  return { header, data: { data: payload } }
}

export function request<T = unknown>(options: RequestOptions = {}): Promise<T> {
  const url = options.url || ''
  const showLoading = options.showLoading !== false
  const signed = buildSignedBody(options.data)
  const header: Record<string, string> = {
    ...signed.header,
    ...(options.header || {}),
  }

  if (!appConfig.notAuthUrls.includes(url)) {
    const token = getToken()
    if (token) {
      const bearer = formatToken(token)
      if (bearer) header.Authorization = bearer
    } else {
      try {
        const launch = uni.getLaunchOptionsSync()
        const path = launch?.path || ''
        if (!path.includes('pages/login/login')) {
          kickToLogin()
        }
      } catch {
        kickToLogin()
      }
    }
  }

  if (showLoading) {
    uni.showLingyunHud({ text: '加载中' })
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${appConfig.apiUrl}${url}`,
      method: options.method || 'POST',
      data: signed.data,
      header,
      success: (res) => {
        if (showLoading) uni.hideLingyunHud()
        const statusCode = res.statusCode
        const body = (res.data || {}) as ApiEnvelope
        const { code, data, message, zip } = body

        if (statusCode !== 200 || code !== 1) {
          if (statusCode === 401) {
            kickToLogin()
          } else if (code === 8001) {
            uni.showModal({
              showCancel: false,
              content: '您没有登录本客户端的授权，点击确定返回登录页。',
              success: () => {
                post('/core/User/logout', undefined, false).finally(() => kickToLogin())
              },
            })
          }
          reject(new AppError(message || `Error ${code}`, code ?? statusCode))
          return
        }

        if (zip) {
          resolve(phpDecompress(String(data)) as T)
          return
        }
        resolve(data as T)
      },
      fail: (err) => {
        if (showLoading) uni.hideLingyunHud()
        uni.showLingyunToast({ text: '网络不给力，请检查网络设置！', type: 'error' })
        reject(err)
      },
    })
  })
}

/** 对齐旧项目 post(url, data, showLoading) */
export function post<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  showLoading = true,
): Promise<T> {
  return request<T>({ url, method: 'POST', data, showLoading })
}
