<template>
  <view class="lingyun-skeleton" :class="themeClass">
    <view v-if="avatar" class="lingyun-skeleton__row lingyun-skeleton__row--avatar">
      <view class="lingyun-skeleton__avatar lingyun-skeleton__pulse" />
      <view class="lingyun-skeleton__col">
        <view v-if="title" class="lingyun-skeleton__line lingyun-skeleton__line--title lingyun-skeleton__pulse" />
        <view class="lingyun-skeleton__line lingyun-skeleton__pulse" />
      </view>
    </view>
    <view v-else-if="title" class="lingyun-skeleton__line lingyun-skeleton__line--title lingyun-skeleton__pulse" />
    <view
      v-for="n in rowCount"
      :key="n"
      class="lingyun-skeleton__line lingyun-skeleton__pulse"
      :style="lineStyle(n)"
    />
  </view>
</template>

<script>
import { useThemeStore } from '@/stores/theme'

/**
 * lingyun-skeleton
 * @see design/SKELETONS.md
 */
export default {
  name: 'LingyunSkeleton',
  props: {
    rows: { type: Number, default: 3 },
    avatar: { type: Boolean, default: false },
    title: { type: Boolean, default: true },
  },
  computed: {
    rowCount() {
      return Math.max(0, Number(this.rows) || 0)
    },
    themeClass() {
      try {
        return useThemeStore().rootClass || 'theme-light'
      } catch {
        return 'theme-light'
      }
    },
  },
  methods: {
    lineStyle(n) {
      const widths = ['100%', '92%', '78%', '86%', '64%']
      return { width: widths[(n - 1) % widths.length] }
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0;
}

.lingyun-skeleton__row--avatar {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
}

.lingyun-skeleton__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.lingyun-skeleton__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(120, 120, 128, 0.18);
  flex-shrink: 0;
}

.lingyun-skeleton__line {
  height: 12px;
  border-radius: 6px;
  background-color: rgba(120, 120, 128, 0.16);
}

.lingyun-skeleton__line--title {
  height: 16px;
  width: 48%;
}

.lingyun-skeleton.theme-dark .lingyun-skeleton__avatar,
.lingyun-skeleton.theme-dark .lingyun-skeleton__line {
  background-color: rgba(235, 235, 245, 0.12);
}

.lingyun-skeleton__pulse {
  animation: lingyun-skeleton-pulse 1.2s ease-in-out infinite;
}

@keyframes lingyun-skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}
</style>
