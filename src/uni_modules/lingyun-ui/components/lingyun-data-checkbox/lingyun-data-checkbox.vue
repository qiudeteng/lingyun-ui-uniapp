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

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

type DataFieldMap = {
  text?: string
  value?: string
  disabled?: string
}

type DataCheckboxItem = {
  text: string
  value: unknown
  disabled: boolean
}

/**
 * lingyun-data-checkbox
 * 数据驱动多选：localdata → 自绘 lingyun-checkbox
 * @see design/CHECKS.md
 */
export default defineComponent({
  name: 'LingyunDataCheckbox',
  emits: ['update:modelValue', 'update:value', 'change'],
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
  props: {
    modelValue: { type: Array as PropType<unknown[] | undefined>, default: undefined },
    value: { type: Array as PropType<unknown[] | undefined>, default: undefined },
    localdata: { type: Array as PropType<unknown[]>, default: () => [] as unknown[] },
    map: {
      type: Object as PropType<DataFieldMap>,
      default: () => ({ text: 'text', value: 'value', disabled: 'disabled' }),
    },
    disabled: { type: Boolean, default: false },
    color: { type: String, default: '' },
    min: { type: [Number, String] as PropType<number | string>, default: '' },
    max: { type: [Number, String] as PropType<number | string>, default: '' },
    emptyText: { type: String, default: '暂无数据' },
  },
  computed: {
    current(): unknown[] {
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
    normalizedItems(): DataCheckboxItem[] {
      const list = Array.isArray(this.localdata) ? this.localdata : []
      return list.map((raw) => {
        if (raw == null || typeof raw !== 'object') {
          return { text: String(raw), value: raw, disabled: false }
        }
        const row = raw as Record<string, unknown>
        return {
          text: row[this.textKey] != null ? String(row[this.textKey]) : '',
          value: row[this.valueKey],
          disabled: !!row[this.disabledKey],
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
    isSelected(val: unknown) {
      return this.current.some((v) => String(v) === String(val))
    },
    emitValue(next: unknown[]) {
      this.$emit('update:modelValue', next)
      this.$emit('update:value', next)
      this.$emit('change', {
        value: next,
        detail: { value: next },
      })
    },
    onItemChange(val: unknown, on: boolean) {
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
})
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
