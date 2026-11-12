# lingyun-app-page

业务页的外壳：自定义顶栏（可带搜索 / 分段控件 / 顶部 Tabs / 右侧按钮）、滚动时顶栏渐显 Liquid Glass、宽屏左侧导航 / 窄屏底部 Tab、Toast / HUD 反馈层。**几乎所有业务页都应该用它当根节点**。

页面结构（自上而下）：

```
┌───────────────────────────────────────────────┐
│ lingyun-toolbars      标题 / 返回 / 搜索 / 右侧按钮组  │ ← 固定，可透明垫在内容上
│ segments 控件行       分段控制（56）或顶部 Tabs（44）   │ ← 有 segments 才占高度
├───────────────────────────────────────────────┤
│ 页面内容（本组件默认管滚动）                          │
│  · 页面级滚动（默认） / 内层 scroll-view（bodyScroll=false）
│  · 宽屏时左侧让出导航列（220 / 84 / 304）
├───────────────────────────────────────────────┤
│ lingyun-tabbars       窄屏底部 Tab（配置全局 tabs 的根页才显示）
└───────────────────────────────────────────────┘
+ 反馈层（Toast / HUD / Alert）挂在页面壳内
```

相关 demo：`pages/demo/toolbar-search`（搜索）、`pages/demo/toolbar-segments`（分段）、`pages/demo/toolbar-comprehensive`（搜索 + 分段 + 筛选器全套）、`pages/demo/sidebars` / `pages/demo/tabbars`（导航）。

## 最小示例

```vue
<lingyun-app-page title="首页" :show-back="false">
  <view>正文</view>
</lingyun-app-page>

<!-- 子页：showBack=auto（默认）时自动出现返回钮 -->
<lingyun-app-page title="订单详情" subtitle="T-20261111-01">
  <view>正文</view>
</lingyun-app-page>
```

- 内容默认用**页面级滚动**，壳会自动处理状态栏 / 顶栏占位（`autoTopInset`）。
- `showBack` 默认 `auto`：一级 Tab 根页不显示返回；从子页进入时显示；宽屏左侧导航停靠时隐藏。
- 富交互页面建议把内容包一层自己的根 view（如 `.page`）控制背景和底部留白，注意结构样式不要写进通用 `.page`（见文末 FAQ 与 [分栏页面 guide](/guide/split-pages.html)）。

## 顶部搜索

开启 `searchable` 后，顶栏右侧多一个独立分组的搜索按钮；点它进入搜索模式：左侧返回 / 标题和右侧其它按钮隐藏，标题位置换成输入框，原搜索按钮变成取消按钮。

```vue
<lingyun-app-page
  ref="pageRef"
  title="订单"
  searchable
  search-placeholder="搜索订单 / 客户"
  v-model:searching="searching"
  v-model:search-value="keyword"
  @search-open="onSearchOpen"
  @search-cancel="onSearchCancel"
  @search-input="onSearchInput"
  @search="onSearchConfirm"
>
  <!-- 搜索态可以整页换成搜索视图 -->
  <view v-if="searching" class="search-view">
    <view v-if="!keyword">输入关键词开始搜索</view>
    <view v-else>共 {{ results.length }} 个结果</view>
  </view>
  <view v-else>普通页面内容</view>
</lingyun-app-page>
```

```ts
const searching = ref(false)
const keyword = ref('')

function onSearchInput(value: string) { /* 实时过滤用这个 */ }
function onSearchConfirm(value: string) { /* 键盘「搜索」确认时触发 */ }
```

要点：

| 行为 | 说明 |
| --- | --- |
| 打开 | 点搜索按钮，或 `ref.openSearch()`；未开 `searchable` 时忽略 |
| 关闭 | 点取消、`ref.closeSearch()`、或外部把 `searching` 置 `false`。**关闭会清空关键词**并同步 `v-model:search-value`；`search-cancel` 事件仍携带关闭前的关键词 |
| 静默关闭 | `ref.closeSearch(false)` 不发 `search-cancel`（父级主动收起时用） |
| 切换 | `ref.toggleSearch()` |
| 搜索态内容 | 用 `v-if="searching"` 自行渲染搜索视图（历史、结果、空态都可以） |
| 滚动 | 含输入框的页面保持默认 `pageScroll=true`，不要关 |

