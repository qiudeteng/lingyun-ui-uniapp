# 圆弧进度 · arcbar

圆弧进度。`type="arcbar"`。Demo 页：`/pages/demo/charts/arcbar`（含渐变、多重整圆、逆时针、圆角 / 平角等示例）。

## 数据

`series[].data` 是 **0–1 的比例**（`0.8` = 80%）。没有 `categories`。多环时每层一条 `series`。

不要把百分数 80 直接塞进 `data`。

## 常用 extra.arcbar

| 字段 | 说明 |
| --- | --- |
| `type` | `default` 半圆弧；`circle` 整圆 |
| `direction` | `cw` 顺时针（默认）；`ccw` 逆时针。半圆弧改逆时针时须对调 `startAngle` / `endAngle`（如 `0.25` / `0.75`），否则会画成底部短弧 |
| `lineCap` | `round` 圆角；`butt` 平角 |
| `width` | 弧线宽，px |
| `gap` | 多环间距，px |
| `startAngle` / `endAngle` | 起止角度，0–2（0=3 点、0.5=6 点、1=9 点、1.5=12 点） |
| `backgroundColor` | 底轨色 |
| `linearType` | `none` / `custom`；`custom` 时用 `customColor` 做渐变终点色 |

中心文案用 `opts.title` / `opts.subtitle`。

## 示例：渐变半圆弧

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="arcbar"
    canvasId="lychart-arcbar"
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
  series: [{ name: '正确率', data: 0.8, color: '#34c759' }],
}

const chartOpts = {
  title: { name: '80%', color: '#34c759', fontSize: 25 },
  subtitle: { name: '正确率', color: '#666666', fontSize: 15 },
  extra: {
    arcbar: {
      type: 'default',
      width: 12,
      startAngle: 0.75,
      endAngle: 0.25,
      lineCap: 'round',
      linearType: 'custom',
      customColor: ['#00c0e8'],
    },
  },
}
```

## 示例：多重整圆

```ts
const chartData = {
  series: [
    { name: '一班', data: 0.8 },
    { name: '二班', data: 0.65 },
    { name: '三班', data: 0.5 },
    { name: '四班', data: 0.35 },
  ],
}

const chartOpts = {
  title: { name: '指标', color: '#0088ff', fontSize: 25 },
  subtitle: { name: '默认标题', color: '#666666', fontSize: 15 },
  extra: {
    arcbar: {
      type: 'circle',
      width: 12,
      gap: 4,
      startAngle: 1.5,
      direction: 'cw', // 逆时针改 ccw
      lineCap: 'round',
    },
  },
}
```

## 示例：圆角 / 平角整圆

```ts
// 圆角
extra: { arcbar: { type: 'circle', startAngle: 1.5, lineCap: 'round' } }

// 平角
extra: { arcbar: { type: 'circle', startAngle: 1.5, lineCap: 'butt' } }
```

```scss
.chart-box {
  width: 100%;
  height: 280px;
}
```

接法、属性、事件见 [图表总览](/charts/)。
