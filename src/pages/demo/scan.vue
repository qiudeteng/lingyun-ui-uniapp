<template>
  <lingyun-app-page title="Scan">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Scan</lingyun-text>
        <lingyun-text type="subtitle" block>
          扫码入口 · 小程序 / App 原生扫码 · H5 自定义 scanFn
        </lingyun-text>
      </view>

      <lingyun-section title="模拟扫码" hint="scanFn · 可测试 / 网页扫码">
        <lingyun-scan
          :scan-fn="mockScan"
          tip="H5 下使用 scanFn 模拟；真实环境可接自建网页扫码"
          @start="onStart"
          @success="onSuccess"
          @error="onError"
          @cancel="onCancel"
        />
      </lingyun-section>

      <lingyun-section title="原生扫码" hint="uni.scanCode · 小程序 / App">
        <lingyun-scan
          tip="微信小程序 / App 会打开系统扫码；H5 会提示不支持"
          @start="onStart"
          @success="onSuccess"
          @error="onError"
          @cancel="onCancel"
        />
      </lingyun-section>

      <lingyun-section title="自定义触发" hint="默认插槽 · scanning">
        <lingyun-scan :scan-fn="mockScan" @success="onSuccess" @error="onError">
          <template #default="{ scanning }">
            <view class="scan-row">
              <view class="scan-row__icon">
                <lingyun-icon type="scan" :size="24" color="primary" />
              </view>
              <view class="scan-row__body">
                <text class="scan-row__title">
                  {{ scanning ? '正在识别…' : '扫描取货码' }}
                </text>
                <text class="scan-row__desc">
                  支持门店取货码、商品批次码
                </text>
              </view>
              <lingyun-icon type="right" :size="18" color="tertiary" />
            </view>
          </template>
        </lingyun-scan>
      </lingyun-section>

      <lingyun-section title="禁用态" hint="disabled">
        <lingyun-scan disabled tip="不可用时置灰且不响应点击" />
      </lingyun-section>

      <lingyun-section v-if="lastAction" title="最近操作" :hint="lastAction" is-last>
        <view v-if="lastResult" class="result-card">
          <text class="result-card__label">扫码结果</text>
          <text class="result-card__value">{{ lastResult.result }}</text>
          <text v-if="lastResult.scanType" class="result-card__meta">
            类型：{{ lastResult.scanType }}
          </text>
        </view>
        <text v-if="lastError" class="result-card__error">{{ lastError }}</text>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {
  LingyunScanOptions,
  LingyunScanResult,
} from '@/uni_modules/lingyun-ui/components/lingyun-scan/types'

const lastAction = ref('')
const lastResult = ref<LingyunScanResult | null>(null)
const lastError = ref('')

function mockScan(options: LingyunScanOptions): Promise<LingyunScanResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        result: `LY-20261108-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        scanType: options.scanType[0] || 'qrCode',
        charSet: 'UTF-8',
        path: '',
      })
    }, 700)
  })
}

function onStart() {
  lastAction.value = '开始扫码'
  lastError.value = ''
}

function onSuccess(result: LingyunScanResult) {
  lastResult.value = result
  lastAction.value = `识别成功：${result.result}`
}

function onError(payload: { message: string }) {
  lastResult.value = null
  lastError.value = payload.message
  lastAction.value = `扫码失败：${payload.message}`
}

function onCancel() {
  lastAction.value = '已取消扫码'
}
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
    var(--lingyun-bg-grouped, #f2f2f7);
}

.hero {
  padding: 24px 20px 8px;
}

.scan-row {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 14px;
  box-sizing: border-box;
  border-radius: 14px;
  background-color: var(--lingyun-bg-grouped-secondary, #ffffff);
  box-shadow: 0 0 0 0.5px var(--lingyun-separator, rgba(0, 0, 0, 0.12));
}

.scan-row__icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: var(--lingyun-primary-soft, rgba(0, 136, 255, 0.14));
}

.scan-row__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.scan-row__title {
  font-size: 16px;
  line-height: 22px;
  font-weight: 600;
  color: var(--lingyun-label, #000000);
}

.scan-row__desc {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}

.result-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  margin-top: 8px;
  border-radius: 12px;
  background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
}

.result-card__label {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}

.result-card__value {
  font-size: 16px;
  line-height: 22px;
  font-weight: 600;
  color: var(--lingyun-label, #000000);
  word-break: break-all;
}

.result-card__meta {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
}

.result-card__error {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-error, #ff383c);
}
</style>
