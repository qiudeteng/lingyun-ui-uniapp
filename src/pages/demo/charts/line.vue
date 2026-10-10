<template>
  <chart-demo-block
    title="Line"
    desc="lingyun-ui-charts · 折线图"
    note="折线图"
    type="line"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.line
  const opts = chartDemoOpts.line || {}
  const legendData = chartLegendSamples.line
  const legendOpts = chartLegendOpts.line || {}
</script>
