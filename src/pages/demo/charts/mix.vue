<template>
  <chart-demo-block
    title="Mix"
    desc="lingyun-ui-charts · 混合图"
    note="混合图"
    type="mix"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.mix
  const opts = chartDemoOpts.mix || {}
  const legendData = chartLegendSamples.mix
  const legendOpts = chartLegendOpts.mix || {}
</script>
