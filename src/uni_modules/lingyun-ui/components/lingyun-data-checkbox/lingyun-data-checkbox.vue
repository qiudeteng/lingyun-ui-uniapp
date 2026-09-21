<template>
  <view class="lingyun-data-checkbox" role="group">
    <text v-if="!normalizedItems.length" class="lingyun-data-checkbox__empty">{{ emptyText }}</text>
    <lingyun-checkbox
      v-for="item in normalizedItems"
      :key="String(item.value)"
      :model-value="isSelected(item.value)"
      :label="item.text"
      :disabled="disabled || item.disabled"
      :color="color"
      @change="onItemChange(item.value, $event)"
    />
  </view>
</template>

<script>
/**
 * lingyun-data-checkbox
 * 数据驱动多选：localdata → 自绘 lingyun-checkbox
 * @see design/CHECKS.md
 */
export default {
  name: 'LingyunDataCheckbox',
  emits: ['update:modelValue', 'update:value', 'change'],
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
  props: {
    modelValue: { type: Array, default: undefined },
    value: { type: Array, default: undefined },
    localdata: { type: Array, default: () => [] },
    map: {
      type: Object,
      default: () => ({ text: 'text', value: 'value', disabled: 'disabled' }),
    },
    disabled: { type: Boolean, default: false },
    color: { type: String, default: '' },
    min: { type: [Number, String], default: '' },
    max: { type: [Number, String], default: '' },
    emptyText: { type: String, default: '暂无数据' },
  },
  computed: {
    current() {
      const raw = this.modelValue !== undefined ? this.modelValue : this.value
      return Array.isArray(raw) ? raw.slice() : []
    },
    textKey() {
      return (this.map && this.map.text) || 'text'
    },
    valueKey() {
      return (this.map && this.map.value) || 'value'
    },
    disabledKey() {
      return (this.map && this.map.disabled) || 'disabled'
    },
    normalizedItems() {
      const list = Array.isArray(this.localdata) ? this.localdata : []
      return list.map((raw) => {
        if (raw == null || typeof raw !== 'object') {
          return { text: String(raw), value: raw, disabled: false }
        }
        return {
          text: raw[this.textKey] != null ? String(raw[this.textKey]) : '',
          value: raw[this.valueKey],
          disabled: !!raw[this.disabledKey],
        }
      })
    },
    minCount() {
      if (this.min === '' || this.min == null) return 0
      const n = Number(this.min)
      return Number.isFinite(n) ? n : 0
    },
    maxCount() {
      if (this.max === '' || this.max == null) return Infinity
      const n = Number(this.max)
      return Number.isFinite(n) ? n : Infinity
    },
  },
  methods: {
    isSelected(val) {
      return this.current.some((v) => String(v) === String(val))
    },
    emitValue(next) {
      this.$emit('update:modelValue', next)
      this.$emit('update:value', next)
      this.$emit('change', {
        value: next,
        detail: { value: next },
      })
    },
    onItemChange(val, on) {
      if (this.disabled) return
      const selected = this.isSelected(val)
      if (on && selected) return
      if (!on && !selected) return

      let next = this.current.slice()
      if (on) {
        if (next.length >= this.maxCount) return
        next.push(val)
      } else {
        if (next.length <= this.minCount) return
        next = next.filter((v) => String(v) !== String(val))
      }
      this.emitValue(next)
    },
  },
}
</script>

<style lang="scss">
.lingyun-data-checkbox {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.lingyun-data-checkbox__empty {
  display: block;
  padding: 12px 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #6a6a6a);
}
</style>
