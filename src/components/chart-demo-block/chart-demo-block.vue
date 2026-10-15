<template>
  <lingyun-app-page :title="title">
    <view class="page">
      <view class="hero">
        <text class="hero__title">{{ title }}</text>
        <text class="hero__desc">{{ desc }}</text>
      </view>
      <lingyun-section :title="note" :is-last="!extraChartData">
        <view class="chart-box">
          <lingyun-ui-charts
            :type="type"
            :canvasId="canvasId"
            :chartData="chartData"
            :opts="opts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>
      <lingyun-section v-if="extraChartData" :title="extraNote" is-last>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            :type="type"
            :canvasId="extraCanvasId"
            :chartData="extraChartData"
            :opts="resolvedExtraOpts"
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

  /** 窄屏（手机）图例改到底部，避免右侧挤占绘图区 */
  const PHONE_MAX_WIDTH = 600

  const props = withDefaults(
    defineProps<{
      title: string
      desc: string
      note: string
      type: string
      chartData: {
        categories?: unknown
        series: unknown[]
      }
      opts?: Record<string, unknown>
      extraNote?: string
      extraChartData?: {
        categories?: unknown
        series: unknown[]
      }
      extraOpts?: Record<string, unknown>
    }>(),
    { opts: () => ({}), extraNote: '图例表', extraOpts: () => ({}) },
  )

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

  const resolvedExtraOpts = computed(() => {
    const base = { ...(props.extraOpts || {}) }
    const legend = {
      ...((base.legend as Record<string, unknown>) || {}),
      position: legendAtBottom.value ? 'bottom' : 'right',
      float: 'center',
    }
    return { ...base, legend }
  })

  const canvasId = computed(() => `lychart-${props.type}`)
  const extraCanvasId = computed(() => `lychart-${props.type}-legend`)
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
