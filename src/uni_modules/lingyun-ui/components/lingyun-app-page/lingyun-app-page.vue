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
      :show-window-controls="inContentCover || navDocked || tabbarVisible ? false : 'auto'"
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
      :style="padStyle"
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
      <view class="lingyun-app-page__pad" :style="padStyle">
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
      :style="padStyle"
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

    <!-- 导航停靠时的内容区盖层：只盖右侧，不盖左侧导航。 -->
    <view v-if="showContentCover" class="lingyun-app-page__covers">
      <view
        v-for="(layer, index) in coverLayers"
        :key="layer.key"
        class="lingyun-app-page__cover"
        :class="{
          'lingyun-app-page__cover--in':
            coverEntered[layer.key] && !(coverLeaving && index === coverLayers.length - 1),
        }"
        :style="{ zIndex: index + 1 }"
      >
        <content-cover-frame :path="layer.path">
          <!-- 小程序编译器不支持动态组件，盖层只在 H5 / App 渲染 -->
          <!-- #ifndef MP -->
          <component :is="coverView(layer.path)" v-if="coverView(layer.path)" />
          <!-- #endif -->
          <view v-if="!coverView(layer.path)" class="lingyun-app-page__cover-miss">
            <lingyun-toolbars
              title="页面未注册"
              :show-back="true"
              :fixed="false"
              :show-window-controls="false"
              @back="onCoverBack"
            />
          </view>
        </content-cover-frame>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import { inject, provide, type PropType } from 'vue'
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
import ContentCoverFrame from './content-cover-frame.vue'
import {
  bindLingyunContentCoverHost,
  closeLingyunContentCover,
  getLingyunContentCoverView,
  LINGYUN_APP_PAGE_EMBEDDED,
  LINGYUN_CONTENT_COVER_PATH,
  LINGYUN_IN_CONTENT_COVER,
  lingyunContentCover,
  nextLingyunContentCoverUid,
} from '../../utils/contentCover'
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
  getLingyunTabHostKey,
  getLingyunWorkspaceTabKey,
  isLingyunTabShellPath,
  isLingyunWorkspacePath,
  matchLingyunPageTab,
  setLingyunTabHostKey,
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

defineOptions({
  name: 'LingyunAppPage',
})

const props = defineProps({
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
})

const emit = defineEmits([
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
])

const instance = getCurrentInstance()
const embedded = inject<boolean>(LINGYUN_APP_PAGE_EMBEDDED, false)
provide(LINGYUN_APP_PAGE_EMBEDDED, true)
const inContentCover = inject(LINGYUN_IN_CONTENT_COVER, false)
const contentCoverPath = inject(LINGYUN_CONTENT_COVER_PATH, '')
/* 只有直接放进盖层的那一层页面读到标记，它内部再嵌的壳不再当成盖层页 */
provide(LINGYUN_IN_CONTENT_COVER, false)
provide(LINGYUN_CONTENT_COVER_PATH, '')
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
const bindScroll = inject(LINGYUN_APP_PAGE_BIND_SCROLL, null)
const themeSwitchVisible = useLingyunThemeSwitchVisible()
const hostedPathRef = useLingyunHostedPath()
const pageIntentRef = useLingyunPageNavIntent()

const glassProgress = ref(0)
const statusBarPx = ref(0)
const barHeightPx = ref(LINGYUN_TOOLBAR_BAR_DESIGN_PX)
const largeExtraPx = ref(LINGYUN_TOOLBAR_LARGE_EXTRA_PX)
const title2LineLargeExtraPx = ref(LINGYUN_TOOLBAR_2LINE_LARGE_EXTRA_PX)
/** 页面壳布局的唯一宽度来源（来自自身 resize 监听） */
const windowWidth = ref(readLingyunWindowWidth())
/** 当前真实页面路径，用于推导 Tab 选中态 */
const currentPagePath = ref('')
/** 跨页切换时 Tab 指示器的起始 key */
const tabbarFromKey = ref('')
/** 页面再次显示时让底栏重新量选中胶囊（小程序首次量到空宽度会一直透明） */
const tabbarRemeasure = ref(0)
/** Tab / 左侧菜单换页后内容淡入 */
const pageEntering = ref(false)
/** 横向 swipe 确认后临时关 scroll-y，避免 iOS 斜滑带动页面上下晃 */
const bodyScrollY = ref(true)
/** Duo 顶部 / 右侧工具栏的主题菜单打开期间隐去工具组，避免玻璃胶囊从菜单边缘漏出 */
const duoToolsMenuMounted = ref(false)
const duoRailToolsMenuMounted = ref(false)
/** 顶部搜索：内部状态兼容未绑定 v-model 的页面 */
const searchActive = ref(false)
const searchText = ref('')
/** H5：顶部插槽目标节点出现后再传送 */
const navHeaderReady = ref(false)
const _scrollSettleTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _scrollLockCount = ref(0)
/** 页面级滚动下驱动玻璃渐变的哨兵观察器 */
const _glassObserver = ref<MpGlassObserver | null>(null)
const _navSlotClaim = ref(0)
const _lastReportedTop = ref<number | undefined>(undefined)
const _navSlotTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _onWindowResize = ref<((res?: unknown) => void) | null>(null)
const _onWindowScroll = ref<((event?: Event) => void) | null>(null)
const _stopRouteChange = ref<(() => void) | null>(null)
const _onHashChange = ref<(() => void) | null>(null)
const _pageEnterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
/** 须在 data 里分配。导航监听会在 created 之前同步跑，那时再分配就对不上宿主。 */
const coverUid = ref(nextLingyunContentCoverUid())
const coverEntered = ref<Record<number, boolean>>({})
const _coverEnterTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const slots = useSlots()

