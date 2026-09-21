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
  },
  methods: {
    onStep(dir) {
      if (this.disabled) return
      const next = this.current + dir * (Number(this.step) || 1)
      const clamped = Math.min(this.max, Math.max(this.min, next))
      if (clamped === this.current) return
      this.$emit('update:modelValue', clamped)
      this.$emit('update:value', clamped)
      this.$emit('change', clamped)
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
</style>
