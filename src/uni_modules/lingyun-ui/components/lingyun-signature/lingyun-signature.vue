<template>
  <view class="lingyun-signature" :class="rootClass">
    <view class="lingyun-signature__card">
      <view v-if="title || tip" class="lingyun-signature__head">
        <text v-if="title" class="lingyun-signature__title">{{ title }}</text>
        <text v-if="tip" class="lingyun-signature__tip">{{ tip }}</text>
      </view>

      <view
        :id="padId"
        class="lingyun-signature__pad"
        role="application"
        aria-label="签名画布"
        :class="{
          'lingyun-signature__pad--disabled': disabled || readonly,
        }"
        :style="padStyle"
      >
        <canvas
          :id="canvasId"
          :canvas-id="canvasId"
          class="lingyun-signature__canvas"
          :style="padStyle"
          disable-scroll
          @touchstart.stop.prevent="onTouchStart"
          @touchmove.stop.prevent="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
        />

        <view
          v-if="!hasInk && !previewPath"
          class="lingyun-signature__placeholder"
        >
          {{ placeholder }}
        </view>

        <image
          v-if="previewPath"
          class="lingyun-signature__preview"
          :src="previewPath"
          mode="aspectFit"
        />

        <view v-if="exporting" class="lingyun-signature__loading">
          <lingyun-activity-indicator size="small" color="primary" />
          <text class="lingyun-signature__loading-text">{{ exportingText }}</text>
        </view>
      </view>

      <view
        v-if="showToolbar && !readonly && !disabled"
        class="lingyun-signature__actions"
      >
        <view
          v-if="previewPath"
          class="lingyun-signature__text-button"
          role="button"
          @click="restart"
        >
          {{ restartText }}
        </view>
        <view
          v-else
          class="lingyun-signature__text-button"
          :class="{
            'lingyun-signature__text-button--disabled':
              !hasInk || exporting,
          }"
          role="button"
          @click="clear"
        >
          {{ clearText }}
        </view>

        <lingyun-button
          v-if="!previewPath"
          variant="borderedProminent"
          size="small"
          :text="confirmText"
          :disabled="!hasInk || exporting"
          @click="confirm"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { nextLingyunUid } from '../../utils/uid'
import { markRaw } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type { LingyunSignatureConfirmPayload } from './types'

interface TouchLike {
  x?: number
  y?: number
  clientX?: number
  clientY?: number
}

interface SignatureContext {
  setStrokeStyle: (color: string) => void
  setLineWidth: (width: number) => void
  setLineCap: (cap: string) => void
  setLineJoin: (join: string) => void
  setFillStyle: (color: string) => void
  beginPath: () => void
  moveTo: (x: number, y: number) => void
  lineTo: (x: number, y: number) => void
  arc: (x: number, y: number, radius: number, start: number, end: number) => void
  clearRect: (x: number, y: number, width: number, height: number) => void
  fillRect: (x: number, y: number, width: number, height: number) => void
  fill: () => void
  stroke: () => void
  draw: (reserve?: boolean) => void
}

interface SignaturePoint {
  /** 相对画布的归一化坐标，尺寸变化后可重绘 */
  x: number
  y: number
}

interface SignatureStroke {
  points: SignaturePoint[]
}

interface SignatureRect {
  width?: number
  height?: number
  left?: number
  top?: number
}


function touchesOf(event: TouchEvent): TouchLike[] {
  const list = event.touches as unknown as ArrayLike<TouchLike> | undefined
  return list ? Array.from(list) : []
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * lingyun-signature
 * @description 手写签名板：触控 / 鼠标绘制、清除、重新签名、导出 PNG
 * @see design/SIGNATURE.md
 */
defineOptions({
  name: 'LingyunSignature',
})

const props = defineProps({
  modelValue: { type: String, default: '' },
  title: { type: String, default: '手写签名' },
  tip: { type: String, default: '' },
  placeholder: { type: String, default: '请在此签名' },
  height: { type: Number, default: 180 },
  penColor: { type: String, default: '#1c1c1e' },
  penWidth: { type: Number, default: 3 },
  backgroundColor: { type: String, default: '#ffffff' },
  confirmText: { type: String, default: '完成' },
  clearText: { type: String, default: '清除' },
  restartText: { type: String, default: '重新签名' },
  exportingText: { type: String, default: '处理中…' },
  showToolbar: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:modelValue',
  'confirm',
  'clear',
  'start',
  'end',
  'error',
])

const instance = getCurrentInstance()

const uid = ref(nextLingyunUid('signature'))
const context = ref<SignatureContext | null>(null)
const contextReady = ref(false)
const canvasWidth = ref(0)
const canvasHeight = ref(0)
const padLeft = ref(0)
const padTop = ref(0)
const strokes = ref<SignatureStroke[]>([])
const currentStroke = ref<SignatureStroke | null>(null)
const drawing = ref(false)
const hasInk = ref(false)
const previewPath = ref('')
const exporting = ref(false)
const measureAttempts = ref(0)
const measureTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const lastTouchAt = ref(0)
const h5Pad = ref<HTMLElement | null>(null)
const h5MouseDown = ref<((event: MouseEvent) => void) | null>(null)
const h5MouseMove = ref<((event: MouseEvent) => void) | null>(null)
const h5MouseUp = ref<((event: MouseEvent) => void) | null>(null)
const h5Resize = ref<(() => void) | null>(null)

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* pinia 未就绪 */
  }
  return themeClass
})

