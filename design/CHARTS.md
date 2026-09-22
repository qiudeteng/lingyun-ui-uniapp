# Charts 规范（强制 · lingyun-ui-charts）

> 图表是 **内容层**，不是玻璃控件。独立 `uni_modules` 包，不并入 `lingyun-ui`。  
> **使用手册** → [`doc/charts/README.md`](../doc/charts/README.md)（总览）· [`doc/charts/`](../doc/charts/)（各图种，`pnpm manual:dev`）  
> 引擎：小程序 **uCharts**；H5 / App 默认同走 uCharts（`echartsH5` / `echartsApp` 默认 `false`）。源自秋云 [qiun-data-charts](https://ext.dcloud.net.cn/plugin?id=271)（Apache-2.0）。

## 权威来源

1. 使用手册 [`doc/charts/README.md`](../doc/charts/README.md) · 图种 [`doc/charts/`](../doc/charts/)
2. 系列色 [`config-colors.js`](../src/uni_modules/lingyun-ui-charts/js_sdk/u-charts/config-colors.js) · [`COLORS.md`](./COLORS.md) System Accents
3. 默认 option：`config-ucharts.js` / `config-echarts.js`
4. [uCharts 指南](https://www.ucharts.cn/v2/#/guide/index)

尺寸 **1pt = 1px**。禁止 `rpx`。

---

## 1. 包与标签

| 项 | 约定 |
|----|------|
| 包 | `src/uni_modules/lingyun-ui-charts`（独立于凌云UI 单包） |
| 标签 | `<lingyun-ui-charts />`（easycom） |
| 加载 / 错误 | `<lingyun-ui-charts-loading />` · `<lingyun-ui-charts-error />` |
| 语言 | 扩展内保持 `.js`，不要改成 `.ts` |
| Demo | `src/pages/demo/charts/<type>.vue` · 页壳 `chart-demo-block` |

不要为 `uni_modules` 建 `design/` 镜像目录。视觉与数据约定以本章 + 包 readme 为准。

---

## 2. 系列色

改色 **只动** `js_sdk/u-charts/config-colors.js`。`config-ucharts.js` / `config-echarts.js` 从这里取默认 `color`。禁止在业务 `src/config` 再备一份。

顺序对齐 System Accents：**Blue → Green → Yellow → Red → Cyan → Mint → Orange → Purple → Pink**。

| 导出 | 用途 |
|------|------|
| `chartColor` | Light 默认（全站不传 `opts.color` 时用它） |
| `chartColorDark` | Dark；暗黑页：`:opts="{ color: chartColorDark }"` |

```ts
import { chartColorDark } from '@/uni_modules/lingyun-ui-charts/js_sdk/u-charts/config-colors.js'
```

单系列覆盖：`series[].color`。不要自造非系统强调色。

---

## 3. 图种与数据形状

`type` 与 `chartData` 必须匹配。套错形状会 **空白** 或 **画出画布**。

### 3.1 有 categories（类目轴）

`column` · `bar` · `line` · `area` · `radar` · `mix` · `candle`

```ts
{
  categories: ['周一', '周二'],
  series: [{ name: '门店 A', data: [35, 36] }]
}
```

| type | 额外约定 |
|------|----------|
| `radar` | `opts.extra.radar.max` 要盖住数据（demo 用 100） |
| `mix` | 每条 `series[i].type` 为 `column` / `line` / `area` 等 |
| `candle` | `data` 为 `[开盘, 收盘, 最低, 最高]` |

### 3.2 饼类（`series[0].data`）

`pie` · `ring` · `rose` · `funnel` · `mount`

```ts
{
  series: [{ data: [{ name: '零售', value: 50 }, { name: '餐饮', value: 30 }] }]
}
```

### 3.3 时间轴（无 categories）

`tline` · `tarea` · `scatter` · `bubble`

```ts
// tline / tarea：X 为 Unix **秒**（不是毫秒）
{ series: [{ name: '流量', data: [[1710000000, 22], [1710003600, 30]] }] }

// scatter：[x, y]；bubble：[x, y, size]
```

默认 `tline` / `tarea` 的 Y 轴 `max` 是 **80**（写在 `config-ucharts.js`）。数据超出就会顶破画布；不够用时在 `opts.yAxis.data` 里改 `max`，或把数据收到范围内。

X 轴不要直接画时间戳。小程序不能把函数当 props 传递，用 formatter 名：

```ts
opts: {
  padding: [15, 28, 0, 15], // 右侧给末点标签留空
  xAxis: { format: 'xAxisDemo2' } // → HH:mm，见 config-ucharts.js formatter
}
```

### 3.4 词云（扁平 series）

`word`：**不要**套饼图那种 `{ name, data: [...] }`。uCharts 把 `series` 本身当成词条。

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
| `gauge` | `categories: [{ value: 0.2 }, { value: 0.8 }]`，`series: [{ name, data: 0.8 }]`（**0–1**，不是 0–100） |
| `arcbar` | `series: [{ name, data: 0.8 }]`（0–1） |

未做 demo：`map`、`demotype`。完整 option 仍以 [uCharts 指南](https://www.ucharts.cn/v2/#/guide/index) 为准。

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
| `opts` | `{}` | 与 `config-ucharts.js` 对应 type 深合并 |
| `canvasId` | `uchartsid` | 同页多图必须不同 |
| `canvas2d` | `false` | **微信小程序建议 `true`** |
| `inScrollView` | `false` | 页面在滚动容器内时 `true`（`lingyun-app-page` 内要开） |
| `ontouch` | `false` | 需要滑动/提示时 `true` |
| `echartsH5` / `echartsApp` | `false` | 本仓库默认走 uCharts；打开才用 ECharts |
| `animation` | `true` | 动画 |
| `loadingType` | `2` | 加载动画 1–5 |

业务页不要散落第二套图表库。Demo 统一走 `chart-demo-block`。

---

## 5. 布局与材质

- 图表画在 **内容层**：白/分组底上的 canvas，**不要**给 canvas 套 Liquid Glass。
- 外层卡片用 `lingyun-section` 标准材质即可。
- 容器必须有宽高；高度建议 **280px**（与 demo 一致）。
- 时间轴 `boundaryGap: justify` 时末点贴边，右侧 padding 至少约 **28**，避免标签裁切。

---

## 6. Demo 页

| 路由 | type | 说明 |
|------|------|------|
| `/pages/demo/charts/column` | `column` | 柱状图 |
| `/pages/demo/charts/bar` | `bar` | 条状图 |
| `/pages/demo/charts/line` | `line` | 折线图 |
| `/pages/demo/charts/area` | `area` | 区域图 |
| `/pages/demo/charts/pie` | `pie` | 饼图 |
| `/pages/demo/charts/ring` | `ring` | 圆环图 |
| `/pages/demo/charts/rose` | `rose` | 玫瑰图 |
| `/pages/demo/charts/funnel` | `funnel` | 漏斗图 |
| `/pages/demo/charts/radar` | `radar` | 雷达图 |
| `/pages/demo/charts/gauge` | `gauge` | 仪表盘 |
| `/pages/demo/charts/arcbar` | `arcbar` | 圆弧进度 |
| `/pages/demo/charts/mount` | `mount` | 山峰图 |
| `/pages/demo/charts/mix` | `mix` | 混合图 |
| `/pages/demo/charts/scatter` | `scatter` | 散点图 |
| `/pages/demo/charts/bubble` | `bubble` | 气泡图 |
| `/pages/demo/charts/candle` | `candle` | K 线 |
| `/pages/demo/charts/word` | `word` | 词云 |
| `/pages/demo/charts/tline` | `tline` | 时间轴折线 |
| `/pages/demo/charts/tarea` | `tarea` | 时间轴区域 |

示例数据集中在 `src/pages/demo/charts/samples.ts`。首页「图表」分组见 `src/router/pageNav.ts`。

---

## 7. 自检

- [ ] 数据形状与 `type` 一致（尤其 word 扁平、时间轴秒级时间戳）
- [ ] 系列色来自 `config-colors.js`，未在业务侧另备一份
- [ ] 画布容器有明确宽高；时间轴右侧未裁字、Y 轴未顶破
- [ ] 微信：`canvas2d` + 滚动内 `inScrollView`；`pnpm dev:mp-weixin` 可编译
- [ ] 未给图表套玻璃 mixin；尺寸为 `px`
