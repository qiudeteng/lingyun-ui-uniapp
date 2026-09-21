<template>
  <view class="lingyun-progress" :class="rootClass">
    <view v-if="typeKey === 'line'" class="lingyun-progress__line" :style="lineTrackStyle">
      <view class="lingyun-progress__line-bar" :style="lineBarStyle" />
    </view>
    <view v-else class="lingyun-progress__circle-wrap" :style="circleWrapStyle">
      <view class="lingyun-progress__circle" :style="circleStyle" />
      <text v-if="showInfo" class="lingyun-progress__info">{{ clamped }}%</text>
    </view>
    <text v-if="showInfo && typeKey === 'line'" class="lingyun-progress__info lingyun-progress__info--line">
      {{ clamped }}%
    </text>
  </view>
</template>

<script>
/**
 * lingyun-progress
 * @see design/PROGRESS.md
 * circle 用 conic-gradient；小程序基础库支持有限时降级为边框弧近似
 */
export default {
  name: 'LingyunProgress',
  props: {
    type: { type: String, default: 'line' },
    percent: { type: [Number, String], default: 0 },
    strokeWidth: { type: [Number, String], default: undefined },
    size: { type: [Number, String], default: 40 },
    showInfo: { type: Boolean, default: false },
    activeColor: { type: String, default: '' },
    backgroundColor: { type: String, default: '' },
  },
  computed: {
    typeKey() {
      return this.type === 'circle' ? 'circle' : 'line'
    },
    clamped() {
      const n = Number(this.percent)
      if (Number.isNaN(n)) return 0
      return Math.min(100, Math.max(0, Math.round(n)))
    },
    stroke() {
      if (this.strokeWidth != null && this.strokeWidth !== '') return Number(this.strokeWidth)
      return this.typeKey === 'circle' ? 3 : 4
    },
    active() {
      return this.activeColor || 'var(--lingyun-primary, #0088ff)'
    },
    track() {
      return this.backgroundColor || 'var(--lingyun-fill-tertiary, rgba(118,118,128,0.12))'
    },
    rootClass() {
      return [`lingyun-progress--${this.typeKey}`]
    },
    lineTrackStyle() {
      return {
        height: `${this.stroke}px`,
        borderRadius: `${this.stroke}px`,
        backgroundColor: this.track,
      }
    },
    lineBarStyle() {
      return {
        width: `${this.clamped}%`,
        height: '100%',
        borderRadius: `${this.stroke}px`,
        backgroundColor: this.active,
      }
    },
    circleSize() {
      return Number(this.size) || 40
    },
    circleWrapStyle() {
      const s = this.circleSize
      return { width: `${s}px`, height: `${s}px` }
    },
    circleStyle() {
      const s = this.circleSize
      const w = this.stroke
      const p = this.clamped
      /* conic-gradient：H5 / 较新小程序；角度从顶部起 */
      return {
        width: `${s}px`,
        height: `${s}px`,
        borderRadius: '50%',
        background: `conic-gradient(${this.active} 0% ${p}%, ${this.track} ${p}% 100%)`,
        mask: `radial-gradient(farthest-side, transparent calc(100% - ${w}px), #000 calc(100% - ${w}px + 0.5px))`,
        '-webkit-mask': `radial-gradient(farthest-side, transparent calc(100% - ${w}px), #000 calc(100% - ${w}px + 0.5px))`,
      }
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-progress {
  box-sizing: border-box;
  width: 100%;
}

.lingyun-progress--line {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.lingyun-progress__line {
  flex: 1;
  overflow: hidden;
}

.lingyun-progress__line-bar {
  transition: width 0.24s ease-out;
}

.lingyun-progress--circle {
  width: auto;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.lingyun-progress__circle-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-progress__circle {
  box-sizing: border-box;
}

.lingyun-progress__info {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-progress__info--line {
  flex-shrink: 0;
  min-width: 36px;
  text-align: right;
}

.lingyun-progress__circle-wrap .lingyun-progress__info {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 11px;
}
</style>
