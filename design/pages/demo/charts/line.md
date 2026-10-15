# design/pages/demo/charts/line

对应源码：`src/pages/demo/charts/line.vue`

展示 `lingyun-ui-charts` **折线图**，对照 [uCharts 折线图示例](https://www.ucharts.cn/v2/#/demo/index)。

- **基本折线图**：`extra.line.type=straight`
- **基本曲线图**：`type=curve`，首条 `lineType=dash`
- **基本时序图**：`type=step` 阶梯
- **断点续连**：`data` 含 `null`；`connectNulls: true` 的序列把断点连上
- **渐变色曲线图**：`linearType=custom`，色标写在 `series.linearColor`
- **渐变 + 阴影 + 水平动画**：`onShadow` + `series.setShadow`，`animation=horizontal`
- **滚动条**：`enableScroll`，`xAxis.itemCount=4`，`scrollShow`
- **时间轴折线图**：`type=tline`，点为 `[x, y]`
- 规范：[`design/CHARTS.md`](../../../CHARTS.md)
- 系列色：包内 `config-colors.ts` · [`COLORS.md`](../../../COLORS.md)
