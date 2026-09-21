<template>
  <view class="lingyun-form-group">
    <view v-if="title" class="lingyun-form-group__header">
      <text class="lingyun-form-group__title">{{ title }}</text>
    </view>
    <view class="lingyun-form-group__card">
      <slot />
    </view>
    <view v-if="footer" class="lingyun-form-group__footer">
      <text class="lingyun-form-group__footer-text">{{ footer }}</text>
    </view>
  </view>
</template>

<script>
/**
 * lingyun-form-group
 * 视觉对齐 lingyun-list 分组卡，不依赖 list 组件
 * @see design/FORMS.md
 */
export default {
  name: 'LingyunFormGroup',
  props: {
    title: { type: String, default: '' },
    footer: { type: String, default: '' },
  },
  data() {
    return {
      firstChildAppend: false,
    }
  },
  provide() {
    return {
      lingyunFormGroup: this,
    }
  },
  created() {
    this.firstChildAppend = false
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

$ly-form-radius: 26px;

.lingyun-form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.lingyun-form-group__header {
  box-sizing: border-box;
  height: 42px;
  padding: 10px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-form-group__title {
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: -0.08px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-form-group__card {
  /* 勿 overflow:hidden：同层渲染下会裁掉/吞掉内部原生 textarea，表现为多行空白不可点 */
  overflow: visible;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  border-radius: $ly-form-radius;
}

.lingyun-form-group__footer {
  box-sizing: border-box;
  min-height: 32px;
  padding: 6px 16px 8px;
}

.lingyun-form-group__footer-text {
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  letter-spacing: -0.08px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}
</style>
