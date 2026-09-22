<template>
  <chart-demo-block
    title="Time Area"
    desc="lingyun-ui-charts · 时间轴区域"
    note="时间轴区域"
    type="tarea"
    :chart-data="chartData"
    :opts="opts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartSamples } from './samples'

  const chartData = chartSamples.tarea
  const opts = chartDemoOpts.tarea || {}
</script>
