/**
 * 登录态本地存取（对齐 ../mobile：qichengcloud_*）
 */
const TOKEN_KEY = 'qichengcloud_token'
const REFRESH_TOKEN_KEY = 'qichengcloud_refresh_token'
const BACK_URL_KEY = 'backurl'

export function setToken(token: string): void {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function getToken(): string {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setRefreshToken(token: string): void {
  uni.setStorageSync(REFRESH_TOKEN_KEY, token)
}

export function getRefreshToken(): string {
  return uni.getStorageSync(REFRESH_TOKEN_KEY) || ''
}

export function clearToken(): void {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(REFRESH_TOKEN_KEY)
}

export function setBackUrl(url: string): void {
  uni.setStorageSync(BACK_URL_KEY, url)
}

export function getBackUrl(): string {
  return uni.getStorageSync(BACK_URL_KEY) || ''
}

export function clearBackUrl(): void {
  uni.removeStorageSync(BACK_URL_KEY)
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export function formatToken(token: string): string | null {
  return token ? `Bearer ${token}` : null
}