const canvasId = computed((): string => {
  return `lingyun-signature-canvas-${uid.value}`
})

const padId = computed((): string => {
  return `lingyun-signature-pad-${uid.value}`
})

const padHeight = computed((): number => {
  return Math.max(120, Number(props.height) || 180)
})

const resolvedPenWidth = computed((): number => {
  return clamp(Number(props.penWidth) || 3, 1, 12)
})

const padStyle = computed((): Record<string, string> => {
  return {
    height: `${padHeight.value}px`,
    backgroundColor: props.backgroundColor || 'transparent',
  }
})

const canDraw = computed((): boolean => {
  return (
    !props.disabled &&
    !props.readonly &&
    !exporting.value &&
    !previewPath.value
  )
})

function setupCanvas(): void {
  if (!contextReady.value) {
    const ctx = uni.createCanvasContext(canvasId.value, instance?.proxy)
    context.value = markRaw(ctx as unknown as SignatureContext)
    contextReady.value = true
  }
  measurePad()
}

function measurePad(forceRedraw = false): void {
  const apply = (rect: SignatureRect) => {
    const width = Number(rect.width) || 0
    const height = Number(rect.height) || 0
    if (width <= 0 || height <= 0) {
      retryMeasure(forceRedraw)
      return
    }
    const changed =
      Math.abs(width - canvasWidth.value) > 0.5 ||
      Math.abs(height - canvasHeight.value) > 0.5
    canvasWidth.value = width
    canvasHeight.value = height
    padLeft.value = Number(rect.left) || 0
    padTop.value = Number(rect.top) || 0
    measureAttempts.value = 0
    if (changed || forceRedraw || !hasInk.value) redraw()
  }

  // #ifdef H5
  if (typeof document !== 'undefined') {
    const pad = document.getElementById(padId.value)
    if (pad) {
      apply(pad.getBoundingClientRect())
      return
    }
  }
  // #endif

  uni
    .createSelectorQuery()
    .in(instance?.proxy)
    .select(`#${padId.value}`)
    .boundingClientRect()
    .exec((res) => {
      const rect = res && (res[0] as SignatureRect | null)
      if (!rect) {
        retryMeasure(forceRedraw)
        return
      }
      apply(rect)
    })
}

function retryMeasure(forceRedraw: boolean): void {
  if (measureAttempts.value >= 3) return
  measureAttempts.value += 1
  if (measureTimer.value) clearTimeout(measureTimer.value)
  measureTimer.value = setTimeout(() => {
    measureTimer.value = null
    measurePad(forceRedraw)
  }, 60)
}

function redraw(): void {
  const ctx = context.value
  if (!ctx || canvasWidth.value <= 0 || canvasHeight.value <= 0) return
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  if (props.backgroundColor && props.backgroundColor !== 'transparent') {
    ctx.setFillStyle(props.backgroundColor)
    ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  }
  strokes.value.forEach((stroke) => drawStroke(stroke))
  if (currentStroke.value) drawStroke(currentStroke.value)
  ctx.draw()
}

function drawStroke(stroke: SignatureStroke): void {
  const ctx = context.value
  const points = stroke.points
  if (!ctx || !points.length) return
  const toX = (point: SignaturePoint) => point.x * canvasWidth.value
  const toY = (point: SignaturePoint) => point.y * canvasHeight.value

  if (points.length === 1) {
    ctx.setFillStyle(props.penColor)
    ctx.beginPath()
    ctx.arc(
      toX(points[0]),
      toY(points[0]),
      resolvedPenWidth.value / 2,
      0,
      Math.PI * 2,
    )
    ctx.fill()
    return
  }

  ctx.setStrokeStyle(props.penColor)
  ctx.setLineWidth(resolvedPenWidth.value)
  ctx.setLineCap('round')
  ctx.setLineJoin('round')
  ctx.beginPath()
  ctx.moveTo(toX(points[0]), toY(points[0]))
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(toX(points[index]), toY(points[index]))
  }
  ctx.stroke()
}

