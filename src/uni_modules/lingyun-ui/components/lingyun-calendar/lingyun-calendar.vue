<template>
  <view class="lingyun-calendar" :class="rootClass">
    <view class="lingyun-calendar__card">
      <view class="lingyun-calendar__header">
        <text class="lingyun-calendar__title">{{ title }}</text>
        <view class="lingyun-calendar__actions">
          <view
            v-if="showTodayButton"
            class="lingyun-calendar__today"
            role="button"
            @click="goToday"
          >
            {{ todayText }}
          </view>
          <view
            class="lingyun-calendar__arrow"
            :class="{ 'lingyun-calendar__arrow--disabled': !canPrevMonth }"
            role="button"
            aria-label="上个月"
            @click="prevMonth"
          >
            <lingyun-icon type="left" :size="16" color="primary" />
          </view>
          <view
            class="lingyun-calendar__arrow"
            :class="{ 'lingyun-calendar__arrow--disabled': !canNextMonth }"
            role="button"
            aria-label="下个月"
            @click="nextMonth"
          >
            <lingyun-icon type="right" :size="16" color="primary" />
          </view>
        </view>
      </view>

      <text v-if="mode === 'range'" class="lingyun-calendar__hint">
        {{ rangeHint }}
      </text>

      <view class="lingyun-calendar__week">
        <text
          v-for="label in weekLabels"
          :key="label"
          class="lingyun-calendar__weekday"
        >
          {{ label }}
        </text>
      </view>

      <view class="lingyun-calendar__grid">
        <view
          v-for="(cell, index) in cells"
          :key="`${index}-${cell ? cellKey(cell) : ''}`"
          class="lingyun-calendar__cell"
          :class="cellClass(cell)"
          role="button"
          :aria-label="cellLabel(cell)"
          @click="onCellClick(cell)"
        >
          <lingyun-picker-cal-day
            v-if="cell"
            v-bind="dayDecor(cell)"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import LingyunPickerCalDay from '../lingyun-picker-cal-day/lingyun-picker-cal-day.vue'
import {
  compareYmd,
  daysInMonth,
  parseDateRange,
  parseYm,
  parseYmd,
  shiftMonthYm,
  ymdKey,
  type CalCell,
  type Ymd,
} from '../lingyun-picker/picker-date'
import { lunarDayText } from '../lingyun-picker/lunar'
import type {
  LingyunCalendarChangePayload,
  LingyunCalendarMark,
  LingyunCalendarMode,
  LingyunCalendarMonthPayload,
  LingyunCalendarValue,
} from './types'

interface CalendarMark extends LingyunCalendarMark {
  key: string
  badgeTextResolved: string
  dotTone: string
}

interface CalDayDecor {
  day: number
  badgeText: string
  lunar: string
  dotTone: string
  selected: boolean
  today: boolean
  disabled: boolean
  outside: boolean
  compact: boolean
  selectTone: string
}

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六']
const CAL_CELLS = 42

function todayYmd(): Ymd {
  const now = new Date()
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() }
}

/**
 * lingyun-calendar
 * @description 独立日历：单选 / 范围、月份切换、今天、标记与禁用日期
 * @see design/CALENDAR.md
 */
defineOptions({
  name: 'LingyunCalendar',
})

const props = defineProps({
  modelValue: {
    type: [String, Array] as PropType<LingyunCalendarValue>,
    default: '',
  },
  mode: {
    type: String as PropType<LingyunCalendarMode>,
    default: 'single',
  },
  /** 受控视图月份 YYYY-MM；不传时跟随当前值 / 今天 */
  month: { type: String, default: '' },
  min: { type: String, default: '' },
  max: { type: String, default: '' },
  weekStartsOn: { type: Number, default: 0 },
  marks: {
    type: Array as PropType<LingyunCalendarMark[]>,
    default: () => [],
  },
  disabledDates: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  showLunar: { type: Boolean, default: false },
  showTodayButton: { type: Boolean, default: true },
  todayText: { type: String, default: '今天' },
})

const emit = defineEmits(['update:modelValue', 'change', 'month-change'])

const today = ref<Ymd>(todayYmd())
const viewYear = ref(0)
const viewMonth = ref(0)
const viewReady = ref(false)

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* pinia 未就绪 */
  }
  return themeClass
})

