<template>
  <view class="lingyun-scan" :class="rootClass">
    <view
      v-if="$slots.default"
      class="lingyun-scan__custom"
      :class="{ 'lingyun-scan__custom--disabled': disabled || scanning }"
      role="button"
      :aria-disabled="disabled ? 'true' : 'false'"
      @click="scan"
    >
      <slot :scanning="scanning" />
    </view>

    <lingyun-button
      v-else
      :variant="variant"
      :size="size"
      :block="block"
      :text="scanning ? scanningText : text"
      :loading="scanning"
      :disabled="disabled"
      @click="scan"
    >
      <template v-if="showIcon && !scanning" #icon>
        <lingyun-icon :type="icon" :size="iconSize" color="inherit" />
      </template>
    </lingyun-button>

    <text v-if="tip" class="lingyun-scan__tip">{{ tip }}</text>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type {
  LingyunScanErrorPayload,
  LingyunScanFn,
  LingyunScanOptions,
  LingyunScanResult,
  LingyunScanVariant,
} from './types'

const DEFAULT_SCAN_TYPES = ['qrCode', 'barCode']

function normalizeResult(value: unknown): LingyunScanResult {
  if (typeof value === 'string') {
    return {
      result: value,
      scanType: '',
      charSet: '',
      path: '',
    }
  }
  const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  return {
    result: raw.result == null ? '' : String(raw.result),
    scanType: raw.scanType == null ? '' : String(raw.scanType),
    charSet: raw.charSet == null ? '' : String(raw.charSet),
    path: raw.path == null ? '' : String(raw.path),
    rawData: raw.rawData == null ? '' : String(raw.rawData),
  }
}

/**
 * lingyun-scan
 * @description 扫码入口：小程序 / App 走 uni.scanCode，H5 用 scanFn 自定义
 * @see design/SCAN.md
 */
export default defineComponent({
  name: 'LingyunScan',
  emits: ['start', 'success', 'error', 'cancel'],
  props: {
    scanType: {
      type: Array as PropType<string[]>,
      default: () => DEFAULT_SCAN_TYPES,
    },
    onlyFromCamera: { type: Boolean, default: false },
    scanText: { type: String, default: '将二维码/条码放入框内，即可自动扫描' },
    text: { type: String, default: '扫码' },
    scanningText: { type: String, default: '扫描中…' },
    tip: { type: String, default: '' },
    variant: {
      type: String as PropType<LingyunScanVariant>,
      default: 'borderedProminent',
    },
    size: { type: String, default: 'large' },
    block: { type: Boolean, default: false },
    showIcon: { type: Boolean, default: true },
    icon: { type: String, default: 'scan' },
    iconSize: { type: Number, default: 20 },
    disabled: { type: Boolean, default: false },
    showErrorToast: { type: Boolean, default: true },
    /** 覆盖原生扫码，适合 H5 网页扫码或测试 */
    scanFn: {
      type: Function as unknown as PropType<LingyunScanFn | undefined>,
      default: undefined,
    },
  },
  data(): { scanning: boolean } {
    return {
      scanning: false,
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
    resolvedScanType(): string[] {
      const list = Array.isArray(this.scanType) ? this.scanType : []
      const valid = list.map((item) => String(item || '').trim()).filter(Boolean)
      return valid.length ? valid : DEFAULT_SCAN_TYPES
    },
    scanOptions(): LingyunScanOptions {
      return {
        scanType: this.resolvedScanType,
        onlyFromCamera: this.onlyFromCamera,
        scanText: this.scanText,
      }
    },
  },
  methods: {
    scan(): void {
      if (this.disabled || this.scanning) return
      this.scanning = true
      this.$emit('start')

      if (this.scanFn) {
        try {
          Promise.resolve(this.scanFn(this.scanOptions))
            .then((value) => this.onScanSuccess(value))
            .catch((error) => this.onScanRejected(this.errorMessage(error), error))
        } catch (error) {
          this.onScanRejected(this.errorMessage(error), error)
        }
        return
      }

      // #ifdef H5
      this.onScanFail('H5 暂不支持原生扫码，请使用 scan-fn 接入网页扫码')
      return
      // #endif

      // #ifndef H5
      try {
        ;(
          uni as typeof uni & {
            scanCode: (options: Record<string, unknown>) => void
          }
        ).scanCode({
          scanType: this.resolvedScanType,
          onlyFromCamera: this.onlyFromCamera,
          scanText: this.scanText,
          success: (result: unknown) => this.onScanSuccess(result),
          fail: (error: { errMsg?: string }) => {
            const message = error && error.errMsg ? error.errMsg : '扫码失败'
            this.onScanRejected(message, error)
          },
        })
      } catch (error) {
        this.onScanFail(this.errorMessage(error), error)
      }
      // #endif
    },
    onScanSuccess(value: unknown): void {
      const result = normalizeResult(value)
      if (!result.result && !result.path) {
        this.onScanFail('未识别到扫码内容')
        return
      }
      this.scanning = false
      this.$emit('success', result)
    },
    onScanRejected(message: string, error?: unknown): void {
      if (/cancel/i.test(message)) {
        this.scanning = false
        this.$emit('cancel')
        return
      }
      this.onScanFail(message, error)
    },
    onScanFail(message: string, error?: unknown): void {
      this.scanning = false
      const payload: LingyunScanErrorPayload = { message, error }
      if (this.showErrorToast && message) {
        uni.showToast({ title: message, icon: 'none' })
      }
      this.$emit('error', payload)
    },
    errorMessage(error: unknown): string {
      if (error instanceof Error && error.message) return error.message
      if (typeof error === 'string' && error) return error
      if (error && typeof error === 'object') {
        const raw = error as { errMsg?: unknown; message?: unknown }
        if (raw.errMsg != null) return String(raw.errMsg)
        if (raw.message != null) return String(raw.message)
      }
      return '扫码失败'
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-scan {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.lingyun-scan__custom {
  width: 100%;
  box-sizing: border-box;
}

.lingyun-scan__custom--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.lingyun-scan__tip {
  padding: 0 2px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}
</style>
