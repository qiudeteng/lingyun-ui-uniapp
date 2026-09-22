# 气泡图 · bubble

气泡图。`type="bubble"`。Demo 页：`/pages/demo/charts/bubble`。

## 数据

没有 `categories`。点是 `[x, y, size]`，第三位是气泡半径相关值。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="bubble"
    canvasId="lychart-bubble"
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
      name: '客群',
      data: [
        [20, 30, 18],
        [35, 22, 28],
        [48, 40, 22],
        [60, 18, 35],
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
