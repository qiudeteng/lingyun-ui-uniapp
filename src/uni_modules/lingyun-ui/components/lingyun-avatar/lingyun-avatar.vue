<template>
  <view class="lingyun-avatar" :class="sizeClass" :style="rootStyle">
    <image
      v-if="src"
      class="lingyun-avatar__img"
      :src="src"
      mode="aspectFill"
    />
    <text v-else class="lingyun-avatar__text">{{ initials }}</text>
  </view>
</template>

<script>
/**
 * lingyun-avatar
 * @see design/AVATARS.md
 */
export default {
  name: 'LingyunAvatar',
  props: {
    src: { type: String, default: '' },
    text: { type: String, default: '' },
    size: { type: String, default: 'md' }, // sm | md | lg
    backgroundColor: { type: String, default: '' },
  },
  computed: {
    sizeClass() {
      const s = this.size === 'sm' || this.size === 'lg' ? this.size : 'md'
      return `lingyun-avatar--${s}`
    },
    initials() {
      const t = (this.text || '').trim()
      if (!t) return '?'
      const parts = t.split(/\s+/).filter(Boolean)
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      return t.slice(0, 2).toUpperCase()
    },
    rootStyle() {
      if (this.backgroundColor) return { backgroundColor: this.backgroundColor }
      return {}
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background-color: rgba(0, 136, 255, 0.18);
  flex-shrink: 0;
  box-sizing: border-box;
}

.lingyun-avatar--sm {
  width: 28px;
  height: 28px;
}

.lingyun-avatar--md {
  width: 40px;
  height: 40px;
}

.lingyun-avatar--lg {
  width: 64px;
  height: 64px;
}

.lingyun-avatar__img {
  width: 100%;
  height: 100%;
  display: block;
}

.lingyun-avatar__text {
  font-weight: 600;
  color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-avatar--sm .lingyun-avatar__text {
  font-size: 11px;
}

.lingyun-avatar--md .lingyun-avatar__text {
  font-size: 14px;
}

.lingyun-avatar--lg .lingyun-avatar__text {
  font-size: 22px;
}
</style>
