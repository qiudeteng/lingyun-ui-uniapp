# lingyun-ui-page

标准页面扩展。当前版本 **1.1.7**，变更见 [`changelog.md`](./changelog.md)。控件仍在 `lingyun-ui`，这里只放可复用的整页，例如登录、点单加购。

路由仍登记在业务工程的 `pages.json` / `src/pages`。页面里直接写标签，账号请求、登录态和跳转留在路由文件。

`components/lingyun-ui-page/lingyun-ui-page.vue` 是空文件，保留它，不要删，也不要往里写页面。

## 登录

```vue
<lingyun-login
  :logo="logo"
  :enterprise-name="enterpriseName"
  :booting="booting"
  demo-text="组件演示"
  @submit="onSubmit"
  @demo="goDemo"
  @policy="openPolicy"
/>
```

| 属性 | 说明 | 默认 |
|------|------|------|
| `logo` | 企业 logo，空则不显示 | '' |
| `enterpriseName` | 标题上的企业名称，空则不显示 | '' |
| `hint` | logo 下方的说明 | 内部管理使用，不提供注册功能 |
| `booting` | 为真时只显示转圈，用于静默登录 | false |
| `submitText` | 登录按钮文案 | 立即登录 |
| `demoText` | 登录按钮下方的次按钮。空则不显示 | '' |
| `copyright` | 登录按钮下方的版权水印，空则不显示 | '' |

| 事件 | 说明 |
|------|------|
| `submit` | 账号、密码和协议都通过后触发，参数 `{ username, password }` |
| `demo` | 点次按钮。组件不跳转，页面自己打开目标页 |
| `policy` | 点协议链接时仍会抛出。`user` 用户服务协议，`privacy` 隐私政策。组件自己用全屏 Sheet 展示正文，页面不必再跳转 |

未填账号、密码短于 6 位或未勾选协议时，组件自己弹出 Toast，不会触发 `submit`。

## 订单商品加购

左右布局的标准点单页：店铺头 + 左侧分类 + 右侧商品 + 底部悬浮购物车，数据驱动，参考美团外卖点单页。点商品图 / 名称打开大模式商品详情 Sheet（商品介绍）。

商品按数据自动区分四种加购方式：

1. 无规格、无属性：点 + 直接加购。
2. 只有规格：弹出规格列表 Sheet，每个规格直接加减；再次打开会显示各规格已选数量。
3. 规格 + 属性：弹出 Sheet，先单选规格，下面按分组选属性；分组支持必选 / 可选、`max` 为 1 时单选、>1 时多选；底部对当前「规格 + 属性」组合加购 / 步进。
4. 只有属性：同第 3 种，不显示规格选择。

属性与规格相互独立。购物车按「规格 + 属性组合」分行，行内每行显示一个选择；缩略图优先取带图的属性选项，其次规格图，最后商品图。

```vue
<lingyun-order-goods
  v-model="cart"
  :store="store"
  :categories="categories"
  :min-price="20"
  :delivery-fee="5"
  @back="goBack"
  @checkout="onCheckout"
/>
```

