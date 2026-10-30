# lingyun-app-page

业务页的外壳：自定义顶栏、滚动时顶栏变玻璃、宽屏左侧导航留位。反馈 Toast / HUD 也挂在这一层里。

## 示例

```vue
<lingyun-app-page title="首页" :show-back="false">
  <view>正文</view>
</lingyun-app-page>

<!-- 子页：自动显示返回 -->
<lingyun-app-page title="详情" subtitle="今天">
  <view>正文</view>
</lingyun-app-page>

<!-- 关掉头部顶栏，正文从顶部开始 -->
<lingyun-app-page :show-toolbar="false">
  <view>正文</view>
</lingyun-app-page>

<!-- 关掉宽屏左侧导航 -->
<lingyun-app-page title="登录" :show-nav="false" />

<!-- 宽屏左栏顶部：头像、名称、副标题 -->
<lingyun-app-page title="首页">
  <template #nav-avatar>
    <image src="/static/avatar.png" mode="aspectFill" />
  </template>
  <template #nav-name>
    <text>凌云</text>
  </template>
  <template #nav-subtitle>
    <text>组件库</text>
  </template>
  <view>正文</view>
</lingyun-app-page>
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `title` | 顶栏标题 | '' |
| `subtitle` | 副标题 | '' |
| `titleStyle` | `title` / `large` / `title2LineLarge` | title |
| `placement` | `standard` 页面，或 `sheet` | standard |
| `showBack` | 返回按钮。`auto` 时显示；宽屏已停靠左侧导航则隐藏 | auto |
| `showClose` | 关闭按钮 | false |
| `showGrabber` | 顶部抓手。打开后不显示宽屏导航 | false |
| `showTrailing` | 右侧按钮 | false |
| `safeArea` | 状态栏安全区 | true |
| `bodyScroll` | 是否由本组件滚动正文 | true |
| `pageScroll` | 页面级滚动。有输入框时必须保持 true | true |
| `showNav` | 宽屏（窗口 ≥ 690）是否显示左侧导航 | true |
| `showToolbar` | 是否显示头部顶栏。关掉后不再预留顶栏高度 | true |
| `navSections` | 显式分组目录，优先级高于全局 tabs 与宿主目录。只影响当前这次渲染；H5 常驻侧栏请用 `setLingyunPageConfig` 或 `setLingyunPageNavSections` | null |
| `showTabbar` | 全局 tabs 的底部 Tab 栏。`auto` 时只有一级 Tab 根页 / 工作台页在窄屏显示；显式 `false` 永远隐藏 | auto |
| `navMode` | `auto / tabbar / sidebar / none`。页面级最高优先 | auto |
| `autoBottomInset` | 自动为底部 Tab 留白（仅当前页实际渲染 Tab 时生效）。关掉后组件不再加 padding，但 CSS 变量与注入仍给出真实值 | true |
| `autoTopInset` | 自动计算顶部工具栏 / 状态栏留白；被宿主页嵌入的工作台页设 false，由外层统一留白 | true |
| `trailingButtons` | 顶栏右侧自定义按钮组，`{ key, icon?, label?, disabled? }[]`；点击发 `trailing-action` | [] |
| `glassDistance` | 滚动多少 px 后顶栏玻璃铺满 | 56 |

## 一级导航（数据驱动）

一次配置，窄屏渲染底部玻璃 Tab，宽屏（≥690）渲染左侧停靠导航：

```ts
import { setLingyunPageConfig } from '@/uni_modules/lingyun-ui'

