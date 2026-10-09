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
          <view v-if="imageSrc || iconType" class="lingyun-grid-item__icon-wrap" :style="iconWrapStyle">
            <lingyun-image
              v-if="imageSrc"
              :src="imageSrc"
              :size="iconPx"
              :shape="imageShape"
              v-bind="imageRadiusAttr"
              mode="aspectFill"
              :lazy="false"
              :show-error-placeholder="false"
            />
            <lingyun-icon v-else :type="iconType" :size="iconPx" :color="iconColor" />
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
        <view v-if="imageSrc || iconType" class="lingyun-grid-item__icon-wrap" :style="iconWrapStyle">
          <lingyun-image
            v-if="imageSrc"
            :src="imageSrc"
            :size="iconPx"
            :shape="imageShape"
            v-bind="imageRadiusAttr"
            mode="aspectFill"
            :lazy="false"
            :show-error-placeholder="false"
          />
          <lingyun-icon v-else :type="iconType" :size="iconPx" :color="iconColor" />
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
import { resolveLingyunPageUrl } from '@/router/pageNav'
import { openLingyunHostedPage } from '@/router/pageHost'

const DEFAULT_ICON_PX = 28

function parseIconPx(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  const text = String(value ?? '')
    .trim()
    .toLowerCase()
  const matched = /^(\d+(?:\.\d+)?)(px)?$/.exec(text)
  if (!matched) return 0
  const size = Number(matched[1])
  return size > 0 ? size : 0
}

function isImageSource(value: string): boolean {
  if (!value) return false
  if (/^(https?:)?\/\//i.test(value)) return true
  if (value.startsWith('data:image')) return true
  if (value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) return true
  if (value.startsWith('wxfile:') || value.startsWith('cloud://')) return true
  return /\.(png|jpe?g|gif|webp|svg|bmp)(\?|#|$)/i.test(value)
}

type LingyunGridLike = {
  column?: number | string
  square?: boolean
  showBorder?: boolean
  highlight?: boolean
  childList?: unknown[]
  epoch?: number
  borderColor?: string
  iconSize?: number | string
  shape?: string
  radius?: number | string
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
 * @property {String} icon lingyun-icon 名称。写成图片地址时用 lingyun-image
 * @property {String} iconSrc 网络或本地图片，优先于 icon
 * @property {Number|String} iconSize 图标边长，任意像素。空则用宫格上的 iconSize，再空为 28
 * @property {String} shape 图片图标的显示形式，同 lingyun-image。空则用宫格上的 shape，再空为 rounded
 * @property {Number|String} radius 图片图标的圆角，同 lingyun-image。空则用宫格上的 radius，再空则不传给图片
 * @property {String} text
 * @property {String} color 图标色，默认系统蓝
 * @property {String|Number|Boolean} info 角标；true 为圆点
 * @property {String} link 页面路径。有值时点击后跳转
 */
export default defineComponent({
  name: 'LingyunGridItem',
  options: {
    // 去掉宿主后，宽度才能作用在 flex 子项上。否则小程序里格子宽度是 0
    virtualHost: true,
  },
  inject: ['grid'],
  props: {
    index: { type: Number, default: 0 },
    icon: { type: String, default: '' },
    iconSrc: { type: String, default: '' },
    iconSize: { type: [Number, String], default: '' },
    shape: { type: String, default: '' },
    radius: { type: [Number, String], default: '' },
    text: { type: String, default: '' },
    color: { type: String, default: '' },
    link: { type: String, default: '' },
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
      const width = `${100 / this.column}%`
      // 小程序 flex 子项认 flex-basis，只写 width 时主轴宽度会变成 0
      return {
        width,
        flex: `0 0 ${width}`,
      }
    },
    iconPx(): number {
      const own = parseIconPx(this.iconSize)
      if (own > 0) return own
      const grid = asGrid(this.grid)
      const parent = parseIconPx(grid && grid.iconSize)
      return parent > 0 ? parent : DEFAULT_ICON_PX
    },
    iconWrapStyle(): Record<string, string> {
      const size = `${this.iconPx}px`
      return { width: size, height: size }
    },
    imageShape(): string {
      if (this.shape) return this.shape
      const grid = asGrid(this.grid)
      if (grid && grid.shape) return String(grid.shape)
      return 'rounded'
    },
    imageRadius(): string | number | undefined {
      if (this.radius !== '' && this.radius != null) return this.radius
      const grid = asGrid(this.grid)
      const parent = grid ? grid.radius : ''
      if (parent !== '' && parent != null) return parent
      return undefined
    },
    imageRadiusAttr(): Record<string, string | number> {
      const radius = this.imageRadius
      if (radius === '' || radius == null) return {}
      return { radius }
    },
    iconColor(): string {
      return this.color || 'var(--lingyun-system-blue, #0088ff)'
    },
    imageSrc(): string {
      const src = String(this.iconSrc || '').trim()
      if (src) return src
      const icon = String(this.icon || '').trim()
      return isImageSource(icon) ? icon : ''
    },
    iconType(): string {
      if (this.imageSrc) return ''
      return String(this.icon || '').trim()
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
      if (grid && typeof grid.change === 'function') {
        grid.change({
          detail: { index: this.index },
        })
      }
      this.openLink()
    },
    openLink() {
      const raw = String(this.link || '').trim()
      if (!raw) return
      const next = resolveLingyunPageUrl(raw)
      if (!next) return
      if (openLingyunHostedPage(next, raw)) return
      uni.navigateTo({
        url: next,
        fail: () => {
          uni.redirectTo({ url: next })
        },
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
