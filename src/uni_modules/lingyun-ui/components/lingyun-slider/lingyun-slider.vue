<template>
  <view
    class="lingyun-slider"
    :class="rootClass"
    role="slider"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="innerValue"
    :aria-disabled="disabled"
    @touchstart="onTouchStart"
    @touchmove.stop.prevent="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
    @mousedown.stop.prevent="onMouseDown"
  >
    <text v-if="minGlyph" class="lingyun-slider__glyph">{{ minGlyph }}</text>
    <view class="lingyun-slider__body">
      <view class="lingyun-slider__track" :style="trackStyle">
        <view class="lingyun-slider__fill" :style="fillStyle" />
      </view>
      <view v-if="showTicks" class="lingyun-slider__ticks">
        <view v-for="n in tickCount" :key="n" class="lingyun-slider__tick" />
      </view>
      <view class="lingyun-slider__knob" :style="knobStyle">
        <view v-if="pressed && !disabled" class="lingyun-slider__glow" />
      </view>
    </view>
    <text v-if="maxGlyph" class="lingyun-slider__glyph">{{ maxGlyph }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, ref, watch } from 'vue'
import { type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'

/** Sketch Sliders/Light/No Glyphs：拇指 37×24，轨道高 6 */
const KNOB_W = 37

type TrackRect = { left: number; width: number }

/**
 * lingyun-slider
 * 自绘，对齐 Apple iOS 27 UI Kit · Sliders（不用原生 slider，原生拇指/轨道对不上稿）
 * @see design/SLIDERS.md
 */
defineOptions({
  name: 'LingyunSlider',
})

const props = defineProps({
  modelValue: { type: Number as PropType<number | undefined>, default: undefined },
  value: { type: Number as PropType<number | undefined>, default: undefined },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  disabled: { type: Boolean, default: false },
  activeColor: { type: String, default: '' },
  backgroundColor: { type: String, default: '' },
  /** 保留兼容；视觉尺寸固定为稿面 37×24，不再传给原生 slider */
  blockSize: { type: Number, default: 20 },
  /** 去掉左右 16。列表行自身已有 16 内边距时用 */
  flush: { type: Boolean, default: false },
  minGlyph: { type: String, default: '' },
  maxGlyph: { type: String, default: '' },
  showTicks: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'update:value', 'changing', 'change'])

const instance = getCurrentInstance()

const dragging = ref(false)
const pressed = ref(false)
const touching = ref(false)
const innerValue = ref(50)
const trackRect = ref<TrackRect | null>(null)
const pendingX = ref<number | null>(null)
const tickCount = ref(5)
const _mouseMove = ref<((event: MouseEvent) => void) | null>(null)
const _mouseUp = ref<(() => void) | null>(null)
const _measuring = ref(false)
const _releaseWaiting = ref(false)

const propValue = computed((): number => {
  if (props.modelValue !== undefined && props.modelValue !== null) return Number(props.modelValue)
  if (props.value !== undefined && props.value !== null) return Number(props.value)
  return 50
})

const themeClass = computed((): string => {
  try {
    return useLingyunTheme().rootClass || 'theme-light'
  } catch {
    return 'theme-light'
  }
})

const rootClass = computed((): string => {
  return [
    themeClass.value,
    props.flush ? 'lingyun-slider--flush' : '',
    props.disabled ? 'is-disabled' : '',
    pressed.value && !props.disabled ? 'is-pressed' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const ratio = computed((): number => {
  const min = Number(props.min)
  const max = Number(props.max)
  if (!(max > min)) return 0
  const next = (Number(innerValue.value) - min) / (max - min)
  return Math.min(1, Math.max(0, next))
})

const trackStyle = computed((): { backgroundColor?: string } => {
  if (!props.backgroundColor) return {}
  return { backgroundColor: props.backgroundColor }
})

const fillStyle = computed((): { width: string; backgroundColor?: string } => {
  const currentRatio = ratio.value
  const pct = (currentRatio * 100).toFixed(4)
  // 填充画到拇指中心：18.5 + ratio * (track - 37)
  const extra = (KNOB_W / 2 - currentRatio * KNOB_W).toFixed(4)
  const style: { width: string; backgroundColor?: string } = { width: `calc(${pct}% + ${extra}px)` }
  if (props.activeColor) style.backgroundColor = props.activeColor
  return style
})

const knobStyle = computed((): { left: string } => {
  const currentRatio = ratio.value
  const pct = (currentRatio * 100).toFixed(4)
  const shift = (currentRatio * KNOB_W).toFixed(4)
  return { left: `calc(${pct}% - ${shift}px)` }
})

function quantize(raw: number): number {
  const min = Number(props.min)
  const max = Number(props.max)
  const step = Number(props.step) > 0 ? Number(props.step) : 1
  if (!(max > min)) return min
  const clamped = Math.min(max, Math.max(min, Number(raw)))
  const steps = Math.round((clamped - min) / step)
  const next = Number((min + steps * step).toFixed(6))
  return Math.min(max, Math.max(min, next))
}

function clientX(event: TouchEvent | MouseEvent): number | null {
  if ('touches' in event) {
    const touch = event.touches[0] || event.changedTouches[0]
    if (touch && typeof touch.clientX === 'number') return touch.clientX
  }
  if ('clientX' in event && typeof event.clientX === 'number') return event.clientX
  return null
}

function measure(cb?: (rect: TrackRect | null) => void) {
  uni
    .createSelectorQuery()
    .in(instance?.proxy as never)
    .select('.lingyun-slider__body')
    .boundingClientRect((rect) => {
      const info = Array.isArray(rect) ? rect[0] : rect
      if (info && info.width) {
        trackRect.value = { left: info.left ?? 0, width: info.width }
      }
      if (cb) cb(trackRect.value)
    })
    .exec()
}

function applyX(clientXValue: number | null) {
  const rect = trackRect.value
  if (!rect || clientXValue == null || !(rect.width > KNOB_W)) return
  const span = rect.width - KNOB_W
  const currentRatio = Math.min(1, Math.max(0, (clientXValue - rect.left - KNOB_W / 2) / span))
  const min = Number(props.min)
  const max = Number(props.max)
  const value = quantize(min + currentRatio * (max - min))
  if (value === innerValue.value) return
  innerValue.value = value
  emit('update:modelValue', value)
  emit('update:value', value)
  emit('changing', value)
}

function attachMouse() {
  // #ifdef H5
  const onMove = _mouseMove.value
  const onUp = _mouseUp.value
  if (onMove) window.addEventListener('mousemove', onMove as EventListener)
  if (onUp) window.addEventListener('mouseup', onUp as EventListener)
  // #endif
}

function detachMouse() {
  // #ifdef H5
  const onMove = _mouseMove.value
  const onUp = _mouseUp.value
  if (onMove) window.removeEventListener('mousemove', onMove as EventListener)
  if (onUp) window.removeEventListener('mouseup', onUp as EventListener)
  // #endif
}

function finishDrag() {
  const value = innerValue.value
  pressed.value = false
  dragging.value = false
  pendingX.value = null
  detachMouse()
  emit('update:modelValue', value)
  emit('update:value', value)
  emit('change', value)
}

function seek(clientXValue: number | null) {
  if (clientXValue == null) return
  pendingX.value = clientXValue
  if (trackRect.value) {
    applyX(clientXValue)
    return
  }
  if (_measuring.value) return
  _measuring.value = true
  measure(() => {
    _measuring.value = false
    if (pendingX.value != null) applyX(pendingX.value)
    if (_releaseWaiting.value) {
      _releaseWaiting.value = false
      finishDrag()
    }
  })
}

function beginDrag(clientXValue: number | null) {
  if (props.disabled || clientXValue == null) return
  pressed.value = true
  dragging.value = true
  seek(clientXValue)
}

function endDrag() {
  if (!dragging.value && !pressed.value) return
  if (!trackRect.value) {
    _releaseWaiting.value = true
    return
  }
  if (pendingX.value != null) applyX(pendingX.value)
  finishDrag()
}

function onTouchStart(event: TouchEvent) {
  if (props.disabled) return
  touching.value = true
  beginDrag(clientX(event))
}

function onTouchMove(event: TouchEvent) {
  if (!dragging.value || props.disabled) return
  seek(clientX(event))
}

function onTouchEnd() {
  endDrag()
  setTimeout(() => {
    touching.value = false
  }, 400)
}

function onMouseDown(event: MouseEvent) {
  if (props.disabled || touching.value) return
  beginDrag(clientX(event))
  attachMouse()
}

_mouseMove.value = (event: MouseEvent) => {
  if (!dragging.value) return
  seek(event.clientX)
}
_mouseUp.value = () => endDrag()

watch(
  propValue,
  (v: number) => {
    if (dragging.value) return
    const next = Number(v)
    if (!Number.isFinite(next)) return
    const quantized = quantize(next)
    if (quantized === innerValue.value) return
    innerValue.value = quantized
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  detachMouse()
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-slider {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 52px;
  padding: 0 16px;

  &--flush {
    padding-left: 0;
    padding-right: 0;
  }

  &__glyph {
    flex-shrink: 0;
    width: 32px;
    height: 52px;
    font-size: 17px;
    font-weight: 600;
    line-height: 52px;
    text-align: center;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }

  &__body {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 52px;
  }

  &__track {
    position: absolute;
    left: 0;
    right: 0;
    top: 23px;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background-color: var(--lingyun-fill, #{$lingyun-fill});
  }

  &__fill {
    height: 6px;
    border-radius: 3px;
    background-color: var(--lingyun-system-blue, #{$lingyun-system-blue});
  }

  &__ticks {
    position: absolute;
    left: 0;
    right: 0;
    top: 33px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    height: 4px;
    padding: 0 16px;
  }

  &__tick {
    width: 4px;
    height: 4px;
    border-radius: 3px;
    background-color: var(--lingyun-label-quaternary, #{$lingyun-label-quaternary});
  }

  &__knob {
    position: absolute;
    top: 14px;
    z-index: 1;
    width: 37px;
    height: 24px;
    border-radius: 999px;
    background-color: #ffffff;
    box-shadow:
      0 0.5px 4px 0 rgba(0, 0, 0, 0.12),
      0 6px 13px 0 rgba(0, 0, 0, 0.12);
  }

  &__glow {
    position: absolute;
    left: -10px;
    top: -7px;
    width: 57px;
    height: 38px;
    border-radius: 50px;
    box-shadow:
      0 0 0 0.25px rgba(255, 255, 255, 0.45),
      0 0 0 0.25px rgba(255, 255, 255, 0.45),
      0 0 0 0.5px rgba(217, 217, 217, 1),
      0 0 0 0.5px rgba(217, 217, 217, 1);
  }

  &.is-disabled &__knob {
    background-color: #d1d1d6;
    box-shadow: none;
  }

  &.theme-dark.is-disabled &__knob {
    background-color: #636366;
  }
}

/* #ifdef H5 */
.lingyun-slider {
  cursor: pointer;
  user-select: none;
}

.lingyun-slider.is-disabled {
  cursor: default;
}
/* #endif */
</style>
