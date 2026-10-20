<template>
  <view class="lingyun-app-page" :class="rootClass" :style="pageVars">
    <!-- 小程序宽屏侧栏留在页面里。H5 由 lingyunUi 挂到 body，避免换页拆掉侧栏。 -->
    <!-- #ifndef H5 -->
    <view v-if="!embedded && showPageNav" class="lingyun-app-page__nav">
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

    <lingyun-duo-toolbar
      v-if="!embedded && showToolbar && (isDuoTopBottom || isDuoSplit)"
      class="lingyun-app-page__toolbar"
      :title="displayTitle"
      :show-back="isDuoSplit ? false : showBackEffective"
      :right-inset="duoTopRightInset"
      @back="onBack"
    >
      <template #leading>
        <slot name="leading" />
      </template>
      <template #trailing>
        <slot name="trailing" />
      </template>
    </lingyun-duo-toolbar>

    <lingyun-toolbars
      v-else-if="!embedded && showToolbar && pageLayout.toolbarPlacement !== 'hidden'"
      class="lingyun-app-page__toolbar"
      :title="displayTitle"
      :subtitle="hostedMiss ? '' : subtitle"
      :title-style="titleStyle"
      :placement="placement"
      :show-back="showBackEffective"
      :show-close="showCloseEffective"
      :show-grabber="showGrabberEffective"
      :show-trailing="showTrailing"
      :show-window-controls="navDocked || tabbarVisible ? false : 'auto'"
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
    <teleport v-if="!embedded && navHeaderReady && $slots['nav-avatar']" to="#ly-nav-slot-avatar">
      <slot name="nav-avatar" />
    </teleport>
    <teleport v-if="!embedded && navHeaderReady && $slots['nav-name']" to="#ly-nav-slot-name">
      <slot name="nav-name" />
    </teleport>
    <teleport v-if="!embedded && navHeaderReady && $slots['nav-subtitle']" to="#ly-nav-slot-subtitle">
      <slot name="nav-subtitle" />
    </teleport>
    <!-- #endif -->

    <!-- 默认形态：页面级滚动。玻璃进度由顶部哨兵的露出比例驱动（无 @scroll 可用） -->
    <view v-if="embedded" class="lingyun-app-page__embedded">
      <slot />
    </view>

    <view v-if="!embedded && usePageScroll" class="lingyun-app-page__sentinel" :style="sentinelStyle" />
    <view
      v-if="!embedded && usePageScroll"
      class="lingyun-app-page__pad"
      :style="bottomInsetStyle"
    >
      <view v-if="hostedMiss" class="lingyun-app-page__hosted">
        <lingyun-page-miss :from="hostedFrom" @home="onHostHome" />
      </view>
      <lingyun-split-view v-else-if="isDuoSplit">
        <template #primary>
          <slot name="split-primary">
            <slot />
          </slot>
        </template>
        <template #detail>
          <slot name="split-detail" />
        </template>
      </lingyun-split-view>
      <slot v-else />
    </view>

    <!-- 逃生口：需要 scroll-y 锁（横向 swipe）等场景仍可用内层 scroll-view -->
    <scroll-view
      v-if="!embedded && useInnerScroll"
      class="lingyun-app-page__scroller"
      :scroll-y="bodyScrollY"
      :scroll-with-animation="true"
      :show-scrollbar="false"
      :upper-threshold="2"
      @scroll="onBodyScroll"
      @scrolltoupper="onScrollToUpper"
    >
      <view class="lingyun-app-page__pad" :style="bottomInsetStyle">
        <view v-if="hostedMiss" class="lingyun-app-page__hosted">
          <lingyun-page-miss :from="hostedFrom" @home="onHostHome" />
        </view>
        <lingyun-split-view v-else-if="isDuoSplit">
          <template #primary>
            <slot name="split-primary">
              <slot />
            </slot>
          </template>
          <template #detail>
            <slot name="split-detail" />
          </template>
        </lingyun-split-view>
        <slot v-else />
      </view>
    </scroll-view>

    <!-- bodyScroll=false：页面自管内层滚动，用 useLingyunAppPageScroll 上报 -->
    <view
      v-if="!embedded && !bodyScroll"
      class="lingyun-app-page__body"
      :style="bottomInsetStyle"
    >
      <view class="lingyun-app-page__pad">
        <view v-if="hostedMiss" class="lingyun-app-page__hosted">
          <lingyun-page-miss :from="hostedFrom" @home="onHostHome" />
        </view>
        <lingyun-split-view v-else-if="isDuoSplit">
          <template #primary>
            <slot name="split-primary">
              <slot />
            </slot>
          </template>
          <template #detail>
            <slot name="split-detail" />
          </template>
        </lingyun-split-view>
        <slot v-else />
      </view>
    </view>

    <!-- Duo 右侧全高栏：外屏竖/横、内屏横屏 -->
    <lingyun-duo-rail
      v-if="duoRailVisible"
      class="lingyun-app-page__duo-rail"
      :items="tabbarItems"
      :model-value="activeTabKey"
      :pose="duoPoseKey"
      :compact-tools="duoCompactTools"
      @change="onTabbarChange"
      @search="onDuoSearch"
      @overflow="onDuoOverflow"
    >
      <template #tools>
        <slot name="duo-tools" />
      </template>
    </lingyun-duo-rail>

    <!-- Duo Split View：右侧 84 状态/返回列；内容在左侧双栏 -->
    <view v-if="!embedded && isDuoSplit" class="lingyun-app-page__duo-split-rail">
      <view class="lingyun-app-page__duo-split-status" />
      <view
        class="lingyun-app-page__duo-split-back"
        hover-class="lingyun-app-page__duo-split-back--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        aria-label="Back"
        @click="onBack"
      >
        <lingyun-icon type="left" :size="28" color="label" />
      </view>
    </view>

    <!-- 全局一级导航：窄屏底部 Tab；宽屏由左侧 nav 承担 -->
    <view
      v-if="!embedded && pageLayout.foldBand !== 'none' && !isDuoSplit"
      class="lingyun-app-page__fold-band"
      :class="`lingyun-app-page__fold-band--${pageLayout.foldBand}`"
      :style="foldBandStyle"
    />

    <lingyun-tabbars
      v-if="tabbarVisible"
      class="lingyun-app-page__tabbar"
      :items="tabbarItems"
      :model-value="activeTabKey"
      :size="tabbarSize"
      :safe-area="tabbarSafeArea"
      :variant="tabbarVariant"
      :fallback-first="false"
      :from-key="tabbarFromKey"
      icon-mode="icon"
      :fixed="true"
      @change="onTabbarChange"
    />

    <!-- 命令式 Toast/HUD：须在页面树内（mp-weixin 的 App.vue 模板不会盖到页面上） -->
    <lingyun-feedback-host v-if="!embedded" />
  </view>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, inject, provide, ref, type PropType } from 'vue'