| 属性 | 说明 | 默认 |
|------|------|------|
| `store` | 店铺信息 `{ name, logo, rating, salesText, deliveryText, notice }` | 必填 |
| `categories` | 分类与商品 `[{ key, text, title, badge, goods }]` | `[]` |
| `modelValue` | 购物车 `{ [行 key]: 数量 }`，支持 `v-model`；无规格商品行 key 等于商品 key，规格 / 属性组合行由组件生成，宿主当作不透明 key | `{}` |
| `details` / `description` / `images` / `specs` / `attributeGroups` / `priceUnit` / `quantityUnit` | 商品扩展：列表说明 / 详情介绍 / 详情多图 / 规格 / 属性分组 / 价格后缀 / 步进器单位 | — |
| `banner` / `bannerHeight` | 店铺 Banner 图 / 高度，0 不显示；也可用 `#banner` 插槽 | '' / 140 |
| `minPrice` / `deliveryFee` | 起送价 / 配送费 | 0 / 0 |
| `showBack` | 返回钮（Banner 左上角 / 无 Banner 时顶行），点击抛 `back` | true |
| `showNav` / `showToolbar` / `title` | 透传 `lingyun-app-page`；`showNav` 默认保留宽屏导航列 | true / false / '' |
| `autoTopInset` | 工具栏是否自动给页面留出顶部安全区；`false` 时 Banner 顶到页面顶部、垫在透明工具栏下（搜索时自动恢复留白） | true |
| `toolbarButtons` / `toolbarMenuEnabled` | 顶部工具栏自定义按钮组（与主题钮同一组）/ 点击按钮弹出 `#toolbar-menu` 浮层（小程序需显式开启） | [] / false |
| `searchable` / `searchHintText` / `searchEmptyText` | 顶部工具栏搜索入口（需 `showToolbar`）/ 搜索提示 / 无结果文案 | true / 输入商品名称 / 规格搜索 / 没有找到相关商品 |
| `soldOutText` / `specButtonText` / `attributeButtonText` | 售罄文案 / 规格选择按钮文案 / 只有属性时的按钮文案 | 商品已售罄 / 选规格 / 选属性 |
| `quantityUnit` / `priceDecimals` | 默认数量单位 / 价格小数位 | '' / -1 |
| `accentColor` | 选中 / 加购 / 结算主色 | 系统蓝 |
| `loadByCategory` / `categoryLoading` | 按分类加载 / 加载态；点击分类抛 `category-change` | false / false |
| `windowed` / `windowSize` | 全量模式分段渲染，每次追加分类数 | false / 2 |
| `renderMode` | `auto` / `all` / `windowed` / `category` | auto |
| `windowedThreshold` / `categoryThreshold` | auto 阈值：>100 分段、>500 按分类 | 100 / 500 |
| `totalGoodsCount` | 商品总数，懒加载时传入 | 0 |
| `goodsDetail` / `goodsDetailTitle` / `addToCartText` | 内置商品详情 Sheet：开关 / 标题（宽屏显示；移动端头图模式隐藏）/ 加购文案 | true / 商品详情 / 加入购物车 || `safeArea` | 购物车栏预留安全区 | true |

| 事件 | 说明 |
|------|------|
| `update:modelValue` / `change` | 购物车变化；`change` 带 `{ item, quantity, cart, count, totalPrice, key, spec, attributes }`（`spec` / `attributes` 仅组合行有） |
| `category-change` | 左右联动切换分类 `{ key, index }` |
| `checkout` | 达到起送价后结算 `{ cart, lines, count, totalPrice, deliveryFee }`；`lines` 内带 `key` / `spec` / `attributes` |
| `spec-request` | 旧用法：`multiSpec` 商品点 +，业务弹自己的规格面板；配置 `specs` / `attributeGroups` 后由组件内置 Sheet 处理，不再抛 |
| `goods-click` / `cart-clear` / `back` | 点商品 / 清空购物车 / 返回；`goods-click` 在内置详情开启时同时打开 Sheet |
| `search` | 工具栏搜索值变化 `{ value, count }` |

### 规格与属性数据

```ts
const goods = {
  key: 'cake',
  name: '八喜经典冰淇淋蛋糕',
  price: 168,
  image: '...',
  specs: [
    { key: '6', text: '6 寸', price: 168, image: '...' },
    { key: '8', text: '8 寸', price: 228, image: '...' },
  ],
  attributeGroups: [
    {
      key: 'top',
      title: '上层口味',
      required: true,
      max: 1,
      options: [
        { key: 'choco', text: '巧克力', image: '...' },
        { key: 'vanilla', text: '香草' },
      ],
    },
    {
      key: 'extras',
      title: '配件',
      max: 2,
      options: [{ key: 'candle', text: '蜡烛' }],
    },
  ],
}
```

