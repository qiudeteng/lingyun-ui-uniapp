<template>
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
</template>

<script>
/**
 * lingyun-stepper
 * @see design/SWITCHES.md
 */
export default {
  name: 'LingyunStepper',
  emits: ['update:modelValue', 'update:value', 'change'],
  props: {
    modelValue: { type: Number, default: undefined },
    value: { type: Number, default: undefined },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 10 },
    step: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
    /** 在 − / + 之间展示可编辑的当前值 */
    showValue: { type: Boolean, default: false },
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
      handler(val) {
        if (!this.editing) this.draft = this.format(val)
      },
    },
  },
  computed: {
    current() {
      if (this.modelValue !== undefined && this.modelValue !== null) return Number(this.modelValue)
      if (this.value !== undefined && this.value !== null) return Number(this.value)
      return 0
    },
    atMin() {
      return this.disabled || this.current <= this.min
    },
    atMax() {
      return this.disabled || this.current >= this.max
    },
    valueStyle() {
      const text = this.editing ? String(this.draft) : this.format(this.current)
      const len = Math.max(1, text.length)
      return { width: `${Math.max(36, len * 12 + 8)}px` }
    },
  },
  methods: {
    format(n) {
      const value = Number(n)
      if (!Number.isFinite(value)) return ''
      const step = Number(this.step) || 1
      const digits = (String(step).split('.')[1] || '').length
      return digits ? String(Number(value.toFixed(Math.min(8, digits)))) : String(value)
    },
    emitValue(next) {
      this.editing = false
      this.draft = this.format(next)
      if (next === this.current) return
      this.$emit('update:modelValue', next)
      this.$emit('update:value', next)
      this.$emit('change', next)
    },
    onStep(dir) {
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
    readEventValue(event) {
      if (!event) return null
      const detail = event.detail
      if (detail && detail.value != null) return String(detail.value)
      const target = event.target
      if (target && target.value != null) return String(target.value)
      return null
    },
    onDraft(event) {
      const value = this.readEventValue(event)
      this.draft = value == null ? '' : value
    },
    commitDraft(event) {
      const typed = this.readEventValue(event)
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
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

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
