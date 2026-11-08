<template>
  <view
    v-if="mounted"
    class="lingyun-image-upload-editor"
    :class="rootClass"
    :style="rootStyle"
  >
    <view class="lingyun-image-upload-editor__panel">
      <view class="lingyun-image-upload-editor__topbar" :style="topbarStyle">
        <view
          class="lingyun-image-upload-editor__text-button"
          role="button"
          @click="cancel"
        >
          取消
        </view>
        <text class="lingyun-image-upload-editor__title">
          编辑图片 {{ index + 1 }}/{{ total }}
        </text>
        <lingyun-button
          class="lingyun-image-upload-editor__done"
          variant="borderedProminent"
          size="small"
          text="完成"
          @click="confirm"
        />
      </view>

      <view
        class="lingyun-image-upload-editor__stage"
        @touchstart="onStageTouchStart"
        @touchmove.stop.prevent="onStageTouchMove"
        @touchend="onStageTouchEnd"
        @touchcancel="onStageTouchEnd"
      >
        <image
          class="lingyun-image-upload-editor__image"
          :src="imagePath"
          :style="imageStyle"
          mode="scaleToFill"
        />

        <view class="lingyun-image-upload-editor__crop" :style="cropStyle">
          <view class="lingyun-image-upload-editor__grid lingyun-image-upload-editor__grid--v1" />
          <view class="lingyun-image-upload-editor__grid lingyun-image-upload-editor__grid--v2" />
          <view class="lingyun-image-upload-editor__grid lingyun-image-upload-editor__grid--h1" />
          <view class="lingyun-image-upload-editor__grid lingyun-image-upload-editor__grid--h2" />

          <view
            v-if="freeCrop"
            class="lingyun-image-upload-editor__crop-drag"
            @touchstart.stop.prevent="startCropGesture('move', $event)"
          />

          <template v-if="freeCrop">
            <view
              v-for="handle in handles"
              :key="handle"
              class="lingyun-image-upload-editor__handle"
              :class="`lingyun-image-upload-editor__handle--${handle}`"
              @touchstart.stop.prevent="startCropGesture(handle, $event)"
            >
              <view class="lingyun-image-upload-editor__handle-bar lingyun-image-upload-editor__handle-bar--h" />
              <view class="lingyun-image-upload-editor__handle-bar lingyun-image-upload-editor__handle-bar--v" />
            </view>
          </template>
        </view>
      </view>

      <view class="lingyun-image-upload-editor__bottombar" :style="bottombarStyle">
        <view class="lingyun-image-upload-editor__bottom-capsule">
          <view
            class="lingyun-image-upload-editor__round-button"
            role="button"
            aria-label="向左旋转"
            @click="rotate(-90)"
          >
            <lingyun-icon type="undo" :size="22" color="white" />
          </view>
          <view
            class="lingyun-image-upload-editor__round-button"
            role="button"
            aria-label="重置"
            @click="reset"
          >
            <lingyun-icon type="refresh" :size="22" color="white" />
          </view>
          <view
            class="lingyun-image-upload-editor__round-button"
            role="button"
            aria-label="向右旋转"
            @click="rotate(90)"
          >
            <lingyun-icon type="redo" :size="22" color="white" />
          </view>
        </view>
      </view>
    </view>

    <view v-if="exporting" class="lingyun-image-upload-editor__loading">
      <lingyun-activity-indicator size="large" color="#ffffff" />
      <text class="lingyun-image-upload-editor__loading-text">处理中…</text>
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <canvas
      v-if="exporting"
      type="2d"
      :id="canvasId"
      class="lingyun-image-upload-editor__canvas"
    />
    <!-- #endif -->
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { mpOverlayHoldMixin } from '../../utils/mpOverlayHoldMixin'
import {
  LINGYUN_APP_PAGE_SCROLL_LOCK,
  type LingyunAppPageScrollLock,
} from '../lingyun-app-page/useLingyunAppPageScroll'
import {
  buildExportParams,
  clampOffset,
  coverScale,
  defaultCropRect,
  maxScale,
  resizeCropRect,
  rotatedSize,
  zoomOffset,
  type CropHandle,
  type CropRect,
  type StageSize,
} from './crop'
import { exportCroppedImage } from './export-image'

