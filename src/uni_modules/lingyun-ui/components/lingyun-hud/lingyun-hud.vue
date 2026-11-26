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

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { inject, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { syncLingyunMpOverlayHold } from '../../utils/mp-overlay-gate'
import {
  LINGYUN_APP_PAGE_SCROLL_LOCK,
  type LingyunAppPageScrollLock,
} from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

/**
 * lingyun-hud
 * @see design/TOASTS.md
 */
const LEAVE_MS = 240
const ENTER_KICK_MS = 40

defineOptions({
  name: 'LingyunHud',
})

const props = defineProps({
  show: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  modelValue: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  text: { type: String, default: '' },
  maskClosable: { type: Boolean, default: false },
  zIndex: { type: [Number, String] as PropType<number | string>, default: 1200 },
})

const emit = defineEmits(['update:show', 'update:modelValue', 'close'])

const appPageScrollLock = inject(LINGYUN_APP_PAGE_SCROLL_LOCK, null)

const mounted = ref(false)
const phase = ref('')
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const enterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _appScrollLocked = ref(false)
const _lingyunMpOverlayHold = ref(false)

const visible = computed((): boolean => {
  if (props.show !== undefined && props.show !== null) return !!props.show
  if (props.modelValue !== undefined && props.modelValue !== null) return !!props.modelValue
  return false
})

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* ignore */
  }
  return [themeClass, phase.value ? `lingyun-hud--${phase.value}` : ''].filter(Boolean).join(' ')
})

const rootStyle = computed((): Record<string, number> => {
  return { zIndex: Number(props.zIndex) || 1200 }
})

function clearTimers(): void {
  if (leaveTimer.value) clearTimeout(leaveTimer.value)
  if (enterTimer.value) clearTimeout(enterTimer.value)
  leaveTimer.value = null
  enterTimer.value = null
}

function lockPageScroll(): void {
  try {
    const lockApi = appPageScrollLock as LingyunAppPageScrollLock | null
    if (lockApi && typeof lockApi.lock === 'function' && !_appScrollLocked.value) {
      lockApi.lock()
      _appScrollLocked.value = true
    }
  } catch {
    /* ignore */
  }
}

function unlockPageScroll(): void {
  try {
    const lockApi = appPageScrollLock as LingyunAppPageScrollLock | null
    if (_appScrollLocked.value && lockApi && typeof lockApi.unlock === 'function') {
      lockApi.unlock()
    }
    _appScrollLocked.value = false
  } catch {
    _appScrollLocked.value = false
  }
}

function openAnim(): void {
  clearTimers()
  mounted.value = true
  phase.value = 'enter'
  nextTick(() => {
    const kick = () => {
      enterTimer.value = setTimeout(() => {
        phase.value = 'open'
        enterTimer.value = null
      }, ENTER_KICK_MS)
    }
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => requestAnimationFrame(kick))
    } else {
      kick()
    }
  })
}

function closeAnim(): void {
  clearTimers()
  if (!mounted.value) {
    unlockPageScroll()
    return
  }
  phase.value = 'leave'
  leaveTimer.value = setTimeout(() => {
    mounted.value = false
    phase.value = ''
    leaveTimer.value = null
    unlockPageScroll()
  }, LEAVE_MS)
}

function setVisible(next: unknown): void {
  const val = !!next
  emit('update:show', val)
  emit('update:modelValue', val)
  if (!val) emit('close')
}

function close(): void {
  setVisible(false)
}

function onOverlayClick(): void {
  if (!props.maskClosable) return
  close()
}

watch(
  visible,
  (val: boolean) => {
    if (val) {
      lockPageScroll()
      openAnim()
    } else {
      closeAnim()
    }
  },
  { immediate: true },
)

watch(
  phase,
  (value: string) => {
    _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
      !!_lingyunMpOverlayHold.value,
      !!value,
    )
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
    !!_lingyunMpOverlayHold.value,
    false,
  )
  clearTimers()
  unlockPageScroll()
})
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
