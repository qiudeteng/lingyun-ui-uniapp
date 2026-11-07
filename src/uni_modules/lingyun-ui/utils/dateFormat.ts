/**
 * 日期显示格式化：今天 / 昨天 / 明天，同一年 MM-DD，跨年 YYYY-MM-DD。
 * 时间按 precision 截断到天 / 时 / 分 / 秒；纯展示用，不依赖业务时区。
 */

export type LingyunDatePrecision = 'day' | 'hour' | 'minute' | 'second'

export interface LingyunDateFormatOptions {
  /** 显示到哪一级，默认到天 */
  precision?: LingyunDatePrecision
  /** 当前时间，默认 new Date()；测试或跨天固定展示时传入 */
  now?: Date | string | number
  todayText?: string
  yesterdayText?: string
  tomorrowText?: string
  /** 日期和时间的连接符，默认空格 */
  separator?: string
  /** 解析失败时的文案，默认空串 */
  fallback?: string
}

const DAY_MS = 24 * 60 * 60 * 1000

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function validDate(date: Date | null): Date | null {
  return date && !Number.isNaN(date.getTime()) ? date : null
}

/**
 * 解析常见日期：
 * - Date / 毫秒时间戳（10 位按秒处理）
 * - YYYY-MM-DD、YYYY/MM/DD、YYYY.MM.DD
 * - 上述格式加 HH:mm（可带 :ss / 毫秒），日期与时间用空格或 T 分隔
 * - 其它 ISO / Date.parse 可识别的字符串
 * 纯日期按本地时间创建，避免 `new Date('YYYY-MM-DD')` 按 UTC 解析导致跨天。
 */
export function parseLingyunDate(value: unknown): Date | null {
  if (value instanceof Date) return validDate(value)
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null
    const ms = Math.abs(value) < 1e11 ? value * 1000 : value
    return validDate(new Date(ms))
  }
  if (typeof value === 'string') {
    const raw = value.trim()
    if (!raw) return null
    const match = raw.match(
      /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.(\d{1,3}))?)?$/,
    )
    if (match) {
      const date = new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        Number(match[4] || 0),
        Number(match[5] || 0),
        Number(match[6] || 0),
        Number((`${match[7] || ''}000`).slice(0, 3)),
      )
      return validDate(date)
    }
    return validDate(new Date(raw))
  }
  return null
}

function normalizePrecision(value: unknown): LingyunDatePrecision {
  return value === 'hour' || value === 'minute' || value === 'second' ? value : 'day'
}

/**
 * 日期展示：
 * - 今天 / 昨天 / 明天：显示相对文案，含时间时如「今天 14:30」
 * - 今年其它日期：MM-DD，含时间时如「11-06 14:30」
 * - 跨年：YYYY-MM-DD，含时间时如「2025-11-06 14:30」
 */
export function formatLingyunDate(
  value: unknown,
  options: LingyunDateFormatOptions = {},
): string {
  const date = parseLingyunDate(value)
  if (!date) return options.fallback != null ? options.fallback : ''
  const now = parseLingyunDate(options.now) || new Date()
  const precision = normalizePrecision(options.precision)

  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()

  const timeParts: string[] = []
  if (precision !== 'day') timeParts.push(pad2(hours))
  if (precision === 'minute' || precision === 'second') timeParts.push(pad2(minutes))
  if (precision === 'second') timeParts.push(pad2(seconds))
  const time = timeParts.join(':')

  const nowDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDay = Date.UTC(year, month, day)
  const diff = Math.round((targetDay - nowDay) / DAY_MS)

  let dateLabel = ''
  if (diff === 0) {
    dateLabel = options.todayText != null ? options.todayText : '今天'
  } else if (diff === -1) {
    dateLabel = options.yesterdayText != null ? options.yesterdayText : '昨天'
  } else if (diff === 1) {
    dateLabel = options.tomorrowText != null ? options.tomorrowText : '明天'
  }
  if (!dateLabel) {
    dateLabel =
      year === now.getFullYear()
        ? `${pad2(month + 1)}-${pad2(day)}`
        : `${year}-${pad2(month + 1)}-${pad2(day)}`
  }

  if (!time) return dateLabel
  const separator = options.separator != null ? options.separator : ' '
  return `${dateLabel}${separator}${time}`
}
