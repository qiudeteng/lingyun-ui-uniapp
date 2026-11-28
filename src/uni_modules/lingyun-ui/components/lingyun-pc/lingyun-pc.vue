<template>
  <view v-if="visible" class="lingyun-pc">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isLingyunWideScreen } from '../../utils/screen'

/**
 * lingyun-pc
 * 平板和电脑显示（窗口宽度 ≥ 690）。窄屏不渲染。
 */
defineOptions({
  name: 'LingyunPc',
  options: { virtualHost: true },
})

const visible = computed((): boolean => isLingyunWideScreen())
</script>

<style lang="scss">
.lingyun-pc {
  display: block;
  box-sizing: border-box;
}
</style>
