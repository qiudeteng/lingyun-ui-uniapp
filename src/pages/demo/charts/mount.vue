<template>
  <lingyun-app-page title="Mount">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Mount</text>
        <text class="hero__desc">lingyun-ui-charts · 山峰图</text>
      </view>

      <lingyun-section title="圆角山峰图" hint="type=mount · widthRatio=1.5">
        <view class="chart-box">
          <lingyun-ui-charts
            type="mount"
            canvasId="lychart-mount-round"
            :chartData="mountData"
            :opts="roundOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="尖角山峰图" hint="type=sharp · widthRatio=1.5">
        <view class="chart-box">
          <lingyun-ui-charts
            type="mount"
            canvasId="lychart-mount-sharp"
            :chartData="mountData"
            :opts="sharpOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="三角山峰图" hint="type=triangle · widthRatio=1.5">
        <view class="chart-box">
          <lingyun-ui-charts
            type="mount"
            canvasId="lychart-mount-triangle"
            :chartData="mountData"
            :opts="triangleOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="直角山峰图" hint="type=bar · widthRatio=0.8">
        <view class="chart-box">
          <lingyun-ui-charts
            type="mount"
            canvasId="lychart-mount-bar"
            :chartData="mountData"
            :opts="barOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="正负山峰图无边渐变色" hint="borderWidth=0 · linearType=custom · Y 轴含负值">
        <view class="chart-box">
          <lingyun-ui-charts
            type="mount"
            canvasId="lychart-mount-signed"
            :chartData="signedData"
            :opts="signedOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="山峰图有边透明渐变+滚动条" hint="linearType=opacity · enableScroll">
        <view class="chart-box">
          <lingyun-ui-charts
            type="mount"
            canvasId="lychart-mount-scroll"
            :chartData="mountData"
            :opts="scrollOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="山峰图有边渐变+标记线" hint="linearType=custom · enableMarkLine">
        <view class="chart-box">
          <lingyun-ui-charts
            type="mount"
            canvasId="lychart-mount-mark"
            :chartData="mountData"
            :opts="markOpts"
            :canvas2d="true"
            :inScrollView="true"
            :ontouch="true"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="山峰图圆角渐变色柱状图" hint="type=bar · barBorderRadius · linearType=custom" is-last>
        <view class="chart-box">
          <lingyun-ui-charts
            type="mount"
            canvasId="lychart-mount-capsule"
            :chartData="mountData"
            :opts="capsuleOpts"
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
  /** 没有 categories。峰写在 series[0].data，引擎会拆成一条序列一个峰。 */
  const mountData = {
    series: [
      {
        data: [
          { name: '一班', value: 82 },
          { name: '二班', value: 63 },
          { name: '三班', value: 86 },
          { name: '四班', value: 65 },
          { name: '五班', value: 79 },
        ],
      },
    ],
  }

  const signedData = {
    series: [
      {
        data: [
          { name: '一班', value: 82 },
          { name: '二班', value: -63 },
          { name: '三班', value: 86 },
          { name: '四班', value: -75 },
          { name: '五班', value: 79 },
        ],
      },
    ],
  }

  const roundOpts = {
    extra: {
      mount: {
        type: 'mount',
        widthRatio: 1.5,
      },
    },
  }

  const sharpOpts = {
    extra: {
      mount: {
        type: 'sharp',
        widthRatio: 1.5,
      },
    },
  }

  const triangleOpts = {
    extra: {
      mount: {
        type: 'triangle',
        widthRatio: 1.5,
      },
    },
  }

  const barOpts = {
    extra: {
      mount: {
        type: 'bar',
        widthRatio: 0.8,
      },
    },
  }

  /** 默认 Y 轴 min 为 0，负值会被裁掉，这里把范围拉到 ±100 */
  const signedOpts = {
    yAxis: {
      splitNumber: 4,
      data: [{ min: -100, max: 100 }],
    },
    extra: {
      mount: {
        type: 'mount',
        widthRatio: 1.5,
        borderWidth: 0,
        linearType: 'custom',
      },
    },
  }

  const scrollOpts = {
    enableScroll: true,
    xAxis: {
      itemCount: 4,
      scrollShow: true,
    },
    extra: {
      mount: {
        type: 'sharp',
        widthRatio: 1.5,
        borderWidth: 2,
        linearType: 'opacity',
        linearOpacity: 0.1,
      },
    },
  }

  const markOpts = {
    padding: [15, 40, 0, 15],
    enableMarkLine: true,
    extra: {
      mount: {
        type: 'triangle',
        widthRatio: 1,
        borderWidth: 2,
        linearType: 'custom',
      },
      markLine: {
        type: 'solid',
        dashLength: 4,
        data: [
          {
            value: 45,
            lineColor: '#DE4A42',
            showLabel: true,
            labelAlign: 'right',
            labelOffsetX: 0,
            labelOffsetY: 0,
            labelText: '均值',
            labelFontColor: '#666666',
            labelBgColor: '#DFE8FF',
            labelBgOpacity: 0.8,
          },
        ],
      },
    },
  }

  const capsuleOpts = {
    extra: {
      mount: {
        type: 'bar',
        widthRatio: 0.3,
        borderWidth: 0,
        barBorderRadius: [50, 50, 50, 50],
        linearType: 'custom',
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
