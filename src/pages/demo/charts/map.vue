<template>
  <lingyun-app-page title="Map">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Map</text>
        <text class="hero__desc">lingyun-ui-charts · 地图。点区域高亮，提示名称</text>
      </view>

      <lingyun-section title="省级地图" hint="mercator">
        <view class="chart-box chart-box--map">
          <lingyun-ui-charts
            type="map"
            canvasId="lychart-map-basic"
            :chartData="baseData"
            :opts="baseOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="指定区域填色" hint="color / fillOpacity" is-last>
        <view class="chart-box chart-box--map">
          <lingyun-ui-charts
            type="map"
            canvasId="lychart-map-marked"
            :chartData="markedData"
            :opts="baseOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { chinaProvinces, type ChinaProvince } from './map-geo'

  type MapSeriesItem = ChinaProvince & {
    textSize: number
    color?: string
    fillOpacity?: number
  }

  function toSeries(
    paint?: (name: string) => Pick<MapSeriesItem, 'color' | 'fillOpacity'> | undefined,
  ): MapSeriesItem[] {
    return chinaProvinces.map((item) => ({
      properties: item.properties,
      geometry: item.geometry,
      textSize: 9,
      ...(paint?.(item.properties.name) || {}),
    }))
  }

  const baseData = { series: toSeries() }

  const markedData = {
    series: toSeries((name) =>
      name === '北京' || name === '浙江' || name === '广东'
        ? { color: '#ff8d28', fillOpacity: 0.9 }
        : undefined,
    ),
  }

  const baseOpts = {
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
</script>

<style lang="scss">
  @import './chart-demo-page.scss';

  .chart-box--map {
    height: 420px;
  }
</style>
