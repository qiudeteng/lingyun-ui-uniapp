<template>
  <lingyun-app-page title="Bubble">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Bubble</text>
        <text class="hero__desc">lingyun-ui-charts · 气泡图</text>
      </view>

      <lingyun-section title="气泡图" hint="坐标 [x, y, size, 标题]">
        <view class="chart-box">
          <lingyun-ui-charts
            type="bubble"
            canvasId="lychart-bubble"
            :chartData="bubbleData"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表" hint="legend.columns" is-last>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="bubble"
            canvasId="lychart-bubble-legend"
            :chartData="legendData"
            :opts="legendOpts"
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
  import { computed } from 'vue'
  import { chartLegendOpts, chartLegendSamples } from './samples'
  import { useLegendAtBottom } from './use-legend-at-bottom'

  const bubbleData = {
    series: [
      {
        name: '气泡一',
        data: [
          [95, 95, 23, '标题1'],
          [30, 55, 33, '标题2'],
        ],
      },
      {
        name: '气泡二',
        data: [
          [130, 30, 30, '标题3'],
          [200, 90, 40, '标题4'],
        ],
      },
    ],
  }

  const { legendAtBottom } = useLegendAtBottom()
  const legendData = chartLegendSamples.bubble
  const legendOpts = computed(() => {
    const base = { ...(chartLegendOpts.bubble || {}) }
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
