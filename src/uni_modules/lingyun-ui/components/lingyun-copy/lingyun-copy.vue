<template>
  <view
    class="lingyun-copy"
    :class="rootClass"
    :style="rootStyle"
    :hover-class="disabled ? '' : 'lingyun-copy--hover'"
    :hover-start-time="20"
    :hover-stay-time="70"
    role="button"
    :aria-disabled="disabled ? 'true' : 'false'"
    @click="onTap"
  >
    <slot>
      <view v-if="showBuiltinIcon" class="lingyun-copy__glyph" />
      <lingyun-icon
        v-else-if="showCustomIcon"
        class="lingyun-copy__icon"
        :type="icon"
        :size="iconSize"
        :color="resolvedColor"
      />
      <text v-if="showLabel" class="lingyun-copy__label">{{ displayLabel }}</text>
    </slot>
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/** 与 lingyun-icon 对齐的语义色；未命中则当作自定义 CSS 色 */
const SEMANTIC_COLORS: Record<string, string> = {
  label: 'var(--lingyun-label, #000000)',
  secondary: 'var(--lingyun-label-secondary, rgba(60,60,67,0.6))',
  tertiary: 'var(--lingyun-label-tertiary, rgba(60,60,67,0.3))',
  quaternary: 'var(--lingyun-label-quaternary, rgba(60,60,67,0.18))',
  primary: 'var(--lingyun-primary, #0088ff)',
  link: 'var(--lingyun-link, #0088ff)',
  success: 'var(--lingyun-success, #34c759)',
  warning: 'var(--lingyun-warning, #ff8d28)',
  error: 'var(--lingyun-error, #ff383c)',
  red: 'var(--lingyun-system-red, #ff383c)',
  orange: 'var(--lingyun-system-orange, #ff8d28)',
  yellow: 'var(--lingyun-system-yellow, #ffcc00)',
  green: 'var(--lingyun-system-green, #34c759)',
  mint: 'var(--lingyun-system-mint, #00c8b3)',
  teal: 'var(--lingyun-system-teal, #00c3d0)',
  cyan: 'var(--lingyun-system-cyan, #00c0e8)',
  blue: 'var(--lingyun-system-blue, #0088ff)',
  indigo: 'var(--lingyun-system-indigo, #6155f5)',
  purple: 'var(--lingyun-system-purple, #cb30e0)',
  pink: 'var(--lingyun-system-pink, #ff2d55)',
  brown: 'var(--lingyun-system-brown, #ac7f5e)',
  gray: 'var(--lingyun-system-gray, #8e8e93)',
  gray2: 'var(--lingyun-system-gray2, #aeaeb2)',
  gray3: 'var(--lingyun-system-gray3, #c7c7cc)',
  white: '#ffffff',
  inherit: 'inherit',
}

