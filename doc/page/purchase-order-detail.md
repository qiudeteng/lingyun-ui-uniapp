# lingyun-purchase-order-detail

订货单详情标准页。数据驱动，包含状态头、配送 / 自提、商品清单、金额明细、物流进度、订货单信息与悬浮玻璃操作栏；支持审核拆单后的多批配送子订货单。不请求接口、不读写登录态，操作和跳转通过事件交给路由页。

- 演示：`/pages/demo/purchase-order-detail`
- 设计说明：`design/pages/demo/purchase-order-detail.md`
- 页面包：`lingyun-ui-page`

## 示例

```vue
<lingyun-purchase-order-detail
  :order="order"
  :toolbar-buttons="[{ key: 'more', icon: 'more', label: '更多' }]"
  toolbar-menu-enabled
  @back="goBack"
  @action="onAction"
  @item-click="onItem"
  @copy="onCopy"
>
  <template #toolbar-menu="{ close }">
    <!-- 业务自定义菜单 -->
  </template>
</lingyun-purchase-order-detail>
```

## 数据结构

```ts
interface LingyunPurchaseOrderDetailOrder {
  key?: string
  number: string
  status: 'pendingReview' | 'pendingPayment' | 'pendingShipment' | 'shipped' | 'completed' | 'cancelled' | 'refund'
  statusText?: string       // 覆盖状态标题
  statusHint?: string       // 覆盖状态提示
  statusIcon?: string       // 覆盖 lingyun-icon
  statusColor?: string      // 覆盖状态色
  createdAt: string
  paidAt?: string
  deliveryType?: 'delivery' | 'pickup'
  receiver?: { name: string; phone: string; address: string }
  pickup?: { storeName: string; address: string; phone?: string; time?: string }
  deliveryTime?: string
  /** 承运服务商，如京东快递 / 顺丰 / 自营物流 */
  carrier?: string
  /** 第三方快递单号；自营物流可不传 */
  trackingNumber?: string
  items: {
    key: string
    name: string
    image?: string
    specText?: string
    price: number
    originalPrice?: number
    quantity: number
    tag?: string
  }[]
  amounts: {
    goodsTotal: number
    deliveryFee?: number
    discount?: number       // 正数，展示为 -¥x
    coupon?: number         // 正数，展示为 -¥x
    payable: number
    paid?: number           // 未支付不传
  }
  paymentMethod?: string
  remark?: string
  subOrders?: {
    key: string
    number: string
    status: 'pendingReview' | 'pendingPayment' | 'pendingShipment' | 'shipped' | 'completed' | 'cancelled' | 'refund'
    statusText?: string
    statusHint?: string
    statusIcon?: string
    statusColor?: string
    deliveryType?: 'delivery' | 'pickup'
    deliveryTime?: string
    carrier?: string
    trackingNumber?: string
    warehouse?: { name: string; address?: string; phone?: string }
    amounts?: {
      goodsTotal: number
      deliveryFee?: number
      discount?: number
      coupon?: number
      payable: number
      paid?: number
    }
    items?: {
      key: string
      name: string
      image?: string
      specText?: string
      price: number
      originalPrice?: number
      quantity: number
      tag?: string
    }[]
    timeline?: { key?: string; time: string; title: string; description?: string; active?: boolean }[]
    actions?: LingyunPurchaseOrderDetailAction[]
    infoRows?: { label: string; value: string }[]
  }[]
  timeline?: { key?: string; time: string; title: string; description?: string; active?: boolean }[]
  actions?: LingyunPurchaseOrderDetailAction[]   // 传 [] 可隐藏操作栏；不传用状态默认操作
  infoRows?: { label: string; value: string }[]
}
```

- `deliveryType` 不传时：有 `receiver` 视为配送，有 `pickup` 视为自提。
- 待审核 / 待付款不显示预计送达时间；付款、审核通过后才显示。
- `amounts.paid` 有值时状态头显示「实付款」；只有待付款且未支付显示「需付款」；待审核默认已支付，不出现「需付款」；已取消显示「订货单金额」。
- 商品价格、金额均为数字；展示按 `priceDecimals` 格式化。

