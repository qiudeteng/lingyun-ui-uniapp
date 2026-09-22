import { defineStore } from 'pinia'
import { ref } from 'vue'
import { post } from '@/utils/request'

export type UserInfo = {
  brands?: unknown[]
  codes?: string[]
  regions?: unknown[]
  stores?: unknown[]
  editpass?: boolean
  role_rules?: {
    menus?: Record<string, string[]>
    checkKeys?: string[]
  }
  [key: string]: unknown
}

function readStorage<T>(key: string): T | null {
  const value = uni.getStorageSync(key)
  if (value === '' || value == null) return null
  return value as T
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(readStorage('qichengcloud_user_info'))
  const userMenu = ref<unknown>(readStorage('qichengcloud_user_menu'))
  const storeId = ref<string | number | null>(readStorage('qichengcloud_select_store_id'))
  const storeInfo = ref<unknown>(readStorage('qichengcloud_select_store_info'))
  const clientId = ref<string | number | null>(readStorage('client_id'))
  const storeList = ref<unknown[]>(readStorage<unknown[]>('qichengcloud_store_list') || [])

  function getUserBrands(): unknown[] {
    return userInfo.value?.brands || []
  }

  function getUserCodes(): string[] {
    return userInfo.value?.codes || []
  }

  function getUserMenus(): string[] {
    const id = clientId.value
    if (id == null) return []
    return userInfo.value?.role_rules?.menus?.[String(id)] || []
  }

  function getUserRegions(): unknown[] {
    return userInfo.value?.regions || []
  }

  function getUserStores(): unknown[] {
    return userInfo.value?.stores || []
  }

  function getStoreId(): string | number | null {
    return storeId.value
  }

  function setStoreId(store_id: string | number, store_info: unknown): void {
    storeId.value = store_id
    storeInfo.value = store_info
    uni.setStorageSync('qichengcloud_select_store_id', store_id)
    uni.setStorageSync('qichengcloud_select_store_info', store_info)
  }

  function getUserStoreList(callback?: () => void, showLoading = false): Promise<unknown[]> {
    return post<unknown[]>('/enterprise/Store/getUserAuthStores', {}, showLoading).then((res) => {
      storeList.value = res || []
      uni.setStorageSync('qichengcloud_store_list', res)
      callback?.()
      return storeList.value
    })
  }

  function getUserInfo(callback?: () => void, showLoading = false): Promise<UserInfo> {
    return post<UserInfo>('/core/User/info', {}, showLoading).then((res) => {
      userInfo.value = res
      uni.setStorageSync('qichengcloud_user_info', res)
      if (res.editpass) {
        uni.showModal({
          title: '安全提示',
          content: '首次登录需要修改密码',
          showCancel: false,
        })
      }
      callback?.()
      return res
    })
  }

  function getUserMenu(callback?: () => void, showLoading = false): Promise<unknown> {
    return post('/core/User/menu', {}, showLoading).then((res) => {
      userMenu.value = res
      uni.setStorageSync('qichengcloud_user_menu', res)
      callback?.()
      return res
    })
  }

  function refreshData(): void {
    getUserInfo(undefined, false).then(() => {
      getUserMenu(undefined, false)
      getUserStoreList(undefined, false)
    })
  }

  function clearUser(): void {
    userInfo.value = null
    userMenu.value = null
    storeList.value = []
  }

  return {
    userInfo,
    getUserInfo,
    userMenu,
    getUserMenu,
    refreshData,
    getUserCodes,
    getUserBrands,
    getUserRegions,
    getUserStores,
    getStoreId,
    setStoreId,
    storeList,
    storeId,
    storeInfo,
    clientId,
    getUserStoreList,
    getUserMenus,
    clearUser,
  }
})
