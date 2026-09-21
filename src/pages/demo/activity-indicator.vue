<template>
  <lingyun-app-page title="Activity Indicator">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Activity Indicator</text>
        <text class="hero__desc">lingyun-activity-indicator</text>
      </view>

      <lingyun-section title="Sizes">
        <view class="row">
          <lingyun-activity-indicator size="small" />
          <lingyun-activity-indicator size="medium" />
          <lingyun-activity-indicator size="large" />
        </view>
      </lingyun-section>

      <lingyun-section title="Colors" hint="System 强调色">
        <view class="row">
          <lingyun-activity-indicator color="#34c759" />
          <lingyun-activity-indicator color="#ff383c" />
          <lingyun-activity-indicator color="#ff9500" />
        </view>
      </lingyun-section>

      <lingyun-section title="Control" :is-last="true">
        <view class="lingyun-section-stack">
          <view class="row">
            <lingyun-activity-indicator :animating="spinning" />
            <text class="hint">animating = {{ spinning }}</text>
          </view>
          <lingyun-button
            variant="borderedProminent"
            size="large"
            block
            :text="spinning ? '停止' : '开始'"
            @click="spinning = !spinning"
          />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const spinning = ref(true)
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

  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    padding: 8px 4px;
  }

  .hint {
    font-size: 14px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }
</style>
