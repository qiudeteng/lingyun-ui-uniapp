import { defineStore } from 'pinia'
import { ref } from 'vue'
import { post } from '@/utils/request'
import {
  clearToken,
  getToken,
  setBackUrl,
  setRefreshToken,
  setToken,
} from '@/utils/auth'
import { appConfig } from '@/config'
import { useUserStore } from './user'

export type LoginForm = {
  username: string
  password: string
  wechat_appid?: string
  code?: string
}

export type LoginResult = {
  accessToken: string
  refreshToken?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getToken())
  const isLogin = ref(!!token.value)
  const userStore = useUserStore()

  function applySession(res: LoginResult): void {
    token.value = res.accessToken
    isLogin.value = true
    setToken(res.accessToken)
    if (res.refreshToken) setRefreshToken(res.refreshToken)
    userStore.refreshData()
  }

  function loginByCode(callback?: (ok: boolean) => void): void {
    /* #ifdef MP-WEIXIN */
    const weixin = uni.getAccountInfoSync()
    const appId = weixin?.miniProgram?.appId || ''
    if (!appId) {
      callback?.(false)
      return
    }
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        if (loginRes.errMsg !== 'login:ok' || !loginRes.code) {
          callback?.(false)
          return
        }
        post<LoginResult>(
          '/open/Login/codeLogin',
          { wechat_appid: appId, code: loginRes.code },
          false,
        )
          .then((res) => {
            applySession(res)
            callback?.(true)
          })
          .catch(() => callback?.(false))
      },
      fail: () => callback?.(false),
    })
    /* #endif */
    /* #ifndef MP-WEIXIN */
    callback?.(false)
    /* #endif */
  }

  function login(logindata: LoginForm, callback?: (ok: boolean) => void): void {
    const payload: LoginForm = { ...logindata }
    /* #ifdef MP-WEIXIN */
    const weixin = uni.getAccountInfoSync()
    const appId = weixin?.miniProgram?.appId || ''
    if (!appId) {
      callback?.(false)
      return
    }
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        if (loginRes.errMsg !== 'login:ok' || !loginRes.code) {
          callback?.(false)
          return
        }
        payload.wechat_appid = appId
        payload.code = loginRes.code
        post<LoginResult>('/open/Login/userLogin', payload as Record<string, unknown>)
          .then((res) => {
            applySession(res)
            callback?.(true)
          })
          .catch((err: { message?: string }) => {
            callback?.(false)
            uni.showModal({
              title: '错误提醒',
              content: err?.message || '参数错误，请重新进入尝试',
              showCancel: false,
              confirmText: '确定',
            })
          })
      },
      fail: () => callback?.(false),
    })
    return
    /* #endif */
    /* #ifndef MP-WEIXIN */
    post<LoginResult>('/open/Login/userLogin', payload as Record<string, unknown>)
      .then((res) => {
        applySession(res)
        callback?.(true)
      })
      .catch((err: { message?: string }) => {
        callback?.(false)
        uni.showModal({
          title: '错误提醒',
          content: err?.message || '参数错误，请重新进入尝试',
          showCancel: false,
          confirmText: '确定',
        })
      })
    /* #endif */
  }

  function logout(): void {
    token.value = ''
    isLogin.value = false
    clearToken()
    try {
      const launch = uni.getLaunchOptionsSync()
      const path = launch?.path || ''
      const query = launch?.query || {}
      const qs = Object.entries(query)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
      setBackUrl(path + (qs ? `?${qs}` : ''))
      if (!path.includes('pages/login/login')) {
        uni.reLaunch({ url: appConfig.loginPath })
      }
    } catch {
      uni.reLaunch({ url: appConfig.loginPath })
    }
  }

  return {
    token,
    isLogin,
    login,
    logout,
    loginByCode,
  }
})