const modeKey = computed((): LingyunCalendarMode => {
  return props.mode === 'range' ? 'range' : 'single'
})

const weekLabels = computed((): string[] => {
  const start = ((Math.floor(Number(props.weekStartsOn)) % 7) + 7) % 7
  return WEEK_LABELS.slice(start).concat(WEEK_LABELS.slice(0, start))
})

const weekStartIndex = computed((): number => {
  return ((Math.floor(Number(props.weekStartsOn)) % 7) + 7) % 7
})

const title = computed((): string => {
  if (!viewReady.value) return ''
  return `${viewYear.value}年${viewMonth.value}月`
})

const minYmd = computed((): Ymd | null => {
  return parseYmd(props.min)
})

const maxYmd = computed((): Ymd | null => {
  return parseYmd(props.max)
})

function parseModel(): { start: Ymd | null; end: Ymd | null } {
  if (modeKey.value === 'single') {
    if (Array.isArray(props.modelValue)) {
      return { start: parseYmd(props.modelValue[0]), end: null }
    }
    return { start: parseYmd(props.modelValue), end: null }
  }
  if (Array.isArray(props.modelValue)) {
    const start = parseYmd(props.modelValue[0])
    const end = parseYmd(props.modelValue[1])
    return { start, end }
  }
  const range = parseDateRange(props.modelValue)
  return range
    ? { start: range.start, end: range.end }
    : { start: null, end: null }
}

const selectedStart = computed((): Ymd | null => {
  return parseModel().start
})

const selectedEnd = computed((): Ymd | null => {
  return parseModel().end
})

const rangeHint = computed((): string => {
  if (modeKey.value !== 'range') return ''
  const start = selectedStart.value
  const end = selectedEnd.value
  if (!start) return '请选择开始日期'
  if (!end) return '请选择结束日期'
  return `${ymdKey(start.y, start.m, start.d)} ~ ${ymdKey(end.y, end.m, end.d)}`
})

const marksMap = computed((): Record<string, CalendarMark> => {
  const map: Record<string, CalendarMark> = {}
  const list = Array.isArray(props.marks) ? props.marks : []
  list.forEach((raw) => {
    const date = parseYmd(raw?.date)
    if (!date) return
    const key = ymdKey(date.y, date.m, date.d)
    let badgeText = ''
    if (typeof raw.badge === 'string' && raw.badge.trim()) {
      badgeText = raw.badge.trim()
    } else if (typeof raw.badgeText === 'string' && raw.badgeText.trim()) {
      badgeText = raw.badgeText.trim()
    }
    let dotTone = ''
    if (raw.dot !== false && raw.dot != null) {
      const tone = raw.dot === true ? 'red' : String(raw.dot).toLowerCase()
      if (tone === 'red' || tone === 'default' || tone === '1') dotTone = 'red'
      else if (tone === 'orange' || tone === 'warning') dotTone = 'orange'
      else if (tone === 'green' || tone === 'success') dotTone = 'green'
    }
    map[key] = {
      ...raw,
      key,
      badgeTextResolved: badgeText,
      dotTone,
    }
  })
  return map
})

const disabledSet = computed((): Set<string> => {
  const set = new Set<string>()
  ;(Array.isArray(props.disabledDates) ? props.disabledDates : []).forEach((value) => {
    const date = parseYmd(value)
    if (date) set.add(ymdKey(date.y, date.m, date.d))
  })
  return set
})

const canPrevMonth = computed((): boolean => {
  if (!viewReady.value) return false
  const min = minYmd.value
  if (!min) return true
  return viewYear.value * 12 + viewMonth.value > min.y * 12 + min.m
})

const canNextMonth = computed((): boolean => {
  if (!viewReady.value) return false
  const max = maxYmd.value
  if (!max) return true
  return viewYear.value * 12 + viewMonth.value < max.y * 12 + max.m
})

function setView(year: number, month: number, emitMonthChange: boolean): void {
  viewYear.value = year
  viewMonth.value = month
  viewReady.value = true
  if (emitMonthChange) {
    const payload: LingyunCalendarMonthPayload = {
      year,
      month,
      title: `${year}年${month}月`,
    }
    emit('month-change', payload)
  }
}

