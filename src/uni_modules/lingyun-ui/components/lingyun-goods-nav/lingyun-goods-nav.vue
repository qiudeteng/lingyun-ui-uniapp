<template>
  <view class="lingyun-goods-nav" :class="rootClass" :style="barStyle">
    <template v-if="isCartVariant">
      <!-- 点击卡片外收起：遮罩与卡片同层，卡片在上；全屏根节点让遮罩覆盖整页并拦截手势 -->
      <view
        v-if="detailMounted"
        class="lingyun-goods-nav__detail-mask"
        @click="closeDetail"
        @touchmove.stop.prevent
      />
      <!-- 详情与购物车同一张卡：详情在上、购物车栏在下，展开时整卡向上增高 -->
      <view
        class="lingyun-goods-nav__card"
        :style="cardStyle"
        @touchmove.stop="onCardTouchMove"
      >
        <view
          v-if="detailMounted"
          class="lingyun-goods-nav__detail"
          :style="detailStyle"
          role="region"
          aria-label="购物车详情"
        >
          <view class="lingyun-goods-nav__detail-head">
            <lingyun-button
              class="lingyun-goods-nav__detail-close"
              variant="glass"
              size="small"
              aria-label="关闭购物车详情"
              @click.stop="closeDetail"
            >
              <template #icon>
                <lingyun-icon type="closeempty" :size="20" color="label" />
              </template>
            </lingyun-button>
            <view class="lingyun-goods-nav__detail-head-main">
              <slot name="detail-header" />
            </view>
          </view>
          <scroll-view
            class="lingyun-goods-nav__detail-scroll"
            scroll-y
            :show-scrollbar="false"
            :style="detailScrollStyle"
          >
            <view class="lingyun-goods-nav__detail-content">
              <slot name="detail" />
            </view>
          </scroll-view>
        </view>
        <view class="lingyun-goods-nav__cart-bar">
          <view
            class="lingyun-goods-nav__cart-icon-wrap"
            :class="{ 'lingyun-goods-nav__cart-icon-wrap--pop': cartPop }"
            @click="onCartTap"
          >
            <lingyun-button variant="borderedProminent" size="large" :style="accentButtonStyle" aria-label="购物车">
              <template #icon>
                <lingyun-icon type="cart-filled" :size="24" color="#ffffff" />
              </template>
            </lingyun-button>
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
          <lingyun-button
            class="lingyun-goods-nav__checkout"
            variant="borderedProminent"
            size="medium"
            :text="checkoutLabel"
            :disabled="!canCheckout"
            :style="accentButtonStyle"
            @click="onCheckoutTap"
          />
        </view>
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
        <view v-for="(item, index) in buttons" :key="item.key" class="lingyun-goods-nav__action">
          <lingyun-button
            :text="item.text"
            :variant="buttonVariant(index)"
            size="large"
            :block="fill || !options.length"
            @click="onButton(index, item)"
          />
        </view>
      </view>
    </template>
  </view>
</template>

<script lang="ts">
import { defineComponent, inject, ref, type PropType } from 'vue'
import { LINGYUN_APP_PAGE_NAV_INSET } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'
import { useLingyunTheme } from '../../utils/theme'

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

type DetailOpenOptions = {
  /** 详情区域高度 px（含关闭按钮所在顶栏）；0 恢复自动高度 */
  height?: number
  /** 详情区域最大高度 px；0 恢复按视口自动计算 */
  maxHeight?: number
  /** 自动最大高度时距屏幕顶部的留白 px */
  topGap?: number
}

/** cart 变体购物车栏内容高度 */
const CART_BAR_HEIGHT_PX = 62
/** 详情最小可视高度，窗口极矮时也不至于不可用 */
const DETAIL_MIN_PX = 80
/** 测量失败时的详情顶栏兜底高度 */
const DETAIL_HEAD_FALLBACK_PX = 48
/** 详情收起动画时长，需大于 CSS height 过渡 */
const DETAIL_LEAVE_MS = 360

