<template>
  <view
    class="lingyun-empty"
    :class="[
      `lingyun-empty--${resolvedVariant}`,
      {
        'lingyun-empty--fill': fill,
        'lingyun-empty--action-bottom': actionPlacement === 'bottom' && hasAction,
      },
    ]"
  >
    <view class="lingyun-empty__body">
      <view
        v-if="showIcon"
        class="lingyun-empty__icon-wrap"
        :class="{ 'lingyun-empty__icon-wrap--circle': resolvedVariant === 'circle' }"
      >
        <slot name="icon">
          <text
            v-if="icon"
            class="lingyun-empty__icon"
            :style="iconStyle"
          >{{ icon }}</text>
          <view
            v-else-if="resolvedVariant !== 'plain'"
            class="lingyun-empty__icon-fallback"
            aria-hidden="true"
          />
        </slot>
      </view>
      <text v-if="title" class="lingyun-empty__title">{{ title }}</text>
      <text v-if="descText" class="lingyun-empty__desc">{{ descText }}</text>
      <view
        v-if="hasAction && actionPlacement === 'inline'"
        class="lingyun-empty__action lingyun-empty__action--inline"
      >
        <slot name="action" />
      </view>
      <slot />
    </view>
    <view
      v-if="hasAction && actionPlacement === 'bottom'"
      class="lingyun-empty__action lingyun-empty__action--bottom"
    >
      <slot name="action" />
    </view>
  </view>
</template>

<script>
/**
 * lingyun-empty
 * Sketch Examples/Empty State：plain · symbol · circle
 * @see design/EMPTY.md
 */
export default {
  name: 'LingyunEmpty',
  props: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    desc: { type: String, default: '' },
    icon: { type: String, default: '' },
    /** plain | symbol | circle；空则按是否有 icon 推断 */
    variant: { type: String, default: '' },
    iconColor: { type: String, default: '' },
    /** 撑满父高并垂直居中正文 */
    fill: { type: Boolean, default: false },
    /** inline | bottom */
    actionPlacement: { type: String, default: 'inline' },
  },
  computed: {
    descText() {
      return this.description || this.desc || ''
    },
    hasIconSlot() {
      return !!(this.$slots && this.$slots.icon)
    },
    hasAction() {
      return !!(this.$slots && this.$slots.action)
    },
    resolvedVariant() {
      const v = (this.variant || '').trim()
      if (v === 'plain' || v === 'symbol' || v === 'circle') return v
      if (this.icon || this.hasIconSlot) return 'symbol'
      return 'plain'
    },
    showIcon() {
      if (this.resolvedVariant === 'plain') {
        return this.hasIconSlot || !!this.icon
      }
      return true
    },
    iconStyle() {
      if (!this.iconColor) return {}
      return { color: this.iconColor }
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-empty {
  box-sizing: border-box;
  width: 100%;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.lingyun-empty--fill {
  min-height: 100%;
  flex: 1;
}

.lingyun-empty--action-bottom {
  padding-bottom: 16px;
}

.lingyun-empty__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
}

.lingyun-empty--fill .lingyun-empty__body {
  flex: 1;
}

.lingyun-empty__icon-wrap {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-empty__icon-wrap--circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-empty__icon {
  font-size: 64px;
  line-height: 80px;
  text-align: center;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-empty--circle .lingyun-empty__icon {
  font-size: 36px;
  line-height: 80px;
}

.lingyun-empty__icon-fallback {
  width: 80px;
  height: 80px;
  border-radius: 18px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-empty--circle .lingyun-empty__icon-fallback {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  opacity: 0.45;
}

.lingyun-empty__title {
  width: 100%;
  max-width: 338px;
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  text-align: center;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-empty__desc {
  width: 100%;
  max-width: 338px;
  margin-top: 4px;
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  text-align: center;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-empty__action {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
}

.lingyun-empty__action--inline {
  margin-top: 20px;
  max-width: 240px;
  align-self: center;
}

.lingyun-empty__action--bottom {
  margin-top: 24px;
  padding: 0 0 env(safe-area-inset-bottom);
  flex-shrink: 0;
}
</style>
