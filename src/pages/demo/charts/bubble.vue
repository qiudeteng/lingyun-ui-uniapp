<template>
  <chart-demo-block
    title="Bubble"
    desc="lingyun-ui-charts · 气泡图"
    note="气泡图"
    type="bubble"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.bubble
  const opts = chartDemoOpts.bubble || {}
  const legendData = chartLegendSamples.bubble
  const legendOpts = chartLegendOpts.bubble || {}
</script>
