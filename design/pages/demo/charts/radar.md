# design/pages/demo/charts/radar

对应源码：`src/pages/demo/charts/radar.vue`

展示 `lingyun-ui-charts` **雷达图**（type=`radar`）四种示例：

- 多边形：`extra.radar.gridType = "radar"`
- 圆形：`gridType = "circle"`
- 刻度标签+网格抽稀：`axisLabel` + `gridEval`，`border`
- 渐变色：`linearType = "custom"`，`opacity = 1`，`max = 240`，`dataLabel` 标出顶点值

数据：`categories` + 等长 `series.data`。`max` 小于数据峰值时，刻度按较大者计算。

- 规范：[`design/CHARTS.md`](../../../CHARTS.md)
- 系列色：包内 `config.ts` · [`COLORS.md`](../../../COLORS.md)
