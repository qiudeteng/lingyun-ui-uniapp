<template>
  <chart-demo-block
    title="Rose"
    desc="lingyun-ui-charts · 玫瑰图"
    note="玫瑰图"
    type="rose"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.rose
  const opts = chartDemoOpts.rose || {}
</script>
