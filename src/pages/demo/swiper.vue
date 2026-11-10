<template>
  <lingyun-app-page title="Swiper">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Swiper</lingyun-text>
        <lingyun-text type="subtitle" block>
          图片轮播 · 手势 / 自动播放 / 圆点 / 缩略图指示器
        </lingyun-text>
      </view>

      <lingyun-section title="基础轮播 · 自动播放">
        <lingyun-swiper
          v-model:current="current"
          :images="images"
          :interval="3200"
          :radius="16"
          autoplay
          circular
          indicator
          @change="onChange"
          @click="onClick"
        />
        <lingyun-text type="hint" block class="cap">
          当前第 {{ current + 1 }} / {{ images.length }} 张 · {{ lastAction }}
        </lingyun-text>
      </lingyun-section>

      <lingyun-section title="缩略图指示器" is-last>
        <lingyun-swiper
          v-model:current="thumbCurrent"
          :images="images"
          :radius="16"
          :ratio="0.75"
        />
        <view class="thumbs">
          <view
            v-for="(image, index) in images"
            :key="image"
            class="thumb"
            :class="{ 'thumb--active': index === thumbCurrent }"
            @click="thumbCurrent = index"
          >
            <image class="thumb-img" :src="image" mode="aspectFill" lazy-load />
          </view>
        </view>
        <lingyun-text type="hint" block class="cap">
          点击缩略图写回 current，轮播与缩略图双向同步
        </lingyun-text>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  function pic(seed: string): string {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/675`
  }

  const images = [
    pic('lingyun-swiper-cake'),
    pic('lingyun-swiper-berry'),
    pic('lingyun-swiper-choco'),
    pic('lingyun-swiper-mango'),
  ]
  const current = ref(0)
  const thumbCurrent = ref(0)
  const lastAction = ref('等待切换')

  function onChange(payload: { current?: number }): void {
    lastAction.value = `切换到第 ${Number(payload?.current ?? 0) + 1} 张`
  }

  function onClick(payload: { current?: number }): void {
    lastAction.value = `点击第 ${Number(payload?.current ?? 0) + 1} 张`
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 40px;
    min-height: 100%;
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .hero {
    padding: 24px 20px 8px;
  }

  .cap {
    margin-top: 8px;
  }

  .thumbs {
    display: flex;
    flex-direction: row;
    gap: 8px;
    margin-top: 12px;
  }

  .thumb {
    flex: 1 1 0;
    min-width: 0;
    height: 64px;
    overflow: hidden;
    border-radius: 10px;
    opacity: 0.56;
    transition: opacity 0.2s ease;
  }

  .thumb--active {
    opacity: 1;
    box-shadow:
      0 0 0 2px var(--lingyun-bg-grouped-secondary, #ffffff),
      0 0 0 4px var(--lingyun-primary, #0088ff);
  }

  .thumb-img {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
