# 时间轴折线 · tline

时间轴折线。`type="tline"`。Demo 页：`/pages/demo/charts/tline`。

## 数据

没有 `categories`。点是 `[Unix 秒, y]`（秒不是毫秒）。

默认 Y 轴 `max` 为 80，数据超出要在 `opts` 里加大 `yAxis`，否则会顶出画布。X 轴 formatter 只传名字，小程序不能传函数。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="tline"
    canvasId="lychart-tline"
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
  series: [
    {
      name: '温度',
      data: [
        [1710000000, 18],
        [1710003600, 19.5],
        [1710007200, 21],
        [1710010800, 22.5],
        [1710014400, 24],
        [1710018000, 25.5],
        [1710021600, 27],
      ],
    },
  ],
}

const chartOpts = {
  padding: [15, 28, 0, 15],
  xAxis: { format: 'xAxisDemo2' }, // HH:mm，登记在 config-ucharts.js
}
```

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

接法、属性、事件见 [图表总览](/charts/)。
