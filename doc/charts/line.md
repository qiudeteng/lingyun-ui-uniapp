# 折线图 · line

类目轴折线。`type="line"`（默认 `extra.line.type: "straight"`）。Demo 页：`/pages/demo/charts/line`。

需要平滑曲线请用 [曲线图](./curve.md)（`type="curve"`），或给折线覆盖 `extra.line.type: "curve"`。

## 数据

必须有 `categories`。每条 `series.data` 与类目等长。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="line"
    canvasId="lychart-line"
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
    { name: '访客', data: [120, 132, 101, 134, 90, 230, 210] },
    { name: '下单', data: [22, 18, 19, 23, 29, 33, 31] },
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
