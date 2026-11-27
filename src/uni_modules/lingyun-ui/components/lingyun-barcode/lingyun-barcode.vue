<template>
  <view
    :id="rootId"
    class="lingyun-barcode"
    :class="[rootClass, { 'lingyun-barcode--fluid': fluid }]"
    role="img"
    :aria-label="value ? `条码：${value}` : emptyText"
    @click="openPreview"
  >
    <view class="lingyun-barcode__frame" :style="frameStyle">
      <!-- #ifdef MP -->
      <image
        v-if="imgSrc"
        class="lingyun-barcode__image"
        :src="imgSrc"
        :style="canvasStyle"
        mode="scaleToFill"
      />
      <canvas
        :id="canvasId"
        :canvas-id="canvasId"
        class="lingyun-barcode__canvas-offscreen"
        :style="canvasStyle"
        disable-scroll
      />
      <!-- #endif -->
      <!-- #ifndef MP -->
      <canvas
        :id="canvasId"
        :canvas-id="canvasId"
        class="lingyun-barcode__canvas"
        :style="canvasStyle"
        disable-scroll
      />
      <!-- #endif -->

      <view
        v-if="!value"
        class="lingyun-barcode__placeholder"
        :style="{ backgroundColor }"
      >
        {{ emptyText }}
      </view>
      <view
        v-else-if="errorMessage"
        class="lingyun-barcode__placeholder lingyun-barcode__placeholder--error"
        :style="{ backgroundColor }"
      >
        {{ errorText }}
      </view>
    </view>

    <!-- 全屏预览：点击任意位置关闭并恢复亮度 -->
    <view
      v-if="previewing"
      class="lingyun-barcode__preview"
      @click.stop="closePreview"
      @touchmove.stop="noop"
    >
      <image
        class="lingyun-barcode__preview-image"
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
import { encodeCode128 } from './encoders/code128'
import { encodeCode39 } from './encoders/code39'
import { encodeEAN13 } from './encoders/ean'
import { useLingyunTheme } from '../../utils/theme'
import type {
  LingyunBarcodeCharset,
  LingyunBarcodeErrorPayload,
  LingyunBarcodeFormat,
  LingyunBarcodeReadyPayload,
} from './types'

interface BarcodeContext {
  setFillStyle: (color: string) => void
  fillRect: (x: number, y: number, width: number, height: number) => void
  clearRect: (x: number, y: number, width: number, height: number) => void
  setFontSize: (size: number) => void
  setTextAlign: (align: string) => void
  setTextBaseline: (baseline: string) => void
  fillText: (text: string, x: number, y: number) => void
  draw: (reserve?: boolean) => void
}

interface EncodedBarcode {
  bars: number[]
  text: string
}

const FORMATS: LingyunBarcodeFormat[] = ['CODE128', 'CODE39', 'EAN13']
const CHARSETS: LingyunBarcodeCharset[] = ['auto', 'A', 'B', 'C']


/**
 * lingyun-barcode
 * @description 一维条码：Code128 / Code39 / EAN13，Canvas 绘制与图片导出
 * @see design/BARCODE.md
 */
defineOptions({
  name: 'LingyunBarcode',
})

const props = defineProps({
  value: { type: String, default: '' },
  format: {
    type: String as PropType<LingyunBarcodeFormat>,
    default: 'CODE128',
  },
  moduleWidth: { type: Number, default: 2 },
  /** 按父级容器宽度自适应；宽屏下条码不再固定窄宽 */
  fluid: { type: Boolean, default: false },
  height: { type: Number, default: 80 },
  quietZone: { type: Number, default: 10 },
  showValue: { type: Boolean, default: true },
  displayValue: { type: String, default: '' },
  fontSize: { type: Number, default: 12 },
  foregroundColor: { type: String, default: '#000000' },
  backgroundColor: { type: String, default: '#ffffff' },
  code128Charset: {
    type: String as PropType<LingyunBarcodeCharset>,
    default: 'auto',
  },
  code39CheckDigit: { type: Boolean, default: false },
  emptyText: { type: String, default: '暂无条件码' },
  errorText: { type: String, default: '条码生成失败' },
  /** 点击图形打开全屏预览 */
  previewable: { type: Boolean, default: true },
  /** 全屏预览时调高屏幕亮度，关闭后恢复 */
  previewBrightness: { type: Boolean, default: true },
})

const emit = defineEmits(['ready', 'error'])

