/**
 * 金额显示格式化：按数量级自动使用 万、百万、千万、亿、百亿、千亿、万亿。
 * 只负责数字与单位，不强制货币符号；prefix 可用于加 ¥ 等前缀。
 */

export interface LingyunAmountFormatOptions {
  /** 小数位，默认 2；范围 0–6 */
  decimals?: number
  /** 金额前缀，如 ¥ */
  prefix?: string
  /** 解析失败时的文案，默认空串 */
  fallback?: string
}

interface AmountUnit {
  value: number
  text: string
}

const UNITS: AmountUnit[] = [
  { value: 1e12, text: '万亿' },
  { value: 1e11, text: '千亿' },
  { value: 1e10, text: '百亿' },
  { value: 1e8, text: '亿' },
  { value: 1e7, text: '千万' },
  { value: 1e6, text: '百万' },
  { value: 1e4, text: '万' },
]

/** 解析数字或带千分位的数字字符串 */
export function parseLingyunAmount(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const raw = value.replace(/[,，\s]/g, '')
    if (!raw) return null
    const number = Number(raw)
    return Number.isFinite(number) ? number : null
  }
  return null
}

/**
 * 大额紧凑显示：
 * 12,345 → 1.23万；1,234,567 → 1.23百万；12,345,678 → 1.23千万；
 * 123,456,789 → 1.23亿；12,345,678,901 → 1.23百亿；1.23e11 → 1.23千亿；1.23e12 → 1.23万亿。
 * 小于 1 万时保留原数，不追加单位。
 */
export function formatLingyunAmount(
  value: unknown,
  options: LingyunAmountFormatOptions = {},
): string {
  const amount = parseLingyunAmount(value)
  if (amount == null) {
    return options.fallback != null ? options.fallback : ''
  }
  const decimalsRaw = Number(options.decimals)
  const decimals = Number.isFinite(decimalsRaw)
    ? Math.max(0, Math.min(6, Math.floor(decimalsRaw)))
    : 2
  const abs = Math.abs(amount)
  const unit = UNITS.find((item) => abs >= item.value)
  const scaled = unit ? abs / unit.value : abs
  const sign = amount < 0 ? '-' : ''
  const prefix = options.prefix != null ? options.prefix : ''
  return `${sign}${prefix}${scaled.toFixed(decimals)}${unit ? unit.text : ''}`
}
