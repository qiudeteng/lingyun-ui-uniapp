<template>
  <lingyun-app-page title="复制">
    <view class="page">
      <view class="hero">
        <text class="hero__title">复制</text>
        <text class="hero__desc">lingyun-copy · 文字 / 图标触发器 · 点击复制 text 属性值</text>
      </view>

      <lingyun-section title="文字触发" hint="label">
        <view class="lingyun-section-row copy-row">
          <lingyun-copy text="LY-20261112-0001" label="复制订单号" @copy="onCopy" />
          <lingyun-copy
            text="SH-LINGYUN-88"
            label="复制门店编号"
            variant="plain"
            @copy="onCopy"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="图标触发" hint="icon">
        <view class="lingyun-section-row copy-row">
          <lingyun-copy
            text="https://lingyun.example/order/LY-20261112-0001"
            icon="link"
            @copy="onCopy"
          />
          <lingyun-copy text="Hello Lingyun" icon="chatbubble" label="复制问候" @copy="onCopy" />
        </view>
      </lingyun-section>

      <lingyun-section title="绑定动态内容" hint=":text">
        <lingyun-text-field
          v-model="content"
          label="要复制的内容"
          placeholder="输入后点击复制"
          clearable
        />
        <view class="lingyun-section-row copy-row">
          <lingyun-copy
            :text="content"
            label="复制输入内容"
            @copy="onCopy"
            @error="onError"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="尺寸 / 形态" hint="size · variant · disabled">
        <view class="lingyun-section-row copy-row">
          <lingyun-copy text="small" label="Small" size="small" />
          <lingyun-copy text="medium" label="Medium" size="medium" />
          <lingyun-copy text="large" label="Large" size="large" />
        </view>
        <view class="lingyun-section-row copy-row">
          <lingyun-copy text="plain" label="Plain" variant="plain" />
          <lingyun-copy text="disabled" label="禁用" disabled />
        </view>
      </lingyun-section>

      <lingyun-section title="自定义触发器" hint="#default 插槽">
        <lingyun-copy text="自定义插槽内容" @copy="onCopy">
          <view class="custom-trigger">
            <lingyun-icon type="compose" :size="16" color="link" />
            <text class="custom-trigger__text">复制自定义内容</text>
          </view>
        </lingyun-copy>
      </lingyun-section>

      <lingyun-section
        title="最近一次复制"
        :hint="lastCopied || '—'"
        is-last
      >
        <text class="copy-hint">
          copy 事件返回被复制的文本。微信端由系统弹出「内容已复制」，不再叠加组件 toast；
          H5 / App 由组件提示。
        </text>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const content = ref('LINGYUN-2026-AUTUMN')
const lastCopied = ref('')

function onCopy(text: string): void {
  lastCopied.value = text
}

function onError(payload: { message?: string }): void {
  uni.showToast({ title: payload?.message || '复制失败', icon: 'none' })
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

  .copy-row {
    gap: 12px;
  }

  .custom-trigger {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 12px;
    border-radius: 17px;
    background-color: var(--lingyun-fill-tertiary, rgba(120, 120, 128, 0.12));
  }

  .custom-trigger__text {
    font-size: 15px;
    font-weight: 590;
    line-height: 1.2;
    color: var(--lingyun-link, #0088ff);
  }

  .copy-hint {
    display: block;
    padding: 0 4px;
    font-size: 13px;
    line-height: 20px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }
</style>
