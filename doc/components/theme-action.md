# lingyun-theme-action

工具栏内置主题切换按钮。点击弹出「浅色 / 暗黑 / 自动」菜单，视觉与 `lingyun-menu` 一致：浅色用太阳、暗黑用月牙、自动用循环图标，选中态只由右侧勾选表示。示例见 demo `pages/demo/toolbars` 和任意开启全局主题钮的页面。

## 示例

```vue
<lingyun-toolbars :fixed="true">
  <template #trailing>
    <lingyun-theme-action />
  </template>
</lingyun-toolbars>
```

也由 `lingyun-toolbars` 自动加入右侧按钮组：调用 `setLingyunThemeSwitchVisible(true)` 后，页面级固定顶栏会显示主题钮。页面只想隐藏当前页的主题钮时，用 `lingyun-app-page` 的 `show-theme-switch="false"`，不要修改全局状态。

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `grouped` | 分组模式：不画自身玻璃底，由外层按钮组提供胶囊 | false |
| `iconSize` | 图标尺寸（px） | 20 |
| `anchor` | 菜单锚点 `{ top, left, width, height }`；按钮组隐藏时由工具栏传入整组右上角 | null |

## 事件

| 事件 | 说明 |
| --- | --- |
| `menu-open` | 主题菜单打开 |
| `menu-closed` | 主题菜单退场完成 |

主题切换逻辑走 `useLingyunTheme()`，选择后写入 `light / dark / system` 偏好。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/toolbars.vue -->
