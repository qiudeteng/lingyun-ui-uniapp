<template>
  <switch
    class="lingyun-switch"
    :checked="!!current"
    :disabled="disabled"
    :color="resolvedColor"
    @change="onChange"
  />
</template>

<script>
/**
 * lingyun-switch
 * @see design/SWITCHES.md
 */
export default {
  name: 'LingyunSwitch',
  emits: ['update:modelValue', 'update:checked', 'change'],
  props: {
    modelValue: { type: Boolean, default: undefined },
    checked: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: false },
    color: { type: String, default: '' },
  },
  computed: {
    current() {
      if (this.modelValue !== undefined && this.modelValue !== null) return !!this.modelValue
      return !!this.checked
    },
    resolvedColor() {
      return this.color || '#0088ff'
    },
  },
  methods: {
    onChange(e) {
      const next = !!(e && e.detail && e.detail.value)
      this.$emit('update:modelValue', next)
      this.$emit('update:checked', next)
      this.$emit('change', next)
    },
  },
}
</script>

<style lang="scss">
.lingyun-switch {
  transform: scale(0.9);
  transform-origin: center right;
}
</style>
