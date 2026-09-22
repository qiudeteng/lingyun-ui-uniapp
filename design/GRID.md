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
| 卡片圆角 | 26 | 与分组列表同一档 |
| 卡片底 | Grouped Secondary | 浅白 / 暗黑 `#1c1c1e` |
| 方形格 | 宽 = 高 | `padding-top: 100%`，不靠 JS 量宽 |
| 非方形 | 最小高 88 | 图标 + 文案 |
| 图标 | 28 | `lingyun-icon`，默认系统蓝 |
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
```

| 属性 | 组件 | 说明 | 默认 |
|------|------|------|------|
| `column` | grid | 列数 | 3 |
| `square` | grid | 正方形 | true |
| `showBorder` | grid | 分割线 | false |
| `borderColor` | grid | 分割线颜色 | 系统 Separator |
| `highlight` | grid | 按下高亮 | true |
| `index` | item | 点击回传 | 0 |
| `icon` / `text` / `color` / `info` | item | 默认快捷入口；有默认插槽时不画 | — |

`change` 载荷与 uni-grid 相同：`{ detail: { index } }`。
