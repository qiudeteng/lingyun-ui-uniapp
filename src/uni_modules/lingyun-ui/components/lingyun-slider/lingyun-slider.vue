<template>
  <view
    class="lingyun-slider"
    :class="rootClass"
    role="slider"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="innerValue"
    :aria-disabled="disabled"
    @touchstart="onTouchStart"
    @touchmove.stop.prevent="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
    @mousedown.stop.prevent="onMouseDown"
  >
    <text v-if="minGlyph" class="lingyun-slider__glyph">{{ minGlyph }}</text>
    <view class="lingyun-slider__body">
      <view class="lingyun-slider__track" :style="trackStyle">
        <view class="lingyun-slider__fill" :style="fillStyle" />
      </view>
      <view v-if="showTicks" class="lingyun-slider__ticks">
        <view v-for="n in tickCount" :key="n" class="lingyun-slider__tick" />
      </view>
      <view class="lingyun-slider__knob" :style="knobStyle">
        <view v-if="pressed && !disabled" class="lingyun-slider__glow" />
      </view>
    </view>
    <text v-if="maxGlyph" class="lingyun-slider__glyph">{{ maxGlyph }}</text>
  </view>
</template>

<script>
import { useThemeStore } from '@/stores/theme'

/** Sketch Sliders/Light/No Glyphs：拇指 37×24，轨道高 6 */
const KNOB_W = 37

/**
 * lingyun-slider
 * 自绘，对齐 Apple iOS 27 UI Kit · Sliders（不用原生 slider，原生拇指/轨道对不上稿）
 * @see design/SLIDERS.md
 */
