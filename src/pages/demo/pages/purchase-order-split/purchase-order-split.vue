<template>
  <lingyun-split-layout
    title="订货单"
    :split-at="900"
    :list-width="375"
    :detail-open="coverOpen"
    @layout-change="onLayoutChange"
  >
    <template #list-header>
      <lingyun-split-toolbar
        title="订货单"
        searchable
        search-placeholder="搜索订货单号 / 商品"
        :segments="filterOptions"
        :segment-value="activeFilter"
        :show-back="!navDocked && !hosted"
        :avoid-capsule="!wide"
        :glass-progress="listGlass"
        v-model:searching="searching"
        v-model:search-value="keyword"
        @search-cancel="onSearchCancel"
        @segment-change="onFilterChange"
        @back="onPageBack"
      />
    </template>

    <template #list>
      <lingyun-purchase-order-list-panel
        class="lingyun-split-layout-pane"
        full
        :orders="searchedOrders"
        :filter="activeFilter"
        :empty-text="keyword.trim() ? '没有匹配的订货单' : '暂无订货单'"
        :selected-key="wide && currentOrder ? currentOrder.key || currentOrder.number : ''"
        :top-space="listTopSpace"
        @scroll="onListScroll"
        @purchase-order-click="onOrderClick"
        @action="onAction"
      />
    </template>

    <!-- 宽屏右侧详情；中屏在内容区滑入；手机走独立详情页 -->
    <template #detail-header>
      <lingyun-split-toolbar
        :title="subKey ? '子订货单详情' : '订货单详情'"
        :show-back="cover"
        :avoid-capsule="cover"
        :glass-progress="detailGlass"
        @back="onDetailBack"
      />
    </template>

    <template #detail>
      <lingyun-purchase-order-detail-panel
        class="lingyun-split-layout-pane"
        :order="shownOrder"
        empty-text="选择左侧订货单查看详情"
        :top-space="detailTopSpace"
        @scroll="onDetailScroll"
        @action="onAction"
        @item-click="onItemClick"
        @sub-purchase-order-click="onSubOrderClick"
        @copy="onCopy"
        @payment-timeout="onPaymentTimeout"
      />
    </template>
  </lingyun-split-layout>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import { isLingyunWideScreen, type LingyunSplitLayoutChange } from '@/uni_modules/lingyun-ui'
  import { pageHostState } from '@/router/pageHost'
  import { demoPurchaseOrders } from './purchaseOrderDemo'
  import LingyunPurchaseOrderListPanel from '@/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-list/lingyun-purchase-order-list-panel.vue'
  import LingyunPurchaseOrderDetailPanel from '@/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-detail/lingyun-purchase-order-detail-panel.vue'
  import { buildLingyunPurchaseOrderSubDetail } from '@/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-detail/subPurchaseOrder'
  import type {
    LingyunPurchaseOrderDetailCopyPayload,
    LingyunPurchaseOrderDetailItemPayload,
    LingyunPurchaseOrderDetailOrder,
    LingyunPurchaseOrderDetailPaymentTimeoutPayload,
    LingyunPurchaseOrderDetailSubOrderPayload,
  } from '@/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-detail/types'
  import type {
    LingyunPurchaseOrderListActionPayload,
    LingyunPurchaseOrderListOrderPayload,
  } from '@/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-list/types'

  const DETAIL_URL = '/pages/demo/pages/purchase-order-split/purchase-order-split-item'

  /** 分栏门槛 900 / 左栏宽度 / 头部量高由 lingyun-split-layout 负责，这里只跟随 layout-change */
  const wide = ref(false)
  /** 有左侧导航、尚未分栏：详情在当前页滑入，不新开页面 */
  const cover = ref(false)
  const coverOpen = ref(false)
  /** 中屏盖层里正在看的子订货单；空则是父单 */
  const subKey = ref('')
  const listTopSpace = ref(0)
  const detailTopSpace = ref(0)

  function onLayoutChange(value: LingyunSplitLayoutChange): void {
    wide.value = value.wide
    cover.value = value.cover
    if (value.wide) {
      coverOpen.value = false
      subKey.value = ''
    }
    listTopSpace.value = value.listTopSpace
    detailTopSpace.value = value.detailTopSpace
  }

  /** 左侧导航是否停靠：导航停靠时不显示页面返回（iPad 竖屏 / 横屏） */
  const navDocked = computed(() => isLingyunWideScreen())

  function currentPageRoute(): string {
    try {
      const pages = getCurrentPages()
      const cur = pages[pages.length - 1] as { route?: string } | undefined
      return String(cur?.route || '')
    } catch {
      return ''
    }
  }

  /** 小程序宽屏宿主内：toolbar 属于宿主，本页的 app-page 要保留顶栏占位 */
  const hosted = computed(
    () =>
      pageHostState.path === 'pages/demo/pages/purchase-order-split/purchase-order-split' &&
      currentPageRoute() !== 'pages/demo/pages/purchase-order-split/purchase-order-split',
  )
  /* 本页自己出 toolbar：宿主页（小程序宽屏 / 目录）隐藏自己的 toolbar */
  watch(
    hosted,
    (value) => {
      pageHostState.hideToolbar = value
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    pageHostState.hideToolbar = false
  })

  /* ---------- 左栏：搜索 / 状态 ---------- */

  const searching = ref(false)
  const keyword = ref('')
  const activeFilter = ref('all')
  const filterOptions = [
    { key: 'all', text: '全部' },
    { key: 'pendingReview', text: '待审核' },
    { key: 'inProgress', text: '进行中' },
    { key: 'completed', text: '已完成' },
    { key: 'cancelled', text: '已取消' },
  ]

  function onFilterChange(payload: { value?: string | number }): void {
    const value = String(payload?.value || '')
    if (filterOptions.some((item) => item.key === value)) activeFilter.value = value
  }

  function onSearchCancel(): void {
    searching.value = false
    keyword.value = ''
  }

  /** 与列表面板一致的状态归类 */
  function listStatusOf(order: LingyunPurchaseOrderDetailOrder): string {
    const explicit = (order as { listStatus?: string }).listStatus
    if (explicit) return explicit
    if (order.status === 'pendingReview') return 'pendingReview'
    if (order.status === 'completed') return 'completed'
    if (order.status === 'cancelled') return 'cancelled'
    return 'inProgress'
  }

  function searchTextOf(order: LingyunPurchaseOrderDetailOrder): string {
    const names = [
      ...(order.items || []),
      ...(order.subOrders || []).flatMap((sub) => sub.items || []),
    ].map((item) => item.name)
    return [order.number, ...names].join(' ').toLowerCase()
  }

  const orders = ref<LingyunPurchaseOrderDetailOrder[]>([...demoPurchaseOrders])

  /** 搜索交给页面，状态筛选交给列表面板（filter） */
  const searchedOrders = computed(() => {
    const text = keyword.value.trim().toLowerCase()
    if (!text) return orders.value
    return orders.value.filter((order) => searchTextOf(order).includes(text))
  })

  const visibleOrders = computed(() =>
    activeFilter.value === 'all'
      ? searchedOrders.value
      : searchedOrders.value.filter((order) => listStatusOf(order) === activeFilter.value),
  )

  /* ---------- 选中与详情 ---------- */

  const selectedNumber = ref('')
  const currentOrder = computed<LingyunPurchaseOrderDetailOrder | null>(
    () => visibleOrders.value.find((order) => order.number === selectedNumber.value) || null,
  )
  const shownOrder = computed<LingyunPurchaseOrderDetailOrder | null>(() => {
    const order = currentOrder.value
    if (!order || !subKey.value) return order
    const sub = (order.subOrders || []).find((item) => item.key === subKey.value)
    return sub ? buildLingyunPurchaseOrderSubDetail(order, sub) : order
  })

  /* 默认选中结果第一条；条件变化后选中项被过滤掉时同步换第一条 */
  watch(
    visibleOrders,
    (list) => {
      if (!list.some((order) => order.number === selectedNumber.value)) {
        selectedNumber.value = list[0]?.number || ''
      }
    },
    { immediate: true },
  )

  /** 宽屏切右栏；中屏在内容区滑入；手机进独立详情页 */
  function onOrderClick(payload: LingyunPurchaseOrderListOrderPayload): void {
    if (wide.value) {
      selectedNumber.value = payload.order.number
      return
    }
    if (cover.value) {
      selectedNumber.value = payload.order.number
      subKey.value = ''
      coverOpen.value = true
      return
    }
    uni.navigateTo({ url: `${DETAIL_URL}?number=${encodeURIComponent(payload.order.number)}` })
  }

  function onSubOrderClick(payload: LingyunPurchaseOrderDetailSubOrderPayload): void {
    if (!wide.value && cover.value) {
      selectedNumber.value = payload.order.number
      subKey.value = payload.subOrder.key
      coverOpen.value = true
      return
    }
    uni.navigateTo({
      url: `${DETAIL_URL}?number=${encodeURIComponent(payload.order.number)}&sub=${encodeURIComponent(payload.subOrder.key)}`,
    })
  }

  /** 中屏盖层：子单先回到父单，父单再滑出 */
  function onDetailBack(): void {
    if (subKey.value) {
      subKey.value = ''
      return
    }
    coverOpen.value = false
  }

  /** 窄屏、非宿主时显示返回：回到目录 */
  function onPageBack(): void {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack()
      return
    }
    uni.reLaunch({ url: '/pages/index/index' })
  }

  /* 头部玻璃进度：由两栏各自的内层滚动驱动 */
  const listGlass = ref(0)
  const detailGlass = ref(0)

  function onListScroll(top: number): void {
    listGlass.value = Math.min(1, Math.max(0, Number(top) / 56))
  }

  function onDetailScroll(top: number): void {
    detailGlass.value = Math.min(1, Math.max(0, Number(top) / 56))
  }

  /* ---------- 演示操作 ---------- */

  function onAction(payload: LingyunPurchaseOrderListActionPayload | { action?: { text?: string } }): void {
    uni.showToast({ title: payload?.action?.text || '操作', icon: 'none' })
  }

  function onItemClick(payload: LingyunPurchaseOrderDetailItemPayload): void {
    uni.showToast({ title: payload.item.name, icon: 'none' })
  }

  function onCopy(payload: LingyunPurchaseOrderDetailCopyPayload): void {
    uni.showToast({ title: `已复制 ${payload.text}`, icon: 'none' })
  }

  function onPaymentTimeout(payload: LingyunPurchaseOrderDetailPaymentTimeoutPayload): void {
    const index = orders.value.findIndex((order) => order.number === payload.order.number)
    if (index < 0) return
    const next = [...orders.value]
    next[index] = { ...next[index], status: 'cancelled' }
    orders.value = next
    uni.showToast({ title: '订货单已超时取消', icon: 'none' })
  }
</script>
