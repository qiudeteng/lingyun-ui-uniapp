# 条状图 · bar

横向条形图。`type="bar"`。Demo 页：`/pages/demo/charts/bar`（分组 / 堆积 / 图例表）。

默认 `extra.bar.barBorderRadius: [6, 6, 0, 0]`（右上、右下圆角，即右侧顶端圆角）。

## 数据

必须有 `categories`。每条 `series.data` 与类目等长。堆积时传各层**原始值**，由引擎累加。

## 分组条状

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="bar"
    canvasId="lychart-bar"
    :chartData="chartData"
    :opts="{}"
    :canvas2d="true"
    :inScrollView="true"
    :ontouch="true"
  />
</view>
```

```ts
const chartData = {
  categories: ['华东', '华南', '华北', '西南', '东北'],
  series: [
    { name: '本月', data: [42, 35, 28, 22, 18] },
    { name: '上月', data: [38, 32, 30, 19, 16] },
  ],
}
```

## 堆积条状

```ts
const chartData = {
  categories: ['华东', '华南', '华北', '西南', '东北'],
  series: [
    { name: '直营', data: [35, 36, 31, 33, 28] },
    { name: '加盟', data: [18, 27, 21, 24, 19] },
    { name: '电商', data: [12, 15, 10, 14, 11] },
  ],
}

const chartOpts = {
  extra: {
    bar: {
      type: 'stack',
      // 默认已有右侧圆角；堆积时圆角落在最右一层
      barBorderRadius: [6, 6, 0, 0],
    },
  },
}
```

`barBorderRadius` 顺序为 **[右上, 右下, 左下, 左上]**。

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

接法、属性、事件见 [图表总览](/charts/)。相关：[堆积图](./stack.md)。
