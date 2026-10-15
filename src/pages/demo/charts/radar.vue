<template>
  <lingyun-app-page title="Radar">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Radar</text>
        <text class="hero__desc">lingyun-ui-charts · 雷达图</text>
      </view>

      <lingyun-section title="多边形雷达图" hint="gridType=radar">
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="radar"
            canvasId="lychart-radar-polygon"
            :chartData="dualData"
            :opts="polygonOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="圆形雷达图" hint="gridType=circle">
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="radar"
            canvasId="lychart-radar-circle"
            :chartData="dualData"
            :opts="circleOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="刻度标签+网格抽稀" hint="axisLabel + gridEval">
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="radar"
            canvasId="lychart-radar-axis"
            :chartData="dualData"
            :opts="axisOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="渐变色雷达图" hint="linearType=custom · 顶点数值" is-last>
        <view class="chart-box" :class="{ 'chart-box--legend-bottom': legendAtBottom }">
          <lingyun-ui-charts
            type="radar"
            canvasId="lychart-radar-gradient"
            :chartData="gradientData"
            :opts="gradientOpts"
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

  /** 窄屏图例改到底部，避免右侧挤占维度标签 */
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

  const categories = ['维度1', '维度2', '维度3', '维度4', '维度5', '维度6']

  /** 成交量2 峰值 210，刻度按 max 与数据峰值的较大者均分 */
  const dualData = {
    categories,
    series: [
      { name: '成交量1', data: [90, 110, 165, 195, 187, 172] },
      { name: '成交量2', data: [190, 210, 105, 35, 27, 102] },
    ],
  }

  const gradientData = {
    categories,
    series: [{ name: '成交量1', data: [90, 110, 165, 195, 187, 172] }],
  }

  const legend = computed(() => ({
    show: true,
    position: legendAtBottom.value ? 'bottom' : 'right',
    float: 'center',
    lineHeight: 25,
  }))

  const polygonOpts = computed(() => ({
    dataLabel: false,
    legend: legend.value,
    extra: {
      radar: {
        gridType: 'radar',
        gridColor: '#CCCCCC',
        gridCount: 3,
        opacity: 0.2,
        max: 200,
        border: true,
        labelShow: true,
      },
    },
  }))

  const circleOpts = computed(() => ({
    dataLabel: false,
    legend: legend.value,
    extra: {
      radar: {
        gridType: 'circle',
        gridColor: '#CCCCCC',
        gridCount: 3,
        opacity: 0.2,
        max: 200,
        labelShow: true,
      },
    },
  }))

  const axisOpts = computed(() => ({
    dataLabel: false,
    dataPointShape: false,
    legend: legend.value,
    extra: {
      radar: {
        gridType: 'circle',
        gridColor: '#CCCCCC',
        gridCount: 3,
        opacity: 0.2,
        max: 200,
        labelShow: true,
        axisLabel: true,
        gridEval: 2,
        border: true,
      },
    },
  }))

  const gradientOpts = computed(() => ({
    dataLabel: true,
    dataPointShape: false,
    legend: legend.value,
    extra: {
      radar: {
        gridType: 'circle',
        gridColor: '#CCCCCC',
        gridCount: 3,
        opacity: 1,
        max: 240,
        border: false,
        labelShow: true,
        linearType: 'custom',
      },
    },
  }))
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
