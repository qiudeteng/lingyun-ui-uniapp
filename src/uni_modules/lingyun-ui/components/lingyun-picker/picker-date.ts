export type Ymd = { y: number; m: number; d: number }
export type Hm = { h: number; mi: number }
export type YmdHm = Ymd & Hm
export type YmdRange = { start: Ymd; end: Ymd }

export type CalCell = { y: number; m: number; d: number; out: boolean }

export type PickerMark = {
  date?: string
  badge?: string
  badgeText?: string
  dot?: boolean | string
}

export function pad2(n: unknown): string {
  const v = Number(n) || 0
  return v < 10 ? `0${v}` : String(v)
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/** 相邻月（delta = ±1），用于天视图补齐首尾空位 */
export function shiftMonthYm(y: number, m: number, delta: number): { y: number; m: number } {
  const idx = y * 12 + (m - 1) + delta
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 }
}

export function parseYmd(str: unknown): Ymd | null {
  const m = String(str || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (!m) return null
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) }
}

export function parseYm(str: unknown): Ymd | null {
  const m = String(str || '').match(/^(\d{4})-(\d{1,2})$/)
  if (!m) return null
  return { y: Number(m[1]), m: Number(m[2]), d: 1 }
}

export function parseYOnly(str: unknown): Ymd | null {
  const m = String(str || '').match(/^(\d{4})$/)
  if (!m) return null
  return { y: Number(m[1]), m: 1, d: 1 }
}

export function parseHm(str: unknown): Hm | null {
  const m = String(str || '').match(/(?:^|\s)(\d{1,2}):(\d{1,2})\s*$/)
  if (!m) return null
  return { h: Number(m[1]), mi: Number(m[2]) }
}

export function parseYmdHm(str: unknown): YmdHm | null {
  const ymd = parseYmd(str)
  const hm = parseHm(str)
  if (!ymd) return null
  return {
    y: ymd.y,
    m: ymd.m,
    d: ymd.d,
    h: hm ? hm.h : 0,
    mi: hm ? hm.mi : 0,
  }
}

export function ymdKey(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`
}

export function compareYmd(a: Ymd, b: Ymd): number {
  if (a.y !== b.y) return a.y - b.y
  if (a.m !== b.m) return a.m - b.m
  return a.d - b.d
}

/** 解析区间：数组 [start,end] 或字符串 `YYYY-MM-DD ~ YYYY-MM-DD` */
export function parseDateRange(val: unknown): YmdRange | null {
  if (val == null || val === '') return null
  if (Array.isArray(val)) {
    const a = parseYmd(val[0])
    if (!a) return null
    const b = parseYmd(val[1] != null && val[1] !== '' ? val[1] : val[0]) || a
    return compareYmd(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a }
  }
  const str = String(val).trim()
  const parts = str.split(/\s*(?:~|～|—|–|,|→)\s*/)
  if (parts.length >= 2) {
    const a = parseYmd(parts[0])
    const b = parseYmd(parts[1])
    if (a && b) return compareYmd(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a }
  }
  const single = parseYmd(str)
  if (single) return { start: single, end: single }
  return null
}

export function sameYmd(a: Ymd | null | undefined, b: Ymd | null | undefined): boolean {
  if (!a || !b) return false
  return a.y === b.y && a.m === b.m && a.d === b.d
}

/** 含某日的一周起止；weekStartsOn: 0=周日 … 6=周六（对齐日历表头） */
export function weekBoundsForDay(y: number, m: number, d: number, weekStartsOn = 0): YmdRange {
  const startOn = ((Number(weekStartsOn) % 7) + 7) % 7
  const date = new Date(y, m - 1, d)
  const dow = date.getDay()
  const diff = (dow - startOn + 7) % 7
  const startDate = new Date(y, m - 1, d - diff)
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6)
  return {
    start: {
      y: startDate.getFullYear(),
      m: startDate.getMonth() + 1,
      d: startDate.getDate(),
    },
    end: {
      y: endDate.getFullYear(),
      m: endDate.getMonth() + 1,
      d: endDate.getDate(),
    },
  }
}

export function formatHour12(h24: number): { h12: number; isPm: boolean } {
  const h = ((Number(h24) % 24) + 24) % 24
  const isPm = h >= 12
  let h12 = h % 12
  if (h12 === 0) h12 = 12
  return { h12, isPm }
}

export function toH24(h12: number, isPm: boolean): number {
  let h = Number(h12) || 12
  if (h === 12) h = 0
  return isPm ? h + 12 : h
}
