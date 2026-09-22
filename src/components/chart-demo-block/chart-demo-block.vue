<template>
  <lingyun-app-page :title="title">
    <view class="page">
      <view class="hero">
        <text class="hero__title">{{ title }}</text>
        <text class="hero__desc">{{ desc }}</text>
      </view>
      <lingyun-section :title="note" is-last>
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
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

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
    }>(),
    { opts: () => ({}) },
  )

  const canvasId = computed(() => `lychart-${props.type}`)
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
