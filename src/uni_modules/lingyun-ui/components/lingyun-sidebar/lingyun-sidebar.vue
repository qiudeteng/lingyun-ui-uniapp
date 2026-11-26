<template>
  <!-- #ifdef MP-WEIXIN -->
  <root-portal>
    <view
      v-if="panelMounted"
      class="lingyun-sidebar"
      :class="rootClass"
      :style="rootStyle"
    >
      <view
        class="lingyun-sidebar__overlay"
        @click="onOverlayClick"
        @touchmove.stop.prevent
      />
      <view class="lingyun-sidebar__panel" :style="panelStyle" role="dialog" :aria-modal="'true'">
        <view v-if="showHeader" class="lingyun-sidebar__header">
          <slot name="header">
            <text class="lingyun-sidebar__title">{{ title }}</text>
          </slot>
        </view>
        <scroll-view class="lingyun-sidebar__scroll" scroll-y :show-scrollbar="false">
          <slot />
          <view
            v-for="(section, sIndex) in sectionList"
            :key="section.key"
            class="lingyun-sidebar__section"
          >
            <text v-if="section.title" class="lingyun-sidebar__section-title">{{ section.title }}</text>
            <view
              v-for="(item, iIndex) in section.items"
              :key="item.key"
              class="lingyun-sidebar__item"
              :class="itemClass(item)"
              hover-class="lingyun-sidebar__item--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              @click="onSelect(item, sIndex, iIndex)"
            >
              <lingyun-icon
                v-if="item.icon"
                class="lingyun-sidebar__icon"
                :type="item.icon"
                :size="22"
                color="label"
              />
              <text class="lingyun-sidebar__label">{{ item.label }}</text>
              <text v-if="item.badge" class="lingyun-sidebar__badge">{{ item.badge }}</text>
            </view>
          </view>
        </scroll-view>
        <view v-if="$slots.footer" class="lingyun-sidebar__footer">
          <slot name="footer" />
        </view>
      </view>
    </view>
  </root-portal>
  <!-- #endif -->

  <!-- #ifndef MP-WEIXIN -->
  <teleport to="body">
    <view
      v-if="panelMounted"
      class="lingyun-sidebar"
      :class="rootClass"
      :style="rootStyle"
    >
      <view
        class="lingyun-sidebar__overlay"
        @click="onOverlayClick"
        @touchmove.stop.prevent
      />
      <view class="lingyun-sidebar__panel" :style="panelStyle" role="dialog" :aria-modal="'true'">
        <view v-if="showHeader" class="lingyun-sidebar__header">
          <slot name="header">
            <text class="lingyun-sidebar__title">{{ title }}</text>
          </slot>
        </view>
        <scroll-view class="lingyun-sidebar__scroll" scroll-y :show-scrollbar="false">
          <slot />
          <view
            v-for="(section, sIndex) in sectionList"
            :key="section.key"
            class="lingyun-sidebar__section"
          >
            <text v-if="section.title" class="lingyun-sidebar__section-title">{{ section.title }}</text>
            <view
              v-for="(item, iIndex) in section.items"
              :key="item.key"
              class="lingyun-sidebar__item"
              :class="itemClass(item)"
              hover-class="lingyun-sidebar__item--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              @click="onSelect(item, sIndex, iIndex)"
            >
              <lingyun-icon
                v-if="item.icon"
                class="lingyun-sidebar__icon"
                :type="item.icon"
                :size="22"
                color="label"
              />
              <text class="lingyun-sidebar__label">{{ item.label }}</text>
              <text v-if="item.badge" class="lingyun-sidebar__badge">{{ item.badge }}</text>
            </view>
          </view>
        </scroll-view>
        <view v-if="$slots.footer" class="lingyun-sidebar__footer">
          <slot name="footer" />
        </view>
      </view>
    </view>
  </teleport>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import { inject, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { syncLingyunMpOverlayHold } from '../../utils/mp-overlay-gate'
import {
  LINGYUN_APP_PAGE_SCROLL_LOCK,
  LINGYUN_APP_PAGE_TOP_INSET,
  type LingyunAppPageScrollLock,
} from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

type SidebarGroupInput = {
  title?: unknown
  items?: unknown
}

type SidebarItemInput = {
  key?: unknown
  label?: unknown
  icon?: unknown
  badge?: unknown
  disabled?: unknown
}

type SidebarItem = {
  key: string
  label: string
  icon: string
  badge: string
  disabled: boolean
  raw: unknown
  index: number
}

type SidebarSection = {
  key: string
  title: string
  items: SidebarItem[]
}

/**
 * lingyun-sidebar
 * 悬浮玻璃侧栏：对齐 Sketch Sidebar 画板（Liquid Glass 导航列）
 * @see design/SIDEBARS.md
 */
const LEAVE_MS = 250
const ENTER_KICK_MS = 48
const INSET = 8
const PEEK = 56
const MAX_W = 320
const MIN_W = 240
const RADIUS = 34

defineOptions({
  name: 'LingyunSidebar',
})

const props = defineProps({
  show: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  modelValue: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  current: { type: [String, Number] as PropType<string | number>, default: '' },
  title: { type: String, default: '' },
  sections: { type: Array as PropType<SidebarGroupInput[]>, default: () => [] as SidebarGroupInput[] },
  items: { type: Array as PropType<SidebarItemInput[]>, default: () => [] as SidebarItemInput[] },
  placement: { type: String, default: 'leading' },
  maskClosable: { type: Boolean, default: true },
  closeOnSelect: { type: Boolean, default: true },
  zIndex: { type: [Number, String] as PropType<number | string>, default: 1300 },
})

const emit = defineEmits(['update:show', 'update:modelValue', 'update:current', 'select', 'close'])

const appPageScrollLock = inject(LINGYUN_APP_PAGE_SCROLL_LOCK, null)
const appPageTopInset = inject(LINGYUN_APP_PAGE_TOP_INSET, null)

const slots = useSlots()

const panelMounted = ref(false)
const phase = ref<'' | 'enter' | 'open' | 'leave'>('')
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const enterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const windowWidth = ref(375)
const statusBar = ref(0)
const safeBottom = ref(0)
const _appScrollLocked = ref(false)
const _scrollLocked = ref(false)
const _prevBodyOverflow = ref('')
const _prevBodyOverscroll = ref('')
const _prevHtmlOverscroll = ref('')
const _lingyunMpOverlayHold = ref(false)

function normalizeItems(list: unknown, prefix: string): SidebarItem[] {
  const raw: unknown[] = Array.isArray(list) ? list : []
  return raw.map((item: unknown, index: number) => {
    const rec = (item || {}) as SidebarItemInput
    return {
      key: item && rec.key != null ? String(rec.key) : `${prefix}-${index}`,
      label: item && rec.label != null ? String(rec.label) : '',
      icon: item && rec.icon != null ? String(rec.icon) : '',
      badge: item && rec.badge != null && rec.badge !== '' ? String(rec.badge) : '',
      disabled: !!(item && rec.disabled),
      raw: item,
      index,
    }
  })
}

const visible = computed((): boolean => {
  if (props.show !== undefined && props.show !== null) return !!props.show
  if (props.modelValue !== undefined && props.modelValue !== null) return !!props.modelValue
  return false
})

const placementKey = computed((): string =>
  props.placement === 'trailing' ? 'trailing' : 'leading',
)

const themeClass = computed((): string => {
  try {
    return useLingyunTheme().rootClass || 'theme-light'
  } catch {
    return 'theme-light'
  }
})

const reduceMotion = computed((): boolean => {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  } catch {
    /* ignore */
  }
  return false
})

