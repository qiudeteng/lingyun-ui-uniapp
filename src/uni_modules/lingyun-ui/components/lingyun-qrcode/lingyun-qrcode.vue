<template>
  <view
    class="lingyun-qrcode"
    :class="rootClass"
    role="img"
    :aria-label="value ? `二维码：${value}` : emptyText"
    @click="openPreview"
  >
    <view class="lingyun-qrcode__frame" :style="frameStyle">
      <!-- #ifdef MP -->
      <image
        v-if="imgSrc"
        class="lingyun-qrcode__image"
        :src="imgSrc"
        :style="canvasStyle"
        mode="scaleToFill"
      />
      <canvas
        :id="canvasId"
        :canvas-id="canvasId"
        class="lingyun-qrcode__canvas-offscreen"
        :style="canvasStyle"
        disable-scroll
      />
      <!-- #endif -->
      <!-- #ifndef MP -->
      <canvas
        :id="canvasId"
        :canvas-id="canvasId"
        class="lingyun-qrcode__canvas"
        :style="canvasStyle"
        disable-scroll
      />
      <!-- #endif -->

      <view
        v-if="!value"
        class="lingyun-qrcode__placeholder"
        :style="{ backgroundColor }"
      >
        {{ emptyText }}
      </view>
      <view
        v-else-if="errorMessage"
        class="lingyun-qrcode__placeholder lingyun-qrcode__placeholder--error"
        :style="{ backgroundColor }"
      >
        {{ errorText }}
      </view>
    </view>

    <!-- 全屏预览：点击任意位置关闭并恢复亮度 -->
    <view
      v-if="previewing"
      class="lingyun-qrcode__preview"
      @click.stop="closePreview"
      @touchmove.stop="noop"
    >
      <image
        class="lingyun-qrcode__preview-image"
        :src="previewSrc"
        mode="aspectFit"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { nextLingyunUid } from '../../utils/uid'
import {
  getLingyunScreenBrightness,
  setLingyunScreenBrightness,
} from '../../utils/brightness'
import { markRaw, type PropType } from 'vue'
import { encode } from './qrcode'
import { useLingyunTheme } from '../../utils/theme'
import type {
  LingyunQrcodeEcc,
  LingyunQrcodeErrorPayload,
  LingyunQrcodeReadyPayload,
} from './types'

interface QrContext {
  setFillStyle: (color: string) => void
  fillRect: (x: number, y: number, width: number, height: number) => void
  clearRect: (x: number, y: number, width: number, height: number) => void
  draw: (reserve?: boolean) => void
}

/** 内置 QR 编码器输出；编码器代码在 ./qrcode.ts。 */
interface QrMatrix {
  data: boolean[][]
  size: number
  version: number
}

const ECC_VALUES: LingyunQrcodeEcc[] = ['L', 'M', 'Q', 'H']


/**
 * lingyun-qrcode
 * @description 二维码：内置 QR 编码器生成矩阵 + Canvas 绘制，支持颜色 / 纠错级别 / 边框与图片导出
 * @see design/QRCODE.md
 */
defineOptions({
  name: 'LingyunQrcode',
})

const props = defineProps({
  value: { type: String, default: '' },
  size: { type: Number, default: 180 },
  ecc: {
    type: String as PropType<LingyunQrcodeEcc>,
    default: 'M',
  },
  border: { type: Number, default: 4 },
  foregroundColor: { type: String, default: '#000000' },
  backgroundColor: { type: String, default: '#ffffff' },
  emptyText: { type: String, default: '暂无二维码' },
  errorText: { type: String, default: '二维码生成失败' },
  /** 点击图形打开全屏预览 */
  previewable: { type: Boolean, default: true },
  /** 全屏预览时调高屏幕亮度，关闭后恢复 */
  previewBrightness: { type: Boolean, default: true },
})

const emit = defineEmits(['ready', 'error'])

const instance = getCurrentInstance()

