import { post } from '@/utils/request'
import type { LoginForm, LoginResult } from '@/stores/auth'

export function codeLogin(data: { wechat_appid: string; code: string }) {
  return post<LoginResult>('/open/Login/codeLogin', data, false)
}

export function userLogin(data: LoginForm) {
  return post<LoginResult>('/open/Login/userLogin', data as Record<string, unknown>)
}

export function refreshToken(data: Record<string, unknown>) {
  return post<LoginResult>('/open/Login/refreshToken', data, false)
}

export function logoutRemote() {
  return post('/core/User/logout', undefined, false)
}
