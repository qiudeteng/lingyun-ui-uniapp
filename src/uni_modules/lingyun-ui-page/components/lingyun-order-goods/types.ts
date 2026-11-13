/** 订单商品加购页数据结构。组件只消费这些数据，不请求接口。 */

export interface LingyunOrderStore {
  /** 店铺名称 */
  name: string
  /** 店铺 logo 图片 */
  logo?: string
  /** 无 logo 时的 lingyun-icon 字形，由使用方传入 */
  icon?: string
  /** 无 logo、无 icon 时显示的文字；不传则用名称首字 */
  mark?: string
  /** 评分，如 4.8 */
  rating?: string | number
  /** 月售文案，如「月售 1000+」 */
  salesText?: string
  /** 配送时长文案，如「约 23 分钟」 */
  deliveryText?: string
  /** 店铺提示，如「温馨提示：请适量点餐」 */
  notice?: string
}

export interface LingyunOrderSpec {
  /** 规格唯一 key，同一商品内不要重复；不要包含 `::` */
  key: string
  /** 规格文案，如「6 寸」「大杯」 */
  text: string
  /** 规格图片；购物车行没有带图的属性时显示 */
  image?: string
  /** 规格价格；不传用商品价格 */
  price?: number
  /** 规格划线原价；不传用商品原价 */
  originalPrice?: number
  /** 该规格售罄 */
  soldOut?: boolean
  /** 该规格库存；不传表示不限库存，0 视为售罄，各规格独立判断 */
  stock?: number
  /** 该规格单次最大数量；不传用商品 max / 组件 maxCount */
  max?: number
}

export interface LingyunOrderAttributeOption {
  /** 选项 key，同一分组内不要重复；不要包含 `=` */
  key: string
  /** 选项文案，如「草莓」「少糖」 */
  text: string
  /** 选项图片；购物车行优先显示第一个带图的已选属性 */
  image?: string
  /** 选项不可选 */
  disabled?: boolean
  /** 选项启用状态；false 等价于 disabled，便于后台直接返回 enabled */
  enabled?: boolean
}

export interface LingyunOrderAttributeGroup {
  /** 属性分组 key，如「top-flavor」；不要包含 `=` */
  key: string
  /** 分组标题，如「上层口味」 */
  title: string
  /** 必选：至少选 1 项 */
  required?: boolean
  /** 最多选择几个（数量合计）；1 或省略为单选，>1 为多选。多选时同一选项也可加数量，但合计不超过 max */
  max?: number
  options: LingyunOrderAttributeOption[]
}

export interface LingyunOrderGoods {
  /** 商品唯一 key，购物车数量按它存；不要包含 `::` */
  key: string
  name: string
  /** 商品图；空则用名称首字兜底 */
  image?: string
  /** 商品详情多图；有值时详情页显示「大图 + 底部横排缩略图」，第一张为主图 */
  images?: string[]
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
  /** 商品详情介绍，支持 \n 分段；不传时回退到 details */
  description?: string
  /** 价格单位，如「元/件」；显示在金额后面 */
  priceUnit?: string
  /** 数量单位，如「件」；列表与已选商品步进器右侧显示 */
  quantityUnit?: string
  /** 商品角标，如「招牌」 */
  badge?: string
  /** 规格列表：有 specs 且没有 attributeGroups 时，点 + 打开规格列表 Sheet，逐个规格加减 */
  specs?: LingyunOrderSpec[]
  /** 属性分组：与规格相互独立；有属性时打开规格 / 属性选择 Sheet */
  attributeGroups?: LingyunOrderAttributeGroup[]
  /** 多规格商品：点 + 不直接加购，抛 spec-request 由业务选规格（旧用法；有 specs / attributeGroups 时以新数据为准） */
  multiSpec?: boolean
  /** 单次加购数量，默认 1 */
  step?: number
  /** 单项最大数量，默认取组件 maxCount */
  max?: number
  /** 商品库存；不传表示不限库存。有 specs 时以规格库存为准，此字段用于无规格商品 */
  stock?: number
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

/** 购物车：行 key → 数量；数量为 0 的项不写。
 *  无规格 / 属性的商品行 key 就是商品 key；规格 / 属性组合行由组件生成，
 *  宿主当作不透明 key 使用，行信息从 change / checkout 的 lines 读取。 */
export type LingyunOrderCart = Record<string, number>

/** 购物车行上的属性快照：即使商品数据重新加载也能显示当时的选择 */
export interface LingyunOrderCartAttribute {
  groupKey: string
  groupTitle: string
  optionKey: string
  optionText: string
  /** 该选项在本组合内的数量；单选项为 1 */
  quantity?: number
  /** 选项图片快照；用于购物车行缩略图 */
  optionImage?: string
}

export interface LingyunOrderCartLine {
  /** 购物车行 key；无规格商品等于 item.key，规格 / 属性组合为组件生成的行 key */
  key: string
  item: LingyunOrderGoods
  categoryKey: string
  quantity: number
  /** 该行选择的规格 */
  spec?: LingyunOrderSpec
  /** 该行选择的属性（按分组顺序） */
  attributes?: LingyunOrderCartAttribute[]
}

export interface LingyunOrderChangePayload {
  item: LingyunOrderGoods
  /** 当前行的数量 */
  quantity: number
  cart: LingyunOrderCart
  count: number
  totalPrice: number
  /** 发生变化的具体行 key */
  key?: string
  /** 规格行 / 组合行的规格 */
  spec?: LingyunOrderSpec
  /** 规格行 / 组合行的属性 */
  attributes?: LingyunOrderCartAttribute[]
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

/** 顶部工具栏自定义按钮；一维一组，二维拆成多个玻璃胶囊 */
export interface LingyunOrderToolbarButton {
  key: string
  /** lingyun-icon 字形；没有时显示 label 文本 */
  icon?: string
  label?: string
  disabled?: boolean
}

export type LingyunOrderToolbarButtonGroups =
  | LingyunOrderToolbarButton[]
  | LingyunOrderToolbarButton[][]
