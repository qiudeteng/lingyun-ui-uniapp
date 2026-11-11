<template>
  <lingyun-app-page
    class="po-split-page"
    :class="{ 'po-split-page--narrow': !wide }"
    title="订货单"
    :show-toolbar="false"
    :show-tabbar="false"
    :body-scroll="false"
  >
    <view class="po-page" :class="{ 'po-page--wide': wide }">
      <!-- 左栏 = 独立页面：自己的 toolbar + 订货单列表（inline 面板，不嵌套页面壳） -->
      <view class="po-pane po-pane--list">
        <view class="po-pane__header po-pane__header--list">
          <lingyun-toolbars
            :fixed="false"
            :show-back="!navDocked && !hosted"
            :show-trailing="false"
            :show-window-controls="false"
            :show-theme-switch="false"
            title-style="title2LineLeft"
            title="订货单"
            :subtitle="`${filteredOrders.length} 条结果`"
            :segments="filterOptions"
            :segment-value="activeFilter"
            segment-control="tabs"
            :glass-progress="listGlass"
            @segment-change="onFilterChange"
            @back="onBack"
          />
        </view>

        <lingyun-purchase-order-list-panel
          class="po-panel"
          full
          :orders="orders"
          :filter="activeFilter"
          :selected-key="wide && currentOrder ? currentOrder.key || currentOrder.number : ''"
          :top-space="listHeaderHeight"
          @scroll="onListScroll"
          @purchase-order-click="onOrderClick"
          @action="onAction"
        />
      </view>

      <!-- 宽屏右侧详情；窄屏走独立详情页 -->
      <template v-if="wide">
        <view class="po-divider" />
        <view class="po-pane po-pane--detail">
          <view class="po-pane__header po-pane__header--detail">
            <lingyun-toolbars
              :fixed="false"
              :show-back="false"
              :show-trailing="false"
              :show-window-controls="false"
              :show-theme-switch="false"
              title-style="title2LineLeft"
              title="订货单详情"
              :subtitle="currentOrder ? currentOrder.number : ''"
              :glass-progress="detailGlass"
            />
          </view>

          <lingyun-purchase-order-detail-panel
            class="po-panel"
            :order="currentOrder"
            :top-space="detailHeaderHeight"
            @scroll="onDetailScroll"
            @action="onAction"
            @item-click="onItemClick"
            @sub-purchase-order-click="onSubOrderClick"
            @copy="onCopy"
            @payment-timeout="onPaymentTimeout"
          />
        </view>
      </template>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { isLingyunWideScreen } from '@/uni_modules/lingyun-ui'
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

  /** 左右分栏门槛与列表详情 demo 一致：900，iPad 竖屏单栏、横屏分栏 */
  const SPLIT_MIN_WIDTH = 900

  function readWindowWidth(): number {
    try {
      const info =
        typeof uni.getWindowInfo === 'function'
          ? uni.getWindowInfo()
          : uni.getSystemInfoSync()
      return Number(info.windowWidth) || 0
    } catch {
      return 0
    }
  }

  const windowWidth = ref(readWindowWidth())
  const wide = computed(() => windowWidth.value >= SPLIT_MIN_WIDTH)
  /** 左侧导航停靠时不显示页面返回 */
  const navDocked = computed(() => isLingyunWideScreen())

  function onWindowResize(): void {
    windowWidth.value = readWindowWidth()
    scheduleHeaderMeasure()
  }

  try {
    if (typeof uni.onWindowResize === 'function') uni.onWindowResize(onWindowResize)
  } catch {
    /* 端不支持 */
  }
  onBeforeUnmount(() => {
    try {
      if (typeof uni.offWindowResize === 'function') uni.offWindowResize(onWindowResize)
    } catch {
      /* 端不支持 */
    }
    if (measureTimer) clearTimeout(measureTimer)
    pageHostState.hideToolbar = false
  })

  /* ---------- 浮动头部：量高度，作为面板顶部占位（与列表详情 demo 同一做法） ---------- */

  const instance = getCurrentInstance()
  const listHeaderHeight = ref(0)
  const detailHeaderHeight = ref(0)
  let measureTimer: ReturnType<typeof setTimeout> | null = null

  function measurePaneHeader(): void {
    const proxy = instance?.proxy
    if (!proxy) return
    const query = uni.createSelectorQuery().in(proxy)
    query
      .select('.po-pane__header--list')
      .boundingClientRect((rect) => {
        const box = Array.isArray(rect) ? rect[0] : rect
        listHeaderHeight.value = Number(box?.height) || 0
      })
    query
      .select('.po-pane__header--detail')
      .boundingClientRect((rect) => {
        const box = Array.isArray(rect) ? rect[0] : rect
        detailHeaderHeight.value = Number(box?.height) || 0
      })
    query.exec(() => {})
  }

  function scheduleHeaderMeasure(): void {
    clearTimeout(measureTimer ?? undefined)
    measureTimer = setTimeout(() => {
      measureTimer = null
      measurePaneHeader()
    }, 120)
  }

  onMounted(() => {
    nextTick(() => {
      measurePaneHeader()
      scheduleHeaderMeasure()
      setTimeout(measurePaneHeader, 360)
    })
  })

  watch(wide, () => {
    nextTick(() => scheduleHeaderMeasure())
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

<style lang="scss">
  /*
   * 页面根结构样式放在独立类上：H5 路由切换不会卸载页面样式，
   * 不能写到通用 .page 上，避免 flex / 100vh 泄漏到其它页面。
   */
  .po-page {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    height: 100vh;
    min-height: 0;
    padding: 0;
  }

  .po-pane {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .po-page--wide .po-pane--list {
    flex: 0 0 375px;
    width: 375px;
  }

  /* 浮动头部：toolbar 盖在列表 / 详情上方，内容从下方穿过 */
  .po-pane__header {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: 4;
  }

  /*
   * 小程序：自定义组件的宿主节点是额外一层、默认高度随内容，
   * 面板根节点的 height:100% 撑不起来会随内容变高、把整页顶出滚动。
   * 给宿主显式 flex + height:0，面板内层滚动才有确定高度（H5 下等价于铺满栏位）。
   */
  .po-panel {
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    min-width: 0;
    min-height: 0;
    height: 0;
    overflow: hidden;
  }

  /* 两栏之间 0.5px 缝隙：透明、透出页面底色（对齐列表与详情 demo），
     白色卡片 / 左栏与详情之间的色差自然形成边线 */
  .po-divider {
    flex: 0 0 1px;
    width: 1px;
    height: 100%;
    background: transparent;
    transform: scaleX(0.5);
    transform-origin: center;
  }
</style>
