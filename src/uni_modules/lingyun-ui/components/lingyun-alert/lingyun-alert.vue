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
          <view
            v-for="(field, index) in normalizedInputs"
            :key="field.key || index"
            class="lingyun-alert__field"
          >
            <input
              class="lingyun-alert__input"
              :type="field.type || 'text'"
              :password="field.password === true"
              :value="fieldValues[index]"
              :placeholder="field.placeholder || ''"
              placeholder-class="lingyun-alert__input-ph"
              :maxlength="field.maxlength != null ? field.maxlength : 140"
              :focus="index === 0 && autoFocus && phase === 'open'"
              :adjust-position="false"
              :cursor-spacing="24"
              @input="onInput(index, $event)"
              @focus="onInputFocus"
              @blur="onInputBlur"
              @keyboardheightchange="onInputKeyboardHeight"
            />
          </view>
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

<script>
import { useThemeStore } from '@/stores/theme'

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

export default {
  name: 'LingyunAlert',
  emits: [
    'update:show',
    'update:modelValue',
    'action',
    'close',
    'update:inputs',
    'input',
  ],
  props: {
    show: {
      type: Boolean,
      default: undefined,
    },
    modelValue: {
      type: Boolean,
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
      type: Array,
      default: () => [],
    },
    layout: {
      type: String,
      default: 'auto',
    },
    inputs: {
      type: Array,
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
      type: [Number, String],
      default: 1000,
    },
  },
  data() {
    return {
      fieldValues: [],
      mounted: false,
      /** enter | open | leave */
      phase: '',
      leaveTimer: null,
      enterTimer: null,
      /** 拒绝点遮罩关闭时的轻抖 */
      rejectNudge: false,
      nudgeTimer: null,
      /** 键盘高度（含输入框时上推面板） */
      keyboardHeight: 0,
      /** 面板实测高度，用于贴键盘定位 */
      panelHeightPx: 0,
    }
  },
  computed: {
    visible() {
      if (this.show !== undefined && this.show !== null) return !!this.show
      if (this.modelValue !== undefined && this.modelValue !== null) return !!this.modelValue
      return false
    },
    showHeader() {
      return !!(this.title || this.message || this.$slots.header)
    },
    normalizedInputs() {
      const list = Array.isArray(this.inputs) ? this.inputs.slice(0, 2) : []
      return list.filter(Boolean)
    },
    hasInputs() {
      return this.normalizedInputs.length > 0
    },
    resolvedActions() {
      return (this.actions || []).filter((a) => a && a.text)
    },
    resolvedLayout() {
      if (this.layout === 'row' || this.layout === 'stack') return this.layout
      return this.resolvedActions.length >= 3 ? 'stack' : 'row'
    },
    actionsClass() {
      return this.resolvedLayout === 'stack'
        ? 'lingyun-alert__actions--stack'
        : 'lingyun-alert__actions--row'
    },
    reduceMotion() {
      try {
        if (typeof window !== 'undefined' && window.matchMedia) {
          return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        }
      } catch (e) {
        /* ignore */
      }
      return false
    },
    rootClass() {
      let themeClass = 'theme-light'
      try {
        themeClass = useThemeStore().rootClass || 'theme-light'
      } catch {
        /* pinia 未就绪 */
      }
      return [
        themeClass,
        `lingyun-alert--${this.resolvedLayout}`,
        this.hasInputs ? 'lingyun-alert--with-inputs' : '',
        this.phase ? `lingyun-alert--${this.phase}` : '',
        this.reduceMotion ? 'lingyun-alert--reduce-motion' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    rootStyle() {
      return {
        zIndex: Number(this.zIndex) || 1000,
      }
    },
    panelClass() {
      return {
        'lingyun-alert__panel--nudge': this.rejectNudge && !this.reduceMotion,
      }
    },
    /** 键盘弹起时上移量：面板底边贴在键盘上方（小间距），避免旧算法 kb*0.58 抬得过高留白过大 */
    keyboardLiftPx() {
      const kb = Math.max(0, Number(this.keyboardHeight) || 0)
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
      const panelH = Math.max(120, Number(this.panelHeightPx) || this.estimatePanelHeight())
      const centerY = winH / 2
      /* 无 lift 时底边 ≈ centerY + panelH/2；目标底边 = 键盘顶 - gap */
      let lift = centerY + panelH / 2 - (winH - kb - gap)
      const maxLift = Math.max(0, centerY - panelH / 2 - pad)
      if (lift < 0) lift = 0
      if (lift > maxLift) lift = maxLift
      return Math.round(lift)
    },
    liftStyle() {
      /* scale 放 lift，勿放 panel：同元素 opacity/scale 会搞坏小程序 backdrop-filter（Sheet 只做 transform） */
      const y = this.keyboardLiftPx
      let scale = 1
      if (!this.reduceMotion) {
        if (this.phase === 'enter') scale = 1.16
        else if (this.phase === 'leave') scale = 0.92
      }
      const transform =
        y > 0 ? `translateY(-${y}px) scale(${scale})` : `scale(${scale})`
      const leaving = this.phase === 'leave'
      return {
        transform,
        transition: this.reduceMotion
          ? 'none'
          : leaving
            ? 'transform 0.24s cubic-bezier(0.4, 0, 1, 1)'
            : 'transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)',
      }
    },
  },
  watch: {
    inputs: {
      immediate: true,
      deep: true,
      handler(list) {
        const next = (Array.isArray(list) ? list.slice(0, 2) : []).map((f) =>
          f && f.value != null ? String(f.value) : '',
        )
        this.fieldValues = next
      },
    },
    visible: {
      immediate: true,
      handler(val) {
        if (val) {
          if (this.hasInputs) {
            this.fieldValues = this.normalizedInputs.map((f) =>
              f && f.value != null ? String(f.value) : '',
            )
          }
          this.openAnim()
          if (this.hasInputs) {
            this.bindKeyboardHeight()
            /* #ifdef H5 */
            this.bindVisualViewport()
            /* #endif */
          }
        } else {
          this.closeAnim()
          this.resetKeyboardLift()
        }
      },
    },
  },
  beforeUnmount() {
    this.clearTimers()
    this.resetKeyboardLift()
  },
  // #ifndef VUE3
  beforeDestroy() {
    this.clearTimers()
    this.resetKeyboardLift()
  },
  // #endif
  methods: {
    clearTimers() {
      if (this.leaveTimer) {
        clearTimeout(this.leaveTimer)
        this.leaveTimer = null
      }
      if (this.enterTimer) {
        clearTimeout(this.enterTimer)
        this.enterTimer = null
      }
      if (this.nudgeTimer) {
        clearTimeout(this.nudgeTimer)
        this.nudgeTimer = null
      }
      this.rejectNudge = false
    },
    setKeyboardHeight(height) {
      const next = Math.max(0, Number(height) || 0)
      if (next === this.keyboardHeight) return
      this.keyboardHeight = next
      if (next > 0) this.measurePanelHeight()
    },
    resetKeyboardLift() {
      clearTimeout(this._blurKbTimer)
      this._blurKbTimer = null
      this.setKeyboardHeight(0)
      this.panelHeightPx = 0
      this.unbindKeyboardHeight()
      /* #ifdef H5 */
      this.unbindVisualViewport()
      /* #endif */
    },
    estimatePanelHeight() {
      let h = 28
      if (this.title) h += 22
      if (this.message) h += 44
      if (this.title || this.message) h += 42
      h += this.normalizedInputs.length * 64
      if (this.resolvedActions.length) {
        h += this.resolvedLayout === 'stack'
          ? this.resolvedActions.length * 48 + 12
          : 48
      }
      return h
    },
    measurePanelHeight() {
      if (!this.hasInputs || !this.mounted) return
      this.$nextTick(() => {
        try {
          const q = uni.createSelectorQuery().in(this)
          q.select('.lingyun-alert__panel')
            .boundingClientRect((rect) => {
              const h = rect && rect.height ? Number(rect.height) : 0
              if (h > 40 && h !== this.panelHeightPx) this.panelHeightPx = h
            })
            .exec()
        } catch {
          /* ignore */
        }
      })
    },
    onInputFocus() {
      if (!this.hasInputs) return
      this.bindKeyboardHeight()
      this.measurePanelHeight()
      /* #ifdef H5 */
      this.bindVisualViewport()
      /* #endif */
    },
    onInputBlur() {
      /* 延迟清零：切到下一输入框时避免闪回中间 */
      clearTimeout(this._blurKbTimer)
      this._blurKbTimer = setTimeout(() => {
        this.setKeyboardHeight(0)
        this._blurKbTimer = null
      }, 80)
    },
    onInputKeyboardHeight(event) {
      const height = event && event.detail ? event.detail.height : 0
      clearTimeout(this._blurKbTimer)
      this.setKeyboardHeight(height)
    },
    bindKeyboardHeight() {
      if (this._onKeyboardHeight) return
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
      if (this._onVisualViewport) return
      if (typeof window === 'undefined' || !window.visualViewport) return
      this._onVisualViewport = () => {
        const vv = window.visualViewport
        const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
        this.setKeyboardHeight(covered > 80 ? covered : 0)
      }
      window.visualViewport.addEventListener('resize', this._onVisualViewport)
      window.visualViewport.addEventListener('scroll', this._onVisualViewport)
    },
    unbindVisualViewport() {
      if (!this._onVisualViewport || typeof window === 'undefined' || !window.visualViewport) {
        this._onVisualViewport = null
        return
      }
      window.visualViewport.removeEventListener('resize', this._onVisualViewport)
      window.visualViewport.removeEventListener('scroll', this._onVisualViewport)
      this._onVisualViewport = null
    },
    /* #endif */
    openAnim() {
      this.clearTimers()
      this.mounted = true
      this.phase = 'enter'
      this.$nextTick(() => {
        this.enterTimer = setTimeout(() => {
          this.phase = 'open'
          this.enterTimer = null
          if (this.hasInputs) this.measurePanelHeight()
        }, this.reduceMotion ? 0 : 20)
      })
    },
    closeAnim() {
      if (!this.mounted) {
        this.phase = ''
        return
      }
      this.clearTimers()
      this.phase = 'leave'
      const wait = this.reduceMotion ? 0 : LEAVE_MS
      this.leaveTimer = setTimeout(() => {
        this.mounted = false
        this.phase = ''
        this.leaveTimer = null
      }, wait)
    },
    actionClass(action) {
      const role = this.resolveRole(action)
      const primary = this.isPrimary(action)
      return [
        `lingyun-alert__action--${role}`,
        primary ? 'lingyun-alert__action--primary' : 'lingyun-alert__action--secondary',
      ].join(' ')
    },
    resolveRole(action) {
      const role = action && action.role
      if (role === 'destructive' || role === 'cancel' || role === 'primary' || role === 'secondary') {
        return role === 'primary' ? 'normal' : role
      }
      return 'normal'
    },
    isPrimary(action) {
      if (!action) return false
      if (action.primary === true) return true
      if (action.primary === false) return false
      if (action.role === 'primary') return true
      if (action.role === 'cancel' || action.role === 'secondary') return false
      const list = this.resolvedActions
      if (!list.length) return false
      if (this.resolvedLayout === 'stack') return list[0] === action
      return list[list.length - 1] === action
    },
    onInput(index, event) {
      const value =
        event && event.detail && event.detail.value != null
          ? String(event.detail.value)
          : event && event.target && event.target.value != null
            ? String(event.target.value)
            : ''
      const next = this.fieldValues.slice()
      next[index] = value
      this.fieldValues = next
      this.$emit('input', { index, value, values: next.slice() })
      this.$emit('update:inputs', this.buildInputsPayload(next))
    },
    buildInputsPayload(values) {
      return this.normalizedInputs.map((field, i) => ({
        ...field,
        value: values[i] != null ? values[i] : '',
      }))
    },
    close() {
      this.$emit('update:show', false)
      this.$emit('update:modelValue', false)
      this.$emit('close')
    },
    /**
     * 系统 UIAlertController 点 dimming 是静默忽略；
     * 此处用水平轻抖 + 短震动，表达「须点按钮关闭」（同密码错误抖动语汇）。
     */
    onOverlayClick() {
      if (this.maskClosable) {
        this.close()
        return
      }
      if (this.phase !== 'open') return
      this.playRejectNudge()
    },
    playRejectNudge() {
      try {
        uni.vibrateShort({ type: 'medium' })
      } catch {
        try {
          uni.vibrateShort({})
        } catch {
          /* 部分端无震动 */
        }
      }
      if (this.reduceMotion) return
      this.rejectNudge = false
      this.$nextTick(() => {
        this.rejectNudge = true
        if (this.nudgeTimer) clearTimeout(this.nudgeTimer)
        this.nudgeTimer = setTimeout(() => {
          this.rejectNudge = false
          this.nudgeTimer = null
        }, NUDGE_MS)
      })
    },
    onAction(action, index) {
      if (!action || action.disabled) return
      if (this.phase === 'leave') return
      const payload = {
        action,
        index,
        values: this.fieldValues.slice(),
        inputs: this.buildInputsPayload(this.fieldValues),
      }
      this.$emit('action', payload)
      if (typeof action.onClick === 'function') {
        action.onClick(payload)
      }
      if (this.closeOnAction !== false && action.close !== false) {
        this.close()
      }
    },
  },
}
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
$ly-field-h: 52px;
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
  will-change: transform;
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
  height: $ly-field-h;
  box-sizing: border-box;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-radius: $lingyun-glass-radius-pill;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-alert__input {
  width: 100%;
  height: 100%;
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
  background: transparent;
  border: none;
}

.lingyun-alert__input-ph {
  color: var(--lingyun-placeholder-text, #{$lingyun-placeholder-text});
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
