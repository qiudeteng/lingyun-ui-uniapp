<template>
  <view class="lingyun-app-page" :class="rootClass" :style="pageVars">
    <!-- 小程序宽屏侧栏留在页面里。H5 由 lingyunUi 挂到 body，避免换页拆掉侧栏。 -->
    <!-- #ifndef H5 -->
    <view v-if="showPageNav" class="lingyun-app-page__nav">
      <lingyun-page-nav :sections="navSections">
        <template v-if="$slots['nav-avatar']" #avatar>
          <slot name="nav-avatar" />
        </template>
        <template v-if="$slots['nav-name']" #name>
          <slot name="nav-name" />
        </template>
        <template v-if="$slots['nav-subtitle']" #subtitle>
          <slot name="nav-subtitle" />
        </template>
      </lingyun-page-nav>
    </view>
    <!-- #endif -->

    <lingyun-toolbars
      v-if="showToolbar"
      class="lingyun-app-page__toolbar"
      :title="displayTitle"
      :subtitle="hostedMiss ? '' : subtitle"
      :title-style="titleStyle"
      :placement="placement"
      :show-back="showBackEffective"
      :show-close="showCloseEffective"
      :show-grabber="showGrabberEffective"
      :show-trailing="showTrailing"
      :show-window-controls="navDocked ? false : 'auto'"
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

    <!-- H5 侧栏在 body 上，顶部插槽传送进那一列 -->
    <!-- #ifdef H5 -->
    <teleport v-if="navHeaderReady && $slots['nav-avatar']" to="#ly-nav-slot-avatar">
      <slot name="nav-avatar" />
    </teleport>
    <teleport v-if="navHeaderReady && $slots['nav-name']" to="#ly-nav-slot-name">
      <slot name="nav-name" />
    </teleport>
    <teleport v-if="navHeaderReady && $slots['nav-subtitle']" to="#ly-nav-slot-subtitle">
      <slot name="nav-subtitle" />
    </teleport>
    <!-- #endif -->

    <!-- 默认形态：页面级滚动。玻璃进度由顶部哨兵的露出比例驱动（无 @scroll 可用） -->
    <view v-if="usePageScroll" class="lingyun-app-page__sentinel" :style="sentinelStyle" />
    <view v-if="usePageScroll" class="lingyun-app-page__pad">
      <view v-if="hostedMiss" class="lingyun-app-page__hosted">
        <lingyun-page-miss :from="hostedFrom" @home="onHostHome" />
      </view>
      <slot v-else />
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
        <view v-if="hostedMiss" class="lingyun-app-page__hosted">
          <lingyun-page-miss :from="hostedFrom" @home="onHostHome" />
        </view>
        <slot v-else />
      </view>
    </scroll-view>

    <!-- bodyScroll=false：页面自管内层滚动，用 useLingyunAppPageScroll 上报 -->
    <view v-if="!bodyScroll" class="lingyun-app-page__body">
      <view class="lingyun-app-page__pad">
        <view v-if="hostedMiss" class="lingyun-app-page__hosted">
          <lingyun-page-miss :from="hostedFrom" @home="onHostHome" />
        </view>
        <slot v-else />
      </view>
    </view>

    <!-- 命令式 Toast/HUD：须在页面树内（mp-weixin 的 App.vue 模板不会盖到页面上） -->
    <lingyun-feedback-host />
  </view>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, inject, provide, ref, type PropType } from 'vue'
