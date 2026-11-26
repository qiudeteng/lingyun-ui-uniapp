<template>
  <view
    v-if="mounted"
    class="lingyun-alert"
    :class="rootClass"
    :style="rootStyle"
    @touchmove.stop.prevent
  >
    <view class="lingyun-alert__overlay" @click="onOverlayClick" />
    <view class="lingyun-alert__lift" :style="liftStyle">
      <view class="lingyun-alert__panel" :class="panelClass" role="dialog" :aria-modal="'true'">
        <view v-if="showHeader" class="lingyun-alert__header">
          <text v-if="title" class="lingyun-alert__title">{{ title }}</text>
          <text v-if="message" class="lingyun-alert__message">{{ message }}</text>
          <slot name="header" />
        </view>

        <view v-if="hasInputs" class="lingyun-alert__inputs">
          <lingyun-text-field
            v-for="(field, index) in normalizedInputs"
            :key="field.key || index"
            class="lingyun-alert__field"
            variant="field"
            :model-value="fieldValues[index]"
            :type="field.type || 'text'"
            :secure="field.password === true"
            :multiline="field.multiline === true"
            :auto-height="field.autoHeight === true"
            :rows="field.rows || 3"
            :password-icon="false"
            :clearable="false"
            :placeholder="field.placeholder || ''"
            :maxlength="field.maxlength != null ? field.maxlength : 140"
            :focus="index === 0 && autoFocus && focusReady"
            :adjust-position="false"
            :cursor-spacing="24"
            @update:model-value="onFieldValue(index, $event)"
            @focus="onInputFocus"
            @blur="onInputBlur"
            @keyboardheightchange="onInputKeyboardHeight"
          />
        </view>

        <slot />

        <view v-if="resolvedActions.length" class="lingyun-alert__actions" :class="actionsClass">
          <view
            v-for="(action, index) in resolvedActions"
            :key="action.key || index"
            class="lingyun-alert__action"
            :class="actionClass(action)"
            hover-class="lingyun-alert__action--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            role="button"
            @click="onAction(action, index)"
          >
            <text class="lingyun-alert__action-label">{{ action.text }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, ref, useSlots, watch } from 'vue'
