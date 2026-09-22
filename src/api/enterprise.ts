import { post } from '@/utils/request'
import type { EnterpriseInfo } from '@/stores/app'

export function fetchEnterpriseInfo() {
  return post<EnterpriseInfo>('/open/Enterprise/getInfo', undefined, false)
}
