<template>
  <view
    class="lingyun-barcode"
    :class="rootClass"
    role="img"
    :aria-label="value ? `条码：${value}` : emptyText"
  >
    <view class="lingyun-barcode__frame" :style="frameStyle">
      <canvas
        :id="canvasId"
        :canvas-id="canvasId"
        class="lingyun-barcode__canvas"
        :style="canvasStyle"
        disable-scroll
      />

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
  </view>
</template>

<script lang="ts">
import { defineComponent, markRaw, type PropType } from 'vue'
import {
  encodeCode128,
  encodeCode39,
  encodeEAN13,
} from 'etiket/barcode'
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

let barcodeSequence = 0

/**
 * lingyun-barcode
 * @description 一维条码：Code128 / Code39 / EAN13，Canvas 绘制与图片导出
 * @see design/BARCODE.md
 */
export default defineComponent({
  name: 'LingyunBarcode',
  emits: ['ready', 'error'],
  props: {
    value: { type: String, default: '' },
    format: {
      type: String as PropType<LingyunBarcodeFormat>,
      default: 'CODE128',
    },
    moduleWidth: { type: Number, default: 2 },
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
  },
  data(): {
    uid: number
    context: BarcodeContext | null
    bars: number[]
    encodedText: string
    renderWidth: number
    errorMessage: string
    renderToken: number
  } {
    return {
      uid: (barcodeSequence += 1),
      context: null,
      bars: [],
      encodedText: '',
      renderWidth: 200,
      errorMessage: '',
      renderToken: 0,
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
      return `lingyun-barcode-canvas-${this.uid}`
    },
    resolvedFormat(): LingyunBarcodeFormat {
      return FORMATS.includes(this.format) ? this.format : 'CODE128'
    },
    resolvedCharset(): LingyunBarcodeCharset {
      return CHARSETS.includes(this.code128Charset)
        ? this.code128Charset
        : 'auto'
    },
    resolvedModuleWidth(): number {
      const value = Number(this.moduleWidth)
      if (!Number.isFinite(value)) return 2
      return Math.min(6, Math.max(1, value))
    },
    resolvedHeight(): number {
      const value = Number(this.height)
      if (!Number.isFinite(value)) return 80
      return Math.min(200, Math.max(48, value))
    },
    resolvedQuietZone(): number {
      const value = Math.floor(Number(this.quietZone))
      if (!Number.isFinite(value)) return 10
      return Math.min(20, Math.max(0, value))
    },
    resolvedFontSize(): number {
      const value = Number(this.fontSize)
      if (!Number.isFinite(value)) return 12
      return Math.min(18, Math.max(9, value))
    },
    textHeight(): number {
      return this.showValue ? 18 : 0
    },
    barHeight(): number {
      return Math.max(24, this.resolvedHeight - this.textHeight)
    },
    canvasStyle(): Record<string, string> {
      return {
        width: `${this.renderWidth}px`,
        height: `${this.resolvedHeight}px`,
      }
    },
    frameStyle(): Record<string, string> {
      return {
        backgroundColor: this.backgroundColor || '#ffffff',
        padding: '8px',
        borderRadius: '16px',
      }
    },
    displayText(): string {
      return this.displayValue || this.encodedText || this.value
    },
  },
  watch: {
    value() {
      this.scheduleDraw()
    },
    format() {
      this.scheduleDraw()
    },
    moduleWidth() {
      this.scheduleDraw()
    },
    height() {
      this.scheduleDraw()
    },
    quietZone() {
      this.scheduleDraw()
    },
    showValue() {
      this.scheduleDraw()
    },
    fontSize() {
      this.scheduleDraw()
    },
    foregroundColor() {
      this.scheduleDraw()
    },
    backgroundColor() {
      this.scheduleDraw()
    },
    code128Charset() {
      this.scheduleDraw()
    },
    code39CheckDigit() {
      this.scheduleDraw()
    },
    displayValue() {
      this.scheduleDraw()
    },
  },
  mounted() {
    this.$nextTick(() => this.setupCanvas())
  },
  beforeUnmount() {
    this.context = null
  },
  methods: {
    setupCanvas(): void {
      if (!this.context) {
        const context = uni.createCanvasContext(this.canvasId, this)
        this.context = markRaw(context as unknown as BarcodeContext)
      }
      this.draw()
    },
    scheduleDraw(): void {
      this.$nextTick(() => this.draw())
    },
    encode(value: string): EncodedBarcode {
      if (this.resolvedFormat === 'EAN13') {
        const result = encodeEAN13(value)
        return { bars: result.bars, text: result.digits }
      }
      if (this.resolvedFormat === 'CODE39') {
        return {
          bars: encodeCode39(value, { checkDigit: this.code39CheckDigit }),
          text: value,
        }
      }
      return {
        bars: encodeCode128(value, { charset: this.resolvedCharset }),
        text: value,
      }
    },
    draw(): void {
      if (!this.context) {
        this.setupCanvas()
        return
      }
      this.errorMessage = ''
      const value = String(this.value || '').trim()
      if (!value) {
        this.bars = []
        this.encodedText = ''
        this.renderWidth = 200
        this.renderToken += 1
        this.clearCanvas()
        return
      }

      let encoded: EncodedBarcode
      try {
        encoded = this.encode(value)
      } catch (error) {
        this.bars = []
        this.encodedText = ''
        this.renderWidth = 200
        this.errorMessage = this.errorText
        this.renderToken += 1
        this.clearCanvas()
        const payload: LingyunBarcodeErrorPayload = {
          message:
            error instanceof Error && error.message
              ? error.message
              : this.errorText,
        }
        this.$emit('error', payload)
        return
      }

      const modules =
        this.resolvedQuietZone * 2 +
        encoded.bars.reduce((sum, width) => sum + width, 0)
      if (modules <= 0) {
        this.errorMessage = this.errorText
        this.$emit('error', { message: this.errorText })
        return
      }

      this.bars = encoded.bars
      this.encodedText = encoded.text
      this.renderWidth = Math.max(
        120,
        Math.round(modules * this.resolvedModuleWidth),
      )
      this.renderToken += 1
      const token = this.renderToken
      this.$nextTick(() => {
        if (token === this.renderToken) this.paint()
      })
    },
    paint(): void {
      const context = this.context
      if (!context) return
      const width = this.renderWidth
      const height = this.resolvedHeight
      const barHeight = this.barHeight
      const moduleWidth = this.resolvedModuleWidth
      context.clearRect(0, 0, width, height)
      context.setFillStyle(this.backgroundColor || '#ffffff')
      context.fillRect(0, 0, width, height)
      context.setFillStyle(this.foregroundColor || '#000000')

      let x = this.resolvedQuietZone * moduleWidth
      this.bars.forEach((moduleCount, index) => {
        const barWidth = moduleCount * moduleWidth
        if (index % 2 === 0) {
          const left = Math.round(x)
          const right = Math.round(x + barWidth)
          context.fillRect(left, 0, Math.max(1, right - left), barHeight)
        }
        x += barWidth
      })

      if (this.showValue && this.displayText) {
        context.setFillStyle(this.foregroundColor || '#000000')
        context.setFontSize(this.resolvedFontSize)
        context.setTextAlign('center')
        context.setTextBaseline('middle')
        context.fillText(
          this.displayText,
          width / 2,
          barHeight + (height - barHeight) / 2,
        )
      }
      context.draw()
      const payload: LingyunBarcodeReadyPayload = {
        format: this.resolvedFormat,
        text: this.encodedText,
        modules: this.bars.reduce((sum, item) => sum + item, 0),
        width,
        height,
      }
      this.$emit('ready', payload)
    },
    clearCanvas(): void {
      const context = this.context
      if (!context) return
      context.clearRect(0, 0, this.renderWidth, this.resolvedHeight)
      context.draw()
    },
    refresh(): void {
      this.draw()
    },
    /** H5 返回 data URL；小程序 / App 返回临时文件路径 */
    toTempFilePath(): Promise<string> {
      return new Promise((resolve, reject) => {
        if (!this.value || this.errorMessage) {
          reject(new Error('暂无可导出的条码'))
          return
        }

        // #ifdef H5
        if (typeof document !== 'undefined') {
          const host = document.getElementById(this.canvasId)
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
              canvasId: this.canvasId,
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
            this,
          )
        } catch (error) {
          reject(error instanceof Error ? error : new Error('条码导出失败'))
        }
      })
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-barcode {
  display: inline-flex;
  vertical-align: top;
  max-width: 100%;
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
