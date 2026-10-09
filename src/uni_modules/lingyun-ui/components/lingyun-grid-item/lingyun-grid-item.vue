<template>
  <view class="lingyun-grid-item" :style="cellStyle">
    <view v-if="square" class="lingyun-grid-item__ratio">
      <view
        class="lingyun-grid-item__box"
        :class="boxClass"
        :style="borderStyle"
        :hover-class="highlight ? 'lingyun-grid-item__box--hover' : ''"
        :hover-start-time="20"
        :hover-stay-time="70"
        @click="onClick"
      >
        <slot>
          <view v-if="icon" class="lingyun-grid-item__icon-wrap">
            <lingyun-icon :type="icon" :size="28" :color="iconColor" />
            <view v-if="hasBadge" class="lingyun-grid-item__badge">
              <lingyun-badge :text="badgeText" :dot="badgeDot" />
            </view>
          </view>
          <text v-if="text" class="lingyun-grid-item__text">{{ text }}</text>
        </slot>
      </view>
    </view>
    <view
      v-else
      class="lingyun-grid-item__box lingyun-grid-item__box--flow"
      :class="boxClass"
      :style="borderStyle"
      :hover-class="highlight ? 'lingyun-grid-item__box--hover' : ''"
      :hover-start-time="20"
      :hover-stay-time="70"
      @click="onClick"
    >
      <slot>
        <view v-if="icon" class="lingyun-grid-item__icon-wrap">
          <lingyun-icon :type="icon" :size="28" :color="iconColor" />
          <view v-if="hasBadge" class="lingyun-grid-item__badge">
            <lingyun-badge :text="badgeText" :dot="badgeDot" />
          </view>
        </view>
        <text v-if="text" class="lingyun-grid-item__text">{{ text }}</text>
      </slot>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

type LingyunGridLike = {
  column?: number | string
  square?: boolean
  showBorder?: boolean
  highlight?: boolean
  childList?: unknown[]
  epoch?: number
  borderColor?: string
  register?: (child: unknown) => void
  unregister?: (child: unknown) => void
  change?: (event: { detail: { index: number } }) => void
}

function asGrid(grid: unknown): LingyunGridLike | null {
  return (grid as LingyunGridLike | null | undefined) || null
}

/**
 * lingyun-grid-item
 * @description 宫格子项。index 会随 lingyun-grid 的 change 回传。
 * 不传默认插槽时，用 icon + text 画快捷入口。
 * @property {Number} index
 * @property {String} icon lingyun-icon 名称
 * @property {String} text
 * @property {String} color 图标色，默认系统蓝
 * @property {String|Number|Boolean} info 角标；true 为圆点
 */
export default defineComponent({
  name: 'LingyunGridItem',
  inject: ['grid'],
  props: {
    index: { type: Number, default: 0 },
    icon: { type: String, default: '' },
    text: { type: String, default: '' },
    color: { type: String, default: '' },
    info: {
      type: [String, Number, Boolean] as PropType<string | number | boolean>,
      default: '',
    },
  },
  computed: {
    column(): number {
      const grid = asGrid(this.grid)
      const count = Number(grid && grid.column) || 3
      return count > 0 ? count : 3
    },
    square(): boolean {
      const grid = asGrid(this.grid)
      return !grid || grid.square !== false
    },
    showBorder(): boolean {
      const grid = asGrid(this.grid)
      return !!(grid && grid.showBorder)
    },
    highlight(): boolean {
      const grid = asGrid(this.grid)
      return !grid || grid.highlight !== false
    },
    order(): number {
      const grid = asGrid(this.grid)
      const list: unknown[] = (grid && grid.childList) || []
      const epoch = grid ? grid.epoch : 0
      void epoch
      const found = list.indexOf(this)
      return found >= 0 ? found : 0
    },
    count(): number {
      const grid = asGrid(this.grid)
      const list: unknown[] = (grid && grid.childList) || []
      const epoch = grid ? grid.epoch : 0
      void epoch
      return list.length
    },
    cellStyle() {
      return { width: `${100 / this.column}%` }
    },
    iconColor(): string {
      return this.color || 'var(--lingyun-system-blue, #0088ff)'
    },
    badgeRaw(): string | number {
      if (this.info === true || this.info === 'dot') return 'dot'
      if (typeof this.info === 'number') return this.info
      if (typeof this.info === 'string' && this.info) return this.info
      return ''
    },
    hasBadge(): boolean {
      return this.badgeRaw !== ''
    },
    badgeDot(): boolean {
      return this.badgeRaw === 'dot'
    },
    badgeText(): string | number {
      return this.badgeDot ? '' : this.badgeRaw
    },
    boxClass() {
      if (!this.showBorder) return ''
      const col = this.column
      const order = this.order
      const count = this.count
      const lastCol = (order + 1) % col === 0
      const remainder = count % col
      const lastRowStart = remainder === 0 ? Math.max(0, count - col) : count - remainder
      const lastRow = count > 0 && order >= lastRowStart
      return [
        'lingyun-grid-item__box--border',
        lastCol ? 'lingyun-grid-item__box--edge-right' : '',
        lastRow ? 'lingyun-grid-item__box--edge-bottom' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    borderStyle(): Record<string, string> {
      const grid = asGrid(this.grid)
      const color = grid && grid.borderColor
      if (!this.showBorder || !color) return {}
      return {
        borderRightColor: color,
        borderBottomColor: color,
      }
    },
  },
  created() {
    const grid = asGrid(this.grid)
    if (grid && typeof grid.register === 'function') grid.register(this)
  },
  beforeUnmount() {
    const grid = asGrid(this.grid)
    if (grid && typeof grid.unregister === 'function') grid.unregister(this)
  },
  methods: {
    onClick() {
      const grid = asGrid(this.grid)
      if (!grid || typeof grid.change !== 'function') return
      grid.change({
        detail: { index: this.index },
      })
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-grid-item {
  box-sizing: border-box;

  &__ratio {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 100%;
  }

  &__box {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 8px 4px;
  }

  &__box--flow {
    position: relative;
    top: auto;
    right: auto;
    bottom: auto;
    left: auto;
    min-height: 88px;
  }

  &__box--border {
    border-right: 1px solid var(--lingyun-separator, #{$lingyun-separator});
    border-bottom: 1px solid var(--lingyun-separator, #{$lingyun-separator});
  }

  &__box--edge-right {
    border-right-width: 0;
  }

  &__box--edge-bottom {
    border-bottom-width: 0;
  }

  &__box--hover {
    background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  }

  &__icon-wrap {
    position: relative;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__badge {
    position: absolute;
    top: -8px;
    right: -14px;
    z-index: 1;
    pointer-events: none;
  }

  &__text {
    display: block;
    max-width: 100%;
    margin-top: 6px;
    padding: 0 4px;
    box-sizing: border-box;
    overflow: hidden;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }
}
</style>
