/** 与内置 calendar.js 对应的类型。算法文件保持原实现。 */
export type SolarLunarInfo = {
  Term?: string
  IDayCn?: string
  IMonthCn?: string
}

declare const calendar: {
  solar2lunar(y: number, m: number, d: number): SolarLunarInfo | -1
}

export default calendar
