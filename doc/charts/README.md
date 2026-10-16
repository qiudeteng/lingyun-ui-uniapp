# lingyun-ui-charts

图表。独立包 `lingyun-ui-charts`，当前版本 **{{ chartsVersion }}**。easycom 可用，不必 `import`。默认走 **uCharts**（微信 / H5 / App）；`echartsH5` / `echartsApp` 默认关。

容器必须有明确高度。放在 `lingyun-app-page` 滚动区内时打开 `canvas2d`、`inScrollView`、`ontouch`。同页多图的 `canvasId` 不能重复。

每种图的数据形状不一样，**按图种看下面的专页**，不要把饼图的 `series` 套到柱状图上。右侧预览对应 `src/pages/demo/charts/<type>.vue`。

## 图种

| 图种 | `type` | 专页 |
| --- | --- | --- |
| 柱状图 | `column` | [柱状图](./column.md) |
| 堆积图 | `stack` | [堆积图](./stack.md) |
| 条状图 | `bar` | [条状图](./bar.md) |
| 折线图 | `line` | [折线图](./line.md) |
| 曲线图 | `curve` | [曲线图](./curve.md) |
| 区域图 | `area` | [区域图](./area.md) |
| 饼图 | `pie` | [饼图](./pie.md) |
| 圆环图 | `ring` | [圆环图](./ring.md) |
| 玫瑰图 | `rose` | [玫瑰图](./rose.md) |
| 漏斗图 | `funnel` | [漏斗图](./funnel.md) |
| 雷达图 | `radar` | [雷达图](./radar.md) |
| 仪表盘 | `gauge` | [仪表盘](./gauge.md) |
| 圆弧进度 | `arcbar` | [圆弧进度](./arcbar.md) |
| 山峰图 | `mount` | [山峰图](./mount.md) |
| 混合图 | `mix` | [混合图](./mix.md) |
| 散点图 | `scatter` | [散点图](./scatter.md) |
| 气泡图 | `bubble` | [气泡图](./bubble.md) |
| K 线图 | `candle` | [K 线图](./candle.md) |
| 词云 | `word` | [词云图](./word.md) |
| 地图 | `map` | [地图](./map.md) |
| 时间轴折线 | `tline` | [时间轴折线](./tline.md) |
| 时间轴区域 | `tarea` | [时间轴区域](./tarea.md) |

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="column"
    canvasId="lychart-column"
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
  categories: ['周一', '周二', '周三'],
  series: [
    { name: '门店 A', data: [35, 36, 31] },
    { name: '门店 B', data: [18, 27, 21] },
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

`chartData` 变化会重绘；`series` 为空时显示加载。

## 系列色

改色只动 `js_sdk/lingyun-ui-charts/config-colors.ts`。不要在业务 `src/config` 再备一份。

```ts
import { chartColorDark } from '@/uni_modules/lingyun-ui-charts/js_sdk/lingyun-ui-charts/config-colors'

const chartOpts = { color: chartColorDark }
```

也可 `series[i].color`。顺序 Blue → Green → Yellow → Red → Cyan → Mint → Orange → Purple → Pink。

`opts` 与 `config-ucharts.ts` 里同名 type 深合并，只写要覆盖的字段。新 formatter 加在 `config-ucharts.ts` 的 `formatter`，组件上只传名字。

## 图例

不写 `legend.columns` 时，图例只显示色点和名称。要排成表，列写在 `opts.legend.columns`，格子写在对应的那一项上。`name` 前仍是色点。某一格单独变色写成 `{ text, color }`。点某一行可隐藏该项（`tapLegend`，默认开）。

文字跟随主题，用 Labels 标准色：浅色 `#000000`，暗黑 `#ffffff`。点掉隐藏后，这一行改为次级标签色（浅色 `rgba(60, 60, 67, 0.6)`，暗黑 `rgba(235, 235, 245, 0.6)`），色点改为浅灰。列上的 `color`、格子上的 `{ text, color }` 只在显示时生效。

| 字段 | 说明 |
| --- | --- |
| `key` | 从该项上取的字段。`name` 用名称 |
| `width` | 列宽，px。不写则按该列最长文字 |
| `align` | `right` 时数字右对齐，默认靠左 |
| `color` | 整列文字色。不写用图例默认色 |
| `columnGap` | 列间距，px，默认 8。写在 `legend` 上，不写在列上 |

`position` 为 `top` / `bottom` 且写了 `columns` 时：一行一项，图例区与绘图区同宽，多余宽度加在 `name` 列。

| 图种 | 一行是什么 | 额外字段写在哪 |
| --- | --- | --- |
| `pie` `ring` `rose` `funnel` `mount` | 一个扇区 | `series[0].data` 的每一项 |
| `column` `stack` `bar` `line` `curve` `area` `mix` `radar` `scatter` `bubble` `tline` `tarea` | 一条序列 | 和 `name`、`data` 同级，不要写进每个点 |
| `candle` | 开了均线时每条均线一行；否则那一条 K 线 | 写在对应序列上 |

`word`、`map`、`arcbar`、`gauge` 不画图例。ECharts（`echartsH5` / `echartsApp`）不走这套列。

```ts
const chartOpts = {
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

// 饼类：写在扇区上
{ name: '小程序下单', value: 51.2, count: 5, rate: '10%' }
{ name: '业务员代下单', value: 7.2, count: 1, rate: { text: '2%', color: '#ff3b30' } }

// 柱状 / 折线等：写在 series 上
{ name: '门店 A', data: [35, 36, 31], value: 102, rate: '48%' }
```

圆环图完整示例见 [圆环图](./ring.md)。

## 属性

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `type` | 图种，见上表 | — |
| `chartData` | `{ categories?, series }`，有 series 才绘制 | `{ categories: [], series: [] }` |
| `opts` | 与 uCharts 默认 option 深合并 | `{}` |
| `eopts` | 仅开启 ECharts 时 | `{}` |
| `canvasId` | 画布 id，同页多图必须不同 | uchartsid |
| `canvas2d` | 微信建议打开 | false |
| `inScrollView` | 在页面滚动容器内打开 | false |
| `ontouch` | 手势 / tooltip | false |
| `ontap` | 点击 | true |
| `onmouse` | H5 鼠标 | true |
| `onmovetip` | 移动即出 tooltip | false |
| `onzoom` | 缩放 | false |
| `animation` | 动画 | true |
| `background` | 画布底 | rgba(0,0,0,0) |
| `echartsH5` / `echartsApp` | 改走 ECharts | false |
| `tooltipShow` | 提示窗 | true |
| `tooltipFormat` | `formatter` 里的名字 | — |
| `tapLegend` | 点图例显隐系列 | true |
| `disableScroll` | 禁止页面跟手滚动 | false |
| `optsWatch` | 监听 opts 变化重绘 | true |
| `loadingType` | 加载动画 1–5 | 2 |
| `errorShow` | 出错是否展示错误层 | true |
| `errorReload` | 点错误层是否重试 | true |
| `errorMessage` | 外部指定错误文案 | null |
| `reshow` | 改为 true 强制再绘（弹层打开后） | false |
| `reload` | 改为 true 重新初始化 | false |
| `pageScrollTop` | 页面滚动距离，修正点击坐标 | 0 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `@complete` | 渲染完成。返回 `{ complete: true, id, type: "complete", opts }`。可用返回的 `id`（canvasId）从 `config-ucharts` / `config-echarts` 取实例再调引擎方法 |
| `@getIndex` | 点击数据索引。返回 `{ type: "getIndex", currentIndex: { group, index }, legendIndex, id, event: { x, y }, opts }`；未命中时 index / legendIndex 为 `-1` |
| `@error` | 组件出错。返回 `{ type: "error", errorShow, msg, id }`（`errorShow` 为 props 状态） |
| `@getTouchStart` | 拖动开始。返回 `{ type: "touchStart", event: { x, y }, id, opts }` |
| `@getTouchMove` | 拖动中。返回 `{ type: "touchMove", event: { x, y }, id, opts }` |
| `@getTouchEnd` | 拖动结束。返回 `{ type: "touchEnd", event: { x, y }, id, opts }` |
| `@scrollLeft` | 开启滚动条后到最左侧；用于动态打点，需自行防抖。返回 `{ type: "scrollLeft", scrollLeft: true, id, opts }` |
| `@scrollRight` | 开启滚动条后到最右侧；用于动态打点，需自行防抖。返回 `{ type: "scrollRight", scrollRight: true, id, opts }` |
| `@getImage` | `ref` 调用 `getImage()` 后回传。返回 `{ type: "getImage", base64 }` |

## 方法

日常用 props / 事件 / ref 即可；需要底层实例时再调引擎方法（组件内 `cfu.instance[canvasId]`）。

### 组件侧怎么用

| 需求 | 做法 |
| --- | --- |
| 更新数据 | 改 `chartData`（或 `opts`）；组件内部走 `updateData` |
| 强制再绘 | `reshow` / `reload` 置 `true` |
| Tooltip | `tooltipShow` + `ontouch` / `ontap` / `onmovetip`（内部 `showToolTip`） |
| 点图例显隐 | `tapLegend`（内部 `touchLegend`） |
| 横向拖拽 | `opts.enableScroll: true` + `ontouch`（内部 `scrollStart` / `scroll` / `scrollEnd`） |
| 双指缩放 | 上项 + `onzoom`（内部 `dobuleZoom`） |
| 点击命中序号 | `@getIndex` |
| 绘制完成 | `@complete` |
| 导出图片 | `ref.getImage()`，听 `@getImage` |
| 保存到相册 / 下载 | `ref.saveImage()` |

```vue
<lingyun-ui-charts
  ref="chartRef"
  type="line"
  canvasId="lychart-line"
  :chartData="chartData"
  :opts="chartOpts"
  :canvas2d="true"
  :ontouch="true"
  @complete="onComplete"
  @getIndex="onGetIndex"
  @getImage="onGetImage"
/>
```

```ts
const chartRef = ref<{ getImage: () => void; saveImage: () => void } | null>(null)

function exportPng() {
  chartRef.value?.getImage()
}

function onGetImage(e: { base64?: string }) {
  // e.base64：非 2d 为临时路径，canvas2d 多为 dataURL
  console.log(e.base64)
}
```

改数据即可，不必手写 `updateData`：

```ts
chartData.series = [{ name: '门店 A', data: [40, 42, 38] }]
```

开启拖拽与缩放：

```ts
const chartOpts = {
  enableScroll: true,
  xAxis: { itemCount: 5, scrollShow: true },
}
// 模板另开 :ontouch="true" :onzoom="true"
```

### 组件 ref

| 方法 | 说明 |
| --- | --- |
| `getImage()` | 导出当前画布，经 `@getImage` 回传 `base64`（路径或 dataURL） |
| `saveImage()` | H5 触发下载；App / 小程序尝试写入相册 |

### 引擎方法

#### updateData(data)

更新数据并重绘，不必重建实例。组件侧改 `chartData` / 相关 `opts` 即可。

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `categories` | Array | 当前实例 | 同 `opts.categories` |
| `series` | Array | 当前实例 | 同 `opts.series` |
| `title` | Object | 当前实例 | 同 `opts.title` |
| `subtitle` | Object | 当前实例 | 同 `opts.subtitle` |
| `scrollPosition` | String | `current` | 开启拖拽后：`current` 保持 / `left` 靠左 / `right` 靠右 |
| `animation` | Boolean | 当前实例 | 是否动画 |

```ts
chart.updateData({
  categories: ['7月', '8月', '9月'],
  series: [{ name: '销售额', data: [240, 190, 310] }],
  scrollPosition: 'current',
  animation: true,
})
```

#### stopAnimation()

立刻停掉入场动画，停在当前帧。

```ts
chart.stopAnimation()
```

#### addEventListener(type, listener) / delEventListener(type)

| type | 说明 |
| --- | --- |
| `renderComplete` | 每次绘制结束（含 `updateData`）→ 组件 `@complete` |
| `scrollLeft` | 拖到最左 → `@scrollLeft` |
| `scrollRight` | 拖到最右 → `@scrollRight` |

```ts
chart.addEventListener('renderComplete', () => {})
chart.delEventListener('renderComplete')
```

#### getCurrentDataIndex(e)

根据触摸 / 点击算数据序号。未命中 `-1`（或 `{ index: -1 }`）。类目轴、饼、环、玫瑰、雷达、漏斗、词云、条状等均支持。组件优先用 `@getIndex`。

```ts
const current = chart.getCurrentDataIndex(e)
```

#### getLegendDataIndex(e)

点击处图例项序号，未命中 `-1`。对应 `@getIndex` 的 `legendIndex`。

```ts
const legendIndex = chart.getLegendDataIndex(e)
```

#### touchLegend(e, option?)

点图例切换该系列 `show`。`option.animation` 控制动画。组件开 `tapLegend` 即可。

```ts
chart.touchLegend(e, { animation: false })
```

#### showToolTip(e, option?)

在触摸位置画提示窗。支持 line、area、column、bar、mix、candle、scatter、bubble、mount、pie、ring、rose、funnel、radar、map、word 等。

| option 字段 | 说明 |
| --- | --- |
| `index` | 强制指定类目 / 扇区序号 |
| `textList` | 自定义提示行 |
| `offset` | 自定义位置 `{ x, y }` |
| `formatter` | `(item, category, index, opts) => string` |

```ts
chart.showToolTip(e, {
  formatter(item, category) {
    return `${category} ${item.name}: ${item.data}`
  },
})
```

组件侧用 `tooltipShow`、`tooltipFormat`（名字写在 `config-ucharts` 的 `formatter`）及触摸相关 props。

#### scrollStart(e) / scroll(e) / scrollEnd(e)

横向拖拽三件套。须 `opts.enableScroll: true`。组件在 `ontouch` 时自动转发。

```ts
function onTouchStart(e) {
  chart.scrollStart(e)
}
function onTouchMove(e) {
  chart.scroll(e)
}
function onTouchEnd(e) {
  chart.scrollEnd(e)
  chart.showToolTip(e)
}
```

#### translate(distance)

平移到指定偏移（与内部 `_scrollDistance_` 一致），无动画。

```ts
chart.translate(-120)
```

#### zoom(val)

改一屏类目数并重算偏移。须先 `enableScroll: true`。`val.itemCount` 为一屏数量。

```ts
chart.zoom({ itemCount: 6 })
```

#### dobuleZoom(e)

双指缩放（按两指间距改 `xAxis.itemCount`）。须 `enableScroll`；组件在 `onzoom` + 双指 `touchmove` 时调用。

```ts
chart.dobuleZoom(e)
```

弹层里的图第一次可能量不到宽高，打开后再把 `reshow` 置 `true`。

微信：`canvas2d` + 滚动内 `inScrollView`；formatter 只传名字不要传函数。尺寸用 `px`，不要 `rpx`。
