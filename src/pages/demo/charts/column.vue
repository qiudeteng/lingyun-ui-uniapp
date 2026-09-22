<template>
  <chart-demo-block
    title="Column"
    desc="lingyun-ui-charts · 柱状图"
    note="柱状图"
    type="column"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.column
  const opts = chartDemoOpts.column || {}
</script>
