# design/pages/demo/charts/gauge

对应源码：`src/pages/demo/charts/gauge.vue`

展示 `lingyun-ui-charts` **仪表盘**（type=`gauge`）。

- **基础仪表盘**：`extra.gauge.type=default`（百度分段色 + 指针）
- **其他仪表盘**：`extra.gauge.type=progress`（外圈刻度随进度变色、圆弧进度、中心渐变）
- 数据：`series.data` 为 **0–1**（不是 0–100，否则指针连转很多圈）
- 规范：[`design/CHARTS.md`](../../../CHARTS.md)
- 系列色：包内 `config-colors.ts` · [`COLORS.md`](../../../COLORS.md)