setLingyunPageConfig({
  tabs: [
    { key: 'home', text: '首页', icon: 'home', url: '/pages/index/index' },
    { key: 'orders', text: '订单', icon: 'list', url: '/pages/orders/orders', badge: 3 },
  ],
  sidebarTitle: '主导航',
  layout: { navMode: 'auto' },
  pages: {
    '/pages/login/login': { hideTabbar: true, hideNav: true },
  },
})
```

- 选中态从当前路由推导；详情页可用 `match` 归入某个 Tab。
- iPad（690–1199）与 PC（≥1200）配置全局 tabs 后，左侧导航收窄为 **84** 通高窄栏，图标在上、文字在下；整列铺满左侧区域（无外边距、无圆角、无侧边线），底色与内容卡片相同的 grouped 背景，叠加固定的顶栏同款 tint（不随滚动变化），滚动后与顶栏玻璃同亮度。`.lingyun-page-safe-left` 保留兼容。未配置 tabs 的完整目录仍为 220。
- Tab 支持 `children` 二级菜单；二级项还可再带 `children` 作为三级菜单：工作台把有三级的分组渲染成带标题的分组卡片，三级项是卡片里的按钮；只有二级菜单的 Tab 渲染成一张没有标题的卡片。宽屏左侧菜单用分组标题分隔。宽屏左侧（Web / 小程序一致）点击父项用 `lingyun-menu` 弹出（透明遮罩，点击外部关闭）；底部 Tab / Duo Tab 点击有 children 的父项进入固定工作台页（`workspaceUrl?tab=<key>`），没有 children 直接进 `url`。工作台子项用 `navigateTo` 压栈，返回父 Tab 工作台。子项路径自动归入父 Tab 高亮。
- 优先级：props > `pages[path]` 页面覆盖 > `layout` > 宽度自动规则。
- 窄屏由首页 / 目录宿主页在页内切换一级 Tab，页面栈不增长；H5 地址保持为宿主路由的 `?tab=<key>`，刷新或从子页返回后按这个 key 恢复。微信宽屏优先走 `openLingyunHostedPage`，不增加页面栈；从其他页面直接进入工作台时仍走一次路由。
- 页面壳默认不接管底部 Tab：只有一级 Tab 根页或带 children 的工作台页渲染 Tab；子页/详情页/首页默认没有 Tab，也不会留出底部空间。其他页面需要 Tab 请自行使用 `lingyun-tabbars`。
- 壳只在当前页实际渲染底部 Tab 时留白，写入 `--lingyun-app-page-inset-bottom` 与 `LINGYUN_APP_PAGE_BOTTOM_INSET`。页面不要再手写 `padding-bottom`；已有手写值时设 `:auto-bottom-inset="false"`。
- 页面背景由独立的固定背景层绘制，固定在视口，不随页面级滚动 / 内层 scroll-view / body 自管滚动移动；壳根节点只保留纯色兜底。宿主可只配一次 `--lingyun-page-background`（可放渐变或纯色），所有页面共用，底部 Tab 留白、安全区和宿主页都会露出同一张背景。
- 跨页 `reLaunch` 本身没有页面动画：壳会在换页后让内容淡入。底部 Tab 指示器按 Tab 顺序左右滑动，左侧菜单的选中胶囊按菜单顺序上下滑动；工作台内切换只让内容区淡入。
- 带商品底栏 / 底部搜索条的页面请配置 `pages[path].hideTabbar = true`。

## iPhone Duo（P1）

- 设备形态由 `lingyun.formFactor` / `lingyun.duoPose` 决定；宿主可通过 `configureLingyunLayout({ getFormFactor, getDuoPose })` 接入已有型号判断。
- 内屏竖屏：顶部使用 `lingyun-duo-toolbar`（84 高；Leading 48、标题 17/22 左对齐、右侧 164×48 工具组、最右预留 134），底部使用 `lingyun-tabbars size="duo"`（95 高，玻璃条 62，Tab 77×54，图标 22，文字 10/12）。页面的 `duo-tools` 插槽会渲染到顶部工具组，最多 3 个 36×36 项。
- 半折：屏幕中心显示 40px 横向折痕安全带；交互控件应避开，滚动内容可跨越。
- 外屏竖屏 / 外屏横屏 / 内屏横屏：右侧 `lingyun-duo-rail`（84 宽，工具组、4 个仅图标 Tab、搜索；外屏横屏工具收进「…」溢出）。页面用 `duo-tools` 插槽放工具按钮，监听 `duo-search` / `duo-overflow`；同一组工具在 Duo 内屏竖屏会进入顶部玻璃工具组。独立页（非一级 Tab 根页）只在摄像头 / 状态栏下方显示返回钮，不显示 Tab 组和搜索；Tab 根页默认也不显示搜索，需配置 `tabbar.search = true`。
- 内屏横屏折叠/半折：Split View（左主栏 / 40 折痕避让带 / 右详情栏），顶部 84 高 Duo Toolbar，右侧 84 返回列，Tab 隐藏。页面用 `split-primary` / `split-detail` 插槽；右侧返回触发 `back`。
- H5 与微信小程序都按设备形态进入 Duo 分支；宿主可调用 `setLingyunDuoSupported(false)` 关闭。

不传左栏顶部插槽、也不调用 `setLingyunPageNavProfile` 时，宽屏左栏显示「凌云UI」和介绍「一套对齐 Apple Liquid Glass 的 uni-app 多端组件库」。传入自定义名称且不传副标题时，不显示这句介绍。

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `leading` | 顶栏左侧；Duo 内屏竖屏下接管 48×48 Leading，提供后不再渲染默认返回钮 |
| `trailing` | 顶栏右侧；Duo 内屏竖屏作为 `duo-tools` 的兼容回退 |
| `duo-tools` | Duo 工具项；内屏竖屏进入顶部 164×48 玻璃工具组（1~3 个 36×36），其他姿态进入右侧全高栏 |
| `trailing-menu` | `trailingButtons` 点击后的自定义菜单内容；参数 `{ button, index, close }`，可放 menu / activity view |
| `nav-avatar` | 宽屏左栏顶部头像 |
| `nav-name` | 宽屏左栏顶部名称，对齐原来的「凌云UI」 |
| `nav-subtitle` | 宽屏左栏顶部副标题，挂在名称下面 |

H5 侧栏在页面外面，这三个插槽会送进那一列。微信小程序直接嵌在当前页。离开页面后，顶部回到没有插槽时的样子。

## 事件

| 事件 | 说明 |
| --- | --- |
| `back` | 点返回 |
| `close` | 点关闭 |
| `trailing` | 点右侧按钮 |
| `trailing-action` | 点 `trailingButtons`，参数 `{ key, button, index }` |
| `tab-change` | 点底部 Tab，参数 `{ key, tab }` |

含文本输入的页面不要设 `:page-scroll="false"`。横向滑动行需要锁竖向滚动时才关。