## 商品清单

- 商品数 > 1 时默认折叠：横向展示前 `maxThumbnails` 张商品图（多出显示 `+N`），底部「查看详情」。
- 点「查看详情」展开为完整商品列表（名称、规格、价格、数量），底部变为「收起详情」；点「收起详情」回到横向缩略图。
- 只有 1 个商品时直接显示完整列表，不显示展开 / 收起按钮；切换订货单时自动回到折叠态。
- 商品行点击抛 `item-click`，仅在展开的完整列表中可用。

## 物流信息

- 显示承运服务商与第三方快递单号：`carrier`（如京东快递 / 顺丰 / 自营物流）与 `trackingNumber`；快递单号带「复制」。
- 自营物流只传 `carrier`，不传 `trackingNumber` 时只显示服务商。
- 时间线只放物流节点（已出库 / 配送中 / 已签收等），**不要放支付、下单、审核、取消等订货单操作日志**；按新到旧排列，第一项默认高亮，可用 `active` 覆盖。
- 审核通过后才显示物流时间线；待审核 / 待付款不渲染该区块；没有服务商、单号和时间线时整个「物流信息」区块隐藏。

## 多批配送 / 子订货单

审核拆单后传 `subOrders`。主订货单详情页只显示：

- 每个子订货单的编号、状态、发货仓库；发货仓库行右侧显示预计日期：待发货「预计 MM-DD 发货」、待收货「预计 MM-DD 送达」，右对齐，只显示日期；
- 商品横向缩略图：最多显示 `maxThumbnails` 张（默认 3），多出的显示 `+N`，右侧显示总件数与子订货单金额；
- 只显示最后一条物流日志的说明和时间（时间用 `lingyun-date-text`，保留 MM-DD HH:mm，不显示日志标题；`timeline` 按新到旧排列，取第一项）；
- 「查看子订货单详情」入口。

主订货单有子订货单时隐藏顶部状态卡，不再用单一状态概括主订货单，以每个子订货单的状态为准；配送 / 自提卡片也不再显示父订货单的预计送达时间。配送 / 自提卡片是静态信息，没有右侧箭头，不可点击。

子订货单右侧状态按状态色区分：待审核紫、待付款橙、待发货靛蓝、待收货蓝、已完成绿、已取消灰、退款中红；`subOrder.statusColor` 可覆盖。

点击子订货单抛：

```ts
sub-purchase-order-click: { order, subOrder }
```

子订货单详情可以继续复用 `lingyun-purchase-order-detail`，先用 `buildLingyunPurchaseOrderSubDetail` 把父子订货单拍平：

```ts
import { buildLingyunPurchaseOrderSubDetail } from '@/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-detail/subPurchaseOrder'

const detail = buildLingyunPurchaseOrderSubDetail(parentOrder, subOrder)
// detail 是单订货单结构：状态、商品、金额、完整物流、操作都在里面
```

拍平结果会把「所属订货单」「发货仓库 / 仓库地址 / 仓库电话」放进 `infoRows`，子订货单有独立 `amounts` / `items` / `timeline` / `actions` 时优先使用。每个子订货单可以来自不同仓库，发货仓库信息就显示在子订货单详情的订货单信息里。子订货单详情不展示预计送达时间，`buildLingyunPurchaseOrderSubDetail` 不复制 `deliveryTime`。

## 状态与默认操作

| status | 标题 | 默认操作 |
| --- | --- | --- |
| `pendingReview` | 待审核 | 取消订货单（destructive） |
| `pendingPayment` | 待付款 | 取消订货单（destructive）· 去支付 |
| `pendingShipment` | 待发货 | 提醒发货 |
| `shipped` | 待收货 | 确认收货 |
| `completed` | 已完成 | 申请售后 · 再来一单 |
| `cancelled` | 已取消 | 再来一单 |
| `refund` | 退款中 | 退款详情 |

传 `order.actions` 可完全覆盖默认操作；`actions: []` 会隐藏底部操作栏。

## 待付款倒计时

