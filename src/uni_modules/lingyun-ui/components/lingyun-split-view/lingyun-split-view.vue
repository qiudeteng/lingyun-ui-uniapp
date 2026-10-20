<template>
  <view class="lingyun-split-view">
    <view class="lingyun-split-view__primary">
      <slot name="primary" />
    </view>
    <view class="lingyun-split-view__gap">
      <slot name="gap" />
    </view>
    <view class="lingyun-split-view__detail">
      <slot name="detail" />
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * lingyun-split-view
 * @description iPhone Duo 内屏横屏折叠/半折的双栏内容。
 * 官方画板 951×669：左主栏 456、折痕避让带 40、右详情栏 371、右侧返回列 84。
 */
export default defineComponent({
  name: 'LingyunSplitView',
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-split-view {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
}

.lingyun-split-view__primary {
  flex: 456 1 0;
  min-width: 0;
}

.lingyun-split-view__gap {
  flex: 0 0 40px;
  min-width: 40px;
  pointer-events: none;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-split-view__detail {
  flex: 371 1 0;
  min-width: 0;
}
</style>
