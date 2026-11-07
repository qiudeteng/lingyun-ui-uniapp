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
              text="加购 168 元"
              @click="addOne"
            />
            <lingyun-button
              variant="bordered"
              size="small"
              text="API 打开 (280)"
              @click="openWithApi"
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
            开启 detail 后，点购物车会让整张卡片向上增高，详情和购物车是同一张玻璃卡；左上角关闭钮、点卡片外收起，结算钮始终可点；
            详情高度随内容自动撑开，超过视口上限后内部滚动，也可用 openDetail({ height }) 指定详情区域高度。
          </text>
        </view>
      </lingyun-section>
    </view>

    <lingyun-goods-nav
      ref="goodsNavRef"
      variant="cart"
      detail
      :cart-count="cartCount"
      :total="total"
      :min-price="20"
      :delivery-fee="5"
      :price-decimals="2"
      :detail-version="cartVersion"
      @checkout="onCheckout"
    >
      <template #detail-header>
        <view class="detail-demo__head">
          <view class="detail-demo__head-main">
            <text class="detail-demo__title">已选商品</text>
            <text class="detail-demo__count">共 {{ cartCount }} 件</text>
          </view>
          <view
            v-if="lines.length"
            class="detail-demo__clear"
            hover-class="detail-demo__clear--hover"
            role="button"
            @click="clearCart"
          >
            <text class="detail-demo__clear-text">清空</text>
          </view>
        </view>
      </template>
      <template #detail>
        <view class="detail-demo">
          <view v-for="line in lines" :key="line.key" class="detail-demo__line">
            <view class="detail-demo__line-main">
              <text class="detail-demo__name">{{ line.name }}</text>
              <text class="detail-demo__spec">{{ line.spec }}</text>
            </view>
            <text class="detail-demo__price">¥{{ (line.price * line.quantity).toFixed(2) }}</text>
            <lingyun-stepper
              :value="line.quantity"
              :min="0"
              :max="99"
              show-value
              @change="setQuantity(line, $event)"
            />
          </view>
          <view v-if="!lines.length" class="detail-demo__empty">
            <text class="detail-demo__empty-text">购物车是空的</text>
          </view>
          <view class="detail-demo__pad" />
        </view>
      </template>
    </lingyun-goods-nav>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref } from 'vue'

  type DemoCartLine = {
    key: string
    name: string
    spec: string
    price: number
    quantity: number
  }

  type GoodsNavInstance = {
    openDetail?: (options?: { height?: number; maxHeight?: number; topGap?: number }) => void
    closeDetail?: () => void
    toggleDetail?: () => void
  }

  const goodsNavRef = ref<GoodsNavInstance | null>(null)

  const lines = ref<DemoCartLine[]>([
    { key: 'cake', name: '八喜经典冰淇淋蛋糕', spec: '6 寸 / 约 1.5 磅', price: 168, quantity: 1 },
    { key: 'dessert', name: '提拉米苏', spec: '1 份', price: 38, quantity: 2 },
  ])

  const cartCount = computed(() =>
    lines.value.reduce((sum, line) => sum + line.quantity, 0),
  )
  const total = computed(() =>
    lines.value.reduce((sum, line) => sum + line.price * line.quantity, 0),
  )
  const cartVersion = computed(() =>
    lines.value.map((line) => `${line.key}:${line.quantity}`).join('|'),
  )

  function addOne(): void {
    const line = lines.value.find((item) => item.key === 'cake')
    if (line) line.quantity += 1
    else {
      lines.value.push({
        key: 'cake',
        name: '八喜经典冰淇淋蛋糕',
        spec: '6 寸 / 约 1.5 磅',
        price: 168,
        quantity: 1,
      })
    }
  }

  function setQuantity(line: DemoCartLine, value: number): void {
    const quantity = Math.max(0, Math.floor(Number(value) || 0))
    if (quantity <= 0) {
      lines.value = lines.value.filter((item) => item.key !== line.key)
      return
    }
    line.quantity = quantity
  }

  function clearCart(): void {
    lines.value = []
  }

  /** 通过组件 API 打开详情，并指定固定高度 */
  function openWithApi(): void {
    if (!lines.value.length) addOne()
    nextTick(() => {
      goodsNavRef.value?.openDetail?.({ height: 280 })
    })
  }

  function toast(title: string): void {
    uni.showToast({ title, icon: 'none' })
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

  .detail-demo {
    padding: 0 16px;
    box-sizing: border-box;
  }

  .detail-demo__head {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
  }

  .detail-demo__head-main {
    display: flex;
    flex-direction: row;
    align-items: baseline;
  }

  .detail-demo__title {
    font-size: 17px;
    font-weight: 600;
    line-height: 22px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .detail-demo__count {
    margin-left: 8px;
    font-size: 12px;
    line-height: 16px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .detail-demo__clear {
    padding: 6px 4px;
  }

  .detail-demo__clear--hover {
    opacity: 0.6;
  }

  .detail-demo__clear-text {
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-system-blue, #0088ff);
  }

  .detail-demo__line {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 12px 0;
    border-bottom: 0.5px solid var(--lingyun-separator, #c6c6c8);
  }

  .detail-demo__line-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .detail-demo__name {
    font-size: 15px;
    font-weight: 500;
    line-height: 20px;
    color: var(--lingyun-label, #1c1c1e);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .detail-demo__spec {
    margin-top: 1px;
    font-size: 12px;
    line-height: 16px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .detail-demo__price {
    margin: 0 10px;
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .detail-demo__empty {
    padding: 36px 0;
    text-align: center;
  }

  .detail-demo__empty-text {
    font-size: 14px;
    line-height: 20px;
    color: var(--lingyun-label-tertiary, #8e8e93);
  }

  .detail-demo__pad {
    height: 16px;
  }
</style>