## 顶栏数据驱动控件：分段控制 / 顶部 Tabs

`segments` 是一行数据配置，同一份数据可以渲染成**分段控制**（默认）或**顶部 Tabs**，显示在顶栏正下方，页面内容会自动让出对应高度。

数据字段：`{ key, text?, icon?, badge?, disabled? }`。

### 分段控制（`segment-control="segmented"`，默认）

```vue
<lingyun-app-page
  title="工单"
  :segments="[
    { key: 'all', text: '全部' },
    { key: 'open', text: '待处理' },
    { key: 'doing', text: '处理中' },
    { key: 'done', text: '已完成' },
  ]"
  v-model:segment-value="status"
  @segment-change="onStatusChange"
>
  <view>{{ status }}</view>
</lingyun-app-page>
```

- 行高 **56**（Large 48 + 下边距 8），白底胶囊分段控件。
- `segment-change` 与 `segment-click` 在用户切换时**同时触发**，载荷 `{ value, item }`；`v-model:segment-value` 同步当前 key。

### 顶部 Tabs（`segment-control="tabs"`）

```vue
<lingyun-app-page
  title="订货单"
  :segments="[
    { key: 'all', text: '全部' },
    { key: 'pendingReview', text: '待审核' },
    { key: 'inProgress', text: '进行中', badge: 2 },
    { key: 'completed', text: '已完成' },
    { key: 'cancelled', text: '已取消' },
  ]"
  segment-control="tabs"
  v-model:segment-value="filter"
  @segment-change="onFilterChange"
>
  <!-- 列表 -->
</lingyun-app-page>
```

- 渲染成 `lingyun-tabs` 顶部 Tabs：行高 **44**、贴顶栏底、背景透明、跟随顶栏玻璃；页面顶部额外留 8 间距。
- 支持 `badge`（数字 / 文案）与 `disabled`。
- 和分段控制互斥：只渲染其中一种；`segments` 为空时不渲染也不占高度。
- **不要在页面内容里再放一份同样的 Tabs / 分段**，否则会出现两条控件。

## 右侧按钮与筛选器

顶栏右侧可以放自定义玻璃按钮组 `trailingButtons`：一维数组为一组，二维数组按组渲染多个胶囊。点击抛 `trailing-action`，载荷 `{ key, button, index, groupIndex, buttonIndex, anchor }`，`anchor` 是整组按钮的矩形，可直接传给 `lingyun-menu` 的 `anchor`。

### 方式一：内置浮层（`trailingMenuEnabled` + `#trailing-menu`）

最简单的筛选器形态——点按钮自动弹内置玻璃浮层，内容由插槽提供：

```vue
<lingyun-app-page
  title="点单"
  :trailing-buttons="[{ key: 'filter', icon: 'tune', label: '筛选' }]"
  trailing-menu-enabled
>
  <template #toolbar-menu="{ close }">
    <view class="filter-panel">
      <text class="filter-panel__title">加载模式</text>
      <view class="filter-chips">
        <view
          v-for="option in options"
          :key="option.key"
          class="filter-chip"
          :class="{ 'filter-chip--active': mode === option.key }"
          @click="mode = option.key"
        >{{ option.text }}</view>
      </view>
      <lingyun-button block text="完成" @click="close()" />
    </view>
  </template>

  <!-- 内容 -->
</lingyun-app-page>
```

- **小程序必须显式 `trailing-menu-enabled`**（插槽检测不可靠）。
- 插槽作用域 `{ button, index, groupIndex, buttonIndex, close }`；点外面 / 再点按钮也会关闭。
- 参考 demo：`pages/demo/pages/order-goods`。

### 方式二：自管浮层（`@trailing-action` 拿 anchor）

需要完全控制浮层（比如和 `lingyun-date-switcher`、多级筛选联动）时，自己放 `lingyun-menu`，并设 `trailing-buttons-hidden` 在浮层打开期间隐藏按钮组：

```vue
<lingyun-app-page
  title="记录"
  :trailing-buttons="[{ key: 'filter', icon: 'tune', label: '筛选' }]"
  :trailing-buttons-hidden="filterOpen"
  @trailing-action="onTrailingAction"
>
  <lingyun-menu v-model:show="filterOpen" full-width :anchor="menuAnchor" @closed="menuAnchor = null">
    <!-- 自己的筛选表单 -->
  </lingyun-menu>
</lingyun-app-page>
```

