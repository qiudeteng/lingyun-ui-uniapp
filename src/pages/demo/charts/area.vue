<template>
  <lingyun-app-page title="Area">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Area</text>
        <text class="hero__desc">lingyun-ui-charts · 区域图</text>
      </view>

      <lingyun-section title="基本折线区域图" hint="type=straight">
        <view class="chart-box">
          <lingyun-ui-charts
            type="area"
            canvasId="lychart-area-straight"
            :chartData="lineData"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="渐变色曲线区域图" hint="type=curve · gradient">
        <view class="chart-box">
          <lingyun-ui-charts
            type="area"
            canvasId="lychart-area-curve"
            :chartData="lineData"
            :opts="curveOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="渐变色时序区域图" hint="type=step · gradient">
        <view class="chart-box">
          <lingyun-ui-charts
            type="area"
            canvasId="lychart-area-step"
            :chartData="lineData"
            :opts="stepOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="时间轴(矢量轴)区域图" hint="type=tarea · xAxisDemo2">
        <view class="chart-box">
          <lingyun-ui-charts
            type="tarea"
            canvasId="lychart-area-time"
            :chartData="timeData"
            :opts="timeOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表" hint="legend.columns" is-last>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="area"
            canvasId="lychart-area-legend"
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

  const years = ['2018', '2019', '2020', '2021', '2022', '2023']

  const lineData = {
    categories: years,
    series: [
      { name: '成交量A', data: [35, 8, 25, 37, 4, 20] },
      { name: '成交量B', data: [70, 40, 65, 100, 44, 68] },
      { name: '成交量C', data: [100, 80, 95, 150, 112, 132] },
    ],
  }

  const timeData = {
    series: [
      { name: '时间轴1', data: [[10000, 55], [30000, 25], [50000, 55], [70000, 25], [90000, 55]] },
      { name: '时间轴2', data: [[0, 25], [20000, 55], [40000, 25], [60000, 55], [80000, 25]] },
      { name: '时间轴3', data: [[0, 55], [15000, 25], [30000, 55], [45000, 25], [60000, 55]] },
    ],
  }

  const curveOpts = {
    extra: { area: { type: 'curve', addLine: true, gradient: true } },
  }

  const stepOpts = {
    extra: { area: { type: 'step', addLine: true, gradient: true } },
  }

  const timeOpts = {
    xAxis: { format: 'xAxisDemo2' },
    yAxis: { data: [{ min: 0, max: 80 }] },
  }

  const { legendAtBottom } = useLegendAtBottom()
  const legendData = chartLegendSamples.area
  const legendOpts = computed(() => {
    const base = { ...(chartLegendOpts.area || {}) }
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
