<template>
  <lingyun-app-page title="Arcbar">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Arcbar</text>
        <text class="hero__desc">lingyun-ui-charts · 圆弧进度</text>
      </view>

      <lingyun-section title="圆弧进度条 + 渐变色">
        <view class="chart-box">
          <lingyun-ui-charts
            type="arcbar"
            canvasId="lychart-arcbar-gradient"
            :chartData="singleData"
            :opts="gradientOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="多重整圆进度条">
        <view class="chart-box">
          <lingyun-ui-charts
            type="arcbar"
            canvasId="lychart-arcbar-multi"
            :chartData="multiData"
            :opts="multiCircleOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="逆时针 + 圆弧进度条">
        <view class="chart-box">
          <lingyun-ui-charts
            type="arcbar"
            canvasId="lychart-arcbar-ccw"
            :chartData="singleData"
            :opts="ccwArcOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="逆时针 + 多重整圆进度条">
        <view class="chart-box">
          <lingyun-ui-charts
            type="arcbar"
            canvasId="lychart-arcbar-multi-ccw"
            :chartData="multiData"
            :opts="multiCcwOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="圆角整圆进度条">
        <view class="chart-box">
          <lingyun-ui-charts
            type="arcbar"
            canvasId="lychart-arcbar-round"
            :chartData="singleData"
            :opts="roundCircleOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="平角整圆进度条" is-last>
        <view class="chart-box">
          <lingyun-ui-charts
            type="arcbar"
            canvasId="lychart-arcbar-butt"
            :chartData="singleData"
            :opts="buttCircleOpts"
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
  /** series.data 为 0–1 比例；多环时每层一条 series */
  const singleData = {
    series: [{ name: '正确率', data: 0.8, color: '#34c759' }],
  }

  const multiData = {
    series: [
      { name: '一班', data: 0.8 },
      { name: '二班', data: 0.65 },
      { name: '三班', data: 0.5 },
      { name: '四班', data: 0.35 },
    ],
  }

  const gradientOpts = {
    title: { name: '80%', color: '#34c759', fontSize: 25 },
    subtitle: { name: '正确率', color: '#666666', fontSize: 15 },
    extra: {
      arcbar: {
        type: 'default',
        width: 12,
        startAngle: 0.75,
        endAngle: 0.25,
        direction: 'cw',
        lineCap: 'round',
        backgroundColor: '#E9E9E9',
        linearType: 'custom',
        customColor: ['#00c0e8'],
      },
    },
  }

  const multiCircleOpts = {
    title: { name: '指标', color: '#0088ff', fontSize: 25 },
    subtitle: { name: '默认标题', color: '#666666', fontSize: 15 },
    extra: {
      arcbar: {
        type: 'circle',
        width: 12,
        gap: 4,
        startAngle: 1.5,
        direction: 'cw',
        lineCap: 'round',
        backgroundColor: '#E9E9E9',
      },
    },
  }

  /** 逆时针半圆弧：起止角与顺时针对调，否则会画成底部短弧 */
  const ccwArcOpts = {
    title: { name: '80%', color: '#34c759', fontSize: 25 },
    subtitle: { name: '正确率', color: '#666666', fontSize: 15 },
    extra: {
      arcbar: {
        type: 'default',
        width: 12,
        startAngle: 0.25,
        endAngle: 0.75,
        direction: 'ccw',
        lineCap: 'round',
        backgroundColor: '#E9E9E9',
        linearType: 'custom',
        customColor: ['#00c0e8'],
      },
    },
  }

  const multiCcwOpts = {
    title: { name: '指标', color: '#0088ff', fontSize: 25 },
    subtitle: { name: '默认标题', color: '#666666', fontSize: 15 },
    extra: {
      arcbar: {
        type: 'circle',
        width: 12,
        gap: 4,
        startAngle: 1.5,
        direction: 'ccw',
        lineCap: 'round',
        backgroundColor: '#E9E9E9',
      },
    },
  }

  const roundCircleOpts = {
    title: { name: '80%', color: '#34c759', fontSize: 25 },
    subtitle: { name: '正确率', color: '#666666', fontSize: 15 },
    extra: {
      arcbar: {
        type: 'circle',
        width: 12,
        startAngle: 1.5,
        direction: 'cw',
        lineCap: 'round',
        backgroundColor: '#E9E9E9',
      },
    },
  }

  const buttCircleOpts = {
    title: { name: '80%', color: '#34c759', fontSize: 25 },
    subtitle: { name: '正确率', color: '#666666', fontSize: 15 },
    extra: {
      arcbar: {
        type: 'circle',
        width: 12,
        startAngle: 1.5,
        direction: 'cw',
        lineCap: 'butt',
        backgroundColor: '#E9E9E9',
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
