<template>
  <chart-demo-block
    title="Area"
    desc="lingyun-ui-charts · 区域图"
    note="区域图"
    type="area"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.area
  const opts = chartDemoOpts.area || {}
  const legendData = chartLegendSamples.area
  const legendOpts = chartLegendOpts.area || {}
</script>
