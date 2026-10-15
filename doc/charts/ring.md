# 圆环图 · ring

圆环图。`type="ring"`。Demo 页：`/pages/demo/charts/ring`（基本 / 分割线渐变 / 自定义标签）。

## 数据

没有 `categories`。扇区写在 `series[0].data`：`{ name, value }`。

环心不铺白底，扇区之间默认不描边。`title` 是环心主数字，按内圆放大并加粗；`subtitle` 是下面一行小字。颜色跟主题：浅色黑字，暗黑白字，副标题用次级标签色。写了 `color` 才用指定色。需要扇区缝隙时设置 `extra.ring.border = true`。

图例排成表时，列写在 `opts.legend.columns`，额外的格子跟在同一条扇区上。`name` 前仍是色点。某一格单独变色写成 `{ text, color }`。文字跟随主题：浅色黑色，暗黑白色，点掉隐藏后改为次级标签色。其它图种的字段该写在哪一层，见 [图表总览 · 图例](/charts/#图例)。

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
  title: { name: '1700' },
  subtitle: { name: '订单总数' },
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
