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

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
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
export default defineComponent({
  name: 'LingyunCalendar',
  components: { LingyunPickerCalDay },
  emits: ['update:modelValue', 'change', 'month-change'],
  props: {
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
  },
  data(): {
    today: Ymd
    viewYear: number
    viewMonth: number
    viewReady: boolean
  } {
    return {
      today: todayYmd(),
      viewYear: 0,
      viewMonth: 0,
      viewReady: false,
    }
  },
  computed: {
    rootClass(): string {
      let themeClass = 'theme-light'
      try {
        themeClass = useLingyunTheme().rootClass || 'theme-light'
      } catch {
        /* pinia 未就绪 */
      }
      return themeClass
    },
    modeKey(): LingyunCalendarMode {
      return this.mode === 'range' ? 'range' : 'single'
    },
    weekLabels(): string[] {
      const start = ((Math.floor(Number(this.weekStartsOn)) % 7) + 7) % 7
      return WEEK_LABELS.slice(start).concat(WEEK_LABELS.slice(0, start))
    },
    weekStartIndex(): number {
      return ((Math.floor(Number(this.weekStartsOn)) % 7) + 7) % 7
    },
    title(): string {
      if (!this.viewReady) return ''
      return `${this.viewYear}年${this.viewMonth}月`
    },
    minYmd(): Ymd | null {
      return parseYmd(this.min)
    },
    maxYmd(): Ymd | null {
      return parseYmd(this.max)
    },
    selectedStart(): Ymd | null {
      return this.parseModel().start
    },
    selectedEnd(): Ymd | null {
      return this.parseModel().end
    },
    rangeHint(): string {
      if (this.modeKey !== 'range') return ''
      const start = this.selectedStart
      const end = this.selectedEnd
      if (!start) return '请选择开始日期'
      if (!end) return '请选择结束日期'
      return `${ymdKey(start.y, start.m, start.d)} ~ ${ymdKey(end.y, end.m, end.d)}`
    },
    marksMap(): Record<string, CalendarMark> {
      const map: Record<string, CalendarMark> = {}
      const list = Array.isArray(this.marks) ? this.marks : []
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
    },
    disabledSet(): Set<string> {
      const set = new Set<string>()
      ;(Array.isArray(this.disabledDates) ? this.disabledDates : []).forEach((value) => {
        const date = parseYmd(value)
        if (date) set.add(ymdKey(date.y, date.m, date.d))
      })
      return set
    },
    cells(): (CalCell | null)[] {
      if (!this.viewReady) return Array(CAL_CELLS).fill(null)
      return this.buildMonthCells(this.viewYear, this.viewMonth)
    },
    canPrevMonth(): boolean {
      if (!this.viewReady) return false
      const min = this.minYmd
      if (!min) return true
      return this.viewYear * 12 + this.viewMonth > min.y * 12 + min.m
    },
    canNextMonth(): boolean {
      if (!this.viewReady) return false
      const max = this.maxYmd
      if (!max) return true
      return this.viewYear * 12 + this.viewMonth < max.y * 12 + max.m
    },
  },
  watch: {
    modelValue: {
      handler() {
        this.syncViewFromModel()
      },
    },
    month(value: string) {
      const parsed = parseYm(value)
      if (parsed) this.setView(parsed.y, parsed.m, false)
    },
  },
  created() {
    this.initView()
  },
  methods: {
    parseModel(): { start: Ymd | null; end: Ymd | null } {
      if (this.modeKey === 'single') {
        if (Array.isArray(this.modelValue)) {
          return { start: parseYmd(this.modelValue[0]), end: null }
        }
        return { start: parseYmd(this.modelValue), end: null }
      }
      if (Array.isArray(this.modelValue)) {
        const start = parseYmd(this.modelValue[0])
        const end = parseYmd(this.modelValue[1])
        return { start, end }
      }
      const range = parseDateRange(this.modelValue)
      return range
        ? { start: range.start, end: range.end }
        : { start: null, end: null }
    },
    initView(): void {
      const month = parseYm(this.month)
      if (month) {
        this.setView(month.y, month.m, false)
        return
      }
      const selected = this.modelAnchor()
      if (selected) {
        this.setView(selected.y, selected.m, false)
        return
      }
      this.setView(this.today.y, this.today.m, false)
    },
    modelAnchor(): Ymd | null {
      const model = this.parseModel()
      return model.end || model.start
    },
    syncViewFromModel(): void {
      if (this.month) return
      const selected = this.modelAnchor()
      if (!selected) return
      if (
        !this.viewReady ||
        selected.y !== this.viewYear ||
        selected.m !== this.viewMonth
      ) {
        this.setView(selected.y, selected.m, false)
      }
    },
    setView(year: number, month: number, emit: boolean): void {
      this.viewYear = year
      this.viewMonth = month
      this.viewReady = true
      if (emit) {
        const payload: LingyunCalendarMonthPayload = {
          year,
          month,
          title: `${year}年${month}月`,
        }
        this.$emit('month-change', payload)
      }
    },
    buildMonthCells(y: number, m: number): (CalCell | null)[] {
      if (!y || !m) return Array(CAL_CELLS).fill(null)
      const firstDow = new Date(y, m - 1, 1).getDay()
      const lead = ((firstDow - this.weekStartIndex) % 7 + 7) % 7
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
    },
    cellKey(cell: CalCell): string {
      return ymdKey(cell.y, cell.m, cell.d)
    },
    cellLabel(cell: CalCell | null): string {
      if (!cell) return ''
      return `${cell.y}年${cell.m}月${cell.d}日`
    },
    isDisabled(cell: CalCell): boolean {
      if (cell.out) return true
      const key = ymdKey(cell.y, cell.m, cell.d)
      if (this.disabledSet.has(key)) return true
      const min = this.minYmd
      const max = this.maxYmd
      const current: Ymd = { y: cell.y, m: cell.m, d: cell.d }
      if (min && compareYmd(current, min) < 0) return true
      if (max && compareYmd(current, max) > 0) return true
      return false
    },
    rangeFlags(cell: CalCell): {
      rangeStart: boolean
      rangeEnd: boolean
      inRange: boolean
    } {
      if (this.modeKey !== 'range') {
        return { rangeStart: false, rangeEnd: false, inRange: false }
      }
      const start = this.selectedStart
      const end = this.selectedEnd
      if (!start) return { rangeStart: false, rangeEnd: false, inRange: false }
      const current: Ymd = { y: cell.y, m: cell.m, d: cell.d }
      const rangeStart = compareYmd(current, start) === 0
      const rangeEnd = !!end && compareYmd(current, end) === 0
      const inRange =
        !!end &&
        compareYmd(current, start) > 0 &&
        compareYmd(current, end) < 0
      return { rangeStart, rangeEnd, inRange }
    },
    cellClass(cell: CalCell | null): string {
      if (!cell) return 'lingyun-calendar__cell--empty'
      const flags = this.rangeFlags(cell)
      return [
        cell.out ? 'lingyun-calendar__cell--outside' : '',
        this.isDisabled(cell) ? 'lingyun-calendar__cell--disabled' : '',
        flags.inRange ? 'lingyun-calendar__cell--range' : '',
        flags.rangeStart ? 'lingyun-calendar__cell--range-start' : '',
        flags.rangeEnd ? 'lingyun-calendar__cell--range-end' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    dayDecor(cell: CalCell): CalDayDecor {
      const key = ymdKey(cell.y, cell.m, cell.d)
      const mark = this.marksMap[key]
      const selected =
        !!this.selectedStart &&
        ymdKey(this.selectedStart.y, this.selectedStart.m, this.selectedStart.d) === key
      const endSelected =
        !!this.selectedEnd &&
        ymdKey(this.selectedEnd.y, this.selectedEnd.m, this.selectedEnd.d) === key
      const hasMarks = (Array.isArray(this.marks) ? this.marks.length : 0) > 0
      const compact = this.showLunar || hasMarks
      return {
        day: cell.d,
        badgeText: mark ? mark.badgeTextResolved : '',
        lunar: this.showLunar ? lunarDayText(cell.y, cell.m, cell.d) : '',
        dotTone: mark ? mark.dotTone : '',
        selected: selected || endSelected,
        today:
          cell.y === this.today.y &&
          cell.m === this.today.m &&
          cell.d === this.today.d,
        disabled: this.isDisabled(cell),
        outside: cell.out,
        compact,
        selectTone: compact || this.modeKey === 'range' ? 'red' : 'label',
      }
    },
    onCellClick(cell: CalCell | null): void {
      if (!cell || this.isDisabled(cell)) return
      const key = ymdKey(cell.y, cell.m, cell.d)
      if (this.modeKey === 'single') {
        this.emitValue(key, key, key)
        return
      }

      const start = this.selectedStart
      const end = this.selectedEnd
      if (!start || end) {
        this.emitValue([key], key, '')
        return
      }
      if (compareYmd(cell, start) < 0) {
        this.emitValue([key, ymdKey(start.y, start.m, start.d)], key, ymdKey(start.y, start.m, start.d))
        return
      }
      this.emitValue([ymdKey(start.y, start.m, start.d), key], ymdKey(start.y, start.m, start.d), key)
    },
    emitValue(value: LingyunCalendarValue, start: string, end: string): void {
      const payload: LingyunCalendarChangePayload = { value, start, end }
      this.$emit('update:modelValue', value)
      this.$emit('change', payload)
    },
    prevMonth(): void {
      if (!this.canPrevMonth) return
      const prev = shiftMonthYm(this.viewYear, this.viewMonth, -1)
      this.setView(prev.y, prev.m, true)
    },
    nextMonth(): void {
      if (!this.canNextMonth) return
      const next = shiftMonthYm(this.viewYear, this.viewMonth, 1)
      this.setView(next.y, next.m, true)
    },
    goToday(): void {
      const today = todayYmd()
      this.today = today
      this.setView(today.y, today.m, true)
    },
    select(value: LingyunCalendarValue): void {
      const start = Array.isArray(value) ? parseYmd(value[0]) : parseYmd(value)
      const end = Array.isArray(value) ? parseYmd(value[1]) : null
      this.emitValue(
        value,
        start ? ymdKey(start.y, start.m, start.d) : '',
        end ? ymdKey(end.y, end.m, end.d) : '',
      )
    },
  },
})
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
