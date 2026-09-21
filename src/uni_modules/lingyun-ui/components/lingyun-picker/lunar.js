/**
 * 农历文案（复用 uni-calendar 的 calendar.js）
 * 初一显示月份名；有节气时优先节气
 */
import calendar from '../../../uni-calendar/components/uni-calendar/calendar.js'

export function lunarDayText(y, m, d) {
  try {
    const info = calendar.solar2lunar(y, m, d)
    if (!info || info === -1) return ''
    if (info.Term) return String(info.Term)
    if (info.IDayCn === '初一') return String(info.IMonthCn || '')
    return String(info.IDayCn || '')
  } catch {
    return ''
  }
}
