<template>
  <view
    class="lingyun-radio"
    :class="rootClass"
    role="radio"
    :aria-checked="isChecked ? 'true' : 'false'"
    :aria-disabled="disabled ? 'true' : 'false'"
    @click.stop="onTap"
  >
    <view class="lingyun-radio__ring" :style="ringStyle">
      <lingyun-icon
        v-if="isChecked"
        class="lingyun-radio__dot"
        type="smallcircle-filled"
        :size="12"
        :color="dotColor"
      />
    </view>
    <text v-if="label" class="lingyun-radio__label">{{ label }}</text>
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { inject, type PropType } from 'vue'

type RadioGroupContext = {
  current: string | number | undefined
  select?: (next: string | number) => void
}

/**
 * lingyun-radio（须放在 lingyun-radio-group 内）
 * 自绘环 + lingyun-icon 实心点（避免 mp 原生 radio 默认绿 / color 失效）
 * @see design/CHECKS.md
 */
defineOptions({
  name: 'LingyunRadio',
  virtualHost: true,
  styleIsolation: 'shared',
})

const props = defineProps({
  value: { type: [String, Number] as PropType<string | number>, required: true },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  color: { type: String, default: '' },
})

const lingyunRadioGroup = inject<RadioGroupContext | null>('lingyunRadioGroup', null)

const isChecked = computed(() => {
  const g = lingyunRadioGroup as RadioGroupContext | null
  if (!g) return false
  return String(g.current) === String(props.value)
})
const rootClass = computed(() => {
  return [
    isChecked.value ? 'lingyun-radio--on' : '',
    props.disabled ? 'lingyun-radio--disabled' : '',
  ].filter(Boolean)
})
const ringStyle = computed(() => {
  if (!isChecked.value || !props.color) return {}
  return { borderColor: props.color }
})
const dotColor = computed(() => {
  return props.color || 'var(--lingyun-primary, #0088ff)'
})

function onTap() {
  if (props.disabled) return
  const g = lingyunRadioGroup as RadioGroupContext | null
  if (g && typeof g.select === 'function') {
    g.select(props.value)
  }
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-radio {
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 44px;
  padding: 10px 0;
  gap: 10px;
}

.lingyun-radio--disabled {
  opacity: 0.4;
  pointer-events: none;
}

.lingyun-radio__ring {
  position: relative;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  box-sizing: border-box;
  border: 1.5px solid var(--lingyun-separator, rgba(60, 60, 67, 0.36));
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.lingyun-radio--on .lingyun-radio__ring {
  border-color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-radio__dot {
  line-height: 1;
  flex-shrink: 0;
}

.lingyun-radio__label {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}
</style>