- 只配 `specs`：规格列表 Sheet 标题为主商品名称，内容只保留规格列表；规格行保留规格图（76×76，与文字顶部对齐）、价格、库存和加减控件。多规格商品在主列表 / 详情显示最低价 + `起`。规格 `stock` 独立限库存，同规格的属性组合共享该库存。
- 配了 `attributeGroups`：组合 Sheet；有 `specs` 时先单选规格，再选属性；必选分组默认选中第一个可用选项，打开即可加购；每次打开重置为默认，未选组合点「加入购物车」后自动关闭。当前组合已在购物车时底部按钮改为步进器，加减不关闭 Sheet；切换规格 / 属性后按新组合是否已选重新显示按钮或步进器。
- `required` 表示至少选 1 个；`max` 默认 1（单选），大于 1 为多选并限制数量合计；同一选项可通过步进器加数量，合计不超过 `max`。选满后继续加会提示，`+` 与卡片选择置灰不可用。
- `image` 都可选；选择器里有图的规格 / 属性显示为 4:3 小图卡片（一行 3 个自动换行），名称压在图片底部半透明条上并单行截断，卡片下部只保留价格与选择控件；单选组带勾选圆点、多选组带 `+` / 步进器；规格卡片始终显示价格和「剩 N」/「售罄」角标；无图分组用文字胶囊 / 文字步进行；购物车行优先显示第一个带图的属性选项，其次规格图，最后商品图。
- `stock`：无规格商品用商品库存，有规格用各规格库存；不传不限，0 视为售罄；组合行按规格 / 商品库存扣减其它组合行，列表、规格列表、组合 Sheet、购物车详情都会限制上限。属性选项支持 `disabled` / `enabled: false` 禁用。
- 组合 Sheet 底部左侧显示当前规格价与提示（含已选数量），右侧是固定高度「加入购物车」按钮；当前组合已在购物车时改为步进器，加减不关闭 Sheet，切换规格 / 属性后按新组合是否已选重新显示按钮或步进器。提示与已选数量变化不会改变底部高度。
- 商品 / 规格 key 不要包含 `::`，属性分组 / 选项 key 不要包含 `=`。

| 插槽 | 说明 |
|------|------|
| `toolbar-menu` | 工具栏按钮点击后弹出的菜单内容，作用域 `{ button, index, groupIndex, buttonIndex, close }`；需要配合 `toolbarButtons` + `toolbarMenuEnabled` |

大数据量：默认 auto，商品 ≤100 全部加载、100～500 分段加载、>500 按分类加载；可用 `renderMode` 强制。按分类模式只渲染当前分类、关闭滚动联动，商品图带 `lazy-load`。数据结构与完整说明见手册 `/page/order-goods`，演示页 `pages/demo/order-goods`（Banner 右上角可切换全部 / 分段 / 按分类）。

## 订货单列表

状态 Tabs + 订货单卡片。业务状态固定为全部 / 待审核 / 进行中 / 已完成 / 已取消；状态 Tabs 通过 `lingyun-app-page` 的 `segments` + `segmentControl="tabs"` 渲染在工具栏内（Tabs 行 44 贴底、页面额外 8 间距、背景透明）；卡片只显示订货单号与业务状态，商品横向展示前几张缩略图，底栏显示时间、包裹数与操作。数据驱动，不请求接口；筛选、点订货单、操作和加载更多都通过事件交给路由页。多批配送订货单显示「分 N 个包裹」，点卡片进主订货单详情。

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