/**
 * lingyun-goods-nav
 * @description 商品底栏。默认结构对齐 uni-goods-nav：左侧图标入口 + 右侧胶囊按钮组；
 * `variant="cart"` 时是点单页同款购物车结算栏：玻璃胶囊 + 购物车角标 + 合计 + 结算。
 * `detail` 开启后，点购物车（或调用 openDetail）会让整张购物车卡片向上增高，
 * 详情与购物车栏是同一张玻璃卡；内容由 #detail-header / #detail 插槽注入。
 * 高度随内容自动撑开，并以 detailMaxHeight / detailTopGap 封顶；点卡片外或左上角关闭。
 * 视觉走 Liquid Glass：控件玻璃。操作按钮、结算、购物车圆钮、关闭钮都用 lingyun-button。
 * @see design/GOODS_NAV.md
 *
 * @property {String} variant default / cart
 * @property {Array} options [{ icon, text, info, badge }]（default）
 * @property {Array} buttonGroup [{ text }] 末项 borderedProminent，其余 bordered（default）
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
 * @property {Boolean} detail 开启购物车详情：点购物车让底栏卡片向上增高
 * @property {Boolean} detailOpen 受控展开状态；不传时由组件内部维护
 * @property {Number} detailHeight 详情区域固定高度 px（含顶栏）；0 按内容自动
 * @property {Number} detailMaxHeight 详情区域最大高度 px；0 按视口自动
 * @property {Number} detailTopGap 自动最大高度时距屏幕顶部保留 px
 * @property {String|Number} detailVersion 详情内容版本；变化时重新测量高度
 * @event click 左侧入口 { index, content }
 * @event buttonClick 右侧按钮 { index, content }
 * @event cart cart 变体点购物车 { count, total }
 * @event checkout cart 变体点结算 { count, total, minPrice, deliveryFee }
 * @event update:detailOpen 详情展开 / 收起
 * @event detail-open 详情展开
 * @event detail-close 详情收起
 */
