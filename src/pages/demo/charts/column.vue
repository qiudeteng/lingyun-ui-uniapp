<template>
  <lingyun-app-page title="Column">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Column</text>
        <text class="hero__desc">lingyun-ui-charts · 柱状图</text>
      </view>

      <lingyun-section title="基本柱状图" hint="type=group · 默认分组">
        <view class="chart-box">
          <lingyun-ui-charts
            type="column"
            :chartData="basicData"
            :opts="basicOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="堆叠柱状图" hint="extra.column.type=stack · 标签居中">
        <view class="chart-box">
          <lingyun-ui-charts
            type="column"
            :chartData="stackData"
            :opts="stackOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="圆角+渐变+半透明柱状图" hint="linearType=custom · barBorderCircle">
        <view class="chart-box">
          <lingyun-ui-charts
            type="column"
            :chartData="basicData"
            :opts="gradientOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="温度计图表" hint="type=meter · 外框目标 / 内柱完成">
        <view class="chart-box">
          <lingyun-ui-charts
            type="column"
            :chartData="basicData"
            :opts="meterOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="圆角温度计图表" hint="meter + 全圆角 · 关闭数据标签">
        <view class="chart-box">
          <lingyun-ui-charts
            type="column"
            :chartData="basicData"
            :opts="meterRoundOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="正负柱状图" hint="数据可含负值 · Y 轴跨 0">
        <view class="chart-box">
          <lingyun-ui-charts
            type="column"
            :chartData="negativeData"
            :opts="negativeOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="柱状图滚动条" hint="enableScroll · 左右滑动">
        <view class="chart-box">
          <lingyun-ui-charts
            type="column"
            :chartData="scrollData"
            :opts="scrollOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="全圆角柱状图+标记线" hint="barBorderRadius · enableMarkLine">
        <view class="chart-box">
          <lingyun-ui-charts
            type="column"
            :chartData="markLineData"
            :opts="markLineOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表" hint="legend.columns" is-last>
        <view class="chart-box chart-box--legend">
          <lingyun-ui-charts
            type="column"
            :chartData="legendData"
            :opts="legendOpts"
          />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { chartLegendOpts, chartLegendSamples } from './samples'

  /** 目标值 / 完成量 */
  const years = ['2018', '2019', '2020', '2021', '2022', '2023']

  const basicData = {
    categories: years,
    series: [
      { name: '目标值', data: [35, 36, 31, 33, 13, 34] },
      { name: '完成量', data: [18, 27, 21, 24, 6, 28] },
    ],
  }

  /** 堆叠时标签用白字，叠在色柱上更清晰 */
  const stackData = {
    categories: years,
    series: [
      { name: '目标值', data: [35, 36, 31, 33, 13, 34], textColor: '#FFFFFF' },
      { name: '完成量', data: [18, 27, 21, 24, 6, 28], textColor: '#FFFFFF' },
    ],
  }

  const negativeData = {
    categories: years,
    series: [{ name: '成交量', data: [20, -20, 25, -25, 30, -30] }],
  }

  /** 多类目方便演示横向滚动 */
  const scrollData = {
    categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日', '周一', '周二', '周三', '周四', '周五'],
    series: [
      { name: '目标值', data: [35, 36, 31, 33, 13, 34, 32, 35, 36, 31, 33, 13] },
      { name: '完成量', data: [18, 27, 21, 24, 6, 28, 22, 18, 27, 21, 24, 6] },
    ],
  }

  /** 第三根完成量柱单独上色，方便对照标记线 21 */
  const markLineData = {
    categories: years,
    series: [
      { name: '目标值', data: [35, 36, 31, 33, 13, 34] },
      {
        name: '完成量',
        data: [18, 27, { value: 21, color: '#EE6666' }, 24, 6, 28],
      },
    ],
  }

  const basicOpts = {
    extra: {
      column: {
        type: 'group',
        seriesGap: 3,
        categoryGap: 6,
        barBorderRadius: [6, 6, 0, 0],
      },
    },
  }

  const stackOpts = {
    extra: {
      column: {
        type: 'stack',
        labelPosition: 'center',
        categoryGap: 6,
        barBorderRadius: [6, 6, 0, 0],
      },
    },
  }

  const gradientOpts = {
    color: ['#FAC858', '#EE6666'],
    extra: {
      column: {
        type: 'group',
        linearType: 'custom',
        seriesGap: 5,
        linearOpacity: 0.5,
        barBorderCircle: true,
        customColor: ['#FA7D8D', '#EB88E2'],
      },
    },
  }

  const meterOpts = {
    extra: {
      column: {
        type: 'meter',
        meterBorder: 3,
        meterFillColor: '#EBFBD6',
      },
    },
  }

  const meterRoundOpts = {
    color: ['#39B54A', '#FBBD08'],
    dataLabel: false,
    extra: {
      column: {
        type: 'meter',
        meterBorder: 0,
        meterFillColor: '#39B54A',
        barBorderRadius: [50, 50, 50, 50],
      },
    },
  }

  const negativeOpts = {
    legend: { show: false },
    yAxis: {
      splitNumber: 4,
      data: [{ min: -40, max: 40 }],
    },
    extra: {
      column: {
        type: 'group',
        barBorderCircle: true,
        linearType: 'custom',
      },
    },
  }

  const scrollOpts = {
    touchMoveLimit: 24,
    enableScroll: true,
    xAxis: {
      scrollShow: true,
      itemCount: 4,
      disableGrid: true,
    },
    extra: {
      column: {
        type: 'group',
        seriesGap: 3,
        barBorderRadius: [6, 6, 0, 0],
      },
    },
  }

  const markLineOpts = {
    yAxis: {
      data: [{ min: 0 }],
    },
    enableMarkLine: true,
    extra: {
      column: {
        type: 'group',
        seriesGap: 5,
        barBorderRadius: [6, 6, 6, 6],
      },
      markLine: {
        data: [{ value: 21, showLabel: true }],
      },
    },
  }

  const legendData = chartLegendSamples.column!
  const legendBaseOpts = chartLegendOpts.column || {}

  const PHONE_MAX_WIDTH = 600
  const windowWidth = ref(375)

  function readWindowWidth(override?: number) {
    if (typeof override === 'number' && override > 0) {
      windowWidth.value = override
      return
    }
    try {
      const win =
        typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
      windowWidth.value = Number(win.windowWidth) || 375
    } catch {
      windowWidth.value = 375
    }
  }

  function onWindowResize(res: { size?: { windowWidth?: number }; windowWidth?: number }) {
    const fromSize = Number(res?.size?.windowWidth)
    const direct = Number(res?.windowWidth)
    readWindowWidth(fromSize > 0 ? fromSize : direct)
  }

  onMounted(() => {
    readWindowWidth()
    uni.onWindowResize?.(onWindowResize)
  })

  onUnmounted(() => {
    uni.offWindowResize?.(onWindowResize)
  })

  const legendOpts = computed(() => {
    const base = { ...(legendBaseOpts || {}) }
    const legend = {
      ...((base.legend as Record<string, unknown>) || {}),
      position: windowWidth.value < PHONE_MAX_WIDTH ? 'bottom' : 'right',
      float: 'center',
    }
    return { ...base, legend }
  })
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 40px;
    min-height: 100%;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(0, 136, 255, 0.18), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(52, 199, 89, 0.14), transparent 50%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .hero {
    padding: 24px 20px 8px;
  }

  .hero__title {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--lingyun-label, #1c1c1e);
  }

  .hero__desc {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .chart-box {
    width: 100%;
    height: 280px;
  }

  .chart-box--legend {
    height: 320px;
  }
</style>