function drawSegment(previous: SignaturePoint, next: SignaturePoint): void {
  const ctx = context.value
  if (!ctx) return
  ctx.setStrokeStyle(props.penColor)
  ctx.setLineWidth(resolvedPenWidth.value)
  ctx.setLineCap('round')
  ctx.setLineJoin('round')
  ctx.beginPath()
  ctx.moveTo(
    previous.x * canvasWidth.value,
    previous.y * canvasHeight.value,
  )
  ctx.lineTo(next.x * canvasWidth.value, next.y * canvasHeight.value)
  ctx.stroke()
  ctx.draw(true)
}

function drawDot(point: SignaturePoint): void {
  const ctx = context.value
  if (!ctx) return
  ctx.setFillStyle(props.penColor)
  ctx.beginPath()
  ctx.arc(
    point.x * canvasWidth.value,
    point.y * canvasHeight.value,
    resolvedPenWidth.value / 2,
    0,
    Math.PI * 2,
  )
  ctx.fill()
  ctx.draw(true)
}

function normalizePoint(x: number, y: number): SignaturePoint {
  return {
    x: clamp(x / canvasWidth.value, 0, 1),
    y: clamp(y / canvasHeight.value, 0, 1),
  }
}

function pointFromTouch(touch: TouchLike): SignaturePoint {
  let x = 0
  let y = 0
  // #ifdef H5
  x = Number(touch.clientX || 0) - padLeft.value
  y = Number(touch.clientY || 0) - padTop.value
  // #endif
  // #ifndef H5
  if (typeof touch.x === 'number' && typeof touch.y === 'number') {
    x = touch.x
    y = touch.y
  } else {
    x = Number(touch.clientX || 0) - padLeft.value
    y = Number(touch.clientY || 0) - padTop.value
  }
  // #endif
  return normalizePoint(x, y)
}

function pointFromMouse(event: MouseEvent): SignaturePoint {
  return normalizePoint(
    event.clientX - padLeft.value,
    event.clientY - padTop.value,
  )
}

function startStroke(point: SignaturePoint): void {
  drawing.value = true
  currentStroke.value = { points: [point] }
  hasInk.value = true
  emit('start')
}

function extendStroke(point: SignaturePoint): void {
  const stroke = currentStroke.value
  if (!drawing.value || !stroke) return
  const previous = stroke.points[stroke.points.length - 1]
  if (!previous) {
    stroke.points.push(point)
    return
  }
  const distance = Math.hypot(
    (point.x - previous.x) * canvasWidth.value,
    (point.y - previous.y) * canvasHeight.value,
  )
  if (distance < 0.6) return
  stroke.points.push(point)
  drawSegment(previous, point)
}

function endStroke(): void {
  const stroke = currentStroke.value
  if (!drawing.value || !stroke) return
  if (stroke.points.length === 1) drawDot(stroke.points[0])
  strokes.value.push(stroke)
  currentStroke.value = null
  drawing.value = false
  emit('end')
}

function onTouchStart(event: TouchEvent): void {
  if (!canDraw.value) return
  lastTouchAt.value = Date.now()
  refreshH5Rect()
  const touch = touchesOf(event)[0]
  if (!touch) return
  startStroke(pointFromTouch(touch))
}

function onTouchMove(event: TouchEvent): void {
  if (!canDraw.value || !drawing.value) return
  const touch = touchesOf(event)[0]
  if (!touch) return
  extendStroke(pointFromTouch(touch))
}

function onTouchEnd(): void {
  if (!drawing.value) return
  endStroke()
}

function refreshH5Rect(): void {
  // #ifdef H5
  if (typeof document === 'undefined') return
  const pad = document.getElementById(padId.value)
  if (!pad) return
  const rect = pad.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  padLeft.value = rect.left
  padTop.value = rect.top
  if (
    Math.abs(rect.width - canvasWidth.value) > 0.5 ||
    Math.abs(rect.height - canvasHeight.value) > 0.5
  ) {
    canvasWidth.value = rect.width
    canvasHeight.value = rect.height
    redraw()
  }
  // #endif
}

function bindH5Mouse(): void {
  // #ifdef H5
  if (typeof document === 'undefined') return
  const pad = document.getElementById(padId.value)
  if (!pad) return
  h5Pad.value = markRaw(pad as HTMLElement)
  const down = (event: MouseEvent) => {
    if (Date.now() - lastTouchAt.value < 500) return
    if (!canDraw.value) return
    event.preventDefault()
    refreshH5Rect()
    startStroke(pointFromMouse(event))
  }
  const move = (event: MouseEvent) => {
    if (!drawing.value) return
    event.preventDefault()
    extendStroke(pointFromMouse(event))
  }
  const up = () => {
    if (!drawing.value) return
    endStroke()
  }
  const resizeHandler = () => measurePad(true)
  h5MouseDown.value = down
  h5MouseMove.value = move
  h5MouseUp.value = up
  h5Resize.value = resizeHandler
  h5Pad.value.addEventListener('mousedown', down)
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', up)
  window.addEventListener('resize', resizeHandler)
  // #endif
}

