<template>
  <view class="lingyun-grid" :class="{ 'lingyun-grid--border': showBorder }">
    <slot />
  </view>
</template>

<script>
/**
 * lingyun-grid
 * @description 宫格。结构对齐 uni-grid：column / square / showBorder / highlight，点击回传 index。
 * 视觉是内容层分组卡片（圆角 26、Grouped Secondary），禁止灰表格线和玻璃格子。
 * @see design/GRID.md
 *
 * @property {Number} column 列数，默认 3
 * @property {Boolean} square 格子为正方形，默认 true
 * @property {Boolean} showBorder 格子之间的分割线，默认 false
 * @property {String} borderColor 分割线颜色，空则用系统 Separator
 * @property {Boolean} highlight 按下高亮，默认 true
 * @event change { detail: { index } }
 */
export default {
  name: 'LingyunGrid',
  emits: ['change'],
  props: {
    column: { type: Number, default: 3 },
    square: { type: Boolean, default: true },
    showBorder: { type: Boolean, default: false },
    borderColor: { type: String, default: '' },
    highlight: { type: Boolean, default: true },
  },
  provide() {
    return { grid: this }
  },
  data() {
    return {
      childList: [],
      epoch: 0,
    }
  },
  watch: {
    column() {
      this.epoch += 1
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.epoch += 1
    })
  },
  methods: {
    register(child) {
      if (this.childList.indexOf(child) < 0) this.childList.push(child)
    },
    unregister(child) {
      const index = this.childList.indexOf(child)
      if (index >= 0) this.childList.splice(index, 1)
      this.epoch += 1
    },
    change(event) {
      this.$emit('change', event)
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 26px;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}
</style>
