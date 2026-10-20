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
| `showTabbar` | 全局 tabs 的底部 Tab 栏。`auto` 时窄屏显示；显式 `false` 永远隐藏 | auto |
| `navMode` | `auto / tabbar / sidebar / none`。页面级最高优先 | auto |
| `autoBottomInset` | 自动为底部 Tab 留白。关掉后组件不再加 padding，但 CSS 变量与注入仍给出真实值 | true |
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
- 优先级：props > `pages[path]` 页面覆盖 > `layout` > 宽度自动规则。
- 窄屏点击 `reLaunch`；微信宽屏优先走 `openLingyunHostedPage`，不增加页面栈。
- 壳自动为底部 Tab 留白，写入 `--lingyun-app-page-inset-bottom` 与 `LINGYUN_APP_PAGE_BOTTOM_INSET`。页面不要再手写 `padding-bottom`；已有手写值时设 `:auto-bottom-inset="false"`。
- 带商品底栏 / 底部搜索条的页面请配置 `pages[path].hideTabbar = true`。

不传左栏顶部插槽、也不调用 `setLingyunPageNavProfile` 时，宽屏左栏显示「凌云UI」和介绍「一套对齐 Apple Liquid Glass 的 uni-app 多端组件库」。传入自定义名称且不传副标题时，不显示这句介绍。

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `leading` | 顶栏左侧 |
| `trailing` | 顶栏右侧 |
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
| `tab-change` | 点底部 Tab，参数 `{ key, tab }` |

含文本输入的页面不要设 `:page-scroll="false"`。横向滑动行需要锁竖向滚动时才关。
