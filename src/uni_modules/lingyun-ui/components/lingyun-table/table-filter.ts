/** lingyun-table 与 lingyun-table-filter 共用的筛选类型、条件匹配和文案 */

import { LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH } from '../lingyun-toolbars/getLingyunNavSafeInset'

/** 窄屏用 Sheet，宽屏（与 Sheet 的 iPad 卡片同一分界）用贴着筛选图标弹出的菜单 */
export function isWideFilterLayout(): boolean {
  try {
    const info = uni.getWindowInfo()
    return (info && info.windowWidth ? info.windowWidth : 375) >= LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH
  } catch {
    return false
  }
}

/** 视口坐标的矩形，给弹出菜单定位 */
export interface LingyunTableFilterAnchor {
  left: number
  top: number
  width: number
  height: number
}

export type LingyunTableFilterType = 'select' | 'number' | 'text' | 'date'

export type LingyunTableFilterOp =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'contains'
  | 'notContains'
  | 'startsWith'

export interface LingyunTableFilterOption {
  text: string
  value: string | number
  /** 本地模式下自动算出的条数；remote 时没有 */
  count?: number
}

/** 数字、文本、日期列的条件。日期为 YYYY-MM-DD；介于时 value 为下限、value2 为上限 */
export interface LingyunTableFilterCondition {
  op: LingyunTableFilterOp
  value: string
  value2?: string
}

/** 筛选面板点 ✓ 的结果。values 为空、condition 为 null 表示这一列不筛选 */
export interface LingyunTableFilterResult {
  values: string[]
  condition: LingyunTableFilterCondition | null
  sortOrder: 'asc' | 'desc' | ''
}

export interface LingyunTableFilterOpItem {
  key: LingyunTableFilterOp
  text: string
  /** 标签栏里的简写 */
  mark: string
}

const NUMBER_OPS: LingyunTableFilterOpItem[] = [
  { key: 'eq', text: '等于', mark: '=' },
  { key: 'ne', text: '不等于', mark: '≠' },
  { key: 'gt', text: '大于', mark: '>' },
  { key: 'gte', text: '大于等于', mark: '≥' },
  { key: 'lt', text: '小于', mark: '<' },
  { key: 'lte', text: '小于等于', mark: '≤' },
  { key: 'between', text: '介于', mark: '' },
]

const TEXT_OPS: LingyunTableFilterOpItem[] = [
  { key: 'contains', text: '包含', mark: '包含' },
  { key: 'notContains', text: '不包含', mark: '不含' },
  { key: 'eq', text: '等于', mark: '=' },
  { key: 'startsWith', text: '开头是', mark: '开头' },
]

const DATE_OPS: LingyunTableFilterOpItem[] = [
  { key: 'eq', text: '当天', mark: '=' },
  { key: 'gte', text: '不早于', mark: '≥' },
  { key: 'lte', text: '不晚于', mark: '≤' },
  { key: 'between', text: '介于', mark: '' },
]

export function filterOpsOf(type: LingyunTableFilterType): LingyunTableFilterOpItem[] {
  if (type === 'number') return NUMBER_OPS
  if (type === 'text') return TEXT_OPS
  if (type === 'date') return DATE_OPS
  return []
}

export function defaultFilterOp(type: LingyunTableFilterType): LingyunTableFilterOp {
  if (type === 'text') return 'contains'
  if (type === 'date') return 'between'
  return 'eq'
}

/** 数字列：去掉千分位逗号。不是数字时为 NaN */
export function toFilterNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN
  if (value == null) return NaN
  const text = String(value).replace(/,/g, '').trim()
  if (!text) return NaN
  const n = Number(text)
  return Number.isFinite(n) ? n : NaN
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/** 日期列统一成 YYYY-MM-DD 再比较。时间戳按本地时区取日 */
export function toDateKey(value: unknown): string {
  if (value == null || value === '') return ''
  if (value instanceof Date || typeof value === 'number') {
    const d = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
  }
  const m = /^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/.exec(String(value).trim())
  if (!m) return ''
  return `${m[1]}-${pad2(Number(m[2]))}-${pad2(Number(m[3]))}`
}

/** 条件填完整才可确定；返回整理后的条件（去空格、介于时上下限填反了自动对调） */
export function normalizeFilterCondition(
  type: LingyunTableFilterType,
  cond: LingyunTableFilterCondition | null | undefined,
): LingyunTableFilterCondition | null {
  if (!cond || !cond.op) return null
  const ops = filterOpsOf(type)
  if (!ops.some((item) => item.key === cond.op)) return null
  const value = String(cond.value ?? '').trim()
  const value2 = String(cond.value2 ?? '').trim()
  if (type === 'text') return value ? { op: cond.op, value } : null
  if (type === 'number') {
    const a = toFilterNumber(value)
    if (Number.isNaN(a)) return null
    if (cond.op !== 'between') return { op: cond.op, value: String(a) }
    const b = toFilterNumber(value2)
    if (Number.isNaN(b)) return null
    return a <= b ? { op: 'between', value: String(a), value2: String(b) } : { op: 'between', value: String(b), value2: String(a) }
  }
  if (type === 'date') {
    const a = toDateKey(value)
    if (!a) return null
    if (cond.op !== 'between') return { op: cond.op, value: a }
    const b = toDateKey(value2)
    if (!b) return null
    return a <= b ? { op: 'between', value: a, value2: b } : { op: 'between', value: b, value2: a }
  }
  return null
}

function compareOp(op: LingyunTableFilterOp, cell: number | string, a: number | string, b: number | string): boolean {
  switch (op) {
    case 'eq':
      return cell === a
    case 'ne':
      return cell !== a
    case 'gt':
      return cell > a
    case 'gte':
      return cell >= a
    case 'lt':
      return cell < a
    case 'lte':
      return cell <= a
    case 'between':
      return cell >= a && cell <= b
    default:
      return true
  }
}

/** 条件已经过 normalizeFilterCondition。空单元格只在「不等于 / 不包含」时算命中 */
export function makeFilterTest(type: LingyunTableFilterType, cond: LingyunTableFilterCondition): (cell: unknown) => boolean {
  if (type === 'number') {
    const a = Number(cond.value)
    const b = Number(cond.value2)
    return (cell) => {
      const n = toFilterNumber(cell)
      if (Number.isNaN(n)) return cond.op === 'ne'
      return compareOp(cond.op, n, a, b)
    }
  }
  if (type === 'date') {
    const a = cond.value
    const b = cond.value2 || ''
    return (cell) => {
      const key = toDateKey(cell)
      if (!key) return false
      return compareOp(cond.op, key, a, b)
    }
  }
  const needle = cond.value.toLowerCase()
  return (cell) => {
    const text = cell == null ? '' : String(cell).toLowerCase()
    if (cond.op === 'contains') return text.indexOf(needle) >= 0
    if (cond.op === 'notContains') return text.indexOf(needle) < 0
    if (cond.op === 'startsWith') return text.indexOf(needle) === 0
    if (cond.op === 'eq') return text === needle
    return true
  }
}

/** 标签栏里条件的简写，如「> 5」「5 ~ 10」「包含 "辣"」 */
export function filterConditionLabel(type: LingyunTableFilterType, cond: LingyunTableFilterCondition): string {
  if (cond.op === 'between') return `${cond.value} ~ ${cond.value2 ?? ''}`
  const item = filterOpsOf(type).find((op) => op.key === cond.op)
  const mark = item ? item.mark : ''
  if (type === 'text') return `${mark} "${cond.value}"`
  return `${mark} ${cond.value}`
}
