<template>
  <view class="lingyun-tabs" :class="rootClass">
    <view class="lingyun-tabs__bar" :class="barClass" :style="barStyle">
      <view
        v-if="$slots.prefix"
        class="lingyun-tabs__side lingyun-tabs__side--prefix"
      >
        <slot name="prefix" />
      </view>

      <scroll-view
        :id="scrollId"
        class="lingyun-tabs__scroll"
        :scroll-x="scrollable"
        :scroll-left="scrollLeftValue"
        :scroll-with-animation="true"
        :show-scrollbar="false"
      >
        <view
          :id="trackId"
          class="lingyun-tabs__track"
          :class="trackClass"
          role="tablist"
        >
          <view
            v-if="showIndicator && indicatorReady && activeIndex >= 0"
            class="lingyun-tabs__indicator"
            :class="`lingyun-tabs__indicator--${variantKey}`"
            :style="indicatorStyle"
          />

          <view
            v-for="(item, index) in normalizedItems"
            :id="tabId(index)"
            :key="item.key"
            class="lingyun-tabs__tab"
            :class="tabClass(item, index)"
            role="tab"
            :aria-selected="index === activeIndex ? 'true' : 'false'"
            :aria-disabled="item.disabled ? 'true' : 'false'"
            hover-class="lingyun-tabs__tab--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="onTabClick(item, index)"
          >
            <lingyun-icon
              v-if="item.icon"
              class="lingyun-tabs__icon"
              :type="item.icon"
              :size="18"
              :color="index === activeIndex ? 'primary' : 'secondary'"
            />
            <view class="lingyun-tabs__label">
              <text class="lingyun-tabs__text">{{ item.text }}</text>
              <lingyun-badge
                v-if="hasBadge(item)"
                class="lingyun-tabs__badge"
                size="small"
                :text="String(item.badge)"
              />
            </view>
          </view>
        </view>
      </scroll-view>

      <view
        v-if="$slots.suffix"
        class="lingyun-tabs__side lingyun-tabs__side--suffix"
      >
        <slot name="suffix" />
      </view>
    </view>

    <view
      v-if="$slots.default"
      class="lingyun-tabs__content"
      :class="{ 'lingyun-tabs__content--safe': safeArea }"
    >
      <slot
        :active-key="activeKey"
        :active-item="activeItem"
        :active-index="activeIndex"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { nextLingyunUid } from '../../utils/uid'
import type { PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { LINGYUN_APP_PAGE_TOP_INSET } from '../lingyun-app-page/useLingyunAppPageScroll'
import type { LingyunTabItem, LingyunTabsVariant } from './types'

interface NormalizedTab {
  key: string
  text: string
  icon: string
  badge?: string | number
  disabled: boolean
  raw: LingyunTabItem
}

interface TabMetrics {
  left: number
  width: number
  trackWidth: number
  viewportWidth: number
}


/** pill 轨道上下左右的内边距，首尾选中胶囊需与轨道外缘同心 */
const PILL_TRACK_PADDING = 2

/**
 * lingyun-tabs
 * @description 顶部可滚动 Tab View：underline / pill、滑动指示器、自动滚入
 * @see design/TABS.md
 */
defineOptions({
  name: 'LingyunTabs',
})

const props = defineProps({
  modelValue: { type: String, default: '' },
  items: {
    type: Array as PropType<LingyunTabItem[]>,
    default: () => [],
  },
  variant: {
    type: String as PropType<LingyunTabsVariant>,
    default: 'underline',
  },
  scrollable: { type: Boolean, default: true },
  sticky: { type: Boolean, default: false },
  align: {
    type: String as PropType<'start' | 'center'>,
    default: 'start',
  },
  showIndicator: { type: Boolean, default: true },
  safeArea: { type: Boolean, default: false },
  stickyTop: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  zIndex: { type: Number, default: 10 },
})

const emit = defineEmits(['update:modelValue', 'change'])

const appPageTopInset = inject(LINGYUN_APP_PAGE_TOP_INSET, null)

const instance = getCurrentInstance()

const uid = ref(nextLingyunUid('tabs'))
const scrollLeftValue = ref(0)
const indicatorLeft = ref(0)
const indicatorWidth = ref(0)
/** pill 轨道总宽，用于判断首尾是否贴住轨道外缘 */
const trackWidth = ref(0)
const indicatorReady = ref(false)
const measureAttempts = ref(0)
const measureTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const variantKey = computed((): LingyunTabsVariant => {
  return props.variant === 'pill' ? 'pill' : 'underline'
})

const normalizedItems = computed((): NormalizedTab[] => {
  const list = Array.isArray(props.items) ? props.items : []
  return list
    .map((item, index) => {
      const raw = item as LingyunTabItem
      return {
        key: String(raw?.key ?? index),
        text: String(raw?.text ?? raw?.key ?? ''),
        icon: String(raw?.icon || ''),
        badge: raw?.badge,
        disabled: raw?.disabled === true,
        raw,
      }
    })
    .filter((item) => item.text)
})

const activeIndex = computed((): number => {
  const key = String(props.modelValue ?? '')
  const index = normalizedItems.value.findIndex((item) => item.key === key)
  if (index >= 0) return index
  return normalizedItems.value.length ? 0 : -1
})

const activeItem = computed((): LingyunTabItem | null => {
  const item = normalizedItems.value[activeIndex.value]
  return item ? item.raw : null
})

const activeKey = computed((): string => {
  const item = normalizedItems.value[activeIndex.value]
  return item ? item.key : ''
})

const trackId = computed((): string => {
  return `lingyun-tabs-track-${uid.value}`
})

const scrollId = computed((): string => {
  return `lingyun-tabs-scroll-${uid.value}`
})

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* pinia 未就绪 */
  }
  return [themeClass, `lingyun-tabs--${variantKey.value}`]
    .filter(Boolean)
    .join(' ')
})

