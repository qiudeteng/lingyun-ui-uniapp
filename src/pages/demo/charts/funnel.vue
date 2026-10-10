<template>
  <chart-demo-block
    title="Funnel"
    desc="lingyun-ui-charts · 漏斗图"
    note="漏斗图"
    type="funnel"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.funnel
  const opts = chartDemoOpts.funnel || {}
  const legendData = chartLegendSamples.funnel
  const legendOpts = chartLegendOpts.funnel || {}
</script>