const uid = ref(nextLingyunUid('qrcode'))
const context = ref<QrContext | null>(null)
const errorMessage = ref('')
const matrixSize = ref(0)
const matrixVersion = ref(0)
/* 小程序端显示用：二维码 PNG data URL（canvas 绘制后 toDataURL 得到） */
const imgSrc = ref('')
/* 全屏预览 */
const previewing = ref(false)
const previewSrc = ref('')
let savedBrightness: number | null = null

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
  return `lingyun-qrcode-canvas-${uid.value}`
})

const resolvedSize = computed((): number => {
  const value = Number(props.size)
  if (!Number.isFinite(value) || value <= 0) return 180
  return Math.min(480, Math.max(80, value))
})

const resolvedEcc = computed((): LingyunQrcodeEcc => {
  return ECC_VALUES.includes(props.ecc) ? props.ecc : 'M'
})

const resolvedBorder = computed((): number => {
  const value = Math.floor(Number(props.border))
  if (!Number.isFinite(value)) return 4
  return Math.min(16, Math.max(0, value))
})

const canvasStyle = computed((): Record<string, string> => {
  return {
    width: `${resolvedSize.value}px`,
    height: `${resolvedSize.value}px`,
  }
})

const frameStyle = computed((): Record<string, string> => {
  return {
    backgroundColor: props.backgroundColor || '#ffffff',
    padding: '8px',
    borderRadius: '16px',
  }
})

function clearCanvas(): void {
  const ctx = context.value
  if (!ctx) return
  const size = resolvedSize.value
  ctx.clearRect(0, 0, size, size)
  ctx.draw()
}

function setupCanvas(): void {
  // #ifdef MP
  drawMp()
  return
  // #endif
  if (!context.value) {
    // #ifdef H5 || WEB
    /* uni-app x Web 不会把内部 <canvas> 位图设为布局尺寸（默认 300x150），
     * 会让二维码被拉伸；创建上下文前先对齐位图与 CSS 尺寸。 */
    try {
      const host: any = document.getElementById(canvasId.value)
      const rect: any = host ? host.getBoundingClientRect() : null
      const cv: any = host && host.querySelector ? host.querySelector('canvas') : null
      if (cv && rect && rect.width > 0 && rect.height > 0) {
        const w = Math.round(rect.width)
        const h = Math.round(rect.height)
        if (cv.width !== w || cv.height !== h) {
          cv.width = w
          cv.height = h
        }
      }
    } catch (e) {
      /* ignore: not a DOM environment */
    }
    // #endif
    const ctx = uni.createCanvasContext(canvasId.value, instance?.proxy)
    context.value = markRaw(ctx as unknown as QrContext)
  }
  draw()
}

// #ifdef MP
/**
 * 微信小程序：uni-app x 会把 <canvas> 编译成 type="2d"，旧版
 * uni.createCanvasContext 对它完全无效（画面始终空白），必须用
 * SelectorQuery 拿到 canvas 节点再取原生 2D 上下文。
 */
const mpCanvas = ref<any>(null)
const mpDpr = ref(1)

function ensureMpCanvas(): Promise<any> {
  return new Promise((resolve) => {
    const apply = (node: any) => {
      if (!node) {
        resolve(null)
        return
      }
      const size = resolvedSize.value
      const info: any =
        typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : null
      const dpr = Math.max(1, Number(info && info.pixelRatio) || 1)
      const px = Math.round(size * dpr)
      if (node.width !== px || node.height !== px) {
        node.width = px
        node.height = px
      }
      mpDpr.value = dpr
      mpCanvas.value = node
      resolve(node)
    }
    if (mpCanvas.value) {
      apply(mpCanvas.value)
      return
    }
    uni
      .createSelectorQuery()
      .in(instance?.proxy as never)
      .select(`#${canvasId.value}`)
      .fields({ node: true, size: true } as never, (res: any) => {
        const first = Array.isArray(res) ? res[0] : res
        apply(first && first.node ? first.node : null)
      })
  })
}

