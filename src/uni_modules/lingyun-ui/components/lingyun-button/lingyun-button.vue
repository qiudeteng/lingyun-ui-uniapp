<template>
  <view
    class="lingyun-button"
    :class="rootClass"
    :hover-class="hoverClass"
    :hover-start-time="20"
    :hover-stay-time="70"
    role="button"
    :aria-disabled="isDisabled ? 'true' : 'false'"
    @click="onClick"
  >
    <view v-if="loading" class="lingyun-button__loading" />
    <view v-if="showIcon" class="lingyun-button__icon">
      <slot name="icon">
        <text v-if="icon" class="lingyun-button__icon-text">{{ icon }}</text>
      </slot>
    </view>
    <text v-if="showLabel" class="lingyun-button__label">
      <slot>{{ text }}</slot>
    </text>
  </view>
</template>

<script>
/**
 * lingyun-button
 * @description 对齐 Apple iOS 27 UI Kit Buttons（Sketch）+ HIG + Liquid Glass
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Buttons
 * @see https://developer.apple.com/design/human-interface-guidelines/buttons
 * @see design/BUTTONS.md
 *
 * @property {String} variant = [borderedProminent|bordered|borderless|glass]
 *   对应 Sketch Style：Bordered Prominent / Bordered / Borderless / Glass
 * @property {String} size = [large|medium|small|mini]
 * @property {String} role = [normal|destructive|cancel|success|warning]
 * @property {String} text 文案
 * @property {String} icon 简易符号（或 #icon 插槽）
 * @property {Boolean} block
 * @property {Boolean} disabled
 * @property {Boolean} loading
 * @event {Function} click
 */
