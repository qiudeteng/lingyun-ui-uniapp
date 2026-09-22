<template>
  <chart-demo-block
    title="Gauge"
    desc="lingyun-ui-charts · 仪表盘"
    note="仪表盘"
    type="gauge"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.gauge
  const opts = chartDemoOpts.gauge || {}
</script>
