<template>
  <view class="lingyun-text-field" :class="rootClass" :style="rootStyle">
    <view v-if="showLabel" class="lingyun-text-field__label-row">
      <slot name="label">
        <text class="lingyun-text-field__label">{{ label }}</text>
      </slot>
    </view>

    <view class="lingyun-text-field__field" :class="fieldClass">
      <view v-if="$slots.leading" class="lingyun-text-field__leading">
        <slot name="leading" />
      </view>

      <!-- 对齐 uni-easyinput：原生控件直绑本地 val；勿 v-else（mp 会挂未赋值 r0） -->
      <view
        class="lingyun-text-field__control-wrap"
        :class="controlWrapClass"
        :style="isMultiline ? textareaWrapStyle : undefined"
        @touchstart="onControlTouchStart"
        @touchmove="onControlTouchMove"
      >
        <textarea
          v-if="isMultiline"
          class="lingyun-text-field__control lingyun-text-field__control--area"
          :class="controlClass"
          :value="val"
          :placeholder="placeholder"
          placeholder-class="lingyun-text-field__ph"
          :disabled="disabled || readonly"
          :maxlength="inputMaxlength"
          :auto-height="autoHeight"
          :focus="focused"
          :show-confirm-bar="false"
          :adjust-position="adjustPosition"
          :disable-default-padding="true"
          :cursor-spacing="resolvedCursorSpacing"
          :style="textareaStyle"
          @input="onInput"
          @focus="onNativeFocus"
          @blur="onNativeBlur"
          @confirm="onConfirm"
          @keyboardheightchange="onKeyboardHeightChange"
        />
        <input
          v-if="!isMultiline"
          class="lingyun-text-field__control"
          :class="controlClass"
          :type="nativeInputType"
          :password="isPasswordMasked"
          :value="val"
          :placeholder="placeholder"
          placeholder-class="lingyun-text-field__ph"
          :disabled="disabled"
          :readonly="readonly || undefined"
          :maxlength="inputMaxlength"
          :confirm-type="confirmType"
          :focus="focused"
          :adjust-position="adjustPosition"
          :cursor-spacing="resolvedCursorSpacing"
          @input="onInput"
          @focus="onNativeFocus"
          @blur="onNativeBlur"
          @confirm="onConfirm"
          @keyboardheightchange="onKeyboardHeightChange"
        />
      </view>

      <view
        v-if="showSecureToggle"
        class="lingyun-text-field__icon-btn"
        hover-class="lingyun-text-field__icon-btn--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        @click="onEyes"
      >
        <lingyun-icon
          :type="showPassword ? 'eye' : 'eye-slash'"
          :size="18"
          color="var(--lingyun-label-secondary, rgba(60,60,67,0.6))"
        />
      </view>

      <view
        v-if="showClear"
        class="lingyun-text-field__icon-btn"
        hover-class="lingyun-text-field__icon-btn--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        aria-label="Clear"
        @click="onClear"
      >
        <lingyun-icon
          type="clear"
          :size="18"
          color="var(--lingyun-label-secondary, rgba(60,60,67,0.6))"
        />
      </view>

      <view v-if="$slots.trailing" class="lingyun-text-field__trailing">
        <slot name="trailing" />
      </view>
    </view>

    <view v-if="showFooter" class="lingyun-text-field__footer">
      <slot name="hint">
        <text
          class="lingyun-text-field__hint"
          :class="{ 'lingyun-text-field__hint--error': hasError }"
        >
          {{ footerText }}
        </text>
      </slot>
    </view>
  </view>
</template>

<script>
import { useThemeStore } from '@/stores/theme'

/**
 * lingyun-text-field
 * @description 交互逻辑对齐 uni-easyinput；视觉对齐 Sketch Text Fields
 * @see src/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue
 * @see design/TEXTFIELDS.md · design/FORMS.md
 */
const FIELD_H = 52
const LINE_H = 22
const AREA_PAD_Y = 14

/** 预点亮焦点环后等原生 focus 的上限：超时未聚焦则撤销 */
const RING_GUARD_MS = 900
/** 起手位移超过此值视为滚动而非点击 */
const RING_MOVE_TOLERANCE_PX = 8

