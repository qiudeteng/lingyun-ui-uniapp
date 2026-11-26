<template>
  <view
    v-if="mounted"
    class="lingyun-action-sheet"
    :class="rootClass"
    :style="rootStyle"
  >
    <view
      class="lingyun-action-sheet__overlay"
      @click="onOverlayClick"
      @touchmove.stop.prevent
    />

    <view
      class="lingyun-action-sheet__stack"
      :style="stackPadStyle"
      @touchmove.stop
    >
      <!-- 动作组：玻璃节点不做 opacity 显隐 -->
      <view class="lingyun-action-sheet__group" role="dialog" :aria-modal="'true'">
        <view v-if="hasHeader" class="lingyun-action-sheet__header">
          <text v-if="title" class="lingyun-action-sheet__title">{{ title }}</text>
          <text v-if="message" class="lingyun-action-sheet__message">{{ message }}</text>
        </view>

        <view
          v-for="(action, index) in resolvedActions"
          :key="action.key || index"
          class="lingyun-action-sheet__row"
          :class="rowClass(action)"
          hover-class="lingyun-action-sheet__row--hover"
          :hover-start-time="20"
          :hover-stay-time="70"
          role="button"
          :aria-disabled="action.disabled ? 'true' : 'false'"
          @click="onAction(action, index)"
        >
          <text class="lingyun-action-sheet__row-label">{{ action.text }}</text>
        </view>
      </view>

      <view
        v-if="showCancel"
        class="lingyun-action-sheet__group lingyun-action-sheet__group--cancel"
        hover-class="lingyun-action-sheet__row--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        @click="onCancel"
      >
        <text class="lingyun-action-sheet__cancel-label">{{ cancelText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { inject, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { syncLingyunMpOverlayHold } from '../../utils/mp-overlay-gate'
import {
  LINGYUN_APP_PAGE_SCROLL_LOCK,
  type LingyunAppPageScrollLock,
} from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

type ActionSheetAction = {
  key?: string | number
  text?: string | number
  role?: string
  disabled?: boolean
  close?: boolean | null
}

type ResolvedAction = {
  key?: string | number
  text: string
  role: 'destructive' | 'default'
  disabled: boolean
  close: boolean | null | undefined
}

/**
 * lingyun-action-sheet
 * @description 对齐 HIG Action Sheets + Liquid Glass；两组玻璃卡（动作 + Cancel）
 * @see design/ACTIONSHEETS.md
 * @see https://developer.apple.com/design/human-interface-guidelines/action-sheets
 *
 * 玻璃：§6.2-A.1（surface + 全端 blur）；位移在 stack，不对玻璃节点写 opacity。
 */
const LEAVE_MS = 250
const ENTER_KICK_MS = 48
const INSET_X = 8
const GAP_CANCEL = 8
const PAD_BOTTOM = 8

defineOptions({
  name: 'LingyunActionSheet',
})

const props = defineProps({
  show: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  modelValue: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  actions: { type: Array as PropType<ActionSheetAction[]>, default: () => [] as ActionSheetAction[] },
  cancelText: { type: String, default: 'Cancel' },
  showCancel: { type: Boolean, default: true },
  maskClosable: { type: Boolean, default: true },
  closeOnAction: { type: Boolean, default: true },
  zIndex: { type: [Number, String] as PropType<number | string>, default: 1100 },
})

const emit = defineEmits(['update:show', 'update:modelValue', 'action', 'close', 'cancel'])

const appPageScrollLock = inject(LINGYUN_APP_PAGE_SCROLL_LOCK, null)

const mounted = ref(false)
const phase = ref('')
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const enterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const safeBottom = ref(0)
const _appScrollLocked = ref(false)
const _scrollLocked = ref(false)
const _prevBodyOverflow = ref('')
const _prevBodyOverscroll = ref('')
const _prevHtmlOverscroll = ref('')
const _lingyunMpOverlayHold = ref(false)

const visible = computed((): boolean => {
  if (props.show !== undefined && props.show !== null) return !!props.show
  if (props.modelValue !== undefined && props.modelValue !== null) return !!props.modelValue
  return false
})

const reduceMotion = computed((): boolean => {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  } catch {
    /* ignore */
  }
  return false
})

const hasHeader = computed((): boolean => !!(props.title || props.message))

const resolvedActions = computed((): ResolvedAction[] => {
  const list = Array.isArray(props.actions) ? props.actions : []
  return list
    .filter((a): a is ActionSheetAction & { text: string | number } => !!(a && a.text))
    .map((a) => {
      const role = a.role === 'destructive' ? 'destructive' : 'default'
      return {
        key: a.key,
        text: String(a.text),
        role,
        disabled: a.disabled === true,
        close: a.close,
      }
    })
})

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* pinia 未就绪 */
  }
  return [
    themeClass,
    phase.value ? `lingyun-action-sheet--${phase.value}` : '',
    reduceMotion.value ? 'lingyun-action-sheet--reduce-motion' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const rootStyle = computed((): Record<string, number> => {
  return {
    zIndex: Number(props.zIndex) || 1100,
  }
})

const stackPadStyle = computed((): Record<string, string> => {
  const bottom = PAD_BOTTOM + (Number(safeBottom.value) || 0)
  return {
    paddingLeft: `${INSET_X}px`,
    paddingRight: `${INSET_X}px`,
    paddingBottom: `${bottom}px`,
  }
})

function syncSafe(): void {
  try {
    const info =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    const inset = info && info.safeAreaInsets
    safeBottom.value = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
  } catch {
    safeBottom.value = 0
  }
}

function clearTimers(): void {
  if (leaveTimer.value) {
    clearTimeout(leaveTimer.value)
    leaveTimer.value = null
  }
  if (enterTimer.value) {
    clearTimeout(enterTimer.value)
    enterTimer.value = null
  }
}

function lockPageScroll(): void {
  try {
    const lockApi = appPageScrollLock as LingyunAppPageScrollLock | null
    if (lockApi && typeof lockApi.lock === 'function' && !_appScrollLocked.value) {
      lockApi.lock()
      _appScrollLocked.value = true
    }
  } catch {
    /* 不在 app-page 内 */
  }
  // #ifdef H5
  if (typeof document === 'undefined') return
  if (_scrollLocked.value) return
  const body = document.body
  const html = document.documentElement
  _prevBodyOverflow.value = body.style.overflow
  _prevBodyOverscroll.value = body.style.overscrollBehavior
  _prevHtmlOverscroll.value = html.style.overscrollBehavior
  body.style.overflow = 'hidden'
  body.style.overscrollBehavior = 'none'
  html.style.overscrollBehavior = 'none'
  _scrollLocked.value = true
  // #endif
}

function unlockPageScroll(): void {
  try {
    const lockApi = appPageScrollLock as LingyunAppPageScrollLock | null
    if (_appScrollLocked.value && lockApi && typeof lockApi.unlock === 'function') {
      lockApi.unlock()
    }
    _appScrollLocked.value = false
  } catch {
    _appScrollLocked.value = false
  }
  // #ifdef H5
  if (typeof document === 'undefined') return
  if (!_scrollLocked.value) return
  const body = document.body
  const html = document.documentElement
  body.style.overflow = _prevBodyOverflow.value || ''
  body.style.overscrollBehavior = _prevBodyOverscroll.value || ''
  html.style.overscrollBehavior = _prevHtmlOverscroll.value || ''
  _scrollLocked.value = false
  // #endif
}

function openAnim(): void {
  clearTimers()
  mounted.value = true
  phase.value = 'enter'
  nextTick(() => {
    const kick = () => {
      enterTimer.value = setTimeout(
        () => {
          phase.value = 'open'
          enterTimer.value = null
        },
        reduceMotion.value ? 16 : ENTER_KICK_MS,
      )
    }
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        requestAnimationFrame(kick)
      })
    } else {
      kick()
    }
  })
}

