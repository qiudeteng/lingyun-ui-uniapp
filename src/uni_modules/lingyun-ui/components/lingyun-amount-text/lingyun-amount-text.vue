<template>
  <lingyun-text
    class="lingyun-amount-text"
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
import { formatLingyunAmount } from '../../utils/amountFormat'

/**
 * lingyun-amount-text
 * @description 金额显示：自动使用 万 / 百万 / 千万 / 亿 / 百亿 / 千亿 / 万亿，支持小数位。
 * 字号、颜色、加粗完全复用 lingyun-text，只使用内置字阶，不接收任意数字字号。
 * @see design/AMOUNT_TEXT.md
 *
 * @property {Number|String} value 金额，支持带千分位的数字字符串
 * @property {Number} decimals 小数位，默认 2；范围 0–6
 * @property {String} prefix 金额前缀，如 ¥
 * @property {String} fallback 解析失败时的文案
 * @property {String} type lingyun-text 字阶，默认 body
 * @property {String} color 语义色或 CSS 颜色；空时跟随 type 默认色
 * @property {Boolean} bold 是否加粗
 * @property {Boolean} block 是否块级展示
 */
export default defineComponent({
  name: 'LingyunAmountText',
  components: { LingyunText },
  props: {
    value: {
      type: [Number, String] as PropType<number | string | null | undefined>,
      default: undefined,
    },
    /** 小数位，默认 2；范围 0–6 */
    decimals: { type: Number, default: 2 },
    /** 金额前缀，如 ¥ */
    prefix: { type: String, default: '' },
    /** 解析失败时的文案 */
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
      return formatLingyunAmount(this.value, {
        decimals: this.decimals,
        prefix: this.prefix,
        fallback: this.fallback,
      })
    },
  },
})
</script>
