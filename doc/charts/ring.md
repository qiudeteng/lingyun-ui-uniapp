# 圆环图 · ring

圆环图。`type="ring"`。Demo 页：`/pages/demo/charts/ring`。

## 数据

没有 `categories`。扇区写在 `series[0].data`：`{ name, value }`。

图例排成表时，列写在 `opts.legend.columns`，额外的格子跟在同一条扇区上。`name` 前仍是色点。某一格单独变色写成 `{ text, color }`。文字默认白色，点掉隐藏后改为图表文字色。其它图种的字段该写在哪一层，见 [图表总览 · 图例](/charts/#图例)。

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
        { name: '小程序下单', value: 51.2, count: 5, rate: '10%' },
        { name: '电话预约', value: 31.8, count: 3, rate: '6%' },
      ],
    },
  ],
}

const chartOpts = {
  dataLabel: false,
  title: { name: '1700', fontSize: 16, color: '#1c1c1e' },
  subtitle: { name: '订单总数', fontSize: 12, color: '#5ac8fa' },
  legend: {
    position: 'right',
    lineHeight: 22,
    fontSize: 12,
    columns: [
      { key: 'name', width: 72 },
      { key: 'value', width: 36, align: 'right' },
      { key: 'count', width: 20, align: 'right' },
      { key: 'rate', width: 32, align: 'right', color: '#86868b' },
    ],
  },
}
```

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

接法、属性、事件见 [图表总览](/charts/)。
