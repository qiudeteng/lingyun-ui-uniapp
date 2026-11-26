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


<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, watch } from 'vue'
import { provide, type PropType } from 'vue'
import type { LingyunGridItemInput } from './types'

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
 * @property {Number|String} radius 图片图标的圆角，同 lingyun-image：none / sm / md / lg / xl / 2xl 或像素。空则不传，用图片默认值
 * @property {Array} items 有数据时按数组生成格子。不传或空数组仍用默认插槽
 * @event change { detail: { index } }
 */
defineOptions({
  name: 'LingyunGrid',
  // 去掉小程序宿主。否则宿主默认 inline，内部 width:100% 算出来是 0
  virtualHost: true,
})

const props = defineProps({
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
  /** 图片图标的 radius。有值才传给 lingyun-image；空则用图片自己的默认圆角 */
  radius: { type: [Number, String], default: '' },
  /**
   * 有格子数据时自动生成。不传或空数组仍用默认插槽。
   * 小程序未传的 Array 属性会变成 []，不能单凭「是不是数组」判断。
   */
  items: {
    type: Array as PropType<LingyunGridItemInput[] | null>,
    default: undefined,
  },
})

const emit = defineEmits(['change'])

const gridState = reactive({
  childList: [] as object[],
  epoch: 0,
  get column(): number {
    return props.column
  },
  get square(): boolean {
    return props.square
  },
  get showBorder(): boolean {
    return props.showBorder
  },
  get highlight(): boolean {
    return props.highlight
  },
  get iconSize(): number | string {
    return props.iconSize
  },
  get shape(): string {
    return props.shape
  },
  get radius(): number | string {
    return props.radius
  },
  get borderColor(): string {
    return props.borderColor
  },
  register(child: object) {
    if (this.childList.indexOf(child) < 0) this.childList.push(child)
  },
  unregister(child: object) {
    const index = this.childList.indexOf(child)
    if (index >= 0) this.childList.splice(index, 1)
    this.epoch += 1
  },
  change(event: { detail?: { index?: number } }) {
    emit('change', event)
  },
})

provide('grid', gridState)

const useItems = computed((): boolean => {
  return Array.isArray(props.items) && props.items.length > 0
})

const itemList = computed((): LingyunGridItemInput[] => {
  return Array.isArray(props.items) ? props.items : []
})

const gridStyle = computed((): Record<string, string> => {
  const bg = String(props.background || '').trim()
  if (!bg) return {}
  return { backgroundColor: bg }
})

watch(
  (): number => props.column,
  () => {
    gridState.epoch += 1
  },
)

onMounted(() => {
  nextTick(() => {
    gridState.epoch += 1
  })
})

function itemKey(item: LingyunGridItemInput, index: number): string {
  return `${index}-${item.link || ''}-${item.iconSrc || item.icon || ''}-${item.text || ''}`
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
  border-radius: var(--lingyun-grid-radius, 26px);
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}
</style>