/**
 * lingyun-copy · 复制
 * @description 默认纯图标触发器；点击把 text 属性的值写入剪贴板。
 * @property {String} text 要复制的文本（必填）
 * @property {String} mode = [icon|text] 默认 icon 纯图标；text 为纯文本（不显示图标）
 * @property {String} label 显示文案；与图标同时出现时图标在前；text 模式不传则显示「复制」
 * @property {String} icon 自定义 lingyun-icon 名；不传则用内置复制 SVG（text 模式忽略）
 * @property {String} color 语义色或自定义色；默认主题色 primary
 * @property {String} size = [small|medium|large]
 * @property {String} variant = [plain|glass] 默认 plain，glass 为玻璃胶囊按钮
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
    mode: { type: String, default: 'icon' },
    label: { type: String, default: '' },
    icon: { type: String, default: '' },
    color: { type: String, default: 'primary' },
    size: { type: String, default: 'small' },
    variant: { type: String, default: 'plain' },
    toast: { type: Boolean, default: true },
    toastText: { type: String, default: '已复制' },
    disabled: { type: Boolean, default: false },
  },
  computed: {
    resolvedMode(): string {
      return this.mode === 'text' ? 'text' : 'icon'
    },
    isTextMode(): boolean {
      return this.resolvedMode === 'text'
    },
    resolvedSize(): string {
      const allowed = ['small', 'medium', 'large']
      return allowed.includes(this.size) ? this.size : 'small'
    },
    resolvedVariant(): string {
      return this.variant === 'glass' ? 'glass' : 'plain'
    },
    resolvedColor(): string {
      const raw = String(this.color || '').trim()
      if (!raw) return SEMANTIC_COLORS.primary
      const key = raw.toLowerCase()
      if (SEMANTIC_COLORS[key]) return SEMANTIC_COLORS[key]
      return raw
    },
    iconSize(): number {
      return this.resolvedSize === 'large' ? 20 : this.resolvedSize === 'medium' ? 18 : 16
    },
    showBuiltinIcon(): boolean {
      return !this.isTextMode && !this.icon
    },
    showCustomIcon(): boolean {
      return !this.isTextMode && !!this.icon
    },
    displayLabel(): string {
      if (this.label) return this.label
      return this.isTextMode ? '复制' : ''
    },
    showLabel(): boolean {
      return !!this.displayLabel
    },
    iconOnly(): boolean {
      return !this.isTextMode && !this.showLabel
    },
    textOnly(): boolean {
      return this.isTextMode
    },
    rootClass(): string {
      return [
        `lingyun-copy--${this.resolvedVariant}`,
        `lingyun-copy--${this.resolvedSize}`,
        `lingyun-copy--mode-${this.resolvedMode}`,
        this.iconOnly ? 'lingyun-copy--icon-only' : '',
        this.textOnly ? 'lingyun-copy--text-only' : '',
        this.disabled ? 'lingyun-copy--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    rootStyle(): Record<string, string> {
      return {
        color: this.resolvedColor,
      }
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

/* 内置复制图标（mask + currentColor，可随主题色变色；兼容 H5 / 微信） */
$lingyun-copy-glyph: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'%3E%3Cpath fill='%23000' d='M891.072 822.144V167.36a34.432 34.432 0 0 0-34.432-34.432H201.856C201.856 94.848 232.704 64 270.784 64h620.288C929.152 64 960 94.848 960 132.928v620.288c0 38.08-30.848 68.928-68.928 68.928z m-68.928-551.36v620.288c0 38.08-30.848 68.928-68.928 68.928H132.928A68.928 68.928 0 0 1 64 891.072V270.784c0-38.08 30.848-68.928 68.928-68.928h620.288c38.08 0 68.928 30.848 68.928 68.928z m-137.856 137.856H201.856a34.432 34.432 0 0 0 0 68.864h482.432a34.432 34.432 0 0 0 0-68.864z m0 206.72H201.856a34.432 34.432 0 0 0 0 68.864h482.432a34.432 34.432 0 0 0 0-68.864z'/%3E%3C/svg%3E");

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

  &__glyph {
    flex-shrink: 0;
    width: 1em;
    height: 1em;
    background-color: currentColor;
    -webkit-mask: $lingyun-copy-glyph center / contain no-repeat;
    mask: $lingyun-copy-glyph center / contain no-repeat;
  }

  &--plain {
    padding: 0;
    height: auto;
    min-height: 0;
    background-color: transparent;
  }

  &--glass {
    @include lingyun-glass-control;
  }

  &--small {
    font-size: 16px;
  }

  &--medium {
    font-size: 18px;
  }

  &--large {
    font-size: 20px;
  }

  &--glass#{&}--small {
    height: 34px;
    min-height: 34px;
    padding: 0 12px;
    font-size: 15px;
  }

  &--glass#{&}--medium {
    height: 40px;
    min-height: 40px;
    padding: 0 14px;
    font-size: 16px;
  }

  &--glass#{&}--large {
    height: 50px;
    min-height: 50px;
    padding: 0 18px;
    font-size: 17px;
  }

  &--plain#{&}--icon-only {
    min-width: 24px;
    min-height: 24px;
  }

  &--plain#{&}--icon-only#{&}--medium {
    min-width: 28px;
    min-height: 28px;
  }

  &--plain#{&}--icon-only#{&}--large {
    min-width: 32px;
    min-height: 32px;
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
