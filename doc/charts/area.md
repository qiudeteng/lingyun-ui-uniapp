# 区域图 · area

类目轴面积图。`type="area"`。Demo 页：`/pages/demo/charts/area`。

## 数据

必须有 `categories`。每条 `series.data` 与类目等长。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="area"
    canvasId="lychart-area"
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
    { name: '浏览', data: [140, 160, 120, 180, 110, 240, 200] },
    { name: '加购', data: [40, 50, 35, 60, 30, 80, 70] },
  ],
}

const chartOpts = {}
```

堆积面积可设 `extra.area.stack: true`；更推荐在折线 / 曲线上开 `extra.line.stack: true`（数据不必自累加），见 [堆积图](./stack.md)。

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

接法、属性、事件见 [图表总览](/charts/)。