function closeAnim(): void {
  clearTimers()
  if (!mounted.value) {
    unlockPageScroll()
    return
  }
  phase.value = 'leave'
  leaveTimer.value = setTimeout(
    () => {
      mounted.value = false
      phase.value = ''
      leaveTimer.value = null
      unlockPageScroll()
    },
    reduceMotion.value ? 16 : LEAVE_MS,
  )
}

function setVisible(next: unknown): void {
  const val = !!next
  emit('update:show', val)
  emit('update:modelValue', val)
  if (!val) emit('close')
}

function close(): void {
  setVisible(false)
}

function onOverlayClick(): void {
  if (!props.maskClosable) return
  close()
}

function rowClass(action: ResolvedAction): Record<string, boolean> {
  return {
    'lingyun-action-sheet__row--destructive': action.role === 'destructive',
    'lingyun-action-sheet__row--disabled': action.disabled,
  }
}

function onAction(action: ResolvedAction, index: number): void {
  if (!action || action.disabled) return
  const payload = { action, index }
  emit('action', payload)
  const shouldClose =
    action.close !== undefined && action.close !== null
      ? !!action.close
      : props.closeOnAction !== false
  if (shouldClose) close()
}

function onCancel(): void {
  emit('cancel')
  close()
}

watch(
  visible,
  (val: boolean) => {
    if (val) {
      syncSafe()
      lockPageScroll()
      openAnim()
    } else {
      closeAnim()
    }
  },
  { immediate: true },
)

