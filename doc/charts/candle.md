# K 线图 · candle

K 线 / 蜡烛图。`type="candle"`。Demo 页：`/pages/demo/charts/candle`。

## 数据

必须有 `categories`（时间标签）。每根 K 线 `data` 为 `[开盘, 收盘, 最低, 最高]`。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="candle"
    canvasId="lychart-candle"
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
  categories: ['09:30', '10:00', '10:30', '11:00', '11:30', '13:30', '14:00'],
  series: [
    {
      name: 'K线',
      data: [
        [2320, 2320.37, 2320.5, 2317],
        [2320.26, 2320.19, 2323, 2317],
        [2320.19, 2320.31, 2323.3, 2317],
        [2320.46, 2320.32, 2323.6, 2317],
        [2320.46, 2320.32, 2323.6, 2317],
        [2320.46, 2308, 2323.6, 2291],
        [2300, 2291.3, 2308, 2291],
      ],
    },
  ],
}

const chartOpts = {}
```

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

接法、属性、事件见 [图表总览](/charts/)。
