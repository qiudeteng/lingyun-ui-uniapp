<template>
  <lingyun-app-page
    title="纯列表"
    :show-tabbar="false"
    searchable
    search-placeholder="搜索客户 / 商品 / 单号 / 备注"
    v-model:searching="searching"
    v-model:search-value="keyword"
    :trailing-buttons="toolbarGroups"
    :trailing-buttons-hidden="filterMenuOpen"
    @trailing-action="onToolbarAction"
  >
    <view class="page page--plain-list" :class="{ 'page--searching': searching }">
      <!-- 纯列表：全宽平铺，无卡片、无分组头、无摘要 -->
      <lingyun-list v-if="filtered.length" plain>
        <lingyun-list-item
          v-for="item in filtered"
          :key="item.id"
          :title="`${item.party} · ${item.title}`"
          :note="noteOf(item)"
          :thumb="item.thumb"
          thumb-size="lg"
        >
          <template #extra>
            <view class="flow-extra">
              <text class="amount">
                {{ item.type === 'income' ? '+' : '-' }}¥{{ money(item.amount) }}
              </text>
              <text
                v-if="item.status !== 'done'"
                class="flow-status"
                :class="`flow-status--${item.status}`"
              >
                {{ STATUS_TEXT[item.status] }}
              </text>
            </view>
          </template>
        </lingyun-list-item>
      </lingyun-list>

      <view v-else class="empty">
        <lingyun-empty
          title="没有匹配的记录"
          description="调整搜索关键词、筛选条件或底部时间范围。"
          action-placement="bottom"
        >
          <template #action>
            <lingyun-button variant="bordered" block text="重置全部条件" @click="resetAll" />
          </template>
        </lingyun-empty>
      </view>
    </view>

    <!-- 顶部筛选：全宽菜单，锚到筛选按钮 -->
    <lingyun-menu
      v-model:show="filterOpen"
      full-width
      :anchor="menuAnchor"
      @closed="filterMenuOpen = false"
    >
      <template #default="{ close }">
        <view class="filter-form">
          <view class="filter-field">
            <text class="filter-field__label">类型</text>
            <lingyun-segmented-control v-model="draft.type" :items="typeItems" size="small" />
          </view>
          <view class="filter-field">
            <text class="filter-field__label">状态</text>
            <lingyun-segmented-control v-model="draft.status" :items="statusItems" size="small" />
          </view>
          <view class="filter-field">
            <text class="filter-field__label">排序</text>
            <lingyun-segmented-control v-model="draft.sort" :items="sortItems" size="small" />
          </view>
          <view class="filter-actions">
            <view class="filter-actions__item">
              <lingyun-button variant="bordered" text="重置" block @click="resetDraft" />
            </view>
            <view class="filter-actions__item">
              <lingyun-button variant="borderedProminent" text="应用" block @click="applyFilter(close)" />
            </view>
          </view>
        </view>
      </template>
    </lingyun-menu>

    <!-- 底部时间选择器：搜索态隐藏，给键盘让位 -->
    <lingyun-date-switcher
      v-if="!searching"
      v-model:mode="dateMode"
      :model-value="dateValue"
      limit="past"
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

  type FlowType = 'income' | 'expense'
  type FlowStatus = 'done' | 'pending' | 'refunded'
  type TypeKey = 'all' | FlowType
  type StatusKey = 'all' | FlowStatus
  type SortKey = 'time' | 'amount'
  type AnchorBox = { top: number; left: number; width: number; height: number }

  interface FlowItem {
    id: string
    type: FlowType
    status: FlowStatus
    party: string
    title: string
    amount: number
    channel: string
    date: string
    time: string
    orderNo: string
    note: string
    thumb: string
  }

  interface FilterState {
    type: TypeKey
    status: StatusKey
    sort: SortKey
  }

  interface ToolbarActionPayload {
    key?: string
    anchor?: AnchorBox | null
  }

  const DEFAULT_FILTER: FilterState = {
    type: 'all',
    status: 'all',
    sort: 'time',
  }

  const STATUS_TEXT: Record<FlowStatus, string> = {
    done: '已完成',
    pending: '待结算',
    refunded: '已退款',
  }

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

  function money(value: number): string {
    const sign = value < 0 ? '-' : ''
    const parts = Math.abs(value).toFixed(2).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return `${sign}${parts.join('.')}`
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

  /** 与订货单演示同一组 Unsplash 图。picsum.photos 在当前网络下会超时，缩略图会空白。 */
  const FLOW_THUMBS = [
    'photo-1578985545062-69928b1d9587',
    'photo-1464349095431-e9a21285b5f3',
    'photo-1563729784474-d77dbb933a9e',
    'photo-1565958011703-44f9829ba187',
    'photo-1551024506-0bccd828d307',
    'photo-1571115177098-24ec42ed204d',
  ]

  function flowThumb(seq: number): string {
    const id = FLOW_THUMBS[seq % FLOW_THUMBS.length]
    return `https://images.unsplash.com/${id}?w=120&h=120&fit=crop&q=80`
  }

  function createFlows(): FlowItem[] {
    const list: FlowItem[] = []
    const today = new Date()
    let seq = 0

    for (let offset = 0; offset < 45; offset += 1) {
      const date = addDays(today, -offset)
      const dateText = formatDate(date)
      const count = offset === 0 ? 3 : 1 + (pseudoRandom(offset + 1) > 0.55 ? 1 : 0)

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
        const base = income ? 48 + pseudoRandom(seed + 4) * 860 : 20 + pseudoRandom(seed + 5) * 420
        const roll = pseudoRandom(seed + 6)

        let status: FlowStatus = 'done'
        /* 保证当月有退款样本，筛选「已退款」不会永远空 */
        if (offset > 0 && offset < 6 && index === 0 && offset % 2 === 0) status = 'refunded'
        else if (offset < 4 && roll > 0.74) status = 'pending'
        else if (roll > 0.95) status = 'refunded'

        list.push({
          id: `F${seq}`,
          type: income ? 'income' : 'expense',
          status,
          party,
          title,
          amount: Math.round(base * 100) / 100,
          channel,
          date: dateText,
          time: `${pad2(hour)}:${pad2(minute)}`,
          orderNo: `NO.${dateText.replace(/-/g, '')}${pad2(index + 1)}`,
          note: pseudoRandom(seed + 9) > 0.82 ? '月结' : '',
          thumb: flowThumb(seq),
        })
      }
    }

    return list.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1
      if (a.time !== b.time) return a.time < b.time ? 1 : -1
      return b.id.localeCompare(a.id)
    })
  }

  const flows = createFlows()

  /* ---------- 顶部搜索 / 筛选 ---------- */

  const searching = ref(false)
  const keyword = ref('')

  const toolbarGroups = [[{ key: 'filter', icon: 'tune', label: '筛选' }]]
  const filterOpen = ref(false)
  const filterMenuOpen = ref(false)
  const menuAnchor = ref<AnchorBox | null>(null)

  const applied = reactive<FilterState>({ ...DEFAULT_FILTER })
  const draft = reactive<FilterState>({ ...DEFAULT_FILTER })

  watch(filterOpen, (open) => {
    if (open) Object.assign(draft, applied)
  })

  const typeItems: { key: TypeKey; text: string }[] = [
    { key: 'all', text: '全部' },
    { key: 'income', text: '收入' },
    { key: 'expense', text: '支出' },
  ]
  const statusItems: { key: StatusKey; text: string }[] = [
    { key: 'all', text: '全部' },
    { key: 'done', text: '已完成' },
    { key: 'pending', text: '待结算' },
    { key: 'refunded', text: '已退款' },
  ]
  const sortItems: { key: SortKey; text: string }[] = [
    { key: 'time', text: '时间' },
    { key: 'amount', text: '金额' },
  ]

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
  }

  function resetAll(): void {
    Object.assign(applied, DEFAULT_FILTER)
    Object.assign(draft, DEFAULT_FILTER)
    keyword.value = ''
  }

  /* ---------- 底部时间选择器 ---------- */

  function todayText(): string {
    return formatDate(new Date())
  }

  function monthEndText(): string {
    const now = new Date()
    return formatDate(atNoon(now.getFullYear(), now.getMonth() + 1, 0))
  }

  const dateMode = ref<LingyunDateSwitcherMode>('month')
  const dateValue = ref<LingyunDateSwitcherValue>(todayText())
  const dateStart = ref(`${todayText().slice(0, 7)}-01`)
  const dateEnd = ref(monthEndText())

  function onDateValue(value: LingyunDateSwitcherValue): void {
    dateValue.value = value
  }

  function onDateChange(payload: LingyunDateSwitcherChange): void {
    const parts = String(payload.range || '').split(' - ')
    dateStart.value = parts[0] || ''
    dateEnd.value = parts[1] || parts[0] || ''
  }

  /* ---------- 过滤 ---------- */

  function noteOf(item: FlowItem): string {
    return `${item.date.slice(5)} ${item.time} · ${item.channel}`
  }

  const filtered = computed<FlowItem[]>(() => {
    const text = keyword.value.trim().toLowerCase()
    const list = flows.filter((item) => {
      if (item.date < dateStart.value || item.date > dateEnd.value) return false
      if (applied.type !== 'all' && item.type !== applied.type) return false
      if (applied.status !== 'all' && item.status !== applied.status) return false
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
      list.sort((a, b) => b.amount - a.amount || (a.date === b.date ? 0 : a.date < b.date ? 1 : -1))
    }
    return list
  })
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    min-height: 100%;
    /* 给底部日期条让位；搜索态日期条隐藏，缩短留白 */
    padding-bottom: 116px;
  }

  /*
   * 纯列表页：Primary 底色，不铺 App.vue 的全局渐变（那是修饰）。
   * 全局 .lingyun-app-page .page 是透明化，这里用更高特异性 + !important 恢复。
   */
  .lingyun-app-page .page.page--plain-list {
    background: var(--lingyun-bg-primary, #ffffff) !important;
  }

  /* 页面壳的固定背景层同步改纯色，底部安全区不再露出 grouped 灰底；只作用本页壳 */
  .lingyun-app-page {
    --lingyun-page-background: var(--lingyun-bg-primary, #ffffff);
  }

  .page--searching {
    padding-bottom: 40px;
  }

  .amount {
    font-size: 15px;
    line-height: 20px;
    white-space: nowrap;
    letter-spacing: -0.23px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .flow-extra {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .flow-status {
    font-size: 11px;
    line-height: 14px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .flow-status--pending {
    color: var(--lingyun-warning, #ff8d28);
  }

  .flow-status--refunded {
    color: var(--lingyun-error, #ff383c);
  }

  .empty {
    padding: 24px 16px 0;
  }

  /* ---------- 筛选菜单 ---------- */

  .filter-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 6px 6px 4px;
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
