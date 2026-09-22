<template>
  <chart-demo-block
    title="Word"
    desc="lingyun-ui-charts · 词云图"
    note="词云图"
    type="word"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.word
  const opts = chartDemoOpts.word || {}
</script>
