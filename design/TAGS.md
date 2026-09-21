# Tags & Chips 规范（强制 · lingyun-tag / lingyun-chip）

## 1. Tag（lingyun-tag）

短标签 · 非交互为主。

| 属性 | 默认 | 说明 |
|------|------|------|
| `text` | `''` | 文案 |
| `variant` | `fill` | fill / outline |
| `color` | `blue` | blue / green / orange / red / gray |

## 2. Chip（lingyun-chip）

筛选胶囊 · 可点选。

| 属性 | 默认 | 说明 |
|------|------|------|
| `text` | `''` | 文案 |
| `selected` / `modelValue` | `false` | 选中 |
| `selectable` | `true` | 是否可切换 |
| `disabled` | `false` | 禁用 |

事件：`change`、`click`
