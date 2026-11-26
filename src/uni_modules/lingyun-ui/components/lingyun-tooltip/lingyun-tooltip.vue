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

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { nextLingyunUid } from '../../utils/uid'
import type { PropType } from 'vue'
import type {
  LingyunTooltipPlacement,
  LingyunTooltipTrigger,
} from './types'


/**
 * lingyun-tooltip
 * @description 轻量说明气泡：H5 hover / 点击，移动端长按 / 点击；复用 lingyun-popover
 * @see design/TOOLTIPS.md
 */
defineOptions({
  name: 'LingyunTooltip',
})

const props = defineProps({
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
})

const emit = defineEmits(['show', 'hide'])

const uid = ref(nextLingyunUid('tooltip'))
const visible = ref(false)
const showTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const hideTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const autoHideTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const triggerId = computed((): string => {
  return `lingyun-tooltip-trigger-${uid.value}`
})

function onMouseEnter(): void {
  if (props.disabled || props.trigger !== 'hover') return
  scheduleShow()
}

function onMouseLeave(): void {
  if (props.disabled || props.trigger !== 'hover') return
  scheduleHide()
}

function onTriggerClick(): void {
  if (props.disabled) return
  if (props.trigger === 'click') {
    visible.value ? hideNow() : showNow()
    return
  }
  // #ifndef H5
  visible.value ? hideNow() : showNow()
  // #endif
}

function onLongPress(): void {
  if (props.disabled) return
  showNow()
  clearAutoHide()
  autoHideTimer.value = setTimeout(() => {
    autoHideTimer.value = null
    hideNow()
  }, 2200)
}

function scheduleShow(): void {
  clearHideTimer()
  if (visible.value) return
  clearShowTimer()
  const delay = Math.max(0, Number(props.showDelay) || 0)
  if (!delay) {
    visible.value = true
    return
  }
  showTimer.value = setTimeout(() => {
    showTimer.value = null
    visible.value = true
  }, delay)
}

function scheduleHide(): void {
  clearShowTimer()
  if (!visible.value) return
  clearHideTimer()
  const delay = Math.max(0, Number(props.hideDelay) || 0)
  if (!delay) {
    visible.value = false
    return
  }
  hideTimer.value = setTimeout(() => {
    hideTimer.value = null
    visible.value = false
  }, delay)
}

function showNow(): void {
  clearTimers()
  visible.value = true
}

function hideNow(): void {
  clearTimers()
  visible.value = false
}

function clearShowTimer(): void {
  if (showTimer.value) {
    clearTimeout(showTimer.value)
    showTimer.value = null
  }
}

function clearHideTimer(): void {
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
    hideTimer.value = null
  }
}

function clearAutoHide(): void {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
    autoHideTimer.value = null
  }
}

function clearTimers(): void {
  clearShowTimer()
  clearHideTimer()
  clearAutoHide()
}

watch(visible, (value: boolean) => {
  emit(value ? 'show' : 'hide')
})

watch(
  () => props.disabled,
  (value: boolean) => {
    if (value) hideNow()
  },
)

onBeforeUnmount(() => {
  clearTimers()
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