function unbindH5Mouse(): void {
  // #ifdef H5
  if (h5Pad.value && h5MouseDown.value) {
    h5Pad.value.removeEventListener('mousedown', h5MouseDown.value)
  }
  if (h5MouseMove.value) {
    window.removeEventListener('mousemove', h5MouseMove.value)
  }
  if (h5MouseUp.value) {
    window.removeEventListener('mouseup', h5MouseUp.value)
  }
  if (h5Resize.value) {
    window.removeEventListener('resize', h5Resize.value)
  }
  h5Pad.value = null
  h5MouseDown.value = null
  h5MouseMove.value = null
  h5MouseUp.value = null
  h5Resize.value = null
  // #endif
}

function clearCanvas(): void {
  strokes.value = []
  currentStroke.value = null
  drawing.value = false
  hasInk.value = false
  redraw()
}

function clear(): void {
  if (props.disabled) return
  previewPath.value = ''
  clearCanvas()
  emit('update:modelValue', '')
  emit('clear')
}

function restart(): void {
  if (props.disabled) return
  previewPath.value = ''
  clearCanvas()
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => measurePad(true))
}

function confirm(): void {
  if (exporting.value || props.disabled || props.readonly) return
  if (!hasInk.value && !strokes.value.length) {
    uni.showToast({ title: '请先签名', icon: 'none' })
    return
  }
  exporting.value = true
  const options: Record<string, unknown> = {
    canvasId: canvasId.value,
    fileType: 'png',
    quality: 1,
    success: (res: { tempFilePath?: string }) => {
      exporting.value = false
      const path = res && res.tempFilePath ? String(res.tempFilePath) : ''
      if (!path) {
        failExport('签名导出失败')
        return
      }
      previewPath.value = path
      drawing.value = false
      currentStroke.value = null
      emit('update:modelValue', path)
      const payload: LingyunSignatureConfirmPayload = {
        path,
        width: canvasWidth.value,
        height: canvasHeight.value,
      }
      emit('confirm', payload)
    },
    fail: (error: { errMsg?: string }) => {
      exporting.value = false
      failExport(error && error.errMsg ? error.errMsg : '签名导出失败')
    },
  }
  try {
    ;(
      uni as typeof uni & {
        canvasToTempFilePath: (
          opts: Record<string, unknown>,
          instance?: unknown,
        ) => void
      }
    ).canvasToTempFilePath(options, instance?.proxy)
  } catch {
    exporting.value = false
    failExport('签名导出失败')
  }
}

function failExport(message: string): void {
  uni.showToast({ title: message, icon: 'none' })
  emit('error', { message })
}

function resize(): void {
  measurePad(true)
}

watch(
  () => props.modelValue,
  (value: string) => {
    const next = String(value == null ? '' : value)
    if (next === previewPath.value) return
    previewPath.value = next
    if (!next) {
      if (!drawing.value) clearCanvas()
      return
    }
    drawing.value = false
    currentStroke.value = null
    hasInk.value = false
  },
  { immediate: true },
)

watch(
  () => props.height,
  () => {
    nextTick(() => measurePad(true))
  },
)

onMounted(() => {
  nextTick(() => {
    setupCanvas()
    bindH5Mouse()
  })
})

onBeforeUnmount(() => {
  if (measureTimer.value) {
    clearTimeout(measureTimer.value)
    measureTimer.value = null
  }
  unbindH5Mouse()
  context.value = null
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-signature {
  width: 100%;
  box-sizing: border-box;
}

.lingyun-signature__card {
  box-sizing: border-box;
  padding: 14px;
  border-radius: 16px;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-shadow: 0 0 0 0.5px var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-signature__head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 2px 10px;
}

.lingyun-signature__title {
  font-size: 17px;
  line-height: 22px;
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-signature__tip {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-signature__pad {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px var(--lingyun-separator, #{$lingyun-separator});
  touch-action: none;
  user-select: none;
}

.lingyun-signature__pad--disabled {
  opacity: 0.6;
}

.lingyun-signature__canvas {
  display: block;
  width: 100%;
}

.lingyun-signature__placeholder {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  font-size: 15px;
  line-height: 22px;
  color: rgba(60, 60, 67, 0.3);
  pointer-events: none;
}

.lingyun-signature__preview {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: inherit;
}

.lingyun-signature__loading {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}

.lingyun-signature__loading-text {
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-signature__actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
}

.lingyun-signature__text-button {
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0 2px;
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-signature__text-button--disabled {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
  pointer-events: none;
}
</style>
