<template>
  <view class="lingyun-goods-nav" :class="rootClass" :style="barStyle">
    <template v-if="isCartVariant">
      <view
        class="lingyun-goods-nav__cart-icon-wrap"
        role="button"
        aria-label="购物车"
        @click="onCartTap"
      >
        <view class="lingyun-goods-nav__cart-icon">
          <lingyun-icon type="cart-filled" :size="24" color="#ffffff" />
        </view>
        <view v-if="cartCountValue > 0" class="lingyun-goods-nav__cart-badge">
          <lingyun-badge :text="cartCountValue" :max="99" />
        </view>
      </view>
      <view class="lingyun-goods-nav__cart-info" @click="onCartTap">
        <template v-if="cartCountValue > 0">
          <view class="lingyun-goods-nav__cart-price">
            <text class="lingyun-goods-nav__cart-currency">{{ currency }}</text>
            <text class="lingyun-goods-nav__cart-amount">{{ formatPrice(totalValue) }}</text>
          </view>
          <text class="lingyun-goods-nav__cart-sub">{{ cartSubText }}</text>
        </template>
        <template v-else>
          <text class="lingyun-goods-nav__cart-empty">{{ emptyText }}</text>
          <text v-if="minPrice > 0" class="lingyun-goods-nav__cart-sub">
            {{ currency }}{{ formatPrice(minPrice) }}起送
          </text>
        </template>
      </view>
      <view
        class="lingyun-goods-nav__checkout"
        :class="{ 'lingyun-goods-nav__checkout--disabled': !canCheckout }"
        hover-class="lingyun-goods-nav__checkout--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        @click="onCheckoutTap"
      >
        <text class="lingyun-goods-nav__checkout-text">{{ checkoutLabel }}</text>
      </view>
    </template>
    <template v-else>
    <view v-if="options.length" class="lingyun-goods-nav__options">
      <view
        v-for="(item, index) in options"
        :key="item.key"
        class="lingyun-goods-nav__option"
        hover-class="lingyun-goods-nav__option--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        @click="onOption(index, item)"
      >
        <view class="lingyun-goods-nav__icon-wrap">
          <lingyun-icon :type="item.icon" :size="22" color="var(--lingyun-label-glass, #1a1a1a)" />
          <view v-if="hasBadge(item)" class="lingyun-goods-nav__badge">
            <lingyun-badge :text="badgeText(item)" :dot="badgeDot(item)" />
          </view>
        </view>
        <text v-if="item.text" class="lingyun-goods-nav__label">{{ item.text }}</text>
      </view>
    </view>
    <view
      v-if="buttons.length"
      class="lingyun-goods-nav__actions"
      :class="{ 'lingyun-goods-nav__actions--fill': fill || !options.length }"
    >
      <view
        v-for="(item, index) in buttons"
        :key="item.key"
        class="lingyun-goods-nav__btn"
        :class="buttonClass(index)"
        hover-class="lingyun-goods-nav__btn--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        @click="onButton(index, item)"
      >
        <text class="lingyun-goods-nav__btn-text">{{ item.text }}</text>
      </view>
    </view>
    </template>
  </view>
</template>

<script lang="ts">
import { defineComponent, inject, ref, type PropType } from 'vue'
import { LINGYUN_APP_PAGE_NAV_INSET } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

type GoodsNavOption = {
  key?: string | number
  icon: string
  text?: string
  info?: string | number | boolean | null
  badge?: string | number | boolean | null
}

type GoodsNavButton = {
  key?: string | number
  text?: string | number
}

type ResolvedGoodsButton = {
  key: string
  text: string
  raw: GoodsNavButton
}

