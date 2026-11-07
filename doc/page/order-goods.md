# lingyun-order-goods

标准「订单商品加购」页：店铺头 + 左侧分类 + 右侧商品列表 + 底部购物车结算栏，参考美团外卖点单页的左右联动布局。界面、滚动联动和加购逻辑都在 `lingyun-ui-page`，路由页只传数据、接结算和规格选择。

本仓库的演示页是 `src/pages/demo/order-goods`（纯演示数据，不请求接口）。

## 示例

```vue
<lingyun-order-goods
  v-model="cart"
  :store="store"
  :categories="categories"
  :min-price="20"
  :delivery-fee="5"
  @back="goBack"
  @checkout="onCheckout"
  @spec-request="onSpecRequest"
/>
```

```ts
import { ref } from 'vue'
import type {
  LingyunOrderCart,
  LingyunOrderCategory,
  LingyunOrderStore,
} from '@/uni_modules/lingyun-ui-page/components/lingyun-order-goods/types'

const store: LingyunOrderStore = {
  name: '喜家德虾仁水饺（北京酒仙桥店）',
  rating: 4.8,
  salesText: '月售 1000+',
  deliveryText: '约 23 分钟',
  notice: '温馨提示：请适量点餐，支持到店自提',
}

const categories: LingyunOrderCategory[] = [
  {
    key: 'dumpling',
    text: '水饺',
    goods: [
      {
        key: 'shen-xian',
        name: '喜三鲜水饺',
        price: 35,
        originalPrice: 45,
        specText: '12 只 / 1 人份',
        salesText: '月售 600+',
        badge: '招牌',
      },
    ],
  },
]

const cart = ref<LingyunOrderCart>({})
```

## 数据结构

```ts
type LingyunOrderCart = Record<string, number> // 商品 key → 数量
```

- `store`：`{ name, logo, rating, salesText, deliveryText, notice }`。logo 为空用名称首字兜底。
- `categories`：`[{ key, text, title?, badge?, goods }]`。`text` 是左侧分类名，`title` 是右侧分组标题（默认同 `text`）。
- `goods`：`{ key, name, image?, price, originalPrice?, priceUnit?, quantityUnit?, salesText?, specText?, details?, badge?, multiSpec?, step?, max?, soldOut? }`。图片为空用名称首字兜底。
  - `details`：商品下方逐行说明（发货仓库、规格描述、截单时间、预计配送等），原样按行渲染。
  - `priceUnit` / `quantityUnit`：价格后缀（如「元/件」）与步进器右侧单位（如「件」）。
  - `multiSpec` 且 `price=0` 时不显示价格，只显示「选规格」按钮；SKU 价格由业务在规格面板里处理。
- 加购数量只认 `modelValue` 里出现过的商品 key；数量为 0 时组件会从购物车对象里删掉该项。

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `store` | 店铺信息，必填 | — |
| `categories` | 分类与商品 | `[]` |
| `modelValue` | 购物车（`v-model`） | `{}` |
| `banner` | 店铺 Banner 图；用 `#banner` 插槽可完全自定义 | '' |
| `bannerHeight` | Banner 高度，`0` 时不显示 | 140 |
| `showBack` | 返回钮（Banner 左上角；无 Banner 时单独占一行）；点击抛 `back` | true |
| `showNav` | 透传 `lingyun-app-page`；宽屏是否保留应用导航列 | true |
| `showToolbar` | 透传 `lingyun-app-page` 顶栏 | false |
| `title` | 顶栏标题（`showToolbar` 为 true 时使用） | '' |
| `minPrice` | 起送价；未达到时结算钮显示「¥xx起送」并禁用 | 0 |
| `deliveryFee` | 配送费；大于 0 时购物车栏显示「另需配送费」 | 0 |
| `currency` | 货币符号 | ¥ |
| `maxCount` | 单个商品默认最大数量（商品上的 `max` 优先） | 99 |
| `checkoutText` | 可结算时的按钮文案 | 去结算 |
| `cartTitle` | 已选商品 Sheet 标题 | 已选商品 |
| `clearText` | Sheet 右上角清空文案 | 清空 |
| `emptyText` | 无商品时空态文案 | 暂无商品 |
| `emptyCartText` | 购物车为空时的文案 | 未选购商品 |
| `soldOutText` | 售罄商品在加购位置显示的文案 | 商品已售罄 |
| `specButtonText` | 多规格商品按钮文案 | 选规格 |
| `quantityUnit` | 步进器默认数量单位；商品上的 `quantityUnit` 优先 | '' |
| `priceDecimals` | 价格小数位；`-1` 去掉多余的 0，`2` 固定两位 | -1 |
| `accentColor` | 选中 / 加购 / 结算的主色；默认系统蓝 | '' |
| `safeArea` | 购物车栏预留底部安全区 | true |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 加购数量变化，回写新的购物车对象 |
| `change` | 数量变化，参数 `{ item, quantity, cart, count, totalPrice }` |
| `category-change` | 左右联动切换分类，参数 `{ key, index }` |
| `goods-click` | 点击商品，参数 `{ item, categoryKey }` |
| `spec-request` | 多规格商品点 `+`，参数 `{ item, categoryKey }`；业务弹自己的规格面板 |
| `cart-clear` | 点 Sheet 里的清空，参数 `{ cart, count, totalPrice }` |
| `checkout` | 达到起送价后点结算，参数 `{ cart, lines, count, totalPrice, deliveryFee }` |
| `back` | 点 Banner 返回钮 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `banner` | 自定义 Banner 内容，可放营销图、文案或操作入口 |
| `banner-actions` | Banner 右上角操作区 |
| `store-extra` | 店铺卡片底部扩展，作用域 `{ store }` |
| `empty` | 无商品时的空态 |

## 交互

- 左侧分类与右侧列表双向联动：点击分类平滑滚到对应分组；右侧滚动时自动高亮当前分组，并把左侧分类滚进可视区。
- 商品数量由 `v-model` 控制；数量大于 0 且不是多规格商品时，`+` 变成步进器。
- `multiSpec` 商品始终显示 `+`，点击抛 `spec-request`，由业务打开规格面板并自行回写 `modelValue`。
- 底部购物车栏复用 `lingyun-goods-nav` 的 `variant="cart"`：悬浮玻璃胶囊、购物车角标、合计 / 配送费 / 起送价与结算钮都由该组件渲染；点购物车图标打开「已选商品」Sheet，可逐项增减或清空。

## 接入说明

- 组件内部使用 `lingyun-app-page` 管理状态栏安全区，整页固定高度、页面自管滚动；不要再在外层包 `scroll-view`。
- 标准页不请求接口、不读写登录态：结算、规格选择、返回都通过事件交给路由页。
- 宽屏默认保留应用导航列（和业务其它页面一致）；需要整页点单时传 `:show-nav="false"`。
