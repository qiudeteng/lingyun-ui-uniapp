<template>
  <chart-demo-block
    title="Mount"
    desc="lingyun-ui-charts · 山峰图"
    note="山峰图"
    type="mount"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.mount
  const opts = chartDemoOpts.mount || {}
</script>