watch(
  phase,
  (value: string) => {
    _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
      !!_lingyunMpOverlayHold.value,
      !!value,
    )
  },
  { immediate: true },
)

onMounted(() => {
  syncSafe()
})

onBeforeUnmount(() => {
  _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
    !!_lingyunMpOverlayHold.value,
    false,
  )
  clearTimers()
  unlockPageScroll()
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

$ly-as-radius: 14px;
$ly-as-row-h: 57px;
$ly-as-gap-cancel: 8px;

.lingyun-action-sheet {
  position: fixed;
  inset: 0;
  z-index: 1100;
  pointer-events: auto;
  box-sizing: border-box;
}

.lingyun-action-sheet__overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: var(--lingyun-mask, #{$lingyun-mask});
  opacity: 0;
  transition: opacity 0.28s ease-out;
}

.lingyun-action-sheet.theme-dark .lingyun-action-sheet__overlay {
  background-color: rgba(0, 0, 0, 0.52);
}

.lingyun-action-sheet__stack {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: $ly-as-gap-cancel;
  box-sizing: border-box;
  transform: translate3d(0, 100%, 0);
  transition: transform 0.42s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
}

/* —— 玻璃组：§6.2-A.1 —— */
.lingyun-action-sheet__group {
  position: relative;
  overflow: hidden;
  border-radius: $ly-as-radius;
  box-sizing: border-box;
  @include lingyun-glass-surface;
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  box-shadow:
    var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    var(--lingyun-glass-shadow, #{$lingyun-glass-shadow});
}

.lingyun-action-sheet.theme-dark .lingyun-action-sheet__group {
  border: #{$lingyun-glass-hairline-dark};
  background-color: #{$lingyun-glass-overlay-bg-dark};
  box-shadow: #{$lingyun-glass-highlight-dark}, #{$lingyun-glass-shadow-dark};
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-action-sheet__group--cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: $ly-as-row-h;
  padding: 0 16px;
}

.lingyun-action-sheet__cancel-label {
  font-size: 20px;
  font-weight: 600;
  line-height: 24px;
  text-align: center;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-action-sheet__header {
  padding: 14px 16px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-action-sheet__title {
  width: 100%;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-action-sheet__message {
  width: 100%;
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  text-align: center;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-action-sheet__row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: $ly-as-row-h;
  padding: 0 16px;
  box-sizing: border-box;
}

.lingyun-action-sheet__row + .lingyun-action-sheet__row {
  border-top: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-action-sheet__row--hover {
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-action-sheet__row-label {
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
  text-align: center;
  color: var(--lingyun-link, #{$lingyun-link});
}

.lingyun-action-sheet__row--destructive .lingyun-action-sheet__row-label {
  color: var(--lingyun-error, #{$lingyun-error});
}

.lingyun-action-sheet__row--disabled {
  pointer-events: none;
}

.lingyun-action-sheet__row--disabled .lingyun-action-sheet__row-label {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

/* 相位：位移在 stack，遮罩淡入淡出 */
.lingyun-action-sheet--enter {
  .lingyun-action-sheet__overlay {
    opacity: 0;
  }
  .lingyun-action-sheet__stack {
    transform: translate3d(0, 100%, 0);
  }
}

.lingyun-action-sheet--open {
  .lingyun-action-sheet__overlay {
    opacity: 1;
  }
  .lingyun-action-sheet__stack {
    transform: translate3d(0, 0, 0);
  }
}

.lingyun-action-sheet--leave {
  pointer-events: none;

  .lingyun-action-sheet__overlay {
    opacity: 0;
    transition: opacity 0.22s ease-in;
  }
  .lingyun-action-sheet__stack {
    transform: translate3d(0, 100%, 0);
    transition: transform 0.24s cubic-bezier(0.4, 0, 1, 1);
  }
}

.lingyun-action-sheet--reduce-motion {
  .lingyun-action-sheet__overlay,
  .lingyun-action-sheet__stack {
    transition-duration: 0.01s !important;
  }

  &.lingyun-action-sheet--enter .lingyun-action-sheet__stack,
  &.lingyun-action-sheet--leave .lingyun-action-sheet__stack,
  &.lingyun-action-sheet--open .lingyun-action-sheet__stack {
    transform: translate3d(0, 0, 0) !important;
  }
}
</style>