const barClass = computed((): string => {
  return [
    'lingyun-tabs__bar',
    `lingyun-tabs__bar--${variantKey.value}`,
    props.sticky ? 'lingyun-tabs__bar--sticky' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const barStyle = computed((): Record<string, string> => {
  if (!props.sticky) return {}
  return {
    top: `${resolvedStickyTop.value}px`,
    zIndex: String(Number(props.zIndex) || 10),
  }
})

const resolvedStickyTop = computed((): number => {
  if (props.stickyTop !== undefined && props.stickyTop !== null) {
    return Math.max(0, Number(props.stickyTop) || 0)
  }
  const injected = appPageTopInset
  const inset =
    injected && typeof injected === 'object' && 'value' in injected
      ? Number(injected.value)
      : 0
  return Number.isFinite(inset) ? Math.max(0, inset) : 0
})

const trackClass = computed((): string => {
  return [
    `lingyun-tabs__track--${variantKey.value}`,
    props.align === 'center' ? 'lingyun-tabs__track--center' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const indicatorStyle = computed((): Record<string, string> => {
  const left = indicatorLeft.value
  const width = indicatorWidth.value
  if (variantKey.value === 'pill') {
    const atStart =
      activeIndex.value === 0 && left <= PILL_TRACK_PADDING + 0.5
    const atEnd =
      activeIndex.value === normalizedItems.value.length - 1 &&
      trackWidth.value > 0 &&
      Math.abs(left + width - (trackWidth.value - PILL_TRACK_PADDING)) <= 1.5
    if (atStart) {
      // 首个 Tab：与轨道左端圆角同心，左侧不再额外内缩
      return {
        left: `${left}px`,
        width: `${Math.max(0, width - PILL_TRACK_PADDING)}px`,
        top: `${PILL_TRACK_PADDING}px`,
        height: '32px',
      }
    }
    if (atEnd) {
      // 末个 Tab：与轨道右端圆角同心
      return {
        left: `${left + PILL_TRACK_PADDING}px`,
        width: `${Math.max(0, width - PILL_TRACK_PADDING)}px`,
        top: `${PILL_TRACK_PADDING}px`,
        height: '32px',
      }
    }
    return {
      left: `${left + PILL_TRACK_PADDING}px`,
      width: `${Math.max(0, width - PILL_TRACK_PADDING * 2)}px`,
      top: `${PILL_TRACK_PADDING}px`,
      height: '32px',
    }
  }
  return {
    left: `${left + 12}px`,
    width: `${Math.max(0, width - 24)}px`,
    bottom: '0px',
    height: '2px',
  }
})

function tabId(index: number): string {
  return `lingyun-tabs-tab-${uid.value}-${index}`
}

function hasBadge(item: NormalizedTab): boolean {
  return item.badge !== undefined && item.badge !== null && item.badge !== ''
}

function tabClass(item: NormalizedTab, index: number): string {
  return [
    index === activeIndex.value ? 'lingyun-tabs__tab--active' : '',
    item.disabled ? 'lingyun-tabs__tab--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

/** 读取 Tab 相对轨道的位置与滚动可视区宽度，H5 直接量 DOM */
function measureTab(
  index: number,
  callback: (metrics: TabMetrics | null) => void,
): void {
  // #ifdef H5 || WEB
  if (typeof document !== 'undefined') {
    const track = document.getElementById(trackId.value)
    const tab = document.getElementById(tabId(index))
    const viewport = document.getElementById(scrollId.value)
    if (
      track &&
      tab &&
      tab.offsetWidth > 0 &&
      viewport &&
      viewport.clientWidth > 0
    ) {
      callback({
        left: tab.offsetLeft,
        width: tab.offsetWidth,
        trackWidth: track.offsetWidth,
        viewportWidth: viewport.clientWidth,
      })
      return
    }
  }
  // #endif

  uni
    .createSelectorQuery()
    .in(instance?.proxy as never)
    .select(`#${trackId.value}`)
    .boundingClientRect()
    .select(`#${tabId(index)}`)
    .boundingClientRect()
    .select(`#${scrollId.value}`)
    .boundingClientRect()
    .exec((res) => {
      const track = res && (res[0] as { left?: number; width?: number } | null)
      const tab =
        res && (res[1] as { left?: number; width?: number } | null)
      const viewport =
        res && (res[2] as { width?: number } | null)
      if (
        !track ||
        !tab ||
        !tab.width ||
        tab.left === undefined ||
        !viewport ||
        !viewport.width
      ) {
        callback(null)
        return
      }
      callback({
        left: Number(tab.left) - Number(track.left || 0),
        width: Number(tab.width),
        trackWidth: Number(track.width || 0),
        viewportWidth: Number(viewport.width),
      })
    })
}

/** 激活项居中滚动，左右两侧都保留可见 Tab */
function centerScroll(metrics: TabMetrics): void {
  if (!props.scrollable) return
  const maxScroll = Math.max(
    0,
    metrics.trackWidth - metrics.viewportWidth,
  )
  const target = Math.min(
    maxScroll,
    Math.max(
      0,
      metrics.left + metrics.width / 2 - metrics.viewportWidth / 2,
    ),
  )
  const next = Math.round(target * 100) / 100
  // #ifdef H5 || WEB
  /* uni-app x Web 的 scroll-view 不响应动态 scroll-left，且会在随后的渲染中
   * 把滚动位置重置回 0；这里直接操作 DOM 滚动容器，并在渲染结束后补设。 */
  if (typeof document !== 'undefined') {
    const apply = () => {
      const host: any = document.getElementById(scrollId.value)
      if (!host) return
      const list: any[] =
        host.querySelectorAll && host.querySelectorAll
          ? Array.prototype.slice.call(
              host.querySelectorAll('.uni-scroll-view'),
            )
          : []
      let target: any = null
      for (let i = 0; i < list.length; i += 1) {
        if (list[i].scrollWidth > list[i].clientWidth + 1) {
          target = list[i]
          break
        }
      }
      if (!target) target = list.length ? list[list.length - 1] : host
      if (Math.abs(Number(target.scrollLeft || 0) - next) >= 0.5) {
        target.scrollLeft = next
      }
    }
    apply()
    let tries = 0
    const tick = () => {
      apply()
      tries += 1
      if (tries < 30) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return
  }
  // #endif
  if (Math.abs(scrollLeftValue.value - next) < 0.5) return
  scrollLeftValue.value = next
}

function measureIndicator(): void {
  const index = activeIndex.value
  if (index < 0) {
    indicatorReady.value = false
    trackWidth.value = 0
    return
  }
  const retry = () => {
    if (measureAttempts.value >= 3) return
    measureAttempts.value += 1
    if (measureTimer.value) clearTimeout(measureTimer.value)
    measureTimer.value = setTimeout(() => {
      measureTimer.value = null
      measureIndicator()
    }, 60)
  }

  nextTick(() => {
    measureTab(index, (metrics) => {
      if (!metrics) {
        retry()
        return
      }
      indicatorLeft.value = Math.max(0, metrics.left)
      indicatorWidth.value = Math.max(0, metrics.width)
      trackWidth.value = Math.max(0, metrics.trackWidth)
      indicatorReady.value = indicatorWidth.value > 0
      measureAttempts.value = 0
      centerScroll(metrics)
    })
  })
}

function select(key: string): void {
  const target = normalizedItems.value.find(
    (item) => item.key === String(key),
  )
  if (!target || target.disabled) return
  const index = normalizedItems.value.indexOf(target)
  if (String(props.modelValue ?? '') !== target.key) {
    emit('update:modelValue', target.key)
    emit('change', {
      key: target.key,
      item: target.raw,
      index,
    })
  }
  measureAttempts.value = 0
  nextTick(() => measureIndicator())
}

function onTabClick(item: NormalizedTab, _index: number): void {
  if (item.disabled) return
  select(item.key)
}

function scrollToKey(key: string): void {
  const index = normalizedItems.value.findIndex(
    (item) => item.key === String(key),
  )
  if (index < 0) return
  nextTick(() => {
    measureTab(index, (metrics) => {
      if (metrics) centerScroll(metrics)
    })
  })
}

function refresh(): void {
  syncActive()
}

function syncActive(): void {
  measureAttempts.value = 0
  nextTick(() => measureIndicator())
}

watch(
  () => props.modelValue,
  () => {
    syncActive()
  },
)

watch(
  () => props.items,
  () => {
    nextTick(() => syncActive())
  },
  { deep: true },
)

watch(
  () => props.variant,
  () => {
    nextTick(() => syncActive())
  },
)

watch(
  () => props.align,
  () => {
    nextTick(() => syncActive())
  },
)

watch(
  () => props.showIndicator,
  (value: boolean) => {
    if (value) syncActive()
  },
)

watch(
  () => props.scrollable,
  () => {
    nextTick(() => syncActive())
  },
)

onMounted(() => {
  syncActive()
})

onBeforeUnmount(() => {
  if (measureTimer.value) {
    clearTimeout(measureTimer.value)
    measureTimer.value = null
  }
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-tabs {
  width: 100%;
  box-sizing: border-box;
}

.lingyun-tabs__bar {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  background-color: transparent;
  box-shadow: inset 0 -0.5px 0 var(--lingyun-separator, rgba(0, 0, 0, 0.12));
}

.lingyun-tabs__bar--pill {
  padding: 4px 12px;
  box-shadow: none;
}

.lingyun-tabs__bar--sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  @include lingyun-glass-surface;
  border: 0;
  border-radius: 0;
  box-shadow:
    $lingyun-glass-highlight,
    inset 0 -0.5px 0 var(--lingyun-separator, rgba(0, 0, 0, 0.12));
}

.lingyun-tabs__scroll {
  flex: 1;
  min-width: 0;
  width: 100%;
  white-space: nowrap;
}

.lingyun-tabs__bar--underline .lingyun-tabs__scroll {
  height: 44px;
}

.lingyun-tabs__bar--pill .lingyun-tabs__scroll {
  height: 36px;
}

.lingyun-tabs__track {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
}

.lingyun-tabs__track--underline {
  min-height: 44px;
  padding: 0 12px;
}

.lingyun-tabs__track--pill {
  height: 36px;
  padding: 2px;
  border-radius: 9999px;
  background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
}

.lingyun-tabs__track--center {
  justify-content: center;
}

.lingyun-tabs__side {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.lingyun-tabs__side--prefix {
  padding-left: 4px;
}

.lingyun-tabs__side--suffix {
  padding-right: 4px;
}

.lingyun-tabs__tab {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 8px;
  white-space: nowrap;
}

.lingyun-tabs__bar--pill .lingyun-tabs__tab {
  height: 32px;
  padding: 0 16px;
  border-radius: 9999px;
}

.lingyun-tabs__tab--hover {
  background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
}

.lingyun-tabs__tab--disabled {
  opacity: 0.4;
}

.lingyun-tabs__text {
  font-size: 15px;
  line-height: 22px;
  font-weight: 400;
  color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
  white-space: nowrap;
}

/* 文字与角标的定位参照：角标不参与文字居中，避免选中胶囊里的文字偏移 */
.lingyun-tabs__label {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.lingyun-tabs__tab--active .lingyun-tabs__text {
  color: var(--lingyun-primary, #0088ff);
  font-weight: 600;
}

.lingyun-tabs__icon {
  flex-shrink: 0;
}

/* 角标按上标挂在文字右上角，不占行内排版宽度（Apple 角标语义） */
.lingyun-tabs__badge {
  position: absolute;
  top: -7px;
  left: 100%;
  margin-left: 2px;
  z-index: 1;
}

.lingyun-tabs__indicator {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  transition:
    left 0.24s cubic-bezier(0.32, 0.72, 0, 1),
    width 0.24s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: left, width;
}

.lingyun-tabs__indicator--underline {
  height: 2px;
  border-radius: 1px;
  background-color: var(--lingyun-primary, #0088ff);
}

.lingyun-tabs__indicator--pill {
  border-radius: 9999px;
  background-color: var(--lingyun-bg-grouped-secondary, #ffffff);
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.12),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.12);
}

.lingyun-tabs__content {
  box-sizing: border-box;
  width: 100%;
  padding-top: 12px;
}

.lingyun-tabs__content--safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
