# 圆弧进度 · arcbar

圆弧进度。`type="arcbar"`。Demo 页：`/pages/demo/charts/arcbar`。

## 数据

`series[0].data` 是 **0–1 的比例**（`0.8` = 80%）。没有 `categories`。

与仪表盘一样，不要把百分数 80 直接塞进 `data`。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="arcbar"
    canvasId="lychart-arcbar"
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
  series: [{ name: '正确率', data: 0.8 }],
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
