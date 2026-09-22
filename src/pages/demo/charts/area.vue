<template>
  <chart-demo-block
    title="Area"
    desc="lingyun-ui-charts · 区域图"
    note="区域图"
    type="area"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.area
  const opts = chartDemoOpts.area || {}
</script>
