<template>
  <lingyun-app-page title="Signature">
    <view class="page">
      <view class="hero">
        <lingyun-text type="title2" block emphasized>Signature</lingyun-text>
        <lingyun-text type="subtitle" block>
          手写签名 · 触控 / 鼠标 / 导出 PNG
        </lingyun-text>
      </view>

      <lingyun-section title="基础签名" hint="v-model · confirm 导出">
        <lingyun-signature
          ref="signatureRef"
          v-model="signature"
          tip="签收时可让收件人手写确认"
          @confirm="onConfirm"
          @clear="onClear"
          @start="onStart"
          @end="onEnd"
          @error="onError"
        />
        <view class="result">
          <view class="result-text">
            <lingyun-text type="caption" color="secondary" block>
              {{
                signature
                  ? `已生成签名：${signature.slice(0, 42)}…`
                  : '尚未生成签名'
              }}
            </lingyun-text>
          </view>
          <lingyun-button
            v-if="signature"
            class="result-action"
            variant="glass"
            size="medium"
            text="清空"
            @click="signatureRef?.clear()"
          />
        </view>
      </lingyun-section>

      <lingyun-section
        title="自定义笔迹"
        hint="penColor=#0088ff · penWidth=5 · height=220"
      >
        <lingyun-signature
          v-model="customSignature"
          title="门店确认"
          tip="蓝色签笔，220px 高度"
          pen-color="#0088ff"
          :pen-width="5"
          :height="220"
          @confirm="onConfirm"
          @error="onError"
        />
      </lingyun-section>

      <lingyun-section title="只读 / 禁用" hint="readonly · disabled">
        <lingyun-signature
          :model-value="sampleSignature"
          title="已签名"
          readonly
        />
        <view class="spacer" />
        <lingyun-signature
          :model-value="sampleSignature"
          title="禁用状态"
          disabled
        />
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
import type { LingyunSignatureConfirmPayload } from '@/uni_modules/lingyun-ui/components/lingyun-signature/types'

const signature = ref('')
const customSignature = ref('')
const sampleSignature = '/static/demo/signature-sample.png'
const signatureRef = ref<{ clear: () => void } | null>(null)
const lastAction = ref('')

function onConfirm(payload: LingyunSignatureConfirmPayload) {
  lastAction.value = `签名已生成 ${Math.round(payload.width)}×${Math.round(payload.height)}`
}

function onClear() {
  lastAction.value = '已清除签名'
}

function onStart() {
  lastAction.value = '开始签名'
}

function onEnd() {
  lastAction.value = '完成一笔'
}

function onError(payload: { message: string }) {
  lastAction.value = `签名失败：${payload.message}`
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
  padding: 8px 4px 15px;
}

.result {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
}

.result-text {
  flex: 1;
  min-width: 0;
}

.result-action {
  flex: 0 0 auto;
}

.spacer {
  height: 12px;
}
</style>