| 属性 | 说明 | 默认 |
|------|------|------|
| `orders` | 订货单数组；与订货单详情共用数据结构，`subOrders` 只用于显示包裹数 | `[]` |
| `filter` / `filters` | 当前筛选 key，支持 `v-model:filter` / 自定义 `[{ key, text }]`；空则用全部 / 待审核 / 进行中 / 已完成 / 已取消 | all / `[]` |
| `loading` / `loadingText` | 首次加载 / 文案 | false / 加载中… |
| `loadingMore` / `loadingMoreText` | 加载更多 / 文案 | false / 加载中… |
| `hasMore` | 是否还有下一页；滚动到底部且为真时抛 `load-more` | false |
| `emptyText` / `noMoreText` | 空态 / 没有更多文案 | 暂无订货单 / 没有更多订货单 |
| `maxThumbnails` | 卡片横向最多显示的商品图数量，多出的显示 `+N` | 3 |
| `autoBack` | 返回钮默认返回上一页；false 时只抛 `back` | true |
| `scrollUnderToolbar` | 列表从顶栏下方穿过，顶部 Tabs 浮在列表上方，滚动时顶栏渐显液态玻璃 | true |
| `title` / `showToolbar` / `showBack` / `showNav` / `autoTopInset` / `showThemeSwitch` | 透传 `lingyun-app-page` | 订货单列表 / true / true / true / true / auto |
| `currency` / `priceDecimals` | 货币符号 / 价格小数位；`-1` 去掉多余 0 | ¥ / 2 |

| 事件 | 说明 |
|------|------|
| `purchase-order-click` | 点订货单卡片 `{ order, index }`；由页面打开订货单详情 |
| `action` | 点卡片操作 `{ key, action, order }`；不自动支付 / 跳转 |
| `filter-change` / `update:filter` | 切换筛选 `{ key, filter }` / 配合 `v-model:filter` |
| `load-more` | 滚动到底部且 `hasMore` 时抛出 |
| `back` | 点返回；`autoBack=true` 时默认返回上一页 |

- 组件按业务状态本地筛选：待审核对应 `status: 'pendingReview'`；进行中聚合 `pendingPayment` / `pendingShipment` / `shipped` / `refund`；已完成 / 已取消一一对应。可用 `order.listStatus` 覆盖归类，用 `listStatusText` / `listStatusColor` 覆盖卡片右侧状态。
- 不传 `order.actions` 时按详情细状态使用默认操作；卡片内操作按钮已阻止冒泡，不会触发 `purchase-order-click`。

## 订货单详情

状态头 + 配送 / 自提 + 商品清单 + 金额明细 + 物流信息 + 订货单信息 + 悬浮玻璃操作栏。数据驱动，不请求接口；操作、商品、子订货单和复制都通过事件交给路由页。

```vue
<lingyun-purchase-order-detail
  :order="order"
  :toolbar-buttons="[{ key: 'more', icon: 'more', label: '更多' }]"
  toolbar-menu-enabled
  @back="goBack"
  @action="onAction"
  @item-click="onItem"
  @sub-purchase-order-click="onSubOrder"
  @copy="onCopy"
/>
```

| 属性 | 说明 | 默认 |
|------|------|------|
| `order` | 订货单数据 `{ number, status, items, amounts, receiver / pickup, timeline, actions, subOrders, … }`；`null` 显示空态 | null |
| `loading` / `loadingText` | 加载态 / 文案 | false / 加载中… |
| `emptyText` | 空态文案 | 订货单不存在 |
| `title` / `showToolbar` / `showBack` / `showNav` / `autoTopInset` / `showThemeSwitch` | 透传 `lingyun-app-page` | 订货单详情 / true / true / true / true / auto |
| `toolbarButtons` / `toolbarMenuEnabled` | 顶部工具栏自定义按钮组 / 点击弹出 `#toolbar-menu` | [] / false |
| `currency` / `priceDecimals` | 货币符号 / 价格小数位；`-1` 去掉多余 0 | ¥ / 2 |
| `maxThumbnails` | 子订货单行横向最多显示的商品图数量，多出的显示 `+N` | 3 |
| `paymentTimeoutMinutes` | 待付款倒计时分钟数，从 `order.createdAt` 起算 | 15 |
| `autoBack` | 返回钮默认返回上一页；false 时只抛 `back` | true |
| `scrollUnderToolbar` | 内层滚动内容从顶栏下方穿过，滚动时顶栏渐显液态玻璃 | true |

