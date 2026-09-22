<template>
  <chart-demo-block
    title="Scatter"
    desc="lingyun-ui-charts · 散点图"
    note="散点图"
    type="scatter"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.scatter
  const opts = chartDemoOpts.scatter || {}
</script>