const themeRootClass = computed(() => {
  try {
    return useLingyunTheme().rootClass
  } catch {
    return 'theme-light'
  }
})
const themeSwitchEffective = computed((): boolean => {
  if (props.showThemeSwitch === false) return false
  if (props.showThemeSwitch === true) return true
  return !!themeSwitchVisible.value
})
const pageConfig = computed(() => {
  return getLingyunPageConfig()
})
/** 小程序宽屏右侧内容路径优先，其次导航意图，最后真实路由 */
const effectivePagePath = computed(() => {
  if (inContentCover && contentCoverPath) {
    return normalizeLingyunPagePath(contentCoverPath)
  }
  const real = normalizeLingyunPagePath(
    currentPagePath.value || readLingyunCurrentPagePath(),
  )
  const hosted = hostedPathRef?.value ?? ''
  /* 宿主路径只属于承载它的首页/目录页，子页仍按自己的真实路由判断 */
  if (hosted && isLingyunTabHostPage(real)) {
    return normalizeLingyunPagePath(hosted)
  }
  const intent = pageIntentRef.value
  if (intent) return normalizeLingyunPagePath(intent)
  return real
})
const pageOverride = computed(() => {
  return getLingyunPageOverride(effectivePagePath.value)
})
/** 未登录的受保护页先藏起来，避免冷启动先画出首页和侧栏再跳登录 */
const authHold = computed(() => {
  return lingyunPageRequiresLogin()
})
const showGrabberEffective = computed(() => {
  return coerceTriFlag(props.showGrabber, false)
})
const pageLayout = computed((): LingyunPageLayoutResult => {
  const env = resolveLingyunFormFactor(lingyun)
  const input = {
    width: windowWidth.value,
    config: pageConfig.value,
    pageOverride: pageOverride.value,
    embedded,
    placement: props.placement,
    grabber: showGrabberEffective.value,
    authHold: authHold.value,
    showNav: props.showNav,
    showTabbar: props.showTabbar,
    navMode: props.navMode,
    safeArea: props.safeArea,
    formFactor: env.formFactor,
    duoPose: env.duoPose,
  }
  const plan = resolveLingyunPageLayout(input)
  return plan
})
const isDuoTopBottom = computed(() => {
  return pageLayout.value.chrome === 'duo-top-bottom'
})
const isDuoSplit = computed(() => {
  return pageLayout.value.chrome === 'duo-split'
})
const toolbarStackPx = computed(() => {
  let h = barHeightPx.value
  if (!searchActive.value) {
    const style = props.titleStyle || 'title'
    if (style === 'large') {
      h +=
        props.subtitlePicker && lingyunToolbarPicker.enabled
          ? title2LineLargeExtraPx.value
          : largeExtraPx.value
    }
    if (style === 'title2LineLarge') h += title2LineLargeExtraPx.value
  }
  if (props.placement === 'sheet' || showGrabberEffective.value) h += 16
  if (props.segments && props.segments.length && !isDuoTopBottom.value && !isDuoSplit.value) {
    h +=
      props.segmentControl === 'tabs'
        ? LINGYUN_TOOLBAR_TABS_ROW_PX
        : LINGYUN_TOOLBAR_SEGMENT_ROW_PX
  }
  return h
})
const duoRailVisible = computed(() => {
  return (
    !embedded &&
    pageLayout.value.chrome === 'duo-right-rail' &&
    pageLayout.value.sidebarVisible
  )
})
const tabbarItems = computed(() => {
  return (pageConfig.value.tabs || []).map((tab: LingyunPageTab) => ({
    key: tab.key,
    text: tab.text,
    icon: tab.icon,
    iconSrc: tab.iconSrc,
    activeIconSrc: tab.activeIconSrc,
    badge: tab.badge,
  }))
})
const isTabRoot = computed(() => {
  if (isLingyunWorkspacePath(effectivePagePath.value)) {
    const key = getLingyunWorkspaceTabKey()
    if (!key) return false
    return (pageConfig.value.tabs || []).some(
      (tab) =>
        tab.key === key &&
        Array.isArray(tab.children) &&
        tab.children.length > 0,
    )
  }
  const tab = matchLingyunPageTab(pageConfig.value.tabs || [], effectivePagePath.value)
  if (!tab) return false
  /* 有 children 时，Tab 根是工作台；子页面不是根（即使子页 url 与 Tab url 相同） */
  if (Array.isArray(tab.children) && tab.children.length) {
    if (buildLingyunPageTabWorkspaceUrl(tab)) return false
    return (
      normalizeLingyunPagePath(tab.url) ===
      normalizeLingyunPagePath(effectivePagePath.value)
    )
  }
  return (
    normalizeLingyunPagePath(tab.url) ===
    normalizeLingyunPagePath(effectivePagePath.value)
  )
})
/** 一级 Tab 根页才在右侧栏显示 Tab / 搜索；独立页只有返回 */
const duoRailItems = computed(() => {
  return isTabRoot.value ? tabbarItems.value : []
})
const duoRailShowBack = computed(() => {
  return coerceTriFlag(props.showBack, !isTabRoot.value)
})
/** 搜索是可选入口：只有 tabbar.search=true 的 Tab 根页才显示 */
const duoRailShowSearch = computed(() => {
  return isTabRoot.value && pageConfig.value.tabbar?.search === true
})
const duoPoseKey = computed(() => {
  return pageLayout.value.layoutClass.replace(/^duo-/, '')
})
const duoCompactTools = computed(() => {
  return pageLayout.value.layoutClass === 'duo-outer-landscape'
})
const tabbarSize = computed(() => {
  return isDuoTopBottom.value ? 'duo' : 'default'
})
const duoTopRightInset = computed(() => {
  return isDuoSplit.value
    ? LINGYUN_DUO_RAIL_WIDTH
    : LINGYUN_DUO_TOP_RIGHT_RESERVED
})
const foldBandStyle = computed(() => {
  const size = pageLayout.value.foldBandSize
  if (pageLayout.value.foldBand === 'horizontal') {
    return { height: `${size}px` }
  }
  if (pageLayout.value.foldBand === 'vertical') {
    return { width: `${size}px` }
  }
  return null
})
const tabbarVisible = computed(() => {
  return (
    !embedded &&
    pageLayout.value.tabbarVisible &&
    tabbarItems.value.length > 0 &&
    /* 页面壳默认不接管 Tab：只有一级 Tab 的根页/工作台才显示 */
    isTabRoot.value
  )
})
const activeTabKey = computed(() => {
  const real = normalizeLingyunPagePath(
    currentPagePath.value || readLingyunCurrentPagePath(),
  )
  /* 承载页原地换内容时，选中项跟 host key，不跟还没变的路由 */
  if (isLingyunTabShellPath(real)) {
    const host = getLingyunTabHostKey()
    if (host && (pageConfig.value.tabs || []).some((tab: LingyunPageTab) => tab.key === host)) {
      return host
    }
  }
  if (isLingyunWorkspacePath(effectivePagePath.value)) {
    const workspaceKey = getLingyunWorkspaceTabKey()
    if (workspaceKey) return workspaceKey
  }
  const tab = matchLingyunPageTab(pageConfig.value.tabs || [], effectivePagePath.value)
  return tab ? tab.key : ''
})
const tabbarSafeArea = computed(() => {
  return (
    pageConfig.value.tabbar?.safeArea !== false &&
    pageOverride.value?.tabbarSafeArea !== false &&
    props.safeArea !== false
  )
})
const tabbarVariant = computed(() => {
  return pageConfig.value.tabbar?.variant || 'default'
})
/** 只有当前页真的渲染 Tab 时才给内容留底部空间 */
const effectiveBottomInsetPx = computed(() => {
  return tabbarVisible.value ? pageLayout.value.bottomInsetPx : 0
})
/** 壳实际加到内容上的底部留白 */
const bottomInsetStyle = computed(() => {
  const inset = props.autoBottomInset ? effectiveBottomInsetPx.value : 0
  return inset > 0 ? { paddingBottom: `${inset}px` } : null
})
/**
 * 内容容器内联样式。
 * 小程序端 slot 内容上 CSS 变量的继承不可靠（见 styles/setting/_app-page-layout.scss
 * 注释），`> view:first-child` 选择器也匹配不到插槽首子，所以顶栏占位直接写进
 * 内联 style，避免顶栏压住系统状态栏。Web/H5 仍走全局首子规则，不加这里，
 * 否则会出现双份留白。
 */
