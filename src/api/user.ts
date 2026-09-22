/**
 * 用户信息 / 菜单 / 门店（对齐 ../mobile/store/user.js）
 */
import { post } from '@/utils/request'
import type { UserInfo } from '@/stores/user'

export function fetchUserInfo() {
  return post<UserInfo>('/core/User/info', {}, false)
}

export function fetchUserMenu() {
  return post('/core/User/menu', {}, false)
}

export function fetchUserAuthStores() {
  return post('/enterprise/Store/getUserAuthStores', {}, false)
}
