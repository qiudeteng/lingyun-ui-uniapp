<template>
  <chart-demo-block
    title="Time Line"
    desc="lingyun-ui-charts · 时间轴折线"
    note="时间轴折线"
    type="tline"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.tline
  const opts = chartDemoOpts.tline || {}
  const legendData = chartLegendSamples.tline
  const legendOpts = chartLegendOpts.tline || {}
</script>
