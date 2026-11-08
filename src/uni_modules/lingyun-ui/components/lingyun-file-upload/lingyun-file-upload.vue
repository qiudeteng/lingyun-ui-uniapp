<template>
  <view class="lingyun-file-upload" :class="rootClass">
    <lingyun-list :header="title" :footer="tip">
      <lingyun-list-item
        v-for="(item, index) in items"
        :key="item.id"
        :title="item.name"
        :note="noteOf(item)"
        thumb-size="base"
        :clickable="rowClickable(item)"
        :hide-divider="index === 0"
        @click="onRowClick(item, index)"
      >
        <template #icon>
          <view class="lingyun-file-upload__kind" :class="kindClass(item.name)">
            <text v-if="extLabel(item.name)" class="lingyun-file-upload__ext">
              {{ extLabel(item.name) }}
            </text>
            <lingyun-icon v-else type="paperclip" :size="16" color="secondary" />
          </view>
        </template>

        <template #extra>
          <view class="lingyun-file-upload__actions" @click.stop>
            <view
              v-if="item.status === 'uploading'"
              class="lingyun-file-upload__progress"
            >
              <view class="lingyun-file-upload__progress-bar">
                <lingyun-progress :percent="item.progress" :stroke-width="3" />
              </view>
              <text class="lingyun-file-upload__percent">{{ item.progress }}%</text>
            </view>

            <view
              v-else-if="item.status === 'error' && !readonly"
              class="lingyun-file-upload__action"
              role="button"
              aria-label="重试上传"
              @click.stop="retryItem(item)"
            >
              <lingyun-icon type="refresh" :size="18" color="error" />
            </view>

            <view
              v-if="item.status === 'success' && showDownload && !disabled"
              class="lingyun-file-upload__action"
              role="button"
              aria-label="下载文件"
              @click.stop="downloadItem(item, index)"
            >
              <lingyun-icon type="download" :size="18" color="secondary" />
            </view>

            <view
              v-if="!readonly && !disabled"
              class="lingyun-file-upload__action"
              role="button"
              aria-label="删除文件"
              @click.stop="removeItem(index)"
            >
              <lingyun-icon type="trash" :size="18" color="error" />
            </view>
          </view>
        </template>
      </lingyun-list-item>

      <lingyun-list-item
        v-if="canAdd"
        title="添加文件"
        clickable
        hide-divider
        @click="choose"
      >
        <template #icon>
          <view class="lingyun-file-upload__kind lingyun-file-upload__kind--add">
            <lingyun-icon type="plusempty" :size="16" color="primary" />
          </view>
        </template>
        <template #extra>
          <text class="lingyun-file-upload__count">
            {{ items.length }}/{{ resolvedMaxCount }}
          </text>
        </template>
      </lingyun-list-item>

      <lingyun-list-item
        v-if="!items.length && !canAdd"
        title="暂无文件"
        :note="readonly ? '只读' : ''"
        hide-divider
      />
    </lingyun-list>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import {
  isAbortError,
  uploadWithUni,
  type LingyunUploadFn,
  type LingyunUploadTask,
} from '../../utils/upload'
import {
  acceptWithDot,
  acceptWithoutDot,
  basename,
  fileExt,
  fileExtLabel,
  fileKind,
  formatFileSize,
  isPreviewable,
  normalizeAccept,
  normalizeUploadedFiles,
  sameFileSequence,
  type LingyunFileChooseFn,
  type LingyunFilePick,
  type LingyunUploadedFile,
} from './file'

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
}

interface SelectedFile {
  tempFilePath: string
  name: string
  size: number
}

interface ChooseFileResult {
  tempFiles?: Array<Record<string, unknown>>
  tempFilePaths?: string[]
}

interface ChooseOptions {
  count: number
  type: 'file' | 'all'
  extension?: string[]
  success: (res: ChooseFileResult) => void
  fail: () => void
}

/**
 * lingyun-file-upload
 * @description 文件上传：列表行、进度、重试、删除、预览/下载
 * @see design/FILE_UPLOADS.md
 */
