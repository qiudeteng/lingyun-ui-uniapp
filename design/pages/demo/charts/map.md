# design/pages/demo/charts/map

对应源码：`src/pages/demo/charts/map.vue`

展示 `lingyun-ui-charts` **地图**：省级简图、指定区域填色。

- 数据：GeoJSON 要素数组（`properties.name` / `centroid`，`geometry.coordinates` 外环）。不要套 `{ data: [...] }`
- 经纬度要开 `extra.map.mercator`
- 边界数据：`src/pages/demo/charts/map-geo.ts`
- 规范：[`design/CHARTS.md`](../../../CHARTS.md)
- 系列色：包内 `config-colors.ts` · [`COLORS.md`](../../../COLORS.md)
