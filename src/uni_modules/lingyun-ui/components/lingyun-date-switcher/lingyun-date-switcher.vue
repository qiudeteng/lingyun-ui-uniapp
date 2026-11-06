<template>
  <view class="lingyun-date-switcher" :class="rootClass" :style="rootStyle">
    <view class="lingyun-date-switcher__bar">
      <view
        class="lingyun-date-switcher__nav"
        :class="{ 'lingyun-date-switcher__nav--disabled': !canPrev }"
        hover-class="lingyun-date-switcher__nav--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        aria-label="上一段"
        @click="onStep(-1)"
      >
        <lingyun-icon type="left" :size="22" color="label" />
      </view>
      <view
        class="lingyun-date-switcher__center"
        hover-class="lingyun-date-switcher__center--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        :aria-label="resolvedPickerTitle"
        @click="onCenter"
      >
        <lingyun-icon
          v-if="showIcon"
          class="lingyun-date-switcher__icon"
          :type="icon"
          :size="17"
          color="secondary"
        />
        <text class="lingyun-date-switcher__label">{{ label }}</text>
      </view>
      <view
        class="lingyun-date-switcher__nav"
        :class="{ 'lingyun-date-switcher__nav--disabled': !canNext }"
        hover-class="lingyun-date-switcher__nav--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        aria-label="下一段"
        @click="onStep(1)"
      >
        <lingyun-icon type="right" :size="22" color="label" />
      </view>
    </view>
    <lingyun-menu
      v-if="modeButtonVisible"
      v-model:show="modeMenuOpen"
      class="lingyun-date-switcher__mode-menu"
      placement="top"
      mask-transparent
      :actions="modeActions"
      @select="onModeSelect"
    >
      <template #trigger="{ toggle }">
        <view
          class="lingyun-date-switcher__mode"
          hover-class="lingyun-date-switcher__mode--hover"
          :hover-start-time="20"
          :hover-stay-time="70"
          role="button"
          :aria-label="`切换模式，当前${modeLabel}`"
          @click="toggle"
        >
          <text class="lingyun-date-switcher__mode-label">{{ modeShortLabel }}</text>
        </view>
      </template>
    </lingyun-menu>
    <lingyun-picker
      v-if="picker"
      ref="pickerRef"
      class="lingyun-date-switcher__picker"
      :model-value="pickerValue"
      :mode="pickerMode"
      :fields="pickerFields"
      :week-starts-on="weekStartsOn"
      :start="pickerStartText"
      :end="pickerEndText"
      :title="resolvedPickerTitle"
      @update:model-value="onPickerValue"
    >
      <template #trigger>
        <view class="lingyun-date-switcher__picker-anchor" />
      </template>
    </lingyun-picker>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type {
  LingyunDateSwitcherChange,
  LingyunDateSwitcherLimit,
  LingyunDateSwitcherMode,
  LingyunDateSwitcherPayload,
  LingyunDateSwitcherRange,
  LingyunDateSwitcherValue,
} from './types'

const DAY_MS = 24 * 60 * 60 * 1000
const DATE_RE = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/
const MODE_LABELS: Record<LingyunDateSwitcherMode, string> = {
  date: '天',
  week: '周',
  month: '月',
  year: '年',
  range: '日期段',
}

function normalizeMode(value: unknown): LingyunDateSwitcherMode {
  return value === 'week' || value === 'month' || value === 'year' || value === 'range' ? value : 'date'
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/** 本地中午构造，避开时区 / 夏令时导致的跨日误差 */
function atNoon(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 12, 0, 0, 0)
}

function parseDate(value: unknown): Date | null {
  const text = String(value == null ? '' : value).trim()
  const match = DATE_RE.exec(text)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = atNoon(year, month, day)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null
  }
  return date
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function startOfWeek(date: Date, startsOn: number): Date {
  const day = date.getDay()
  const offset = (day - startsOn + 7) % 7
  return addDays(date, -offset)
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

function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / DAY_MS)
}

function compareDate(a: Date, b: Date): number {
  const av = a.getFullYear() * 10000 + (a.getMonth() + 1) * 100 + a.getDate()
  const bv = b.getFullYear() * 10000 + (b.getMonth() + 1) * 100 + b.getDate()
  return av - bv
}

