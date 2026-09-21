<template>
  <lingyun-app-page title="Tab Bars">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Tab Bars</text>
        <text class="hero__desc">lingyun-tabbars · Apple iOS 27 UI Kit</text>
      </view>

      <lingyun-section title="无分组 · 5" :hint="`当前：${currentDefault}`" />

      <lingyun-section title="无分组 · 4" :hint="`当前：${currentPlainFour}`" />

      <lingyun-section title="4 + 1" :hint="`当前：${currentFour}`" />

      <lingyun-section title="3 + 1" :hint="`当前：${currentThree}`" />

      <lingyun-section title="2 + 1" :hint="`当前：${currentTwo}`" />

      <lingyun-section title="1 + 1" :hint="`当前：${currentOne}`" is-last />

      <view class="spacer" />

      <!-- 演示用：页面内嵌三组，实际业务一般只用一组 fixed -->
      <view class="stage stage--a">
        <lingyun-tabbars
          v-model="currentDefault"
          :fixed="false"
          :safe-area="false"
          :items="itemsDefault"
        />
      </view>

      <view class="stage stage--plain4">
        <lingyun-tabbars
          v-model="currentPlainFour"
          :fixed="false"
          :safe-area="false"
          :items="itemsPlainFour"
        />
      </view>

      <view class="stage stage--b">
        <lingyun-tabbars
          v-model="currentFour"
          :fixed="false"
          :safe-area="false"
          :items="itemsFourPlusOne"
        />
      </view>

      <view class="stage stage--c">
        <lingyun-tabbars
          v-model="currentThree"
          :fixed="false"
          :safe-area="false"
          :items="itemsThreePlusOne"
        />
      </view>

      <view class="stage stage--d">
        <lingyun-tabbars
          v-model="currentTwo"
          :fixed="false"
          :safe-area="false"
          :items="itemsTwoPlusOne"
        />
      </view>

      <view class="stage stage--e">
        <lingyun-tabbars
          v-model="currentOne"
          :fixed="false"
          :safe-area="true"
          :items="itemsOnePlusOne"
        />
      </view>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const itemsDefault = [
    { key: 'home', text: 'Home', icon: '⌂' },
    { key: 'listen', text: 'Listen', icon: '♪' },
    { key: 'browse', text: 'Browse', icon: '◇', badge: 3 },
    { key: 'radio', text: 'Radio', icon: '◉', badge: { text: 12, color: 'orange' } },
    { key: 'library', text: 'Library', icon: '▤', badge: { color: 'green', dot: true } },
  ]

  const itemsFourPlusOne = [
    { key: 'home', text: 'Home', icon: '⌂' },
    { key: 'listen', text: 'Listen', icon: '♪' },
    { key: 'browse', text: 'Browse', icon: '◇' },
    { key: 'radio', text: 'Radio', icon: '◉' },
    { key: 'search', role: 'search' as const },
  ]

  const itemsThreePlusOne = [
    { key: 'home', text: 'Home', icon: '⌂' },
    { key: 'listen', text: 'Listen', icon: '♪' },
    { key: 'browse', text: 'Browse', icon: '◇' },
    { key: 'search', role: 'search' as const },
  ]

  const itemsTwoPlusOne = [
    { key: 'home', text: 'Home', icon: '⌂' },
    { key: 'browse', text: 'Browse', icon: '◇' },
    { key: 'search', role: 'search' as const },
  ]

  const itemsOnePlusOne = [
    { key: 'home', text: 'Home', icon: '⌂' },
    { key: 'search', role: 'search' as const },
  ]

  const itemsPlainFour = [
    { key: 'home', text: 'Home', icon: '⌂' },
    { key: 'listen', text: 'Listen', icon: '♪' },
    { key: 'browse', text: 'Browse', icon: '◇' },
    { key: 'radio', text: 'Radio', icon: '◉' },
  ]

  const currentDefault = ref('home')
  const currentPlainFour = ref('home')
  const currentFour = ref('home')
  const currentThree = ref('home')
  const currentTwo = ref('home')
  const currentOne = ref('home')
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    min-height: 100%;
    position: relative;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .hero {
    padding: 24px 20px 4px;
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

  .spacer {
    height: 670px;
  }

  .stage {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 20;
    pointer-events: none;
  }

  /* 只让胶囊和搜索可点，空白处继续滚页面 */

  .stage--a {
    bottom: 550px;
  }

  .stage--plain4 {
    bottom: 440px;
  }

  .stage--b {
    bottom: 330px;
  }

  .stage--c {
    bottom: 220px;
  }

  .stage--d {
    bottom: 110px;
  }

  .stage--e {
    bottom: 0;
  }
</style>