const padStyle = computed(() => {
  const style: Record<string, string> = {}
  // #ifdef MP
  style.paddingTop = insetTop.value
  // #endif
  if (props.autoBottomInset) {
    const inset = effectiveBottomInsetPx.value
    if (inset > 0) style.paddingBottom = `${inset}px`
  }
  return Object.keys(style).length > 0 ? style : null
})
/** 宽屏需要为顶栏让出左侧。H5 的列在 body 上，这里只留宽度。 */
const navDocked = computed(() => {
  if (inContentCover) return false
  return (
    !embedded &&
    pageLayout.value.sidebarVisible &&
    pageLayout.value.navSide === 'left'
  )
})
/** 全局 tabs 驱动的窄栏；目录模式仍是完整侧栏 */
const pageNavRail = computed(() => {
  return pageLayout.value.railVariant === 'rail'
})
const pageNavInline = computed(() => {
  return pageLayout.value.inlineNavMenu
})
const pageNavWidth = computed(() => {
  if (inContentCover || pageLayout.value.navSide !== 'left') return 0
  /* PC 三栏：一级 Tab 没有二级菜单时菜单列收起，只让出 84 窄栏 */
  if (pageLayout.value.inlineNavMenu && !lingyunPageNavInlineMenu.value) {
    return pageLayout.value.railWidth - LINGYUN_PAGE_NAV_RAIL_MENU_WIDTH
  }
  return pageLayout.value.railWidth
})
/** 宽屏侧栏点到未注册页面：留在本页，只换右侧。 */
const hostedMiss = computed(() => {
  // #ifdef H5
  return false
  // #endif
  // #ifndef H5
  return navDocked.value && hostedPagePath() === 'pages/404/404'
  // #endif
})
const hostedFrom = computed(() => {
  return hostedFromText()
})
const displayTitle = computed(() => {
  return hostedMiss.value ? '404' : props.title
})
const showPageNav = computed(() => {
  // #ifdef H5
  return false
  // #endif
  // #ifndef H5
  return navDocked.value
  // #endif
})
const insetTop = computed(() => {
  if (!props.showToolbar || !props.autoTopInset) return '0px'
  if (duoRailVisible.value) {
    return `${props.safeArea ? statusBarPx.value : 0}px`
  }
  if (isDuoTopBottom.value || isDuoSplit.value) {
    return `${LINGYUN_DUO_TOP_BAR_HEIGHT}px`
  }
  const total = toolbarStackPx.value + (props.safeArea ? statusBarPx.value : 0)
  return `${total}px`
})
/** 页面级滚动仅在本组件负责 body 滚动时才成立 */
const usePageScroll = computed(() => {
  if (inContentCover) return false
  return props.bodyScroll && props.pageScroll
})
const coverLayers = computed(() => {
  return lingyunContentCover.layers
})
const coverLeaving = computed(() => {
  return lingyunContentCover.leaving
})
const coverLayerMark = computed(() => {
  return coverLayers.value.map((layer) => layer.key).join(',')
})
const showContentCover = computed(() => {
  if (embedded || inContentCover || !coverLayers.value.length) return false
  if (coverUid.value === lingyunContentCover.hostUid) return true
  /* 监听跑得太早、宿主编号仍是 0 时，由当前停靠导航的这一页来画 */
  return navDocked.value && !lingyunContentCover.hostUid
})
const useInnerScroll = computed(() => {
  if (inContentCover) return props.bodyScroll
  return props.bodyScroll && !props.pageScroll
})
/** 哨兵高 = 满玻璃距离：露出比例即滚动进度 */
const sentinelStyle = computed(() => {
  return { height: `${Math.max(1, Number(props.glassDistance) || 56)}px` }
})
const showBackEffective = computed(() => {
  /* 盖层里必须能返回，用来关掉这一层。
     宽屏停靠左侧导航时用侧栏切页，auto 不再显示返回；
     一级 Tab 根页也不显示返回；显式 true 仍可开 */
  if (inContentCover) return true
  const auto = !navDocked.value && !(tabbarVisible.value && isTabRoot.value)
  return coerceTriFlag(props.showBack, auto)
})
const showCloseEffective = computed(() => {
  return coerceTriFlag(props.showClose, false)
})
const rootClass = computed(() => {
  return [
    themeRootClass.value,
    `lingyun-app-page--${props.titleStyle || 'title'}`,
    {
      'lingyun-app-page--embedded': embedded,
      'lingyun-app-page--safe': props.safeArea,
      'lingyun-app-page--sheet': props.placement === 'sheet' || showGrabberEffective.value,
      'lingyun-app-page--page-scroll': usePageScroll.value,
      'lingyun-app-page--nav': navDocked.value,
      'lingyun-app-page--nav-rail': navDocked.value && pageNavRail.value,
      'lingyun-app-page--tabbar': tabbarVisible.value,
      'lingyun-app-page--page-enter': pageEntering.value,
      'lingyun-app-page--duo-top-bottom': isDuoTopBottom.value,
      'lingyun-app-page--duo-right-rail': duoRailVisible.value,
      'lingyun-app-page--duo-split': isDuoSplit.value,          'lingyun-app-page--fold-horizontal': pageLayout.value.foldBand === 'horizontal',
      'lingyun-app-page--fold-vertical': pageLayout.value.foldBand === 'vertical',
      'lingyun-app-page--auth-hold': authHold.value,
      'lingyun-app-page--in-cover': inContentCover,
    },
  ]
})
const pageVars = computed(() => {
  const navWidth = pageNavWidth.value
  return {
    '--lingyun-app-page-bar': `${toolbarStackPx.value}px`,
    '--lingyun-app-page-inset-top': insetTop.value,
    '--lingyun-page-nav-width': `${navWidth}px`,
    '--lingyun-page-nav-safe-top': `${statusBarPx.value}px`,
    '--lingyun-app-page-inset-right': isDuoSplit.value
      ? `${LINGYUN_DUO_RAIL_WIDTH}px`
      : duoRailVisible.value
        ? `${pageLayout.value.railWidth}px`
        : '0px',
    '--lingyun-app-page-inset-bottom': `${effectiveBottomInsetPx.value}px`,
    '--lingyun-app-page-tabbar-height': `${pageLayout.value.tabbarHeightPx}px`,
  }
})

