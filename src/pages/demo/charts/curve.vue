<template>
  <lingyun-app-page title="Curve">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Curve</text>
        <text class="hero__desc">lingyun-ui-charts · 曲线图</text>
      </view>

      <lingyun-section title="基本曲线图" hint="首条虚线">
        <view class="chart-box">
          <lingyun-ui-charts
            type="curve"
            canvasId="lychart-curve-basic"
            :chartData="curveData"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="渐变色曲线图" hint="linearType=custom">
        <view class="chart-box">
          <lingyun-ui-charts
            type="curve"
            canvasId="lychart-curve-gradient"
            :chartData="gradientData"
            :opts="gradientOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="渐变色+阴影+水平动画" hint="onShadow · animation=horizontal">
        <view class="chart-box">
          <lingyun-ui-charts
            type="curve"
            canvasId="lychart-curve-shadow"
            :chartData="shadowData"
            :opts="shadowOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表" hint="legend.columns" is-last>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="curve"
            canvasId="lychart-curve-legend"
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

  const curveData = {
    categories: years,
    series: [
      { name: '成交量A', lineType: 'dash', data: [35, 8, 25, 37, 4, 20] },
      { name: '成交量B', data: [70, 40, 65, 100, 44, 68] },
      { name: '成交量C', data: [100, 80, 95, 150, 112, 132] },
    ],
  }

  const gradientData = {
    categories: years,
    series: [
      {
        name: '成交量A',
        linearColor: [
          [0, '#1890FF'],
          [0.25, '#00B5FF'],
          [0.5, '#00D1ED'],
          [0.75, '#00E6BB'],
          [1, '#90F489'],
        ],
        data: [15, 45, 15, 45, 15, 45],
      },
      {
        name: '成交量B',
        linearColor: [
          [0, '#91CB74'],
          [0.25, '#2BDCA8'],
          [0.5, '#2AE3A0'],
          [0.75, '#C4D06E'],
          [1, '#F2D375'],
        ],
        data: [55, 85, 55, 85, 55, 85],
      },
      {
        name: '成交量C',
        linearColor: [
          [0, '#FAC858'],
          [0.33, '#FFC371'],
          [0.66, '#FFC2B2'],
          [1, '#FA7D8D'],
        ],
        data: [95, 125, 95, 125, 95, 125],
      },
    ],
  }

  const shadowData = {
    categories: years,
    series: [
      {
        name: '成交量A',
        linearColor: gradientData.series[0].linearColor,
        setShadow: [3, 8, 10, '#1890FF'],
        data: [15, 45, 15, 45, 15, 45],
      },
      { name: '成交量B', data: [55, 85, 55, 85, 55, 85] },
      {
        name: '成交量C',
        linearColor: gradientData.series[2].linearColor,
        setShadow: [3, 8, 10, '#FC8452'],
        data: [95, 125, 95, 125, 95, 125],
      },
    ],
  }

  const gradientOpts = {
    dataLabel: false,
    dataPointShape: false,
    yAxis: { data: [{ min: 0, max: 150 }] },
    extra: { line: { type: 'curve', linearType: 'custom' } },
  }

  const shadowOpts = {
    dataLabel: false,
    dataPointShape: false,
    yAxis: { data: [{ min: 0, max: 150 }] },
    extra: {
      line: { type: 'curve', linearType: 'custom', onShadow: true, animation: 'horizontal' },
    },
  }

  const { legendAtBottom } = useLegendAtBottom()
  const legendData = chartLegendSamples.curve
  const legendOpts = computed(() => {
    const base = { ...(chartLegendOpts.curve || {}) }
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