const instance = getCurrentInstance()

const uid = ref(nextLingyunUid('barcode'))
const context = ref<BarcodeContext | null>(null)
const bars = ref<number[]>([])
const encodedText = ref('')
const renderWidth = ref(200)
/* 小程序端显示用：条码 PNG data URL（canvas 绘制后 toDataURL 得到） */
const imgSrc = ref('')
const totalModules = ref(0)
const errorMessage = ref('')
const renderToken = ref(0)
const h5Resize = ref<(() => void) | null>(null)
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
  return `lingyun-barcode-canvas-${uid.value}`
})

const rootId = computed((): string => {
  return `lingyun-barcode-${uid.value}`
})

const resolvedFormat = computed((): LingyunBarcodeFormat => {
  return FORMATS.includes(props.format) ? props.format : 'CODE128'
})

const resolvedCharset = computed((): LingyunBarcodeCharset => {
  return CHARSETS.includes(props.code128Charset)
    ? props.code128Charset
    : 'auto'
})

const resolvedModuleWidth = computed((): number => {
  const value = Number(props.moduleWidth)
  if (!Number.isFinite(value)) return 2
  return Math.min(6, Math.max(1, value))
})

const resolvedHeight = computed((): number => {
  const value = Number(props.height)
  if (!Number.isFinite(value)) return 80
  return Math.min(200, Math.max(48, value))
})

const resolvedQuietZone = computed((): number => {
  const value = Math.floor(Number(props.quietZone))
  if (!Number.isFinite(value)) return 10
  return Math.min(20, Math.max(0, value))
})

const resolvedFontSize = computed((): number => {
  const value = Number(props.fontSize)
  if (!Number.isFinite(value)) return 12
  return Math.min(18, Math.max(9, value))
})

const textHeight = computed((): number => {
  return props.showValue ? 18 : 0
})

const barHeight = computed((): number => {
  return Math.max(24, resolvedHeight.value - textHeight.value)
})

const canvasStyle = computed((): Record<string, string> => {
  return {
    width: `${renderWidth.value}px`,
    height: `${resolvedHeight.value}px`,
  }
})

const frameStyle = computed((): Record<string, string> => {
  return {
    backgroundColor: props.backgroundColor || '#ffffff',
    padding: '8px',
    borderRadius: '16px',
  }
})

const displayText = computed((): string => {
  return props.displayValue || encodedText.value || props.value
})

// #ifdef MP
/**
 * 微信小程序：uni-app x 把 <canvas> 编译成 type="2d"，旧版
 * uni.createCanvasContext 对它无效（画面空白），需用 SelectorQuery
 * 取节点后使用原生 2D 上下文绘制。
 */
const mpCanvas = ref<any>(null)

