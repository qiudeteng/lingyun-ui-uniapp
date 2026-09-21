<template>
  <lingyun-app-page title="Search Bar" :body-scroll="false">
    <view class="page">
      <scroll-view
        class="page__scroll"
        scroll-y
        :show-scrollbar="false"
        :upper-threshold="2"
        @scroll="onInnerScroll"
        @scrolltoupper="onInnerScrollUpper"
      >
        <view class="hero">
          <text class="hero__title">Search Bar</text>
          <text class="hero__desc">lingyun-search-bar · Apple iOS 27 UI Kit</text>
        </view>

        <lingyun-section
          title="Placeholder → Focus"
          :hint="`当前：${query || '（空）'} · ${focused ? 'Focus（取消钮展开）' : 'Placeholder'}`"
          is-last
        >
          <text class="note">点底部搜索条聚焦：字段收窄、取消钮滑入；取消或失焦收回</text>
        </lingyun-section>

        <view class="spacer" />
      </scroll-view>

      <lingyun-search-bar
        v-model="query"
        placeholder="Search"
        @confirm="onConfirm"
        @mic="onMic"
        @cancel="onCancel"
        @focus="focused = true"
        @blur="focused = false"
      />
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useLingyunAppPageScroll } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

  const reportScroll = useLingyunAppPageScroll()
  const query = ref('')
  const focused = ref(false)

  function onInnerScroll(e: { detail?: { scrollTop?: number } }): void {
    reportScroll(Number(e?.detail?.scrollTop) || 0)
  }

  function onInnerScrollUpper(): void {
    reportScroll(0)
  }

  function onConfirm(value: string): void {
    uni.showToast({ title: value || 'Search', icon: 'none' })
  }

  function onMic(): void {
    uni.showToast({ title: '麦克风', icon: 'none' })
  }

  function onCancel(): void {
    focused.value = false
    uni.showToast({ title: '取消', icon: 'none' })
  }
</script>

<style lang="scss">
  .page {
    flex: 1;
    min-height: 0;
    position: relative;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .page__scroll {
    height: 100%;
    box-sizing: border-box;
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

  .note {
    display: block;
    font-size: 12px;
    line-height: 16px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .spacer {
    height: 140px;
  }
</style>
