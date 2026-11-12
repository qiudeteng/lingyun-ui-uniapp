<template>
  <lingyun-app-page title="保存为图片">
    <view class="page">
      <view class="hero">
        <text class="hero__title">保存为图片</text>
        <text class="hero__desc">lingyun-save-image · 传入 ref 截取元素 · 不传则保存整个页面</text>
      </view>

      <lingyun-section title="保存指定元素" hint=":target 传 ref">
        <view ref="cardRef" class="shot-card">
          <view class="shot-card__head">
            <view class="shot-card__brand">
              <lingyun-icon type="star-filled" :size="18" color="orange" />
              <text class="shot-card__title">凌云取货单</text>
            </view>
            <text class="shot-card__no">LY-20261112-0001</text>
          </view>
          <view class="shot-card__row">
            <text class="shot-card__label">门店</text>
            <text class="shot-card__value">凌云 · 望京店</text>
          </view>
          <view class="shot-card__row">
            <text class="shot-card__label">取货时间</text>
            <text class="shot-card__value">2026-11-12 18:30</text>
          </view>
          <view class="shot-card__row">
            <text class="shot-card__label">商品</text>
            <text class="shot-card__value">草莓生日蛋糕 6 寸 × 1</text>
          </view>
          <view class="shot-card__foot">
            <text class="shot-card__amount">¥ 268.00</text>
            <text class="shot-card__tip">请出示此单取货</text>
          </view>
        </view>

        <view class="lingyun-section-row shot-row">
          <lingyun-save-image
            :target="cardRef"
            label="保存卡片"
            icon="download"
            file-name="lingyun-pickup-card"
            @success="onSaved"
            @error="onError"
          />
          <lingyun-save-image
            :target="cardRef"
            icon="image"
            :download="false"
            @success="onCaptured"
            @error="onError"
          />
        </view>
        <text class="shot-hint">图标触发且 download=false：只生成 PNG（data URL），由业务自行预览 / 上传。</text>
      </lingyun-section>

      <lingyun-section title="保存整个页面" hint="不传 target">
        <lingyun-save-image
          label="保存当前页面"
          icon="download"
          file-name="lingyun-page"
          @success="onSaved"
          @error="onError"
        />
        <text class="shot-hint">
          H5 截取当前页面（保留页面背景与图标字体）；微信小程序没有整页截图能力，
          需传入 canvas 节点或带 toTempFilePath() 的组件 ref。
        </text>
      </lingyun-section>

      <lingyun-section title="小程序：组件 ref" hint="toTempFilePath()">
        <view class="lingyun-section-row shot-row">
          <lingyun-qrcode ref="qrRef" :value="qrValue" :size="140" />
          <lingyun-save-image
            :target="qrRef"
            label="保存二维码"
            icon="download"
            @success="onSaved"
            @error="onError"
          />
        </view>
        <text class="shot-hint">
          二维码 / 签名等组件自带 toTempFilePath()：H5 按元素截图，小程序直接导出临时文件并保存到相册。
        </text>
      </lingyun-section>

      <lingyun-section title="尺寸 / 禁用" hint="size · disabled">
        <view class="lingyun-section-row shot-row">
          <lingyun-save-image :target="cardRef" label="Small" size="small" :toast="false" :download="false" @success="onCaptured" />
          <lingyun-save-image :target="cardRef" label="Medium" size="medium" :toast="false" :download="false" @success="onCaptured" />
          <lingyun-save-image :target="cardRef" label="Large" size="large" :toast="false" :download="false" @success="onCaptured" />
        </view>
        <view class="lingyun-section-row shot-row">
          <lingyun-save-image label="禁用" disabled />
        </view>
      </lingyun-section>

      <lingyun-section title="最近一次保存" :hint="lastSaved || '—'" is-last>
        <text class="shot-hint">{{ lastSavedDetail || '点击上方按钮生成 PNG。' }}</text>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const cardRef = ref<unknown>(null)
const qrRef = ref<{ toTempFilePath: () => Promise<string> } | null>(null)
const qrValue = 'https://lingyun.example/order/LY-20261112-0001'
const lastSaved = ref('')
const lastSavedDetail = ref('')

function summarize(path: string): string {
  if (!path) return '—'
  if (path.startsWith('data:')) {
    const kb = Math.round(path.length / 1024)
    return `data URL · ${kb} KB`
  }
  return path
}

function onSaved(payload: { path: string }): void {
  lastSaved.value = summarize(payload?.path || '')
  lastSavedDetail.value = payload?.path?.startsWith('data:')
    ? '已触发下载（H5 data URL）'
    : `已保存：${payload?.path || ''}`
}

function onCaptured(payload: { path: string }): void {
  lastSaved.value = summarize(payload?.path || '')
  lastSavedDetail.value = '已生成 PNG，未触发下载（download=false）'
}

function onError(payload: { message?: string }): void {
  lastSaved.value = ''
  lastSavedDetail.value = payload?.message || '保存失败'
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

  .hero__title {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--lingyun-label, #1c1c1e);
  }

  .hero__desc {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .shot-card {
    margin: 0 4px 12px;
    padding: 16px;
    border-radius: 18px;
    background-color: var(--lingyun-bg-grouped-secondary, #ffffff);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }

  .shot-card__head {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 0.5px solid var(--lingyun-separator, rgba(60, 60, 67, 0.29));
  }

  .shot-card__brand {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  .shot-card__title {
    font-size: 17px;
    font-weight: 700;
    color: var(--lingyun-label, #1c1c1e);
  }

  .shot-card__no {
    font-size: 12px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .shot-card__row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-top: 10px;
  }

  .shot-card__label {
    font-size: 14px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .shot-card__value {
    flex: 1;
    text-align: right;
    font-size: 14px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .shot-card__foot {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 0.5px solid var(--lingyun-separator, rgba(60, 60, 67, 0.29));
  }

  .shot-card__amount {
    font-size: 22px;
    font-weight: 700;
    color: var(--lingyun-primary, #0088ff);
  }

  .shot-card__tip {
    font-size: 12px;
    color: var(--lingyun-label-tertiary, rgba(60, 60, 67, 0.3));
  }

  .shot-row {
    gap: 12px;
    align-items: center;
  }

  .shot-hint {
    display: block;
    padding: 8px 4px 0;
    font-size: 13px;
    line-height: 20px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }
</style>
