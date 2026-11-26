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

<script setup lang="ts">
import { computed } from 'vue'
import { type PropType } from 'vue'

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
defineOptions({
  name: 'LingyunDataRadio',
  virtualHost: true,
  styleIsolation: 'shared',
})

const props = defineProps({
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
})

const emit = defineEmits(['update:modelValue', 'update:value', 'change'])

const current = computed((): string | number | undefined => {
  if (props.modelValue !== undefined && props.modelValue !== null) return props.modelValue
  return props.value
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

const normalizedItems = computed((): DataRadioItem[] => {
  const list = Array.isArray(props.localdata) ? props.localdata : []
  return list.map((raw) => {
    if (raw == null || typeof raw !== 'object') {
      return { text: String(raw), value: raw as string | number, disabled: false }
    }
    const row = raw as Record<string, unknown>
    return {
      text: row[textKey.value] != null ? String(row[textKey.value]) : '',
      value: row[valueKey.value] as string | number,
      disabled: !!row[disabledKey.value],
    }
  })
})

function onGroupChange(next: string | number) {
  if (props.disabled) return
  emit('update:modelValue', next)
  emit('update:value', next)
  emit('change', {
    value: next,
    detail: { value: next },
  })
}
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
