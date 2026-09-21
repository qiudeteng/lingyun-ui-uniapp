<template>
  <view
    class="lingyun-checkbox"
    :class="rootClass"
    role="checkbox"
    :aria-checked="current ? 'true' : 'false'"
    :aria-disabled="disabled ? 'true' : 'false'"
    @click.stop="onTap"
  >
    <view class="lingyun-checkbox__box" :style="boxStyle">
      <lingyun-icon
        v-if="current"
        class="lingyun-checkbox__mark"
        type="checkmarkempty"
        :size="14"
        color="#ffffff"
      />
    </view>
    <text v-if="label" class="lingyun-checkbox__label">{{ label }}</text>
    <slot />
  </view>
</template>

<script>
/**
 * lingyun-checkbox
 * 自绘框 + lingyun-icon 勾（避免 mp 原生 checkbox 默认绿 / color 失效）
 * @see design/CHECKS.md
 */
export default {
  name: 'LingyunCheckbox',
  emits: ['update:modelValue', 'update:checked', 'change'],
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
  props: {
    modelValue: { type: Boolean, default: undefined },
    checked: { type: Boolean, default: undefined },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    color: { type: String, default: '' },
  },
  computed: {
    current() {
      if (this.modelValue !== undefined && this.modelValue !== null) return !!this.modelValue
      return !!this.checked
    },
    rootClass() {
      return [
        this.current ? 'lingyun-checkbox--on' : '',
        this.disabled ? 'lingyun-checkbox--disabled' : '',
      ].filter(Boolean)
    },
    boxStyle() {
      if (!this.current || !this.color) return {}
      return {
        backgroundColor: this.color,
        borderColor: this.color,
      }
    },
  },
  methods: {
    onTap() {
      if (this.disabled) return
      const next = !this.current
      this.$emit('update:modelValue', next)
      this.$emit('update:checked', next)
      this.$emit('change', next)
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-checkbox {
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 44px;
  padding: 10px 0;
  gap: 10px;
}

.lingyun-checkbox--disabled {
  opacity: 0.4;
  pointer-events: none;
}

.lingyun-checkbox__box {
  position: relative;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  box-sizing: border-box;
  border: 1.5px solid var(--lingyun-separator, rgba(60, 60, 67, 0.36));
  background-color: transparent;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.lingyun-checkbox--on .lingyun-checkbox__box {
  border-color: var(--lingyun-primary, #{$lingyun-system-blue});
  background-color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-checkbox__mark {
  line-height: 1;
  flex-shrink: 0;
}

.lingyun-checkbox__label {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}
</style>
