<template>
<view class="lingyun-purchase-order-list">
  <view class="lingyun-purchase-order-list__body">
    <scroll-view
      class="lingyun-purchase-order-list__scroll"
      scroll-y
      :show-scrollbar="false"
      :lower-threshold="80"
      :upper-threshold="2"
      :scroll-into-view="scrollIntoView"
      @scroll="onScroll"
      @scrolltoupper="onScrollToUpper"
      @scrolltolower="onScrollToLower"
    >
      <view
        class="lingyun-purchase-order-list__content"
        :class="{ 'lingyun-purchase-order-list__content--full': full }"
      >
        <view id="lingyun-purchase-order-list-top" class="lingyun-purchase-order-list__anchor" />
        <view
          v-if="scrollUnderToolbar || topSpace > 0"
          class="lingyun-purchase-order-list__top-space"
          :style="topSpace > 0 ? { height: `${topSpace}px` } : undefined"
        />
        <view v-if="loading" class="lingyun-purchase-order-list__state">
          <lingyun-activity-indicator size="large" />
          <text class="lingyun-purchase-order-list__state-text">{{ loadingText }}</text>
        </view>

        <template v-else-if="displayOrders.length">
          <view
            v-for="(order, index) in displayOrders"
            :key="order.key || order.number"
            class="lingyun-purchase-order-list__card"
            :class="{ 'lingyun-purchase-order-list__card--selected': isSelected(order) }"
            hover-class="lingyun-purchase-order-list__card--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            role="button"
            @click="onPurchaseOrderClick(order, index)"
          >
            <view class="lingyun-purchase-order-list__head">
              <text class="lingyun-purchase-order-list__number">{{ order.number }}</text>
              <text
                class="lingyun-purchase-order-list__status"
                :style="{ color: listStatusMeta(order).color }"
              >{{ listStatusMeta(order).text }}</text>
            </view>

            <view v-if="order.items && order.items.length" class="lingyun-purchase-order-list__media">
              <view class="lingyun-purchase-order-list__thumbs">
                <view
                  v-for="item in visibleThumbs(order)"
                  :key="item.key"
                  class="lingyun-purchase-order-list__thumb"
                >
                  <image
                    v-if="item.image"
                    class="lingyun-purchase-order-list__thumb-img"
                    :src="item.image"
                    mode="aspectFill"
                    lazy-load
                  />
                  <text v-else class="lingyun-purchase-order-list__thumb-fallback">
                    {{ firstChar(item.name) }}
                  </text>
                </view>
                <text v-if="extraThumbCount(order)" class="lingyun-purchase-order-list__thumb-more">
                  +{{ extraThumbCount(order) }}
                </text>
              </view>
              <view class="lingyun-purchase-order-list__totals">
                <text class="lingyun-purchase-order-list__count">共 {{ orderItemsCount(order) }} 件</text>
                <text class="lingyun-purchase-order-list__total">{{ currency }}{{ formatAmount(orderTotal(order)) }}</text>
              </view>
            </view>

            <view class="lingyun-purchase-order-list__foot">
              <view class="lingyun-purchase-order-list__meta">
                <lingyun-date-text
                  v-if="order.createdAt"
                  :value="order.createdAt"
                  precision="minute"
                  type="caption1"
                  color="tertiary"
                />
                <text v-if="subOrderSummary(order)" class="lingyun-purchase-order-list__meta-text">
                  {{ subOrderSummary(order) }}
                </text>
              </view>
              <view v-if="orderActions(order).length" class="lingyun-purchase-order-list__actions">
                <view
                  v-for="(action, actionIndex) in orderActions(order)"
                  :key="action.key"
                  class="lingyun-purchase-order-list__action"
                  @click.stop="onAction(order, action)"
                >
                  <lingyun-button
                    :text="action.text"
                    :variant="actionVariantIn(action, actionIndex, orderActions(order))"
                    :role="action.role || 'normal'"
                    :disabled="action.disabled"
                    size="small"
                  />
                </view>
              </view>
            </view>
          </view>

          <view class="lingyun-purchase-order-list__load-state">
            <template v-if="loadingMore">
              <lingyun-activity-indicator size="small" />
              <text class="lingyun-purchase-order-list__load-text">{{ loadingMoreText }}</text>
            </template>
            <text v-else-if="!hasMore" class="lingyun-purchase-order-list__no-more">{{ noMoreText }}</text>
          </view>
        </template>

        <view v-else class="lingyun-purchase-order-list__state lingyun-purchase-order-list__state--empty">
          <lingyun-empty variant="plain" :title="emptyText" />
        </view>
      </view>
    </scroll-view>
  </view>
