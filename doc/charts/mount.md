# 山峰图 · mount

山峰图。`type="mount"`。Demo 页：`/pages/demo/charts/mount`。

## 数据

没有 `categories`。柱峰写在 `series[0].data`：`{ name, value }`。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="mount"
    canvasId="lychart-mount"
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
      data: [
        { name: '1月', value: 50 },
        { name: '2月', value: 30 },
        { name: '3月', value: 20 },
        { name: '4月', value: 18 },
        { name: '5月', value: 28 },
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