export default defineComponent({
  name: 'LingyunGoodsNav',
  setup() {
    return {
      pageNavInset: inject(LINGYUN_APP_PAGE_NAV_INSET, ref(0)),
    }
  },
  emits: [
    'click',
    'buttonClick',
    'cart',
    'checkout',
    'update:detailOpen',
    'detail-open',
    'detail-close',
  ],
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
    /** 开启购物车详情：点购物车让底栏卡片向上增高 */
    detail: { type: Boolean, default: false },
    /** 受控展开状态；不传时由组件内部维护，可通过 openDetail / closeDetail 控制 */
    detailOpen: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    /** 详情区域固定高度 px（含顶栏）；0 按内容自动撑开 */
    detailHeight: { type: Number, default: 0 },
    /** 详情区域最大高度 px；0 按视口高度与 detailTopGap 自动计算 */
    detailMaxHeight: { type: Number, default: 0 },
    /** 自动最大高度时距屏幕顶部保留的留白 px */
    detailTopGap: { type: Number, default: 120 },
    /** 详情内容版本：变化时重新测量高度（如行数 / 行高变化） */
    detailVersion: {
      type: [String, Number] as PropType<string | number>,
      default: '',
    },
  },
  data() {
    return {
      safeBottom: 0,
      windowHeight: 667,
      windowWidth: 375,
      /** 加购时购物车圆钮放大回弹 */
      cartPop: false,
      /** 详情已挂载（含收起动画期） */
      detailMounted: false,
      detailUncontrolled: false,
      /** 详情区域当前高度（px）；展开 / 收起通过 height 过渡 */
      detailViewPx: 0,
      /** 详情区域最大高度（px） */
      detailMaxPx: 0,
      /** 实测的详情顶栏高度 */
      detailHeadPx: 0,
      /** 实测的详情内容自然高度 */
      detailContentPx: 0,
      /** 首次展开时让 scroll-view 暂时按内容高度布局，便于测量 */
      detailMeasuring: false,
      detailHeightOverride: null as number | null,
      detailMaxHeightOverride: null as number | null,
      detailTopGapOverride: null as number | null,
      _detailLeaveTimer: null as ReturnType<typeof setTimeout> | null,
      _detailMeasureTimer: null as ReturnType<typeof setTimeout> | null,
      _detailPageMounted: false,
      _detailResizeHandler: null as (() => void) | null,
      _cartPopTimer: null as ReturnType<typeof setTimeout> | null,
    }
  },
  computed: {
    isCartVariant(): boolean {
      return this.variant === 'cart'
    },
    themeClass(): string {
      try {
        return useLingyunTheme().rootClass || 'theme-light'
      } catch {
        return 'theme-light'
      }
    },
    rootClass() {
      return [
        this.fixed ? 'lingyun-goods-nav--fixed' : '',
        this.safeArea ? 'lingyun-goods-nav--safe' : '',
        this.isCartVariant ? 'lingyun-goods-nav--cart' : '',
        this.isCartVariant ? this.themeClass : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    accentButtonStyle(): Record<string, string> {
      if (!this.accentColor) return {}
      return { '--lingyun-primary': this.accentColor }
    },
    barStyle() {
      const style: Record<string, string> = {}
      if (this.isCartVariant) {
        style['--ly-goods-nav-accent'] =
          this.accentColor || 'var(--lingyun-system-blue, #0088ff)'
        return style
      }
      if (this.safeArea) style.paddingBottom = `${this.safeBottom}px`
      if (this.fixed) style.left = `${Math.max(0, Number(this.pageNavInset) || 0)}px`
      return style
    },
    /** 贴底时卡片自己定位在底部，外层 fixed 根节点负责整屏遮罩 */
    cardStyle(): Record<string, string> {
      if (!this.isCartVariant || !this.fixed) return {}
      const inset = Math.max(0, Number(this.pageNavInset) || 0)
      return {
        left: `${inset + 12}px`,
        right: '12px',
        bottom: `${8 + (this.safeArea ? this.safeBottom : 0)}px`,
      }
    },
    /** 详情能力：cart 变体 + detail 开启 */
    detailEnabled(): boolean {
      return this.isCartVariant && !!this.detail
    },
    /** 详情是否受控：传了 detailOpen 就完全跟随外部 */
    detailControlled(): boolean {
      return this.detailOpen !== undefined && this.detailOpen !== null
    },
    detailVisible(): boolean {
      if (this.detailControlled) return !!this.detailOpen
      return this.detailUncontrolled
    },
    effectiveDetailHeight(): number {
      if (this.detailHeightOverride != null) return Math.max(0, this.detailHeightOverride)
      return Math.max(0, Number(this.detailHeight) || 0)
    },
    effectiveDetailMaxHeight(): number {
      if (this.detailMaxHeightOverride != null) {
        return Math.max(0, this.detailMaxHeightOverride)
      }
      return Math.max(0, Number(this.detailMaxHeight) || 0)
    },
    effectiveDetailTopGap(): number {
      if (this.detailTopGapOverride != null) return Math.max(0, this.detailTopGapOverride)
      return Math.max(0, Number(this.detailTopGap) || 0)
    },
    detailStyle(): Record<string, string> {
      return {
        height: `${Math.max(0, Math.round(this.detailViewPx))}px`,
      }
    },
    /** 首次测量时先按内容高度布局，避免 scroll-view 把内容高度压成 0 */
    detailScrollStyle(): Record<string, string> {
      return this.detailMeasuring ? { height: 'auto', flex: '0 0 auto' } : {}
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
  watch: {
    detailVisible: {
      immediate: true,
      handler(value: boolean) {
        if (!this._detailPageMounted || !this.detailEnabled) return
        if (value) this.openDetailAnim()
        else this.closeDetailAnim()
      },
    },
    detailEnabled(value: boolean) {
      if (!value) {
        if (this.detailVisible) this.requestDetailClose()
        return
      }
      if (this.detailVisible && !this.detailMounted) this.openDetailAnim()
    },
    cartCountValue(value: number, oldValue: number) {
      if (value > (Number(oldValue) || 0)) this.playCartPop()
      if (value <= 0) {
        if (this.detailVisible) this.requestDetailClose()
        return
      }
      if (this.detailVisible && !this.detailMounted) this.openDetailAnim()
    },
    detailVersion() {
      if (this.detailMounted && this.detailVisible) this.scheduleDetailMeasure()
    },
    effectiveDetailHeight() {
      if (this.detailMounted && this.detailVisible) this.scheduleDetailMeasure()
    },
    effectiveDetailMaxHeight() {
      if (this.detailMounted) {
        this.recalcDetailMax()
        if (this.detailVisible) this.scheduleDetailMeasure()
      }
    },
    effectiveDetailTopGap() {
      if (this.detailMounted) {
        this.recalcDetailMax()
        if (this.detailVisible) this.scheduleDetailMeasure()
      }
    },
  },
  mounted() {
    this._detailPageMounted = true
    this.syncSafe()
    this.bindDetailResize()
    if (this.detailVisible) this.openDetailAnim()
  },
  beforeUnmount() {
    this._detailPageMounted = false
    this.clearDetailTimers()
    this.unbindDetailResize()
    if (this._cartPopTimer) {
      clearTimeout(this._cartPopTimer)
      this._cartPopTimer = null
    }
  },
  methods: {
    syncSafe() {
      try {
        const info =
          typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
        const inset = info && info.safeAreaInsets
        this.safeBottom = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
        const height = Number(info && info.windowHeight)
        const width = Number(info && info.windowWidth)
        if (Number.isFinite(height) && height > 0) this.windowHeight = height
        if (Number.isFinite(width) && width > 0) this.windowWidth = width
      } catch {
        this.safeBottom = 0
      }
    },
    bindDetailResize() {
      if (this._detailResizeHandler) return
      const handler = () => {
        this.syncSafe()
        if (!this.detailMounted) return
        this.recalcDetailMax()
        if (this.detailVisible) this.scheduleDetailMeasure()
      }
      this._detailResizeHandler = handler
      try {
        if (typeof uni.onWindowResize === 'function') uni.onWindowResize(handler)
      } catch {
        /* 端不支持 */
      }
    },
    unbindDetailResize() {
      const handler = this._detailResizeHandler
      try {
        if (handler && typeof uni.offWindowResize === 'function') {
          uni.offWindowResize(handler)
        }
      } catch {
        /* 端不支持 */
      }
      this._detailResizeHandler = null
    },
    clearDetailTimers() {
      if (this._detailLeaveTimer) {
        clearTimeout(this._detailLeaveTimer)
        this._detailLeaveTimer = null
      }
      if (this._detailMeasureTimer) {
        clearTimeout(this._detailMeasureTimer)
        this._detailMeasureTimer = null
      }
    },
    /** 加购（数量增加）时购物车圆钮放大回弹一次 */
    playCartPop(): void {
      if (this._cartPopTimer) {
        clearTimeout(this._cartPopTimer)
        this._cartPopTimer = null
      }
      this.cartPop = false
      this.$nextTick(() => {
        this.cartPop = true
        this._cartPopTimer = setTimeout(() => {
          this.cartPop = false
          this._cartPopTimer = null
        }, 400)
      })
    },
    /** 详情区域最大高度：卡片底边到屏幕顶部留白之间，扣掉购物车栏与分割线 */
    recalcDetailMax(): void {
      const bottom = this.fixed ? 8 + (this.safeArea ? this.safeBottom : 0) : 0
      const available = Math.max(
        DETAIL_MIN_PX,
        this.windowHeight -
          this.effectiveDetailTopGap -
          bottom -
          CART_BAR_HEIGHT_PX,
      )
      const explicit = Math.max(0, this.effectiveDetailMaxHeight)
      this.detailMaxPx = explicit > 0 ? Math.min(explicit, available) : available
    },
    scheduleDetailMeasure(): void {
      if (this._detailMeasureTimer) {
        clearTimeout(this._detailMeasureTimer)
        this._detailMeasureTimer = null
      }
      this._detailMeasureTimer = setTimeout(() => {
        this._detailMeasureTimer = null
        if (!this.detailMounted || !this.detailVisible) return
        this.measureDetailContent()
      }, 60)
    },
    /** 测量顶栏与内容高度，算出详情区域目标高度并触发增高过渡 */
    measureDetailContent(callback?: () => void): void {
      if (!this.detailMounted) return
      const run = () => {
        if (!this.detailMounted) return
        try {
          const query = uni.createSelectorQuery().in(this)
          query.select('.lingyun-goods-nav__detail-head').boundingClientRect()
          query.select('.lingyun-goods-nav__detail-content').boundingClientRect()
          query.exec((res) => {
            if (!this.detailMounted || !this.detailVisible) return
            const head = res && res[0]
            const content = res && res[1]
            const headHeight = head ? Number(head.height) || 0 : 0
            this.detailHeadPx =
              headHeight > 0 ? Math.ceil(headHeight) : DETAIL_HEAD_FALLBACK_PX
            this.detailContentPx = content
              ? Math.max(0, Math.ceil(Number(content.height) || 0))
              : 0
            this.applyDetailHeight(callback)
          })
        } catch {
          this.applyDetailHeight(callback)
        }
      }
      this.$nextTick(() => {
        if (this.detailViewPx <= 0) {
          /* 首次展开：详情区域高度为 0，先让 scroll-view 按内容布局再测量 */
          this.detailMeasuring = true
          this.$nextTick(() => this.$nextTick(run))
        } else {
          run()
        }
      })
    },
    applyDetailHeight(callback?: () => void): void {
      if (!this.detailMounted) return
      const cap = Math.max(DETAIL_MIN_PX, this.detailMaxPx)
      const explicit = Math.max(0, this.effectiveDetailHeight)
      const target =
        explicit > 0
          ? Math.min(explicit, cap)
          : Math.min(this.detailHeadPx + this.detailContentPx, cap)
      const apply = () => {
        if (!this.detailMounted || !this.detailVisible) {
          this.detailMeasuring = false
          return
        }
        this.detailMeasuring = false
        this.detailViewPx = Math.max(0, target)
        if (callback) callback()
      }
      /* 直接下发目标高度：元素已按 height:0 布局过一帧，CSS transition 会从 0 增高。
         不用 rAF——H5 后台页会把 rAF 挂起，导致展开延迟。 */
      apply()
    },
    openDetailAnim(): void {
      if (!this.detailEnabled || this.cartCountValue <= 0) return
      this.clearDetailTimers()
      this.syncSafe()
      this.recalcDetailMax()
      const fresh = !this.detailMounted
      this.detailMounted = true
      if (fresh) {
        this.detailViewPx = 0
        this.detailHeadPx = 0
        this.detailContentPx = 0
        this.detailMeasuring = false
      }
      this.$nextTick(() => {
        this.measureDetailContent(() => {
          if (this.detailVisible && this.detailMounted) this.$emit('detail-open')
        })
      })
    },
    closeDetailAnim(): void {
      this.clearDetailTimers()
      if (!this.detailMounted) {
        this.detailViewPx = 0
        return
      }
      this.detailViewPx = 0
      this._detailLeaveTimer = setTimeout(() => {
        this._detailLeaveTimer = null
        this.detailMounted = false
        this.detailMeasuring = false
        this.detailHeadPx = 0
        this.detailContentPx = 0
        this.detailViewPx = 0
        this.resetDetailOverrides()
        this.$emit('detail-close')
      }, DETAIL_LEAVE_MS)
    },
    applyDetailOverrides(options?: DetailOpenOptions | null): void {
      if (!options) return
      if (options.height != null) {
        this.detailHeightOverride = Math.max(0, Number(options.height) || 0)
      }
      if (options.maxHeight != null) {
        this.detailMaxHeightOverride = Math.max(0, Number(options.maxHeight) || 0)
      }
      if (options.topGap != null) {
        this.detailTopGapOverride = Math.max(0, Number(options.topGap) || 0)
      }
    },
    resetDetailOverrides(): void {
      this.detailHeightOverride = null
      this.detailMaxHeightOverride = null
      this.detailTopGapOverride = null
    },
    requestDetailOpen(): void {
      if (!this.detailEnabled || this.cartCountValue <= 0) return
      if (this.detailVisible) return
      if (this.detailControlled) this.$emit('update:detailOpen', true)
      else this.detailUncontrolled = true
    },
    requestDetailClose(): void {
      if (!this.detailVisible && !this.detailMounted) return
      if (this.detailControlled) this.$emit('update:detailOpen', false)
      else this.detailUncontrolled = false
    },
    /** 打开购物车详情；可传高度 / 最大高度 / 顶部留白覆盖当前设置 */
    openDetail(options?: DetailOpenOptions): void {
      this.applyDetailOverrides(options)
      this.syncSafe()
      this.recalcDetailMax()
      if (this.detailVisible) {
        if (this.detailMounted) this.scheduleDetailMeasure()
        return
      }
      this.requestDetailOpen()
    },
    /** 收起购物车详情 */
    closeDetail(): void {
      this.requestDetailClose()
    },
    /** 展开 / 收起购物车详情 */
    toggleDetail(): void {
      if (this.detailVisible) this.closeDetail()
      else this.openDetail()
    },
    /** 内容或页面布局变化后重新测量高度 */
    refreshDetail(): void {
      if (!this.detailMounted) return
      this.recalcDetailMax()
      this.scheduleDetailMeasure()
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
    buttonVariant(index: number): string {
      return index === this.buttons.length - 1 ? 'borderedProminent' : 'bordered'
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
      if (this.detailEnabled) this.toggleDetail()
    },
    /** 展开详情时阻止触摸冒泡到页面；内部 scroll-view 仍自行滚动 */
    onCardTouchMove(): void {
      /* 空实现：只靠 .stop 阻止冒泡，不 prevent，避免掐死内部 scroll-view */
    },
    onCheckoutTap() {
      if (!this.canCheckout) return
      /* 去结算通常离开当前页，详情先收起，避免浮层留在下一页 */
      if (this.detailEnabled) this.requestDetailClose()
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
    align-items: center;
    flex: 0 1 auto;
    gap: 8px;
    min-width: 0;
  }

  &__actions--fill {
    flex: 1;
  }

  &__action {
    min-width: 0;
  }

  &__actions--fill &__action {
    flex: 1;
  }
}

/* ---------- cart 变体：详情 + 购物车栏同一张玻璃卡 ---------- */

.lingyun-goods-nav--cart {
  position: relative;
  z-index: 900;
  display: block;
  width: auto;
  min-height: 0;
  padding: 0;
  gap: 0;
  margin: 0 12px 8px;
  border: 0;
  border-radius: 0;
  background: none;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* 贴底时整层铺满视口：遮罩与卡片同在一个全屏 fixed 上下文里，
   遮罩用 absolute 撑满，卡片固定在底部；根节点不吃事件，交给遮罩 / 卡片 */
.lingyun-goods-nav--cart.lingyun-goods-nav--fixed {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 900;
  width: auto;
  margin: 0;
  pointer-events: none;
}

.lingyun-goods-nav--cart.lingyun-goods-nav--fixed .lingyun-goods-nav__card {
  position: absolute;
  z-index: 1;
  width: auto;
  pointer-events: auto;
}

/* 点击卡片外收起：全屏遮罩，压在页面内容之上、卡片之下；拦截滚动与点击穿透 */
.lingyun-goods-nav__detail-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background-color: var(--lingyun-mask, #{$lingyun-mask});
}

.lingyun-goods-nav--cart.lingyun-goods-nav--fixed .lingyun-goods-nav__detail-mask {
  position: absolute;
  pointer-events: auto;
}

/* 一张连续玻璃卡：展开时整卡向上增高，购物车栏始终在最底部 */
.lingyun-goods-nav__card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  @include lingyun-glass-surface;
  border-radius: 31px;
  /* Light：与 Sheet 同档 alpha，文字列表需要更实一点的底 */
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  box-shadow: var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    var(--lingyun-glass-shadow-raised, #{$lingyun-glass-shadow-raised});
}

.lingyun-goods-nav.theme-dark .lingyun-goods-nav__card {
  border: #{$lingyun-glass-hairline-dark};
  background-color: #{$lingyun-glass-overlay-bg-dark};
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

/* 详情区域：高度由 JS 下发，展开 / 收起通过 height 过渡 */
.lingyun-goods-nav__detail {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  transition: height 0.34s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: height;
}

/* 顶栏：左上角关闭钮（对齐 Sheet），右侧由 #detail-header 注入标题 / 操作 */
.lingyun-goods-nav__detail-head {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 4px;
  box-sizing: border-box;
}

.lingyun-goods-nav__detail-close {
  flex-shrink: 0;
}

.lingyun-goods-nav__detail-head-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-goods-nav__detail-scroll {
  flex: 1;
  width: 100%;
  height: 0;
  min-height: 0;
  box-sizing: border-box;
}

.lingyun-goods-nav__detail-content {
  width: 100%;
  box-sizing: border-box;
}

/* 购物车栏：玻璃底由整张卡提供，这里只负责一行内容 */
.lingyun-goods-nav__cart-bar {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  min-height: 62px;
  padding: 0 14px 0 6px;
  box-sizing: border-box;
}

.lingyun-goods-nav__cart-icon-wrap {
  position: relative;
  flex-shrink: 0;
}

/* 加购时圆钮（含角标）放大回弹 */
.lingyun-goods-nav__cart-icon-wrap--pop {
  animation: lingyun-goods-nav-cart-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes lingyun-goods-nav-cart-pop {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.12);
  }
  72% {
    transform: scale(0.97);
  }
  100% {
    transform: scale(1);
  }
}

.lingyun-goods-nav__cart-badge {
  position: absolute;
  top: -3px;
  /* 左侧固定，数字变多往右撑开，不往左盖住购物车图标和价格 */
  left: 30px;
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
  margin-left: 10px;
}
</style>
