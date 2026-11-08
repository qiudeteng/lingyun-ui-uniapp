<template>
  <view
    v-if="visible"
    class="lingyun-notice-bar"
    :class="[
      rootClass,
      `lingyun-notice-bar--${typeKey}`,
      { 'lingyun-notice-bar--multiline': multiline },
    ]"
    role="alert"
  >
    <view v-if="showIcon" class="lingyun-notice-bar__icon">
      <slot name="icon">
        <lingyun-icon
          :type="resolvedIcon"
          :size="18"
          :color="iconColor"
        />
      </slot>
    </view>

    <view class="lingyun-notice-bar__body">
      <slot>
        <text class="lingyun-notice-bar__text">{{ text }}</text>
      </slot>
    </view>

    <view
      v-if="$slots.action || actionText"
      class="lingyun-notice-bar__action"
      role="button"
      @click="onAction"
    >
      <slot name="action">
        <text class="lingyun-notice-bar__action-text">{{ actionText }}</text>
      </slot>
    </view>

    <view
      v-if="closable"
      class="lingyun-notice-bar__close"
      role="button"
      aria-label="关闭"
      @click="onClose"
    >
      <lingyun-icon type="closeempty" :size="16" color="tertiary" />
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type { LingyunNoticeBarType } from './types'

const TYPES: LingyunNoticeBarType[] = [
  'info',
  'success',
  'warning',
  'error',
  'default',
]

const DEFAULT_ICONS: Record<LingyunNoticeBarType, string> = {
  info: 'info',
  success: 'checkmarkempty',
  warning: 'info',
  error: 'closeempty',
  default: 'info',
}

const ICON_COLORS: Record<LingyunNoticeBarType, string> = {
  info: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'error',
  default: 'secondary',
}

/**
 * lingyun-notice-bar
 * @description 非模态通知条：信息 / 成功 / 警告 / 错误、操作与关闭
 * @see design/NOTICE_BARS.md
 */
export default defineComponent({
  name: 'LingyunNoticeBar',
  emits: ['close', 'action'],
  props: {
    text: { type: String, default: '' },
    type: {
      type: String as PropType<LingyunNoticeBarType>,
      default: 'info',
    },
    icon: { type: String, default: '' },
    showIcon: { type: Boolean, default: true },
    closable: { type: Boolean, default: false },
    actionText: { type: String, default: '' },
    multiline: { type: Boolean, default: false },
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
    typeKey(): LingyunNoticeBarType {
      return TYPES.includes(this.type) ? this.type : 'info'
    },
    resolvedIcon(): string {
      return this.icon || DEFAULT_ICONS[this.typeKey]
    },
    iconColor(): string {
      return ICON_COLORS[this.typeKey]
    },
  },
  methods: {
    onAction(): void {
      this.$emit('action')
    },
    onClose(): void {
      this.visible = false
      this.$emit('close')
    },
    /** 重新显示（关闭后可手动调用） */
    show(): void {
      this.visible = true
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-notice-bar {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 10px 12px;
  border-radius: 12px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  box-shadow: inset 0 0 0 0.5px var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-notice-bar--info {
  background-color: var(--lingyun-primary-soft, #{rgba($lingyun-system-blue, 0.14)});
  box-shadow: inset 0 0 0 0.5px var(--lingyun-primary-soft-border, #{rgba($lingyun-system-blue, 0.22)});
}

.lingyun-notice-bar--success {
  background-color: var(--lingyun-success-soft, #{rgba($lingyun-system-green, 0.12)});
  box-shadow: inset 0 0 0 0.5px var(--lingyun-success-soft-border, #{rgba($lingyun-system-green, 0.2)});
}

.lingyun-notice-bar--warning {
  background-color: var(--lingyun-warning-soft, #{rgba($lingyun-system-orange, 0.12)});
  box-shadow: inset 0 0 0 0.5px var(--lingyun-warning-soft-border, #{rgba($lingyun-system-orange, 0.2)});
}

.lingyun-notice-bar--error {
  background-color: var(--lingyun-error-soft, #{rgba($lingyun-system-red, 0.12)});
  box-shadow: inset 0 0 0 0.5px var(--lingyun-error-soft-border, #{rgba($lingyun-system-red, 0.2)});
}

.lingyun-notice-bar__icon {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}

.lingyun-notice-bar__body {
  flex: 1;
  min-width: 0;
}

.lingyun-notice-bar__text {
  display: block;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lingyun-notice-bar--multiline .lingyun-notice-bar__text {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

.lingyun-notice-bar--error .lingyun-notice-bar__text {
  color: var(--lingyun-error, #{$lingyun-error});
}

.lingyun-notice-bar__action {
  flex: 0 0 auto;
  min-height: 28px;
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.lingyun-notice-bar__action-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-notice-bar__close {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
</style>
