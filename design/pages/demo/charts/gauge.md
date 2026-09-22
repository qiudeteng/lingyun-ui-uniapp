# design/pages/demo/charts/gauge

对应源码：`src/pages/demo/charts/gauge.vue`

展示 `lingyun-ui-charts` **仪表盘**（type=`gauge`）。

- 数据：categories 为阈值点，`series.data` 为 **0–1**（不是 0–100，否则指针连转很多圈）
- 规范：[`design/CHARTS.md`](../../../CHARTS.md)
- 系列色：包内 `config-colors.js` · [`COLORS.md`](../../../COLORS.md)
