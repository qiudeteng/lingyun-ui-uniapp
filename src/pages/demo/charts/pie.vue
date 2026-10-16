<template>
  <lingyun-app-page title="Pie">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Pie</text>
        <text class="hero__desc">lingyun-ui-charts · 饼图</text>
      </view>

      <lingyun-section title="基本饼状图" hint="border=false">
        <view class="chart-box">
          <lingyun-ui-charts
            type="pie"
            :chartData="baseData"
            :opts="basicOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="带分割线+渐变色" hint="linearType=custom">
        <view class="chart-box">
          <lingyun-ui-charts
            type="pie"
            :chartData="baseData"
            :opts="gradientOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="自定义标签内容" hint="labelText">
        <view class="chart-box">
          <lingyun-ui-charts
            type="pie"
            :chartData="labelData"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="自定义标签隐藏" hint="labelShow=false">
        <view class="chart-box">
          <lingyun-ui-charts
            type="pie"
            :chartData="hiddenData"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表" hint="legend.columns" is-last>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="pie"
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

  const basicOpts = { extra: { pie: { border: false } } }
  const gradientOpts = { extra: { pie: { linearType: 'custom' } } }

  const { legendAtBottom } = useLegendAtBottom()
  const legendData = chartLegendSamples.pie
  const legendOpts = computed(() => {
    const base = { ...(chartLegendOpts.pie || {}) }
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
