<template>
  <lingyun-popover
    v-model:show="visible"
    :placement="placement"
    :show-arrow="showArrow"
    :width="width"
    :mask="false"
    :mask-closable="false"
    :z-index="zIndex"
  >
    <template #trigger>
      <view
        :id="triggerId"
        class="lingyun-tooltip__trigger"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @click="onTriggerClick"
        @longpress="onLongPress"
      >
        <slot />
      </view>
    </template>

    <view class="lingyun-tooltip__bubble">
      <slot name="content">
        <text class="lingyun-tooltip__text">{{ text }}</text>
      </slot>
    </view>
  </lingyun-popover>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type {
  LingyunTooltipPlacement,
  LingyunTooltipTrigger,
} from './types'

let tooltipSequence = 0

/**
 * lingyun-tooltip
 * @description 轻量说明气泡：H5 hover / 点击，移动端长按 / 点击；复用 lingyun-popover
 * @see design/TOOLTIPS.md
 */
export default defineComponent({
  name: 'LingyunTooltip',
  emits: ['show', 'hide'],
  props: {
    text: { type: String, default: '' },
    placement: {
      type: String as PropType<LingyunTooltipPlacement>,
      default: 'top',
    },
    trigger: {
      type: String as PropType<LingyunTooltipTrigger>,
      default: 'hover',
    },
    showArrow: { type: Boolean, default: true },
    width: { type: [Number, String] as PropType<number | string>, default: 0 },
    zIndex: { type: [Number, String] as PropType<number | string>, default: 1200 },
    showDelay: { type: Number, default: 120 },
    hideDelay: { type: Number, default: 80 },
    disabled: { type: Boolean, default: false },
  },
  data(): {
    uid: number
    visible: boolean
    showTimer: ReturnType<typeof setTimeout> | null
    hideTimer: ReturnType<typeof setTimeout> | null
    autoHideTimer: ReturnType<typeof setTimeout> | null
  } {
    return {
      uid: (tooltipSequence += 1),
      visible: false,
      showTimer: null,
      hideTimer: null,
      autoHideTimer: null,
    }
  },
  computed: {
    triggerId(): string {
      return `lingyun-tooltip-trigger-${this.uid}`
    },
  },
  watch: {
    visible(value: boolean) {
      this.$emit(value ? 'show' : 'hide')
    },
    disabled(value: boolean) {
      if (value) this.hideNow()
    },
  },
  beforeUnmount() {
    this.clearTimers()
  },
  methods: {
    onMouseEnter(): void {
      if (this.disabled || this.trigger !== 'hover') return
      this.scheduleShow()
    },
    onMouseLeave(): void {
      if (this.disabled || this.trigger !== 'hover') return
      this.scheduleHide()
    },
    onTriggerClick(): void {
      if (this.disabled) return
      if (this.trigger === 'click') {
        this.visible ? this.hideNow() : this.showNow()
        return
      }
      // #ifndef H5
      this.visible ? this.hideNow() : this.showNow()
      // #endif
    },
    onLongPress(): void {
      if (this.disabled) return
      this.showNow()
      this.clearAutoHide()
      this.autoHideTimer = setTimeout(() => {
        this.autoHideTimer = null
        this.hideNow()
      }, 2200)
    },
    scheduleShow(): void {
      this.clearHideTimer()
      if (this.visible) return
      this.clearShowTimer()
      const delay = Math.max(0, Number(this.showDelay) || 0)
      if (!delay) {
        this.visible = true
        return
      }
      this.showTimer = setTimeout(() => {
        this.showTimer = null
        this.visible = true
      }, delay)
    },
    scheduleHide(): void {
      this.clearShowTimer()
      if (!this.visible) return
      this.clearHideTimer()
      const delay = Math.max(0, Number(this.hideDelay) || 0)
      if (!delay) {
        this.visible = false
        return
      }
      this.hideTimer = setTimeout(() => {
        this.hideTimer = null
        this.visible = false
      }, delay)
    },
    showNow(): void {
      this.clearTimers()
      this.visible = true
    },
    hideNow(): void {
      this.clearTimers()
      this.visible = false
    },
    clearShowTimer(): void {
      if (this.showTimer) {
        clearTimeout(this.showTimer)
        this.showTimer = null
      }
    },
    clearHideTimer(): void {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer)
        this.hideTimer = null
      }
    },
    clearAutoHide(): void {
      if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer)
        this.autoHideTimer = null
      }
    },
    clearTimers(): void {
      this.clearShowTimer()
      this.clearHideTimer()
      this.clearAutoHide()
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-tooltip__trigger {
  display: inline-flex;
  max-width: 100%;
  vertical-align: middle;
}

.lingyun-tooltip__bubble {
  max-width: 240px;
  box-sizing: border-box;
}

.lingyun-tooltip__text {
  display: block;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label, #{$lingyun-label});
  word-break: break-word;
}
</style>
