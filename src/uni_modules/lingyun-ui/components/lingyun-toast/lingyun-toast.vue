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

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { syncLingyunMpOverlayHold } from '../../utils/mp-overlay-gate'

/**
 * lingyun-toast
 * @see design/TOASTS.md
 * 玻璃节点不做 opacity；显隐用 mounted + lift 过渡
 */
const LEAVE_MS = 220
const ENTER_KICK_MS = 32

type ToastPhase = '' | 'enter' | 'open' | 'leave'

defineOptions({
  name: 'LingyunToast',
})

const props = defineProps({
  show: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  modelValue: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  text: { type: String, default: '' },
  type: { type: String, default: 'default' },
  duration: { type: Number, default: 2000 },
  zIndex: { type: [Number, String] as PropType<number | string>, default: 1200 },
})

const emit = defineEmits(['update:show', 'update:modelValue', 'close'])

const mounted = ref(false)
const phase = ref<ToastPhase>('')
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const enterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const autoTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _lingyunMpOverlayHold = ref(false)

const visible = computed((): boolean => {
  if (props.show !== undefined && props.show !== null) return !!props.show
  if (props.modelValue !== undefined && props.modelValue !== null) return !!props.modelValue
  return false
})

const typeKey = computed((): string => {
  const t = props.type
  if (t === 'success' || t === 'error' || t === 'loading') return t
  return 'default'
})

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* ignore */
  }
  return [themeClass, phase.value ? `lingyun-toast--${phase.value}` : ''].filter(Boolean).join(' ')
})

const rootStyle = computed((): { zIndex: number } => {
  return { zIndex: Number(props.zIndex) || 1200 }
})

function clearTimers(): void {
  const timers = [leaveTimer, enterTimer, autoTimer]
  timers.forEach((timer) => {
    if (!timer.value) return
    clearTimeout(timer.value)
    timer.value = null
  })
}

function setVisible(next: boolean): void {
  const val = !!next
  emit('update:show', val)
  emit('update:modelValue', val)
  if (!val) emit('close')
}

function scheduleAutoClose(): void {
  if (typeKey.value === 'loading') return
  const d = Number(props.duration)
  if (!d || d <= 0) return
  autoTimer.value = setTimeout(() => {
    autoTimer.value = null
    setVisible(false)
  }, d)
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
        scheduleAutoClose()
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
  if (!mounted.value) return
  phase.value = 'leave'
  leaveTimer.value = setTimeout(() => {
    mounted.value = false
    phase.value = ''
    leaveTimer.value = null
  }, LEAVE_MS)
}

watch(
  visible,
  (val: boolean) => {
    if (val) openAnim()
    else closeAnim()
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
})
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
