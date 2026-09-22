# 词云图 · word

词云。`type="word"`。Demo 页：`/pages/demo/charts/word`。

## 数据

`series` 是**扁平** `{ name, textSize }` 列表，不要再包一层 `data`，也不要写成饼图那种 `{ data: [{ name, value }] }`。

套成饼式 `series: [{ data: [...] }]` 会画空白。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="word"
    canvasId="lychart-word"
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
    { name: '凌云UI', textSize: 32 },
    { name: 'Liquid Glass', textSize: 24 },
    { name: '小程序', textSize: 22 },
    { name: '图表', textSize: 20 },
    { name: '门店', textSize: 18 },
    { name: '订单', textSize: 16 },
    { name: '库存', textSize: 16 },
    { name: '会员', textSize: 14 },
    { name: '报表', textSize: 14 },
    { name: '登录', textSize: 12 },
  ],
}

const chartOpts = {
  legend: { show: false },
  extra: {
    word: { type: 'normal', autoColors: false },
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
