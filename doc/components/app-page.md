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
| `navSections` | 只覆盖当前页的微信内嵌列。H5 常驻侧栏和首页列表用 `setLingyunPageNavSections`。组件演示列表是 `/pages/demo/demo` | null |
| `glassDistance` | 滚动多少 px 后顶栏玻璃铺满 | 56 |

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

含文本输入的页面不要设 `:page-scroll="false"`。横向滑动行需要锁竖向滚动时才关。
