# 地图 · map

地图。`type="map"`。Demo 页：`/pages/demo/charts/map`（省级简图 / 指定区域填色）。

## 数据

`series` 是 **GeoJSON 要素数组**，每一项一块区域。不要套饼图的 `{ data: [...] }`，也不要只放说明文字：没有 `geometry.coordinates` 时画布是空的。

| 字段 | 说明 |
| --- | --- |
| `properties.name` | 区域名。数据标签和点击提示都用它 |
| `properties.centroid` | 标签锚点，`[经度, 纬度]` |
| `geometry.coordinates` | 多边形。每个多边形只放外环：`[[[lon, lat], ...]]`。多岛时多个多边形排在一起 |
| `color` | 可选。不写则按系列色依次取色 |
| `fillOpacity` | 可选。不写用 `extra.map.fillOpacity` |
| `textSize` | 可选。标签字号 |

坐标是经纬度时，把 `extra.map.mercator` 设为 `true`，否则图形会被拉高。坐标系已经是墨卡托时不要再开。

图例默认会按每一块区域占一行，省级图请 `legend.show: false`。

Demo 的省级边界在 `src/pages/demo/charts/map-geo.ts`（DataV GeoAtlas 抽稀，只留外环，并去掉纬度低于 17° 的南海零星小岛，避免把大陆压扁）。

## 示例

```vue
<view class="chart-box">
  <lingyun-ui-charts
    type="map"
    canvasId="lychart-map"
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
    {
      properties: { name: '北京', centroid: [116.42, 40.19] },
      geometry: {
        coordinates: [
          [
            [
              [115.45, 39.65],
              [117.35, 39.6],
              [117.35, 40.58],
              [115.76, 40.54],
              [115.45, 39.65],
            ],
          ],
        ],
      },
    },
  ],
}

const chartOpts = {
  legend: { show: false },
  dataLabel: true,
  padding: [0, 0, 0, 0],
  extra: {
    map: {
      mercator: true,
      border: true,
      borderWidth: 1,
      borderColor: '#666666',
      fillOpacity: 0.6,
      activeBorderColor: '#F04864',
      activeFillColor: '#FACC14',
      activeFillOpacity: 1,
    },
  },
}
```

点中的区域用 `activeBorderColor`、`activeFillColor`、`activeFillOpacity`。给某一项写 `color` 可固定填色，不随点击变。

```scss
.chart-box {
  width: 100%;
  height: 420px;
}
```

接法、属性、事件见 [图表总览](/charts/)。
