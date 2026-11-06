<template>
  <lingyun-app-page
    title="Filter"
    :trailing-buttons="toolbarGroups"
    :trailing-buttons-hidden="filterMenuOpen"
    @trailing-action="onToolbarAction"
  >
    <view class="page">
      <view class="hero">
        <text class="hero__title">Filter Menu</text>
        <text class="hero__desc">app-page 按钮组 · 全宽 menu · 插槽自定义表单</text>
      </view>

      <lingyun-section title="顶部筛选" hint="trailing-buttons + full-width menu + 默认插槽">
        <text class="hint">
          右侧筛选项由 app-page 的 trailing-buttons 传入；点击后页面收到 trailing-action，再把全宽菜单锚到按钮上打开。菜单只负责弹出和定位，里面的筛选表单通过默认插槽完全自定义。
        </text>
        <text v-if="lastAction" class="hint hint--action">最近点击：{{ lastAction }}</text>
        <view class="summary">
          <text class="summary__label">已应用条件</text>
          <view class="summary__chips">
            <text class="summary__chip">{{ statusLabel }}</text>
            <text class="summary__chip">{{ periodLabel }}</text>
            <text class="summary__chip">{{ sortLabel }}</text>
            <text v-if="applied.mine" class="summary__chip">只看我的</text>
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="筛选结果" hint="示例数据" is-last>
        <lingyun-list>
          <lingyun-list-item
            v-for="item in results"
            :key="item.title"
            :title="item.title"
            :note="item.note"
            :detail="item.status"
          />
        </lingyun-list>
      </lingyun-section>
    </view>

    <lingyun-menu v-model:show="filterOpen" full-width :anchor="menuAnchor" @closed="filterMenuOpen = false">
      <template #default="{ close }">
        <view class="filter-form">
          <view class="filter-form__head">
            <text class="filter-form__title">筛选条件</text>
            <text class="filter-form__desc">菜单只负责弹出，表单内容完全自定义</text>
          </view>

          <view class="filter-field">
            <text class="filter-field__label">状态</text>
            <lingyun-segmented-control v-model="draft.status" :items="statusItems" size="small" />
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
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'

  type StatusKey = 'all' | 'active' | 'done'
  type PeriodKey = 'today' | 'week' | 'month'
  type SortKey = 'updated' | 'amount'
  type AnchorBox = { top: number; left: number; width: number; height: number }

  interface FilterState {
    status: StatusKey
    period: PeriodKey
    sort: SortKey
    mine: boolean
  }

  interface ToolbarActionPayload {
    key?: string
    groupIndex?: number
    buttonIndex?: number
    anchor?: AnchorBox | null
  }

  /** 二维数组：每个子数组是一组；这里用一组筛选按钮，多组写法见 toolbars demo */
  const toolbarGroups = [[{ key: 'filter', icon: 'tune', label: '筛选' }]]

  const filterOpen = ref(false)
  const filterMenuOpen = ref(false)
  const menuAnchor = ref<AnchorBox | null>(null)

  const lastAction = ref('')
  const applied = reactive<FilterState>({
    status: 'all',
    period: 'week',
    sort: 'updated',
    mine: false,
  })
  const draft = reactive<FilterState>({ ...applied })

  const statusItems = [
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

  const STATUS_LABELS: Record<StatusKey, string> = {
    all: '全部',
    active: '进行中',
    done: '已完成',
  }
  const PERIOD_LABELS: Record<PeriodKey, string> = {
    today: '今天',
    week: '本周',
    month: '本月',
  }
  const SORT_LABELS: Record<SortKey, string> = {
    updated: '最近更新',
    amount: '金额从高到低',
  }

  const statusLabel = computed(() => STATUS_LABELS[applied.status])
  const periodLabel = computed(() => PERIOD_LABELS[applied.period])
  const sortLabel = computed(() => SORT_LABELS[applied.sort])

  const allResults = [
    { title: '订单 A-1024', note: '今天 09:42 更新', status: '进行中', statusKey: 'active', mine: true },
    { title: '订单 A-1023', note: '昨天 18:10 更新', status: '已完成', statusKey: 'done', mine: false },
    { title: '订单 A-1022', note: '本周一 11:26 更新', status: '待处理', statusKey: 'active', mine: true },
  ]

  const results = computed(() => {
    let list = allResults
    if (applied.status !== 'all') {
      list = list.filter((item) => item.statusKey === applied.status)
    }
    if (applied.mine) list = list.filter((item) => item.mine)
    return list
  })

  watch(filterOpen, (open) => {
    if (open) Object.assign(draft, applied)
  })

  function onToolbarAction(payload: ToolbarActionPayload): void {
    const group = (payload.groupIndex ?? 0) + 1
    const button = (payload.buttonIndex ?? 0) + 1
    lastAction.value = `第 ${group} 组 / 第 ${button} 个 · ${payload.key || '—'}`
    if (payload.key !== 'filter') return
    filterMenuOpen.value = true
    menuAnchor.value = payload.anchor || null
    filterOpen.value = true
  }

  function resetDraft(): void {
    Object.assign(draft, { status: 'all', period: 'week', sort: 'updated', mine: false })
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
    padding-bottom: 40px;
    min-height: 100%;
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

  .hint--action {
    margin-top: 8px;
    color: var(--lingyun-primary, #0a84ff);
  }

  .summary {
    margin-top: 16px;
    padding: 16px;
    border-radius: 12px;
    background: var(--lingyun-bg-grouped-secondary, #ffffff);
  }

  .summary__label {
    display: block;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .summary__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }

  .summary__chip {
    padding: 6px 12px;
    border-radius: 9999px;
    font-size: 14px;
    line-height: 20px;
    color: var(--lingyun-label, #1c1c1e);
    background: var(--lingyun-primary-soft, rgba(10, 132, 255, 0.14));
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
