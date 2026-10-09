<template>
  <view class="lingyun-grid" :class="{ 'lingyun-grid--border': showBorder }" :style="gridStyle">
    <block v-if="useItems">
      <lingyun-grid-item
        v-for="(item, index) in itemList"
        :key="itemKey(item, index)"
        :index="index"
        :icon="item.icon || ''"
        :icon-src="item.iconSrc || ''"
        :icon-size="item.iconSize == null ? '' : item.iconSize"
        :shape="item.shape == null ? '' : item.shape"
        :radius="item.radius == null ? '' : item.radius"
        :text="item.text || ''"
        :color="item.color || ''"
        :info="item.info == null ? '' : item.info"
        :link="item.link || ''"
      />
    </block>
    <!-- 小程序上没传 items 也会变成 []，不能用 v-else 把插槽关掉 -->
    <slot v-if="!useItems" />
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export type LingyunGridItemInput = {
  /** lingyun-icon 字形。写成图片地址时按网络图标画 */
  icon?: string
  /** 网络或本地图片。有值时用 lingyun-image，不再用字形 */
  iconSrc?: string
  /** 图标边长，单位 px。不传则用宫格上的 iconSize */
  iconSize?: number | string
  /** 同 lingyun-image 的 shape，原样传给图片 */
  shape?: string
  /** 同 lingyun-image 的 radius，原样传给图片 */
  radius?: number | string
  text?: string
  color?: string
  info?: string | number | boolean
  /** 页面路径。有值时点击后跳转 */
  link?: string
}

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
 * @property {String} background 卡片背景。空为分组白；`transparent` 为透明
 * @property {Number|String} iconSize 图标边长，任意像素。空为 28。格子或 items 里再传则覆盖
 * @property {String} shape 图片图标的显示形式，同 lingyun-image：square / rounded / circle。空为 rounded
 * @property {Number|String} radius 图片图标的圆角，同 lingyun-image：none / sm / md / lg / xl 或像素。空为 sm
 * @property {Array} items 有数据时按数组生成格子。不传或空数组仍用默认插槽
 * @event change { detail: { index } }
 */
export default defineComponent({
  name: 'LingyunGrid',
  options: {
    // 去掉小程序宿主。否则宿主默认 inline，内部 width:100% 算出来是 0
    virtualHost: true,
  },
  emits: ['change'],
  props: {
    column: { type: Number, default: 3 },
    square: { type: Boolean, default: true },
    showBorder: { type: Boolean, default: false },
    borderColor: { type: String, default: '' },
    highlight: { type: Boolean, default: true },
    /** 空字符串保持分组底。可传 `transparent` 或任意 CSS 颜色 */
    background: { type: String, default: '' },
    /** 图标边长，单位 px。空则 28。可传数字或 `40` / `40px` */
    iconSize: { type: [Number, String], default: '' },
    /** 图片图标的 shape，原样传给 lingyun-image。空为 rounded */
    shape: { type: String, default: '' },
    /** 图片图标的 radius，原样传给 lingyun-image。空为 sm */
    radius: { type: [Number, String], default: '' },
    /**
     * 有格子数据时自动生成。不传或空数组仍用默认插槽。
     * 小程序未传的 Array 属性会变成 []，不能单凭「是不是数组」判断。
     */
    items: {
      type: Array as PropType<LingyunGridItemInput[] | null>,
      default: undefined,
    },
  },
  provide() {
    return { grid: this }
  },
  data() {
    return {
      childList: [] as object[],
      epoch: 0,
    }
  },
  computed: {
    useItems(): boolean {
      return Array.isArray(this.items) && this.items.length > 0
    },
    itemList(): LingyunGridItemInput[] {
      return Array.isArray(this.items) ? this.items : []
    },
    gridStyle(): Record<string, string> {
      const bg = String(this.background || '').trim()
      if (!bg) return {}
      return { backgroundColor: bg }
    },
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
    register(child: object) {
      if (this.childList.indexOf(child) < 0) this.childList.push(child)
    },
    unregister(child: object) {
      const index = this.childList.indexOf(child)
      if (index >= 0) this.childList.splice(index, 1)
      this.epoch += 1
    },
    change(event: { detail?: { index?: number } }) {
      this.$emit('change', event)
    },
    itemKey(item: LingyunGridItemInput, index: number): string {
      return `${index}-${item.link || ''}-${item.iconSrc || item.icon || ''}-${item.text || ''}`
    },
  },
})
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
  border-radius: var(--lingyun-grid-radius, 26px);
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}
</style>
