# design/pages/demo/charts/mount

对应源码：`src/pages/demo/charts/mount.vue`

展示 `lingyun-ui-charts` **山峰图**（type=`mount`）。

- **圆角山峰图**：`extra.mount.type=mount`，`widthRatio=1.5`
- **尖角山峰图**：`type=sharp`
- **三角山峰图**：`type=triangle`
- **直角山峰图**：`type=bar`，`widthRatio=0.8`
- **正负山峰图无边渐变色**：`borderWidth=0`，`linearType=custom`，Y 轴 `min/max` 为 ±100
- **有边透明渐变 + 滚动条**：`linearType=opacity`，`enableScroll`，`xAxis.itemCount=4`
- **有边渐变 + 标记线**：`enableMarkLine`，`extra.markLine`
- **圆角渐变色柱状图**：`type=bar`，`barBorderRadius=[50,50,50,50]`，`linearType=custom`
- 数据：没有 `categories`，峰写在 `series[0].data` 的 `{ name, value }`
- 规范：[`design/CHARTS.md`](../../../CHARTS.md)
- 系列色：包内 `config.ts` · [`COLORS.md`](../../../COLORS.md)
