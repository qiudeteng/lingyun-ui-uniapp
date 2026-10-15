# 柱状图 · column

类目轴柱状图。`type="column"`。Demo 页：`/pages/demo/charts/column`。

## 数据

必须有 `categories`。每条 `series.data` 与类目等长。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="column"
    canvasId="lychart-column"
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
    { name: '门店 A', data: [35, 36, 31, 33, 13, 34, 32] },
    { name: '门店 B', data: [18, 27, 21, 24, 6, 28, 22] },
  ],
}

const chartOpts = {
  extra: {
    column: {
      type: 'group',
      // 同组柱间距、类目组左右留白（组与组之间的间隔）
      seriesGap: 3,
      categoryGap: 6,
      // 顶部圆角 [左上, 右上, 右下, 左下]
      barBorderRadius: [6, 6, 0, 0],
    },
  },
}
```

默认已带组间距与顶部圆角。要改疏密或圆角，覆盖 `opts.extra.column` 即可。

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

接法、属性、事件见 [图表总览](/charts/)。
