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

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { type PropType } from 'vue'
import { LINGYUN_APP_PAGE_NAV_INSET } from '../lingyun-app-page/useLingyunAppPageScroll'
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

defineOptions({
  name: 'LingyunDateSwitcher',
})

const props = defineProps({
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
})

const emit = defineEmits(['update:modelValue', 'update:value', 'update:mode', 'mode-change', 'change', 'center'])

/** 宽屏左侧导航占位；固定底部时与 tabbar / 搜索栏一样让开这一列 */
const pageNavInset = inject(LINGYUN_APP_PAGE_NAV_INSET, ref(0))

const innerMode = ref<LingyunDateSwitcherMode>(props.mode as LingyunDateSwitcherMode)
const modeMenuOpen = ref(false)
const pickerRef = ref<unknown>(null)
const modeKey = computed((): LingyunDateSwitcherMode => {
  return normalizeMode(innerMode.value)
})

const rawValue = computed((): LingyunDateSwitcherValue | null => {
  const value = props.modelValue !== undefined ? props.modelValue : props.value
  return value == null ? null : value
})

const period = computed((): { start: Date; end: Date } => {
  const raw = rawValue.value
  if (modeKey.value === 'range') {
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
  if (modeKey.value === 'week') {
    const start = startOfWeek(anchor, props.weekStartsOn === 0 ? 0 : 1)
    return { start, end: addDays(start, 6) }
  }
  if (modeKey.value === 'month') {
    return { start: startOfMonth(anchor), end: endOfMonth(anchor) }
  }
  if (modeKey.value === 'year') {
    return { start: atNoon(anchor.getFullYear(), 0, 1), end: atNoon(anchor.getFullYear(), 11, 31) }
  }
  return { start: anchor, end: anchor }
})

function buildChange(start: Date, end: Date): LingyunDateSwitcherChange {
  const range = `${formatDate(start)} - ${formatDate(end)}`
  if (modeKey.value === 'week') {
    const info = isoWeekInfo(start)
    const week = `${info.year}-${pad2(info.week)}`
    return { type: 'week', value: week, week, range }
  }
  if (modeKey.value === 'month') {
    const month = `${start.getFullYear()}-${pad2(start.getMonth() + 1)}`
    return { type: 'month', value: month, month, range }
  }
  if (modeKey.value === 'year') {
    const year = String(start.getFullYear())
    return { type: 'year', value: year, year, range }
  }
  if (modeKey.value === 'range') {
    return { type: 'range', value: range, range }
  }
  const date = formatDate(start)
  return { type: 'day', value: date, date, range }
}

function valueOf(start: Date, end: Date): LingyunDateSwitcherValue {
  if (modeKey.value === 'range') {
    return [formatDate(start), formatDate(end)] as LingyunDateSwitcherRange
  }
  return formatDate(start)
}

function shiftPeriod(direction: number): { start: Date; end: Date } {
  const { start, end } = period.value
  if (modeKey.value === 'month') {
    const monthStart = atNoon(start.getFullYear(), start.getMonth() + direction, 1)
    return { start: monthStart, end: endOfMonth(monthStart) }
  }
  if (modeKey.value === 'year') {
    const yearStart = atNoon(start.getFullYear() + direction, 0, 1)
    return { start: yearStart, end: atNoon(yearStart.getFullYear(), 11, 31) }
  }
  if (modeKey.value === 'week') {
    const weekStart = addDays(start, direction * 7)
    return { start: weekStart, end: addDays(weekStart, 6) }
  }
  if (modeKey.value === 'range') {
    const length = daysBetween(start, end) + 1
    const nextStart = addDays(start, direction * length)
    return { start: nextStart, end: addDays(nextStart, length - 1) }
  }
  const day = addDays(start, direction)
  return { start: day, end: day }
}

const payload = computed((): LingyunDateSwitcherPayload => {
  const { start, end } = period.value
  return {
    mode: modeKey.value,
    start: formatDate(start),
    end: formatDate(end),
    value: valueOf(start, end),
  }
})

const label = computed((): string => {
  if (props.formatter) return String(props.formatter(payload.value) || '')
  const { start, end } = period.value
  if (modeKey.value === 'month') {
    return `${start.getFullYear()}年${start.getMonth() + 1}月`
  }
  if (modeKey.value === 'year') return `${start.getFullYear()}年`
  if (modeKey.value === 'date') return formatDate(start)
  const sameYear = start.getFullYear() === end.getFullYear()
  const startText = sameYear
    ? `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`
    : formatDate(start)
  const endText =
    sameYear && start.getFullYear() === end.getFullYear()
      ? `${pad2(end.getMonth() + 1)}-${pad2(end.getDate())}`
      : formatDate(end)
  return `${startText} 至 ${endText}`
})

const prevPeriod = computed((): { start: Date; end: Date } => {
  return shiftPeriod(-1)
})

const nextPeriod = computed((): { start: Date; end: Date } => {
  return shiftPeriod(1)
})

const limitBounds = computed((): { min: Date | null; max: Date | null } => {
  const now = today()
  const startsOn = props.weekStartsOn === 0 ? 0 : 1
  const weekStart = startOfWeek(now, startsOn)
  const weekEnd = addDays(weekStart, 6)
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  switch (props.limit) {
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
})

const minDate = computed((): Date | null => {
  const explicit = parseDate(props.min)
  const limit = limitBounds.value.min
  if (!explicit) return limit
  if (!limit) return explicit
  return compareDate(explicit, limit) >= 0 ? explicit : limit
})

const maxDate = computed((): Date | null => {
  const explicit = parseDate(props.max)
  const limit = limitBounds.value.max
  if (!explicit) return limit
  if (!limit) return explicit
  return compareDate(explicit, limit) <= 0 ? explicit : limit
})

const canPrev = computed((): boolean => {
  const next = prevPeriod.value
  const min = minDate.value
  /* 上一段只要和限制区间有交集就允许：从 12 月回包含今天的 11 月不能被挡住 */
  return !min || compareDate(next.end, min) >= 0
})

const canNext = computed((): boolean => {
  const next = nextPeriod.value
  const max = maxDate.value
  /* 下一段只要起点不越过上限就允许：从 10 月回包含今天的 11 月不能被挡住 */
  return !max || compareDate(next.start, max) <= 0
})

const pickerMode = computed((): string => {
  if (modeKey.value === 'week') return 'week'
  if (modeKey.value === 'range') return 'daterange'
  return 'date'
})

const pickerFields = computed((): string => {
  if (modeKey.value === 'year') return 'year'
  return modeKey.value === 'month' ? 'month' : 'day'
})

const pickerValue = computed((): string | [string, string] => {
  const { start, end } = period.value
  if (modeKey.value === 'range' || modeKey.value === 'week') {
    return [formatDate(start), formatDate(end)]
  }
  if (modeKey.value === 'month') return formatDate(start).slice(0, 7)
  if (modeKey.value === 'year') return String(start.getFullYear())
  return formatDate(start)
})

const availableModes = computed((): LingyunDateSwitcherMode[] => {
  const seen: LingyunDateSwitcherMode[] = []
  ;(props.modes || []).forEach((mode) => {
    const key = normalizeMode(mode)
    if (seen.indexOf(key) < 0) seen.push(key)
  })
  return seen
})

const modeButtonVisible = computed((): boolean => {
  /* showModeSwitch=false 或所有模式都关闭时不渲染 */
  return props.showModeSwitch && availableModes.value.length > 0
})

const modeLabel = computed((): string => {
  return MODE_LABELS[modeKey.value]
})

const modeShortLabel = computed((): string => {
  if (modeKey.value === 'week') return '周'
  if (modeKey.value === 'month') return '月'
  if (modeKey.value === 'year') return '年'
  if (modeKey.value === 'range') return '自'
  return '天'
})

const modeActions = computed((): { key: string; label: string; selected: boolean }[] => {
  return availableModes.value.map((mode) => ({
    key: mode,
    label: MODE_LABELS[mode],
    selected: mode === modeKey.value,
  }))
})

const pickerStartText = computed((): string => {
  return minDate.value ? formatDate(minDate.value) : ''
})

const pickerEndText = computed((): string => {
  return maxDate.value ? formatDate(maxDate.value) : ''
})

const resolvedPickerTitle = computed((): string => {
  if (props.pickerTitle) return props.pickerTitle
  if (modeKey.value === 'week') return '选择一周'
  if (modeKey.value === 'month') return '选择月份'
  if (modeKey.value === 'year') return '选择年份'
  if (modeKey.value === 'range') return '选择日期段'
  return '选择日期'
})

const rootClass = computed((): Record<string, boolean> => {
  return {
    'lingyun-date-switcher--fixed': props.fixed,
    'lingyun-date-switcher--safe': props.fixed && props.safeArea,
  }
})

const rootStyle = computed((): Record<string, string> => {
  const style: Record<string, string> = props.fixed
    ? { zIndex: String(Number(props.zIndex) || 900) }
    : {}
  const inset = Math.max(0, Number(pageNavInset.value) || 0)
  if (props.fixed && inset > 0) style.left = `${inset}px`
  return style
})
function onStep(direction: number): void {
  if (direction < 0 ? !canPrev.value : !canNext.value) return
  const next = direction < 0 ? prevPeriod.value : nextPeriod.value
  const value = valueOf(next.start, next.end)
  emit('update:modelValue', value)
  emit('update:value', value)
  emit('change', buildChange(next.start, next.end))
}

function onModeSelect(payload: { key?: string }): void {
  const key = normalizeMode(payload && payload.key)
  if (availableModes.value.indexOf(key) < 0) return
  if (key === modeKey.value) return
  innerMode.value = key
  emit('update:mode', key)
  emit('mode-change', key)
}

function onCenter(): void {
  const { start, end } = period.value
  emit('center', buildChange(start, end))
  if (!props.picker) return
  const picker = pickerRef.value as { open?: () => void } | null
  if (picker && typeof picker.open === 'function') picker.open()
}

function onPickerValue(value: unknown): void {
  const mode = modeKey.value
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
    start = startOfWeek(start, props.weekStartsOn === 0 ? 0 : 1)
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

  emit('update:modelValue', nextValue)
  emit('update:value', nextValue)
  emit('change', buildChange(start, end))
}

watch(
  () => props.mode,
  (value: LingyunDateSwitcherMode) => {
    const next = normalizeMode(value)
    if (next !== innerMode.value) innerMode.value = next
  },
)

watch(modeKey, () => {
  const { start, end } = period.value
  emit('change', buildChange(start, end))
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
