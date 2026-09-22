# 仪表盘 · gauge

仪表盘。`type="gauge"`。Demo 页：`/pages/demo/charts/gauge`。

## 数据

`series[0].data` 是 **0–1 的比例**（`0.8` = 80%）。`categories` 用来画分段色带。

不要写 `data: 80`。引擎按 0–1 乘扫过角度，写成 80 指针会连转很多圈。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="gauge"
    canvasId="lychart-gauge"
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
  categories: [{ value: 0.2 }, { value: 0.8 }],
  series: [{ name: '完成率', data: 0.8 }],
}

const chartOpts = {
  title: { name: '80%' },
  subtitle: { name: '完成率' },
}
```

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

接法、属性、事件见 [图表总览](/charts/)。
