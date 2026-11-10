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
</style>
