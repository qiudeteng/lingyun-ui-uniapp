<template>
  <lingyun-app-page title="底部工具栏">
    <view class="page">
      <view class="hero">
        <text class="hero__title">底部工具栏</text>
        <text class="hero__desc">
          lingyun-bottom-toolbar 只提供和购物车底栏一样的玻璃胶囊定位。按钮和排版写在插槽里。
        </text>
      </view>

      <lingyun-section title="说明">
        <view class="note">
          <text class="note__text">
            左右留 12，底边 8 再加安全区，圆角 31。宽屏会让开左侧导航。下面这段是页面自己的布局，不是组件内置的。
          </text>
        </view>
      </lingyun-section>

      <lingyun-section v-for="item in blocks" :key="item" :title="item" :is-last="item === blocks[blocks.length - 1]">
        <view class="note">
          <text class="note__text">内容从玻璃下面穿过去。栏的高度跟着插槽走。</text>
        </view>
      </lingyun-section>
    </view>

    <lingyun-bottom-toolbar>
      <view class="bar">
        <view class="bar__meta">
          <text class="bar__title">合计</text>
          <text class="bar__price">¥128.00</text>
        </view>
        <lingyun-button variant="bordered" size="medium" text="暂存" @click="toast('暂存')" />
        <lingyun-button variant="filled" size="medium" text="提交" @click="toast('提交')" />
      </view>
    </lingyun-bottom-toolbar>
  </lingyun-app-page>
</template>

<script setup lang="ts">
const blocks = ['第一段', '第二段', '第三段', '第四段']

function toast(title: string): void {
  uni.showToast({ title, icon: 'none' })
}
</script>

<style lang="scss">
.page {
  box-sizing: border-box;
  min-height: 100%;
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
  line-height: 18px;
  color: var(--lingyun-label-secondary, #6a6a6a);
}

.note {
  padding: 4px 0 8px;
}

.note__text {
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label-secondary, #6a6a6a);
}

.bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-height: 62px;
  padding: 7px 12px 7px 16px;
  box-sizing: border-box;
}

.bar__meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.bar__title {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #6a6a6a);
}

.bar__price {
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  color: var(--lingyun-label, #1c1c1e);
}
</style>
