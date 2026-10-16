# Charts 规范（强制 · lingyun-ui-charts）

> 图表是 **内容层**，不是玻璃控件。独立 `uni_modules` 包，不并入 `lingyun-ui`。  
> **使用手册** → [`doc/charts/README.md`](../doc/charts/README.md)（总览）· [`doc/charts/`](../doc/charts/)（各图种，`pnpm manual:dev`）  
## 权威来源

1. 使用手册 [`doc/charts/README.md`](../doc/charts/README.md)（含属性 / 事件 / 方法全文）· 图种 [`doc/charts/`](../doc/charts/)
2. 系列色 [`config.ts`](../src/uni_modules/lingyun-ui-charts/components/lingyun-ui-charts/config.ts) · [`COLORS.md`](./COLORS.md) System Accents
3. 默认 option：`config.ts` 里的 `cfu` / `cfe`
4. 引擎实现：`components/lingyun-ui-charts/lingyun-ui-charts.ts`

尺寸 **1pt = 1px**。禁止 `rpx`。

---

## 1. 包与标签

| 项 | 约定 |
|----|------|
| 包 | `src/uni_modules/lingyun-ui-charts`（独立于凌云UI 单包） |
| 标签 | `<lingyun-ui-charts />`（easycom） |
| 加载 / 错误 | `lingyun-activity-indicator` · `lingyun-empty` |
| 语言 | 组件、配置和引擎为 TypeScript，与 `lingyun-ui-charts.vue` 同目录。renderjs 保持 JavaScript |
| Demo | `src/pages/demo/charts/<type>.vue` · 页壳 `chart-demo-block` |

不要为 `uni_modules` 建 `design/` 镜像目录。视觉与数据约定以本章 + 包 readme 为准。

---

## 2. 系列色

改色 **只动** `components/lingyun-ui-charts/config.ts` 顶部的 `chartColor` / `chartColorDark`。禁止在业务 `src/config` 再备一份。

顺序对齐 System Accents：**Blue → Green → Yellow → Red → Cyan → Mint → Orange → Purple → Pink**。

| 导出 | 用途 |
|------|------|
| `chartColor` | Light 默认（全站不传 `opts.color` 时用它） |
| `chartColorDark` | Dark；暗黑页：`:opts="{ color: chartColorDark }"` |

```ts
import { chartColorDark } from '@/uni_modules/lingyun-ui-charts/components/lingyun-ui-charts/config'
```

单系列覆盖：`series[].color`。不要自造非系统强调色。

---

## 3. 图种与数据形状

`type` 与 `chartData` 必须匹配。套错形状会 **空白** 或 **画出画布**。

### 3.1 有 categories（类目轴）

`column` · `stack` · `bar` · `line` · `curve` · `area` · `radar` · `mix` · `candle`

```ts
{
  categories: ['周一', '周二'],
  series: [{ name: '门店 A', data: [35, 36] }]
}
```

| type | 额外约定 |
|------|----------|
| `column` | 默认 `extra.column`：`categoryGap` 拉开各组、`seriesGap` 同组柱距、`barBorderRadius: [6,6,0,0]` 顶部圆角。Demo 另含 stack / meter / 渐变圆角 / 正负 / 滚动 / 标记线 |
| `stack` | 堆积柱状别名：引擎 `column` + `extra.column.type: "stack"`；折线/曲线传同款原始数据 + `extra.line.stack: true`（算法见 `stack-series.ts`），见 `doc/charts/stack.md` |
| `line` | `extra.line.type`：`straight` 折线、`curve` 曲线、`step` 阶梯。`data` 里写 `null` 断开，`connectNulls: true` 续连。渐变 `linearType: "custom"` + `series.linearColor`；阴影 `onShadow` + `setShadow`；`animation: "horizontal"` 从左画入。滚动：`enableScroll` + `xAxis.itemCount` |
| `curve` | 自定义图种别名，引擎为 `line`，默认 `extra.line.type: "curve"` 平滑曲线；数据形状同 `line` |
| `radar` | `opts.extra.radar.max` 要盖住数据。`gridType`：`radar` 多边形、`circle` 圆形。`axisLabel` 刻度、`gridEval` 径向线抽稀、`linearType: "custom"` 渐变 |
| `mix` | 每条 `series[i].type` 为 `column` / `line` / `area` 等 |
| `candle` | `data` 为 `[开盘, 收盘, 最低, 最高]` |

