# lingyun-order-goods

标准「订单商品加购」页：店铺头 + 左侧分类 + 右侧商品列表 + 底部购物车结算栏，参考美团外卖点单页的左右联动布局。界面、滚动联动、规格 / 属性选择和加购逻辑都在 `lingyun-ui-page`，路由页只传数据、接结算。

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
  name: '八喜冰淇淋蛋糕（北京酒仙桥店）',
  rating: 4.8,
  salesText: '月售 1000+',
  deliveryText: '约 30 分钟',
  notice: '温馨提示：冰淇淋蛋糕请及时冷藏，支持到店自提',
}

const categories: LingyunOrderCategory[] = [
  {
    key: 'cake',
    text: '冰淇淋蛋糕',
    goods: [
      {
        key: 'baxi-classic',
        name: '八喜经典冰淇淋蛋糕',
        price: 168,
        originalPrice: 198,
        specText: '6 寸 / 约 1.5 磅',
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
type LingyunOrderCart = Record<string, number> // 行 key → 数量
```

- `store`：`{ name, logo, rating, salesText, deliveryText, notice }`。logo 为空用名称首字兜底。
- `categories`：`[{ key, text, title?, iconSrc?, icon?, iconColor?, badge?, goods }]`。`text` 是左侧分类名，`title` 是右侧分组标题（默认同 `text`）。
  - `iconSrc`：分类名左侧小图标地址，后台返回的图片 URL，14px 与文字同高，作为行内元素和文字一起换行；没有图片时可用 `icon` 字形，`iconColor` 控制颜色。
  - 分类名最多两行，超出省略；购物车数字角标浮在右上角，不占文字宽度、不影响换行。
- `goods`：`{ key, name, image, images?, price, originalPrice?, priceUnit?, quantityUnit?, salesText?, specText?, details?, description?, specs?, attributeGroups?, stock?, badge?, multiSpec?, step?, max?, soldOut? }`。图片为空用名称首字兜底。
  - `images`：商品详情多图；有值时详情页用 `lingyun-swiper` 显示大图，支持左右滑动 / 自动轮播，底部横排缩略图作为指示器，点击缩略图切换；不传则用 `image` 单图。
  - `details`：商品下方逐行说明（发货仓库、规格描述、截单时间、预计配送等），原样按行渲染。
  - `description`：商品详情介绍，支持 `\n` 分段；不传时回退到 `details`。
  - `priceUnit` / `quantityUnit`：价格后缀（如「元/件」）与步进器右侧单位（如「件」）。
  - `stock`：无规格商品库存；不传表示不限库存，0 视为售罄，加购 / 步进上限同步受库存限制。
  - `specs`：规格 `[{ key, text, price?, originalPrice?, image?, stock?, soldOut?, max? }]`；只有规格时点 + 打开规格列表 Sheet，每个规格独立加减。规格有 `stock` 时按规格独立限库存（不传不限），同规格的不同属性组合共享该库存。多规格商品在主列表 / 详情显示最低价 + `起`（如 `¥168.00起`），不再只显示基础价；选择一个规格时显示该规格价，没给价格时不显示。
  - `attributeGroups`：属性分组 `[{ key, title, required?, max?, options: [{ key, text, image?, disabled?, enabled? }] }]`；有属性时打开组合 Sheet，有规格则先单选规格，再选属性。`required` 至少选 1 个；`max` 默认 1（单选），>1 为多选，限制的是数量合计；同一选项也可以加数量，合计不超过 `max`。选项支持 `disabled` 或 `enabled: false` 禁用。
  - 属性与规格相互独立；购物车按组合分行，行内每行显示一个选择，缩略图优先取带图的属性、其次规格、最后商品图。
  - `multiSpec`：旧用法，仅在没有 `specs` / `attributeGroups` 时生效，点 + 抛 `spec-request`；`price=0` 时只显示按钮不显示价格。
- 购物车行 key：无规格商品就是商品 key；规格 / 属性组合行由组件生成，宿主当作不透明 key，行信息从 `change` / `checkout` 的 `lines` 读取。商品 / 规格 key 不要包含 `::`，属性分组 / 选项 key 不要包含 `=`。
- 加购数量只认 `modelValue` 里出现过的行 key；数量为 0 时组件会从购物车对象里删掉该项。

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `store` | 店铺信息，必填 | — |
| `categories` | 分类与商品 | `[]` |
| `modelValue` | 购物车（`v-model`） | `{}` |
| `banner` | 店铺 Banner 图；用 `#banner` 插槽可完全自定义 | '' |
| `bannerHeight` | Banner 高度，`0` 时不显示；无 Banner 时自动恢复顶部工具栏留白，店铺卡片从工具栏下方开始 | 140 |
| `showBack` | 返回钮（Banner 左上角；无 Banner 时单独占一行）；点击抛 `back` | true |
| `showNav` | 透传 `lingyun-app-page`；宽屏是否保留应用导航列 | true |
| `showToolbar` | 透传 `lingyun-app-page` 顶栏 | false |
| `searchable` | 顶部工具栏显示搜索入口（需 `showToolbar`）：搜索时隐藏店铺头 / 分类栏，显示内置搜索视图 | true |
| `searchHintText` | 搜索未输入关键字时的提示 | 输入商品名称 / 规格搜索 |
| `searchEmptyText` | 搜索无结果文案 | 没有找到相关商品 |
| `title` | 顶栏标题（`showToolbar` 为 true 时使用） | '' |
| `autoTopInset` | 工具栏是否自动给页面留出顶部安全区。`false` 时 Banner 顶到页面顶部、垫在透明工具栏下（Banner 顶部按主题加渐隐，保证标题可读）；进入搜索视图时自动恢复留白 | true |
| `toolbarButtons` | 顶部工具栏自定义按钮组，与主题钮同一玻璃组；一维一组、二维多组，按钮 `{ key, icon?, label?, disabled? }` | [] |
| `toolbarMenuEnabled` | 工具栏按钮点击弹出 `#toolbar-menu` 浮层；小程序需显式开启 | false |
| `minPrice` | 起送价；未达到时结算钮显示「¥xx起送」并禁用 | 0 |
| `deliveryFee` | 配送费；大于 0 时购物车栏显示「另需配送费」 | 0 |
| `currency` | 货币符号 | ¥ |
| `maxCount` | 单个商品默认最大数量（商品上的 `max` 优先） | 99 |
| `checkoutText` | 可结算时的按钮文案 | 去结算 |
| `cartTitle` | 购物车详情面板标题 | 已选商品 |
| `clearText` | 详情面板右上角清空文案 | 清空 |
| `emptyText` | 无商品时空态文案 | 暂无商品 |
| `emptyCartText` | 购物车为空时的文案 | 未选购商品 |
| `soldOutText` | 售罄商品在加购位置显示的文案 | 商品已售罄 |
| `specButtonText` | 规格选择按钮文案（详情 Sheet 底部） | 选规格 |
| `attributeButtonText` | 只有属性、没有规格时详情 Sheet 底部按钮文案 | 选属性 |
| `quantityUnit` | 步进器默认数量单位；商品上的 `quantityUnit` 优先 | '' |
| `priceDecimals` | 价格小数位；`-1` 去掉多余的 0，`2` 固定两位 | -1 |
| `accentColor` | 选中 / 加购 / 结算的主色；默认系统蓝 | '' |
| `safeArea` | 购物车栏预留底部安全区 | true |
| `loadByCategory` | 按分类加载：右侧只渲染当前分类，关闭滚动联动；点击分类抛 `category-change` | false |
| `categoryLoading` | 按分类加载时显示加载态 | false |
| `loadingText` | 加载态文案 | 加载中… |
| `windowed` | 全量模式分段渲染：先渲染前 `windowSize` 个分类，滚到底部追加 | false |
| `windowSize` | 分段加载每次追加的分类数 | 2 |
| `renderMode` | `auto` / `all` / `windowed` / `category`；默认按商品总数自动选择 | auto |
| `windowedThreshold` | auto：商品数大于该值启用分段加载 | 100 |
| `categoryThreshold` | auto：商品数大于该值启用按分类加载 | 500 |
| `totalGoodsCount` | 商品总数；按分类懒加载、`categories` 不是全量数据时传入，auto 判断更准确 | 0 |
| `goodsDetail` | 点商品图 / 名称打开内置商品详情 Sheet；`false` 时只抛 `goods-click` | true |
| `goodsDetailTitle` | 商品详情 Sheet 标题（宽屏显示；移动端头图模式隐藏） | 商品详情 |
| `addToCartText` | 商品详情加购按钮文案 | 加入购物车 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 加购数量变化，回写新的购物车对象 |
| `change` | 数量变化，参数 `{ item, quantity, cart, count, totalPrice, key, spec, attributes }`；`spec` / `attributes` 仅规格 / 属性组合行有 |
| `category-change` | 左右联动切换分类，参数 `{ key, index }` |
| `goods-click` | 点击商品，参数 `{ item, categoryKey }`；内置详情开启时同时打开商品详情 Sheet |
| `search` | 搜索值变化，参数 `{ value, count }` |
| `spec-request` | 旧用法：`multiSpec` 商品点 +，参数 `{ item, categoryKey }`；配置 `specs` / `attributeGroups` 后由内置 Sheet 处理，不再抛 |
| `cart-clear` | 点详情面板里的清空，参数 `{ cart, count, totalPrice }` |
| `checkout` | 达到起送价后点结算，参数 `{ cart, lines, count, totalPrice, deliveryFee }` |
| `back` | 点 Banner 返回钮 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `banner` | 自定义 Banner 内容，可放营销图、文案或操作入口 |
| `banner-actions` | Banner 右上角操作区 |
| `store-extra` | 店铺卡片底部扩展，作用域 `{ store }` |
| `empty` | 无商品时的空态 |
| `toolbar-menu` | 工具栏按钮点击后弹出的菜单内容，作用域 `{ button, index, groupIndex, buttonIndex, close }`；配合 `toolbarButtons` + `toolbarMenuEnabled` |

## 交互

- 左侧分类与右侧列表双向联动：点击分类平滑滚到对应分组；右侧滚动时自动高亮当前分组，并把左侧分类滚进可视区。
- 左侧选中背景是圆角胶囊，切换分类时上下滑动过渡（类似 tabbar 的选中透镜），点击的分类文字做一次轻微回弹；分类有已选商品时右上角显示数量角标，角标数字优先于分类自身的 `badge`。
- 商品数量由 `v-model` 控制；无规格 / 属性的商品数量大于 0 时，`+` 变成步进器。有规格 / 属性的商品始终显示 +（带总数量角标），点击打开选择 Sheet。
- 加购方式按数据自动区分：① 无规格无属性直接加购；② 只有规格打开规格列表 Sheet，每个规格独立加减，再次打开保留各规格数量；③ 有属性打开组合 Sheet，有规格时先单选规格，再按分组选属性，底部对当前组合加购 / 步进；④ 只有属性同 ③，不显示规格。
- 属性分组支持必选 / 可选与 `max`：必选分组打开时默认选中第一个可用选项；`max=1` 单选，卡片用勾选圆点，点击已选项可取消（必选单选除外）；`max>1` 多选，卡片用 `+` / 紧凑步进器，同一选项可加数量；数量合计达到 `max` 后其余 `+` 与卡片选择置灰、禁止继续添加。必选项未选时底部按钮置灰并显示提示。
- 纯规格列表 Sheet 的标题使用主商品名称，顶部显示与主列表同尺寸（76×76）的主商品大图；规格行不再显示图片，只保留规格名、价格、库存和加减控件。
- 规格 / 属性选项带 `image` 时，选择器用 4:3 小图卡片（一行 3 个自动换行）：名称压在图片底部半透明条上，单行超出截断；卡片下部只保留价格与选择控件，选中态为主色描边。规格卡片始终显示规格价（字号略大），并显示「剩 N」/「售罄」库存角标。分组内没有图片时，单选退回文字胶囊、多选使用带步进器的文字行。选项 `disabled` 或 `enabled: false` 时置灰不可选。
- 组合 Sheet 底部固定为一行：左侧显示当前规格价与提示（必选 / 库存不足 / 已选件数），右侧是固定高度「加入购物车」按钮；高度固定，不随提示 / 已选数量切换而抖动。库存或单项上限用尽时按钮置灰。
- 购物车详情按组合分行，行内每行显示一个规格 / 属性选择（多选数量大于 1 时带 `×N`）；缩略图优先取带图的已选属性，其次规格图，最后商品图；每行可单独用步进器调整数量。
- 顶部工具栏（`showToolbar`）支持搜索：点搜索入口进入搜索态，隐藏 Banner / 店铺卡片 / 左侧分类，列表区域切换为搜索结果（按原分类分组，显示「找到 n 个结果」）；未输入时显示提示，无结果时显示空文案。搜索结果可直接加购 / 改数量，也能点开商品详情；关闭搜索回到原列表并定位到当前分类。搜索值变化抛 `search`。
- 顶栏是页面唯一的头部：开启 `showToolbar` 后 Banner 自带的返回钮与右上角操作区自动隐藏。`autoTopInset="false"` 时 Banner 顶到页面顶部，`lingyun-app-page` 的工具栏透明覆盖在上面（单一头部、顶部透明），Banner 顶部按当前主题加一层渐隐托住标题与按钮；搜索态自动恢复顶部留白，避免结果压在工具栏下。
- 工具栏右侧可以用 `toolbarButtons` 增加自定义按钮（与主题钮同一组）；设置 `toolbarMenuEnabled` 并传入 `#toolbar-menu` 插槽后，点按钮会像主题钮一样弹出菜单，插槽作用域带 `close`，选中项可在菜单里自己画勾。
- 点商品图 / 名称区域打开大模式商品详情 Sheet（`lingyun-sheets`）：4:3 头图、价格 / 月售 / 划线原价、商品名与「商品介绍」，不包含评价。加购按钮固定在 Sheet 底部 `footer` 操作区，移动端 / 宽屏一致，并与列表共用购物车：普通商品数量 > 0 时显示步进器；规格 / 属性商品显示「选规格 / 选属性」+ 总数量角标，点击收起详情并打开选择 Sheet，售罄置灰。多图时头图为「大图 + 底部横排缩略图」，使用 `lingyun-swiper` 支持左右滑动与自动轮播，点缩略图切换。移动端头图通过 `bleedTop` 延伸到面板顶部、关闭钮浮在图片左上角；宽屏（≥690）左侧为图片 + 图下商品介绍、右侧为价格 / 名称，商品介绍自动填满左栏剩余高度（`contentFill`），标题固定、内容在自身区域滚动，不再带动整页滚动；图片列固定 42% 宽、图片左距与右侧文字右距一致（32px）。购物车数量增加时底部购物车圆钮会做一次放大回弹。
- `multiSpec` 旧商品始终显示 +，点击抛 `spec-request`，由业务打开规格面板并自行回写 `modelValue`；新数据请改用 `specs` / `attributeGroups`。
- 底部购物车栏复用 `lingyun-goods-nav` 的 `variant="cart"`：悬浮玻璃胶囊、购物车角标、合计 / 配送费 / 起送价与结算钮都由该组件渲染；购物车固定悬浮在列表之上，分类栏与商品列表通高到页面底部，商品可以从购物车底部穿过，列表尾部预留 `78 + 安全区` 的让位。点购物车图标会让整张购物车卡向上增高展示「已选商品」详情，详情与购物车是同一张卡（左上角关闭钮、点卡片外收起），不是独立弹窗；结算钮始终可点。

## 大数据量模式

默认 `render-mode="auto"` 按商品总数自动选择：

- **≤100 个**：全部加载，所有分类一次性渲染，保留左右滚动联动。
- **100～500 个**：分段加载，先渲染前 `window-size` 个分类，右侧滚到底部再追加下一段；点击靠后的分类会自动展开到目标分类并滚过去。
- **>500 个**：按分类加载，右侧只渲染当前选中的分类，关闭滚动联动；点击分类抛 `category-change`，宿主取当前分类数据后回写 `categories`，加载期间用 `category-loading` 显示转圈。已选商品会保留本地快照，切换分类或卸载其它分类数据时不会丢购物车、合计和分类角标。

需要强制某一种渲染方式时传 `render-mode="all" | "windowed" | "category"`；按分类懒加载时建议同时传 `:total-goods-count`，让 auto 用后台总数而不是当前已加载的数据判断。商品图已加 `lazy-load`，分段/按分类模式下不会一次性请求全部图片。

```vue
<!-- 按分类加载 -->
<lingyun-order-goods
  :load-by-category="true"
  :category-loading="loading"
  :categories="categories"
  @category-change="loadCategory"
/>

<!-- 分段加载 -->
<lingyun-order-goods :windowed="true" :window-size="2" :categories="categories" />
```

## 接入说明

- 组件内部使用 `lingyun-app-page` 管理状态栏安全区，整页固定高度、页面自管滚动；不要再在外层包 `scroll-view`。
- 标准页不请求接口、不读写登录态：结算、返回都通过事件交给路由页；规格 / 属性选择由内置 Sheet 处理。
- 宽屏默认保留应用导航列（和业务其它页面一致）；需要整页点单时传 `:show-nav="false"`。
