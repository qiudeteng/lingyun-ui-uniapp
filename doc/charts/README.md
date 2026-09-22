# lingyun-ui-charts

图表。独立包 `lingyun-ui-charts`，easycom 可用，不必 `import`。默认走 **uCharts**（微信 / H5 / App）；`echartsH5` / `echartsApp` 默认关。

容器必须有明确高度。放在 `lingyun-app-page` 滚动区内时打开 `canvas2d`、`inScrollView`、`ontouch`。同页多图的 `canvasId` 不能重复。

每种图的数据形状不一样，**按图种看下面的专页**，不要把饼图的 `series` 套到柱状图上。右侧预览对应 `src/pages/demo/charts/<type>.vue`。

## 图种

| 图种 | `type` | 专页 |
| --- | --- | --- |
| 柱状图 | `column` | [柱状图](./column.md) |
| 条状图 | `bar` | [条状图](./bar.md) |
| 折线图 | `line` | [折线图](./line.md) |
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

改色只动 `js_sdk/u-charts/config-colors.js`。不要在业务 `src/config` 再备一份。

```ts
import { chartColorDark } from '@/uni_modules/lingyun-ui-charts/js_sdk/u-charts/config-colors.js'

const chartOpts = { color: chartColorDark }
```

也可 `series[i].color`。顺序 Blue → Green → Yellow → Red → Cyan → Mint → Orange → Purple → Pink。

`opts` 与 `config-ucharts.js` 里同名 type 深合并，只写要覆盖的字段。新 formatter 加在 `config-ucharts.js` 的 `formatter`，组件上只传名字。

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
| `complete` | 绘制完成 |
| `error` | 数据或类型错误 |
| `getIndex` | 点击命中，带 `currentIndex` |
| `getTouchStart` / `getTouchMove` / `getTouchEnd` | 触摸或鼠标 |
| `scrollLeft` / `scrollRight` | 滚动到头 |
| `getImage` | 导出图片，带 `base64` |

弹层里的图第一次可能量不到宽高，打开后再把 `reshow` 置 `true`。

微信：`canvas2d` + 滚动内 `inScrollView`；formatter 只传名字不要传函数。尺寸用 `px`，不要 `rpx`。