### 3.2 饼类（`series[0].data`）

`pie` · `ring` · `rose` · `funnel` · `mount`

```ts
{
  series: [{ data: [{ name: '零售', value: 50 }, { name: '餐饮', value: 30 }] }]
}
```

图例表见下文 **§3.6**。饼类的格子写在 `series[0].data` 的每一项上。

`mount` 的峰形在 `extra.mount.type`：`mount` 圆角（默认）、`sharp` 尖角、`triangle` 三角、`bar` 直角柱。`widthRatio` 为峰宽相对类目间距，0–2，默认 1.5。`linearType` 为 `custom`（内置渐变）或 `opacity`（顶透）。正负值要把 `yAxis.data[0]` 的 `min` / `max` 设成能包住数据的范围（默认 `min: 0` 会裁掉负值）。横向滚动：`enableScroll` + `xAxis.itemCount` + 组件 `ontouch`。标记线：`enableMarkLine` + `extra.markLine`。见 `doc/charts/mount.md`。

### 3.3 时间轴（无 categories）

`tline` · `tarea` · `scatter` · `bubble`

```ts
// tline / tarea：X 为 Unix **秒**（不是毫秒）
{ series: [{ name: '流量', data: [[1710000000, 22], [1710003600, 30]] }] }

// scatter：[x, y]；bubble：[x, y, size]
```

默认 `tline` / `tarea` 的 Y 轴 `max` 是 **80**（写在 `config.ts`）。数据超出就会顶破画布；不够用时在 `opts.yAxis.data` 里改 `max`，或把数据收到范围内。

X 轴不要直接画时间戳。小程序不能把函数当 props 传递，用 formatter 名：

```ts
opts: {
  padding: [15, 28, 0, 15], // 右侧给末点标签留空
  xAxis: { format: 'xAxisDemo2' } // → HH:mm，见 config.ts formatter
}
```

### 3.4 词云（扁平 series）

`word`：**不要**套饼图那种 `{ name, data: [...] }`。

```ts
{
  series: [
    { name: '凌云UI', textSize: 32 },
    { name: '小程序', textSize: 22 }
  ]
}
```

建议 `legend.show = false`。`textSize` 相对画布过高会碰撞失败 → 空白。

### 3.5 进度类

| type | 数据 |
|------|------|
| `gauge` | `categories: [{ value: 0.2 }, { value: 0.8 }]`，`series: [{ name, data: 0.8 }]`（**0–1**，不是 0–100）。`extra.gauge.type`：`default` 分段色指针；`progress` 外圈刻度 + 圆弧进度 |
| `arcbar` | `series: [{ name, data: 0.8 }]`（0–1） |

### 3.6 图例表

不写 `legend.columns` 时只显示色点和名称。列写在 `opts.legend.columns`。`name` 前仍是色点。某一格单独变色写成 `{ text, color }`。

文字跟随主题，用 Labels 标准色：浅色 `#000000`，暗黑 `#ffffff`。点掉隐藏后改为次级标签色（浅色 `rgba(60, 60, 67, 0.6)`，暗黑 `rgba(235, 235, 245, 0.6)`），色点改为浅灰。列上的 `color`、格子上的 `{ text, color }` 只在显示时生效。