/**
 * lingyun-goods-nav
 * @description 商品底栏。默认结构对齐 uni-goods-nav：左侧图标入口 + 右侧胶囊按钮组；
 * `variant="cart"` 时是点单页同款购物车结算栏：玻璃胶囊 + 购物车角标 + 合计 + 结算。
 * 视觉走 Liquid Glass：控件玻璃，按钮用系统蓝，禁止红橙渐变实心条。
 * @see design/GOODS_NAV.md
 *
 * @property {String} variant default / cart
 * @property {Array} options [{ icon, text, info, badge }]（default）
 * @property {Array} buttonGroup [{ text }] 末项为 Bordered Prominent，其余为 Bordered（default）
 * @property {Boolean} fill 按钮组占满剩余宽度（默认 true）
 * @property {Boolean} fixed 贴底悬浮（默认 true）
 * @property {Boolean} safeArea 预留底部安全区（默认 true）
 * @property {Number|String} cartCount cart 变体：购物车数量
 * @property {Number|String} total cart 变体：合计金额
 * @property {Number} minPrice cart 变体：起送价
 * @property {Number} deliveryFee cart 变体：配送费
 * @property {String} currency cart 变体：货币符号
 * @property {String} emptyText cart 变体：购物车为空文案
 * @property {String} checkoutText cart 变体：结算按钮文案
 * @property {Number} priceDecimals cart 变体：价格小数位，-1 去掉多余的 0
 * @property {String} accentColor cart 变体：购物车钮 / 结算钮主色
 * @event click 左侧入口 { index, content }
 * @event buttonClick 右侧按钮 { index, content }
 * @event cart cart 变体点购物车 { count, total }
 * @event checkout cart 变体点结算 { count, total, minPrice, deliveryFee }
 */
