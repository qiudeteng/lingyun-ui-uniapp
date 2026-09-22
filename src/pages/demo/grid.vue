<template>
  <lingyun-app-page title="Grid">
    <view class="page">
      <view class="hero">
        <text class="hero__title">宫格</text>
        <text class="hero__desc">lingyun-grid · 列数、方形和点击对齐 uni-grid，卡片走分组材质</text>
      </view>

      <view class="block">
        <text class="block__title">四列</text>
        <lingyun-grid :column="4" @change="onChange">
          <lingyun-grid-item
            v-for="(item, index) in shortcuts"
            :key="item.text"
            :index="index"
            :icon="item.icon"
            :text="item.text"
            :color="item.color"
            :info="item.info"
          />
        </lingyun-grid>
      </view>

      <view class="block">
        <text class="block__title">三列 · 分割线</text>
        <lingyun-grid :column="3" show-border @change="onChange">
          <lingyun-grid-item
            v-for="(item, index) in bordered"
            :key="item.text"
            :index="index"
            :icon="item.icon"
            :text="item.text"
          />
        </lingyun-grid>
      </view>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  const shortcuts: Array<{ icon: string; text: string; color: string; info?: number | boolean }> = [
    { icon: 'shop', text: '店铺', color: '#0088ff' },
    { icon: 'cart', text: '购物车', color: '#34c759', info: 2 },
    { icon: 'gift', text: '优惠', color: '#ff8d28' },
    { icon: 'wallet', text: '钱包', color: '#ff383c' },
    { icon: 'staff', text: '会员', color: '#cb30e0', info: true },
    { icon: 'location', text: '地址', color: '#00c8b3' },
    { icon: 'chat', text: '客服', color: '#00c0e8' },
    { icon: 'gear', text: '设置', color: '#8e8e93' },
  ]

  const bordered = [
    { icon: 'image', text: '相册' },
    { icon: 'camera', text: '拍照' },
    { icon: 'paperplane', text: '分享' },
    { icon: 'heart', text: '收藏' },
    { icon: 'star', text: '评价' },
  ]

  function onChange(event: { detail?: { index?: number } }): void {
    const index = event.detail?.index
    uni.showToast({ title: `第 ${index == null ? '-' : index + 1} 项`, icon: 'none' })
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

  .block {
    padding: 12px 16px 0;
  }

  .block__title {
    display: block;
    margin-bottom: 8px;
    padding-left: 4px;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }
</style>
