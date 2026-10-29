<template>
  <lingyun-app-page title="Area">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Area</text>
        <text class="hero__desc">lingyun-ui-charts · 区域图</text>
      </view>

      <lingyun-section title="基本折线区域图" hint="type=straight">
        <view class="chart-box">
          <lingyun-ui-charts
            type="area"
            :chartData="lineData"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="渐变色曲线区域图" hint="type=curve · gradient">
        <view class="chart-box">
          <lingyun-ui-charts
            type="area"
            :chartData="lineData"
            :opts="curveOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="渐变色时序区域图" hint="type=step · gradient">
        <view class="chart-box">
          <lingyun-ui-charts
            type="area"
            :chartData="lineData"
            :opts="stepOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="时间轴(矢量轴)区域图" hint="type=tarea · xAxisDemo2">
        <view class="chart-box">
          <lingyun-ui-charts
            type="tarea"
            :chartData="timeData"
            :opts="timeOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表" hint="legend.columns · 表高自适应 · tableBorder" is-last>
        <view class="legend-row">
          <text class="legend-row__label">数据行数</text>
          <lingyun-stepper v-model="legendRowCount" :min="1" :max="18" show-value />
        </view>
        <view class="legend-row">
          <text class="legend-row__label">显示表格边框</text>
          <lingyun-switch v-model="legendBorder" />
        </view>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="area"
            :chartData="legendData"
            :opts="legendOpts"
            @legendAction="onLegendAction"
          />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { chartLegendOpts, chartLegendSamples } from './samples'
  import { useLegendAtBottom } from './use-legend-at-bottom'

  const years = ['2018', '2019', '2020', '2021', '2022', '2023']
  const legendBorder = ref(false)
  const legendRowCount = ref(12)

  const lineData = {
    categories: years,
    series: [
      { name: '成交量A', data: [35, 8, 25, 37, 4, 20] },
      { name: '成交量B', data: [70, 40, 65, 100, 44, 68] },
      { name: '成交量C', data: [100, 80, 95, 150, 112, 132] },
    ],
  }

  const timeData = {
    series: [
      { name: '时间轴1', data: [[10000, 55], [30000, 25], [50000, 55], [70000, 25], [90000, 55]] },
      { name: '时间轴2', data: [[0, 25], [20000, 55], [40000, 25], [60000, 55], [80000, 25]] },
      { name: '时间轴3', data: [[0, 55], [15000, 25], [30000, 55], [45000, 25], [60000, 55]] },
    ],
  }

  const curveOpts = {
    extra: { area: { type: 'curve', addLine: true, gradient: true } },
  }

  const stepOpts = {
    extra: { area: { type: 'step', addLine: true, gradient: true } },
  }

  const timeOpts = {
    xAxis: { format: 'xAxisDemo2' },
    yAxis: { data: [{ min: 0, max: 80 }] },
  }

  const { legendAtBottom } = useLegendAtBottom()
  const legendData = computed(() => {
    const base = chartLegendSamples.area || { categories: [], series: [] }
    const sourceSeries = (base.series || []) as Array<Record<string, unknown>>
    const count = Math.max(1, Math.round(legendRowCount.value) || 1)
    const series = Array.from({ length: count }, (_, index) => {
      const source = sourceSeries[index % Math.max(1, sourceSeries.length)] || {
        name: '数据',
        data: [],
      }
      const sourceData = Array.isArray(source.data) ? (source.data as number[]) : []
      const round = Math.floor(index / Math.max(1, sourceSeries.length))
      const data = sourceData.map((value, pointIndex) =>
        Math.max(0, Math.round(value * (1 + round * 0.12) + ((index + pointIndex) % 4) * 2)),
      )
      const value = Math.round(1150 * (1 - index * 0.045)) + (index % 3) * 20
      const rate = `${Math.max(1, 74 - index * 3)}%`
      const baseName = String(source.name || '数据')
      return {
        ...source,
        name: index < sourceSeries.length ? baseName : `${baseName} ${index + 1}`,
        data,
        value: String(value),
        rate,
      }
    })
    return { ...base, series }
  })
  const legendOpts = computed(() => {
    const base = { ...(chartLegendOpts.area || {}) }
    const baseLegend = (base.legend as Record<string, unknown>) || {}
    const columns = [
      { key: 'name', width: 68 },
      { key: 'value', width: 44, align: 'right' },
      { key: 'rate', width: 40, align: 'right', color: '#86868b' },
      { type: 'action', text: '详情', width: 44 },
    ]
    const legend = {
      ...baseLegend,
      position: legendAtBottom.value ? 'bottom' : 'right',
      float: 'center',
      fontSize: 13,
      lineHeight: 26,
      padding: 4,
      columns,
      tableBorder: legendBorder.value,
      borderWidth: 0.5,
      borderColor: 'rgba(120, 120, 128, 0.32)',
      tableRowLine: true,
      tableLineWidth: 0.5,
      tableLineColor: 'rgba(120, 120, 128, 0.16)',
      tableShape: 'dot',
      tableGap: 10,
      pageArrowSize: 30,
      actionColor: '#0A84FF',
    }
    return { ...base, legend }
  })

  function onLegendAction(payload: { legendIndex?: number; item?: { name?: string } }): void {
    const name = payload?.item?.name || '—'
    uni.showToast({ title: `查看更多：${name}`, icon: 'none' })
    console.log('legendAction', payload)
  }
</script>

<style lang="scss">
  @import './chart-demo-page.scss';
</style>
