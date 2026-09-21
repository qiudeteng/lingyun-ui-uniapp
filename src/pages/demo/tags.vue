<template>
  <lingyun-app-page title="Tags & Chips">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Tags & Chips</text>
        <text class="hero__desc">lingyun-tag · lingyun-chip</text>
      </view>

      <lingyun-section title="Tags">
        <view class="row">
          <lingyun-tag text="Blue" color="blue" />
          <lingyun-tag text="Green" color="green" />
          <lingyun-tag text="Orange" color="orange" />
          <lingyun-tag text="Red" color="red" />
          <lingyun-tag text="Outline" variant="outline" />
        </view>
      </lingyun-section>

      <lingyun-section title="Chips" is-last>
        <view class="row">
          <lingyun-chip v-model="a" text="All" />
          <lingyun-chip v-model="b" text="Photos" />
          <lingyun-chip v-model="c" text="Docs" />
          <lingyun-chip text="Locked" disabled />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const a = ref(true)
  const b = ref(false)
  const c = ref(false)
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
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 0;
  }
</style>
