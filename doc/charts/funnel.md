# 漏斗图 · funnel

漏斗图。`type="funnel"`。Demo 页：`/pages/demo/charts/funnel`。

## 数据

没有 `categories`。层级写在 `series[0].data`：`{ name, value }`，value 从上到下递减。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="funnel"
    canvasId="lychart-funnel"
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
        { name: '曝光', value: 80 },
        { name: '点击', value: 50 },
        { name: '加购', value: 30 },
        { name: '下单', value: 15 },
        { name: '支付', value: 8 },
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
