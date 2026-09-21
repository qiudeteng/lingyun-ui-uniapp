<template>
  <lingyun-app-page title="Segmented Controls">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Segmented Controls</text>
        <text class="hero__desc">lingyun-segmented-control · Apple iOS 27 UI Kit</text>
      </view>

      <lingyun-section title="Large（默认 · 48）">
        <lingyun-segmented-control v-model="large" :items="itemsFive" />
        <text class="status">当前：{{ large }}</text>
      </lingyun-section>

      <lingyun-section title="Small（32）">
        <lingyun-segmented-control v-model="small" size="small" :items="itemsThree" />
        <text class="status">当前：{{ small }}</text>
      </lingyun-section>

      <lingyun-section title="String items">
        <lingyun-segmented-control v-model="period" :items="periods" />
        <text class="status">当前：{{ period }}</text>
      </lingyun-section>

      <lingyun-section title="Disabled segment">
        <lingyun-segmented-control v-model="partial" :items="itemsPartial" />
      </lingyun-section>

      <lingyun-section title="Disabled control" is-last>
        <lingyun-segmented-control v-model="large" :items="itemsFive" disabled />
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const itemsFive = [
    { key: '1', text: 'Item 1' },
    { key: '2', text: 'Item 2' },
    { key: '3', text: 'Item 3' },
    { key: '4', text: 'Item 4' },
    { key: '5', text: 'Item 5' },
  ]

  const itemsThree = [
    { key: 'list', text: 'List' },
    { key: 'grid', text: 'Grid' },
    { key: 'map', text: 'Map' },
  ]

  const itemsPartial = [
    { key: 'on', text: 'On' },
    { key: 'off', text: 'Off', disabled: true },
    { key: 'auto', text: 'Auto' },
  ]

  const periods = ['Day', 'Week', 'Month', 'Year']

  const large = ref('1')
  const small = ref('list')
  const period = ref('Week')
  const partial = ref('on')
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

  .status {
    display: block;
    margin-top: 10px;
    font-size: 12px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }
</style>
