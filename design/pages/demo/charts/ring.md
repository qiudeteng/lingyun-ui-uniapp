# design/pages/demo/charts/ring

对应源码：`src/pages/demo/charts/ring.vue`

展示 `lingyun-ui-charts` **圆环图**（type=`ring`）。

- 数据：`series: [{ data: [{ name, value, count, rate }] }]`
- 图例：`opts.legend.columns` 把名称、数值、数量、占比排成表
- 规范：[`design/CHARTS.md`](../../../CHARTS.md)
- 系列色：包内 `config-colors.ts` · [`COLORS.md`](../../../COLORS.md)
