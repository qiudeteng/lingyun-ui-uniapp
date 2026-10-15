<template>
  <chart-demo-block
    title="Curve"
    desc="lingyun-ui-charts · 曲线图"
    note="曲线图"
    type="curve"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.curve
  const opts = chartDemoOpts.curve || {}
  const legendData = chartLegendSamples.curve
  const legendOpts = chartLegendOpts.curve || {}
</script>
