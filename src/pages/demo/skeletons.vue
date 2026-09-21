<template>
  <lingyun-app-page title="Skeleton">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Skeleton</text>
        <text class="hero__desc">lingyun-skeleton</text>
      </view>

      <lingyun-section title="List placeholder">
        <lingyun-skeleton :rows="3" avatar />
      </lingyun-section>

      <lingyun-section title="Plain rows" is-last>
        <lingyun-skeleton :rows="5" :title="false" />
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts"></script>

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
</style>
