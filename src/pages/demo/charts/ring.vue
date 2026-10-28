<template>
  <lingyun-app-page title="Ring">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Ring</text>
        <text class="hero__desc">lingyun-ui-charts · 圆环图</text>
      </view>

      <lingyun-section title="基本环形图" hint="ringWidth=60 · border=false">
        <view class="chart-box">
          <lingyun-ui-charts
            type="ring"
            :chartData="baseData"
            :opts="basicOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="分割线+渐变色" hint="linearType=custom">
        <view class="chart-box">
          <lingyun-ui-charts
            type="ring"
            :chartData="baseData"
            :opts="gradientOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="自定义标签内容" hint="labelText">
        <view class="chart-box">
          <lingyun-ui-charts
            type="ring"
            :chartData="labelData"
            :opts="widthOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="自定义标签隐藏" hint="labelShow=false">
        <view class="chart-box">
          <lingyun-ui-charts
            type="ring"
            :chartData="hiddenData"
            :opts="widthOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表 · 右侧单列" hint="18 项 · 宽屏右侧单列 / 窄屏自动落底 · 上下箭头">
        <view class="chart-box chart-box--paged">
          <lingyun-ui-charts
            type="ring"
            :chartData="pagedData"
            :opts="pagedRightOpts"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图例表 · 底部 5 行" hint="18 项 · 默认 5 行/页 · 上下箭头" is-last>
        <view class="chart-box chart-box--legend-bottom chart-box--paged-bottom">
          <lingyun-ui-charts
            type="ring"
            :chartData="pagedData"
            :opts="pagedBottomOpts"
          />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  const slices = [
    { name: '一班', value: 50 },
    { name: '二班', value: 30 },
    { name: '三班', value: 20 },
    { name: '四班', value: 18 },
    { name: '五班', value: 8 },
  ]

  const baseData = { series: [{ data: slices }] }

  const labelData = {
    series: [
      {
        data: slices.map((item, index) =>
          index === 3 ? { ...item, labelText: '四班:18人' } : { ...item },
        ),
      },
    ],
  }

  const hiddenData = {
    series: [
      {
        data: slices.map((item, index) => (index === 3 ? { ...item } : { ...item, labelShow: false })),
      },
    ],
  }

  const basicOpts = { extra: { ring: { ringWidth: 60, border: false } } }
  const gradientOpts = { extra: { ring: { ringWidth: 60, linearType: 'custom' } } }
  const widthOpts = { extra: { ring: { ringWidth: 60 } } }

  /** 18 个渠道，用来演示表格图例单列 / 底部分页 */
  const pagedSlices = Array.from({ length: 18 }, (_, index) => ({
    name: `渠道${String(index + 1).padStart(2, '0')}`,
    value: 128 - index * 4,
    count: 18 - index,
    rate: `${Math.max(2, 18 - index)}%`,
  }))
  const pagedData = { series: [{ data: pagedSlices }] }
  const pagedColumns = [
    { key: 'name', width: 88 },
    { key: 'value', width: 44, align: 'right' },
    { key: 'count', width: 32, align: 'right' },
    { key: 'rate', width: 44, align: 'right', color: '#86868b' },
  ]
  const pagedBaseOpts = {
    dataLabel: false,
    title: { name: '1,284' },
    subtitle: { name: '订单总数' },
    extra: { ring: { ringWidthRatio: 0.58 } },
    legend: {
      lineHeight: 22,
      fontSize: 12,
      columns: pagedColumns,
    },
  }
  const pagedRightOpts = {
    ...pagedBaseOpts,
    legend: { ...pagedBaseOpts.legend, position: 'right', float: 'center' },
  }
  const pagedBottomOpts = {
    ...pagedBaseOpts,
    legend: { ...pagedBaseOpts.legend, position: 'bottom', float: 'center' },
  }
</script>

<style lang="scss">
  @import './chart-demo-page.scss';

  /* 窄屏图表落底后，给绘图区更多高度，避免环图被图例压得太小 */
  @media (max-width: 689px) {
    .chart-box--paged {
      height: 420px;
    }

    .chart-box--paged-bottom {
      height: 460px;
    }
  }
</style>
