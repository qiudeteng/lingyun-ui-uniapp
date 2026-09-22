import { useUserStore } from '@/stores/user'

/** 对齐 ../mobile/utils/has-menu-auth.js */
export function hasMenuAuth(code: string): boolean {
  return useUserStore().getUserMenus().includes(code)
}

export default hasMenuAuth
