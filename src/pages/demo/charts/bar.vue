<template>
  <chart-demo-block
    title="Bar"
    desc="lingyun-ui-charts · 条状图"
    note="条状图"
    type="bar"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.bar
  const opts = chartDemoOpts.bar || {}
</script>
