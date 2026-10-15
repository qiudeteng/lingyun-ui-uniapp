<template>
  <lingyun-app-page title="Time Line">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Time Line</text>
        <text class="hero__desc">lingyun-ui-charts · 时间轴折线</text>
      </view>

      <lingyun-section title="时间轴折线图" hint="矢量坐标 [x, y]">
        <view class="chart-box">
          <lingyun-ui-charts
            type="tline"
            canvasId="lychart-tline-vector"
            :chartData="vectorData"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="秒级时间戳" hint="X 为 Unix 秒">
        <view class="chart-box">
          <lingyun-ui-charts
            type="tline"
            canvasId="lychart-tline-unix"
            :chartData="unixData"
            :opts="unixOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表" hint="legend.columns" is-last>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="tline"
            canvasId="lychart-tline-legend"
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
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'
  import { useLegendAtBottom } from './use-legend-at-bottom'

  const vectorData = {
    series: [
      { name: '竖线', data: [[30, 0], [30, 80]] },
      { name: '横线', data: [[0, 40], [60, 40]] },
      { name: '曲线1', data: [[60, 70], [30, 40], [60, 10]] },
      { name: '曲线2', data: [[0, 70], [30, 40], [0, 10]] },
    ],
  }

  const unixData = chartSamples.tline
  const unixOpts = chartDemoOpts.tline || {}

  const { legendAtBottom } = useLegendAtBottom()
  const legendData = chartLegendSamples.tline
  const legendOpts = computed(() => {
    const base = { ...(chartLegendOpts.tline || {}) }
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
