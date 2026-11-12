# 分栏页面开发指南（列表 + 详情）

> 写「左边列表、右边详情」这类页面之前先读完本文。下面每条坑都在 `list-detail`、`purchase-order-split` 两个演示里真实出过问题。
>
> 参考实现：`src/pages/demo/pages/list-detail/`（纯列表 + 工单详情，最完整）、`src/pages/demo/pages/purchase-order-split/`（标准页面板 + 详情内二级页）。新页面照 `list-detail` 抄结构。

## 1. 三档宽度，三种行为

| 窗口宽度 | 左侧导航 | 点列表行 | 详情返回 |
| --- | --- | --- | --- |
| 手机 **< 690** | 无（底部 Tab） | `uni.navigateTo` 打开独立详情页 | 页面栈返回 |
| 中屏 **690 – 899** | 有 | **不跳页**。设 `detailOpen=true`，详情只在内容区滑入 | 设 `detailOpen=false`，滑出 |
| 宽屏 **≥ 900** | 有 | 只改选中项，右栏刷新 | 无返回钮 |

三档由 `lingyun-split-layout` 的 `layout-change` 事件告诉页面：`wide` 为宽屏，`cover` 为中屏，两者都为 false 才是手机。页面不要自己读窗口宽度。

## 2. 从零做一页：要动的文件

以新功能 `foo-detail` 为例（多文件功能独占目录，见 `.cursor/rules/demo-page-directories.mdc`）：

```
src/pages/demo/pages/foo-detail/
├── foo-detail.vue                   # 分栏主页面（三档都在这一页）
├── foo-detail-item.vue              # 手机独立详情页（读 ?id=）
├── fooDetailDemo.ts                 # 数据与 findXxx(id)
└── components/foo-panel/foo-panel.vue  # 详情内容，两页共用
```

1. **详情内容做成组件**，主页面右栏和手机详情页都用它。不要在两页各写一遍。
2. `src/pages.json` 登记两个页面，都要 `"navigationStyle": "custom"`。
3. `src/config/pageTabs.ts`：页面元信息（标题 / 图标）+ 「页面」Tab 下的 `pageChild`。详情页只登记元信息，不进菜单。
4. `src/components/app-page-view-host/app-page-view-host.vue`：静态 `import` 主页面并加一条 `v-else-if` 分支。小程序宽屏靠它在宿主页内渲染，不加就会整页跳转。`src/router/pageViews.ts` 会从菜单自动登记，不用手写。
5. 文档：`doc/page/foo-detail.md`、`doc/.vuepress/config.ts` 侧栏、`doc/.vuepress/components/PhonePreview.vue` 映射；设计说明放 `design/pages/demo/pages/foo-detail/`。
6. 改完 `pages.json` 或移动文件后，**重启** `pnpm dev` 和 `pnpm dev:mp-weixin`，删掉 `dist/dev/mp-weixin` 里的旧路径，再清微信编译缓存。

## 3. 主页面骨架

```vue
<lingyun-split-layout
  :split-at="900"
  :list-width="375"
  :detail-open="coverOpen"
  @layout-change="onLayoutChange"
>
  <template #list-header>
    <lingyun-split-toolbar
      title="工单"
      :show-back="!navDocked && !hosted"
      :avoid-capsule="!wide"
      :glass-progress="listGlass"
      @back="onPageBack"
    />
  </template>

  <template #list>
    <view class="lingyun-split-layout-pane">
      <scroll-view class="lingyun-split-layout-scroll" scroll-y @scroll="onListScroll">
        <view :style="{ height: `${listTopSpace}px` }" />
        <!-- 列表行：宽屏才有选中态 -->
      </scroll-view>
    </view>
  </template>

  <template #detail-header>
    <lingyun-split-toolbar
      title="工单详情"
      :show-back="cover"
      :avoid-capsule="cover"
      :glass-progress="detailGlass"
      @back="coverOpen = false"
    />
  </template>

  <template #detail>
    <scroll-view class="lingyun-split-layout-fill" scroll-y @scroll="onDetailScroll">
      <view :style="{ height: `${detailTopSpace}px` }" />
      <foo-panel v-if="selected" :item="selected" />
    </scroll-view>
  </template>
</lingyun-split-layout>
```

