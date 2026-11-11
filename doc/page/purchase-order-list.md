# lingyun-purchase-order-list

订货单列表标准页。顶部状态 Tabs + 订货单卡片：列表业务状态固定为**全部 / 待审核 / 进行中 / 已完成 / 已取消**；卡片只显示订货单号与业务状态，商品改为横向缩略图，底栏显示时间、包裹数与操作。不请求接口、不读写登录态，筛选、点订货单、操作和加载更多都通过事件交给路由页。

- 演示：`/pages/demo/purchase-order-list`（点订货单进入 `/pages/demo/purchase-order-detail`）
- 设计说明：`design/pages/demo/purchase-order-list.md`
- 页面包：`lingyun-ui-page`

## 示例

```vue
<lingyun-purchase-order-list
  v-model:filter="filter"
  :orders="orders"
  :loading="loading"
  :has-more="hasMore"
  :loading-more="loadingMore"
  @back="goBack"
  @purchase-order-click="openOrder"
  @action="onAction"
  @load-more="loadMore"
/>
```

## 数据结构

```ts
type LingyunPurchaseOrderListStatus =
  | 'pendingReview'
  | 'inProgress'
  | 'completed'
  | 'cancelled'

interface LingyunPurchaseOrderListOrder {
  key?: string
  number: string
  /** 详情页的细状态 */
  status:
    | 'pendingReview'
    | 'pendingPayment'
    | 'pendingShipment'
    | 'shipped'
    | 'completed'
    | 'cancelled'
    | 'refund'
  /** 覆盖列表业务状态；不传时由 status 推导 */
  listStatus?: LingyunPurchaseOrderListStatus
  /** 覆盖卡片右侧状态文案 / 颜色 */
  listStatusText?: string
  listStatusColor?: string
  createdAt?: string
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
    discount?: number
    coupon?: number
    payable: number
    paid?: number
  }
  actions?: {
    key: string
    text: string
    variant?: 'bordered' | 'borderless' | 'glass' | 'borderedProminent'
    role?: 'normal' | 'destructive' | 'success' | 'warning' | 'cancel'
    disabled?: boolean
  }[]
  /** 多批配送子订货单；列表显示「分 N 个包裹」 */
  subOrders?: {
    key: string
    number: string
    status: LingyunPurchaseOrderDetailStatus
    /* 字段与 lingyun-purchase-order-detail 的 LingyunPurchaseOrderDetailSubOrder 一致 */
  }[]
}
```

- 列表按业务状态筛选和展示：

  | 业务状态 | 对应详情细状态 |
  | --- | --- |
  | `pendingReview` 待审核 | `pendingReview` |
  | `inProgress` 进行中 | `pendingPayment` / `pendingShipment` / `shipped` / `refund` |
  | `completed` 已完成 | `completed` |
  | `cancelled` 已取消 | `cancelled` |

- 想自定义某个订货单的归类时传 `listStatus`；想改卡片右上角文案 / 颜色时传 `listStatusText` / `listStatusColor`。订货单详情的 `statusText` / `statusColor` 只影响详情页，不影响列表卡片。
- 金额展示 `paid` 优先；卡片右侧只显示总金额，不再显示「需付款 / 实付款」标签。

## 卡片布局

