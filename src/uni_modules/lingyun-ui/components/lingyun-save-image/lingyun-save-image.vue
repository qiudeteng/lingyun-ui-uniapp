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

<script setup lang="ts">
import { computed, ref } from 'vue'
import { isRef } from 'vue'
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
defineOptions({
  name: 'LingyunSaveImage',
  options: { virtualHost: true },
})

const emit = defineEmits(['success', 'error'])

const props = defineProps({
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
})

const busy = ref(false)

const resolvedSize = computed((): string => {
  const allowed = ['small', 'medium', 'large']
  return allowed.includes(props.size) ? props.size : 'small'
})

const resolvedVariant = computed((): string => {
  return props.variant === 'plain' ? 'plain' : 'glass'
})

const iconSize = computed((): number => {
  return resolvedSize.value === 'large' ? 20 : resolvedSize.value === 'medium' ? 18 : 16
})

const displayLabel = computed((): string => {
  if (props.label) return props.label
  return props.icon ? '' : '保存为图片'
})

const showLabel = computed((): boolean => {
  return !!displayLabel.value
})

const rootClass = computed((): string => {
  return [
    `lingyun-save-image--${resolvedVariant.value}`,
    `lingyun-save-image--${resolvedSize.value}`,
    busy.value ? 'lingyun-save-image--busy' : '',
    props.disabled ? 'lingyun-save-image--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

function unwrapTarget(raw: unknown): unknown {
  let value = raw
  let depth = 0
  while (isRef(value) && depth < 3) {
    value = value.value
    depth += 1
  }
  return value
}

// #ifdef H5
function resolveDomElement(value: unknown): HTMLElement | null {
  if (!value || typeof value !== 'object') return null
  if ((value as { nodeType?: number }).nodeType === 1) return value as HTMLElement
  const el = (value as { $el?: unknown }).$el
  if (el && typeof el === 'object' && (el as { nodeType?: number }).nodeType === 1) {
    return el as HTMLElement
  }
  return null
}
function defaultPageElement(): HTMLElement | null {
  const pages = Array.from(document.querySelectorAll('uni-page-body')) as HTMLElement[]
  if (pages.length) return pages[pages.length - 1]
  return (document.querySelector('uni-app') as HTMLElement | null) || document.body
}
// #endif

function resolveCanvasHolder(value: unknown): CanvasHolder | null {
  if (!value || typeof value !== 'object') return null
  const holder = value as CanvasHolder
  if (typeof holder.toTempFilePath === 'function') return holder
  if (typeof holder.getContext === 'function') return holder
  return null
}

function exportCanvasNode(holder: CanvasHolder): Promise<string> {
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
}

function saveToAlbum(filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: (err) => {
        reject(new Error((err as { errMsg?: string })?.errMsg || '保存到相册失败'))
      },
    })
  })
}

// #ifdef H5
async function captureH5(target: unknown): Promise<string> {
  const element = resolveDomElement(target) || defaultPageElement()
  if (!element) throw new Error('找不到要保存的页面')
  const dataUrl = await captureElementToDataUrl(element, {
    pixelRatio: props.pixelRatio,
    background: props.background,
  })
  if (props.download) downloadDataUrl(dataUrl, props.fileName)
  return dataUrl
}
// #endif

// #ifndef H5
async function captureMiniProgram(target: unknown): Promise<string> {
  const holder = resolveCanvasHolder(target)
  if (!holder) {
    throw new Error('微信小程序暂不支持整页截图，请传入 canvas 节点或带 toTempFilePath() 的组件 ref')
  }
  const exportMethod = holder.toTempFilePath
  let filePath = ''
  if (typeof exportMethod === 'function') {
    filePath = String(await exportMethod.call(holder))
  } else {
    filePath = await exportCanvasNode(holder)
  }
  if (props.album && filePath && !filePath.startsWith('data:')) {
    await saveToAlbum(filePath)
  }
  return filePath
}
// #endif

async function performSave(): Promise<string> {
  const target = unwrapTarget(props.target)
  // #ifdef H5
  return captureH5(target)
  // #endif
  // #ifndef H5
  return captureMiniProgram(target)
  // #endif
}

async function save(): Promise<string> {
  if (props.disabled) throw new Error('保存已禁用')
  if (busy.value) throw new Error('正在保存')
  busy.value = true
  const startedAt = Date.now()
  try {
    const result = await performSave()
    emit('success', { path: result })
    // #ifndef MP-WEIXIN
    if (props.toast) {
      uni.showToast({ title: props.toastText, icon: 'none' })
    }
    // #endif
    return result
  } catch (err) {
    const message = (err as { message?: string })?.message || '保存失败'
    emit('error', { message })
    if (props.toast) {
      uni.showToast({ title: message, icon: 'none' })
    }
    throw err
  } finally {
    const remain = 300 - (Date.now() - startedAt)
    if (remain > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, remain))
    }
    busy.value = false
  }
}

function onTap(): void {
  if (props.disabled || busy.value) return
  save().catch(() => {
    /* 错误已经通过 error 事件与 toast 抛出 */
  })
}
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
