/** 订货单详情标准页的数据结构。所有金额为数字，展示时按 priceDecimals 格式化。 */

export type LingyunPurchaseOrderDetailStatus =
  | 'pendingReview'
  | 'pendingPayment'
  | 'pendingShipment'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refund'

export type LingyunPurchaseOrderDetailDeliveryType = 'delivery' | 'pickup'

export interface LingyunPurchaseOrderDetailReceiver {
  name: string
  phone: string
  address: string
}

export interface LingyunPurchaseOrderDetailPickup {
  storeName: string
  address: string
  phone?: string
  time?: string
}

export interface LingyunPurchaseOrderDetailItem {
  key: string
  name: string
  image?: string
  specText?: string
  price: number
  originalPrice?: number
  quantity: number
  tag?: string
}

export interface LingyunPurchaseOrderDetailAmounts {
  goodsTotal: number
  deliveryFee?: number
  /** 优惠金额，正数，展示为 -¥x */
  discount?: number
  /** 优惠券金额，正数，展示为 -¥x */
  coupon?: number
  payable: number
  /** 已支付金额；未支付时不传 */
  paid?: number
}

export interface LingyunPurchaseOrderDetailTimelineStep {
  key?: string
  time: string
  title: string
  description?: string
  /** 高亮节点；不传时第一项高亮 */
  active?: boolean
}
export type LingyunPurchaseOrderDetailActionVariant =
  | 'bordered'
  | 'borderless'
  | 'glass'
  | 'borderedProminent'

export type LingyunPurchaseOrderDetailActionRole =
  | 'normal'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'cancel'

export interface LingyunPurchaseOrderDetailAction {
  key: string
  text: string
  variant?: LingyunPurchaseOrderDetailActionVariant
  role?: LingyunPurchaseOrderDetailActionRole
  disabled?: boolean
}

export interface LingyunPurchaseOrderDetailInfoRow {
  label: string
  value: string
}

/** 审核后拆分出的子订货单 / 批次；每批有自己的状态与物流。 */
export interface LingyunPurchaseOrderDetailSubOrder {
  key: string
  number: string
  status: LingyunPurchaseOrderDetailStatus
  statusText?: string
  statusHint?: string
  statusIcon?: string
  statusColor?: string
  deliveryType?: LingyunPurchaseOrderDetailDeliveryType
  /** 当前批次的预计时间：待发货填预计发货，待收货填预计送达（缺省回退主订货单 deliveryTime） */
  deliveryTime?: string
  carrier?: string
  trackingNumber?: string
  /** 这一批发货的仓库；不同子订货单可能来自不同仓库 */
  warehouse?: {
    name: string
    address?: string
    phone?: string
  }
  amounts?: LingyunPurchaseOrderDetailAmounts
  items?: LingyunPurchaseOrderDetailItem[]
  /** 物流进度，按新到旧排列；只放物流节点，不放支付 / 下单 / 审核等订货单操作日志 */
  timeline?: LingyunPurchaseOrderDetailTimelineStep[]
  actions?: LingyunPurchaseOrderDetailAction[]
  infoRows?: LingyunPurchaseOrderDetailInfoRow[]
}

export interface LingyunPurchaseOrderDetailSubOrderPayload {
  order: LingyunPurchaseOrderDetailOrder
  subOrder: LingyunPurchaseOrderDetailSubOrder
}

export interface LingyunPurchaseOrderDetailOrder {
  key?: string
  number: string
  status: LingyunPurchaseOrderDetailStatus
  /** 覆盖状态标题 / 提示 / 图标 / 颜色 */
  statusText?: string
  statusHint?: string
  statusIcon?: string
  statusColor?: string
  createdAt: string
  paidAt?: string
  deliveryType?: LingyunPurchaseOrderDetailDeliveryType
  receiver?: LingyunPurchaseOrderDetailReceiver
  pickup?: LingyunPurchaseOrderDetailPickup
  deliveryTime?: string
  /** 承运服务商，如 京东快递 / 顺丰 / 自营物流 */
  carrier?: string
  /** 第三方快递单号；自营物流可不传 */
  trackingNumber?: string
  items: LingyunPurchaseOrderDetailItem[]
  amounts: LingyunPurchaseOrderDetailAmounts
  paymentMethod?: string
  remark?: string
  /** 多批配送：审核后拆分的子订货单；有值时详情按子订货单分组展示商品与物流 */
  subOrders?: LingyunPurchaseOrderDetailSubOrder[]
  /** 按新到旧排列；第一项默认作为最新日志高亮 */
  timeline?: LingyunPurchaseOrderDetailTimelineStep[]
  /** 传了就用它（空数组表示不显示操作栏）；不传按状态使用默认操作 */
  actions?: LingyunPurchaseOrderDetailAction[]
  infoRows?: LingyunPurchaseOrderDetailInfoRow[]
}

export interface LingyunPurchaseOrderDetailActionPayload {
  key: string
  action: LingyunPurchaseOrderDetailAction
  order: LingyunPurchaseOrderDetailOrder
  subOrder?: LingyunPurchaseOrderDetailSubOrder
}

export interface LingyunPurchaseOrderDetailItemPayload {
  item: LingyunPurchaseOrderDetailItem
  index: number
  order: LingyunPurchaseOrderDetailOrder
  subOrder?: LingyunPurchaseOrderDetailSubOrder
}

export interface LingyunPurchaseOrderDetailCopyPayload {
  text: string
}

export interface LingyunPurchaseOrderDetailPaymentTimeoutPayload {
  order: LingyunPurchaseOrderDetailOrder
}

export interface LingyunPurchaseOrderDetailToolbarButton {
  key: string
  icon?: string
  label?: string
  disabled?: boolean
}

export type LingyunPurchaseOrderDetailToolbarButtons =
  | LingyunPurchaseOrderDetailToolbarButton[]
  | LingyunPurchaseOrderDetailToolbarButton[][]
