<template>
  <view
    class="lingyun-segmented-control"
    :id="trackId"
    :class="rootClass"
    role="tablist"
    :aria-disabled="disabled ? 'true' : 'false'"
  >
    <view
      class="lingyun-segmented-control__thumb"
      :class="thumbClass"
      :style="thumbStyle"
    />
    <view
      v-for="(item, index) in normalizedItems"
      :id="segmentId(index)"
      :key="item.key"
      class="lingyun-segmented-control__item"
      :class="{
        'lingyun-segmented-control__item--active': isActive(item),
        'lingyun-segmented-control__item--disabled': item.disabled,
      }"
      role="tab"
      :aria-selected="isActive(item) ? 'true' : 'false'"
      :aria-disabled="item.disabled || disabled ? 'true' : 'false'"
      hover-class="lingyun-segmented-control__item--hover"
      :hover-start-time="20"
      :hover-stay-time="70"
      @click="onSelect(item, index)"
    >
      <slot :name="`item-${item.key}`" :item="item" :active="isActive(item)" :index="index">
        <text v-if="item.icon && !item.text" class="lingyun-segmented-control__icon">{{
          item.icon
        }}</text>
        <text v-else class="lingyun-segmented-control__label">{{ item.text }}</text>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'

type SegmentObject = {
  key?: string | number
  text?: string | number
  icon?: string
  disabled?: boolean
}

type SegmentInput = SegmentObject | string | number | null | undefined

type SegmentItem = {
  key: string
  text: string
  icon: string
  disabled: boolean
  raw: SegmentInput
}

type SpringState = { pos: number; vel: number }

type ThumbRect = {
  left: number
  width: number
}

/**
 * lingyun-segmented-control
 * @description 对齐 Apple iOS 27 UI Kit · Segmented Controls（Sketch）+ HIG
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Segmented%2520Controls%252FDark%252FLarge
 * @see https://developer.apple.com/design/human-interface-guidelines/segmented-controls
 * @see design/SEGMENTED_CONTROLS.md
 *
 * 选中胶囊过渡对齐 lingyun-tabbars：左右边弹簧（liquid lens）+ 拉伸时 scaleY 压缩
 * 暗黑：根节点自挂 theme-*（styleIsolation 下父级变量/选择器不可靠）
 *
 * @property {Array|String[]} items [{ key, text?, icon?, disabled? }] 或字符串数组
 * @property {String|Number} modelValue / value 当前选中 key（或字符串项本身）
 * @property {String} size = [large|small] Large 48 / Small 32
 * @property {Boolean} disabled
 * @property {Boolean} block 通栏（默认 true，对齐稿面等分）
 * @event {Function} change / update:modelValue
 */
defineOptions({
  name: 'LingyunSegmentedControl',
})

