# Amount Text 规范（lingyun-amount-text）

> 金额显示组件。按数量级自动使用 万 / 百万 / 千万 / 亿 / 百亿 / 千亿 / 万亿；字号、颜色、加粗与 [`TEXTS.md`](./TEXTS.md) 的 `lingyun-text` 完全一致。

## 1. 单位

| 金额范围 | 单位 |
| --- | --- |
| < 10,000 | 无 |
| ≥ 10,000 | 万 |
| ≥ 1,000,000 | 百万 |
| ≥ 10,000,000 | 千万 |
| ≥ 100,000,000 | 亿 |
| ≥ 10,000,000,000 | 百亿 |
| ≥ 100,000,000,000 | 千亿 |
| ≥ 1,000,000,000,000 | 万亿 |

- 取不超过金额绝对值的最大单位；例如 `12,345,678` → `1.23千万`，`123,456,789` → `1.23亿`。
- 小于 1 万保留原数，不追加单位。
- 负数符号在最前，前缀（`¥` 等）在符号之后：`-¥1.23万`。

## 2. 小数位

- `decimals` 0–6，默认 2；使用 `toFixed`，保留尾随 0（如 `1.20百万`）。
- 金额不足 1 万时同样按小数位格式化原数。

## 3. 样式

- `type`：内置字阶 `largeTitle` / `title1` / `title2` / `title3` / `headline` / `body` / `callout` / `subheadline` / `footnote` / `caption1` / `caption2`，默认 `body`。
- `color`：语义色 `label` / `secondary` / `tertiary` / `primary` / `link` / `success` / `warning` / `error` / `white` 或任意 CSS 颜色；空时跟随 `type` 默认色。
- `bold`：对应 `lingyun-text` 的 emphasized；`block`：块级展示。
- 不开放任意数字字号。

## 4. API

```vue
<lingyun-amount-text :value="amount" prefix="¥" :decimals="2" />
<lingyun-amount-text :value="amount" type="title3" color="link" bold />
```

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `value` | 数字或带千分位 / 空格的数字字符串 | — |
| `decimals` | 小数位 0–6 | 2 |
| `prefix` | 金额前缀 | '' |
| `fallback` | 解析失败文案 | '' |
| `type` / `color` / `bold` / `block` | 字阶 / 语义色 / 加粗 / 块级 | body / 继承 / false / false |

## 5. 自检

- [ ] 各数量级单位切换正确，负数与小于 1 万的情况正常。
- [ ] 小数位只影响小数部分，不改变单位选择。
- [ ] 字号只使用 `type` 内置字阶；颜色/加粗/块级与 `lingyun-text` 一致。
