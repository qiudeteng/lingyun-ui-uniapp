<template>
  <chart-demo-block
    title="Scatter"
    desc="lingyun-ui-charts · 散点图"
    note="散点图"
    type="scatter"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.scatter
  const opts = chartDemoOpts.scatter || {}
  const legendData = chartLegendSamples.scatter
  const legendOpts = chartLegendOpts.scatter || {}
</script>
