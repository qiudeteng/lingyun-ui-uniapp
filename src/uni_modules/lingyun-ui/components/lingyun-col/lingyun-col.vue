<template>
  <view class="lingyun-col" :style="colStyle">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { type PropType } from 'vue'
import {
  layoutViewport,
  resolveColProp,
  watchLayoutWidth,
  type LingyunColProp,
  type LingyunColSetting,
} from '../lingyun-row/layout'

type LingyunRowContext = { gutter?: number } | null

/**
 * lingyun-col
 * 24 分栏的列。放在 lingyun-row 里。参数对齐 Element Plus Layout 的 Col。
 * 一列最少 0、最多 24。0 不显示。
 * @property {Number} span 占几格，默认 24
 * @property {Number} offset 左侧空出几格
 * @property {Number} push 向右移几格
 * @property {Number} pull 向左移几格
 * @property {Number|Object} xs 宽度小于 768
 * @property {Number|Object} sm ≥ 768
 * @property {Number|Object} md ≥ 992
 * @property {Number|Object} lg ≥ 1200
 * @property {Number|Object} xl ≥ 1920
 */
defineOptions({
  name: 'LingyunCol',
  options: { virtualHost: true },
})

const props = defineProps({
  span: { type: Number, default: 24 },
  offset: { type: Number, default: 0 },
  push: { type: Number, default: 0 },
  pull: { type: Number, default: 0 },
  xs: { type: [Number, Object] as PropType<LingyunColSetting>, default: undefined },
  sm: { type: [Number, Object] as PropType<LingyunColSetting>, default: undefined },
  md: { type: [Number, Object] as PropType<LingyunColSetting>, default: undefined },
  lg: { type: [Number, Object] as PropType<LingyunColSetting>, default: undefined },
  xl: { type: [Number, Object] as PropType<LingyunColSetting>, default: undefined },
})

const lingyunRow = inject<LingyunRowContext>('lingyunRow', null)

const rowGutter = computed((): number => {
  const row = lingyunRow as LingyunRowContext
  const gutter = Number(row && row.gutter)
  return Number.isFinite(gutter) && gutter > 0 ? gutter : 0
})

function propOf(prop: LingyunColProp): number {
  const base = Number(props[prop])
  return resolveColProp(
    layoutViewport.width,
    prop,
    Number.isFinite(base) ? base : prop === 'span' ? 24 : 0,
    props.xs,
    props.sm,
    props.md,
    props.lg,
    props.xl,
  )
}

const colStyle = computed((): Record<string, string> => {
  const span = propOf('span')
  const offset = propOf('offset')
  const push = propOf('push')
  const pull = propOf('pull')
  if (!(span > 0)) return { display: 'none' }
  const basis = `${(span / 24) * 100}%`
  const style: Record<string, string> = {
    width: basis,
    maxWidth: basis,
    flex: `0 0 ${basis}`,
  }
  if (offset > 0) style.marginLeft = `${(offset / 24) * 100}%`
  if (push > 0 || pull > 0) style.position = 'relative'
  if (push > 0) style.left = `${(push / 24) * 100}%`
  if (pull > 0) style.right = `${(pull / 24) * 100}%`
  if (rowGutter.value > 0) {
    const half = `${rowGutter.value / 2}px`
    style.paddingLeft = half
    style.paddingRight = half
  }
  return style
})

watchLayoutWidth()
</script>

<style lang="scss">
.lingyun-col {
  box-sizing: border-box;
  min-width: 0;
}
</style>
