# 时间轴区域 · tarea

时间轴面积图。`type="tarea"`。Demo 页：`/pages/demo/charts/tarea`。

## 数据

没有 `categories`。点是 `[Unix 秒, y]`（秒不是毫秒）。

默认 Y 轴 `max` 为 80。本例数据已落在范围内；更大的值要同时加大 `yAxis.max` 和右侧 padding。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="tarea"
    canvasId="lychart-tarea"
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
      name: '流量',
      data: [
        [1710000000, 22],
        [1710003600, 30],
        [1710007200, 38],
        [1710010800, 46],
        [1710014400, 54],
        [1710018000, 62],
        [1710021600, 70],
      ],
    },
  ],
}

const chartOpts = {
  padding: [15, 28, 0, 15],
  xAxis: { format: 'xAxisDemo2' },
}
```

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

接法、属性、事件见 [图表总览](/charts/)。
