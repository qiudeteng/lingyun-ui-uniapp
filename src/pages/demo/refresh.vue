<template>
  <lingyun-app-page title="Refresh" :body-scroll="false">
    <view class="page refresh-page">
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
  /* 结构样式放独立类：避免 .page 的 flex / height 在 H5 里泄漏到其它页面 */
  .refresh-page {
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
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
