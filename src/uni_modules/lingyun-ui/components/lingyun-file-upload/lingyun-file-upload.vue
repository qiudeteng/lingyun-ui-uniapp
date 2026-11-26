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

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import {
  isAbortError,
  uploadWithUni,
  type LingyunUploadFn,
  type LingyunUploadTask,
} from '../../utils/upload'
import {
  acceptWithDot as acceptWithDotUtil,
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
defineOptions({
  name: 'LingyunFileUpload',
})

const props = defineProps({
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
})

const emit = defineEmits([
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
])

const items = ref<UploadItem[]>([])
const activeTask = ref<LingyunUploadTask | null>(null)
const activeItemId = ref(0)
const pumping = ref(false)
const choosing = ref(false)
const itemSequence = ref(0)

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* pinia 未就绪 */
  }
  return [themeClass, props.disabled ? 'lingyun-file-upload--disabled' : '']
    .filter(Boolean)
    .join(' ')
})

const resolvedMaxCount = computed((): number => {
  return Math.max(1, Math.floor(Number(props.maxCount) || 1))
})

const acceptList = computed((): string[] => {
  return normalizeAccept(props.accept)
})

const acceptNoDot = computed((): string[] => {
  return acceptWithoutDot(acceptList.value)
})

const acceptWithDot = computed((): string[] => {
  return acceptWithDotUtil(acceptList.value)
})

const remaining = computed((): number => {
  return Math.max(0, resolvedMaxCount.value - items.value.length)
})

const canAdd = computed((): boolean => {
  return !props.disabled && !props.readonly && remaining.value > 0
})

const hasUploader = computed((): boolean => {
  return !!(props.uploadFn || props.uploadUrl)
})

function createItem(file: SelectedFile, url = ''): UploadItem {
  itemSequence.value += 1
  return {
    id: itemSequence.value,
    url,
    localPath: url ? '' : file.tempFilePath,
    name: file.name,
    size: file.size,
    status: url ? 'success' : 'queued',
    progress: url ? 100 : 0,
    error: '',
    response: null,
  }
}

function toModelFiles(): LingyunUploadedFile[] {
  return items.value
    .filter((item) => item.status === 'success' && item.url)
    .map((item) => ({ url: item.url, name: item.name, size: item.size }))
}

function reconcileModel(files: LingyunUploadedFile[]): void {
  const inFlight = items.value.filter((item) => item.status !== 'success')
  const existing = new Map<string, UploadItem>()
  for (const item of items.value) {
    if (item.status === 'success' && item.url) existing.set(item.url, item)
  }
  const next = files.map((file) => {
    const item = existing.get(file.url)
    if (item) {
      item.name = file.name
      item.size = file.size
      return item
    }
    return createItem(
      { tempFilePath: file.url, name: file.name, size: file.size },
      file.url,
    )
  })
  items.value = [...next, ...inFlight]
}

function applyModel(value: Array<LingyunUploadedFile | string>): void {
  const files = normalizeUploadedFiles(value)
  if (sameFileSequence(files, toModelFiles())) return
  reconcileModel(files)
}

function syncModel(): void {
  const files = toModelFiles()
  const current = normalizeUploadedFiles(props.modelValue)
  if (!sameFileSequence(files, current)) {
    emit('update:modelValue', files)
  }
  emit('change', { files, items: items.value })
}

function toast(title: string): void {
  uni.showToast({ title, icon: 'none' })
}

function normalizePickedFiles(files: LingyunFilePick[]): SelectedFile[] {
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
}

function normalizeFiles(res: ChooseFileResult): SelectedFile[] {
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
}

async function uploadItem(item: UploadItem): Promise<void> {
  if (!hasUploader.value) {
    item.status = 'error'
    item.error = '未配置上传地址或 uploadFn'
    emit('upload-error', item, new Error(item.error))
    toast(item.error)
    return
  }

  item.status = 'uploading'
  item.progress = 0
  item.error = ''
  emit('upload-start', item)

  try {
    let url = ''
    let response: unknown = null
    if (props.uploadFn) {
      const result = await props.uploadFn({
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
        url: props.uploadUrl,
        filePath: item.localPath,
        name: props.uploadName,
        header: props.uploadHeader,
        formData: props.uploadFormData,
        parseResponse: props.parseResponse || undefined,
        onProgress: (progress) => {
          item.progress = Math.max(0, Math.min(100, Math.round(progress)))
        },
        onTask: (task) => {
          activeTask.value = task
          activeItemId.value = item.id
        },
      })
      url = result.url
      response = result.raw
    }

    if (!items.value.some((entry) => entry.id === item.id)) return
    item.url = url
    item.status = 'success'
    item.progress = 100
    item.response = response
    emit('upload-success', item, response)
    syncModel()
  } catch (error) {
    if (isAbortError(error)) return
    if (!items.value.some((entry) => entry.id === item.id)) return
    item.status = 'error'
    item.error = error instanceof Error ? error.message : '上传失败'
    emit('upload-error', item, error)
  } finally {
    activeTask.value = null
    activeItemId.value = 0
  }
}

