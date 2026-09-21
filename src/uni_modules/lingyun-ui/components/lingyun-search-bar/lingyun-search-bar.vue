<template>
  <view class="lingyun-search-bar" :class="rootClass" :style="rootStyle">
    <view class="lingyun-search-bar__row" @focusin="onFocus" @focusout="onBlur">
      <view class="lingyun-search-bar__field" @click="onFieldClick">
        <slot name="icon">
          <lingyun-icon
            class="lingyun-search-bar__icon"
            type="search"
            :size="17"
            color="var(--lingyun-label-secondary, rgba(60,60,67,0.6))"
          />
        </slot>
        <input
          class="lingyun-search-bar__query"
          type="text"
          :value="innerValue"
          :placeholder="placeholder"
          placeholder-class="lingyun-search-bar__query-ph"
          confirm-type="search"
          :adjust-position="false"
          :hold-keyboard="false"
          :focus="focus"
          @input="onInput"
          @confirm="onConfirm"
          @focus="onFocus"
          @blur="onBlur"
          @keyboardheightchange="onKeyboardHeightChange"
        />
        <view
          v-if="hasValue"
          class="lingyun-search-bar__clear"
          hover-class="lingyun-search-bar__clear--hover"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click.stop="onClear"
        >
          <lingyun-icon type="clear" :size="17" color="var(--lingyun-label-secondary, rgba(60,60,67,0.6))" />
        </view>
        <view
          v-else
          class="lingyun-search-bar__mic"
          hover-class="lingyun-search-bar__mic--hover"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click.stop="onMic"
        >
          <slot name="mic">
            <lingyun-icon type="mic" :size="17" color="var(--lingyun-label-secondary, rgba(60,60,67,0.6))" />
          </slot>
        </view>
      </view>

      <view v-if="showCancel" class="lingyun-search-bar__cancel-slot">
        <view
          class="lingyun-search-bar__cancel"
          hover-class="lingyun-search-bar__cancel--hover"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click.stop="onCancel"
        >
          <slot name="cancel">
            <text v-if="cancelText" class="lingyun-search-bar__cancel-text">{{ cancelText }}</text>
            <lingyun-icon
              v-else
              type="closeempty"
              :size="17"
              color="var(--lingyun-label, #000)"
            />
          </slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * lingyun-search-bar
 * @description 对齐 Sketch Tab Bars / Search Selected - Placeholder 的底部玻璃搜索条
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/C46C53EC-096C-448D-94FC-AB949829C87E#Inspect
 * @see https://developer.apple.com/design/human-interface-guidelines/search-fields
 * @see design/SEARCHBARS.md
 *
 * @property {String} modelValue / value 搜索文本
 * @property {String} placeholder 占位（默认 Search）
 * @property {Boolean} fixed 固定底部（默认 true）
 * @property {Boolean} safeArea 预留 Home Indicator（默认 true）
 * @property {Boolean} showCancel 是否允许聚焦后展开取消钮（默认 true）
 * @property {String} cancelText 取消文案；空则用符号
 * @property {Boolean} focus 外部请求聚焦
 * @event {Function} update:modelValue / input / confirm / clear / mic / cancel / focus / blur
 */
