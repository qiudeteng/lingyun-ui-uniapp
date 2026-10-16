# 堆积图 · stack

把多条序列按类目叠在一起看总量与结构。Demo 页：`/pages/demo/charts/stack`。

## 怎么用（心智模型）

**数据与折线 / 曲线相同**：传各层原始值，不要自己累加。  
**开启堆积**后，引擎用 `js_sdk/lingyun-ui-charts/stack-series.ts` 按类目累加，并按总和缩放 Y 轴。

| 画法 | 怎么配 | 说明 |
| --- | --- | --- |
| 堆积柱状 | `type="stack"`，或 `type="column"` + `extra.column.type: "stack"` | 引擎原生累加 |
| 堆积条状 | `type="bar"` + `extra.bar.type: "stack"` | 同上，横向；Demo 见 [条状图](./bar.md) |
| 堆积折线 | `type="line"` + `extra.line.stack: true` | 自动改走面积色带，层间填色 |
| 堆积曲线 | `type="curve"` + `extra.line.stack: true` | 同上（曲线预设已是 `line.type: curve`） |

也可直接用 `type="area"` + `extra.area.stack: true`（效果相同）。

## 共用数据

```ts
const chartData = {
  categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  series: [
    { name: '直营', data: [35, 36, 31, 33, 13, 34, 32] },
    { name: '加盟', data: [18, 27, 21, 24, 6, 28, 22] },
    { name: '电商', data: [12, 15, 10, 14, 8, 16, 11] },
  ],
}
```

## 堆积柱状

```vue
<lingyun-ui-charts
  type="stack"
  canvasId="lychart-stack"
  :chartData="chartData"
  :opts="{}"
  :canvas2d="true"
  :inScrollView="true"
  :ontouch="true"
/>
```

## 堆积折线 / 曲线

仍用 `line` / `curve`，只多开一个开关：

```vue
<!-- 堆积折线 -->
<lingyun-ui-charts
  type="line"
  canvasId="lychart-stack-line"
  :chartData="chartData"
  :opts="lineOpts"
  :canvas2d="true"
  :inScrollView="true"
  :ontouch="true"
/>

<!-- 堆积曲线 -->
<lingyun-ui-charts
  type="curve"
  canvasId="lychart-stack-curve"
  :chartData="chartData"
  :opts="curveOpts"
  :canvas2d="true"
  :inScrollView="true"
  :ontouch="true"
/>
```

```ts
const lineOpts = {
  extra: {
    line: { stack: true, type: 'straight', width: 2 },
  },
}

const curveOpts = {
  extra: {
    line: { stack: true },
  },
}
```

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

接法、属性、事件见 [图表总览](/charts/)。相关：[柱状图](./column.md) · [折线图](./line.md) · [曲线图](./curve.md) · [区域图](./area.md)。
