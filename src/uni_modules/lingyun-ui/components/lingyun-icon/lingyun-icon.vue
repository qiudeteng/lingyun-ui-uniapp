<template>
  <text
    class="lingyun-icon"
    :class="iconClass"
    :style="iconStyle"
    @click="onClick"
  />
</template>

<script>
import { fontData } from './icons'

/**
 * lingyun-icon
 * @description 图标字体（lyicon- / lingyunicons）；color 支持语义预设 + 任意 CSS 色
 * @property {String} type 图标名
 * @property {Number|String} size 字号，数字默认 px
 * @property {String} color 语义色或自定义色；空则 label
 * @property {String} customPrefix 自定义 class 前缀（默认 lyicon）
 * @event click
 * @see design/ICONS.md
 */

/** 与 lingyun-text / COLORS 对齐的语义色；未命中则当作自定义 CSS 色 */
const SEMANTIC_COLORS = {
  label: 'var(--lingyun-label, #000000)',
  secondary: 'var(--lingyun-label-secondary, rgba(60,60,67,0.6))',
  tertiary: 'var(--lingyun-label-tertiary, rgba(60,60,67,0.3))',
  quaternary: 'var(--lingyun-label-quaternary, rgba(60,60,67,0.18))',
  primary: 'var(--lingyun-primary, #0088ff)',
  link: 'var(--lingyun-link, #0088ff)',
  success: 'var(--lingyun-success, #34c759)',
  warning: 'var(--lingyun-warning, #ff8d28)',
  error: 'var(--lingyun-error, #ff383c)',
  red: 'var(--lingyun-system-red, #ff383c)',
  orange: 'var(--lingyun-system-orange, #ff8d28)',
  yellow: 'var(--lingyun-system-yellow, #ffcc00)',
  green: 'var(--lingyun-system-green, #34c759)',
  mint: 'var(--lingyun-system-mint, #00c8b3)',
  teal: 'var(--lingyun-system-teal, #00c3d0)',
  cyan: 'var(--lingyun-system-cyan, #00c0e8)',
  blue: 'var(--lingyun-system-blue, #0088ff)',
  indigo: 'var(--lingyun-system-indigo, #6155f5)',
  purple: 'var(--lingyun-system-purple, #cb30e0)',
  pink: 'var(--lingyun-system-pink, #ff2d55)',
  brown: 'var(--lingyun-system-brown, #ac7f5e)',
  gray: 'var(--lingyun-system-gray, #8e8e93)',
  gray2: 'var(--lingyun-system-gray2, #aeaeb2)',
  gray3: 'var(--lingyun-system-gray3, #c7c7cc)',
  white: '#ffffff',
  inherit: 'inherit',
}

export default {
  name: 'LingyunIcon',
  emits: ['click'],
  props: {
    type: { type: String, default: '' },
    /** 语义色（label/primary/red…）或任意 CSS 色（#hex / rgb / var） */
    color: { type: String, default: '' },
    size: { type: [Number, String], default: 16 },
    customPrefix: { type: String, default: 'lyicon' },
  },
  computed: {
    iconClass() {
      const prefix = this.customPrefix || 'lyicon'
      const type = this.type || ''
      if (!type) return ''
      if (prefix === 'lyicon') return `lyicon-${type}`
      return [prefix, type]
    },
    iconSize() {
      const val = this.size
      if (typeof val === 'number') return `${val}px`
      const s = String(val || '').trim()
      if (!s) return '16px'
      if (/^\d+(\.\d+)?$/.test(s)) return `${s}px`
      return s
    },
    colorValue() {
      const raw = String(this.color || '').trim()
      if (!raw) return SEMANTIC_COLORS.label
      const key = raw.toLowerCase()
      if (SEMANTIC_COLORS[key]) return SEMANTIC_COLORS[key]
      return raw
    },
    iconStyle() {
      return {
        color: this.colorValue,
        fontSize: this.iconSize,
        lineHeight: this.iconSize,
      }
    },
  },
  methods: {
    onClick(e) {
      this.$emit('click', e)
    },
    getIconNames() {
      return fontData.map((item) => item.font_class)
    },
  },
}
</script>

<style lang="scss">
@import './lingyunicons.css';

@font-face {
  font-family: lingyunicons;
  src: url('./lingyunicons.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.lingyun-icon {
  font-family: lingyunicons;
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
</style>
