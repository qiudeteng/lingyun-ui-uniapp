import { defineStore } from 'pinia'
import { ref } from 'vue'
import { post } from '@/utils/request'

export type EnterpriseInfo = {
  enterprise_key?: string
  enterprise_code?: string
  enterprise_name?: string
  enterprise_logo?: string
  [key: string]: unknown
}

export const useAppStore = defineStore('app', () => {
  const cached = uni.getStorageSync('qichengcloud_enterprise')
  const enterprise = ref<EnterpriseInfo | null>(cached || null)

  function getEnterprise(): Promise<EnterpriseInfo> {
    return post<EnterpriseInfo>('/open/Enterprise/getInfo', undefined, false).then((res) => {
      enterprise.value = res
      uni.setStorageSync('qichengcloud_enterprise', res)
      return res
    })
  }

  return {
    enterprise,
    getEnterprise,
  }
})
