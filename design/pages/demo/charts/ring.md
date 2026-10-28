# design/pages/demo/charts/ring

对应源码：`src/pages/demo/charts/ring.vue`

展示 `lingyun-ui-charts` **圆环图**：基本、分割线渐变、自定义标签内容 / 隐藏。

- 基本圆环、分割线渐变、自定义标签 / 隐藏
- 「图例表 · 右侧单列」：18 个渠道，`legend.columns` 表格，宽屏单列、窄屏自动落底，上下箭头翻页
- 「图例表 · 底部 5 行」：18 个渠道，底部表格默认 5 行/页，上下箭头翻页
- 分页示例环宽用 `ringWidthRatio: 0.58`，接近基础环 `ringWidth: 60` 的饱满观感
- 规范：[`design/CHARTS.md`](../../../CHARTS.md)
- 系列色：包内 `config.ts` · [`COLORS.md`](../../../COLORS.md)
