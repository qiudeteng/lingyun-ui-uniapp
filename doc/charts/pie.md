# 饼图 · pie

饼图。`type="pie"`。Demo 页：`/pages/demo/charts/pie`（基本 / 分割线渐变 / 自定义标签）。

## 数据

没有 `categories`。`series` 只有一项，扇区写在 `series[0].data`：`{ name, value }`。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="pie"
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
        { name: '零售', value: 50 },
        { name: '餐饮', value: 30 },
        { name: '批发', value: 20 },
        { name: '其他', value: 12 },
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

<!-- demo-source: src/pages/demo/charts/pie.vue -->
<!-- demo-source: src/pages/demo/charts/samples.ts -->
<!-- demo-source: src/pages/demo/charts/use-legend-at-bottom.ts -->
<!-- demo-source: src/pages/demo/charts/chart-demo-page.scss -->