function ensureMpCanvas2d(cssWidth: number, cssHeight: number): Promise<any> {
  return new Promise((resolve) => {
    const apply = (node: any) => {
      if (!node) {
        resolve(null)
        return
      }
      const info: any =
        typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : null
      const dpr = Math.max(1, Number(info && info.pixelRatio) || 1)
      const pw = Math.max(1, Math.round(cssWidth * dpr))
      const ph = Math.max(1, Math.round(cssHeight * dpr))
      if (node.width !== pw || node.height !== ph) {
        node.width = pw
        node.height = ph
      }
      mpCanvas.value = node
      resolve({ node, dpr })
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

function paintMp(
  cssWidth: number,
  cssHeight: number,
  barHeightValue: number,
  moduleWidth: number,
): void {
  /*
   * 小程序端用 <image src="data:image/png;base64,…"> 显示：
   * canvas 是原生组件，滚动时会出现层级 / 位置不同步；PNG 图片没有这个问题，
   * 兼容性也优于 SVG。离屏 canvas 只负责绘制与导出，不参与可见渲染。
   */
  void ensureMpCanvas2d(cssWidth, cssHeight).then((result: any) => {
    if (!result) return
    const node = result.node
    const g = node.getContext('2d')
    if (!g) return
    const dpr = result.dpr
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.clearRect(0, 0, node.width, node.height)
    g.scale(dpr, dpr)
    g.fillStyle = props.backgroundColor || '#ffffff'
    g.fillRect(0, 0, cssWidth, cssHeight)
    g.fillStyle = props.foregroundColor || '#000000'
    let bx = resolvedQuietZone.value * moduleWidth
    bars.value.forEach((moduleCount: number, index: number) => {
      const barWidth = moduleCount * moduleWidth
      if (index % 2 === 0) {
        const left = Math.round(bx)
        const right = Math.round(bx + barWidth)
        g.fillRect(left, 0, Math.max(1, right - left), barHeightValue)
      }
      bx += barWidth
    })
    if (props.showValue && displayText.value) {
      g.fillStyle = props.foregroundColor || '#000000'
      g.font = `${resolvedFontSize.value}px sans-serif`
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.fillText(
        displayText.value,
        cssWidth / 2,
        barHeightValue + (cssHeight - barHeightValue) / 2,
      )
    }
    try {
      const url =
        typeof node.toDataURL === 'function' ? node.toDataURL('image/png') : ''
      if (url) imgSrc.value = url
    } catch {
      /* ignore: 个别基础库不支持 toDataURL */
    }
    const payload: LingyunBarcodeReadyPayload = {
      format: resolvedFormat.value,
      text: encodedText.value,
      modules: bars.value.reduce((sum: number, item: number) => sum + item, 0),
      width: cssWidth,
      height: cssHeight,
    }
    emit('ready', payload)
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

function paint(): void {
  const width = renderWidth.value
  const height = resolvedHeight.value
  const barHeightValue = barHeight.value
  const moduleWidth =
    totalModules.value > 0
      ? width / totalModules.value
      : resolvedModuleWidth.value

  // #ifdef MP
  paintMp(width, height, barHeightValue, moduleWidth)
  // #endif

  // #ifndef MP
  // #ifdef H5 || WEB
  /* uni-app x Web 的 CanvasContext.draw() 与手动设置的位图尺寸不兼容（会清空画面），
   * 这里直接用原生 2D context 绘制。 */
  const h5Host: any = document.getElementById(canvasId.value)
  const h5Canvas: any =
    h5Host && h5Host.querySelector ? h5Host.querySelector('canvas') : null
  if (h5Canvas) {
    const bw = Math.max(1, Math.round(width))
    const bh = Math.max(1, Math.round(height))
    if (h5Canvas.width !== bw || h5Canvas.height !== bh) {
      h5Canvas.width = bw
      h5Canvas.height = bh
    }
    const g: any = h5Canvas.getContext('2d')
    if (g) {
      g.clearRect(0, 0, width, height)
      g.fillStyle = props.backgroundColor || '#ffffff'
      g.fillRect(0, 0, width, height)
      g.fillStyle = props.foregroundColor || '#000000'
      let bx = resolvedQuietZone.value * moduleWidth
      bars.value.forEach((moduleCount: number, index: number) => {
        const barWidth = moduleCount * moduleWidth
        if (index % 2 === 0) {
          const left = Math.round(bx)
          const right = Math.round(bx + barWidth)
          g.fillRect(left, 0, Math.max(1, right - left), barHeightValue)
        }
        bx += barWidth
      })
      if (props.showValue && displayText.value) {
        g.fillStyle = props.foregroundColor || '#000000'
        g.font = `${resolvedFontSize.value}px sans-serif`
        g.textAlign = 'center'
        g.textBaseline = 'middle'
        g.fillText(
          displayText.value,
          width / 2,
          barHeightValue + (height - barHeightValue) / 2,
        )
      }
      const h5Payload: LingyunBarcodeReadyPayload = {
        format: resolvedFormat.value,
        text: encodedText.value,
        modules: bars.value.reduce(
          (sum: number, item: number) => sum + item,
          0,
        ),
        width,
        height,
      }
      emit('ready', h5Payload)
      return
    }
  }
  // #endif
  paintWithContext(width, height, barHeightValue, moduleWidth)
  // #endif
}

/** 通用 CanvasContext 绘制（小程序旧版 canvas / 未命中 2D 节点时的兜底路径） */
function paintWithContext(
  width: number,
  height: number,
  barHeightValue: number,
  moduleWidth: number,
): void {
  const ctx = context.value
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)
  ctx.setFillStyle(props.backgroundColor || '#ffffff')
  ctx.fillRect(0, 0, width, height)
  ctx.setFillStyle(props.foregroundColor || '#000000')

  let x = resolvedQuietZone.value * moduleWidth
  bars.value.forEach((moduleCount, index) => {
    const barWidth = moduleCount * moduleWidth
    if (index % 2 === 0) {
      const left = Math.round(x)
      const right = Math.round(x + barWidth)
      ctx.fillRect(left, 0, Math.max(1, right - left), barHeightValue)
    }
    x += barWidth
  })

  if (props.showValue && displayText.value) {
    ctx.setFillStyle(props.foregroundColor || '#000000')
    ctx.setFontSize(resolvedFontSize.value)
    ctx.setTextAlign('center')
    ctx.setTextBaseline('middle')
    ctx.fillText(
      displayText.value,
      width / 2,
      barHeightValue + (height - barHeightValue) / 2,
    )
  }
  ctx.draw()
  const payload: LingyunBarcodeReadyPayload = {
    format: resolvedFormat.value,
    text: encodedText.value,
    modules: bars.value.reduce((sum, item) => sum + item, 0),
    width,
    height,
  }
  emit('ready', payload)
}

function clearCanvas(): void {
  /* 小程序端显示走 imgSrc，清空时同步清掉旧图 */
  imgSrc.value = ''
  const ctx = context.value
  if (!ctx) return
  ctx.clearRect(0, 0, renderWidth.value, resolvedHeight.value)
  ctx.draw()
}

function measureContainer(callback: (width: number) => void): void {
  // #ifdef H5
  if (typeof document !== 'undefined') {
    const el = document.getElementById(rootId.value)
    if (el) {
      callback(el.getBoundingClientRect().width)
      return
    }
  }
  // #endif

  uni
    .createSelectorQuery()
    .in(instance?.proxy as never)
    .select(`#${rootId.value}`)
    .boundingClientRect()
    .exec((res) => {
      const rect =
        res && (res[0] as { width?: number } | null)
      callback(Number(rect && rect.width ? rect.width : 0))
    })
}

function recreateContext(): void {
  // #ifdef MP
  /* type="2d" 的 canvas 由 paintMp 直接用节点绘制，无需旧版上下文 */
  return
  // #endif
  // #ifdef H5 || WEB
  /* uni-app x Web 不会把内部 <canvas> 位图设为布局尺寸（默认 300x150），
   * 会让条码被水平拉伸；创建上下文前先对齐位图与 CSS 尺寸。 */
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
  try {
    const ctx = uni.createCanvasContext(canvasId.value, instance?.proxy)
    context.value = markRaw(ctx as unknown as BarcodeContext)
  } catch {
    /* 保留旧上下文 */
  }
}

function encode(value: string): EncodedBarcode {
  if (resolvedFormat.value === 'EAN13') {
    const result = encodeEAN13(value)
    return { bars: result.bars, text: result.digits }
  }
  if (resolvedFormat.value === 'CODE39') {
    return {
      bars: encodeCode39(value, { checkDigit: props.code39CheckDigit }),
      text: value,
    }
  }
  return {
    bars: encodeCode128(value, { charset: resolvedCharset.value }),
    text: value,
  }
}

function commitWidth(modules: number, token: number): void {
  const apply = (containerWidth: number) => {
    if (token !== renderToken.value) return
    const width =
      props.fluid && containerWidth > 16
        ? Math.max(120, Math.round(containerWidth - 16))
        : Math.max(120, Math.round(modules * resolvedModuleWidth.value))
    renderWidth.value = width
    nextTick(() => {
      if (token !== renderToken.value) return
      // 宽度变化后重建上下文，让旧版 canvas 按新尺寸初始化
      recreateContext()
      setTimeout(() => {
        if (token === renderToken.value) paint()
      }, 20)
    })
  }
  if (props.fluid) measureContainer(apply)
  else apply(0)
}

function setupCanvas(): void {
  // #ifdef MP
  /* 小程序用 type="2d" 离屏节点绘制，不需要旧版上下文，直接进入编码 + 绘制流程 */
  draw()
  return
  // #endif
  if (!context.value) {
    const ctx = uni.createCanvasContext(canvasId.value, instance?.proxy)
    context.value = markRaw(ctx as unknown as BarcodeContext)
  }
  draw()
}

function draw(): void {
  // #ifndef MP
  if (!context.value) {
    setupCanvas()
    return
  }
  // #endif
  errorMessage.value = ''
  const value = String(props.value || '').trim()
  if (!value) {
    bars.value = []
    encodedText.value = ''
    renderWidth.value = 200
    totalModules.value = 0
    renderToken.value += 1
    clearCanvas()
    return
  }

  let encoded: EncodedBarcode
  try {
    encoded = encode(value)
  } catch (error) {
    bars.value = []
    encodedText.value = ''
    renderWidth.value = 200
    totalModules.value = 0
    errorMessage.value = props.errorText
    renderToken.value += 1
    clearCanvas()
    const payload: LingyunBarcodeErrorPayload = {
      message:
        error instanceof Error && error.message
          ? error.message
          : props.errorText,
    }
    emit('error', payload)
    return
  }

  const modules =
    resolvedQuietZone.value * 2 +
    encoded.bars.reduce((sum, width) => sum + width, 0)
  if (modules <= 0) {
    errorMessage.value = props.errorText
    emit('error', { message: props.errorText })
    return
  }

  bars.value = encoded.bars
  encodedText.value = encoded.text
  totalModules.value = modules
  renderToken.value += 1
  const token = renderToken.value
  commitWidth(modules, token)
}

function scheduleDraw(): void {
  nextTick(() => draw())
}

function bindH5Resize(): void {
  // #ifdef H5
  if (typeof window === 'undefined') return
  const handler = () => {
    if (props.fluid) scheduleDraw()
  }
  h5Resize.value = handler
  window.addEventListener('resize', handler)
  // #endif
}

function unbindH5Resize(): void {
  // #ifdef H5
  if (h5Resize.value) {
    window.removeEventListener('resize', h5Resize.value)
    h5Resize.value = null
  }
  // #endif
}

function refresh(): void {
  draw()
}

/** H5 返回 data URL；小程序 / App 返回临时文件路径 */
function toTempFilePath(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!props.value || errorMessage.value) {
      reject(new Error('暂无可导出的条码'))
      return
    }

    // #ifdef MP
    /* 小程序端直接用已生成的 PNG data URL 写文件，避免 type="2d" canvas 导出兼容问题 */
    if (imgSrc.value) {
      savePngToTempFile(imgSrc.value, `lingyun-barcode-${uid.value}`)
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
            else reject(new Error('条码导出失败'))
          },
          fail: (error: { errMsg?: string }) => {
            reject(new Error(error && error.errMsg ? error.errMsg : '条码导出失败'))
          },
        },
        instance?.proxy,
      )
    } catch (error) {
      reject(error instanceof Error ? error : new Error('条码导出失败'))
    }
  })
}

