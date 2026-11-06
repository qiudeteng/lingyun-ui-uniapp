export type LingyunDateSwitcherMode = 'date' | 'week' | 'month' | 'year' | 'range'
export type LingyunDateSwitcherRange = [string, string]
export type LingyunDateSwitcherValue = string | LingyunDateSwitcherRange

/** 快捷范围限制；和 min / max 同时存在时取更严格的一边 */
export type LingyunDateSwitcherLimit =
  | 'past'
  | 'future'
  | 'today'
  | 'beforeToday'
  | 'afterToday'
  | 'thisWeek'
  | 'beforeThisWeek'
  | 'afterThisWeek'
  | 'thisMonth'
  | 'beforeThisMonth'
  | 'afterThisMonth'

/** change / center 的返回对象；range 统一为 `YYYY-MM-DD - YYYY-MM-DD` */
export interface LingyunDateSwitcherChange {
  type: 'day' | 'week' | 'month' | 'year' | 'range'
  /** type=day 时存在 */
  date?: string
  /** type=week 时存在，ISO 周：YYYY-WW */
  week?: string
  /** type=month 时存在：YYYY-MM */
  month?: string
  /** type=year 时存在：YYYY */
  year?: string
  /** 所有类型都有：YYYY-MM-DD - YYYY-MM-DD */
  range: string
  /** 统一的选择值：day=date、week=week、month=month、year=year、range=range */
  value: string
}

/** formatter 的入参（内部周期信息） */
export interface LingyunDateSwitcherPayload {
  mode: LingyunDateSwitcherMode
  start: string
  end: string
  value: LingyunDateSwitcherValue
}
