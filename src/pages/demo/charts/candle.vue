<template>
  <chart-demo-block
    title="Candle"
    desc="lingyun-ui-charts · K 线图"
    note="K 线图"
    type="candle"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.candle
  const opts = chartDemoOpts.candle || {}
  const legendData = chartLegendSamples.candle
  const legendOpts = chartLegendOpts.candle || {}
</script>