function drawMp(): void {
  errorMessage.value = ''
  const value = String(props.value || '')
  if (!value) {
    matrixSize.value = 0
    matrixVersion.value = 0
    imgSrc.value = ''
    return
  }
  let qr: QrMatrix
  try {
    qr = encode(value, {
      ecc: resolvedEcc.value,
      border: resolvedBorder.value,
    }) as QrMatrix
  } catch (error) {
    matrixSize.value = 0
    matrixVersion.value = 0
    imgSrc.value = ''
    errorMessage.value = props.errorText
    const message =
      error instanceof Error && error.message ? error.message : props.errorText
    emit('error', { message })
    return
  }
  matrixSize.value = qr.size
  matrixVersion.value = qr.version
  const size = resolvedSize.value

  /*
   * 小程序端用 <image src="data:image/png;base64,…"> 显示：
   * canvas 是原生组件，滚动时会出现层级 / 位置不同步；PNG 图片没有这个问题，
   * 且兼容性比 SVG 好（SVG 的 <text>/部分基础库在 image 里渲染不稳定）。
   * 离屏 canvas 只负责绘制与导出，不参与可见渲染。
   */
  void ensureMpCanvas().then((canvas: any) => {
    if (!canvas) return
    const g = canvas.getContext('2d')
    if (!g) return
    const px = canvas.width
    if (!px) return
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.clearRect(0, 0, px, px)
    g.fillStyle = props.backgroundColor || '#ffffff'
    g.fillRect(0, 0, px, px)
    g.fillStyle = props.foregroundColor || '#000000'
    const scale = px / qr.size
    const cell = Math.max(1, Math.ceil(scale))
    qr.data.forEach((row: boolean[], rowIndex: number) => {
      row.forEach((dark: boolean, colIndex: number) => {
        if (!dark) return
        g.fillRect(
          Math.round(colIndex * scale),
          Math.round(rowIndex * scale),
          cell,
          cell,
        )
      })
    })
    try {
      const url =
        typeof canvas.toDataURL === 'function' ? canvas.toDataURL('image/png') : ''
      if (url) imgSrc.value = url
    } catch {
      /* ignore: 个别基础库不支持 toDataURL */
    }
    emit('ready', {
      size,
      version: qr.version,
      modules: qr.size,
    } satisfies LingyunQrcodeReadyPayload)
  })
}

/** 小程序导出：把已生成的 PNG data URL 写入用户目录临时文件 */
function savePngToTempFile(dataUrl: string, prefix: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const comma = dataUrl.indexOf(',')
    const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : ''
    if (!base64) {
      reject(new Error('导出失败'))
      return
    }
    const wxApi = (globalThis as { wx?: any }).wx
    const root =
      wxApi && wxApi.env ? String(wxApi.env.USER_DATA_PATH || '') : ''
    if (!root || typeof wxApi.getFileSystemManager !== 'function') {
      reject(new Error('导出失败'))
      return
    }
    const filePath = `${root}/${prefix}-${Date.now()}.png`
    try {
      wxApi.getFileSystemManager().writeFile({
        filePath,
        data: base64,
        encoding: 'base64',
        success: () => resolve(filePath),
        fail: (e: { errMsg?: string }) =>
          reject(new Error(e && e.errMsg ? e.errMsg : '导出失败')),
      })
    } catch (e) {
      reject(e instanceof Error ? e : new Error('导出失败'))
    }
  })
}
// #endif

function draw(): void {
  // #ifdef MP
  drawMp()
  return
  // #endif
  drawCommon()
}