```ts
function onTrailingAction(payload: { anchor?: unknown }) {
  menuAnchor.value = payload?.anchor || null
  filterOpen.value = true
}
```

- 参考 demo：`pages/demo/toolbar-comprehensive`。
- 复杂多条件筛选（日期 / 标签 / 排序组合）也可以用现成的 `lingyun-filter-menu` 复合组件，事件和 UI 都已封装。

### 其它右侧形态

- `#trailing` 插槽放自定义内容（点击自己处理）；`showTrailing` 会额外渲染一个内置主按钮（分享样式），点它抛 `trailing`。
- 主题切换钮：`showThemeSwitch`（`auto` 跟随全局；`false` 只隐藏当前页）。
- 左侧完全自定义：`#leading` 插槽（提供后不再渲染默认返回钮）。

## 底部 Tabs（全局一级导航）

底部 Tab 和宽屏左侧导航是**同一份全局配置**：窄屏渲染底部玻璃 Tab，宽屏（≥690）渲染左侧停靠导航。

```ts
// main.ts / config 注入处执行一次
import { setLingyunPageConfig } from '@/uni_modules/lingyun-ui'

setLingyunPageConfig({
  tabs: [
    { key: 'home', text: '首页', icon: 'home', url: '/pages/index/index' },
    { key: 'orders', text: '订单', icon: 'list', url: '/pages/orders/orders', badge: 3 },
    {
      key: 'pages',
      text: '页面',
      icon: 'grid',
      url: '/pages/pages/pages',
      children: [
        { key: 'list', text: '记录列表', url: '/pages/records/records' },
        { key: 'detail', text: '记录详情', url: '/pages/record-detail/record-detail', match: '/pages/record-detail/' },
      ],
    },
  ],
  tabbar: { safeArea: true, variant: 'default' },
  // 页面级覆盖（按归一化路径）
  pages: {
    '/pages/goods/goods': { hideTabbar: true },     // 带商品底栏的页面
    '/pages/login/login': { hideTabbar: true, hideNav: true },
  },
})
```

显示规则（页面壳默认不接管 Tab）：

- 只有**一级 Tab 根页**（`url` 等于当前页）或带 `children` 的工作台页在窄屏显示底部 Tab；子页 / 详情页 / 普通页默认没有 Tab，也不留底部空间。
- 宽屏（≥690）同一份 tabs 变成左侧导航：220 完整目录 → 配置 tabs 后收窄为 84 通高窄栏；PC（≥1200）再向右多一列 220 的内联二级 / 三级菜单（合计让出 304）。详见 [`design/SIDEBARS.md`](../../design/SIDEBARS.md) §4。
- 选中态由路由推导；详情页可用 `match` 归入某个 Tab 高亮；点带 `children` 的项在平板弹菜单、PC 切内联菜单、窄屏进工作台页。

页面级控制（优先级：props > `pages[path]` 覆盖 > `layout` 全局 > 宽度自动）：

| 需求 | 做法 |
| --- | --- |
| 普通页强制不出 Tab（默认就不出） | 无 |
| 有商品底栏 / 搜索条的页面必须隐藏 | `pages[path].hideTabbar = true` 或临时 `:show-tabbar="false"` |
| 强制底部 Tab / 侧栏模式 | `:nav-mode="'tabbar' \| 'sidebar' \| 'none'"` |
| 关闭宽屏左侧导航 | `:show-nav="false"` 或 `pages[path].hideNav = true` |
| 页面自己实现底部导航 | `:show-tabbar="false"` + 自行使用 `lingyun-tabbars` |

底部留白：

- 壳**只在该页实际渲染 Tab 时**给内容加底部留白，并写入 `--lingyun-app-page-inset-bottom` 与 `LINGYUN_APP_PAGE_BOTTOM_INSET`（`bodyScroll=false` 的页面用它给固定浮层 / 列表尾部让位）。
- 页面**不要再手写 `padding-bottom`**；已有手写值时设 `:auto-bottom-inset="false"`，变量仍然可用。
- Tab 点击抛 `tab-change`（`{ key, tab }`），内部负责 `reLaunch` / 宽屏托管，无需业务处理。

