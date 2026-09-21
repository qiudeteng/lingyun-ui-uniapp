<template>
  <lingyun-app-page title="Image">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Image</lingyun-text>
        <lingyun-text type="subtitle" block>
          shape=形式 · size=尺寸 · radius=圆角幅度（仅 rounded）
        </lingyun-text>
      </view>

      <lingyun-section title="显示形式 shape（同 size=md）">
        <view class="row">
          <view class="cell">
            <lingyun-image :src="photoSquare" shape="square" size="md" />
            <lingyun-text type="caption" align="center" block>square</lingyun-text>
          </view>
          <view class="cell">
            <lingyun-image :src="photoSquare" shape="rounded" size="md" />
            <lingyun-text type="caption" align="center" block>rounded</lingyun-text>
          </view>
          <view class="cell">
            <lingyun-image :src="photoMountain" shape="circle" size="md" />
            <lingyun-text type="caption" align="center" block>circle</lingyun-text>
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="显示尺寸 size（同 shape=circle）">
        <view class="row row--baseline">
          <view class="cell">
            <lingyun-image :src="photoMountain" shape="circle" size="sm" />
            <lingyun-text type="caption" align="center" block>sm</lingyun-text>
          </view>
          <view class="cell">
            <lingyun-image :src="photoMountain" shape="circle" size="md" />
            <lingyun-text type="caption" align="center" block>md</lingyun-text>
          </view>
          <view class="cell">
            <lingyun-image :src="photoMountain" shape="circle" size="lg" />
            <lingyun-text type="caption" align="center" block>lg</lingyun-text>
          </view>
          <view class="cell">
            <lingyun-image :src="photoMountain" shape="circle" size="xl" />
            <lingyun-text type="caption" align="center" block>xl</lingyun-text>
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="圆角幅度 radius（仅 rounded · 同 size）">
        <view class="row">
          <view class="cell">
            <lingyun-image :src="photoSquare" shape="rounded" size="md" radius="none" />
            <lingyun-text type="caption" align="center" block>none</lingyun-text>
          </view>
          <view class="cell">
            <lingyun-image :src="photoSquare" shape="rounded" size="md" radius="sm" />
            <lingyun-text type="caption" align="center" block>sm</lingyun-text>
          </view>
          <view class="cell">
            <lingyun-image :src="photoSquare" shape="rounded" size="md" radius="lg" />
            <lingyun-text type="caption" align="center" block>lg</lingyun-text>
          </view>
          <view class="cell">
            <lingyun-image :src="photoSquare" shape="rounded" size="md" radius="xl" />
            <lingyun-text type="caption" align="center" block>xl</lingyun-text>
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="拉伸 mode">
        <view class="modes">
          <view v-for="item in modes" :key="item.mode" class="mode-card">
            <lingyun-image
              :src="photoWide"
              :width="140"
              :height="88"
              :mode="item.mode"
              shape="rounded"
              radius="lg"
            />
            <lingyun-text type="caption" block align="center">{{ item.label }}</lingyun-text>
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="懒加载 · 预览">
        <lingyun-image
          :src="photoBanner"
          width="100%"
          :height="180"
          shape="rounded"
          radius="lg"
          mode="cover"
          lazy
          preview
          :preview-urls="previewList"
        />
        <lingyun-text type="hint" block class="cap">width/height 自由尺寸 · picsum</lingyun-text>
      </lingyun-section>

      <lingyun-section title="加载失败占位" is-last>
        <view class="row">
          <lingyun-image
            src="https://invalid.lingyun.local/missing.png"
            :width="120"
            :height="80"
            shape="rounded"
          />
          <lingyun-image
            src="https://invalid.lingyun.local/missing.png"
            :error-src="photoSquare"
            :width="120"
            :height="80"
            shape="rounded"
          />
        </view>
        <lingyun-text type="caption" block class="cap">默认占位 · errorSrc 回退</lingyun-text>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  /**
   * Lorem Picsum：按 seed 固定同一张，免本地静态资源。
   * 微信小程序需配置 downloadFile 合法域名：picsum.photos
   */
  function picsum(seed: string, w: number, h: number): string {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
  }

  const photoSquare = picsum('lingyun-square', 400, 400)
  const photoMountain = picsum('lingyun-mountain', 400, 400)
  const photoWide = picsum('lingyun-wide', 800, 320)
  const photoBanner = picsum('lingyun-banner', 960, 540)

  const previewList = [photoBanner, photoMountain, photoSquare, photoWide]

  const modes = [
    { mode: 'cover', label: 'cover' },
    { mode: 'contain', label: 'contain' },
    { mode: 'fill', label: 'fill' },
    { mode: 'aspectFill', label: 'aspectFill' },
  ]
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 40px;
    min-height: 100%;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .hero {
    padding: 24px 20px 8px;
  }

  .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-start;
  }

  .row--baseline {
    align-items: flex-end;
  }

  .cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .modes {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
  }

  .mode-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 140px;
  }

  .cap {
    margin-top: 10px;
  }
</style>
