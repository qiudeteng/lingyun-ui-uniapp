<template>
  <view class="lingyun-tabbars" :class="rootClass" :style="wrapStyle">
    <view class="lingyun-tabbars__bar" :id="barId" :class="barClass">
      <view
        class="lingyun-tabbars__indicator"
        :class="indicatorClass"
        :style="indicatorStyle"
      />
      <view
        v-for="item in mainItems"
        :key="item.key"
        :id="itemId(item)"
        class="lingyun-tabbars__item"
        :class="itemClass(item)"
        hover-class="lingyun-tabbars__item--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        @click="onSelect(item)"
      >
        <view class="lingyun-tabbars__icon-wrap">
          <slot :name="`icon-${item.key}`" :item="item" :active="isActive(item)">
            <text class="lingyun-tabbars__icon">{{ item.icon || '●' }}</text>
          </slot>
          <view v-if="hasBadge(item)" class="lingyun-tabbars__badge">
            <lingyun-badge
              :text="badgeText(item)"
              :color="badgeColor(item)"
              :dot="badgeDot(item)"
              :max="badgeMax(item)"
            />
          </view>
        </view>
        <text v-if="item.text" class="lingyun-tabbars__label">{{ item.text }}</text>
      </view>
    </view>

    <view
      v-if="searchItem"
      class="lingyun-tabbars__search"
      :class="{ 'lingyun-tabbars__search--active': isActive(searchItem) }"
      hover-class="lingyun-tabbars__search--hover"
      :hover-start-time="20"
      :hover-stay-time="70"
      @click="onSelect(searchItem)"
    >
      <slot name="search-icon" :item="searchItem" :active="isActive(searchItem)">
        <text v-if="searchItem.icon" class="lingyun-tabbars__search-icon">{{ searchItem.icon }}</text>
        <lingyun-icon
          v-else
          class="lingyun-tabbars__search-icon"
          type="search"
          :size="25"
          :color="isActive(searchItem) ? 'var(--lingyun-system-blue, #0088ff)' : 'var(--lingyun-label-glass, #1a1a1a)'"
        />
      </slot>
    </view>
  </view>
</template>

<script>
/**
 * lingyun-tabbars
 * @description 对齐 Apple iOS 27 UI Kit Tab Bars（Sketch）+ HIG + Liquid Glass
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Tab%2520Bars
 * @see https://developer.apple.com/design/human-interface-guidelines/tab-bars
 * @see design/TABBARS.md
 *
 * @property {Array} items [{ key, text?, icon?, badge?, role?: 'search' }]
 *   badge: number | string | true | { text?, color?, dot?, max? }
 *   角标渲染为 lingyun-badge（Sketch App Icons / Badge）
 * @property {String|Number} modelValue / value 当前选中 key
 * @property {String} variant = [default|prominent] Sketch：Default / Prominent Tab
 * @property {Boolean} safeArea 预留底部 Home Indicator（默认 true）
 * @property {Boolean} fixed 固定底部悬浮（默认 true）
 * @event {Function} change / update:modelValue
 */