function pumpUploads(): void {
  if (pumping.value || activeTask.value) return
  const next = items.value.find((item) => item.status === 'queued')
  if (!next) return
  pumping.value = true
  void uploadItem(next).finally(() => {
    pumping.value = false
    pumpUploads()
  })
}

function handleFiles(files: SelectedFile[], remainingCount: number): void {
  if (!files.length) return
  if (files.length > remainingCount) {
    emit('exceed', {
      maxCount: resolvedMaxCount.value,
      selected: files.length,
    })
  }
  const selected = files.slice(0, remainingCount)
  const valid: SelectedFile[] = []
  let typeRejected = 0
  let sizeRejected = 0
  for (const file of selected) {
    const ext = fileExt(file.name)
    if (acceptList.value.length && !acceptList.value.includes(ext)) {
      typeRejected += 1
      emit('invalid', { file, reason: 'type' })
      continue
    }
    if (props.maxSize > 0 && file.size > props.maxSize * 1024 * 1024) {
      sizeRejected += 1
      emit('invalid', { file, reason: 'size' })
      continue
    }
    valid.push(file)
  }
  if (typeRejected || sizeRejected) {
    const messages: string[] = []
    if (typeRejected) {
      messages.push(`仅支持 ${acceptList.value.join('、')} 格式`)
    }
    if (sizeRejected) {
      messages.push(`单个文件不能超过 ${props.maxSize}MB`)
    }
    toast(messages.join('；'))
  }
  if (!valid.length) return
  emit('select', {
    files: valid,
    remaining: Math.max(0, remainingCount - valid.length),
  })
  for (const file of valid) {
    items.value.push(createItem(file))
  }
  nextTick(() => pumpUploads())
}

function chooseDefault(): void {
  const success = (res: ChooseFileResult) => {
    choosing.value = false
    handleFiles(normalizeFiles(res), remaining.value)
  }
  const fail = () => {
    choosing.value = false
  }

  // #ifdef MP-WEIXIN
  const chooseMessageApi = (
    uni as unknown as {
      chooseMessageFile?: (options: ChooseOptions) => void
    }
  ).chooseMessageFile
  if (typeof chooseMessageApi === 'function') {
    chooseMessageApi({
      count: remaining.value,
      type: 'file',
      ...(acceptNoDot.value.length
        ? { extension: acceptNoDot.value }
        : {}),
      success,
      fail,
    })
  } else {
    choosing.value = false
    toast('当前环境不支持选择文件')
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
      count: remaining.value,
      type: 'all',
      ...(acceptWithDot.value.length
        ? { extension: acceptWithDot.value }
        : {}),
      success,
      fail,
    })
  } else {
    choosing.value = false
    toast('当前环境不支持选择文件')
  }
  // #endif
}

async function chooseCustom(): Promise<void> {
  const fn = props.chooseFn
  if (!fn) {
    choosing.value = false
    return
  }
  try {
    const files = await fn({
      count: remaining.value,
      accept: acceptList.value,
    })
    choosing.value = false
    handleFiles(normalizePickedFiles(files), remaining.value)
  } catch (error) {
    choosing.value = false
    toast(error instanceof Error ? error.message : '选择文件失败')
  }
}

function choose(): void {
  if (props.disabled || props.readonly || choosing.value) return
  if (!hasUploader.value) {
    toast('请先配置上传地址或 uploadFn')
    return
  }
  if (remaining.value <= 0) {
    emit('exceed', {
      maxCount: resolvedMaxCount.value,
      selected: 0,
    })
    toast(`最多上传 ${resolvedMaxCount.value} 个文件`)
    return
  }
  choosing.value = true

  // #ifdef MP-WEIXIN
  if (props.chooseFn) {
    uni.showActionSheet({
      itemList: ['从聊天选择', '从系统选择'],
      success: (res) => {
        if (res.tapIndex === 1) void chooseCustom()
        else chooseDefault()
      },
      fail: () => {
        choosing.value = false
      },
    })
    return
  }
  // #endif

  // #ifndef MP-WEIXIN
  if (props.chooseFn) {
    void chooseCustom()
    return
  }
  // #endif

  chooseDefault()
}

