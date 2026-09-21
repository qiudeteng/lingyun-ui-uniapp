<template>
  <lingyun-app-page title="Slider">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Slider</text>
        <text class="hero__desc">37×24 胶囊拇指 · 轨道 6 · 刻度 5 · value = {{ n }}</text>
      </view>

      <lingyun-section title="Default" :hint="`value = ${n}`">
        <view class="stack">
          <lingyun-slider v-model="n" :min="0" :max="100" />
        </view>
      </lingyun-section>

      <lingyun-section title="Glyphs" hint="两端符号 · 与列表行同一套">
        <view class="stack">
          <lingyun-slider v-model="n" :min="0" :max="100" min-glyph="☼" max-glyph="☀" />
        </view>
      </lingyun-section>

      <lingyun-section title="Disabled" hint="进度仍蓝 · 滑块灰" is-last>
        <view class="stack">
          <lingyun-slider v-model="n" :min="0" :max="100" disabled />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const n = ref(42)
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

  .stack {
    padding: 8px 0 16px;
  }
</style>