export default {
  name: 'LingyunTabbars',
  emits: ['change', 'update:modelValue', 'update:value'],
  data() {
    return {
      instanceId: `lytb-${Math.random().toString(36).slice(2, 8)}`,
      indicator: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        scaleY: 1,
        visible: false,
        ready: false,
      },
    }
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: [String, Number],
      default: undefined,
    },
    value: {
      type: [String, Number],
      default: undefined,
    },
    variant: {
      type: String,
      default: 'default',
    },
    safeArea: {
      type: Boolean,
      default: true,
    },
    fixed: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    current() {
      if (this.modelValue !== undefined && this.modelValue !== null) return this.modelValue
      return this.value
    },
    mainItems() {
      const list = (this.items || []).filter((i) => i && i.role !== 'search')
      /* 带搜索圆钮时最多 4+1；无搜索时 Sketch 最多 5 */
      return this.searchItem ? list.slice(0, 4) : list.slice(0, 5)
    },
    searchItem() {
      return (this.items || []).find((i) => i && i.role === 'search') || null
    },
    resolvedVariant() {
      return this.variant === 'prominent' ? 'prominent' : 'default'
    },
    rootClass() {
      return [
        `lingyun-tabbars--${this.resolvedVariant}`,
        this.fixed ? 'lingyun-tabbars--fixed' : '',
        this.safeArea ? 'lingyun-tabbars--safe' : '',
        this.searchItem ? 'lingyun-tabbars--with-search' : '',
        /* 无搜索 4/5 项，或有搜索的 3+1 / 4+1：iPhone 左侧胶囊占满剩余宽度 */
        (!this.searchItem && this.mainItems.length >= 4) ||
        (this.searchItem && this.mainItems.length >= 3)
          ? 'lingyun-tabbars--fill'
          : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    barClass() {
      return this.resolvedVariant === 'prominent' ? 'lingyun-tabbars__bar--prominent' : ''
    },
    wrapStyle() {
      return {}
    },
    barId() {
      return `${this.instanceId}-bar`
    },
    indicatorClass() {
      return [
        this.indicator.ready ? 'lingyun-tabbars__indicator--ready' : '',
        this.indicator.visible ? '' : 'lingyun-tabbars__indicator--hidden',
      ]
        .filter(Boolean)
        .join(' ')
    },
    indicatorStyle() {
      const { left, top, width, height, scaleY } = this.indicator
      return {
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `scaleY(${scaleY})`,
      }
    },
  },
  watch: {
    current() {
      this.syncIndicator({ liquid: true })
    },
    mainItems() {
      this.syncIndicator({ liquid: false })
    },
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => this.syncIndicator({ liquid: false }), 20)
    })
    /* #ifdef H5 */
    this._onResize = () => this.syncIndicator({ liquid: false })
    window.addEventListener('resize', this._onResize)
    /* #endif */
  },
  beforeUnmount() {
    this.stopLens()
    /* #ifdef H5 */
    if (this._onResize) window.removeEventListener('resize', this._onResize)
    /* #endif */
  },
  methods: {
    itemId(item) {
      return `${this.instanceId}-item-${item && item.key}`
    },
    prefersReducedMotion() {
      /* #ifdef H5 */
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      }
      /* #endif */
      return false
    },
    scheduleFrame(fn) {
      /* #ifdef H5 */
      return window.requestAnimationFrame(fn)
      /* #endif */
      return setTimeout(() => fn(Date.now()), 16)
    },
    cancelFrame(id) {
      if (id == null) return
      /* #ifdef H5 */
      window.cancelAnimationFrame(id)
      return
      /* #endif */
      clearTimeout(id)
    },
    stopLens() {
      this.cancelFrame(this._lensRaf)
      this._lensRaf = null
    },
    stepSpring(state, target, stiffness, damping, dt) {
      const force = (target - state.pos) * stiffness
      const damp = -state.vel * damping
      state.vel += (force + damp) * dt
      state.pos += state.vel * dt
    },
    lensSettled() {
      const near = (state, target) => Math.abs(state.pos - target) < 0.35 && Math.abs(state.vel) < 12
      return near(this._edgeL, this._targetL) && near(this._edgeR, this._targetR)
    },
    paintLens() {
      const left = this._edgeL.pos
      const width = Math.max(this._edgeR.pos - this._edgeL.pos, 8)
      const rest = Math.max(this._targetR - this._targetL, 8)
      const stretch = width / rest
      const scaleY = Math.max(0.72, Math.min(1, 1 / Math.sqrt(Math.max(stretch, 1))))
      this.indicator.left = left
      this.indicator.width = width
      this.indicator.top = this._targetTop
      this.indicator.height = this._targetH
      this.indicator.scaleY = scaleY
    },
    tickLens(now) {
      const last = this._lensLast || now
      const dt = Math.min(0.032, Math.max(0.008, (now - last) / 1000))
      this._lensLast = now
      const toCenter = (this._targetL + this._targetR) / 2
      const curCenter = (this._edgeL.pos + this._edgeR.pos) / 2
      const goingRight = toCenter >= curCenter
      const lead = { k: 420, d: 28 }
      const trail = { k: 155, d: 20 }
      this.stepSpring(this._edgeL, this._targetL, goingRight ? trail.k : lead.k, goingRight ? trail.d : lead.d, dt)
      this.stepSpring(this._edgeR, this._targetR, goingRight ? lead.k : trail.k, goingRight ? lead.d : trail.d, dt)
      this.paintLens()
      if (this.lensSettled()) {
        this._edgeL = { pos: this._targetL, vel: 0 }
        this._edgeR = { pos: this._targetR, vel: 0 }
        this.paintLens()
        this._lensRaf = null
        return
      }
      this._lensRaf = this.scheduleFrame((t) => this.tickLens(t))
    },
    snapLens(rect) {
      this.stopLens()
      this._targetL = rect.left
      this._targetR = rect.left + rect.width
      this._targetTop = rect.top
      this._targetH = rect.height
      this._edgeL = { pos: this._targetL, vel: 0 }
      this._edgeR = { pos: this._targetR, vel: 0 }
      this.paintLens()
    },
    flowLens(rect) {
      if (!this._edgeL || !this._edgeR) {
        this.snapLens(rect)
        return
      }
      this._targetL = rect.left
      this._targetR = rect.left + rect.width
      this._targetTop = rect.top
      this._targetH = rect.height
      this.indicator.visible = true
      if (!this._lensRaf) {
        this._lensLast = 0
        this._lensRaf = this.scheduleFrame((t) => this.tickLens(t))
      }
    },
    syncIndicator(options) {
      const liquid = !!(options && options.liquid)
      const active = (this.mainItems || []).find((item) => this.isActive(item))
      if (!active) {
        this.stopLens()
        this.indicator.visible = false
        return
      }
      this.$nextTick(() => {
        uni
          .createSelectorQuery()
          .in(this)
          .select(`#${this.barId}`)
          .boundingClientRect()
          .select(`#${this.itemId(active)}`)
          .boundingClientRect()
          .exec((res) => {
            const bar = res && res[0]
            const item = res && res[1]
            if (!bar || !item || !item.width) return
            const toRect = {
              left: item.left - bar.left,
              top: item.top - bar.top,
              width: item.width,
              height: item.height,
            }
            const canFlow =
              liquid &&
              this.indicator.ready &&
              this.indicator.visible &&
              this.indicator.width > 0 &&
              !this.prefersReducedMotion()
            this.indicator.visible = true
            if (canFlow) {
              this.flowLens(toRect)
              return
            }
            this.snapLens(toRect)
            if (!this.indicator.ready) {
              this.$nextTick(() => {
                this.indicator.ready = true
              })
            }
          })
      })
    },
    isActive(item) {
      if (!item) return false
      if (this.current === undefined || this.current === null || this.current === '') {
        return this.mainItems[0] && this.mainItems[0].key === item.key
      }
      return String(this.current) === String(item.key)
    },
    itemClass(item) {
      return [
        this.isActive(item) ? 'lingyun-tabbars__item--active' : '',
        item.text ? '' : 'lingyun-tabbars__item--icon-only',
      ]
        .filter(Boolean)
        .join(' ')
    },
    badgeConfig(item) {
      const b = item && item.badge
      if (b == null || b === false || b === '') return null
      if (b === true || b === 'dot') return { dot: true, text: '', color: 'red', max: 99 }
      if (typeof b === 'object') {
        return {
          text: b.text != null ? b.text : '',
          color: b.color || b.type || 'red',
          dot: !!(b.dot || b.text === 'dot'),
          max: b.max != null ? Number(b.max) : 99,
        }
      }
      return { text: b, color: 'red', dot: false, max: 99 }
    },
    hasBadge(item) {
      const c = this.badgeConfig(item)
      if (!c) return false
      return c.dot || c.text === 0 || !!c.text
    },
    badgeText(item) {
      const c = this.badgeConfig(item)
      return c ? c.text : ''
    },
    badgeColor(item) {
      const c = this.badgeConfig(item)
      return c ? c.color : 'red'
    },
    badgeDot(item) {
      const c = this.badgeConfig(item)
      return !!(c && c.dot)
    },
    badgeMax(item) {
      const c = this.badgeConfig(item)
      return c && c.max != null ? c.max : 99
    },
    onSelect(item) {
      if (!item) return
      this.$emit('update:modelValue', item.key)
      this.$emit('update:value', item.key)
      this.$emit('change', item)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

/* Sketch Default：402×99，内边距上 16 / 左右下 21，胶囊 360×62 */
/* 选中胶囊 Fills/2 Secondary；未选中文字 Labels - Liquid Glass 1 Primary */
$ly-tabbar-pad-x: 21px;
$ly-tabbar-pad-top: 16px;
$ly-tabbar-pad-bottom: 21px;
$ly-tabbar-gap: 8px;
$ly-tabbar-content-h: 62px;
$ly-tab-item-h: 54px;
$ly-search-size: $ly-tabbar-content-h;
$ly-tab-icon: 25px;
$ly-search-icon: $ly-tab-icon;
$ly-bar-pad: 4px;
/* 单项不拉宽：5 项无搜索约 346；n+1 胶囊随数量变宽，搜索圆钮固定 62 */
$ly-tab-item-w: 68px;

.lingyun-tabbars {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  box-sizing: border-box;
  width: fit-content;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: $ly-tabbar-pad-top $ly-tabbar-pad-x 0;
  gap: $ly-tabbar-gap;
  pointer-events: none;

  &--fixed {
    position: fixed;
    left: 50%;
    right: auto;
    bottom: 0;
    z-index: 900;
    width: fit-content;
    margin-left: 0;
    margin-right: 0;
    transform: translateX(-50%);
  }

  /* iPhone：无搜索 4/5 项占满整行；有搜索的 3+1 / 4+1 左侧胶囊占满圆钮左侧 */
  &--fill {
    @media (max-width: 743px) {
      width: 100%;
    }
  }

  &--fixed#{&}--fill {
    @media (max-width: 743px) {
      left: 0;
      right: 0;
      width: 100%;
      transform: none;
    }
  }
  &--with-search {
    @media (max-width: 743px) {
      width: 100%;
      justify-content: space-between;
    }
  }

  &--fixed#{&}--with-search {
    @media (max-width: 743px) {
      left: 0;
      right: 0;
      width: 100%;
      transform: none;
    }
  }

  &--safe {
    padding-bottom: $ly-tabbar-pad-bottom;
  }

  &__bar {
    position: relative;
    pointer-events: auto;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: center;
    flex: 0 0 auto;
    width: auto;
    height: $ly-tabbar-content-h;
    min-height: $ly-tabbar-content-h;
    padding: $ly-bar-pad;
    box-sizing: border-box;
    @include lingyun-glass-control;
  }

  &__indicator {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    pointer-events: none;
    border-radius: $lingyun-glass-radius-pill;
    background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
    opacity: 0;
    transform-origin: center center;
    will-change: left, width, transform;
    transition: opacity 0.2s ease;
  }

  &__indicator--ready {
    opacity: 1;
  }

  &__indicator--hidden {
    opacity: 0;
  }

  &__item {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: $ly-tab-item-w;
    min-width: $ly-tab-item-w;
    box-sizing: border-box;
    height: auto;
    min-height: 0;
    padding: 0;
    border-radius: $lingyun-glass-radius-pill;
    color: var(--lingyun-label-glass, #{$lingyun-label-glass});
    transition: color 0.32s ease, transform 0.16s ease;
  }

  &__item--active &__icon-wrap,
  &__item--active &__icon {
    color: var(--lingyun-system-blue, #{$lingyun-system-blue});
  }

  &__item--hover {
    transform: scale(0.96);
  }

  &--fill &__bar {
    @media (max-width: 743px) {
      flex: 1;
      width: auto;
    }
  }

  &--fill &__item {
    @media (max-width: 743px) {
      flex: 1 1 0;
      width: auto;
      min-width: 0;
    }
  }

  &__icon-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: $ly-tab-icon;
    height: $ly-tab-icon;
  }

  &__icon {
    font-size: $ly-tab-icon;
    line-height: 1;
    color: inherit;
  }

  &__label {
    margin-top: 2px;
    max-width: 100%;
    font-size: 10px;
    font-weight: 600;
    line-height: 12px;
    letter-spacing: -0.1px;
    color: var(--lingyun-label-glass, #{$lingyun-label-glass});
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__badge {
    position: absolute;
    top: -8px;
    right: -14px;
    z-index: 2;
    pointer-events: none;
  }

  &__search {
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: $ly-search-size;
    height: $ly-search-size;
    flex-shrink: 0;
    @include lingyun-glass-control;
    color: var(--lingyun-label-glass, #{$lingyun-label-glass});
    transition: color 0.32s ease, transform 0.16s ease;
  }

  &__search--active {
    color: var(--lingyun-system-blue, #{$lingyun-system-blue});
  }

  &__search--hover {
    transform: scale(0.96);
  }

  &__search-icon {
    line-height: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lingyun-tabbars__indicator--ready,
  .lingyun-tabbars__item,
  .lingyun-tabbars__search {
    transition: none;
  }
}
</style>
