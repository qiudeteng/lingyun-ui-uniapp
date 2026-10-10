<template>
  <chart-demo-block
    title="Column"
    desc="lingyun-ui-charts · 柱状图"
    note="柱状图"
    type="column"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.column
  const opts = chartDemoOpts.column || {}
  const legendData = chartLegendSamples.column
  const legendOpts = chartLegendOpts.column || {}
</script>
