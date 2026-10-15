<template>
  <lingyun-sheets :show="show" :title="title" :detent="detent" @update:show="onShowChange">
    <template #trailing>
      <view
        class="lingyun-table-filter__done"
        :class="{ 'lingyun-table-filter__done--off': !canConfirm }"
        hover-class="lingyun-table-filter__done--hover"
        :hover-stay-time="70"
        role="button"
        aria-label="确定"
        @click.stop="onConfirm"
      >
        <lingyun-icon type="checkmarkempty" :size="24" color="#ffffff" />
      </view>
    </template>

    <view class="lingyun-table-filter">
      <view v-if="sortable" class="lingyun-table-filter__block">
        <text class="lingyun-table-filter__label">排序</text>
        <lingyun-segmented-control
          size="small"
          :items="sortItems"
          :model-value="draftSort"
          @update:model-value="onSortPick"
        />
      </view>

      <view v-if="type" class="lingyun-table-filter__block">
        <view class="lingyun-table-filter__label-row">
          <text class="lingyun-table-filter__label">筛选</text>
          <text v-if="draftDirty" class="lingyun-table-filter__reset" @click.stop="onReset">重置</text>
        </view>

        <template v-if="type === 'select'">
          <view v-if="showSearch" class="lingyun-table-filter__search">
            <lingyun-search-bar
              :model-value="query"
              :fixed="false"
              :safe-area="false"
              :show-cancel="false"
              padding="0"
              placeholder="搜索选项"
              @update:model-value="onQuery"
            />
          </view>
          <view class="lingyun-table-filter__card">
            <view
              v-if="matchedOptions.length"
              class="lingyun-table-filter__row"
              hover-class="lingyun-table-filter__row--hover"
              :hover-stay-time="70"
              @click="toggleAll"
            >
              <view class="lingyun-table-filter__check" :class="allCheckClass">
                <lingyun-icon v-if="allOn" type="checkmarkempty" :size="14" color="#ffffff" />
                <view v-else-if="someOn" class="lingyun-table-filter__dash" />
              </view>
              <text class="lingyun-table-filter__row-text lingyun-table-filter__row-text--strong">{{
                query ? '全选搜索结果' : '全选'
              }}</text>
              <text class="lingyun-table-filter__row-meta">{{ pickedCount }}/{{ options.length }}</text>
            </view>
            <view
              v-for="opt in shownOptions"
              :key="opt.token"
              class="lingyun-table-filter__row"
              hover-class="lingyun-table-filter__row--hover"
              :hover-stay-time="70"
              @click="toggleOption(opt.token)"
            >
              <view class="lingyun-table-filter__check" :class="{ 'lingyun-table-filter__check--on': opt.on }">
                <lingyun-icon v-if="opt.on" type="checkmarkempty" :size="14" color="#ffffff" />
              </view>
              <text class="lingyun-table-filter__row-text">{{ opt.text }}</text>
              <text v-if="opt.count != null" class="lingyun-table-filter__row-meta">{{ opt.count }}</text>
            </view>
            <view v-if="!matchedOptions.length" class="lingyun-table-filter__none">
              <text class="lingyun-table-filter__none-text">{{ options.length ? '没有匹配的选项' : '暂无可选项' }}</text>
            </view>
          </view>
          <text v-if="hiddenCount > 0" class="lingyun-table-filter__hint">还有 {{ hiddenCount }} 项未显示，请搜索</text>
          <text v-else class="lingyun-table-filter__hint">不勾选时显示全部</text>
        </template>

        <template v-else>
          <view class="lingyun-table-filter__ops">
            <view
              v-for="op in ops"
              :key="op.key"
              class="lingyun-table-filter__op"
              :class="{ 'lingyun-table-filter__op--on': draftOp === op.key }"
              @click="onOpPick(op.key)"
            >
              <text class="lingyun-table-filter__op-text">{{ op.text }}</text>
            </view>
          </view>

          <view v-if="type === 'date'" class="lingyun-table-filter__card">
            <lingyun-picker
              v-if="draftOp === 'between'"
              mode="daterange"
              title="日期区间"
              :model-value="dateRange"
              @update:model-value="onDateRange"
            >
              <template #trigger>
                <view class="lingyun-table-filter__row" hover-class="lingyun-table-filter__row--hover" :hover-stay-time="70">
                  <text class="lingyun-table-filter__row-text">区间</text>
                  <text class="lingyun-table-filter__row-value" :class="{ 'lingyun-table-filter__row-value--empty': !draftValue }">{{
                    draftValue ? `${draftValue} ~ ${draftValue2}` : '请选择'
                  }}</text>
                  <lingyun-icon type="right" :size="14" color="tertiary" />
                </view>
              </template>
            </lingyun-picker>
            <lingyun-picker v-else mode="date" title="日期" :model-value="draftValue" @update:model-value="onDateValue">
              <template #trigger>
                <view class="lingyun-table-filter__row" hover-class="lingyun-table-filter__row--hover" :hover-stay-time="70">
                  <text class="lingyun-table-filter__row-text">日期</text>
                  <text class="lingyun-table-filter__row-value" :class="{ 'lingyun-table-filter__row-value--empty': !draftValue }">{{
                    draftValue || '请选择'
                  }}</text>
                  <lingyun-icon type="right" :size="14" color="tertiary" />
                </view>
              </template>
            </lingyun-picker>
          </view>

          <view v-else class="lingyun-table-filter__inputs">
            <view class="lingyun-table-filter__input">
              <lingyun-text-field
                :model-value="draftValue"
                :type="type === 'number' ? 'digit' : 'text'"
                :placeholder="firstPlaceholder"
                @update:model-value="onValue"
              />
            </view>
            <template v-if="draftOp === 'between'">
              <text class="lingyun-table-filter__to">至</text>
              <view class="lingyun-table-filter__input">
                <lingyun-text-field
                  :model-value="draftValue2"
                  type="digit"
                  placeholder="最大值"
                  @update:model-value="onValue2"
                />
              </view>
            </template>
          </view>
          <text v-if="draftInvalid" class="lingyun-table-filter__hint lingyun-table-filter__hint--error">{{ invalidText }}</text>
          <text v-else class="lingyun-table-filter__hint">留空时不筛选这一列</text>
        </template>
      </view>
    </view>
  </lingyun-sheets>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import {
  defaultFilterOp,
  filterOpsOf,
  normalizeFilterCondition,
  type LingyunTableFilterCondition,
  type LingyunTableFilterOp,
  type LingyunTableFilterOpItem,
  type LingyunTableFilterOption,
  type LingyunTableFilterResult,
  type LingyunTableFilterType,
} from '../lingyun-table/table-filter'

