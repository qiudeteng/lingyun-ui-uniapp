export type LingyunPaginationSize = 'default' | 'small'

export interface LingyunPaginationChangePayload {
  page: number
  pageSize: number
  pageCount: number
}

export interface LingyunPaginationItem {
  key: string
  page: number
  ellipsis: boolean
}
