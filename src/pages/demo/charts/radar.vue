<template>
  <chart-demo-block
    title="Radar"
    desc="lingyun-ui-charts · 雷达图"
    note="雷达图"
    type="radar"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.radar
  const opts = chartDemoOpts.radar || {}
</script>
