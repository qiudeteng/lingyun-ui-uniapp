<template>
  <chart-demo-block
    title="Time Line"
    desc="lingyun-ui-charts · 时间轴折线"
    note="时间轴折线"
    type="tline"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.tline
  const opts = chartDemoOpts.tline || {}
</script>
