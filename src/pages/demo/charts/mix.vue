<template>
  <lingyun-app-page title="Mix">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Mix</text>
        <text class="hero__desc">lingyun-ui-charts · 混合图</text>
      </view>

      <lingyun-section title="多坐标系混合图" hint="左轴折线 · 右轴柱 / 点">
        <view class="chart-box chart-box--tall">
          <lingyun-ui-charts
            type="mix"
            :chartData="mixData"
            :opts="mixOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表" hint="legend.columns" is-last>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="mix"
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

  const years = ['2018', '2019', '2020', '2021', '2022', '2023']

  const mixData = {
    categories: years,
    series: [
      { name: '曲面', data: [70, 50, 85, 130, 64, 88], type: 'area', style: 'curve' },
      {
        name: '柱1',
        index: 1,
        data: [40, { value: 30, color: '#f04864' }, 55, 110, 24, 58],
        type: 'column',
      },
      { name: '柱2', index: 1, data: [50, 20, 75, 60, 34, 38], type: 'column' },
      {
        name: '曲线',
        data: [70, 50, 85, 130, 64, 88],
        type: 'line',
        style: 'curve',
        color: '#1890ff',
        disableLegend: true,
      },
      { name: '折线', data: [120, 140, 105, 170, 95, 160], type: 'line', color: '#2fc25b' },
      {
        name: '点',
        index: 2,
        data: [100, 80, 125, 150, 112, 132],
        type: 'point',
        color: '#f04864',
      },
    ],
  }

  const mixOpts = {
    xAxis: { title: '单位：年' },
    yAxis: {
      data: [
        { position: 'left', title: '折线' },
        { position: 'right', min: 0, max: 200, title: '柱状图', textAlign: 'left' },
        { position: 'right', min: 0, max: 200, title: '点', textAlign: 'left' },
      ],
    },
  }

  const { legendAtBottom } = useLegendAtBottom()
  const legendData = chartLegendSamples.mix
  const legendOpts = computed(() => {
    const base = { ...(chartLegendOpts.mix || {}) }
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
