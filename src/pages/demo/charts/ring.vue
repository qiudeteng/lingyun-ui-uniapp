<template>
  <lingyun-app-page title="Ring">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Ring</text>
        <text class="hero__desc">lingyun-ui-charts · 圆环图</text>
      </view>

      <lingyun-section title="基本环形图" hint="ringWidth=60 · border=false">
        <view class="chart-box">
          <lingyun-ui-charts
            type="ring"
            canvasId="lychart-ring-basic"
            :chartData="baseData"
            :opts="basicOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="分割线+渐变色" hint="linearType=custom">
        <view class="chart-box">
          <lingyun-ui-charts
            type="ring"
            canvasId="lychart-ring-gradient"
            :chartData="baseData"
            :opts="gradientOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="自定义标签内容" hint="labelText">
        <view class="chart-box">
          <lingyun-ui-charts
            type="ring"
            canvasId="lychart-ring-label"
            :chartData="labelData"
            :opts="widthOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="自定义标签隐藏" hint="labelShow=false">
        <view class="chart-box">
          <lingyun-ui-charts
            type="ring"
            canvasId="lychart-ring-hide"
            :chartData="hiddenData"
            :opts="widthOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表" hint="legend.columns" is-last>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="ring"
            canvasId="lychart-ring-legend"
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

  const basicOpts = { extra: { ring: { ringWidth: 60, border: false } } }
  const gradientOpts = { extra: { ring: { ringWidth: 60, linearType: 'custom' } } }
  const widthOpts = { extra: { ring: { ringWidth: 60 } } }

  const { legendAtBottom } = useLegendAtBottom()
  const legendData = chartLegendSamples.ring
  const legendOpts = computed(() => {
    const base = { ...(chartLegendOpts.ring || {}) }
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