/** ISO 8601 周：周一开始，返回值用于 YYYY-WW */
function isoWeekInfo(date: Date): { year: number; week: number } {
  const thursday = atNoon(date.getFullYear(), date.getMonth(), date.getDate())
  const mondayOffset = (thursday.getDay() + 6) % 7
  thursday.setDate(thursday.getDate() - mondayOffset + 3)
  const isoYear = thursday.getFullYear()
  const firstThursday = atNoon(isoYear, 0, 4)
  const firstOffset = (firstThursday.getDay() + 6) % 7
  firstThursday.setDate(firstThursday.getDate() - firstOffset + 3)
  const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * DAY_MS))
  return { year: isoYear, week }
}

function today(): Date {
  const now = new Date()
  return atNoon(now.getFullYear(), now.getMonth(), now.getDate())
}

export default defineComponent({
  name: 'LingyunDateSwitcher',
  emits: ['update:modelValue', 'update:value', 'update:mode', 'mode-change', 'change', 'center'],
  props: {
    /** date 单日 / week 周 / month 月 / range 自定义日期段 */
    mode: {
      type: String as PropType<LingyunDateSwitcherMode>,
      default: 'date',
    },
    modelValue: {
      type: [String, Array] as PropType<LingyunDateSwitcherValue | null | undefined>,
      default: undefined,
    },
    value: {
      type: [String, Array] as PropType<LingyunDateSwitcherValue | null | undefined>,
      default: undefined,
    },
    /** 周起始：1 周一（默认）/ 0 周日 */
    weekStartsOn: {
      type: Number,
      default: 1,
    },
    /** 右侧模式按钮；默认显示，可切换的模式由 modes 控制 */
    showModeSwitch: {
      type: Boolean,
      default: true,
    },
    modes: {
      type: Array as PropType<LingyunDateSwitcherMode[]>,
      default: () => ['date', 'week', 'month', 'year', 'range'],
    },
    /** 快捷范围限制；和 min / max 同时存在时取更严格的一边 */
    limit: {
      type: String as PropType<LingyunDateSwitcherLimit | ''>,
      default: '',
    },
    /** 可选范围，'YYYY-MM-DD'；到达边界后对应按钮禁用 */
    min: {
      type: String,
      default: '',
    },
    max: {
      type: String,
      default: '',
    },
    /** 固定底部（tabbar 同款） */
    fixed: {
      type: Boolean,
      default: true,
    },
    /** 固定底部时预留 Home Indicator */
    safeArea: {
      type: Boolean,
      default: true,
    },
    zIndex: {
      type: [Number, String] as PropType<number | string>,
      default: 900,
    },
    /** 中间图标；空字符串时不显示 */
    icon: {
      type: String,
      default: 'calendar',
    },
    showIcon: {
      type: Boolean,
      default: true,
    },
    /** 点击中间自动打开内置日期选择器；false 时只发 center，由页面自己接 */
    picker: {
      type: Boolean,
      default: true,
    },
    pickerTitle: {
      type: String,
      default: '',
    },
    /** 自定义中间文案；不传按 mode 输出 */
    formatter: {
      type: Function as PropType<(payload: LingyunDateSwitcherPayload) => string>,
      default: null,
    },
  },
  data() {
    return {
      innerMode: this.mode as LingyunDateSwitcherMode,
      modeMenuOpen: false,
    }
  },
  watch: {
    mode(value: LingyunDateSwitcherMode) {
      const next = normalizeMode(value)
      if (next !== this.innerMode) this.innerMode = next
    },
    modeKey() {
      const { start, end } = this.period
      this.$emit('change', this.buildChange(start, end))
    },
  },
  computed: {
    modeKey(): LingyunDateSwitcherMode {
      return normalizeMode(this.innerMode)
    },
    rawValue(): LingyunDateSwitcherValue | null {
      const value = this.modelValue !== undefined ? this.modelValue : this.value
      return value == null ? null : value
    },
    period(): { start: Date; end: Date } {
      const raw = this.rawValue
      if (this.modeKey === 'range') {
        const list = Array.isArray(raw) ? raw : []
        let start = parseDate(list[0]) || today()
        let end = parseDate(list[1]) || start
        if (compareDate(end, start) < 0) {
          const swap = start
          start = end
          end = swap
        }
        return { start, end }
      }
      const anchor = parseDate(raw as string) || today()
      if (this.modeKey === 'week') {
        const start = startOfWeek(anchor, this.weekStartsOn === 0 ? 0 : 1)
        return { start, end: addDays(start, 6) }
      }
      if (this.modeKey === 'month') {
        return { start: startOfMonth(anchor), end: endOfMonth(anchor) }
      }
      if (this.modeKey === 'year') {
        return { start: atNoon(anchor.getFullYear(), 0, 1), end: atNoon(anchor.getFullYear(), 11, 31) }
      }
      return { start: anchor, end: anchor }
    },
    payload(): LingyunDateSwitcherPayload {
      const { start, end } = this.period
      return {
        mode: this.modeKey,
        start: formatDate(start),
        end: formatDate(end),
        value: this.valueOf(start, end),
      }
    },
    label(): string {
      if (this.formatter) return String(this.formatter(this.payload) || '')
      const { start, end } = this.period
      if (this.modeKey === 'month') {
        return `${start.getFullYear()}年${start.getMonth() + 1}月`
      }
      if (this.modeKey === 'year') return `${start.getFullYear()}年`
      if (this.modeKey === 'date') return formatDate(start)
      const sameYear = start.getFullYear() === end.getFullYear()
      const startText = sameYear
        ? `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`
        : formatDate(start)
      const endText =
        sameYear && start.getFullYear() === end.getFullYear()
          ? `${pad2(end.getMonth() + 1)}-${pad2(end.getDate())}`
          : formatDate(end)
      return `${startText} 至 ${endText}`
    },
    prevPeriod(): { start: Date; end: Date } {
      return this.shiftPeriod(-1)
    },
    nextPeriod(): { start: Date; end: Date } {
      return this.shiftPeriod(1)
    },
    limitBounds(): { min: Date | null; max: Date | null } {
      const now = today()
      const startsOn = this.weekStartsOn === 0 ? 0 : 1
      const weekStart = startOfWeek(now, startsOn)
      const weekEnd = addDays(weekStart, 6)
      const monthStart = startOfMonth(now)
      const monthEnd = endOfMonth(now)
      switch (this.limit) {
        case 'past':
          return { min: null, max: now }
        case 'future':
          return { min: now, max: null }
        case 'today':
          return { min: now, max: now }
        case 'beforeToday':
          return { min: null, max: addDays(now, -1) }
        case 'afterToday':
          return { min: addDays(now, 1), max: null }
        case 'thisWeek':
          return { min: weekStart, max: weekEnd }
        case 'beforeThisWeek':
          return { min: null, max: addDays(weekStart, -1) }
        case 'afterThisWeek':
          return { min: addDays(weekEnd, 1), max: null }
        case 'thisMonth':
          return { min: monthStart, max: monthEnd }
        case 'beforeThisMonth':
          return { min: null, max: addDays(monthStart, -1) }
        case 'afterThisMonth':
          return { min: addDays(monthEnd, 1), max: null }
        default:
          return { min: null, max: null }
      }
    },
    minDate(): Date | null {
      const explicit = parseDate(this.min)
      const limit = this.limitBounds.min
      if (!explicit) return limit
      if (!limit) return explicit
      return compareDate(explicit, limit) >= 0 ? explicit : limit
    },
    maxDate(): Date | null {
      const explicit = parseDate(this.max)
      const limit = this.limitBounds.max
      if (!explicit) return limit
      if (!limit) return explicit
      return compareDate(explicit, limit) <= 0 ? explicit : limit
    },
    canPrev(): boolean {
      const next = this.prevPeriod
      const min = this.minDate
      return !min || compareDate(next.start, min) >= 0
    },
    canNext(): boolean {
      const next = this.nextPeriod
      const max = this.maxDate
      return !max || compareDate(next.end, max) <= 0
    },
    pickerMode(): string {
      if (this.modeKey === 'week') return 'week'
      if (this.modeKey === 'range') return 'daterange'
      return 'date'
    },
    pickerFields(): string {
      if (this.modeKey === 'year') return 'year'
      return this.modeKey === 'month' ? 'month' : 'day'
    },
    pickerValue(): string | [string, string] {
      const { start, end } = this.period
      if (this.modeKey === 'range' || this.modeKey === 'week') {
        return [formatDate(start), formatDate(end)]
      }
      if (this.modeKey === 'month') return formatDate(start).slice(0, 7)
      if (this.modeKey === 'year') return String(start.getFullYear())
      return formatDate(start)
    },
    availableModes(): LingyunDateSwitcherMode[] {
      const seen: LingyunDateSwitcherMode[] = []
      ;(this.modes || []).forEach((mode) => {
        const key = normalizeMode(mode)
        if (seen.indexOf(key) < 0) seen.push(key)
      })
      return seen
    },
    modeButtonVisible(): boolean {
      /* showModeSwitch=false 或所有模式都关闭时不渲染 */
      return this.showModeSwitch && this.availableModes.length > 0
    },
    modeLabel(): string {
      return MODE_LABELS[this.modeKey]
    },
    modeShortLabel(): string {
      if (this.modeKey === 'week') return '周'
      if (this.modeKey === 'month') return '月'
      if (this.modeKey === 'year') return '年'
      if (this.modeKey === 'range') return '自'
      return '天'
    },
    modeActions(): { key: string; label: string; selected: boolean }[] {
      return this.availableModes.map((mode) => ({
        key: mode,
        label: MODE_LABELS[mode],
        selected: mode === this.modeKey,
      }))
    },
    pickerStartText(): string {
      return this.minDate ? formatDate(this.minDate) : ''
    },
    pickerEndText(): string {
      return this.maxDate ? formatDate(this.maxDate) : ''
    },
    resolvedPickerTitle(): string {
      if (this.pickerTitle) return this.pickerTitle
      if (this.modeKey === 'week') return '选择一周'
      if (this.modeKey === 'month') return '选择月份'
      if (this.modeKey === 'year') return '选择年份'
      if (this.modeKey === 'range') return '选择日期段'
      return '选择日期'
    },
    rootClass(): Record<string, boolean> {
      return {
        'lingyun-date-switcher--fixed': this.fixed,
        'lingyun-date-switcher--safe': this.fixed && this.safeArea,
      }
    },
    rootStyle(): Record<string, string> {
      return this.fixed ? { zIndex: String(Number(this.zIndex) || 900) } : {}
    },
  },
  methods: {
    buildChange(start: Date, end: Date): LingyunDateSwitcherChange {
      const range = `${formatDate(start)} - ${formatDate(end)}`
      if (this.modeKey === 'week') {
        const info = isoWeekInfo(start)
        const week = `${info.year}-${pad2(info.week)}`
        return { type: 'week', value: week, week, range }
      }
      if (this.modeKey === 'month') {
        const month = `${start.getFullYear()}-${pad2(start.getMonth() + 1)}`
        return { type: 'month', value: month, month, range }
      }
      if (this.modeKey === 'year') {
        const year = String(start.getFullYear())
        return { type: 'year', value: year, year, range }
      }
      if (this.modeKey === 'range') {
        return { type: 'range', value: range, range }
      }
      const date = formatDate(start)
      return { type: 'day', value: date, date, range }
    },
    valueOf(start: Date, end: Date): LingyunDateSwitcherValue {
      if (this.modeKey === 'range') {
        return [formatDate(start), formatDate(end)] as LingyunDateSwitcherRange
      }
      return formatDate(start)
    },
    shiftPeriod(direction: number): { start: Date; end: Date } {
      const { start, end } = this.period
      if (this.modeKey === 'month') {
        const monthStart = atNoon(start.getFullYear(), start.getMonth() + direction, 1)
        return { start: monthStart, end: endOfMonth(monthStart) }
      }
      if (this.modeKey === 'year') {
        const yearStart = atNoon(start.getFullYear() + direction, 0, 1)
        return { start: yearStart, end: atNoon(yearStart.getFullYear(), 11, 31) }
      }
      if (this.modeKey === 'week') {
        const weekStart = addDays(start, direction * 7)
        return { start: weekStart, end: addDays(weekStart, 6) }
      }
      if (this.modeKey === 'range') {
        const length = daysBetween(start, end) + 1
        const nextStart = addDays(start, direction * length)
        return { start: nextStart, end: addDays(nextStart, length - 1) }
      }
      const day = addDays(start, direction)
      return { start: day, end: day }
    },
    onStep(direction: number): void {
      if (direction < 0 ? !this.canPrev : !this.canNext) return
      const next = direction < 0 ? this.prevPeriod : this.nextPeriod
      const value = this.valueOf(next.start, next.end)
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
      this.$emit('change', this.buildChange(next.start, next.end))
    },
    onModeSelect(payload: { key?: string }): void {
      const key = normalizeMode(payload && payload.key)
      if (this.availableModes.indexOf(key) < 0) return
      if (key === this.modeKey) return
      this.innerMode = key
      this.$emit('update:mode', key)
      this.$emit('mode-change', key)
    },
    onCenter(): void {
      const { start, end } = this.period
      this.$emit('center', this.buildChange(start, end))
      if (!this.picker) return
      const picker = this.$refs.pickerRef as { open?: () => void } | undefined
      if (picker && typeof picker.open === 'function') picker.open()
    },
    onPickerValue(value: unknown): void {
      const mode = this.modeKey
      let start: Date | null = null
      let end: Date | null = null
      let nextValue: LingyunDateSwitcherValue

      if (mode === 'range') {
        const list = Array.isArray(value) ? value : []
        start = parseDate(list[0])
        end = parseDate(list[1]) || start
        if (!start || !end) return
        if (compareDate(end, start) < 0) {
          const swap = start
          start = end
          end = swap
        }
        nextValue = [formatDate(start), formatDate(end)] as LingyunDateSwitcherRange
      } else if (mode === 'week') {
        const list = Array.isArray(value) ? value : []
        start = parseDate(list[0]) || parseDate(value as string)
        if (!start) return
        start = startOfWeek(start, this.weekStartsOn === 0 ? 0 : 1)
        end = addDays(start, 6)
        nextValue = formatDate(start)
      } else if (mode === 'month') {
        const text = String(value == null ? '' : value)
        const date = parseDate(`${text}-01`) || parseDate(text)
        if (!date) return
        start = startOfMonth(date)
        end = endOfMonth(date)
        nextValue = formatDate(start)
      } else if (mode === 'year') {
        const year = Number(String(value == null ? '' : value).slice(0, 4))
        if (!Number.isFinite(year)) return
        start = atNoon(year, 0, 1)
        end = atNoon(year, 11, 31)
        nextValue = formatDate(start)
      } else {
        const date = parseDate(value as string)
        if (!date) return
        start = date
        end = date
        nextValue = formatDate(date)
      }

      this.$emit('update:modelValue', nextValue)
      this.$emit('update:value', nextValue)
      this.$emit('change', this.buildChange(start, end))
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-date-switcher {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: 16px 16px 0;
  gap: 8px;
  pointer-events: none;
}

.lingyun-date-switcher--fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
}

.lingyun-date-switcher--safe {
  padding-bottom: 21px;
}

.lingyun-date-switcher__bar {
  pointer-events: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  flex: 1;
  width: auto;
  min-width: 0;
  height: 62px;
  min-height: 62px;
  padding: 4px;
  border-radius: 9999px;
  @include lingyun-glass-control;
}

.lingyun-date-switcher__nav {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.12s ease, background-color 0.12s ease;
}

.lingyun-date-switcher__nav--hover {
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-date-switcher__nav--disabled {
  opacity: 0.35;
  pointer-events: none;
}

.lingyun-date-switcher__center {
  flex: 1;
  min-width: 0;
  height: 54px;
  padding: 0 6px;
  box-sizing: border-box;
  border-radius: 27px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background-color 0.12s ease;
}

.lingyun-date-switcher__center--hover {
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

/* 图标紧跟日期左侧，整体图标 + 文案居中 */
.lingyun-date-switcher__icon {
  flex-shrink: 0;
}

.lingyun-date-switcher__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-date-switcher__mode-menu {
  flex-shrink: 0;
}

.lingyun-date-switcher__mode {
  pointer-events: auto;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s ease, opacity 0.12s ease;
  @include lingyun-glass-control;
}

.lingyun-date-switcher__mode--hover {
  transform: scale(0.96);
  opacity: 0.82;
}

.lingyun-date-switcher__mode-label {
  font-size: 20px;
  font-weight: 600;
  line-height: 24px;
  color: var(--lingyun-label, #{$lingyun-label});
}

/* 隐藏 picker 触发器：弹层通过 root-portal / teleport 挂到页面外 */
.lingyun-date-switcher__picker {
  position: fixed;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.lingyun-date-switcher__picker-anchor {
  width: 0;
  height: 0;
}
</style>
