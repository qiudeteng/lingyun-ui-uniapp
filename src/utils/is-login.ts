import { useAuthStore } from '@/stores/auth'

/** 对齐 ../mobile/pagesStore/utils/islogin.js */
export function isLogin(): boolean {
  return useAuthStore().isLogin
}

export default isLogin
