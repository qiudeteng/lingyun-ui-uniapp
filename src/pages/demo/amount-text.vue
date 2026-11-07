<template>
  <lingyun-app-page title="Amount Text">
    <view class="page">
      <view class="hero">
        <text class="hero__title">金额显示</text>
        <text class="hero__desc">
          lingyun-amount-text · 万 / 百万 / 千万 / 亿 / 百亿 / 千亿 / 万亿
        </text>
      </view>

      <lingyun-section title="数量级">
        <view class="amount-row">
          <text class="amount-row__label">9,999.5</text>
          <lingyun-amount-text
            type="subheadline"
            prefix="¥"
            :value="9999.5"
            :decimals="2"
          />
        </view>
        <view class="amount-row">
          <text class="amount-row__label">12,345.67</text>
          <lingyun-amount-text
            type="subheadline"
            prefix="¥"
            :value="12345.67"
            :decimals="2"
          />
        </view>
        <view class="amount-row">
          <text class="amount-row__label">1,234,567</text>
          <lingyun-amount-text
            type="subheadline"
            prefix="¥"
            :value="1234567"
            :decimals="2"
          />
        </view>
        <view class="amount-row">
          <text class="amount-row__label">12,345,678</text>
          <lingyun-amount-text
            type="subheadline"
            prefix="¥"
            :value="12345678"
            :decimals="2"
          />
        </view>
        <view class="amount-row">
          <text class="amount-row__label">123,456,789</text>
          <lingyun-amount-text
            type="subheadline"
            prefix="¥"
            :value="123456789"
            :decimals="2"
          />
        </view>
        <view class="amount-row">
          <text class="amount-row__label">12,345,678,901</text>
          <lingyun-amount-text
            type="subheadline"
            prefix="¥"
            :value="12345678901"
            :decimals="2"
          />
        </view>
        <view class="amount-row">
          <text class="amount-row__label">123,456,789,012</text>
          <lingyun-amount-text
            type="subheadline"
            prefix="¥"
            :value="123456789012"
            :decimals="2"
          />
        </view>
        <view class="amount-row">
          <text class="amount-row__label">1,234,567,890,123</text>
          <lingyun-amount-text
            type="subheadline"
            prefix="¥"
            :value="1234567890123"
            :decimals="2"
          />
        </view>
        <view class="amount-row">
          <text class="amount-row__label">-12,345.6</text>
          <lingyun-amount-text
            type="subheadline"
            prefix="¥"
            :value="-12345.6"
            :decimals="1"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="小数位">
        <view class="amount-row">
          <text class="amount-row__label">0 位</text>
          <lingyun-amount-text type="subheadline" :value="1234567" :decimals="0" />
        </view>
        <view class="amount-row">
          <text class="amount-row__label">2 位</text>
          <lingyun-amount-text type="subheadline" :value="1234567" :decimals="2" />
        </view>
        <view class="amount-row">
          <text class="amount-row__label">4 位</text>
          <lingyun-amount-text type="subheadline" :value="1234567" :decimals="4" />
        </view>
      </lingyun-section>

      <lingyun-section title="文字样式" is-last>
        <view class="amount-row">
          <text class="amount-row__label">大号加粗</text>
          <lingyun-amount-text
            :value="123456789"
            :decimals="2"
            prefix="¥"
            type="title3"
            color="link"
            bold
          />
        </view>
        <view class="amount-row">
          <text class="amount-row__label">小号次要色</text>
          <lingyun-amount-text
            :value="123456789"
            :decimals="2"
            prefix="¥"
            type="footnote"
          />
        </view>
        <view class="amount-row">
          <text class="amount-row__label">默认 body</text>
          <lingyun-amount-text :value="123456789" :decimals="0" />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
</script>

<style lang="scss">
  .page {
    min-height: 100%;
    padding-bottom: 24px;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(255, 141, 40, 0.14), transparent 55%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
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
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .amount-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px;
  }

  .amount-row__label {
    flex-shrink: 0;
    font-size: 15px;
    line-height: 20px;
    color: var(--lingyun-label, #1c1c1e);
  }
</style>