export default {
  name: 'LingyunSearchBar',
  emits: [
    'update:modelValue',
    'update:value',
    'input',
    'confirm',
    'clear',
    'mic',
    'cancel',
    'focus',
    'blur',
  ],
  data() {
    return {
      localValue: '',
      innerFocused: false,
      /** 键盘高度（px）；fixed 底栏据此上推，避免被挡住 */
      keyboardHeight: 0,
    }
  },
  props: {
    modelValue: {
      type: String,
      default: undefined,
    },
    value: {
      type: String,
      default: undefined,
    },
    placeholder: {
      type: String,
      default: 'Search',
    },
    fixed: {
      type: Boolean,
      default: true,
    },
    safeArea: {
      type: Boolean,
      default: true,
    },
    showCancel: {
      type: Boolean,
      default: true,
    },
    cancelText: {
      type: String,
      default: '',
    },
    focus: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    innerValue() {
      if (this.modelValue !== undefined && this.modelValue !== null) return this.modelValue
      if (this.value !== undefined && this.value !== null) return this.value
      return this.localValue
    },
    hasValue() {
      return String(this.innerValue || '').length > 0
    },
    active() {
      return this.showCancel && (this.innerFocused || this.focus)
    },
    rootClass() {
      return [
        this.fixed ? 'lingyun-search-bar--fixed' : '',
        this.safeArea ? 'lingyun-search-bar--safe' : '',
        this.active ? 'lingyun-search-bar--active' : '',
        this.keyboardHeight > 0 ? 'lingyun-search-bar--keyboard' : '',
        this.hasValue ? 'lingyun-search-bar--value' : 'lingyun-search-bar--placeholder',
      ]
        .filter(Boolean)
        .join(' ')
    },
    rootStyle() {
      if (!this.fixed || !(this.keyboardHeight > 0)) return {}
      return {
        bottom: `${this.keyboardHeight}px`,
      }
    },
  },
  mounted() {
    /* #ifdef H5 */
    this.$nextTick(() => {
      const root = this.$el
      if (!root || !root.addEventListener) return
      this._onFocusIn = () => this.onFocus()
      this._onFocusOut = (event) => {
        const next = event && event.relatedTarget
        if (next && root.contains && root.contains(next)) return
        this.onBlur()
      }
      root.addEventListener('focusin', this._onFocusIn)
      root.addEventListener('focusout', this._onFocusOut)
    })
    this.bindVisualViewport()
    /* #endif */
    this.bindKeyboardHeight()
  },
  beforeUnmount() {
    this.clearBlurTimer()
    this.unbindKeyboardHeight()
    /* #ifdef H5 */
    this.unbindVisualViewport()
    const root = this.$el
    if (root && this._onFocusIn) root.removeEventListener('focusin', this._onFocusIn)
    if (root && this._onFocusOut) root.removeEventListener('focusout', this._onFocusOut)
    /* #endif */
  },
  methods: {
    setKeyboardHeight(height) {
      const next = Math.max(0, Number(height) || 0)
      if (next === this.keyboardHeight) return
      this.keyboardHeight = next
    },
    onKeyboardHeightChange(event) {
      const height = event && event.detail ? event.detail.height : 0
      this.setKeyboardHeight(height)
    },
    bindKeyboardHeight() {
      if (!this.fixed) return
      if (typeof uni === 'undefined' || typeof uni.onKeyboardHeightChange !== 'function') return
      this._onKeyboardHeight = (res) => {
        this.setKeyboardHeight(res && res.height)
      }
      uni.onKeyboardHeightChange(this._onKeyboardHeight)
    },
    unbindKeyboardHeight() {
      if (!this._onKeyboardHeight) return
      if (typeof uni !== 'undefined' && typeof uni.offKeyboardHeightChange === 'function') {
        uni.offKeyboardHeightChange(this._onKeyboardHeight)
      }
      this._onKeyboardHeight = null
    },
    /* #ifdef H5 */
    bindVisualViewport() {
      if (!this.fixed || typeof window === 'undefined' || !window.visualViewport) return
      this._onVisualViewport = () => {
        const vv = window.visualViewport
        const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
        this.setKeyboardHeight(covered > 80 ? covered : 0)
      }
      window.visualViewport.addEventListener('resize', this._onVisualViewport)
      window.visualViewport.addEventListener('scroll', this._onVisualViewport)
    },
    unbindVisualViewport() {
      if (!this._onVisualViewport || typeof window === 'undefined' || !window.visualViewport) return
      window.visualViewport.removeEventListener('resize', this._onVisualViewport)
      window.visualViewport.removeEventListener('scroll', this._onVisualViewport)
      this._onVisualViewport = null
    },
    /* #endif */
    setValue(next) {
      const value = next == null ? '' : String(next)
      this.localValue = value
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
    },
    onInput(event) {
      const value = event && event.detail ? event.detail.value : ''
      this.setValue(value)
      this.$emit('input', value)
    },
    onConfirm(event) {
      const value = event && event.detail ? event.detail.value : this.innerValue
      this.$emit('confirm', value)
    },
    onFocus() {
      this.clearBlurTimer()
      this.innerFocused = true
      /* #ifdef H5 */
      if (typeof window !== 'undefined') {
        const x = window.scrollX
        const y = window.scrollY
        this.$nextTick(() => window.scrollTo(x, y))
      }
      /* #endif */
      this.$emit('focus')
    },
    onBlur() {
      this.clearBlurTimer()
      this._blurTimer = setTimeout(() => {
        this.innerFocused = false
        this.setKeyboardHeight(0)
        this._blurTimer = null
        this.$emit('blur')
      }, 160)
    },
    clearBlurTimer() {
      if (!this._blurTimer) return
      clearTimeout(this._blurTimer)
      this._blurTimer = null
    },
    queryInput() {
      const root = this.$el
      return root && root.querySelector ? root.querySelector('input') : null
    },
    focusInput() {
      /* #ifdef H5 */
      const input = this.queryInput()
      if (input && input.focus) input.focus()
      /* #endif */
    },
    blurInput() {
      /* #ifdef H5 */
      const input = this.queryInput()
      if (input && input.blur) input.blur()
      /* #endif */
      if (typeof uni !== 'undefined' && uni.hideKeyboard) uni.hideKeyboard()
    },
    onFieldClick() {
      const was = this.innerFocused
      this.clearBlurTimer()
      this.innerFocused = true
      this.focusInput()
      if (!was) this.$emit('focus')
    },
    onClear() {
      this.setValue('')
      this.$emit('clear')
    },
    onMic() {
      this.$emit('mic')
    },
    onCancel() {
      this.clearBlurTimer()
      this.setValue('')
      this.innerFocused = false
      this.setKeyboardHeight(0)
      this.blurInput()
      this.$emit('cancel')
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

/* Sketch Search Selected - Placeholder：402×76，padding 0/28/28/28，字段 346×48 */
$ly-search-pad: 28px; /* 28pt */
$ly-search-field-h: 48px; /* 48pt */
$ly-search-field-pad-l: 11px; /* 11pt */
$ly-search-field-pad-r: 10px; /* 10pt */
$ly-search-field-gap: 4px; /* 4pt */
$ly-search-field-icon: 17px; /* 17pt */
$ly-search-cancel: $ly-search-field-h;

.lingyun-search-bar {
  box-sizing: border-box;
  width: 100%;
  padding: 0 $ly-search-pad $ly-search-pad;
  pointer-events: none;

  &--fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 900;
    transition: bottom 0.25s ease;
  }

  &--safe {
    padding-bottom: calc(#{$ly-search-pad} + env(safe-area-inset-bottom));
  }

  /* 键盘顶起时：底栏贴键盘上沿，不再叠加 Home Indicator 占位 */
  &--keyboard {
    padding-bottom: $ly-search-pad;
  }

  &__row {
    pointer-events: auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    gap: 0;
    transition: gap 0.38s cubic-bezier(0.32, 0.72, 0, 1);
  }

  &--active &__row {
    gap: 12px; /* 12pt */
  }

  &__field {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex: 1;
    min-width: 0;
    height: $ly-search-field-h;
    padding: 0 $ly-search-field-pad-r 0 $ly-search-field-pad-l;
    gap: $ly-search-field-gap;
    box-sizing: border-box;
    @include lingyun-glass-regular;
    border-radius: $lingyun-glass-radius-pill;
    box-shadow: var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
      var(--lingyun-glass-shadow-raised, #{$lingyun-glass-shadow-raised});
  }

  &__icon {
    flex-shrink: 0;
  }

  &__query {
    flex: 1;
    min-width: 0;
    height: 20px;
    margin: 0;
    padding: 0;
    border: 0;
    outline: none;
    background: transparent;
    font-size: 17px;
    font-weight: 510;
    line-height: 20px;
    letter-spacing: -0.43px;
    color: var(--lingyun-label, #{$lingyun-main-color});
  }

  :deep(.lingyun-search-bar__query-ph) {
    color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
    font-size: 17px;
    font-weight: 510;
  }

  &__clear,
  &__mic,
  &__cancel {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__clear,
  &__mic {
    width: 22px;
    height: 22px;
    color: var(--lingyun-label-secondary, #{$lingyun-base-color});
  }

  &__clear--hover,
  &__mic--hover,
  &__cancel--hover {
    opacity: 0.72;
  }

  &__cancel-slot {
    flex-shrink: 0;
    width: 0;
    overflow: hidden;
    transition: width 0.38s cubic-bezier(0.32, 0.72, 0, 1);
  }

  &--active &__cancel-slot {
    width: $ly-search-cancel;
    overflow: visible;
  }

  &__cancel {
    width: $ly-search-cancel;
    height: $ly-search-cancel;
    @include lingyun-glass-regular;
    border-radius: 50%;
    color: var(--lingyun-label, #{$lingyun-main-color});
    box-shadow: var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
      var(--lingyun-glass-shadow-raised, #{$lingyun-glass-shadow-raised});
    transform: scale(0.84);
    opacity: 0;
    transition:
      transform 0.38s cubic-bezier(0.32, 0.72, 0, 1),
      opacity 0.28s ease;
  }

  &--active &__cancel {
    transform: scale(1);
    opacity: 1;
  }

  &__cancel-text {
    font-size: 13px;
    font-weight: 510;
    color: inherit;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lingyun-search-bar__row,
  .lingyun-search-bar__field,
  .lingyun-search-bar__cancel-slot,
  .lingyun-search-bar__cancel,
  .lingyun-search-bar__clear,
  .lingyun-search-bar__mic {
    transition: none;
  }
}
</style>
