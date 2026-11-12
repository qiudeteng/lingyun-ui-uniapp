<template>
  <view
    class="lingyun-save-image"
    :class="rootClass"
    :hover-class="disabled || busy ? '' : 'lingyun-save-image--hover'"
    :hover-start-time="20"
    :hover-stay-time="70"
    role="button"
    :aria-disabled="disabled ? 'true' : 'false'"
    @click="onTap"
  >
    <slot>
      <view v-if="busy" class="lingyun-save-image__spinner" />
      <lingyun-icon
        v-else-if="icon"
        class="lingyun-save-image__icon"
        :type="icon"
        :size="iconSize"
      />
      <text v-if="showLabel" class="lingyun-save-image__label">
        {{ busy ? busyText : displayLabel }}
      </text>
    </slot>
  </view>
</template>

<script lang="ts">
import { defineComponent, isRef } from 'vue'
// #ifdef H5
import { captureElementToDataUrl, downloadDataUrl } from './dom-snapshot'
// #endif

type CanvasHolder = {
  toTempFilePath?: () => Promise<string>
  getContext?: (...args: unknown[]) => unknown
}

/**
 * lingyun-save-image · 保存为图片
 * @description 显示文字或图标的保存触发器；点击把 ref / 页面保存成 PNG。
 *   - H5：克隆 DOM 光栅化，传 target 截取该元素，不传 target 截取整个页面；默认触发下载。
 *   - 小程序：整页截图没有系统能力，需传入 canvas 节点或带 toTempFilePath() 的组件 ref，
 *     导出后默认保存到相册（album）。
 * @property {Object} target ref / 元素 / 组件实例；H5 元素或组件（取 $el），小程序 canvas 节点或带 toTempFilePath() 的组件
 * @property {String} label 显示文案；不传且没有 icon 时显示「保存为图片」
 * @property {String} icon lingyun-icon 图标名
 * @property {String} size = [small|medium|large]
 * @property {String} variant = [glass|plain]
 * @property {String} fileName H5 下载文件名（不含 .png）
 * @property {Number} pixelRatio H5 导出倍率 1–3
 * @property {String} background H5 画布底色；空则取元素 / 祖先背景色
 * @property {Boolean} download H5 是否自动触发下载
 * @property {Boolean} album 小程序是否保存到相册
 * @property {Boolean} toast 成功后是否提示
 * @property {String} toastText 成功提示文案
 * @property {String} busyText 保存中提示文案
 * @property {Boolean} disabled
 * @event {Function} success 保存成功，参数 { path }
 * @event {Function} error 保存失败，参数 { message }
 * @method save() 手动保存，返回 Promise<string>（H5 data URL / 小程序临时文件路径）
 * @see design/UI_SPEC.md
 */
