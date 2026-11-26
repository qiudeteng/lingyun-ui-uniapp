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

<script setup lang="ts">
import { computed, getCurrentInstance, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { nextLingyunUid } from '../../utils/uid'
import { type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { syncLingyunMpOverlayHold } from '../../utils/mp-overlay-gate'
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
defineOptions({
  name: 'LingyunImageUploadEditor',
})

const props = defineProps({
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
})

const emit = defineEmits(['confirm', 'cancel'])

const appPageScrollLock = inject(LINGYUN_APP_PAGE_SCROLL_LOCK, null) as LingyunAppPageScrollLock | null

const instance = getCurrentInstance()

const mounted = ref(false)
const phase = ref<Phase>('')
const stage = ref<StageSize>({ width: 0, height: 0 })
const stageLeft = ref(0)
const stageTop = ref(0)
const crop = ref<CropRect>({ x: 0, y: 0, width: 0, height: 0 })
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const rotation = ref(0)
const gesture = ref<Gesture | null>(null)
const exporting = ref(false)
const canvasId = ref(`lingyun-image-upload-canvas-${nextLingyunUid('cropCanvas')}`)
const closeTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const measureTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const topInset = ref(8)
const bottomInset = ref(0)
const scrollLocked = ref(false)
const appScrollLocked = ref(false)
const prevBodyOverflow = ref('')
const prevBodyOverscroll = ref('')
const prevHtmlOverscroll = ref('')
const _lingyunMpOverlayHold = ref(false)

const handles = computed((): CropHandle[] => {
  return ['nw', 'ne', 'se', 'sw']
})

const freeCrop = computed((): boolean => {
  return props.aspect === null
})

const rotatedWidth = computed((): number => {
  return rotatedSize(props.imageWidth, props.imageHeight, rotation.value).width
})

const rotatedHeight = computed((): number => {
  return rotatedSize(props.imageWidth, props.imageHeight, rotation.value).height
})

const minScaleValue = computed((): number => {
  return coverScale(crop.value, rotatedWidth.value, rotatedHeight.value)
})

const maxScaleValue = computed((): number => {
  return maxScale(crop.value, rotatedWidth.value, rotatedHeight.value)
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
    phase.value ? `lingyun-image-upload-editor--${phase.value}` : '',
    props.reduceMotion ? 'lingyun-image-upload-editor--reduce-motion' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const rootStyle = computed((): Record<string, string> => {
  return { zIndex: String(Number(props.zIndex) || 1200) }
})

const topbarStyle = computed((): Record<string, string> => {
  return { paddingTop: `${topInset.value}px` }
})

const bottombarStyle = computed((): Record<string, string> => {
  return { paddingBottom: `${10 + bottomInset.value}px` }
})

const imageStyle = computed((): Record<string, string> => {
  const width = Math.max(1, props.imageWidth * scale.value)
  const height = Math.max(1, props.imageHeight * scale.value)
  return {
    width: `${width}px`,
    height: `${height}px`,
    marginLeft: `${-width / 2}px`,
    marginTop: `${-height / 2}px`,
    transform: `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) rotate(${rotation.value}deg)`,
  }
})

const cropStyle = computed((): Record<string, string> => {
  return {
    left: `${crop.value.x}px`,
    top: `${crop.value.y}px`,
    width: `${crop.value.width}px`,
    height: `${crop.value.height}px`,
  }
})

function clearTimers(): void {
  if (closeTimer.value) {
    clearTimeout(closeTimer.value)
    closeTimer.value = null
  }
  if (measureTimer.value) {
    clearTimeout(measureTimer.value)
    measureTimer.value = null
  }
}

function initCrop(): void {
  crop.value = defaultCropRect(stage.value, 24, props.aspect)
  scale.value = minScaleValue.value
  offsetX.value = 0
  offsetY.value = 0
}

function measureStage(): void {
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
  let nextTopInset = safeTop + 8
  // #ifdef MP-WEIXIN
  try {
    const menu = (
      uni as typeof uni & {
        getMenuButtonBoundingClientRect?: () => { bottom?: number }
      }
    ).getMenuButtonBoundingClientRect?.()
    if (menu && Number(menu.bottom) > 0) {
      nextTopInset = Math.max(nextTopInset, Number(menu.bottom) + 8)
    }
  } catch {
    /* 取不到胶囊时退回状态栏 */
  }
  // #endif
  topInset.value = nextTopInset
  bottomInset.value = safeBottom
  const topbarHeight = nextTopInset + 44 + 8
  const bottombarHeight = 10 + 64 + 10 + safeBottom
  stageLeft.value = 0
  stageTop.value = topbarHeight
  stage.value = {
    width: Math.max(1, width),
    height: Math.max(1, height - topbarHeight - bottombarHeight),
  }
  initCrop()
}

function clampView(): void {
  const min = minScaleValue.value
  if (scale.value < min) scale.value = min
  const offset = clampOffset(
    offsetX.value,
    offsetY.value,
    stage.value,
    crop.value,
    rotatedWidth.value,
    rotatedHeight.value,
    scale.value,
  )
  offsetX.value = offset.x
  offsetY.value = offset.y
}

function rotate(delta: number): void {
  rotation.value = (rotation.value + delta + 360) % 360
  scale.value = minScaleValue.value
  offsetX.value = 0
  offsetY.value = 0
  clampView()
}

function reset(): void {
  rotation.value = 0
  initCrop()
}

function openAnim(): void {
  mounted.value = true
  phase.value = 'enter'
  nextTick(() => {
    measureTimer.value = setTimeout(() => {
      measureTimer.value = null
      measureStage()
      phase.value = 'open'
    }, props.reduceMotion ? 0 : 16)
  })
}

function onStageTouchStart(event: TouchEvent): void {
  const touches = touchesOf(event)
  if (touches.length >= 2) {
    const first = touches[0]
    const second = touches[1]
    const firstX = touchX(first) - stageLeft.value
    const firstY = touchY(first) - stageTop.value
    const secondX = touchX(second) - stageLeft.value
    const secondY = touchY(second) - stageTop.value
    gesture.value = {
      type: 'pinch',
      handle: 'move',
      startX: 0,
      startY: 0,
      startOffsetX: offsetX.value,
      startOffsetY: offsetY.value,
      startScale: scale.value,
      distance: Math.hypot(secondX - firstX, secondY - firstY),
      anchorX: (firstX + secondX) / 2,
      anchorY: (firstY + secondY) / 2,
      crop: { ...crop.value },
    }
    return
  }
  if (touches.length !== 1) return
  const touch = touches[0]
  gesture.value = {
    type: 'pan',
    handle: 'move',
    startX: touchX(touch),
    startY: touchY(touch),
    startOffsetX: offsetX.value,
    startOffsetY: offsetY.value,
    startScale: scale.value,
    distance: 0,
    anchorX: 0,
    anchorY: 0,
    crop: { ...crop.value },
  }
}

function onStageTouchMove(event: TouchEvent): void {
  const g = gesture.value
  if (!g) return
  const touches = touchesOf(event)

  if (g.type === 'pan' && touches.length === 1) {
    const touch = touches[0]
    offsetX.value = g.startOffsetX + touchX(touch) - g.startX
    offsetY.value = g.startOffsetY + touchY(touch) - g.startY
    clampView()
    return
  }

  if (g.type === 'pinch' && touches.length >= 2) {
    const first = touches[0]
    const second = touches[1]
    const firstX = touchX(first) - stageLeft.value
    const firstY = touchY(first) - stageTop.value
    const secondX = touchX(second) - stageLeft.value
    const secondY = touchY(second) - stageTop.value
    const distance = Math.hypot(secondX - firstX, secondY - firstY)
    const nextScale = clamp(
      g.startScale * (distance / Math.max(1, g.distance)),
      minScaleValue.value,
      maxScaleValue.value,
    )
    const ratio = nextScale / Math.max(0.0001, g.startScale)
    const offset = zoomOffset(
      (firstX + secondX) / 2,
      (firstY + secondY) / 2,
      stage.value,
      g.startOffsetX,
      g.startOffsetY,
      ratio,
    )
    scale.value = nextScale
    offsetX.value = offset.x
    offsetY.value = offset.y
    clampView()
    return
  }

  if (g.type === 'crop' && touches.length === 1) {
    const touch = touches[0]
    crop.value = resizeCropRect(
      g.crop,
      g.handle,
      touchX(touch) - g.startX,
      touchY(touch) - g.startY,
      stage.value,
      40,
    )
    clampView()
  }
}

function onStageTouchEnd(): void {
  gesture.value = null
}

function startCropGesture(
  handle: CropHandle,
  event: TouchEvent,
): void {
  if (!freeCrop.value) return
  const touches = touchesOf(event)
  if (touches.length !== 1) return
  const touch = touches[0]
  gesture.value = {
    type: 'crop',
    handle,
    startX: touchX(touch),
    startY: touchY(touch),
    startOffsetX: offsetX.value,
    startOffsetY: offsetY.value,
    startScale: scale.value,
    distance: 0,
    anchorX: 0,
    anchorY: 0,
    crop: { ...crop.value },
  }
}

function finish(type: 'confirm' | 'cancel', result?: { filePath: string; revoke?: () => void }): void {
  phase.value = 'leave'
  closeTimer.value = setTimeout(
    () => {
      closeTimer.value = null
      if (type === 'confirm') emit('confirm', result)
      else emit('cancel')
    },
    props.reduceMotion ? 16 : 200,
  )
}

function cancel(): void {
  if (exporting.value) return
  finish('cancel')
}

function confirm(): void {
  if (exporting.value) return
  exporting.value = true
  nextTick(() => {
    const params = buildExportParams(
      stage.value,
      crop.value,
      {
        imageWidth: props.imageWidth,
        imageHeight: props.imageHeight,
        rotation: rotation.value,
        scale: scale.value,
        offsetX: offsetX.value,
        offsetY: offsetY.value,
      },
      props.outputMaxSize,
    )
    exportCroppedImage({
      imagePath: props.imagePath,
      params,
      quality: props.quality,
      canvasId: canvasId.value,
      instance: instance?.proxy,
    })
      .then((result) => {
        exporting.value = false
        finish('confirm', result)
      })
      .catch((error: Error) => {
        exporting.value = false
        uni.showToast({
          title: error?.message || '图片导出失败',
          icon: 'none',
        })
      })
  })
}

function lockPageScroll(): void {
  try {
    const lock = appPageScrollLock as LingyunAppPageScrollLock | null
    if (lock && typeof lock.lock === 'function' && !appScrollLocked.value) {
      lock.lock()
      appScrollLocked.value = true
    }
  } catch {
    /* 不在 app-page 内 */
  }
  // #ifdef H5
  if (typeof document === 'undefined' || scrollLocked.value) return
  const body = document.body
  const html = document.documentElement
  prevBodyOverflow.value = body.style.overflow
  prevBodyOverscroll.value = body.style.overscrollBehavior
  prevHtmlOverscroll.value = html.style.overscrollBehavior
  body.style.overflow = 'hidden'
  body.style.overscrollBehavior = 'none'
  html.style.overscrollBehavior = 'none'
  scrollLocked.value = true
  // #endif
}

function unlockPageScroll(): void {
  try {
    const lock = appPageScrollLock as LingyunAppPageScrollLock | null
    if (lock && typeof lock.unlock === 'function' && appScrollLocked.value) {
      lock.unlock()
      appScrollLocked.value = false
    }
  } catch {
    /* 不在 app-page 内 */
  }
  // #ifdef H5
  if (typeof document === 'undefined' || !scrollLocked.value) return
  const body = document.body
  const html = document.documentElement
  body.style.overflow = prevBodyOverflow.value
  body.style.overscrollBehavior = prevBodyOverscroll.value
  html.style.overscrollBehavior = prevHtmlOverscroll.value
  scrollLocked.value = false
  // #endif
}

measureStage()

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

onMounted(() => {
  lockPageScroll()
  openAnim()
})

onBeforeUnmount(() => {
  _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
    !!_lingyunMpOverlayHold.value,
    false,
  )
  clearTimers()
  unlockPageScroll()
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