function removeItem(index: number): void {
  if (props.disabled || props.readonly) return
  const item = items.value[index]
  if (!item) return
  if (item.status === 'uploading' && activeItemId.value === item.id) {
    activeTask.value?.abort?.()
    activeTask.value = null
    activeItemId.value = 0
  }
  items.value.splice(index, 1)
  emit('remove', { item, index })
  syncModel()
}

function retryItem(item: UploadItem): void {
  if (item.status !== 'error') return
  item.status = 'queued'
  item.progress = 0
  item.error = ''
  emit('retry', item)
  pumpUploads()
}

function retryAll(): void {
  for (const item of items.value) {
    if (item.status === 'error') {
      item.status = 'queued'
      item.progress = 0
      item.error = ''
    }
  }
  pumpUploads()
}

function clear(): void {
  activeTask.value?.abort?.()
  activeTask.value = null
  activeItemId.value = 0
  items.value = []
  syncModel()
}

function noteOf(item: UploadItem): string {
  const size = props.showSize ? formatFileSize(item.size) : ''
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
}

function rowClickable(item: UploadItem): boolean {
  if (item.status === 'error') return true
  return item.status === 'success' && props.preview
}

function kindClass(name: string): string {
  return `lingyun-file-upload__kind--${fileKind(name)}`
}

function extLabel(name: string): string {
  return fileExtLabel(name)
}

function openLocalDocument(filePath: string, ext: string, remoteUrl: string): void {
  uni.openDocument({
    filePath,
    fileType: ext,
    showMenu: true,
    fail: () => {
      if (/^https?:/i.test(remoteUrl)) downloadAndOpen(remoteUrl, ext)
      else toast('文件打开失败')
    },
  } as unknown as Parameters<typeof uni.openDocument>[0])
}

function downloadAndOpen(url: string, ext: string): void {
  if (!/^https?:/i.test(url)) {
    toast('文件打开失败')
    return
  }
  uni.downloadFile({
    url,
    success: (res) => {
      if (res.statusCode !== 200) {
        copyLink(url)
        return
      }
      uni.openDocument({
        filePath: res.tempFilePath,
        fileType: ext,
        showMenu: true,
        fail: () => copyLink(url),
      } as unknown as Parameters<typeof uni.openDocument>[0])
    },
    fail: () => copyLink(url),
  })
}

function copyLink(url: string): void {
  if (!url) return
  uni.setClipboardData({
    data: url,
    success: () => toast('链接已复制'),
  })
}

function openDocument(item: UploadItem): void {
  const ext = fileExt(item.name)
  if (!isPreviewable(item.name)) {
    toast('微信暂不支持预览该文件')
    copyLink(item.url)
    return
  }
  const local =
    item.localPath && !/^https?:/i.test(item.localPath)
      ? item.localPath
      : !/^https?:/i.test(item.url)
        ? item.url
        : ''
  if (local) {
    openLocalDocument(local, ext, item.url)
    return
  }
  downloadAndOpen(item.url, ext)
}

function openFile(item: UploadItem): void {
  // #ifdef H5
  if (typeof window !== 'undefined') {
    window.open(item.url, '_blank', 'noopener,noreferrer')
  }
  return
  // #endif
  // #ifndef H5
  openDocument(item)
  // #endif
}

function downloadH5(item: UploadItem): void {
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
}

function downloadItem(item: UploadItem, index: number): void {
  emit('download', { item, index })
  // #ifdef H5
  downloadH5(item)
  return
  // #endif
  // #ifndef H5
  const ext = fileExt(item.name)
  if (!isPreviewable(item.name)) {
    copyLink(item.url)
    toast('微信暂不支持预览该文件')
    return
  }
  const local =
    item.localPath && !/^https?:/i.test(item.localPath)
      ? item.localPath
      : !/^https?:/i.test(item.url)
        ? item.url
        : ''
  if (local) {
    openLocalDocument(local, ext, item.url)
    return
  }
  downloadAndOpen(item.url, ext)
  // #endif
}

function onRowClick(item: UploadItem, index: number): void {
  if (item.status === 'error') {
    retryItem(item)
    return
  }
  if (item.status !== 'success' || !props.preview) return
  emit('preview', { item, index })
  openFile(item)
}

watch(
  () => props.modelValue,
  (value: Array<LingyunUploadedFile | string>) => {
    applyModel(value)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  activeTask.value?.abort?.()
  activeTask.value = null
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
