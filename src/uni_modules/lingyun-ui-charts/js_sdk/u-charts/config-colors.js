/**
 * lingyun-ui-charts 全局系列色
 * 对齐 design/COLORS.md · Sketch System Accents（默认 Light）
 *
 * 被 config-ucharts.js / config-echarts.js 引用为默认 color。
 * 单图覆盖：`:opts="{ color: chartColorDark }"` 或 `series[].color`。
 */

/** Light：Blue / Green / Yellow / Red / Cyan / Mint / Orange / Purple / Pink */
export const chartColor = [
  '#0088ff',
  '#34c759',
  '#ffcc00',
  '#ff383c',
  '#00c0e8',
  '#00c8b3',
  '#ff8d28',
  '#cb30e0',
  '#ff2d55',
]

/** Dark 对应色，暗黑页可 `:opts="{ color: chartColorDark }"` */
export const chartColorDark = [
  '#0091ff',
  '#30d158',
  '#ffd600',
  '#ff4245',
  '#3cd3fe',
  '#00dac3',
  '#ff9230',
  '#db34f2',
  '#ff375f',
]