```ts
const wide = ref(false)
const cover = ref(false)
const coverOpen = ref(false)
const listTopSpace = ref(0)
const detailTopSpace = ref(0)

function onLayoutChange(value: LingyunSplitLayoutChange): void {
  wide.value = value.wide
  cover.value = value.cover
  if (value.wide) coverOpen.value = false
  listTopSpace.value = value.listTopSpace
  detailTopSpace.value = value.detailTopSpace
}

function onRowTap(item: Foo): void {
  if (wide.value) {
    selectedId.value = item.id
    scrollDetailTop()
    return
  }
  if (cover.value) {
    selectedId.value = item.id
    coverOpen.value = true
    scrollDetailTop()
    return
  }
  uni.navigateTo({ url: `/pages/demo/pages/foo-detail/foo-detail-item?id=${encodeURIComponent(item.id)}` })
}
```

玻璃进度：`Math.min(1, Math.max(0, scrollTop / 56))`，同时调用 `useLingyunAppPageScroll()` 返回的函数上报滚动。

## 4. 交互上的坑

### 4.1 中屏不能 `navigateTo`：左侧导航会跟着滑

中屏已经有左侧导航。新开页面时，微信用整页推入动画，新页面自带的那份导航也一起滑进来，关闭时一起滑出。开发者工具里动画很快，不容易看出来。

- ✅ 中屏设 `detailOpen`，详情只在内容区滑入（`lingyun-split-layout` 内部是绝对定位盖层，320ms）。导航是 `position: fixed` 的兄弟节点，不参与动画。
- ✅ 判断顺序固定为 **wide → cover → navigateTo**。只判断 `wide` 就会把中屏当手机处理。
- ✅ 盖层里的详情 toolbar：`show-back` 与 `avoid-capsule` 都跟着 `cover`，返回只做 `coverOpen = false`。
- ✅ 进入宽屏时清掉 `coverOpen`，否则窗口拉回中屏时盖层会自己弹出来。

### 4.2 详情里还有下一级（比如子订单）

中屏盖层里点下一级，也不要 `navigateTo`，原因同 4.1。在页面里记一个下一级状态（`purchase-order-split` 用 `subKey`）：

- 点下一级：设 `subKey`，标题换成下一级标题。
- 返回：先清 `subKey`，回到上一级；`subKey` 为空时才关闭盖层。

宽屏和手机可以 `navigateTo` 到详情页，它们没有导航跟着滑的问题。

### 4.3 返回一次退了两层

`lingyun-app-page` 的返回钮默认自己 `navigateBack`。如果外层（标准页、页面）也监听 `back` 再返回一次，就退两层。

- ✅ 要自己处理返回时传 `:auto-back="false"`，返回钮只抛 `back`。标准页要把 `autoBack` 透传给内部的 `lingyun-app-page`。
- ✅ 页面自己的返回：栈里有上一页就 `navigateBack`，没有就 `reLaunch` 或 `redirectTo` 到列表或目录。

### 4.4 小程序宽屏宿主：toolbar 与返回钮

小程序宽屏时，菜单进入的页面会被并进宿主页 `pages/demo/demo` 渲染（`app-page-view-host`）。

- ✅ 分栏页自带 toolbar，进宿主时设 `pageHostState.hideToolbar = true`，卸载时还原，否则顶部出现两条栏。
- ✅ 宿主内或左侧导航停靠时不显示列表返回钮：`:show-back="!navDocked && !hosted"`。
- ✅ 只有栈底页会被并入宿主（`ensureLingyunWidePageHost` 检查 `getCurrentPages().length`）。从列表 `navigateTo` 进来的详情页不能被替换，否则丢返回钮和 `?id=` 参数。

### 4.5 固定定位的浮层会盖住中屏盖层

`lingyun-date-switcher` 这类组件在手机上是 `fixed` 贴底，中屏打开盖层后它仍停在最上层，盖住详情。