</view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunAppPageScroll } from '../../../lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'
import type {
  LingyunPurchaseOrderDetailAction,
  LingyunPurchaseOrderDetailStatus,
} from '../lingyun-purchase-order-detail/types'
import type {
  LingyunPurchaseOrderListActionPayload,
  LingyunPurchaseOrderListFilter,
  LingyunPurchaseOrderListFilterKey,
  LingyunPurchaseOrderListFilterPayload,
  LingyunPurchaseOrderListOrder,
  LingyunPurchaseOrderListOrderPayload,
  LingyunPurchaseOrderListStatus,
} from './types'

interface ListStatusMeta {
  text: string
  color: string
}

const LIST_STATUS_META: Record<LingyunPurchaseOrderListStatus, ListStatusMeta> = {
  pendingReview: {
    text: '待审核',
    color: 'var(--lingyun-system-purple, #cb30e0)',
  },
  inProgress: {
    text: '进行中',
    color: 'var(--lingyun-system-blue, #0088ff)',
  },
  completed: {
    text: '已完成',
    color: 'var(--lingyun-system-green, #34c759)',
  },
  cancelled: {
    text: '已取消',
    color: 'var(--lingyun-system-gray, #8e8e93)',
  },
}

const DEFAULT_ACTIONS: Record<LingyunPurchaseOrderDetailStatus, LingyunPurchaseOrderDetailAction[]> = {
  pendingReview: [
    { key: 'cancel', text: '取消订货单', variant: 'bordered', role: 'destructive' },
  ],
  pendingPayment: [
    { key: 'cancel', text: '取消订货单', variant: 'bordered', role: 'destructive' },
    { key: 'pay', text: '去支付', variant: 'borderedProminent' },
  ],
  pendingShipment: [
    { key: 'remind', text: '提醒发货', variant: 'borderedProminent' },
  ],
  shipped: [
    { key: 'confirm', text: '确认收货', variant: 'borderedProminent' },
  ],
  completed: [
    { key: 'aftersale', text: '申请售后', variant: 'bordered' },
    { key: 'rebuy', text: '再来一单', variant: 'borderedProminent' },
  ],
  cancelled: [
    { key: 'rebuy', text: '再来一单', variant: 'borderedProminent' },
  ],
  refund: [
    { key: 'refundDetail', text: '退款详情', variant: 'borderedProminent' },
  ],
}

const DEFAULT_FILTERS: LingyunPurchaseOrderListFilter[] = [
  { key: 'all', text: '全部' },
  { key: 'pendingReview', text: '待审核' },
  { key: 'inProgress', text: '进行中' },
  { key: 'completed', text: '已完成' },
  { key: 'cancelled', text: '已取消' },
]

/**
 * lingyun-purchase-order-list
 * 订货单列表标准页：状态筛选 + 订货单卡片 + 商品摘要 + 金额 + 操作。
 * 数据驱动，不请求接口；筛选、点订货单、操作、加载更多抛事件。
 * @see doc/page/purchase-order-list.md
 */
