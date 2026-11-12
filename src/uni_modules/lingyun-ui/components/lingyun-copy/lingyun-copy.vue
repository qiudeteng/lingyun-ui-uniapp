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
      <lingyun-icon
        v-if="icon"
        class="lingyun-copy__icon"
        :type="icon"
        :size="iconSize"
      />
      <text v-if="showLabel" class="lingyun-copy__label">{{ displayLabel }}</text>
    </slot>
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

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
export default defineComponent({
  name: 'LingyunCopy',
  options: {
    virtualHost: true,
  },
  emits: ['copy', 'success', 'error'],
  props: {
    text: { type: String, default: '' },
    label: { type: String, default: '' },
    icon: { type: String, default: '' },
    size: { type: String, default: 'small' },
    variant: { type: String, default: 'glass' },
    toast: { type: Boolean, default: true },
    toastText: { type: String, default: '已复制' },
    disabled: { type: Boolean, default: false },
  },
  computed: {
    resolvedSize(): string {
      const allowed = ['small', 'medium', 'large']
      return allowed.includes(this.size) ? this.size : 'small'
    },
    resolvedVariant(): string {
      return this.variant === 'plain' ? 'plain' : 'glass'
    },
    iconSize(): number {
      return this.resolvedSize === 'large' ? 20 : this.resolvedSize === 'medium' ? 18 : 16
    },
    displayLabel(): string {
      if (this.label) return this.label
      return this.icon ? '' : '复制'
    },
    showLabel(): boolean {
      return !!this.displayLabel
    },
    rootClass(): string {
      return [
        `lingyun-copy--${this.resolvedVariant}`,
        `lingyun-copy--${this.resolvedSize}`,
        this.disabled ? 'lingyun-copy--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
  },
  methods: {
    onTap(): void {
      if (this.disabled) return
      if (!this.text) {
        this.$emit('error', { message: '没有可复制的内容' })
        return
      }
      uni.setClipboardData({
        data: this.text,
        success: (res) => {
          this.$emit('copy', this.text)
          this.$emit('success', res)
          /* 微信 setClipboardData 自带「内容已复制」系统提示，避免叠两层 */
          // #ifndef MP-WEIXIN
          if (this.toast) {
            uni.showToast({ title: this.toastText, icon: 'none' })
          }
          // #endif
        },
        fail: (err) => {
          this.$emit('error', err)
        },
      })
    },
  },
})
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

  &--hover {
    opacity: 0.7;
  }

  &--disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}
</style>
