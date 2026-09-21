<template>
  <view class="lingyun-feedback-host">
    <lingyun-toast
      :key="toastEpoch"
      v-model:show="toastShow"
      :text="toastText"
      :type="toastType"
      :duration="toastDuration"
    />
    <lingyun-hud
      v-model:show="hudShow"
      :text="hudText"
      :mask-closable="hudMaskClosable"
    />
  </view>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { useLingyunFeedbackStore } from '../../utils/feedback'

  const store = useLingyunFeedbackStore()
  const {
    toastShow,
    toastText,
    toastType,
    toastDuration,
    toastEpoch,
    hudShow,
    hudText,
    hudMaskClosable,
  } = storeToRefs(store)
</script>

<style lang="scss">
  .lingyun-feedback-host {
    /* 仅承载浮层，无布局占位 */
  }
</style>
