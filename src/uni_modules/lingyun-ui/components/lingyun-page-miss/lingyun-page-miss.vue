<template>
  <view class="lingyun-page-miss">
    <lingyun-empty variant="plain" title="404" :description="description">
      <template #action>
        <lingyun-button variant="borderedProminent" text="返回首页" @click="onHome" />
      </template>
    </lingyun-empty>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
/**
 * 菜单点到未注册页面时的 404。嵌在当前页里，避免小程序整页重开。
 */
defineOptions({
  name: 'LingyunPageMiss',
})

const props = defineProps({
  from: { type: String, default: '' },
})

const emit = defineEmits(['home'])

const description = computed((): string => {
  return props.from ? `当前应用没有这个页面\n${props.from}` : '当前应用没有这个页面'
})

function onHome(): void {
  emit('home')
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-page-miss {
  width: 100%;
  box-sizing: border-box;
}

.lingyun-page-miss .lingyun-empty__desc {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