import { type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { syncLingyunMpOverlayHold } from '../../utils/mp-overlay-gate'

/**
 * lingyun-alert
 * @description 对齐 Apple iOS 27 UI Kit Alerts/Light（Sketch）+ HIG + Liquid Glass
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Alerts%252FLight
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/0EFA1982-BC98-4765-B33C-D36DA54BD0D5#Inspect
 * @see https://developer.apple.com/design/human-interface-guidelines/alerts
 * @see design/ALERTS.md
 *
 * 动效对齐系统 UIAlertController：
 * - 入场：遮罩淡入；面板由约 1.16 倍弹性缩至 1（缩放在 lift，面板本身不做 opacity，以免小程序弄坏玻璃 blur）
 * - 退场：遮罩淡出；面板略缩至约 0.92
 * - 尊重 prefers-reduced-motion
 * - 点遮罩且 maskClosable=false：面板水平轻抖（对齐密码框拒绝反馈；系统 Alert 本身是静默忽略）
 * - 含输入框：键盘弹起时面板上移，保持在可视区（adjust-position=false + keyboardHeight）
 * 暗黑：根节点自挂 theme-*（小程序 styleIsolation 下父级 .theme-dark 选不中面板）
 * 玻璃：对齐 Sheet（#fff@0.72 + blur）；勿对玻璃节点写 opacity 显隐 */
const LEAVE_MS = 240
const NUDGE_MS = 420
/** H5 visualViewport 在键盘动画中会连续触发，等高度稳定后再上推面板 */
const VISUAL_VIEWPORT_DEBOUNCE_MS = 60
/** 小程序 keyboardheightchange 也会连续上报中间高度；等稳定后再移动面板 */
const MP_KEYBOARD_SETTLE_MS = 90
/** 输入弹窗打开后稍等 textarea 挂载稳定再聚焦，避免原生输入层闪一下失焦 */
const INPUT_FOCUS_DELAY_MS = 220
/** 关闭时等待键盘收起的兜底时间 */
const CLOSE_KB_TIMEOUT_MS = 320

type AlertInputField = {
  key?: string
  type?: string
  password?: boolean
  value?: unknown
  placeholder?: string
  maxlength?: number
  /** 多行文本（备注 / notes）；等价于 type=textarea */
  multiline?: boolean
  /** 多行时随内容增高 */
  autoHeight?: boolean
  /** 多行时的行数，默认 3 */
  rows?: number | string
}

type AlertAction = {
  key?: string
  text?: string
  role?: string
  primary?: boolean
  disabled?: boolean
  close?: boolean
  onClick?: (payload: AlertActionPayload) => void
}

type AlertActionPayload = {
  action: AlertAction
  index: number
  values: string[]
  inputs: Array<AlertInputField & { value: string }>
}

/** input / keyboardheightchange：detail 可选，target 保持 unknown，避免窄于原生或 uni 事件 */
type AlertFieldEvent = {
  detail?: { value?: unknown; height?: unknown }
  target?: unknown
}

type KeyboardHeightHandler = (result: UniNamespace.OnKeyboardHeightChangeResult) => void

defineOptions({
  name: 'LingyunAlert',
})

const props = defineProps({
  show: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  modelValue: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  actions: {
    type: Array as PropType<AlertAction[]>,
    default: () => [],
  },
  layout: {
    type: String,
    default: 'auto',
  },
  inputs: {
    type: Array as PropType<AlertInputField[]>,
    default: () => [],
  },
  maskClosable: {
    type: Boolean,
    default: false,
  },
  closeOnAction: {
    type: Boolean,
    default: true,
  },
  autoFocus: {
    type: Boolean,
    default: true,
  },
  zIndex: {
    type: [Number, String] as PropType<number | string>,
    default: 1000,
  },
})

const emit = defineEmits([
  'update:show',
  'update:modelValue',
  'action',
  'close',
  'update:inputs',
  'input',
])

const slots = useSlots()
const instance = getCurrentInstance()

const fieldValues = ref<string[]>([])
const mounted = ref(false)
/** enter | open | leave */
const phase = ref<'' | 'enter' | 'open' | 'leave'>('')
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const enterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
/** 打开后允许自动聚焦；等输入框挂载稳定再置位 */
const focusReady = ref(false)
const focusTimer = ref<ReturnType<typeof setTimeout> | null>(null)
/** 拒绝点遮罩关闭时的轻抖 */
const rejectNudge = ref(false)
const nudgeTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _blurKbTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _visualViewportTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _kbHeightTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _closeKbTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _pendingClose = ref(false)
/** 退场期间冻结键盘上推量，避免面板先跳回中间再淡出 */
const _closeLiftPx = ref<number | null>(null)
const _onKeyboardHeight = ref<KeyboardHeightHandler | null>(null)
const _onVisualViewport = ref<(() => void) | null>(null)
/** 键盘高度（含输入框时上推面板） */
const keyboardHeight = ref(0)
/** 面板实测高度，用于贴键盘定位 */
const panelHeightPx = ref(0)
const _lingyunMpOverlayHold = ref(false)

const visible = computed((): boolean => {
  if (props.show !== undefined && props.show !== null) return !!props.show
  if (props.modelValue !== undefined && props.modelValue !== null) return !!props.modelValue
  return false
})

const showHeader = computed((): boolean => !!(props.title || props.message || slots.header))

const normalizedInputs = computed((): AlertInputField[] => {
  const list = Array.isArray(props.inputs) ? props.inputs.slice(0, 2) : []
  return list.filter((field): field is AlertInputField => !!field)
})

const hasInputs = computed((): boolean => normalizedInputs.value.length > 0)

const resolvedActions = computed((): AlertAction[] => {
  return (props.actions || []).filter((action): action is AlertAction => !!(action && action.text))
})

const resolvedLayout = computed((): string => {
  if (props.layout === 'row' || props.layout === 'stack') return props.layout
  return resolvedActions.value.length >= 3 ? 'stack' : 'row'
})

const actionsClass = computed((): string => {
  return resolvedLayout.value === 'stack'
    ? 'lingyun-alert__actions--stack'
    : 'lingyun-alert__actions--row'
})

const reduceMotion = computed((): boolean => {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  } catch (e) {
    /* ignore */
  }
  return false
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
    `lingyun-alert--${resolvedLayout.value}`,
    hasInputs.value ? 'lingyun-alert--with-inputs' : '',
    phase.value ? `lingyun-alert--${phase.value}` : '',
    reduceMotion.value ? 'lingyun-alert--reduce-motion' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const rootStyle = computed((): Record<string, number> => {
  return {
    zIndex: Number(props.zIndex) || 1000,
  }
})

const panelClass = computed((): Record<string, boolean> => {
  return {
    'lingyun-alert__panel--nudge': rejectNudge.value && !reduceMotion.value,
  }
})

function estimatePanelHeight(): number {
  let h = 28
  if (props.title) h += 22
  if (props.message) h += 44
  if (props.title || props.message) h += 42
  h += normalizedInputs.value.reduce((sum, field) => {
    if (field.multiline === true || field.type === 'textarea') {
      const rows = Math.max(1, Number(field.rows) || 3)
      return sum + Math.max(66, 28 + 22 * rows) + 12
    }
    return sum + 64
  }, 0)
  if (resolvedActions.value.length) {
    h += resolvedLayout.value === 'stack'
      ? resolvedActions.value.length * 48 + 12
      : 48
  }
  return h
}

/** 键盘弹起时上移量：面板底边贴在键盘上方（小间距），避免旧算法 kb*0.58 抬得过高留白过大 */
const keyboardLiftPx = computed((): number => {
  if (_closeLiftPx.value != null) return _closeLiftPx.value
  const kb = Math.max(0, Number(keyboardHeight.value) || 0)
  if (kb < 40) return 0
  let winH = 667
  try {
    const info =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    winH = Number(info && info.windowHeight) || winH
  } catch {
    /* ignore */
  }
  const gap = 16
  const pad = 24
  const panelH = Math.max(120, Number(panelHeightPx.value) || estimatePanelHeight())
  const centerY = winH / 2
  /* 无 lift 时底边 ≈ centerY + panelH/2；目标底边 = 键盘顶 - gap */
  let lift = centerY + panelH / 2 - (winH - kb - gap)
  const maxLift = Math.max(0, centerY - panelH / 2 - pad)
  if (lift < 0) lift = 0
  if (lift > maxLift) lift = maxLift
  return Math.round(lift)
})

const liftStyle = computed((): Record<string, string> => {
  /*
   * scale 放 lift，勿放 panel：同元素 opacity/scale 会搞坏小程序 backdrop-filter。
   * 键盘上推用布局（margin-bottom）而不是 transform：小程序原生输入文字层
   * 不会跟着祖先 transform 同步移动，之前的「文字滞后」就是两者不同步。
   */
  const y = keyboardLiftPx.value
  let scale = 1
  if (!reduceMotion.value) {
    /* 输入弹窗不做缩放入场，但退场时可以正常缩：此时键盘已收起、输入已失焦 */
    if (phase.value === 'enter' && !hasInputs.value) scale = 1.16
    else if (phase.value === 'leave') scale = 0.92
  }
  const transform = scale !== 1 ? `scale(${scale})` : 'none'
  /* flex 垂直居中：margin-bottom = 2y 让面板中心上移 y */
  const marginBottom = y > 0 ? `${Math.round(y * 2)}px` : '0px'
  const leaving = phase.value === 'leave'
  return {
    transform,
    marginBottom,
    /*
     * 布局位移不做补间：过渡期间原生输入文字层会和 WXSS 外壳不同步，
     * 出现文字闪烁/上移。键盘本身有系统动画，这里一次布局到位。
     */
    transition: reduceMotion.value
      ? 'none'
      : leaving
        ? 'transform 0.24s cubic-bezier(0.4, 0, 1, 1)'
        : 'transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)',
  }
})

function clearTimers(): void {
  if (leaveTimer.value) {
    clearTimeout(leaveTimer.value)
    leaveTimer.value = null
  }
  if (enterTimer.value) {
    clearTimeout(enterTimer.value)
    enterTimer.value = null
  }
  if (focusTimer.value) {
    clearTimeout(focusTimer.value)
    focusTimer.value = null
  }
  if (_kbHeightTimer.value) {
    clearTimeout(_kbHeightTimer.value)
    _kbHeightTimer.value = null
  }
  focusReady.value = false
  if (nudgeTimer.value) {
    clearTimeout(nudgeTimer.value)
    nudgeTimer.value = null
  }
  rejectNudge.value = false
}

function setKeyboardHeight(height: unknown): void {
  const next = Math.max(0, Number(height) || 0)
  if (next === keyboardHeight.value) return
  keyboardHeight.value = next
  if (next > 0) measurePanelHeight()
  if (next === 0 && _pendingClose.value) finishPendingClose()
}

function resetKeyboardLift(): void {
  clearTimeout(_blurKbTimer.value ?? undefined)
  _blurKbTimer.value = null
  clearTimeout(_kbHeightTimer.value ?? undefined)
  _kbHeightTimer.value = null
  clearTimeout(_closeKbTimer.value ?? undefined)
  _closeKbTimer.value = null
  _pendingClose.value = false
  _closeLiftPx.value = null
  setKeyboardHeight(0)
  panelHeightPx.value = 0
  unbindKeyboardHeight()
  /* #ifdef H5 */
  unbindVisualViewport()
  /* #endif */
}

function measurePanelHeight(): void {
  if (!hasInputs.value || !mounted.value) return
  nextTick(() => {
    try {
      const q = uni.createSelectorQuery().in(instance?.proxy as never)
      q.select('.lingyun-alert__panel')
        .boundingClientRect((rect) => {
          const node = rect && !Array.isArray(rect) ? rect : null
          const h = node && node.height ? Number(node.height) : 0
          if (h > 40 && h !== panelHeightPx.value) panelHeightPx.value = h
        })
        .exec()
    } catch {
      /* ignore */
    }
  })
}

function onInputFocus(): void {
  if (!hasInputs.value) return
  /* 第一格 blur 后马上点第二格时，别让旧的清零定时器把键盘高度打回 0 */
  clearTimeout(_blurKbTimer.value ?? undefined)
  _blurKbTimer.value = null
  clearTimeout(_kbHeightTimer.value ?? undefined)
  _kbHeightTimer.value = null
  bindKeyboardHeight()
  measurePanelHeight()
  /* #ifdef H5 */
  bindVisualViewport()
  /* #endif */
}

function onInputBlur(): void {
  clearTimeout(_kbHeightTimer.value ?? undefined)
  _kbHeightTimer.value = null
  /* 延迟清零：切到下一输入框时避免闪回中间 */
  clearTimeout(_blurKbTimer.value ?? undefined)
  _blurKbTimer.value = setTimeout(() => {
    setKeyboardHeight(0)
    _blurKbTimer.value = null
  }, 80)
}

function queueKeyboardHeight(height: unknown): void {
  const next = Math.max(0, Number(height) || 0)
  clearTimeout(_kbHeightTimer.value ?? undefined)
  if (next <= 0) {
    _kbHeightTimer.value = null
    setKeyboardHeight(0)
    return
  }
  _kbHeightTimer.value = setTimeout(() => {
    _kbHeightTimer.value = null
    setKeyboardHeight(next)
  }, MP_KEYBOARD_SETTLE_MS)
}

function onInputKeyboardHeight(event: AlertFieldEvent): void {
  const height = event && event.detail ? event.detail.height : 0
  clearTimeout(_blurKbTimer.value ?? undefined)
  let deferred = false
  // #ifdef MP-WEIXIN
  deferred = true
  // #endif
  if (deferred) queueKeyboardHeight(height)
  else setKeyboardHeight(height)
}

function bindKeyboardHeight(): void {
  if (_onKeyboardHeight.value) return
  if (typeof uni === 'undefined' || typeof uni.onKeyboardHeightChange !== 'function') return
  const handler: KeyboardHeightHandler = (res: UniNamespace.OnKeyboardHeightChangeResult) => {
    queueKeyboardHeight(res && res.height)
  }
  _onKeyboardHeight.value = handler
  uni.onKeyboardHeightChange(handler)
}

function unbindKeyboardHeight(): void {
  const handler = _onKeyboardHeight.value
  if (!handler) return
  if (typeof uni !== 'undefined' && typeof uni.offKeyboardHeightChange === 'function') {
    const offKeyboard = uni.offKeyboardHeightChange as (callback?: KeyboardHeightHandler) => void
    offKeyboard(handler)
  }
  _onKeyboardHeight.value = null
}

/* #ifdef H5 */
function bindVisualViewport(): void {
  if (_onVisualViewport.value) return
  if (typeof window === 'undefined' || !window.visualViewport) return
  const handler = () => {
    clearTimeout(_visualViewportTimer.value ?? undefined)
    _visualViewportTimer.value = setTimeout(() => {
      _visualViewportTimer.value = null
      const vv = window.visualViewport
      if (!vv) return
      const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKeyboardHeight(covered > 80 ? covered : 0)
    }, VISUAL_VIEWPORT_DEBOUNCE_MS)
  }
  _onVisualViewport.value = handler
  window.visualViewport.addEventListener('resize', handler)
  window.visualViewport.addEventListener('scroll', handler)
}

function unbindVisualViewport(): void {
  clearTimeout(_visualViewportTimer.value ?? undefined)
  _visualViewportTimer.value = null
  if (!_onVisualViewport.value || typeof window === 'undefined' || !window.visualViewport) {
    _onVisualViewport.value = null
    return
  }
  const handler = _onVisualViewport.value
  window.visualViewport.removeEventListener('resize', handler)
  window.visualViewport.removeEventListener('scroll', handler)
  _onVisualViewport.value = null
}
/* #endif */

function openAnim(): void {
  clearTimers()
  _pendingClose.value = false
  _closeLiftPx.value = null
  clearTimeout(_closeKbTimer.value ?? undefined)
  _closeKbTimer.value = null
  mounted.value = true
  phase.value = 'enter'
  /*
   * 输入弹窗不做缩放入场；聚焦延后到输入框挂载稳定之后。
   * 小程序 textarea 在首帧/动画期间翻转 focus 容易闪一下失焦。
   */
  if (hasInputs.value && props.autoFocus) {
    focusTimer.value = setTimeout(() => {
      focusReady.value = true
      focusTimer.value = null
    }, reduceMotion.value ? 0 : INPUT_FOCUS_DELAY_MS)
  }
  nextTick(() => {
    enterTimer.value = setTimeout(() => {
      phase.value = 'open'
      enterTimer.value = null
      if (hasInputs.value) measurePanelHeight()
    }, reduceMotion.value ? 0 : 20)
  })
}

/**
 * 关闭入口：键盘开着时先收键盘，等它落下去再播正常的 alert 退场。
 * 直接播退场会让面板在键盘收起过程中突然消失，出现闪烁。
 */
function beginClose(): void {
  if (!mounted.value) {
    phase.value = ''
    resetKeyboardLift()
    return
  }
  const keyboardEngaged = hasInputs.value && keyboardHeight.value > 0
  if (!keyboardEngaged) {
    _closeLiftPx.value = null
    closeAnim()
    return
  }
  /* 冻结当前上推量：键盘收起后按这个位置退场，不再跳回中间 */
  clearTimeout(_kbHeightTimer.value ?? undefined)
  _kbHeightTimer.value = null
  _closeLiftPx.value = keyboardLiftPx.value
  _pendingClose.value = true
  clearTimeout(_closeKbTimer.value ?? undefined)
  _closeKbTimer.value = setTimeout(() => {
    _closeKbTimer.value = null
    finishPendingClose()
  }, CLOSE_KB_TIMEOUT_MS)
  try {
    if (typeof uni !== 'undefined' && typeof uni.hideKeyboard === 'function') {
      uni.hideKeyboard()
    }
  } catch {
    /* 端不支持时等兜底超时 */
  }
}

function finishPendingClose(): void {
  if (!_pendingClose.value) return
  _pendingClose.value = false
  clearTimeout(_closeKbTimer.value ?? undefined)
  _closeKbTimer.value = null
  closeAnim()
}

function closeAnim(): void {
  if (!mounted.value) {
    phase.value = ''
    resetKeyboardLift()
    return
  }
  _pendingClose.value = false
  clearTimeout(_closeKbTimer.value ?? undefined)
  _closeKbTimer.value = null
  if (_closeLiftPx.value == null && keyboardHeight.value > 0) {
    _closeLiftPx.value = keyboardLiftPx.value
  }
  clearTimers()
  phase.value = 'leave'
  const wait = reduceMotion.value ? 0 : LEAVE_MS
  leaveTimer.value = setTimeout(() => {
    mounted.value = false
    phase.value = ''
    leaveTimer.value = null
    /* 退场期间保持键盘上推量，动画结束后再清，避免中途跳回 */
    resetKeyboardLift()
  }, wait)
}

function actionClass(action: AlertAction): string {
  const role = resolveRole(action)
  const primary = isPrimary(action)
  return [
    `lingyun-alert__action--${role}`,
    primary ? 'lingyun-alert__action--primary' : 'lingyun-alert__action--secondary',
  ].join(' ')
}

function resolveRole(action: AlertAction | null | undefined): string {
  const role = action && action.role
  if (role === 'destructive' || role === 'cancel' || role === 'primary' || role === 'secondary') {
    return role === 'primary' ? 'normal' : role
  }
  return 'normal'
}

function isPrimary(action: AlertAction | null | undefined): boolean {
  if (!action) return false
  if (action.primary === true) return true
  if (action.primary === false) return false
  if (action.role === 'primary') return true
  if (action.role === 'cancel' || action.role === 'secondary') return false
  const list = resolvedActions.value
  if (!list.length) return false
  if (resolvedLayout.value === 'stack') return list[0] === action
  return list[list.length - 1] === action
}

function onFieldValue(index: number, value: unknown): void {
  const next = fieldValues.value.slice()
  next[index] = value == null ? '' : String(value)
  fieldValues.value = next
  emit('input', { index, value: next[index], values: next.slice() })
  emit('update:inputs', buildInputsPayload(next))
  const autoGrow = normalizedInputs.value.some(
    (field) =>
      (field.multiline === true || field.type === 'textarea') &&
      field.autoHeight === true,
  )
  if (autoGrow) measurePanelHeight()
}

function buildInputsPayload(values: string[]) {
  return normalizedInputs.value.map((field, i) => ({
    ...field,
    value: values[i] != null ? values[i] : '',
  }))
}

function close(): void {
  emit('update:show', false)
  emit('update:modelValue', false)
  emit('close')
}

/**
 * 系统 UIAlertController 点 dimming 是静默忽略；
 * 此处用水平轻抖 + 短震动，表达「须点按钮关闭」（同密码错误抖动语汇）。
 */
function onOverlayClick(): void {
  if (props.maskClosable) {
    close()
    return
  }
  if (phase.value !== 'open') return
  playRejectNudge()
}

function playRejectNudge(): void {
  try {
    const vibrateOptions: UniNamespace.VibrateShortOptions & { type: 'medium' } = {
      type: 'medium',
    }
    uni.vibrateShort(vibrateOptions)
  } catch {
    try {
      uni.vibrateShort({})
    } catch {
      /* 部分端无震动 */
    }
  }
  if (reduceMotion.value) return
  rejectNudge.value = false
  nextTick(() => {
    rejectNudge.value = true
    if (nudgeTimer.value) clearTimeout(nudgeTimer.value)
    nudgeTimer.value = setTimeout(() => {
      rejectNudge.value = false
      nudgeTimer.value = null
    }, NUDGE_MS)
  })
}

function onAction(action: AlertAction | null | undefined, index: number): void {
  if (!action || action.disabled) return
  if (phase.value === 'leave') return
  const payload = {
    action,
    index,
    values: fieldValues.value.slice(),
    inputs: buildInputsPayload(fieldValues.value),
  }
  emit('action', payload)
  if (typeof action.onClick === 'function') {
    action.onClick(payload)
  }
  if (props.closeOnAction !== false && action.close !== false) {
    close()
  }
}

watch(
  () => props.inputs,
  (list: AlertInputField[]) => {
    const next = (Array.isArray(list) ? list.slice(0, 2) : []).map((field) =>
      field && field.value != null ? String(field.value) : '',
    )
    fieldValues.value = next
  },
  { immediate: true, deep: true },
)

watch(
  visible,
  (val: boolean) => {
    if (val) {
      if (hasInputs.value) {
        fieldValues.value = normalizedInputs.value.map((f) =>
          f && f.value != null ? String(f.value) : '',
        )
      }
      openAnim()
      if (hasInputs.value) {
        bindKeyboardHeight()
        /* #ifdef H5 */
        bindVisualViewport()
        /* #endif */
      }
    } else {
      beginClose()
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

onBeforeUnmount(() => {
  _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
    !!_lingyunMpOverlayHold.value,
    false,
  )
  clearTimers()
  resetKeyboardLift()
})
// #ifndef VUE3
onBeforeUnmount(() => {
  clearTimers()
  resetKeyboardLift()
})
// #endif
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

/* Sketch Alerts/Light：1pt = 1px */
$ly-alert-width: 300px;
$ly-alert-radius: 34px;
$ly-alert-pad: 14px;
$ly-header-pad-x: 8px;
$ly-header-pad-top: 8px;
$ly-header-pad-bottom: 24px;
$ly-header-gap: 10px;
$ly-action-h: 48px;
$ly-action-gap-row: 8px;
$ly-action-gap-stack: 12px;
$ly-field-gap: 12px;

.lingyun-alert {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 24px;
  pointer-events: auto;
}

.lingyun-alert__overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: var(--lingyun-mask, #{$lingyun-mask});
  opacity: 0;
  transition: opacity 0.28s ease-out;
}

.lingyun-alert__lift {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: $ly-alert-width;
  display: flex;
  justify-content: center;
}

.lingyun-alert__panel {
  position: relative;
  z-index: 1;
  width: $ly-alert-width;
  max-width: 100%;
  box-sizing: border-box;
  padding: $ly-alert-pad;
  display: flex;
  flex-direction: column;
  align-items: center;
  /*
   * 玻璃对齐 Sheet：surface + blur + #fff@0.72。
   * 禁止对本节点做 opacity 显隐——小程序上会让 backdrop-filter 失效，看起来「完全不透」。
   * 缩放动效在 __lift。
   */
  @include lingyun-glass-surface;
  border-radius: $ly-alert-radius;
  /* Sketch Regular Large：外阴影 blur 48 / y 8 / a 0.25 */
  box-shadow:
    var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    0 8px 48px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

/* 拒绝点遮罩关闭：水平轻抖（对齐 UITextField 校验失败语汇） */
.lingyun-alert__panel--nudge {
  animation: lingyun-alert-nudge 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes lingyun-alert-nudge {
  0%,
  100% {
    transform: translateX(0);
  }
  12% {
    transform: translateX(-11px);
  }
  24% {
    transform: translateX(11px);
  }
  36% {
    transform: translateX(-8px);
  }
  48% {
    transform: translateX(8px);
  }
  60% {
    transform: translateX(-4px);
  }
  72% {
    transform: translateX(4px);
  }
  84% {
    transform: translateX(-2px);
  }
}

/* Dark：Regular Large #1a1a1a@0.7 + 浅灰描边 */
.lingyun-alert.theme-dark .lingyun-alert__overlay {
  background-color: rgba(0, 0, 0, 0.52);
}

.lingyun-alert.theme-dark .lingyun-alert__panel {
  /* 写死 token，避免 styleIsolation 下仍继承到父级 Light 的 CSS 变量 */
  border: #{$lingyun-glass-hairline-dark};
  box-shadow:
    #{$lingyun-glass-highlight-dark},
    0 8px 48px rgba(0, 0, 0, 0.45);
  background-color: #{$lingyun-glass-overlay-bg-dark};
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

/* 入场起点：只淡遮罩；面板缩放在 lift（保持 panel opacity=1 以保住玻璃） */
.lingyun-alert--enter {
  .lingyun-alert__overlay {
    opacity: 0;
  }
}

/* 入场完成 / 稳态 */
.lingyun-alert--open {
  .lingyun-alert__overlay {
    opacity: 1;
  }
}

/* 退场：遮罩淡出；面板缩放在 lift */
.lingyun-alert--leave {
  pointer-events: none;

  .lingyun-alert__overlay {
    opacity: 0;
    transition: opacity 0.22s ease-in;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lingyun-alert__overlay {
    transition: opacity 0.12s ease !important;
  }
}

.lingyun-alert--reduce-motion {
  .lingyun-alert__overlay {
    transition: opacity 0.12s ease !important;
  }

  .lingyun-alert__panel--nudge {
    animation: none !important;
  }
}

.lingyun-alert__header {
  width: 100%;
  box-sizing: border-box;
  padding: $ly-header-pad-top $ly-header-pad-x $ly-header-pad-bottom;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $ly-header-gap;
}

.lingyun-alert__title {
  width: 100%;
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  text-align: center;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-alert__message {
  width: 100%;
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  text-align: center;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-alert__inputs {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: $ly-field-gap;
  margin-bottom: 14px;
}

.lingyun-alert__field {
  width: 100%;
}

.lingyun-alert__actions {
  width: 100%;
  display: flex;
  box-sizing: border-box;
}

.lingyun-alert__actions--row {
  flex-direction: row;
  align-items: center;
  gap: $ly-action-gap-row;
}

.lingyun-alert__actions--stack {
  flex-direction: column;
  align-items: stretch;
  gap: $ly-action-gap-stack;
}

.lingyun-alert__action {
  flex: 1;
  min-width: 0;
  height: $ly-action-h;
  box-sizing: border-box;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $lingyun-glass-radius-pill;
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
  transition: transform 0.16s ease, opacity 0.16s ease;
}

.lingyun-alert__actions--stack .lingyun-alert__action {
  flex: none;
  width: 100%;
}

.lingyun-alert__action--hover {
  transform: scale(0.98);
  opacity: 0.92;
}

.lingyun-alert__action-label {
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  text-align: center;
  color: var(--lingyun-label, #{$lingyun-label});
}

/* Sketch 「1 Primary」 */
.lingyun-alert__action--primary {
  background-color: var(--lingyun-primary, #{$lingyun-primary});
}

.lingyun-alert__action--primary .lingyun-alert__action-label {
  color: #ffffff;
}

/* Destructive：灰底 + System Red 文案（Buttons Stacked） */
.lingyun-alert__action--destructive:not(.lingyun-alert__action--primary)
  .lingyun-alert__action-label {
  color: var(--lingyun-error, #{$lingyun-error});
}

.lingyun-alert__action--destructive.lingyun-alert__action--primary {
  background-color: var(--lingyun-error, #{$lingyun-error});
}

.lingyun-alert__action--destructive.lingyun-alert__action--primary .lingyun-alert__action-label {
  color: #ffffff;
}

.lingyun-alert__action--cancel .lingyun-alert__action-label {
  font-weight: 590;
}
</style>
