<template>
  <chart-demo-block
    title="Time Area"
    desc="lingyun-ui-charts · 时间轴区域"
    note="时间轴区域"
    type="tarea"
    :chart-data="chartData"
    :opts="opts"
    extra-note="图例表"
    :extra-chart-data="legendData"
    :extra-opts="legendOpts"
  />
</template>

<script setup lang="ts">
  import { chartDemoOpts, chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

  const chartData = chartSamples.tarea
  const opts = chartDemoOpts.tarea || {}
  const legendData = chartLegendSamples.tarea
  const legendOpts = chartLegendOpts.tarea || {}
</script>
