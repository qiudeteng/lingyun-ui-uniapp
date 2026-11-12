# lingyun-page-nav

宽屏左侧目录。一般不用单独放：小程序由 `lingyun-app-page` 嵌进来，H5 在 `app.use(lingyunUi)` 时挂到 `body`。

顶部默认两行：名称「凌云UI」，副标题「一套对齐 Apple Liquid Glass 的 uni-app 多端组件库」。名称和右侧顶栏标题对齐，副标题挂在名称下面，栏高不变。侧栏较窄，介绍超出一行会省略。

## 示例

```vue
<lingyun-page-nav :sections="sections" />
```

业务页不要直接改这一列。头像、名称、副标题写在 `lingyun-app-page` 上，见 [页面壳](./app-page.md)。后台数据在登录后写一次：

```ts
import { setLingyunPageNavProfile, setLingyunPageNavSections } from '@/router/pageNav'

setLingyunPageNavSections(sections)
setLingyunPageNavProfile({
  avatar: user.avatar,
  name: user.name,
  subtitle: user.org,
})
```

H5 侧栏只挂一次，页面上的 `sections` 到不了它。全局菜单用 `setLingyunPageNavSections`。首页与底部 Tab / 工作台统一读取 `src/config/pageTabs.ts` 的 `DEMO_PAGE_TABS`；宽屏侧栏的默认目录由同一份 Tab 数据派生，运行时 `setLingyunPageNavSections` 只覆盖侧栏，不影响首页 / Tab。

数据源优先级：组件 `sections` > 全局 `setLingyunPageConfig({ tabs })` > `setLingyunPageNavSections`。使用全局 tabs 时不显示内置「首页」行；`badge` 渲染角标，`match` 让详情页继续高亮所属项。tabs 与子项都支持图片图标 `iconSrc` / `activeIconSrc`（选中态用 `activeIconSrc`，未传回退 `iconSrc`），优先于 `icon` 字形。宽屏常驻导航仍是分组实底，不是浮动玻璃侧栏。

切换页面时选中项胶囊做 280ms 上下滑动，右侧内容区淡入；小程序宽屏的常驻宿主切换同样适用。

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `sections` | 分组目录。每组 `{ title, items: [{ title, url, note, icon, badge, match }] }`。显式传入时优先级最高；只影响当前这次渲染。H5 常驻侧栏请用 `setLingyunPageConfig` 或 `setLingyunPageNavSections` | 默认目录 |
| `avatar` | 顶部头像地址。有头像插槽时不用这张图 | '' |
| `name` | 顶部名称。有名称插槽时不用这段文字 | 凌云UI |
| `subtitle` | 顶部副标题。有副标题插槽时不用这段文字。传入自定义名称且不传副标题时，不显示默认介绍 | 一套对齐 Apple Liquid Glass 的 uni-app 多端组件库 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `avatar` | 顶部头像。外框 36 圆，与名称垂直居中 |
| `name` | 顶部名称。占原来「凌云UI」那一行 |
| `subtitle` | 挂在名称下面 |

页面上请用 `lingyun-app-page` 的 `nav-avatar`、`nav-name`、`nav-subtitle`，三个可以只传一部分。

窗口宽度小于 690 时页面壳不会显示这一列。完整宽度 220；全局 tabs 驱动时（iPad / PC，≥690）收窄为 **84** 通高窄栏，图标在上、文字在下。整列铺满左侧区域（无外边距、无圆角、无侧边线），底色与内容卡片相同的 grouped 背景，叠加固定的顶栏同款 tint（不随滚动变化），滚动后与顶栏玻璃同亮度。`.lingyun-page-safe-left` 保留兼容。未配置 tabs 时仍为 220 行布局。

PC（窗口 ≥1200）再向右多一列 **220** 的内联二级 / 三级菜单，形成「84 窄栏 + 220 菜单列 + 内容」三栏；当前一级 Tab 没有二级菜单时（如首页）菜单列自动收起，只让出 84。690–1199 的平板保持 84 窄栏 + 点击弹出 `lingyun-menu` 的旧交互。

## 二级菜单

全局 tabs 的每一项可加 `children`：

```ts
{
  key: 'charts',
  text: '图表',
  icon: 'bars',
  // 也可以用图片图标：
  // iconSrc: '/static/tabbar/charts.png',
  // activeIconSrc: '/static/tabbar/charts-active.png',
  url: '/pages/demo/charts/column',
  children: [
    { key: 'column', text: '柱状图', icon: 'bars', url: '/pages/demo/charts/column' },
    { key: 'line', text: '折线图', icon: 'chart-line', url: '/pages/demo/charts/line' },
  ],
}
```

- PC（≥1200）：一级 Tab 只切换窄栏右侧的内联菜单列，不再弹出 `lingyun-menu`；点二级 / 三级项直接进入对应页面，当前项在列内高亮（图片图标用 `activeIconSrc`）。一级 Tab 没有子项时点击直接进 `url`。
- 平板（690–1199，Web / 小程序一致）：点击左侧父项，右侧用 `lingyun-menu` 弹出二级项，选中的子项带勾选；再次点击父项或点击外部关闭。
- 窄屏 / Duo：点击父项进入固定工作台页（`workspaceUrl?tab=<key>`），由工作台展示二级入口。
- `workspaceUrl` 可配在全局 `setLingyunPageConfig`，也可配在单个 Tab；没有配置时仍直接进 `url`。
- 子项路径自动归入父 Tab 高亮；三级菜单（分组标题 + 子项）在菜单列与弹层里都按「标题行 + 选项行」平铺展示。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/demo.vue -->
