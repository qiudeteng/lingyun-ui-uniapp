<template>
  <view class="lingyun-radio-group" role="radiogroup">
    <slot />
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

/**
 * lingyun-radio-group
 * @see design/CHECKS.md
 */
export default defineComponent({
  name: 'LingyunRadioGroup',
  emits: ['update:modelValue', 'update:value', 'change'],
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
  props: {
    modelValue: { type: [String, Number] as PropType<string | number | undefined>, default: undefined },
    value: { type: [String, Number] as PropType<string | number | undefined>, default: undefined },
  },
  provide() {
    return {
      lingyunRadioGroup: this,
    }
  },
  computed: {
    current() {
      if (this.modelValue !== undefined && this.modelValue !== null) return this.modelValue
      return this.value
    },
  },
  methods: {
    select(next: string | number) {
      this.$emit('update:modelValue', next)
      this.$emit('update:value', next)
      this.$emit('change', next)
    },
  },
})
</script>

<style lang="scss">
.lingyun-radio-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}
</style>
