<template>
  <view
    v-if="mounted"
    class="lingyun-hud"
    :class="rootClass"
    :style="rootStyle"
  >
    <view
      class="lingyun-hud__overlay"
      @click="onOverlayClick"
      @touchmove.stop.prevent
    />
    <view class="lingyun-hud__lift">
      <view class="lingyun-hud__panel">
        <lingyun-activity-indicator size="large" />
        <text v-if="text" class="lingyun-hud__text">{{ text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { useThemeStore } from '@/stores/theme'
import { LINGYUN_APP_PAGE_SCROLL_LOCK } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

/**
 * lingyun-hud
 * @see design/TOASTS.md
 */
const LEAVE_MS = 240
const ENTER_KICK_MS = 40

export default {
  name: 'LingyunHud',
  emits: ['update:show', 'update:modelValue', 'close'],
  inject: {
    appPageScrollLock: {
      from: LINGYUN_APP_PAGE_SCROLL_LOCK,
      default: null,
    },
  },
  props: {
    show: { type: Boolean, default: undefined },
    modelValue: { type: Boolean, default: undefined },
    text: { type: String, default: '' },
    maskClosable: { type: Boolean, default: false },
    zIndex: { type: [Number, String], default: 1200 },
  },
  data() {
    return {
      mounted: false,
      phase: '',
      leaveTimer: null,
      enterTimer: null,
      _appScrollLocked: false,
    }
  },
  computed: {
    visible() {
      if (this.show !== undefined && this.show !== null) return !!this.show
      if (this.modelValue !== undefined && this.modelValue !== null) return !!this.modelValue
      return false
    },
    rootClass() {
      let themeClass = 'theme-light'
      try {
        themeClass = useThemeStore().rootClass || 'theme-light'
      } catch {
        /* ignore */
      }
      return [themeClass, this.phase ? `lingyun-hud--${this.phase}` : ''].filter(Boolean).join(' ')
    },
    rootStyle() {
      return { zIndex: Number(this.zIndex) || 1200 }
    },
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        if (val) {
          this.lockPageScroll()
          this.openAnim()
        } else {
          this.closeAnim()
        }
      },
    },
  },
  beforeUnmount() {
    this.clearTimers()
    this.unlockPageScroll()
  },
  methods: {
    clearTimers() {
      if (this.leaveTimer) clearTimeout(this.leaveTimer)
      if (this.enterTimer) clearTimeout(this.enterTimer)
      this.leaveTimer = null
      this.enterTimer = null
    },
    openAnim() {
      this.clearTimers()
      this.mounted = true
      this.phase = 'enter'
      this.$nextTick(() => {
        const kick = () => {
          this.enterTimer = setTimeout(() => {
            this.phase = 'open'
            this.enterTimer = null
          }, ENTER_KICK_MS)
        }
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => requestAnimationFrame(kick))
        } else {
          kick()
        }
      })
    },
    closeAnim() {
      this.clearTimers()
      if (!this.mounted) {
        this.unlockPageScroll()
        return
      }
      this.phase = 'leave'
      this.leaveTimer = setTimeout(() => {
        this.mounted = false
        this.phase = ''
        this.leaveTimer = null
        this.unlockPageScroll()
      }, LEAVE_MS)
    },
    setVisible(next) {
      const val = !!next
      this.$emit('update:show', val)
      this.$emit('update:modelValue', val)
      if (!val) this.$emit('close')
    },
    close() {
      this.setVisible(false)
    },
    onOverlayClick() {
      if (!this.maskClosable) return
      this.close()
    },
    lockPageScroll() {
      try {
        const lockApi = this.appPageScrollLock
        if (lockApi && typeof lockApi.lock === 'function' && !this._appScrollLocked) {
          lockApi.lock()
          this._appScrollLocked = true
        }
      } catch {
        /* ignore */
      }
    },
    unlockPageScroll() {
      try {
        const lockApi = this.appPageScrollLock
        if (this._appScrollLocked && lockApi && typeof lockApi.unlock === 'function') {
          lockApi.unlock()
        }
        this._appScrollLocked = false
      } catch {
        this._appScrollLocked = false
      }
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-hud {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  pointer-events: auto;
}

.lingyun-hud__overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: var(--lingyun-mask, #{$lingyun-mask});
  opacity: 0;
  transition: opacity 0.28s ease-out;
}

.lingyun-hud.theme-dark .lingyun-hud__overlay {
  background-color: rgba(0, 0, 0, 0.52);
}

.lingyun-hud__lift {
  position: relative;
  z-index: 1;
  transform: scale(1.08);
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
}

.lingyun-hud__panel {
  min-width: 120px;
  min-height: 120px;
  padding: 24px 28px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border-radius: 16px;
  @include lingyun-glass-surface;
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  box-shadow:
    var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    0 8px 48px rgba(0, 0, 0, 0.25);
}

.lingyun-hud.theme-dark .lingyun-hud__panel {
  border: #{$lingyun-glass-hairline-dark};
  background-color: #{$lingyun-glass-overlay-bg-dark};
  box-shadow: #{$lingyun-glass-highlight-dark}, 0 8px 48px rgba(0, 0, 0, 0.45);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-hud__text {
  font-size: 15px;
  line-height: 20px;
  text-align: center;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-hud--enter {
  .lingyun-hud__overlay {
    opacity: 0;
  }
  .lingyun-hud__lift {
    transform: scale(1.08);
  }
}

.lingyun-hud--open {
  .lingyun-hud__overlay {
    opacity: 1;
  }
  .lingyun-hud__lift {
    transform: scale(1);
  }
}

.lingyun-hud--leave {
  pointer-events: none;

  .lingyun-hud__overlay {
    opacity: 0;
    transition: opacity 0.2s ease-in;
  }
  .lingyun-hud__lift {
    transform: scale(0.96);
    transition: transform 0.22s ease-in;
  }
}
</style>
