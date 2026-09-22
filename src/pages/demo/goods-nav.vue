<template>
  <lingyun-app-page title="Goods Nav">
    <view class="page">
      <view class="hero">
        <text class="hero__title">商品导航</text>
        <text class="hero__desc">lingyun-goods-nav · 左侧图标入口 + 右侧胶囊按钮，对齐 uni-goods-nav 的结构</text>
      </view>

      <lingyun-section title="说明" is-last>
        <view class="note">
          <text class="note__text">底栏固定在页面底部。点店铺、购物车或右侧按钮会提示。购物车角标来自 info。</text>
        </view>
      </lingyun-section>
    </view>

    <lingyun-goods-nav
      :options="options"
      :button-group="buttons"
      @click="onOption"
      @button-click="onButton"
    />
  </lingyun-app-page>
</template>

<script setup lang="ts">
  const options = [
    { icon: 'shop', text: '店铺' },
    { icon: 'cart', text: '购物车', info: 2 },
  ]

  const buttons = [{ text: '加入购物车' }, { text: '立即购买' }]

  function toast(title: string): void {
    uni.showToast({ title, icon: 'none' })
  }

  function onOption(payload: { content?: { text?: string } }): void {
    toast(payload.content?.text || '入口')
  }

  function onButton(payload: { content?: { text?: string } }): void {
    toast(payload.content?.text || '按钮')
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 96px;
    min-height: 100%;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(0, 136, 255, 0.18), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(52, 199, 89, 0.14), transparent 50%),
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

  .note {
    padding: 4px 16px 12px;
  }

  .note__text {
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }
</style>
