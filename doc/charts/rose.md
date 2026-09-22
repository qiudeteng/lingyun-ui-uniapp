# 玫瑰图 · rose

南丁格尔玫瑰图。`type="rose"`。Demo 页：`/pages/demo/charts/rose`。

## 数据

没有 `categories`。扇区写在 `series[0].data`：`{ name, value }`。半径随 value 变化。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="rose"
    canvasId="lychart-rose"
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
        { name: '一店', value: 50 },
        { name: '二店', value: 30 },
        { name: '三店', value: 20 },
        { name: '四店', value: 18 },
        { name: '五店', value: 8 },
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
