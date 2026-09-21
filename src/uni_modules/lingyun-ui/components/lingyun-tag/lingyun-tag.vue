<template>
  <view class="lingyun-tag" :class="rootClass" @click="onClick">
    <text class="lingyun-tag__text">{{ text }}</text>
  </view>
</template>

<script>
/**
 * lingyun-tag
 * @see design/TAGS.md
 */
export default {
  name: 'LingyunTag',
  emits: ['click'],
  props: {
    text: { type: String, default: '' },
    variant: { type: String, default: 'fill' }, // fill | outline
    color: { type: String, default: 'blue' }, // blue | green | orange | red | gray
  },
  computed: {
    rootClass() {
      const v = this.variant === 'outline' ? 'outline' : 'fill'
      const c = ['blue', 'green', 'orange', 'red', 'gray'].indexOf(this.color) >= 0 ? this.color : 'blue'
      return [`lingyun-tag--${v}`, `lingyun-tag--${c}`]
    },
  },
  methods: {
    onClick(e) {
      this.$emit('click', e)
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 6px;
  box-sizing: border-box;
}

.lingyun-tag__text {
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}

.lingyun-tag--fill.lingyun-tag--blue {
  background-color: rgba(0, 136, 255, 0.14);
}
.lingyun-tag--fill.lingyun-tag--blue .lingyun-tag__text {
  color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-tag--fill.lingyun-tag--green {
  background-color: rgba(52, 199, 89, 0.16);
}
.lingyun-tag--fill.lingyun-tag--green .lingyun-tag__text {
  color: var(--lingyun-success, #{$lingyun-system-green});
}

.lingyun-tag--fill.lingyun-tag--orange {
  background-color: rgba(255, 141, 40, 0.16);
}
.lingyun-tag--fill.lingyun-tag--orange .lingyun-tag__text {
  color: #{$lingyun-system-orange};
}

.lingyun-tag--fill.lingyun-tag--red {
  background-color: rgba(255, 56, 60, 0.14);
}
.lingyun-tag--fill.lingyun-tag--red .lingyun-tag__text {
  color: var(--lingyun-error, #{$lingyun-system-red});
}

.lingyun-tag--fill.lingyun-tag--gray {
  background-color: rgba(142, 142, 147, 0.16);
}
.lingyun-tag--fill.lingyun-tag--gray .lingyun-tag__text {
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-tag--outline {
  background-color: transparent;
  border-width: 1px;
  border-style: solid;
}

.lingyun-tag--outline.lingyun-tag--blue {
  border-color: rgba(0, 136, 255, 0.45);
}
.lingyun-tag--outline.lingyun-tag--blue .lingyun-tag__text {
  color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-tag--outline.lingyun-tag--green {
  border-color: rgba(52, 199, 89, 0.45);
}
.lingyun-tag--outline.lingyun-tag--green .lingyun-tag__text {
  color: var(--lingyun-success, #{$lingyun-system-green});
}

.lingyun-tag--outline.lingyun-tag--orange {
  border-color: rgba(255, 141, 40, 0.45);
}
.lingyun-tag--outline.lingyun-tag--orange .lingyun-tag__text {
  color: #{$lingyun-system-orange};
}

.lingyun-tag--outline.lingyun-tag--red {
  border-color: rgba(255, 56, 60, 0.45);
}
.lingyun-tag--outline.lingyun-tag--red .lingyun-tag__text {
  color: var(--lingyun-error, #{$lingyun-system-red});
}

.lingyun-tag--outline.lingyun-tag--gray {
  border-color: rgba(142, 142, 147, 0.45);
}
.lingyun-tag--outline.lingyun-tag--gray .lingyun-tag__text {
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}
</style>