- 标题行：左侧订货单号（单行截断），右侧业务状态（待审核紫 / 进行中蓝 / 已完成绿 / 已取消灰）。
- 商品行：横向排列商品缩略图，默认最多显示 `maxThumbnails` 张（3 张）；商品更多时在末尾显示 `+N`，不再纵向铺开全部商品。右侧显示「共 N 件」与总金额。
- 底栏：左侧用 `lingyun-date-text` 显示下单时间（今天 / 昨天 + `HH:mm`），多批配送追加「分 N 个包裹」；右侧是状态操作按钮。操作按钮阻止冒泡，不会触发 `purchase-order-click`。
- 商品图片缺失时用商品名首字兜底。

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `orders` | 订货单数组 | [] |
| `filter` | 当前筛选 key；支持 `v-model:filter` | all |
| `filters` | 自定义筛选 `[{ key, text }]`；空则使用全部 / 待审核 / 进行中 / 已完成 / 已取消 | [] |
| `loading` / `loadingText` | 首次加载 / 文案 | false / 加载中… |
| `loadingMore` / `loadingMoreText` | 加载更多 / 文案 | false / 加载中… |
| `hasMore` | 是否还有下一页；滚动到底部且为真时抛 `load-more` | false |
| `emptyText` | 空态文案 | 暂无订货单 |
| `noMoreText` | 没有更多文案 | 没有更多订货单 |
| `maxThumbnails` | 卡片横向最多显示的商品图数量，多出的显示 `+N` | 3 |
| `title` | 顶部工具栏标题 | 订货单列表 |
| `showToolbar` / `showBack` / `showNav` | 透传 `lingyun-app-page` | true / true / true |
| `autoTopInset` | 工具栏是否自动留顶部安全区 | true |
| `autoBack` | 返回钮默认返回上一页；false 时只抛 `back`，由页面处理 | true |
| `scrollUnderToolbar` | 列表从顶栏下方穿过，滚动时顶栏渐显液态玻璃；状态 Tabs 由工具栏数据驱动 | true |
| `showThemeSwitch` | 页面级主题钮开关：auto 跟随全局，false 只隐藏当前页 | auto |
| `currency` / `priceDecimals` | 货币符号 / 价格小数位；`-1` 去掉多余 0 | ¥ / 2 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `purchase-order-click` | `{ order, index }` | 点订货单卡片；由页面打开订货单详情 |
| `action` | `{ key, action, order }` | 点卡片底部操作；不自动支付 / 跳转 |
| `filter-change` | `{ key, filter }` | 切换筛选 Tab |
| `update:filter` | `key` | 配合 `v-model:filter` |
| `load-more` | — | 滚动到底部且 `hasMore` 时抛出 |
| `scroll` | `scrollTop` | 列表内层滚动；分栏模式下宿主用它驱动工具栏玻璃进度 |
| `back` | — | 点返回；`autoBack=true` 时默认返回上一页 |

## 筛选与默认操作

- 状态筛选通过 `lingyun-app-page` 的 `segments` + `segmentControl="tabs"` 渲染成工具栏下方的顶部 Tabs，切换后在本地按业务状态过滤并回到列表顶部；如果宿主需要服务端筛选，可在 `filter-change` 后重新请求并回写 `orders`。
- 不传 `order.actions` 时按**详情细状态**使用默认操作：待审核「取消订货单」、待付款「取消订货单 / 去支付」、待发货「提醒发货」、待收货「确认收货」、已完成「申请售后 / 再来一单」、已取消「再来一单」、退款中「退款详情」。

## 加载与空态

- `loading` 时显示整页加载态；`orders` 为空显示 `emptyText`。
- 滚动到底部、`hasMore` 为真且不在 `loadingMore` 时抛 `load-more`；加载更多时显示转圈，没有更多时显示 `noMoreText`。

## 接入说明

- 标准页内部用 `lingyun-app-page`，状态 Tabs 由工具栏 `segments` 数据驱动，订货单列表自管滚动；不要再外层包 `scroll-view`。
- 宽屏内容最大宽度 720px、居中，保留应用导航列（可传 `:show-nav="false"`）。
- 订货单数据全部走 props；接口、筛选请求、支付 / 确认收货 / 跳转等业务放在路由页。
- 所有尺寸 px；微信小程序可编译。

## 分栏复用

标准页已拆成「页面壳 + 内容面板」：内容面板在同目录 `lingyun-purchase-order-list-panel.vue`。需要做列表 + 详情分栏时直接引入面板自行提供 toolbar / 布局即可（参考 demo `/pages/demo/purchase-order-split`）：

```vue
<lingyun-purchase-order-list-panel
  :orders="orders"
  :top-space="headerHeight"
  @purchase-order-click="onSelect"
  @scroll="onScroll"
/>
```

| 面板属性 / 事件 | 说明 |
| --- | --- |
| `topSpace` | 顶部占位高度 px（浮层 toolbar 的高度）；0 用页面壳的 `--lingyun-app-page-bar` |
| `full` | full 宽度模式：内容区不留左右留白、卡片通宽直角（上下间距保留；对齐 `lingyun-section` 的 full，用于分栏左栏这类窄栏） |
| `selectedKey` | 分栏选中项 key（`order.key \|\| order.number`）；空串不显示选中态，选中卡片用页面底色（`--lingyun-bg-grouped-primary`）填充，对齐列表与详情 demo |
| `scroll` | `scrollTop`，供宿主驱动工具栏玻璃进度 |

其余数据 / 事件与标准页一致；标准页行为不受影响。
