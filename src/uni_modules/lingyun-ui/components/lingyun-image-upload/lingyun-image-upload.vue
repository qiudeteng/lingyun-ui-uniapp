<template>
  <view class="lingyun-image-upload" :class="rootClass">
    <view class="lingyun-image-upload__grid">
      <view
        v-for="(item, index) in items"
        :key="item.id"
        class="lingyun-image-upload__cell"
        :style="cellStyle"
      >
        <view
          class="lingyun-image-upload__box"
          :class="{
            'lingyun-image-upload__box--error': item.status === 'error',
          }"
          :style="radiusStyle"
          @click="onItemClick(item, index)"
        >
          <image
            class="lingyun-image-upload__image"
            :src="item.localPath || item.url"
            mode="aspectFill"
          />

          <view
            v-if="item.status === 'uploading'"
            class="lingyun-image-upload__status"
          >
            <lingyun-activity-indicator size="small" color="#ffffff" />
            <text class="lingyun-image-upload__status-text">{{ item.progress }}%</text>
          </view>

          <view
            v-else-if="item.status === 'queued'"
            class="lingyun-image-upload__status"
          >
            <text class="lingyun-image-upload__status-text">等待上传</text>
          </view>

          <view
            v-else-if="item.status === 'error'"
            class="lingyun-image-upload__status lingyun-image-upload__status--error"
          >
            <lingyun-icon type="refresh" :size="20" color="white" />
            <text class="lingyun-image-upload__status-text">点击重试</text>
          </view>
        </view>

        <view
          v-if="!readonly && !disabled"
          class="lingyun-image-upload__remove"
          role="button"
          aria-label="删除图片"
          @click.stop="removeItem(index)"
        >
          <lingyun-icon type="close" :size="12" color="white" />
        </view>
      </view>

      <view
        v-if="canAdd"
        class="lingyun-image-upload__cell"
        :style="cellStyle"
        @click="choose"
      >
        <view
          class="lingyun-image-upload__box lingyun-image-upload__add"
          :style="radiusStyle"
        >
          <view class="lingyun-image-upload__add-content">
            <slot name="add">
              <lingyun-icon type="plusempty" :size="26" color="secondary" />
              <text
                v-if="resolvedMaxCount > 1"
                class="lingyun-image-upload__add-text"
              >
                {{ items.length }}/{{ resolvedMaxCount }}
              </text>
            </slot>
          </view>
        </view>
      </view>
    </view>

    <text v-if="tip" class="lingyun-image-upload__tip">{{ tip }}</text>

    <!-- #ifdef MP-WEIXIN -->
    <root-portal>
      <crop-editor
        v-if="editorVisible && editorFile"
        :key="editorKey"
        :image-path="editorFile.tempFilePath"
        :image-width="editorWidth"
        :image-height="editorHeight"
        :aspect="editorAspect"
        :index="editorIndex"
        :total="editorQueue.length"
        :z-index="zIndex"
        :output-max-size="outputMaxSize"
        :quality="quality"
        @confirm="onEditorConfirm"
        @cancel="onEditorCancel"
      />
    </root-portal>
    <!-- #endif -->

    <!-- #ifndef MP-WEIXIN -->
    <teleport to="body">
      <crop-editor
        v-if="editorVisible && editorFile"
        :key="editorKey"
        :image-path="editorFile.tempFilePath"
        :image-width="editorWidth"
        :image-height="editorHeight"
        :aspect="editorAspect"
        :index="editorIndex"
        :total="editorQueue.length"
        :z-index="zIndex"
        :output-max-size="outputMaxSize"
        :quality="quality"
        @confirm="onEditorConfirm"
        @cancel="onEditorCancel"
      />
    </teleport>
    <!-- #endif -->
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import CropEditor from './crop-editor.vue'
import { parseCropAspect } from './crop'
import {
  isAbortError,
  uploadWithUni,
  type LingyunUploadFn,
  type LingyunUploadTask,
} from '../../utils/upload'

type UploadStatus = 'queued' | 'uploading' | 'success' | 'error'

interface UploadItem {
  id: number
  url: string
  localPath: string
  name: string
  size: number
  status: UploadStatus
  progress: number
  error: string
  response: unknown
  revoke?: () => void
}

interface SelectedFile {
  tempFilePath: string
  size: number
  name: string
}

