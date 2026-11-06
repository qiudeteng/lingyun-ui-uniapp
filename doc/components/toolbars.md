# lingyun-toolbars

顶栏。放在 `lingyun-app-page` 里时不用再写一份；单独用在自定义布局或 Sheet 里。

## 示例

```vue
<lingyun-toolbars title="标题" @back="onBack" />
<lingyun-toolbars title-style="large" title="大标题" />
<lingyun-toolbars placement="sheet" title="Sheet" @close="onClose" />
```

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `title` | 标题 | '' |
| `subtitle` | 副标题 | '' |
| `titleStyle` | `title` / `large` / `title2LineLarge` | title |
| `placement` | `standard` 或 `sheet` | standard |
| `showBack` | 返回。`auto` 按场景决定 | auto |
| `showClose` | 关闭 | auto |
| `showGrabber` | 抓手 | auto |
| `showTrailing` | 右侧按钮 | true |
| `trailingButtons` | 右侧自定义按钮组；`{ key, icon?, label?, disabled? }[]` 为一组，二维数组按组渲染多个胶囊 | [] |
| `trailingButtonsHidden` | 隐藏数据驱动的按钮组；页面打开自己的锚点浮层时使用 | false |
| `trailingMenuEnabled` | 显式启用 `#trailing-menu` 内置浮层；小程序必须开启 | false |
| `searchable` | 开启顶部搜索：右侧多一个独立分组搜索按钮 | false |
| `searching` | 搜索模式；输入框替换左侧内容，原搜索按钮变取消 | false |
| `searchValue` | 搜索关键词 | '' |
| `searchPlaceholder` | 搜索占位文案 | 搜索 |
| `segments` | 顶栏下方分段控制数据 `{ key, text?, icon?, disabled? }[]`；为空不占高度 | [] |
| `segmentValue` | 当前分段 key | '' |
| `fixed` | 固定在视口顶部。页面壳里会设为 true | false |
| `safeArea` | 加上状态栏高度 | true |
| `glassProgress` | 0 到 1，玻璃从透明到铺满 | 0 |
## 事件

| 事件 | 说明 |
| --- | --- |
| `back` | 返回 |
| `close` | 关闭 |
| `trailing` | 默认右侧按钮 |
| `trailing-action` | 自定义按钮组点击，参数 `{ key, button, index, groupIndex, buttonIndex, anchor }` |
| `update:searching` | 搜索模式变化 |
| `update:searchValue` | 搜索关键词变化 |
| `search-open` | 点搜索按钮 |
| `search-cancel` | 点取消按钮，参数为当前关键词 |
| `search-input` | 输入变化，参数为当前关键词 |
| `search` | 键盘确认搜索，参数为当前关键词 |
| `update:segmentValue` | 分段值变化 |
| `segment-click` | 点击分段项，参数 `{ value, item }` |
| `segment-change` | 分段切换，参数 `{ value, item }` |

`trailingButtons` 支持一维 / 二维数组：一维是一组，二维按子数组拆成多个玻璃胶囊。单个按钮是 44×44 圆钮，多个是 36×36 + gap 18 的胶囊组。点击后发 `trailing-action`，`anchor` 是**按钮组**的视口矩形（整组会隐藏，菜单按组右上角对齐），可直接作为 `lingyun-menu` 的 `anchor` 打开自定义浮层；如果设置 `trailing-menu-enabled` 并传入 `#trailing-menu="{ button, index, groupIndex, buttonIndex, close }"` 插槽，也会自动在按钮组下方弹出自定义菜单内容。主题钮菜单同样按第一组右上角定位。

`segments` 会在 toolbar 下方渲染 Small 分段控制，行高 40；`segmentValue` 受控，切换发 `update:segmentValue`、`segment-click`、`segment-change`。搜索模式展开时 toolbar 内容从右往左滑入搜索框，关闭反向；左侧内容同时淡出左移。

返回、关闭、分享都用 `lingyun-icon`。圆钮保持 **44**。返回是 `left`、字号 **28**；关闭是 `closeempty`、分享是 `upload`，字号都是 **26**。
