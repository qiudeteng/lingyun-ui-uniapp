<template>
  <lingyun-app-page title="File Upload">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>File Upload</lingyun-text>
        <lingyun-text type="subtitle" block>
          列表行 · 进度 / 重试 / 预览 / 下载
        </lingyun-text>
      </view>

      <lingyun-section title="基础文件上传" hint="maxCount=5 · maxSize=20MB">
        <template #extra>
          <lingyun-button
            v-if="basicFiles.length"
            variant="borderless"
            size="small"
            text="清空"
            @click="basicRef?.clear()"
          />
        </template>
        <lingyun-file-upload
          ref="basicRef"
          v-model="basicFiles"
          :max-count="5"
          :max-size="20"
          :upload-fn="mockUpload"
          tip="最多 5 个文件，单个不超过 20MB"
          @select="onSelect"
          @invalid="onInvalid"
          @upload-start="onUploadStart"
          @upload-success="onUploadSuccess"
          @upload-error="onUploadError"
          @download="onDownload"
        />
        <view class="result">
          <lingyun-text type="caption" color="secondary">
            已上传 {{ basicFiles.length }} 个
          </lingyun-text>
        </view>
        <lingyun-text type="caption" color="secondary" block class="hint">
          微信端默认从聊天文件选择；系统文件需传入 choose-fn（见文档）。
        </lingyun-text>
      </lingyun-section>

      <lingyun-section title="限制文件类型" hint="accept=pdf,doc,docx,xls,xlsx,zip">
        <lingyun-file-upload
          v-model="acceptFiles"
          accept="pdf,doc,docx,xls,xlsx,zip"
          :max-count="3"
          :max-size="10"
          :upload-fn="mockUpload"
          tip="仅支持 PDF / Word / Excel / ZIP，单个不超过 10MB"
          @invalid="onInvalid"
        />
      </lingyun-section>

      <lingyun-section title="只读 / 禁用" hint="readonly · disabled · string[]">
        <lingyun-file-upload :model-value="readonlyFiles" readonly />
        <view class="spacer" />
        <lingyun-file-upload :model-value="readonlyFiles" disabled />
        <view class="spacer" />
        <lingyun-file-upload :model-value="stringUrls" readonly />
        <lingyun-text type="caption" color="secondary" block class="hint">
          示例 URL 指向公开 PDF，仅用于展示文件行；实际上传后的本地文件可正常预览。
          `string[]` 输入会从 URL 推断文件名。
        </lingyun-text>
      </lingyun-section>

      <lingyun-section
        v-if="lastAction"
        title="最近操作"
        :hint="lastAction"
        is-last
      />
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LingyunUploadedFile } from '@/uni_modules/lingyun-ui/components/lingyun-file-upload/file'

const basicFiles = ref<LingyunUploadedFile[]>([])
const acceptFiles = ref<LingyunUploadedFile[]>([])
const basicRef = ref<{ clear: () => void } | null>(null)
const lastAction = ref('')

const samplePdf =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
const readonlyFiles = ref<LingyunUploadedFile[]>([
  { url: `${samplePdf}?file=1`, name: '采购合同.pdf', size: 13264 },
  { url: `${samplePdf}?file=2`, name: '门店报价单.xlsx', size: 84213 },
  { url: `${samplePdf}?file=3`, name: '开业物料.zip', size: 1048576 },
])
const stringUrls = [`${samplePdf}?string=1`]

function mockUpload(file: { tempFilePath: string; name: string }): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(file.tempFilePath), 700)
  })
}

function onSelect(payload: {
  files: Array<{ name: string }>
  remaining: number
}) {
  lastAction.value = `选择 ${payload.files.length} 个，还可选 ${payload.remaining} 个`
}

function onInvalid(payload: { file: { name: string }; reason: 'type' | 'size' }) {
  lastAction.value =
    payload.reason === 'type'
      ? `格式不支持：${payload.file.name}`
      : `文件过大：${payload.file.name}`
}

function onUploadStart(item: { name: string }) {
  lastAction.value = `开始上传：${item.name}`
}

function onUploadSuccess(item: { name: string }) {
  lastAction.value = `上传完成：${item.name}`
}

function onUploadError(item: { name: string; error?: string }) {
  lastAction.value = `上传失败：${item.error || item.name}`
}

function onDownload(payload: { item: { name: string } }) {
  lastAction.value = `下载：${payload.item.name}`
}
</script>

<style lang="scss">
.page {
  box-sizing: border-box;
  padding-bottom: 40px;
  min-height: 100%;
  background: var(--lingyun-bg-grouped-primary, #f2f2f7);
}

.hero {
  padding: 24px 20px 8px;
}

.result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.spacer {
  height: 20px;
}

.hint {
  margin-top: 12px;
}
</style>
