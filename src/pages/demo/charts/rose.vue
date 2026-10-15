<template>
  <lingyun-app-page title="Rose">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Rose</text>
        <text class="hero__desc">lingyun-ui-charts · 玫瑰图</text>
      </view>

      <lingyun-section title="面积玫瑰图" hint="type=area">
        <view class="chart-box">
          <lingyun-ui-charts
            type="rose"
            canvasId="lychart-rose-area"
            :chartData="baseData"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="半径玫瑰图+分割线+渐变色" hint="type=radius · linearType=custom">
        <view class="chart-box">
          <lingyun-ui-charts
            type="rose"
            canvasId="lychart-rose-radius"
            :chartData="baseData"
            :opts="radiusOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="自定义标签内容" hint="labelText">
        <view class="chart-box">
          <lingyun-ui-charts
            type="rose"
            canvasId="lychart-rose-label"
            :chartData="labelData"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="自定义标签隐藏" hint="labelShow=false">
        <view class="chart-box">
          <lingyun-ui-charts
            type="rose"
            canvasId="lychart-rose-hide"
            :chartData="hiddenData"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表" hint="legend.columns" is-last>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="rose"
            canvasId="lychart-rose-legend"
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

  const slices = [
    { name: '一班', value: 50 },
    { name: '二班', value: 30 },
    { name: '三班', value: 20 },
    { name: '四班', value: 18 },
    { name: '五班', value: 8 },
  ]

  const baseData = { series: [{ data: slices }] }

  const labelData = {
    series: [
      {
        data: slices.map((item, index) =>
          index === 3 ? { ...item, labelText: '四班:18人' } : { ...item },
        ),
      },
    ],
  }

  const hiddenData = {
    series: [
      {
        data: slices.map((item, index) => (index === 3 ? { ...item } : { ...item, labelShow: false })),
      },
    ],
  }

  const radiusOpts = {
    extra: { rose: { type: 'radius', border: true, linearType: 'custom' } },
  }

  const { legendAtBottom } = useLegendAtBottom()
  const legendData = chartLegendSamples.rose
  const legendOpts = computed(() => {
    const base = { ...(chartLegendOpts.rose || {}) }
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
