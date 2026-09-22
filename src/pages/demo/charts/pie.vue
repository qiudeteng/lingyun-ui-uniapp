<template>
  <chart-demo-block
    title="Pie"
    desc="lingyun-ui-charts · 饼图"
    note="饼图"
    type="pie"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.pie
  const opts = chartDemoOpts.pie || {}
</script>
