<template>
  <view
    class="lingyun-qrcode"
    :class="rootClass"
    role="img"
    :aria-label="value ? `二维码：${value}` : emptyText"
  >
    <view class="lingyun-qrcode__frame" :style="frameStyle">
      <canvas
        :id="canvasId"
        :canvas-id="canvasId"
        class="lingyun-qrcode__canvas"
        :style="canvasStyle"
        disable-scroll
      />

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
  </view>
</template>

<script lang="ts">
import { defineComponent, markRaw, type PropType } from 'vue'
import { encode } from 'uqr'
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

const ECC_VALUES: LingyunQrcodeEcc[] = ['L', 'M', 'Q', 'H']

let qrcodeSequence = 0

/**
 * lingyun-qrcode
 * @description 二维码：uqr 生成矩阵 + Canvas 绘制，支持颜色 / 纠错级别 / 边框与图片导出
 * @see design/QRCODE.md
 */
export default defineComponent({
  name: 'LingyunQrcode',
  emits: ['ready', 'error'],
  props: {
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
  },
  data(): {
    uid: number
    context: QrContext | null
    errorMessage: string
    matrixSize: number
    matrixVersion: number
  } {
    return {
      uid: (qrcodeSequence += 1),
      context: null,
      errorMessage: '',
      matrixSize: 0,
      matrixVersion: 0,
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
      return `lingyun-qrcode-canvas-${this.uid}`
    },
    resolvedSize(): number {
      const value = Number(this.size)
      if (!Number.isFinite(value) || value <= 0) return 180
      return Math.min(480, Math.max(80, value))
    },
    resolvedEcc(): LingyunQrcodeEcc {
      return ECC_VALUES.includes(this.ecc) ? this.ecc : 'M'
    },
    resolvedBorder(): number {
      const value = Math.floor(Number(this.border))
      if (!Number.isFinite(value)) return 4
      return Math.min(16, Math.max(0, value))
    },
    canvasStyle(): Record<string, string> {
      return {
        width: `${this.resolvedSize}px`,
        height: `${this.resolvedSize}px`,
      }
    },
    frameStyle(): Record<string, string> {
      return {
        backgroundColor: this.backgroundColor || '#ffffff',
        padding: '8px',
        borderRadius: '16px',
      }
    },
  },
  watch: {
    value() {
      this.scheduleDraw()
    },
    size() {
      this.scheduleDraw()
    },
    ecc() {
      this.scheduleDraw()
    },
    border() {
      this.scheduleDraw()
    },
    foregroundColor() {
      this.scheduleDraw()
    },
    backgroundColor() {
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
        this.context = markRaw(context as unknown as QrContext)
      }
      this.draw()
    },
    scheduleDraw(): void {
      this.$nextTick(() => this.draw())
    },
    draw(): void {
      if (!this.context) {
        this.setupCanvas()
        return
      }
      this.errorMessage = ''
      const value = String(this.value || '')
      if (!value) {
        this.matrixSize = 0
        this.matrixVersion = 0
        this.clearCanvas()
        return
      }

      let qr: ReturnType<typeof encode>
      try {
        qr = encode(value, {
          ecc: this.resolvedEcc,
          border: this.resolvedBorder,
        })
      } catch (error) {
        this.matrixSize = 0
        this.matrixVersion = 0
        this.errorMessage = this.errorText
        this.clearCanvas()
        const message =
          error instanceof Error && error.message
            ? error.message
            : this.errorText
        const payload: LingyunQrcodeErrorPayload = { message }
        this.$emit('error', payload)
        return
      }

      this.matrixSize = qr.size
      this.matrixVersion = qr.version
      const context = this.context
      const size = this.resolvedSize
      const scale = size / qr.size
      context.clearRect(0, 0, size, size)
      context.setFillStyle(this.backgroundColor || '#ffffff')
      context.fillRect(0, 0, size, size)
      context.setFillStyle(this.foregroundColor || '#000000')
      qr.data.forEach((row, rowIndex) => {
        row.forEach((dark, colIndex) => {
          if (!dark) return
          const left = Math.round(colIndex * scale)
          const top = Math.round(rowIndex * scale)
          const right = Math.round((colIndex + 1) * scale)
          const bottom = Math.round((rowIndex + 1) * scale)
          context.fillRect(
            left,
            top,
            Math.max(1, right - left),
            Math.max(1, bottom - top),
          )
        })
      })
      context.draw()
      const payload: LingyunQrcodeReadyPayload = {
        size,
        version: qr.version,
        modules: qr.size,
      }
      this.$emit('ready', payload)
    },
    clearCanvas(): void {
      const context = this.context
      if (!context) return
      const size = this.resolvedSize
      context.clearRect(0, 0, size, size)
      context.draw()
    },
    refresh(): void {
      this.draw()
    },
    /** H5 返回 data URL；小程序 / App 返回临时文件路径 */
    toTempFilePath(): Promise<string> {
      return new Promise((resolve, reject) => {
        if (!this.value || this.errorMessage) {
          reject(new Error('暂无可导出的二维码'))
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
                else reject(new Error('二维码导出失败'))
              },
              fail: (error: { errMsg?: string }) => {
                reject(new Error(error && error.errMsg ? error.errMsg : '二维码导出失败'))
              },
            },
            this,
          )
        } catch (error) {
          reject(error instanceof Error ? error : new Error('二维码导出失败'))
        }
      })
    },
  },
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
</style>
