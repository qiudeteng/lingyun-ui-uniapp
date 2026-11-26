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

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { type PropType } from 'vue'
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
defineOptions({
  name: 'LingyunImageUpload',
})

const props = defineProps({
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
})

const emit = defineEmits([
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
])

const items = ref<UploadItem[]>([])
const activeTask = ref<LingyunUploadTask | null>(null)
const activeItemId = ref(0)
const pumping = ref(false)
const choosing = ref(false)
const editorVisible = ref(false)
const editorQueue = ref<SelectedFile[]>([])
const editorIndex = ref(0)
const editorWidth = ref(0)
const editorHeight = ref(0)
const editorKey = ref(0)
const itemSequence = ref(0)

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* pinia 未就绪 */
  }
  return [
    themeClass,
    props.disabled ? 'lingyun-image-upload--disabled' : '',
    props.readonly ? 'lingyun-image-upload--readonly' : '',
  ]
    .filter(Boolean)
    .join(' ')
})
const resolvedMaxCount = computed((): number => {
  return Math.max(1, Math.floor(Number(props.maxCount) || 1))
})
const gridColumns = computed((): number => {
  return Math.max(1, Math.min(6, Math.floor(Number(props.columns) || 3)))
})
const pendingEditorCount = computed((): number => {
  if (!editorQueue.value.length) return 0
  return Math.max(0, editorQueue.value.length - editorIndex.value)
})
const remaining = computed((): number => {
  return Math.max(
    0,
    resolvedMaxCount.value - items.value.length - pendingEditorCount.value,
  )
})
const canAdd = computed((): boolean => {
  return !props.disabled && !props.readonly && remaining.value > 0
})
const cellStyle = computed((): Record<string, string> => {
  const size = Number(props.tileSize) || 0
  if (size > 0) return { width: `${size}px` }
  const gap = 8
  return {
    width: `calc((100% - ${gap * (gridColumns.value - 1)}px) / ${gridColumns.value})`,
  }
})
const radiusStyle = computed((): Record<string, string> => {
  const preset =
    typeof props.radius === 'number'
      ? props.radius
      : RADIUS_PRESET[String(props.radius)]
  const value = Number.isFinite(preset) ? Number(preset) : RADIUS_PRESET.md
  return { borderRadius: `${value}px` }
})
const successUrls = computed((): string[] => {
  return items.value
    .filter((item) => item.status === 'success' && item.url)
    .map((item) => item.url)
})
const editorFile = computed((): SelectedFile | null => {
  return editorQueue.value[editorIndex.value] || null
})
const editorAspect = computed((): number | null => {
  return parseCropAspect(props.cropAspect)
})
const hasUploader = computed((): boolean => {
  return !!(props.uploadFn || props.uploadUrl)
})

function toast(title: string): void {
  uni.showToast({ title, icon: 'none' })
}

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

function normalizeFiles(res: ChooseImageResult): SelectedFile[] {
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
}

function syncModel(): void {
  const urls = items.value
    .filter((item) => item.status === 'success' && item.url)
    .map((item) => item.url)
  const current = Array.isArray(props.modelValue) ? props.modelValue : []
  if (!sameUrls(urls, current)) {
    emit('update:modelValue', urls)
  }
  emit('change', { urls, items: items.value })
}

