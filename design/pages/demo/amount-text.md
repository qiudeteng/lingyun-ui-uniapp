# design/pages/demo/amount-text

对应源码：`src/pages/demo/amount-text.vue`

展示 `lingyun-amount-text`：

- 数量级：小于 1 万、万、百万、千万、亿、百亿、千亿、万亿与负数
- 小数位：0 / 2 / 4
- 文字样式：type / color / bold；与 `lingyun-text` 同一套字阶和语义色
- 前缀 `¥`、解析失败兜底

规范见 [`AMOUNT_TEXT.md`](../../AMOUNT_TEXT.md)。
