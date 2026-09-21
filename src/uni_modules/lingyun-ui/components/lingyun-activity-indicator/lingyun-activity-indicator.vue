<template>
  <view
    v-if="visible"
    class="lingyun-activity-indicator"
    :class="rootClass"
    :style="rootStyle"
    aria-hidden="true"
  />
</template>

<script>
/**
 * lingyun-activity-indicator
 * @description 环形转圈加载；Toast/HUD/页面内嵌复用
 * @see design/ACTIVITY_INDICATORS.md
 */
export default {
  name: 'LingyunActivityIndicator',
  props: {
    size: { type: String, default: 'medium' },
    color: { type: String, default: '' },
    animating: { type: Boolean, default: true },
    hidesWhenStopped: { type: Boolean, default: true },
  },
  computed: {
    sizeKey() {
      const s = this.size
      if (s === 'small' || s === 'large') return s
      return 'medium'
    },
    visible() {
      if (this.animating) return true
      return this.hidesWhenStopped === false
    },
    rootClass() {
      return [
        `lingyun-activity-indicator--${this.sizeKey}`,
        this.animating ? 'lingyun-activity-indicator--spin' : '',
      ]
    },
    rootStyle() {
      if (!this.color) return {}
      return { borderTopColor: this.color, borderRightColor: this.color }
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-activity-indicator {
  box-sizing: border-box;
  border-radius: 50%;
  border-style: solid;
  border-color: rgba(0, 136, 255, 0.22);
  border-top-color: var(--lingyun-primary, #{$lingyun-primary});
  border-right-color: var(--lingyun-primary, #{$lingyun-primary});
}

.lingyun-activity-indicator--small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.lingyun-activity-indicator--medium {
  width: 28px;
  height: 28px;
  border-width: 2.5px;
}

.lingyun-activity-indicator--large {
  width: 36px;
  height: 36px;
  border-width: 3px;
}

.lingyun-activity-indicator--spin {
  animation: lingyun-activity-spin 0.75s linear infinite;
}

@keyframes lingyun-activity-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
