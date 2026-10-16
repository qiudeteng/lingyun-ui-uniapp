<template>
  <lingyun-app-page title="Scatter">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Scatter</text>
        <text class="hero__desc">lingyun-ui-charts · 散点图</text>
      </view>

      <lingyun-section title="散点图" hint="坐标 [x, y]">
        <view class="chart-box">
          <lingyun-ui-charts
            type="scatter"
            :chartData="scatterData"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表" hint="legend.columns" is-last>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="scatter"
            :chartData="legendData"
            :opts="legendOpts"
          />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { chartLegendOpts, chartLegendSamples } from './samples'
  import { useLegendAtBottom } from './use-legend-at-bottom'

  const scatterData = {
    series: [
      {
        name: '散点一',
        data: [
          [10, 8.04],
          [8.07, 6.95],
          [13, 7.58],
          [9.05, 8.81],
          [11, 8.33],
          [14, 7.66],
          [13.4, 6.81],
          [10, 6.33],
          [14, 8.96],
          [12.5, 6.82],
        ],
      },
      {
        name: '散点二',
        data: [
          [9.15, 7.2],
          [11.5, 7.2],
          [3.03, 4.23],
          [12.2, 7.83],
          [2.02, 4.47],
          [1.05, 3.33],
          [4.05, 4.96],
          [6.03, 7.24],
          [12, 6.26],
          [12, 8.84],
          [7.08, 5.82],
          [5.02, 5.68],
        ],
      },
    ],
  }

  const { legendAtBottom } = useLegendAtBottom()
  const legendData = chartLegendSamples.scatter
  const legendOpts = computed(() => {
    const base = { ...(chartLegendOpts.scatter || {}) }
    const legend = {
      ...((base.legend as Record<string, unknown>) || {}),
      position: legendAtBottom.value ? 'bottom' : 'right',
      float: 'center',
    }
    return { ...base, legend }
  })
</script>

<style lang="scss">
  @import './chart-demo-page.scss';
</style>