全局外观：`tabbar.safeArea`（底部安全区，默认 true）、`tabbar.variant`（传给 `lingyun-tabbars` 的变体）。

## 宽屏左侧导航

- 默认 `showNav=true`：宽度 ≥ 690 时停靠左侧；导航内容优先取全局 `tabs`，其次宿主目录（`LINGYUN_PAGE_NAV`）。
- 页面级覆盖：`navSections` prop 显式指定当前页的分组目录（只影响当前渲染，H5 常驻侧栏请用 `setLingyunPageConfig` / `setLingyunPageNavSections`）；`:show-nav="false"` 或 `pages[path].hideNav` 关闭。
- 左栏顶部资料：`#nav-avatar` / `#nav-name` / `#nav-subtitle` 插槽，或全局 `setLingyunPageNavProfile({ avatar, name, subtitle })`；不传时显示「凌云UI」和默认介绍。
- 宽度档位（220 / 84 / 304）、选中胶囊动效、PC 二级菜单规则见 [`design/SIDEBARS.md`](../../design/SIDEBARS.md) §4，这里不重复。

## 滚动与留白

三种模式，按页面内容选一种：

| 模式 | 写法 | 适用 |
| --- | --- | --- |
| 页面级滚动（默认） | 不传 | 绝大多数页面；内容正常流式排布 |
| 内层 scroll-view | `:body-scroll="false"` | 固定高度页面、需要内层滚动联动顶栏玻璃（列表页、分栏页） |
| 关掉页面滚动 | `:page-scroll="false"` | 只有需要锁竖向滚动（横向 swipe 行）时才用；**含文本输入的页面必须保持默认 true** |

内层滚动 + 顶栏玻璃：

```vue
<lingyun-app-page title="订单" :body-scroll="false">
  <scroll-view class="list" scroll-y @scroll="onScroll">
    <view class="list-top-space" /> <!-- 顶栏高度占位（scrollUnderToolbar=默认时用变量） -->
    <!-- 列表 -->
  </scroll-view>
</lingyun-app-page>
```

```ts
import { useLingyunAppPageScroll } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'
const reportScroll = useLingyunAppPageScroll()

function onScroll(event: { detail?: { scrollTop?: number } }) {
  reportScroll(Number(event?.detail?.scrollTop) || 0) // 顶栏随内层滚动渐显玻璃
}
```

- 壳的 `@scroll` 事件同样会抛当前滚动位置（px），需要自己驱动外部元素时可用。
- 透明顶栏 / Banner 垫在下面：`:auto-top-inset="false"`（内容顶到视口顶部，顶栏透明覆盖）；被宿主页嵌入的页面不要关（会丢状态栏安全区）。
- 完全自绘头部（分栏页、点单页）：`:show-toolbar="false"`，不再预留顶栏高度；分栏页直接用 [`lingyun-split-layout`](/components/split-layout.html)。
- 页面背景：壳用独立固定背景层绘制（不随滚动移动），默认 `--lingyun-bg-grouped-primary`；宿主可配置 `--lingyun-page-background` 统一换背景。

## 其它形态

- **Sheet 形态**：`placement="sheet"` + `showGrabber`，用于底部面板内容（表单一类），不显示宽屏导航。
- **嵌入宿主**：宿主页（工作台 / 小程序宽屏托管）里的页面壳自动降级为 embedded，不再渲染导航 / Tab / 背景层。**不要在一个页面壳里再嵌一个页面壳**做分栏（会互相干扰），分栏用 `lingyun-split-layout`。
- **iPhone Duo**：`duo-tools` / `split-primary` / `split-detail` 插槽与 `duo-search` / `duo-overflow` 事件，规则见下文 API 表与 [`design/SIDEBARS.md`](../../design/SIDEBARS.md) §5。

## 属性

