<template>
  <view
    class="lingyun-rating"
    :class="[
      rootClass,
      { 'is-disabled': disabled, 'is-readonly': readonly },
    ]"
    role="radiogroup"
    :aria-label="label"
  >
    <view
      :id="starsId"
      class="lingyun-rating__stars"
      :style="starsStyle"
    >
      <view
        v-for="star in starList"
        :key="star"
        class="lingyun-rating__star"
        :style="{ width: `${resolvedSize}px`, height: `${resolvedSize}px` }"
      >
        <lingyun-icon
          class="lingyun-rating__icon"
          type="star"
          :size="resolvedSize"
          :color="inactiveColor"
        />
        <view
          class="lingyun-rating__fill"
          :style="{ width: `${fillPercent(star)}%` }"
        >
          <lingyun-icon
            class="lingyun-rating__icon"
            type="star-filled"
            :size="resolvedSize"
            :color="activeColor"
          />
        </view>

        <view
          v-if="!readonly && !disabled"
          class="lingyun-rating__hitbox"
          :class="{ 'lingyun-rating__hitbox--half': allowHalf }"
          role="slider"
          :aria-valuemin="0"
          :aria-valuemax="max"
          :aria-valuenow="current"
          :aria-label="`${label} ${star}`"
        >
          <view
            class="lingyun-rating__hit"
            :style="{ width: allowHalf ? '50%' : '100%' }"
            @click.stop="onRate(star, allowHalf ? 0.5 : 1)"
          />
          <view
            v-if="allowHalf"
            class="lingyun-rating__hit"
            style="width:50%"
            @click.stop="onRate(star, 1)"
          />
        </view>
      </view>

      <view
        v-if="interactive"
        class="lingyun-rating__drag-layer"
        aria-hidden="true"
        @touchstart.stop.prevent="onTouchStart"
        @touchmove.stop.prevent="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
      />
    </view>

    <text v-if="showValue" class="lingyun-rating__value">
      {{ formattedValue }}{{ valueSuffix }}
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { nextLingyunUid } from '../../utils/uid'
import { markRaw } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type { LingyunRatingChangePayload } from './types'

interface TouchLike {
  clientX?: number
  clientY?: number
  pageX?: number
  pageY?: number
}


function touchesOf(event: TouchEvent): TouchLike[] {
  const list = event.touches as unknown as ArrayLike<TouchLike> | undefined
  return list ? Array.from(list) : []
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * lingyun-rating
 * @description 评分：整星 / 半星、只读 / 禁用、可清除、显示分值
 * @see design/RATING.md
 */
defineOptions({
  name: 'LingyunRating',
})

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  max: { type: Number, default: 5 },
  size: { type: Number, default: 24 },
  gap: { type: Number, default: 4 },
  allowHalf: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  showValue: { type: Boolean, default: false },
  valueSuffix: { type: String, default: '' },
  label: { type: String, default: '评分' },
  activeColor: { type: String, default: 'orange' },
  inactiveColor: { type: String, default: 'gray3' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const instance = getCurrentInstance()

const uid = ref(nextLingyunUid('rating'))
const dragging = ref(false)
const dragMoved = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartValue = ref(0)
const dragValue = ref<number | null>(null)
const lastDragX = ref(0)
const starsLeft = ref(0)
const starsWidth = ref(0)
const suppressClick = ref(false)
const suppressTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const lastTouchAt = ref(0)
const h5Stars = ref<HTMLElement | null>(null)
const h5MouseDown = ref<((event: MouseEvent) => void) | null>(null)
const h5MouseMove = ref<((event: MouseEvent) => void) | null>(null)
const h5MouseUp = ref<(() => void) | null>(null)

const starsId = computed((): string => {
  return `lingyun-rating-stars-${uid.value}`
})
const interactive = computed((): boolean => {
  return !props.readonly && !props.disabled
})
const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* pinia 未就绪 */
  }
  return themeClass
})
const resolvedMax = computed((): number => {
  const max = Math.floor(Number(props.max))
  return Number.isFinite(max) && max > 0 ? Math.min(max, 10) : 5
})
const resolvedSize = computed((): number => {
  const size = Number(props.size)
  return Number.isFinite(size) && size > 0 ? Math.min(48, Math.max(12, size)) : 24
})
const starList = computed((): number[] => {
  return Array.from({ length: resolvedMax.value }, (_, index) => index + 1)
})
const current = computed((): number => {
  const value = Number(props.modelValue)
  if (!Number.isFinite(value)) return 0
  const clamped = Math.min(resolvedMax.value, Math.max(0, value))
  if (!props.allowHalf) return Math.floor(clamped)
  return Math.round(clamped * 2) / 2
})
const formattedValue = computed((): string => {
  return Number.isInteger(current.value)
    ? String(current.value)
    : current.value.toFixed(1)
})
const starsStyle = computed((): Record<string, string> => {
  return { gap: `${Math.max(0, Number(props.gap) || 0)}px` }
})

