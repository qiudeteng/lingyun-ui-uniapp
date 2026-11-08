<template>
  <lingyun-app-page title="System File">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>System File</lingyun-text>
        <lingyun-text type="subtitle" block>
          微信端 web-view + H5 选择系统文件
        </lingyun-text>
      </view>

      <lingyun-section title="文件上传 · 选择系统文件" hint="chooseFn">
        <lingyun-file-upload
          v-model="files"
          :max-count="3"
          :max-size="2"
          :upload-fn="mockUpload"
          :choose-fn="chooseSystemFile"
          :preview="false"
          :show-download="false"
          tip="点「添加文件」后可选择聊天文件或系统文件"
        />
      </lingyun-section>

      <lingyun-section title="说明" is-last>
        <lingyun-text type="body" block>
          微信小程序原生没有系统文件选择器。这里用 web-view 打开 H5 页面，
          H5 的 input[type=file] 调起系统文件选择器，再通过 postMessage 把文件信息返回小程序。
        </lingyun-text>
        <lingyun-text type="caption" color="secondary" block class="hint">
          开发者工具需勾选「不校验合法域名、web-view（业务域名）」；
          真机需把 H5 部署到 HTTPS 业务域名，并替换 web-view 地址。
        </lingyun-text>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type {
  LingyunFilePick,
  LingyunUploadedFile,
} from '@/uni_modules/lingyun-ui/components/lingyun-file-upload/file'

const files = ref<LingyunUploadedFile[]>([])
let pendingResolve: ((files: LingyunFilePick[]) => void) | null = null

function mockUpload(file: { tempFilePath: string }): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(file.tempFilePath), 500)
  })
}

function chooseSystemFile(options: {
  count: number
  accept: string[]
}): Promise<LingyunFilePick[]> {
  // #ifdef H5
  return new Promise((resolve) => {
    uni.chooseFile({
      count: options.count,
      type: 'all',
      success: (res) => {
        const tempFiles = res.tempFiles
        const rawFiles = Array.isArray(tempFiles)
          ? tempFiles
          : tempFiles
            ? [tempFiles]
            : []
        const list = rawFiles.map((file, index) => {
          const record = file as {
            path?: string
            name?: string
            size?: number
          }
          return {
            tempFilePath: String(
              record.path || res.tempFilePaths?.[index] || '',
            ),
            name: String(record.name || `文件${index + 1}`),
            size: Number(record.size) || 0,
          }
        })
        resolve(list.filter((file) => file.tempFilePath))
      },
      fail: () => resolve([]),
    })
  })
  // #endif
  // #ifndef H5
  return new Promise((resolve) => {
    pendingResolve = resolve
    uni.navigateTo({ url: '/pages/demo/file-picker-webview' })
  })
  // #endif
}

onShow(() => {
  if (!pendingResolve) return
  const payload = uni.getStorageSync('lingyun-system-file-pick')
  if (payload && typeof payload === 'object') {
    uni.removeStorageSync('lingyun-system-file-pick')
    const record = payload as {
      name?: string
      size?: number
      dataUrl?: string
    }
    const file: LingyunFilePick = {
      tempFilePath: String(record.dataUrl || ''),
      name: String(record.name || '系统文件'),
      size: Number(record.size) || 0,
    }
    pendingResolve(file.tempFilePath ? [file] : [])
  } else {
    pendingResolve([])
  }
  pendingResolve = null
})
</script>

<style lang="scss">
.page {
  box-sizing: border-box;
  padding-bottom: 40px;
  min-height: 100%;
  background:
    radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
    radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
    radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
    var(--lingyun-bg-grouped-primary, #f2f2f7);
}

.hero {
  padding: 24px 20px 8px;
}

.hint {
  margin-top: 10px;
}
</style>