export default {
  name: 'LingyunButton',
  emits: ['click'],
  props: {
    /** Sketch「Style」；不用原生属性名 style，避免与 CSS style 冲突 */
    variant: {
      type: String,
      default: 'glass',
    },
    size: {
      type: String,
      default: 'large',
    },
    role: {
      type: String,
      default: 'normal',
    },
    text: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    block: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isDisabled() {
      return this.disabled || this.loading
    },
    showIcon() {
      return !!(this.icon || this.$slots.icon)
    },
    showLabel() {
      if (this.text) return true
      const slot = this.$slots.default
      if (!slot) return false
      try {
        const nodes = slot()
        return Array.isArray(nodes) && nodes.length > 0
      } catch (e) {
        return false
      }
    },
    isIconOnly() {
      return this.showIcon && !this.showLabel
    },
    resolvedVariant() {
      const map = {
        borderedProminent: 'bordered-prominent',
        'bordered-prominent': 'bordered-prominent',
        filled: 'bordered-prominent',
        bordered: 'bordered',
        gray: 'bordered',
        tinted: 'bordered',
        borderless: 'borderless',
        plain: 'borderless',
        glass: 'glass',
      }
      return map[this.variant] || 'glass'
    },
    resolvedSize() {
      const allowed = ['large', 'medium', 'small', 'mini']
      return allowed.includes(this.size) ? this.size : 'large'
    },
    resolvedRole() {
      const allowed = ['normal', 'destructive', 'cancel', 'success', 'warning']
      return allowed.includes(this.role) ? this.role : 'normal'
    },
    rootClass() {
      return [
        `lingyun-button--${this.resolvedVariant}`,
        `lingyun-button--${this.resolvedSize}`,
        `lingyun-button--role-${this.resolvedRole}`,
        this.isIconOnly ? 'lingyun-button--icon-only' : '',
        this.block ? 'lingyun-button--block' : '',
        this.isDisabled ? 'lingyun-button--disabled' : '',
        this.loading ? 'lingyun-button--loading' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    hoverClass() {
      return this.isDisabled ? '' : 'lingyun-button--hover'
    },
  },
  methods: {
    onClick(e) {
      if (this.isDisabled) return
      this.$emit('click', e)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

/* Sketch Bordered / Prominent / Borderless：Large 50（padding 16/20）、Medium 34、Small 28 */
$ly-btn-large-h: 50px;
$ly-btn-medium-h: 40px;
$ly-btn-small-h: 34px;
$ly-btn-mini-h: 28px;
/* Sketch Glass/Large：46（padding 14/20），比 Bordered 矮 4 */
$ly-btn-glass-large-h: 46px;

.lingyun-button {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  min-width: 44px;
  min-height: 44px;
  padding: 0 14px;
  gap: 6px;
  border-radius: $lingyun-glass-radius-pill;
  font-weight: 590;
  line-height: 1.2;
  text-align: center;
  vertical-align: middle;
  transition: transform 0.16s ease, opacity 0.16s ease, box-shadow 0.16s ease;
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__icon-text {
    font-size: 1.05em;
    line-height: 1;
  }

  &__loading {
    width: 14px;
    height: 14px;
    border: 1.5px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: lingyun-button-spin 0.7s linear infinite;
  }

  &--block {
    display: flex;
    width: 100%;
  }

  &--icon-only {
    padding: 0;
  }

  &--large {
    min-height: $ly-btn-large-h;
    height: $ly-btn-large-h;
    padding: 0 14px;
    font-size: 17px;
  }

  &--large.lingyun-button--icon-only {
    width: $ly-btn-large-h;
    min-width: $ly-btn-large-h;
  }

  &--medium {
    min-height: $ly-btn-medium-h;
    height: $ly-btn-medium-h;
    padding: 0 12px;
    font-size: 16px;
  }

  &--medium.lingyun-button--icon-only {
    width: $ly-btn-medium-h;
    min-width: $ly-btn-medium-h;
  }

  &--small {
    min-height: $ly-btn-small-h;
    height: $ly-btn-small-h;
    padding: 0 10px;
    font-size: 15px;
  }

  &--small.lingyun-button--icon-only {
    width: $ly-btn-small-h;
    min-width: $ly-btn-small-h;
  }

  &--mini {
    min-height: $ly-btn-mini-h;
    height: $ly-btn-mini-h;
    padding: 0 8px;
    font-size: 13px;
  }

  &--mini.lingyun-button--icon-only {
    width: $ly-btn-mini-h;
    min-width: $ly-btn-mini-h;
  }

  /* Sketch Bordered Prominent：System Blue 实底，无描边、无投影 */
  &--bordered-prominent {
    color: $lingyun-white;
    background-color: var(--lingyun-primary, #{$lingyun-primary});
    border: 0;
    box-shadow: none;
  }

  &--bordered {
    color: var(--lingyun-primary, #{$lingyun-primary});
    background-color: var(--lingyun-primary-soft, #{rgba($lingyun-primary, 0.14)});
    border: 1px solid var(--lingyun-primary-soft-border, #{rgba($lingyun-primary, 0.22)});
    box-shadow: none;
  }

  &--borderless {
    color: var(--lingyun-primary, #{$lingyun-primary});
    background-color: transparent;
    border: 1px solid transparent;
    box-shadow: none;
    min-width: auto;
  }

  /*
   * Sketch Glass 按钮：走控件级玻璃（模糊 6 / 0.5px 中性描边 / 极轻投影 + 透镜内缘）。
   * 旧实现用 lingyun-glass-regular，小程序会退到 0.94 实霜，真机偏死白且描边过白。
   */
  &--glass {
    @include lingyun-glass-control;
    color: var(--lingyun-label, #{$lingyun-main-color});
  }

  /* Glass 比 Bordered 矮一档（Sketch Large 46 vs 50），内边距 20 */
  &--glass.lingyun-button--large {
    min-height: $ly-btn-glass-large-h;
    height: $ly-btn-glass-large-h;
    padding: 0 20px;
  }

  &--glass.lingyun-button--large.lingyun-button--icon-only {
    width: $ly-btn-glass-large-h;
    min-width: $ly-btn-glass-large-h;
  }

  &--role-destructive.lingyun-button--bordered-prominent {
    background-color: var(--lingyun-error, #{$lingyun-error});
  }

  &--role-destructive.lingyun-button--bordered {
    color: var(--lingyun-error, #{$lingyun-error});
    background-color: var(--lingyun-error-soft, #{rgba($lingyun-error, 0.12)});
    border-color: var(--lingyun-error-soft-border, #{rgba($lingyun-error, 0.2)});
  }

  &--role-destructive.lingyun-button--borderless {
    color: var(--lingyun-error, #{$lingyun-error});
    background-color: transparent;
    border-color: transparent;
  }

  &--role-destructive.lingyun-button--glass {
    color: var(--lingyun-error, #{$lingyun-error});
  }

  &--role-success.lingyun-button--bordered-prominent {
    background-color: var(--lingyun-success, #{$lingyun-success});
  }

  &--role-success.lingyun-button--bordered {
    color: var(--lingyun-success, #{$lingyun-success});
    background-color: var(--lingyun-success-soft, #{rgba($lingyun-success, 0.12)});
    border-color: var(--lingyun-success-soft-border, #{rgba($lingyun-success, 0.2)});
  }

  &--role-success.lingyun-button--borderless {
    color: var(--lingyun-success, #{$lingyun-success});
    background-color: transparent;
    border-color: transparent;
  }

  &--role-success.lingyun-button--glass {
    color: var(--lingyun-success, #{$lingyun-success});
  }

  &--role-warning.lingyun-button--bordered-prominent {
    background-color: var(--lingyun-warning, #{$lingyun-warning});
  }

  &--role-warning.lingyun-button--bordered {
    color: var(--lingyun-warning, #{$lingyun-warning});
    background-color: var(--lingyun-warning-soft, #{rgba($lingyun-warning, 0.12)});
    border-color: var(--lingyun-warning-soft-border, #{rgba($lingyun-warning, 0.2)});
  }

  &--role-warning.lingyun-button--borderless {
    color: var(--lingyun-warning, #{$lingyun-warning});
    background-color: transparent;
    border-color: transparent;
  }

  &--role-warning.lingyun-button--glass {
    color: var(--lingyun-warning, #{$lingyun-warning});
  }

  &--role-cancel.lingyun-button--bordered-prominent {
    background-color: var(--lingyun-cancel-fill, #{rgba($lingyun-base-color, 0.85)});
  }

  &--role-cancel.lingyun-button--glass,
  &--role-cancel.lingyun-button--bordered,
  &--role-cancel.lingyun-button--borderless {
    color: var(--lingyun-label-secondary, #{$lingyun-base-color});
  }

  &--hover {
    transform: scale(0.98);
  }

  /* 玻璃按下：保留 0.5px 描边与透镜内缘，仅压暗底色（勿换成面板级投影） */
  &--glass.lingyun-button--hover {
    background-color: var(--lingyun-glass-control-bg-pressed, rgba(255, 255, 255, 0.56));
  }

  &--bordered-prominent.lingyun-button--hover,
  &--bordered.lingyun-button--hover {
    opacity: 0.86;
  }

  &--borderless.lingyun-button--hover {
    box-shadow: none;
    opacity: 0.72;
  }

  &--disabled {
    opacity: 0.4;
    /* #ifdef H5 */
    cursor: not-allowed;
    /* #endif */
  }
}

@keyframes lingyun-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