- 待付款从 `order.createdAt` 起算，默认 15 分钟，可用 `paymentTimeoutMinutes` 调整。
- 状态头提示下方显示「支付剩余 mm:ss」，每秒更新。
- 倒计时到 0 时抛 `payment-timeout`，业务把订货单更新为已取消；组件不展示「支付已超时」页面。
- 切换订货单 / 状态时重新计时，组件卸载时停止计时；底部保留「取消订货单 / 去支付」。

```ts
interface LingyunPurchaseOrderDetailAction {
  key: string
  text: string
  variant?: 'bordered' | 'borderless' | 'glass' | 'borderedProminent'
  role?: 'normal' | 'destructive' | 'success' | 'warning' | 'cancel'
  disabled?: boolean
}
```

不传 `variant` 时，最后一个操作用 `borderedProminent`，其余用 `bordered`。

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `order` | 订货单数据；`null` 显示空态 | null |
| `loading` / `loadingText` | 加载态 / 文案 | false / 加载中… |
| `emptyText` | 空态文案 | 订货单不存在 |
| `title` | 顶部工具栏标题 | 订货单详情 |
| `showToolbar` / `showBack` / `showNav` | 透传 `lingyun-app-page` | true / true / true |
| `autoTopInset` | 工具栏是否自动留顶部安全区；仅在 `scrollUnderToolbar=false` 时生效 | true |
| `autoBack` | 返回钮默认返回上一页；false 时只抛 `back`，由页面处理 | true |
| `scrollUnderToolbar` | 内层滚动内容从顶栏下方穿过，滚动时顶栏渐显液态玻璃；false 用 `lingyun-app-page` 留白 | true |
| `showThemeSwitch` | 页面级主题钮开关：auto 跟随全局，false 只隐藏当前页 | auto |
| `toolbarButtons` | 工具栏自定义按钮组，与主题钮同组 | [] |
| `toolbarMenuEnabled` | 工具栏按钮点击弹出 `#toolbar-menu`；小程序需显式开启 | false |
| `currency` | 货币符号 | ¥ |
| `priceDecimals` | 价格小数位；`-1` 去掉多余 0 | 2 |
| `maxThumbnails` | 子订货单行横向最多显示的商品图数量，多出的显示 `+N` | 3 |
| `paymentTimeoutMinutes` | 待付款倒计时分钟数，从 `order.createdAt` 起算 | 15 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `back` | — | 点返回；`autoBack=true` 时默认返回上一页 |
| `action` | `{ key, action, order }` | 点底部操作；不自动支付 / 跳转 |
| `item-click` | `{ item, index, order }` | 点商品行 |
| `sub-purchase-order-click` | `{ order, subOrder }` | 多批配送时点子订货单行；由页面打开子订货单详情 |
| `copy` | `{ text }` | 点复制订货单号；复制尝试完成后抛出，业务可自己提示 |
| `payment-timeout` | `{ order }` | 待付款倒计时到 0；业务应把订货单更新为已取消 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `toolbar-menu` | 工具栏按钮菜单内容，作用域 `{ button, index, groupIndex, buttonIndex, close }`；需配合 `toolbarButtons` + `toolbarMenuEnabled` |

## 接入说明

- 标准页内部用 `lingyun-app-page`，整页固定高度、内容区自管滚动；不要再外层包 `scroll-view`。
- 底部操作栏是悬浮玻璃胶囊（左右 12、底部 8 + 安全区、高 62、圆角 31、`lingyun-glass-control`），在滚动区之外；左侧显示需付款 / 实付款金额，右侧操作按钮。待发货 / 待收货 / 退款中不显示底部操作栏；待付款保留「取消订货单 / 去支付」，待审核 / 已完成 / 已取消显示；没有操作时也不显示。
- 内层 `scroll-view` 会把滚动位置上报 `lingyun-app-page`，顶栏默认透明、滚动后渐显 Liquid Glass。
- 宽屏内容最大宽度 720px、居中，保留应用导航列（可传 `:show-nav="false"`）。
- 订货单状态色、商品图、备注等全部来自 props；接口请求与按钮业务放在路由页。
- 所有尺寸 px；微信小程序可编译。