import { onResize } from '@dcloudio/uni-app'
import {
  LINGYUN_APP_PAGE_BIND_SCROLL,
  LINGYUN_APP_PAGE_REPORT_SCROLL,
  LINGYUN_APP_PAGE_SCROLL_LOCK,
  LINGYUN_APP_PAGE_SCROLL_LOCKED,
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
import { pageRequiresLogin } from '@/router/guards'
import {
  LINGYUN_PAGE_NAV_HOME,
  LINGYUN_PAGE_NAV_WIDTH,
  claimLingyunPageNavHeaderSlots,
  releaseLingyunPageNavHeaderSlots,
  setLingyunPageNavIntent,
  type LingyunPageNavSection,
} from '@/router/pageNav'
import { clearLingyunPageHost, hostedFromText, hostedPagePath, openLingyunHostedPage } from '@/router/pageHost'
// #ifdef H5
import { setLingyunH5PageNavAllowed } from '@/uni_modules/lingyun-ui/components/lingyun-page-nav/mountLingyunPageNav'
// #endif

/**
 * lingyun-app-page
 * @description 隐藏原生导航后的页面壳：固定 lingyun-toolbars + 滚动区顶栏占位 + 玻璃渐变
 * @see design/TOOLBARS.md
 *
 * 根节点挂 theme-light / theme-dark：小程序无 document，手动主题靠此 class 下发 CSS 变量
 *
 * @property {String} title / subtitle
 * @property {String} titleStyle / placement
 * @property {Boolean} showBack / showClose / showGrabber / showTrailing / safeArea / bodyScroll / pageScroll / showNav / showToolbar
 * @property {Array} navSections 只覆盖当前页（微信内嵌列）。全局菜单用 setLingyunPageNavSections
 * 插槽 nav-avatar / nav-name / nav-subtitle：宽屏左栏顶部。不传则显示「凌云UI」和默认介绍
 * @property {Number} glassDistance 滚过多少 px 达到满玻璃
 * @event back / close / trailing / scroll
 */
type MpGlassObserver = {
  relativeToViewport: () => {
    observe: (selector: string, callback: (res: { intersectionRatio?: number }) => void) => void
  }
  disconnect?: () => void
}

type MpComponentScope = {
  createIntersectionObserver?: (options: object) => MpGlassObserver
}

export default defineComponent({
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
    /** 宽屏（≥690，含折叠屏展开）左侧停靠导航。false 关闭。Sheet 形态永不显示。 */
    showNav: { default: true },
    /** 头部顶栏。false 时不渲染，也不再为顶栏预留高度 */
    showToolbar: { type: Boolean, default: true },
    /** 覆盖默认目录；null 使用 LINGYUN_PAGE_NAV */
    navSections: {
      type: Array as PropType<LingyunPageNavSection[] | null>,
      default: null,
    },
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
      /** H5：顶部插槽目标节点出现后再传送 */
      navHeaderReady: false,
      _scrollSettleTimer: null as ReturnType<typeof setTimeout> | null,
      _scrollLockCount: 0,
      /** 页面级滚动下驱动玻璃渐变的哨兵观察器 */
      _glassObserver: null as MpGlassObserver | null,
      _navSlotClaim: 0,
      _lastReportedTop: undefined as number | undefined,
      _navSlotTimer: null as ReturnType<typeof setTimeout> | null,
      _onWindowResize: null as ((res?: unknown) => void) | null,
    }
  },
  setup() {
    const instance = getCurrentInstance()
    const scrollLocked = ref(false)
    provide(LINGYUN_APP_PAGE_SCROLL_LOCKED, scrollLocked)
    onResize((res) => {
      const proxy = (instance && instance.proxy) as
        | { syncNavLayout?: (windowWidth?: number) => void }
        | null
      if (proxy && typeof proxy.syncNavLayout === 'function') {
        proxy.syncNavLayout(readLingyunResizeWidth(res))
      }
    })
    return {
      bindScroll: inject(LINGYUN_APP_PAGE_BIND_SCROLL, null),
      scrollLocked,
    }
  },
  created() {
    if (typeof this.bindScroll === 'function') {
      this.bindScroll((scrollTop: number) => {
        this.applyScrollTop(scrollTop)
        this.scheduleScrollSettle(scrollTop)
      })
    }
    this.syncNavLayout()
    this._scrollSettleTimer = null
    this._scrollLockCount = 0
    this._glassObserver = null
    this._navSlotClaim = 0
  },
  mounted() {
    this.syncNavLayout()
    this.syncNavHeaderSlots()
    this.syncH5PageNavHost()
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
    clearLingyunPageHost()
    this.releaseNavHeaderSlots()
    this.clearScrollSettle()
    this.teardownGlassObserver()
    this.unbindResize()
  },
  watch: {
    safeArea() {
      this.syncNavLayout()
    },
    navDocked() {
      this.syncH5PageNavHost()
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
      if (pageRequiresLogin()) return false
      if (!coerceTriFlag(this.showNav, true)) return false
      if (this.placement === 'sheet' || this.showGrabberEffective) return false
      return this.regular
    },
    /** 未登录的受保护页先藏起来，避免冷启动先画出首页和侧栏再跳登录 */
    authHold() {
      return pageRequiresLogin()
    },
    /** 宽屏侧栏点到未注册页面：留在本页，只换右侧。 */
    hostedMiss() {
      // #ifdef H5
      return false
      // #endif
      // #ifndef H5
      return this.navDocked && hostedPagePath() === 'pages/404/404'
      // #endif
    },
    hostedFrom() {
      return hostedFromText()
    },
    displayTitle() {
      return this.hostedMiss ? '404' : this.title
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
      if (!this.showToolbar) return '0px'
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
      /* 宽屏停靠左侧导航时用侧栏切页，auto 不再显示返回；显式 true 仍可开 */
      return coerceTriFlag(this.showBack, !this.navDocked)
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
          'lingyun-app-page--auth-hold': this.authHold,
        },
      ]
    },
  },
  provide() {
    return {
      [LINGYUN_APP_PAGE_REPORT_SCROLL]: (scrollTop: number) => {
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
      const thresholds: number[] = []
      for (let i = 0; i <= steps; i += 1) thresholds.push(i / steps)
      try {
        const options = { thresholds, nativeMode: true }
        // 微信会对传入的组件实例枚举键，Vue 代理会告警。用小程序组件实例创建观察器。
        const scope = (this as unknown as { $scope?: MpComponentScope }).$scope
        const observer: MpGlassObserver =
          scope && typeof scope.createIntersectionObserver === 'function'
            ? scope.createIntersectionObserver(options)
            : (uni.createIntersectionObserver(scope, options) as MpGlassObserver)
        observer.relativeToViewport().observe('.lingyun-app-page__sentinel', (res: { intersectionRatio?: number }) => {
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
      const observer = this._glassObserver
      if (observer) {
        try {
          observer.disconnect?.()
        } catch {
          /* ignore */
        }
        this._glassObserver = null
      }
    },
    lockBodyScroll() {
      this._scrollLockCount = (this._scrollLockCount || 0) + 1
      if (this.bodyScrollY) this.bodyScrollY = false
      this.scrollLocked = true
      this.applyMpPageOverflow(true)
    },
    unlockBodyScroll() {
      this._scrollLockCount = Math.max(0, (this._scrollLockCount || 0) - 1)
      if (this._scrollLockCount === 0 && !this.bodyScrollY) this.bodyScrollY = true
      if (this._scrollLockCount === 0) {
        this.scrollLocked = false
        this.applyMpPageOverflow(false)
      }
    },
    applyMpPageOverflow(locked: boolean) {
      // #ifdef MP-WEIXIN
      try {
        const api = uni as unknown as {
          setPageStyle?: (options: { style?: { overflow?: string } }) => void
        }
        if (typeof api.setPageStyle === 'function') {
          api.setPageStyle({ style: { overflow: locked ? 'hidden' : 'visible' } })
        }
      } catch {
        /* 低版本基础库没有 setPageStyle 时不锁页面滚轮 */
      }
      // #endif
    },
    syncNavLayout(windowWidth?: number) {
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
      this.syncH5PageNavHost()
    },
    syncNavHeaderSlots() {
      const slots = this.$slots || {}
      this._navSlotClaim = claimLingyunPageNavHeaderSlots({
        avatar: !!slots['nav-avatar'],
        name: !!slots['nav-name'],
        subtitle: !!slots['nav-subtitle'],
      })
      this.armNavHeader()
    },
    armNavHeader(left: number = 30) {
      const slots = this.$slots || {}
      const need: string[] = []
      if (slots['nav-avatar']) need.push('ly-nav-slot-avatar')
      if (slots['nav-name']) need.push('ly-nav-slot-name')
      if (slots['nav-subtitle']) need.push('ly-nav-slot-subtitle')
      if (!need.length) return
      // #ifdef H5
      const ready =
        typeof document !== 'undefined' && need.every((id) => document.getElementById(id))
      if (!ready) {
        if (left <= 0) return
        this._navSlotTimer = setTimeout(() => this.armNavHeader(left - 1), 16)
        return
      }
      // #endif
      this.navHeaderReady = true
    },
    releaseNavHeaderSlots() {
      this.navHeaderReady = false
      if (this._navSlotTimer) clearTimeout(this._navSlotTimer)
      releaseLingyunPageNavHeaderSlots(this._navSlotClaim)
    },
    syncH5PageNavHost() {
      // #ifdef H5
      setLingyunH5PageNavAllowed(this.navDocked)
      // #endif
    },
    bindResize() {
      const onWindowResize = (res?: unknown) => {
        this.syncNavLayout(readLingyunResizeWidth(res))
      }
      this._onWindowResize = onWindowResize
      try {
        if (typeof uni.onWindowResize === 'function') uni.onWindowResize(onWindowResize)
      } catch {
        /* 端不支持 */
      }
      // #ifdef H5
      if (typeof window !== 'undefined') window.addEventListener('resize', onWindowResize)
      // #endif
    },
    unbindResize() {
      const onWindowResize = this._onWindowResize
      try {
        if (onWindowResize && typeof uni.offWindowResize === 'function') {
          uni.offWindowResize(onWindowResize)
        }
      } catch {
        /* 端不支持 */
      }
      // #ifdef H5
      if (typeof window !== 'undefined' && onWindowResize) {
        window.removeEventListener('resize', onWindowResize)
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
    scheduleScrollSettle(reportedTop?: number) {
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
      const node = uni.createSelectorQuery().in(this).select('.lingyun-app-page__scroller')
      const offset = node.scrollOffset as unknown as () => {
        exec: (cb: (res: Array<{ scrollTop?: number } | undefined> | undefined) => void) => void
      }
      offset().exec((res) => {
          const top = Number(res?.[0]?.scrollTop)
          this.applyScrollTop(Number.isFinite(top) ? top : 0)
        })
    },
    applyScrollTop(scrollTop: number) {
      const dist = Math.max(1, Number(this.glassDistance) || 56)
      // 亚像素 / 回弹残留：视为已在顶，避免玻璃卡在极低进度
      const y = Math.max(0, Number(scrollTop) || 0)
      const effective = y < 0.5 ? 0 : y
      const next = Math.min(1, effective / dist)
      this.glassProgress = next
      this.$emit('scroll', effective)
    },
    onBodyScroll(e: { detail?: { scrollTop?: number }; target?: { scrollTop?: number } }) {
      const top = Number(e?.detail?.scrollTop ?? e?.target?.scrollTop ?? 0)
      const y = Number.isFinite(top) ? top : 0
      this.applyScrollTop(y)
      this.scheduleScrollSettle(y)
    },
    onScrollToUpper() {
      this.applyScrollTop(0)
      this.scheduleScrollSettle(0)
    },
    onHostHome() {
      setLingyunPageNavIntent(LINGYUN_PAGE_NAV_HOME)
      if (openLingyunHostedPage(LINGYUN_PAGE_NAV_HOME, LINGYUN_PAGE_NAV_HOME)) return
      uni.redirectTo({ url: LINGYUN_PAGE_NAV_HOME })
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
})
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

/* 宽屏未注册页：首子已被全局样式撑到一屏，这里把 404 放在顶栏以下的正中 */
.lingyun-app-page__hosted {
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
}

.lingyun-app-page--nav {
  padding-left: var(--lingyun-page-nav-width, 220px);
  box-sizing: border-box;
}

.lingyun-app-page--auth-hold {
  visibility: hidden;
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
