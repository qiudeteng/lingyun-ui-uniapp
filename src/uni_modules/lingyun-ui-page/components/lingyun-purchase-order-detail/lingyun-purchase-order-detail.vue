<template>
  <lingyun-app-page
    :show-toolbar="showToolbar"
    :show-back="showToolbar ? showBack : false"
    :show-nav="showNav"
    :show-tabbar="false"
    :title="title"
    :auto-top-inset="scrollUnderToolbar ? false : autoTopInset"
    :show-theme-switch="showThemeSwitch"
    :trailing-buttons="toolbarButtons"
    :trailing-menu-enabled="toolbarMenuEnabled"
    :body-scroll="false"
    :page-scroll="false"
    @back="onBack"
  >
    <lingyun-purchase-order-detail-panel
      :order="order"
      :loading="loading"
      :loading-text="loadingText"
      :empty-text="emptyText"
      :scroll-under-toolbar="scrollUnderToolbar"
      :currency="currency"
      :price-decimals="priceDecimals"
      :max-thumbnails="maxThumbnails"
      :payment-timeout-minutes="paymentTimeoutMinutes"
      @action="$emit('action', $event)"
      @item-click="$emit('item-click', $event)"
      @sub-purchase-order-click="$emit('sub-purchase-order-click', $event)"
      @copy="$emit('copy', $event)"
      @payment-timeout="$emit('payment-timeout', $event)"
      @scroll="$emit('scroll', $event)"
    />

    <template #trailing-menu="scope">
      <slot
        name="toolbar-menu"
        :button="scope.button"
        :index="scope.index"
        :groupIndex="scope.groupIndex"
        :buttonIndex="scope.buttonIndex"
        :close="scope.close"
      />
    </template>
  </lingyun-app-page>
</template>

<script lang="ts">
/**
 * lingyun-purchase-order-detail
 * 订货单详情标准页：页面壳（顶栏 / 导航 / 滚动上报）+ 详情面板。
 * 详情内容在 lingyun-purchase-order-detail-panel，分栏 demo 也直接复用该面板。
 */
import { defineComponent, type PropType } from 'vue'
import LingyunPurchaseOrderDetailPanel from './lingyun-purchase-order-detail-panel.vue'
import type {
  LingyunPurchaseOrderDetailOrder,
  LingyunPurchaseOrderDetailToolbarButtons,
} from './types'

export default defineComponent({
  name: 'LingyunPurchaseOrderDetail',
  components: { LingyunPurchaseOrderDetailPanel },
  emits: [
    'back',
    'action',
    'item-click',
    'sub-purchase-order-click',
    'copy',
    'payment-timeout',
    'scroll',
  ],
  props: {
    order: {
      type: Object as PropType<LingyunPurchaseOrderDetailOrder | null>,
      default: null,
    },
    loading: { type: Boolean, default: false },
    loadingText: { type: String, default: '加载中…' },
    emptyText: { type: String, default: '订货单不存在' },
    title: { type: String, default: '订货单详情' },
    showToolbar: { type: Boolean, default: true },
    showBack: { type: [Boolean, String], default: 'auto' },
    showNav: { type: Boolean, default: true },
    autoTopInset: { type: Boolean, default: true },
    /** 返回钮默认返回上一页；false 时只抛 back，由页面处理 */
    autoBack: { type: Boolean, default: true },
    /** 内层滚动内容从顶栏下方穿过，滚动时顶栏呈现液态玻璃；false 用 app-page 顶栏留白 */
    scrollUnderToolbar: { type: Boolean, default: true },
    /** 页面级主题钮开关：auto 跟随全局，false 只隐藏当前页 */
    showThemeSwitch: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: 'auto',
    },
    toolbarButtons: {
      type: Array as PropType<LingyunPurchaseOrderDetailToolbarButtons>,
      default: () => [],
    },
    toolbarMenuEnabled: { type: Boolean, default: false },
    currency: { type: String, default: '¥' },
    priceDecimals: { type: Number, default: 2 },
    /** 子订货单行横向最多展示的商品图数量，多出的显示 +N */
    maxThumbnails: { type: Number, default: 3 },
    /** 待付款倒计时，单位分钟，从 order.createdAt 起算 */
    paymentTimeoutMinutes: { type: Number, default: 15 },
  },
  methods: {
    onBack(): void {
      this.$emit('back')
      if (!this.autoBack) return
      const pages =
        typeof getCurrentPages === 'function' ? getCurrentPages() : []
      if (pages.length > 1) uni.navigateBack()
    },
  },
})
</script>
