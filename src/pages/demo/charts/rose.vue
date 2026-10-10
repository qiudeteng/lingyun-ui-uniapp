<template>
  <chart-demo-block
    title="Rose"
    desc="lingyun-ui-charts · 玫瑰图"
    note="玫瑰图"
    type="rose"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.rose
  const opts = chartDemoOpts.rose || {}
  const legendData = chartLegendSamples.rose
  const legendOpts = chartLegendOpts.rose || {}
</script>
