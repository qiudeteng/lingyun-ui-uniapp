export type LingyunCalendarMode = 'single' | 'range'

export type LingyunCalendarValue = string | string[]

export interface LingyunCalendarMark {
  /** YYYY-MM-DD */
  date: string
  badge?: string
  badgeText?: string
  dot?: boolean | string
}

export interface LingyunCalendarChangePayload {
  value: LingyunCalendarValue
  start: string
  end: string
}

export interface LingyunCalendarMonthPayload {
  year: number
  month: number
  title: string
}