| 字段 | 说明 |
|------|------|
| `key` | 从该项上取的字段。`name` 用名称 |
| `width` | 列宽，px。不写则按该列最长文字 |
| `align` | `right` 右对齐，默认靠左 |
| `color` | 整列文字色 |
| `columnGap` | 列间距，px，默认 8。写在 `legend` 上 |

`position` 为 `top` / `bottom` 且写了 `columns` 时：一行一项，图例区与绘图区同宽，多余宽度加在 `name` 列。

| 图种 | 一行 | 额外字段 |
|------|------|----------|
| `pie` `ring` `rose` `funnel` `mount` | 一个扇区 | `series[0].data` 的每一项 |
| `column` `stack` `bar` `line` `curve` `area` `mix` `radar` `scatter` `bubble` `tline` `tarea` | 一条序列 | 与 `name`、`data` 同级 |
| `candle` | 开了均线时每条均线；否则那一条 K 线 | 写在对应序列上 |

`word`、`map`、`arcbar`、`gauge` 不画图例。ECharts 不走这套列。

```ts
legend: {
  position: 'right',
  lineHeight: 22,
  fontSize: 12,
  columns: [
    { key: 'name', width: 72 },
    { key: 'value', width: 36, align: 'right' },
    { key: 'rate', width: 32, align: 'right', color: '#86868b' },
  ],
}
// 饼类
{ name: '小程序下单', value: 51.2, count: 5, rate: '10%' }
// 柱状 / 折线
{ name: '门店 A', data: [35, 36, 31], value: 102, rate: '48%' }
```

### 3.7 地图（GeoJSON 要素）

`map`：`series` 本身是区域数组。每一项要有 `properties.name`、`properties.centroid`（`[经度, 纬度]`）和 `geometry.coordinates`。多边形只放外环：`[[[lon, lat], ...]]`。

不要套 `{ data: [...] }`，也不要只写说明文字。经纬度坐标把 `extra.map.mercator` 设为 `true`。省级图关图例：`legend.show: false`。点选高亮用 `activeBorderColor` / `activeFillColor`。某一块固定填色写在该项的 `color`。

见 `doc/charts/map.md`。Demo 边界在 `src/pages/demo/charts/map-geo.ts`。

未做 demo：`demotype`。属性 / 事件 / 方法见手册 [`doc/charts/README.md`](../doc/charts/README.md)；其余 option 字段以本包 `config.ts` 与引擎源码为准。

---

## 4. 组件用法

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="column"
    canvasId="lychart-column"
    :chartData="chartData"
    :opts="opts"
    :canvas2d="true"
    :inScrollView="true"
    :ontouch="true"
  />
