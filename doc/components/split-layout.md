# lingyun-split-layout

列表 + 详情分栏布局组件。窗口 **≥ `splitAt`（默认 900）** 左右分栏：左栏固定 `listWidth`（默认 375，手机逻辑宽度），右栏占满剩余；**窄屏只渲染左栏**，详情由业务在点行时打开独立页面。

组件内部封好了 [`doc/guide/split-pages.md`](/guide/split-pages.html) 里的坑：app-page（关顶栏、`body-scroll=false`）+ 专属类 flex 行 + 浮动头部 + 0.5px 透明缝隙 + 头部高度测量，业务只写左右两栏自己的内容。

**两栏的 toolbar 统一用配套组件 [`lingyun-split-toolbar`](#lingyun-split-toolbar)** 放进 `list-header` / `detail-header` 插槽：它固定了标题样式、分段控件、顶部补偿等展示属性，页面只传业务配置。不要直接在插槽里写 `lingyun-toolbars` 或 `title-style` 之类的展示属性——所有分栏页的头部效果由这一份组件保证一致。

> 为什么 toolbar 不内置进分栏组件：微信小程序里，在分栏（app-page 的插槽）内部渲染 toolbar 并绑定事件会中断渲染（白屏）。配套组件仍由页面声明、由页面绑定事件，因此在小程序上稳定；展示样式集中在配套组件里，页面无法改偏。

参考 demo：`/pages/demo/split-layout`（组件 Demo，整页即分栏）、`/pages/demo/list-detail`（纯列表 + 工单详情，含搜索 / 状态分段 / 底部日期条）、`/pages/demo/purchase-order-split`（订货单列表 + 详情面板）。

## 示例

```vue
<lingyun-split-layout
  title="订货单"
  :split-at="900"
  :list-width="375"
  @layout-change="onLayoutChange"
>
  <template #list-header>
    <lingyun-split-toolbar
      title="订货单"
      :segments="filters"
      :segment-value="activeFilter"
      :show-back="showBack"
      :avoid-capsule="!wide"
      :glass-progress="listGlass"
      @segment-change="onFilterChange"
      @back="onBack"
    />
  </template>

  <template #list>
    <lingyun-purchase-order-list-panel
      class="lingyun-split-layout-pane"
      :top-space="listTopSpace"
      @scroll="onListScroll"
      @purchase-order-click="onSelect"
    />
  </template>

  <template #detail-header>
    <lingyun-split-toolbar title="订货单详情" :glass-progress="detailGlass" />
  </template>

  <template #detail>
    <lingyun-purchase-order-detail-panel
      class="lingyun-split-layout-pane"
      :order="current"
      :top-space="detailTopSpace"
      @scroll="onDetailScroll"
    />
  </template>
</lingyun-split-layout>
```

```ts
import type { LingyunSplitLayoutChange } from '@/uni_modules/lingyun-ui'

const wide = ref(false)
const listTopSpace = ref(0)
const detailTopSpace = ref(0)

function onLayoutChange(value: LingyunSplitLayoutChange): void {
  wide.value = value.wide
  listTopSpace.value = value.listTopSpace
  detailTopSpace.value = value.detailTopSpace
}
```

> **不要解构作用域插槽参数**（`#list="{ wide, topSpace }"`）。微信小程序里，作用域插槽内子组件的 props 由分栏组件渲染时登记，页面一重渲染（比如点行改了选中项）就会被清掉，插槽里的组件退回默认值：列表筛空、日期条错位、整栏空白。`wide` / `topSpace` 一律从 `layout-change` 存到页面自己的状态里。

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `title` | app-page 标题（两栏 toolbar 自带标题，通常留空） | '' |
| `splitAt` | 分栏门槛：窗口宽度 ≥ 该值分栏，窄屏只显示左栏 | 900 |
| `listWidth` | 宽屏左栏宽度 px | 375 |
| `showNav` | 透传 `lingyun-app-page`：宽屏是否保留应用导航列 | true |
| `showTabbar` | 透传 `lingyun-app-page`：是否显示底部 Tab | false |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `list-header` | 左栏浮动头部（放 `lingyun-split-toolbar`） |
| `list` | 左栏内容；顶部占位用 `layout-change` 的 `listTopSpace` |
| `detail-header` | 右栏浮动头部（放 `lingyun-split-toolbar`，仅宽屏渲染） |
| `detail` | 右栏内容（仅宽屏渲染）；顶部占位用 `detailTopSpace` |

插槽仍带 `{ wide, topSpace }` 作用域参数以兼容旧写法，但小程序上不可靠，新页面不要用。

## 事件 / 方法

| 名称 | 说明 |
| --- | --- |
| `layout-change` | `(value: LingyunSplitLayoutChange)`，即 `{ wide, listTopSpace, detailTopSpace }`；挂载时抛一次，分栏状态或头部高度变化时再抛。业务用 `wide` 决定点行是切换右侧还是打开独立详情页 |
| `wide-change` | `(wide: boolean)`，挂载时立即抛一次；只关心分栏时可用 |
| `ready` | 首次测量完成后抛 |
| `measureHeaders()` | 通过 ref 调用，动态插拔头部内容后手动重测 |

## 注意事项

- **toolbar 只用 `lingyun-split-toolbar`**；分成头部里的玻璃进度由内容滚动驱动（`scroll` 事件 → `:glass-progress`），组件本身不监听内层滚动。
- `listTopSpace` / `detailTopSpace` 交给内容做顶部占位（面板的 `top-space` 或自绘 spacer），不要再自己 `createSelectorQuery` 量头部。
- **左栏底色由组件统一提供**：窄屏整页是列表页 → Primary 背景；宽屏左栏是抬升的列表列 → grouped-secondary（浅色白 / 暗黑 `#1c1c1e`），与右侧详情分层。插槽内容**不要再自己设左栏背景**，否则暗黑下会和右侧详情糊成一片。
- **小程序**：插槽内容在小程序里不参与 flex 拉伸，内容容器（`.ly-split-layout__content`）有确定高度并作为定位参照。结构直接用组件自带的全局工具类，不用再手写绝对定位样板：
  - 插槽根容器（内部再放滚动区 / 浮层）：`lingyun-split-layout-pane`（绝对铺满 + 纵向 flex）
  - 插槽根节点本身就是 `scroll-view`：`lingyun-split-layout-fill`（绝对铺满）
  - 容器内的内层 `scroll-view`：`lingyun-split-layout-scroll`（`flex:1 + height:0`，内层独立滚动）

  工具类定义在 `styles/setting/_split-layout.scss`，由 `App.vue` 全局注入——小程序组件 styleIsolation 下插槽节点吃不到组件 wxss，写进组件样式不会生效。
- 窄屏左栏头部的返回钮由业务判断（导航停靠 / 宿主页时不显示），通过 `lingyun-split-toolbar` 的 `show-back` 传入。
- 选中态（`selectedKey`）等视觉语义仍由两栏内容自己决定，参考 [`split-pages.md`](/guide/split-pages.html) §2.6。

## lingyun-split-toolbar

分栏页专用浮动顶栏。内部固定 `title2LineLeft`、无副标题、非 fixed、不显示窗口按钮 / 主题钮、`segments` 固定渲染为分段控件，并统一处理 H5 / 微信 PC 的 12px 顶部补偿（加在 toolbar 玻璃内部，栏顶不会露出滚动内容；手机由 toolbar 自身 `safe-area` 处理）。页面不需要也不能再覆盖这些展示属性。

### 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `title` | 标题 | '' |
| `showBack` | 是否显示返回钮 | false |
| `searchable` | 开启搜索 | false |
| `searchPlaceholder` | 搜索占位 | 搜索 |
| `searching` | 搜索态（`v-model:searching`） | false |
| `searchValue` | 搜索关键词（`v-model:search-value`） | '' |
| `segments` | 分段数据 `{ key, text?, icon?, badge?, disabled? }[]` | [] |
| `segmentValue` | 当前分段（`v-model:segment-value`） | '' |
| `trailingButtons` | 右侧自定义按钮组（一维一组 / 二维多胶囊） | [] |
| `trailingMenuEnabled` | 启用 `#trailing-menu` 浮层 | false |
| `avoidCapsule` | 是否避让微信胶囊；宽屏分栏左栏传 false | true |
| `glassProgress` | 玻璃强度 0~1（由内容滚动驱动） | 0 |

### 插槽

| 插槽 | 作用域 | 说明 |
| --- | --- | --- |
| `trailing-menu` | `{ button, index, groupIndex, close }` | 自定义按钮浮层内容 |

### 事件

| 事件 | 说明 |
| --- | --- |
| `back` | 返回钮 |
| `search-open` / `search-cancel` / `search-input` / `search` | 搜索相关；`input` / `search` 参数为关键词，`cancel` 为当前关键词 |
| `segment-click` / `segment-change` | 分段点击 / 切换，参数 `{ value, item }` |
| `trailing-action` | 自定义按钮点击，参数 `{ key, button, index, groupIndex, buttonIndex, anchor }` |
| `update:searching` / `update:searchValue` / `update:segmentValue` | `v-model` 更新 |

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/split-layout.vue -->
