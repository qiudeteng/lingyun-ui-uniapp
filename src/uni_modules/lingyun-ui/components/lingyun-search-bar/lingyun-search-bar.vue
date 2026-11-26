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
          @keyboardheightchange="onFieldKeyboardHeightChange"
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
          v-else-if="showMic"
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

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { inject, type PropType } from 'vue'
import { LINGYUN_APP_PAGE_NAV_INSET } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

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
 * @property {Boolean} showMic 空内容时是否显示语音按钮（默认 false，暂不支持语音输入）
 * @property {String} cancelText 取消文案；空则用符号
 * @property {Boolean} focus 外部请求聚焦
 * @event {Function} update:modelValue / input / confirm / clear / mic / cancel / focus / blur
 */
defineOptions({
  name: 'LingyunSearchBar',
})

const props = defineProps({
  modelValue: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  value: {
    type: String as PropType<string | undefined>,
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
  /** 空内容时的语音按钮。暂不支持语音输入，默认关闭 */
  showMic: {
    type: Boolean,
    default: false,
  },
  /**
   * 覆盖默认内边距（上 0、左右与下 28）。
   * 浮层里的搜索需要更小的左右边距，并补上边距。
   */
  padding: {
    type: String,
    default: '',
  },
  cancelText: {
    type: String,
    default: '',
  },
  focus: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:modelValue',
  'update:value',
  'input',
  'confirm',
  'clear',
  'mic',
  'cancel',
  'focus',
  'blur',
])

type SearchDetailEvent = {
  detail?: { value?: string | number; height?: number }
}

const pageNavInset = inject(LINGYUN_APP_PAGE_NAV_INSET, ref(0))
const instance = getCurrentInstance()

const localValue = ref('')
const innerFocused = ref(false)
/** 键盘高度（px）；fixed 底栏据此上推，避免被挡住 */
const keyboardHeight = ref(0)
const _blurTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _onFocusIn = ref<(() => void) | null>(null)
const _onFocusOut = ref<((event: FocusEvent) => void) | null>(null)
const _onKeyboardHeight = ref<((res: { height?: number }) => void) | null>(null)
const _onVisualViewport = ref<(() => void) | null>(null)

function setKeyboardHeight(height: unknown) {
  const next = Math.max(0, Number(height) || 0)
  if (next === keyboardHeight.value) return
  keyboardHeight.value = next
}

function clearBlurTimer() {
  if (!_blurTimer.value) return
  clearTimeout(_blurTimer.value)
  _blurTimer.value = null
}

const innerValue = computed(() => {
  if (props.modelValue !== undefined && props.modelValue !== null) return props.modelValue
  if (props.value !== undefined && props.value !== null) return props.value
  return localValue.value
})
const hasValue = computed(() => {
  return String(innerValue.value || '').length > 0
})
const active = computed(() => {
  return props.showCancel && (innerFocused.value || props.focus)
})
const rootClass = computed(() => {
  return [
    props.fixed ? 'lingyun-search-bar--fixed' : '',
    props.safeArea ? 'lingyun-search-bar--safe' : '',
    active.value ? 'lingyun-search-bar--active' : '',
    keyboardHeight.value > 0 ? 'lingyun-search-bar--keyboard' : '',
    hasValue.value ? 'lingyun-search-bar--value' : 'lingyun-search-bar--placeholder',
  ]
    .filter(Boolean)
    .join(' ')
})
const rootStyle = computed(() => {
  const style: Record<string, string> = {}
  const pad = String(props.padding || '').trim()
  if (pad) style.padding = pad
  if (props.fixed) style.left = `${Math.max(0, Number(pageNavInset.value) || 0)}px`
  if (props.fixed && keyboardHeight.value > 0) style.bottom = `${keyboardHeight.value}px`
  return style
})

function onFieldKeyboardHeightChange(event: Event) {
  const detail = (event as unknown as SearchDetailEvent).detail
  const height = detail ? detail.height : 0
  setKeyboardHeight(height)
}

function bindKeyboardHeight() {
  if (!props.fixed) return
  if (typeof uni === 'undefined' || typeof uni.onKeyboardHeightChange !== 'function') return
  const onKeyboardHeight = (res: { height?: number }) => {
    setKeyboardHeight(res && res.height)
  }
  _onKeyboardHeight.value = onKeyboardHeight
  uni.onKeyboardHeightChange(onKeyboardHeight)
}

function unbindKeyboardHeight() {
  const onKeyboardHeight = _onKeyboardHeight.value
  if (!onKeyboardHeight) return
  if (typeof uni !== 'undefined' && typeof uni.offKeyboardHeightChange === 'function') {
    uni.offKeyboardHeightChange(onKeyboardHeight)
  }
  _onKeyboardHeight.value = null
}

/* #ifdef H5 */
function bindVisualViewport() {
  const viewport = typeof window === 'undefined' ? null : window.visualViewport
  if (!props.fixed || !viewport) return
  const onVisualViewport = () => {
    const vv = window.visualViewport
    if (!vv) return
    const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
    setKeyboardHeight(covered > 80 ? covered : 0)
  }
  _onVisualViewport.value = onVisualViewport
  viewport.addEventListener('resize', onVisualViewport)
  viewport.addEventListener('scroll', onVisualViewport)
}

function unbindVisualViewport() {
  const onVisualViewport = _onVisualViewport.value
  const viewport = typeof window === 'undefined' ? null : window.visualViewport
  if (!onVisualViewport || !viewport) return
  viewport.removeEventListener('resize', onVisualViewport)
  viewport.removeEventListener('scroll', onVisualViewport)
  _onVisualViewport.value = null
}
/* #endif */

function setValue(next: unknown) {
  const value = next == null ? '' : String(next)
  localValue.value = value
  emit('update:modelValue', value)
  emit('update:value', value)
}

function onInput(event: Event) {
  const detail = (event as unknown as SearchDetailEvent).detail
  const value = detail ? detail.value : ''
  setValue(value)
  emit('input', value)
}

function onConfirm(event: Event) {
  const detail = (event as unknown as SearchDetailEvent).detail
  const value = detail ? detail.value : innerValue.value
  emit('confirm', value)
}

function queryInput(): HTMLInputElement | null {
  const root = instance?.proxy?.$el as { querySelector?: (selectors: string) => HTMLInputElement | null } | null
  if (!root || !root.querySelector) return null
  return root.querySelector('input')
}

function focusInput() {
  /* #ifdef H5 */
  const input = queryInput()
  if (input && input.focus) input.focus()
  /* #endif */
}

function blurInput() {
  /* #ifdef H5 */
  const input = queryInput()
  if (input && input.blur) input.blur()
  /* #endif */
  if (typeof uni !== 'undefined' && uni.hideKeyboard) uni.hideKeyboard()
}

function onFocus() {
  clearBlurTimer()
  innerFocused.value = true
  /* #ifdef H5 */
  if (typeof window !== 'undefined') {
    const x = window.scrollX
    const y = window.scrollY
    nextTick(() => window.scrollTo(x, y))
  }
  /* #endif */
  emit('focus')
}

function onBlur() {
  clearBlurTimer()
  _blurTimer.value = setTimeout(() => {
    innerFocused.value = false
    setKeyboardHeight(0)
    _blurTimer.value = null
    emit('blur')
  }, 160)
}

function onFieldClick() {
  const was = innerFocused.value
  clearBlurTimer()
  innerFocused.value = true
  focusInput()
  if (!was) emit('focus')
}

function onClear() {
  setValue('')
  emit('clear')
}

function onMic() {
  emit('mic')
}

function onCancel() {
  clearBlurTimer()
  setValue('')
  innerFocused.value = false
  setKeyboardHeight(0)
  blurInput()
  emit('cancel')
}

onMounted(() => {
  /* #ifdef H5 */
  nextTick(() => {
    const root = instance?.proxy?.$el
    if (!root || !root.addEventListener) return
    const handleFocusIn = () => onFocus()
    _onFocusIn.value = handleFocusIn
    const handleFocusOut = (event: FocusEvent) => {
      const next = event && event.relatedTarget
      if (next && root.contains && root.contains(next as Node)) return
      onBlur()
    }
    _onFocusOut.value = handleFocusOut
    root.addEventListener('focusin', handleFocusIn)
    root.addEventListener('focusout', handleFocusOut)
  })
  bindVisualViewport()
  /* #endif */
  bindKeyboardHeight()
})

onBeforeUnmount(() => {
  clearBlurTimer()
  unbindKeyboardHeight()
  /* #ifdef H5 */
  unbindVisualViewport()
  const root = instance?.proxy?.$el
  const handleFocusIn = _onFocusIn.value
  const handleFocusOut = _onFocusOut.value
  if (root && handleFocusIn) root.removeEventListener('focusin', handleFocusIn)
  if (root && handleFocusOut) root.removeEventListener('focusout', handleFocusOut)
  /* #endif */
})
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
    width: auto;
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
    @include lingyun-glass-control;
    border-radius: $lingyun-glass-radius-pill;
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
    @include lingyun-glass-control;
    border-radius: 50%;
    color: var(--lingyun-label, #{$lingyun-main-color});
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