### 标题与顶栏

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `title` | 顶栏标题 | '' |
| `subtitle` | 副标题（标题下方一行） | '' |
| `titleStyle` | `title` / `large` / `title2LineLarge` | title |
| `showToolbar` | 是否显示顶栏；`false` 时不再预留顶栏高度 | true |
| `showBack` | 返回钮。`auto`：宽屏导航停靠、或窄屏底部 Tab 的一级 Tab 根页时隐藏，其余显示 | auto |
| `showClose` | 关闭钮（Sheet 场景常用） | false |
| `showTrailing` | 额外渲染一个内置右侧主按钮（分享样式），点击抛 `trailing`；自定义内容用 `#trailing` 插槽，不需要它 | false |
| `showGrabber` | 顶部抓手（Sheet）；打开后不显示宽屏导航 | false |
| `placement` | `standard` 页面 / `sheet` 面板 | standard |
| `safeArea` | 状态栏安全区 | true |
| `autoTopInset` | 自动留出顶栏 + 状态栏高度；`false` 内容顶到视口顶部（透明顶栏垫 Banner） | true |
| `glassDistance` | 内层滚动多少 px 后顶栏玻璃完全铺满 | 56 |
| `showThemeSwitch` | 主题钮：`auto` 跟随全局，`false` 只隐藏当前页 | auto |

### 搜索

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `searchable` | 开启顶部搜索（右侧独立搜索按钮） | false |
| `searching` | 搜索模式；支持 `v-model:searching` | false |
| `searchValue` | 关键词；支持 `v-model:search-value` | '' |
| `searchPlaceholder` | 输入框占位 | 搜索 |

### 分段 / 顶部 Tabs

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `segments` | 控件数据 `{ key, text?, icon?, badge?, disabled? }[]`；空数组不占高度 | [] |
| `segmentValue` | 当前 key；支持 `v-model:segment-value` | '' |
| `segmentControl` | `segmented` 分段控制（行高 56）/ `tabs` 顶部 Tabs（行高 44） | segmented |

### 右侧按钮

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `trailingButtons` | 按钮组；一维一组，二维按组渲染多个胶囊；点击抛 `trailing-action` | [] |
| `trailingButtonsHidden` | 隐藏按钮组（自管浮层打开期间用，避免按钮从浮层边缘露出） | false |
| `trailingMenuEnabled` | 启用内置 `#trailing-menu` 浮层；**小程序必须显式开启** | false |

### 导航与 Tab

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `showNav` | 宽屏（≥690）是否显示左侧导航 | true |
| `navSections` | 覆盖当前页左侧目录；`null` 用全局 tabs / 宿主目录 | null |
| `showTabbar` | 底部 Tab。`auto`：只有一级 Tab 根页 / 工作台页在窄屏显示；`false` 永远隐藏 | auto |
| `navMode` | `auto` / `tabbar` / `sidebar` / `none`；页面级最高优先 | auto |
| `autoBottomInset` | 自动为底部 Tab 留白（仅实际渲染 Tab 时生效）；关掉后变量与注入仍给出真实值 | true |

### 滚动

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `bodyScroll` | 是否由壳滚动正文；`false` 用内层 `scroll-view` | true |
| `pageScroll` | 页面级滚动；含文本输入的页面必须保持 true | true |

## 事件

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `back` | — | 点返回 |
| `close` | — | 点关闭 |
| `trailing` | — | 点顶栏右侧内置主按钮（`showTrailing`）；`#trailing` 插槽内容自行处理点击 |
| `trailing-action` | `{ key, button, index, groupIndex, buttonIndex, anchor }` | 点 `trailingButtons`；`anchor` 可直接给 `lingyun-menu` |
| `scroll` | `scrollTop`（px） | 页面 / 内层滚动位置 |
| `tab-change` | `{ key, tab }` | 点底部 Tab（壳内部已处理跳转） |
| `search-open` | — | 搜索模式打开 |
| `search-cancel` | 关闭前关键词 | 点取消 / `closeSearch()` |
| `search-input` | 当前关键词 | 输入变化 |
| `search` | 当前关键词 | 键盘确认 |
| `update:searching` / `update:searchValue` | — | v-model 同步 |
| `update:segmentValue` | key | v-model 同步 |
| `segment-click` / `segment-change` | `{ value, item }` | 用户切换分段 / Tabs（两者同时触发） |
| `duo-search` / `duo-overflow` | — | Duo 右侧栏搜索 / 更多 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| 默认 | 页面内容 |
| `leading` | 顶栏左侧；提供后不再渲染默认返回钮（Duo 内屏竖屏接管 48×48 Leading） |
| `trailing` | 顶栏右侧自定义内容；`showTrailing` 为内置主按钮 |
| `trailing-menu` | `trailingButtons` 的内置浮层内容，作用域 `{ button, index, groupIndex, buttonIndex, close }` |
| `duo-tools` | Duo 工具项（1~3 个 36×36） |
| `nav-avatar` / `nav-name` / `nav-subtitle` | 宽屏左侧导航顶部头像 / 名称 / 副标题 |
| `split-primary` / `split-detail` | Duo 内屏横屏 Split View 左右栏 |