export default defineComponent({
  name: 'LingyunSaveImage',
  options: {
    virtualHost: true,
  },
  emits: ['success', 'error'],
  props: {
    target: { type: null, default: null },
    label: { type: String, default: '' },
    icon: { type: String, default: '' },
    size: { type: String, default: 'small' },
    variant: { type: String, default: 'glass' },
    fileName: { type: String, default: 'lingyun-image' },
    pixelRatio: { type: Number, default: 2 },
    background: { type: String, default: '' },
    download: { type: Boolean, default: true },
    album: { type: Boolean, default: true },
    toast: { type: Boolean, default: true },
    toastText: { type: String, default: '已保存' },
    busyText: { type: String, default: '保存中…' },
    disabled: { type: Boolean, default: false },
  },
  data() {
    return {
      busy: false,
    }
  },
  computed: {
    resolvedSize(): string {
      const allowed = ['small', 'medium', 'large']
      return allowed.includes(this.size) ? this.size : 'small'
    },
    resolvedVariant(): string {
      return this.variant === 'plain' ? 'plain' : 'glass'
    },
    iconSize(): number {
      return this.resolvedSize === 'large' ? 20 : this.resolvedSize === 'medium' ? 18 : 16
    },
    displayLabel(): string {
      if (this.label) return this.label
      return this.icon ? '' : '保存为图片'
    },
    showLabel(): boolean {
      return !!this.displayLabel
    },
    rootClass(): string {
      return [
        `lingyun-save-image--${this.resolvedVariant}`,
        `lingyun-save-image--${this.resolvedSize}`,
        this.busy ? 'lingyun-save-image--busy' : '',
        this.disabled ? 'lingyun-save-image--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
  },
  methods: {
    onTap(): void {
      if (this.disabled || this.busy) return
      this.save().catch(() => {
        /* 错误已经通过 error 事件与 toast 抛出 */
      })
    },
    unwrapTarget(raw: unknown): unknown {
      let value = raw
      let depth = 0
      while (isRef(value) && depth < 3) {
        value = value.value
        depth += 1
      }
      return value
    },
    // #ifdef H5
    resolveDomElement(value: unknown): HTMLElement | null {
      if (!value || typeof value !== 'object') return null
      if ((value as { nodeType?: number }).nodeType === 1) return value as HTMLElement
      const el = (value as { $el?: unknown }).$el
      if (el && typeof el === 'object' && (el as { nodeType?: number }).nodeType === 1) {
        return el as HTMLElement
      }
      return null
    },
    defaultPageElement(): HTMLElement | null {
      const pages = Array.from(document.querySelectorAll('uni-page-body')) as HTMLElement[]
      if (pages.length) return pages[pages.length - 1]
      return (document.querySelector('uni-app') as HTMLElement | null) || document.body
    },
    // #endif
    resolveCanvasHolder(value: unknown): CanvasHolder | null {
      if (!value || typeof value !== 'object') return null
      const holder = value as CanvasHolder
      if (typeof holder.toTempFilePath === 'function') return holder
      if (typeof holder.getContext === 'function') return holder
      return null
    },
    exportCanvasNode(holder: CanvasHolder): Promise<string> {
      return new Promise<string>((resolve, reject) => {
        uni.canvasToTempFilePath({
          canvas: holder,
          fileType: 'png',
          success: (res: { tempFilePath?: string }) => {
            const path = res?.tempFilePath || ''
            if (path) resolve(path)
            else reject(new Error('导出图片失败'))
          },
          fail: (err: { errMsg?: string }) => {
            reject(new Error(err?.errMsg || '导出图片失败'))
          },
        } as unknown as UniApp.CanvasToTempFilePathOptions)
      })
    },
    saveToAlbum(filePath: string): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        uni.saveImageToPhotosAlbum({
          filePath,
          success: () => resolve(),
          fail: (err) => {
            reject(new Error((err as { errMsg?: string })?.errMsg || '保存到相册失败'))
          },
        })
      })
    },
    // #ifdef H5
    async captureH5(target: unknown): Promise<string> {
      const element = this.resolveDomElement(target) || this.defaultPageElement()
      if (!element) throw new Error('找不到要保存的页面')
      const dataUrl = await captureElementToDataUrl(element, {
        pixelRatio: this.pixelRatio,
        background: this.background,
      })
      if (this.download) downloadDataUrl(dataUrl, this.fileName)
      return dataUrl
    },
    // #endif
    // #ifndef H5
    async captureMiniProgram(target: unknown): Promise<string> {
      const holder = this.resolveCanvasHolder(target)
      if (!holder) {
        throw new Error('微信小程序暂不支持整页截图，请传入 canvas 节点或带 toTempFilePath() 的组件 ref')
      }
      const exportMethod = holder.toTempFilePath
      let filePath = ''
      if (typeof exportMethod === 'function') {
        filePath = String(await exportMethod.call(holder))
      } else {
        filePath = await this.exportCanvasNode(holder)
      }
      if (this.album && filePath && !filePath.startsWith('data:')) {
        await this.saveToAlbum(filePath)
      }
      return filePath
    },
    // #endif
    async performSave(): Promise<string> {
      const target = this.unwrapTarget(this.target)
      // #ifdef H5
      return this.captureH5(target)
      // #endif
      // #ifndef H5
      return this.captureMiniProgram(target)
      // #endif
    },
    async save(): Promise<string> {
      if (this.disabled) throw new Error('保存已禁用')
      if (this.busy) throw new Error('正在保存')
      this.busy = true
      const startedAt = Date.now()
      try {
        const result = await this.performSave()
        this.$emit('success', { path: result })
        // #ifndef MP-WEIXIN
        if (this.toast) {
          uni.showToast({ title: this.toastText, icon: 'none' })
        }
        // #endif
        return result
      } catch (err) {
        const message = (err as { message?: string })?.message || '保存失败'
        this.$emit('error', { message })
        if (this.toast) {
          uni.showToast({ title: message, icon: 'none' })
        }
        throw err
      } finally {
        const remain = 300 - (Date.now() - startedAt)
        if (remain > 0) {
          await new Promise<void>((resolve) => setTimeout(resolve, remain))
        }
        this.busy = false
      }
    },
  },
})
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.lingyun-save-image {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  gap: 6px;
  font-weight: 590;
  line-height: 1.2;
  transition: transform 0.16s ease, opacity 0.16s ease;
  /* #ifdef H5 */
  cursor: pointer;
  user-select: none;
  /* #endif */

  &__label {
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    line-height: inherit;
  }

  &__icon {
    flex-shrink: 0;
  }

  &__spinner {
    width: 14px;
    height: 14px;
    border: 1.5px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: lingyun-save-image-spin 0.7s linear infinite;
  }

  &--glass {
    @include lingyun-glass-control;
    color: var(--lingyun-label, #{$lingyun-label});
  }

  &--plain {
    color: var(--lingyun-link, #{$lingyun-link});
    background-color: transparent;
  }

  &--small {
    height: 34px;
    min-height: 34px;
    padding: 0 12px;
    font-size: 15px;
  }

  &--medium {
    height: 40px;
    min-height: 40px;
    padding: 0 14px;
    font-size: 16px;
  }

  &--large {
    height: 50px;
    min-height: 50px;
    padding: 0 18px;
    font-size: 17px;
  }

  &--hover {
    opacity: 0.7;
  }

  &--busy {
    opacity: 0.7;
  }

  &--disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

@keyframes lingyun-save-image-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
