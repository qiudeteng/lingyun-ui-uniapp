<template>
  <view
    class="lingyun-chip"
    :class="rootClass"
    @click="onClick"
  >
    <text class="lingyun-chip__text">{{ text }}</text>
  </view>
</template>

<script>
/**
 * lingyun-chip · 可选中筛选胶囊
 * @see design/TAGS.md
 */
export default {
  name: 'LingyunChip',
  emits: ['update:selected', 'update:modelValue', 'change', 'click'],
  props: {
    text: { type: String, default: '' },
    selected: { type: Boolean, default: undefined },
    modelValue: { type: Boolean, default: undefined },
    selectable: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
  },
  computed: {
    isSelected() {
      if (this.modelValue !== undefined && this.modelValue !== null) return !!this.modelValue
      return !!this.selected
    },
    rootClass() {
      return [
        this.isSelected ? 'lingyun-chip--selected' : '',
        this.disabled ? 'lingyun-chip--disabled' : '',
      ].filter(Boolean)
    },
  },
  methods: {
    onClick(e) {
      if (this.disabled) return
      this.$emit('click', e)
      if (!this.selectable) return
      const next = !this.isSelected
      this.$emit('update:selected', next)
      this.$emit('update:modelValue', next)
      this.$emit('change', next)
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 16px;
  box-sizing: border-box;
  background-color: rgba(120, 120, 128, 0.12);
}

.lingyun-chip__text {
  font-size: 14px;
  line-height: 18px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-chip--selected {
  background-color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-chip--selected .lingyun-chip__text {
  color: #ffffff;
}

.lingyun-chip--disabled {
  opacity: 0.4;
}
</style>