export default {
  name: 'LingyunTextField',
  emits: [
    'update:modelValue',
    'update:value',
    'input',
    'focus',
    'blur',
    'confirm',
    'clear',
    'change',
    'eyes',
    'keyboardheightchange',
  ],
  inject: {
    lingyunFormItem: { default: null },
  },
  props: {
    modelValue: { type: [String, Number], default: undefined },
    value: { type: [String, Number], default: undefined },
    label: { type: String, default: '' },
    placeholder: { type: String, default: ' ' },
    hint: { type: String, default: '' },
    error: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    /** 密码（对齐 easyinput type=password）；multiline 时忽略 */
    secure: { type: Boolean, default: false },
    passwordIcon: { type: Boolean, default: true },
    multiline: { type: Boolean, default: false },
    autoHeight: { type: Boolean, default: false },
    rows: { type: [Number, String], default: 3 },
    maxlength: { type: [Number, String], default: -1 },
    type: { type: String, default: 'text' },
    confirmType: { type: String, default: 'done' },
    focus: { type: Boolean, default: false },
    /**
     * field = Sketch 独立 Fill Tertiary 胶囊
     * cell = 分组列表行内嵌；auto = 有 form-item → cell
     */
    variant: { type: String, default: 'auto' },
    /** 光标与键盘间距；-1 自动 */
    cursorSpacing: { type: Number, default: -1 },
    adjustPosition: { type: Boolean, default: true },
    /** 是否去除空格：false | true(both) | both/left/right/start/end/all/none */
    trim: { type: [Boolean, String], default: false },
  },
  data() {
    return {
      /** 本地值（对齐 easyinput.val，勿直接用 prop 做 :value） */
      val: '',
      /** 驱动原生 :focus（对齐 easyinput.focused） */
      focused: false,
      /** 聚焦样式（对齐 easyinput.focusShow） */
      focusShow: false,
      showPassword: false,
      /** 回车确认时避免 blur 再发一次 change */
      isEnter: false,
    }
  },
  computed: {
    themeClass() {
      try {
        return useThemeStore().rootClass || 'theme-light'
      } catch {
        return 'theme-light'
      }
    },
    resolvedVariant() {
      const v = this.variant
      if (v === 'field' || v === 'cell') return v
      return this.lingyunFormItem ? 'cell' : 'field'
    },
    isCell() {
      return this.resolvedVariant === 'cell'
    },
    cellStack() {
      return !!(this.isCell && this.lingyunFormItem && this.lingyunFormItem.isStackLayout)
    },
    isMultiline() {
      return !!this.multiline || this.type === 'textarea'
    },
    isSecure() {
      return (!!this.secure || this.type === 'password') && !this.isMultiline
    },
    isPasswordMasked() {
      return this.isSecure && !this.showPassword
    },
    nativeInputType() {
      if (this.isSecure) return 'text'
      if (this.type === 'password' || this.type === 'textarea') return 'text'
      return this.type || 'text'
    },
    isVal() {
      const v = this.val
      return !!(v || v === 0)
    },
    hasError() {
      return String(this.error || '').length > 0
    },
    showLabel() {
      if (this.isCell) return false
      return !!(this.label || this.$slots.label)
    },
    showFooter() {
      if (this.isCell) return false
      if (this.$slots.hint) return true
      return this.hasError || String(this.hint || '').length > 0
    },
    footerText() {
      return this.hasError ? String(this.error) : String(this.hint || '')
    },
    inputMaxlength() {
      const n = Number(this.maxlength)
      if (!Number.isFinite(n) || n < 0) {
        /* 单行 -1 不限长；多行小程序对 -1 偶发失灵 */
        return this.isMultiline ? 10000 : -1
      }
      return Math.floor(n)
    },
    /** 对齐 easyinput：多行不显示清除 */
    showClear() {
      if (!this.clearable || this.disabled || this.readonly) return false
      if (this.isMultiline) return false
      return this.isVal
    },
    showSecureToggle() {
      return this.isSecure && this.passwordIcon && this.isVal && !this.disabled
    },
    resolvedCursorSpacing() {
      const n = Number(this.cursorSpacing)
      if (Number.isFinite(n) && n >= 0) return Math.floor(n)
      return this.showFooter ? 80 : 56
    },
    rootClass() {
      return [
        this.themeClass,
        this.disabled ? 'lingyun-text-field--disabled' : '',
        this.hasError ? 'lingyun-text-field--error' : '',
        this.focusShow ? 'lingyun-text-field--focused' : '',
        this.isMultiline ? 'lingyun-text-field--multiline' : '',
        this.isCell ? 'lingyun-text-field--cell' : 'lingyun-text-field--field',
        this.cellStack ? 'lingyun-text-field--cell-stack' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    rootStyle() {
      if (!this.isMultiline) return undefined
      const h = this.textareaHeightPx
      return {
        width: '100%',
        minHeight: `${h}px`,
      }
    },
    fieldClass() {
      return {
        'lingyun-text-field__field--error': this.hasError,
        'lingyun-text-field__field--focused': this.focusShow,
        'lingyun-text-field__field--disabled': this.disabled,
        'lingyun-text-field__field--multiline': this.isMultiline,
        'lingyun-text-field__field--cell': this.isCell,
      }
    },
    controlWrapClass() {
      return {
        'lingyun-text-field__control-wrap--multiline': this.isMultiline,
        'lingyun-text-field__control-wrap--cell': this.isCell,
      }
    },
    controlClass() {
      return {
        'lingyun-text-field__control--disabled': this.disabled,
        'lingyun-text-field__control--cell': this.isCell,
        'lingyun-text-field__control--cell-end': this.isCell && !this.cellStack && !this.isMultiline,
      }
    },
    textareaHeightPx() {
      const rows = Math.max(1, Number(this.rows) || 3)
      return Math.max(FIELD_H, AREA_PAD_Y * 2 + LINE_H * rows)
    },
    textareaWrapStyle() {
      if (this.autoHeight) {
        return { width: '100%', minHeight: `${this.textareaHeightPx}px` }
      }
      const h = this.textareaHeightPx
      return { width: '100%', height: `${h}px`, minHeight: `${h}px` }
    },
    textareaStyle() {
      if (this.autoHeight) {
        return { width: '100%', minHeight: `${this.textareaHeightPx}px` }
      }
      const h = this.textareaHeightPx
      return { width: '100%', height: `${h}px`, minHeight: `${h}px` }
    },
  },
  watch: {
    value(newVal) {
      if (newVal === null || newVal === undefined) {
        this.val = ''
        return
      }
      this.val = newVal
    },
    modelValue(newVal) {
      if (newVal === null || newVal === undefined) {
        this.val = ''
        return
      }
      this.val = newVal
    },
    focus(newVal) {
      this.$nextTick(() => {
        this.focused = !!newVal
        this.focusShow = !!newVal
      })
    },
  },
  created() {
    this.initVal()
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._ringGuardTimer = null
    /** 原生 focus 是否已到（预点亮的撤销依据） */
    this._nativeFocused = false
    this._ringTouchX = 0
    this._ringTouchY = 0
  },
  mounted() {
    this.$nextTick(() => {
      this.focused = !!this.focus
      this.focusShow = !!this.focus
    })
  },
  beforeUnmount() {
    this.clearRingGuard()
  },
  methods: {
    initVal() {
      if (this.value || this.value === 0) {
        this.val = this.value
      } else if (this.modelValue || this.modelValue === 0 || this.modelValue === '') {
        this.val = this.modelValue
      } else {
        this.val = ''
      }
    },
    onInput(event) {
      let value = event && event.detail ? event.detail.value : ''
      if (this.trim) {
        if (typeof this.trim === 'boolean' && this.trim) {
          value = this.trimStr(value)
        } else if (typeof this.trim === 'string') {
          value = this.trimStr(value, this.trim)
        }
      }
      this.val = value
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
      this.$emit('input', value)
    },
    /**
     * 焦点环不等原生 focus：真机上系统要等键盘唤起才回调，视觉会晚一大拍。
     * 按下即点亮，若最终没聚焦（滑动 / 点击被忽略）再撤销。
     */
    onControlTouchStart(event) {
      if (this.disabled || this.readonly || this.focusShow) return
      const touch = this.firstTouch(event)
      this._ringTouchX = Number(touch && touch.pageX) || 0
      this._ringTouchY = Number(touch && touch.pageY) || 0
      this.focusShow = true
      this.clearRingGuard()
      this._ringGuardTimer = setTimeout(() => {
        this._ringGuardTimer = null
        if (!this._nativeFocused) this.focusShow = false
      }, RING_GUARD_MS)
    },
    /** 起手就滑：这是滚动不是点击，撤销预点亮 */
    onControlTouchMove(event) {
      if (this._nativeFocused || this._ringGuardTimer == null) return
      const touch = this.firstTouch(event)
      if (!touch) return
      const dx = Math.abs((Number(touch.pageX) || 0) - this._ringTouchX)
      const dy = Math.abs((Number(touch.pageY) || 0) - this._ringTouchY)
      if (dx < RING_MOVE_TOLERANCE_PX && dy < RING_MOVE_TOLERANCE_PX) return
      this.clearRingGuard()
      this.focusShow = false
    },
    firstTouch(event) {
      const list = (event && (event.touches || event.changedTouches)) || []
      return list[0] || null
    },
    clearRingGuard() {
      if (this._ringGuardTimer != null) {
        clearTimeout(this._ringGuardTimer)
        this._ringGuardTimer = null
      }
    },
    onNativeFocus(event) {
      this._nativeFocused = true
      this.clearRingGuard()
      this.focusShow = true
      this.$emit('focus', event)
    },
    onNativeBlur(event) {
      this._nativeFocused = false
      this.clearRingGuard()
      this.focusShow = false
      this.focused = false
      this.$emit('blur', event)
      if (this.isEnter === false) {
        this.$emit('change', this.val)
      }
    },
    onConfirm() {
      this.$emit('confirm', this.val)
      this.isEnter = true
      this.$emit('change', this.val)
      this.$nextTick(() => {
        this.isEnter = false
      })
    },
    onClear() {
      this.val = ''
      this.$emit('input', '')
      this.$emit('update:modelValue', '')
      this.$emit('update:value', '')
      this.$emit('clear')
    },
    onEyes() {
      this.showPassword = !this.showPassword
      this.$emit('eyes', this.showPassword)
    },
    onKeyboardHeightChange(event) {
      this.$emit('keyboardheightchange', event)
    },
    trimStr(str, pos = 'both') {
      const s = str == null ? '' : String(str)
      if (pos === 'both') return s.trim()
      if (pos === 'left' || pos === 'start') return s.replace(/^\s+/, '')
      if (pos === 'right' || pos === 'end') return s.replace(/\s+$/, '')
      if (pos === 'all') return s.replace(/\s+/g, '')
      return s
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

$ly-tf-h: 52px;
$ly-tf-radius: 26px;
$ly-tf-pad-x: 16px;
$ly-tf-gap: 8px;
$ly-tf-label-mb: 6px;
$ly-tf-footer-mt: 6px;
$ly-tf-icon: 22px;

.lingyun-text-field {
  width: 100%;
  box-sizing: border-box;
  /* virtualHost 时仍保证占满父级 */
  flex: 1;
  position: relative;
  text-align: left;
}

.lingyun-text-field--cell {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.lingyun-text-field--cell.lingyun-text-field--multiline {
  flex: none;
  display: block;
  width: 100%;
  align-self: stretch;
}

.lingyun-text-field--cell .lingyun-text-field__field {
  width: 100%;
}

.lingyun-text-field--cell.lingyun-text-field--multiline .lingyun-text-field__field {
  display: block;
  width: 100%;
  min-height: 66px;
}

.lingyun-text-field__label-row {
  margin-bottom: $ly-tf-label-mb;
  padding: 0 4px;
}

.lingyun-text-field__label {
  display: block;
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-text-field__field {
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-height: $ly-tf-h;
  padding: 0 $ly-tf-pad-x;
  gap: $ly-tf-gap;
  border-radius: $ly-tf-radius;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  border: 1px solid transparent;
}

.lingyun-text-field__field--cell {
  min-height: 36px;
  padding: 0;
  gap: 8px;
  border-radius: 0;
  background-color: transparent;
  border-color: transparent;
}

.lingyun-text-field__field--multiline {
  align-items: flex-start;
  padding-top: 12px;
  padding-bottom: 12px;
}

.lingyun-text-field__field--cell.lingyun-text-field__field--multiline {
  padding-top: 0;
  padding-bottom: 0;
}

.lingyun-text-field__field--focused:not(.lingyun-text-field__field--cell) {
  border-color: rgba(0, 122, 255, 0.35);
}

.lingyun-text-field__field--error:not(.lingyun-text-field__field--cell) {
  border-color: var(--lingyun-system-red, #{$lingyun-system-red});
}

.lingyun-text-field__field--disabled {
  opacity: 0.45;
}

.lingyun-text-field.theme-dark .lingyun-text-field__field:not(.lingyun-text-field__field--cell) {
  background-color: #{$lingyun-fill-tertiary-dark};
}

.lingyun-text-field.theme-dark .lingyun-text-field__field--focused:not(.lingyun-text-field__field--cell) {
  border-color: rgba(10, 132, 255, 0.45);
}

.lingyun-text-field.theme-dark .lingyun-text-field__field--error:not(.lingyun-text-field__field--cell) {
  border-color: #{$lingyun-system-red-dark};
}

.lingyun-text-field__leading,
.lingyun-text-field__trailing {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.lingyun-text-field__control-wrap {
  flex: 1;
  min-width: 0;
  width: 0;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.lingyun-text-field__control-wrap--cell {
  width: auto;
  min-height: 36px;
}

.lingyun-text-field__control-wrap--multiline {
  flex: none;
  width: 100%;
  min-width: 0;
  min-height: 66px;
  align-self: stretch;
  box-sizing: border-box;
}

.lingyun-text-field__control-wrap--cell.lingyun-text-field__control-wrap--multiline {
  width: 100%;
  min-width: 0;
  flex: none;
}

.lingyun-text-field__control {
  display: block;
  width: 100%;
  height: 36px;
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
  background: transparent;
  border: none;
  box-sizing: border-box;
}

.lingyun-text-field__control--cell {
  width: 100%;
  min-height: 36px;
}

.lingyun-text-field__control--cell-end {
  text-align: right;
}

.lingyun-text-field__control--area {
  width: 100%;
  height: 66px;
  min-height: 66px;
  padding: 0;
  margin: 0;
  line-height: 22px;
  box-sizing: border-box;
}

.lingyun-text-field__field--cell .lingyun-text-field__control--area {
  min-height: 66px;
}

.lingyun-text-field.theme-dark .lingyun-text-field__control {
  color: #{$lingyun-label-dark};
}

.lingyun-text-field__ph {
  color: var(--lingyun-placeholder-text, #{$lingyun-placeholder-text});
}

.lingyun-text-field.theme-dark .lingyun-text-field__ph {
  color: #{$lingyun-placeholder-text-dark};
}

.lingyun-text-field__icon-btn {
  flex-shrink: 0;
  width: $ly-tf-icon;
  height: $ly-tf-icon;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-text-field__icon-btn--hover {
  opacity: 0.7;
}

.lingyun-text-field__footer {
  margin-top: $ly-tf-footer-mt;
  padding: 0 4px;
}

.lingyun-text-field__hint {
  display: block;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-text-field__hint--error {
  color: var(--lingyun-system-red, #{$lingyun-system-red});
}

.lingyun-text-field.theme-dark .lingyun-text-field__hint {
  color: #{$lingyun-label-secondary-dark};
}

.lingyun-text-field.theme-dark .lingyun-text-field__hint--error {
  color: #{$lingyun-system-red-dark};
}

.lingyun-text-field.theme-dark .lingyun-text-field__label {
  color: #{$lingyun-label-secondary-dark};
}
</style>
