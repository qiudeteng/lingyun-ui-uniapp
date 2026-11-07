<template>
  <lingyun-app-page
    :show-toolbar="showToolbar"
    :show-back="false"
    :show-nav="showNav"
    :show-tabbar="false"
    :title="title"
    :body-scroll="false"
    :page-scroll="false"
  >
    <view class="lingyun-order-goods" :class="rootClass" :style="rootStyle">
      <!-- 店铺头：Banner + 店铺卡片 -->
      <view class="lingyun-order-goods__header">
        <view
          v-if="bannerHeight > 0"
          class="lingyun-order-goods__banner"
          :style="{ height: `${bannerHeight}px` }"
        >
          <slot name="banner">
            <image
              v-if="banner"
              class="lingyun-order-goods__banner-img"
              :src="banner"
              mode="aspectFill"
            />
            <view v-else class="lingyun-order-goods__banner-fallback" />
          </slot>
          <view
            v-if="showBack"
            class="lingyun-order-goods__back"
            hover-class="lingyun-order-goods__back--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            role="button"
            aria-label="返回"
            @click="$emit('back')"
          >
            <lingyun-icon type="left" :size="28" color="var(--lingyun-label, #000)" />
          </view>
          <view class="lingyun-order-goods__banner-actions">
            <slot name="banner-actions" />
          </view>
        </view>

        <view
          v-else-if="showBack"
          class="lingyun-order-goods__back-row"
        >
          <view
            class="lingyun-order-goods__back"
            hover-class="lingyun-order-goods__back--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            role="button"
            aria-label="返回"
            @click="$emit('back')"
          >
            <lingyun-icon type="left" :size="28" color="var(--lingyun-label, #000)" />
          </view>
        </view>

        <view
          class="lingyun-order-goods__store"
          :class="{ 'lingyun-order-goods__store--attached': bannerHeight > 0 }"
        >
          <view class="lingyun-order-goods__store-head">
            <view class="lingyun-order-goods__logo">
              <image
                v-if="store.logo"
                class="lingyun-order-goods__logo-img"
                :src="store.logo"
                mode="aspectFill"
              />
              <text v-else class="lingyun-order-goods__logo-text">{{ firstChar(store.name) }}</text>
            </view>
            <view class="lingyun-order-goods__store-main">
              <text class="lingyun-order-goods__store-name">{{ store.name }}</text>
              <view class="lingyun-order-goods__store-meta">
                <view
                  v-if="store.rating !== undefined && store.rating !== ''"
                  class="lingyun-order-goods__rating"
                >
                  <lingyun-icon
                    type="star-filled"
                    :size="11"
                    color="var(--lingyun-system-orange, #ff8d28)"
                  />
                  <text class="lingyun-order-goods__rating-text">{{ store.rating }}</text>
                </view>
                <template v-for="(part, index) in storeMetaParts" :key="index">
                  <text
                    v-if="index > 0 || hasRating"
                    class="lingyun-order-goods__dot"
                  >·</text>
                  <text class="lingyun-order-goods__meta-text">{{ part }}</text>
                </template>
              </view>
            </view>
          </view>
          <view v-if="store.notice" class="lingyun-order-goods__notice">
            <text class="lingyun-order-goods__notice-text">{{ store.notice }}</text>
          </view>
          <slot name="store-extra" :store="store" />
        </view>
      </view>

      <!-- 左右布局：分类导航 + 商品列表 -->
      <view class="lingyun-order-goods__body">
        <scroll-view
          class="lingyun-order-goods__rail"
          scroll-y
          scroll-with-animation
          :show-scrollbar="false"
          :scroll-into-view="railIntoId"
        >
          <view class="lingyun-order-goods__rail-inner">
            <view
              v-for="(category, index) in categories"
              :id="railIdOf(category)"
              :key="category.key"
              class="lingyun-order-goods__rail-item"
              :class="{ 'lingyun-order-goods__rail-item--active': category.key === activeKey }"
              hover-class="lingyun-order-goods__rail-item--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              role="button"
              @click="selectCategory(category, index)"
            >
              <view class="lingyun-order-goods__rail-bar" />
              <text class="lingyun-order-goods__rail-text">{{ category.text }}</text>
              <view v-if="hasCategoryBadge(category)" class="lingyun-order-goods__rail-badge">
                <lingyun-badge :text="category.badge" color="orange" />
              </view>
            </view>
          </view>
        </scroll-view>

        <scroll-view
          class="lingyun-order-goods__list"
          scroll-y
          scroll-with-animation
          :show-scrollbar="false"
          :scroll-into-view="listIntoId"
          @scroll="onListScroll"
        >
          <view class="lingyun-order-goods__list-inner">
            <view
              v-for="category in categories"
              :id="sectionIdOf(category)"
              :key="category.key"
              class="lingyun-order-goods__section"
            >
              <text class="lingyun-order-goods__section-title">
                {{ category.title || category.text }}
              </text>
              <view
                v-for="item in category.goods"
                :key="item.key"
                class="lingyun-order-goods__goods"
                @click="onGoodsClick(item, category)"
              >
                <view class="lingyun-order-goods__media">
                  <image
                    v-if="item.image"
                    class="lingyun-order-goods__media-img"
                    :src="item.image"
                    mode="aspectFill"
                    @load="scheduleMeasure()"
                  />
                  <view v-else class="lingyun-order-goods__media-empty">
                    <text class="lingyun-order-goods__media-char">{{ firstChar(item.name) }}</text>
                  </view>
                </view>
                <view class="lingyun-order-goods__goods-main">
                  <view class="lingyun-order-goods__name-row">
                    <text class="lingyun-order-goods__name">{{ item.name }}</text>
                    <text v-if="item.badge" class="lingyun-order-goods__tag">{{ item.badge }}</text>
                  </view>
                  <text v-if="metaText(item)" class="lingyun-order-goods__meta">{{ metaText(item) }}</text>
                  <view
                    v-if="item.details && item.details.length"
                    class="lingyun-order-goods__details"
                  >
                    <text
                      v-for="(detail, detailIndex) in item.details"
                      :key="detailIndex"
                      class="lingyun-order-goods__detail"
                    >{{ detail }}</text>
                  </view>
                  <view class="lingyun-order-goods__bottom">
                    <view v-if="showPrice(item)" class="lingyun-order-goods__price">
                      <text class="lingyun-order-goods__currency">{{ currency }}</text>
                      <text class="lingyun-order-goods__amount">{{ formatPrice(item.price) }}</text>
                      <text v-if="item.priceUnit" class="lingyun-order-goods__price-unit">
                        {{ item.priceUnit }}
                      </text>
                      <text v-if="item.originalPrice" class="lingyun-order-goods__original">
                        {{ currency }}{{ formatPrice(item.originalPrice) }}
                      </text>
                    </view>
                    <view class="lingyun-order-goods__action" @click.stop>
                      <text
                        v-if="item.soldOut"
                        class="lingyun-order-goods__soldout"
                      >{{ soldOutText }}</text>
                      <lingyun-stepper
                        v-else-if="quantityOf(item) > 0 && !item.multiSpec"
                        :value="quantityOf(item)"
                        :min="0"
                        :max="itemMax(item)"
                        :step="itemStep(item)"
                        :right-text="quantityUnitOf(item)"
                        show-value
                        @change="onItemQuantity(item, $event)"
                      />
                      <view
                        v-else-if="item.multiSpec"
                        class="lingyun-order-goods__spec-btn"
                        hover-class="lingyun-order-goods__spec-btn--hover"
                        :hover-start-time="20"
                        :hover-stay-time="70"
                        role="button"
                        :aria-label="specButtonText"
                        @click="onPlus(item, category)"
                      >
                        <text class="lingyun-order-goods__spec-btn-text">{{ specButtonText }}</text>
                        <view
                          v-if="quantityOf(item) > 0"
                          class="lingyun-order-goods__plus-count"
                        >
                          <text class="lingyun-order-goods__plus-count-text">
                            {{ quantityOf(item) }}
                          </text>
                        </view>
                      </view>
                      <view
                        v-else
                        class="lingyun-order-goods__plus"
                        hover-class="lingyun-order-goods__plus--hover"
                        :hover-start-time="20"
                        :hover-stay-time="70"
                        role="button"
                        aria-label="加入购物车"
                        @click="onPlus(item, category)"
                      >
                        <lingyun-icon type="plus" :size="16" color="#ffffff" />
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <view v-if="!hasGoods" class="lingyun-order-goods__empty">
              <slot name="empty">
                <lingyun-empty variant="plain" :title="emptyText" />
              </slot>
            </view>
            <view class="lingyun-order-goods__list-pad" />
          </view>
        </scroll-view>
      </view>

      <!-- 底部购物车 / 结算栏：复用 lingyun-goods-nav 的 cart 变体 -->
      <view
        class="lingyun-order-goods__cart-wrap"
        :class="{ 'lingyun-order-goods__cart-wrap--safe': safeArea }"
      >
        <lingyun-goods-nav
          variant="cart"
          :fixed="false"
          :cart-count="cartCount"
          :total="cartTotal"
          :min-price="minPrice"
          :delivery-fee="deliveryFee"
          :currency="currency"
          :empty-text="emptyCartText"
          :checkout-text="checkoutText"
          :price-decimals="priceDecimals"
          :accent-color="accentColor"
          @cart="openCart"
          @checkout="onCheckout"
        />
      </view>

      <!-- 已选商品 -->
      <lingyun-sheets
        v-model:show="cartOpen"
        :title="cartTitle"
        detent="medium"
        :z-index="1200"
      >
        <template #trailing>
          <view
            v-if="cartLines.length"
            class="lingyun-order-goods__clear"
            hover-class="lingyun-order-goods__clear--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            role="button"
            @click="clearCart"
          >
            <lingyun-icon type="trash" :size="16" color="var(--lingyun-label-secondary, #8e8e93)" />
            <text class="lingyun-order-goods__clear-text">{{ clearText }}</text>
          </view>
        </template>
        <view class="lingyun-order-goods__cart-sheet">
          <view
            v-for="line in cartLines"
            :key="line.item.key"
            class="lingyun-order-goods__cart-line"
          >
            <view class="lingyun-order-goods__cart-media">
              <image
                v-if="line.item.image"
                class="lingyun-order-goods__cart-media-img"
                :src="line.item.image"
                mode="aspectFill"
              />
              <view v-else class="lingyun-order-goods__cart-media-empty">
                <text class="lingyun-order-goods__media-char">{{ firstChar(line.item.name) }}</text>
              </view>
            </view>
            <view class="lingyun-order-goods__cart-line-main">
              <text class="lingyun-order-goods__cart-line-name">{{ line.item.name }}</text>
              <text v-if="line.item.specText" class="lingyun-order-goods__cart-line-spec">
                {{ line.item.specText }}
              </text>
              <view class="lingyun-order-goods__cart-line-price">
                <text class="lingyun-order-goods__currency">{{ currency }}</text>
                <text class="lingyun-order-goods__cart-line-amount">
                  {{ formatPrice(line.item.price) }}
                </text>
              </view>
            </view>
            <lingyun-stepper
              :value="line.quantity"
              :min="0"
              :max="itemMax(line.item)"
              :step="itemStep(line.item)"
              :right-text="quantityUnitOf(line.item)"
              show-value
              @change="onItemQuantity(line.item, $event)"
            />
          </view>
          <view v-if="!cartLines.length" class="lingyun-order-goods__cart-empty-state">
            <text class="lingyun-order-goods__cart-empty-text">{{ emptyCartText }}</text>
          </view>
          <view class="lingyun-order-goods__sheet-pad" />
        </view>
      </lingyun-sheets>
    </view>
  </lingyun-app-page>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type {
  LingyunOrderCart,
  LingyunOrderCartLine,
  LingyunOrderCategory,
  LingyunOrderCategoryChangePayload,
  LingyunOrderChangePayload,
  LingyunOrderCheckoutPayload,
  LingyunOrderGoods,
  LingyunOrderGoodsClickPayload,
  LingyunOrderSpecPayload,
  LingyunOrderStore,
} from './types'

