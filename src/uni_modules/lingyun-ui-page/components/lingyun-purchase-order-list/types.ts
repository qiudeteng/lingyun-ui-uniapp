import type {
  LingyunPurchaseOrderDetailAction,
  LingyunPurchaseOrderDetailAmounts,
  LingyunPurchaseOrderDetailItem,
  LingyunPurchaseOrderDetailStatus,
  LingyunPurchaseOrderDetailSubOrder,
} from '../lingyun-purchase-order-detail/types'

/** 列表展示的业务状态；支付 / 发货 / 物流等细节状态统一归入「进行中」。 */
export type LingyunPurchaseOrderListStatus =
  | 'pendingReview'
  | 'inProgress'
  | 'completed'
  | 'cancelled'

export type LingyunPurchaseOrderListFilterKey = 'all' | LingyunPurchaseOrderListStatus

export interface LingyunPurchaseOrderListFilter {
  key: LingyunPurchaseOrderListFilterKey
  text: string
}

export interface LingyunPurchaseOrderListOrder {
  key?: string
  number: string
  /** 详情页的细状态 */
  status: LingyunPurchaseOrderDetailStatus
  /** 覆盖列表业务状态；不传时由 status 推导 */
  listStatus?: LingyunPurchaseOrderListStatus
  /** 覆盖列表卡片右侧状态文案 / 颜色 */
  listStatusText?: string
  listStatusColor?: string
  statusText?: string
  statusHint?: string
  statusColor?: string
  createdAt?: string
  items: LingyunPurchaseOrderDetailItem[]
  amounts: LingyunPurchaseOrderDetailAmounts
  actions?: LingyunPurchaseOrderDetailAction[]
  /** 多批配送的子订货单；列表用于显示「分 N 个包裹」 */
  subOrders?: LingyunPurchaseOrderDetailSubOrder[]
}

export interface LingyunPurchaseOrderListOrderPayload {
  order: LingyunPurchaseOrderListOrder
  index: number
}

export interface LingyunPurchaseOrderListActionPayload {
  key: string
  action: LingyunPurchaseOrderDetailAction
  order: LingyunPurchaseOrderListOrder
}

export interface LingyunPurchaseOrderListFilterPayload {
  key: LingyunPurchaseOrderListFilterKey
  filter: LingyunPurchaseOrderListFilter | null
}
