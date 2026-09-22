<template>
  <chart-demo-block
    title="Line"
    desc="lingyun-ui-charts · 折线图"
    note="折线图"
    type="line"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.line
  const opts = chartDemoOpts.line || {}
</script>
