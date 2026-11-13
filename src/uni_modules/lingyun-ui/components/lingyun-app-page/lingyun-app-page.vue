<template>
  <view
    class="lingyun-app-page"
    :class="rootClass"
    :style="pageVars"
    @touchstart="onPageTouch"
  >
    <!-- 固定背景层：页面级滚动 / scroll-view 滚动时渐变都不跟着内容走 -->
    <view v-if="!embedded" class="lingyun-app-page__backdrop" />

    <!-- 小程序宽屏侧栏留在页面里。H5 由 lingyunUi 挂到 body，避免换页拆掉侧栏。 -->
    <!-- #ifndef H5 -->
    <view v-if="!embedded && showPageNav" class="lingyun-app-page__nav">
      <lingyun-page-nav :sections="navSections" :host-safe-top="statusBarPx">
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
      <view class="lingyun-app-page__nav-line" />
    </view>
    <!-- #endif -->

    <lingyun-duo-toolbar
      v-if="!embedded && showToolbar && (isDuoTopBottom || isDuoSplit)"
      class="lingyun-app-page__toolbar"
      :title="displayTitle"
      :show-back="isDuoSplit ? false : showBackEffective"
      :right-inset="duoTopRightInset"
      :tools-visible="!!$slots['duo-tools'] || !!$slots.trailing || !!themeSwitchEffective"
      :tools-single="!$slots['duo-tools'] && !$slots.trailing"
      :leading-visible="!!$slots.leading"
      :glass-progress="glassProgress"
      :tools-hidden="duoToolsMenuMounted"
      @back="onBack"
    >
      <template v-if="$slots.leading" #leading>
        <slot name="leading" />
      </template>
      <template #tools>
        <slot name="duo-tools" />
        <slot v-if="!$slots['duo-tools']" name="trailing" />
        <lingyun-theme-action
          v-if="themeSwitchEffective"
          :grouped="true"
          :icon-size="22"
          @menu-open="duoToolsMenuMounted = true"
          @menu-closed="duoToolsMenuMounted = false"
        />
      </template>
    </lingyun-duo-toolbar>

    <lingyun-toolbars
      v-else-if="!embedded && showToolbar && pageLayout.toolbarPlacement !== 'hidden'"
      class="lingyun-app-page__toolbar"
      :title="displayTitle"
      :subtitle="hostedMiss ? '' : subtitle"
      :subtitle-picker="subtitlePicker"
      :title-style="titleStyle"
      :placement="placement"
      :show-back="showBackEffective"
      :show-close="showCloseEffective"
      :show-grabber="showGrabberEffective"
      :show-trailing="showTrailing"
      :show-window-controls="navDocked || tabbarVisible ? false : 'auto'"
      :trailing-buttons="trailingButtons"
      :trailing-buttons-hidden="trailingButtonsHidden"
      :trailing-menu-enabled="trailingMenuEnabled"
      :show-theme-switch="showThemeSwitch"
      :searchable="searchable"
      :searching="searchActive"
      :search-value="searchText"
      :search-placeholder="searchPlaceholder"
      :segments="segments"
      :segment-value="segmentValue"
      :segment-control="segmentControl"
      :fixed="true"
      :safe-area="safeArea"
      :glass-progress="glassProgress"
      @back="onBack"
      @close="onClose"
      @trailing="onTrailing"
      @trailing-action="onTrailingAction"
      @search-open="onToolbarSearchOpen"
      @search-cancel="onToolbarSearchCancel"
      @update:searchValue="onSearchInput"
      @search="onSearchConfirm"
      @update:segmentValue="onSegmentUpdate"
      @segment-click="onSegmentClick"
      @segment-change="onSegmentChange"
      @picker-value="onPickerValue"
    >
      <template #leading>
        <slot name="leading" />
      </template>
      <template #trailing>
        <slot name="trailing" />
      </template>
      <template
        v-if="$slots['trailing-menu']"
        #trailing-menu="{ button, index, groupIndex, buttonIndex, close }"
      >
        <slot
          name="trailing-menu"
          :button="button"
          :index="index"
          :groupIndex="groupIndex"
          :buttonIndex="buttonIndex"
          :close="close"
        />
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
      :items="duoRailItems"
      :model-value="activeTabKey"
      :pose="duoPoseKey"
      :compact-tools="duoCompactTools"
      :tools-visible="!!$slots['duo-tools'] || !!themeSwitchEffective"
      :tools-single="!$slots['duo-tools']"
      :tools-hidden="duoRailToolsMenuMounted"
      :show-back="duoRailShowBack"
      :show-search="duoRailShowSearch"
      @change="onTabbarChange"
      @search="onDuoSearch"
      @overflow="onDuoOverflow"
      @back="onBack"
    >
      <template #tools>
        <slot name="duo-tools" />
        <lingyun-theme-action
          v-if="themeSwitchEffective"
          :grouped="true"
          :icon-size="22"
          @menu-open="duoRailToolsMenuMounted = true"
          @menu-closed="duoRailToolsMenuMounted = false"
        />
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
  LINGYUN_TOOLBAR_SEGMENT_ROW_PX,
  LINGYUN_TOOLBAR_TABS_ROW_PX,
  readLingyunResizeWidth,
  readLingyunWindowWidth,
} from '../lingyun-toolbars/getLingyunNavSafeInset'
import { useLingyunTheme } from '../../utils/theme'
import { lingyunToolbarPicker } from '../../utils/toolbarPicker'
import { useLingyunThemeSwitchVisible } from '../../utils/themeSwitch'
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
  isLingyunTabHostPage,
  LINGYUN_PAGE_NAV_RAIL_MENU_WIDTH,
  lingyunPageNavInlineMenu,
  lingyunPageRequiresLogin,
  normalizeLingyunPagePath,
  openLingyunHostedPage,
  openLingyunTabPage,
  readLingyunCurrentPagePath,
  releaseLingyunPageNavHeaderSlots,
  resolveLingyunPageUrl,
  setLingyunPageNavIntent,
  setLingyunPageNavInline,
  setLingyunPageNavRail,
  subscribeLingyunPageRoute,
  useLingyunHostedPath,
  useLingyunPageNavIntent,
  type LingyunPageNavSection,
} from '../../utils/pageNavAdapter'
import {
  buildLingyunPageTabWorkspaceUrl,
  getLingyunPageConfig,
  getLingyunPageOverride,
  getLingyunWorkspaceTabKey,
  isLingyunWorkspacePath,
  matchLingyunPageTab,
  setLingyunWorkspaceTabKey,
  syncLingyunWorkspaceUrl,
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
  emits: [
    'back',
    'close',
    'trailing',
    'trailing-action',
    'scroll',
    'tab-change',
    'duo-search',
    'duo-overflow',
    'update:searching',
    'update:searchValue',
    'search-open',
    'search-cancel',
    'search-input',
    'search',
    'update:segmentValue',
    'segment-click',
    'segment-change',
    'picker-value',
  ],
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    /** 副标题位置显示全局选择器。默认关，需要的页面设为 true */
    subtitlePicker: { type: Boolean, default: false },
    titleStyle: { type: String, default: 'title' },
    placement: { type: String, default: 'standard' },
    showBack: { default: 'auto' },
    /** 返回钮默认自己返回上一页；false 时只抛 back，由使用方返回（避免重复返回两层） */
    autoBack: { type: Boolean, default: true },
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
    /** 关掉后壳不加顶部留白；仅被宿主页嵌入的页面使用 */
    autoTopInset: { type: Boolean, default: true },
    /** 顶栏右侧按钮组；一维为一组，二维按组渲染多个玻璃胶囊；点击发 trailing-action */
    trailingButtons: {
      type: Array as PropType<
        | Array<{ key: string; icon?: string; label?: string; disabled?: boolean }>
        | Array<Array<{ key: string; icon?: string; label?: string; disabled?: boolean }>>
      >,
      default: () => [],
    },
    /** 外部浮层打开期间隐藏顶栏按钮组，避免按钮从菜单边缘露出 */
    trailingButtonsHidden: { type: Boolean, default: false },
    /** 显式启用 #trailing-menu 浮层；小程序插槽检测不可靠，需手动开启 */
    trailingMenuEnabled: { type: Boolean, default: false },
    /** 页面级主题钮开关：auto 跟随全局；false 只隐藏当前页，不改进程全局状态 */
    showThemeSwitch: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: 'auto',
    },
    /** 开启顶部搜索：右侧多一个独立搜索按钮；搜索模式用输入框替换顶部内容 */
    searchable: { type: Boolean, default: false },
    /** 搜索模式开关；支持 v-model:searching */
    searching: { type: Boolean, default: false },
    searchValue: { type: String, default: '' },
    searchPlaceholder: { type: String, default: '搜索' },
    /** 顶栏下方数据驱动控件；数据为空时不占高度 */
    segments: {
      type: Array as PropType<
        Array<{
          key: string
          text?: string
          icon?: string
          badge?: string | number
          disabled?: boolean
        }>
      >,
      default: () => [],
    },
    segmentValue: { type: [String, Number] as PropType<string | number>, default: '' },
    /** 同一份 segments 数据渲染成哪种控件：分段控件 / 顶部 Tabs */
    segmentControl: {
      type: String as PropType<'segmented' | 'tabs'>,
      default: 'segmented',
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
      /** Duo 顶部 / 右侧工具栏的主题菜单打开期间隐去工具组，避免玻璃胶囊从菜单边缘漏出 */
      duoToolsMenuMounted: false,
      duoRailToolsMenuMounted: false,
      /** 顶部搜索：内部状态兼容未绑定 v-model 的页面 */
      searchActive: false,
      searchText: '',
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
      _onWindowScroll: null as ((event?: Event) => void) | null,
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
      themeSwitchVisible: useLingyunThemeSwitchVisible(),
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
      this.bindWindowScroll()
      // #ifndef H5
      this.$nextTick(() => this.setupGlassObserver())
      // #endif
      // #ifdef H5
      this.$nextTick(() => this.syncWindowScrollTop())
      // #endif
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
    this.unbindWindowScroll()
    if (this._pageEnterTimer) {
      clearTimeout(this._pageEnterTimer)
      this._pageEnterTimer = null
    }
  },
  watch: {
    searching: {
      immediate: true,
      handler(val: boolean) {
        const wasActive = this.searchActive
        this.searchActive = !!val
        if (wasActive && !this.searchActive) this.clearSearchValue()
      },
    },
    searchValue: {
      immediate: true,
      handler(val: string) {
        this.searchText = String(val == null ? '' : val)
      },
    },
    segments: {
      deep: true,
      handler() {
        this.syncTopInset()
      },
    },
    segmentControl() {
      this.syncTopInset()
    },
    searchActive() {
      this.syncTopInset()
    },
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
    tabbarVisible() {
      /* 当前页是否属于一级 Tab 会随工作台 key / 路由变化 */
      this.applyPageLayout()
    },
    autoBottomInset() {
      this.applyPageLayout()
    },
    pageNavWidth() {
      /* PC 内联菜单列展开 / 收起时，同步注入的导航占位给 tabbar、日期切换器等固定底栏 */
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
    pageNavInline: {
      immediate: true,
      handler(value: boolean) {
        if (this.embedded) return
        setLingyunPageNavInline(value)
      },
    },
    usePageScroll(enabled: boolean) {
      this.$nextTick(() => {
        if (enabled) {
          this.bindWindowScroll()
          // #ifndef H5
          this.setupGlassObserver()
          // #endif
        } else {
          this.unbindWindowScroll()
          this.teardownGlassObserver()
        }
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
    themeSwitchEffective(): boolean {
      if (this.showThemeSwitch === false) return false
      if (this.showThemeSwitch === true) return true
      return !!this.themeSwitchVisible
    },
    toolbarStackPx() {
      let h = this.barHeightPx
      if (!this.searchActive) {
        const style = this.titleStyle || 'title'
        if (style === 'large') {
          h +=
            this.subtitlePicker && lingyunToolbarPicker.enabled
              ? this.title2LineLargeExtraPx
              : this.largeExtraPx
        }
        if (style === 'title2LineLarge') h += this.title2LineLargeExtraPx
      }
      if (this.placement === 'sheet' || this.showGrabberEffective) h += 16
      if (this.segments && this.segments.length && !this.isDuoTopBottom && !this.isDuoSplit) {
        h +=
          this.segmentControl === 'tabs'
            ? LINGYUN_TOOLBAR_TABS_ROW_PX
            : LINGYUN_TOOLBAR_SEGMENT_ROW_PX
      }
      return h
    },
    pageVars() {
      const navWidth = this.pageNavWidth
      return {
        '--lingyun-app-page-bar': `${this.toolbarStackPx}px`,
        '--lingyun-app-page-inset-top': this.insetTop,
        '--lingyun-page-nav-width': `${navWidth}px`,
        '--lingyun-page-nav-safe-top': `${this.statusBarPx}px`,
        '--lingyun-app-page-inset-right': this.isDuoSplit
          ? `${LINGYUN_DUO_RAIL_WIDTH}px`
          : this.duoRailVisible
            ? `${this.pageLayout.railWidth}px`
            : '0px',
        '--lingyun-app-page-inset-bottom': `${this.effectiveBottomInsetPx}px`,
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
      const real = normalizeLingyunPagePath(
        this.currentPagePath || readLingyunCurrentPagePath(),
      )
      const hosted = this.hostedPathRef
      /* 宿主路径只属于承载它的首页/目录页，子页仍按自己的真实路由判断 */
      if (hosted && isLingyunTabHostPage(real)) {
        return normalizeLingyunPagePath(hosted)
      }
      const intent = this.pageIntentRef
      if (intent) return normalizeLingyunPagePath(intent)
      return real
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
    /** 一级 Tab 根页才在右侧栏显示 Tab / 搜索；独立页只有返回 */
    duoRailItems() {
      return this.isTabRoot ? this.tabbarItems : []
    },
    duoRailShowBack() {
      return coerceTriFlag(this.showBack, !this.isTabRoot)
    },
    /** 搜索是可选入口：只有 tabbar.search=true 的 Tab 根页才显示 */
    duoRailShowSearch() {
      return this.isTabRoot && this.pageConfig.tabbar?.search === true
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
        iconSrc: tab.iconSrc,
        activeIconSrc: tab.activeIconSrc,
        badge: tab.badge,
      }))
    },
    tabbarVisible() {
      return (
        !this.embedded &&
        this.pageLayout.tabbarVisible &&
        this.tabbarItems.length > 0 &&
        /* 页面壳默认不接管 Tab：只有一级 Tab 的根页/工作台才显示 */
        this.isTabRoot
      )
    },
    activeTabKey() {
      if (isLingyunWorkspacePath(this.effectivePagePath)) {
        const workspaceKey = getLingyunWorkspaceTabKey()
        if (workspaceKey) return workspaceKey
      }
      const tab = matchLingyunPageTab(this.pageConfig.tabs || [], this.effectivePagePath)
      return tab ? tab.key : ''
    },
    isTabRoot() {
      if (isLingyunWorkspacePath(this.effectivePagePath)) {
        const key = getLingyunWorkspaceTabKey()
        if (!key) return false
        return (this.pageConfig.tabs || []).some(
          (tab) =>
            tab.key === key &&
            Array.isArray(tab.children) &&
            tab.children.length > 0,
        )
      }
      const tab = matchLingyunPageTab(this.pageConfig.tabs || [], this.effectivePagePath)
      if (!tab) return false
      /* 有 children 时，Tab 根是工作台；子页面不是根（即使子页 url 与 Tab url 相同） */
      if (Array.isArray(tab.children) && tab.children.length) {
        if (buildLingyunPageTabWorkspaceUrl(tab)) return false
        return (
          normalizeLingyunPagePath(tab.url) ===
          normalizeLingyunPagePath(this.effectivePagePath)
        )
      }
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
    /** 只有当前页真的渲染 Tab 时才给内容留底部空间 */
    effectiveBottomInsetPx() {
      return this.tabbarVisible ? this.pageLayout.bottomInsetPx : 0
    },
    /** 壳实际加到内容上的底部留白 */
    bottomInsetStyle() {
      const inset = this.autoBottomInset ? this.effectiveBottomInsetPx : 0
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
    pageNavInline() {
      return this.pageLayout.inlineNavMenu
    },
    pageNavWidth() {
      if (this.pageLayout.navSide !== 'left') return 0
      /* PC 三栏：一级 Tab 没有二级菜单时菜单列收起，只让出 84 窄栏 */
      if (this.pageLayout.inlineNavMenu && !lingyunPageNavInlineMenu.value) {
        return this.pageLayout.railWidth - LINGYUN_PAGE_NAV_RAIL_MENU_WIDTH
      }
      return this.pageLayout.railWidth
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
      if (!this.showToolbar || !this.autoTopInset) return '0px'
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
      this.bottomInsetPx = this.effectiveBottomInsetPx
      this.syncH5PageNavHost()
    },
    syncPageChrome() {
      if (this.embedded) return
      this.currentPagePath = readLingyunCurrentPagePath()
      this.settlePageIntent()
      this.syncWindowScrollTop()
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
      const workspaceUrl =
        Array.isArray(tab.children) && tab.children.length
          ? buildLingyunPageTabWorkspaceUrl(tab)
          : ''
      const targetUrl = workspaceUrl || tab.url
      const raw = normalizeLingyunPagePath(targetUrl)
      const currentPath = normalizeLingyunPagePath(this.effectivePagePath)
      if (!raw) return
      /*
       * 已在工作台时所有带 children 的 Tab 共用这一页：
       * 只换全局 key，内容和 Tab 指示器原地更新，不再 reLaunch 造成白屏。
       */
      if (workspaceUrl && isLingyunWorkspacePath(currentPath)) {
        if (getLingyunWorkspaceTabKey() === tab.key) return
        this.$emit('tab-change', { key: tab.key, tab })
        setLingyunWorkspaceTabKey(tab.key)
        /* 宿主页内切换时同步宿主 URL；独立工作台由下面的 sync 处理 */
        openLingyunTabPage(workspaceUrl, raw)
        syncLingyunWorkspaceUrl(tab.key)
        return
      }
      if (workspaceUrl) {
        if (raw === currentPath && getLingyunWorkspaceTabKey() === tab.key) return
      } else if (raw === currentPath) {
        return
      }
      /* 必须在 setLingyunPageNavIntent 之前记录，否则意图会先把 activeTabKey 改成目标项 */
      const fromKey = this.activeTabKey
      this.$emit('tab-change', { key: tab.key, tab })
      if (workspaceUrl) setLingyunWorkspaceTabKey(tab.key)
      if (openLingyunTabPage(targetUrl, raw)) return
      if (openLingyunHostedPage(targetUrl, raw)) return
      setLingyunPageNavIntent(raw)
      const next = resolveLingyunPageUrl(targetUrl)
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
    bindWindowScroll() {
      // #ifdef H5
      if (
        this._onWindowScroll ||
        this.embedded ||
        !this.usePageScroll ||
        typeof window === 'undefined'
      ) {
        return
      }
      this._onWindowScroll = () => {
        const top =
          Math.max(
            window.scrollY || window.pageYOffset || 0,
            (document.scrollingElement && document.scrollingElement.scrollTop) || 0,
            document.documentElement.scrollTop || 0,
            document.body.scrollTop || 0,
          ) || 0
        this.applyScrollTop(top)
      }
      window.addEventListener('scroll', this._onWindowScroll, { passive: true })
      document.addEventListener('scroll', this._onWindowScroll, true)
      this.syncWindowScrollTop()
      // #endif
    },
    unbindWindowScroll() {
      // #ifdef H5
      if (this._onWindowScroll && typeof window !== 'undefined') {
        window.removeEventListener('scroll', this._onWindowScroll)
        document.removeEventListener('scroll', this._onWindowScroll, true)
      }
      this._onWindowScroll = null
      // #endif
    },
    /** H5 页面级滚动直接读窗口位置；iframe / 预览里比 IntersectionObserver 更稳 */
    syncWindowScrollTop() {
      // #ifdef H5
      if (
        this.embedded ||
        !this.usePageScroll ||
        typeof window === 'undefined'
      ) {
        return
      }
      const top =
        window.scrollY ||
        window.pageYOffset ||
        (document.scrollingElement && document.scrollingElement.scrollTop) ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      this.applyScrollTop(top)
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
      if (!this.autoBack) return
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
        return
      }
      /* 深链直接落到二级页面时，返回父 Tab 的工作台，而不是回首页 */
      const tab = matchLingyunPageTab(
        this.pageConfig.tabs || [],
        this.effectivePagePath,
      )
      if (tab && Array.isArray(tab.children) && tab.children.length) {
        const workspace = buildLingyunPageTabWorkspaceUrl(tab)
        if (workspace) {
          setLingyunWorkspaceTabKey(tab.key)
          uni.reLaunch({
            url: workspace,
            fail: () => uni.reLaunch({ url: '/pages/index/index' }),
          })
          return
        }
      }
      uni.reLaunch({ url: '/pages/index/index' })
    },
    onClose() {
      this.$emit('close')
    },
    onPageTouch() {
      /* 页面任意位置开始触摸时先收起图表 tooltip；点图表时图表随后会重新显示 */
      try {
        uni.$emit('lingyun:page-touch')
      } catch {
        /* ignore */
      }
    },
    onTrailing() {
      this.$emit('trailing')
    },
    onTrailingAction(payload: Record<string, unknown>) {
      this.$emit('trailing-action', payload)
    },
    /** 打开顶部搜索；searchable=false 时忽略 */
    openSearch() {
      if (!this.searchable || this.searchActive) return
      this.searchActive = true
      this.$emit('update:searching', true)
      this.$emit('search-open')
    },
    /** 关闭顶部搜索；cancel=false 时不发取消事件，用于父级主动收起 */
    closeSearch(cancel = true) {
      if (!this.searchActive) return
      const value = this.searchText
      this.searchActive = false
      this.$emit('update:searching', false)
      if (cancel) this.$emit('search-cancel', value)
      this.clearSearchValue()
    },
    clearSearchValue() {
      if (!this.searchText) return
      this.searchText = ''
      this.$emit('update:searchValue', '')
    },
    toggleSearch() {
      if (this.searchActive) this.closeSearch()
      else this.openSearch()
    },
    onToolbarSearchOpen() {
      this.openSearch()
    },
    onToolbarSearchCancel() {
      this.closeSearch(true)
    },
    onSearchInput(value: string | number) {
      this.searchText = String(value == null ? '' : value)
      this.$emit('update:searchValue', this.searchText)
      this.$emit('search-input', this.searchText)
    },
    onSearchConfirm(value: string | number) {
      this.searchText = String(value == null ? '' : value)
      this.$emit('update:searchValue', this.searchText)
      this.$emit('search', this.searchText)
    },
    onSegmentUpdate(value: string | number) {
      this.$emit('update:segmentValue', value)
    },
    onSegmentClick(payload: Record<string, unknown>) {
      this.$emit('segment-click', payload)
    },
    onSegmentChange(payload: Record<string, unknown>) {
      this.$emit('segment-change', payload)
    },
    onPickerValue(value: string | number, option: { value: string | number; label: string }) {
      this.$emit('picker-value', value, option)
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
  /* 根节点只保留纯色兜底；页面渐变由固定背景层绘制，滚动时不移动 */
  background-color: var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
  color: var(--lingyun-label, #{$lingyun-label});
}

/* 固定背景层：渐变始终铺满视口，不随页面 / scroll-view 内容移动 */
.lingyun-app-page__backdrop {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  background: var(--lingyun-page-background, var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary}));
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
  position: relative;
  z-index: 1;
}

.lingyun-app-page__body {
  flex: 1;
  min-height: 0;
  height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;
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
  box-sizing: border-box;
  /* 窄栏/完整目录都从状态栏下方开始，安全区加在整列外部 */
  padding-top: var(--lingyun-page-nav-safe-top, 0px);
  /* 安全区留白也铺导航底色，避免顶部露出页面渐变 */
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}

/* 窄栏顶部与栏身同款 tint；右侧分割线延伸到状态栏区域，与栏身的右边线接上 */
.lingyun-app-page--nav-rail .lingyun-app-page__nav {
  background-image: linear-gradient(rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0.42));
}

.lingyun-app-page--nav-rail.theme-dark .lingyun-app-page__nav {
  background-image: linear-gradient(rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.14));
}

.lingyun-app-page__nav-line {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 1px;
  /* 与内容区底色一致：视觉上不留边线，内容/菜单列的白色自己形成边界 */
  background: var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
  pointer-events: none;
}

/* 换页淡入在 styles/setting/_app-page-layout.scss。组件 wxss 不能写 view 标签选择器。 */

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
