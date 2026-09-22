<template>
  <chart-demo-block
    title="Funnel"
    desc="lingyun-ui-charts · 漏斗图"
    note="漏斗图"
    type="funnel"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.funnel
  const opts = chartDemoOpts.funnel || {}
</script>