function reconcileModel(urls: string[]): void {
  const unique = Array.from(new Set(urls.filter(Boolean)))
  const inFlight = items.value.filter((item) => item.status !== 'success')
  const existing = new Map<string, UploadItem>()
  for (const item of items.value) {
    if (item.status === 'success' && item.url) existing.set(item.url, item)
  }
  const next = unique.map(
    (url) =>
      existing.get(url) ||
      createItem({ tempFilePath: url, size: 0, name: 'image' }, url),
  )
  const kept = new Set(next)
  for (const item of items.value) {
    if (item.status === 'success' && !kept.has(item)) item.revoke?.()
  }
  items.value = [...next, ...inFlight]
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
      if (!url) throw new Error('上传函数未返回图片地址')
    } else {
      const result = await uploadWithUni({
        url: props.uploadUrl,
        filePath: item.localPath,
        name: props.uploadName,
        header: props.uploadHeader,
        formData: props.uploadFormData,
        parseResponse: props.parseResponse || undefined,
        missingUrlMessage: '上传响应缺少图片地址',
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
    if (item.revoke && item.localPath !== url) {
      item.revoke()
      item.revoke = undefined
      item.localPath = ''
    }
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

function closeEditorQueue(): void {
  editorVisible.value = false
  editorQueue.value = []
  editorIndex.value = 0
  editorWidth.value = 0
  editorHeight.value = 0
}

function skipEditorFile(): void {
  editorIndex.value += 1
  if (editorIndex.value < editorQueue.value.length) prepareEditor()
  else closeEditorQueue()
}

function prepareEditor(): void {
  const file = editorFile.value
  if (!file) {
    closeEditorQueue()
    return
  }
  editorVisible.value = false
  ;(
    uni as typeof uni & {
      getImageInfo: (options: Record<string, unknown>) => void
    }
  ).getImageInfo({
    src: file.tempFilePath,
    success: (info: { width?: number; height?: number }) => {
      if (!editorQueue.value.length) return
      const width = Number(info.width) || 0
      const height = Number(info.height) || 0
      if (!width || !height) {
        toast('图片尺寸读取失败')
        skipEditorFile()
        return
      }
      editorWidth.value = width
      editorHeight.value = height
      editorKey.value += 1
      editorVisible.value = true
      emit('crop-open', {
        file,
        index: editorIndex.value,
        total: editorQueue.value.length,
      })
    },
    fail: () => {
      toast('图片读取失败')
      skipEditorFile()
    },
  })
}

function handleFiles(files: SelectedFile[], remaining: number): void {
  if (!files.length) return
  if (files.length > remaining) {
    emit('exceed', {
      maxCount: resolvedMaxCount.value,
      selected: files.length,
    })
  }
  const selected = files.slice(0, remaining)
  const valid: SelectedFile[] = []
  let rejected = 0
  for (const file of selected) {
    if (props.maxSize > 0 && file.size > props.maxSize * 1024 * 1024) {
      rejected += 1
      continue
    }
    valid.push(file)
  }
  if (rejected > 0) {
    toast(`单张图片不能超过 ${props.maxSize}MB`)
  }
  if (!valid.length) return
  emit('select', {
    files: valid,
    remaining: Math.max(0, remaining - valid.length),
  })
  if (props.mode === 'edit') {
    editorQueue.value = valid
    editorIndex.value = 0
    prepareEditor()
    return
  }
  for (const file of valid) {
    items.value.push(createItem(file))
  }
  nextTick(() => pumpUploads())
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
  item.revoke?.()
  emit('remove', { item, index })
  syncModel()
}

function clear(): void {
  activeTask.value?.abort?.()
  activeTask.value = null
  activeItemId.value = 0
  items.value.forEach((item) => item.revoke?.())
  items.value = []
  syncModel()
}

function onItemClick(item: UploadItem, index: number): void {
  if (item.status === 'error') {
    retryItem(item)
    return
  }
  if (item.status !== 'success' || !props.preview) return
  emit('preview', { item, index })
  if (successUrls.value.length) {
    uni.previewImage({
      urls: successUrls.value,
      current: item.url,
    })
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
    toast(`最多上传 ${resolvedMaxCount.value} 张`)
    return
  }
  choosing.value = true
  ;(
    uni as typeof uni & {
      chooseImage: (options: Record<string, unknown>) => void
    }
  ).chooseImage({
    count: remaining.value,
    sizeType: props.sizeType,
    sourceType: props.sourceType,
    success: (res: ChooseImageResult) => {
      choosing.value = false
      handleFiles(normalizeFiles(res), remaining.value)
    },
    fail: () => {
      choosing.value = false
    },
  })
}

function onEditorConfirm(result: ExportResult): void {
  const file = editorFile.value
  editorVisible.value = false
  emit('crop-confirm', { file, result })
  if (file) {
    const item = createItem({
      tempFilePath: result.filePath,
      size: file.size,
      name: file.name,
    })
    item.revoke = result.revoke
    items.value.push(item)
    nextTick(() => pumpUploads())
  }
  editorIndex.value += 1
  if (editorIndex.value < editorQueue.value.length) prepareEditor()
  else closeEditorQueue()
}

function onEditorCancel(): void {
  const file = editorFile.value
  editorVisible.value = false
  const remainingCount = Math.max(
    0,
    editorQueue.value.length - editorIndex.value - 1,
  )
  emit('crop-cancel', { file, remaining: remainingCount })
  if (remainingCount <= 0) {
    closeEditorQueue()
    return
  }
  uni.showModal({
    title: '放弃剩余图片？',
    content: `还有 ${remainingCount} 张图片未编辑`,
    confirmText: '放弃',
    cancelText: '继续编辑',
    success: (res: { confirm?: boolean }) => {
      if (res.confirm) closeEditorQueue()
      else prepareEditor()
    },
    fail: () => prepareEditor(),
  })
}

watch(
  () => props.modelValue,
  (value: string[]) => {
    const urls = Array.isArray(value) ? value.filter(Boolean) : []
    const current = items.value
      .filter((item) => item.status === 'success' && item.url)
      .map((item) => item.url)
    if (sameUrls(urls, current)) return
    reconcileModel(urls)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  activeTask.value?.abort?.()
  activeTask.value = null
  items.value.forEach((item) => item.revoke?.())
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