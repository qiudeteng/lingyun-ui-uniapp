<template>
  <chart-demo-block
    title="Candle"
    desc="lingyun-ui-charts · K 线图"
    note="K 线图"
    type="candle"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.candle
  const opts = chartDemoOpts.candle || {}
</script>
