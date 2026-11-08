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
            <text class="lingyun-tabs__text">{{ item.text }}</text>
            <lingyun-badge
              v-if="hasBadge(item)"
              class="lingyun-tabs__badge"
              size="small"
              :text="String(item.badge)"
            />
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

<script lang="ts">
import { defineComponent, type PropType, type Ref } from 'vue'
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

let tabsSequence = 0

/** pill 轨道上下左右的内边距，首尾选中胶囊需与轨道外缘同心 */
const PILL_TRACK_PADDING = 2

/**
 * lingyun-tabs
 * @description 顶部可滚动 Tab View：underline / pill、滑动指示器、自动滚入
 * @see design/TABS.md
 */
export default defineComponent({
  name: 'LingyunTabs',
  emits: ['update:modelValue', 'change'],
  inject: {
    appPageTopInset: {
      from: LINGYUN_APP_PAGE_TOP_INSET,
      default: null as Ref<number> | null,
    },
  },
  props: {
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
  },
  data(): {
    uid: number
    scrollLeftValue: number
    indicatorLeft: number
    indicatorWidth: number
    /** pill 轨道总宽，用于判断首尾是否贴住轨道外缘 */
    trackWidth: number
    indicatorReady: boolean
    measureAttempts: number
    measureTimer: ReturnType<typeof setTimeout> | null
  } {
    return {
      uid: (tabsSequence += 1),
      scrollLeftValue: 0,
      indicatorLeft: 0,
      indicatorWidth: 0,
      trackWidth: 0,
      indicatorReady: false,
      measureAttempts: 0,
      measureTimer: null,
    }
  },
  computed: {
    variantKey(): LingyunTabsVariant {
      return this.variant === 'pill' ? 'pill' : 'underline'
    },
    normalizedItems(): NormalizedTab[] {
      const list = Array.isArray(this.items) ? this.items : []
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
    },
    activeIndex(): number {
      const key = String(this.modelValue ?? '')
      const index = this.normalizedItems.findIndex((item) => item.key === key)
      if (index >= 0) return index
      return this.normalizedItems.length ? 0 : -1
    },
    activeItem(): LingyunTabItem | null {
      const item = this.normalizedItems[this.activeIndex]
      return item ? item.raw : null
    },
    activeKey(): string {
      const item = this.normalizedItems[this.activeIndex]
      return item ? item.key : ''
    },
    trackId(): string {
      return `lingyun-tabs-track-${this.uid}`
    },
    scrollId(): string {
      return `lingyun-tabs-scroll-${this.uid}`
    },
    rootClass(): string {
      let themeClass = 'theme-light'
      try {
        themeClass = useLingyunTheme().rootClass || 'theme-light'
      } catch {
        /* pinia 未就绪 */
      }
      return [themeClass, `lingyun-tabs--${this.variantKey}`]
        .filter(Boolean)
        .join(' ')
    },
    barClass(): string {
      return [
        'lingyun-tabs__bar',
        `lingyun-tabs__bar--${this.variantKey}`,
        this.sticky ? 'lingyun-tabs__bar--sticky' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    barStyle(): Record<string, string> {
      if (!this.sticky) return {}
      return {
        top: `${this.resolvedStickyTop}px`,
        zIndex: String(Number(this.zIndex) || 10),
      }
    },
    resolvedStickyTop(): number {
      if (this.stickyTop !== undefined && this.stickyTop !== null) {
        return Math.max(0, Number(this.stickyTop) || 0)
      }
      const injected = this.appPageTopInset as Ref<number> | null
      const inset =
        injected && typeof injected === 'object' && 'value' in injected
          ? Number(injected.value)
          : 0
      return Number.isFinite(inset) ? Math.max(0, inset) : 0
    },
    trackClass(): string {
      return [
        `lingyun-tabs__track--${this.variantKey}`,
        this.align === 'center' ? 'lingyun-tabs__track--center' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    indicatorStyle(): Record<string, string> {
      const left = this.indicatorLeft
      const width = this.indicatorWidth
      if (this.variantKey === 'pill') {
        const atStart =
          this.activeIndex === 0 && left <= PILL_TRACK_PADDING + 0.5
        const atEnd =
          this.activeIndex === this.normalizedItems.length - 1 &&
          this.trackWidth > 0 &&
          Math.abs(left + width - (this.trackWidth - PILL_TRACK_PADDING)) <= 1.5
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
    },
  },
  watch: {
    modelValue() {
      this.syncActive()
    },
    items: {
      deep: true,
      handler() {
        this.$nextTick(() => this.syncActive())
      },
    },
    variant() {
      this.$nextTick(() => this.syncActive())
    },
    align() {
      this.$nextTick(() => this.syncActive())
    },
    showIndicator(value: boolean) {
      if (value) this.syncActive()
    },
    scrollable() {
      this.$nextTick(() => this.syncActive())
    },
  },
  mounted() {
    this.syncActive()
  },
  beforeUnmount() {
    if (this.measureTimer) {
      clearTimeout(this.measureTimer)
      this.measureTimer = null
    }
  },
  methods: {
    tabId(index: number): string {
      return `lingyun-tabs-tab-${this.uid}-${index}`
    },
    hasBadge(item: NormalizedTab): boolean {
      return item.badge !== undefined && item.badge !== null && item.badge !== ''
    },
    tabClass(item: NormalizedTab, index: number): string {
      return [
        index === this.activeIndex ? 'lingyun-tabs__tab--active' : '',
        item.disabled ? 'lingyun-tabs__tab--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    onTabClick(item: NormalizedTab, _index: number): void {
      if (item.disabled) return
      this.select(item.key)
    },
    select(key: string): void {
      const target = this.normalizedItems.find(
        (item) => item.key === String(key),
      )
      if (!target || target.disabled) return
      const index = this.normalizedItems.indexOf(target)
      if (String(this.modelValue ?? '') !== target.key) {
        this.$emit('update:modelValue', target.key)
        this.$emit('change', {
          key: target.key,
          item: target.raw,
          index,
        })
      }
      this.measureAttempts = 0
      this.$nextTick(() => this.measureIndicator())
    },
    scrollToKey(key: string): void {
      const index = this.normalizedItems.findIndex(
        (item) => item.key === String(key),
      )
      if (index < 0) return
      this.$nextTick(() => {
        this.measureTab(index, (metrics) => {
          if (metrics) this.centerScroll(metrics)
        })
      })
    },
    refresh(): void {
      this.syncActive()
    },
    syncActive(): void {
      this.measureAttempts = 0
      this.$nextTick(() => this.measureIndicator())
    },
    /** 读取 Tab 相对轨道的位置与滚动可视区宽度，H5 直接量 DOM */
    measureTab(
      index: number,
      callback: (metrics: TabMetrics | null) => void,
    ): void {
      // #ifdef H5
      if (typeof document !== 'undefined') {
        const track = document.getElementById(this.trackId)
        const tab = document.getElementById(this.tabId(index))
        const viewport = document.getElementById(this.scrollId)
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
        .in(this)
        .select(`#${this.trackId}`)
        .boundingClientRect()
        .select(`#${this.tabId(index)}`)
        .boundingClientRect()
        .select(`#${this.scrollId}`)
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
    },
    /** 激活项居中滚动，左右两侧都保留可见 Tab */
    centerScroll(metrics: TabMetrics): void {
      if (!this.scrollable) return
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
      if (Math.abs(this.scrollLeftValue - next) < 0.5) return
      this.scrollLeftValue = next
    },
    measureIndicator(): void {
      const index = this.activeIndex
      if (index < 0) {
        this.indicatorReady = false
        this.trackWidth = 0
        return
      }
      const retry = () => {
        if (this.measureAttempts >= 3) return
        this.measureAttempts += 1
        if (this.measureTimer) clearTimeout(this.measureTimer)
        this.measureTimer = setTimeout(() => {
          this.measureTimer = null
          this.measureIndicator()
        }, 60)
      }

      this.$nextTick(() => {
        this.measureTab(index, (metrics) => {
          if (!metrics) {
            retry()
            return
          }
          this.indicatorLeft = Math.max(0, metrics.left)
          this.indicatorWidth = Math.max(0, metrics.width)
          this.trackWidth = Math.max(0, metrics.trackWidth)
          this.indicatorReady = this.indicatorWidth > 0
          this.measureAttempts = 0
          this.centerScroll(metrics)
        })
      })
    },
  },
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

.lingyun-tabs__tab--active .lingyun-tabs__text {
  color: var(--lingyun-primary, #0088ff);
  font-weight: 600;
}

.lingyun-tabs__icon {
  flex-shrink: 0;
}

.lingyun-tabs__badge {
  transform: translateY(-2px);
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
