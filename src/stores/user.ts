import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { post } from '@/utils/request'
import { fetchUserAuthStores } from '@/api/user'
import { isLoggedIn } from '@/utils/auth'
import { clearLingyunPageNavSession, syncLingyunPageNav } from '@/utils/page-nav-menu'

/** 当前用户有权限的门店。接口可能是扁平列表，也可能是品牌 / 大区 / 门店树，叶子才是门店。 */
export type AuthStore = {
  store_id: string | number
  store_name: string
  [key: string]: unknown
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function readStoreId(node: Record<string, unknown>): string | number | null {
  const id = node.store_id ?? node.value ?? node.id
  if (typeof id === 'number' && Number.isFinite(id)) return id
  if (typeof id === 'string' && id.trim()) return id.trim()
  return null
}

function readStoreName(node: Record<string, unknown>): string {
  const name = node.store_name ?? node.text ?? node.name
  return typeof name === 'string' ? name.trim() : ''
}

/** 把授权门店树收成可选门店。有 children 的节点只用来下钻。 */
export function flattenAuthStores(list: unknown): AuthStore[] {
  const out: AuthStore[] = []
  const walk = (nodes: unknown) => {
    if (!Array.isArray(nodes)) return
    for (const item of nodes) {
      const node = asRecord(item)
      if (!node) continue
      const kids = node.children
      if (Array.isArray(kids) && kids.length) {
        walk(kids)
        continue
      }
      const storeId = readStoreId(node)
      const storeName = readStoreName(node)
      if (storeId == null || !storeName) continue
      out.push({ ...node, store_id: storeId, store_name: storeName })
    }
  }
  walk(list)
  return out
}

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
  /** 当前选中门店。页面里直接读这两个 ref，切换后绑定处会一起更新。 */
  const storeId = ref<string | number | null>(readStorage('qichengcloud_select_store_id'))
  const storeInfo = ref<AuthStore | null>(readStorage<AuthStore>('qichengcloud_select_store_info'))
  const clientId = ref<string | number | null>(readStorage('client_id'))
  const storeList = ref<unknown[]>(readStorage<unknown[]>('qichengcloud_store_list') || [])
  const storeOptions = computed(() => flattenAuthStores(storeList.value))
  const storeName = computed(() => {
    const fromInfo = storeInfo.value ? readStoreName(storeInfo.value) : ''
    if (fromInfo) return fromInfo
    const current = storeId.value
    if (current == null || current === '') return ''
    const hit = storeOptions.value.find((item) => String(item.store_id) === String(current))
    return hit?.store_name || ''
  })

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
    const info = asRecord(store_info)
    const next: AuthStore | null = info
      ? { ...info, store_id, store_name: readStoreName(info) }
      : null
    if (next && !next.store_name) {
      const hit = storeOptions.value.find((item) => String(item.store_id) === String(store_id))
      if (hit) next.store_name = hit.store_name
    }
    storeId.value = store_id
    storeInfo.value = next
    uni.setStorageSync('qichengcloud_select_store_id', store_id)
    uni.setStorageSync('qichengcloud_select_store_info', next)
  }

  /** 按门店 id 选中。任意页面调用后，读 storeId / storeInfo / storeName 的地方都会更新。 */
  function selectStore(id: string | number): void {
    const hit = storeOptions.value.find((item) => String(item.store_id) === String(id))
    if (!hit) return
    setStoreId(hit.store_id, hit)
  }

  function ensureSelectedStore(): void {
    const options = storeOptions.value
    if (!options.length) return
    const current = storeId.value
    const hit = options.find((item) => current != null && current !== '' && String(item.store_id) === String(current))
    if (hit) {
      const info = storeInfo.value
      const same = !!info && String(info.store_id) === String(hit.store_id) && !!readStoreName(info)
      if (!same) setStoreId(hit.store_id, hit)
      return
    }
    setStoreId(options[0].store_id, options[0])
  }

  function getUserStoreList(callback?: () => void, showLoading = false): Promise<unknown[]> {
    return fetchUserAuthStores(showLoading).then((res) => {
      storeList.value = Array.isArray(res) ? res : []
      uni.setStorageSync('qichengcloud_store_list', storeList.value)
      ensureSelectedStore()
      callback?.()
      return storeList.value
    })
  }

  function publishPageNav(): void {
    if (!isLoggedIn()) return
    syncLingyunPageNav(userInfo.value, userMenu.value)
  }

  function getUserInfo(callback?: () => void, showLoading = false): Promise<UserInfo> {
    return post<UserInfo>('/core/User/info', {}, showLoading).then((res) => {
      userInfo.value = res
      uni.setStorageSync('qichengcloud_user_info', res)
      publishPageNav()
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
      publishPageNav()
      callback?.()
      return res
    })
  }

  function refreshData(): void {
    publishPageNav()
    getUserInfo(undefined, false).then(() => {
      getUserMenu(undefined, false)
      getUserStoreList(undefined, false)
    })
  }

  function clearUser(): void {
    userInfo.value = null
    userMenu.value = null
    storeList.value = []
    storeId.value = null
    storeInfo.value = null
    uni.removeStorageSync('qichengcloud_select_store_id')
    uni.removeStorageSync('qichengcloud_select_store_info')
    uni.removeStorageSync('qichengcloud_store_list')
    clearLingyunPageNavSession()
  }

  ensureSelectedStore()
  publishPageNav()

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
    selectStore,
    storeList,
    storeOptions,
    storeId,
    storeInfo,
    storeName,
    clientId,
    getUserStoreList,
    getUserMenus,
    clearUser,
  }
})
