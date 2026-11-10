<template>
  <lingyun-app-page title="Image Upload">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Image Upload</lingyun-text>
        <lingyun-text type="subtitle" block>
          direct 直接上传 · edit 旋转裁剪后上传
        </lingyun-text>
      </view>

      <lingyun-section title="直接上传（最多 9 张）" hint="mode=direct">
        <lingyun-image-upload
          ref="directRef"
          v-model="directUrls"
          mode="direct"
          :max-count="9"
          :upload-fn="mockUpload"
          tip="选图后立即上传；支持相册与拍照"
          @select="onSelect"
          @upload-start="onUploadStart"
          @upload-success="onUploadSuccess"
          @upload-error="onUploadError"
          @exceed="onExceed"
        />
        <view class="result">
          <lingyun-text type="caption" color="secondary">
            已上传 {{ directUrls.length }} 张
          </lingyun-text>
          <lingyun-button
            v-if="directUrls.length"
            variant="glass"
            size="medium"
            text="清空"
            @click="directRef?.clear()"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="编辑后上传 · 固定 1:1" hint="mode=edit · cropAspect=1">
        <lingyun-image-upload
          v-model="squareUrls"
          mode="edit"
          :max-count="3"
          :crop-aspect="1"
          :upload-fn="mockUpload"
          tip="选图后旋转、裁剪为 1:1 再上传"
          @crop-open="onCropOpen"
          @crop-confirm="onCropConfirm"
        />
      </lingyun-section>

      <lingyun-section title="编辑后上传 · 自由裁剪" hint="mode=edit · cropAspect='free'">
        <lingyun-image-upload
          v-model="freeUrls"
          mode="edit"
          :max-count="3"
          crop-aspect="free"
          :upload-fn="mockUpload"
          tip="拖动裁剪框或四角手柄调整范围"
        />
      </lingyun-section>

      <lingyun-section title="只读 / 禁用" hint="readonly · disabled">
        <lingyun-image-upload :model-value="readonlyUrls" readonly :max-count="3" />
        <view class="spacer" />
        <lingyun-image-upload :model-value="readonlyUrls" disabled :max-count="3" />
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

/** Lorem Picsum：按 seed 固定同一张，免本地静态资源。 */
function picsum(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`
}

const directUrls = ref<string[]>([])
const directRef = ref<{ clear: () => void } | null>(null)
const squareUrls = ref<string[]>([])
const freeUrls = ref<string[]>([])
const readonlyUrls = ref<string[]>([
  picsum('lingyun-upload-a', 400, 400),
  picsum('lingyun-upload-b', 400, 400),
])
const lastAction = ref('')

function mockUpload(file: { tempFilePath: string }): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(file.tempFilePath), 650)
  })
}

function onSelect(payload: { files: Array<{ name: string }>; remaining: number }) {
  lastAction.value = `选择 ${payload.files.length} 张，还可选 ${payload.remaining} 张`
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

function onExceed(payload: { maxCount: number; selected: number }) {
  lastAction.value = `超出上限 ${payload.maxCount} 张（本次 ${payload.selected} 张）`
}

function onCropOpen(payload: { index: number; total: number }) {
  lastAction.value = `编辑第 ${payload.index + 1}/${payload.total} 张`
}

function onCropConfirm(payload: { result?: { filePath: string } }) {
  lastAction.value = payload.result ? '裁剪完成，开始上传' : '取消编辑'
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
</style>
