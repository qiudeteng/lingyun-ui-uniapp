# 圆环图 · ring

圆环图。`type="ring"`。Demo 页：`/pages/demo/charts/ring`。

## 数据

没有 `categories`。扇区写在 `series[0].data`：`{ name, value }`。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="ring"
    canvasId="lychart-ring"
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
        { name: '已完成', value: 70 },
        { name: '进行中', value: 20 },
        { name: '未开始', value: 10 },
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
