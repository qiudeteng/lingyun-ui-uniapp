<template>
  <lingyun-app-page title="Stack">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Stack</text>
        <text class="hero__desc">lingyun-ui-charts · 堆积图（柱状 / 折线 / 曲线）</text>
      </view>

      <lingyun-section title="堆积柱状图">
        <view class="chart-box">
          <lingyun-ui-charts
            type="stack"
            canvasId="lychart-stack-column"
            :chartData="stackData"
            :opts="columnOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="堆积折线">
        <view class="chart-box">
          <lingyun-ui-charts
            type="line"
            canvasId="lychart-stack-line"
            :chartData="stackData"
            :opts="lineOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="堆积曲线" is-last>
        <view class="chart-box">
          <lingyun-ui-charts
            type="curve"
            canvasId="lychart-stack-curve"
            :chartData="stackData"
            :opts="curveOpts"
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
  import { chartSamples } from './samples'

  /** 与折线 / 曲线同款原始分层数据；开启 stack 后由引擎堆积算法累加 */
  const stackData = chartSamples.stack
  const columnOpts = {}

  const lineOpts = {
    extra: {
      line: {
        stack: true,
        type: 'straight',
        width: 2,
        activeType: 'hollow',
      },
    },
  }

  const curveOpts = {
    extra: {
      line: {
        stack: true,
      },
    },
  }
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
</style>
