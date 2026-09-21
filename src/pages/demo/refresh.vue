<template>
  <lingyun-app-page title="Refresh" :body-scroll="false">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Refresh</text>
        <text class="hero__desc">下拉刷新 · count = {{ count }}</text>
      </view>

      <lingyun-refresh
        class="scroller"
        v-model:refreshing="busy"
        height="420px"
        @refresh="onRefresh"
      >
        <view class="list">
          <view v-for="n in count" :key="n" class="list__item">
            <text>Item {{ n }}</text>
          </view>
        </view>
      </lingyun-refresh>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const busy = ref(false)
  const count = ref(8)

  function onRefresh(): void {
    setTimeout(() => {
      count.value += 1
      busy.value = false
    }, 900)
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .hero {
    padding: 24px 20px 8px;
    flex-shrink: 0;
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

  .scroller {
    flex: 1;
    min-height: 0;
  }

  .list {
    padding: 8px 16px 40px;
  }

  .list__item {
    padding: 14px 16px;
    margin-bottom: 8px;
    border-radius: 12px;
    background: var(--lingyun-bg-grouped-secondary, #ffffff);
    color: var(--lingyun-label, #1c1c1e);
    font-size: 15px;
  }
</style>
