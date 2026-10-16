# design/pages/demo/charts/column

对应源码：`src/pages/demo/charts/column.vue`

展示 `lingyun-ui-charts` **柱状图**（type=`column`）：

| 区块 | 要点 |
|------|------|
| 基本柱状图 | `extra.column.type=group` |
| 堆叠柱状图 | `type=stack`，`labelPosition=center` |
| 圆角+渐变+半透明 | `linearType=custom`，`barBorderCircle` |
| 温度计图表 | `type=meter` |
| 圆角温度计 | meter + `barBorderRadius` |
| 正负柱状图 | 负值 + Y 轴跨 0 |
| 柱状图滚动条 | `enableScroll` + `xAxis.itemCount` |
| 全圆角+标记线 | `barBorderRadius` + `enableMarkLine` |
| 图例表 | `legend.columns` |

- 数据：categories + series[].data
- 规范：[`design/CHARTS.md`](../../../CHARTS.md)
- 系列色：包内 `config.ts` · [`COLORS.md`](../../../COLORS.md)
