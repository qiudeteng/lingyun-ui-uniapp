# lingyun-amount-text

金额显示组件。按数量级自动使用 **万 / 百万 / 千万 / 亿 / 百亿 / 千亿 / 万亿**，支持小数位、前缀、字号、颜色和加粗。只负责格式化，不请求、不计算业务金额。

## 示例

```vue
<lingyun-amount-text :value="amount" prefix="¥" :decimals="2" />
<!-- 9,999.5 → ¥9999.50；1,234,567 → ¥1.23百万；123,456,789 → ¥1.23亿 -->

<lingyun-amount-text :value="amount" type="title3" color="link" bold />
```

## 单位规则

| 金额范围 | 单位 | 示例 |
| --- | --- | --- |
| < 10,000 | 无 | 9999.50 |
| ≥ 10,000 | 万 | 1.23万 |
| ≥ 1,000,000 | 百万 | 1.23百万 |
| ≥ 10,000,000 | 千万 | 1.23千万 |
| ≥ 100,000,000 | 亿 | 1.23亿 |
| ≥ 10,000,000,000 | 百亿 | 1.23百亿 |
| ≥ 100,000,000,000 | 千亿 | 1.23千亿 |
| ≥ 1,000,000,000,000 | 万亿 | 1.23万亿 |

取**不超过金额的最大单位**；负数符号在最前，前缀（如 `¥`）在符号之后。

## 属性

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `value` | 金额数字，或带千分位 / 空格的数字字符串 | — |
| `decimals` | 小数位，0–6 | 2 |
| `prefix` | 金额前缀，如 `¥` | '' |
| `fallback` | 解析失败时的文案 | '' |
| `type` | `lingyun-text` 字阶：`largeTitle` / `title1` / `title2` / `title3` / `headline` / `body` / `callout` / `subheadline` / `footnote` / `caption1` / `caption2` | body |
| `color` | 语义色（`label` / `secondary` / `tertiary` / `primary` / `link` / `success` / `warning` / `error` / `white`）或任意 CSS 颜色；空时跟随 `type` 默认色 | '' |
| `bold` | 是否加粗（对应 `lingyun-text` 的 emphasized） | false |
| `block` | 是否块级展示 | false |

字号、颜色、加粗完全复用 `lingyun-text`，字号只能使用内置字阶，不开放任意数字。

## 工具函数

```ts
import { formatLingyunAmount, parseLingyunAmount } from '@/uni_modules/lingyun-ui'

formatLingyunAmount(1234567, { decimals: 2, prefix: '¥' }) // ¥1.23百万
parseLingyunAmount('1,234,567') // 1234567
```

`formatLingyunAmount(value, options)` 的 `options`：`decimals` / `prefix` / `fallback`。

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/amount-text.vue -->
