<template>
  <view class="lingyun-table-filter-form" :class="{ 'lingyun-table-filter-form--compact': compact }">
    <view v-if="sortable" class="lingyun-table-filter-form__block">
      <text class="lingyun-table-filter-form__label">排序</text>
      <lingyun-segmented-control
        size="small"
        :items="sortItems"
        :model-value="draftSort"
        @update:model-value="onSortPick"
      />
    </view>

    <view v-if="type" class="lingyun-table-filter-form__block">
      <view class="lingyun-table-filter-form__label-row">
        <text class="lingyun-table-filter-form__label">筛选</text>
        <text v-if="draftDirty" class="lingyun-table-filter-form__reset" @click.stop="onReset">重置</text>
      </view>

      <template v-if="type === 'select'">
        <view v-if="showSearch" class="lingyun-table-filter-form__search">
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
        <view class="lingyun-table-filter-form__card">
          <view
            v-if="matchedOptions.length"
            class="lingyun-table-filter-form__row"
            hover-class="lingyun-table-filter-form__row--hover"
            :hover-stay-time="70"
            @click="toggleAll"
          >
            <view class="lingyun-table-filter-form__check" :class="allCheckClass">
              <lingyun-icon v-if="allOn" type="checkmarkempty" :size="14" color="#ffffff" />
              <view v-else-if="someOn" class="lingyun-table-filter-form__dash" />
            </view>
            <text class="lingyun-table-filter-form__row-text lingyun-table-filter-form__row-text--strong">{{
              query ? '全选搜索结果' : '全选'
            }}</text>
            <text class="lingyun-table-filter-form__row-meta">{{ pickedCount }}/{{ options.length }}</text>
          </view>
          <view
            v-for="opt in shownOptions"
            :key="opt.token"
            class="lingyun-table-filter-form__row"
            hover-class="lingyun-table-filter-form__row--hover"
            :hover-stay-time="70"
            @click="toggleOption(opt.token)"
          >
            <view class="lingyun-table-filter-form__check" :class="{ 'lingyun-table-filter-form__check--on': opt.on }">
              <lingyun-icon v-if="opt.on" type="checkmarkempty" :size="14" color="#ffffff" />
            </view>
            <text class="lingyun-table-filter-form__row-text">{{ opt.text }}</text>
            <text v-if="opt.count != null" class="lingyun-table-filter-form__row-meta">{{ opt.count }}</text>
          </view>
          <view v-if="!matchedOptions.length" class="lingyun-table-filter-form__none">
            <text class="lingyun-table-filter-form__none-text">{{ options.length ? '没有匹配的选项' : '暂无可选项' }}</text>
          </view>
        </view>
        <text v-if="hiddenCount > 0" class="lingyun-table-filter-form__hint">还有 {{ hiddenCount }} 项未显示，请搜索</text>
        <text v-else class="lingyun-table-filter-form__hint">不勾选时显示全部</text>
      </template>

      <template v-else>
        <view class="lingyun-table-filter-form__ops">
          <view
            v-for="op in ops"
            :key="op.key"
            class="lingyun-table-filter-form__op"
            :class="{ 'lingyun-table-filter-form__op--on': draftOp === op.key }"
            @click="onOpPick(op.key)"
          >
            <text class="lingyun-table-filter-form__op-text">{{ op.text }}</text>
          </view>
        </view>

        <view v-if="type === 'date'" class="lingyun-table-filter-form__card">
          <lingyun-picker
            v-if="draftOp === 'between'"
            mode="daterange"
            title="日期区间"
            :model-value="dateRange"
            @update:model-value="onDateRange"
          >
            <template #trigger>
              <view class="lingyun-table-filter-form__row" hover-class="lingyun-table-filter-form__row--hover" :hover-stay-time="70">
                <text class="lingyun-table-filter-form__row-text">区间</text>
                <text class="lingyun-table-filter-form__row-value" :class="{ 'lingyun-table-filter-form__row-value--empty': !draftValue }">{{
                  draftValue ? `${draftValue} ~ ${draftValue2}` : '请选择'
                }}</text>
                <lingyun-icon type="right" :size="14" color="tertiary" />
              </view>
            </template>
          </lingyun-picker>
          <lingyun-picker v-else mode="date" title="日期" :model-value="draftValue" @update:model-value="onDateValue">
            <template #trigger>
              <view class="lingyun-table-filter-form__row" hover-class="lingyun-table-filter-form__row--hover" :hover-stay-time="70">
                <text class="lingyun-table-filter-form__row-text">日期</text>
                <text class="lingyun-table-filter-form__row-value" :class="{ 'lingyun-table-filter-form__row-value--empty': !draftValue }">{{
                  draftValue || '请选择'
                }}</text>
                <lingyun-icon type="right" :size="14" color="tertiary" />
              </view>
            </template>
          </lingyun-picker>
        </view>

        <view v-else class="lingyun-table-filter-form__inputs">
          <view class="lingyun-table-filter-form__input">
            <lingyun-text-field
              :model-value="draftValue"
              :type="type === 'number' ? 'digit' : 'text'"
              :placeholder="firstPlaceholder"
              @update:model-value="onValue"
            />
          </view>
          <template v-if="draftOp === 'between'">
            <text class="lingyun-table-filter-form__to">至</text>
            <view class="lingyun-table-filter-form__input">
              <lingyun-text-field
                :model-value="draftValue2"
                type="digit"
                placeholder="最大值"
                @update:model-value="onValue2"
              />
            </view>
          </template>
        </view>
        <text v-if="draftInvalid" class="lingyun-table-filter-form__hint lingyun-table-filter-form__hint--error">{{ invalidText }}</text>
        <text v-else class="lingyun-table-filter-form__hint">留空时不筛选这一列</text>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type PropType } from 'vue'
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
 * lingyun-table-filter-form
 * @description 表格列的排序与筛选表单（草稿）。由 lingyun-table-filter 放进 Sheet 或 Popover；
 * submitSeq 加一时提交，校验通过才抛 confirm。
 * @see design/TABLES.md
 */