- ✅ `:fixed="!wide && !coverOpen"`，盖层打开时让它退回普通流。
- ✅ 弹层（Sheet、Popover、Alert 等）照常 Teleport 或 `root-portal`，见 `.cursor/rules/overlay-portal.mdc`。

### 4.6 选中、回顶与默认选中

- 宽屏默认选中筛选结果第一条；筛选后选中项被过滤掉，换成新的第一条。
- 选中态只在宽屏显示：`:class="{ active: wide && item.id === selectedId }"`。手机和中屏没有选中概念。
- 换选中项后右栏回顶、筛选后左栏回顶，用 `scroll-into-view`：先清空锚点，`nextTick` 再设，300ms 后再清空。不清空的话，重复点同一行不会回顶，之后的重渲染还会反复回顶。

### 4.7 列表图片

- ✅ 列表行图片用 `lingyun-list-item` 的 `thumb`，或直接用 `lingyun-image`（有扫光占位和懒加载）。不要写原生 `<image>`：加载中是空白，失败也是空白。
- ✅ 显式传尺寸和圆角，`lingyun-image` 默认圆角 26 会让缩略图太圆。列表缩略图 42 / 10（有副标题）或 30 / 7；订货单缩略图 52 / 10。
- ⚠️ 演示图不要用 `picsum.photos`，在部分网络下会超时，看起来就是「图片都不显示」。仓库里用 Unsplash 地址（见 `purchaseOrderDemo.ts`）。小程序真机还要在后台配置 `downloadFile` 合法域名。

## 5. 布局与样式上的坑

### 5.1 不要解构作用域插槽参数

`#list="{ wide, topSpace }"` 在微信小程序上不可靠：页面一重渲染（比如点行改了选中项），插槽里组件的 props 就被清掉，出现列表筛空、日期条错位、整栏空白。`wide`、`cover`、`topSpace` 一律从 `layout-change` 存进页面状态。

### 5.2 插槽内容要用结构工具类（小程序宿主节点没有高度）

小程序里每个自定义组件都会多一层宿主节点，默认高度随内容。面板内部的 `height: 100%` 失效，结果是整页滚动、toolbar 跟着滚走。H5 没有这层节点，所以常见症状是「H5 正常、小程序整页滚」。

- 插槽根容器：`lingyun-split-layout-pane`（绝对铺满 + 纵向 flex）
- 插槽根节点本身就是 `scroll-view`：`lingyun-split-layout-fill`
- 容器内的内层 `scroll-view`：`lingyun-split-layout-scroll`（`flex: 1; height: 0`）

工具类在 `styles/setting/_split-layout.scss`，由 `App.vue` 全局注入。不要搬进组件样式：小程序 styleIsolation 下插槽节点吃不到组件的 wxss。也不要在面板里写 `:host { height: … }`，会影响面板在标准页里的正常用法。

### 5.3 内层滚动用 `flex: 1 + height: 0`，不要用百分比

WXSS 里 `scroll-view` 的 `height: 100%` 在 flex 链路上拿不到确定高度，会被内容撑开。手写滚动区时：

```scss
.xxx-body { flex: 1; min-height: 0; height: 0; display: flex; flex-direction: column; overflow: hidden; }
.xxx-scroll { flex: 1; min-height: 0; height: 0; }
```

### 5.4 不要在分栏里嵌整页标准页

`lingyun-app-page` 嵌在另一个 `lingyun-app-page` 里会降级为 embedded：内层滚动失效，H5 导航内边距叠两次，列表钻到导航下面。标准页要拆成「页面壳 + 内容面板」，分栏页只用面板（如 `lingyun-purchase-order-list-panel`），面板通过 `topSpace` 和 `scroll` 事件配合 toolbar。不要给标准页加 `inline` 之类的特例开关。

### 5.5 toolbar 只用 `lingyun-split-toolbar`

两栏头部放 `lingyun-split-toolbar`，页面只传标题、搜索、分段、按钮。不要直接写 `lingyun-toolbars`，也不要设 `title-style` 等展示属性；标题样式、分段形态和 H5 / 微信 PC 的 12px 顶部补偿都固定在组件里。头部高度由分栏组件测量，页面不要自己 `createSelectorQuery`。

