<template>
  <view
    class="lingyun-chip"
    :class="rootClass"
    @click="onClick"
  >
    <text class="lingyun-chip__text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type PropType } from 'vue'

/**
 * lingyun-chip · 可选中筛选胶囊
 * @see design/TAGS.md
 */
defineOptions({
  name: 'LingyunChip',
})

const props = defineProps({
  text: { type: String, default: '' },
  selected: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  modelValue: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  selectable: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:selected', 'update:modelValue', 'change', 'click'])

const isSelected = computed(() => {
  if (props.modelValue !== undefined && props.modelValue !== null) return !!props.modelValue
  return !!props.selected
})
const rootClass = computed(() => {
  return [
    isSelected.value ? 'lingyun-chip--selected' : '',
    props.disabled ? 'lingyun-chip--disabled' : '',
  ].filter(Boolean)
})

function onClick(e: Event) {
  if (props.disabled) return
  emit('click', e)
  if (!props.selectable) return
  const next = !isSelected.value
  emit('update:selected', next)
  emit('update:modelValue', next)
  emit('change', next)
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
