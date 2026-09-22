# 条状图 · bar

横向条形图。`type="bar"`。Demo 页：`/pages/demo/charts/bar`。

## 数据

必须有 `categories`。每条 `series.data` 与类目等长。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="bar"
    canvasId="lychart-bar"
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
  categories: ['华东', '华南', '华北', '西南', '东北'],
  series: [
    { name: '本月', data: [42, 35, 28, 22, 18] },
    { name: '上月', data: [38, 32, 30, 19, 16] },
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
