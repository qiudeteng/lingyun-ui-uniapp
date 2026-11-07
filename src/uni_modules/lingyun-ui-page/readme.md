# lingyun-ui-page

标准页面扩展。当前版本 **1.1.0**，变更见 [`changelog.md`](./changelog.md)。控件仍在 `lingyun-ui`，这里只放可复用的整页，例如登录、点单加购。

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

左右布局的标准点单页：店铺头 + 左侧分类 + 右侧商品 + 底部购物车结算栏，数据驱动，参考美团外卖点单页。

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

| 属性 | 说明 | 默认 |
|------|------|------|
| `store` | 店铺信息 `{ name, logo, rating, salesText, deliveryText, notice }` | 必填 |
| `categories` | 分类与商品 `[{ key, text, title, badge, goods }]` | `[]` |
| `modelValue` | 购物车 `{ [商品 key]: 数量 }`，支持 `v-model` | `{}` |
| `details` / `priceUnit` / `quantityUnit` | 商品行扩展：多行说明、价格后缀、步进器单位（写在商品的字段里） | — |
| `banner` / `bannerHeight` | 店铺 Banner 图 / 高度，0 不显示；也可用 `#banner` 插槽 | '' / 140 |
| `minPrice` / `deliveryFee` | 起送价 / 配送费 | 0 / 0 |
| `showBack` | 返回钮（Banner 左上角 / 无 Banner 时顶行），点击抛 `back` | true |
| `showNav` / `showToolbar` / `title` | 透传 `lingyun-app-page`；`showNav` 默认保留宽屏导航列 | true / false / '' |
| `soldOutText` / `specButtonText` | 售罄文案 / 多规格按钮文案 | 商品已售罄 / 选规格 |
| `quantityUnit` / `priceDecimals` | 默认数量单位 / 价格小数位 | '' / -1 |
| `accentColor` | 选中 / 加购 / 结算主色 | 系统蓝 |
| `loadByCategory` / `categoryLoading` | 按分类加载 / 加载态；点击分类抛 `category-change` | false / false |
| `windowed` / `windowSize` | 全量模式分段渲染，每次追加分类数 | false / 2 |
| `renderMode` | `auto` / `all` / `windowed` / `category` | auto |
| `windowedThreshold` / `categoryThreshold` | auto 阈值：>100 分段、>500 按分类 | 100 / 500 |
| `totalGoodsCount` | 商品总数，懒加载时传入 | 0 |
| `safeArea` | 购物车栏预留安全区 | true |

| 事件 | 说明 |
|------|------|
| `update:modelValue` / `change` | 购物车变化；`change` 带 `{ item, quantity, cart, count, totalPrice }` |
| `category-change` | 左右联动切换分类 `{ key, index }` |
| `checkout` | 达到起送价后结算 `{ cart, lines, count, totalPrice, deliveryFee }` |
| `spec-request` | 多规格商品点 +，业务弹自己的规格面板 |
| `goods-click` / `cart-clear` / `back` | 点商品 / 清空购物车 / 返回 |

大数据量：默认 auto，商品 ≤100 全部加载、100～500 分段加载、>500 按分类加载；可用 `renderMode` 强制。按分类模式只渲染当前分类、关闭滚动联动，商品图带 `lazy-load`。数据结构与完整说明见手册 `/page/order-goods`，演示页 `pages/demo/order-goods`（Banner 右上角可切换全部 / 分段 / 按分类）。
