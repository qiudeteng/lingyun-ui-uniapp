<template>
  <view class="lingyun-radio-group" role="radiogroup">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { provide, type PropType } from 'vue'

/**
 * lingyun-radio-group
 * @see design/CHECKS.md
 */
defineOptions({
  name: 'LingyunRadioGroup',
  options: { virtualHost: true },
  styleIsolation: 'shared',
})

const props = defineProps({
  modelValue: { type: [String, Number] as PropType<string | number | undefined>, default: undefined },
  value: { type: [String, Number] as PropType<string | number | undefined>, default: undefined },
})

const emit = defineEmits(['update:modelValue', 'update:value', 'change'])

const groupState = reactive({
  get current() {
    if (props.modelValue !== undefined && props.modelValue !== null) return props.modelValue
    return props.value
  },
  select(next: string | number) {
    emit('update:modelValue', next)
    emit('update:value', next)
    emit('change', next)
  },
})

provide('lingyunRadioGroup', groupState)
</script>

<style lang="scss">
.lingyun-radio-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}
</style>
