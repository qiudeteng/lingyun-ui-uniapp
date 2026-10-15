<template>
  <lingyun-app-page title="Bar">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Bar</text>
        <text class="hero__desc">lingyun-ui-charts · 条状图（分组 / 堆积）</text>
      </view>

      <lingyun-section title="分组条状图">
        <view class="chart-box">
          <lingyun-ui-charts
            type="bar"
            canvasId="lychart-bar-group"
            :chartData="groupData"
            :opts="groupOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="堆积条状图">
        <view class="chart-box">
          <lingyun-ui-charts
            type="bar"
            canvasId="lychart-bar-stack"
            :chartData="stackData"
            :opts="stackOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表" is-last>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="bar"
            canvasId="lychart-bar-legend"
            :chartData="legendData"
            :opts="resolvedLegendOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { chartLegendOpts, chartLegendSamples, chartSamples } from './samples'

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

  const legendAtBottom = computed(() => windowWidth.value < PHONE_MAX_WIDTH)

  const groupData = chartSamples.bar
  const groupOpts = {}

  /** 原始分层数据；extra.bar.type = stack 由引擎累加 */
  const stackData = {
    categories: chartSamples.bar.categories,
    series: [
      { name: '直营', data: [35, 36, 31, 33, 28] },
      { name: '加盟', data: [18, 27, 21, 24, 19] },
      { name: '电商', data: [12, 15, 10, 14, 11] },
    ],
  }
  const stackOpts = {
    extra: {
      bar: {
        type: 'stack',
        barBorderRadius: [6, 6, 0, 0],
      },
    },
  }

  const legendData = chartLegendSamples.bar
  const resolvedLegendOpts = computed(() => {
    const base = { ...(chartLegendOpts.bar || {}) }
    const legend = {
      ...((base.legend as Record<string, unknown>) || {}),
      position: legendAtBottom.value ? 'bottom' : 'right',
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

  .chart-box--legend-bottom {
    height: 320px;
  }
</style>
