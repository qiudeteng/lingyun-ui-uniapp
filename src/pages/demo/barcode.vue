<template>
  <lingyun-app-page title="Barcode">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Barcode</lingyun-text>
        <lingyun-text type="subtitle" block>
          一维条码 · Code128 / Code39 / EAN-13 · Canvas 导出
        </lingyun-text>
      </view>

      <lingyun-section title="Code 128" hint="format=CODE128 · 自动字符集">
        <view class="barcode-block">
          <lingyun-barcode
            ref="barcodeRef"
            value="LY-0001"
            format="CODE128"
            :module-width="2"
            fluid
            @ready="onReady"
            @error="onError"
          />
          <lingyun-text type="caption" color="tertiary" block>
            LY-0001
          </lingyun-text>
        </view>
      </lingyun-section>

      <lingyun-section title="EAN-13" hint="12 位输入自动补校验位">
        <view class="barcode-block">
          <lingyun-barcode
            value="690123456789"
            format="EAN13"
            :module-width="2"
            :height="90"
            fluid
            @ready="onReady"
            @error="onError"
          />
          <lingyun-text type="caption" color="tertiary" block>
            输入 690123456789，导出时显示完整校验位
          </lingyun-text>
        </view>
      </lingyun-section>

      <lingyun-section title="Code 39 · 自定义颜色" hint="checkDigit · 深蓝条码">
        <view class="barcode-block">
          <lingyun-barcode
            value="CAKE-2026"
            format="CODE39"
            :module-width="1.5"
            :height="84"
            :code39-check-digit="true"
            foreground-color="#0a3d62"
            background-color="#f7fbff"
            fluid
            @ready="onReady"
            @error="onError"
          />
          <lingyun-text type="caption" color="tertiary" block>
            CAKE-2026
          </lingyun-text>
        </view>
      </lingyun-section>

      <lingyun-section title="导出图片" hint="toTempFilePath()">
        <lingyun-button
          variant="glass"
          size="medium"
          text="导出条码"
          @click="exportBarcode"
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

const exportPath = ref('')
const lastAction = ref('')
const barcodeRef = ref<{ toTempFilePath: () => Promise<string> } | null>(null)

function onReady(payload: {
  format: string
  text: string
  modules: number
  width: number
  height: number
}) {
  lastAction.value = `已生成 ${payload.format}：${payload.text}（${payload.modules} 模块）`
}

function onError(payload: { message: string }) {
  lastAction.value = `条码生成失败：${payload.message}`
}

async function exportBarcode() {
  try {
    const path = await barcodeRef.value?.toTempFilePath()
    if (!path) return
    exportPath.value = path
    lastAction.value = '已导出条码图片'
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

.barcode-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.export-path {
  margin-top: 10px;
  word-break: break-all;
}
</style>
