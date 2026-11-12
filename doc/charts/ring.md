# 圆环图 · ring

圆环图。`type="ring"`。Demo 页：`/pages/demo/charts/ring`（基本 / 分割线渐变 / 自定义标签）。

## 数据

没有 `categories`。扇区写在 `series[0].data`：`{ name, value }`。

环心不铺白底，扇区之间默认不描边。`title` 是环心主数字，按内圆放大并加粗；`subtitle` 是下面一行小字。颜色跟主题：浅色黑字，暗黑白字，副标题用次级标签色。写了 `color` 才用指定色。需要扇区缝隙时设置 `extra.ring.border = true`。

环宽可以写 `extra.ring.ringWidth`（固定 px），也可以写 `extra.ring.ringWidthRatio`（0–0.9，占半径比例，优先于 `ringWidth`）。不传时默认按半径 **40%** 计算环宽（内径 **60%**），会随图表尺寸自动变化，大图不会变细；需要固定宽度或更粗的环时再显式设置，例如 `ringWidthRatio: 0.58`。

图例默认单行 / 单列；超出容量只显示当前页，右侧或底部出现上下箭头翻页。窄屏下左右图例会强制落到底部。要恢复旧的多行 / 多列布局，传 `legend.overflow: 'wrap'`。

图例排成表时，列写在 `opts.legend.columns`，额外的格子跟在同一条扇区上。`name` 前仍是色点。某一格单独变色写成 `{ text, color }`。文字跟随主题：浅色黑色，暗黑白色，点掉隐藏后改为次级标签色。其它图种的字段该写在哪一层，见 [图表总览 · 图例](/charts/#图例)。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="ring"
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

## 演示源码

文档不重复贴代码：构建时直接从仓库读取源码展开（点开折叠块即可查看完整代码）。

<!-- demo-source: src/pages/demo/charts/ring.vue -->
<!-- demo-source: src/pages/demo/charts/chart-demo-page.scss -->
