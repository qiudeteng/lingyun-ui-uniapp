<template>
  <chart-demo-block
    title="Bar"
    desc="lingyun-ui-charts · 条状图"
    note="条状图"
    type="bar"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.bar
  const opts = chartDemoOpts.bar || {}
  const legendData = chartLegendSamples.bar
  const legendOpts = chartLegendOpts.bar || {}
</script>
