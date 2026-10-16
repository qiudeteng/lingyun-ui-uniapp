# 柱状图 · column

类目轴柱状图。`type="column"`。Demo 页：`/pages/demo/charts/column`。


## 数据

必须有 `categories`。每条 `series.data` 与类目等长。温度计图第一组为外框（目标），第二组为内柱（完成）。

## Demo 覆盖

| 标题 | 配置要点 |
|------|----------|
| 基本柱状图 | `extra.column.type: "group"` |
| 堆叠柱状图 | `type: "stack"`，`labelPosition: "center"` |
| 圆角+渐变+半透明 | `linearType: "custom"`，`barBorderCircle: true` |
| 温度计图表 | `type: "meter"`，`meterBorder` / `meterFillColor` |
| 圆角温度计 | meter + `barBorderRadius: [50,50,50,50]` |
| 正负柱状图 | 数据含负值，`yAxis.data: [{ min, max }]` |
| 柱状图滚动条 | `enableScroll: true`，`xAxis.itemCount` |
| 全圆角+标记线 | `barBorderRadius` + `enableMarkLine` + `extra.markLine` |

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="column"
    :chartData="chartData"
    :opts="chartOpts"
  />
</view>
```

```ts
const chartData = {
  categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
  series: [
    { name: '目标值', data: [35, 36, 31, 33, 13, 34] },
    { name: '完成量', data: [18, 27, 21, 24, 6, 28] },
  ],
}

const chartOpts = {
  extra: {
    column: {
      type: 'group',
      seriesGap: 3,
      categoryGap: 6,
      barBorderRadius: [6, 6, 0, 0],
    },
  },
}
```

默认已带组间距与顶部圆角。要改疏密或圆角，覆盖 `opts.extra.column` 即可。

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

堆积折线 / 曲线另见 [堆积图](./stack.md)。

接法、属性、事件见 [图表总览](/charts/)。
