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
          :name="name || undefined"
          :autocomplete="autocomplete || undefined"
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
          @keyboardheightchange="onFieldKeyboardHeightChange"
        />
        <input
          v-if="!isMultiline"
          class="lingyun-text-field__control"
          :class="controlClass"
          :type="nativeInputType"
          :password="nativePassword"
          :name="name || undefined"
          :autocomplete="autocomplete || undefined"
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
          @keyboardheightchange="onFieldKeyboardHeightChange"
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

<script setup lang="ts">
import { computed, getCurrentInstance, inject, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import type { PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'

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

defineOptions({
  name: 'LingyunTextField',
})

const props = defineProps({
  modelValue: {
    type: [String, Number] as PropType<string | number | undefined>,
    default: undefined,
  },
  value: {
    type: [String, Number] as PropType<string | number | undefined>,
    default: undefined,
  },
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
  rows: { type: [Number, String] as PropType<number | string>, default: 3 },
  maxlength: { type: [Number, String] as PropType<number | string>, default: -1 },
  type: { type: String, default: 'text' },
  /** H5 自动填充提示；登录账号 / 密码建议传 username / current-password */
  autocomplete: { type: String, default: '' },
  /** 原生表单字段名，浏览器密码管理器用它匹配账号密码 */
  name: { type: String, default: '' },
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
  trim: { type: [Boolean, String] as PropType<boolean | string>, default: false },
})

const emit = defineEmits([
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
])

const lingyunFormItem = inject<{ isStackLayout?: boolean } | null>('lingyunFormItem', null)

const instance = getCurrentInstance()
const slots = useSlots()

/** 本地值（对齐 easyinput.val，勿直接用 prop 做 :value） */
const val = ref('' as string | number)
/** 驱动原生 :focus（对齐 easyinput.focused） */
const focused = ref(false)
/** 聚焦样式（对齐 easyinput.focusShow） */
const focusShow = ref(false)
const showPassword = ref(false)
/** 回车确认时避免 blur 再发一次 change */
const isEnter = ref(false)
const _ringGuardTimer = ref<ReturnType<typeof setTimeout> | null>(null)
/** 原生 focus 是否已到（预点亮的撤销依据） */
const _nativeFocused = ref(false)
const _ringTouchX = ref(0)
const _ringTouchY = ref(0)
const _autofillInput = ref<HTMLInputElement | null>(null)
const _autofillSync = ref<(() => void) | null>(null)
const _autofillTimers = ref<ReturnType<typeof setTimeout>[]>([])

const themeClass = computed(() => {
  try {
    return useLingyunTheme().rootClass || 'theme-light'
  } catch {
    return 'theme-light'
  }
})

const resolvedVariant = computed(() => {
  const v = props.variant
  if (v === 'field' || v === 'cell') return v
  return lingyunFormItem ? 'cell' : 'field'
})

const isCell = computed(() => {
  return resolvedVariant.value === 'cell'
})

const cellStack = computed(() => {
  const item = lingyunFormItem as { isStackLayout?: boolean } | null
  return !!(isCell.value && item && item.isStackLayout)
})

const isMultiline = computed(() => {
  return !!props.multiline || props.type === 'textarea'
})

const isSecure = computed(() => {
  return (!!props.secure || props.type === 'password') && !isMultiline.value
})

const isPasswordMasked = computed(() => {
  return isSecure.value && !showPassword.value
})

/** 遮住时走原生密码框，系统不会切到中文输入法。点眼睛后改回文本，才能看见明文。 */
const nativePassword = computed(() => {
  return isPasswordMasked.value
})

const nativeInputType = computed(() => {
  if (isPasswordMasked.value) {
    /* 微信 input 没有 type=password，用上面的 password 属性。H5 必须是 password，圆点样式挡不住中文输入法。 */
    let kind = 'text'
    // #ifdef H5
    kind = 'password'
    // #endif
    return kind
  }
  if (props.type === 'password' || props.type === 'textarea') return 'text'
  return props.type || 'text'
})

const isVal = computed(() => {
  const v = val.value
  return !!(v || v === 0)
})

const hasError = computed(() => {
  return String(props.error || '').length > 0
})

const showLabel = computed(() => {
  if (isCell.value) return false
  return !!(props.label || slots.label)
})

const showFooter = computed(() => {
  if (isCell.value) return false
  if (slots.hint) return true
  return hasError.value || String(props.hint || '').length > 0
})

const footerText = computed(() => {
  return hasError.value ? String(props.error) : String(props.hint || '')
})

const inputMaxlength = computed(() => {
  const n = Number(props.maxlength)
  if (!Number.isFinite(n) || n < 0) {
    /* 单行 -1 不限长；多行小程序对 -1 偶发失灵 */
    return isMultiline.value ? 10000 : -1
  }
  return Math.floor(n)
})

/** 对齐 easyinput：多行不显示清除 */
const showClear = computed(() => {
  if (!props.clearable || props.disabled || props.readonly) return false
  if (isMultiline.value) return false
  return isVal.value
})

const showSecureToggle = computed(() => {
  return isSecure.value && props.passwordIcon && isVal.value && !props.disabled
})

const resolvedCursorSpacing = computed(() => {
  const n = Number(props.cursorSpacing)
  if (Number.isFinite(n) && n >= 0) return Math.floor(n)
  return showFooter.value ? 80 : 56
})

const textareaHeightPx = computed(() => {
  const rows = Math.max(1, Number(props.rows) || 3)
  return Math.max(FIELD_H, AREA_PAD_Y * 2 + LINE_H * rows)
})

const textareaWrapStyle = computed(() => {
  if (props.autoHeight) {
    return { width: '100%', minHeight: `${textareaHeightPx.value}px` }
  }
  const h = textareaHeightPx.value
  return { width: '100%', height: `${h}px`, minHeight: `${h}px` }
})

const textareaStyle = computed(() => {
  if (props.autoHeight) {
    return { width: '100%', minHeight: `${textareaHeightPx.value}px` }
  }
  const h = textareaHeightPx.value
  return { width: '100%', height: `${h}px`, minHeight: `${h}px` }
})

const rootClass = computed(() => {
  return [
    themeClass.value,
    props.disabled ? 'lingyun-text-field--disabled' : '',
    hasError.value ? 'lingyun-text-field--error' : '',
    focusShow.value ? 'lingyun-text-field--focused' : '',
    isMultiline.value ? 'lingyun-text-field--multiline' : '',
    isCell.value ? 'lingyun-text-field--cell' : 'lingyun-text-field--field',
    cellStack.value ? 'lingyun-text-field--cell-stack' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const rootStyle = computed(() => {
  if (!isMultiline.value) return undefined
  const h = textareaHeightPx.value
  return {
    width: '100%',
    minHeight: `${h}px`,
  }
})

const fieldClass = computed(() => {
  return {
    'lingyun-text-field__field--error': hasError.value,
    'lingyun-text-field__field--focused': focusShow.value,
    'lingyun-text-field__field--disabled': props.disabled,
    'lingyun-text-field__field--multiline': isMultiline.value,
    'lingyun-text-field__field--cell': isCell.value,
  }
})

const controlWrapClass = computed(() => {
  return {
    'lingyun-text-field__control-wrap--multiline': isMultiline.value,
    'lingyun-text-field__control-wrap--cell': isCell.value,
  }
})

const controlClass = computed(() => {
  return {
    'lingyun-text-field__control--disabled': props.disabled,
    'lingyun-text-field__control--cell': isCell.value,
    'lingyun-text-field__control--cell-end': isCell.value && !cellStack.value && !isMultiline.value,
  }
})

function firstTouch(event: TouchEvent): Touch | null {
  const list: ArrayLike<Touch> = (event && (event.touches || event.changedTouches)) || []
  return list[0] || null
}

function clearRingGuard(): void {
  if (_ringGuardTimer.value != null) {
    clearTimeout(_ringGuardTimer.value)
    _ringGuardTimer.value = null
  }
}

function trimStr(str: unknown, pos: string = 'both'): string {
  const s = str == null ? '' : String(str)
  if (pos === 'both') return s.trim()
  if (pos === 'left' || pos === 'start') return s.replace(/^\s+/, '')
  if (pos === 'right' || pos === 'end') return s.replace(/\s+$/, '')
  if (pos === 'all') return s.replace(/\s+/g, '')
  return s
}

function initVal(): void {
  const current = props.value
  const model = props.modelValue
  if (current || current === 0) {
    val.value = current as string | number
  } else if (model || model === 0 || model === '') {
    val.value = model as string | number
  } else {
    val.value = ''
  }
}

/** H5：浏览器自动填充不一定会走 uni-input 的 input 事件，主动同步原生值，避免占位符与填充值重叠 */
function bindAutofillSync(): void {
  // #ifdef H5
  if (typeof document === 'undefined') return
  const root = instance?.proxy?.$el as HTMLElement | undefined
  const input =
    root && typeof root.querySelector === 'function'
      ? (root.querySelector('input') as HTMLInputElement | null)
      : null
  if (!input) return
  if (props.autocomplete) input.setAttribute('autocomplete', props.autocomplete)
  if (props.name) input.setAttribute('name', props.name)
  _autofillInput.value = input
  const sync = () => {
    const value = input.value == null ? '' : String(input.value)
    if (value === String(val.value == null ? '' : val.value)) return
    val.value = value
    emit('update:modelValue', value)
    emit('update:value', value)
    emit('input', value)
  }
  _autofillSync.value = sync
  input.addEventListener('animationstart', sync)
  input.addEventListener('focus', sync)
  input.addEventListener('change', sync)
  _autofillTimers.value = [80, 360, 1200].map((delay) => setTimeout(sync, delay))
  // #endif
}

function unbindAutofillSync(): void {
  // #ifdef H5
  const input = _autofillInput.value
  const sync = _autofillSync.value
  if (input && sync) {
    input.removeEventListener('animationstart', sync)
    input.removeEventListener('focus', sync)
    input.removeEventListener('change', sync)
  }
  _autofillInput.value = null
  _autofillSync.value = null
  _autofillTimers.value.forEach((timer) => clearTimeout(timer))
  _autofillTimers.value = []
  // #endif
}

function onInput(event: Event): void {
  const detail = (event as unknown as { detail?: { value?: string } }).detail
  let value = (detail ? detail.value : '') as string
  if (props.trim) {
    if (typeof props.trim === 'boolean' && props.trim) {
      value = trimStr(value)
    } else if (typeof props.trim === 'string') {
      value = trimStr(value, props.trim)
    }
  }
  val.value = value
  emit('update:modelValue', value)
  emit('update:value', value)
  emit('input', value)
}

/**
 * 焦点环不等原生 focus：真机上系统要等键盘唤起才回调，视觉会晚一大拍。
 * 按下即点亮，若最终没聚焦（滑动 / 点击被忽略）再撤销。
 */
function onControlTouchStart(event: TouchEvent): void {
  if (props.disabled || props.readonly || focusShow.value) return
  const touch = firstTouch(event)
  _ringTouchX.value = Number(touch && touch.pageX) || 0
  _ringTouchY.value = Number(touch && touch.pageY) || 0
  focusShow.value = true
  clearRingGuard()
  _ringGuardTimer.value = setTimeout(() => {
    _ringGuardTimer.value = null
    if (!_nativeFocused.value) focusShow.value = false
  }, RING_GUARD_MS)
}

/** 起手就滑：这是滚动不是点击，撤销预点亮 */
function onControlTouchMove(event: TouchEvent): void {
  if (_nativeFocused.value || _ringGuardTimer.value == null) return
  const touch = firstTouch(event)
  if (!touch) return
  const dx = Math.abs((Number(touch.pageX) || 0) - _ringTouchX.value)
  const dy = Math.abs((Number(touch.pageY) || 0) - _ringTouchY.value)
  if (dx < RING_MOVE_TOLERANCE_PX && dy < RING_MOVE_TOLERANCE_PX) return
  clearRingGuard()
  focusShow.value = false
}

function onNativeFocus(event: Event): void {
  _nativeFocused.value = true
  clearRingGuard()
  focusShow.value = true
  emit('focus', event)
}

function onNativeBlur(event: Event): void {
  _nativeFocused.value = false
  clearRingGuard()
  focusShow.value = false
  focused.value = false
  emit('blur', event)
  if (isEnter.value === false) {
    emit('change', val.value)
  }
}

function onConfirm(): void {
  emit('confirm', val.value)
  isEnter.value = true
  emit('change', val.value)
  nextTick(() => {
    isEnter.value = false
  })
}

function onClear(): void {
  val.value = ''
  emit('input', '')
  emit('update:modelValue', '')
  emit('update:value', '')
  emit('clear')
}

function onEyes(): void {
  showPassword.value = !showPassword.value
  emit('eyes', showPassword.value)
}

function onFieldKeyboardHeightChange(event: Event): void {
  emit('keyboardheightchange', event)
}

watch(
  () => props.value,
  (newVal: string | number | undefined) => {
    if (newVal === null || newVal === undefined) {
      val.value = ''
      return
    }
    val.value = newVal
  },
)

watch(
  () => props.modelValue,
  (newVal: string | number | undefined) => {
    if (newVal === null || newVal === undefined) {
      val.value = ''
      return
    }
    val.value = newVal
  },
)

watch(
  () => props.focus,
  (newVal: boolean) => {
    nextTick(() => {
      focused.value = !!newVal
      focusShow.value = !!newVal
    })
  },
)

initVal()
_ringGuardTimer.value = null
_nativeFocused.value = false
_ringTouchX.value = 0
_ringTouchY.value = 0

onMounted(() => {
  nextTick(() => {
    focused.value = !!props.focus
    focusShow.value = !!props.focus
    bindAutofillSync()
  })
})

onBeforeUnmount(() => {
  clearRingGuard()
  unbindAutofillSync()
})
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

/* H5：收掉浏览器原生密码眼睛，避免和组件自己的显隐按钮重复 */
/* #ifdef H5 */
.lingyun-text-field__control :deep(.uni-input-input)::-ms-reveal,
.lingyun-text-field__control :deep(.uni-input-input)::-ms-clear,
.lingyun-text-field__control :deep(.uni-input-input)::-webkit-credentials-auto-fill-button,
.lingyun-text-field__control :deep(.uni-input-input)::-webkit-strong-password-auto-fill-button,
.lingyun-text-field__control :deep(.uni-input-input)::-webkit-contacts-auto-fill-button,
.lingyun-text-field__control :deep(.uni-input-input)::-webkit-textfield-decoration-container {
  display: none !important;
  visibility: hidden !important;
  width: 0 !important;
  height: 0 !important;
  pointer-events: none !important;
}

/* 自动填充：盖掉浏览器默认深色底色，文字跟随当前主题 */
.lingyun-text-field__control :deep(.uni-input-input):-webkit-autofill,
.lingyun-text-field__control :deep(.uni-input-input):-webkit-autofill:hover,
.lingyun-text-field__control :deep(.uni-input-input):-webkit-autofill:focus {
  -webkit-text-fill-color: var(--lingyun-label, #000000) !important;
  caret-color: var(--lingyun-label, #000000);
  -webkit-box-shadow: 0 0 0 1000px var(--lingyun-fill-tertiary, #f2f2f7) inset !important;
  box-shadow: 0 0 0 1000px var(--lingyun-fill-tertiary, #f2f2f7) inset !important;
  transition: background-color 999999s ease-in-out 0s;
}

.lingyun-text-field--cell
  .lingyun-text-field__control
  :deep(.uni-input-input):-webkit-autofill,
.lingyun-text-field--cell
  .lingyun-text-field__control
  :deep(.uni-input-input):-webkit-autofill:hover,
.lingyun-text-field--cell
  .lingyun-text-field__control
  :deep(.uni-input-input):-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px
    var(--lingyun-bg-grouped-secondary, #ffffff) inset !important;
  box-shadow: 0 0 0 1000px var(--lingyun-bg-grouped-secondary, #ffffff) inset !important;
}

@keyframes lingyun-text-field-autofill {
  from {
    opacity: 1;
  }
  to {
    opacity: 1;
  }
}

.lingyun-text-field__control :deep(.uni-input-input):-webkit-autofill {
  animation: lingyun-text-field-autofill 0.001s;
}
/* #endif */

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
