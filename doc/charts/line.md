# 折线图 · line

类目轴折线。`type="line"`（默认 `extra.line.type: "straight"`）。Demo 页：`/pages/demo/charts/line`（折线、曲线、阶梯、断点续连、渐变、阴影动画、滚动条、时间轴）。

平滑曲线也可以用 [曲线图](./curve.md)（`type="curve"`）。时间轴矢量坐标用 `type="tline"`，点是 `[x, y]`，没有 `categories`。

## 数据

类目轴必须有 `categories`。每条 `series.data` 与类目等长。某一格没有数据时写 `null`，线会断开；该条设 `connectNulls: true` 则跨过空值连上。

## 常用 extra.line

| 字段 | 说明 |
| --- | --- |
| `type` | `straight` 折线；`curve` 平滑曲线；`step` 阶梯 |
| `width` | 线宽，px |
| `linearType` | `none` / `custom`。`custom` 时色标写在该条 `series.linearColor`：`[[0, '#1890FF'], [1, '#90F489']]` |
| `onShadow` | 为 `true` 且该条有 `setShadow: [x, y, blur, color]` 时画阴影 |
| `animation` | `vertical` 自下而上（默认）；`horizontal` 从左画入 |

横向滚动：`opts.enableScroll: true`，`xAxis.itemCount` 为可视类目数，`xAxis.scrollShow: true` 画出滚动条。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="line"
    :chartData="chartData"
    :opts="chartOpts"
  />
</view>
```

```ts
const chartData = {
  categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
  series: [
    { name: '成交量A', data: [35, 8, 25, 37, 4, 20] },
    { name: '成交量B', data: [70, 40, 65, 100, 44, 68] },
    { name: '成交量C', data: [100, 80, 95, 150, 112, 132] },
  ],
}

const chartOpts = {}
```

## 示例：断点续连

```ts
const chartData = {
  categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
  series: [
    { name: '成交量A', data: [35, 8, null, 37, 4, 20] },
    { name: '成交量B', connectNulls: true, data: [70, 40, null, 100, 44, 68] },
    { name: '成交量C', data: [100, 80, null, 150, 112, 132] },
  ],
}
```

## 示例：渐变曲线

```ts
const chartOpts = {
  dataLabel: false,
  dataPointShape: false,
  yAxis: { data: [{ min: 0, max: 150 }] },
  extra: {
    line: { type: 'curve', linearType: 'custom' },
  },
}
```

`series.linearColor` 与 `setShadow` 见 Demo 页「渐变色曲线图」「渐变色 + 阴影 + 水平动画」。

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

接法、属性、事件见 [图表总览](/charts/)。