### 5.6 页面结构样式不要写在通用 `.page` 上

H5 切换路由不会卸载旧页面的 CSS。在 `.page` 上写 `display: flex` 或 `height: 100vh`，离开后会套到别的页面上（目录页缩成一列、底栏消失）。结构样式挂页面专属类（`.list-page`、`.po-page`），`.page` 上只留可被覆盖的 padding 和背景。排查方法：**访问过 A 之后 B 才错版，就查 A 的样式是不是写在通用类上。**

### 5.7 底色、选中与缝隙

- 左栏底色由 `lingyun-split-layout` 提供：手机 Primary，宽屏 grouped-secondary（浅色白，暗黑 `#1c1c1e`）。插槽内容不要再设背景。
- 选中行用页面底色 `--lingyun-bg-grouped-primary`，和右栏连成一片。暗黑下 Primary 与 Grouped Primary 都是 `#000`，只能靠左栏的 grouped-secondary 分层。
- 两栏缝隙透明，不要画 `--lingyun-separator` 灰线。

### 5.8 底部悬浮栏

底部操作胶囊 `position: absolute; bottom: 0` 浮在滚动内容上（左右 12、底部 8 + 安全区、`lingyun-glass-control`），滚动内容底部留出 `calc(96px + env(safe-area-inset-bottom))`。不要做成占一整条的实底栏。

## 6. 调试上的坑

- **现象说不通时，先查进程和缓存，再改代码。** 同时开着多个 `pnpm dev:mp-weixin` 会互相覆盖 `dist`，微信报一个找不到原因的「编译 .wxss 文件错误」。处理：只留一个 H5 和一个小程序进程，删旧产物，清编译缓存（`cleanCompileCache`），必要时关掉项目窗口再打开。
- **H5 验证完还要看小程序。** 宿主节点高度、作用域插槽、`fixed` 浮层这些问题只在小程序出现。
- **自动化测试点行之前，先等 `layout-change` 到达。** 页面刚挂载时 `cover` 可能还是 false，这时点行会走 `navigateTo`，看起来像中屏还在跳页。等布局稳定后再测。
- **中屏动画太快时，量位置，不要只看截图。** 打开和关闭时左侧导航的 `left` 应始终不变，盖层的 `transform` 从 `translateX(100%)` 变到 `0`，页面路由不变。

## 7. 验收清单

H5（明暗两套主题；宽度 390 / 744 / 1024 / 1400 往返切换）：

- [ ] 390：点行进入独立详情页，返回只退一层
- [ ] 744：点行详情在内容区滑入，左侧导航不动，地址不变；返回滑出后盖层节点被移除
- [ ] 1024：点行只换右栏内容并回顶，选中行与右栏同色
- [ ] 整页不滚：`document.documentElement.scrollHeight === window.innerHeight`；两栏各自可滚，toolbar 固定，滚动后出现玻璃
- [ ] 列表图片有扫光占位，加载后显示；视口外的图片还没请求
- [ ] 去别的页面再回来，两边样式都没变

微信小程序（开发者工具，窗口宽度同样切三档）：

- [ ] 手机宽度点行，页面栈多一层；中屏点行，页面栈不变（仍在宿主页）
- [ ] 中屏打开与关闭时左侧导航不动，日期条没有盖住详情
- [ ] `wx.pageScrollTo(200)` 后 `scrollTop` 仍为 0，内层 `scroll-view` 高度等于视口
- [ ] 宿主页内只有一条 toolbar；从列表进入的详情页有返回钮
- [ ] 控制台无 WXSS / WXML 报错，改完已清编译缓存

## 演示源码

文档不重复贴代码，构建时直接从仓库读取源码（点开折叠块查看）。

<!-- demo-source: src/pages/demo/pages/list-detail/list-detail.vue -->
<!-- demo-source: src/pages/demo/pages/list-detail/list-detail-item.vue -->
<!-- demo-source: src/pages/demo/pages/purchase-order-split/purchase-order-split.vue -->
<!-- demo-source: src/pages/demo/pages/purchase-order-split/purchaseOrderDemo.ts -->
