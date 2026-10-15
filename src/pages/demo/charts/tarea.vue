<template>
  <lingyun-app-page title="Time Area">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Time Area</text>
        <text class="hero__desc">lingyun-ui-charts · 时间轴区域</text>
      </view>

      <lingyun-section title="时间轴(矢量轴)区域图" hint="xAxisDemo2 · Y 轴 0–80">
        <view class="chart-box">
          <lingyun-ui-charts
            type="tarea"
            canvasId="lychart-tarea-vector"
            :chartData="vectorData"
            :opts="vectorOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="秒级时间戳" hint="X 为 Unix 秒">
        <view class="chart-box">
          <lingyun-ui-charts
            type="tarea"
            canvasId="lychart-tarea-unix"
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
            type="tarea"
            canvasId="lychart-tarea-legend"
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
      { name: '时间轴1', data: [[10000, 55], [30000, 25], [50000, 55], [70000, 25], [90000, 55]] },
      { name: '时间轴2', data: [[0, 25], [20000, 55], [40000, 25], [60000, 55], [80000, 25]] },
      { name: '时间轴3', data: [[0, 55], [15000, 25], [30000, 55], [45000, 25], [60000, 55]] },
    ],
  }

  const vectorOpts = {
    xAxis: { format: 'xAxisDemo2' },
    yAxis: { data: [{ min: 0, max: 80 }] },
  }

  const unixData = chartSamples.tarea
  const unixOpts = chartDemoOpts.tarea || {}

  const { legendAtBottom } = useLegendAtBottom()
  const legendData = chartLegendSamples.tarea
  const legendOpts = computed(() => {
    const base = { ...(chartLegendOpts.tarea || {}) }
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
