<template>
  <chart-demo-block
    title="Arcbar"
    desc="lingyun-ui-charts · 圆弧进度"
    note="圆弧进度"
    type="arcbar"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.arcbar
  const opts = chartDemoOpts.arcbar || {}
</script>