const props = defineProps({
  items: {
    type: Array as PropType<SegmentInput[]>,
    default: () => [] as SegmentInput[],
  },
  modelValue: {
    type: [String, Number] as PropType<string | number | undefined>,
    default: undefined,
  },
  value: {
    type: [String, Number] as PropType<string | number | undefined>,
    default: undefined,
  },
  size: {
    type: String,
    default: 'large',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['change', 'update:modelValue', 'update:value'])

const instance = getCurrentInstance()

const instanceId = ref(`lysc-${Math.random().toString(36).slice(2, 8)}`)
const thumb = ref({
  left: 0,
  width: 0,
  scaleY: 1,
  ready: false,
  visible: false,
})
const _onResize = ref<(() => void) | null>(null)
const _resizeRaf = ref<number | null>(null)
const _settleTimers = ref<ReturnType<typeof setTimeout>[]>([])
const _onOverlayOpened = ref<(() => void) | null>(null)
const _ro = ref<ResizeObserver | null>(null)
const _lensRaf = ref<number | null>(null)
const _lensLast = ref(0)
const _edgeL = ref<SpringState | null>(null)
const _edgeR = ref<SpringState | null>(null)
const _targetL = ref(0)
const _targetR = ref(0)

const current = computed((): string | number | undefined => {
  return props.modelValue !== undefined ? props.modelValue : props.value
})

const resolvedSize = computed((): string => {
  return props.size === 'small' ? 'small' : 'large'
})

const normalizedItems = computed((): SegmentItem[] => {
  return (props.items || []).map((item, index): SegmentItem => {
    if (item != null && typeof item === 'object') {
      return {
        key: item.key != null ? String(item.key) : String(index),
        text: item.text != null ? String(item.text) : '',
        icon: item.icon || '',
        disabled: !!item.disabled,
        raw: item,
      }
    }
    const text = String(item)
    return { key: text, text, icon: '', disabled: false, raw: item }
  })
})

const themeClass = computed((): string => {
  try {
    return useLingyunTheme().rootClass || 'theme-light'
  } catch (e) {
    return 'theme-light'
  }
})

const rootClass = computed((): string => {
  return [
    `lingyun-segmented-control--${resolvedSize.value}`,
    themeClass.value,
    props.block ? 'lingyun-segmented-control--block' : '',
    props.disabled ? 'lingyun-segmented-control--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const trackId = computed((): string => {
  return `${instanceId.value}-track`
})

const thumbClass = computed((): string => {
  return [
    thumb.value.ready ? 'lingyun-segmented-control__thumb--ready' : '',
    thumb.value.visible ? '' : 'lingyun-segmented-control__thumb--hidden',
  ]
    .filter(Boolean)
    .join(' ')
})

const thumbStyle = computed((): { left: string; width: string; transform: string } => {
  const { left, width, scaleY } = thumb.value
  return {
    left: `${left}px`,
    width: `${width}px`,
    transform: `scaleY(${scaleY})`,
  }
})

function segmentId(index: number): string {
  return `${instanceId.value}-seg-${index}`
}

function prefersReducedMotion(): boolean {
  /* #ifdef H5 */
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  /* #endif */
  return false
}

function scheduleFrame(fn: (time: number) => void): number {
  /* #ifdef H5 */
  return window.requestAnimationFrame(fn)
  /* #endif */
  /* #ifndef H5 */
  return setTimeout(() => fn(Date.now()), 16)
  /* #endif */
}

function cancelFrame(id?: number | null): void {
  if (typeof id !== 'number') return
  const frameId = id
  /* #ifdef H5 */
  window.cancelAnimationFrame(frameId)
  /* #endif */
  /* #ifndef H5 */
  clearTimeout(frameId)
  /* #endif */
}

function stepSpring(state: SpringState, target: number, stiffness: number, damping: number, dt: number): void {
  const force = (target - state.pos) * stiffness
  const damp = -state.vel * damping
  state.vel += (force + damp) * dt
  state.pos += state.vel * dt
}

function lensSettled(): boolean {
  const near = (state: SpringState, target: number) => Math.abs(state.pos - target) < 0.35 && Math.abs(state.vel) < 12
  const edgeL = _edgeL.value!
  const edgeR = _edgeR.value!
  return near(edgeL, _targetL.value) && near(edgeR, _targetR.value)
}

function paintLens(): void {
  const edgeL = _edgeL.value!
  const edgeR = _edgeR.value!
  const left = edgeL.pos
  const width = Math.max(edgeR.pos - edgeL.pos, 8)
  const rest = Math.max(_targetR.value - _targetL.value, 8)
  const stretch = width / rest
  const scaleY = Math.max(0.78, Math.min(1, 1 / Math.sqrt(Math.max(stretch, 1))))
  thumb.value.left = left
  thumb.value.width = width
  thumb.value.scaleY = scaleY
}

function tickLens(now: number): void {
  const edgeL = _edgeL.value!
  const edgeR = _edgeR.value!
  const last = _lensLast.value || now
  const dt = Math.min(0.032, Math.max(0.008, (now - last) / 1000))
  _lensLast.value = now
  const toCenter = (_targetL.value + _targetR.value) / 2
  const curCenter = (edgeL.pos + edgeR.pos) / 2
  const goingRight = toCenter >= curCenter
  const lead = { k: 420, d: 28 }
  const trail = { k: 155, d: 20 }
  stepSpring(edgeL, _targetL.value, goingRight ? trail.k : lead.k, goingRight ? trail.d : lead.d, dt)
  stepSpring(edgeR, _targetR.value, goingRight ? lead.k : trail.k, goingRight ? lead.d : trail.d, dt)
  paintLens()
  if (lensSettled()) {
    _edgeL.value = { pos: _targetL.value, vel: 0 }
    _edgeR.value = { pos: _targetR.value, vel: 0 }
    paintLens()
    _lensRaf.value = null
    return
  }
  _lensRaf.value = scheduleFrame((t) => tickLens(t))
}

function stopLens(): void {
  cancelFrame(_lensRaf.value)
  _lensRaf.value = null
}

function snapLens(rect: ThumbRect): void {
  stopLens()
  _targetL.value = rect.left
  _targetR.value = rect.left + rect.width
  _edgeL.value = { pos: _targetL.value, vel: 0 }
  _edgeR.value = { pos: _targetR.value, vel: 0 }
  paintLens()
}

function flowLens(rect: ThumbRect): void {
  if (!_edgeL.value || !_edgeR.value) {
    snapLens(rect)
    return
  }
  _targetL.value = rect.left
  _targetR.value = rect.left + rect.width
  thumb.value.visible = true
  if (!_lensRaf.value) {
    _lensLast.value = 0
    _lensRaf.value = scheduleFrame((t) => tickLens(t))
  }
}

function applyThumbRect(rect: ThumbRect, liquid: boolean): void {
  const canFlow =
    liquid &&
    thumb.value.ready &&
    thumb.value.visible &&
    thumb.value.width > 0 &&
    !prefersReducedMotion()
  thumb.value.visible = true
  if (canFlow) {
    flowLens(rect)
    return
  }
  snapLens(rect)
  if (!thumb.value.ready) {
    nextTick(() => {
      thumb.value.ready = true
    })
  }
}

function isActive(item: SegmentItem | null | undefined): boolean {
  if (!item) return false
  if (current.value === undefined || current.value === null || current.value === '') {
    return normalizedItems.value[0] && normalizedItems.value[0].key === item.key
  }
  return String(current.value) === String(item.key)
}

function syncThumb(options?: { liquid?: boolean }): void {
  const liquid = !!(options && options.liquid)
  const activeIndex = normalizedItems.value.findIndex((it) => isActive(it))
  const active = activeIndex >= 0 ? normalizedItems.value[activeIndex] : null
  if (!active) {
    stopLens()
    thumb.value.visible = false
    return
  }
  nextTick(() => {
    /* #ifdef H5 */
    if (typeof document !== 'undefined') {
      const trackEl = document.getElementById(trackId.value)
      const segEl = document.getElementById(segmentId(activeIndex))
      /* offsetLeft / offsetWidth 是布局尺寸，不受父级 transform 缩放影响 */
      if (trackEl && segEl && segEl.offsetWidth > 0) {
        applyThumbRect(
          { left: Math.max(0, segEl.offsetLeft), width: segEl.offsetWidth },
          liquid,
        )
        return
      }
    }
    /* #endif */
    uni
      .createSelectorQuery()
      .in(instance?.proxy as never)
      .select(`#${trackId.value}`)
      .boundingClientRect()
      .select(`#${segmentId(activeIndex)}`)
      .boundingClientRect()
      .exec((res) => {
        const track = res && res[0]
        const seg = res && res[1]
        if (!track || !seg || !seg.width) return
        applyThumbRect(
          {
            left: Math.max(0, seg.left - track.left),
            width: seg.width,
          },
          liquid,
        )
      })
  })
}

/** 窗口或轨道尺寸变化后，等布局结束再量选中块，避免量到 flex 还没分完的宽度 */
function scheduleThumbSync(): void {
  cancelFrame(_resizeRaf.value)
  _resizeRaf.value = scheduleFrame(() => {
    _resizeRaf.value = scheduleFrame(() => {
      _resizeRaf.value = null
      syncThumb({ liquid: false })
    })
  })
}

/** 菜单 / Sheet 从缩放态展开时，布局宽度不变但测量到的 rect 会被 transform 缩小；多补几次落定后的测量 */
function bindOverlayOpened(): void {
  const handler = () => scheduleThumbSync()
  _onOverlayOpened.value = handler
  if (typeof uni !== 'undefined' && typeof uni.$on === 'function') {
    uni.$on('lingyun:overlay-opened', handler)
  }
}

function unbindOverlayOpened(): void {
  const handler = _onOverlayOpened.value
  if (handler && typeof uni !== 'undefined' && typeof uni.$off === 'function') {
    uni.$off('lingyun:overlay-opened', handler)
  }
  _onOverlayOpened.value = null
}

function clearSettleThumbSync(): void {
  _settleTimers.value.forEach((timer) => clearTimeout(timer))
  _settleTimers.value = []
}

function scheduleSettleThumbSync(): void {
  clearSettleThumbSync()
  ;[120, 280, 520, 800].forEach((delay) => {
    _settleTimers.value.push(
      setTimeout(() => {
        scheduleThumbSync()
      }, delay),
    )
  })
}

function bindThumbResize(): void {
  const onResize = () => scheduleThumbSync()
  _onResize.value = onResize
  if (typeof uni !== 'undefined' && typeof uni.onWindowResize === 'function') {
    uni.onWindowResize(onResize)
  }
  /* #ifdef H5 */
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onResize)
  }
  nextTick(() => {
    const el = typeof document !== 'undefined' ? document.getElementById(trackId.value) : null
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => scheduleThumbSync())
    _ro.value = ro
    ro.observe(el)
  })
  /* #endif */
}

