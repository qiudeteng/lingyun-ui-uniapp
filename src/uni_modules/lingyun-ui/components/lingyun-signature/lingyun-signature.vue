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

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
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

let signatureSequence = 0

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
export default defineComponent({
  name: 'LingyunSignature',
  emits: ['update:modelValue', 'confirm', 'clear', 'start', 'end', 'error'],
  props: {
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
  },
  data(): {
    uid: number
    context: SignatureContext | null
    contextReady: boolean
    canvasWidth: number
    canvasHeight: number
    padLeft: number
    padTop: number
    strokes: SignatureStroke[]
    currentStroke: SignatureStroke | null
    drawing: boolean
    hasInk: boolean
    previewPath: string
    exporting: boolean
    measureAttempts: number
    measureTimer: ReturnType<typeof setTimeout> | null
    lastTouchAt: number
    h5Pad: HTMLElement | null
    h5MouseDown: ((event: MouseEvent) => void) | null
    h5MouseMove: ((event: MouseEvent) => void) | null
    h5MouseUp: ((event: MouseEvent) => void) | null
    h5Resize: (() => void) | null
  } {
    return {
      uid: (signatureSequence += 1),
      context: null,
      contextReady: false,
      canvasWidth: 0,
      canvasHeight: 0,
      padLeft: 0,
      padTop: 0,
      strokes: [],
      currentStroke: null,
      drawing: false,
      hasInk: false,
      previewPath: '',
      exporting: false,
      measureAttempts: 0,
      measureTimer: null,
      lastTouchAt: 0,
      h5Pad: null,
      h5MouseDown: null,
      h5MouseMove: null,
      h5MouseUp: null,
      h5Resize: null,
    }
  },
  computed: {
    rootClass(): string {
      let themeClass = 'theme-light'
      try {
        themeClass = useLingyunTheme().rootClass || 'theme-light'
      } catch {
        /* pinia 未就绪 */
      }
      return themeClass
    },
    canvasId(): string {
      return `lingyun-signature-canvas-${this.uid}`
    },
    padId(): string {
      return `lingyun-signature-pad-${this.uid}`
    },
    padHeight(): number {
      return Math.max(120, Number(this.height) || 180)
    },
    resolvedPenWidth(): number {
      return clamp(Number(this.penWidth) || 3, 1, 12)
    },
    padStyle(): Record<string, string> {
      return {
        height: `${this.padHeight}px`,
        backgroundColor: this.backgroundColor || 'transparent',
      }
    },
    canDraw(): boolean {
      return (
        !this.disabled &&
        !this.readonly &&
        !this.exporting &&
        !this.previewPath
      )
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(value: string) {
        const next = String(value == null ? '' : value)
        if (next === this.previewPath) return
        this.previewPath = next
        if (!next) {
          if (!this.drawing) this.clearCanvas()
          return
        }
        this.drawing = false
        this.currentStroke = null
        this.hasInk = false
      },
    },
    height() {
      this.$nextTick(() => this.measurePad(true))
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.setupCanvas()
      this.bindH5Mouse()
    })
  },
  beforeUnmount() {
    if (this.measureTimer) {
      clearTimeout(this.measureTimer)
      this.measureTimer = null
    }
    this.unbindH5Mouse()
    this.context = null
  },
  methods: {
    setupCanvas(): void {
      if (!this.contextReady) {
        const context = uni.createCanvasContext(this.canvasId, this)
        this.context = markRaw(context as unknown as SignatureContext)
        this.contextReady = true
      }
      this.measurePad()
    },
    measurePad(redraw = false): void {
      const apply = (rect: SignatureRect) => {
        const width = Number(rect.width) || 0
        const height = Number(rect.height) || 0
        if (width <= 0 || height <= 0) {
          this.retryMeasure(redraw)
          return
        }
        const changed =
          Math.abs(width - this.canvasWidth) > 0.5 ||
          Math.abs(height - this.canvasHeight) > 0.5
        this.canvasWidth = width
        this.canvasHeight = height
        this.padLeft = Number(rect.left) || 0
        this.padTop = Number(rect.top) || 0
        this.measureAttempts = 0
        if (changed || redraw || !this.hasInk) this.redraw()
      }

      // #ifdef H5
      if (typeof document !== 'undefined') {
        const pad = document.getElementById(this.padId)
        if (pad) {
          apply(pad.getBoundingClientRect())
          return
        }
      }
      // #endif

      uni
        .createSelectorQuery()
        .in(this)
        .select(`#${this.padId}`)
        .boundingClientRect()
        .exec((res) => {
          const rect = res && (res[0] as SignatureRect | null)
          if (!rect) {
            this.retryMeasure(redraw)
            return
          }
          apply(rect)
        })
    },
    retryMeasure(redraw: boolean): void {
      if (this.measureAttempts >= 3) return
      this.measureAttempts += 1
      if (this.measureTimer) clearTimeout(this.measureTimer)
      this.measureTimer = setTimeout(() => {
        this.measureTimer = null
        this.measurePad(redraw)
      }, 60)
    },
    redraw(): void {
      const context = this.context
      if (!context || this.canvasWidth <= 0 || this.canvasHeight <= 0) return
      context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      if (this.backgroundColor && this.backgroundColor !== 'transparent') {
        context.setFillStyle(this.backgroundColor)
        context.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      }
      this.strokes.forEach((stroke) => this.drawStroke(stroke))
      if (this.currentStroke) this.drawStroke(this.currentStroke)
      context.draw()
    },
    drawStroke(stroke: SignatureStroke): void {
      const context = this.context
      const points = stroke.points
      if (!context || !points.length) return
      const toX = (point: SignaturePoint) => point.x * this.canvasWidth
      const toY = (point: SignaturePoint) => point.y * this.canvasHeight

      if (points.length === 1) {
        context.setFillStyle(this.penColor)
        context.beginPath()
        context.arc(
          toX(points[0]),
          toY(points[0]),
          this.resolvedPenWidth / 2,
          0,
          Math.PI * 2,
        )
        context.fill()
        return
      }

      context.setStrokeStyle(this.penColor)
      context.setLineWidth(this.resolvedPenWidth)
      context.setLineCap('round')
      context.setLineJoin('round')
      context.beginPath()
      context.moveTo(toX(points[0]), toY(points[0]))
      for (let index = 1; index < points.length; index += 1) {
        context.lineTo(toX(points[index]), toY(points[index]))
      }
      context.stroke()
    },
    drawSegment(previous: SignaturePoint, next: SignaturePoint): void {
      const context = this.context
      if (!context) return
      context.setStrokeStyle(this.penColor)
      context.setLineWidth(this.resolvedPenWidth)
      context.setLineCap('round')
      context.setLineJoin('round')
      context.beginPath()
      context.moveTo(
        previous.x * this.canvasWidth,
        previous.y * this.canvasHeight,
      )
      context.lineTo(next.x * this.canvasWidth, next.y * this.canvasHeight)
      context.stroke()
      context.draw(true)
    },
    drawDot(point: SignaturePoint): void {
      const context = this.context
      if (!context) return
      context.setFillStyle(this.penColor)
      context.beginPath()
      context.arc(
        point.x * this.canvasWidth,
        point.y * this.canvasHeight,
        this.resolvedPenWidth / 2,
        0,
        Math.PI * 2,
      )
      context.fill()
      context.draw(true)
    },
    normalizePoint(x: number, y: number): SignaturePoint {
      return {
        x: clamp(x / this.canvasWidth, 0, 1),
        y: clamp(y / this.canvasHeight, 0, 1),
      }
    },
    pointFromTouch(touch: TouchLike): SignaturePoint {
      let x = 0
      let y = 0
      // #ifdef H5
      x = Number(touch.clientX || 0) - this.padLeft
      y = Number(touch.clientY || 0) - this.padTop
      // #endif
      // #ifndef H5
      if (typeof touch.x === 'number' && typeof touch.y === 'number') {
        x = touch.x
        y = touch.y
      } else {
        x = Number(touch.clientX || 0) - this.padLeft
        y = Number(touch.clientY || 0) - this.padTop
      }
      // #endif
      return this.normalizePoint(x, y)
    },
    pointFromMouse(event: MouseEvent): SignaturePoint {
      return this.normalizePoint(
        event.clientX - this.padLeft,
        event.clientY - this.padTop,
      )
    },
    startStroke(point: SignaturePoint): void {
      this.drawing = true
      this.currentStroke = { points: [point] }
      this.hasInk = true
      this.$emit('start')
    },
    extendStroke(point: SignaturePoint): void {
      const stroke = this.currentStroke
      if (!this.drawing || !stroke) return
      const previous = stroke.points[stroke.points.length - 1]
      if (!previous) {
        stroke.points.push(point)
        return
      }
      const distance = Math.hypot(
        (point.x - previous.x) * this.canvasWidth,
        (point.y - previous.y) * this.canvasHeight,
      )
      if (distance < 0.6) return
      stroke.points.push(point)
      this.drawSegment(previous, point)
    },
    endStroke(): void {
      const stroke = this.currentStroke
      if (!this.drawing || !stroke) return
      if (stroke.points.length === 1) this.drawDot(stroke.points[0])
      this.strokes.push(stroke)
      this.currentStroke = null
      this.drawing = false
      this.$emit('end')
    },
    onTouchStart(event: TouchEvent): void {
      if (!this.canDraw) return
      this.lastTouchAt = Date.now()
      this.refreshH5Rect()
      const touch = touchesOf(event)[0]
      if (!touch) return
      this.startStroke(this.pointFromTouch(touch))
    },
    onTouchMove(event: TouchEvent): void {
      if (!this.canDraw || !this.drawing) return
      const touch = touchesOf(event)[0]
      if (!touch) return
      this.extendStroke(this.pointFromTouch(touch))
    },
    onTouchEnd(): void {
      if (!this.drawing) return
      this.endStroke()
    },
    refreshH5Rect(): void {
      // #ifdef H5
      if (typeof document === 'undefined') return
      const pad = document.getElementById(this.padId)
      if (!pad) return
      const rect = pad.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      this.padLeft = rect.left
      this.padTop = rect.top
      if (
        Math.abs(rect.width - this.canvasWidth) > 0.5 ||
        Math.abs(rect.height - this.canvasHeight) > 0.5
      ) {
        this.canvasWidth = rect.width
        this.canvasHeight = rect.height
        this.redraw()
      }
      // #endif
    },
    bindH5Mouse(): void {
      // #ifdef H5
      if (typeof document === 'undefined') return
      const pad = document.getElementById(this.padId)
      if (!pad) return
      this.h5Pad = markRaw(pad as HTMLElement)
      this.h5MouseDown = (event: MouseEvent) => {
        if (Date.now() - this.lastTouchAt < 500) return
        if (!this.canDraw) return
        event.preventDefault()
        this.refreshH5Rect()
        this.startStroke(this.pointFromMouse(event))
      }
      this.h5MouseMove = (event: MouseEvent) => {
        if (!this.drawing) return
        event.preventDefault()
        this.extendStroke(this.pointFromMouse(event))
      }
      this.h5MouseUp = () => {
        if (!this.drawing) return
        this.endStroke()
      }
      this.h5Resize = () => this.measurePad(true)
      this.h5Pad.addEventListener('mousedown', this.h5MouseDown)
      window.addEventListener('mousemove', this.h5MouseMove)
      window.addEventListener('mouseup', this.h5MouseUp)
      window.addEventListener('resize', this.h5Resize)
      // #endif
    },
    unbindH5Mouse(): void {
      // #ifdef H5
      if (this.h5Pad && this.h5MouseDown) {
        this.h5Pad.removeEventListener('mousedown', this.h5MouseDown)
      }
      if (this.h5MouseMove) {
        window.removeEventListener('mousemove', this.h5MouseMove)
      }
      if (this.h5MouseUp) {
        window.removeEventListener('mouseup', this.h5MouseUp)
      }
      if (this.h5Resize) {
        window.removeEventListener('resize', this.h5Resize)
      }
      this.h5Pad = null
      this.h5MouseDown = null
      this.h5MouseMove = null
      this.h5MouseUp = null
      this.h5Resize = null
      // #endif
    },
    clearCanvas(): void {
      this.strokes = []
      this.currentStroke = null
      this.drawing = false
      this.hasInk = false
      this.redraw()
    },
    clear(): void {
      if (this.disabled) return
      this.previewPath = ''
      this.clearCanvas()
      this.$emit('update:modelValue', '')
      this.$emit('clear')
    },
    restart(): void {
      if (this.disabled) return
      this.previewPath = ''
      this.clearCanvas()
      this.$emit('update:modelValue', '')
      this.$emit('clear')
      this.$nextTick(() => this.measurePad(true))
    },
    confirm(): void {
      if (this.exporting || this.disabled || this.readonly) return
      if (!this.hasInk && !this.strokes.length) {
        uni.showToast({ title: '请先签名', icon: 'none' })
        return
      }
      this.exporting = true
      const options: Record<string, unknown> = {
        canvasId: this.canvasId,
        fileType: 'png',
        quality: 1,
        success: (res: { tempFilePath?: string }) => {
          this.exporting = false
          const path = res && res.tempFilePath ? String(res.tempFilePath) : ''
          if (!path) {
            this.failExport('签名导出失败')
            return
          }
          this.previewPath = path
          this.drawing = false
          this.currentStroke = null
          this.$emit('update:modelValue', path)
          const payload: LingyunSignatureConfirmPayload = {
            path,
            width: this.canvasWidth,
            height: this.canvasHeight,
          }
          this.$emit('confirm', payload)
        },
        fail: (error: { errMsg?: string }) => {
          this.exporting = false
          this.failExport(error && error.errMsg ? error.errMsg : '签名导出失败')
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
        ).canvasToTempFilePath(options, this)
      } catch {
        this.exporting = false
        this.failExport('签名导出失败')
      }
    },
    failExport(message: string): void {
      uni.showToast({ title: message, icon: 'none' })
      this.$emit('error', { message })
    },
    resize(): void {
      this.measurePad(true)
    },
  },
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
