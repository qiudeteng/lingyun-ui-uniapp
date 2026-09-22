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

<script>
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
export default {
  name: 'LingyunGridItem',
  inject: ['grid'],
  props: {
    index: { type: Number, default: 0 },
    icon: { type: String, default: '' },
    text: { type: String, default: '' },
    color: { type: String, default: '' },
    info: { type: [String, Number, Boolean], default: '' },
  },
  computed: {
    column() {
      const count = Number(this.grid && this.grid.column) || 3
      return count > 0 ? count : 3
    },
    square() {
      return !this.grid || this.grid.square !== false
    },
    showBorder() {
      return !!(this.grid && this.grid.showBorder)
    },
    highlight() {
      return !this.grid || this.grid.highlight !== false
    },
    order() {
      const list = (this.grid && this.grid.childList) || []
      const epoch = this.grid ? this.grid.epoch : 0
      void epoch
      const found = list.indexOf(this)
      return found >= 0 ? found : 0
    },
    count() {
      const list = (this.grid && this.grid.childList) || []
      const epoch = this.grid ? this.grid.epoch : 0
      void epoch
      return list.length
    },
    cellStyle() {
      return { width: `${100 / this.column}%` }
    },
    iconColor() {
      return this.color || 'var(--lingyun-system-blue, #0088ff)'
    },
    badgeRaw() {
      if (this.info === true || this.info === 'dot') return 'dot'
      if (this.info === 0 || this.info) return this.info
      return ''
    },
    hasBadge() {
      return this.badgeRaw !== ''
    },
    badgeDot() {
      return this.badgeRaw === 'dot'
    },
    badgeText() {
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
    borderStyle() {
      const color = this.grid && this.grid.borderColor
      if (!this.showBorder || !color) return {}
      return {
        borderRightColor: color,
        borderBottomColor: color,
      }
    },
  },
  created() {
    if (this.grid && typeof this.grid.register === 'function') this.grid.register(this)
  },
  beforeUnmount() {
    if (this.grid && typeof this.grid.unregister === 'function') this.grid.unregister(this)
  },
  methods: {
    onClick() {
      if (!this.grid || typeof this.grid.change !== 'function') return
      this.grid.change({
        detail: { index: this.index },
      })
    },
  },
}
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
