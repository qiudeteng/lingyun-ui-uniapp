# 漏斗图 · funnel

漏斗图。`type="funnel"`。Demo 页：`/pages/demo/charts/funnel`（标准 / 渐变标签 / 倒三角 / 金字塔）。

## 数据

没有 `categories`。层级写在 `series[0].data`：`{ name, value }`，value 从上到下递减。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="funnel"
    :chartData="chartData"
    :opts="chartOpts"
  />
</view>
```

```ts
const chartData = {
  series: [
    {
      data: [
        { name: '曝光', value: 80 },
        { name: '点击', value: 50 },
        { name: '加购', value: 30 },
        { name: '下单', value: 15 },
        { name: '支付', value: 8 },
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

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/charts/funnel.vue -->
<!-- demo-source: src/pages/demo/charts/samples.ts -->
<!-- demo-source: src/pages/demo/charts/use-legend-at-bottom.ts -->
<!-- demo-source: src/pages/demo/charts/chart-demo-page.scss -->
