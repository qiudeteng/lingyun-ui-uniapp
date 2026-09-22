import { useUserStore } from '@/stores/user'

/** 对齐 ../mobile/utils/has-auth.js */
export function hasAuth(code: string): boolean {
  const codes = useUserStore().getUserCodes()
  return codes.includes(code) || codes.includes('code')
}

export default hasAuth
