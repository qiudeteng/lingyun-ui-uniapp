<template>
  <view
    class="lingyun-badge"
    :class="rootClass"
    role="status"
    :aria-label="ariaLabel"
    @click="onClick"
  >
    <text v-if="!isDot" class="lingyun-badge__text">{{ displayText }}</text>
  </view>
</template>

<script>
/**
 * lingyun-badge
 * @description 对齐 Apple iOS 27 UI Kit · App Icons / Badge（Sketch）
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/4FE3C0D6-2F3E-4203-A201-C708AFA8AC55#Inspect
 * @see design/BADGES.md
 *
 * @property {String} color = [red|green|orange|gray] 默认 red（System Colors）
 * @property {String|Number} text 角标文案 / 数字
 * @property {Number} max 数字封顶，超出显示 `{max}+`（默认 99）
 * @property {Boolean} dot 仅显示小圆点（无文案）
 * @event {Function} click
 */
export default {
  name: 'LingyunBadge',
  emits: ['click'],
  props: {
    color: {
      type: String,
      default: 'red',
    },
    /** 兼容 type 别名（uni-badge 习惯） */
    type: {
      type: String,
      default: '',
    },
    text: {
      type: [String, Number],
      default: '',
    },
    max: {
      type: Number,
      default: 99,
    },
    dot: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    resolvedColor() {
      const raw = (this.type || this.color || 'red').toLowerCase()
      const map = {
        red: 'red',
        error: 'red',
        danger: 'red',
        green: 'green',
        success: 'green',
        orange: 'orange',
        warning: 'orange',
        gray: 'gray',
        grey: 'gray',
        info: 'gray',
        default: 'gray',
      }
      return map[raw] || 'red'
    },
    isDot() {
      return this.dot || this.text === 'dot'
    },
    displayText() {
      if (this.isDot) return ''
      const slot = this.$slots.default
      if (slot) {
        try {
          const nodes = slot()
          if (Array.isArray(nodes) && nodes.length) {
            const parts = nodes
              .map((n) => (n && n.children != null ? String(n.children) : ''))
              .join('')
              .trim()
            if (parts) return parts
          }
        } catch (e) {
          /* ignore */
        }
      }
      const raw = this.text
      if (raw === '' || raw == null) return ''
      const n = Number(raw)
      if (!Number.isNaN(n) && String(raw).trim() !== '' && this.max > 0 && n > this.max) {
        return `${this.max}+`
      }
      return String(raw)
    },
    ariaLabel() {
      if (this.isDot) return 'New'
      return this.displayText ? `Badge ${this.displayText}` : 'Badge'
    },
    rootClass() {
      return [
        `lingyun-badge--${this.resolvedColor}`,
        this.isDot ? 'lingyun-badge--dot' : '',
        !this.isDot && this.displayText.length <= 1 ? 'lingyun-badge--single' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
  },
  methods: {
    onClick(e) {
      this.$emit('click', e)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

/* Sketch：App Icons / Badge · 24h · pad 8×2.5 · radius 100 · SF Regular 16 / LH 19 · 白字 */
.lingyun-badge {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 24px;
  height: 24px;
  padding: 2.5px 8px;
  border-radius: $lingyun-glass-radius-pill;
  vertical-align: middle;
  /* #ifdef H5 */
  cursor: default;
  user-select: none;
  /* #endif */

  &__text {
    font-size: 16px;
    font-weight: 400;
    line-height: 19px;
    color: $lingyun-white;
    text-align: center;
    white-space: nowrap;
  }

  &--single {
    min-width: 24px;
    padding-left: 0;
    padding-right: 0;
  }

  &--dot {
    width: 10px;
    min-width: 10px;
    height: 10px;
    padding: 0;
  }

  &--red {
    background-color: var(--lingyun-system-red, #{$lingyun-system-red});
  }

  &--green {
    background-color: var(--lingyun-system-green, #{$lingyun-system-green});
  }

  &--orange {
    background-color: var(--lingyun-system-orange, #{$lingyun-system-orange});
  }

  &--gray {
    background-color: var(--lingyun-system-gray, #{$lingyun-system-gray});
  }
}
</style>
