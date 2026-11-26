<template>
  <switch
    class="lingyun-switch"
    :checked="!!current"
    :disabled="disabled"
    :color="resolvedColor"
    @change="onChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'

/**
 * lingyun-switch
 * @see design/SWITCHES.md
 */
defineOptions({
  name: 'LingyunSwitch',
})

const props = defineProps({
  modelValue: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  checked: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  disabled: { type: Boolean, default: false },
  color: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'update:checked', 'change'])

const current = computed((): boolean => {
  if (props.modelValue !== undefined && props.modelValue !== null) return !!props.modelValue
  return !!props.checked
})

const resolvedColor = computed((): string => props.color || '#0088ff')

function onChange(e: Event): void {
  const detail = (e as unknown as { detail?: { value?: unknown } }).detail
  const next = !!(detail && detail.value)
  emit('update:modelValue', next)
  emit('update:checked', next)
  emit('change', next)
}
</script>

<style lang="scss">
.lingyun-switch {
  transform: scale(0.9);
  transform-origin: center right;
}
</style>
