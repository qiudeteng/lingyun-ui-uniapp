<template>
  <view class="lingyun-row" :style="rowStyle">
    <slot />
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { watchLayoutWidth } from './layout'

const JUSTIFY: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
}

const ALIGN: Record<string, string> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
}

/**
 * lingyun-row
 * 24 分栏的行。子项用 lingyun-col。参数对齐 Element Plus Layout 的 Row。
 * @property {Number} gutter 列间距，像素。左右各分一半
 * @property {String} justify start / center / end / space-between / space-around / space-evenly
 * @property {String} align top / middle / bottom。空则拉伸
 */
export default defineComponent({
  name: 'LingyunRow',
  options: {
    virtualHost: true,
  },
  props: {
    gutter: { type: Number, default: 0 },
    justify: { type: String, default: 'start' },
    align: { type: String, default: '' },
  },
  computed: {
    rowStyle(): Record<string, string> {
      const style: Record<string, string> = {
        justifyContent: JUSTIFY[this.justify] || 'flex-start',
      }
      const align = ALIGN[this.align]
      if (align) style.alignItems = align
      const gutter = Number(this.gutter)
      if (Number.isFinite(gutter) && gutter > 0) {
        const half = `${gutter / 2}px`
        style.marginLeft = `-${half}`
        style.marginRight = `-${half}`
      }
      return style
    },
  },
  created() {
    watchLayoutWidth()
  },
  provide() {
    return { lingyunRow: this }
  },
})
</script>

<style lang="scss">
.lingyun-row {
  display: flex;
  flex-wrap: wrap;
  box-sizing: border-box;
  width: 100%;
}
</style>
