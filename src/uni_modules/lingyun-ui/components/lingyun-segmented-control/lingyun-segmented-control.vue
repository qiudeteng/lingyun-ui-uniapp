<template>
  <view
    class="lingyun-segmented-control"
    :id="trackId"
    :class="rootClass"
    role="tablist"
    :aria-disabled="disabled ? 'true' : 'false'"
  >
    <view
      class="lingyun-segmented-control__thumb"
      :class="thumbClass"
      :style="thumbStyle"
    />
    <view
      v-for="(item, index) in normalizedItems"
      :id="segmentId(index)"
      :key="item.key"
      class="lingyun-segmented-control__item"
      :class="{
        'lingyun-segmented-control__item--active': isActive(item),
        'lingyun-segmented-control__item--disabled': item.disabled,
      }"
      role="tab"
      :aria-selected="isActive(item) ? 'true' : 'false'"
      :aria-disabled="item.disabled || disabled ? 'true' : 'false'"
      hover-class="lingyun-segmented-control__item--hover"
      :hover-start-time="20"
      :hover-stay-time="70"
      @click="onSelect(item, index)"
    >
      <slot :name="`item-${item.key}`" :item="item" :active="isActive(item)" :index="index">
        <text v-if="item.icon && !item.text" class="lingyun-segmented-control__icon">{{
          item.icon
        }}</text>
        <text v-else class="lingyun-segmented-control__label">{{ item.text }}</text>
      </slot>
    </view>
  </view>
</template>

<script>
import { useThemeStore } from '@/stores/theme'

/**
 * lingyun-segmented-control
 * @description 对齐 Apple iOS 27 UI Kit · Segmented Controls（Sketch）+ HIG
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Segmented%2520Controls%252FDark%252FLarge
 * @see https://developer.apple.com/design/human-interface-guidelines/segmented-controls
 * @see design/SEGMENTED_CONTROLS.md
 *
 * 选中胶囊过渡对齐 lingyun-tabbars：左右边弹簧（liquid lens）+ 拉伸时 scaleY 压缩
 * 暗黑：根节点自挂 theme-*（styleIsolation 下父级变量/选择器不可靠）
 *
 * @property {Array|String[]} items [{ key, text?, icon?, disabled? }] 或字符串数组
 * @property {String|Number} modelValue / value 当前选中 key（或字符串项本身）
 * @property {String} size = [large|small] Large 48 / Small 32
 * @property {Boolean} disabled
 * @property {Boolean} block 通栏（默认 true，对齐稿面等分）
 * @event {Function} change / update:modelValue
 */