import { onResize, onShow } from '@dcloudio/uni-app'
import {
  LINGYUN_APP_PAGE_BIND_SCROLL,
  LINGYUN_APP_PAGE_BOTTOM_INSET,
  LINGYUN_APP_PAGE_NAV_INSET,
  LINGYUN_APP_PAGE_REPORT_SCROLL,
  LINGYUN_APP_PAGE_SCROLL_LOCK,
  LINGYUN_APP_PAGE_SCROLL_LOCKED,
  LINGYUN_APP_PAGE_TOP_INSET,
  type LingyunAppPageScrollLock,
} from './useLingyunAppPageScroll'
import {
  coerceTriFlag,
  getLingyunNavLayout,
  LINGYUN_TOOLBAR_2LINE_LARGE_EXTRA_PX,
  LINGYUN_TOOLBAR_BAR_DESIGN_PX,
  LINGYUN_TOOLBAR_LARGE_EXTRA_PX,
  readLingyunResizeWidth,
  readLingyunWindowWidth,
} from '../lingyun-toolbars/getLingyunNavSafeInset'
import { useLingyunTheme } from '../../utils/theme'
import { lingyun } from '../../utils/screen'
import { resolveLingyunFormFactor } from '../../utils/layoutAdapter'
import {
  claimLingyunPageNavHeaderSlots,
  clearLingyunPageNavIntent,
  ensureLingyunWidePageHost,
  getLingyunPageNavHome,
  getLingyunPageNavIntent,
  hostedFromText,
  hostedPagePath,
  lingyunPageRequiresLogin,
  normalizeLingyunPagePath,
  openLingyunHostedPage,
  readLingyunCurrentPagePath,
  releaseLingyunPageNavHeaderSlots,
  resolveLingyunPageUrl,
  setLingyunPageNavIntent,
  setLingyunPageNavRail,
  subscribeLingyunPageRoute,
  useLingyunHostedPath,
  useLingyunPageNavIntent,
  type LingyunPageNavSection,
} from '../../utils/pageNavAdapter'
import {
  getLingyunPageConfig,
  getLingyunPageOverride,
  matchLingyunPageTab,
} from '../../utils/pageConfig'
import {
  resolveLingyunPageLayout,
  type LingyunPageLayoutResult,
  type LingyunPageTab,
} from '../../utils/pageLayout'
import {
  beginLingyunTabTransition,
  clearLingyunTabTransition,
  consumeLingyunTabTransition,
} from '../../utils/tabTransition'
import { consumeLingyunNavTransition } from '../../utils/navTransition'
import {
  LINGYUN_DUO_RAIL_WIDTH,
  LINGYUN_DUO_TOP_BAR_HEIGHT,
  LINGYUN_DUO_TOP_RIGHT_RESERVED,
} from '../../utils/duoMetrics'
// #ifdef H5
import { setLingyunH5PageNavAllowed } from '../lingyun-page-nav/mountLingyunPageNav'
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
 * @property {Boolean|String} showTabbar 底部 Tab；'auto' 时窄屏显示，false 永远隐藏
 * @property {String} navMode auto / tabbar / sidebar / none，页面级最高优先
 * @property {Boolean} autoBottomInset 自动为底部 Tab 留白
 * @property {Array} navSections 显式目录，优先于全局 tabs 与宿主目录
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

