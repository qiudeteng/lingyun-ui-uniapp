<template>
  <lingyun-app-page title="Line">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Line</text>
        <text class="hero__desc">lingyun-ui-charts · 折线图</text>
      </view>

      <lingyun-section title="基本折线图" hint="type=straight">
        <view class="chart-box">
          <lingyun-ui-charts
            type="line"
            :chartData="baseData"
            :opts="basicOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="基本曲线图" hint="type=curve · 首条虚线">
        <view class="chart-box">
          <lingyun-ui-charts
            type="line"
            :chartData="curveData"
            :opts="curveOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="基本时序图" hint="type=step">
        <view class="chart-box">
          <lingyun-ui-charts
            type="line"
            :chartData="baseData"
            :opts="stepOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="折线图 + 断点续连" hint="null 断开 · connectNulls">
        <view class="chart-box">
          <lingyun-ui-charts
            type="line"
            :chartData="nullsData"
            :opts="basicOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="渐变色曲线图" hint="linearType=custom">
        <view class="chart-box">
          <lingyun-ui-charts
            type="line"
            :chartData="gradientData"
            :opts="gradientOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="渐变色 + 阴影 + 水平动画" hint="onShadow · animation=horizontal">
        <view class="chart-box">
          <lingyun-ui-charts
            type="line"
            :chartData="shadowData"
            :opts="shadowOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="折线图滚动条" hint="enableScroll · itemCount=4">
        <view class="chart-box">
          <lingyun-ui-charts
            type="line"
            :chartData="baseData"
            :opts="scrollOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="时间轴折线图" hint="type=tline · 坐标 [x, y]" is-last>
        <view class="chart-box">
          <lingyun-ui-charts
            type="tline"
            :chartData="timeData"
            :opts="timeOpts"
          />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  const years = ['2018', '2019', '2020', '2021', '2022', '2023']

  const baseData = {
    categories: years,
    series: [
      { name: '成交量A', data: [35, 8, 25, 37, 4, 20] },
      { name: '成交量B', data: [70, 40, 65, 100, 44, 68] },
      { name: '成交量C', data: [100, 80, 95, 150, 112, 132] },
    ],
  }

  const curveData = {
    categories: years,
    series: [
      { name: '成交量A', lineType: 'dash', data: [35, 8, 25, 37, 4, 20] },
      { name: '成交量B', data: [70, 40, 65, 100, 44, 68] },
      { name: '成交量C', data: [100, 80, 95, 150, 112, 132] },
    ],
  }

  /** 2020 为 null：A、C 断开，B 用 connectNulls 把断点连上 */
  const nullsData = {
    categories: years,
    series: [
      { name: '成交量A', data: [35, 8, null, 37, 4, 20] },
      { name: '成交量B', connectNulls: true, data: [70, 40, null, 100, 44, 68] },
      { name: '成交量C', data: [100, 80, null, 150, 112, 132] },
    ],
  }

  const gradientData = {
    categories: years,
    series: [
      {
        name: '成交量A',
        linearColor: [
          [0, '#1890FF'],
          [0.25, '#00B5FF'],
          [0.5, '#00D1ED'],
          [0.75, '#00E6BB'],
          [1, '#90F489'],
        ],
        data: [15, 45, 15, 45, 15, 45],
      },
      {
        name: '成交量B',
        linearColor: [
          [0, '#91CB74'],
          [0.25, '#2BDCA8'],
          [0.5, '#2AE3A0'],
          [0.75, '#C4D06E'],
          [1, '#F2D375'],
        ],
        data: [55, 85, 55, 85, 55, 85],
      },
      {
        name: '成交量C',
        linearColor: [
          [0, '#FAC858'],
          [0.33, '#FFC371'],
          [0.66, '#FFC2B2'],
          [1, '#FA7D8D'],
        ],
        data: [95, 125, 95, 125, 95, 125],
      },
    ],
  }

  const shadowData = {
    categories: years,
    series: [
      {
        name: '成交量A',
        linearColor: [
          [0, '#1890FF'],
          [0.25, '#00B5FF'],
          [0.5, '#00D1ED'],
          [0.75, '#00E6BB'],
          [1, '#90F489'],
        ],
        setShadow: [3, 8, 10, '#1890FF'],
        data: [15, 45, 15, 45, 15, 45],
      },
      { name: '成交量B', data: [55, 85, 55, 85, 55, 85] },
      {
        name: '成交量C',
        linearColor: [
          [0, '#FAC858'],
          [0.33, '#FFC371'],
          [0.66, '#FFC2B2'],
          [1, '#FA7D8D'],
        ],
        setShadow: [3, 8, 10, '#FC8452'],
        data: [95, 125, 95, 125, 95, 125],
      },
    ],
  }

  /** 矢量坐标，不是类目轴。Y 轴默认 0–80 */
  const timeData = {
    series: [
      { name: '竖线', data: [[30, 0], [30, 80]] },
      { name: '横线', data: [[0, 40], [60, 40]] },
      { name: '曲线1', data: [[60, 70], [30, 40], [60, 10]] },
      { name: '曲线2', data: [[0, 70], [30, 40], [0, 10]] },
    ],
  }

  const basicOpts = {}

  const curveOpts = {
    extra: {
      line: { type: 'curve' },
    },
  }

  const stepOpts = {
    extra: {
      line: { type: 'step' },
    },
  }

  const gradientOpts = {
    dataLabel: false,
    dataPointShape: false,
    yAxis: { data: [{ min: 0, max: 150 }] },
    extra: {
      line: { type: 'curve', linearType: 'custom' },
    },
  }

  const shadowOpts = {
    dataLabel: false,
    dataPointShape: false,
    yAxis: { data: [{ min: 0, max: 150 }] },
    extra: {
      line: {
        type: 'curve',
        linearType: 'custom',
        onShadow: true,
        animation: 'horizontal',
      },
    },
  }

  const scrollOpts = {
    enableScroll: true,
    xAxis: {
      scrollShow: true,
      itemCount: 4,
      disableGrid: true,
    },
  }

  const timeOpts = {}
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
