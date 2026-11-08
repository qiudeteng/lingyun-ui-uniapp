<template>
  <view
    class="lingyun-rating"
    :class="[
      rootClass,
      { 'is-disabled': disabled, 'is-readonly': readonly },
    ]"
    role="radiogroup"
    :aria-label="label"
  >
    <view class="lingyun-rating__stars" :style="starsStyle">
      <view
        v-for="star in starList"
        :key="star"
        class="lingyun-rating__star"
        :style="{ width: `${resolvedSize}px`, height: `${resolvedSize}px` }"
      >
        <lingyun-icon
          class="lingyun-rating__icon"
          type="star"
          :size="resolvedSize"
          :color="inactiveColor"
        />
        <view
          class="lingyun-rating__fill"
          :style="{ width: `${fillPercent(star)}%` }"
        >
          <lingyun-icon
            class="lingyun-rating__icon"
            type="star-filled"
            :size="resolvedSize"
            :color="activeColor"
          />
        </view>

        <view
          v-if="!readonly && !disabled"
          class="lingyun-rating__hitbox"
          :class="{ 'lingyun-rating__hitbox--half': allowHalf }"
          role="slider"
          :aria-valuemin="0"
          :aria-valuemax="max"
          :aria-valuenow="current"
          :aria-label="`${label} ${star}`"
        >
          <view
            class="lingyun-rating__hit"
            :style="{ width: allowHalf ? '50%' : '100%' }"
            @click.stop="onRate(star, allowHalf ? 0.5 : 1)"
          />
          <view
            v-if="allowHalf"
            class="lingyun-rating__hit"
            style="width:50%"
            @click.stop="onRate(star, 1)"
          />
        </view>
      </view>
    </view>

    <text v-if="showValue" class="lingyun-rating__value">
      {{ formattedValue }}{{ valueSuffix }}
    </text>
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type { LingyunRatingChangePayload } from './types'

/**
 * lingyun-rating
 * @description 评分：整星 / 半星、只读 / 禁用、可清除、显示分值
 * @see design/RATING.md
 */
export default defineComponent({
  name: 'LingyunRating',
  emits: ['update:modelValue', 'change'],
  props: {
    modelValue: { type: Number, default: 0 },
    max: { type: Number, default: 5 },
    size: { type: Number, default: 24 },
    gap: { type: Number, default: 4 },
    allowHalf: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    showValue: { type: Boolean, default: false },
    valueSuffix: { type: String, default: '' },
    label: { type: String, default: '评分' },
    activeColor: { type: String, default: 'orange' },
    inactiveColor: { type: String, default: 'gray3' },
  },
  computed: {
    rootClass(): string {
      let themeClass = 'theme-light'
      try {
        themeClass = useLingyunTheme().rootClass || 'theme-light'
      } catch {
        /* pinia 未就绪 */
      }
      return themeClass
    },
    resolvedMax(): number {
      const max = Math.floor(Number(this.max))
      return Number.isFinite(max) && max > 0 ? Math.min(max, 10) : 5
    },
    resolvedSize(): number {
      const size = Number(this.size)
      return Number.isFinite(size) && size > 0 ? Math.min(48, Math.max(12, size)) : 24
    },
    starList(): number[] {
      return Array.from({ length: this.resolvedMax }, (_, index) => index + 1)
    },
    current(): number {
      const value = Number(this.modelValue)
      if (!Number.isFinite(value)) return 0
      const clamped = Math.min(this.resolvedMax, Math.max(0, value))
      if (!this.allowHalf) return Math.floor(clamped)
      return Math.round(clamped * 2) / 2
    },
    formattedValue(): string {
      return Number.isInteger(this.current)
        ? String(this.current)
        : this.current.toFixed(1)
    },
    starsStyle(): Record<string, string> {
      return { gap: `${Math.max(0, Number(this.gap) || 0)}px` }
    },
  },
  methods: {
    fillPercent(star: number): number {
      const filled = this.current - (star - 1)
      return Math.min(100, Math.max(0, filled * 100))
    },
    onRate(star: number, offset: number): void {
      if (this.readonly || this.disabled) return
      const next = Math.min(
        this.resolvedMax,
        Math.max(0, star - 1 + offset),
      )
      if (this.clearable && next === this.current) {
        this.emitValue(0)
        return
      }
      this.emitValue(next)
    },
    emitValue(value: number): void {
      if (value === this.current) return
      const payload: LingyunRatingChangePayload = {
        value,
        previous: this.current,
      }
      this.$emit('update:modelValue', value)
      this.$emit('change', payload)
    },
    reset(): void {
      if (this.readonly || this.disabled) return
      this.emitValue(0)
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-rating {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  max-width: 100%;
}

.lingyun-rating__stars {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-rating__star {
  position: relative;
  flex: 0 0 auto;
  display: block;
  line-height: 0;
}

.lingyun-rating__icon {
  display: block;
  line-height: 1;
}

.lingyun-rating__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  overflow: hidden;
}

.lingyun-rating__hitbox {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-direction: row;
  cursor: pointer;
}

.lingyun-rating__hit {
  height: 100%;
}

.lingyun-rating__value {
  margin-left: 6px;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-rating.is-disabled {
  opacity: 0.4;
}

.lingyun-rating.is-readonly .lingyun-rating__hitbox {
  display: none;
}
</style>
