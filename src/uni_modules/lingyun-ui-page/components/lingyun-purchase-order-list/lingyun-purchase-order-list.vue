<template>
  <lingyun-app-page
    :show-toolbar="showToolbar"
    :show-back="showToolbar ? showBack : false"
    :auto-back="autoBack"
    :show-nav="showNav"
    :show-tabbar="false"
    :title="title"
    :auto-top-inset="scrollUnderToolbar ? false : autoTopInset"
    :show-theme-switch="showThemeSwitch"
    :body-scroll="false"
    :page-scroll="false"
    :segments="resolvedFilters"
    :segment-value="activeFilter"
    segment-control="tabs"
    @segment-change="onSegmentChange"
    @back="onBack"
  >
    <lingyun-purchase-order-list-panel
      :orders="orders"
      :filters="filters"
      :filter="activeFilter"
      :loading="loading"
      :loading-more="loadingMore"
      :has-more="hasMore"
      :empty-text="emptyText"
      :loading-text="loadingText"
      :loading-more-text="loadingMoreText"
      :no-more-text="noMoreText"
      :scroll-under-toolbar="scrollUnderToolbar"
      :currency="currency"
      :price-decimals="priceDecimals"
      :max-thumbnails="maxThumbnails"
      @purchase-order-click="$emit('purchase-order-click', $event)"
      @action="$emit('action', $event)"
      @load-more="$emit('load-more')"
      @scroll="$emit('scroll', $event)"
    />
  </lingyun-app-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
/**
 * lingyun-purchase-order-list
 * 订货单列表标准页：页面壳（顶栏 / 状态 Tabs / 导航 / 滚动上报）+ 列表面板。
 * 列表内容在 lingyun-purchase-order-list-panel，分栏 demo 也直接复用该面板。
 */
import { type PropType } from 'vue'
import LingyunPurchaseOrderListPanel from './lingyun-purchase-order-list-panel.vue'
import type {
  LingyunPurchaseOrderListFilter,
  LingyunPurchaseOrderListFilterKey,
  LingyunPurchaseOrderListFilterPayload,
  LingyunPurchaseOrderListOrder,
} from './types'

const DEFAULT_FILTERS: LingyunPurchaseOrderListFilter[] = [
  { key: 'all', text: '全部' },
  { key: 'pendingReview', text: '待审核' },
  { key: 'inProgress', text: '进行中' },
  { key: 'completed', text: '已完成' },
  { key: 'cancelled', text: '已取消' },
]

defineOptions({
  name: 'LingyunPurchaseOrderList',
})

const props = defineProps({
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
  showBack: { type: [Boolean, String], default: 'auto' },
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
})

const emit = defineEmits([
  'back',
  'purchase-order-click',
  'action',
  'filter-change',
  'update:filter',
  'load-more',
  'scroll',
])

const activeFilter = ref(props.filter || 'all')

const resolvedFilters = computed((): LingyunPurchaseOrderListFilter[] => {
  return props.filters.length ? props.filters : DEFAULT_FILTERS
})

function onFilter(key: LingyunPurchaseOrderListFilterKey): void {
  activeFilter.value = key
  const filter = resolvedFilters.value.find((item) => item.key === key) || null
  if (filter) {
    const payload: LingyunPurchaseOrderListFilterPayload = { key, filter }
    emit('filter-change', payload)
  }
  emit('update:filter', key)
}

function onSegmentChange(payload: { value?: string | number }): void {
  const key = String(payload?.value || '')
  if (!key) return
  onFilter(key as LingyunPurchaseOrderListFilterKey)
}

function onBack(): void {
  emit('back')
}

watch(() => props.filter, (value: string) => {
  activeFilter.value = value || 'all'
})
</script>