export default {
  name: 'LingyunSlider',
  emits: ['update:modelValue', 'update:value', 'changing', 'change'],
  props: {
    modelValue: { type: Number, default: undefined },
    value: { type: Number, default: undefined },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
    activeColor: { type: String, default: '' },
    backgroundColor: { type: String, default: '' },
    /** 保留兼容；视觉尺寸固定为稿面 37×24，不再传给原生 slider */
    blockSize: { type: Number, default: 20 },
    /** 去掉左右 16。列表行自身已有 16 内边距时用 */
    flush: { type: Boolean, default: false },
    minGlyph: { type: String, default: '' },
    maxGlyph: { type: String, default: '' },
    showTicks: { type: Boolean, default: true },
  },
  data() {
    return {
      dragging: false,
      pressed: false,
      touching: false,
      innerValue: 50,
      trackRect: null,
      pendingX: null,
      tickCount: 5,
    }
  },
  computed: {
    propValue() {
      if (this.modelValue !== undefined && this.modelValue !== null) return Number(this.modelValue)
      if (this.value !== undefined && this.value !== null) return Number(this.value)
      return 50
    },
    themeClass() {
      try {
        return useThemeStore().rootClass || 'theme-light'
      } catch {
        return 'theme-light'
      }
    },
    rootClass() {
      return [
        this.themeClass,
        this.flush ? 'lingyun-slider--flush' : '',
        this.disabled ? 'is-disabled' : '',
        this.pressed && !this.disabled ? 'is-pressed' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    ratio() {
      const min = Number(this.min)
      const max = Number(this.max)
      if (!(max > min)) return 0
      const next = (Number(this.innerValue) - min) / (max - min)
      return Math.min(1, Math.max(0, next))
    },
    trackStyle() {
      if (!this.backgroundColor) return {}
      return { backgroundColor: this.backgroundColor }
    },
    fillStyle() {
      const ratio = this.ratio
      const pct = (ratio * 100).toFixed(4)
      // 填充画到拇指中心：18.5 + ratio * (track - 37)
      const extra = (KNOB_W / 2 - ratio * KNOB_W).toFixed(4)
      const style = { width: `calc(${pct}% + ${extra}px)` }
      if (this.activeColor) style.backgroundColor = this.activeColor
      return style
    },
    knobStyle() {
      const ratio = this.ratio
      const pct = (ratio * 100).toFixed(4)
      const shift = (ratio * KNOB_W).toFixed(4)
      return { left: `calc(${pct}% - ${shift}px)` }
    },
  },
  watch: {
    propValue: {
      immediate: true,
      handler(v) {
        if (this.dragging) return
        const next = Number(v)
        if (!Number.isFinite(next)) return
        const quantized = this.quantize(next)
        if (quantized === this.innerValue) return
        this.innerValue = quantized
      },
    },
  },
  created() {
    this._mouseMove = (e) => {
      if (!this.dragging) return
      this.seek(e.clientX)
    }
    this._mouseUp = () => this.endDrag()
  },
  beforeUnmount() {
    this.detachMouse()
  },
  methods: {
    quantize(raw) {
      const min = Number(this.min)
      const max = Number(this.max)
      const step = Number(this.step) > 0 ? Number(this.step) : 1
      if (!(max > min)) return min
      const clamped = Math.min(max, Math.max(min, Number(raw)))
      const steps = Math.round((clamped - min) / step)
      const next = Number((min + steps * step).toFixed(6))
      return Math.min(max, Math.max(min, next))
    },
    clientX(e) {
      const touch = (e && e.touches && e.touches[0]) || (e && e.changedTouches && e.changedTouches[0])
      if (touch && typeof touch.clientX === 'number') return touch.clientX
      if (e && typeof e.clientX === 'number') return e.clientX
      return null
    },
    measure(cb) {
      uni
        .createSelectorQuery()
        .in(this)
        .select('.lingyun-slider__body')
        .boundingClientRect((rect) => {
          if (rect && rect.width) {
            this.trackRect = { left: rect.left, width: rect.width }
          }
          if (cb) cb(this.trackRect)
        })
        .exec()
    },
    beginDrag(clientX) {
      if (this.disabled || clientX == null) return
      this.pressed = true
      this.dragging = true
      this.seek(clientX)
    },
    seek(clientX) {
      if (clientX == null) return
      this.pendingX = clientX
      if (this.trackRect) {
        this.applyX(clientX)
        return
      }
      if (this._measuring) return
      this._measuring = true
      this.measure(() => {
        this._measuring = false
        if (this.pendingX != null) this.applyX(this.pendingX)
        if (this._releaseWaiting) {
          this._releaseWaiting = false
          this.finishDrag()
        }
      })
    },
    applyX(clientX) {
      const rect = this.trackRect
      if (!rect || clientX == null || !(rect.width > KNOB_W)) return
      const span = rect.width - KNOB_W
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left - KNOB_W / 2) / span))
      const min = Number(this.min)
      const max = Number(this.max)
      const value = this.quantize(min + ratio * (max - min))
      if (value === this.innerValue) return
      this.innerValue = value
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
      this.$emit('changing', value)
    },
    endDrag() {
      if (!this.dragging && !this.pressed) return
      if (!this.trackRect) {
        this._releaseWaiting = true
        return
      }
      if (this.pendingX != null) this.applyX(this.pendingX)
      this.finishDrag()
    },
    finishDrag() {
      const value = this.innerValue
      this.pressed = false
      this.dragging = false
      this.pendingX = null
      this.detachMouse()
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
      this.$emit('change', value)
    },
    onTouchStart(e) {
      if (this.disabled) return
      this.touching = true
      this.beginDrag(this.clientX(e))
    },
    onTouchMove(e) {
      if (!this.dragging || this.disabled) return
      this.seek(this.clientX(e))
    },
    onTouchEnd() {
      this.endDrag()
      setTimeout(() => {
        this.touching = false
      }, 400)
    },
    onMouseDown(e) {
      if (this.disabled || this.touching) return
      this.beginDrag(this.clientX(e))
      this.attachMouse()
    },
    attachMouse() {
      // #ifdef H5
      window.addEventListener('mousemove', this._mouseMove)
      window.addEventListener('mouseup', this._mouseUp)
      // #endif
    },
    detachMouse() {
      // #ifdef H5
      window.removeEventListener('mousemove', this._mouseMove)
      window.removeEventListener('mouseup', this._mouseUp)
      // #endif
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-slider {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 52px;
  padding: 0 16px;

  &--flush {
    padding-left: 0;
    padding-right: 0;
  }

  &__glyph {
    flex-shrink: 0;
    width: 32px;
    height: 52px;
    font-size: 17px;
    font-weight: 600;
    line-height: 52px;
    text-align: center;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }

  &__body {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 52px;
  }

  &__track {
    position: absolute;
    left: 0;
    right: 0;
    top: 23px;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background-color: var(--lingyun-fill, #{$lingyun-fill});
  }

  &__fill {
    height: 6px;
    border-radius: 3px;
    background-color: var(--lingyun-system-blue, #{$lingyun-system-blue});
  }

  &__ticks {
    position: absolute;
    left: 0;
    right: 0;
    top: 33px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    height: 4px;
    padding: 0 16px;
  }

  &__tick {
    width: 4px;
    height: 4px;
    border-radius: 3px;
    background-color: var(--lingyun-label-quaternary, #{$lingyun-label-quaternary});
  }

  &__knob {
    position: absolute;
    top: 14px;
    z-index: 1;
    width: 37px;
    height: 24px;
    border-radius: 999px;
    background-color: #ffffff;
    box-shadow:
      0 0.5px 4px 0 rgba(0, 0, 0, 0.12),
      0 6px 13px 0 rgba(0, 0, 0, 0.12);
  }

  &__glow {
    position: absolute;
    left: -10px;
    top: -7px;
    width: 57px;
    height: 38px;
    border-radius: 50px;
    box-shadow:
      0 0 0 0.25px rgba(255, 255, 255, 0.45),
      0 0 0 0.25px rgba(255, 255, 255, 0.45),
      0 0 0 0.5px rgba(217, 217, 217, 1),
      0 0 0 0.5px rgba(217, 217, 217, 1);
  }

  &.is-disabled &__knob {
    background-color: #d1d1d6;
    box-shadow: none;
  }

  &.theme-dark.is-disabled &__knob {
    background-color: #636366;
  }
}

/* #ifdef H5 */
.lingyun-slider {
  cursor: pointer;
  user-select: none;
}

.lingyun-slider.is-disabled {
  cursor: default;
}
/* #endif */
</style>
