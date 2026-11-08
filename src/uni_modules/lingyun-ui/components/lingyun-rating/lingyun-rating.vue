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
    <view
      :id="starsId"
      class="lingyun-rating__stars"
      :style="starsStyle"
    >
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

      <view
        v-if="interactive"
        class="lingyun-rating__drag-layer"
        aria-hidden="true"
        @touchstart.stop.prevent="onTouchStart"
        @touchmove.stop.prevent="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
      />
    </view>

    <text v-if="showValue" class="lingyun-rating__value">
      {{ formattedValue }}{{ valueSuffix }}
    </text>
  </view>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type { LingyunRatingChangePayload } from './types'

interface TouchLike {
  clientX?: number
  clientY?: number
  pageX?: number
  pageY?: number
}

let ratingSequence = 0

function touchesOf(event: TouchEvent): TouchLike[] {
  const list = event.touches as unknown as ArrayLike<TouchLike> | undefined
  return list ? Array.from(list) : []
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

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
  data(): {
    uid: number
    dragging: boolean
    dragMoved: boolean
    dragStartX: number
    dragStartY: number
    dragStartValue: number
    dragValue: number | null
    lastDragX: number
    starsLeft: number
    starsWidth: number
    suppressClick: boolean
    suppressTimer: ReturnType<typeof setTimeout> | null
    lastTouchAt: number
    h5Stars: HTMLElement | null
    h5MouseDown: ((event: MouseEvent) => void) | null
    h5MouseMove: ((event: MouseEvent) => void) | null
    h5MouseUp: (() => void) | null
  } {
    return {
      uid: (ratingSequence += 1),
      dragging: false,
      dragMoved: false,
      dragStartX: 0,
      dragStartY: 0,
      dragStartValue: 0,
      dragValue: null,
      lastDragX: 0,
      starsLeft: 0,
      starsWidth: 0,
      suppressClick: false,
      suppressTimer: null,
      lastTouchAt: 0,
      h5Stars: null,
      h5MouseDown: null,
      h5MouseMove: null,
      h5MouseUp: null,
    }
  },
  computed: {
    starsId(): string {
      return `lingyun-rating-stars-${this.uid}`
    },
    interactive(): boolean {
      return !this.readonly && !this.disabled
    },
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
  mounted() {
    this.$nextTick(() => this.bindH5Mouse())
  },
  beforeUnmount() {
    this.unbindH5Mouse()
    if (this.suppressTimer) {
      clearTimeout(this.suppressTimer)
      this.suppressTimer = null
    }
  },
  methods: {
    fillPercent(star: number): number {
      const filled = this.current - (star - 1)
      return Math.min(100, Math.max(0, filled * 100))
    },
    onRate(star: number, offset: number): void {
      if (this.readonly || this.disabled || this.suppressClick) return
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
    measureStars(callback?: () => void): void {
      // #ifdef H5
      if (typeof document !== 'undefined') {
        const el = document.getElementById(this.starsId)
        if (el) {
          const rect = el.getBoundingClientRect()
          this.starsLeft = rect.left
          this.starsWidth = rect.width
          if (callback) callback()
          return
        }
      }
      // #endif

      uni
        .createSelectorQuery()
        .in(this)
        .select(`#${this.starsId}`)
        .boundingClientRect()
        .exec((res) => {
          const rect =
            res && (res[0] as { left?: number; width?: number } | null)
          if (!rect || !rect.width) return
          this.starsLeft = Number(rect.left || 0)
          this.starsWidth = Number(rect.width)
          if (callback) callback()
        })
    },
    startDrag(clientX: number, clientY: number): void {
      if (!this.interactive) return
      this.dragging = true
      this.dragMoved = false
      this.dragStartX = clientX
      this.dragStartY = clientY
      this.dragStartValue = this.current
      this.lastDragX = clientX
      this.dragValue = null
      this.measureStars(() => {
        if (this.dragging) this.applyDrag(this.lastDragX)
      })
    },
    moveDrag(clientX: number, clientY: number): void {
      if (!this.dragging) return
      this.lastDragX = clientX
      if (
        Math.abs(clientX - this.dragStartX) > 6 ||
        Math.abs(clientY - this.dragStartY) > 6
      ) {
        this.dragMoved = true
      }
      if (this.starsWidth > 0) this.applyDrag(clientX)
    },
    endDrag(): void {
      if (!this.dragging) return
      const wasMoved = this.dragMoved
      const tapValue = this.dragValue
      this.dragging = false
      this.dragValue = null
      if (
        !wasMoved &&
        this.clearable &&
        tapValue != null &&
        tapValue === this.dragStartValue
      ) {
        this.emitValue(0)
      }
      if (wasMoved) {
        this.suppressClick = true
        if (this.suppressTimer) clearTimeout(this.suppressTimer)
        this.suppressTimer = setTimeout(() => {
          this.suppressClick = false
          this.suppressTimer = null
        }, 80)
      }
    },
    applyDrag(clientX: number): void {
      if (!this.starsWidth || this.starsWidth <= 0) return
      const ratio = clamp(
        (clientX - this.starsLeft) / this.starsWidth,
        0,
        1,
      )
      const scaled = ratio * this.resolvedMax
      let index = Math.floor(scaled)
      if (index >= this.resolvedMax) index = this.resolvedMax - 1
      const within = scaled - index
      const next = this.allowHalf
        ? index + (within < 0.5 ? 0.5 : 1)
        : index + 1
      if (next === this.dragValue) return
      this.dragValue = next
      this.emitValue(next)
    },
    onTouchStart(event: TouchEvent): void {
      if (!this.interactive) return
      const touch = touchesOf(event)[0]
      if (!touch) return
      this.lastTouchAt = Date.now()
      this.startDrag(
        Number(touch.clientX ?? touch.pageX ?? 0),
        Number(touch.clientY ?? touch.pageY ?? 0),
      )
    },
    onTouchMove(event: TouchEvent): void {
      const touch = touchesOf(event)[0]
      if (!touch) return
      this.moveDrag(
        Number(touch.clientX ?? touch.pageX ?? 0),
        Number(touch.clientY ?? touch.pageY ?? 0),
      )
    },
    onTouchEnd(): void {
      this.endDrag()
    },
    bindH5Mouse(): void {
      // #ifdef H5
      if (typeof document === 'undefined') return
      const el = document.getElementById(this.starsId)
      if (!el) return
      this.h5Stars = markRaw(el)
      this.h5MouseDown = (event: MouseEvent) => {
        if (
          event.button !== 0 ||
          Date.now() - this.lastTouchAt < 500 ||
          !this.interactive
        ) {
          return
        }
        event.preventDefault()
        this.startDrag(event.clientX, event.clientY)
      }
      this.h5MouseMove = (event: MouseEvent) => {
        if (!this.dragging) return
        event.preventDefault()
        this.moveDrag(event.clientX, event.clientY)
      }
      this.h5MouseUp = () => {
        if (this.dragging) this.endDrag()
      }
      this.h5Stars.addEventListener('mousedown', this.h5MouseDown)
      window.addEventListener('mousemove', this.h5MouseMove)
      window.addEventListener('mouseup', this.h5MouseUp)
      // #endif
    },
    unbindH5Mouse(): void {
      // #ifdef H5
      if (this.h5Stars && this.h5MouseDown) {
        this.h5Stars.removeEventListener('mousedown', this.h5MouseDown)
      }
      if (this.h5MouseMove) {
        window.removeEventListener('mousemove', this.h5MouseMove)
      }
      if (this.h5MouseUp) {
        window.removeEventListener('mouseup', this.h5MouseUp)
      }
      this.h5Stars = null
      this.h5MouseDown = null
      this.h5MouseMove = null
      this.h5MouseUp = null
      // #endif
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
  position: relative;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-rating__drag-layer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
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
