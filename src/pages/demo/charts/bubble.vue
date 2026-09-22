<template>
  <chart-demo-block
    title="Bubble"
    desc="lingyun-ui-charts · 气泡图"
    note="气泡图"
    type="bubble"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.bubble
  const opts = chartDemoOpts.bubble || {}
</script>
