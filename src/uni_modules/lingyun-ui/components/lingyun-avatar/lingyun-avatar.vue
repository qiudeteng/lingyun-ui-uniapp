<template>
  <view class="lingyun-avatar" :class="sizeClass" :style="rootStyle">
    <image
      v-if="src"
      class="lingyun-avatar__img"
      :src="src"
      mode="aspectFill"
    />
    <text v-else class="lingyun-avatar__text">{{ initials }}</text>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

/**
 * lingyun-avatar
 * shape=显示形式 · size=尺寸 · radius=圆角幅度（仅 rounded）
 * @see design/AVATARS.md
 */

/** 圆角幅度（仅 shape=rounded），与 lingyun-image 同一套 */
const RADIUS_PRESET: Record<string, number> = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 26,
}

export default defineComponent({
  name: 'LingyunAvatar',
  props: {
    src: { type: String, default: '' },
    text: { type: String, default: '' },
    size: { type: String, default: 'md' }, // sm | md | lg
    /**
     * 显示形式：square 直角 · rounded 圆角 · circle 圆形
     * 默认圆形，与原来的头像一致
     */
    shape: { type: String, default: 'circle' },
    /** 圆角幅度，仅 shape=rounded 生效；none/sm/md/lg/xl/2xl 或数字 px。默认 2xl（26） */
    radius: { type: [String, Number] as PropType<string | number>, default: '2xl' },
    backgroundColor: { type: String, default: '' },
  },
  computed: {
    sizeClass() {
      const s = this.size === 'sm' || this.size === 'lg' ? this.size : 'md'
      return `lingyun-avatar--${s}`
    },
    resolvedShape() {
      const s = String(this.shape || 'circle').trim().toLowerCase()
      if (s === 'square' || s === 'rect' || s === 'circle' || s === 'rounded') {
        return s === 'rect' ? 'square' : s
      }
      return 'circle'
    },
    radiusPx() {
      if (this.resolvedShape !== 'rounded') return 0
      const r = this.radius
      if (typeof r === 'number' && Number.isFinite(r)) return Math.max(0, r)
      const key = String(r || '2xl').trim().toLowerCase()
      if (Object.prototype.hasOwnProperty.call(RADIUS_PRESET, key)) {
        const preset = RADIUS_PRESET[key]
        if (preset != null) return preset
      }
      const n = Number(r)
      if (Number.isFinite(n)) return Math.max(0, n)
      return RADIUS_PRESET['2xl']
    },
    initials() {
      const t = (this.text || '').trim()
      if (!t) return '?'
      const parts = t.split(/\s+/).filter(Boolean)
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      return t.slice(0, 2).toUpperCase()
    },
    rootStyle(): Record<string, string> {
      const style: Record<string, string> = {}
      if (this.resolvedShape === 'circle') style.borderRadius = '50%'
      else if (this.resolvedShape === 'square') style.borderRadius = '0'
      else style.borderRadius = `${this.radiusPx}px`
      if (this.backgroundColor) style.backgroundColor = this.backgroundColor
      return style
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: rgba(0, 136, 255, 0.18);
  flex-shrink: 0;
  box-sizing: border-box;
}

.lingyun-avatar--sm {
  width: 28px;
  height: 28px;
}

.lingyun-avatar--md {
  width: 40px;
  height: 40px;
}

.lingyun-avatar--lg {
  width: 64px;
  height: 64px;
}

.lingyun-avatar__img {
  width: 100%;
  height: 100%;
  display: block;
}

.lingyun-avatar__text {
  font-weight: 600;
  color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-avatar--sm .lingyun-avatar__text {
  font-size: 11px;
}

.lingyun-avatar--md .lingyun-avatar__text {
  font-size: 14px;
}

.lingyun-avatar--lg .lingyun-avatar__text {
  font-size: 22px;
}
</style>
