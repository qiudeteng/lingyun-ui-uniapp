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

<script setup lang="ts">
import { computed, getCurrentInstance, inject, onBeforeUnmount } from 'vue'
import type { PropType } from 'vue'
import { openLingyunHostedPage, resolveLingyunPageUrl } from '../../utils/pageNavAdapter'

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
defineOptions({
  name: 'LingyunGridItem',
})

const props = defineProps({
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
})

const gridContext = inject('grid')

const instance = getCurrentInstance()

const column = computed((): number => {
  const grid = asGrid(gridContext)
  const count = Number(grid && grid.column) || 3
  return count > 0 ? count : 3
})

const square = computed((): boolean => {
  const grid = asGrid(gridContext)
  return !grid || grid.square !== false
})

const showBorder = computed((): boolean => {
  const grid = asGrid(gridContext)
  return !!(grid && grid.showBorder)
})

const highlight = computed((): boolean => {
  const grid = asGrid(gridContext)
  return !grid || grid.highlight !== false
})

const order = computed((): number => {
  const grid = asGrid(gridContext)
  const list: unknown[] = (grid && grid.childList) || []
  const epoch = grid ? grid.epoch : 0
  void epoch
  const found = list.indexOf(instance?.proxy)
  return found >= 0 ? found : 0
})

const count = computed((): number => {
  const grid = asGrid(gridContext)
  const list: unknown[] = (grid && grid.childList) || []
  const epoch = grid ? grid.epoch : 0
  void epoch
  return list.length
})

/*
 * 格子宽度不再写在这里：小程序上组件宿主是真实节点，百分比相对宿主会塌成 0。
 * 列宽由 lingyun-grid 的 CSS Grid 容器决定，这里只负责填满宿主。
 */
const cellStyle = computed((): Record<string, string> => {
  return { width: '100%' }
})

const iconPx = computed((): number => {
  const own = parseIconPx(props.iconSize)
  if (own > 0) return own
  const grid = asGrid(gridContext)
  const parent = parseIconPx(grid && grid.iconSize)
  return parent > 0 ? parent : DEFAULT_ICON_PX
})

const iconWrapStyle = computed((): Record<string, string> => {
  const size = `${iconPx.value}px`
  return { width: size, height: size }
})

const imageShape = computed((): string => {
  if (props.shape) return props.shape
  const grid = asGrid(gridContext)
  if (grid && grid.shape) return String(grid.shape)
  return 'rounded'
})

const imageRadius = computed((): string | number | undefined => {
  if (props.radius !== '' && props.radius != null) return props.radius
  const grid = asGrid(gridContext)
  const parent = grid ? grid.radius : ''
  if (parent !== '' && parent != null) return parent
  return undefined
})

const imageRadiusAttr = computed((): Record<string, string | number> => {
  const radius = imageRadius.value
  if (radius === '' || radius == null) return {}
  return { radius }
})

const iconColor = computed((): string => {
  return props.color || 'var(--lingyun-system-blue, #0088ff)'
})

const imageSrc = computed((): string => {
  const src = String(props.iconSrc || '').trim()
  if (src) return src
  const icon = String(props.icon || '').trim()
  return isImageSource(icon) ? icon : ''
})

const iconType = computed((): string => {
  if (imageSrc.value) return ''
  return String(props.icon || '').trim()
})

const badgeRaw = computed((): string | number => {
  if (props.info === true || props.info === 'dot') return 'dot'
  if (typeof props.info === 'number') return props.info
  if (typeof props.info === 'string' && props.info) return props.info
  return ''
})

const hasBadge = computed((): boolean => {
  return badgeRaw.value !== ''
})

const badgeDot = computed((): boolean => {
  return badgeRaw.value === 'dot'
})

const badgeText = computed((): string | number => {
  return badgeDot.value ? '' : badgeRaw.value
})

const boxClass = computed(() => {
  if (!showBorder.value) return ''
  const col = column.value
  const orderValue = order.value
  const countValue = count.value
  const lastCol = (orderValue + 1) % col === 0
  const remainder = countValue % col
  const lastRowStart = remainder === 0 ? Math.max(0, countValue - col) : countValue - remainder
  const lastRow = countValue > 0 && orderValue >= lastRowStart
  return [
    'lingyun-grid-item__box--border',
    lastCol ? 'lingyun-grid-item__box--edge-right' : '',
    lastRow ? 'lingyun-grid-item__box--edge-bottom' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const borderStyle = computed((): Record<string, string> => {
  const grid = asGrid(gridContext)
  const color = grid && grid.borderColor
  if (!showBorder.value || !color) return {}
  return {
    borderRightColor: color,
    borderBottomColor: color,
  }
})

function openLink(): void {
  const raw = String(props.link || '').trim()
  if (!raw) return
  if (openLingyunHostedPage(raw, raw)) return
  const next = resolveLingyunPageUrl(raw)
  if (!next) return
  if (openLingyunHostedPage(next, raw)) return
  uni.navigateTo({
    url: next,
    fail: () => {
      uni.redirectTo({ url: next })
    },
  })
}

function onClick(): void {
  const grid = asGrid(gridContext)
  if (grid && typeof grid.change === 'function') {
    grid.change({
      detail: { index: props.index },
    })
  }
  openLink()
}

const gridInstance = asGrid(gridContext)
if (gridInstance && typeof gridInstance.register === 'function') {
  gridInstance.register(instance?.proxy)
}

onBeforeUnmount(() => {
  const grid = asGrid(gridContext)
  if (grid && typeof grid.unregister === 'function') grid.unregister(instance?.proxy)
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