function fillPercent(star: number): number {
  const filled = current.value - (star - 1)
  return Math.min(100, Math.max(0, filled * 100))
}

function emitValue(value: number): void {
  if (value === current.value) return
  const payload: LingyunRatingChangePayload = {
    value,
    previous: current.value,
  }
  emit('update:modelValue', value)
  emit('change', payload)
}

function onRate(star: number, offset: number): void {
  if (props.readonly || props.disabled || suppressClick.value) return
  const next = Math.min(
    resolvedMax.value,
    Math.max(0, star - 1 + offset),
  )
  if (props.clearable && next === current.value) {
    emitValue(0)
    return
  }
  emitValue(next)
}

function reset(): void {
  if (props.readonly || props.disabled) return
  emitValue(0)
}

function measureStars(callback?: () => void): void {
  // #ifdef H5
  if (typeof document !== 'undefined') {
    const el = document.getElementById(starsId.value)
    if (el) {
      const rect = el.getBoundingClientRect()
      starsLeft.value = rect.left
      starsWidth.value = rect.width
      if (callback) callback()
      return
    }
  }
  // #endif

  uni
    .createSelectorQuery()
    .in(instance?.proxy as never)
    .select(`#${starsId.value}`)
    .boundingClientRect()
    .exec((res) => {
      const rect =
        res && (res[0] as { left?: number; width?: number } | null)
      if (!rect || !rect.width) return
      starsLeft.value = Number(rect.left || 0)
      starsWidth.value = Number(rect.width)
      if (callback) callback()
    })
}

function applyDrag(clientX: number): void {
  if (!starsWidth.value || starsWidth.value <= 0) return
  const ratio = clamp(
    (clientX - starsLeft.value) / starsWidth.value,
    0,
    1,
  )
  const scaled = ratio * resolvedMax.value
  let index = Math.floor(scaled)
  if (index >= resolvedMax.value) index = resolvedMax.value - 1
  const within = scaled - index
  const next = props.allowHalf
    ? index + (within < 0.5 ? 0.5 : 1)
    : index + 1
  if (next === dragValue.value) return
  dragValue.value = next
  emitValue(next)
}

function startDrag(clientX: number, clientY: number): void {
  if (!interactive.value) return
  dragging.value = true
  dragMoved.value = false
  dragStartX.value = clientX
  dragStartY.value = clientY
  dragStartValue.value = current.value
  lastDragX.value = clientX
  dragValue.value = null
  measureStars(() => {
    if (dragging.value) applyDrag(lastDragX.value)
  })
}

function moveDrag(clientX: number, clientY: number): void {
  if (!dragging.value) return
  lastDragX.value = clientX
  if (
    Math.abs(clientX - dragStartX.value) > 6 ||
    Math.abs(clientY - dragStartY.value) > 6
  ) {
    dragMoved.value = true
  }
  if (starsWidth.value > 0) applyDrag(clientX)
}