defineOptions({
  name: 'LingyunTableFilterForm',
})

const props = defineProps({
  /** 变化时按外部值重置草稿（换列、重新打开） */
  resetKey: { type: String, default: '' },
  /** 加一即提交 */
  submitSeq: { type: Number, default: 0 },
  /** 宽屏 Popover 里用，行高和间距收紧 */
  compact: { type: Boolean, default: false },
  /** 为空时只显示排序 */
  type: { type: String as PropType<LingyunTableFilterType | ''>, default: '' },
  options: { type: Array as PropType<LingyunTableFilterOption[]>, default: () => [] },
  values: { type: Array as PropType<string[]>, default: () => [] },
  condition: { type: Object as PropType<LingyunTableFilterCondition | null>, default: null },
  sortable: { type: Boolean, default: false },
  sortOrder: { type: String as PropType<'asc' | 'desc' | ''>, default: '' },
  /** 选项多于这个数时显示搜索 */
  searchThreshold: { type: Number, default: 8 },
})

const emit = defineEmits(['confirm', 'valid'])

const draftSort = ref<SortPick>('none')
const draftPicked = ref<string[]>([])
const draftOp = ref<LingyunTableFilterOp>('eq')
const draftValue = ref('')
const draftValue2 = ref('')
const query = ref('')

const sortItems = computed((): Array<{ key: SortPick; text: string }> => {
  return [
    { key: 'none', text: '不排序' },
    { key: 'asc', text: '升序' },
    { key: 'desc', text: '降序' },
  ]
})

const ops = computed((): LingyunTableFilterOpItem[] => {
  return props.type ? filterOpsOf(props.type) : []
})

const showSearch = computed((): boolean => {
  return props.options.length > props.searchThreshold
})

const pickedSet = computed((): Set<string> => {
  return new Set(draftPicked.value)
})

const pickedCount = computed((): number => {
  return draftPicked.value.length
})

const matchedOptions = computed((): LingyunTableFilterOption[] => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter((opt) => String(opt.text).toLowerCase().indexOf(q) >= 0)
})

const shownOptions = computed((): ShownOption[] => {
  const set = pickedSet.value
  return matchedOptions.value.slice(0, MAX_ROWS).map((opt) => {
    const token = String(opt.value)
    return { token, text: opt.text, count: opt.count, on: set.has(token) }
  })
})

const hiddenCount = computed((): number => {
  return Math.max(0, matchedOptions.value.length - MAX_ROWS)
})

const allOn = computed((): boolean => {
  const list = matchedOptions.value
  if (!list.length) return false
  const set = pickedSet.value
  return list.every((opt) => set.has(String(opt.value)))
})

const someOn = computed((): boolean => {
  if (allOn.value) return false
  const set = pickedSet.value
  return matchedOptions.value.some((opt) => set.has(String(opt.value)))
})

const allCheckClass = computed((): Record<string, boolean> => {
  return {
    'lingyun-table-filter-form__check--on': allOn.value || someOn.value,
  }
})

