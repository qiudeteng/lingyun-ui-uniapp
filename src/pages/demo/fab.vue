<template>
  <lingyun-app-page title="Fab">
    <view class="page">
      <view class="hero">
        <text class="hero__title">悬浮按钮</text>
        <text class="hero__desc">lingyun-fab · 对齐 uni-fab 的位置与展开，主钮与菜单走液态玻璃</text>
      </view>

      <lingyun-section title="位置">
        <lingyun-list>
          <lingyun-list-item title="右下（默认）" accessory="disclosure" @click="place('right', 'bottom')" />
          <lingyun-list-item title="左下" accessory="disclosure" @click="place('left', 'bottom')" />
          <lingyun-list-item title="右上" accessory="disclosure" @click="place('right', 'top')" />
          <lingyun-list-item title="水平展开" accessory="disclosure" @click="place('right', 'bottom', 'horizontal')" />
        </lingyun-list>
      </lingyun-section>

      <lingyun-section title="说明" is-last>
        <view class="note">
          <text class="note__text">点右下角加号展开菜单。选中一项会收起并提示。底部已加上安全区，避免贴住 Home 指示条。</text>
        </view>
      </lingyun-section>
    </view>

    <lingyun-fab
      :horizontal="horizontal"
      :vertical="vertical"
      :direction="direction"
      :content="actions"
      @fab-click="toast('主钮')"
      @trigger="onTrigger"
    />
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const horizontal = ref<'left' | 'right'>('right')
  const vertical = ref<'top' | 'bottom'>('bottom')
  const direction = ref<'vertical' | 'horizontal'>('vertical')

  const actions = [
    { icon: 'compose', text: '新建' },
    { icon: 'camera', text: '拍照' },
    { icon: 'chat', text: '消息' },
  ]

  function place(h: 'left' | 'right', v: 'top' | 'bottom', d: 'vertical' | 'horizontal' = 'vertical'): void {
    horizontal.value = h
    vertical.value = v
    direction.value = d
  }

  function toast(title: string): void {
    uni.showToast({ title, icon: 'none' })
  }

  function onTrigger(payload: { item?: { text?: string } }): void {
    toast(payload.item?.text || '已选')
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 96px;
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
</style>
