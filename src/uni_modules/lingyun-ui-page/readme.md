# lingyun-ui-page

标准页面扩展。当前版本 **1.1.3**，变更见 [`changelog.md`](./changelog.md)。控件仍在 `lingyun-ui`，这里只放可复用的整页，例如登录、点单加购。

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
- 组合 Sheet 底部左侧显示当前规格价与提示，右侧是固定高度「加入购物车」按钮，提示与已选数量变化不会改变底部高度。
- 商品 / 规格 key 不要包含 `::`，属性分组 / 选项 key 不要包含 `=`。

| 插槽 | 说明 |
|------|------|
| `toolbar-menu` | 工具栏按钮点击后弹出的菜单内容，作用域 `{ button, index, groupIndex, buttonIndex, close }`；需要配合 `toolbarButtons` + `toolbarMenuEnabled` |

大数据量：默认 auto，商品 ≤100 全部加载、100～500 分段加载、>500 按分类加载；可用 `renderMode` 强制。按分类模式只渲染当前分类、关闭滚动联动，商品图带 `lazy-load`。数据结构与完整说明见手册 `/page/order-goods`，演示页 `pages/demo/order-goods`（Banner 右上角可切换全部 / 分段 / 按分类）。
