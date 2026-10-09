# Grid 规范（强制 · lingyun-grid）

> 宫格。结构对齐 `uni-grid` / `uni-grid-item`。  
> 这是 **内容层**：分组卡片用 Grouped Secondary，格子之间可以有分割线。禁止灰表格线，禁止每个格子单独做成玻璃。

## 权威来源

1. [`UI_SPEC.md`](./UI_SPEC.md) · [`LISTS.md`](./LISTS.md) · [`BADGES.md`](./BADGES.md)
2. 对照源：`src/uni_modules/uni-grid`（只保留结构）

---

## 1. 尺寸（1pt = 1px，禁止 rpx）

| 区域 | px | 说明 |
|------|----|------|
| 卡片圆角 | 26 | 与分组列表同一档。放进 `lingyun-section` 时为 0，圆角由卡片负责 |
| 卡片底 | Grouped Secondary | 浅白 / 暗黑 `#1c1c1e`。`background` 可改，`transparent` 为透明 |
| 方形格 | 宽 = 高 | `padding-top: 100%`，不靠 JS 量宽 |
| 非方形 | 最小高 88 | 图标 + 文案 |
| 图标 | 28 | `iconSize` 可改成任意像素。字形走 `lingyun-icon`。`iconSrc` 或图片地址走 `lingyun-image` |
| 文案 | 12 / 16 | Secondary Label，单行省略 |
| 分割线 | 1 | Separator；末列去掉右边，末行去掉下边 |

按下用 `fills.tertiary`，不用 `#f1f1f1`。角标用 `lingyun-badge`。

## 2. API

```vue
<lingyun-grid :column="4" @change="onChange">
  <lingyun-grid-item
    v-for="(item, index) in items"
    :key="item.text"
    :index="index"
    :icon="item.icon"
    :text="item.text"
    :info="item.info"
  />
</lingyun-grid>

<lingyun-grid
  background="transparent"
  :column="4"
  :icon-size="40"
  :items="[
    { icon: 'image', text: '相册', link: '/pages/demo/images' },
    { iconSrc: 'https://example.com/a.jpg', text: '图片', iconSize: 32, radius: 'lg', link: '/pages/demo/icons' },
  ]"
  @change="onChange"
/>
```

| 属性 | 组件 | 说明 | 默认 |
|------|------|------|------|
| `column` | grid | 列数 | 3 |
| `square` | grid | 正方形 | true |
| `showBorder` | grid | 分割线 | false |
| `borderColor` | grid | 分割线颜色 | 系统 Separator |
| `highlight` | grid | 按下高亮 | true |
| `background` | grid | 卡片背景。空为分组底，`transparent` 为透明 | `''` |
| `iconSize` | grid / item / items | 图标边长，任意像素。格子或数据项再传则覆盖宫格 | 28 |
| `shape` | grid / item / items | 图片图标的显示形式，同 `lingyun-image`：`square` / `rounded` / `circle`。原样传给图片 | `rounded` |
| `radius` | grid / item / items | 图片图标的圆角，同 `lingyun-image`：`none` / `sm` / `md` / `lg` / `xl` / `2xl` 或像素。原样传给图片 | `sm` |
| `items` | grid | 数组里有格子时按数据生成，不再用默认插槽。不传或空数组仍用插槽（微信未传的数组会变成 `[]`） | — |
| `index` | item | 点击回传 | 0 |
| `icon` / `iconSrc` / `text` / `color` / `info` | item | 默认快捷入口。`iconSrc` 或图片地址用 `lingyun-image` | — |
| `link` | item / items | 页面路径。有值时点击后跳转 | `''` |

`change` 载荷与 uni-grid 相同：`{ detail: { index } }`。设置了 `link` 时，回传之后再打开该页。未注册路径进 404。

微信上宫格和格子都去掉宿主节点（`virtualHost`）。列宽写在格子根节点上，用 `flex: 0 0 <百分比>`。只写内部 `width` 时，宿主宽度会变成 0，格子有高度但不显示。
