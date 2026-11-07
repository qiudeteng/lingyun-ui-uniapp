<template>
  <lingyun-text
    class="lingyun-date-text"
    :text="text"
    :type="type"
    :color="color"
    :bold="bold"
    :block="block"
  />
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import LingyunText from '../lingyun-text/lingyun-text.vue'
import {
  formatLingyunDate,
  type LingyunDatePrecision,
} from '../../utils/dateFormat'

/**
 * lingyun-date-text
 * @description 日期显示：今天 / 昨天 / 明天，今年 MM-DD，跨年 YYYY-MM-DD；时间可配置到天 / 时 / 分 / 秒。
 * 字号、颜色、加粗完全复用 lingyun-text，只使用内置字阶，不接收任意数字字号。
 * @see design/DATE_TEXT.md
 *
 * @property {String|Number|Date} value 日期
 * @property {String} precision day / hour / minute / second，默认 day
 * @property {String|Number|Date} now 当前时间，默认 new Date()
 * @property {String} todayText / yesterdayText / tomorrowText 相对文案
 * @property {String} separator 日期与时间的连接符，默认空格
 * @property {String} fallback 解析失败时的文案
 * @property {String} type lingyun-text 字阶：largeTitle / title1 / ... / caption2，默认 body
 * @property {String} color 语义色或 CSS 颜色；空时跟随 type 默认色
 * @property {Boolean} bold 是否加粗
 * @property {Boolean} block 是否块级展示
 */
export default defineComponent({
  name: 'LingyunDateText',
  components: { LingyunText },
  props: {
    value: {
      type: [String, Number, Date] as PropType<string | number | Date | null | undefined>,
      default: undefined,
    },
    precision: {
      type: String as PropType<LingyunDatePrecision>,
      default: 'day',
    },
    now: {
      type: [String, Number, Date] as PropType<string | number | Date | undefined>,
      default: undefined,
    },
    todayText: { type: String, default: '今天' },
    yesterdayText: { type: String, default: '昨天' },
    tomorrowText: { type: String, default: '明天' },
    separator: { type: String, default: ' ' },
    fallback: { type: String, default: '' },
    /** lingyun-text 字阶，默认 body */
    type: { type: String, default: 'body' },
    /** 语义色（label / secondary / tertiary / primary / link / ...）或任意 CSS 颜色 */
    color: { type: String, default: '' },
    bold: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
  },
  computed: {
    text(): string {
      return formatLingyunDate(this.value, {
        precision: this.precision,
        now: this.now,
        todayText: this.todayText,
        yesterdayText: this.yesterdayText,
        tomorrowText: this.tomorrowText,
        separator: this.separator,
        fallback: this.fallback,
      })
    },
  },
})
</script>
