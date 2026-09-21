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

<!-- 关掉宽屏左侧导航 -->
<lingyun-app-page title="登录" :show-nav="false" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `title` | 顶栏标题 | '' |
| `subtitle` | 副标题 | '' |
| `titleStyle` | `title` / `large` / `title2LineLarge` | title |
| `placement` | `standard` 页面，或 `sheet` | standard |
| `showBack` | 返回按钮。`auto` 时非首页显示 | auto |
| `showClose` | 关闭按钮 | false |
| `showGrabber` | 顶部抓手。打开后不显示宽屏导航 | false |
| `showTrailing` | 右侧按钮 | false |
| `safeArea` | 状态栏安全区 | true |
| `bodyScroll` | 是否由本组件滚动正文 | true |
| `pageScroll` | 页面级滚动。有输入框时必须保持 true | true |
| `showNav` | 宽屏（窗口 ≥ 700）是否显示左侧导航 | true |
| `navSections` | 覆盖默认目录。不传则用 `src/router/pageNav.ts` | null |
| `glassDistance` | 滚动多少 px 后顶栏玻璃铺满 | 56 |
## 事件

| 事件 | 说明 |
| --- | --- |
| `back` | 点返回 |
| `close` | 点关闭 |
| `trailing` | 点右侧按钮 |

含文本输入的页面不要设 `:page-scroll="false"`。横向滑动行需要锁竖向滚动时才关。