const draftEmpty = computed((): boolean => {
  if (props.type === 'select') return !draftPicked.value.length
  if (draftOp.value === 'between') return !draftValue.value.trim() && !draftValue2.value.trim()
  return !draftValue.value.trim()
})

const draftCondition = computed((): LingyunTableFilterCondition | null => {
  if (!props.type || props.type === 'select') return null
  return normalizeFilterCondition(props.type, { op: draftOp.value, value: draftValue.value, value2: draftValue2.value })
})

const draftInvalid = computed((): boolean => {
  if (!props.type || props.type === 'select' || draftEmpty.value) return false
  return !draftCondition.value
})

const invalidText = computed((): string => {
  if (draftOp.value === 'between') return props.type === 'date' ? '请选择起止日期' : '请填写最小值和最大值'
  return props.type === 'number' ? '请输入数字' : '请填写条件'
})

const draftDirty = computed((): boolean => {
  return !draftEmpty.value
})

const canConfirm = computed((): boolean => {
  return !draftInvalid.value
})

const firstPlaceholder = computed((): string => {
  if (props.type === 'number') return draftOp.value === 'between' ? '最小值' : '输入数值'
  return '输入关键字'
})

const dateRange = computed((): string[] => {
  return draftValue.value && draftValue2.value ? [draftValue.value, draftValue2.value] : []
})

function resetDraft(): void {
  query.value = ''
  draftSort.value = props.sortOrder === 'asc' || props.sortOrder === 'desc' ? props.sortOrder : 'none'
  draftPicked.value = (props.values || []).map((v) => String(v))
  const cond = props.condition
  const availableOps = ops.value
  if (cond && availableOps.some((op) => op.key === cond.op)) {
    draftOp.value = cond.op
    draftValue.value = cond.value || ''
    draftValue2.value = cond.value2 || ''
  } else {
    draftOp.value = props.type ? defaultFilterOp(props.type) : 'eq'
    draftValue.value = ''
    draftValue2.value = ''
  }
}

function onSortPick(key: string | number): void {
  draftSort.value = key === 'asc' || key === 'desc' ? key : 'none'
}

function onQuery(value: string): void {
  query.value = value || ''
}

function toggleOption(token: string): void {
  const set = new Set(draftPicked.value)
  if (set.has(token)) set.delete(token)
  else set.add(token)
  draftPicked.value = Array.from(set)
}

function toggleAll(): void {
  const set = new Set(draftPicked.value)
  const tokens = matchedOptions.value.map((opt) => String(opt.value))
  if (allOn.value) tokens.forEach((token) => set.delete(token))
  else tokens.forEach((token) => set.add(token))
  draftPicked.value = Array.from(set)
}

function onOpPick(op: LingyunTableFilterOp): void {
  if (op === draftOp.value) return
  const wasRange = draftOp.value === 'between'
  draftOp.value = op
  if (op !== 'between') draftValue2.value = ''
  if (props.type === 'date' && wasRange !== (op === 'between')) draftValue.value = ''
}

function onValue(value: string): void {
  draftValue.value = value == null ? '' : String(value)
}

function onValue2(value: string): void {
  draftValue2.value = value == null ? '' : String(value)
}

function onDateValue(value: unknown): void {
  draftValue.value = typeof value === 'string' ? value : ''
}

function onDateRange(value: unknown): void {
  const list = Array.isArray(value) ? value : []
  draftValue.value = list[0] ? String(list[0]) : ''
  draftValue2.value = list[1] ? String(list[1]) : draftValue.value
}

function onReset(): void {
  query.value = ''
  draftPicked.value = []
  draftValue.value = ''
  draftValue2.value = ''
}

function onConfirm(): void {
  if (!canConfirm.value) return
  let values: string[] = []
  if (props.type === 'select') {
    // 全部勾上等于不筛选，标签栏也不再显示
    const all = props.options.length > 0 && draftPicked.value.length >= props.options.length && props.options.every((opt) => pickedSet.value.has(String(opt.value)))
    values = all ? [] : draftPicked.value.slice()
  }
  const result: LingyunTableFilterResult = {
    values,
    condition: draftEmpty.value ? null : draftCondition.value,
    sortOrder: draftSort.value === 'none' ? '' : draftSort.value,
  }
  emit('confirm', result)
}

watch(() => props.resetKey, () => {
  resetDraft()
}, { immediate: true })

watch(() => props.submitSeq, (next: number, prev: number) => {
  if (next > prev) onConfirm()
})