export default defineComponent({
  name: 'LingyunFileUpload',
  emits: [
    'update:modelValue',
    'change',
    'select',
    'upload-start',
    'upload-success',
    'upload-error',
    'remove',
    'retry',
    'preview',
    'download',
    'exceed',
    'invalid',
  ],
  props: {
    modelValue: {
      type: Array as PropType<Array<LingyunUploadedFile | string>>,
      default: () => [],
    },
    maxCount: { type: Number, default: 9 },
    /** 单文件大小上限，单位 MB；0 不限制 */
    maxSize: { type: Number, default: 20 },
    /** 扩展名，如 'pdf,docx' 或 ['pdf', '.docx']；空 = 全部 */
    accept: {
      type: [String, Array] as PropType<string | string[]>,
      default: '',
    },
    title: { type: String, default: '' },
    tip: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    preview: { type: Boolean, default: true },
    showSize: { type: Boolean, default: true },
    showDownload: { type: Boolean, default: true },
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
    /** 自定义文件选择器；微信端配置后显示「从聊天选择 / 从系统选择」 */
    chooseFn: {
      type: Function as unknown as PropType<LingyunFileChooseFn | null>,
      default: null,
    },
  },
  data(): {
    items: UploadItem[]
    activeTask: LingyunUploadTask | null
    activeItemId: number
    pumping: boolean
    choosing: boolean
    itemSequence: number
  } {
    return {
      items: [],
      activeTask: null,
      activeItemId: 0,
      pumping: false,
      choosing: false,
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
      return [themeClass, this.disabled ? 'lingyun-file-upload--disabled' : '']
        .filter(Boolean)
        .join(' ')
    },
    resolvedMaxCount(): number {
      return Math.max(1, Math.floor(Number(this.maxCount) || 1))
    },
    acceptList(): string[] {
      return normalizeAccept(this.accept)
    },
    acceptNoDot(): string[] {
      return acceptWithoutDot(this.acceptList)
    },
    acceptWithDot(): string[] {
      return acceptWithDot(this.acceptList)
    },
    remaining(): number {
      return Math.max(0, this.resolvedMaxCount - this.items.length)
    },
    canAdd(): boolean {
      return !this.disabled && !this.readonly && this.remaining > 0
    },
    hasUploader(): boolean {
      return !!(this.uploadFn || this.uploadUrl)
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(value: Array<LingyunUploadedFile | string>) {
        this.applyModel(value)
      },
    },
  },
  beforeUnmount() {
    this.activeTask?.abort?.()
    this.activeTask = null
  },
  methods: {
    toModelFiles(): LingyunUploadedFile[] {
      return this.items
        .filter((item) => item.status === 'success' && item.url)
        .map((item) => ({ url: item.url, name: item.name, size: item.size }))
    },
    applyModel(value: Array<LingyunUploadedFile | string>): void {
      const files = normalizeUploadedFiles(value)
      if (sameFileSequence(files, this.toModelFiles())) return
      this.reconcileModel(files)
    },
    reconcileModel(files: LingyunUploadedFile[]): void {
      const inFlight = this.items.filter((item) => item.status !== 'success')
      const existing = new Map<string, UploadItem>()
      for (const item of this.items) {
        if (item.status === 'success' && item.url) existing.set(item.url, item)
      }
      const next = files.map((file) => {
        const item = existing.get(file.url)
        if (item) {
          item.name = file.name
          item.size = file.size
          return item
        }
        return this.createItem(
          { tempFilePath: file.url, name: file.name, size: file.size },
          file.url,
        )
      })
      this.items = [...next, ...inFlight]
    },
    syncModel(): void {
      const files = this.toModelFiles()
      const current = normalizeUploadedFiles(this.modelValue)
      if (!sameFileSequence(files, current)) {
        this.$emit('update:modelValue', files)
      }
      this.$emit('change', { files, items: this.items })
    },
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
        this.toast(`最多上传 ${this.resolvedMaxCount} 个文件`)
        return
      }
      this.choosing = true

      // #ifdef MP-WEIXIN
      if (this.chooseFn) {
        uni.showActionSheet({
          itemList: ['从聊天选择', '从系统选择'],
          success: (res) => {
            if (res.tapIndex === 1) void this.chooseCustom()
            else this.chooseDefault()
          },
          fail: () => {
            this.choosing = false
          },
        })
        return
      }
      // #endif

      // #ifndef MP-WEIXIN
      if (this.chooseFn) {
        void this.chooseCustom()
        return
      }
      // #endif

      this.chooseDefault()
    },
    chooseDefault(): void {
      const success = (res: ChooseFileResult) => {
        this.choosing = false
        this.handleFiles(this.normalizeFiles(res), this.remaining)
      }
      const fail = () => {
        this.choosing = false
      }

      // #ifdef MP-WEIXIN
      const chooseMessageApi = (
        uni as unknown as {
          chooseMessageFile?: (options: ChooseOptions) => void
        }
      ).chooseMessageFile
      if (typeof chooseMessageApi === 'function') {
        chooseMessageApi({
          count: this.remaining,
          type: 'file',
          ...(this.acceptNoDot.length
            ? { extension: this.acceptNoDot }
            : {}),
          success,
          fail,
        })
      } else {
        this.choosing = false
        this.toast('当前环境不支持选择文件')
      }
      // #endif

      // #ifndef MP-WEIXIN
      const chooseLocalApi = (
        uni as unknown as {
          chooseFile?: (options: ChooseOptions) => void
        }
      ).chooseFile
      if (typeof chooseLocalApi === 'function') {
        chooseLocalApi({
          count: this.remaining,
          type: 'all',
          ...(this.acceptWithDot.length
            ? { extension: this.acceptWithDot }
            : {}),
          success,
          fail,
        })
      } else {
        this.choosing = false
        this.toast('当前环境不支持选择文件')
      }
      // #endif
    },
    async chooseCustom(): Promise<void> {
      const fn = this.chooseFn
      if (!fn) {
        this.choosing = false
        return
      }
      try {
        const files = await fn({
          count: this.remaining,
          accept: this.acceptList,
        })
        this.choosing = false
        this.handleFiles(this.normalizePickedFiles(files), this.remaining)
      } catch (error) {
        this.choosing = false
        this.toast(error instanceof Error ? error.message : '选择文件失败')
      }
    },
    normalizePickedFiles(files: LingyunFilePick[]): SelectedFile[] {
      const list = Array.isArray(files) ? files : []
      return list
        .map((file, index) => {
          const tempFilePath = String(file && file.tempFilePath ? file.tempFilePath : '')
          return {
            tempFilePath,
            name: String(
              (file && file.name) || basename(tempFilePath) || `文件${index + 1}`,
            ),
            size: Number(file && file.size) || 0,
          }
        })
        .filter((file) => file.tempFilePath)
    },
    normalizeFiles(res: ChooseFileResult): SelectedFile[] {
      const files = Array.isArray(res.tempFiles) ? res.tempFiles : []
      if (files.length) {
        return files
          .map((file, index) => {
            const record = file as {
              path?: string
              tempFilePath?: string
              name?: string
              size?: number
            }
            const tempFilePath = String(
              record.path ||
                record.tempFilePath ||
                res.tempFilePaths?.[index] ||
                '',
            )
            return {
              tempFilePath,
              name: String(
                record.name || basename(tempFilePath) || `文件${index + 1}`,
              ),
              size: Number(record.size) || 0,
            }
          })
          .filter((file) => file.tempFilePath)
      }
      return (res.tempFilePaths || []).map((tempFilePath, index) => ({
        tempFilePath,
        name: basename(tempFilePath) || `文件${index + 1}`,
        size: 0,
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
      let typeRejected = 0
      let sizeRejected = 0
      for (const file of selected) {
        const ext = fileExt(file.name)
        if (this.acceptList.length && !this.acceptList.includes(ext)) {
          typeRejected += 1
          this.$emit('invalid', { file, reason: 'type' })
          continue
        }
        if (this.maxSize > 0 && file.size > this.maxSize * 1024 * 1024) {
          sizeRejected += 1
          this.$emit('invalid', { file, reason: 'size' })
          continue
        }
        valid.push(file)
      }
      if (typeRejected || sizeRejected) {
        const messages: string[] = []
        if (typeRejected) {
          messages.push(`仅支持 ${this.acceptList.join('、')} 格式`)
        }
        if (sizeRejected) {
          messages.push(`单个文件不能超过 ${this.maxSize}MB`)
        }
        this.toast(messages.join('；'))
      }
      if (!valid.length) return
      this.$emit('select', {
        files: valid,
        remaining: Math.max(0, remaining - valid.length),
      })
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
          if (!url) throw new Error('上传函数未返回文件地址')
        } else {
          const result = await uploadWithUni({
            url: this.uploadUrl,
            filePath: item.localPath,
            name: this.uploadName,
            header: this.uploadHeader,
            formData: this.uploadFormData,
            parseResponse: this.parseResponse || undefined,
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
      this.items = []
      this.syncModel()
    },
    noteOf(item: UploadItem): string {
      const size = this.showSize ? formatFileSize(item.size) : ''
      const status =
        item.status === 'queued'
          ? '等待上传'
          : item.status === 'uploading'
            ? '上传中'
            : item.status === 'error'
              ? item.error || '上传失败'
              : ''
      const parts = [size, status].filter(Boolean)
      return parts.length ? parts.join(' · ') : ' '
    },
    rowClickable(item: UploadItem): boolean {
      if (item.status === 'error') return true
      return item.status === 'success' && this.preview
    },
    kindClass(name: string): string {
      return `lingyun-file-upload__kind--${fileKind(name)}`
    },
    extLabel(name: string): string {
      return fileExtLabel(name)
    },
    onRowClick(item: UploadItem, index: number): void {
      if (item.status === 'error') {
        this.retryItem(item)
        return
      }
      if (item.status !== 'success' || !this.preview) return
      this.$emit('preview', { item, index })
      this.openFile(item)
    },
    openFile(item: UploadItem): void {
      // #ifdef H5
      if (typeof window !== 'undefined') {
        window.open(item.url, '_blank', 'noopener,noreferrer')
      }
      return
      // #endif
      // #ifndef H5
      this.openDocument(item)
      // #endif
    },
    openDocument(item: UploadItem): void {
      const ext = fileExt(item.name)
      if (!isPreviewable(item.name)) {
        this.toast('微信暂不支持预览该文件')
        this.copyLink(item.url)
        return
      }
      const local =
        item.localPath && !/^https?:/i.test(item.localPath)
          ? item.localPath
          : !/^https?:/i.test(item.url)
            ? item.url
            : ''
      if (local) {
        this.openLocalDocument(local, ext, item.url)
        return
      }
      this.downloadAndOpen(item.url, ext)
    },
    openLocalDocument(filePath: string, ext: string, remoteUrl: string): void {
      uni.openDocument({
        filePath,
        fileType: ext,
        showMenu: true,
        fail: () => {
          if (/^https?:/i.test(remoteUrl)) this.downloadAndOpen(remoteUrl, ext)
          else this.toast('文件打开失败')
        },
      } as unknown as Parameters<typeof uni.openDocument>[0])
    },
    downloadAndOpen(url: string, ext: string): void {
      if (!/^https?:/i.test(url)) {
        this.toast('文件打开失败')
        return
      }
      uni.downloadFile({
        url,
        success: (res) => {
          if (res.statusCode !== 200) {
            this.copyLink(url)
            return
          }
          uni.openDocument({
            filePath: res.tempFilePath,
            fileType: ext,
            showMenu: true,
            fail: () => this.copyLink(url),
          } as unknown as Parameters<typeof uni.openDocument>[0])
        },
        fail: () => this.copyLink(url),
      })
    },
    copyLink(url: string): void {
      if (!url) return
      uni.setClipboardData({
        data: url,
        success: () => this.toast('链接已复制'),
      })
    },
    downloadItem(item: UploadItem, index: number): void {
      this.$emit('download', { item, index })
      // #ifdef H5
      this.downloadH5(item)
      return
      // #endif
      // #ifndef H5
      const ext = fileExt(item.name)
      if (!isPreviewable(item.name)) {
        this.copyLink(item.url)
        this.toast('微信暂不支持预览该文件')
        return
      }
      const local =
        item.localPath && !/^https?:/i.test(item.localPath)
          ? item.localPath
          : !/^https?:/i.test(item.url)
            ? item.url
            : ''
      if (local) {
        this.openLocalDocument(local, ext, item.url)
        return
      }
      this.downloadAndOpen(item.url, ext)
      // #endif
    },
    downloadH5(item: UploadItem): void {
      // #ifdef H5
      if (typeof document === 'undefined') return
      const anchor = document.createElement('a')
      anchor.href = item.url
      anchor.download = item.name || basename(item.url) || 'file'
      anchor.rel = 'noopener'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      // #endif
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-file-upload {
  width: 100%;
  box-sizing: border-box;
}

.lingyun-file-upload--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.lingyun-file-upload__kind {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  overflow: hidden;
  border-radius: 7px;
  box-sizing: border-box;
  background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}

.lingyun-file-upload__ext {
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0;
}

.lingyun-file-upload__kind--pdf {
  color: var(--lingyun-error, #ff383c);
  background-color: var(--lingyun-error-soft, rgba(255, 56, 60, 0.12));
}

.lingyun-file-upload__kind--word {
  color: var(--lingyun-primary, #0088ff);
  background-color: var(--lingyun-primary-soft, rgba(0, 136, 255, 0.12));
}

.lingyun-file-upload__kind--excel {
  color: var(--lingyun-success, #34c759);
  background-color: rgba(52, 199, 89, 0.12);
}

.lingyun-file-upload__kind--ppt {
  color: var(--lingyun-warning, #ff8d28);
  background-color: rgba(255, 141, 40, 0.12);
}

.lingyun-file-upload__kind--archive {
  color: var(--lingyun-system-indigo, #6155f5);
  background-color: rgba(97, 85, 245, 0.12);
}

.lingyun-file-upload__kind--other {
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
  background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
}

.lingyun-file-upload__kind--add {
  color: var(--lingyun-primary, #0088ff);
  background-color: var(--lingyun-primary-soft, rgba(0, 136, 255, 0.12));
}

.lingyun-file-upload__actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  height: 100%;
}

.lingyun-file-upload__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.lingyun-file-upload__progress {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  width: 100px;
}

.lingyun-file-upload__progress-bar {
  flex: 1;
  min-width: 0;
}

.lingyun-file-upload__percent {
  flex-shrink: 0;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}

.lingyun-file-upload__count {
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}
</style>
