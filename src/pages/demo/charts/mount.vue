<template>
  <chart-demo-block
    title="Mount"
    desc="lingyun-ui-charts · 山峰图"
    note="山峰图"
    type="mount"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.mount
  const opts = chartDemoOpts.mount || {}
  const legendData = chartLegendSamples.mount
  const legendOpts = chartLegendOpts.mount || {}
</script>
