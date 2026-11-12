<template>
  <lingyun-split-layout
    title="分栏布局"
    :split-at="900"
    :list-width="375"
    :detail-open="coverOpen"
    @layout-change="onLayoutChange"
  >
    <template #list-header>
      <lingyun-split-toolbar
        title="条目"
        searchable
        search-placeholder="搜索条目 / 说明"
        :trailing-buttons="toolbarButtons"
        trailing-menu-enabled
        :show-back="!navDocked && !hosted"
        :avoid-capsule="!wide"
        :glass-progress="listGlass"
        v-model:searching="searching"
        v-model:search-value="keyword"
        @search-cancel="onSearchCancel"
        @back="onBack"
      >
        <template #trailing-menu="{ close }">
          <view class="demo-filter">
            <text class="demo-filter__title">状态</text>
            <view class="demo-filter__chips">
              <view
                v-for="option in statusOptions"
                :key="option.key"
                class="demo-filter__chip"
                :class="{ 'demo-filter__chip--active': statusFilter === option.key }"
                @click="pickStatus(option.key, close)"
              >
                <text class="demo-filter__chip-text">{{ option.text }}</text>
              </view>
            </view>
            <view class="demo-filter__actions">
              <lingyun-button
                variant="bordered"
                block
                text="重置筛选"
                @click="resetFilters(close)"
              />
            </view>
          </view>
        </template>
      </lingyun-split-toolbar>
    </template>

    <template #list>
      <view class="lingyun-split-layout-pane">
        <scroll-view
          class="lingyun-split-layout-scroll"
          scroll-y
          :show-scrollbar="false"
          @scroll="onListScroll"
        >
          <view class="demo-space" :style="{ height: `${listTopSpace}px` }" />

          <lingyun-list v-if="filteredItems.length" plain>
            <view
              v-for="item in filteredItems"
              :key="item.id"
              class="demo-row"
              :class="{ 'demo-row--active': wide && item.id === selectedId }"
              @click="onItemTap(item)"
            >
              <lingyun-list-item
                :title="item.title"
                :note="item.note"
                clickable
                accessory="disclosure"
              >
                <template #extra>
                  <text
                    class="demo-row__status"
                    :class="`demo-row__status--${item.statusKey}`"
                  >{{ item.status }}</text>
                </template>
              </lingyun-list-item>
            </view>
          </lingyun-list>

          <view v-else class="demo-empty">
            <lingyun-empty
              title="没有匹配的条目"
              description="调整搜索关键词或状态筛选。"
              action-placement="bottom"
            >
              <template #action>
                <lingyun-button variant="bordered" block text="重置筛选" @click="resetFilters()" />
              </template>
            </lingyun-empty>
          </view>

          <view class="demo-bottom" />
        </scroll-view>
      </view>
    </template>

    <!-- 右栏：宽屏分栏；中屏在内容区滑入 -->
    <template #detail-header>
      <lingyun-split-toolbar
        title="条目详情"
        :show-back="cover"
        :avoid-capsule="cover"
        :glass-progress="detailGlass"
        @back="closeCover"
      />
    </template>

    <template #detail>
      <scroll-view
        class="lingyun-split-layout-fill"
        scroll-y
        :show-scrollbar="false"
        @scroll="onDetailScroll"
      >
        <view class="demo-space" :style="{ height: `${detailTopSpace}px` }" />
        <view class="demo-detail">
          <lingyun-section title="lingyun-split-layout" hint="宽屏左右分栏 · 窄屏只渲染左栏">
            <view class="demo-hint">
              <text class="demo-hint__line">本页整页就是分栏布局组件本身：左栏列表、右栏详情各自滚动，两个浮动 toolbar 由 header 插槽提供。</text>
              <text class="demo-hint__line">左栏 toolbar 演示了组件里自带的搜索（放大镜 → 输入框）与筛选（右侧按钮 → 内置浮层）；搜索 / 筛选只影响左栏列表，右栏跟随选中项。</text>
            </view>
          </lingyun-section>

          <lingyun-section v-if="selectedItem" title="当前条目" :hint="selectedItem.status" is-last>
            <lingyun-list>
              <lingyun-list-item title="标题" :note="selectedItem.title" />
              <lingyun-list-item title="编号" :note="selectedItem.id" />
              <lingyun-list-item title="说明" :note="selectedItem.body" />
            </lingyun-list>
          </lingyun-section>

          <lingyun-section v-else title="未选择条目" is-last>
            <view class="demo-hint">
              <text class="demo-hint__line">点左侧列表查看条目详情。</text>
            </view>
          </lingyun-section>
          <view class="demo-detail__bottom" />
        </view>
      </scroll-view>
    </template>
  </lingyun-split-layout>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import { isLingyunWideScreen, type LingyunSplitLayoutChange } from '@/uni_modules/lingyun-ui'
  import { pageHostState } from '@/router/pageHost'

  interface DemoItem {
    id: string
    title: string
    note: string
    status: string
    statusKey: 'doing' | 'pending' | 'done'
    body: string
  }

  const STATUS_TEXT = { doing: '进行中', pending: '待处理', done: '已完成' } as const

  const items: DemoItem[] = Array.from({ length: 12 }, (_, index) => {
    const no = String(index + 1).padStart(2, '0')
    const statusKey = (['doing', 'pending', 'done'] as const)[index % 3]
    return {
      id: `demo-${no}`,
      title: `示例条目 ${no}`,
      note: `分组 ${index % 3 === 0 ? 'A' : index % 3 === 1 ? 'B' : 'C'} · 更新于 11-1${index % 10}`,
      status: STATUS_TEXT[statusKey],
      statusKey,
      body: `这是第 ${no} 条演示数据，用来展示分栏布局里「左列表 / 右详情」的联动。选中左侧条目，右侧显示对应详情并在窄屏时提示分栏门槛。`,
    }
  })

  const wide = ref(false)
  const cover = ref(false)
  const coverOpen = ref(false)
  const listTopSpace = ref(0)
  const detailTopSpace = ref(0)
  const listGlass = ref(0)
  const detailGlass = ref(0)

  function onLayoutChange(value: LingyunSplitLayoutChange): void {
    wide.value = value.wide
    cover.value = value.cover
    if (value.wide) coverOpen.value = false
    listTopSpace.value = value.listTopSpace
    detailTopSpace.value = value.detailTopSpace
  }

  function closeCover(): void {
    coverOpen.value = false
  }

  /** 左侧导航停靠时不显示返回 */
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

  /** 小程序宽屏宿主内：toolbar 属于宿主 */
  const hosted = computed(
    () =>
      pageHostState.path === 'pages/demo/split-layout' &&
      currentPageRoute() !== 'pages/demo/split-layout',
  )
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

  /* ---------- 搜索 / 筛选 ---------- */

  const searching = ref(false)
  const keyword = ref('')
  const statusFilter = ref<'all' | DemoItem['statusKey']>('all')

  const statusOptions: { key: 'all' | DemoItem['statusKey']; text: string }[] = [
    { key: 'all', text: '全部' },
    { key: 'doing', text: '进行中' },
    { key: 'pending', text: '待处理' },
    { key: 'done', text: '已完成' },
  ]

  const toolbarButtons = [{ key: 'filter', icon: 'tune', label: '筛选' }]

  const filteredItems = computed<DemoItem[]>(() => {
    const text = keyword.value.trim().toLowerCase()
    return items.filter((item) => {
      if (statusFilter.value !== 'all' && item.statusKey !== statusFilter.value) return false
      if (!text) return true
      return [item.title, item.note, item.body].join(' ').toLowerCase().includes(text)
    })
  })

  function onSearchCancel(): void {
    searching.value = false
    keyword.value = ''
  }

  function pickStatus(key: 'all' | DemoItem['statusKey'], close?: () => void): void {
    statusFilter.value = key
    if (typeof close === 'function') close()
  }

  function resetFilters(close?: () => void): void {
    keyword.value = ''
    statusFilter.value = 'all'
    if (typeof close === 'function') close()
  }

  /* ---------- 选中与联动 ---------- */

  const selectedId = ref(items[0]?.id || '')
  const selectedItem = computed(
    () => filteredItems.value.find((item) => item.id === selectedId.value) || null,
  )

  /* 宽屏下默认选中筛选结果第一条；搜索 / 筛选后选中项被过滤掉时同步换第一条 */
  watch(
    filteredItems,
    (list) => {
      if (!wide.value) return
      if (!list.some((item) => item.id === selectedId.value)) {
        selectedId.value = list[0]?.id || ''
      }
    },
  )

  function onItemTap(item: DemoItem): void {
    selectedId.value = item.id
    if (wide.value) return
    if (cover.value) {
      coverOpen.value = true
      return
    }
    uni.showToast({ title: '手机宽度打开独立详情页', icon: 'none' })
  }

  function onListScroll(event: { detail?: { scrollTop?: number } }): void {
    const top = Number(event?.detail?.scrollTop) || 0
    listGlass.value = Math.min(1, Math.max(0, top / 56))
  }

  function onDetailScroll(event: { detail?: { scrollTop?: number } }): void {
    const top = Number(event?.detail?.scrollTop) || 0
    detailGlass.value = Math.min(1, Math.max(0, top / 56))
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
   * 插槽内容的结构（绝对铺满 / 内层滚动）来自 lingyun-split-layout 的全局工具类：
   * lingyun-split-layout-pane / -scroll / -fill（见 styles/setting/_split-layout.scss）。
   * 左栏底色由 split-layout 统一提供，这里不要再设背景。
   */

  .demo-space {
    width: 100%;
  }

  .demo-row--active {
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .demo-row__status {
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .demo-row__status--doing {
    color: var(--lingyun-primary, #0a84ff);
  }

  .demo-row__status--pending {
    color: var(--lingyun-warning, #ff8d28);
  }

  .demo-row__status--done {
    color: var(--lingyun-success, #34c759);
  }

  .demo-empty {
    padding: 24px 16px;
  }

  .demo-bottom {
    height: calc(24px + env(safe-area-inset-bottom));
  }

  .demo-detail {
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
  }

  .demo-detail__bottom {
    height: 8px;
  }

  .demo-hint {
    padding: 0 16px 12px;
  }

  .demo-hint__line {
    display: block;
    font-size: 13px;
    line-height: 20px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  /* 筛选浮层（toolbar 内置 #trailing-menu） */
  .demo-filter {
    padding: 8px 4px 4px;
  }

  .demo-filter__title {
    display: block;
    padding: 0 8px 8px;
    font-size: 13px;
    font-weight: 600;
    line-height: 16px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .demo-filter__chips {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 8px;
  }

  .demo-filter__chip {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
    height: 36px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--lingyun-fill-tertiary, rgba(120, 120, 128, 0.12));
  }

  .demo-filter__chip--active {
    background-color: var(--lingyun-primary, #0088ff);
  }

  .demo-filter__chip-text {
    font-size: 14px;
    line-height: 18px;
    color: var(--lingyun-label, #000000);
  }

  .demo-filter__chip--active .demo-filter__chip-text {
    color: #ffffff;
    font-weight: 600;
  }

  .demo-filter__actions {
    padding: 12px 8px 4px;
  }
</style>
