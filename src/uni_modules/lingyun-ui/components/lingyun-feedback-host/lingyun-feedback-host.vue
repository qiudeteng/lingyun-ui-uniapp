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
    <lingyun-alert
      :key="alertEpoch"
      v-model:show="alertShow"
      :title="alertProps.title"
      :message="alertProps.message"
      :actions="alertProps.actions"
      :layout="alertProps.layout"
      :inputs="alertProps.inputs"
      :mask-closable="alertProps.maskClosable"
      @action="onAlertAction"
      @close="onAlertClose"
    />
  </view>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { useLingyunFeedbackStore, type LingyunAlertAction } from '../../utils/feedback'

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
    alertShow,
    alertProps,
    alertEpoch,
  } = storeToRefs(store)

  /* 组件先发 action 再发 close，按钮结果先落定；close 只兜底点遮罩 */
  function onAlertAction(payload: { action: LingyunAlertAction; index: number; values: string[] }): void {
    if (payload.action.close === false) return
    const cancel = payload.action.role === 'cancel'
    store.settleAlert({
      confirm: !cancel,
      cancel,
      index: payload.index,
      action: payload.action,
      values: payload.values,
    })
  }

  function onAlertClose(): void {
    store.settleAlert(store.dismissed())
  }
</script>

<style lang="scss">
  .lingyun-feedback-host {
    /* 仅承载浮层，无布局占位 */
  }
</style>
