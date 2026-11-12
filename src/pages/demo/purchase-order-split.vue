<template>
  <lingyun-split-layout
    title="订货单"
    :split-at="900"
    :list-width="375"
    @layout-change="onLayoutChange"
  >
    <template #list-header>
      <lingyun-split-toolbar
        title="订货单"
        :segments="filterOptions"
        :segment-value="activeFilter"
        :show-back="!navDocked && !hosted"
        :avoid-capsule="!wide"
        :glass-progress="listGlass"
        @segment-change="onFilterChange"
        @back="onBack"
      />
    </template>

    <template #list>
      <lingyun-purchase-order-list-panel
        class="lingyun-split-layout-pane"
        full
        :orders="orders"
        :filter="activeFilter"
        :selected-key="wide && currentOrder ? currentOrder.key || currentOrder.number : ''"
        :top-space="listTopSpace"
        @scroll="onListScroll"
        @purchase-order-click="onOrderClick"
        @action="onAction"
      />
    </template>

    <template #detail-header>
      <lingyun-split-toolbar title="订货单详情" :glass-progress="detailGlass" />
    </template>

    <template #detail>
      <lingyun-purchase-order-detail-panel
        class="lingyun-split-layout-pane"
        :order="currentOrder"
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

  /** 分栏门槛 / 头部量高由 lingyun-split-layout 负责，这里只跟随 layout-change 做业务分支 */
  const wide = ref(false)
  const listTopSpace = ref(0)
  const detailTopSpace = ref(0)

  function onLayoutChange(value: LingyunSplitLayoutChange): void {
    wide.value = value.wide
    listTopSpace.value = value.listTopSpace
    detailTopSpace.value = value.detailTopSpace
  }

  /** 左侧导航停靠时不显示页面返回 */
  const navDocked = computed(() => isLingyunWideScreen())

  onBeforeUnmount(() => {
    pageHostState.hideToolbar = false
  })

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
      pageHostState.path === 'pages/demo/purchase-order-split' &&
      currentPageRoute() !== 'pages/demo/purchase-order-split',
  )
  /* 本页自己出 toolbar：宿主页（小程序宽屏 / 目录）隐藏自己的 toolbar */
  watch(
    hosted,
    (value) => {
      pageHostState.hideToolbar = value
    },
    { immediate: true },
  )

  /* 头部玻璃进度：由两栏各自的内层滚动驱动 */
  const listGlass = ref(0)
  const detailGlass = ref(0)

  function onListScroll(top: number): void {
    listGlass.value = Math.min(1, Math.max(0, Number(top) / 56))
  }

  function onDetailScroll(top: number): void {
    detailGlass.value = Math.min(1, Math.max(0, Number(top) / 56))
  }

  /* ---------- 状态筛选与选中订货单 ---------- */

  const filterOptions = [
    { key: 'all', text: '全部' },
    { key: 'pendingReview', text: '待审核' },
    { key: 'inProgress', text: '进行中' },
    { key: 'completed', text: '已完成' },
    { key: 'cancelled', text: '已取消' },
  ]

  const activeFilter = ref('all')

  /** 与标准列表页一致的状态归类 */
  function listStatusOf(order: LingyunPurchaseOrderDetailOrder): string {
    const explicit = (order as { listStatus?: string }).listStatus
    if (explicit) return explicit
    if (order.status === 'pendingReview') return 'pendingReview'
    if (order.status === 'completed') return 'completed'
    if (order.status === 'cancelled') return 'cancelled'
    return 'inProgress'
  }

  const orders = ref<LingyunPurchaseOrderDetailOrder[]>([...demoPurchaseOrders])
  const filteredOrders = computed(() =>
    activeFilter.value === 'all'
      ? orders.value
      : orders.value.filter((order) => listStatusOf(order) === activeFilter.value),
  )

  const selectedNumber = ref(orders.value[0]?.number || '')
  const currentOrder = computed<LingyunPurchaseOrderDetailOrder | null>(
    () =>
      filteredOrders.value.find((order) => order.number === selectedNumber.value) ||
      filteredOrders.value[0] ||
      null,
  )

  function onFilterChange(payload: { value?: string | number }): void {
    const value = String(payload?.value || '')
    if (!filterOptions.some((item) => item.key === value)) return
    activeFilter.value = value
    /* 宽屏下选中的订货单不在新筛选里时，自动选中第一条 */
    const first = filteredOrders.value[0]
    if (first && !filteredOrders.value.some((order) => order.number === selectedNumber.value)) {
      selectedNumber.value = first.number
    }
  }

  function onOrderClick(payload: LingyunPurchaseOrderListOrderPayload): void {
    if (wide.value) {
      selectedNumber.value = payload.order.number
      return
    }
    uni.navigateTo({
      url: `/pages/demo/purchase-order-detail?number=${encodeURIComponent(payload.order.number)}`,
    })
  }

  function onAction(payload: LingyunPurchaseOrderListActionPayload | { action?: { text?: string } }): void {
    uni.showToast({ title: payload?.action?.text || '操作', icon: 'none' })
  }

  function onItemClick(payload: LingyunPurchaseOrderDetailItemPayload): void {
    uni.showToast({ title: payload.item.name, icon: 'none' })
  }

  function onSubOrderClick(payload: LingyunPurchaseOrderDetailSubOrderPayload): void {
    uni.navigateTo({
      url: `/pages/demo/purchase-order-detail?number=${encodeURIComponent(payload.order.number)}&sub=${encodeURIComponent(payload.subOrder.key)}`,
    })
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

  function onBack(): void {
    uni.navigateBack({
      fail: () => {
        uni.reLaunch({ url: '/pages/demo/demo' })
      },
    })
  }
</script>