/** 选项太多时一次只画这么多行，其余靠搜索 */
const MAX_ROWS = 200

type SortPick = 'none' | 'asc' | 'desc'

interface ShownOption {
  token: string
  text: string
  count?: number
  on: boolean
}

/**
 * lingyun-table-filter
 * @description 表格列的排序与筛选面板（Sheet）。多选、数字、文本、日期四种筛选，改动点 ✓ 才生效。
 * @see design/TABLES.md
 */
export default defineComponent({
  name: 'LingyunTableFilter',
  emits: ['update:show', 'confirm'],
  props: {
    show: { type: Boolean, default: false },
    title: { type: String, default: '' },
    /** 为空时只显示排序 */
    type: { type: String as PropType<LingyunTableFilterType | ''>, default: '' },
    options: { type: Array as PropType<LingyunTableFilterOption[]>, default: () => [] },
    values: { type: Array as PropType<string[]>, default: () => [] },
    condition: { type: Object as PropType<LingyunTableFilterCondition | null>, default: null },
    sortable: { type: Boolean, default: false },
    sortOrder: { type: String as PropType<'asc' | 'desc' | ''>, default: '' },
    /** 选项多于这个数时显示搜索 */
    searchThreshold: { type: Number, default: 8 },
  },
  data() {
    return {
      draftSort: 'none' as SortPick,
      draftPicked: [] as string[],
      draftOp: 'eq' as LingyunTableFilterOp,
      draftValue: '',
      draftValue2: '',
      query: '',
    }
  },
  computed: {
    openKey(): string {
      if (!this.show) return ''
      const cond = this.condition
      const condKey = cond ? `${cond.op}:${cond.value}:${cond.value2 || ''}` : ''
      return [this.type, this.title, this.sortOrder, (this.values || []).join(','), condKey].join('|')
    },
    detent(): string {
      return this.type === 'select' && this.options.length > this.searchThreshold ? 'large' : 'medium'
    },
    sortItems(): Array<{ key: SortPick; text: string }> {
      return [
        { key: 'none', text: '不排序' },
        { key: 'asc', text: '升序' },
        { key: 'desc', text: '降序' },
      ]
    },
    ops(): LingyunTableFilterOpItem[] {
      return this.type ? filterOpsOf(this.type) : []
    },
    showSearch(): boolean {
      return this.options.length > this.searchThreshold
    },
    pickedSet(): Set<string> {
      return new Set(this.draftPicked)
    },
    pickedCount(): number {
      return this.draftPicked.length
    },
    matchedOptions(): LingyunTableFilterOption[] {
      const q = this.query.trim().toLowerCase()
      if (!q) return this.options
      return this.options.filter((opt) => String(opt.text).toLowerCase().indexOf(q) >= 0)
    },
    shownOptions(): ShownOption[] {
      const set = this.pickedSet
      return this.matchedOptions.slice(0, MAX_ROWS).map((opt) => {
        const token = String(opt.value)
        return { token, text: opt.text, count: opt.count, on: set.has(token) }
      })
    },
    hiddenCount(): number {
      return Math.max(0, this.matchedOptions.length - MAX_ROWS)
    },
    allOn(): boolean {
      const list = this.matchedOptions
      if (!list.length) return false
      const set = this.pickedSet
      return list.every((opt) => set.has(String(opt.value)))
    },
    someOn(): boolean {
      if (this.allOn) return false
      const set = this.pickedSet
      return this.matchedOptions.some((opt) => set.has(String(opt.value)))
    },
    allCheckClass(): Record<string, boolean> {
      return {
        'lingyun-table-filter__check--on': this.allOn || this.someOn,
      }
    },
    draftEmpty(): boolean {
      if (this.type === 'select') return !this.draftPicked.length
      if (this.draftOp === 'between') return !this.draftValue.trim() && !this.draftValue2.trim()
      return !this.draftValue.trim()
    },
    draftCondition(): LingyunTableFilterCondition | null {
      if (!this.type || this.type === 'select') return null
      return normalizeFilterCondition(this.type, { op: this.draftOp, value: this.draftValue, value2: this.draftValue2 })
    },
    draftInvalid(): boolean {
      if (!this.type || this.type === 'select' || this.draftEmpty) return false
      return !this.draftCondition
    },
    invalidText(): string {
      if (this.draftOp === 'between') return this.type === 'date' ? '请选择起止日期' : '请填写最小值和最大值'
      return this.type === 'number' ? '请输入数字' : '请填写条件'
    },
    draftDirty(): boolean {
      return !this.draftEmpty
    },
    canConfirm(): boolean {
      return !this.draftInvalid
    },
    firstPlaceholder(): string {
      if (this.type === 'number') return this.draftOp === 'between' ? '最小值' : '输入数值'
      return '输入关键字'
    },
    dateRange(): string[] {
      return this.draftValue && this.draftValue2 ? [this.draftValue, this.draftValue2] : []
    },
  },
  watch: {
    /** 同一帧里关了又开另一列时 show 不变，按列和外部值一起判断要不要重置草稿 */
    openKey: {
      immediate: true,
      handler(key: string) {
        if (key) this.resetDraft()
      },
    },
  },
  methods: {
    resetDraft() {
      this.query = ''
      this.draftSort = this.sortOrder === 'asc' || this.sortOrder === 'desc' ? this.sortOrder : 'none'
      this.draftPicked = (this.values || []).map((v) => String(v))
      const cond = this.condition
      const ops = this.ops
      if (cond && ops.some((op) => op.key === cond.op)) {
        this.draftOp = cond.op
        this.draftValue = cond.value || ''
        this.draftValue2 = cond.value2 || ''
      } else {
        this.draftOp = this.type ? defaultFilterOp(this.type) : 'eq'
        this.draftValue = ''
        this.draftValue2 = ''
      }
    },
    onShowChange(open: boolean) {
      this.$emit('update:show', open)
    },
    onSortPick(key: string | number) {
      this.draftSort = key === 'asc' || key === 'desc' ? key : 'none'
    },
    onQuery(value: string) {
      this.query = value || ''
    },
    toggleOption(token: string) {
      const set = new Set(this.draftPicked)
      if (set.has(token)) set.delete(token)
      else set.add(token)
      this.draftPicked = Array.from(set)
    },
    toggleAll() {
      const set = new Set(this.draftPicked)
      const tokens = this.matchedOptions.map((opt) => String(opt.value))
      if (this.allOn) tokens.forEach((token) => set.delete(token))
      else tokens.forEach((token) => set.add(token))
      this.draftPicked = Array.from(set)
    },
    onOpPick(op: LingyunTableFilterOp) {
      if (op === this.draftOp) return
      const wasRange = this.draftOp === 'between'
      this.draftOp = op
      if (op !== 'between') this.draftValue2 = ''
      if (this.type === 'date' && wasRange !== (op === 'between')) this.draftValue = ''
    },
    onValue(value: string) {
      this.draftValue = value == null ? '' : String(value)
    },
    onValue2(value: string) {
      this.draftValue2 = value == null ? '' : String(value)
    },
    onDateValue(value: unknown) {
      this.draftValue = typeof value === 'string' ? value : ''
    },
    onDateRange(value: unknown) {
      const list = Array.isArray(value) ? value : []
      this.draftValue = list[0] ? String(list[0]) : ''
      this.draftValue2 = list[1] ? String(list[1]) : this.draftValue
    },
    onReset() {
      this.query = ''
      this.draftPicked = []
      this.draftValue = ''
      this.draftValue2 = ''
    },
    onConfirm() {
      if (!this.canConfirm) return
      let values: string[] = []
      if (this.type === 'select') {
        // 全部勾上等于不筛选，标签栏也不再显示
        const all = this.options.length > 0 && this.draftPicked.length >= this.options.length && this.options.every((opt) => this.pickedSet.has(String(opt.value)))
        values = all ? [] : this.draftPicked.slice()
      }
      const result: LingyunTableFilterResult = {
        values,
        condition: this.draftEmpty ? null : this.draftCondition,
        sortOrder: this.draftSort === 'none' ? '' : this.draftSort,
      }
      this.$emit('confirm', result)
      this.$emit('update:show', false)
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-table-filter {
  display: flex;
  flex-direction: column;
}

.lingyun-table-filter__block {
  margin-bottom: 20px;
}

.lingyun-table-filter__label-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.lingyun-table-filter__label {
  display: block;
  padding: 0 4px 8px;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table-filter__reset {
  padding: 0 4px 8px;
  font-size: 15px;
  line-height: 18px;
  color: var(--lingyun-link, #{$lingyun-link});
}

.lingyun-table-filter__search {
  margin-bottom: 12px;
}

.lingyun-table-filter__card {
  overflow: hidden;
  border-radius: 20px;
  background-color: var(--lingyun-fill-quaternary, #{$lingyun-fill-quaternary});
}

.lingyun-table-filter__row {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 48px;
  padding: 0 16px;
  box-sizing: border-box;
}

.lingyun-table-filter__row + .lingyun-table-filter__row::before {
  content: '';
  position: absolute;
  top: 0;
  left: 52px;
  right: 0;
  height: 1px;
  transform: scaleY(0.5);
  background-color: var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table-filter__row--hover {
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-table-filter__check {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  margin-right: 14px;
  border-radius: 11px;
  box-sizing: border-box;
  border: 1.5px solid var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-table-filter__check--on {
  border-color: var(--lingyun-primary, #{$lingyun-primary});
  background-color: var(--lingyun-primary, #{$lingyun-primary});
}

.lingyun-table-filter__dash {
  width: 10px;
  height: 2px;
  border-radius: 1px;
  background-color: #ffffff;
}

.lingyun-table-filter__row-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 17px;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-table-filter__row-text--strong {
  font-weight: 600;
}

.lingyun-table-filter__row-meta {
  flex-shrink: 0;
  margin-left: 12px;
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table-filter__row-value {
  flex-shrink: 0;
  margin: 0 6px 0 12px;
  font-size: 17px;
  line-height: 22px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table-filter__row-value--empty {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-table-filter__none {
  padding: 24px 16px;
  display: flex;
  justify-content: center;
}

.lingyun-table-filter__none-text {
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table-filter__hint {
  display: block;
  padding: 8px 4px 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table-filter__hint--error {
  color: var(--lingyun-system-red, #ff383c);
}

.lingyun-table-filter__ops {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 -4px 12px;
}

.lingyun-table-filter__op {
  width: 25%;
  padding: 0 4px 8px;
  box-sizing: border-box;
}

.lingyun-table-filter__op-text {
  display: block;
  height: 36px;
  border-radius: 18px;
  text-align: center;
  font-size: 15px;
  line-height: 36px;
  color: var(--lingyun-label, #{$lingyun-label});
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-table-filter__op--on .lingyun-table-filter__op-text {
  color: #ffffff;
  font-weight: 600;
  background-color: var(--lingyun-primary, #{$lingyun-primary});
}

.lingyun-table-filter__inputs {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-table-filter__input {
  flex: 1;
  min-width: 0;
}

.lingyun-table-filter__to {
  flex-shrink: 0;
  padding: 0 10px;
  font-size: 15px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table-filter__done {
  box-sizing: border-box;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-link, #{$lingyun-link});
  box-shadow: var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    var(--lingyun-glass-shadow-raised, #{$lingyun-glass-shadow-raised});
}

.lingyun-table-filter__done--hover {
  transform: scale(0.96);
}

.lingyun-table-filter__done--off {
  background-color: var(--lingyun-fill, #{$lingyun-fill});
  box-shadow: none;
}
</style>
