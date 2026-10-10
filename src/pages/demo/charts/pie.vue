<template>
  <chart-demo-block
    title="Pie"
    desc="lingyun-ui-charts · 饼图"
    note="饼图"
    type="pie"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.pie
  const opts = chartDemoOpts.pie || {}
  const legendData = chartLegendSamples.pie
  const legendOpts = chartLegendOpts.pie || {}
</script>