interface ChooseImageResult {
  tempFilePaths?: string[]
  tempFiles?: Array<{
    path?: string
    tempFilePath?: string
    size?: number
    name?: string
  }>
}

interface ExportResult {
  filePath: string
  revoke?: () => void
}

const RADIUS_PRESET: Record<string, number> = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 26,
}

function sameUrls(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((url, index) => url === right[index])
}

/**
 * lingyun-image-upload
 * @description 图片上传：direct 直接上传 / edit 先旋转裁剪再上传
 * @see design/IMAGE_UPLOADS.md
 */
export default defineComponent({
  name: 'LingyunImageUpload',
  components: { CropEditor },
  emits: [
    'update:modelValue',
    'change',
    'select',
    'upload-start',
    'upload-success',
    'upload-error',
    'remove',
    'exceed',
    'retry',
    'preview',
    'crop-open',
    'crop-confirm',
    'crop-cancel',
  ],
  props: {
    modelValue: { type: Array as PropType<string[]>, default: () => [] },
    mode: { type: String as PropType<'direct' | 'edit'>, default: 'direct' },
    maxCount: { type: Number, default: 9 },
    /** 单张大小上限，单位 MB；0 不限制 */
    maxSize: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    columns: { type: Number, default: 3 },
    /** 缩略图/加号固定边长（px）；0 时按 columns 自适应 */
    tileSize: { type: Number, default: 96 },
    radius: { type: [String, Number] as PropType<string | number>, default: 'md' },
    preview: { type: Boolean, default: true },
    uploadUrl: { type: String, default: '' },
    uploadName: { type: String, default: 'file' },
    uploadHeader: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
    uploadFormData: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
    uploadFn: {
      type: Function as unknown as PropType<LingyunUploadFn | null>,
      default: null,
    },
    parseResponse: {
      type: Function as unknown as PropType<((raw: unknown) => string) | null>,
      default: null,
    },
    /** 固定宽高比（1、4/3、'4:3'），或 'free' 自由裁剪 */
    cropAspect: {
      type: [Number, String] as PropType<number | string>,
      default: 1,
    },
    outputMaxSize: { type: Number, default: 2048 },
    quality: { type: Number, default: 0.85 },
    sourceType: {
      type: Array as PropType<Array<'album' | 'camera'>>,
      default: () => ['album', 'camera'],
    },
    sizeType: {
      type: Array as PropType<Array<'original' | 'compressed'>>,
      default: () => ['original', 'compressed'],
    },
    zIndex: { type: Number, default: 1200 },
    tip: { type: String, default: '' },
  },
  data(): {
    items: UploadItem[]
    activeTask: LingyunUploadTask | null
    activeItemId: number
    pumping: boolean
    choosing: boolean
    editorVisible: boolean
    editorQueue: SelectedFile[]
    editorIndex: number
    editorWidth: number
    editorHeight: number
    editorKey: number
    itemSequence: number
  } {
    return {
      items: [],
      activeTask: null,
      activeItemId: 0,
      pumping: false,
      choosing: false,
      editorVisible: false,
      editorQueue: [],
      editorIndex: 0,
      editorWidth: 0,
      editorHeight: 0,
      editorKey: 0,
      itemSequence: 0,
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
      return [
        themeClass,
        this.disabled ? 'lingyun-image-upload--disabled' : '',
        this.readonly ? 'lingyun-image-upload--readonly' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    resolvedMaxCount(): number {
      return Math.max(1, Math.floor(Number(this.maxCount) || 1))
    },
    gridColumns(): number {
      return Math.max(1, Math.min(6, Math.floor(Number(this.columns) || 3)))
    },
    pendingEditorCount(): number {
      if (!this.editorQueue.length) return 0
      return Math.max(0, this.editorQueue.length - this.editorIndex)
    },
    remaining(): number {
      return Math.max(
        0,
        this.resolvedMaxCount - this.items.length - this.pendingEditorCount,
      )
    },
    canAdd(): boolean {
      return !this.disabled && !this.readonly && this.remaining > 0
    },
    cellStyle(): Record<string, string> {
      const size = Number(this.tileSize) || 0
      if (size > 0) return { width: `${size}px` }
      const gap = 8
      return {
        width: `calc((100% - ${gap * (this.gridColumns - 1)}px) / ${this.gridColumns})`,
      }
    },
    radiusStyle(): Record<string, string> {
      const preset =
        typeof this.radius === 'number'
          ? this.radius
          : RADIUS_PRESET[String(this.radius)]
      const value = Number.isFinite(preset) ? Number(preset) : RADIUS_PRESET.md
      return { borderRadius: `${value}px` }
    },
    successUrls(): string[] {
      return this.items
        .filter((item) => item.status === 'success' && item.url)
        .map((item) => item.url)
    },
    editorFile(): SelectedFile | null {
      return this.editorQueue[this.editorIndex] || null
    },
    editorAspect(): number | null {
      return parseCropAspect(this.cropAspect)
    },
    hasUploader(): boolean {
      return !!(this.uploadFn || this.uploadUrl)
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(value: string[]) {
        const urls = Array.isArray(value) ? value.filter(Boolean) : []
        const current = this.items
          .filter((item) => item.status === 'success' && item.url)
          .map((item) => item.url)
        if (sameUrls(urls, current)) return
        this.reconcileModel(urls)
      },
    },
  },
  beforeUnmount() {
    this.activeTask?.abort?.()
    this.activeTask = null
    this.items.forEach((item) => item.revoke?.())
  },
  methods: {
    createItem(file: SelectedFile, url = ''): UploadItem {
      this.itemSequence += 1
      return {
        id: this.itemSequence,
        url,
        localPath: url ? '' : file.tempFilePath,
        name: file.name,
        size: file.size,
        status: url ? 'success' : 'queued',
        progress: url ? 100 : 0,
        error: '',
        response: null,
      }
    },
    reconcileModel(urls: string[]): void {
      const unique = Array.from(new Set(urls.filter(Boolean)))
      const inFlight = this.items.filter((item) => item.status !== 'success')
      const existing = new Map<string, UploadItem>()
      for (const item of this.items) {
        if (item.status === 'success' && item.url) existing.set(item.url, item)
      }
      const next = unique.map(
        (url) =>
          existing.get(url) ||
          this.createItem({ tempFilePath: url, size: 0, name: 'image' }, url),
      )
      const kept = new Set(next)
      for (const item of this.items) {
        if (item.status === 'success' && !kept.has(item)) item.revoke?.()
      }
      this.items = [...next, ...inFlight]
    },
    syncModel(): void {
      const urls = this.items
        .filter((item) => item.status === 'success' && item.url)
        .map((item) => item.url)
      const current = Array.isArray(this.modelValue) ? this.modelValue : []
      if (!sameUrls(urls, current)) {
        this.$emit('update:modelValue', urls)
      }
      this.$emit('change', { urls, items: this.items })
    },
    toast(title: string): void {
      uni.showToast({ title, icon: 'none' })
    },
    choose(): void {
      if (this.disabled || this.readonly || this.choosing) return
      if (!this.hasUploader) {
        this.toast('请先配置上传地址或 uploadFn')
        return
      }
      if (this.remaining <= 0) {
        this.$emit('exceed', {
          maxCount: this.resolvedMaxCount,
          selected: 0,
        })
        this.toast(`最多上传 ${this.resolvedMaxCount} 张`)
        return
      }
      this.choosing = true
      ;(
        uni as typeof uni & {
          chooseImage: (options: Record<string, unknown>) => void
        }
      ).chooseImage({
        count: this.remaining,
        sizeType: this.sizeType,
        sourceType: this.sourceType,
        success: (res: ChooseImageResult) => {
          this.choosing = false
          this.handleFiles(this.normalizeFiles(res), this.remaining)
        },
        fail: () => {
          this.choosing = false
        },
      })
    },
    normalizeFiles(res: ChooseImageResult): SelectedFile[] {
      const files = Array.isArray(res.tempFiles) ? res.tempFiles : []
      if (files.length) {
        return files
          .map((file, index) => ({
            tempFilePath: String(
              file.path || file.tempFilePath || res.tempFilePaths?.[index] || '',
            ),
            size: Number(file.size) || 0,
            name: String(file.name || `image-${index + 1}.jpg`),
          }))
          .filter((file) => file.tempFilePath)
      }
      return (res.tempFilePaths || []).map((path, index) => ({
        tempFilePath: path,
        size: 0,
        name: `image-${index + 1}.jpg`,
      }))
    },
    handleFiles(files: SelectedFile[], remaining: number): void {
      if (!files.length) return
      if (files.length > remaining) {
        this.$emit('exceed', {
          maxCount: this.resolvedMaxCount,
          selected: files.length,
        })
      }
      const selected = files.slice(0, remaining)
      const valid: SelectedFile[] = []
      let rejected = 0
      for (const file of selected) {
        if (this.maxSize > 0 && file.size > this.maxSize * 1024 * 1024) {
          rejected += 1
          continue
        }
        valid.push(file)
      }
      if (rejected > 0) {
        this.toast(`单张图片不能超过 ${this.maxSize}MB`)
      }
      if (!valid.length) return
      this.$emit('select', {
        files: valid,
        remaining: Math.max(0, remaining - valid.length),
      })
      if (this.mode === 'edit') {
        this.editorQueue = valid
        this.editorIndex = 0
        this.prepareEditor()
        return
      }
      for (const file of valid) {
        this.items.push(this.createItem(file))
      }
      this.$nextTick(() => this.pumpUploads())
    },
    pumpUploads(): void {
      if (this.pumping || this.activeTask) return
      const next = this.items.find((item) => item.status === 'queued')
      if (!next) return
      this.pumping = true
      void this.uploadItem(next).finally(() => {
        this.pumping = false
        this.pumpUploads()
      })
    },
    async uploadItem(item: UploadItem): Promise<void> {
      if (!this.hasUploader) {
        item.status = 'error'
        item.error = '未配置上传地址或 uploadFn'
        this.$emit('upload-error', item, new Error(item.error))
        this.toast(item.error)
        return
      }

      item.status = 'uploading'
      item.progress = 0
      item.error = ''
      this.$emit('upload-start', item)

      try {
        let url = ''
        let response: unknown = null
        if (this.uploadFn) {
          const result = await this.uploadFn({
            tempFilePath: item.localPath,
            name: item.name,
            size: item.size,
          })
          if (typeof result === 'string') {
            url = result
          } else if (result && typeof result === 'object') {
            response = result
            url = String((result as { url?: unknown }).url || '')
          }
          if (!url) throw new Error('上传函数未返回图片地址')
        } else {
          const result = await uploadWithUni({
            url: this.uploadUrl,
            filePath: item.localPath,
            name: this.uploadName,
            header: this.uploadHeader,
            formData: this.uploadFormData,
            parseResponse: this.parseResponse || undefined,
            missingUrlMessage: '上传响应缺少图片地址',
            onProgress: (progress) => {
              item.progress = Math.max(0, Math.min(100, Math.round(progress)))
            },
            onTask: (task) => {
              this.activeTask = task
              this.activeItemId = item.id
            },
          })
          url = result.url
          response = result.raw
        }

        if (!this.items.some((entry) => entry.id === item.id)) return
        item.url = url
        item.status = 'success'
        item.progress = 100
        item.response = response
        if (item.revoke && item.localPath !== url) {
          item.revoke()
          item.revoke = undefined
          item.localPath = ''
        }
        this.$emit('upload-success', item, response)
        this.syncModel()
      } catch (error) {
        if (isAbortError(error)) return
        if (!this.items.some((entry) => entry.id === item.id)) return
        item.status = 'error'
        item.error = error instanceof Error ? error.message : '上传失败'
        this.$emit('upload-error', item, error)
      } finally {
        this.activeTask = null
        this.activeItemId = 0
      }
    },
    removeItem(index: number): void {
      if (this.disabled || this.readonly) return
      const item = this.items[index]
      if (!item) return
      if (item.status === 'uploading' && this.activeItemId === item.id) {
        this.activeTask?.abort?.()
        this.activeTask = null
        this.activeItemId = 0
      }
      this.items.splice(index, 1)
      item.revoke?.()
      this.$emit('remove', { item, index })
      this.syncModel()
    },
    retryItem(item: UploadItem): void {
      if (item.status !== 'error') return
      item.status = 'queued'
      item.progress = 0
      item.error = ''
      this.$emit('retry', item)
      this.pumpUploads()
    },
    retryAll(): void {
      for (const item of this.items) {
        if (item.status === 'error') {
          item.status = 'queued'
          item.progress = 0
          item.error = ''
        }
      }
      this.pumpUploads()
    },
    clear(): void {
      this.activeTask?.abort?.()
      this.activeTask = null
      this.activeItemId = 0
      this.items.forEach((item) => item.revoke?.())
      this.items = []
      this.syncModel()
    },
    onItemClick(item: UploadItem, index: number): void {
      if (item.status === 'error') {
        this.retryItem(item)
        return
      }
      if (item.status !== 'success' || !this.preview) return
      this.$emit('preview', { item, index })
      if (this.successUrls.length) {
        uni.previewImage({
          urls: this.successUrls,
          current: item.url,
        })
      }
    },
    prepareEditor(): void {
      const file = this.editorFile
      if (!file) {
        this.closeEditorQueue()
        return
      }
      this.editorVisible = false
      ;(
        uni as typeof uni & {
          getImageInfo: (options: Record<string, unknown>) => void
        }
      ).getImageInfo({
        src: file.tempFilePath,
        success: (info: { width?: number; height?: number }) => {
          if (!this.editorQueue.length) return
          const width = Number(info.width) || 0
          const height = Number(info.height) || 0
          if (!width || !height) {
            this.toast('图片尺寸读取失败')
            this.skipEditorFile()
            return
          }
          this.editorWidth = width
          this.editorHeight = height
          this.editorKey += 1
          this.editorVisible = true
          this.$emit('crop-open', {
            file,
            index: this.editorIndex,
            total: this.editorQueue.length,
          })
        },
        fail: () => {
          this.toast('图片读取失败')
          this.skipEditorFile()
        },
      })
    },
    skipEditorFile(): void {
      this.editorIndex += 1
      if (this.editorIndex < this.editorQueue.length) this.prepareEditor()
      else this.closeEditorQueue()
    },
    onEditorConfirm(result: ExportResult): void {
      const file = this.editorFile
      this.editorVisible = false
      this.$emit('crop-confirm', { file, result })
      if (file) {
        const item = this.createItem({
          tempFilePath: result.filePath,
          size: file.size,
          name: file.name,
        })
        item.revoke = result.revoke
        this.items.push(item)
        this.$nextTick(() => this.pumpUploads())
      }
      this.editorIndex += 1
      if (this.editorIndex < this.editorQueue.length) this.prepareEditor()
      else this.closeEditorQueue()
    },
    onEditorCancel(): void {
      const file = this.editorFile
      this.editorVisible = false
      const remaining = Math.max(
        0,
        this.editorQueue.length - this.editorIndex - 1,
      )
      this.$emit('crop-cancel', { file, remaining })
      if (remaining <= 0) {
        this.closeEditorQueue()
        return
      }
      uni.showModal({
        title: '放弃剩余图片？',
        content: `还有 ${remaining} 张图片未编辑`,
        confirmText: '放弃',
        cancelText: '继续编辑',
        success: (res: { confirm?: boolean }) => {
          if (res.confirm) this.closeEditorQueue()
          else this.prepareEditor()
        },
        fail: () => this.prepareEditor(),
      })
    },
    closeEditorQueue(): void {
      this.editorVisible = false
      this.editorQueue = []
      this.editorIndex = 0
      this.editorWidth = 0
      this.editorHeight = 0
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-image-upload {
  width: 100%;
  box-sizing: border-box;
}

.lingyun-image-upload__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lingyun-image-upload__cell {
  position: relative;
  box-sizing: border-box;
}

.lingyun-image-upload__box {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  overflow: hidden;
  box-sizing: border-box;
  background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
}

.lingyun-image-upload__box--error {
  box-shadow: inset 0 0 0 2px var(--lingyun-error, #ff383c);
}

.lingyun-image-upload__image {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.lingyun-image-upload__status {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background-color: rgba(0, 0, 0, 0.45);
}

.lingyun-image-upload__status--error {
  background-color: rgba(0, 0, 0, 0.58);
}

.lingyun-image-upload__status-text {
  font-size: 12px;
  line-height: 16px;
  color: #ffffff;
}

.lingyun-image-upload__remove {
  position: absolute;
  right: 4px;
  top: 4px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  background-color: rgba(0, 0, 0, 0.62);
  box-shadow: inset 0 0 0 0.5px rgba(255, 255, 255, 0.36);
}

.lingyun-image-upload__add {
  border: 1px dashed var(--lingyun-label-quaternary, rgba(60, 60, 67, 0.18));
  background-color: var(--lingyun-fill-quaternary, rgba(116, 116, 128, 0.08));
}

.lingyun-image-upload__add-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.lingyun-image-upload__add-text {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-tertiary, rgba(60, 60, 67, 0.3));
}

.lingyun-image-upload__tip {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}

.lingyun-image-upload--disabled {
  pointer-events: none;
  opacity: 0.6;
}
</style>
