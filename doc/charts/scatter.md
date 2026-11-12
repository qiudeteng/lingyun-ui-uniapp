# 散点图 · scatter

散点图。`type="scatter"`。Demo 页：`/pages/demo/charts/scatter`（坐标 `[x, y]`）。

## 数据

没有 `categories`。点是 `[x, y]`。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="scatter"
    :chartData="chartData"
    :opts="chartOpts"
  />
</view>
```

```ts
const chartData = {
  series: [
    {
      name: '门店 A',
      data: [[10, 20], [15, 32], [22, 18], [28, 40], [35, 26]],
    },
    {
      name: '门店 B',
      data: [[8, 12], [18, 22], [24, 30], [32, 16], [40, 28]],
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

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/charts/scatter.vue -->
<!-- demo-source: src/pages/demo/charts/samples.ts -->
<!-- demo-source: src/pages/demo/charts/use-legend-at-bottom.ts -->
<!-- demo-source: src/pages/demo/charts/chart-demo-page.scss -->
