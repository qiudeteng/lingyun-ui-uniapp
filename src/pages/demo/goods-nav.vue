<template>
  <lingyun-app-page title="Goods Nav">
    <view class="page">
      <view class="hero">
        <text class="hero__title">商品导航</text>
        <text class="hero__desc">
          lingyun-goods-nav · default 左侧图标入口 + 按钮组；cart 变体对齐点单页底部购物车
        </text>
      </view>

      <lingyun-section title="Cart · 购物车结算栏">
        <view class="cart-demo">
          <view class="cart-demo__summary">
            <text class="cart-demo__count">已选 {{ cartCount }} 件</text>
            <text class="cart-demo__total">合计 ¥{{ total.toFixed(2) }}</text>
          </view>
          <view class="cart-demo__actions">
            <lingyun-button
              variant="bordered"
              size="small"
              text="加购 35 元"
              @click="addOne"
            />
            <lingyun-button
              variant="bordered"
              size="small"
              text="清空"
              :disabled="!cartCount"
              @click="clearCart"
            />
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="说明" is-last>
        <view class="note">
          <text class="note__text">
            cart 变体是悬浮玻璃胶囊：购物车圆钮带角标，中间显示合计 / 配送费，右侧是蓝色结算钮；未达起送价时置灰。
            点购物车和结算分别抛 cart / checkout 事件。default 变体仍是左侧图标入口 + 右侧按钮组。
          </text>
        </view>
      </lingyun-section>
    </view>

    <lingyun-goods-nav
      variant="cart"
      :cart-count="cartCount"
      :total="total"
      :min-price="20"
      :delivery-fee="5"
      :price-decimals="2"
      @cart="onCart"
      @checkout="onCheckout"
    />
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const cartCount = ref(2)
  const total = ref(59.9)

  function addOne(): void {
    cartCount.value += 1
    total.value += 35
  }

  function clearCart(): void {
    cartCount.value = 0
    total.value = 0
  }

  function toast(title: string): void {
    uni.showToast({ title, icon: 'none' })
  }

  function onCart(payload: { count?: number; total?: number }): void {
    toast(`购物车 ${payload.count || 0} 件 · ¥${payload.total || 0}`)
  }

  function onCheckout(payload: { count?: number; total?: number }): void {
    toast(`去结算 ${payload.count || 0} 件 · ¥${payload.total || 0}`)
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 120px;
    min-height: 100%;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(0, 136, 255, 0.18), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(52, 199, 89, 0.14), transparent 50%),
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

  .cart-demo {
    padding: 4px 16px 12px;
  }

  .cart-demo__summary {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
  }

  .cart-demo__count {
    font-size: 15px;
    line-height: 20px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .cart-demo__total {
    font-size: 20px;
    font-weight: 600;
    line-height: 24px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .cart-demo__actions {
    margin-top: 12px;
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  .note {
    padding: 4px 16px 12px;
  }

  .note__text {
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }
</style>
