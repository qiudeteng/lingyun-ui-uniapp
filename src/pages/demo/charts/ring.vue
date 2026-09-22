<template>
  <chart-demo-block
    title="Ring"
    desc="lingyun-ui-charts · 圆环图"
    note="圆环图"
    type="ring"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.ring
  const opts = chartDemoOpts.ring || {}
</script>
