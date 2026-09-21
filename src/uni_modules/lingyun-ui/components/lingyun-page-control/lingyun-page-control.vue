<template>
  <view class="lingyun-page-control">
    <view
      v-for="i in count"
      :key="i"
      class="lingyun-page-control__dot"
      :class="{ 'lingyun-page-control__dot--active': i - 1 === currentIndex }"
      @click="onDot(i - 1)"
    />
  </view>
</template>

<script>
/**
 * lingyun-page-control
 * @see design/PAGE_CONTROLS.md
 */
export default {
  name: 'LingyunPageControl',
  emits: ['update:modelValue', 'update:current', 'change'],
  props: {
    modelValue: { type: Number, default: undefined },
    current: { type: Number, default: undefined },
    count: { type: Number, default: 3 },
  },
  computed: {
    currentIndex() {
      const v =
        this.modelValue !== undefined && this.modelValue !== null
          ? Number(this.modelValue)
          : Number(this.current || 0)
      const max = Math.max(0, Number(this.count) - 1)
      return Math.min(Math.max(0, v), max)
    },
  },
  methods: {
    onDot(index) {
      this.$emit('update:modelValue', index)
      this.$emit('update:current', index)
      this.$emit('change', index)
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-page-control {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
}

.lingyun-page-control__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(120, 120, 128, 0.32);
}

.lingyun-page-control__dot--active {
  background-color: var(--lingyun-label, #{$lingyun-label});
  width: 8px;
  height: 8px;
}
</style>