const showHeader = computed((): boolean => !!(props.title || slots.header))

const rootClass = computed((): string => {
  return [
    themeClass.value,
    `lingyun-sidebar--${placementKey.value}`,
    phase.value ? `lingyun-sidebar--${phase.value}` : '',
    reduceMotion.value ? 'lingyun-sidebar--reduce-motion' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const rootStyle = computed((): Record<string, number> => {
  return { zIndex: Number(props.zIndex) || 1300 }
})

const panelStyle = computed((): Record<string, string> => {
  const injected = appPageTopInset as { value: number } | number | null
  const pageTop =
    injected && typeof injected === 'object' && 'value' in injected
      ? Number(injected.value)
      : Number(injected)
  const safeTop = Number.isFinite(pageTop) && pageTop > 0
    ? pageTop
    : Number(statusBar.value) || 0
  const top = safeTop + INSET
  const bottom = (Number(safeBottom.value) || 0) + INSET
  const width = Math.min(
    MAX_W,
    Math.max(MIN_W, (Number(windowWidth.value) || 375) - INSET - PEEK),
  )
  const style: Record<string, string> = {
    top: `${top}px`,
    bottom: `${bottom}px`,
    width: `${width}px`,
    borderRadius: `${RADIUS}px`,
  }
  if (placementKey.value === 'trailing') style.right = `${INSET}px`
  else style.left = `${INSET}px`
  return style
})

const sectionList = computed((): SidebarSection[] => {
  const out: SidebarSection[] = []
  const groups = Array.isArray(props.sections) ? props.sections : []
  groups.forEach((group, index) => {
    const items = normalizeItems(group && group.items, `s${index}`)
    if (!items.length) return
    out.push({
      key: `s${index}`,
      title: group && group.title != null ? String(group.title) : '',
      items,
    })
  })
  const flat = normalizeItems(props.items, 'flat')
  if (flat.length) {
    out.push({ key: 'flat', title: '', items: flat })
  }
  return out
})

function itemClass(item: SidebarItem): Record<string, boolean> {
  const selected = String(props.current) === String(item.key)
  return {
    'lingyun-sidebar__item--selected': selected,
    'lingyun-sidebar__item--disabled': item.disabled,
  }
}

function syncWindow(): void {
  try {
    const info =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    const inset = info && info.safeAreaInsets
    windowWidth.value = Number(info && info.windowWidth) || 375
    statusBar.value =
      Number(info && info.statusBarHeight) || Number(inset && inset.top) || 0
    safeBottom.value = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
  } catch {
    windowWidth.value = 375
    statusBar.value = 0
    safeBottom.value = 0
  }
}

function clearTimers(): void {
  if (leaveTimer.value) {
    clearTimeout(leaveTimer.value)
    leaveTimer.value = null
  }
  if (enterTimer.value) {
    clearTimeout(enterTimer.value)
    enterTimer.value = null
  }
}

function openAnim(): void {
  clearTimers()
  panelMounted.value = true
  phase.value = 'enter'
  nextTick(() => {
    const kick = () => {
      enterTimer.value = setTimeout(
        () => {
          phase.value = 'open'
          enterTimer.value = null
        },
        reduceMotion.value ? 16 : ENTER_KICK_MS,
      )
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
  if (!panelMounted.value) {
    unlockPageScroll()
    return
  }
  phase.value = 'leave'
  leaveTimer.value = setTimeout(
    () => {
      panelMounted.value = false
      phase.value = ''
      leaveTimer.value = null
      unlockPageScroll()
    },
    reduceMotion.value ? 16 : LEAVE_MS,
  )
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

function onSelect(item: SidebarItem | null, _sIndex?: number, _iIndex?: number): void {
  if (!item || item.disabled) return
  emit('update:current', item.key)
  emit('select', { key: item.key, item: item.raw || item, index: item.index })
  if (props.closeOnSelect) close()
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
  // #ifdef H5
  if (typeof document === 'undefined') return
  if (_scrollLocked.value) return
  const body = document.body
  const html = document.documentElement
  _prevBodyOverflow.value = body.style.overflow
  _prevBodyOverscroll.value = body.style.overscrollBehavior
  _prevHtmlOverscroll.value = html.style.overscrollBehavior
  body.style.overflow = 'hidden'
  body.style.overscrollBehavior = 'none'
  html.style.overscrollBehavior = 'none'
  _scrollLocked.value = true
  // #endif
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
  // #ifdef H5
  if (typeof document === 'undefined') return
  if (!_scrollLocked.value) return
  const body = document.body
  const html = document.documentElement
  body.style.overflow = _prevBodyOverflow.value || ''
  body.style.overscrollBehavior = _prevBodyOverscroll.value || ''
  html.style.overscrollBehavior = _prevHtmlOverscroll.value || ''
  _scrollLocked.value = false
  // #endif
}

watch(
  visible,
  (val: boolean) => {
    if (val) {
      syncWindow()
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

onMounted(() => {
  syncWindow()
})

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

.lingyun-sidebar {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: auto;
}

.lingyun-sidebar__overlay {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: var(--lingyun-mask, #{$lingyun-overlay});
  opacity: 0;
  transition: opacity 0.38s cubic-bezier(0.32, 0.72, 0, 1);
}

.lingyun-sidebar__panel {
  position: absolute;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  transform: translate3d(-110%, 0, 0);
  transition: transform 0.42s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
  @include lingyun-glass-surface;
  box-shadow: var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    0 18px 46px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-sidebar--trailing .lingyun-sidebar__panel {
  transform: translate3d(110%, 0, 0);
}

.lingyun-sidebar.theme-dark .lingyun-sidebar__panel {
  box-shadow: #{$lingyun-glass-highlight-dark}, 0 18px 48px rgba(0, 0, 0, 0.45);
  background-color: #{$lingyun-glass-overlay-bg-dark};
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-sidebar--enter .lingyun-sidebar__overlay,
.lingyun-sidebar--leave .lingyun-sidebar__overlay {
  opacity: 0;
}

.lingyun-sidebar--open .lingyun-sidebar__overlay {
  opacity: 1;
}

.lingyun-sidebar--open .lingyun-sidebar__panel {
  transform: translate3d(0, 0, 0);
}

.lingyun-sidebar--leave {
  pointer-events: none;
}

.lingyun-sidebar--leave .lingyun-sidebar__panel {
  transition: transform 0.24s cubic-bezier(0.4, 0, 1, 1);
}

.lingyun-sidebar--reduce-motion .lingyun-sidebar__overlay,
.lingyun-sidebar--reduce-motion .lingyun-sidebar__panel {
  transition-duration: 0.01s !important;
}

.lingyun-sidebar__header {
  flex-shrink: 0;
  padding: 20px 20px 8px;
  box-sizing: border-box;
}

.lingyun-sidebar__title {
  display: block;
  font-size: 22px;
  font-weight: 600;
  line-height: 28px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-sidebar.theme-dark .lingyun-sidebar__title,
.lingyun-sidebar.theme-dark .lingyun-sidebar__label {
  color: #{$lingyun-label-dark};
}

.lingyun-sidebar__scroll {
  flex: 1;
  height: 0;
  min-height: 0;
  width: 100%;
}

.lingyun-sidebar__section {
  padding: 4px 0 8px;
}

.lingyun-sidebar__section-title {
  display: block;
  padding: 12px 20px 4px;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-sidebar.theme-dark .lingyun-sidebar__section-title,
.lingyun-sidebar.theme-dark .lingyun-sidebar__badge {
  color: #{$lingyun-label-secondary-dark};
}

.lingyun-sidebar__item {
  min-height: 44px;
  margin: 0 8px;
  padding: 0 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
}

.lingyun-sidebar__item--selected {
  background-color: rgba(120, 120, 128, 0.16);
}

.lingyun-sidebar.theme-dark .lingyun-sidebar__item--selected {
  background-color: rgba(120, 120, 128, 0.32);
}

.lingyun-sidebar__item--hover {
  background-color: rgba(120, 120, 128, 0.1);
}

.lingyun-sidebar__item--disabled {
  opacity: 0.4;
}

.lingyun-sidebar__icon {
  flex-shrink: 0;
}

.lingyun-sidebar__label {
  flex: 1;
  min-width: 0;
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-sidebar__item--selected .lingyun-sidebar__label {
  font-weight: 600;
}

.lingyun-sidebar__badge {
  flex-shrink: 0;
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-sidebar__footer {
  flex-shrink: 0;
  padding: 8px 16px 16px;
  box-sizing: border-box;
}
</style>
