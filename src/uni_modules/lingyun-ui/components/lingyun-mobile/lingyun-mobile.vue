<template>
  <view v-if="visible" class="lingyun-mobile">
    <slot />
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { isLingyunWideScreen } from '../../utils/screen'

/**
 * lingyun-mobile
 * 窄屏显示（窗口宽度小于 690）。平板和电脑档不渲染。
 */
export default defineComponent({
  name: 'LingyunMobile',
  options: {
    virtualHost: true,
  },
  computed: {
    visible(): boolean {
      return !isLingyunWideScreen()
    },
  },
})
</script>

<style lang="scss">
.lingyun-mobile {
  display: block;
  box-sizing: border-box;
}
</style>
