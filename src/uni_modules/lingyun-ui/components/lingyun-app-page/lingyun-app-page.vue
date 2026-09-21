<template>
  <view class="lingyun-app-page" :class="rootClass" :style="pageVars">
    <!-- 小程序宽屏侧栏留在页面里。H5 由 lingyunUi 挂到 body，避免换页拆掉侧栏。 -->
    <!-- #ifndef H5 -->
    <view v-if="showPageNav" class="lingyun-app-page__nav">
      <lingyun-page-nav :sections="navSections" />
    </view>
    <!-- #endif -->

    <lingyun-toolbars
      class="lingyun-app-page__toolbar"
      :title="title"
      :subtitle="subtitle"
      :title-style="titleStyle"
      :placement="placement"
      :show-back="showBackEffective"
      :show-close="showCloseEffective"
      :show-grabber="showGrabberEffective"
      :show-trailing="showTrailing"
      :fixed="true"
      :safe-area="safeArea"
      :glass-progress="glassProgress"
      @back="onBack"
      @close="onClose"
      @trailing="onTrailing"
    >
      <template #leading>
        <slot name="leading" />
      </template>
      <template #trailing>
        <slot name="trailing" />
      </template>
    </lingyun-toolbars>

    <!-- 默认形态：页面级滚动。玻璃进度由顶部哨兵的露出比例驱动（无 @scroll 可用） -->
    <view v-if="usePageScroll" class="lingyun-app-page__sentinel" :style="sentinelStyle" />
    <view v-if="usePageScroll" class="lingyun-app-page__pad">
      <slot />
    </view>

    <!-- 逃生口：需要 scroll-y 锁（横向 swipe）等场景仍可用内层 scroll-view -->
    <scroll-view
      v-if="useInnerScroll"
      class="lingyun-app-page__scroller"
      :scroll-y="bodyScrollY"
      :scroll-with-animation="true"
      :show-scrollbar="false"
      :upper-threshold="2"
      @scroll="onBodyScroll"
      @scrolltoupper="onScrollToUpper"
    >
      <view class="lingyun-app-page__pad">
        <slot />
      </view>
    </scroll-view>

    <!-- bodyScroll=false：页面自管内层滚动，用 useLingyunAppPageScroll 上报 -->
    <view v-if="!bodyScroll" class="lingyun-app-page__body">
      <view class="lingyun-app-page__pad">
        <slot />
      </view>
    </view>

    <!-- 命令式 Toast/HUD：须在页面树内（mp-weixin 的 App.vue 模板不会盖到页面上） -->
    <lingyun-feedback-host />
  </view>
</template>

<script>
import { getCurrentInstance, inject } from 'vue'
import { onResize } from '@dcloudio/uni-app'
import {
  LINGYUN_APP_PAGE_BIND_SCROLL,
  LINGYUN_APP_PAGE_REPORT_SCROLL,
  LINGYUN_APP_PAGE_SCROLL_LOCK,
} from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'
import {
  coerceTriFlag,
  getLingyunNavLayout,
  LINGYUN_TOOLBAR_2LINE_LARGE_EXTRA_PX,
  LINGYUN_TOOLBAR_BAR_DESIGN_PX,
  LINGYUN_TOOLBAR_LARGE_EXTRA_PX,
  readLingyunResizeWidth,
} from '@/uni_modules/lingyun-ui/components/lingyun-toolbars/getLingyunNavSafeInset'
import { useThemeStore } from '@/stores/theme'
import { LINGYUN_PAGE_NAV_WIDTH } from '@/router/pageNav'

/**
 * lingyun-app-page
 * @description 隐藏原生导航后的页面壳：固定 lingyun-toolbars + 滚动区顶栏占位 + 玻璃渐变
 * @see design/TOOLBARS.md
 *
 * 根节点挂 theme-light / theme-dark：小程序无 document，手动主题靠此 class 下发 CSS 变量
 *
 * @property {String} title / subtitle
 * @property {String} titleStyle / placement
 * @property {Boolean} showBack / showClose / showGrabber / showTrailing / safeArea / bodyScroll / pageScroll / showNav
 * @property {Array} navSections 宽屏左侧导航分组；不传则用 src/router/pageNav.ts
 * @property {Number} glassDistance 滚过多少 px 达到满玻璃
 * @event back / close / trailing / scroll
 */
