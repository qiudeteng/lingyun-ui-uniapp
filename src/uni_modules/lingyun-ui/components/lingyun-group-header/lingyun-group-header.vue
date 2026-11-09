<template>
  <view
    v-if="hasTitle || hasAction"
    class="lingyun-group-header"
    :class="[
      `lingyun-group-header--${resolvedType}`,
      { 'lingyun-group-header--inset': inset },
    ]"
  >
    <view class="lingyun-group-header__title">
      <slot name="title">
        <text v-if="title" class="lingyun-group-header__title-text">{{ title }}</text>
        <slot />
      </slot>
    </view>
    <view
      v-if="hasAction"
      class="lingyun-group-header__action"
      hover-class="lingyun-group-header__action--hover"
      :hover-start-time="20"
      :hover-stay-time="70"
      @click="onAction"
    >
      <slot name="action">
        <text class="lingyun-group-header__action-text">{{ action }}</text>
      </slot>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * lingyun-group-header
 * 分组卡片上方的分组标题（List Header · Nested / Prominent / Extra Prominent）。
 * 统一高度、字阶、次级色与右侧操作；lingyun-list 的 header 也走这里。
 * @see design/LISTS.md
 */
export default defineComponent({
  name: 'LingyunGroupHeader',
  emits: ['action'],
  props: {
    title: { type: String, default: '' },
    /** nested / prominent / extraProminent（也接受 extra-prominent） */
    type: { type: String, default: 'nested' },
    action: { type: String, default: '' },
    /** 左右 16px 页边内距；放进已有 16px 容器的页面可设 false */
    inset: { type: Boolean, default: true },
  },
  computed: {
    resolvedType(): string {
      const raw = String(this.type || '').trim()
      const map: Record<string, string> = {
        extraProminent: 'extra-prominent',
        'extra-prominent': 'extra-prominent',
        prominent: 'prominent',
        nested: 'nested',
      }
      return map[raw] || 'nested'
    },
    hasTitle(): boolean {
      return !!(this.title || this.$slots.title || this.$slots.default)
    },
    hasAction(): boolean {
      return !!(this.action || this.$slots.action)
    },
  },
  methods: {
    onAction(): void {
      this.$emit('action')
    },
  },
})
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.lingyun-group-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  padding: 10px 0;

  &--inset {
    padding-left: 16px;
    padding-right: 16px;
  }

  &--extra-prominent {
    height: 48px;
  }

  &--prominent {
    height: 45px;
  }

  &--nested {
    height: 42px;
  }

  &__title {
    flex: 1;
    min-width: 0;
  }

  &__title-text {
    display: block;
    color: var(--lingyun-label, #{$lingyun-label});
  }

  &--extra-prominent &__title-text {
    font-size: 20px;
    font-weight: 600;
    line-height: 26px;
    letter-spacing: -0.45px;
  }

  &--prominent &__title-text {
    font-size: 17px;
    font-weight: 600;
    line-height: 24px;
    letter-spacing: -0.43px;
  }

  &--nested &__title-text {
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: -0.08px;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }

  &__action {
    flex-shrink: 0;
    padding: 2px 0;
  }

  &__action-text {
    font-size: 17px;
    font-weight: 400;
    line-height: 22px;
    color: var(--lingyun-primary, #{$lingyun-primary});
  }

  &__action--hover {
    opacity: 0.55;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lingyun-group-header__action {
    transition: none;
  }
}
</style>
