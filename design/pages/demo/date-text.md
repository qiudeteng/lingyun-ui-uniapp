# design/pages/demo/date-text

对应源码：`src/pages/demo/date-text.vue`

展示 `lingyun-date-text`：

- 相对日期：昨天 / 今天 / 明天；今天到分
- 普通日期：今年 `MM-DD`、跨年 `YYYY-MM-DD`，到天 / 到秒 / 到分
- 精度：day / hour / minute / second 对照
- 文字样式：type / color / bold；与 lingyun-text 同一套字阶和语义色
- 自定义相对文案与空值兜底

规范见 [`DATE_TEXT.md`](../../DATE_TEXT.md)。