const LINGYUN_APP_PAGE_EMBEDDED = Symbol('lingyun-app-page-embedded')

export default defineComponent({
  name: 'LingyunAppPage',
  emits: ['back', 'close', 'trailing', 'scroll', 'tab-change', 'duo-search', 'duo-overflow'],
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
    /** 覆盖默认目录；null 使用全局 tabs 或 LINGYUN_PAGE_NAV */
    navSections: {
      type: Array as PropType<LingyunPageNavSection[] | null>,
      default: null,
    },
    /** 全局 tabs 的底部 Tab 栏。'auto' 时窄屏显示；显式 false 永远隐藏 */
    showTabbar: { default: 'auto' },
    /** auto / tabbar / sidebar / none。页面级优先级最高 */
    navMode: { type: String, default: 'auto' },
    /** 关掉后壳不加底部留白，但 CSS 变量与注入仍给出真实值 */
    autoBottomInset: { type: Boolean, default: true },
    glassDistance: { type: Number, default: 56 },
  },
  data() {
    return {
      glassProgress: 0,
      statusBarPx: 0,
      barHeightPx: LINGYUN_TOOLBAR_BAR_DESIGN_PX,
      largeExtraPx: LINGYUN_TOOLBAR_LARGE_EXTRA_PX,
      title2LineLargeExtraPx: LINGYUN_TOOLBAR_2LINE_LARGE_EXTRA_PX,
      /** 页面壳布局的唯一宽度来源（来自自身 resize 监听） */
      windowWidth: readLingyunWindowWidth(),
      /** 当前真实页面路径，用于推导 Tab 选中态 */
      currentPagePath: '',
      /** 跨页切换时 Tab 指示器的起始 key */
      tabbarFromKey: '',
      /** Tab / 左侧菜单换页后内容淡入 */
      pageEntering: false,
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
      _stopRouteChange: null as (() => void) | null,
      _onHashChange: null as (() => void) | null,
      _pageEnterTimer: null as ReturnType<typeof setTimeout> | null,
    }
  },
  setup() {
    const instance = getCurrentInstance()
    const embedded = inject<boolean>(LINGYUN_APP_PAGE_EMBEDDED, false)
    provide(LINGYUN_APP_PAGE_EMBEDDED, true)
    const inheritedScrollLocked = inject(LINGYUN_APP_PAGE_SCROLL_LOCKED, null)
    const inheritedNavInset = inject(LINGYUN_APP_PAGE_NAV_INSET, null)
    const inheritedTopInset = inject(LINGYUN_APP_PAGE_TOP_INSET, null)
    const inheritedBottomInset = inject(LINGYUN_APP_PAGE_BOTTOM_INSET, null)
    const inheritedScrollReport = inject(LINGYUN_APP_PAGE_REPORT_SCROLL, null)
    const inheritedScrollLock = inject<LingyunAppPageScrollLock | null>(
      LINGYUN_APP_PAGE_SCROLL_LOCK,
      null,
    )
    const scrollLocked = embedded && inheritedScrollLocked ? inheritedScrollLocked : ref(false)
    const navInsetPx = embedded && inheritedNavInset ? inheritedNavInset : ref(0)
    const topInsetPx = embedded && inheritedTopInset ? inheritedTopInset : ref(0)
    const bottomInsetPx = embedded && inheritedBottomInset ? inheritedBottomInset : ref(0)
    provide(LINGYUN_APP_PAGE_SCROLL_LOCKED, scrollLocked)
    provide(LINGYUN_APP_PAGE_NAV_INSET, navInsetPx)
    provide(LINGYUN_APP_PAGE_TOP_INSET, topInsetPx)
    provide(LINGYUN_APP_PAGE_BOTTOM_INSET, bottomInsetPx)
    onResize((res) => {
      const proxy = (instance && instance.proxy) as
        | { syncNavLayout?: (windowWidth?: number) => void }
        | null
      if (proxy && typeof proxy.syncNavLayout === 'function') {
        proxy.syncNavLayout(readLingyunResizeWidth(res))
      }
    })
    onShow(() => {
      if (embedded) return
      const proxy = (instance && instance.proxy) as
        | { syncPageChrome?: () => void }
        | null
      proxy?.syncPageChrome?.()
    })
    return {
      bindScroll: inject(LINGYUN_APP_PAGE_BIND_SCROLL, null),
      embedded,
      inheritedScrollLock,
      inheritedScrollReport,
      navInsetPx,
      bottomInsetPx,
      scrollLocked,
      topInsetPx,
      hostedPathRef: useLingyunHostedPath(),
      pageIntentRef: useLingyunPageNavIntent(),
    }
  },
  created() {
    if (typeof this.bindScroll === 'function') {
      this.bindScroll((scrollTop: number) => {
        this.applyScrollTop(scrollTop)
        this.scheduleScrollSettle(scrollTop)
      })
    }
    this.syncPageChrome()
    this.applyPageTransition()
    this.syncNavLayout()
    this._scrollSettleTimer = null
    this._scrollLockCount = 0
    this._glassObserver = null
    this._navSlotClaim = 0
  },
  mounted() {
    if (this.pageEntering) {
      this._pageEnterTimer = setTimeout(() => {
        this.pageEntering = false
        this._pageEnterTimer = null
      }, 300)
    }
    if (this.embedded) return
    if (ensureLingyunWidePageHost()) return
    this.syncNavLayout()
    this.syncNavHeaderSlots()
    this.syncH5PageNavHost()
    this.bindResize()
    this.bindPageRoute()
    if (this.usePageScroll) {
      this.$nextTick(() => this.setupGlassObserver())
    }
    try {
      useLingyunTheme().apply()
    } catch {
      /* pinia 未就绪时忽略 */
    }
  },
  beforeUnmount() {
    this.releaseNavHeaderSlots()
    this.clearScrollSettle()
    this.teardownGlassObserver()
    this.unbindResize()
    this.unbindPageRoute()
    if (this._pageEnterTimer) {
      clearTimeout(this._pageEnterTimer)
      this._pageEnterTimer = null
    }
  },
  watch: {
    safeArea() {
      this.syncNavLayout()
    },
    showToolbar() {
      this.syncTopInset()
    },
    titleStyle() {
      this.syncTopInset()
    },
    placement() {
      this.syncTopInset()
    },
    showGrabber() {
      this.syncTopInset()
    },
    navDocked() {
      this.syncH5PageNavHost()
    },
    pageLayout() {
      this.applyPageLayout()
    },
    autoBottomInset() {
      this.applyPageLayout()
    },
    pageNavRail: {
      immediate: true,
      handler(value: boolean) {
        /* 宽屏宿主的嵌入页也会挂 app-page，但它自己不渲染左侧导航，不能覆盖外层宿主的窄栏状态 */
        if (this.embedded) return
        setLingyunPageNavRail(value)
      },
    },
    usePageScroll(enabled: boolean) {
      this.$nextTick(() => {
        if (enabled) this.setupGlassObserver()
        else this.teardownGlassObserver()
      })
    },
  },
  computed: {
    themeRootClass() {
      try {
        return useLingyunTheme().rootClass
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
      const navWidth = this.pageNavWidth
      return {
        '--lingyun-app-page-bar': `${this.toolbarStackPx}px`,
        '--lingyun-app-page-inset-top': this.insetTop,
        '--lingyun-page-nav-width': `${navWidth}px`,
        '--lingyun-app-page-inset-right': this.isDuoSplit
          ? `${LINGYUN_DUO_RAIL_WIDTH}px`
          : this.duoRailVisible
            ? `${this.pageLayout.railWidth}px`
            : '0px',
        '--lingyun-app-page-inset-bottom': `${this.pageLayout.bottomInsetPx}px`,
        '--lingyun-app-page-tabbar-height': `${this.pageLayout.tabbarHeightPx}px`,
      }
    },
    pageConfig() {
      return getLingyunPageConfig()
    },
    pageOverride() {
      return getLingyunPageOverride(this.effectivePagePath)
    },
    /** 小程序宽屏右侧内容路径优先，其次导航意图，最后真实路由 */
    effectivePagePath() {
      const hosted = this.hostedPathRef
      if (hosted) return normalizeLingyunPagePath(hosted)
      const intent = this.pageIntentRef
      if (intent) return normalizeLingyunPagePath(intent)
      return normalizeLingyunPagePath(
        this.currentPagePath || readLingyunCurrentPagePath(),
      )
    },
    pageLayout(): LingyunPageLayoutResult {
      const env = resolveLingyunFormFactor(lingyun)
      const input = {
        width: this.windowWidth,
        config: this.pageConfig,
        pageOverride: this.pageOverride,
        embedded: this.embedded,
        placement: this.placement,
        grabber: this.showGrabberEffective,
        authHold: this.authHold,
        showNav: this.showNav,
        showTabbar: this.showTabbar,
        navMode: this.navMode,
        safeArea: this.safeArea,
        formFactor: env.formFactor,
        duoPose: env.duoPose,
      }
      const plan = resolveLingyunPageLayout(input)
      return plan
    },
    isDuoTopBottom() {
      return this.pageLayout.chrome === 'duo-top-bottom'
    },
    duoRailVisible() {
      return (
        !this.embedded &&
        this.pageLayout.chrome === 'duo-right-rail' &&
        this.pageLayout.sidebarVisible
      )
    },
    duoPoseKey() {
      return this.pageLayout.layoutClass.replace(/^duo-/, '')
    },
    duoCompactTools() {
      return this.pageLayout.layoutClass === 'duo-outer-landscape'
    },
    isDuoSplit() {
      return this.pageLayout.chrome === 'duo-split'
    },
    tabbarSize() {
      return this.isDuoTopBottom ? 'duo' : 'default'
    },
    duoTopRightInset() {
      return this.isDuoSplit
        ? LINGYUN_DUO_RAIL_WIDTH
        : LINGYUN_DUO_TOP_RIGHT_RESERVED
    },
    foldBandStyle() {
      const size = this.pageLayout.foldBandSize
      if (this.pageLayout.foldBand === 'horizontal') {
        return { height: `${size}px` }
      }
      if (this.pageLayout.foldBand === 'vertical') {
        return { width: `${size}px` }
      }
      return null
    },
    tabbarItems() {
      return (this.pageConfig.tabs || []).map((tab: LingyunPageTab) => ({
        key: tab.key,
        text: tab.text,
        icon: tab.icon,
        badge: tab.badge,
      }))
    },
    tabbarVisible() {
      return (
        !this.embedded &&
        this.pageLayout.tabbarVisible &&
        this.tabbarItems.length > 0
      )
    },
    activeTabKey() {
      const tab = matchLingyunPageTab(this.pageConfig.tabs || [], this.effectivePagePath)
      return tab ? tab.key : ''
    },
    isTabRoot() {
      const tab = matchLingyunPageTab(this.pageConfig.tabs || [], this.effectivePagePath)
      if (!tab) return false
      return (
        normalizeLingyunPagePath(tab.url) ===
        normalizeLingyunPagePath(this.effectivePagePath)
      )
    },
    tabbarSafeArea() {
      return (
        this.pageConfig.tabbar?.safeArea !== false &&
        this.pageOverride?.tabbarSafeArea !== false &&
        this.safeArea !== false
      )
    },
    tabbarVariant() {
      return this.pageConfig.tabbar?.variant || 'default'
    },
    /** 壳实际加到内容上的底部留白 */
    bottomInsetStyle() {
      const inset = this.autoBottomInset ? this.pageLayout.bottomInsetPx : 0
      return inset > 0 ? { paddingBottom: `${inset}px` } : null
    },
    /** 宽屏需要为顶栏让出左侧。H5 的列在 body 上，这里只留宽度。 */
    navDocked() {
      return (
        !this.embedded &&
        this.pageLayout.sidebarVisible &&
        this.pageLayout.navSide === 'left'
      )
    },
    /** 全局 tabs 驱动的窄栏；目录模式仍是完整侧栏 */
    pageNavRail() {
      return this.pageLayout.railVariant === 'rail'
    },
    pageNavWidth() {
      return this.pageLayout.navSide === 'left' ? this.pageLayout.railWidth : 0
    },
    /** 未登录的受保护页先藏起来，避免冷启动先画出首页和侧栏再跳登录 */
    authHold() {
      return lingyunPageRequiresLogin()
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
      if (this.duoRailVisible) {
        return `${this.safeArea ? this.statusBarPx : 0}px`
      }
      if (this.isDuoTopBottom || this.isDuoSplit) {
        return `${LINGYUN_DUO_TOP_BAR_HEIGHT}px`
      }
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
      /* 宽屏停靠左侧导航时用侧栏切页，auto 不再显示返回；
         一级 Tab 根页也不显示返回；显式 true 仍可开 */
      const auto = !this.navDocked && !(this.tabbarVisible && this.isTabRoot)
      return coerceTriFlag(this.showBack, auto)
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
          'lingyun-app-page--embedded': this.embedded,
          'lingyun-app-page--safe': this.safeArea,
          'lingyun-app-page--sheet': this.placement === 'sheet' || this.showGrabberEffective,
          'lingyun-app-page--page-scroll': this.usePageScroll,
          'lingyun-app-page--nav': this.navDocked,
          'lingyun-app-page--nav-rail': this.navDocked && this.pageNavRail,
          'lingyun-app-page--tabbar': this.tabbarVisible,
          'lingyun-app-page--page-enter': this.pageEntering,
          'lingyun-app-page--duo-top-bottom': this.isDuoTopBottom,
          'lingyun-app-page--duo-right-rail': this.duoRailVisible,
          'lingyun-app-page--duo-split': this.isDuoSplit,          'lingyun-app-page--fold-horizontal': this.pageLayout.foldBand === 'horizontal',
          'lingyun-app-page--fold-vertical': this.pageLayout.foldBand === 'vertical',
          'lingyun-app-page--auth-hold': this.authHold,
        },
      ]
    },
  },
  provide() {
    return {
      [LINGYUN_APP_PAGE_REPORT_SCROLL]:
        this.embedded && this.inheritedScrollReport
          ? this.inheritedScrollReport
          : (scrollTop: number) => {
              this.applyScrollTop(scrollTop)
              this.scheduleScrollSettle(scrollTop)
            },
      [LINGYUN_APP_PAGE_SCROLL_LOCK]:
        this.embedded && this.inheritedScrollLock
          ? this.inheritedScrollLock
          : {
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
      const hasWidth = Number.isFinite(width) && width > 0
      const actualWidth = hasWidth ? width : readLingyunWindowWidth()
      this.windowWidth = actualWidth
      const layout = getLingyunNavLayout(
        LINGYUN_TOOLBAR_BAR_DESIGN_PX,
        actualWidth > 0 ? actualWidth : undefined,
      )
      this.statusBarPx = this.safeArea ? layout.statusBarHeight : 0
      this.barHeightPx = layout.barHeight
      this.largeExtraPx = layout.largeExtra
      this.title2LineLargeExtraPx = layout.title2LineLargeExtra
      this.syncTopInset()
      this.applyPageLayout()
    },
    applyPageLayout() {
      if (this.embedded) return
      this.navInsetPx = this.pageNavWidth
      this.bottomInsetPx = this.pageLayout.bottomInsetPx
      this.syncH5PageNavHost()
    },
    syncPageChrome() {
      if (this.embedded) return
      this.currentPagePath = readLingyunCurrentPagePath()
      this.settlePageIntent()
    },
    /** 导航意图与真实路径一致后清掉，避免侧栏高亮一直停在旧项 */
    settlePageIntent() {
      const intent = normalizeLingyunPagePath(getLingyunPageNavIntent())
      if (!intent) return
      const current = normalizeLingyunPagePath(
        this.hostedPathRef || this.currentPagePath,
      )
      if (intent === current) clearLingyunPageNavIntent()
    },
    onPageRouteChange(path: string) {
      const next = normalizeLingyunPagePath(path)
      if (next) this.currentPagePath = next
      this.settlePageIntent()
    },
    bindPageRoute() {
      this._stopRouteChange = subscribeLingyunPageRoute(this.onPageRouteChange)
      // #ifdef H5
      this._onHashChange = () => {
        this.syncPageChrome()
      }
      if (typeof window !== 'undefined') {
        window.addEventListener('hashchange', this._onHashChange)
      }
      // #endif
    },
    unbindPageRoute() {
      if (this._stopRouteChange) {
        this._stopRouteChange()
        this._stopRouteChange = null
      }
      // #ifdef H5
      if (this._onHashChange && typeof window !== 'undefined') {
        window.removeEventListener('hashchange', this._onHashChange)
      }
      this._onHashChange = null
      // #endif
    },
    /** 消费一次换页过渡：Tab 指示器滑入，或左侧菜单换页后内容淡入 */
    applyPageTransition() {
      const reduce = this.prefersReducedMotion()
      const tabTransition = consumeLingyunTabTransition(this.activeTabKey)
      if (tabTransition) {
        this.tabbarFromKey = tabTransition.fromKey
        this.pageEntering = !reduce
        return
      }
      const navTransition = consumeLingyunNavTransition(this.effectivePagePath)
      this.tabbarFromKey = ''
      this.pageEntering = !!navTransition && !reduce
    },
    prefersReducedMotion(): boolean {
      // #ifdef H5
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      }
      // #endif
      return false
    },
    onTabbarChange(item: { key?: string | number }) {
      const key = item && item.key != null ? String(item.key) : ''
      if (!key) return
      const tab = (this.pageConfig.tabs || []).find(
        (entry: LingyunPageTab) => entry.key === key,
      )
      if (!tab) return
      const raw = normalizeLingyunPagePath(tab.url)
      const currentPath = normalizeLingyunPagePath(this.effectivePagePath)
      if (!raw || raw === currentPath) return
      /* 必须在 setLingyunPageNavIntent 之前记录，否则意图会先把 activeTabKey 改成目标项 */
      const fromKey = this.activeTabKey
      this.$emit('tab-change', { key: tab.key, tab })
      if (openLingyunHostedPage(tab.url, raw)) return
      setLingyunPageNavIntent(raw)
      const next = resolveLingyunPageUrl(tab.url)
      if (!next) return
      beginLingyunTabTransition(fromKey, tab.key)
      uni.reLaunch({
        url: next,
        fail: () => {
          clearLingyunTabTransition()
          uni.redirectTo({
            url: next,
            fail: () => clearLingyunTabTransition(),
          })
        },
      })
    },
    onDuoSearch() {
      this.$emit('duo-search')
    },
    onDuoOverflow() {
      this.$emit('duo-overflow')
    },
    syncTopInset() {
      if (this.duoRailVisible) {
        this.topInsetPx = this.safeArea ? this.statusBarPx : 0
        return
      }
      if (this.isDuoTopBottom || this.isDuoSplit) {
        this.topInsetPx = this.showToolbar ? LINGYUN_DUO_TOP_BAR_HEIGHT : 0
        return
      }
      const status = this.safeArea ? this.statusBarPx : 0
      this.topInsetPx = this.showToolbar ? status + this.toolbarStackPx : status
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
      const home = getLingyunPageNavHome(true)
      setLingyunPageNavIntent(home)
      if (openLingyunHostedPage(home, home)) return
      uni.redirectTo({ url: home })
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

.lingyun-app-page--embedded {
  display: block;
  width: 100%;
  height: auto;
  min-height: 0;
  background: transparent;
}

.lingyun-app-page__embedded {
  width: 100%;
  min-height: 100%;
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

/* Duo 右侧全高栏：内容让出栏宽 */
.lingyun-app-page--duo-right-rail {
  padding-right: var(--lingyun-app-page-inset-right, 0px);
  box-sizing: border-box;
}

/* Duo Split View：内容让出右侧返回列 */
.lingyun-app-page--duo-split {
  padding-right: var(--lingyun-app-page-inset-right, 0px);
  box-sizing: border-box;
}

.lingyun-app-page__duo-split-rail {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  width: 84px;
  box-sizing: border-box;
  padding: 24px 24px 24px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: none;
}

.lingyun-app-page__duo-split-status {
  width: 48px;
  height: 83px;
}

.lingyun-app-page__duo-split-back {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  @include lingyun-glass-control;
}

.lingyun-app-page__duo-split-back--hover {
  transform: scale(0.96);
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
 * 换页过渡只淡入内容块：背景色（含左侧安全区）保持稳定，不参与渐变。
 * H5 首子内容块为 uni-view / div；微信为 view。
 * 微信自定义组件节点不参与，避免整页背景跟着闪烁。
 */
.lingyun-app-page--page-enter .lingyun-app-page__pad > view:first-child > view,
.lingyun-app-page--page-enter .lingyun-app-page__pad > uni-view:first-child > uni-view {
  animation: lingyun-app-page-enter 0.24s ease both;
}

@keyframes lingyun-app-page-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Duo 折痕避让带：只提示安全区，不拦截点击 */
.lingyun-app-page__fold-band {
  position: fixed;
  z-index: 5;
  pointer-events: none;
  background-color: var(--lingyun-fill-tertiary, rgba(120, 120, 128, 0.12));
}

.lingyun-app-page__fold-band--horizontal {
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.lingyun-app-page__fold-band--vertical {
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

/*
 * 顶栏占位选择器在 styles/setting/_app-page-layout.scss（全局注入）。
 * 勿写回本组件：插槽首子无本组件 data-v，H5 会丢 padding-top。
 */
</style>
