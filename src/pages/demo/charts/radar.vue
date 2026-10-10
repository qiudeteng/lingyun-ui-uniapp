<template>
  <chart-demo-block
    title="Radar"
    desc="lingyun-ui-charts · 雷达图"
    note="雷达图"
    type="radar"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.radar
  const opts = chartDemoOpts.radar || {}
  const legendData = chartLegendSamples.radar
  const legendOpts = chartLegendOpts.radar || {}
</script>
