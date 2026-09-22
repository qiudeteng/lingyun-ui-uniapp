# 混合图 · mix

同一坐标系混柱 + 线。`type="mix"`。Demo 页：`/pages/demo/charts/mix`。

## 数据

必须有 `categories`。每条 series 自己写 `type`（`column` / `line` / `area` 等）。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="mix"
    canvasId="lychart-mix"
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
  categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  series: [
    { name: '销量', type: 'column', data: [35, 36, 31, 33, 13, 34, 32] },
    { name: '目标', type: 'line', data: [30, 30, 30, 30, 30, 30, 30] },
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
