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

<script>
import { useThemeStore } from '@/stores/theme'
import { LINGYUN_APP_PAGE_SCROLL_LOCK } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

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

export default {
  name: 'LingyunSidebar',
  emits: ['update:show', 'update:modelValue', 'update:current', 'select', 'close'],
  inject: {
    appPageScrollLock: {
      from: LINGYUN_APP_PAGE_SCROLL_LOCK,
      default: null,
    },
  },
  props: {
    show: { type: Boolean, default: undefined },
    modelValue: { type: Boolean, default: undefined },
    current: { type: [String, Number], default: '' },
    title: { type: String, default: '' },
    sections: { type: Array, default: () => [] },
    items: { type: Array, default: () => [] },
    placement: { type: String, default: 'leading' },
    maskClosable: { type: Boolean, default: true },
    closeOnSelect: { type: Boolean, default: true },
    zIndex: { type: [Number, String], default: 1300 },
  },
  data() {
    return {
      panelMounted: false,
      phase: '',
      leaveTimer: null,
      enterTimer: null,
      windowWidth: 375,
      statusBar: 0,
      safeBottom: 0,
      _appScrollLocked: false,
      _scrollLocked: false,
      _prevBodyOverflow: '',
      _prevBodyOverscroll: '',
      _prevHtmlOverscroll: '',
    }
  },
  computed: {
    visible() {
      if (this.show !== undefined && this.show !== null) return !!this.show
      if (this.modelValue !== undefined && this.modelValue !== null) return !!this.modelValue
      return false
    },
    placementKey() {
      return this.placement === 'trailing' ? 'trailing' : 'leading'
    },
    themeClass() {
      try {
        return useThemeStore().rootClass || 'theme-light'
      } catch {
        return 'theme-light'
      }
    },
    reduceMotion() {
      try {
        if (typeof window !== 'undefined' && window.matchMedia) {
          return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        }
      } catch {
        /* ignore */
      }
      return false
    },
    showHeader() {
      return !!(this.title || this.$slots.header)
    },
    rootClass() {
      return [
        this.themeClass,
        `lingyun-sidebar--${this.placementKey}`,
        this.phase ? `lingyun-sidebar--${this.phase}` : '',
        this.reduceMotion ? 'lingyun-sidebar--reduce-motion' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    rootStyle() {
      return { zIndex: Number(this.zIndex) || 1300 }
    },
    panelStyle() {
      const top = (Number(this.statusBar) || 0) + INSET
      const bottom = (Number(this.safeBottom) || 0) + INSET
      const width = Math.min(
        MAX_W,
        Math.max(MIN_W, (Number(this.windowWidth) || 375) - INSET - PEEK),
      )
      const style = {
        top: `${top}px`,
        bottom: `${bottom}px`,
        width: `${width}px`,
        borderRadius: `${RADIUS}px`,
      }
      if (this.placementKey === 'trailing') style.right = `${INSET}px`
      else style.left = `${INSET}px`
      return style
    },
    sectionList() {
      const out = []
      const groups = Array.isArray(this.sections) ? this.sections : []
      groups.forEach((group, index) => {
        const items = this.normalizeItems(group && group.items, `s${index}`)
        if (!items.length) return
        out.push({
          key: `s${index}`,
          title: group && group.title != null ? String(group.title) : '',
          items,
        })
      })
      const flat = this.normalizeItems(this.items, 'flat')
      if (flat.length) {
        out.push({ key: 'flat', title: '', items: flat })
      }
      return out
    },
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        if (val) {
          this.syncWindow()
          this.lockPageScroll()
          this.openAnim()
        } else {
          this.closeAnim()
        }
      },
    },
  },
  mounted() {
    this.syncWindow()
  },
  beforeUnmount() {
    this.clearTimers()
    this.unlockPageScroll()
  },
  methods: {
    normalizeItems(list, prefix) {
      const raw = Array.isArray(list) ? list : []
      return raw.map((item, index) => ({
        key: item && item.key != null ? String(item.key) : `${prefix}-${index}`,
        label: item && item.label != null ? String(item.label) : '',
        icon: item && item.icon != null ? String(item.icon) : '',
        badge: item && item.badge != null && item.badge !== '' ? String(item.badge) : '',
        disabled: !!(item && item.disabled),
        raw: item,
        index,
      }))
    },
    itemClass(item) {
      const selected = String(this.current) === String(item.key)
      return {
        'lingyun-sidebar__item--selected': selected,
        'lingyun-sidebar__item--disabled': item.disabled,
      }
    },
    syncWindow() {
      try {
        const info =
          typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
        this.windowWidth = Number(info && info.windowWidth) || 375
        this.statusBar = Number(info && info.statusBarHeight) || 0
        const inset = info && info.safeAreaInsets
        this.safeBottom = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
      } catch {
        this.windowWidth = 375
        this.statusBar = 0
        this.safeBottom = 0
      }
    },
    clearTimers() {
      if (this.leaveTimer) {
        clearTimeout(this.leaveTimer)
        this.leaveTimer = null
      }
      if (this.enterTimer) {
        clearTimeout(this.enterTimer)
        this.enterTimer = null
      }
    },
    openAnim() {
      this.clearTimers()
      this.panelMounted = true
      this.phase = 'enter'
      this.$nextTick(() => {
        const kick = () => {
          this.enterTimer = setTimeout(
            () => {
              this.phase = 'open'
              this.enterTimer = null
            },
            this.reduceMotion ? 16 : ENTER_KICK_MS,
          )
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
      if (!this.panelMounted) {
        this.unlockPageScroll()
        return
      }
      this.phase = 'leave'
      this.leaveTimer = setTimeout(
        () => {
          this.panelMounted = false
          this.phase = ''
          this.leaveTimer = null
          this.unlockPageScroll()
        },
        this.reduceMotion ? 16 : LEAVE_MS,
      )
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
    onSelect(item) {
      if (!item || item.disabled) return
      this.$emit('update:current', item.key)
      this.$emit('select', { key: item.key, item: item.raw || item, index: item.index })
      if (this.closeOnSelect) this.close()
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
      // #ifdef H5
      if (typeof document === 'undefined') return
      if (this._scrollLocked) return
      const body = document.body
      const html = document.documentElement
      this._prevBodyOverflow = body.style.overflow
      this._prevBodyOverscroll = body.style.overscrollBehavior
      this._prevHtmlOverscroll = html.style.overscrollBehavior
      body.style.overflow = 'hidden'
      body.style.overscrollBehavior = 'none'
      html.style.overscrollBehavior = 'none'
      this._scrollLocked = true
      // #endif
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
      // #ifdef H5
      if (typeof document === 'undefined') return
      if (!this._scrollLocked) return
      const body = document.body
      const html = document.documentElement
      body.style.overflow = this._prevBodyOverflow || ''
      body.style.overscrollBehavior = this._prevBodyOverscroll || ''
      html.style.overscrollBehavior = this._prevHtmlOverscroll || ''
      this._scrollLocked = false
      // #endif
    },
  },
}
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
