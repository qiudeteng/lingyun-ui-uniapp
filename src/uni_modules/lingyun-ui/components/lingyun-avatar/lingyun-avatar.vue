<template>
  <view class="lingyun-avatar" :class="sizeClass" :style="rootStyle">
    <image
      v-if="src"
      class="lingyun-avatar__img"
      :style="imgStyle"
      :src="src"
      mode="aspectFill"
      @error="onImageError"
    />
    <text v-else class="lingyun-avatar__text">{{ initials }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type PropType } from 'vue'

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

defineOptions({
  name: 'LingyunAvatar',
})

const emit = defineEmits(['error'])

const props = defineProps({
  src: { type: String, default: '' },
  text: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | ml | lg
  /**
   * 显示形式：square 直角 · rounded 圆角 · circle 圆形
   * 默认圆形，与原来的头像一致
   */
  shape: { type: String, default: 'circle' },
  /** 圆角幅度，仅 shape=rounded 生效；none/sm/md/lg/xl/2xl 或数字 px。默认 2xl（26） */
  radius: { type: [String, Number] as PropType<string | number>, default: '2xl' },
  backgroundColor: { type: String, default: '' },
})

const sizeClass = computed(() => {
  const s = props.size === 'sm' || props.size === 'ml' || props.size === 'lg' ? props.size : 'md'
  return `lingyun-avatar--${s}`
})

const resolvedShape = computed(() => {
  const s = String(props.shape || 'circle').trim().toLowerCase()
  if (s === 'square' || s === 'rect' || s === 'circle' || s === 'rounded') {
    return s === 'rect' ? 'square' : s
  }
  return 'circle'
})

const radiusPx = computed(() => {
  if (resolvedShape.value !== 'rounded') return 0
  const r = props.radius
  if (typeof r === 'number' && Number.isFinite(r)) return Math.max(0, r)
  const key = String(r || '2xl').trim().toLowerCase()
  if (Object.prototype.hasOwnProperty.call(RADIUS_PRESET, key)) {
    const preset = RADIUS_PRESET[key]
    if (preset != null) return preset
  }
  const n = Number(r)
  if (Number.isFinite(n)) return Math.max(0, n)
  return RADIUS_PRESET['2xl']
})

const initials = computed(() => {
  const t = (props.text || '').trim()
  if (!t) return '?'
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return t.slice(0, 2).toUpperCase()
})

const rootStyle = computed((): Record<string, string> => {
  const style: Record<string, string> = {}
  if (resolvedShape.value === 'circle') style.borderRadius = '50%'
  else if (resolvedShape.value === 'square') style.borderRadius = '0'
  else style.borderRadius = `${radiusPx.value}px`
  if (props.backgroundColor) style.backgroundColor = props.backgroundColor
  return style
})

/** 圆角直接作用在 image 自身，不依赖父级 overflow 裁剪（小程序端更稳） */
const imgStyle = computed((): Record<string, string> => {
  const style: Record<string, string> = {}
  if (resolvedShape.value === 'circle') style.borderRadius = '50%'
  else if (resolvedShape.value === 'square') style.borderRadius = '0'
  else style.borderRadius = `${radiusPx.value}px`
  return style
})

function onImageError(event: unknown) {
  emit('error', event)
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
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

.lingyun-avatar--ml {
  width: 52px;
  height: 52px;
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

.lingyun-avatar--ml .lingyun-avatar__text {
  font-size: 18px;
}

.lingyun-avatar--lg .lingyun-avatar__text {
  font-size: 22px;
}
</style>
