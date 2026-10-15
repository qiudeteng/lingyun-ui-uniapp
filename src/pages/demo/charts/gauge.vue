<template>
  <lingyun-app-page title="Gauge">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Gauge</text>
        <text class="hero__desc">lingyun-ui-charts · 仪表盘</text>
      </view>

      <lingyun-section title="基础仪表盘" hint="type=default · series.data 为 0–1">
        <view class="chart-box">
          <lingyun-ui-charts
            type="gauge"
            canvasId="lychart-gauge-default"
            :chartData="defaultData"
            :opts="defaultOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="其他仪表盘" hint="type=progress · 刻度随进度变色" is-last>
        <view class="chart-box">
          <lingyun-ui-charts
            type="gauge"
            canvasId="lychart-gauge-progress"
            :chartData="progressData"
            :opts="progressOpts"
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
  /** series.data 为 0–1。categories 只给 default 样式分段上色；progress 主要看 series。 */
  const defaultData = {
    categories: [{ value: 0.2 }, { value: 0.8 }],
    series: [{ name: '完成率', data: 0.8 }],
  }

  const progressData = {
    categories: [{ value: 0.2 }, { value: 0.8 }],
    series: [{ name: '实时速度', data: 0.66, color: '#1890ff' }],
  }

  const defaultOpts = {
    title: { name: '80%', color: '#2fc25b', fontSize: 25 },
    subtitle: { name: '完成率', color: '#666666', fontSize: 15 },
    extra: {
      gauge: {
        type: 'default',
        width: 30,
        labelColor: '#666666',
        startAngle: 0.75,
        endAngle: 0.25,
        startNumber: 0,
        endNumber: 100,
        splitLine: {
          fixRadius: 0,
          splitNumber: 10,
          width: 30,
          color: '#FFFFFF',
          childNumber: 5,
          childWidth: 12,
        },
        pointer: {
          width: 24,
          color: 'auto',
        },
      },
    },
  }

  const progressOpts = {
    title: { name: '66Km/H', color: '#2fc25b', fontSize: 25 },
    subtitle: { name: '实时速度', color: '#1890ff', fontSize: 15 },
    extra: {
      gauge: {
        type: 'progress',
        width: 20,
        labelColor: '#666666',
        startAngle: 0.75,
        endAngle: 0.25,
        startNumber: 0,
        endNumber: 100,
        splitLine: {
          fixRadius: 0,
          splitNumber: 10,
          width: 20,
          color: '#FFFFFF',
          childNumber: 5,
          childWidth: 12,
        },
        pointer: {
          width: 24,
          color: 'auto',
        },
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
