# 雷达图 · radar

雷达图。`type="radar"`。Demo 页：`/pages/demo/charts/radar`（多边形、圆形、刻度抽稀、渐变）。

## 数据

必须有 `categories`（各轴名称）。每条 `series.data` 与轴等长。

`opts.extra.radar.max` 小于数据峰值时，刻度按二者中的较大者均分，图形仍落在网格内。

## 常用 extra.radar

| 字段 | 说明 |
| --- | --- |
| `gridType` | `radar` 多边形网格；`circle` 圆形网格 |
| `gridCount` | 网格层数 |
| `gridEval` | 径向线抽稀，默认 `1`（每条都画）；`2` 隔一条画 |
| `axisLabel` | 是否画出刻度数字 |
| `labelShow` | 是否画出维度名称 |
| `opacity` | 区域填充透明度 |
| `border` | 是否描边区域 |
| `linearType` | `none` / `custom`。`custom` 且不传 `customColor` 时，圆心用引擎线性色（`#0EE2F8`），外缘用系列色 |
| `max` | 数据区间最大值 |

顶点数值用 `opts.dataLabel: true`。

## 示例：多边形 / 圆形

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="radar"
    canvasId="lychart-radar"
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
  categories: ['维度1', '维度2', '维度3', '维度4', '维度5', '维度6'],
  series: [
    { name: '成交量1', data: [90, 110, 165, 195, 187, 172] },
    { name: '成交量2', data: [190, 210, 105, 35, 27, 102] },
  ],
}

const chartOpts = {
  dataLabel: false,
  extra: {
    radar: {
      gridType: 'radar', // 圆形改为 circle
      gridCount: 3,
      opacity: 0.2,
      max: 200,
      border: true,
      labelShow: true,
    },
  },
}
```

## 示例：刻度标签 + 网格抽稀

```ts
const chartOpts = {
  dataPointShape: false,
  extra: {
    radar: {
      gridType: 'circle',
      gridCount: 3,
      opacity: 0.2,
      max: 200,
      axisLabel: true,
      gridEval: 2,
      border: true,
      labelShow: true,
    },
  },
}
```

## 示例：渐变色

单系列。`linearType: "custom"` 不传 `customColor` 时，圆心取引擎线性色 `#0EE2F8`，外缘为系列色。`max: 240` 让图形留在网格内侧。`dataLabel` 标出顶点数值。

```ts
const chartData = {
  categories: ['维度1', '维度2', '维度3', '维度4', '维度5', '维度6'],
  series: [{ name: '成交量1', data: [90, 110, 165, 195, 187, 172] }],
}

const chartOpts = {
  dataLabel: true,
  dataPointShape: false,
  extra: {
    radar: {
      gridType: 'circle',
      gridCount: 3,
      opacity: 1,
      max: 240,
      border: false,
      labelShow: true,
      linearType: 'custom',
    },
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