watch(() => props.value, () => scheduleDraw())
watch(() => props.format, () => scheduleDraw())
watch(() => props.moduleWidth, () => scheduleDraw())
watch(() => props.fluid, () => scheduleDraw())
watch(() => props.height, () => scheduleDraw())
watch(() => props.quietZone, () => scheduleDraw())
watch(() => props.showValue, () => scheduleDraw())
watch(() => props.fontSize, () => scheduleDraw())
watch(() => props.foregroundColor, () => scheduleDraw())
watch(() => props.backgroundColor, () => scheduleDraw())
watch(() => props.code128Charset, () => scheduleDraw())
watch(() => props.code39CheckDigit, () => scheduleDraw())
watch(() => props.displayValue, () => scheduleDraw())

onMounted(() => {
  nextTick(() => {
    setupCanvas()
    bindH5Resize()
  })
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
  unbindH5Resize()
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

.lingyun-barcode {
  display: inline-flex;
  vertical-align: top;
  max-width: 100%;
}

.lingyun-barcode--fluid {
  display: block;
  width: 100%;
}

.lingyun-barcode--fluid .lingyun-barcode__frame {
  width: 100%;
  box-sizing: border-box;
}

.lingyun-barcode__frame {
  position: relative;
  display: inline-block;
  box-sizing: content-box;
  box-shadow: 0 0 0 0.5px var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-barcode__canvas {
  display: block;
  border-radius: 8px;
}

/* 小程序端用 SVG 图片显示条码：canvas 是原生组件，滚动时会出现层级错位 */
.lingyun-barcode__image {
  display: block;
  border-radius: 8px;
}

/* 小程序端离屏 canvas：仅用于 toTempFilePath 导出 PNG，不参与可见渲染 */
.lingyun-barcode__canvas-offscreen {
  position: fixed;
  left: -10000px;
  top: 0;
  pointer-events: none;
}

/* 全屏预览：深色遮罩 + 居中大图，点击任意位置关闭并恢复亮度 */
.lingyun-barcode__preview {
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

.lingyun-barcode__preview-image {
  width: 92%;
  height: 40%;
}

.lingyun-barcode__placeholder {
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

.lingyun-barcode__placeholder--error {
  color: var(--lingyun-error, #{$lingyun-error});
}
</style>