type Phase = '' | 'enter' | 'open' | 'leave'

interface Gesture {
  type: 'pan' | 'pinch' | 'crop'
  handle: CropHandle
  startX: number
  startY: number
  startOffsetX: number
  startOffsetY: number
  startScale: number
  distance: number
  anchorX: number
  anchorY: number
  crop: CropRect
}

interface TouchLike {
  clientX?: number
  pageX?: number
  clientY?: number
  pageY?: number
}

let canvasSequence = 0

function touchesOf(event: TouchEvent): TouchLike[] {
  const list = event.touches as unknown as ArrayLike<TouchLike> | undefined
  return list ? Array.from(list) : []
}

function touchX(touch: TouchLike): number {
  return typeof touch.clientX === 'number' ? touch.clientX : Number(touch.pageX) || 0
}

function touchY(touch: TouchLike): number {
  return typeof touch.clientY === 'number' ? touch.clientY : Number(touch.pageY) || 0
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * lingyun-image-upload 的裁剪编辑器。
 * 预览用 CSS transform，导出用同一套变换画到离屏 Canvas。
 */
export default defineComponent({
  name: 'LingyunImageUploadEditor',
  mixins: [mpOverlayHoldMixin],
  emits: ['confirm', 'cancel'],
  inject: {
    appPageScrollLock: {
      from: LINGYUN_APP_PAGE_SCROLL_LOCK,
      default: null as LingyunAppPageScrollLock | null,
    },
  },
  props: {
    imagePath: { type: String, required: true },
    imageWidth: { type: Number, required: true },
    imageHeight: { type: Number, required: true },
    /** null 表示自由裁剪；数字表示固定宽高比 */
    aspect: { type: Number as PropType<number | null>, default: null },
    index: { type: Number, default: 0 },
    total: { type: Number, default: 1 },
    zIndex: { type: Number, default: 1200 },
    outputMaxSize: { type: Number, default: 2048 },
    quality: { type: Number, default: 0.85 },
    reduceMotion: { type: Boolean, default: false },
  },
  data(): {
    mounted: boolean
    phase: Phase
    stage: StageSize
    stageLeft: number
    stageTop: number
    crop: CropRect
    scale: number
    offsetX: number
    offsetY: number
    rotation: number
    gesture: Gesture | null
    exporting: boolean
    canvasId: string
    closeTimer: ReturnType<typeof setTimeout> | null
    measureTimer: ReturnType<typeof setTimeout> | null
    topInset: number
    bottomInset: number
    scrollLocked: boolean
    appScrollLocked: boolean
    prevBodyOverflow: string
    prevBodyOverscroll: string
    prevHtmlOverscroll: string
  } {
    return {
      mounted: false,
      phase: '',
      stage: { width: 0, height: 0 },
      stageLeft: 0,
      stageTop: 0,
      crop: { x: 0, y: 0, width: 0, height: 0 },
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      gesture: null,
      exporting: false,
      canvasId: `lingyun-image-upload-canvas-${(canvasSequence += 1)}`,
      closeTimer: null,
      measureTimer: null,
      topInset: 8,
      bottomInset: 0,
      scrollLocked: false,
      appScrollLocked: false,
      prevBodyOverflow: '',
      prevBodyOverscroll: '',
      prevHtmlOverscroll: '',
    }
  },
  computed: {
    handles(): CropHandle[] {
      return ['nw', 'ne', 'se', 'sw']
    },
    freeCrop(): boolean {
      return this.aspect === null
    },
    rotatedWidth(): number {
      return rotatedSize(this.imageWidth, this.imageHeight, this.rotation).width
    },
    rotatedHeight(): number {
      return rotatedSize(this.imageWidth, this.imageHeight, this.rotation).height
    },
    minScaleValue(): number {
      return coverScale(this.crop, this.rotatedWidth, this.rotatedHeight)
    },
    maxScaleValue(): number {
      return maxScale(this.crop, this.rotatedWidth, this.rotatedHeight)
    },
    rootClass(): string {
      let themeClass = 'theme-light'
      try {
        themeClass = useLingyunTheme().rootClass || 'theme-light'
      } catch {
        /* pinia 未就绪 */
      }
      return [
        themeClass,
        this.phase ? `lingyun-image-upload-editor--${this.phase}` : '',
        this.reduceMotion ? 'lingyun-image-upload-editor--reduce-motion' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    rootStyle(): Record<string, string> {
      return { zIndex: String(Number(this.zIndex) || 1200) }
    },
    topbarStyle(): Record<string, string> {
      return { paddingTop: `${this.topInset}px` }
    },
    bottombarStyle(): Record<string, string> {
      return { paddingBottom: `${10 + this.bottomInset}px` }
    },
    imageStyle(): Record<string, string> {
      const width = Math.max(1, this.imageWidth * this.scale)
      const height = Math.max(1, this.imageHeight * this.scale)
      return {
        width: `${width}px`,
        height: `${height}px`,
        marginLeft: `${-width / 2}px`,
        marginTop: `${-height / 2}px`,
        transform: `translate3d(${this.offsetX}px, ${this.offsetY}px, 0) rotate(${this.rotation}deg)`,
      }
    },
    cropStyle(): Record<string, string> {
      return {
        left: `${this.crop.x}px`,
        top: `${this.crop.y}px`,
        width: `${this.crop.width}px`,
        height: `${this.crop.height}px`,
      }
    },
  },
  created() {
    this.measureStage()
  },
  mounted() {
    this.lockPageScroll()
    this.openAnim()
  },
  beforeUnmount() {
    this.clearTimers()
    this.unlockPageScroll()
  },
  methods: {
    clearTimers() {
      if (this.closeTimer) {
        clearTimeout(this.closeTimer)
        this.closeTimer = null
      }
      if (this.measureTimer) {
        clearTimeout(this.measureTimer)
        this.measureTimer = null
      }
    },
    openAnim() {
      this.mounted = true
      this.phase = 'enter'
      this.$nextTick(() => {
        this.measureTimer = setTimeout(() => {
          this.measureTimer = null
          this.measureStage()
          this.phase = 'open'
        }, this.reduceMotion ? 0 : 16)
      })
    },
    measureStage() {
      // 编辑器全屏且顶/底栏高度固定，直接用窗口信息算舞台；
      // 微信端顶栏内容从胶囊下方开始，避免「完成」被胶囊/状态栏挡住。
      const info = (
        typeof uni.getWindowInfo === 'function'
          ? uni.getWindowInfo()
          : uni.getSystemInfoSync()
      ) as {
        windowWidth?: number
        windowHeight?: number
        statusBarHeight?: number
        safeAreaInsets?: { top?: number; bottom?: number }
      }
      let width = Number(info.windowWidth) || 0
      let height = Number(info.windowHeight) || 0
      // #ifdef H5
      if ((!width || !height) && typeof window !== 'undefined') {
        width = width || window.innerWidth
        height = height || window.innerHeight
      }
      // #endif
      const safeTop =
        Number(info.safeAreaInsets?.top) || Number(info.statusBarHeight) || 0
      const safeBottom = Number(info.safeAreaInsets?.bottom) || 0
      let topInset = safeTop + 8
      // #ifdef MP-WEIXIN
      try {
        const menu = (
          uni as typeof uni & {
            getMenuButtonBoundingClientRect?: () => { bottom?: number }
          }
        ).getMenuButtonBoundingClientRect?.()
        if (menu && Number(menu.bottom) > 0) {
          topInset = Math.max(topInset, Number(menu.bottom) + 8)
        }
      } catch {
        /* 取不到胶囊时退回状态栏 */
      }
      // #endif
      this.topInset = topInset
      this.bottomInset = safeBottom
      const topbarHeight = topInset + 44 + 8
      const bottombarHeight = 10 + 64 + 10 + safeBottom
      this.stageLeft = 0
      this.stageTop = topbarHeight
      this.stage = {
        width: Math.max(1, width),
        height: Math.max(1, height - topbarHeight - bottombarHeight),
      }
      this.initCrop()
    },
    initCrop() {
      this.crop = defaultCropRect(this.stage, 24, this.aspect)
      this.scale = this.minScaleValue
      this.offsetX = 0
      this.offsetY = 0
    },
    clampView() {
      const min = this.minScaleValue
      if (this.scale < min) this.scale = min
      const offset = clampOffset(
        this.offsetX,
        this.offsetY,
        this.stage,
        this.crop,
        this.rotatedWidth,
        this.rotatedHeight,
        this.scale,
      )
      this.offsetX = offset.x
      this.offsetY = offset.y
    },
    rotate(delta: number) {
      this.rotation = (this.rotation + delta + 360) % 360
      this.scale = this.minScaleValue
      this.offsetX = 0
      this.offsetY = 0
      this.clampView()
    },
    reset() {
      this.rotation = 0
      this.initCrop()
    },
    onStageTouchStart(event: TouchEvent) {
      const touches = touchesOf(event)
      if (touches.length >= 2) {
        const first = touches[0]
        const second = touches[1]
        const firstX = touchX(first) - this.stageLeft
        const firstY = touchY(first) - this.stageTop
        const secondX = touchX(second) - this.stageLeft
        const secondY = touchY(second) - this.stageTop
        this.gesture = {
          type: 'pinch',
          handle: 'move',
          startX: 0,
          startY: 0,
          startOffsetX: this.offsetX,
          startOffsetY: this.offsetY,
          startScale: this.scale,
          distance: Math.hypot(secondX - firstX, secondY - firstY),
          anchorX: (firstX + secondX) / 2,
          anchorY: (firstY + secondY) / 2,
          crop: { ...this.crop },
        }
        return
      }
      if (touches.length !== 1) return
      const touch = touches[0]
      this.gesture = {
        type: 'pan',
        handle: 'move',
        startX: touchX(touch),
        startY: touchY(touch),
        startOffsetX: this.offsetX,
        startOffsetY: this.offsetY,
        startScale: this.scale,
        distance: 0,
        anchorX: 0,
        anchorY: 0,
        crop: { ...this.crop },
      }
    },
    onStageTouchMove(event: TouchEvent) {
      const gesture = this.gesture
      if (!gesture) return
      const touches = touchesOf(event)

      if (gesture.type === 'pan' && touches.length === 1) {
        const touch = touches[0]
        this.offsetX = gesture.startOffsetX + touchX(touch) - gesture.startX
        this.offsetY = gesture.startOffsetY + touchY(touch) - gesture.startY
        this.clampView()
        return
      }

      if (gesture.type === 'pinch' && touches.length >= 2) {
        const first = touches[0]
        const second = touches[1]
        const firstX = touchX(first) - this.stageLeft
        const firstY = touchY(first) - this.stageTop
        const secondX = touchX(second) - this.stageLeft
        const secondY = touchY(second) - this.stageTop
        const distance = Math.hypot(secondX - firstX, secondY - firstY)
        const nextScale = clamp(
          gesture.startScale * (distance / Math.max(1, gesture.distance)),
          this.minScaleValue,
          this.maxScaleValue,
        )
        const ratio = nextScale / Math.max(0.0001, gesture.startScale)
        const offset = zoomOffset(
          (firstX + secondX) / 2,
          (firstY + secondY) / 2,
          this.stage,
          gesture.startOffsetX,
          gesture.startOffsetY,
          ratio,
        )
        this.scale = nextScale
        this.offsetX = offset.x
        this.offsetY = offset.y
        this.clampView()
        return
      }

      if (gesture.type === 'crop' && touches.length === 1) {
        const touch = touches[0]
        this.crop = resizeCropRect(
          gesture.crop,
          gesture.handle,
          touchX(touch) - gesture.startX,
          touchY(touch) - gesture.startY,
          this.stage,
          40,
        )
        this.clampView()
      }
    },
    onStageTouchEnd() {
      this.gesture = null
    },
    startCropGesture(
      handle: CropHandle,
      event: TouchEvent,
    ) {
      if (!this.freeCrop) return
      const touches = touchesOf(event)
      if (touches.length !== 1) return
      const touch = touches[0]
      this.gesture = {
        type: 'crop',
        handle,
        startX: touchX(touch),
        startY: touchY(touch),
        startOffsetX: this.offsetX,
        startOffsetY: this.offsetY,
        startScale: this.scale,
        distance: 0,
        anchorX: 0,
        anchorY: 0,
        crop: { ...this.crop },
      }
    },
    confirm() {
      if (this.exporting) return
      this.exporting = true
      this.$nextTick(() => {
        const params = buildExportParams(
          this.stage,
          this.crop,
          {
            imageWidth: this.imageWidth,
            imageHeight: this.imageHeight,
            rotation: this.rotation,
            scale: this.scale,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
          },
          this.outputMaxSize,
        )
        exportCroppedImage({
          imagePath: this.imagePath,
          params,
          quality: this.quality,
          canvasId: this.canvasId,
          instance: this,
        })
          .then((result) => {
            this.exporting = false
            this.finish('confirm', result)
          })
          .catch((error: Error) => {
            this.exporting = false
            uni.showToast({
              title: error?.message || '图片导出失败',
              icon: 'none',
            })
          })
      })
    },
    cancel() {
      if (this.exporting) return
      this.finish('cancel')
    },
    finish(type: 'confirm' | 'cancel', result?: { filePath: string; revoke?: () => void }) {
      this.phase = 'leave'
      this.closeTimer = setTimeout(
        () => {
          this.closeTimer = null
          if (type === 'confirm') this.$emit('confirm', result)
          else this.$emit('cancel')
        },
        this.reduceMotion ? 16 : 200,
      )
    },
    lockPageScroll() {
      try {
        const lock = this.appPageScrollLock as LingyunAppPageScrollLock | null
        if (lock && typeof lock.lock === 'function' && !this.appScrollLocked) {
          lock.lock()
          this.appScrollLocked = true
        }
      } catch {
        /* 不在 app-page 内 */
      }
      // #ifdef H5
      if (typeof document === 'undefined' || this.scrollLocked) return
      const body = document.body
      const html = document.documentElement
      this.prevBodyOverflow = body.style.overflow
      this.prevBodyOverscroll = body.style.overscrollBehavior
      this.prevHtmlOverscroll = html.style.overscrollBehavior
      body.style.overflow = 'hidden'
      body.style.overscrollBehavior = 'none'
      html.style.overscrollBehavior = 'none'
      this.scrollLocked = true
      // #endif
    },
    unlockPageScroll() {
      try {
        const lock = this.appPageScrollLock as LingyunAppPageScrollLock | null
        if (lock && typeof lock.unlock === 'function' && this.appScrollLocked) {
          lock.unlock()
          this.appScrollLocked = false
        }
      } catch {
        /* 不在 app-page 内 */
      }
      // #ifdef H5
      if (typeof document === 'undefined' || !this.scrollLocked) return
      const body = document.body
      const html = document.documentElement
      body.style.overflow = this.prevBodyOverflow
      body.style.overscrollBehavior = this.prevBodyOverscroll
      html.style.overscrollBehavior = this.prevHtmlOverscroll
      this.scrollLocked = false
      // #endif
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-image-upload-editor {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: #000000;
  touch-action: none;
  overscroll-behavior: none;
}

.lingyun-image-upload-editor__panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  transition: transform 0.24s cubic-bezier(0.32, 0.72, 0, 1);
}

.lingyun-image-upload-editor--enter .lingyun-image-upload-editor__panel,
.lingyun-image-upload-editor--leave .lingyun-image-upload-editor__panel {
  transform: translateY(12px);
}

.lingyun-image-upload-editor__topbar,
.lingyun-image-upload-editor__bottombar {
  display: flex;
  align-items: center;
}

.lingyun-image-upload-editor__topbar {
  justify-content: space-between;
  padding: 0 16px 8px;
  background-color: $lingyun-glass-overlay-bg-dark;
  box-shadow:
    $lingyun-glass-highlight-dark,
    inset 0 -0.5px 0 rgba(255, 255, 255, 0.14);
  /* #ifdef H5 || APP-PLUS */
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  /* #endif */
}

.lingyun-image-upload-editor__bottombar {
  justify-content: center;
  padding: 10px 16px;
  background-color: transparent;
}

.lingyun-image-upload-editor__bottom-capsule {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  width: 100%;
  height: 64px;
  box-sizing: border-box;
  border: $lingyun-glass-hairline-dark;
  border-radius: 26px;
  background-color: $lingyun-glass-overlay-bg-dark;
  box-shadow:
    $lingyun-glass-highlight-dark,
    $lingyun-glass-shadow-dark;
  /* #ifdef H5 || APP-PLUS */
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  /* #endif */
}

.lingyun-image-upload-editor__text-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 44px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.lingyun-image-upload-editor__done {
  flex-shrink: 0;
}

.lingyun-image-upload-editor__title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.lingyun-image-upload-editor__round-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  background-color: $lingyun-glass-control-bg-dark;
  box-shadow:
    $lingyun-glass-control-lens-dark,
    0 0 0 0.5px $lingyun-glass-control-ring-dark,
    $lingyun-glass-control-shadow-dark;
  /* #ifdef H5 || APP-PLUS */
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-control-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-control-blur);
  /* #endif */
}

.lingyun-image-upload-editor__stage {
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
  background-color: #000000;
  touch-action: none;
}

.lingyun-image-upload-editor__image {
  position: absolute;
  left: 50%;
  top: 50%;
  display: block;
  transform-origin: 50% 50%;
  will-change: transform;
}

.lingyun-image-upload-editor__crop {
  position: absolute;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
}

.lingyun-image-upload-editor__grid {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.28);
}

.lingyun-image-upload-editor__grid--v1 {
  top: 0;
  bottom: 0;
  left: 33.333%;
  width: 1px;
}

.lingyun-image-upload-editor__grid--v2 {
  top: 0;
  bottom: 0;
  left: 66.666%;
  width: 1px;
}

.lingyun-image-upload-editor__grid--h1 {
  left: 0;
  right: 0;
  top: 33.333%;
  height: 1px;
}

.lingyun-image-upload-editor__grid--h2 {
  left: 0;
  right: 0;
  top: 66.666%;
  height: 1px;
}

.lingyun-image-upload-editor__crop-drag {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.lingyun-image-upload-editor__handle {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.lingyun-image-upload-editor__handle--nw {
  left: -16px;
  top: -16px;
}

.lingyun-image-upload-editor__handle--ne {
  right: -16px;
  top: -16px;
}

.lingyun-image-upload-editor__handle--se {
  right: -16px;
  bottom: -16px;
}

.lingyun-image-upload-editor__handle--sw {
  left: -16px;
  bottom: -16px;
}

.lingyun-image-upload-editor__handle-bar {
  position: absolute;
  background-color: #ffffff;
  border-radius: 1px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.35);
}

.lingyun-image-upload-editor__handle-bar--h {
  width: 18px;
  height: 2px;
}

.lingyun-image-upload-editor__handle-bar--v {
  width: 2px;
  height: 18px;
}

.lingyun-image-upload-editor__handle--nw .lingyun-image-upload-editor__handle-bar--h,
.lingyun-image-upload-editor__handle--nw .lingyun-image-upload-editor__handle-bar--v {
  left: 16px;
  top: 16px;
}

.lingyun-image-upload-editor__handle--ne .lingyun-image-upload-editor__handle-bar--h,
.lingyun-image-upload-editor__handle--ne .lingyun-image-upload-editor__handle-bar--v {
  right: 16px;
  top: 16px;
}

.lingyun-image-upload-editor__handle--se .lingyun-image-upload-editor__handle-bar--h,
.lingyun-image-upload-editor__handle--se .lingyun-image-upload-editor__handle-bar--v {
  right: 16px;
  bottom: 16px;
}

.lingyun-image-upload-editor__handle--sw .lingyun-image-upload-editor__handle-bar--h,
.lingyun-image-upload-editor__handle--sw .lingyun-image-upload-editor__handle-bar--v {
  left: 16px;
  bottom: 16px;
}

.lingyun-image-upload-editor__loading {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-color: rgba(0, 0, 0, 0.45);
}

.lingyun-image-upload-editor__loading-text {
  font-size: 14px;
  color: #ffffff;
}

.lingyun-image-upload-editor__canvas {
  position: fixed;
  left: -9999px;
  top: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

.lingyun-image-upload-editor--reduce-motion .lingyun-image-upload-editor__panel {
  transition: none;
}
</style>
