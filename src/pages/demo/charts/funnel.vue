<template>
  <lingyun-app-page title="Funnel">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Funnel</text>
        <text class="hero__desc">lingyun-ui-charts · 漏斗图</text>
      </view>

      <lingyun-section title="标准漏斗图" hint="centerText">
        <view class="chart-box">
          <lingyun-ui-charts
            type="funnel"
            canvasId="lychart-funnel-basic"
            :chartData="baseData"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="渐变色+自定义标签" hint="linearType=custom · labelText">
        <view class="chart-box">
          <lingyun-ui-charts
            type="funnel"
            canvasId="lychart-funnel-label"
            :chartData="labelData"
            :opts="labelOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="倒三角形漏斗图" hint="type=triangle">
        <view class="chart-box">
          <lingyun-ui-charts
            type="funnel"
            canvasId="lychart-funnel-triangle"
            :chartData="baseData"
            :opts="triangleOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="金字塔形漏斗图" hint="type=pyramid · labelAlign=left">
        <view class="chart-box">
          <lingyun-ui-charts
            type="funnel"
            canvasId="lychart-funnel-pyramid"
            :chartData="baseData"
            :opts="pyramidOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表" hint="legend.columns" is-last>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="funnel"
            canvasId="lychart-funnel-legend"
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

  const steps = [
    { name: '一班', centerText: '50', value: 50 },
    { name: '二班', centerText: '30', value: 30 },
    { name: '三班', centerText: '20', value: 20 },
    { name: '四班', centerText: '18', value: 18 },
    { name: '五班', centerText: '8', value: 8 },
  ]

  const baseData = { series: [{ data: steps }] }

  const labelData = {
    series: [
      {
        data: steps.map((item, index) => {
          if (index === 3) return { ...item, labelText: '四班:18人' }
          if (index === 1 || index === 2 || index === 4) return { ...item, labelShow: false }
          return { ...item }
        }),
      },
    ],
  }

  const labelOpts = { extra: { funnel: { linearType: 'custom', minSize: 20 } } }
  const triangleOpts = { extra: { funnel: { type: 'triangle' } } }
  const pyramidOpts = { extra: { funnel: { type: 'pyramid', labelAlign: 'left' } } }

  const { legendAtBottom } = useLegendAtBottom()
  const legendData = chartLegendSamples.funnel
  const legendOpts = computed(() => {
    const base = { ...(chartLegendOpts.funnel || {}) }
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