/**
 * 页面级滚动没有 @scroll 可用：观察顶部哨兵的露出比例换算玻璃进度。
 * 哨兵高 = glassDistance，滚过 y 时露出 (dist - y)/dist。
 */
function setupGlassObserver(): void {
  teardownGlassObserver()
  const dist = Math.max(1, Number(props.glassDistance) || 56)
  const steps = 40
  const thresholds: number[] = []
  for (let i = 0; i <= steps; i += 1) thresholds.push(i / steps)
  try {
    const options = { thresholds, nativeMode: true }
    // 微信会对传入的组件实例枚举键，Vue 代理会告警。用小程序组件实例创建观察器。
    const scope = (instance?.proxy as unknown as { $scope?: MpComponentScope } | null | undefined)?.$scope
    const observer: MpGlassObserver =
      scope && typeof scope.createIntersectionObserver === 'function'
        ? scope.createIntersectionObserver(options)
        : (uni.createIntersectionObserver(scope, options) as MpGlassObserver)
    observer.relativeToViewport().observe('.lingyun-app-page__sentinel', (res: { intersectionRatio?: number }) => {
      const ratio = Number(res && res.intersectionRatio)
      if (!Number.isFinite(ratio)) return
      const progress = Math.min(1, Math.max(0, 1 - ratio))
      glassProgress.value = progress
      emit('scroll', progress * dist)
    })
    _glassObserver.value = observer
  } catch {
    /* 端不支持时顶栏保持透明 */
  }
}
function teardownGlassObserver(): void {
  const observer = _glassObserver.value
  if (observer) {
    try {
      observer.disconnect?.()
    } catch {
      /* ignore */
    }
    _glassObserver.value = null
  }
}
function lockBodyScroll(): void {
  _scrollLockCount.value = (_scrollLockCount.value || 0) + 1
  if (bodyScrollY.value) bodyScrollY.value = false
  scrollLocked.value = true
  applyMpPageOverflow(true)
}
function unlockBodyScroll(): void {
  _scrollLockCount.value = Math.max(0, (_scrollLockCount.value || 0) - 1)
  if (_scrollLockCount.value === 0 && !bodyScrollY.value) bodyScrollY.value = true
  if (_scrollLockCount.value === 0) {
    scrollLocked.value = false
    applyMpPageOverflow(false)
  }
}
function applyMpPageOverflow(locked: boolean): void {
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
}
function syncNavLayout(widthArg?: number): void {
  const width = Number(widthArg)
  const hasWidth = Number.isFinite(width) && width > 0
  const actualWidth = hasWidth ? width : readLingyunWindowWidth()
  windowWidth.value = actualWidth
  const layout = getLingyunNavLayout(
    LINGYUN_TOOLBAR_BAR_DESIGN_PX,
    actualWidth > 0 ? actualWidth : undefined,
  )
  statusBarPx.value = props.safeArea ? layout.statusBarHeight : 0
  barHeightPx.value = layout.barHeight
  largeExtraPx.value = layout.largeExtra
  title2LineLargeExtraPx.value = layout.title2LineLargeExtra
  syncTopInset()
  applyPageLayout()
}
function applyPageLayout(): void {
  if (embedded) return
  navInsetPx.value = pageNavWidth.value
  bottomInsetPx.value = effectiveBottomInsetPx.value
  syncH5PageNavHost()
}
function syncPageChrome(): void {
  if (embedded) return
  currentPagePath.value = readLingyunCurrentPagePath()
  settlePageIntent()
  syncWindowScrollTop()
}
/** 导航意图与真实路径一致后清掉，避免侧栏高亮一直停在旧项 */
function settlePageIntent(): void {
  const intent = normalizeLingyunPagePath(getLingyunPageNavIntent())
  if (!intent) return
  const current = normalizeLingyunPagePath(
    hostedPathRef?.value || currentPagePath.value,
  )
  if (intent === current) clearLingyunPageNavIntent()
}
function onPageRouteChange(path: string): void {
  const next = normalizeLingyunPagePath(path)
  if (next) currentPagePath.value = next
  settlePageIntent()
}
function bindPageRoute(): void {
  _stopRouteChange.value = subscribeLingyunPageRoute(onPageRouteChange)
  // #ifdef H5
  _onHashChange.value = () => {
    syncPageChrome()
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', _onHashChange.value)
  }
  // #endif
}
function unbindPageRoute(): void {
  if (_stopRouteChange.value) {
    _stopRouteChange.value()
    _stopRouteChange.value = null
  }
  // #ifdef H5
  if (_onHashChange.value && typeof window !== 'undefined') {
    window.removeEventListener('hashchange', _onHashChange.value)
  }
  _onHashChange.value = null
  // #endif
}
/** 消费一次换页过渡：Tab 指示器滑入，或左侧菜单换页后内容淡入 */
function applyPageTransition(): void {
  const reduce = prefersReducedMotion()
  const tabTransition = consumeLingyunTabTransition(activeTabKey.value)
  if (tabTransition) {
    tabbarFromKey.value = tabTransition.fromKey
    pageEntering.value = !reduce
    return
  }
  const navTransition = consumeLingyunNavTransition(effectivePagePath.value)
  tabbarFromKey.value = ''
  pageEntering.value = !!navTransition && !reduce
}
function prefersReducedMotion(): boolean {
  // #ifdef H5
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  // #endif
  return false
}
function onTabbarChange(item: { key?: string | number }): void {
  const key = item && item.key != null ? String(item.key) : ''
  if (!key) return
  const tab = (pageConfig.value.tabs || []).find(
    (entry: LingyunPageTab) => entry.key === key,
  )
  if (!tab) return
  if (activeTabKey.value === tab.key) return
  const workspaceUrl =
    Array.isArray(tab.children) && tab.children.length
      ? buildLingyunPageTabWorkspaceUrl(tab)
      : ''
  const targetUrl = workspaceUrl || tab.url
  const raw = normalizeLingyunPagePath(targetUrl)
  const realPath = normalizeLingyunPagePath(
    currentPagePath.value || readLingyunCurrentPagePath(),
  )
  if (!raw) return
  emit('tab-change', { key: tab.key, tab })
  /*
   * 已经在工作台页上：店铺 / 企业只换 key。
   * 首页和「我的」若当前路由也是 Tab 承载页，由 openTabPage 原地换内容。
   * 只有承载页接不住的叶子页才 reLaunch，否则整页关掉重开，体感就是刷新。
   */
  if (workspaceUrl && isLingyunWorkspacePath(realPath)) {
    setLingyunWorkspaceTabKey(tab.key)
    setLingyunTabHostKey(tab.key)
    openLingyunTabPage(workspaceUrl, raw)
    syncLingyunWorkspaceUrl(tab.key)
    clearLingyunPageNavIntent()
    return
  }
  if (workspaceUrl) setLingyunWorkspaceTabKey(tab.key)
  if (openLingyunTabPage(targetUrl, raw)) {
    setLingyunTabHostKey(tab.key)
    clearLingyunPageNavIntent()
    return
  }
  if (openLingyunHostedPage(targetUrl, raw)) return
  /* 必须在 setLingyunPageNavIntent 之前记录，否则意图会先把 activeTabKey 改成目标项 */
  const fromKey = activeTabKey.value
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
}
function onDuoSearch(): void {
  emit('duo-search')
}
function onDuoOverflow(): void {
  emit('duo-overflow')
}
function syncTopInset(): void {
  if (duoRailVisible.value) {
    topInsetPx.value = props.safeArea ? statusBarPx.value : 0
    return
  }
  if (isDuoTopBottom.value || isDuoSplit.value) {
    topInsetPx.value = props.showToolbar ? LINGYUN_DUO_TOP_BAR_HEIGHT : 0
    return
  }
  const status = props.safeArea ? statusBarPx.value : 0
  topInsetPx.value = props.showToolbar ? status + toolbarStackPx.value : status
}
function syncNavHeaderSlots(): void {
  const slotMap = slots ?? {}
  _navSlotClaim.value = claimLingyunPageNavHeaderSlots({
    avatar: !!slotMap['nav-avatar'],
    name: !!slotMap['nav-name'],
    subtitle: !!slotMap['nav-subtitle'],
  })
  armNavHeader()
}
function armNavHeader(left: number = 30): void {
  const slotMap = slots ?? {}
  const need: string[] = []
  if (slotMap['nav-avatar']) need.push('ly-nav-slot-avatar')
  if (slotMap['nav-name']) need.push('ly-nav-slot-name')
  if (slotMap['nav-subtitle']) need.push('ly-nav-slot-subtitle')
  if (!need.length) return
  // #ifdef H5
  const ready =
    typeof document !== 'undefined' && need.every((id) => document.getElementById(id))
  if (!ready) {
    if (left <= 0) return
    _navSlotTimer.value = setTimeout(() => armNavHeader(left - 1), 16)
    return
  }
  // #endif
  navHeaderReady.value = true
}
function releaseNavHeaderSlots(): void {
  navHeaderReady.value = false
  if (_navSlotTimer.value) clearTimeout(_navSlotTimer.value)
  releaseLingyunPageNavHeaderSlots(_navSlotClaim.value)
}
function syncH5PageNavHost(): void {
  if (embedded || inContentCover) return
  if (!isCurrentPageShell()) return
  // #ifdef H5
  setLingyunH5PageNavAllowed(navDocked.value)
  // #endif
}
/** 只有当前可见的页面壳能改共用导航，盖层里的子页和压在栈下的页面都不写。 */
function isCurrentPageShell(): boolean {
  const current = normalizeLingyunPagePath(readLingyunCurrentPagePath())
  const mine = normalizeLingyunPagePath(currentPagePath.value || current)
  return !current || !mine || current === mine
}
/**
 * H5 左侧导航只挂一份。show-nav=false 只隐藏它，不把窄栏标记写成关闭。
 * 标记被写成关闭后，组件会画出 220 宽的旧目录；返回时上一页还在，不会自己再写。
 * 有导航的页面按当前布局把标记写回去（窄栏或内联菜单列）。
 */