function modelAnchor(): Ymd | null {
  const model = parseModel()
  return model.end || model.start
}

function syncViewFromModel(): void {
  if (props.month) return
  const selected = modelAnchor()
  if (!selected) return
  if (
    !viewReady.value ||
    selected.y !== viewYear.value ||
    selected.m !== viewMonth.value
  ) {
    setView(selected.y, selected.m, false)
  }
}

function initView(): void {
  const month = parseYm(props.month)
  if (month) {
    setView(month.y, month.m, false)
    return
  }
  const selected = modelAnchor()
  if (selected) {
    setView(selected.y, selected.m, false)
    return
  }
  setView(today.value.y, today.value.m, false)
}

initView()

function buildMonthCells(y: number, m: number): (CalCell | null)[] {
  if (!y || !m) return Array(CAL_CELLS).fill(null)
  const firstDow = new Date(y, m - 1, 1).getDay()
  const lead = ((firstDow - weekStartIndex.value) % 7 + 7) % 7
  const cells: CalCell[] = []
  if (lead > 0) {
    const prev = shiftMonthYm(y, m, -1)
    const prevDim = daysInMonth(prev.y, prev.m)
    for (let i = lead; i > 0; i -= 1) {
      cells.push({ y: prev.y, m: prev.m, d: prevDim - i + 1, out: true })
    }
  }
  const dim = daysInMonth(y, m)
  for (let d = 1; d <= dim; d += 1) cells.push({ y, m, d, out: false })
  const next = shiftMonthYm(y, m, 1)
  let tail = 1
  while (cells.length < CAL_CELLS) {
    cells.push({ y: next.y, m: next.m, d: tail, out: true })
    tail += 1
  }
  return cells
}

const cells = computed((): (CalCell | null)[] => {
  if (!viewReady.value) return Array(CAL_CELLS).fill(null)
  return buildMonthCells(viewYear.value, viewMonth.value)
})

function cellKey(cell: CalCell): string {
  return ymdKey(cell.y, cell.m, cell.d)
}

function cellLabel(cell: CalCell | null): string {
  if (!cell) return ''
  return `${cell.y}年${cell.m}月${cell.d}日`
}

function isDisabled(cell: CalCell): boolean {
  if (cell.out) return true
  const key = ymdKey(cell.y, cell.m, cell.d)
  if (disabledSet.value.has(key)) return true
  const min = minYmd.value
  const max = maxYmd.value
  const current: Ymd = { y: cell.y, m: cell.m, d: cell.d }
  if (min && compareYmd(current, min) < 0) return true
  if (max && compareYmd(current, max) > 0) return true
  return false
}

function rangeFlags(cell: CalCell): {
  rangeStart: boolean
  rangeEnd: boolean
  inRange: boolean
} {
  if (modeKey.value !== 'range') {
    return { rangeStart: false, rangeEnd: false, inRange: false }
  }
  const start = selectedStart.value
  const end = selectedEnd.value
  if (!start) return { rangeStart: false, rangeEnd: false, inRange: false }
  const current: Ymd = { y: cell.y, m: cell.m, d: cell.d }
  const rangeStart = compareYmd(current, start) === 0
  const rangeEnd = !!end && compareYmd(current, end) === 0
  const inRange =
    !!end &&
    compareYmd(current, start) > 0 &&
    compareYmd(current, end) < 0
  return { rangeStart, rangeEnd, inRange }
}