function unbindThumbResize(): void {
  cancelFrame(_resizeRaf.value)
  _resizeRaf.value = null
  const onResize = _onResize.value
  if (onResize && typeof uni !== 'undefined' && typeof uni.offWindowResize === 'function') {
    uni.offWindowResize(onResize)
  }
  /* #ifdef H5 */
  const ro = _ro.value
  if (ro) {
    ro.disconnect()
    _ro.value = null
  }
  if (onResize && typeof window !== 'undefined') {
    window.removeEventListener('resize', onResize)
  }
  /* #endif */
  _onResize.value = null
}

function onSelect(item: SegmentItem | null, _index?: number): void {
  if (props.disabled || !item || item.disabled) return
  emit('update:modelValue', item.key)
  emit('update:value', item.key)
  emit('change', item.raw != null && typeof item.raw === 'object' ? item.raw : item)
  nextTick(() => syncThumb({ liquid: true }))
}

watch(current, () => {
  syncThumb({ liquid: true })
})

watch(
  () => props.items,
  () => {
    syncThumb({ liquid: false })
  },
  { deep: true },
)

watch(
  () => props.size,
  () => {
    syncThumb({ liquid: false })
  },
)

onMounted(() => {
  bindThumbResize()
  bindOverlayOpened()
  scheduleSettleThumbSync()
  nextTick(() => scheduleThumbSync())
})

