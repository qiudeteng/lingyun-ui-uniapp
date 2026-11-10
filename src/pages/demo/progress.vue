<template>
  <lingyun-app-page title="Progress">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Progress</text>
        <text class="hero__desc">lingyun-progress · line / circle</text>
      </view>

      <lingyun-section title="Line" :hint="`${percent}%`">
        <view class="lingyun-section-stack">
          <lingyun-progress :percent="percent" show-info />
          <lingyun-button variant="borderedProminent" block text="+10%" @click="bump" />
        </view>
      </lingyun-section>

      <lingyun-section title="Circle" is-last>
        <view class="row">
          <lingyun-progress type="circle" :percent="percent" show-info />
          <lingyun-progress type="circle" :percent="percent" :size="56" :stroke-width="4" />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const percent = ref(35)

  function bump(): void {
    percent.value = percent.value >= 100 ? 0 : percent.value + 10
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

  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 24px;
    padding: 8px 4px;
  }
</style>