function cellClass(cell: CalCell | null): string {
  if (!cell) return 'lingyun-calendar__cell--empty'
  const flags = rangeFlags(cell)
  return [
    cell.out ? 'lingyun-calendar__cell--outside' : '',
    isDisabled(cell) ? 'lingyun-calendar__cell--disabled' : '',
    flags.inRange ? 'lingyun-calendar__cell--range' : '',
    flags.rangeStart ? 'lingyun-calendar__cell--range-start' : '',
    flags.rangeEnd ? 'lingyun-calendar__cell--range-end' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function dayDecor(cell: CalCell): CalDayDecor {
  const key = ymdKey(cell.y, cell.m, cell.d)
  const mark = marksMap.value[key]
  const start = selectedStart.value
  const end = selectedEnd.value
  const selected = !!start && ymdKey(start.y, start.m, start.d) === key
  const endSelected = !!end && ymdKey(end.y, end.m, end.d) === key
  const hasMarks = (Array.isArray(props.marks) ? props.marks.length : 0) > 0
  const compact = props.showLunar || hasMarks
  return {
    day: cell.d,
    badgeText: mark ? mark.badgeTextResolved : '',
    lunar: props.showLunar ? lunarDayText(cell.y, cell.m, cell.d) : '',
    dotTone: mark ? mark.dotTone : '',
    selected: selected || endSelected,
    today:
      cell.y === today.value.y &&
      cell.m === today.value.m &&
      cell.d === today.value.d,
    disabled: isDisabled(cell),
    outside: cell.out,
    compact,
    selectTone: compact || modeKey.value === 'range' ? 'red' : 'label',
  }
}

function emitValue(value: LingyunCalendarValue, start: string, end: string): void {
  const payload: LingyunCalendarChangePayload = { value, start, end }
  emit('update:modelValue', value)
  emit('change', payload)
}

function onCellClick(cell: CalCell | null): void {
  if (!cell || isDisabled(cell)) return
  const key = ymdKey(cell.y, cell.m, cell.d)
  if (modeKey.value === 'single') {
    emitValue(key, key, key)
    return
  }

  const start = selectedStart.value
  const end = selectedEnd.value
  if (!start || end) {
    emitValue([key], key, '')
    return
  }
  if (compareYmd(cell, start) < 0) {
    emitValue([key, ymdKey(start.y, start.m, start.d)], key, ymdKey(start.y, start.m, start.d))
    return
  }
  emitValue([ymdKey(start.y, start.m, start.d), key], ymdKey(start.y, start.m, start.d), key)
}

function prevMonth(): void {
  if (!canPrevMonth.value) return
  const prev = shiftMonthYm(viewYear.value, viewMonth.value, -1)
  setView(prev.y, prev.m, true)
}

function nextMonth(): void {
  if (!canNextMonth.value) return
  const next = shiftMonthYm(viewYear.value, viewMonth.value, 1)
  setView(next.y, next.m, true)
}

function goToday(): void {
  const currentToday = todayYmd()
  today.value = currentToday
  setView(currentToday.y, currentToday.m, true)
}

function select(value: LingyunCalendarValue): void {
  const start = Array.isArray(value) ? parseYmd(value[0]) : parseYmd(value)
  const end = Array.isArray(value) ? parseYmd(value[1]) : null
  emitValue(
    value,
    start ? ymdKey(start.y, start.m, start.d) : '',
    end ? ymdKey(end.y, end.m, end.d) : '',
  )
}

watch(
  () => props.modelValue,
  () => {
    syncViewFromModel()
  },
)

watch(
  () => props.month,
  (value: string) => {
    const parsed = parseYm(value)
    if (parsed) setView(parsed.y, parsed.m, false)
  },
)
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-calendar {
  box-sizing: border-box;
  width: 100%;
}

.lingyun-calendar__card {
  box-sizing: border-box;
  padding: 12px;
  border-radius: 16px;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-shadow: 0 0 0 0.5px var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-calendar__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 2px 8px;
}

.lingyun-calendar__title {
  flex: 1;
  min-width: 0;
  font-size: 17px;
  line-height: 22px;
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-calendar__actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
}

.lingyun-calendar__today {
  min-height: 32px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 8px;
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-calendar__arrow {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.lingyun-calendar__arrow--disabled {
  opacity: 0.3;
  pointer-events: none;
}

.lingyun-calendar__hint {
  display: block;
  padding: 0 2px 6px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-calendar__week {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 0;
}

.lingyun-calendar__weekday {
  width: 14.2857%;
  text-align: center;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-calendar__grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.lingyun-calendar__cell {
  width: 14.2857%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.lingyun-calendar__cell--range {
  background-color: var(--lingyun-primary-soft, rgba(0, 136, 255, 0.14));
}

.lingyun-calendar__cell--range-start {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.lingyun-calendar__cell--range-end {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.lingyun-calendar__cell--outside {
  pointer-events: none;
}

.lingyun-calendar__cell--disabled {
  pointer-events: none;
}
</style>
