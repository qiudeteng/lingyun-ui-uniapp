<template>
  <view v-if="visible" class="lingyun-mobile">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isLingyunWideScreen } from '../../utils/screen'

/**
 * lingyun-mobile
 * 窄屏显示（窗口宽度小于 690）。平板和电脑档不渲染。
 */
defineOptions({
  name: 'LingyunMobile',
  virtualHost: true,
})

const visible = computed((): boolean => !isLingyunWideScreen())
</script>

<style lang="scss">
.lingyun-mobile {
  display: block;
  box-sizing: border-box;
}
</style>
