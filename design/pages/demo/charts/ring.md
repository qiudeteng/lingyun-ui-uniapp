# design/pages/demo/charts/ring

对应源码：`src/pages/demo/charts/ring.vue`

展示 `lingyun-ui-charts` **圆环图**（type=`ring`）。

- 第一张是原来的三扇区圆环（已完成 / 进行中 / 未开始）
- 第二张「图例表」：`series[0].data` 带 `count`、`rate`，`opts.legend.columns` 按列对齐
- 规范：[`design/CHARTS.md`](../../../CHARTS.md)
- 系列色：包内 `config-colors.ts` · [`COLORS.md`](../../../COLORS.md)
