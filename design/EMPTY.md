# Empty 规范（强制 · lingyun-empty）

> 列表 / 页面空态；**内容层**标准材质，非玻璃浮层。  
> 对齐 Sketch [Examples / Empty State](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Examples%252FEmpty%2520State) 与 [ContentUnavailableView](https://developer.apple.com/documentation/SwiftUI/ContentUnavailableView)。

## 权威来源

1. Sketch · Examples / Empty State（Large Symbol · Symbol in Circle · Title and Subtitle）
2. [`UI_SPEC.md`](./UI_SPEC.md) · [`COLORS.md`](./COLORS.md) · [`BUTTONS.md`](./BUTTONS.md)

## 1. 形态（三变体）

| 变体 `variant` | Sketch 对应 | 结构 |
|----------------|-------------|------|
| `plain` | Title and Subtitle | 标题 → 说明 →（操作） |
| `symbol` | Large Symbol | **大符号** → 标题 → 说明 →（操作） |
| `circle` | Symbol in Circle | **圆内符号** → 标题 → 说明 →（操作） |

| 项 | 约定 |
|----|------|
| 布局 | 水平居中；正文区可 `fill` 撑满父级并垂直居中 |
| 水平边距 | **32**（Sketch 402 宽 → 文案宽 338） |
| 大符号 | **80**；色可 `iconColor`（默认 Secondary Label） |
| 圆内符号 | 外圆 **80** · Fill Tertiary；内符号约 **36** |
| Title | Body **17 / 22** · Semibold · Secondary Label · 居中 |
| Desc | Body **17 / 22** · Regular · Secondary Label · 居中 |
| Title→Desc | 约 **4** |
| Icon→Title | **16** |
| 操作区 | `#action`；`actionPlacement=inline` 紧跟文案；`bottom` 贴底全宽（Sketch 页级 CTA） |

尺寸 **1pt = 1px**。禁止 `rpx`。

## 2. API

```vue
<!-- Title and Subtitle -->
<lingyun-empty
  variant="plain"
  title="No Notes"
  description="Start by adding a note."
  fill
  action-placement="bottom"
>
  <template #action>
    <lingyun-button variant="borderedProminent" block text="Create Note" />
  </template>
</lingyun-empty>

<!-- Large Symbol -->
<lingyun-empty
  variant="symbol"
  icon="✓"
  icon-color="#FF3B30"
  title="No Reminders"
  description="You've completed all tasks."
/>

<!-- Symbol in Circle -->
<lingyun-empty variant="circle" icon="★" icon-color="#FFCC00" title="VIP" description="…" />
```

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `variant` | `plain` \| `symbol` \| `circle` | 有 `icon`/`#icon` 则为 `symbol`，否则 `plain` | 形态 |
| `title` | string | `''` | 标题 |
| `description` / `desc` | string | `''` | 说明 |
| `icon` | string | `''` | 简文 / emoji 占位；复杂图用 `#icon` |
| `iconColor` | string | — | 符号色（circle 时作用于内符号） |
| `fill` | boolean | `false` | 撑满父高并垂直居中正文 |
| `actionPlacement` | `inline` \| `bottom` | `inline` | 操作区位置 |

插槽：`icon`、`action`、默认额外内容

## 3. 自检

- [ ] 三变体与 Sketch 结构一致；暗黑 Secondary Label 可读
- [ ] `fill` + `actionPlacement=bottom` 时正文居中、按钮贴底
- [ ] 可嵌列表卡 / 整页；mp-weixin 可编译运行
- [ ] 尺寸为 `px`，未使用 `rpx`