/** 非小程序路径的通用绘制：条件编译的 return 会把手写体变成不可达代码，单独成函数保持收窄 */
function drawCommon(): void {
  if (!context.value) {
    setupCanvas()
    return
  }
  errorMessage.value = ''
  const value = String(props.value || '')
  if (!value) {
    matrixSize.value = 0
    matrixVersion.value = 0
    clearCanvas()
    return
  }

  let qr: QrMatrix
  try {
    qr = encode(value, {
      ecc: resolvedEcc.value,
      border: resolvedBorder.value,
    }) as QrMatrix
  } catch (error) {
    matrixSize.value = 0
    matrixVersion.value = 0
    errorMessage.value = props.errorText
    clearCanvas()
    const message =
      error instanceof Error && error.message ? error.message : props.errorText
    const payload: LingyunQrcodeErrorPayload = { message }
    emit('error', payload)
    return
  }

  matrixSize.value = qr.size
  matrixVersion.value = qr.version
  const size = resolvedSize.value
  const scale = size / qr.size
  // #ifdef H5 || WEB
  /* uni-app x Web 的 CanvasContext.draw() 与手动设置的位图尺寸不兼容（会清空画面），
   * 这里直接用原生 2D context 绘制。 */
  const h5Host: any = document.getElementById(canvasId.value)
  const h5Canvas: any =
    h5Host && h5Host.querySelector ? h5Host.querySelector('canvas') : null
  if (h5Canvas) {
    const px = Math.max(1, Math.round(size))
    if (h5Canvas.width !== px || h5Canvas.height !== px) {
      h5Canvas.width = px
      h5Canvas.height = px
    }
    const g: any = h5Canvas.getContext('2d')
    if (g) {
      g.clearRect(0, 0, size, size)
      g.fillStyle = props.backgroundColor || '#ffffff'
      g.fillRect(0, 0, size, size)
      g.fillStyle = props.foregroundColor || '#000000'
      qr.data.forEach((row: any[], rowIndex: number) => {
        row.forEach((dark: boolean, colIndex: number) => {
          if (!dark) return
          const left = Math.round(colIndex * scale)
          const top = Math.round(rowIndex * scale)
          const right = Math.round((colIndex + 1) * scale)
          const bottom = Math.round((rowIndex + 1) * scale)
          g.fillRect(
            left,
            top,
            Math.max(1, right - left),
            Math.max(1, bottom - top),
          )
        })
      })
      const h5Payload: LingyunQrcodeReadyPayload = {
        size,
        version: qr.version,
        modules: qr.size,
      }
      emit('ready', h5Payload)
      return
    }
  }
  // #endif
  paintWithContext(size, scale, qr)
}

/** 通用 CanvasContext 绘制（小程序旧版 canvas / 未命中 2D 节点时的兜底路径） */
function paintWithContext(size: number, scale: number, qr: QrMatrix): void {
  const ctx = context.value
  if (!ctx) return
  ctx.clearRect(0, 0, size, size)
  ctx.setFillStyle(props.backgroundColor || '#ffffff')
  ctx.fillRect(0, 0, size, size)
  ctx.setFillStyle(props.foregroundColor || '#000000')
  qr.data.forEach((row, rowIndex) => {
    row.forEach((dark, colIndex) => {
      if (!dark) return
      const left = Math.round(colIndex * scale)
      const top = Math.round(rowIndex * scale)
      const right = Math.round((colIndex + 1) * scale)
      const bottom = Math.round((rowIndex + 1) * scale)
      ctx.fillRect(
        left,
        top,
        Math.max(1, right - left),
        Math.max(1, bottom - top),
      )
    })
  })
  ctx.draw()
  const payload: LingyunQrcodeReadyPayload = {
    size,
    version: qr.version,
    modules: qr.size,
  }
  emit('ready', payload)
}

function scheduleDraw(): void {
  nextTick(() => draw())
}

function refresh(): void {
  draw()
}