export default {
  name: 'LingyunAppPage',
  emits: ['back', 'close', 'trailing', 'scroll'],
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    titleStyle: { type: String, default: 'title' },
    placement: { type: String, default: 'standard' },
    showBack: { default: 'auto' },
    showClose: { default: false },
    showGrabber: { default: false },
    showTrailing: { type: Boolean, default: false },
    safeArea: { type: Boolean, default: true },
    bodyScroll: { type: Boolean, default: true },
    /**
     * 页面级滚动（默认）。关掉则退回内层 scroll-view。
     * 只有需要 scroll-y 锁（横向 swipe）这类场景才关；
     * **含文本输入的页面必须保持默认**：微信安卓在整屏 scroll-view 里聚焦
     * 会把原生输入层与 WXSS 外壳错开（详见 design/TEXTFIELDS.md §5）。
     */
    pageScroll: { type: Boolean, default: true },
    /** 宽屏（≥700，含折叠屏展开）左侧停靠导航。false 关闭。Sheet 形态永不显示。 */
    showNav: { default: true },
    /** 覆盖默认目录；null 使用 LINGYUN_PAGE_NAV */
    navSections: { type: Array, default: null },
    glassDistance: { type: Number, default: 56 },
  },
  data() {
    return {
      glassProgress: 0,
      statusBarPx: 0,
      barHeightPx: LINGYUN_TOOLBAR_BAR_DESIGN_PX,
      largeExtraPx: LINGYUN_TOOLBAR_LARGE_EXTRA_PX,
      title2LineLargeExtraPx: LINGYUN_TOOLBAR_2LINE_LARGE_EXTRA_PX,
      regular: false,
      /** 横向 swipe 确认后临时关 scroll-y，避免 iOS 斜滑带动页面上下晃 */
      bodyScrollY: true,
    }
  },
  setup() {
    const instance = getCurrentInstance()
    onResize((res) => {
      const proxy = instance && instance.proxy
      if (proxy && typeof proxy.syncNavLayout === 'function') {
        proxy.syncNavLayout(readLingyunResizeWidth(res))
      }
    })
    return {
      bindScroll: inject(LINGYUN_APP_PAGE_BIND_SCROLL, null),
    }
  },
  created() {
    if (typeof this.bindScroll === 'function') {
      this.bindScroll((scrollTop) => {
        this.applyScrollTop(scrollTop)
        this.scheduleScrollSettle(scrollTop)
      })
    }
    this.syncNavLayout()
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._scrollSettleTimer = null
    /** @type {number} */
    this._scrollLockCount = 0
    /** 页面级滚动下驱动玻璃渐变的哨兵观察器 */
    this._glassObserver = null
  },
  mounted() {
    this.syncNavLayout()
    this.bindResize()
    if (this.usePageScroll) {
      this.$nextTick(() => this.setupGlassObserver())
    }
    try {
      useThemeStore().apply()
    } catch {
      /* pinia 未就绪时忽略 */
    }
  },
  beforeUnmount() {
    this.clearScrollSettle()
    this.teardownGlassObserver()
    this.unbindResize()
  },
  watch: {
    safeArea() {
      this.syncNavLayout()
    },
  },
  computed: {
    themeRootClass() {
      try {
        return useThemeStore().rootClass
      } catch {
        return 'theme-light'
      }
    },
    toolbarStackPx() {
      let h = this.barHeightPx
      const style = this.titleStyle || 'title'
      if (style === 'large') h += this.largeExtraPx
      if (style === 'title2LineLarge') h += this.title2LineLargeExtraPx
      if (this.placement === 'sheet' || this.showGrabberEffective) h += 16
      return h
    },
    pageVars() {
      const navWidth = this.navDocked ? LINGYUN_PAGE_NAV_WIDTH : 0
      return {
        '--lingyun-app-page-bar': `${this.toolbarStackPx}px`,
        '--lingyun-app-page-inset-top': this.insetTop,
        '--lingyun-page-nav-width': `${navWidth}px`,
      }
    },
    /** 宽屏需要为顶栏让出左侧。H5 的列在 body 上，这里只留宽度。 */
    navDocked() {
      if (!coerceTriFlag(this.showNav, true)) return false
      if (this.placement === 'sheet' || this.showGrabberEffective) return false
      return this.regular
    },
    showPageNav() {
      // #ifdef H5
      return false
      // #endif
      // #ifndef H5
      return this.navDocked
      // #endif
    },
    insetTop() {
      const total = this.toolbarStackPx + (this.safeArea ? this.statusBarPx : 0)
      return `${total}px`
    },
    /** 页面级滚动仅在本组件负责 body 滚动时才成立 */
    usePageScroll() {
      return this.bodyScroll && this.pageScroll
    },
    useInnerScroll() {
      return this.bodyScroll && !this.pageScroll
    },
    /** 哨兵高 = 满玻璃距离：露出比例即滚动进度 */
    sentinelStyle() {
      return { height: `${Math.max(1, Number(this.glassDistance) || 56)}px` }
    },
    showBackEffective() {
      return coerceTriFlag(this.showBack, true)
    },
    showCloseEffective() {
      return coerceTriFlag(this.showClose, false)
    },
    showGrabberEffective() {
      return coerceTriFlag(this.showGrabber, false)
    },
    rootClass() {
      return [
        this.themeRootClass,
        `lingyun-app-page--${this.titleStyle || 'title'}`,
        {
          'lingyun-app-page--safe': this.safeArea,
          'lingyun-app-page--sheet': this.placement === 'sheet' || this.showGrabberEffective,
          'lingyun-app-page--page-scroll': this.usePageScroll,
          'lingyun-app-page--nav': this.navDocked,
        },
      ]
    },
  },
  provide() {
    return {
      [LINGYUN_APP_PAGE_REPORT_SCROLL]: (scrollTop) => {
        this.applyScrollTop(scrollTop)
        this.scheduleScrollSettle(scrollTop)
      },
      [LINGYUN_APP_PAGE_SCROLL_LOCK]: {
        lock: () => this.lockBodyScroll(),
        unlock: () => this.unlockBodyScroll(),
      },
    }
  },
  methods: {
    /**
     * 页面级滚动没有 @scroll 可用：观察顶部哨兵的露出比例换算玻璃进度。
     * 哨兵高 = glassDistance，滚过 y 时露出 (dist - y)/dist。
     */
    setupGlassObserver() {
      this.teardownGlassObserver()
      const dist = Math.max(1, Number(this.glassDistance) || 56)
      const steps = 40
      const thresholds = []
      for (let i = 0; i <= steps; i += 1) thresholds.push(i / steps)
      try {
        const observer = uni.createIntersectionObserver(this, { thresholds })
        observer.relativeToViewport().observe('.lingyun-app-page__sentinel', (res) => {
          const ratio = Number(res && res.intersectionRatio)
          if (!Number.isFinite(ratio)) return
          const progress = Math.min(1, Math.max(0, 1 - ratio))
          this.glassProgress = progress
          this.$emit('scroll', progress * dist)
        })
        this._glassObserver = observer
      } catch {
        /* 端不支持时顶栏保持透明 */
      }
    },
    teardownGlassObserver() {
      if (this._glassObserver) {
        try {
          this._glassObserver.disconnect()
        } catch {
          /* ignore */
        }
        this._glassObserver = null
      }
    },
    lockBodyScroll() {
      this._scrollLockCount = (this._scrollLockCount || 0) + 1
      if (this.bodyScrollY) this.bodyScrollY = false
    },
    unlockBodyScroll() {
      this._scrollLockCount = Math.max(0, (this._scrollLockCount || 0) - 1)
      if (this._scrollLockCount === 0 && !this.bodyScrollY) this.bodyScrollY = true
    },
    syncNavLayout(windowWidth) {
      const width = Number(windowWidth)
      const layout = getLingyunNavLayout(
        LINGYUN_TOOLBAR_BAR_DESIGN_PX,
        Number.isFinite(width) && width > 0 ? width : undefined,
      )
      this.statusBarPx = this.safeArea ? layout.statusBarHeight : 0
      this.barHeightPx = layout.barHeight
      this.largeExtraPx = layout.largeExtra
      this.title2LineLargeExtraPx = layout.title2LineLargeExtra
      this.regular = !!layout.regular
    },
    bindResize() {
      this._onWindowResize = (res) => {
        this.syncNavLayout(readLingyunResizeWidth(res))
      }
      try {
        if (typeof uni.onWindowResize === 'function') uni.onWindowResize(this._onWindowResize)
      } catch {
        /* 端不支持 */
      }
      // #ifdef H5
      if (typeof window !== 'undefined') window.addEventListener('resize', this._onWindowResize)
      // #endif
    },
    unbindResize() {
      try {
        if (this._onWindowResize && typeof uni.offWindowResize === 'function') {
          uni.offWindowResize(this._onWindowResize)
        }
      } catch {
        /* 端不支持 */
      }
      // #ifdef H5
      if (typeof window !== 'undefined' && this._onWindowResize) {
        window.removeEventListener('resize', this._onWindowResize)
      }
      // #endif
      this._onWindowResize = null
    },
    clearScrollSettle() {
      if (this._scrollSettleTimer != null) {
        clearTimeout(this._scrollSettleTimer)
        this._scrollSettleTimer = null
      }
    },
    /**
     * 惯性滚动停稳后再对齐真实 scrollTop。
     * 微信 scroll-view 快速回顶时常丢末帧，glassProgress 会卡在非 0；
     * 滚动过程中仍即时更新，不改渐变手感。
     * @param {number} [reportedTop] 内层注入上报时传入，避免误查不存在的 scroller
     */
    scheduleScrollSettle(reportedTop) {
      if (reportedTop != null && Number.isFinite(Number(reportedTop))) {
        this._lastReportedTop = Math.max(0, Number(reportedTop))
      }
      this.clearScrollSettle()
      this._scrollSettleTimer = setTimeout(() => {
        this._scrollSettleTimer = null
        if (this.useInnerScroll) {
          this.syncScrollTopFromScroller()
          return
        }
        // 无本组件 scroller（页面级滚动 / 页面自管滚动）：用末次上报近顶兜底
        const last = Number(this._lastReportedTop)
        this.applyScrollTop(Number.isFinite(last) && last < 1 ? 0 : last || 0)
      }, 96)
    },
    syncScrollTopFromScroller() {
      if (!this.useInnerScroll) return
      uni
        .createSelectorQuery()
        .in(this)
        .select('.lingyun-app-page__scroller')
        .scrollOffset()
        .exec((res) => {
          const top = Number(res?.[0]?.scrollTop)
          this.applyScrollTop(Number.isFinite(top) ? top : 0)
        })
    },
    applyScrollTop(scrollTop) {
      const dist = Math.max(1, Number(this.glassDistance) || 56)
      // 亚像素 / 回弹残留：视为已在顶，避免玻璃卡在极低进度
      const y = Math.max(0, Number(scrollTop) || 0)
      const effective = y < 0.5 ? 0 : y
      const next = Math.min(1, effective / dist)
      this.glassProgress = next
      this.$emit('scroll', effective)
    },
    onBodyScroll(e) {
      const top = Number(e?.detail?.scrollTop ?? e?.target?.scrollTop ?? 0)
      const y = Number.isFinite(top) ? top : 0
      this.applyScrollTop(y)
      this.scheduleScrollSettle(y)
    },
    onScrollToUpper() {
      this.applyScrollTop(0)
      this.scheduleScrollSettle(0)
    },
    onBack() {
      this.$emit('back')
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
        return
      }
      uni.reLaunch({ url: '/pages/index/index' })
    },
    onClose() {
      this.$emit('close')
    },
    onTrailing() {
      this.$emit('trailing')
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-app-page {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  box-sizing: border-box;
  /* 分组列表页底：Grouped Primary（暗黑 #000，与卡面 Secondary #1c1c1e 拉开） */
  background-color: var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
  color: var(--lingyun-label, #{$lingyun-label});
}

/* 页面级滚动：交给页面自己滚，勿锁死视口高度 */
.lingyun-app-page--page-scroll {
  display: block;
  height: auto;
  min-height: 100vh;
}

.lingyun-app-page__sentinel {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  opacity: 0;
  pointer-events: none;
}

.lingyun-app-page__scroller {
  flex: 1;
  width: 100%;
  height: 0;
  min-height: 0;
}

.lingyun-app-page__body {
  flex: 1;
  min-height: 0;
  height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.lingyun-app-page__pad {
  min-height: 100%;
  box-sizing: border-box;
}

.lingyun-app-page--nav {
  padding-left: var(--lingyun-page-nav-width, 220px);
  box-sizing: border-box;
}

.lingyun-app-page__nav {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 90;
  width: var(--lingyun-page-nav-width, 220px);
  height: 100%;
}

/*
 * 顶栏占位选择器在 styles/setting/_app-page-layout.scss（全局注入）。
 * 勿写回本组件：插槽首子无本组件 data-v，H5 会丢 padding-top。
 */
</style>
