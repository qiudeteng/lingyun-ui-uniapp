# design/components/chart-demo-block

对应源码：`src/components/chart-demo-block/chart-demo-block.vue`

图表 demo 页壳：`lingyun-app-page` + `lingyun-section` + `lingyun-ui-charts`。

| 项 | 约定 |
|----|------|
| 画布高度 | **280px**（`.chart-box`） |
| canvas | `canvas2d` · `inScrollView` · `ontouch` 均为 true |
| 数据 / 图种 | 见 [`design/CHARTS.md`](../../CHARTS.md) |
| 系列色 | 扩展 `config-colors.js` |
