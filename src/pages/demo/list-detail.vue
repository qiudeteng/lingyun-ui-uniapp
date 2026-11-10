<template>
  <lingyun-app-page
    class="list-detail-page"
    :class="{ 'list-detail-page--narrow': !wide }"
    title="列表与详情"
    :show-tabbar="false"
    :body-scroll="false"
    :show-toolbar="false"
  >
    <view class="page" :class="{ 'page--wide': wide }">
      <!-- 左栏 = 独立页面：自己的 toolbar（工单 + 条数 + 搜索按钮） -->
      <view class="list-pane">
        <!-- toolbar（标题 / 搜索 / 状态分段）浮动在列表上方，列表从下方穿过 -->
        <view class="pane-header">
          <lingyun-toolbars
            :class="{ 'pane-toolbar--pc': weixinPc }"
            :fixed="false"
            :avoid-capsule="!wide"
            :show-back="!navDocked && !hosted"
            :show-trailing="false"
            :show-window-controls="false"
            :show-theme-switch="false"
            title-style="title2LineLeft"
            title="工单"
            :subtitle="`${filteredTickets.length} 条结果`"
            searchable
            search-placeholder="搜索工单 / 客户"
            :segments="statusOptions"
            :segment-value="statusFilter"
            segment-control="segmented"
            :glass-progress="listGlass"
            v-model:searching="searching"
            v-model:search-value="keyword"
            @search-cancel="onSearchCancel"
            @segment-change="onStatusSegmentChange"
            @back="onPageBack"
          />
        </view>

        <scroll-view
          class="list-scroll"
          scroll-y
          :show-scrollbar="false"
          :scroll-into-view="listAnchor"
          @scroll="onListScroll"
        >
          <view id="list-scroll-top" class="list-top-anchor" />
          <view
            class="list-top-spacer"
            :style="{ height: `${headerHeight}px` }"
          />

          <lingyun-list v-if="filteredTickets.length" plain>
            <view
              v-for="ticket in filteredTickets"
              :key="ticket.id"
              class="ticket-row"
              :class="{ 'ticket-row--active': wide && ticket.id === selectedId }"
            >
              <lingyun-list-item
                :title="ticket.title"
                :note="`${ticket.customer} · ${ticket.updatedAt.slice(5)}`"
                clickable
                @click="onTicketTap(ticket)"
              >
                <template #extra>
                  <text class="ticket-status" :class="`ticket-status--${ticket.status}`">
                    {{ LIST_DETAIL_STATUS_TEXT[ticket.status] }}
                  </text>
                </template>
              </lingyun-list-item>
            </view>
          </lingyun-list>

          <view v-else class="list-empty">
            <lingyun-empty
              title="没有匹配的工单"
              description="调整搜索关键词、状态或底部时间范围。"
              action-placement="bottom"
            >
              <template #action>
                <lingyun-button variant="bordered" block text="重置筛选" @click="resetFilters" />
              </template>
            </lingyun-empty>
          </view>

          <!-- 列表铺到栏底，给浮在底部的日期条留出可滚过的缓冲 -->
          <view class="list-bottom-spacer" />
        </scroll-view>

        <view class="list-date" :class="{ 'list-date--wide': wide }">
          <lingyun-date-switcher
            v-model:mode="dateMode"
            :model-value="dateValue"
            :fixed="!wide"
            :safe-area="!wide"
            limit="past"
            @update:model-value="onDateValue"
            @change="onDateChange"
          />
        </view>
      </view>

      <!-- 宽屏右侧详情；窄屏走独立详情页 -->
      <template v-if="wide">
        <view class="split-divider" />
        <view class="detail-pane">
          <view class="detail-header">
            <lingyun-toolbars
              :class="{ 'pane-toolbar--pc': weixinPc }"
              :fixed="false"
              :show-back="false"
              :show-trailing="false"
              :show-window-controls="false"
              :show-theme-switch="false"
              title-style="title2LineLeft"
              title="工单详情"
              :subtitle="selectedTicket ? selectedTicket.id : '未选择工单'"
              :glass-progress="detailGlass"
            />
          </view>
          <scroll-view
            class="detail-scroll"
            scroll-y
            :show-scrollbar="false"
            :scroll-into-view="detailAnchor"
            @scroll="onDetailScroll"
          >
            <view id="list-detail-top" class="detail-top-anchor" />
            <view
              class="detail-top-spacer"
              :style="{ height: `${detailHeaderHeight}px` }"
            />
            <ticket-detail v-if="selectedTicket" :ticket="selectedTicket" />
            <view v-else class="detail-empty">
              <lingyun-empty title="选择一项工单" description="点左侧列表查看工单详情。" />
            </view>
          </scroll-view>
        </view>
      </template>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import {
    computed,
    getCurrentInstance,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
  } from 'vue'
  import {
    isLingyunWeixinPc,
    isLingyunWideScreen,
    type LingyunDateSwitcherChange,
    type LingyunDateSwitcherMode,
    type LingyunDateSwitcherValue,
  } from '@/uni_modules/lingyun-ui'
  import { useLingyunAppPageScroll } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'
  import { pageHostState } from '@/router/pageHost'
  import TicketDetail from '@/components/ticket-detail/ticket-detail.vue'
  import {
    LIST_DETAIL_STATUS_TEXT,
    listDetailTickets,
    type ListDetailStatus,
    type ListDetailTicket,
  } from './listDetailDemo'

  interface PaneScrollEvent {
    detail?: { scrollTop?: number }
  }

  type StatusFilter = 'all' | ListDetailStatus

  const reportScroll = useLingyunAppPageScroll()

  /** 左右分栏门槛 900：iPad 竖屏 768 / 手机走单栏，详情开独立页；横屏 1024 起分栏 */
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
  /** 左侧导航是否停靠：导航停靠时不显示页面返回（iPad 竖屏 / 横屏） */
  const navDocked = computed(() => isLingyunWideScreen())
  /** 微信 PC 端没有系统状态栏 / 胶囊 / 底部安全区，按 Web 处理 */
  const weixinPc = isLingyunWeixinPc()

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
      pageHostState.path === 'pages/demo/list-detail' &&
      currentPageRoute() !== 'pages/demo/list-detail',
  )
  /* 本页自己出 toolbar：宿主页（小程序宽屏 / 目录）隐藏自己的 toolbar */
  watch(
    hosted,
    (value) => {
      pageHostState.hideToolbar = value
    },
    { immediate: true },
  )

  /* ---------- 左栏浮动头部：量高度给列表做顶部占位，滚动时行从 toolbar 下穿过 ---------- */

  const instance = getCurrentInstance()
  const headerHeight = ref(0)
  const detailHeaderHeight = ref(0)

  function measurePaneHeader(): void {
    const proxy = instance?.proxy
    if (!proxy) return
    const query = uni.createSelectorQuery().in(proxy)
    query
      .select('.pane-header')
      .boundingClientRect((rect) => {
        const box = Array.isArray(rect) ? rect[0] : rect
        headerHeight.value = Number(box?.height) || 0
      })
    query
      .select('.detail-header')
      .boundingClientRect((rect) => {
        const box = Array.isArray(rect) ? rect[0] : rect
        detailHeaderHeight.value = Number(box?.height) || 0
      })
    query.exec()
  }

  function scheduleMeasure(): void {
    nextTick(() => {
      measurePaneHeader()
    })
  }

  watch(wide, scheduleMeasure)

  let resizeMeasureTimer: ReturnType<typeof setTimeout> | null = null

  function handleWindowResize(res: {
    size?: { windowWidth?: number }
    windowWidth?: number
  }): void {
    const width =
      Number(res?.size?.windowWidth) || Number(res?.windowWidth) || readWindowWidth()
    if (width > 0) windowWidth.value = width
    scheduleMeasure()
  }

  onMounted(() => {
    scheduleMeasure()
    /* toolbar 自身的布局同步晚一拍，再量一次兜底 */
    resizeMeasureTimer = setTimeout(scheduleMeasure, 120)
    uni.onWindowResize?.(handleWindowResize)
  })

  onBeforeUnmount(() => {
    if (resizeMeasureTimer) clearTimeout(resizeMeasureTimer)
    if (listAnchorTimer) clearTimeout(listAnchorTimer)
    if (detailAnchorTimer) clearTimeout(detailAnchorTimer)
    uni.offWindowResize?.(handleWindowResize)
    pageHostState.hideToolbar = false
  })

  /* ---------- 左栏：搜索 / 状态 / 时间 ---------- */

  const searching = ref(false)
  const keyword = ref('')

  /* 搜索模式切换可能改变 toolbar 高度，重新量一次占位 */
  watch(searching, scheduleMeasure)
  const statusFilter = ref<StatusFilter>('all')
  const statusOptions: { key: StatusFilter; text: string }[] = [
    { key: 'all', text: '全部' },
    { key: 'open', text: '待处理' },
    { key: 'doing', text: '处理中' },
    { key: 'done', text: '已完成' },
  ]

  /** toolbar 分段控件变化：payload.value 是选项 key */
  function onStatusSegmentChange(payload: { value?: string | number }): void {
    const value = String(payload?.value || '')
    const matched = statusOptions.find((item) => item.key === value)
    if (matched) statusFilter.value = matched.key
  }

  function pad2(n: number): string {
    return n < 10 ? `0${n}` : String(n)
  }

  function formatDate(date: Date): string {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
  }

  function monthStartText(): string {
    return `${formatDate(new Date()).slice(0, 7)}-01`
  }

  function monthEndText(): string {
    const now = new Date()
    return formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0, 12))
  }

  const dateMode = ref<LingyunDateSwitcherMode>('month')
  const dateValue = ref<LingyunDateSwitcherValue>(formatDate(new Date()))
  const dateStart = ref(monthStartText())
  const dateEnd = ref(monthEndText())

  function onDateValue(value: LingyunDateSwitcherValue): void {
    dateValue.value = value
  }

  function onDateChange(payload: LingyunDateSwitcherChange): void {
    const parts = String(payload.range || '').split(' - ')
    dateStart.value = parts[0] || ''
    dateEnd.value = parts[1] || parts[0] || ''
  }

  const filteredTickets = computed<ListDetailTicket[]>(() => {
    const text = keyword.value.trim().toLowerCase()
    return listDetailTickets.filter((ticket) => {
      if (statusFilter.value !== 'all' && ticket.status !== statusFilter.value) return false
      const date = ticket.updatedAt.slice(0, 10)
      if (date < dateStart.value || date > dateEnd.value) return false
      if (text) {
        const haystack = [
          ticket.title,
          ticket.customer,
          ticket.assignee,
          ticket.id,
          ticket.description,
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(text)) return false
      }
      return true
    })
  })

  function resetFilters(): void {
    keyword.value = ''
    statusFilter.value = 'all'
    dateMode.value = 'month'
    dateValue.value = formatDate(new Date())
    dateStart.value = monthStartText()
    dateEnd.value = monthEndText()
  }

  /** 搜索 / 筛选 / 时间变化后列表回到顶部：先清空再设置锚点，完成后清空避免重渲染反复回顶 */
  const listAnchor = ref('')
  let listAnchorTimer: ReturnType<typeof setTimeout> | null = null

  function scrollListTop(): void {
    listAnchor.value = ''
    nextTick(() => {
      listAnchor.value = 'list-scroll-top'
      if (listAnchorTimer) clearTimeout(listAnchorTimer)
      listAnchorTimer = setTimeout(() => {
        listAnchor.value = ''
      }, 300)
    })
  }

  watch(filteredTickets, () => scrollListTop())

  /* ---------- 选中与详情 ---------- */

  const selectedId = ref('')
  const selectedTicket = computed<ListDetailTicket | null>(
    () => filteredTickets.value.find((ticket) => ticket.id === selectedId.value) || null,
  )

  /** 切工单后把右栏滚回顶部：先清空再设置锚点，重复点也能触发 */
  const detailAnchor = ref('')
  let detailAnchorTimer: ReturnType<typeof setTimeout> | null = null

  /** 左右两栏 toolbar 的玻璃进度（0~1），跟随各自滚动 */
  const listGlass = ref(0)
  const detailGlass = ref(0)

  function scrollDetailTop(): void {
    detailAnchor.value = ''
    nextTick(() => {
      detailAnchor.value = 'list-detail-top'
      if (detailAnchorTimer) clearTimeout(detailAnchorTimer)
      detailAnchorTimer = setTimeout(() => {
        detailAnchor.value = ''
      }, 300)
    })
  }

  /* 宽屏下默认选中筛选结果第一条；条件变化后选中项被过滤掉时同步换第一条 */
  watch(
    [wide, filteredTickets],
    () => {
      if (!wide.value) return
      const list = filteredTickets.value
      if (!list.some((ticket) => ticket.id === selectedId.value)) {
        selectedId.value = list[0]?.id || ''
      }
    },
    { immediate: true },
  )

  function onTicketTap(ticket: ListDetailTicket): void {
    if (wide.value) {
      selectedId.value = ticket.id
      scrollDetailTop()
      return
    }
    uni.navigateTo({ url: `/pages/demo/list-detail-item?id=${encodeURIComponent(ticket.id)}` })
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

  function onListScroll(event: PaneScrollEvent): void {
    const top = Number(event?.detail?.scrollTop) || 0
    reportScroll(top)
    listGlass.value = Math.min(1, Math.max(0, top / 56))
  }

  function onDetailScroll(event: PaneScrollEvent): void {
    const top = Number(event?.detail?.scrollTop) || 0
    reportScroll(top)
    detailGlass.value = Math.min(1, Math.max(0, top / 56))
  }

  function onSearchCancel(): void {
    keyword.value = ''
  }
</script>

<style lang="scss">
  .page {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    height: 100vh;
    min-height: 0;
    padding: 0;
  }

  /*
   * 宿主目录页（index / demo）的 .page 带 40px 底部 padding，
   * 固定 100vh + border-box 时会把内容顶起 40；这里压掉。
   */
  .list-detail-page .page {
    padding: 0;
    min-height: 0;
  }

  /* #ifdef H5 */
  /* 网页没有系统状态栏：留白放进 toolbar 内部（chrome 盖住），避免上方透底 */
  .pane-header .lingyun-toolbars,
  .detail-header .lingyun-toolbars {
    padding-top: 12px;
  }
  /* #endif */

  /* 微信 PC 端按 Web：toolbar 顶部同样补 12 */
  .pane-toolbar--pc {
    padding-top: 12px;
  }

  /* 左栏本身是一个独立页面：toolbar + 控件 + 纯列表 + 底部时间条 */
  .list-pane {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background: var(--lingyun-bg-primary, #ffffff);
  }

  /* 窄屏整页就是左侧纯列表，页面壳背景也改 Primary，顶栏下不露分组渐变 */
  .list-detail-page--narrow {
    --lingyun-page-background: var(--lingyun-bg-primary, #ffffff);
  }

  /* 宽屏左栏固定为手机逻辑宽度 375 */
  .page--wide .list-pane {
    flex: 0 0 375px;
    width: 375px;
  }

  /*
   * 浮动头部：toolbar（含状态分段行）盖在列表上方；
   * 列表从下方穿过，滚动时 toolbar 的玻璃层覆盖整条 header。
   */
  .pane-header {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: 4;
  }

  /* 纯列表：全宽平铺，不要悬浮卡片 */
  .list-scroll {
    flex: 1;
    min-height: 0;
    height: 0;
    box-sizing: border-box;
  }

  .list-top-spacer {
    width: 100%;
  }

  .list-top-anchor {
    height: 0;
  }

  .list-empty {
    padding: 24px 16px;
  }

  /* 宽屏：日期条浮在左栏列表上方（占位由 wrapper 提供）；
     窄屏交给组件自己的 fixed + 安全区模式，与纯列表页的底部日期条一致 */
  .list-date {
    pointer-events: none;
  }

  .list-date--wide {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }

  .list-bottom-spacer {
    height: calc(108px + env(safe-area-inset-bottom));
  }

  .detail-pane {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* 右侧 toolbar 浮动在详情上方，详情内容从下方穿过 */
  .detail-header {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: 4;
  }

  .detail-scroll {
    flex: 1;
    min-height: 0;
    height: 0;
    box-sizing: border-box;
  }

  .detail-top-spacer {
    width: 100%;
  }

  .split-divider {
    flex: 0 0 1px;
    width: 1px;
    height: 100%;
    /* 透明：缝隙透出页面 grouped 底色——白色列表旁自然成线，选中行同为 grouped 底色时无缝 */
    background: transparent;
    transform: scaleX(0.5);
    transform-origin: center;
  }

  .detail-empty {
    padding: 40px 16px;
  }

  .detail-top-anchor {
    height: 0;
  }

  /* 选中行：与右侧内容区同一底色，选中行贴右边缘时和详情列无缝衔接 */
  .ticket-row--active {
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .ticket-status {
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .ticket-status--open {
    color: var(--lingyun-warning, #ff8d28);
  }

  .ticket-status--doing {
    color: var(--lingyun-primary, #0a84ff);
  }

  .ticket-status--done {
    color: var(--lingyun-success, #34c759);
  }
</style>
