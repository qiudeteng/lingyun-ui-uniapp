<template>
  <chart-demo-block
    title="Ring"
    desc="lingyun-ui-charts · 圆环图"
    note="圆环图"
    type="ring"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.ring
  const opts = chartDemoOpts.ring || {}
  const legendData = chartLegendSamples.ring
  const legendOpts = chartLegendOpts.ring || {}
</script>