function endDrag(): void {
  if (!dragging.value) return
  const wasMoved = dragMoved.value
  const tapValue = dragValue.value
  dragging.value = false
  dragValue.value = null
  if (
    !wasMoved &&
    props.clearable &&
    tapValue != null &&
    tapValue === dragStartValue.value
  ) {
    emitValue(0)
  }
  if (wasMoved) {
    suppressClick.value = true
    if (suppressTimer.value) clearTimeout(suppressTimer.value)
    suppressTimer.value = setTimeout(() => {
      suppressClick.value = false
      suppressTimer.value = null
    }, 80)
  }
}

function onTouchStart(event: TouchEvent): void {
  if (!interactive.value) return
  const touch = touchesOf(event)[0]
  if (!touch) return
  lastTouchAt.value = Date.now()
  startDrag(
    Number(touch.clientX ?? touch.pageX ?? 0),
    Number(touch.clientY ?? touch.pageY ?? 0),
  )
}

function onTouchMove(event: TouchEvent): void {
  const touch = touchesOf(event)[0]
  if (!touch) return
  moveDrag(
    Number(touch.clientX ?? touch.pageX ?? 0),
    Number(touch.clientY ?? touch.pageY ?? 0),
  )
}

function onTouchEnd(): void {
  endDrag()
}

function bindH5Mouse(): void {
  // #ifdef H5
  if (typeof document === 'undefined') return
  const el = document.getElementById(starsId.value)
  if (!el) return
  const starsEl = markRaw(el)
  const onDown = (event: MouseEvent) => {
    if (
      event.button !== 0 ||
      Date.now() - lastTouchAt.value < 500 ||
      !interactive.value
    ) {
      return
    }
    event.preventDefault()
    startDrag(event.clientX, event.clientY)
  }
  const onMove = (event: MouseEvent) => {
    if (!dragging.value) return
    event.preventDefault()
    moveDrag(event.clientX, event.clientY)
  }
  const onUp = () => {
    if (dragging.value) endDrag()
  }
  h5Stars.value = starsEl
  h5MouseDown.value = onDown
  h5MouseMove.value = onMove
  h5MouseUp.value = onUp
  starsEl.addEventListener('mousedown', onDown)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  // #endif
}

function unbindH5Mouse(): void {
  // #ifdef H5
  if (h5Stars.value && h5MouseDown.value) {
    h5Stars.value.removeEventListener('mousedown', h5MouseDown.value)
  }
  if (h5MouseMove.value) {
    window.removeEventListener('mousemove', h5MouseMove.value)
  }
  if (h5MouseUp.value) {
    window.removeEventListener('mouseup', h5MouseUp.value)
  }
  h5Stars.value = null
  h5MouseDown.value = null
  h5MouseMove.value = null
  h5MouseUp.value = null
  // #endif
}

onMounted(() => {
  nextTick(() => bindH5Mouse())
})

onBeforeUnmount(() => {
  unbindH5Mouse()
  if (suppressTimer.value) {
    clearTimeout(suppressTimer.value)
    suppressTimer.value = null
  }
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-rating {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  max-width: 100%;
}

.lingyun-rating__stars {
  position: relative;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-rating__drag-layer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.lingyun-rating__star {
  position: relative;
  flex: 0 0 auto;
  display: block;
  line-height: 0;
}

.lingyun-rating__icon {
  display: block;
  line-height: 1;
}

.lingyun-rating__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  overflow: hidden;
}

.lingyun-rating__hitbox {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-direction: row;
  cursor: pointer;
}

.lingyun-rating__hit {
  height: 100%;
}

.lingyun-rating__value {
  margin-left: 6px;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-rating.is-disabled {
  opacity: 0.4;
}

.lingyun-rating.is-readonly .lingyun-rating__hitbox {
  display: none;
}
</style>