export default defineComponent({
  name: 'LingyunPurchaseOrderListPanel',
  emits: ['back', 'purchase-order-click', 'action', 'filter-change', 'update:filter', 'load-more', 'scroll'],
  setup() {
    const reportScroll = useLingyunAppPageScroll()
    return { reportScroll }
  },
  props: {
    orders: {
      type: Array as PropType<LingyunPurchaseOrderListOrder[]>,
      default: () => [],
    },
    filters: {
      type: Array as PropType<LingyunPurchaseOrderListFilter[]>,
      default: () => [],
    },
    filter: { type: String, default: 'all' },
    loading: { type: Boolean, default: false },
    loadingMore: { type: Boolean, default: false },
    hasMore: { type: Boolean, default: false },
    emptyText: { type: String, default: '暂无订货单' },
    loadingText: { type: String, default: '加载中…' },
    loadingMoreText: { type: String, default: '加载中…' },
    noMoreText: { type: String, default: '没有更多订货单' },
    title: { type: String, default: '订货单列表' },
    showToolbar: { type: Boolean, default: true },
    showBack: { type: Boolean, default: true },
    showNav: { type: Boolean, default: true },
    autoTopInset: { type: Boolean, default: true },
    /** 返回钮默认返回上一页；false 时只抛 back，由页面处理 */
    autoBack: { type: Boolean, default: true },
    /** 列表从顶栏下方穿过，滚动时顶栏呈现液态玻璃；false 用 app-page 顶栏留白 */
    scrollUnderToolbar: { type: Boolean, default: true },
    showThemeSwitch: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: 'auto',
    },
    currency: { type: String, default: '¥' },
    priceDecimals: { type: Number, default: 2 },
    /** 卡片横向最多展示的商品图数量，多出的显示 +N */
    maxThumbnails: { type: Number, default: 3 },
    /** full 宽度模式：内容区不留左右留白、卡片通宽直角（对齐 lingyun-section 的 full） */
    full: { type: Boolean, default: false },
    /** 分栏选中项 key（order.key || order.number）；空串不显示选中态 */
    selectedKey: { type: String, default: '' },
    /** 分栏面板模式：顶部占位高度 px（浮层 toolbar 的高度）；0 用页面壳的 --lingyun-app-page-bar */
    topSpace: { type: Number, default: 0 },
  },
  data() {
    return {
      activeFilter: this.filter || 'all',
      scrollIntoView: '',
    }
  },
  mounted() {
    this.resetScroll()
  },
  computed: {
    resolvedFilters(): LingyunPurchaseOrderListFilter[] {
      return this.filters.length ? this.filters : DEFAULT_FILTERS
    },
    thumbLimit(): number {
      const value = Number(this.maxThumbnails)
      return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 3
    },
    displayOrders(): LingyunPurchaseOrderListOrder[] {
      if (!this.activeFilter || this.activeFilter === 'all') return this.orders
      return this.orders.filter(
        (order) => this.orderListStatus(order) === this.activeFilter,
      )
    },
  },
  watch: {
    filter(value: string) {
      this.activeFilter = value || 'all'
    },
  },
  methods: {
    onBack(): void {
      this.$emit('back')
      if (!this.autoBack) return
      const pages =
        typeof getCurrentPages === 'function' ? getCurrentPages() : []
      if (pages.length > 1) uni.navigateBack()
    },
    /** 页面重新进入 / 切换筛选时回到顶部，避免恢复上一次内部滚动位置 */
    resetScroll(): void {
      this.reportPageScroll(0)
      this.scrollIntoView = ''
      this.$nextTick(() => {
        this.scrollIntoView = 'lingyun-purchase-order-list-top'
      })
    },
    orderListStatus(order: LingyunPurchaseOrderListOrder): LingyunPurchaseOrderListStatus {
      if (order.listStatus) return order.listStatus
      if (order.status === 'pendingReview') return 'pendingReview'
      if (order.status === 'completed') return 'completed'
      if (order.status === 'cancelled') return 'cancelled'
      return 'inProgress'
    },
    listStatusMeta(order: LingyunPurchaseOrderListOrder): ListStatusMeta {
      const meta = LIST_STATUS_META[this.orderListStatus(order)]
      return {
        text: order.listStatusText || meta.text,
        color: order.listStatusColor || meta.color,
      }
    },
    orderItemsCount(order: LingyunPurchaseOrderListOrder): number {
      return (order.items || []).reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0,
      )
    },
    orderTotal(order: LingyunPurchaseOrderListOrder): number {
      const amounts = order.amounts
      if (!amounts) return 0
      return amounts.paid !== undefined ? amounts.paid : amounts.payable
    },
    visibleThumbs(order: LingyunPurchaseOrderListOrder) {
      return (order.items || []).slice(0, this.thumbLimit)
    },
    extraThumbCount(order: LingyunPurchaseOrderListOrder): number {
      return Math.max(0, (order.items || []).length - this.thumbLimit)
    },
    subOrderSummary(order: LingyunPurchaseOrderListOrder): string {
      const count = order.subOrders?.length || 0
      return count > 0 ? `分 ${count} 个包裹` : ''
    },
    formatAmount(amount: number | undefined): string {
      const value = Number(amount)
      if (!Number.isFinite(value)) return '0'
      const decimals = Number(this.priceDecimals)
      if (Number.isFinite(decimals) && decimals < 0) {
        return String(Number(value.toFixed(2)))
      }
      const fixed = Number.isFinite(decimals)
        ? Math.min(6, Math.max(0, Math.floor(decimals)))
        : 2
      return value.toFixed(fixed)
    },
    firstChar(name: string): string {
      return (name || '').trim().slice(0, 1) || '单'
    },
    orderActions(order: LingyunPurchaseOrderListOrder): LingyunPurchaseOrderDetailAction[] {
      if (Array.isArray(order.actions)) return order.actions
      return DEFAULT_ACTIONS[order.status] || []
    },
    actionVariantIn(
      action: LingyunPurchaseOrderDetailAction,
      index: number,
      list: LingyunPurchaseOrderDetailAction[],
    ): string {
      if (action.variant) return action.variant
      return index === list.length - 1 ? 'borderedProminent' : 'bordered'
    },
    onSegmentChange(payload: { value?: string | number }): void {
      const key = String(payload?.value || '')
      if (!key) return
      this.onFilter(key as LingyunPurchaseOrderListFilterKey)
    },
    onFilter(key: LingyunPurchaseOrderListFilterKey): void {
      this.activeFilter = key
      this.resetScroll()
      const filter = this.resolvedFilters.find((item) => item.key === key) || null
      if (filter) {
        const payload: LingyunPurchaseOrderListFilterPayload = { key, filter }
        this.$emit('filter-change', payload)
      }
      this.$emit('update:filter', key)
    },
    isSelected(order: LingyunPurchaseOrderListOrder): boolean {
      if (!this.selectedKey) return false
      return (order.key || order.number) === this.selectedKey
    },
    onPurchaseOrderClick(order: LingyunPurchaseOrderListOrder, index: number): void {
      const payload: LingyunPurchaseOrderListOrderPayload = { order, index }
      this.$emit('purchase-order-click', payload)
    },
    onAction(order: LingyunPurchaseOrderListOrder, action: LingyunPurchaseOrderDetailAction): void {
      if (action.disabled) return
      const payload: LingyunPurchaseOrderListActionPayload = {
        key: action.key,
        action,
        order,
      }
      this.$emit('action', payload)
    },
    reportPageScroll(top: number): void {
      const report = (this as unknown as {
        reportScroll?: (scrollTop: number) => void
      }).reportScroll
      if (typeof report === 'function') report(top)
    },
    onScroll(event: { detail?: { scrollTop?: number } }): void {
      const top = Number(event?.detail?.scrollTop)
      if (Number.isFinite(top) && top >= 0) {
        this.reportPageScroll(top)
        this.$emit('scroll', top)
      }
    },
    onScrollToUpper(): void {
      this.reportPageScroll(0)
    },
    onScrollToLower(): void {
      if (!this.loadingMore && this.hasMore) this.$emit('load-more')
    },
  },
})
</script>

