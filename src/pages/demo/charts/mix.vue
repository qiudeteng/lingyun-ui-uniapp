<template>
  <chart-demo-block
    title="Mix"
    desc="lingyun-ui-charts · 混合图"
    note="混合图"
    type="mix"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.mix
  const opts = chartDemoOpts.mix || {}
</script>