export default {
  name: 'LingyunSegmentedControl',
  emits: ['change', 'update:modelValue', 'update:value'],
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
    size: {
      type: String,
      default: 'large',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    block: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      instanceId: `lysc-${Math.random().toString(36).slice(2, 8)}`,
      thumb: {
        left: 0,
        width: 0,
        scaleY: 1,
        ready: false,
        visible: false,
      },
    }
  },
  computed: {
    current() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    resolvedSize() {
      return this.size === 'small' ? 'small' : 'large'
    },
    normalizedItems() {
      return (this.items || []).map((item, index) => {
        if (item != null && typeof item === 'object') {
          return {
            key: item.key != null ? String(item.key) : String(index),
            text: item.text != null ? String(item.text) : '',
            icon: item.icon || '',
            disabled: !!item.disabled,
            raw: item,
          }
        }
        const text = String(item)
        return { key: text, text, icon: '', disabled: false, raw: item }
      })
    },
    themeClass() {
      try {
        return useThemeStore().rootClass || 'theme-light'
      } catch (e) {
        return 'theme-light'
      }
    },
    rootClass() {
      return [
        `lingyun-segmented-control--${this.resolvedSize}`,
        this.themeClass,
        this.block ? 'lingyun-segmented-control--block' : '',
        this.disabled ? 'lingyun-segmented-control--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    trackId() {
      return `${this.instanceId}-track`
    },
    thumbClass() {
      return [
        this.thumb.ready ? 'lingyun-segmented-control__thumb--ready' : '',
        this.thumb.visible ? '' : 'lingyun-segmented-control__thumb--hidden',
      ]
        .filter(Boolean)
        .join(' ')
    },
    thumbStyle() {
      const { left, width, scaleY } = this.thumb
      return {
        left: `${left}px`,
        width: `${width}px`,
        transform: `scaleY(${scaleY})`,
      }
    },
  },
  watch: {
    current() {
      this.syncThumb({ liquid: true })
    },
    items: {
      deep: true,
      handler() {
        this.syncThumb({ liquid: false })
      },
    },
    size() {
      this.syncThumb({ liquid: false })
    },
  },
  mounted() {
    this.bindThumbResize()
    this.$nextTick(() => this.scheduleThumbSync())
  },
  beforeUnmount() {
    this.stopLens()
    this.unbindThumbResize()
  },
  methods: {
    segmentId(index) {
      return `${this.instanceId}-seg-${index}`
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
    /** 窗口或轨道尺寸变化后，等布局结束再量选中块，避免量到 flex 还没分完的宽度 */
    scheduleThumbSync() {
      this.cancelFrame(this._resizeRaf)
      this._resizeRaf = this.scheduleFrame(() => {
        this._resizeRaf = this.scheduleFrame(() => {
          this._resizeRaf = null
          this.syncThumb({ liquid: false })
        })
      })
    },
    bindThumbResize() {
      this._onResize = () => this.scheduleThumbSync()
      if (typeof uni !== 'undefined' && typeof uni.onWindowResize === 'function') {
        uni.onWindowResize(this._onResize)
      }
      /* #ifdef H5 */
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', this._onResize)
      }
      this.$nextTick(() => {
        const el = typeof document !== 'undefined' ? document.getElementById(this.trackId) : null
        if (!el || typeof ResizeObserver === 'undefined') return
        this._ro = new ResizeObserver(() => this.scheduleThumbSync())
        this._ro.observe(el)
      })
      /* #endif */
    },
    unbindThumbResize() {
      this.cancelFrame(this._resizeRaf)
      this._resizeRaf = null
      if (this._onResize && typeof uni !== 'undefined' && typeof uni.offWindowResize === 'function') {
        uni.offWindowResize(this._onResize)
      }
      /* #ifdef H5 */
      if (this._ro) {
        this._ro.disconnect()
        this._ro = null
      }
      if (this._onResize && typeof window !== 'undefined') {
        window.removeEventListener('resize', this._onResize)
      }
      /* #endif */
      this._onResize = null
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
      const scaleY = Math.max(0.78, Math.min(1, 1 / Math.sqrt(Math.max(stretch, 1))))
      this.thumb.left = left
      this.thumb.width = width
      this.thumb.scaleY = scaleY
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
      this.thumb.visible = true
      if (!this._lensRaf) {
        this._lensLast = 0
        this._lensRaf = this.scheduleFrame((t) => this.tickLens(t))
      }
    },
    syncThumb(options) {
      const liquid = !!(options && options.liquid)
      const activeIndex = this.normalizedItems.findIndex((it) => this.isActive(it))
      const active = activeIndex >= 0 ? this.normalizedItems[activeIndex] : null
      if (!active) {
        this.stopLens()
        this.thumb.visible = false
        return
      }
      this.$nextTick(() => {
        uni
          .createSelectorQuery()
          .in(this)
          .select(`#${this.trackId}`)
          .boundingClientRect()
          .select(`#${this.segmentId(activeIndex)}`)
          .boundingClientRect()
          .exec((res) => {
            const track = res && res[0]
            const seg = res && res[1]
            if (!track || !seg || !seg.width) return
            const toRect = {
              left: Math.max(0, seg.left - track.left),
              width: seg.width,
            }
            const canFlow =
              liquid &&
              this.thumb.ready &&
              this.thumb.visible &&
              this.thumb.width > 0 &&
              !this.prefersReducedMotion()
            this.thumb.visible = true
            if (canFlow) {
              this.flowLens(toRect)
              return
            }
            this.snapLens(toRect)
            if (!this.thumb.ready) {
              this.$nextTick(() => {
                this.thumb.ready = true
              })
            }
          })
      })
    },
    isActive(item) {
      if (!item) return false
      if (this.current === undefined || this.current === null || this.current === '') {
        return this.normalizedItems[0] && this.normalizedItems[0].key === item.key
      }
      return String(this.current) === String(item.key)
    },
    onSelect(item) {
      if (this.disabled || !item || item.disabled) return
      this.$emit('update:modelValue', item.key)
      this.$emit('update:value', item.key)
      this.$emit('change', item.raw != null && typeof item.raw === 'object' ? item.raw : item)
      this.$nextTick(() => this.syncThumb({ liquid: true }))
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

/*
 * Sketch Segmented Controls/Dark/Large：370×48 · pad 2 · gap 4
 * Track = Tertiary Fill Dark rgba(118,118,128,0.24)
 * Selected thumb = Liquid Glass「5 - Selected」（暗黑提亮银霜，非死黑 #2c2c2e）
 */
$ly-seg-pad: 2px;
$ly-seg-gap: 4px;
$ly-seg-large-h: 48px;
$ly-seg-small-h: 32px;

.lingyun-segmented-control {
  position: relative;
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  box-sizing: border-box;
  gap: $ly-seg-gap;
  padding: $ly-seg-pad;
  border-radius: $lingyun-glass-radius-pill;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  vertical-align: middle;
  /* #ifdef H5 */
  user-select: none;
  /* #endif */

  &--block {
    display: flex;
    width: 100%;
  }

  &--large {
    height: $ly-seg-large-h;
  }

  &--small {
    height: $ly-seg-small-h;
  }

  &--disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  &__thumb {
    position: absolute;
    top: $ly-seg-pad;
    bottom: $ly-seg-pad;
    left: 0;
    z-index: 0;
    box-sizing: border-box;
    border-radius: $lingyun-glass-radius-pill;
    /* Light：Elevated / Tertiary Background（白底胶囊） */
    background-color: var(--lingyun-bg-tertiary, #{$lingyun-bg-tertiary});
    border: 0.5px solid rgba(255, 255, 255, 0.55);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.06),
      0 2px 8px rgba(0, 0, 0, 0.08),
      inset 0 0.5px 0 rgba(255, 255, 255, 0.7);
    opacity: 0;
    pointer-events: none;
    transform-origin: center center;
    will-change: left, width, transform;
    transition: opacity 0.2s ease;
  }

  &__thumb--ready {
    opacity: 1;
  }

  &__thumb--hidden {
    opacity: 0;
  }

  &__item {
    position: relative;
    z-index: 1;
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 0 6px;
    border-radius: $lingyun-glass-radius-pill;
    box-sizing: border-box;
    /* #ifdef H5 */
    cursor: pointer;
    /* #endif */
  }

  &__item--hover {
    transform: scale(0.98);
  }

  &__item--disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  &__label,
  &__icon {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.4px;
    line-height: 18px;
    text-align: center;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: color 0.32s ease;
  }

  &__item--active &__label,
  &__item--active &__icon {
    color: var(--lingyun-label, #{$lingyun-label});
  }

  &--small &__label,
  &--small &__icon {
    font-size: 12px;
    line-height: 16px;
  }

  /*
   * Dark/Large（Sketch Inspect 已核对）：
   * Track Tertiary Fill Dark；Selected = 提亮 Liquid Glass，勿用 #2c2c2e 实心。
   * 色值写死，避免仍继承到 Light CSS 变量。
   */
  &.theme-dark {
    background-color: #{$lingyun-fill-tertiary-dark};

    .lingyun-segmented-control__thumb {
      border: 0.5px solid rgba(255, 255, 255, 0.22);
      box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.4),
        0 4px 14px rgba(0, 0, 0, 0.32),
        inset 0 0.5px 0 rgba(255, 255, 255, 0.28);
      /* #ifdef H5 || APP-PLUS */
      background-color: rgba(255, 255, 255, 0.2);
      backdrop-filter: saturate(180%) blur(16px);
      -webkit-backdrop-filter: saturate(180%) blur(16px);
      /* #endif */
      /* #ifdef MP */
      /* 弱端：银霜 Elevated，对齐 Dark glass lighter */
      background-color: rgba(99, 99, 102, 0.92);
      /* #endif */
    }

    .lingyun-segmented-control__label,
    .lingyun-segmented-control__icon {
      color: #{$lingyun-label-secondary-dark};
    }

    .lingyun-segmented-control__item--active .lingyun-segmented-control__label,
    .lingyun-segmented-control__item--active .lingyun-segmented-control__icon {
      color: #{$lingyun-label-dark};
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .lingyun-segmented-control__thumb {
    will-change: auto;
  }

  .lingyun-segmented-control__label,
  .lingyun-segmented-control__icon {
    transition: none;
  }
}
</style>
