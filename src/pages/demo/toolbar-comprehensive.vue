<template>
  <lingyun-app-page
    ref="pageRef"
    title="All In One"
    :show-tabbar="false"
    searchable
    search-placeholder="搜索订单"
    v-model:searching="searching"
    v-model:search-value="keyword"
    :segments="segments"
    v-model:segment-value="segment"
    :trailing-buttons="toolbarGroups"
    :trailing-buttons-hidden="filterMenuOpen"
    @trailing-action="onToolbarAction"
    @search-open="setEvent('search-open')"
    @search-cancel="onSearchCancel"
    @search-input="setEvent(`search-input · ${$event || '空'}`)"
    @search="onSearch"
    @segment-click="setEvent(`segment-click · ${$event.value}`)"
    @segment-change="onSegmentChange"
  >
    <view class="page">
      <template v-if="searching">
        <view class="search-head">
          <text class="search-head__title">搜索订单</text>
          <text class="search-head__desc">独立搜索视图 · 历史与结果随关键词变化</text>
        </view>

        <lingyun-section title="搜索历史" hint="点击直接搜索">
          <view v-if="searchHistory.length" class="history-row">
            <view
              v-for="item in searchHistory"
              :key="item"
              class="history-chip"
              hover-class="history-chip--hover"
              @click="pickHistory(item)"
            >
              <text class="history-chip__text">{{ item }}</text>
            </view>
            <view class="history-clear" @click="clearHistory">清空</view>
          </view>
          <text v-else class="hint">暂无搜索历史</text>
        </lingyun-section>

        <lingyun-section title="搜索结果" :hint="`${filtered.length} 条`" is-last>
          <lingyun-list>
            <lingyun-list-item
              v-for="item in filtered"
              :key="item.title"
              :title="item.title"
              :note="item.note"
              :detail="item.status"
            />
            <lingyun-list-item
              v-if="!filtered.length"
              title="没有匹配结果"
              note="换个关键词或调整筛选条件"
            />
          </lingyun-list>
        </lingyun-section>
      </template>

      <template v-else>
        <view class="hero">
          <text class="hero__title">All In One</text>
          <text class="hero__desc">筛选 + 搜索 + 分段控制 + 底部日期切换</text>
        </view>

        <lingyun-section title="顶部能力" :hint="currentLabel">
          <text class="hint">
            右上角筛选按钮打开全宽菜单；搜索按钮独立分组，展开时从右往左滑入；下方分段控制由 app-page 数据配置。
          </text>
          <text class="hint hint--last">最近事件：{{ lastEvent || '—' }}</text>
        </lingyun-section>

        <lingyun-section title="日期范围" :hint="dateModeLabel">
          <text class="hint">底部日期切换器支持天 / 周 / 月 / 年 / 自定义日期段，当前区间：{{ dateRange }}</text>
        </lingyun-section>

        <lingyun-section title="结果" :hint="`${filtered.length} 条`" is-last>
          <lingyun-list>
            <lingyun-list-item
              v-for="item in filtered"
              :key="item.title"
              :title="item.title"
              :note="item.note"
              :detail="item.status"
            />
            <lingyun-list-item v-if="!filtered.length" title="没有匹配结果" note="调整搜索或筛选条件" />
          </lingyun-list>
        </lingyun-section>
      </template>
    </view>

    <lingyun-menu
      v-model:show="filterOpen"
      full-width
      :anchor="menuAnchor"
      @closed="filterMenuOpen = false"
    >
      <template #default="{ close }">
        <view class="filter-form">
          <view class="filter-form__head">
            <text class="filter-form__title">筛选条件</text>
            <text class="filter-form__desc">菜单只负责弹出，表单通过默认插槽自定义</text>
          </view>

          <view class="filter-field">
            <text class="filter-field__label">时间范围</text>
            <lingyun-segmented-control v-model="draft.period" :items="periodItems" size="small" />
          </view>

          <view class="filter-field">
            <text class="filter-field__label">排序</text>
            <lingyun-segmented-control v-model="draft.sort" :items="sortItems" size="small" />
          </view>

          <view class="filter-switch-row">
            <text class="filter-switch-row__label">只看我的订单</text>
            <lingyun-switch v-model="draft.mine" />
          </view>

          <view class="filter-actions">
            <view class="filter-actions__item">
              <lingyun-button variant="bordered" text="重置" block @click="resetDraft" />
            </view>
            <view class="filter-actions__item">
              <lingyun-button
                variant="borderedProminent"
                text="应用"
                block
                @click="applyFilter(close)"
              />
            </view>
          </view>
        </view>
      </template>
    </lingyun-menu>

    <lingyun-date-switcher
      v-model:mode="dateMode"
      :model-value="dateValue"
      @update:model-value="onDateValue"
      @change="onDateChange"
    />
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import type {
    LingyunDateSwitcherChange,
    LingyunDateSwitcherMode,
    LingyunDateSwitcherValue,
  } from '@/uni_modules/lingyun-ui'

  type SegmentKey = 'all' | 'active' | 'done'
  type PeriodKey = 'today' | 'week' | 'month'
  type SortKey = 'updated' | 'amount'
  type AnchorBox = { top: number; left: number; width: number; height: number }

  interface FilterState {
    period: PeriodKey
    sort: SortKey
    mine: boolean
  }

  const pageRef = ref<{ openSearch: () => void } | null>(null)
  const searching = ref(false)
  const keyword = ref('')
  const segment = ref<SegmentKey>('all')
  const lastEvent = ref('')
  const searchHistory = ref<string[]>(['订单 A-1024', '进行中', '本周'])
  const dateMode = ref<LingyunDateSwitcherMode>('week')
  const dateValue = ref<LingyunDateSwitcherValue>('2026-11-02')
  const dateRange = ref('2026-11-02 - 2026-11-08')

  const segments = [
    { key: 'all', text: '全部' },
    { key: 'active', text: '进行中' },
    { key: 'done', text: '已完成' },
  ]
  const periodItems = [
    { key: 'today', text: '今天' },
    { key: 'week', text: '本周' },
    { key: 'month', text: '本月' },
  ]
  const sortItems = [
    { key: 'updated', text: '最近更新' },
    { key: 'amount', text: '金额' },
  ]

  const labels: Record<SegmentKey, string> = {
    all: '全部',
    active: '进行中',
    done: '已完成',
  }
  const currentLabel = computed(() => labels[segment.value] || '—')
  const dateModeLabel = computed(() => {
    const map: Record<string, string> = {
      date: '天',
      week: '周',
      month: '月',
      year: '年',
      range: '日期段',
    }
    return map[dateMode.value] || '周'
  })

  const toolbarGroups = [[{ key: 'filter', icon: 'tune', label: '筛选' }]]
  const filterOpen = ref(false)
  const filterMenuOpen = ref(false)
  const menuAnchor = ref<AnchorBox | null>(null)

  const applied = reactive<FilterState>({ period: 'week', sort: 'updated', mine: false })
  const draft = reactive<FilterState>({ ...applied })

  watch(filterOpen, (open) => {
    if (open) Object.assign(draft, applied)
  })

  const orders = [
    { title: '订单 A-1024', note: '今天 09:42 更新', status: '进行中', statusKey: 'active', mine: true, amount: 129 },
    { title: '订单 A-1023', note: '昨天 18:10 更新', status: '已完成', statusKey: 'done', mine: false, amount: 387 },
    { title: '订单 A-1022', note: '本周一 11:26 更新', status: '待处理', statusKey: 'active', mine: true, amount: 269 },
    { title: '订单 B-2048', note: '本周一 09:15 更新', status: '进行中', statusKey: 'active', mine: false, amount: 560 },
  ]

  const filtered = computed(() => {
    const text = keyword.value.trim().toLowerCase()
    let list = orders
    if (segment.value !== 'all') list = list.filter((item) => item.statusKey === segment.value)
    if (applied.mine) list = list.filter((item) => item.mine)
    if (text) {
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(text) || item.status.toLowerCase().includes(text),
      )
    }
    if (applied.sort === 'amount') list = [...list].sort((a, b) => b.amount - a.amount)
    return list
  })

  function setEvent(text: string): void {
    lastEvent.value = text
  }

  function onSegmentChange(payload: { value?: string | number }): void {
    setEvent(`segment-change · ${payload?.value ?? '—'}`)
  }

  function onSearch(): void {
    const value = keyword.value.trim()
    if (value) {
      searchHistory.value = [value, ...searchHistory.value.filter((item) => item !== value)].slice(0, 6)
    }
    setEvent(`search · ${keyword.value || '空'}`)
    uni.showToast({ title: keyword.value ? `搜索：${keyword.value}` : '搜索空关键词', icon: 'none' })
  }

  function pickHistory(value: string): void {
    keyword.value = value
    searchHistory.value = [
      value,
      ...searchHistory.value.filter((item) => item !== value),
    ].slice(0, 6)
    setEvent(`search-history · ${value}`)
  }

  function clearHistory(): void {
    searchHistory.value = []
    setEvent('search-history · 清空')
  }

  function onSearchCancel(): void {
    setEvent(`search-cancel · ${keyword.value || '空'}`)
  }

  function onDateValue(value: LingyunDateSwitcherValue): void {
    dateValue.value = value
  }

  function onDateChange(payload: LingyunDateSwitcherChange): void {
    dateRange.value = payload.range
    setEvent(`date-change · ${payload.value}`)
  }

  function onToolbarAction(payload: {
    key?: string
    groupIndex?: number
    buttonIndex?: number
    anchor?: AnchorBox | null
  }): void {
    if (payload.key !== 'filter') return
    filterMenuOpen.value = true
    menuAnchor.value = payload.anchor || null
    filterOpen.value = true
  }

  function resetDraft(): void {
    Object.assign(draft, { period: 'week', sort: 'updated', mine: false })
  }

  function applyFilter(close: () => void): void {
    Object.assign(applied, draft)
    close()
    uni.showToast({ title: '筛选已应用', icon: 'none' })
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 150px;
    min-height: 100%;
  }

  .search-head {
    padding: 24px 20px 8px;
  }

  .search-head__title {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--lingyun-label, #1c1c1e);
  }

  .search-head__desc {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .history-row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .history-chip {
    padding: 7px 13px;
    border-radius: 9999px;
    background: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
  }

  .history-chip--hover {
    opacity: 0.65;
  }

  .history-chip__text {
    font-size: 14px;
    line-height: 20px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .history-clear {
    padding: 7px 8px;
    font-size: 13px;
    line-height: 20px;
    color: var(--lingyun-primary, #0a84ff);
  }

  .hero {
    padding: 24px 20px 8px;
  }

  .hero__title {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--lingyun-label, #1c1c1e);
  }

  .hero__desc {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .hint {
    display: block;
    font-size: 13px;
    line-height: 19px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .hint--last {
    margin-top: 8px;
    color: var(--lingyun-primary, #0a84ff);
  }

  .filter-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 6px 6px 4px;
  }

  .filter-form__head {
    padding: 4px 4px 0;
  }

  .filter-form__title {
    display: block;
    font-size: 20px;
    font-weight: 600;
    line-height: 26px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .filter-form__desc {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    line-height: 17px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .filter-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .filter-field__label {
    padding-left: 4px;
    font-size: 13px;
    font-weight: 500;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .filter-switch-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    padding: 0 4px;
  }

  .filter-switch-row__label {
    font-size: 15px;
    line-height: 20px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .filter-actions {
    display: flex;
    flex-direction: row;
    gap: 8px;
    margin-top: 4px;
  }

  .filter-actions__item {
    flex: 1;
    min-width: 0;
  }
</style>
