<template>
  <view class="lingyun-data-radio" role="radiogroup">
    <text v-if="!normalizedItems.length" class="lingyun-data-radio__empty">{{ emptyText }}</text>
    <lingyun-radio-group v-else :model-value="current" @change="onGroupChange">
      <lingyun-radio
        v-for="item in normalizedItems"
        :key="String(item.value)"
        :value="item.value"
        :label="item.text"
        :disabled="disabled || item.disabled"
        :color="color"
      />
    </lingyun-radio-group>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

type DataFieldMap = {
  text?: string
  value?: string
  disabled?: string
}

type DataRadioItem = {
  text: string
  value: string | number
  disabled: boolean
}

/**
 * lingyun-data-radio
 * 数据驱动单选：localdata → lingyun-radio-group + lingyun-radio
 * @see design/CHECKS.md
 */
export default defineComponent({
  name: 'LingyunDataRadio',
  emits: ['update:modelValue', 'update:value', 'change'],
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
  props: {
    modelValue: { type: [String, Number] as PropType<string | number | undefined>, default: undefined },
    value: { type: [String, Number] as PropType<string | number | undefined>, default: undefined },
    localdata: { type: Array as PropType<unknown[]>, default: () => [] as unknown[] },
    map: {
      type: Object as PropType<DataFieldMap>,
      default: () => ({ text: 'text', value: 'value', disabled: 'disabled' }),
    },
    disabled: { type: Boolean, default: false },
    color: { type: String, default: '' },
    emptyText: { type: String, default: '暂无数据' },
  },
  computed: {
    current(): string | number | undefined {
      if (this.modelValue !== undefined && this.modelValue !== null) return this.modelValue
      return this.value
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
    normalizedItems(): DataRadioItem[] {
      const list = Array.isArray(this.localdata) ? this.localdata : []
      return list.map((raw) => {
        if (raw == null || typeof raw !== 'object') {
          return { text: String(raw), value: raw as string | number, disabled: false }
        }
        const row = raw as Record<string, unknown>
        return {
          text: row[this.textKey] != null ? String(row[this.textKey]) : '',
          value: row[this.valueKey] as string | number,
          disabled: !!row[this.disabledKey],
        }
      })
    },
  },
  methods: {
    onGroupChange(next: string | number) {
      if (this.disabled) return
      this.$emit('update:modelValue', next)
      this.$emit('update:value', next)
      this.$emit('change', {
        value: next,
        detail: { value: next },
      })
    },
  },
})
</script>

<style lang="scss">
.lingyun-data-radio {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.lingyun-data-radio__empty {
  display: block;
  padding: 12px 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #6a6a6a);
}
</style>