</view>
```

```scss
.chart-box {
  width: 100%;
  height: 280px; // 必须给明确高度，canvas 才能量到
}
```

| 属性 | 默认 | 说明 |
|------|------|------|
| `type` | — | 图种，见 §3 |
| `chartData` | `{ categories, series }` | 数据；形状见 §3 |
| `opts` | `{}` | 与 `config.ts` 里 `cfu` 对应 type 深合并 |
| `canvasId` | `id` | 同页多图必须不同 |
| `canvas2d` | `false` | **微信小程序建议 `true`** |
| `inScrollView` | `false` | 页面在滚动容器内时 `true`（`lingyun-app-page` 内要开） |
| `ontouch` | `false` | 需要滑动/提示时 `true` |
| `echartsH5` / `echartsApp` | `false` | 默认走本组件引擎。打开后只使用页面上已有的 `window.echarts` |
| `animation` | `true` | 动画 |

业务页不要散落第二套图表库。Demo 统一走 `chart-demo-block`。

---

## 5. 布局与材质

- 图表画在 **内容层**：白/分组底上的 canvas，**不要**给 canvas 套 Liquid Glass。
- 外层卡片用 `lingyun-section` 标准材质即可。
- 容器必须有宽高；高度建议 **280px**（与 demo 一致）。
- 时间轴 `boundaryGap: justify` 时末点贴边，右侧 padding 至少约 **28**，避免标签裁切。

### 5.1 微信：浮层不要被 canvas 穿透

微信里 canvas 是原生层，会盖住 Sheet / Picker 等普通浮层（见 `UI_SPEC` §6.2-H）。`lingyun-ui-charts` 已监听 `mp-overlay-gate`：浮层打开时截图 + `hidden` canvas。业务页请用凌云浮层组件；自写 canvas 时需自行避让。

---

## 6. Demo 页

| 路由 | type | 说明 |
|------|------|------|
| `/pages/demo/charts/column` | `column` | 柱状图 |
| `/pages/demo/charts/stack` | `stack` | 堆积图（柱 / 折线 / 曲线，原始数据 + stack） |
| `/pages/demo/charts/bar` | `bar` | 条状图（分组 / 堆叠 / 圆角渐变） |
| `/pages/demo/charts/line` | `line` | 折线图（折线 / 曲线 / 阶梯 / 断点续连 / 渐变 / 阴影动画 / 滚动 / 时间轴） |
| `/pages/demo/charts/curve` | `curve` | 曲线图（基本 / 渐变 / 阴影动画） |
| `/pages/demo/charts/area` | `area` | 区域图（折线 / 曲线渐变 / 时序渐变 / 时间轴） |
| `/pages/demo/charts/pie` | `pie` | 饼图（基本 / 分割线渐变 / 自定义标签） |
| `/pages/demo/charts/ring` | `ring` | 圆环图（基本 / 分割线渐变 / 自定义标签） |
| `/pages/demo/charts/rose` | `rose` | 玫瑰图（面积 / 半径渐变 / 自定义标签） |
| `/pages/demo/charts/funnel` | `funnel` | 漏斗图（标准 / 渐变标签 / 倒三角 / 金字塔） |
| `/pages/demo/charts/radar` | `radar` | 雷达图（多边形 / 圆形 / 刻度抽稀 / 渐变） |
| `/pages/demo/charts/gauge` | `gauge` | 仪表盘（基本 / 进度） |
| `/pages/demo/charts/arcbar` | `arcbar` | 圆弧进度（渐变 / 多环 / 逆时针 / 圆角 / 平角） |
| `/pages/demo/charts/mount` | `mount` | 山峰图（圆角 / 尖角 / 三角 / 直角 / 正负渐变 / 滚动 / 标记线） |
| `/pages/demo/charts/mix` | `mix` | 混合图（多坐标系） |
| `/pages/demo/charts/scatter` | `scatter` | 散点图 |
| `/pages/demo/charts/bubble` | `bubble` | 气泡图 |
| `/pages/demo/charts/candle` | `candle` | K 线（双指缩放） |
| `/pages/demo/charts/word` | `word` | 词云（水平 / 横竖混排） |
| `/pages/demo/charts/map` | `map` | 地图（省级简图 / 指定区域填色） |
| `/pages/demo/charts/tline` | `tline` | 时间轴折线（矢量坐标 / 秒级时间戳） |
| `/pages/demo/charts/tarea` | `tarea` | 时间轴区域（矢量轴 / 秒级时间戳） |

示例数据集中在 `src/pages/demo/charts/samples.ts`。首页「图表」分组见 `src/router/pageNav.ts`。

---

## 7. 自检

- [ ] 数据形状与 `type` 一致（尤其 word 扁平、时间轴秒级时间戳）
- [ ] 系列色来自 `config.ts`，未在业务侧另备一份
- [ ] 画布容器有明确宽高；时间轴右侧未裁字、Y 轴未顶破
- [ ] 微信：`canvas2d` + 滚动内 `inScrollView`；`pnpm dev:mp-weixin` 可编译
- [ ] 微信：打开 Sheet / Picker 时图表不穿透浮层
- [ ] 未给图表套玻璃 mixin；尺寸为 `px`
