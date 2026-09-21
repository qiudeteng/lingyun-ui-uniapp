<template>
  <view v-if="mounted" class="lingyun-toast" :class="rootClass" :style="rootStyle">
    <view class="lingyun-toast__lift">
      <view class="lingyun-toast__panel">
        <lingyun-activity-indicator
          v-if="typeKey === 'loading'"
          size="small"
          class="lingyun-toast__spin"
        />
        <text v-if="typeKey === 'success'" class="lingyun-toast__mark lingyun-toast__mark--ok">✓</text>
        <text v-if="typeKey === 'error'" class="lingyun-toast__mark lingyun-toast__mark--err">!</text>
        <text v-if="text" class="lingyun-toast__text">{{ text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { useThemeStore } from '@/stores/theme'

/**
 * lingyun-toast
 * @see design/TOASTS.md
 * 玻璃节点不做 opacity；显隐用 mounted + lift 过渡
 */
const LEAVE_MS = 220
const ENTER_KICK_MS = 32

export default {
  name: 'LingyunToast',
  emits: ['update:show', 'update:modelValue', 'close'],
  props: {
    show: { type: Boolean, default: undefined },
    modelValue: { type: Boolean, default: undefined },
    text: { type: String, default: '' },
    type: { type: String, default: 'default' },
    duration: { type: Number, default: 2000 },
    zIndex: { type: [Number, String], default: 1200 },
  },
  data() {
    return {
      mounted: false,
      phase: '',
      leaveTimer: null,
      enterTimer: null,
      autoTimer: null,
    }
  },
  computed: {
    visible() {
      if (this.show !== undefined && this.show !== null) return !!this.show
      if (this.modelValue !== undefined && this.modelValue !== null) return !!this.modelValue
      return false
    },
    typeKey() {
      const t = this.type
      if (t === 'success' || t === 'error' || t === 'loading') return t
      return 'default'
    },
    rootClass() {
      let themeClass = 'theme-light'
      try {
        themeClass = useThemeStore().rootClass || 'theme-light'
      } catch {
        /* ignore */
      }
      return [themeClass, this.phase ? `lingyun-toast--${this.phase}` : ''].filter(Boolean).join(' ')
    },
    rootStyle() {
      return { zIndex: Number(this.zIndex) || 1200 }
    },
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        if (val) this.openAnim()
        else this.closeAnim()
      },
    },
  },
  beforeUnmount() {
    this.clearTimers()
  },
  methods: {
    clearTimers() {
      ;['leaveTimer', 'enterTimer', 'autoTimer'].forEach((k) => {
        if (this[k]) {
          clearTimeout(this[k])
          this[k] = null
        }
      })
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
            this.scheduleAutoClose()
          }, ENTER_KICK_MS)
        }
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => requestAnimationFrame(kick))
        } else {
          kick()
        }
      })
    },
    scheduleAutoClose() {
      if (this.typeKey === 'loading') return
      const d = Number(this.duration)
      if (!d || d <= 0) return
      this.autoTimer = setTimeout(() => {
        this.autoTimer = null
        this.setVisible(false)
      }, d)
    },
    closeAnim() {
      this.clearTimers()
      if (!this.mounted) return
      this.phase = 'leave'
      this.leaveTimer = setTimeout(() => {
        this.mounted = false
        this.phase = ''
        this.leaveTimer = null
      }, LEAVE_MS)
    },
    setVisible(next) {
      const val = !!next
      this.$emit('update:show', val)
      this.$emit('update:modelValue', val)
      if (!val) this.$emit('close')
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-toast {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40px;
  pointer-events: none;
  box-sizing: border-box;
}

.lingyun-toast__lift {
  transform: translate3d(0, 12px, 0);
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
}

.lingyun-toast__panel {
  max-width: 280px;
  min-height: 44px;
  padding: 12px 18px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 14px;
  @include lingyun-glass-surface;
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  box-shadow:
    var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    var(--lingyun-glass-shadow, #{$lingyun-glass-shadow});
}

.lingyun-toast.theme-dark .lingyun-toast__panel {
  border: #{$lingyun-glass-hairline-dark};
  background-color: #{$lingyun-glass-overlay-bg-dark};
  box-shadow: #{$lingyun-glass-highlight-dark}, #{$lingyun-glass-shadow-dark};
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-toast__text {
  font-size: 15px;
  line-height: 20px;
  text-align: center;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-toast__mark {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
  color: #fff;
}

.lingyun-toast__mark--ok {
  background-color: var(--lingyun-success, #{$lingyun-success});
}

.lingyun-toast__mark--err {
  background-color: var(--lingyun-error, #{$lingyun-error});
}

.lingyun-toast--enter .lingyun-toast__lift {
  transform: translate3d(0, 12px, 0);
}

.lingyun-toast--open .lingyun-toast__lift {
  transform: translate3d(0, 0, 0);
}

.lingyun-toast--leave .lingyun-toast__lift {
  transform: translate3d(0, 8px, 0);
  transition: transform 0.2s ease-in;
}
</style>