<style lang="scss">
@import '../../../lingyun-ui/styles/variables.scss';

.lingyun-purchase-order-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  box-sizing: border-box;
  background-color: var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
}

.lingyun-purchase-order-list__top-space {
  height: calc(
    var(--lingyun-app-page-bar, 60px) + var(--lingyun-page-nav-safe-top, 0px)
  );
}

.lingyun-purchase-order-list__body {
  flex: 1;
  min-height: 0;
  /* 小程序：flex + height:0 才能给内层 scroll-view 定高，百分比高度会被内容撑开、整页滚动 */
  height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lingyun-purchase-order-list__scroll {
  flex: 1;
  min-height: 0;
  height: 0;
}

.lingyun-purchase-order-list__anchor {
  height: 0;
}

.lingyun-purchase-order-list__content {
  box-sizing: border-box;
  max-width: 720px;
  margin: 0 auto;
  padding: 4px 16px calc(24px + env(safe-area-inset-bottom));
}

/* full：占满所在栏宽度，不留左右留白，卡片直角（上下间距保留，与 lingyun-section full 一致） */
.lingyun-purchase-order-list__content--full {
  max-width: none;
  padding-left: 0;
  padding-right: 0;
}

.lingyun-purchase-order-list__content--full .lingyun-purchase-order-list__card {
  border-radius: 0;
}

/* 分栏选中态：对齐列表与详情 demo——选中卡片用页面底色（浅色 #f2f2f7 / 暗黑 #000），
   与未选中的 grouped-secondary 卡片形成对比（提高一级特异性，压过基础卡片底色） */
.lingyun-purchase-order-list__card.lingyun-purchase-order-list__card--selected {
  background-color: var(--lingyun-bg-grouped-primary, #f2f2f7);
}

.lingyun-purchase-order-list__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 24px;
  box-sizing: border-box;
}

.lingyun-purchase-order-list__state--empty {
  padding-top: 64px;
}

.lingyun-purchase-order-list__state-text {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-list__card {
  box-sizing: border-box;
  margin-bottom: 12px;
  padding: 16px;
  border-radius: 20px;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}

.lingyun-purchase-order-list__card--hover {
  opacity: 0.92;
}

.lingyun-purchase-order-list__head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.lingyun-purchase-order-list__number {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-list__status {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
}

.lingyun-purchase-order-list__media {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  margin-top: 12px;
}

.lingyun-purchase-order-list__thumbs {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.lingyun-purchase-order-list__thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 10px;
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-purchase-order-list__thumb-img {
  display: block;
  width: 100%;
  height: 100%;
}

.lingyun-purchase-order-list__thumb-fallback {
  font-size: 20px;
  font-weight: 600;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-list__thumb-more {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 9px;
  flex-shrink: 0;
  border-radius: 14px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  font-size: 12px;
  line-height: 28px;
  font-weight: 600;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-list__totals {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  margin-left: auto;
}

.lingyun-purchase-order-list__count {
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-list__total {
  font-size: 17px;
  line-height: 24px;
  font-weight: 700;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-list__foot {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-purchase-order-list__meta {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  min-width: 0;
}

.lingyun-purchase-order-list__meta-text {
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-purchase-order-list__actions {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.lingyun-purchase-order-list__action {
  flex-shrink: 0;
}

.lingyun-purchase-order-list__load-state {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 0 8px;
}

.lingyun-purchase-order-list__load-text,
.lingyun-purchase-order-list__no-more {
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}
</style>
