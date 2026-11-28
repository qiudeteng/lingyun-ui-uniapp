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

<script setup lang="ts">
import { computed } from 'vue'
import { type PropType } from 'vue'

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
defineOptions({
  name: 'LingyunDataCheckbox',
  options: { virtualHost: true },
  styleIsolation: 'shared',
})

const props = defineProps({
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
})

const emit = defineEmits(['update:modelValue', 'update:value', 'change'])

const current = computed((): unknown[] => {
  const raw = props.modelValue !== undefined ? props.modelValue : props.value
  return Array.isArray(raw) ? raw.slice() : []
})
const textKey = computed(() => {
  return (props.map && props.map.text) || 'text'
})
const valueKey = computed(() => {
  return (props.map && props.map.value) || 'value'
})
const disabledKey = computed(() => {
  return (props.map && props.map.disabled) || 'disabled'
})
const normalizedItems = computed((): DataCheckboxItem[] => {
  const list = Array.isArray(props.localdata) ? props.localdata : []
  return list.map((raw) => {
    if (raw == null || typeof raw !== 'object') {
      return { text: String(raw), value: raw, disabled: false }
    }
    const row = raw as Record<string, unknown>
    return {
      text: row[textKey.value] != null ? String(row[textKey.value]) : '',
      value: row[valueKey.value],
      disabled: !!row[disabledKey.value],
    }
  })
})
const minCount = computed(() => {
  if (props.min === '' || props.min == null) return 0
  const n = Number(props.min)
  return Number.isFinite(n) ? n : 0
})
const maxCount = computed(() => {
  if (props.max === '' || props.max == null) return Infinity
  const n = Number(props.max)
  return Number.isFinite(n) ? n : Infinity
})

function isSelected(val: unknown) {
  return current.value.some((v) => String(v) === String(val))
}

function emitValue(next: unknown[]) {
  emit('update:modelValue', next)
  emit('update:value', next)
  emit('change', {
    value: next,
    detail: { value: next },
  })
}

function onItemChange(val: unknown, on: boolean) {
  if (props.disabled) return
  const selected = isSelected(val)
  if (on && selected) return
  if (!on && !selected) return

  let next = current.value.slice()
  if (on) {
    if (next.length >= maxCount.value) return
    next.push(val)
  } else {
    if (next.length <= minCount.value) return
    next = next.filter((v) => String(v) !== String(val))
  }
  emitValue(next)
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