export default defineComponent({
  name: 'LingyunGoodsNav',
  setup() {
    return {
      pageNavInset: inject(LINGYUN_APP_PAGE_NAV_INSET, ref(0)),
    }
  },
  emits: ['click', 'buttonClick', 'cart', 'checkout'],
  props: {
    options: {
      type: Array as PropType<GoodsNavOption[]>,
      default: () => [
        { icon: 'shop', text: '店铺' },
        { icon: 'cart', text: '购物车' },
      ],
    },
    buttonGroup: {
      type: Array as PropType<GoodsNavButton[]>,
      default: () => [{ text: '加入购物车' }, { text: '立即购买' }],
    },
    fill: {
      type: Boolean,
      default: true,
    },
    fixed: {
      type: Boolean,
      default: true,
    },
    safeArea: {
      type: Boolean,
      default: true,
    },
    /** default：左侧入口 + 按钮组；cart：点单页同款购物车结算栏 */
    variant: { type: String, default: 'default' },
    /** cart 变体：购物车数量角标 */
    cartCount: { type: [Number, String] as PropType<number | string>, default: 0 },
    /** cart 变体：商品合计金额 */
    total: { type: [Number, String] as PropType<number | string>, default: 0 },
    /** cart 变体：起送价 */
    minPrice: { type: Number, default: 0 },
    /** cart 变体：配送费 */
    deliveryFee: { type: Number, default: 0 },
    /** cart 变体：货币符号 */
    currency: { type: String, default: '¥' },
    /** cart 变体：购物车为空文案 */
    emptyText: { type: String, default: '未选购商品' },
    /** cart 变体：可结算按钮文案 */
    checkoutText: { type: String, default: '去结算' },
    /** cart 变体：价格小数位；-1 去掉多余的 0 */
    priceDecimals: { type: Number, default: -1 },
    /** cart 变体：购物车圆钮 / 结算按钮主色 */
    accentColor: { type: String, default: '' },
  },
  data() {
    return {
      safeBottom: 0,
    }
  },
  computed: {
    isCartVariant(): boolean {
      return this.variant === 'cart'
    },
    rootClass() {
      return [
        this.fixed ? 'lingyun-goods-nav--fixed' : '',
        this.safeArea ? 'lingyun-goods-nav--safe' : '',
        this.isCartVariant ? 'lingyun-goods-nav--cart' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    barStyle() {
      const style: Record<string, string> = {}
      if (this.isCartVariant) {
        style['--ly-goods-nav-accent'] =
          this.accentColor || 'var(--lingyun-system-blue, #0088ff)'
        if (this.fixed) {
          const inset = Math.max(0, Number(this.pageNavInset) || 0)
          style.left = `${inset + 12}px`
          style.right = '12px'
          style.bottom = `${8 + (this.safeArea ? this.safeBottom : 0)}px`
        }
        return style
      }
      if (this.safeArea) style.paddingBottom = `${this.safeBottom}px`
      if (this.fixed) style.left = `${Math.max(0, Number(this.pageNavInset) || 0)}px`
      return style
    },
    cartCountValue(): number {
      const value = Number(this.cartCount)
      return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
    },
    totalValue(): number {
      const value = Number(this.total)
      return Number.isFinite(value) ? value : 0
    },
    canCheckout(): boolean {
      return this.cartCountValue > 0 && this.totalValue + 1e-6 >= this.minPrice
    },
    checkoutLabel(): string {
      if (this.canCheckout) return this.checkoutText
      if (this.minPrice > 0) {
        return `${this.currency}${this.formatPrice(this.minPrice)}起送`
      }
      return this.checkoutText
    },
    cartSubText(): string {
      if (this.deliveryFee > 0) {
        return `另需配送费${this.currency}${this.formatPrice(this.deliveryFee)}`
      }
      return `共 ${this.cartCountValue} 件`
    },
    buttons(): ResolvedGoodsButton[] {
      const list = Array.isArray(this.buttonGroup) ? this.buttonGroup : []
      return list
        .filter((item): item is GoodsNavButton & { text: string | number } => !!(item && item.text))
        .map((item, index) => ({
          key: item.key != null ? String(item.key) : `btn-${index}`,
          text: String(item.text),
          raw: item,
        }))
    },
  },
  mounted() {
    this.syncSafe()
  },
  methods: {
    syncSafe() {
      try {
        const info =
          typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
        const inset = info && info.safeAreaInsets
        this.safeBottom = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
      } catch {
        this.safeBottom = 0
      }
    },
    badgeRaw(item: GoodsNavOption | null | undefined): string | number | boolean {
      if (!item) return ''
      if (item.badge != null && item.badge !== false && item.badge !== '') return item.badge
      if (item.info != null && item.info !== false && item.info !== '' && item.info !== 0) return item.info
      return ''
    },
    hasBadge(item: GoodsNavOption | null | undefined): boolean {
      const raw = this.badgeRaw(item)
      return raw === true || raw === 'dot' || raw === 0 || !!raw
    },
    badgeDot(item: GoodsNavOption | null | undefined): boolean {
      const raw = this.badgeRaw(item)
      return raw === true || raw === 'dot'
    },
    badgeText(item: GoodsNavOption | null | undefined): string | number {
      if (this.badgeDot(item)) return ''
      const raw = this.badgeRaw(item)
      if (raw == null || typeof raw === 'boolean') return ''
      return raw
    },
    buttonClass(index: number): string {
      const last = index === this.buttons.length - 1
      return last ? 'lingyun-goods-nav__btn--prominent' : 'lingyun-goods-nav__btn--bordered'
    },
    formatPrice(value: unknown): string {
      const number = Number(value)
      const safe = Number.isFinite(number) ? number : 0
      if (this.priceDecimals >= 0) return safe.toFixed(this.priceDecimals)
      return String(Number(safe.toFixed(2)))
    },
    onCartTap() {
      this.$emit('cart', {
        count: this.cartCountValue,
        total: this.totalValue,
      })
    },
    onCheckoutTap() {
      if (!this.canCheckout) return
      this.$emit('checkout', {
        count: this.cartCountValue,
        total: this.totalValue,
        minPrice: this.minPrice,
        deliveryFee: this.deliveryFee,
      })
    },
    onOption(index: number, item: GoodsNavOption) {
      this.$emit('click', { index, content: item })
    },
    onButton(index: number, item: ResolvedGoodsButton) {
      this.$emit('buttonClick', { index, content: item.raw })
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-goods-nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 62px;
  padding: 8px 16px 8px 8px;
  gap: 8px;
  pointer-events: auto;

  &--fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 900;
    width: auto;
  }

  &__options {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    flex: 0 0 auto;
    height: 54px;
    padding: 0 4px;
    box-sizing: border-box;
    @include lingyun-glass-control;
  }

  &__option {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 56px;
    padding: 0 6px;
    box-sizing: border-box;
  }

  &__option--hover {
    opacity: 0.7;
  }

  &__icon-wrap {
    position: relative;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__badge {
    position: absolute;
    top: -8px;
    right: -12px;
    z-index: 1;
    pointer-events: none;
  }

  &__label {
    margin-top: 2px;
    font-size: 10px;
    font-weight: 600;
    line-height: 12px;
    color: var(--lingyun-label-glass, #{$lingyun-label-glass});
  }

  &__actions {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    flex: 0 1 auto;
    height: 46px;
    min-width: 0;
    overflow: hidden;
    border-radius: $lingyun-glass-radius-pill;
  }

  &__actions--fill {
    flex: 1;
  }

  &__btn {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-width: 88px;
    padding: 0 16px;
    box-sizing: border-box;
  }

  &__btn--bordered {
    color: var(--lingyun-primary, #{$lingyun-primary});
    background-color: var(--lingyun-primary-soft, #{rgba($lingyun-primary, 0.14)});
  }

  &__btn--prominent {
    color: #ffffff;
    background-color: var(--lingyun-primary, #{$lingyun-primary});
  }

  &__btn--hover {
    opacity: 0.72;
  }

  &__btn-text {
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
    color: inherit;
  }
}

/* cart 变体：与 lingyun-order-goods 的底部购物车一致 */
.lingyun-goods-nav--cart {
  width: auto;
  min-height: 62px;
  /* 左侧和购物车圆钮的上下间距对齐（62 - 48）/ 2 */
  padding: 0 14px 0 7px;
  gap: 0;
  margin: 0 12px 8px;
  border-radius: 31px;
  @include lingyun-glass-control;
}

.lingyun-goods-nav--cart.lingyun-goods-nav--fixed {
  width: auto;
  margin: 0;
}

.lingyun-goods-nav__cart-icon-wrap {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.lingyun-goods-nav__cart-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ly-goods-nav-accent, #{$lingyun-system-blue});
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
}

.lingyun-goods-nav__cart-badge {
  position: absolute;
  top: -3px;
  /* 左侧固定，数字变多往右撑开，不往左盖住购物车图标和价格 */
  left: 26px;
}

.lingyun-goods-nav__cart-info {
  flex: 1;
  min-width: 0;
  /* 空车文案与合计金额的上下两行占同样的高度，切换时不抖动 */
  min-height: 42px;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.lingyun-goods-nav__cart-price {
  height: 26px;
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.lingyun-goods-nav__cart-currency {
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-goods-nav__cart-amount {
  margin-left: 1px;
  font-size: 22px;
  font-weight: 600;
  line-height: 26px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-goods-nav__cart-empty {
  font-size: 15px;
  font-weight: 500;
  line-height: 26px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-goods-nav__cart-sub {
  margin-top: 1px;
  font-size: 11px;
  line-height: 15px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-goods-nav__checkout {
  flex-shrink: 0;
  height: 40px;
  min-width: 104px;
  margin-left: 10px;
  padding: 0 18px;
  box-sizing: border-box;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ly-goods-nav-accent, #{$lingyun-system-blue});
}

.lingyun-goods-nav__checkout--hover {
  transform: scale(0.97);
}

.lingyun-goods-nav__checkout--disabled {
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  pointer-events: none;
}

.lingyun-goods-nav__checkout-text {
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: #ffffff;
}

.lingyun-goods-nav__checkout--disabled .lingyun-goods-nav__checkout-text {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.theme-dark .lingyun-goods-nav__cart-icon {
  box-shadow: none;
}
</style>
