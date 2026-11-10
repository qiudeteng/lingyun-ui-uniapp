<template>
  <lingyun-app-page title="Page Control">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Page Control</text>
        <text class="hero__desc">current = {{ i }}</text>
      </view>

      <lingyun-section title="Dots" is-last>
        <swiper class="banner" :current="i" @change="onSwipe">
          <swiper-item v-for="n in 4" :key="n">
            <view class="banner__slide">
              <text class="banner__text">Slide {{ n }}</text>
            </view>
          </swiper-item>
        </swiper>
        <lingyun-page-control v-model="i" :count="4" />
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const i = ref(0)
  function onSwipe(e: { detail?: { current?: number } }): void {
    i.value = Number(e && e.detail && e.detail.current) || 0
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

  .banner {
    height: 140px;
    border-radius: 12px;
    overflow: hidden;
  }

  .banner__slide {
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 136, 255, 0.12);
  }

  .banner__text {
    font-size: 18px;
    font-weight: 600;
    color: var(--lingyun-label, #1c1c1e);
  }
</style>