watch(canConfirm, (ok: boolean) => {
  emit('valid', ok)
}, { immediate: true })
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-table-filter-form {
  display: flex;
  flex-direction: column;
}

.lingyun-table-filter-form__block {
  margin-bottom: 20px;
}

.lingyun-table-filter-form__label-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.lingyun-table-filter-form__label {
  display: block;
  padding: 0 4px 8px;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table-filter-form__reset {
  padding: 0 4px 8px;
  font-size: 15px;
  line-height: 18px;
  color: var(--lingyun-link, #{$lingyun-link});
}

.lingyun-table-filter-form__search {
  margin-bottom: 12px;
}

.lingyun-table-filter-form__card {
  overflow: hidden;
  border-radius: 20px;
  background-color: var(--lingyun-fill-quaternary, #{$lingyun-fill-quaternary});
}

.lingyun-table-filter-form__row {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 48px;
  padding: 0 16px;
  box-sizing: border-box;
}

.lingyun-table-filter-form__row + .lingyun-table-filter-form__row::before {
  content: '';
  position: absolute;
  top: 0;
  left: 52px;
  right: 0;
  height: 1px;
  transform: scaleY(0.5);
  background-color: var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table-filter-form__row--hover {
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-table-filter-form__check {
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

.lingyun-table-filter-form__check--on {
  border-color: var(--lingyun-primary, #{$lingyun-primary});
  background-color: var(--lingyun-primary, #{$lingyun-primary});
}

.lingyun-table-filter-form__dash {
  width: 10px;
  height: 2px;
  border-radius: 1px;
  background-color: #ffffff;
}

.lingyun-table-filter-form__row-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 17px;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-table-filter-form__row-text--strong {
  font-weight: 600;
}

.lingyun-table-filter-form__row-meta {
  flex-shrink: 0;
  margin-left: 12px;
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table-filter-form__row-value {
  flex-shrink: 0;
  margin: 0 6px 0 12px;
  font-size: 17px;
  line-height: 22px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table-filter-form__row-value--empty {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-table-filter-form__none {
  padding: 24px 16px;
  display: flex;
  justify-content: center;
}

.lingyun-table-filter-form__none-text {
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table-filter-form__hint {
  display: block;
  padding: 8px 4px 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table-filter-form__hint--error {
  color: var(--lingyun-system-red, #ff383c);
}

.lingyun-table-filter-form__ops {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 -4px 12px;
}

.lingyun-table-filter-form__op {
  width: 25%;
  padding: 0 4px 8px;
  box-sizing: border-box;
}

.lingyun-table-filter-form__op-text {
  display: block;
  height: 36px;
  border-radius: 18px;
  text-align: center;
  font-size: 15px;
  line-height: 36px;
  color: var(--lingyun-label, #{$lingyun-label});
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-table-filter-form__op--on .lingyun-table-filter-form__op-text {
  color: #ffffff;
  font-weight: 600;
  background-color: var(--lingyun-primary, #{$lingyun-primary});
}

.lingyun-table-filter-form__inputs {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-table-filter-form__input {
  flex: 1;
  min-width: 0;
}

.lingyun-table-filter-form__to {
  flex-shrink: 0;
  padding: 0 10px;
  font-size: 15px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

/* 宽屏 Popover：行高 44、字号 15，块间距收紧 */
.lingyun-table-filter-form--compact .lingyun-table-filter-form__block {
  margin-bottom: 14px;
}

.lingyun-table-filter-form--compact .lingyun-table-filter-form__card {
  border-radius: 16px;
}

.lingyun-table-filter-form--compact .lingyun-table-filter-form__row {
  min-height: 44px;
  padding: 0 12px;
}

.lingyun-table-filter-form--compact .lingyun-table-filter-form__row + .lingyun-table-filter-form__row::before {
  left: 46px;
}

.lingyun-table-filter-form--compact .lingyun-table-filter-form__check {
  width: 20px;
  height: 20px;
  margin-right: 14px;
  border-radius: 10px;
}

.lingyun-table-filter-form--compact .lingyun-table-filter-form__row-text,
.lingyun-table-filter-form--compact .lingyun-table-filter-form__row-value {
  font-size: 15px;
  line-height: 20px;
}

.lingyun-table-filter-form--compact .lingyun-table-filter-form__row-meta {
  font-size: 13px;
}

.lingyun-table-filter-form--compact .lingyun-table-filter-form__op-text {
  height: 32px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 32px;
}
</style>
