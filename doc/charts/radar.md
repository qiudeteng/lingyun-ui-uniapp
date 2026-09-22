# 雷达图 · radar

雷达图。`type="radar"`。Demo 页：`/pages/demo/charts/radar`。

## 数据

必须有 `categories`（各轴名称）。每条 `series.data` 与轴等长。

`opts.extra.radar.max` 必须盖住数据，否则图形会画出网格。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="radar"
    canvasId="lychart-radar"
    :chartData="chartData"
    :opts="chartOpts"
    :canvas2d="true"
    :inScrollView="true"
    :ontouch="true"
  />
</view>
```

```ts
const chartData = {
  categories: ['销量', '好评', '复购', '库存', '人效'],
  series: [
    { name: '本月', data: [90, 80, 70, 60, 85] },
    { name: '上月', data: [70, 75, 65, 80, 70] },
  ],
}

const chartOpts = {
  extra: {
    radar: { max: 100, gridCount: 4 },
  },
}
```

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

接法、属性、事件见 [图表总览](/charts/)。
