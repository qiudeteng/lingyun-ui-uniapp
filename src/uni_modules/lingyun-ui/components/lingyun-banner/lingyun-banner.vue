<template>
  <view
    v-if="visible"
    class="lingyun-banner"
    :class="[
      rootClass,
      `lingyun-banner--overlay-${overlayKey}`,
      {
        'lingyun-banner--image': hasImage,
        'lingyun-banner--disabled': disabled,
      },
    ]"
    :style="rootStyle"
    :hover-class="disabled ? 'none' : 'lingyun-banner--hover'"
    :hover-start-time="20"
    :hover-stay-time="70"
    role="button"
    @click="onClick"
  >
    <image
      v-if="hasImage"
      class="lingyun-banner__image"
      :src="image"
      :mode="imageMode"
      lazy-load
    />
    <view
      v-if="hasImage && overlayKey !== 'none'"
      class="lingyun-banner__shade"
    />

    <view class="lingyun-banner__content">
      <slot>
        <text v-if="title" class="lingyun-banner__title">{{ title }}</text>
        <text v-if="description" class="lingyun-banner__desc">
          {{ description }}
        </text>
      </slot>

      <view
        v-if="$slots.action || actionText"
        class="lingyun-banner__action"
        role="button"
        @click.stop="onAction"
      >
        <slot name="action">
          <lingyun-icon
            v-if="actionIcon"
            :type="actionIcon"
            :size="14"
            color="white"
          />
          <text class="lingyun-banner__action-text">{{ actionText }}</text>
        </slot>
      </view>
    </view>

    <view
      v-if="closable"
      class="lingyun-banner__close"
      role="button"
      aria-label="关闭"
      @click.stop="onClose"
    >
      <lingyun-icon
        type="closeempty"
        :size="16"
        :color="hasImage ? 'white' : 'secondary'"
      />
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type { LingyunBannerOverlay } from './types'

const OVERLAYS: LingyunBannerOverlay[] = ['none', 'top', 'bottom', 'full']

/**
 * lingyun-banner
 * @description 页面营销横幅：图片 / 卡片、标题 / 说明 / 操作 / 关闭
 * @see design/BANNERS.md
 */
export default defineComponent({
  name: 'LingyunBanner',
  emits: ['click', 'action', 'close'],
  props: {
    image: { type: String, default: '' },
    imageMode: { type: String, default: 'aspectFill' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    actionText: { type: String, default: '' },
    actionIcon: { type: String, default: '' },
    overlay: {
      type: String as PropType<LingyunBannerOverlay>,
      default: 'bottom',
    },
    height: { type: Number, default: 160 },
    radius: { type: Number, default: 20 },
    backgroundColor: { type: String, default: '' },
    closable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  data(): { visible: boolean } {
    return { visible: true }
  },
  computed: {
    rootClass(): string {
      let themeClass = 'theme-light'
      try {
        themeClass = useLingyunTheme().rootClass || 'theme-light'
      } catch {
        /* pinia 未就绪 */
      }
      return themeClass
    },
    overlayKey(): LingyunBannerOverlay {
      return OVERLAYS.includes(this.overlay) ? this.overlay : 'bottom'
    },
    hasImage(): boolean {
      return !!String(this.image || '').trim()
    },
    resolvedHeight(): number {
      const value = Number(this.height)
      return Number.isFinite(value) && value > 0 ? value : 160
    },
    resolvedRadius(): number {
      const value = Number(this.radius)
      return Number.isFinite(value) && value >= 0 ? value : 20
    },
    rootStyle(): Record<string, string> {
      const style: Record<string, string> = {
        height: `${this.resolvedHeight}px`,
        borderRadius: `${this.resolvedRadius}px`,
      }
      if (!this.hasImage && this.backgroundColor) {
        style.backgroundColor = this.backgroundColor
      }
      return style
    },
  },
  methods: {
    onClick(): void {
      if (this.disabled) return
      this.$emit('click')
    },
    onAction(): void {
      if (this.disabled) return
      this.$emit('action')
    },
    onClose(): void {
      this.visible = false
      this.$emit('close')
    },
    show(): void {
      this.visible = true
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-banner {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-shadow: 0 0 0 0.5px var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-banner--hover {
  opacity: 0.9;
}

.lingyun-banner--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.lingyun-banner__image {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.lingyun-banner__shade {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.lingyun-banner--overlay-bottom .lingyun-banner__shade {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.62) 0%,
    rgba(0, 0, 0, 0.18) 58%,
    rgba(0, 0, 0, 0) 100%
  );
}

.lingyun-banner--overlay-top .lingyun-banner__shade {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.62) 0%,
    rgba(0, 0, 0, 0.18) 58%,
    rgba(0, 0, 0, 0) 100%
  );
}

.lingyun-banner--overlay-full .lingyun-banner__shade {
  background-color: rgba(0, 0, 0, 0.35);
}

.lingyun-banner__content {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 4px;
  padding: 16px;
  box-sizing: border-box;
}

.lingyun-banner--overlay-top .lingyun-banner__content {
  justify-content: flex-start;
}

.lingyun-banner--overlay-full .lingyun-banner__content {
  justify-content: center;
}

.lingyun-banner:not(.lingyun-banner--image) .lingyun-banner__content {
  justify-content: center;
}

.lingyun-banner__title {
  display: -webkit-box;
  overflow: hidden;
  font-size: 20px;
  line-height: 26px;
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.lingyun-banner--image .lingyun-banner__title {
  color: #ffffff;
}

.lingyun-banner__desc {
  display: -webkit-box;
  overflow: hidden;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.lingyun-banner--image .lingyun-banner__desc {
  color: rgba(255, 255, 255, 0.82);
}

.lingyun-banner__action {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  min-height: 32px;
  margin-top: 6px;
  padding: 0 12px;
  border-radius: 16px;
  background-color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-banner--image .lingyun-banner__action {
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 0 0 0.5px rgba(255, 255, 255, 0.36);
}

.lingyun-banner__action-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: #ffffff;
}

.lingyun-banner__close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-banner--image .lingyun-banner__close {
  background-color: rgba(0, 0, 0, 0.28);
}
</style>
