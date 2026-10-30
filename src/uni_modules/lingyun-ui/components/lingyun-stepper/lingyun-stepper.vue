<template>
  <view class="lingyun-stepper-host" :class="{ 'lingyun-stepper-host--disabled': disabled }">
    <text v-if="leftTextClipped" class="lingyun-stepper__side-text">{{ leftTextClipped }}</text>
    <view class="lingyun-stepper" :class="{ 'lingyun-stepper--disabled': disabled }">
      <view
        class="lingyun-stepper__btn"
        :class="{ 'lingyun-stepper__btn--disabled': atMin }"
        hover-class="lingyun-stepper__btn--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        @click="onStep(-1)"
      >
        <text class="lingyun-stepper__mark">−</text>
      </view>
      <view class="lingyun-stepper__div" />
      <input
        v-if="showValue"
        class="lingyun-stepper__value"
        type="number"
        :style="valueStyle"
        :value="draft"
        :disabled="disabled"
        confirm-type="done"
        @input="onDraft"
        @focus="onFocus"
        @blur="commitDraft"
        @confirm="commitDraft"
      />
      <view v-if="showValue" class="lingyun-stepper__div" />
      <view
        class="lingyun-stepper__btn"
        :class="{ 'lingyun-stepper__btn--disabled': atMax }"
        hover-class="lingyun-stepper__btn--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        @click="onStep(1)"
      >
        <text class="lingyun-stepper__mark">+</text>
      </view>
    </view>
    <text v-if="rightTextClipped" class="lingyun-stepper__side-text">{{ rightTextClipped }}</text>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

/**
 * lingyun-stepper
 * @see design/SWITCHES.md
 */

type StepperFieldEvent = {
  detail?: { value?: string | number }
  target?: { value?: string | number } | null
}

/** 左右说明文字最多 4 个字（按 Unicode 码点截断，避免拆开 emoji） */
function clipSideText(value: unknown): string {
  const text = String(value == null ? '' : value).trim()
  return Array.from(text).slice(0, 4).join('')
}

export default defineComponent({
  name: 'LingyunStepper',
  emits: ['update:modelValue', 'update:value', 'change'],
  props: {
    modelValue: { type: Number as PropType<number | undefined>, default: undefined },
    value: { type: Number as PropType<number | undefined>, default: undefined },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 10 },
    step: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
    /** 在 − / + 之间展示可编辑的当前值 */
    showValue: { type: Boolean, default: false },
    /** 步进器左侧灰色说明文字，最多 4 个字 */
    leftText: { type: String, default: '' },
    /** 步进器右侧灰色说明文字，最多 4 个字 */
    rightText: { type: String, default: '' },
  },
  data() {
    return {
      draft: '',
      editing: false,
    }
  },
  watch: {
    current: {
      immediate: true,
      handler(val: number) {
        if (!this.editing) this.draft = this.format(val)
      },
    },
  },
  computed: {
    current(): number {
      if (this.modelValue !== undefined && this.modelValue !== null) return Number(this.modelValue)
      if (this.value !== undefined && this.value !== null) return Number(this.value)
      return 0
    },
    atMin(): boolean {
      return this.disabled || this.current <= this.min
    },
    atMax(): boolean {
      return this.disabled || this.current >= this.max
    },
    leftTextClipped(): string {
      return clipSideText(this.leftText)
    },
    rightTextClipped(): string {
      return clipSideText(this.rightText)
    },
    valueStyle(): { width: string } {
      const text = this.editing ? String(this.draft) : this.format(this.current)
      const len = Math.max(1, text.length)
      return { width: `${Math.max(36, len * 12 + 8)}px` }
    },
  },
  methods: {
    format(n: number): string {
      const value = Number(n)
      if (!Number.isFinite(value)) return ''
      const step = Number(this.step) || 1
      const digits = (String(step).split('.')[1] || '').length
      return digits ? String(Number(value.toFixed(Math.min(8, digits)))) : String(value)
    },
    emitValue(next: number) {
      this.editing = false
      this.draft = this.format(next)
      if (next === this.current) return
      this.$emit('update:modelValue', next)
      this.$emit('update:value', next)
      this.$emit('change', next)
    },
    onStep(dir: number) {
      if (this.disabled) return
      const next = this.current + dir * (Number(this.step) || 1)
      const clamped = Math.min(this.max, Math.max(this.min, next))
      if (clamped === this.current) {
        this.editing = false
        this.draft = this.format(this.current)
        return
      }
      this.emitValue(clamped)
    },
    onFocus() {
      this.editing = true
    },
    readEventValue(event?: StepperFieldEvent | null): string | null {
      if (!event) return null
      const detail = event.detail
      if (detail && detail.value != null) return String(detail.value)
      const target = event.target
      if (target && target.value != null) return String(target.value)
      return null
    },
    onDraft(event?: unknown) {
      const value = this.readEventValue(event as StepperFieldEvent)
      this.draft = value == null ? '' : value
    },
    commitDraft(event?: unknown) {
      const typed = this.readEventValue(event as StepperFieldEvent)
      if (typed != null) this.draft = typed
      this.editing = false
      const raw = String(this.draft).trim()
      const parsed = Number(raw)
      if (raw === '' || !Number.isFinite(parsed)) {
        this.draft = this.format(this.current)
        return
      }
      const step = Number(this.step) || 1
      const min = Number(this.min)
      const max = Number(this.max)
      let next = parsed
      if (step > 0) {
        const snapped = min + Math.round((parsed - min) / step) * step
        const digits = (String(step).split('.')[1] || '').length
        next = digits ? Number(snapped.toFixed(Math.min(8, digits))) : snapped
      }
      next = Math.min(max, Math.max(min, next))
      this.emitValue(next)
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

/* 外层只负责左右说明文字与控件对齐；控件自身仍是 .lingyun-stepper */
.lingyun-stepper-host {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  max-width: 100%;
}

.lingyun-stepper__side-text {
  flex-shrink: 0;
  font-size: 15px;
  line-height: 20px;
  white-space: nowrap;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-stepper-host--disabled .lingyun-stepper__side-text {
  opacity: 0.45;
}

.lingyun-stepper {
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  height: 30px;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-stepper--disabled {
  opacity: 0.45;
}

.lingyun-stepper__btn {
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-stepper__btn--hover {
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-stepper__btn--disabled {
  opacity: 0.35;
  pointer-events: none;
}

.lingyun-stepper__mark {
  font-size: 18px;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-stepper__div {
  width: 1px;
  margin: 6px 0;
  background-color: var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-stepper__value {
  flex-shrink: 0;
  height: 30px;
  min-height: 30px;
  margin: 0;
  padding: 0;
  border: none;
  background-color: transparent;
  text-align: center;
  font-size: 15px;
  line-height: 30px;
  color: var(--lingyun-label, #{$lingyun-label});
}

/* #ifdef H5 */
.lingyun-stepper__value {
  appearance: textfield;
}

.lingyun-stepper__value::-webkit-outer-spin-button,
.lingyun-stepper__value::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}
/* #endif */
</style>
