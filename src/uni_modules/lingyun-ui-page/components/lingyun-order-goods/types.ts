/** 订单商品加购页数据结构。组件只消费这些数据，不请求接口。 */

export interface LingyunOrderStore {
  /** 店铺名称 */
  name: string
  /** 店铺 logo；空则用名称首字兜底 */
  logo?: string
  /** 评分，如 4.8 */
  rating?: string | number
  /** 月售文案，如「月售 1000+」 */
  salesText?: string
  /** 配送时长文案，如「约 23 分钟」 */
  deliveryText?: string
  /** 店铺提示，如「温馨提示：请适量点餐」 */
  notice?: string
}

export interface LingyunOrderGoods {
  /** 商品唯一 key，购物车数量按它存 */
  key: string
  name: string
  /** 商品图；空则用名称首字兜底 */
  image?: string
  /** 现价 */
  price: number
  /** 划线原价 */
  originalPrice?: number
  /** 销量 / 门店排名等说明 */
  salesText?: string
  /** 规格说明，如「12 只 / 1 人份」 */
  specText?: string
  /** 商品下方多行说明：发货仓库、规格描述、截单时间、预计配送等 */
  details?: string[]
  /** 价格单位，如「元/件」；显示在金额后面 */
  priceUnit?: string
  /** 数量单位，如「件」；列表与已选商品步进器右侧显示 */
  quantityUnit?: string
  /** 商品角标，如「招牌」 */
  badge?: string
  /** 多规格商品：点 + 不直接加购，抛 spec-request 由业务选规格 */
  multiSpec?: boolean
  /** 单次加购数量，默认 1 */
  step?: number
  /** 单项最大数量，默认取组件 maxCount */
  max?: number
  /** 售罄 */
  soldOut?: boolean
}

export interface LingyunOrderCategory {
  /** 分类唯一 key */
  key: string
  /** 左侧分类名 */
  text: string
  /** 右侧分组标题，默认同 text */
  title?: string
  /** 分类名左侧小图标地址（后台返回的图片 URL），与文字同大小；优先于 icon */
  iconSrc?: string
  /** 分类名左侧小图标字形；没有 iconSrc 时使用 */
  icon?: string
  /** 图标颜色，默认跟随次要文字色 */
  iconColor?: string
  /** 分类角标 */
  badge?: string | number
  goods: LingyunOrderGoods[]
}

/** 购物车：商品 key → 数量；数量为 0 的项不写 */
export type LingyunOrderCart = Record<string, number>

export interface LingyunOrderCartLine {
  item: LingyunOrderGoods
  categoryKey: string
  quantity: number
}

export interface LingyunOrderChangePayload {
  item: LingyunOrderGoods
  quantity: number
  cart: LingyunOrderCart
  count: number
  totalPrice: number
}

export interface LingyunOrderCategoryChangePayload {
  key: string
  index: number
}

export interface LingyunOrderCheckoutPayload {
  cart: LingyunOrderCart
  lines: LingyunOrderCartLine[]
  count: number
  totalPrice: number
  deliveryFee: number
}

export interface LingyunOrderGoodsClickPayload {
  item: LingyunOrderGoods
  categoryKey: string
}

export interface LingyunOrderSpecPayload {
  item: LingyunOrderGoods
  categoryKey: string
}
