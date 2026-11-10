<template>
  <lingyun-app-page title="QR Code">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>QR Code</lingyun-text>
        <lingyun-text type="subtitle" block>
          二维码 · 前端生成 · 颜色 / 纠错级别 / 图片导出
        </lingyun-text>
      </view>

      <lingyun-section title="基础二维码" hint="value · size=180">
        <view class="qr-row">
          <lingyun-qrcode
            ref="qrRef"
            :value="orderUrl"
            @ready="onReady"
            @error="onQrError"
          />
          <view class="qr-info">
            <lingyun-text type="caption" color="secondary" block>
              取货码二维码
            </lingyun-text>
            <lingyun-text type="caption" color="tertiary" block class="qr-url">
              {{ orderUrl }}
            </lingyun-text>
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="自定义颜色 · 高纠错" hint="size=220 · ecc=H">
        <view class="qr-row">
          <lingyun-qrcode
            :value="promoText"
            :size="220"
            ecc="H"
            foreground-color="#0a3d62"
            background-color="#f7fbff"
            @ready="onReady"
            @error="onQrError"
          />
          <view class="qr-info">
            <lingyun-text type="caption" color="secondary" block>
              活动核销码
            </lingyun-text>
            <lingyun-text type="caption" color="tertiary" block>
              {{ promoText }}
            </lingyun-text>
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="动态内容" hint="v-model · 实时重绘">
        <lingyun-text-field
          v-model="content"
          label="二维码内容"
          placeholder="输入文本或链接"
          clearable
        />
        <view class="qr-row qr-row--dynamic">
          <lingyun-qrcode
            :value="content"
            :size="160"
            empty-text="输入内容后生成二维码"
            @ready="onReady"
            @error="onQrError"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="导出图片" hint="toTempFilePath()">
        <lingyun-button
          variant="glass"
          size="medium"
          text="导出二维码"
          @click="exportQr"
        />
        <lingyun-text
          v-if="exportPath"
          type="caption"
          color="secondary"
          block
          class="export-path"
        >
          已导出：{{ exportPath.slice(0, 72) }}{{ exportPath.length > 72 ? '…' : '' }}
        </lingyun-text>
        <lingyun-text
          v-else
          type="caption"
          color="tertiary"
          block
          class="export-path"
        >
          H5 返回 data URL，小程序 / App 返回临时文件路径。
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

const orderUrl = 'https://lingyun.example/order/LY-20261108-0001'
const promoText = 'LINGYUN-PROMO-2026-AUTUMN'
const content = ref('https://lingyun.example/menu')
const exportPath = ref('')
const lastAction = ref('')
const qrRef = ref<{ toTempFilePath: () => Promise<string> } | null>(null)

function onReady(payload: { size: number; version: number; modules: number }) {
  lastAction.value = `已生成 v${payload.version} 二维码（${payload.modules} × ${payload.modules}）`
}

function onQrError(payload: { message: string }) {
  lastAction.value = `二维码生成失败：${payload.message}`
}

async function exportQr() {
  try {
    const path = await qrRef.value?.toTempFilePath()
    if (!path) return
    exportPath.value = path
    lastAction.value = '已导出二维码图片'
  } catch (error) {
    lastAction.value = `导出失败：${error instanceof Error ? error.message : '未知错误'}`
  }
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

.qr-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.qr-info {
  flex: 1;
  min-width: 160px;
  padding-top: 8px;
}

.qr-url {
  margin-top: 4px;
  word-break: break-all;
}

.qr-row--dynamic {
  padding-top: 14px;
}

.export-path {
  margin-top: 10px;
  word-break: break-all;
}
</style>
