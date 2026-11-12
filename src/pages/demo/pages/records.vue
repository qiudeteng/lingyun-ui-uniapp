<template>
  <lingyun-app-page
    ref="pageRef"
    title="记录列表"
    :show-tabbar="false"
    searchable
    search-placeholder="搜索客户 / 商品 / 单号 / 备注"
    v-model:searching="searching"
    v-model:search-value="keyword"
    :segments="typeSegments"
    v-model:segment-value="typeValue"
    :trailing-buttons="toolbarGroups"
    :trailing-buttons-hidden="filterMenuOpen"
    @trailing-action="onToolbarAction"
    @search="onSearchConfirm"
  >
    <view class="page" :class="{ 'page--searching': searching }">
      <!-- 搜索历史：搜索态且还没输入关键词 -->
      <view v-if="searching && !keyword.trim()" class="search-panel">
        <view class="search-panel__head">
          <text class="search-panel__title">搜索记录</text>
          <text v-if="searchHistory.length" class="search-panel__clear" @click="clearHistory">清空</text>
        </view>
        <text class="search-panel__scope">当前时间范围：{{ periodText }}</text>
        <view v-if="searchHistory.length" class="search-panel__chips">
          <view
            v-for="item in searchHistory"
            :key="item"
            class="search-chip"
            hover-class="search-chip--hover"
            @click="pickHistory(item)"
          >
            <text class="search-chip__text">{{ item }}</text>
          </view>
        </view>
        <text v-else class="search-panel__empty">
          暂无搜索记录。搜索会匹配客户、商品、单号、支付方式和备注。
        </text>
      </view>

      <template v-else>
        <!-- 概览 -->
        <view class="records-summary">
          <view class="records-summary__head">
            <text class="records-summary__title">{{ summaryTitle }}</text>
            <text class="records-summary__period">{{ periodText }}</text>
          </view>
          <view class="records-summary__stats">
            <view class="records-summary__stat">
              <text class="records-summary__label">收入</text>
              <text class="records-summary__value records-summary__value--income">
                +¥{{ money(summary.income) }}
              </text>
            </view>
            <view class="records-summary__stat">
              <text class="records-summary__label">支出</text>
              <text class="records-summary__value records-summary__value--expense">
                -¥{{ money(summary.expense) }}
              </text>
            </view>
            <view class="records-summary__stat">
              <text class="records-summary__label">结余</text>
              <text class="records-summary__value">{{ netText }}</text>
            </view>
          </view>
          <view class="records-summary__foot">
            <text class="records-summary__count">共 {{ filtered.length }} 笔</text>
            <text class="records-summary__hint">搜索 · 筛选 · 时间联动</text>
          </view>
        </view>

        <!-- 条件摘要 -->
        <view class="filter-row">
          <view class="filter-row__chips">
            <view
              v-for="chip in filterChips"
              :key="chip.key"
              class="filter-chip"
              :class="{ 'filter-chip--time': chip.time, 'filter-chip--keyword': chip.keyword }"
              :hover-class="chip.keyword ? 'filter-chip--hover' : 'none'"
              @click="onChipTap(chip.key)"
            >
              <text class="filter-chip__text">{{ chip.text }}</text>
              <text v-if="chip.keyword" class="filter-chip__close">×</text>
            </view>
          </view>
          <text v-if="hasActiveFilter" class="filter-row__reset" @click="resetAll">重置</text>
        </view>

        <!-- 列表 -->
        <view v-if="filtered.length" class="records-list">
          <lingyun-list
            v-for="group in groups"
            :key="group.date"
            :header="group.label"
            :footer="groupFooter(group)"
          >
            <lingyun-list-item
              v-for="item in group.items"
              :key="item.id"
              :title="`${item.party} · ${item.title}`"
              :note="`${item.time} · ${item.channel}`"
              @click="onRecordTap(item)"
            >
              <template #icon>
                <view
                  class="record-icon"
                  :class="item.type === 'income' ? 'record-icon--income' : 'record-icon--expense'"
                >
                  <lingyun-icon
                    :type="item.type === 'income' ? 'wallet' : 'cart'"
                    :size="19"
                    :color="item.type === 'income' ? 'success' : 'warning'"
                  />
                </view>
              </template>
              <template #extra>
                <view class="record-extra">
                  <text
                    class="record-extra__amount"
                    :class="
                      item.type === 'income'
                        ? 'record-extra__amount--income'
                        : 'record-extra__amount--expense'
                    "
                  >
                    {{ item.type === 'income' ? '+' : '-' }}¥{{ money(item.amount) }}
                  </text>
                  <text class="record-extra__status" :class="`record-extra__status--${item.status}`">
                    {{ statusText(item.status) }}
                  </text>
                </view>
              </template>
            </lingyun-list-item>
          </lingyun-list>

          <view class="load-more">
            <lingyun-button
              v-if="hasMore"
              variant="bordered"
              block
              :loading="loadingMore"
              :text="loadingMore ? '加载中…' : `加载更多（还有 ${remainCount} 笔）`"
              @click="loadMore"
            />
            <text v-else class="load-more__end">已显示全部 {{ filtered.length }} 笔</text>
          </view>
        </view>

        <!-- 空态 -->
        <view v-else class="records-empty">
          <lingyun-empty
            title="没有匹配的记录"
            description="试试更换关键词，或放宽筛选与时间范围。"
            action-placement="bottom"
          >
            <template #action>
              <lingyun-button variant="borderedProminent" block text="重置搜索与筛选" @click="resetAll" />
            </template>
          </lingyun-empty>
        </view>
      </template>
    </view>

    <!-- 筛选菜单 -->
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
            <text class="filter-form__desc">与顶部搜索、底部时间范围同时生效</text>
          </view>

          <view class="filter-field">
            <text class="filter-field__label">状态</text>
            <lingyun-segmented-control v-model="draft.status" :items="statusItems" size="small" />
          </view>

          <view class="filter-field">
            <text class="filter-field__label">金额</text>
            <lingyun-segmented-control v-model="draft.amount" :items="amountItems" size="small" />
          </view>

          <view class="filter-field">
            <text class="filter-field__label">排序</text>
            <lingyun-segmented-control v-model="draft.sort" :items="sortItems" size="small" />
          </view>

          <view class="filter-switch-row">
            <text class="filter-switch-row__label">只看有备注</text>
            <lingyun-switch v-model="draft.noteOnly" />
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

    <!-- 时间选择：搜索态隐藏，避免与键盘争空间 -->
    <lingyun-date-switcher
      v-if="!searching"
      v-model:mode="dateMode"
      :model-value="dateValue"
      :formatter="switcherFormatter"
      limit="past"
      @update:model-value="onDateValue"
      @change="onDateChange"
    />
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
  import type {
    LingyunDateSwitcherChange,
    LingyunDateSwitcherMode,
    LingyunDateSwitcherPayload,
    LingyunDateSwitcherValue,
  } from '@/uni_modules/lingyun-ui'

  type RecordType = 'income' | 'expense'
  type RecordStatus = 'done' | 'pending' | 'refunded'
  type TypeKey = 'all' | RecordType
  type StatusKey = 'all' | RecordStatus
  type AmountKey = 'all' | 'lt100' | 'mid' | 'gte500'
  type SortKey = 'time' | 'amount'
  type AnchorBox = { top: number; left: number; width: number; height: number }

  interface RecordItem {
    id: string
    type: RecordType
    status: RecordStatus
    party: string
    title: string
    amount: number
    channel: string
    date: string
    time: string
    orderNo: string
    note: string
  }

  interface RecordGroup {
    date: string
    label: string
    income: number
    expense: number
    items: RecordItem[]
  }

  interface FilterState {
    status: StatusKey
    amount: AmountKey
    sort: SortKey
    noteOnly: boolean
  }

  interface ToolbarActionPayload {
    key?: string
    groupIndex?: number
    buttonIndex?: number
    anchor?: AnchorBox | null
  }

  interface FilterChip {
    key: string
    text: string
    time?: boolean
    keyword?: boolean
  }

  const DEFAULT_FILTER: FilterState = {
    status: 'all',
    amount: 'all',
    sort: 'time',
    noteOnly: false,
  }

  const STATUS_TEXT: Record<RecordStatus, string> = {
    done: '已完成',
    pending: '待结算',
    refunded: '已退款',
  }

  const PAGE_SIZE = 12

  /* ---------- 日期工具 ---------- */

  function pad2(n: number): string {
    return n < 10 ? `0${n}` : String(n)
  }

  function formatDate(date: Date): string {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
  }

  /** 本地中午构造，避开时区 / 夏令时跨日 */
  function atNoon(year: number, month: number, day: number): Date {
    return new Date(year, month, day, 12, 0, 0, 0)
  }

  function addDays(date: Date, days: number): Date {
    return atNoon(date.getFullYear(), date.getMonth(), date.getDate() + days)
  }

  function startOfMonth(date: Date): Date {
    return atNoon(date.getFullYear(), date.getMonth(), 1)
  }

  function endOfMonth(date: Date): Date {
    return atNoon(date.getFullYear(), date.getMonth() + 1, 0)
  }

  function startOfWeek(date: Date): Date {
    const offset = (date.getDay() + 6) % 7
    return addDays(date, -offset)
  }

  function parseDateText(text: string): Date | null {
    const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
    if (!matched) return null
    return atNoon(Number(matched[1]), Number(matched[2]) - 1, Number(matched[3]))
  }

  function resolvePeriod(
    mode: LingyunDateSwitcherMode,
    value: LingyunDateSwitcherValue,
  ): [string, string] {
    if (mode === 'range' && Array.isArray(value)) {
      return [String(value[0] || ''), String(value[1] || '')]
    }
    const anchor = parseDateText(String(value || '')) || new Date()
    if (mode === 'week') {
      const start = startOfWeek(anchor)
      return [formatDate(start), formatDate(addDays(start, 6))]
    }
    if (mode === 'month') {
      return [formatDate(startOfMonth(anchor)), formatDate(endOfMonth(anchor))]
    }
    if (mode === 'year') {
      return [`${anchor.getFullYear()}-01-01`, `${anchor.getFullYear()}-12-31`]
    }
    return [formatDate(anchor), formatDate(anchor)]
  }

  function periodLabel(type: string, start: string, end: string): string {
    if (type === 'month') return `${start.slice(0, 4)}年${Number(start.slice(5, 7))}月`
    if (type === 'year') return `${start.slice(0, 4)}年`
    if (type === 'day' || type === 'date') return start
    return `${start.slice(5)} 至 ${end.slice(5)}`
  }

  function switcherFormatter(payload: LingyunDateSwitcherPayload): string {
    return periodLabel(payload.mode, payload.start, payload.end)
  }

  function dateGroupLabel(dateText: string): string {
    const date = parseDateText(dateText)
    if (!date) return dateText
    const todayText = formatDate(new Date())
    const yesterdayText = formatDate(addDays(new Date(), -1))
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const base = `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
    if (dateText === todayText) return `今天 · ${base}`
    if (dateText === yesterdayText) return `昨天 · ${base}`
    return base
  }

  function money(value: number): string {
    const sign = value < 0 ? '-' : ''
    const parts = Math.abs(value).toFixed(2).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return `${sign}${parts.join('.')}`
  }

  function statusText(status: RecordStatus): string {
    return STATUS_TEXT[status] || '—'
  }

  /* ---------- 演示数据 ---------- */

  const CUSTOMERS = ['张伟', '李娜', '王芳', '刘洋', '陈静', '赵磊', '孙悦', '周杰', '吴敏', '郑爽']
  const SUPPLIERS = ['鲜丰果园', '麦香烘焙', '晨光乳业', '顺达包装', '城市花艺', '乐购批发']
  const SALE_TITLES = ['鲜花礼盒', '生日蛋糕', '手冲咖啡', '水果拼盘', '下午茶套餐', '节日花束']
  const EXPENSE_TITLES = ['原料采购', '包装补货', '冷链运费', '门店租金', '设备维护', '员工餐补']
  const CHANNELS = ['微信支付', '支付宝', '银行卡', '现金']

  function pseudoRandom(seed: number): number {
    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
    return value - Math.floor(value)
  }

  function createRecords(): RecordItem[] {
    const list: RecordItem[] = []
    const today = new Date()
    let seq = 0

    for (let offset = 0; offset < 120; offset += 1) {
      const date = addDays(today, -offset)
      const dateText = formatDate(date)
      const count = offset === 0 ? 5 : 1 + Math.floor(pseudoRandom(offset + 1) * 3)

      for (let index = 0; index < count; index += 1) {
        seq += 1
        const seed = offset * 17 + index * 5 + 3
        const income = pseudoRandom(seed) > 0.34
        const parties = income ? CUSTOMERS : SUPPLIERS
        const titles = income ? SALE_TITLES : EXPENSE_TITLES
        const party = parties[Math.floor(pseudoRandom(seed + 7) * parties.length)]
        const title = titles[Math.floor(pseudoRandom(seed + 8) * titles.length)]
        const channel = CHANNELS[Math.floor(pseudoRandom(seed + 1) * CHANNELS.length)]
        const hour = 8 + Math.floor(pseudoRandom(seed + 2) * 13)
        const minute = Math.floor(pseudoRandom(seed + 3) * 60)
        const base = income
          ? 48 + pseudoRandom(seed + 4) * 860
          : 20 + pseudoRandom(seed + 5) * 420
        const roll = pseudoRandom(seed + 6)

        let status: RecordStatus = 'done'
        if (offset < 4 && roll > 0.72) status = 'pending'
        else if (roll > 0.95) status = 'refunded'

        list.push({
          id: `R${seq}`,
          type: income ? 'income' : 'expense',
          status,
          party,
          title,
          amount: Math.round(base * 100) / 100,
          channel,
          date: dateText,
          time: `${pad2(hour)}:${pad2(minute)}`,
          orderNo: `NO.${dateText.replace(/-/g, '')}${pad2(index + 1)}`,
          note: pseudoRandom(seed + 9) > 0.74 ? (income ? '客户要求开具发票' : '月结，按对账单支付') : '',
        })
      }
    }

    return list.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1
      if (a.time !== b.time) return a.time < b.time ? 1 : -1
      return b.id.localeCompare(a.id)
    })
  }

  const records = createRecords()

  /* ---------- 顶部 / 底部控件 ---------- */

  const pageRef = ref<{ closeSearch?: (cancel?: boolean) => void } | null>(null)
  const searching = ref(false)
  const keyword = ref('')
  const typeValue = ref<TypeKey>('all')

  const typeSegments: { key: TypeKey; text: string }[] = [
    { key: 'all', text: '全部' },
    { key: 'income', text: '收入' },
    { key: 'expense', text: '支出' },
  ]

  const toolbarGroups = [[{ key: 'filter', icon: 'tune', label: '筛选' }]]
  const filterOpen = ref(false)
  const filterMenuOpen = ref(false)
  const menuAnchor = ref<AnchorBox | null>(null)

  const applied = reactive<FilterState>({ ...DEFAULT_FILTER })
  const draft = reactive<FilterState>({ ...DEFAULT_FILTER })

  watch(filterOpen, (open) => {
    if (open) Object.assign(draft, applied)
  })

  const statusItems: { key: StatusKey; text: string }[] = [
    { key: 'all', text: '全部' },
    { key: 'done', text: '已完成' },
    { key: 'pending', text: '待结算' },
    { key: 'refunded', text: '已退款' },
  ]
  const amountItems: { key: AmountKey; text: string }[] = [
    { key: 'all', text: '不限' },
    { key: 'lt100', text: '100 以下' },
    { key: 'mid', text: '100–500' },
    { key: 'gte500', text: '500 以上' },
  ]
  const sortItems: { key: SortKey; text: string }[] = [
    { key: 'time', text: '时间' },
    { key: 'amount', text: '金额' },
  ]

  const AMOUNT_TEXT: Record<AmountKey, string> = {
    all: '不限金额',
    lt100: '金额 ¥100 以下',
    mid: '金额 ¥100–500',
    gte500: '金额 ¥500 以上',
  }

  /* ---------- 时间范围 ---------- */

  const todayText = formatDate(new Date())
  const initialPeriod = resolvePeriod('month', todayText)
  const dateMode = ref<LingyunDateSwitcherMode>('month')
  const dateValue = ref<LingyunDateSwitcherValue>(todayText)
  const dateStart = ref(initialPeriod[0])
  const dateEnd = ref(initialPeriod[1])
  const periodText = ref(periodLabel('month', initialPeriod[0], initialPeriod[1]))

  function onDateValue(value: LingyunDateSwitcherValue): void {
    dateValue.value = value
  }

  function onDateChange(payload: LingyunDateSwitcherChange): void {
    const parts = String(payload.range || '').split(' - ')
    dateStart.value = parts[0] || ''
    dateEnd.value = parts[1] || parts[0] || ''
    periodText.value = periodLabel(payload.type, dateStart.value, dateEnd.value)
  }

  /* ---------- 筛选 ---------- */

  function onToolbarAction(payload: ToolbarActionPayload): void {
    if (payload.key !== 'filter') return
    filterMenuOpen.value = true
    menuAnchor.value = payload.anchor || null
    filterOpen.value = true
  }

  function resetDraft(): void {
    Object.assign(draft, DEFAULT_FILTER)
  }

  function applyFilter(close: () => void): void {
    Object.assign(applied, draft)
    close()
    uni.showToast({ title: '筛选已应用', icon: 'none' })
  }

  function resetAll(): void {
    Object.assign(applied, DEFAULT_FILTER)
    Object.assign(draft, DEFAULT_FILTER)
    typeValue.value = 'all'
    keyword.value = ''
    if (searching.value && pageRef.value && pageRef.value.closeSearch) {
      pageRef.value.closeSearch(false)
    }
  }

  function onChipTap(key: string): void {
    if (key === 'keyword') keyword.value = ''
  }

  /* ---------- 搜索历史 ---------- */

  const searchHistory = ref<string[]>(['张伟', '鲜花', '微信支付'])

  function rememberKeyword(value: string): void {
    const text = value.trim()
    if (!text) return
    searchHistory.value = [text, ...searchHistory.value.filter((item) => item !== text)].slice(0, 8)
  }

  function onSearchConfirm(): void {
    rememberKeyword(keyword.value)
  }

  function pickHistory(value: string): void {
    keyword.value = value
    rememberKeyword(value)
  }

  function clearHistory(): void {
    searchHistory.value = []
  }

  /* ---------- 过滤与分组 ---------- */

  function matchAmount(amount: number, key: AmountKey): boolean {
    if (key === 'lt100') return amount < 100
    if (key === 'mid') return amount >= 100 && amount < 500
    if (key === 'gte500') return amount >= 500
    return true
  }

  function compareRecordDesc(a: RecordItem, b: RecordItem): number {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    if (a.time !== b.time) return a.time < b.time ? 1 : -1
    return b.id.localeCompare(a.id)
  }

  const filtered = computed<RecordItem[]>(() => {
    const text = keyword.value.trim().toLowerCase()
    const list = records.filter((item) => {
      if (item.date < dateStart.value || item.date > dateEnd.value) return false
      if (typeValue.value !== 'all' && item.type !== typeValue.value) return false
      if (applied.status !== 'all' && item.status !== applied.status) return false
      if (!matchAmount(item.amount, applied.amount)) return false
      if (applied.noteOnly && !item.note) return false
      if (text) {
        const haystack = [
          item.party,
          item.title,
          item.orderNo,
          item.channel,
          item.note,
          STATUS_TEXT[item.status],
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(text)) return false
      }
      return true
    })

    if (applied.sort === 'amount') {
      list.sort((a, b) => b.amount - a.amount || compareRecordDesc(a, b))
    }
    return list
  })

  const summary = computed(() => {
    let income = 0
    let expense = 0
    filtered.value.forEach((item) => {
      if (item.type === 'income') income += item.amount
      else expense += item.amount
    })
    return { income, expense, net: income - expense }
  })

  const netText = computed(
    () => `${summary.value.net < 0 ? '-¥' : '¥'}${money(Math.abs(summary.value.net))}`,
  )

  const summaryTitle = computed(() => (searching.value ? '搜索结果' : '本期概览'))

  const hasActiveFilter = computed(
    () =>
      typeValue.value !== 'all' ||
      applied.status !== 'all' ||
      applied.amount !== 'all' ||
      applied.sort !== 'time' ||
      applied.noteOnly ||
      !!keyword.value.trim(),
  )

  const filterChips = computed<FilterChip[]>(() => {
    const chips: FilterChip[] = [{ key: 'time', text: periodText.value, time: true }]
    if (typeValue.value !== 'all') {
      chips.push({ key: 'type', text: typeValue.value === 'income' ? '只看收入' : '只看支出' })
    }
    if (applied.status !== 'all') {
      chips.push({
        key: 'status',
        text: statusText(applied.status as RecordStatus),
      })
    }
    if (applied.amount !== 'all') {
      chips.push({ key: 'amount', text: AMOUNT_TEXT[applied.amount] })
    }
    if (applied.sort === 'amount') {
      chips.push({ key: 'sort', text: '金额优先' })
    }
    if (applied.noteOnly) {
      chips.push({ key: 'note', text: '有备注' })
    }
    const text = keyword.value.trim()
    if (text) {
      chips.push({ key: 'keyword', text: `搜索：${text}`, keyword: true })
    }
    return chips
  })

  const visibleCount = ref(PAGE_SIZE)
  const visibleRecords = computed(() => filtered.value.slice(0, visibleCount.value))
  const hasMore = computed(() => filtered.value.length > visibleCount.value)
  const remainCount = computed(() => Math.max(0, filtered.value.length - visibleCount.value))

  /** 按整日汇总，避免分页截断当天时页尾数字偏小 */
  const totalsByDate = computed<Record<string, { income: number; expense: number }>>(() => {
    const totals: Record<string, { income: number; expense: number }> = {}
    filtered.value.forEach((item) => {
      let total = totals[item.date]
      if (!total) {
        total = { income: 0, expense: 0 }
        totals[item.date] = total
      }
      if (item.type === 'income') total.income += item.amount
      else total.expense += item.amount
    })
    return totals
  })

  const groups = computed<RecordGroup[]>(() => {
    const list: RecordGroup[] = []
    const index: Record<string, RecordGroup> = {}
    visibleRecords.value.forEach((item) => {
      let group = index[item.date]
      if (!group) {
        const total = totalsByDate.value[item.date] || { income: 0, expense: 0 }
        group = {
          date: item.date,
          label: dateGroupLabel(item.date),
          income: total.income,
          expense: total.expense,
          items: [],
        }
        index[item.date] = group
        list.push(group)
      }
      group.items.push(item)
    })
    return list
  })

  function groupFooter(group: RecordGroup): string {
    const parts: string[] = []
    if (group.income > 0) parts.push(`收入 ¥${money(group.income)}`)
    if (group.expense > 0) parts.push(`支出 ¥${money(group.expense)}`)
    return parts.join(' · ')
  }

  function onRecordTap(item: RecordItem): void {
    uni.showToast({ title: `${item.orderNo} · ${statusText(item.status)}`, icon: 'none' })
  }

  /* ---------- 分页 ---------- */

  const loadingMore = ref(false)
  let loadTimer: ReturnType<typeof setTimeout> | null = null

  function cancelLoadMore(): void {
    if (loadTimer) {
      clearTimeout(loadTimer)
      loadTimer = null
    }
    loadingMore.value = false
  }

  function loadMore(): void {
    if (!hasMore.value || loadingMore.value) return
    loadingMore.value = true
    loadTimer = setTimeout(() => {
      visibleCount.value += PAGE_SIZE
      loadingMore.value = false
      loadTimer = null
    }, 320)
  }

  watch(filtered, () => {
    cancelLoadMore()
    visibleCount.value = PAGE_SIZE
  })

  onBeforeUnmount(cancelLoadMore)
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    min-height: 100%;
    padding: 12px 0 150px;
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .page--searching {
    padding-bottom: 48px;
  }

  /* ---------- 概览 ---------- */

  .records-summary {
    margin: 4px 16px 0;
    padding: 18px 18px 16px;
    border-radius: 22px;
    box-sizing: border-box;
    background: var(--lingyun-bg-grouped-secondary, #ffffff);
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  }

  .records-summary__head {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
  }

  .records-summary__title {
    font-size: 17px;
    font-weight: 600;
    line-height: 22px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .records-summary__period {
    font-size: 12px;
    line-height: 16px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .records-summary__stats {
    display: flex;
    flex-direction: row;
    margin-top: 16px;
  }

  .records-summary__stat {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .records-summary__label {
    font-size: 12px;
    line-height: 16px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .records-summary__value {
    font-size: 17px;
    font-weight: 700;
    line-height: 22px;
    letter-spacing: -0.3px;
    white-space: nowrap;
    color: var(--lingyun-label, #1c1c1e);
  }

  .records-summary__value--income {
    color: var(--lingyun-success, #34c759);
  }

  .records-summary__value--expense {
    color: var(--lingyun-error, #ff383c);
  }

  .records-summary__foot {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 0.5px solid var(--lingyun-separator, rgba(60, 60, 67, 0.12));
  }

  .records-summary__count {
    font-size: 12px;
    line-height: 16px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .records-summary__hint {
    font-size: 12px;
    line-height: 16px;
    color: var(--lingyun-label-tertiary, rgba(60, 60, 67, 0.3));
  }

  /* ---------- 条件摘要 ---------- */

  .filter-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 8px;
    margin-top: 14px;
    padding: 0 20px;
  }

  .filter-row__chips {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-chip {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    height: 28px;
    padding: 0 12px;
    border-radius: 14px;
    box-sizing: border-box;
    background: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
  }

  .filter-chip--hover {
    opacity: 0.65;
  }

  .filter-chip--time {
    background: var(--lingyun-primary-soft, rgba(10, 132, 255, 0.14));
  }

  .filter-chip--keyword {
    background: var(--lingyun-primary-soft, rgba(10, 132, 255, 0.14));
  }

  .filter-chip__text {
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .filter-chip__close {
    margin-left: 4px;
    font-size: 15px;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .filter-row__reset {
    flex-shrink: 0;
    padding: 5px 0;
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-primary, #0a84ff);
  }

  /* ---------- 列表 ---------- */

  .records-list {
    margin-top: 8px;
  }

  .record-icon {
    width: 42px;
    height: 42px;
    border-radius: 21px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .record-icon--income {
    background: rgba(52, 199, 89, 0.14);
  }

  .record-icon--expense {
    background: rgba(255, 141, 40, 0.14);
  }

  .record-extra {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .record-extra__amount {
    font-size: 16px;
    font-weight: 600;
    line-height: 21px;
    white-space: nowrap;
  }

  .record-extra__amount--income {
    color: var(--lingyun-success, #34c759);
  }

  .record-extra__amount--expense {
    color: var(--lingyun-label, #1c1c1e);
  }

  .record-extra__status {
    font-size: 11px;
    line-height: 14px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .record-extra__status--pending {
    color: var(--lingyun-warning, #ff8d28);
  }

  .record-extra__status--refunded {
    color: var(--lingyun-error, #ff383c);
  }

  .load-more {
    padding: 12px 16px 0;
  }

  .load-more__end {
    display: block;
    padding: 8px 0 0;
    text-align: center;
    font-size: 12px;
    line-height: 16px;
    color: var(--lingyun-label-tertiary, rgba(60, 60, 67, 0.3));
  }

  /* ---------- 空态 ---------- */

  .records-empty {
    margin: 16px;
    border-radius: 22px;
    background: var(--lingyun-bg-grouped-secondary, #ffffff);
    overflow: hidden;
  }

  /* ---------- 搜索历史 ---------- */

  .search-panel {
    padding: 24px 20px 0;
  }

  .search-panel__head {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .search-panel__title {
    font-size: 22px;
    font-weight: 700;
    line-height: 28px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .search-panel__clear {
    font-size: 14px;
    line-height: 20px;
    color: var(--lingyun-primary, #0a84ff);
  }

  .search-panel__scope {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    line-height: 18px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .search-panel__chips {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }

  .search-chip {
    padding: 7px 13px;
    border-radius: 9999px;
    background: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
  }

  .search-chip--hover {
    opacity: 0.65;
  }

  .search-chip__text {
    font-size: 14px;
    line-height: 20px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .search-panel__empty {
    display: block;
    margin-top: 16px;
    font-size: 13px;
    line-height: 19px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  /* ---------- 筛选菜单 ---------- */

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