/** H5 返回 data URL；小程序 / App 返回临时文件路径 */
function toTempFilePath(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!props.value || errorMessage.value) {
      reject(new Error('暂无可导出的二维码'))
      return
    }

    // #ifdef MP
    /* 小程序端直接用已生成的 PNG data URL 写文件，避免 type="2d" canvas 导出兼容问题 */
    if (imgSrc.value) {
      savePngToTempFile(imgSrc.value, `lingyun-qrcode-${uid.value}`)
        .then(resolve)
        .catch(reject)
      return
    }
    // #endif


    // #ifdef H5
    if (typeof document !== 'undefined') {
      const host = document.getElementById(canvasId.value)
      const canvas = host
        ? ((host.tagName === 'CANVAS'
            ? host
            : host.querySelector('canvas')) as HTMLCanvasElement | null)
        : null
      if (canvas && typeof canvas.toDataURL === 'function') {
        resolve(canvas.toDataURL('image/png'))
        return
      }
    }
    // #endif

    try {
      ;(
        uni as typeof uni & {
          canvasToTempFilePath: (
            options: Record<string, unknown>,
            instance?: unknown,
          ) => void
        }
      ).canvasToTempFilePath(
        {
          canvasId: canvasId.value,
          // #ifdef MP
          /* type="2d" 的 canvas 必须传节点，canvasId 对它无效 */
          canvas: mpCanvas.value || undefined,
          // #endif
          fileType: 'png',
          quality: 1,
          success: (res: { tempFilePath?: string }) => {
            if (res && res.tempFilePath) resolve(String(res.tempFilePath))
            else reject(new Error('二维码导出失败'))
          },
          fail: (error: { errMsg?: string }) => {
            reject(new Error(error && error.errMsg ? error.errMsg : '二维码导出失败'))
          },
        },
        instance?.proxy,
      )
    } catch (error) {
      reject(error instanceof Error ? error : new Error('二维码导出失败'))
    }
  })
}

watch(() => props.value, () => scheduleDraw())
watch(() => props.size, () => scheduleDraw())
watch(() => props.ecc, () => scheduleDraw())
watch(() => props.border, () => scheduleDraw())
watch(() => props.foregroundColor, () => scheduleDraw())
watch(() => props.backgroundColor, () => scheduleDraw())

onMounted(() => {
  nextTick(() => setupCanvas())
})

/** 打开全屏预览：预览时按需调高屏幕亮度 */
async function openPreview(): Promise<void> {
  if (!props.previewable || !props.value || errorMessage.value) return
  if (previewing.value) return
  let src = imgSrc.value
  // #ifndef MP
  try {
    src = await toTempFilePath()
  } catch {
    return
  }
  // #endif
  if (!src) return
  previewSrc.value = src
  previewing.value = true
  if (props.previewBrightness) {
    const current = await getLingyunScreenBrightness()
    if (!previewing.value) return
    /* 读不到原亮度时不调亮，避免关闭后无法恢复 */
    if (current == null) return
    savedBrightness = current
    setLingyunScreenBrightness(1)
  }
}

/** 关闭全屏预览并恢复原亮度 */
function closePreview(): void {
  if (!previewing.value) return
  previewing.value = false
  previewSrc.value = ''
  if (props.previewBrightness && savedBrightness != null) {
    setLingyunScreenBrightness(savedBrightness)
    savedBrightness = null
  }
}

/** 预览层吞掉 touchmove，避免滑动穿透到底层页面滚动 */
function noop(): void {}

onBeforeUnmount(() => {
  context.value = null
  if (savedBrightness != null) {
    setLingyunScreenBrightness(savedBrightness)
    savedBrightness = null
  }
})

defineExpose({
  toTempFilePath,
  refresh,
  openPreview,
  closePreview,
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-qrcode {
  display: inline-flex;
  vertical-align: top;
  max-width: 100%;
}

.lingyun-qrcode__frame {
  position: relative;
  display: inline-block;
  box-sizing: content-box;
  box-shadow: 0 0 0 0.5px var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-qrcode__canvas {
  display: block;
  border-radius: 8px;
}

/* 小程序端用 SVG 图片显示二维码：canvas 是原生组件，滚动时会出现层级错位 */
.lingyun-qrcode__image {
  display: block;
  border-radius: 8px;
}

/* 小程序端离屏 canvas：仅用于 toTempFilePath 导出 PNG，不参与可见渲染 */
.lingyun-qrcode__canvas-offscreen {
  position: fixed;
  left: -10000px;
  top: 0;
  pointer-events: none;
}

.lingyun-qrcode__placeholder {
  position: absolute;
  left: 8px;
  top: 8px;
  right: 8px;
  bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-qrcode__placeholder--error {
  color: var(--lingyun-error, #{$lingyun-error});
}

/* 全屏预览：深色遮罩 + 居中大图，点击任意位置关闭并恢复亮度 */
.lingyun-qrcode__preview {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.94);
}

.lingyun-qrcode__preview-image {
  width: 80%;
  height: 80%;
}
</style>
