# design/components/chart-demo-block

对应源码：`src/components/chart-demo-block/chart-demo-block.vue`

图表 demo 页壳：`lingyun-app-page` + `lingyun-section` + `lingyun-ui-charts`。

| 项 | 约定 |
|----|------|
| 画布高度 | **280px**（`.chart-box`） |
| canvas | `inScrollView` · `ontouch` 默认均为 true |
| 浮层避让 | 页内带 `lingyun-picker`，用于验收微信下 canvas 不穿透弹层 |
| 数据 / 图种 | 见 [`design/CHARTS.md`](../../CHARTS.md) |
| 系列色 | 扩展 `config.ts` |