onBeforeUnmount(() => {
  unbindOverlayOpened()
  clearSettleThumbSync()
  stopLens()
  unbindThumbResize()
})
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

/*
 * Sketch Segmented Controls/Dark/Large：370×48 · pad 2 · gap 4
 * Track = Tertiary Fill Dark rgba(118,118,128,0.24)
 * Selected thumb = Liquid Glass「5 - Selected」（暗黑提亮银霜，非死黑 #2c2c2e）
 */
$ly-seg-pad: 2px;
$ly-seg-gap: 4px;
$ly-seg-large-h: 48px;
$ly-seg-small-h: 32px;

.lingyun-segmented-control {
  position: relative;
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  box-sizing: border-box;
  gap: $ly-seg-gap;
  padding: $ly-seg-pad;
  border-radius: $lingyun-glass-radius-pill;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  vertical-align: middle;
  /* #ifdef H5 */
  user-select: none;
  /* #endif */

  &--block {
    display: flex;
    width: 100%;
  }

  &--large {
    height: $ly-seg-large-h;
  }

  &--small {
    height: $ly-seg-small-h;
  }

  &--disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  &__thumb {
    position: absolute;
    top: $ly-seg-pad;
    bottom: $ly-seg-pad;
    left: 0;
    z-index: 0;
    box-sizing: border-box;
    border-radius: $lingyun-glass-radius-pill;
    /* Light：Elevated / Tertiary Background（白底胶囊） */
    background-color: var(--lingyun-bg-tertiary, #{$lingyun-bg-tertiary});
    border: 0.5px solid rgba(255, 255, 255, 0.55);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.06),
      0 2px 8px rgba(0, 0, 0, 0.08),
      inset 0 0.5px 0 rgba(255, 255, 255, 0.7);
    opacity: 0;
    pointer-events: none;
    transform-origin: center center;
    will-change: left, width, transform;
    transition: opacity 0.2s ease;
  }

  &__thumb--ready {
    opacity: 1;
  }

  &__thumb--hidden {
    opacity: 0;
  }

  &__item {
    position: relative;
    z-index: 1;
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 0 6px;
    border-radius: $lingyun-glass-radius-pill;
    box-sizing: border-box;
    /* #ifdef H5 */
    cursor: pointer;
    /* #endif */
  }

  &__item--hover {
    transform: scale(0.98);
  }

  &__item--disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  &__label,
  &__icon {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.4px;
    line-height: 18px;
    text-align: center;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: color 0.32s ease;
  }

  &__item--active &__label,
  &__item--active &__icon {
    color: var(--lingyun-label, #{$lingyun-label});
  }

  &--small &__label,
  &--small &__icon {
    font-size: 12px;
    line-height: 16px;
  }

  /*
   * Dark/Large（Sketch Inspect 已核对）：
   * Track Tertiary Fill Dark；Selected = 提亮 Liquid Glass，勿用 #2c2c2e 实心。
   * 色值写死，避免仍继承到 Light CSS 变量。
   */
  &.theme-dark {
    background-color: #{$lingyun-fill-tertiary-dark};

    .lingyun-segmented-control__thumb {
      border: 0.5px solid rgba(255, 255, 255, 0.22);
      box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.4),
        0 4px 14px rgba(0, 0, 0, 0.32),
        inset 0 0.5px 0 rgba(255, 255, 255, 0.28);
      /* #ifdef H5 || APP-PLUS */
      background-color: rgba(255, 255, 255, 0.2);
      backdrop-filter: saturate(180%) blur(16px);
      -webkit-backdrop-filter: saturate(180%) blur(16px);
      /* #endif */
      /* #ifdef MP */
      /* 弱端：银霜 Elevated，对齐 Dark glass lighter */
      background-color: rgba(99, 99, 102, 0.92);
      /* #endif */
    }

    .lingyun-segmented-control__label,
    .lingyun-segmented-control__icon {
      color: #{$lingyun-label-secondary-dark};
    }

    .lingyun-segmented-control__item--active .lingyun-segmented-control__label,
    .lingyun-segmented-control__item--active .lingyun-segmented-control__icon {
      color: #{$lingyun-label-dark};
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .lingyun-segmented-control__thumb {
    will-change: auto;
  }

  .lingyun-segmented-control__label,
  .lingyun-segmented-control__icon {
    transition: none;
  }
}
</style>