## 方法

通过组件 `ref` 调用：

| 方法 | 说明 |
| --- | --- |
| `openSearch()` | 打开搜索；未开启 `searchable` 时忽略 |
| `closeSearch(cancel = true)` | 关闭搜索并清空关键词；`cancel=false` 时不发 `search-cancel` |
| `toggleSearch()` | 切换搜索模式 |

## 全局页面配置（一次配置，全部页面生效）

```ts
import {
  setLingyunPageConfig,
  applyLingyunPageFromMenus,
  setLingyunPageNavProfile,
} from '@/uni_modules/lingyun-ui'

setLingyunPageConfig({
  tabs: [...],                 // 一级导航；底部 Tab 与宽屏侧栏共用
  sidebarTitle: '主导航',
  layout: { navMode: 'auto' }, // 全局布局模式
  tabbar: { safeArea: true, variant: 'default' },
  pages: {                     // 页面级覆盖，key 为归一化路径
    '/pages/login/login': { hideTabbar: true, hideNav: true },
  },
})
```

- 后台菜单树可直接用 `applyLingyunPageFromMenus(menuTree, options)` 生成 tabs / 目录 / 工作台分组，无需手写转换。
- 侧栏顶部资料用 `setLingyunPageNavProfile({ avatar, name, subtitle })`，插槽可覆盖。
- 优先级：**props > `pages[path]` 覆盖 > `layout` 全局 > 宽度自动规则**。

## 常见问题

| 现象 | 原因 / 解决 |
| --- | --- |
| 内容被顶栏挡住 / 顶部空一大截 | 用 `autoTopInset=false` 又没自己处理占位；透明顶栏页面自己加占位或让内容顶到顶部 |
| 页面整页滚动、顶栏跟着滚 | 用了内层 `scroll-view` 却没设 `bodyScroll=false`，或内层高度链没有确定高度；参考 [分栏页面 guide](/guide/split-pages.html) §2.2 |
| 底部 Tab 不显示 | 只有一级 Tab 根页 / 工作台页会显示；检查当前路由是否等于 tab 的 `url`、是否被 `pages[path].hideTabbar` 或 `:show-tabbar="false"` 关掉 |
| 有商品底栏但被 Tab 挡住 | 给该页配置 `pages[path].hideTabbar = true` |
| 搜索输入框在小程序上错位 | 页面保持默认 `pageScroll=true`，不要用整屏 `scroll-view` 包输入框（见 `design/TEXTFIELDS.md` §5） |
| 访问别的页面后布局错乱 | 页面结构样式写进了通用 `.page` 类，H5 路由不卸载旧样式；结构样式挂页面专属类，见 guide §2.1 |
| 想在页面里做左右分栏 | 不要手写 / 不要嵌套两个页面壳；直接用 `lingyun-split-layout` |
| 筛选按钮点击没弹浮层 | 小程序需要显式 `trailing-menu-enabled`，并提供 `#trailing-menu` 插槽 |

## iPhone Duo（摘要）

- 内屏竖屏：顶部 `lingyun-duo-toolbar` + 底部 `lingyun-tabbars size="duo"`；页面 `duo-tools` 插槽进顶部工具组。
- 外屏：右侧 `lingyun-duo-rail`（工具组 / Tab / 搜索）；独立页只显示返回钮。
- 内屏横屏折叠 / 半折：Split View，页面用 `split-primary` / `split-detail` 插槽，右侧返回列触发 `back`。
- 设备形态由 `lingyun.formFactor` / `lingyun.duoPose` 决定，宿主可用 `configureLingyunLayout` 接入自有型号判断；`setLingyunDuoSupported(false)` 可整体关闭。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/demo.vue -->
