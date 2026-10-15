<template>
  <lingyun-app-page title="Word">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Word</text>
        <text class="hero__desc">lingyun-ui-charts · 词云图</text>
      </view>

      <lingyun-section title="词云图水平排列" hint="type=normal">
        <view class="chart-box">
          <lingyun-ui-charts
            type="word"
            canvasId="lychart-word-normal"
            :chartData="wordData"
            :opts="normalOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="词云图水平垂直混排" hint="type=vertical" is-last>
        <view class="chart-box">
          <lingyun-ui-charts
            type="word"
            canvasId="lychart-word-vertical"
            :chartData="wordData"
            :opts="verticalOpts"
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
  const wordData = {
    series: [
      { name: '凌云UI', textSize: 25 },
      { name: '微信小程序', textSize: 20 },
      { name: '支付宝小程序', textSize: 20 },
      { name: '百度小程序', textSize: 20 },
      { name: 'QQ小程序', textSize: 20 },
      { name: '头条小程序', textSize: 20 },
      { name: '抖音小程序', textSize: 20 },
      { name: '快手小程序', textSize: 20 },
      { name: 'Liquid Glass', textSize: 10 },
      { name: '图表', textSize: 12 },
      { name: '门店', textSize: 10 },
      { name: '订单', textSize: 12 },
      { name: '库存', textSize: 10 },
      { name: '会员', textSize: 12 },
      { name: '报表', textSize: 10 },
      { name: '登录', textSize: 12 },
    ],
  }

  const normalOpts = {
    legend: { show: false },
    extra: { word: { type: 'normal', autoColors: false } },
  }

  const verticalOpts = {
    legend: { show: false },
    extra: { word: { type: 'vertical', autoColors: false } },
  }
</script>

<style lang="scss">
  @import './chart-demo-page.scss';
</style>