| 事件 | 说明 |
|------|------|
| `action` | 点底部操作 `{ key, action, order }`；不自动支付 / 跳转 |
| `item-click` | 点商品行 `{ item, index, order }` |
| `sub-purchase-order-click` | 点子订货单行 `{ order, subOrder }`；业务跳子订货单详情 |
| `copy` | 复制订货单号尝试完成 `{ text }` |
| `payment-timeout` | 待付款倒计时到 0 `{ order }`；业务应把订货单更新为已取消 |
| `back` | 点返回；`autoBack=true` 时默认返回上一页 |

- 状态：`pendingReview` / `pendingPayment` / `pendingShipment` / `shipped` / `completed` / `cancelled` / `refund`；不传 `order.actions` 时按状态使用默认操作，`actions: []` 隐藏操作栏。
- 金额：`goodsTotal` / `deliveryFee` / `discount` / `coupon` / `payable` / `paid`；`paid` 有值显示实付款，只有待付款显示需付款；待审核默认已支付，不出现需付款。
- 待审核 / 待付款不显示预计送达时间；付款、审核通过后才显示。
- 物流信息：显示承运服务商 `carrier`（京东快递 / 顺丰 / 自营物流等）与第三方快递单号 `trackingNumber`（可复制，自营物流可不传）；时间线只放物流节点（已出库 / 配送中 / 已签收），不放支付 / 下单 / 审核等订货单操作日志；仅在审核通过后显示，待审核 / 待付款不渲染。
- 商品清单：商品数 > 1 时默认折叠为横向缩略图（最多 `maxThumbnails` 张，多出 `+N`）+「查看详情」；展开为完整商品列表并显示「收起详情」；只有 1 个商品时直接显示完整列表，不显示切换按钮。切换订货单自动回到折叠态。
- 待付款从 `order.createdAt` 起算默认 15 分钟倒计时（`paymentTimeoutMinutes`），状态头显示「支付剩余 mm:ss」；到 0 抛 `payment-timeout`，业务把订货单更新为已取消，不展示超时页面。
- 底部操作栏按悬浮玻璃胶囊实现（左右 12、底部 8 + 安全区、高 62、圆角 31、`lingyun-glass-control`）：左侧显示需付款 / 实付款金额，右侧操作按钮。待发货 / 待收货 / 退款中不显示底部操作栏；待付款保留「取消订货单 / 去支付」，待审核为取消订货单，已完成 / 已取消保留「再来一单」；内层滚动会上报 `lingyun-app-page`，顶栏滚动后渐显 Liquid Glass。
- 多批配送：`order.subOrders` 有值时，隐藏顶部状态卡与父订货单预计送达时间，以子订货单状态为准；配送 / 自提卡片为静态信息，无箭头、不可点击。主订货单页只显示「子订货单与物流 · N 批」紧凑列表——子订货单号、状态、发货仓库，仓库行右侧显示预计日期（待发货「预计 MM-DD 发货」/ 待收货「预计 MM-DD 送达」，只显示日期）、商品横向缩略图（最多 `maxThumbnails` 张，多出 `+N`）与金额、最后一条物流日志的说明和时间（时间用 `lingyun-date-text`，保留 MM-DD HH:mm，不显示日志标题），以及「查看子订货单详情」；不展开子订货单商品列表与完整时间线，点行抛 `sub-purchase-order-click`。子订货单详情不展示预计送达时间。状态色区分：待发货靛蓝、待收货蓝、已完成绿、已取消灰、退款中红等。
- 子订货单详情：复用同一组件，用 `buildLingyunPurchaseOrderSubDetail(order, subOrder)` 把主订货单 + 子订货单拍平成单订货单数据（子订货单商品 / 金额 / 物流 / 操作优先，缺省回退主订货单），并自动补充所属订货单、发货仓库、仓库地址 / 电话等信息行。

```ts
import { buildLingyunPurchaseOrderSubDetail } from '@/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-detail/subPurchaseOrder'

order.value = buildLingyunPurchaseOrderSubDetail(parent, subOrder)
```

- 数据结构和完整说明见手册 `/page/purchase-order-list`、`/page/purchase-order-detail`；演示页 `pages/demo/purchase-order-list` → `pages/demo/purchase-order-detail` → 子订货单详情。
