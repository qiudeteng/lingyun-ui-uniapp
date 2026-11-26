<template>
  <view
    class="lingyun-copy"
    :class="rootClass"
    :hover-class="disabled ? '' : 'lingyun-copy--hover'"
    :hover-start-time="20"
    :hover-stay-time="70"
    role="button"
    :aria-disabled="disabled ? 'true' : 'false'"
    @click="onTap"
  >
    <slot>
      <!-- icon="copy" 用纯 CSS 绘制「两层纸」，避免图标字体里没有复制语义图标 -->
      <view
        v-if="icon === 'copy'"
        class="lingyun-copy__copy"
        :style="copyIconStyle"
      >
        <view class="lingyun-copy__copy-back" />
        <view class="lingyun-copy__copy-front">
          <view class="lingyun-copy__copy-line" />
          <view class="lingyun-copy__copy-line" />
        </view>
      </view>
      <lingyun-icon
        v-else-if="icon"
        class="lingyun-copy__icon"
        :type="icon"
        :size="iconSize"
      />
      <text v-if="showLabel" class="lingyun-copy__label">{{ displayLabel }}</text>
    </slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
/**
 * lingyun-copy · 复制
 * @description 显示文字或图标的复制触发器；点击把 text 属性的值写入剪贴板。
 * @property {String} text 要复制的文本（必填）
 * @property {String} label 显示文案；不传且没有 icon 时显示「复制」
 * @property {String} icon lingyun-icon 图标名；与 label 同时存在时图标在前
 * @property {String} size = [small|medium|large]
 * @property {String} variant = [glass|plain]
 * @property {Boolean} toast 复制成功后是否提示（微信自带系统提示，不再重复）
 * @property {String} toastText 成功提示文案
 * @property {Boolean} disabled
 * @event {Function} copy 复制成功，参数为文本
 * @event {Function} success 复制成功，参数为 uni.setClipboardData 返回
 * @event {Function} error 复制失败或没有可复制内容
 * @see design/UI_SPEC.md
 */
defineOptions({
  name: 'LingyunCopy',
  virtualHost: true,
})

const props = defineProps({
  text: { type: String, default: '' },
  label: { type: String, default: '' },
  icon: { type: String, default: '' },
  size: { type: String, default: 'small' },
  variant: { type: String, default: 'glass' },
  toast: { type: Boolean, default: true },
  toastText: { type: String, default: '已复制' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['copy', 'success', 'error'])

const resolvedSize = computed((): string => {
  const allowed = ['small', 'medium', 'large']
  return allowed.includes(props.size) ? props.size : 'small'
})

const resolvedVariant = computed((): string => {
  return props.variant === 'plain' ? 'plain' : 'glass'
})

const iconSize = computed((): number => {
  return resolvedSize.value === 'large' ? 20 : resolvedSize.value === 'medium' ? 18 : 16
})

const copyIconStyle = computed((): string => {
  /* 双框加两条文字线在 16px 下会糊，自绘图标整体比字体图标放大 2px */
  const size = iconSize.value + 2
  return `width:${size}px;height:${size}px`
})

const displayLabel = computed((): string => {
  if (props.label) return props.label
  return props.icon ? '' : '复制'
})

const showLabel = computed((): boolean => {
  return !!displayLabel.value
})

/* 只给图标不给文案时按「纯图标」渲染：无按钮底色、无描边，直接用主题色 */
const iconOnly = computed((): boolean => {
  return !!props.icon && !props.label
})

const rootClass = computed((): string => {
  const surface = iconOnly.value ? 'lingyun-copy--icon-only' : `lingyun-copy--${resolvedVariant.value}`
  return [
    surface,
    `lingyun-copy--${resolvedSize.value}`,
    props.disabled ? 'lingyun-copy--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

function onTap(): void {
  if (props.disabled) return
  if (!props.text) {
    emit('error', { message: '没有可复制的内容' })
    return
  }
  uni.setClipboardData({
    data: props.text,
    success: (res) => {
      emit('copy', props.text)
      emit('success', res)
      /* 微信 setClipboardData 自带「内容已复制」系统提示，避免叠两层 */
      // #ifndef MP-WEIXIN
      if (props.toast) {
        uni.showToast({ title: props.toastText, icon: 'none' })
      }
      // #endif
    },
    fail: (err) => {
      emit('error', err)
    },
  })
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.lingyun-copy {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  gap: 6px;
  font-weight: 590;
  line-height: 1.2;
  transition: transform 0.16s ease, opacity 0.16s ease;
  /* #ifdef H5 */
  cursor: pointer;
  user-select: none;
  /* #endif */

  &__label {
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    line-height: inherit;
  }

  &__icon {
    flex-shrink: 0;
  }

  &__copy {
    position: relative;
    display: block;
    flex-shrink: 0;
  }

  /* 参考文档复制图标：背面纸露出右上角，正面纸在左下并带两条文字线 */
  &__copy-back {
    position: absolute;
    box-sizing: border-box;
    top: 0;
    right: 0;
    width: 86%;
    height: 86%;
    border-style: solid;
    border-color: currentColor;
    border-width: 1.5px 1.5px 0 0;
    border-radius: 2px 2px 0 0;
  }

  &__copy-front {
    position: absolute;
    box-sizing: border-box;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    width: 86%;
    height: 86%;
    border: 1.5px solid currentColor;
    border-radius: 2px;
  }

  &__copy-line {
    width: 48%;
    height: 0;
    border-top: 1.5px solid currentColor;
  }

  &--glass {
    @include lingyun-glass-control;
    color: var(--lingyun-label, #{$lingyun-label});
  }

  &--plain {
    color: var(--lingyun-link, #{$lingyun-link});
    background-color: transparent;
  }

  &--small {
    height: 34px;
    min-height: 34px;
    padding: 0 12px;
    font-size: 15px;
  }

  &--medium {
    height: 40px;
    min-height: 40px;
    padding: 0 14px;
    font-size: 16px;
  }

  &--large {
    height: 50px;
    min-height: 50px;
    padding: 0 18px;
    font-size: 17px;
  }

  /* 纯图标：不套按钮外观，只用主题色描边 */
  &--icon-only {
    width: auto;
    height: auto;
    min-height: 0;
    padding: 6px;
    color: var(--lingyun-primary, #{$lingyun-primary});
    background-color: transparent;
  }

  &--hover {
    opacity: 0.7;
  }

  &--disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}
</style>