type ScrollEvent = {
  detail?: { scrollTop?: number }
}

const FALLBACK_ACCENT = 'var(--lingyun-system-blue, #0088ff)'

function sanitizeKey(value: unknown): string {
  return String(value == null ? '' : value)
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * lingyun-order-goods
 * @description 标准「订单商品加购」页：店铺头 + 左侧分类 + 右侧商品 + 底部购物车结算栏。
 * 全部由 props 数据驱动；加购数量走 v-model，提交和跳转抛事件，由页面接业务。
 * @see design/pages/demo/order-goods.md
 *
 * @property {Object} store 店铺信息 { name, logo, rating, salesText, deliveryText, notice }
 * @property {Array} categories 分类与商品 [{ key, text, title, badge, goods }]；商品支持 details / priceUnit / quantityUnit / multiSpec / soldOut 等字段
 * @property {Object} modelValue 购物车 { [goodsKey]: quantity }
 * @property {String} banner 店铺 Banner 图；用 #banner 插槽可完全自定义
 * @property {Number} bannerHeight Banner 高度，0 时不显示
 * @property {Boolean} showBack 显示 Banner 左上角返回钮（默认 true，点击抛 back）
 * @property {Boolean} showNav 透传给 lingyun-app-page；默认 true，宽屏保留应用导航列
 * @property {Boolean} showToolbar 透传给 lingyun-app-page；默认 false
 * @property {String} title 顶栏标题（showToolbar 为 true 时使用）
 * @property {Number} minPrice 起送价
 * @property {Number} deliveryFee 配送费
 * @property {String} currency 货币符号
 * @property {Number} maxCount 单个商品默认最大数量
 * @property {String} checkoutText 可结算时的按钮文案
 * @property {String} cartTitle 已选商品 Sheet 标题
 * @property {String} clearText Sheet 右上角清空文案
 * @property {String} emptyText 无商品时空态文案
 * @property {String} emptyCartText 购物车为空时的文案
 * @property {String} soldOutText 售罄商品在加购位置显示的文案
 * @property {String} specButtonText 多规格商品按钮文案
 * @property {String} quantityUnit 步进器默认数量单位；商品上的 quantityUnit 优先
 * @property {Number} priceDecimals 价格小数位；-1 去掉多余的 0，2 固定两位
 * @property {String} accentColor 选中 / 加购 / 结算的主色；默认系统蓝
 * @property {Boolean} safeArea 购物车栏预留底部安全区
 * @event update:modelValue 加购数量变化
 * @event change 加购数量变化 { item, quantity, cart, count, totalPrice }
 * @event category-change 左右联动切换分类 { key, index }
 * @event goods-click 点击商品 { item, categoryKey }
 * @event spec-request 多规格商品点 +；业务弹自己的规格面板
 * @event cart-clear 清空购物车
 * @event checkout 可结算时点结算 { cart, lines, count, totalPrice, deliveryFee }
 * @event back 点 Banner 返回钮
 */
export default defineComponent({
  name: 'LingyunOrderGoods',
  emits: [
    'update:modelValue',
    'change',
    'category-change',
    'goods-click',
    'spec-request',
    'cart-clear',
    'checkout',
    'back',
  ],
  props: {
    store: {
      type: Object as PropType<LingyunOrderStore>,
      required: true,
    },
    categories: {
      type: Array as PropType<LingyunOrderCategory[]>,
      default: () => [],
    },
    modelValue: {
      type: Object as PropType<LingyunOrderCart>,
      default: () => ({}),
    },
    banner: { type: String, default: '' },
    bannerHeight: { type: Number, default: 140 },
    showBack: { type: Boolean, default: true },
    showNav: { type: Boolean, default: true },
    showToolbar: { type: Boolean, default: false },
    title: { type: String, default: '' },
    minPrice: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    currency: { type: String, default: '¥' },
    maxCount: { type: Number, default: 99 },
    checkoutText: { type: String, default: '去结算' },
    cartTitle: { type: String, default: '已选商品' },
    clearText: { type: String, default: '清空' },
    emptyText: { type: String, default: '暂无商品' },
    emptyCartText: { type: String, default: '未选购商品' },
    soldOutText: { type: String, default: '商品已售罄' },
    specButtonText: { type: String, default: '选规格' },
    /** 数量单位，如「件」；商品上的 quantityUnit 优先 */
    quantityUnit: { type: String, default: '' },
    /** 价格小数位；-1 去掉多余的 0，2 固定两位 */
    priceDecimals: { type: Number, default: -1 },
    accentColor: { type: String, default: '' },
    safeArea: { type: Boolean, default: true },
  },
  data() {
    return {
      uid: `og${Math.random().toString(36).slice(2, 8)}`,
      activeKey: '',
      railIntoId: '',
      listIntoId: '',
      listScrollTop: 0,
      sectionTops: [] as number[],
      offsetsReady: false,
      spyLockedUntil: 0,
      cartOpen: false,
      _measureTimer: null as ReturnType<typeof setTimeout> | null,
      _spyTimers: [] as ReturnType<typeof setTimeout>[],
    }
  },
  computed: {
    rootClass(): Record<string, boolean> {
      return {
        'lingyun-order-goods--no-banner': this.bannerHeight <= 0,
      }
    },
    rootStyle(): Record<string, string> {
      return {
        '--ly-og-accent': this.accentColor || FALLBACK_ACCENT,
      }
    },
    hasRating(): boolean {
      return this.store.rating !== undefined && this.store.rating !== ''
    },
    storeMetaParts(): string[] {
      return [this.store.salesText || '', this.store.deliveryText || ''].filter(Boolean)
    },
    cartMap(): LingyunOrderCart {
      return this.modelValue || {}
    },
    cartLines(): LingyunOrderCartLine[] {
      const lines: LingyunOrderCartLine[] = []
      this.categories.forEach((category) => {
        ;(category.goods || []).forEach((item) => {
          const quantity = this.quantityOf(item)
          if (quantity > 0) lines.push({ item, categoryKey: category.key, quantity })
        })
      })
      return lines
    },
    cartCount(): number {
      return this.cartLines.reduce((sum, line) => sum + line.quantity, 0)
    },
    cartTotal(): number {
      const total = this.cartLines.reduce(
        (sum, line) => sum + line.item.price * line.quantity,
        0,
      )
      return Math.round(total * 100) / 100
    },
    hasGoods(): boolean {
      return this.categories.some((category) => (category.goods || []).length > 0)
    },
  },
  watch: {
    categories: {
      immediate: true,
      deep: true,
      handler() {
        this.initActive()
        this.scheduleMeasure()
      },
    },
    activeKey(key: string) {
      if (key) this.railIntoId = this.railIdOfKey(key)
    },
  },
  mounted() {
    this.initActive()
    this.scheduleMeasure()
    this._spyTimers = [120, 420].map((delay) =>
      setTimeout(() => this.measureSections(), delay),
    )
  },
  beforeUnmount() {
    clearTimeout(this._measureTimer ?? undefined)
    this._spyTimers.forEach((timer) => clearTimeout(timer))
    this._measureTimer = null
    this._spyTimers = []
  },
  methods: {
    firstChar(value: unknown): string {
      const text = String(value == null ? '' : value).trim()
      return Array.from(text)[0] || '商'
    },
    metaText(item: LingyunOrderGoods): string {
      return [item.specText || '', item.salesText || ''].filter(Boolean).join(' · ')
    },
    formatPrice(value: unknown): string {
      const number = Number(value)
      const safe = Number.isFinite(number) ? number : 0
      if (this.priceDecimals >= 0) return safe.toFixed(this.priceDecimals)
      return String(Number(safe.toFixed(2)))
    },
    quantityUnitOf(item: LingyunOrderGoods): string {
      return item.quantityUnit || this.quantityUnit
    },
    hasCategoryBadge(category: LingyunOrderCategory): boolean {
      const badge = category.badge
      return badge !== undefined && badge !== null && badge !== ''
    },
    railIdOf(category: LingyunOrderCategory): string {
      return this.railIdOfKey(category.key)
    },
    railIdOfKey(key: string): string {
      return `${this.uid}-cat-${sanitizeKey(key)}`
    },
    sectionIdOf(category: LingyunOrderCategory): string {
      return `${this.uid}-sec-${sanitizeKey(category.key)}`
    },
    initActive(): void {
      const list = this.categories || []
      if (!list.length) {
        this.activeKey = ''
        return
      }
      if (list.some((category) => category.key === this.activeKey)) return
      this.activeKey = list[0].key
    },
    quantityOf(item: LingyunOrderGoods): number {
      const quantity = Number(this.cartMap[item.key])
      return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0
    },
    /** 多规格商品没有统一价（price=0）时不画价格，只留「选规格」 */
    showPrice(item: LingyunOrderGoods): boolean {
      return !item.multiSpec || Number(item.price) > 0
    },
    itemMax(item: LingyunOrderGoods): number {
      return item.max != null && Number.isFinite(Number(item.max))
        ? Number(item.max)
        : this.maxCount
    },
    itemStep(item: LingyunOrderGoods): number {
      return item.step != null && Number(item.step) > 0 ? Number(item.step) : 1
    },
    countOf(cart: LingyunOrderCart): number {
      return this.categories.reduce(
        (sum, category) =>
          sum +
          (category.goods || []).reduce((groupSum, item) => {
            const quantity = Number(cart[item.key])
            return groupSum + (Number.isFinite(quantity) && quantity > 0 ? quantity : 0)
          }, 0),
        0,
      )
    },
    totalOf(cart: LingyunOrderCart): number {
      const total = this.categories.reduce(
        (sum, category) =>
          sum +
          (category.goods || []).reduce((groupSum, item) => {
            const quantity = Number(cart[item.key])
            return groupSum + (Number.isFinite(quantity) && quantity > 0 ? quantity : 0) * item.price
          }, 0),
        0,
      )
      return Math.round(total * 100) / 100
    },
    setQuantity(item: LingyunOrderGoods, value: unknown): void {
      if (item.soldOut) return
      const raw = Number(value)
      const safe = Number.isFinite(raw) ? Math.floor(raw) : 0
      const quantity = Math.max(0, Math.min(this.itemMax(item), safe))
      if (quantity === this.quantityOf(item)) return
      const cart: LingyunOrderCart = { ...this.cartMap }
      if (quantity > 0) cart[item.key] = quantity
      else delete cart[item.key]
      this.$emit('update:modelValue', cart)
      const payload: LingyunOrderChangePayload = {
        item,
        quantity,
        cart,
        count: this.countOf(cart),
        totalPrice: this.totalOf(cart),
      }
      this.$emit('change', payload)
    },
    onPlus(item: LingyunOrderGoods, category: LingyunOrderCategory): void {
      if (item.soldOut) return
      if (item.multiSpec) {
        const payload: LingyunOrderSpecPayload = { item, categoryKey: category.key }
        this.$emit('spec-request', payload)
        return
      }
      this.setQuantity(item, this.quantityOf(item) + this.itemStep(item))
    },
    onItemQuantity(item: LingyunOrderGoods, value: unknown): void {
      this.setQuantity(item, value)
    },
    onGoodsClick(item: LingyunOrderGoods, category: LingyunOrderCategory): void {
      const payload: LingyunOrderGoodsClickPayload = { item, categoryKey: category.key }
      this.$emit('goods-click', payload)
    },
    openCart(): void {
      if (this.cartCount <= 0) return
      this.cartOpen = true
    },
    clearCart(): void {
      const cart: LingyunOrderCart = {}
      this.$emit('update:modelValue', cart)
      this.$emit('cart-clear', { cart, count: 0, totalPrice: 0 })
      this.cartOpen = false
    },
    onCheckout(): void {
      const payload: LingyunOrderCheckoutPayload = {
        cart: { ...this.cartMap },
        lines: this.cartLines,
        count: this.cartCount,
        totalPrice: this.cartTotal,
        deliveryFee: this.deliveryFee,
      }
      this.$emit('checkout', payload)
    },
    selectCategory(category: LingyunOrderCategory, index: number): void {
      this.applyActive(category, index, true)
      const target = this.sectionIdOf(category)
      /* 同一个分类重复点击也要能回到顶部：先清空再下一帧写入 */
      this.listIntoId = ''
      this.$nextTick(() => {
        this.listIntoId = target
      })
      this.spyLockedUntil = Date.now() + 460
    },
    onListScroll(event: ScrollEvent): void {
      const top = Number(event && event.detail && event.detail.scrollTop)
      if (!Number.isFinite(top) || top < 0) return
      this.listScrollTop = top
      if (!this.offsetsReady || Date.now() < this.spyLockedUntil) return
      this.syncActiveFromScroll(top)
    },
    syncActiveFromScroll(top: number): void {
      const tops = this.sectionTops
      if (!tops.length) return
      let index = 0
      for (let i = 0; i < tops.length; i += 1) {
        if (tops[i] <= top + 8) index = i
        else break
      }
      const category = this.categories[index]
      if (!category || category.key === this.activeKey) return
      this.applyActive(category, index, true)
    },
    applyActive(
      category: LingyunOrderCategory,
      index: number,
      emitEvent: boolean,
    ): void {
      if (!category || category.key === this.activeKey) return
      this.activeKey = category.key
      this.railIntoId = this.railIdOf(category)
      if (emitEvent) {
        const payload: LingyunOrderCategoryChangePayload = {
          key: category.key,
          index,
        }
        this.$emit('category-change', payload)
      }
    },
    scheduleMeasure(): void {
      clearTimeout(this._measureTimer ?? undefined)
      this._measureTimer = setTimeout(() => {
        this._measureTimer = null
        this.measureSections()
      }, 90)
    },
    measureSections(): void {
      if (!this.categories.length) return
      this.$nextTick(() => {
        try {
          const query = uni.createSelectorQuery().in(this)
          query.select('.lingyun-order-goods__list').boundingClientRect()
          this.categories.forEach((category) => {
            query.select(`#${this.sectionIdOf(category)}`).boundingClientRect()
          })
          query.exec((result) => {
            const list = result && result[0]
            if (!list || typeof list.top !== 'number') {
              this.offsetsReady = false
              return
            }
            const tops: number[] = []
            for (let i = 0; i < this.categories.length; i += 1) {
              const rect = result[i + 1]
              tops.push(
                rect
                  ? Math.max(0, Number(rect.top) - Number(list.top) + this.listScrollTop)
                  : 0,
              )
            }
            this.sectionTops = tops
            this.offsetsReady = true
          })
        } catch {
          this.offsetsReady = false
        }
      })
    },
  },
})
</script>

<style lang="scss">
@import '../../../lingyun-ui/styles/variables.scss';

.lingyun-order-goods {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  box-sizing: border-box;
  background-color: var(--lingyun-bg-secondary, #{$lingyun-bg-secondary});
}

/* ---------- 店铺头 ---------- */

.lingyun-order-goods__header {
  flex-shrink: 0;
}

.lingyun-order-goods__banner {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.lingyun-order-goods__banner-img {
  width: 100%;
  height: 100%;
  display: block;
}

.lingyun-order-goods__banner-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(128deg, rgba(0, 136, 255, 0.3), rgba(94, 92, 230, 0.2));
}

.lingyun-order-goods__back {
  position: absolute;
  top: 8px;
  left: 16px;
  width: 44px;
  height: 44px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  @include lingyun-glass-control;
}

/* 没有 Banner 时给返回钮一条与工具栏同高的顶行 */
.lingyun-order-goods__back-row {
  height: 60px;
  padding: 8px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-order-goods__back-row .lingyun-order-goods__back {
  position: static;
}

.lingyun-order-goods__back--hover {
  transform: scale(0.94);
}

.lingyun-order-goods__banner-actions {
  position: absolute;
  top: 8px;
  right: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.lingyun-order-goods__store {
  position: relative;
  margin: 0 12px;
  padding: 14px 14px 12px;
  box-sizing: border-box;
  border-radius: 18px;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.lingyun-order-goods__store--attached {
  margin-top: -28px;
}

.lingyun-order-goods--no-banner .lingyun-order-goods__store {
  margin-top: 12px;
}

.lingyun-order-goods__store-head {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-order-goods__logo {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-order-goods__logo-img {
  width: 52px;
  height: 52px;
  display: block;
}

.lingyun-order-goods__logo-text {
  font-size: 22px;
  font-weight: 600;
  line-height: 26px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__store-main {
  flex: 1;
  min-width: 0;
  margin-left: 12px;
}

.lingyun-order-goods__store-name {
  display: block;
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-order-goods__store-meta {
  margin-top: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.lingyun-order-goods__rating {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-order-goods__rating-text {
  margin-left: 2px;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__dot {
  margin: 0 5px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-order-goods__meta-text {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__notice {
  margin-top: 10px;
  padding: 6px 8px;
  box-sizing: border-box;
  border-radius: 8px;
  background-color: var(--lingyun-fill-quaternary, #{$lingyun-fill-quaternary});
}

.lingyun-order-goods__notice-text {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

/* ---------- 左右布局 ---------- */

.lingyun-order-goods__body {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.lingyun-order-goods__rail {
  flex-shrink: 0;
  width: 88px;
  height: 100%;
  background-color: var(--lingyun-bg-secondary, #{$lingyun-bg-secondary});
}

.lingyun-order-goods__rail-inner {
  padding: 6px 0 18px;
  box-sizing: border-box;
}

.lingyun-order-goods__rail-item {
  position: relative;
  min-height: 54px;
  padding: 8px 8px 8px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  transition: background-color 0.16s ease;
}

.lingyun-order-goods__rail-item--active {
  background-color: var(--lingyun-bg-tertiary, #{$lingyun-bg-tertiary});
  border-radius: 0 12px 12px 0;
}

.lingyun-order-goods__rail-item--hover {
  background-color: var(--lingyun-fill-quaternary, #{$lingyun-fill-quaternary});
}

.lingyun-order-goods__rail-bar {
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 18px;
  margin-top: -9px;
  border-radius: 0 2px 2px 0;
  background-color: transparent;
}

.lingyun-order-goods__rail-item--active .lingyun-order-goods__rail-bar {
  background-color: var(--ly-og-accent, #{$lingyun-system-blue});
}

.lingyun-order-goods__rail-text {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__rail-item--active .lingyun-order-goods__rail-text {
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__rail-badge {
  flex-shrink: 0;
  margin-left: 2px;
  display: flex;
  align-items: center;
}

.lingyun-order-goods__list {
  flex: 1;
  min-width: 0;
  height: 100%;
  background-color: var(--lingyun-bg-tertiary, #{$lingyun-bg-tertiary});
}

.lingyun-order-goods__list-inner {
  padding: 0 12px;
  box-sizing: border-box;
}

.lingyun-order-goods__section {
  padding-top: 2px;
}

.lingyun-order-goods__section-title {
  display: block;
  padding: 12px 2px 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__goods {
  display: flex;
  flex-direction: row;
  padding: 12px 0;
  border-bottom: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-order-goods__media {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
}

.lingyun-order-goods__media-img {
  width: 76px;
  height: 76px;
  display: block;
}

.lingyun-order-goods__media-empty {
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-order-goods__media-char {
  font-size: 26px;
  font-weight: 600;
  line-height: 30px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-order-goods__goods-main {
  flex: 1;
  min-width: 0;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
}

.lingyun-order-goods__name-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.lingyun-order-goods__name {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.lingyun-order-goods__tag {
  flex-shrink: 0;
  margin-left: 6px;
  padding: 1px 4px;
  box-sizing: border-box;
  border: 0.5px solid var(--lingyun-system-orange, #{$lingyun-system-orange});
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  line-height: 14px;
  color: var(--lingyun-system-orange, #{$lingyun-system-orange});
}

.lingyun-order-goods__meta {
  margin-top: 3px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-order-goods__details {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
}

.lingyun-order-goods__detail {
  font-size: 12px;
  line-height: 17px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__bottom {
  margin-top: auto;
  padding-top: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

.lingyun-order-goods__price {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.lingyun-order-goods__currency {
  font-size: 11px;
  font-weight: 600;
  line-height: 14px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__amount {
  margin-left: 1px;
  font-size: 19px;
  font-weight: 600;
  line-height: 24px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__price-unit {
  margin-left: 2px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__original {
  margin-left: 5px;
  font-size: 11px;
  line-height: 14px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
  text-decoration: line-through;
}

.lingyun-order-goods__action {
  flex-shrink: 0;
  height: 30px;
  margin-left: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-order-goods__plus {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ly-og-accent, #{$lingyun-system-blue});
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.16);
}

.lingyun-order-goods__plus-count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  box-sizing: border-box;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-system-red, #{$lingyun-system-red});
}

.lingyun-order-goods__plus-count-text {
  font-size: 10px;
  font-weight: 600;
  line-height: 12px;
  color: #ffffff;
}

.lingyun-order-goods__plus--hover {
  transform: scale(0.92);
}

.lingyun-order-goods__spec-btn {
  position: relative;
  height: 28px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ly-og-accent, #{$lingyun-system-blue});
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.16);
}

.lingyun-order-goods__spec-btn--hover {
  transform: scale(0.94);
}

.lingyun-order-goods__spec-btn-text {
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  color: #ffffff;
  white-space: nowrap;
}

.lingyun-order-goods__soldout {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-system-orange, #{$lingyun-system-orange});
  white-space: nowrap;
}

.lingyun-order-goods__empty {
  padding: 48px 0;
}

.lingyun-order-goods__list-pad {
  height: 24px;
}

/* ---------- 购物车栏（使用 lingyun-goods-nav cart 变体） ---------- */

.lingyun-order-goods__cart-wrap {
  flex-shrink: 0;
}

.lingyun-order-goods__cart-wrap--safe {
  padding-bottom: 21px;
}

/* ---------- 已选商品 ---------- */

.lingyun-order-goods__clear {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
}

.lingyun-order-goods__clear--hover {
  opacity: 0.6;
}

.lingyun-order-goods__clear-text {
  font-size: 14px;
  line-height: 20px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-order-goods__cart-sheet {
  padding: 4px 16px 0;
  box-sizing: border-box;
}

.lingyun-order-goods__cart-line {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 0;
  border-bottom: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-order-goods__cart-media {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.lingyun-order-goods__cart-media-img {
  width: 52px;
  height: 52px;
  display: block;
}

.lingyun-order-goods__cart-media-empty {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-order-goods__cart-line-main {
  flex: 1;
  min-width: 0;
  margin: 0 10px;
  display: flex;
  flex-direction: column;
}

.lingyun-order-goods__cart-line-name {
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-order-goods__cart-line-spec {
  margin-top: 1px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-order-goods__cart-line-price {
  margin-top: 3px;
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.lingyun-order-goods__cart-line-amount {
  margin-left: 1px;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-order-goods__cart-empty-state {
  padding: 48px 0;
  text-align: center;
}

.lingyun-order-goods__cart-empty-text {
  font-size: 14px;
  line-height: 20px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-order-goods__sheet-pad {
  height: 24px;
}

/* 深色模式下加购钮阴影弱一些 */
.theme-dark .lingyun-order-goods__plus {
  box-shadow: none;
}
</style>