function syncSharedNavChrome(): void {
  if (embedded || inContentCover) return
  if (!isCurrentPageShell()) return
  syncH5PageNavHost()
  bindLingyunContentCoverHost(coverUid.value, navDocked.value)
  if (!navDocked.value) return
  setLingyunPageNavRail(pageNavRail.value)
  setLingyunPageNavInline(pageNavInline.value)
}
function bindResize(): void {
  const onWindowResize = (res?: unknown) => {
    syncNavLayout(readLingyunResizeWidth(res))
  }
  _onWindowResize.value = onWindowResize
  try {
    if (typeof uni.onWindowResize === 'function') uni.onWindowResize(onWindowResize)
  } catch {
    /* 端不支持 */
  }
  // #ifdef H5
  if (typeof window !== 'undefined') window.addEventListener('resize', onWindowResize)
  // #endif
}
function bindWindowScroll(): void {
  // #ifdef H5
  if (
    embedded ||
    !usePageScroll.value ||
    typeof window === 'undefined'
  ) {
    return
  }
  if (_onWindowScroll.value) return
  const onWindowScroll = () => {
    const top =
      Math.max(
        window.scrollY || window.pageYOffset || 0,
        (document.scrollingElement && document.scrollingElement.scrollTop) || 0,
        document.documentElement.scrollTop || 0,
        document.body.scrollTop || 0,
      ) || 0
    applyScrollTop(top)
  }
  _onWindowScroll.value = onWindowScroll
  window.addEventListener('scroll', onWindowScroll, { passive: true })
  document.addEventListener('scroll', onWindowScroll, true)
  syncWindowScrollTop()
  // #endif
}
function unbindWindowScroll(): void {
  // #ifdef H5
  const onWindowScroll = _onWindowScroll.value
  if (onWindowScroll && typeof window !== 'undefined') {
    window.removeEventListener('scroll', onWindowScroll)
    document.removeEventListener('scroll', onWindowScroll, true)
  }
  _onWindowScroll.value = null
  // #endif
}
/** H5 页面级滚动直接读窗口位置；iframe / 预览里比 IntersectionObserver 更稳 */
function syncWindowScrollTop(): void {
  // #ifdef H5
  if (
    embedded ||
    !usePageScroll.value ||
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
  applyScrollTop(top)
  // #endif
}
function unbindResize(): void {
  const onWindowResize = _onWindowResize.value
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
  _onWindowResize.value = null
}
function clearScrollSettle(): void {
  if (_scrollSettleTimer.value != null) {
    clearTimeout(_scrollSettleTimer.value)
    _scrollSettleTimer.value = null
  }
}
/**
 * 惯性滚动停稳后再对齐真实 scrollTop。
 * 微信 scroll-view 快速回顶时常丢末帧，glassProgress 会卡在非 0；
 * 滚动过程中仍即时更新，不改渐变手感。
 * @param {number} [reportedTop] 内层注入上报时传入，避免误查不存在的 scroller
 */
function scheduleScrollSettle(reportedTop?: number): void {
  if (reportedTop != null && Number.isFinite(Number(reportedTop))) {
    _lastReportedTop.value = Math.max(0, Number(reportedTop))
  }
  clearScrollSettle()
  _scrollSettleTimer.value = setTimeout(() => {
    _scrollSettleTimer.value = null
    if (useInnerScroll.value) {
      syncScrollTopFromScroller()
      return
    }
    // 无本组件 scroller（页面级滚动 / 页面自管滚动）：用末次上报近顶兜底
    const last = Number(_lastReportedTop.value)
    applyScrollTop(Number.isFinite(last) && last < 1 ? 0 : last || 0)
  }, 96)
}
function syncScrollTopFromScroller(): void {
  if (!useInnerScroll.value) return
  const node = uni.createSelectorQuery().in(instance?.proxy as never).select('.lingyun-app-page__scroller')
  const offset = node.scrollOffset as unknown as () => {
    exec: (cb: (res: Array<{ scrollTop?: number } | undefined> | undefined) => void) => void
  }
  offset().exec((res) => {
      const top = Number(res?.[0]?.scrollTop)
      applyScrollTop(Number.isFinite(top) ? top : 0)
    })
}
function applyScrollTop(scrollTop: number): void {
  const dist = Math.max(1, Number(props.glassDistance) || 56)
  // 亚像素 / 回弹残留：视为已在顶，避免玻璃卡在极低进度
  const y = Math.max(0, Number(scrollTop) || 0)
  const effective = y < 0.5 ? 0 : y
  const next = Math.min(1, effective / dist)
  glassProgress.value = next
  emit('scroll', effective)
}
function onBodyScroll(e: { detail?: { scrollTop?: number }; target?: { scrollTop?: number } }): void {
  const top = Number(e?.detail?.scrollTop ?? e?.target?.scrollTop ?? 0)
  const y = Number.isFinite(top) ? top : 0
  applyScrollTop(y)
  scheduleScrollSettle(y)
}
function onScrollToUpper(): void {
  applyScrollTop(0)
  scheduleScrollSettle(0)
}
function onHostHome(): void {
  const home = getLingyunPageNavHome(true)
  setLingyunPageNavIntent(home)
  if (openLingyunHostedPage(home, home)) return
  uni.redirectTo({ url: home })
}
function onBack(): void {
  if (inContentCover) {
    closeLingyunContentCover()
    emit('back')
    return
  }
  emit('back')
  if (!props.autoBack) return
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }
  /* 深链直接落到二级页面时，返回父 Tab 的工作台，而不是回首页 */
  const tab = matchLingyunPageTab(
    pageConfig.value.tabs || [],
    effectivePagePath.value,
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
}
function onClose(): void {
  emit('close')
}
function onPageTouch(): void {
  /* 页面任意位置开始触摸时先收起图表 tooltip；点图表时图表随后会重新显示 */
  try {
    uni.$emit('lingyun:page-touch')
  } catch {
    /* ignore */
  }
}
function onTrailing(): void {
  emit('trailing')
}
function onTrailingAction(payload: Record<string, unknown>): void {
  emit('trailing-action', payload)
}
/** 打开顶部搜索；searchable=false 时忽略 */
function openSearch(): void {
  if (!props.searchable || searchActive.value) return
  searchActive.value = true
  emit('update:searching', true)
  emit('search-open')
}
/** 关闭顶部搜索；cancel=false 时不发取消事件，用于父级主动收起 */
function closeSearch(cancel = true): void {
  if (!searchActive.value) return
  const value = searchText.value
  searchActive.value = false
  emit('update:searching', false)
  if (cancel) emit('search-cancel', value)
  clearSearchValue()
}
function clearSearchValue(): void {
  if (!searchText.value) return
  searchText.value = ''
  emit('update:searchValue', '')
}
function toggleSearch(): void {
  if (searchActive.value) closeSearch()
  else openSearch()
}
function onToolbarSearchOpen(): void {
  openSearch()
}
function onToolbarSearchCancel(): void {
  closeSearch(true)
}
function onSearchInput(value: string | number): void {
  searchText.value = String(value == null ? '' : value)
  emit('update:searchValue', searchText.value)
  emit('search-input', searchText.value)
}
function onSearchConfirm(value: string | number): void {
  searchText.value = String(value == null ? '' : value)
  emit('update:searchValue', searchText.value)
  emit('search', searchText.value)
}
function onSegmentUpdate(value: string | number): void {
  emit('update:segmentValue', value)
}
function onSegmentClick(payload: Record<string, unknown>): void {
  emit('segment-click', payload)
}
function onSegmentChange(payload: Record<string, unknown>): void {
  emit('segment-change', payload)
}
function onPickerValue(value: string | number, option: { value: string | number; label: string }): void {
  emit('picker-value', value, option)
}
function coverView(path: string) {
  return getLingyunContentCoverView(path)
}
function onCoverBack(): void {
  closeLingyunContentCover()
}
function scheduleCoverEnter(): void {
  if (_coverEnterTimer.value) clearTimeout(_coverEnterTimer.value)
  _coverEnterTimer.value = setTimeout(() => {
    _coverEnterTimer.value = null
    coverLayers.value.forEach((layer) => {
      coverEntered.value[layer.key] = true
    })
  }, 32)
}

watch(
  () => props.searching,
  (val: boolean) => {
    const wasActive = searchActive.value
    searchActive.value = !!val
    if (wasActive && !searchActive.value) clearSearchValue()
  },
  { immediate: true },
)
watch(
  () => props.searchValue,
  (val: string) => {
    searchText.value = String(val == null ? '' : val)
  },
  { immediate: true },
)
watch(
  () => props.segments,
  () => {
    syncTopInset()
  },
  { deep: true },
)
watch(() => props.segmentControl, () => {
  syncTopInset()
})
watch(searchActive, () => {
  syncTopInset()
})
watch(() => props.safeArea, () => {
  syncNavLayout()
})
watch(() => props.showToolbar, () => {
  syncTopInset()
})
watch(() => props.titleStyle, () => {
  syncTopInset()
})
watch(() => props.placement, () => {
  syncTopInset()
})
watch(() => props.showGrabber, () => {
  syncTopInset()
})
watch(navDocked, () => {
  syncSharedNavChrome()
})
watch(pageLayout, () => {
  applyPageLayout()
})
watch(tabbarVisible, () => {
  /* 当前页是否属于一级 Tab 会随工作台 key / 路由变化 */
  applyPageLayout()
})
watch(() => props.autoBottomInset, () => {
  applyPageLayout()
})
watch(pageNavWidth, () => {
  /* PC 内联菜单列展开 / 收起时，同步注入的导航占位给 tabbar、日期切换器等固定底栏 */
  applyPageLayout()
})
watch(pageNavRail, () => {
  syncSharedNavChrome()
}, { immediate: true })
watch(pageNavInline, () => {
  syncSharedNavChrome()
}, { immediate: true })
watch(coverLayerMark, () => {
  scheduleCoverEnter()
})
watch(usePageScroll, (enabled: boolean) => {
  nextTick(() => {
    if (enabled) {
      bindWindowScroll()
      // #ifndef H5
      setupGlassObserver()
      // #endif
    } else {
      unbindWindowScroll()
      teardownGlassObserver()
    }
  })
})

onResize((res) => {
  syncNavLayout(readLingyunResizeWidth(res))
})
onShow(() => {
  if (embedded) return
  syncPageChrome()
  /* 上一页还在栈里，协议页曾把共用窄栏标记关掉时，这里按当前窗口写回去 */
  syncSharedNavChrome()
  tabbarRemeasure.value += 1
})

provide('lingyun-tabbar-remeasure', tabbarRemeasure)
provide(
  LINGYUN_APP_PAGE_REPORT_SCROLL,
  embedded && inheritedScrollReport
    ? inheritedScrollReport
    : (scrollTop: number) => {
        applyScrollTop(scrollTop)
        scheduleScrollSettle(scrollTop)
      },
)
provide(
  LINGYUN_APP_PAGE_SCROLL_LOCK,
  embedded && inheritedScrollLock
    ? inheritedScrollLock
    : {
        lock: () => lockBodyScroll(),
        unlock: () => unlockBodyScroll(),
      },
)

if (typeof bindScroll === 'function') {
  bindScroll((scrollTop: number) => {
    applyScrollTop(scrollTop)
    scheduleScrollSettle(scrollTop)
  })
}
syncPageChrome()
applyPageTransition()
syncNavLayout()
_scrollSettleTimer.value = null
_scrollLockCount.value = 0
_glassObserver.value = null
_navSlotClaim.value = 0

onMounted(() => {
  if (pageEntering.value) {
    _pageEnterTimer.value = setTimeout(() => {
      pageEntering.value = false
      _pageEnterTimer.value = null
    }, 300)
  }
  if (embedded) return
  if (!inContentCover && ensureLingyunWidePageHost()) return
  syncNavLayout()
  syncNavHeaderSlots()
  syncH5PageNavHost()
  bindResize()
  bindPageRoute()
  if (usePageScroll.value) {
    bindWindowScroll()
    // #ifndef H5
    nextTick(() => setupGlassObserver())
    // #endif
    // #ifdef H5
    nextTick(() => syncWindowScrollTop())
    // #endif
  }
  try {
    useLingyunTheme().apply()
  } catch {
    /* pinia 未就绪时忽略 */
  }
})

onBeforeUnmount(() => {
  releaseNavHeaderSlots()
  clearScrollSettle()
  teardownGlassObserver()
  unbindResize()
  unbindPageRoute()
  unbindWindowScroll()
  if (_pageEnterTimer.value) {
    clearTimeout(_pageEnterTimer.value)
    _pageEnterTimer.value = null
  }
  if (_coverEnterTimer.value) {
    clearTimeout(_coverEnterTimer.value)
    _coverEnterTimer.value = null
  }
})

/* <script setup> 下父组件 ref 只能访问这里暴露的方法 */
defineExpose({
  openSearch,
  closeSearch,
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

.lingyun-app-page--in-cover {
  height: 100%;
  min-height: 100%;
}

/* 导航右侧内容区盖层。位移只改 transform，不改玻璃节点的 opacity。 */
.lingyun-app-page__covers {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: var(--lingyun-page-nav-width, 0px);
  z-index: 110;
  overflow: hidden;
  pointer-events: none;
}

.lingyun-app-page__cover {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: auto;
  background-color: var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
  transform: translateX(100%);
  transition: transform 320ms cubic-bezier(0.32, 0.72, 0, 1);
}

.lingyun-app-page__cover--in {
  transform: translateX(0);
}

.lingyun-app-page__cover-miss {
  width: 100%;
  height: 100%;
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
