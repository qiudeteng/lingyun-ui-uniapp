<template>
  <view v-if="isWrapper" class="lingyun-badge-anchor">
    <slot />
    <view
      class="lingyun-badge lingyun-badge--floating"
      :class="rootClass"
      <!-- #ifndef APP -->
      role="status"
      :aria-label="ariaLabel"
      <!-- #endif -->
      @click="onClick"
    >
      <text v-if="!isDot" class="lingyun-badge__text">{{ displayText }}</text>
    </view>
  </view>
  <view
    v-else
    class="lingyun-badge"
    :class="rootClass"
    <!-- #ifndef APP -->
    role="status"
    :aria-label="ariaLabel"
    <!-- #endif -->
    @click="onClick"
  >
    <text v-if="!isDot" class="lingyun-badge__text">{{ displayText }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { type PropType } from 'vue'

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
 * @property {String} size = [small|medium] 小号 / 默认
 * @event {Function} click
 */
defineOptions({
  name: 'LingyunBadge',
})

const props = defineProps({
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
    type: [String, Number] as PropType<string | number>,
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
  size: {
    type: String,
    default: 'medium',
  },
})

const emit = defineEmits(['click'])

const slots = useSlots()

/**
 * 包裹模式：默认插槽放内容、自身带角标文案/dot 时，
 * badge 浮到插槽内容右上角，避免覆盖内容或超出圆角容器被裁。
 */
const isWrapper = computed((): boolean => {
  return !!slots.default && (String(props.text || '') !== '' || props.dot)
})

const resolvedColor = computed((): string => {
  const raw = (props.type || props.color || 'red').toLowerCase()
  const map: Record<string, string> = {
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
})

const isDot = computed((): boolean => {
  return props.dot || props.text === 'dot'
})

const resolvedSize = computed((): string => {
  return String(props.size || '').toLowerCase() === 'small' ||
    String(props.size || '').toLowerCase() === 'sm'
    ? 'small'
    : 'medium'
})

const displayText = computed((): string => {
  if (isDot.value) return ''
  if (!isWrapper.value) {
    const slot = slots.default
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
      } catch {
        /* ignore */
      }
    }
  }
  const raw = props.text
  if (raw === '' || raw == null) return ''
  const n = Number(raw)
  if (!Number.isNaN(n) && String(raw).trim() !== '' && props.max > 0 && n > props.max) {
    return `${props.max}+`
  }
  return String(raw)
})

const ariaLabel = computed((): string => {
  if (isDot.value) return 'New'
  return displayText.value ? `Badge ${displayText.value}` : 'Badge'
})

const rootClass = computed((): string => {
  return [
    `lingyun-badge--${resolvedColor.value}`,
    resolvedSize.value === 'small' ? 'lingyun-badge--small' : '',
    isDot.value ? 'lingyun-badge--dot' : '',
    !isDot.value && displayText.value.length <= 1 ? 'lingyun-badge--single' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

function onClick(e: Event): void {
  emit('click', e)
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

/* Sketch：App Icons / Badge · 24h · pad 8×2.5 · radius 100 · SF Regular 16 / LH 19 · 白字 */
/* 包裹模式定位容器：本身无圆角，iPhone 微信不会把浮出的角标裁掉 */
.lingyun-badge-anchor {
  position: relative;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  vertical-align: middle;
  /* uni-app x 编译到小程序会给 view 注入 overflow: hidden，这里必须放开 */
  overflow: visible;
}

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

  /* 包裹模式下浮到内容右上角 */
  &--floating {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    z-index: 2;
  }

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

  /* 紧凑档：Tab / 列表等空间受限场景；默认仍为 Sketch 24 */
  &--small {
    min-width: 18px;
    height: 18px;
    padding: 1px 5px;

    .lingyun-badge__text {
      font-size: 11px;
      line-height: 14px;
    }

    &.lingyun-badge--single {
      min-width: 18px;
      padding-left: 0;
      padding-right: 0;
    }

    &.lingyun-badge--dot {
      width: 8px;
      min-width: 8px;
      height: 8px;
      padding: 0;
    }
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
