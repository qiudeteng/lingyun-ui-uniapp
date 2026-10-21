<template>
  <view
    class="lingyun-page-nav"
    :class="[themeRootClass, { 'lingyun-page-nav--rail': railMode }]"
  >
    <view v-if="railMode" class="lingyun-page-nav__rail-panel" />
    <view class="lingyun-page-nav__head" :style="navHeadStyle">
      <view class="lingyun-page-nav__bar" :style="navBarStyle">
        <view v-if="windowControls && !railMode" class="lingyun-page-nav__windows" aria-hidden="true">
          <view class="lingyun-page-nav__window lingyun-page-nav__window--close" />
          <view class="lingyun-page-nav__window lingyun-page-nav__window--min" />
          <view class="lingyun-page-nav__window lingyun-page-nav__window--zoom" />
        </view>
        <view v-if="railMode || showProfile" class="lingyun-page-nav__profile">
          <template v-if="railMode">
            <view v-if="useAvatarSlot" class="lingyun-page-nav__rail-avatar-slot">
              <slot name="avatar" />
              <!-- #ifdef H5 -->
              <view id="ly-nav-slot-avatar" class="lingyun-page-nav__slot" />
              <!-- #endif -->
            </view>
            <lingyun-avatar
              v-else
              class="lingyun-page-nav__rail-avatar"
              size="ml"
              :src="profileAvatar && !avatarFailed ? profileAvatar : ''"
              :text="profileName || railBrand"
              @error="onAvatarError"
            />
          </template>
          <view
            v-else-if="showAvatar"
            class="lingyun-page-nav__avatar"
            :class="{ 'lingyun-page-nav__avatar--mark': showStorePicker }"
          >
            <image
              v-if="profileAvatar && !useAvatarSlot && !avatarFailed"
              class="lingyun-page-nav__avatar-img"
              :style="avatarImgStyle"
              :src="profileAvatar"
              mode="aspectFill"
              @error="onAvatarError"
            />
            <text v-else-if="!useAvatarSlot" class="lingyun-page-nav__avatar-fallback">{{ avatarInitial }}</text>
            <slot name="avatar" />
            <!-- #ifdef H5 -->
            <view v-if="useAvatarSlot" id="ly-nav-slot-avatar" class="lingyun-page-nav__slot" />
            <!-- #endif -->
          </view>
          <view v-if="!railMode" class="lingyun-page-nav__meta">
            <view
              v-if="showName"
              class="lingyun-page-nav__name"
              :class="{ 'lingyun-page-nav__name--title': showStorePicker }"
            >
              <view v-if="profileName && !useNameSlot" class="lingyun-page-nav__name-text">
                <text class="lingyun-page-nav__name-label">{{ profileName }}</text>
              </view>
              <slot name="name" />
              <!-- #ifdef H5 -->
              <view v-if="useNameSlot" id="ly-nav-slot-name" class="lingyun-page-nav__slot" />
              <!-- #endif -->
            </view>
            <view
              v-if="showSubtitle"
              class="lingyun-page-nav__subtitle"
              :class="{ 'lingyun-page-nav__subtitle--hang': showName }"
            >
              <view v-if="profileSubtitle && !useSubtitleSlot" class="lingyun-page-nav__subtitle-text">
                <text class="lingyun-page-nav__subtitle-label">{{ profileSubtitle }}</text>
              </view>
              <slot name="subtitle" />
              <!-- #ifdef H5 -->
              <view v-if="useSubtitleSlot" id="ly-nav-slot-subtitle" class="lingyun-page-nav__slot" />
              <!-- #endif -->
            </view>
          </view>
        </view>
        <text v-else class="lingyun-page-nav__title">凌云UI</text>
      </view>
      <view v-if="showStorePicker && !railMode" class="lingyun-page-nav__store">
        <lingyun-picker
          class="lingyun-page-nav__store-picker"
          :model-value="storeIndex"
          :range="storeRange"
          range-key="store_name"
          title="选择门店"
          show-search
          search-placeholder="搜索门店"
          :disabled="!storeRange.length"
          @change="onStorePick"
        >
          <template #trigger>
            <view class="lingyun-page-nav__store-pill">
              <view class="lingyun-page-nav__store-label">
                <text class="lingyun-page-nav__store-text">{{ storeLabel }}</text>
              </view>
              <view class="lingyun-page-nav__store-chevron">
                <lingyun-icon type="top" :size="8" color="label" />
                <lingyun-icon type="bottom" :size="8" color="label" />
              </view>
            </view>
          </template>
        </lingyun-picker>
      </view>
    </view>
    <scroll-view
      class="lingyun-page-nav__scroll"
      :scroll-y="navScrollY"
      :show-scrollbar="false"
      :scroll-top="navScrollTop"
      :scroll-with-animation="false"
      @scroll="onNavScroll"
    >
      <view class="lingyun-page-nav__body">
        <view
          v-if="indicatorVisible"
          class="lingyun-page-nav__indicator"
          :class="{ 'lingyun-page-nav__indicator--ready': indicatorReady }"
          :style="indicatorStyle"
        />
        <view
          v-if="showHome"
          :id="navItemId(navHome)"
          class="lingyun-page-nav__item"
          :class="{ 'lingyun-page-nav__item--selected': isNavCurrent(navHome) }"
          hover-class="lingyun-page-nav__item--hover"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="onNavTap(navHome)"
        >
          <lingyun-icon type="home" :size="railMode ? 28 : 22" color="var(--lingyun-label, #000)" />
          <text class="lingyun-page-nav__label">首页</text>
        </view>
        <view
          v-for="(section, sectionIndex) in pageNavSections"
          :key="section.title + '-' + sectionIndex"
          class="lingyun-page-nav__section"
        >
          <text v-if="section.title" class="lingyun-page-nav__section-title">{{ section.title }}</text>
          <view
            v-for="(item, itemIndex) in section.items"
            :key="item.url + '-' + itemIndex"
            class="lingyun-page-nav__menu-cell"
            @click="onNavItemTap(item)"
          >
            <lingyun-menu
              style="display: block; width: 100%"
              placement="right"
              :show="!!(item.children && item.children.length) && childMenuKey === item.key"
              :actions="childMenuActions(item)"
              :mask-transparent="true"
              :trigger-block="true"
              @update:show="onChildMenuShow(item, $event)"
              @select="onChildMenuSelect(item, $event)"
            >
              <template #trigger>
                <view
                  :id="navItemId(item.url)"
                  class="lingyun-page-nav__item"
                  :class="{ 'lingyun-page-nav__item--selected': isNavItemCurrent(item) }"
                  hover-class="lingyun-page-nav__item--hover"
                  :hover-start-time="20"
                  :hover-stay-time="70"
                >
                  <image
                    v-if="item.iconSrc"
                    class="lingyun-page-nav__glyph"
                    :src="item.iconSrc"
                    mode="aspectFit"
                  />
                  <lingyun-icon
                    v-else
                    :type="item.icon || 'circle'"
                    :size="railMode ? 28 : 22"
                    color="var(--lingyun-label, #000)"
                  />
                  <text class="lingyun-page-nav__label">{{ item.title }}</text>
                  <view v-if="hasItemBadge(item)" class="lingyun-page-nav__badge">
                    <lingyun-badge
                      :text="itemBadgeText(item)"
                      :color="itemBadgeColor(item)"
                      :dot="itemBadgeDot(item)"
                      :max="itemBadgeMax(item)"
                    />
                  </view>
                </view>
              </template>
            </lingyun-menu>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, ref, watch, type PropType } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useLingyunTheme } from '../../utils/theme'
import LingyunIcon from '../lingyun-icon/lingyun-icon.vue'
import LingyunAvatar from '../lingyun-avatar/lingyun-avatar.vue'
import LingyunMenu from '../lingyun-menu/lingyun-menu.vue'
import {
  getLingyunNavLayout,
  LINGYUN_TOOLBAR_BAR_DESIGN_PX,
} from '../lingyun-toolbars/getLingyunNavSafeInset'
import {
  clearLingyunPageHost,
  clearLingyunPageNavIntent,
  getLingyunHostedPath,
  getLingyunHostedUrl,
  getLingyunPageNavIntent,
  getLingyunPageNavHome,
  getLingyunPageNavProfile,
  getLingyunPageNavScrollTop,
  getLingyunPageNavSections,
  getLingyunPageNavStoreId,
  getLingyunPageNavStoreName,
  getLingyunPageNavStoreOptions,
  isLingyunPageNavLoggedIn,
  lingyunPageNavRail,
  normalizeLingyunPagePath,
  openLingyunHostedPage,
  resolveLingyunPageUrl,
  selectLingyunPageNavStore,
  setLingyunPageNavIntent,
  setLingyunPageNavScrollTop,
  useLingyunPageNavIntent,
  type LingyunPageNavItem,
  type LingyunPageNavSection,
} from '../../utils/pageNavAdapter'
import {
  buildLingyunPageTabSections,
  getLingyunPageConfig,
  getLingyunWorkspaceTabKey,
  isLingyunWorkspacePath,
  useLingyunWorkspaceTabKey,
} from '../../utils/pageConfig'
import {
  beginLingyunNavTransition,
  clearLingyunNavTransition,
} from '../../utils/navTransition'
import { LINGYUN_APP_PAGE_SCROLL_LOCKED } from '../lingyun-app-page/useLingyunAppPageScroll'

type NavPage = {
  route?: string
  options?: Record<string, string>
  $page?: { fullPath?: string; route?: string; options?: Record<string, string> }
}

const LINGYUN_PAGE_NAV_TITLE = '凌云UI'
const LINGYUN_PAGE_NAV_SUBTITLE = '一套对齐 Apple Liquid Glass 的 uni-app 多端组件库'

/**
 * 宽屏目录。H5 挂在 body 上，不随 redirectTo 拆掉；小程序嵌在 lingyun-app-page。
 * scroll-top 只在挂载时写入一次，滚动中不回写，避免把列表拽回旧位置。
 */
export default defineComponent({
  name: 'LingyunPageNav',
  components: { LingyunIcon, LingyunAvatar, LingyunMenu },
  inject: {
    pageScrollLocked: {
      from: LINGYUN_APP_PAGE_SCROLL_LOCKED,
      default: () => ref(false),
    },
  },
  props: {
    sections: {
      type: Array as PropType<LingyunPageNavSection[] | null>,
      default: null,
    },
    /** 顶部头像地址。有 #avatar 插槽时不用这张图。 */
    avatar: { type: String, default: '' },
    /** 宿主已为导航预留的状态栏安全区；-1 表示由导航自己处理 */
    hostSafeTop: { type: Number, default: -1 },
    /** 顶部名称。有 #name 插槽时不用这段文字。 */
    name: { type: String, default: '' },
    /** 顶部副标题。有 #subtitle 插槽时不用这段文字。 */
    subtitle: { type: String, default: '' },
  },
  data() {
    return {
      statusBarPx: 0,
      barHeightPx: LINGYUN_TOOLBAR_BAR_DESIGN_PX,
      padTopPx: 0,
      padBottomPx: 0,
      currentPath: getLingyunPageNavIntent(),
      navScrollTop: getLingyunPageNavScrollTop(),
      avatarFailed: false,
      /** 选中项滑动胶囊 */
      indicatorTop: 0,
      indicatorHeight: 0,
      indicatorVisible: false,
      indicatorReady: false,
      /** 窄栏点击二级菜单 */
      childMenuKey: '',
      _onHashChange: null as (() => void) | null,
      _expectPath: '',
      _routeSeen: '',
      _routeTimer: null as ReturnType<typeof setTimeout> | null,
      _navScrollSettled: false,
      _navMounted: false,
    }
  },
  setup() {
    const instance = getCurrentInstance()
    const intent = useLingyunPageNavIntent()
    watch(intent, (value) => {
      if (!value) return
      const proxy = instance?.proxy as { currentPath?: string; _routeSeen?: string } | null | undefined
      if (!proxy) return
      proxy.currentPath = value
      proxy._routeSeen = value
    })
    watch(useLingyunWorkspaceTabKey(), () => {
      const proxy = instance?.proxy as { syncIndicator?: (animate?: boolean) => void } | null | undefined
      proxy?.syncIndicator?.(false)
    })
    onShow(() => {
      const proxy = instance?.proxy as
        | { syncRoute?: () => void; syncLayout?: () => void }
        | null
        | undefined
      proxy?.syncLayout?.()
      proxy?.syncRoute?.()
    })
    return {}
  },
  computed: {
    navScrollY(): boolean {
      return !(this.pageScrollLocked as boolean)
    },
    /** 未登录时「首页」进组件演示，登录后仍进业务首页。 */
    navHome(): string {
      return getLingyunPageNavHome(isLingyunPageNavLoggedIn())
    },
    indicatorStyle() {
      return {
        top: `${this.indicatorTop}px`,
        height: `${this.indicatorHeight}px`,
      }
    },
    themeRootClass() {
      try {
        return useLingyunTheme().rootClass
      } catch {
        return 'theme-light'
      }
    },
    /** 由 lingyun-app-page 统一决定：PC + 全局 tabs 时窄栏 */
    railMode(): boolean {
      return lingyunPageNavRail.value
    },
    railBrand(): string {
      const name = (this.profileName || '').trim()
      return name ? name.slice(0, 1) : '凌'
    },
    pageNavSections(): LingyunPageNavSection[] {
      if (Array.isArray(this.sections)) return this.sections
      const config = getLingyunPageConfig()
      if (config.tabs && config.tabs.length) {
        return buildLingyunPageTabSections(
          config.tabs,
          config.sidebarTitle || '',
          config.workspaceUrl || '',
        )
      }
      return getLingyunPageNavSections()
    },
    /** 全局一级导航已包含首页时，不再渲染内置「首页」行 */
    showHome(): boolean {
      if (Array.isArray(this.sections)) return true
      const config = getLingyunPageConfig()
      return !(config.tabs && config.tabs.length)
    },
    windowControls() {
      return !!getLingyunNavLayout(LINGYUN_TOOLBAR_BAR_DESIGN_PX).windowControls
    },
    navHeadStyle() {
      /* 宿主已按状态栏留安全区时这里不再重复；窄栏内部再留 8px */
      const railPad = this.railMode ? 8 : 0
      const status = this.hostSafeTop >= 0 ? 0 : this.statusBarPx
      return { paddingTop: `${status + railPad}px` }
    },
    profile() {
      return getLingyunPageNavProfile()
    },
    profileAvatar(): string {
      return this.avatar || this.profile.avatar || ''
    },
    avatarInitial(): string {
      const name = (this.profileName || '').trim()
      return name ? name.slice(0, 1) : ''
    },
    profileName(): string {
      return this.name || this.profile.name || LINGYUN_PAGE_NAV_TITLE
    },
    profileSubtitle(): string {
      if (this.subtitle) return this.subtitle
      if (this.profile.subtitle) return this.profile.subtitle
      const customName = !!(this.name || this.profile.name || this.useNameSlot)
      return customName ? '' : LINGYUN_PAGE_NAV_SUBTITLE
    },
    /**
     * 小程序父级只要写了 slot="avatar"，子组件 $slots.avatar 就恒为真，
     * 写在 slot 默认内容里的头像和名称不会渲染。是否改用插槽只看页面有没有真的传入。
     */
    useAvatarSlot(): boolean {
      return !!this.profile.slotAvatar
    },
    useNameSlot(): boolean {
      return !!this.profile.slotName
    },
    useSubtitleSlot(): boolean {
      return !!this.profile.slotSubtitle
    },
    avatarImgStyle(): Record<string, string> {
      const size = this.showStorePicker ? '52px' : '36px'
      return { width: size, height: size }
    },
    showStorePicker(): boolean {
      return getLingyunPageNavStoreOptions().length > 0 || !!getLingyunPageNavStoreName()
    },
    storeLabel(): string {
      return getLingyunPageNavStoreName() || '请选择门店'
    },
    storeRange(): { store_id: string | number; store_name: string }[] {
      return getLingyunPageNavStoreOptions()
    },
    storeIndex(): number {
      const storeId = getLingyunPageNavStoreId()
      const idx = this.storeRange.findIndex(
        (item) => storeId != null && String(item.store_id) === String(storeId),
      )
      return idx < 0 ? 0 : idx
    },
    showAvatar(): boolean {
      return !!(this.profileAvatar || this.useAvatarSlot)
    },
    showName(): boolean {
      return !!(this.profileName || this.useNameSlot)
    },
    showSubtitle(): boolean {
      return !!(this.profileSubtitle || this.useSubtitleSlot)
    },
    showProfile(): boolean {
      return this.showAvatar || this.showName || this.showSubtitle
    },
    navBarStyle() {
      const h = this.barHeightPx || LINGYUN_TOOLBAR_BAR_DESIGN_PX
      return {
        minHeight: `${h}px`,
      }
    },
  },
  watch: {
    profileAvatar() {
      this.avatarFailed = false
    },
    railMode: {
      immediate: true,
      handler() {
        this.$nextTick(() => {
          setTimeout(() => this.syncIndicator(false), 30)
        })
      },
    },
    currentPath() {
      this.syncIndicator(true)
    },
    pageNavSections() {
      this.syncIndicator(false)
    },
    navHome() {
      this.syncIndicator(false)
    },
    showHome() {
      this.syncIndicator(false)
    },
  },
  created() {
    this.syncLayout()
    this.syncRoute()
  },
  mounted() {
    this._navMounted = true
    this.syncLayout()
    this.syncRoute()
    // 刷新不会走 hashchange。侧栏往往比路由更早挂上，404 的 from 要等路由就绪再写进选中项。
    this._routeSeen = ''
    this.pullRoute(40)
    this.$nextTick(() => {
      setTimeout(() => this.syncIndicator(false), 30)
    })
    // #ifdef H5
    this._onHashChange = () => {
      clearTimeout(this._routeTimer ?? undefined)
      this._expectPath = ''
      const hashPath = this.hashRoute()
      if (!hashPath) return
      if (hashPath === 'pages/404/404') {
        const from = this.missedMenuPath()
        if (from) {
          this.currentPath = from
          this._routeSeen = from
        }
        return
      }
      clearLingyunPageHost()
      clearLingyunPageNavIntent()
      this.currentPath = hashPath
      this._routeSeen = hashPath
    }
    if (typeof window !== 'undefined') window.addEventListener('hashchange', this._onHashChange)
    // #endif
    // #ifndef H5
    const saved = getLingyunPageNavScrollTop()
    if (saved > 0) {
      // 只改一个几乎看不见的差值，让小程序应用初始 scroll-top，且不会先跳到顶部
      this.$nextTick(() => {
        this.navScrollTop = saved + 0.01
      })
    }
    // #endif
  },
  beforeUnmount() {
    this._navMounted = false
    clearTimeout(this._routeTimer ?? undefined)
    // #ifdef H5
    if (typeof window !== 'undefined' && this._onHashChange) {
      window.removeEventListener('hashchange', this._onHashChange)
    }
    // #endif
  },
  methods: {
    onAvatarError() {
      this.avatarFailed = true
    },
    onStorePick(payload: { value?: number | string | string[] }) {
      const idx = Number(payload?.value)
      if (!Number.isFinite(idx) || idx < 0) return
      const item = this.storeRange[idx]
      if (item) selectLingyunPageNavStore(item.store_id)
    },
    syncLayout() {
      const layout = getLingyunNavLayout(LINGYUN_TOOLBAR_BAR_DESIGN_PX)
      this.statusBarPx = layout.statusBarHeight || 0
      this.barHeightPx = layout.barHeight
      this.padTopPx = layout.padTop
      this.padBottomPx = layout.padBottom
    },
    readRoute() {
      try {
        const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
        const cur = pages[pages.length - 1] as NavPage | undefined
        const raw = (cur && (cur.route || cur.$page?.fullPath || cur.$page?.route)) || ''
        return normalizeLingyunPagePath(raw)
      } catch {
        return ''
      }
    },
    /** H5 地址栏。`#/` 是首页。hashchange 时路由栈可能还停在 404。 */
    hashRoute(): string {
      // #ifdef H5
      if (typeof window === 'undefined') return ''
      const raw = (window.location.hash || '').replace(/^#/, '').split('?')[0]
      if (!raw || raw === '/') return normalizeLingyunPagePath(this.navHome)
      return normalizeLingyunPagePath(raw)
      // #endif
      // #ifndef H5
      return ''
      // #endif
    },
    syncRoute() {
      const next = this.readRoute()
      const intent = getLingyunPageNavIntent()
      const highlight = this.routeHighlight(next)
      if (intent && highlight !== intent) {
        this.currentPath = intent
        return
      }
      if (intent && highlight === intent) clearLingyunPageNavIntent()
      if (highlight) this.currentPath = highlight
    },
    /** 等到 getCurrentPages 跟上再对齐。对不上时保持点中的那一项，不要写回上一页。 */
    pullRoute(left = 8) {
      clearTimeout(this._routeTimer ?? undefined)
      const now = this.readRoute()
      const expect = this._expectPath
      if (expect) {
        if (now === expect) {
          this.currentPath = this.routeHighlight(now)
          this._expectPath = ''
          clearLingyunPageNavIntent()
          return
        }
      } else if (now && now !== this._routeSeen) {
        const highlight = this.routeHighlight(now)
        if (now === 'pages/404/404' && (!highlight || highlight === 'pages/404/404')) {
          if (left <= 0) {
            this._expectPath = ''
            return
          }
          this._routeTimer = setTimeout(() => this.pullRoute(left - 1), 16)
          return
        }
        this.currentPath = highlight
        return
      }
      if (left <= 0) {
        this._expectPath = ''
        return
      }
      this._routeTimer = setTimeout(() => this.pullRoute(left - 1), 16)
    },
    /**
     * 404 对不上菜单项。已有点中的菜单路径就留着；刷新进 404 时才用地址里的 from。
     */
    routeHighlight(route: string): string {
      const hostedPath = getLingyunHostedPath()
      if (hostedPath && route === 'pages/404/404') return hostedPath
      if (route === 'pages/404/404') {
        if (this.currentPath && this.currentPath !== 'pages/404/404') return this.currentPath
        const from = this.missedMenuPath()
        if (from) return from
      }
      if (hostedPath && !route) return hostedPath
      return route
    },
    missedMenuPath(): string {
      let raw = ''
      try {
        const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
        const cur = pages[pages.length - 1] as NavPage | undefined
        raw = cur?.options?.from || cur?.$page?.options?.from || ''
        if (!raw && cur?.$page?.fullPath) raw = this.queryValue(cur.$page.fullPath, 'from')
      } catch {
        raw = ''
      }
      // #ifdef H5
      if (!raw && typeof window !== 'undefined') raw = this.queryValue(window.location.hash || '', 'from')
      // #endif
      if (!raw) return ''
      return normalizeLingyunPagePath(this.safeDecode(raw))
    },
    queryValue(url: string, key: string): string {
      const query = String(url || '').split('?')[1] || ''
      const part = query.split('&').find((item) => item.startsWith(`${key}=`))
      return part ? part.slice(key.length + 1) : ''
    },
    safeDecode(value: string): string {
      let next = value
      for (let i = 0; i < 2; i += 1) {
        try {
          const decoded = decodeURIComponent(next)
          if (decoded === next) break
          next = decoded
        } catch {
          break
        }
      }
      return next
    },
    navItemId(url: string): string {
      const path = normalizeLingyunPagePath(url)
      return `ly-nav-${path.replace(/[^a-zA-Z0-9_-]/g, '-')}`
    },
    selectedNavUrl(): string {
      if (this.showHome && this.isNavCurrent(this.navHome)) return this.navHome
      for (const section of this.pageNavSections || []) {
        for (const item of section.items || []) {
          if (this.isNavItemCurrent(item)) return item.url
        }
      }
      return ''
    },
    /** 选中胶囊：首次落位不动画，之后上下滑动 */
    syncIndicator(animate = true, retry = 0): void {
      if (!this._navMounted) return
      const url = this.selectedNavUrl()
      if (!url) {
        this.indicatorVisible = false
        this.indicatorReady = false
        return
      }
      this.$nextTick(() => {
        uni
          .createSelectorQuery()
          .in(this)
          .select('.lingyun-page-nav__body')
          .boundingClientRect()
          .select(`#${this.navItemId(url)}`)
          .boundingClientRect()
          .exec((res) => {
            const body = res && res[0]
            const item = res && res[1]
            if (!body || !item || !item.height) {
              /* H5 宿主初始 display:none，等侧栏显示后再测量 */
              if (retry < 10) {
                setTimeout(() => this.syncIndicator(animate, retry + 1), 50)
              }
              return
            }
            this.indicatorTop = item.top - body.top
            this.indicatorHeight = item.height
            if (!this.indicatorVisible) {
              this.indicatorVisible = true
              this.indicatorReady = false
              this.$nextTick(() => {
                setTimeout(() => {
                  this.indicatorReady = true
                }, 20)
              })
              return
            }
            if (!animate) {
              this.indicatorReady = false
              this.$nextTick(() => {
                setTimeout(() => {
                  this.indicatorReady = true
                }, 20)
              })
            }
          })
      })
    },
    isNavCurrent(url: string) {
      const selected = getLingyunHostedPath() || this.currentPath
      return normalizeLingyunPagePath(url) === selected
    },
    isNavItemCurrent(item: LingyunPageNavItem) {
      if (this.isNavCurrent(item.url)) return true
      const selected = normalizeLingyunPagePath(getLingyunHostedPath() || this.currentPath)
      if (isLingyunWorkspacePath(selected)) {
        return !!item.key && item.key === getLingyunWorkspaceTabKey()
      }
      const matches = Array.isArray(item.match) ? item.match : item.match ? [item.match] : []
      return matches.some((match) => normalizeLingyunPagePath(match) === selected)
    },
    hasItemBadge(item: LingyunPageNavItem): boolean {
      const badge = item.badge
      return badge !== undefined && badge !== null && badge !== false && badge !== ''
    },
    itemBadgeText(item: LingyunPageNavItem): string | number {
      const badge = item.badge
      if (badge && typeof badge === 'object') {
        return badge.text != null ? badge.text : ''
      }
      return typeof badge === 'boolean' ? '' : (badge ?? '')
    },
    itemBadgeColor(item: LingyunPageNavItem): string | undefined {
      const badge = item.badge
      return badge && typeof badge === 'object' ? badge.color : undefined
    },
    itemBadgeDot(item: LingyunPageNavItem): boolean {
      const badge = item.badge
      return badge === true || (!!badge && typeof badge === 'object' && !!badge.dot)
    },
    itemBadgeMax(item: LingyunPageNavItem): number | string | undefined {
      const badge = item.badge
      return badge && typeof badge === 'object' ? badge.max : undefined
    },
    onNavScroll(event: { detail?: { scrollTop?: number } }) {
      const y = Number(event && event.detail && event.detail.scrollTop)
      if (!Number.isFinite(y) || y < 0) return
      const saved = getLingyunPageNavScrollTop()
      // 重建时 scroll-view 会先抛一次 0，不能把记住的位置清掉
      if (saved > 40 && y < 1 && !this._navScrollSettled) return
      this._navScrollSettled = true
      setLingyunPageNavScrollTop(y)
    },
    replacePage(url: string) {
      uni.redirectTo({
        url,
        fail: () => {
          uni.navigateTo({
            url,
            fail: () => {
              clearLingyunPageNavIntent()
              this._expectPath = ''
              this.syncRoute()
            },
          })
        },
      })
    },
    childMenuActions(item: LingyunPageNavItem) {
      return (item.children || []).map((child) => ({
        key: child.key,
        label: child.title,
        icon: child.icon,
      }))
    },
    onChildMenuShow(item: LingyunPageNavItem, show: boolean) {
      if (!show && this.childMenuKey === item.key) this.childMenuKey = ''
    },
    onChildMenuSelect(item: LingyunPageNavItem, payload: { key?: string }) {
      const child = (item.children || []).find((entry) => entry.key === payload?.key)
      this.childMenuKey = ''
      if (child) this.onNavTap(child.url)
    },
    onNavItemTap(item: LingyunPageNavItem) {
      const wasOpen = this.childMenuKey === item.key
      this.childMenuKey = ''
      /* 宽屏左侧（Web 与小程序一致）：有二级菜单点击只弹 menu，再点关闭 */
      if (this.railMode && item.children && item.children.length) {
        this.childMenuKey = wasOpen ? '' : item.key || ''
        return
      }
      this.onNavTap(item.url)
    },
    onNavTap(url: string) {
      const rawTarget = normalizeLingyunPagePath(url)
      if (!rawTarget) return
      const fromPath = normalizeLingyunPagePath(
        getLingyunHostedPath() || this.currentPath,
      )
      beginLingyunNavTransition(fromPath, rawTarget)
      if (openLingyunHostedPage(url, rawTarget)) {
        this.currentPath = rawTarget
        return
      }
      const next = resolveLingyunPageUrl(url)
      const target = normalizeLingyunPagePath(next)
      if (!target) {
        clearLingyunNavTransition()
        return
      }
      const hostedPath = getLingyunHostedPath()
      if (hostedPath === rawTarget && getLingyunHostedUrl() === next) {
        clearLingyunNavTransition()
        return
      }
      if (!hostedPath && target === this.currentPath && target === rawTarget) {
        clearLingyunNavTransition()
        return
      }
      if (openLingyunHostedPage(next, rawTarget)) {
        this.currentPath = rawTarget
        return
      }
      if (hostedPath) clearLingyunPageHost()
      const highlight = target === 'pages/404/404' ? rawTarget : target
      this.currentPath = highlight
      setLingyunPageNavIntent(highlight)
      this._expectPath = target
      this.pullRoute()
      beginLingyunNavTransition(fromPath, target)
      this.replacePage(next)
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-page-nav {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  border-right: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-page-nav__head {
  flex-shrink: 0;
  padding-left: 8px;
  padding-right: 8px;
  padding-bottom: 8px;
  box-sizing: border-box;
}

.lingyun-page-nav__bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  gap: 12px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.lingyun-page-nav__windows {
  width: 41px;
  height: 22px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  pointer-events: none;
}

.lingyun-page-nav__window {
  width: 12px;
  height: 12px;
  border-radius: 6px;
  box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.15);

  &--close {
    background-color: #ff5f57;
  }

  &--min {
    background-color: #febc2e;
  }

  &--zoom {
    background-color: #28c840;
  }
}

.lingyun-page-nav__profile {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.lingyun-page-nav__avatar {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-page-nav__avatar--mark {
  width: 52px;
  height: 52px;
  border-radius: 12px;
}

.lingyun-page-nav__avatar-img {
  width: 36px;
  height: 36px;
  display: block;
}

.lingyun-page-nav__avatar-fallback {
  width: 36px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-page-nav__avatar--mark .lingyun-page-nav__avatar-fallback {
  width: 52px;
  height: 52px;
  line-height: 52px;
  font-size: 20px;
}

.lingyun-page-nav__meta {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.lingyun-page-nav__name {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
}

.lingyun-page-nav__slot {
  width: 100%;
  min-width: 0;
}

.lingyun-page-nav__avatar .lingyun-page-nav__slot {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-page-nav__avatar--mark .lingyun-page-nav__slot {
  width: 52px;
  height: 52px;
}

.lingyun-page-nav__name-text,
.lingyun-page-nav__subtitle-text {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-page-nav__name-label {
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-page-nav__name--title .lingyun-page-nav__name-label {
  font-size: 17px;
  line-height: 22px;
}

.lingyun-page-nav__store {
  width: 100%;
  min-width: 0;
  margin-top: 8px;
}

.lingyun-page-nav__store-pill {
  width: 100%;
  max-width: 100%;
  height: 32px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 16px;
  background-color: var(--lingyun-swipe-row-bg, #{$lingyun-system-gray5});
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
}

.lingyun-page-nav__store-label {
  flex: 1;
  min-width: 0;
  margin-right: 6px;
  overflow: hidden;
}

.lingyun-page-nav__store-chevron {
  width: 10px;
  height: 16px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.lingyun-page-nav__store-text {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 400;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-page-nav__subtitle--hang {
  margin-top: 2px;
}

.lingyun-page-nav__subtitle-label {
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-page-nav__title {
  flex: 1;
  min-width: 0;
  font-size: 22px;
  font-weight: 600;
  line-height: 28px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-page-nav__scroll {
  flex: 1;
  height: 0;
  min-height: 0;
  width: 100%;
}

.lingyun-page-nav__body {
  position: relative;
  padding-bottom: 24px;
  box-sizing: border-box;
}

/* 选中项滑动胶囊：跟随菜单上下移动 */
.lingyun-page-nav__indicator {
  position: absolute;
  left: 8px;
  right: 8px;
  z-index: 0;
  border-radius: 12px;
  background-color: rgba(120, 120, 128, 0.16);
  pointer-events: none;
  will-change: top;
}

.lingyun-page-nav__indicator--ready {
  transition:
    top 0.28s cubic-bezier(0.32, 0.72, 0, 1),
    height 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.lingyun-page-nav.theme-dark .lingyun-page-nav__indicator,
.theme-dark .lingyun-page-nav__indicator {
  background-color: rgba(120, 120, 128, 0.32);
}

.lingyun-page-nav__section {
  padding: 4px 0 8px;
}

.lingyun-page-nav__section-title {
  display: block;
  padding: 12px 20px 4px;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-page-nav__item {
  position: relative;
  z-index: 1;
  min-height: 44px;
  margin: 0 8px;
  padding: 0 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

/* 二级菜单包一层不改变导航项布局的重置 */
.lingyun-page-nav__menu-cell {
  display: block;
  width: 100%;
}

.lingyun-page-nav__item--hover {
  background-color: rgba(120, 120, 128, 0.1);
}

.lingyun-page-nav__glyph {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.lingyun-page-nav__label {
  flex: 1;
  min-width: 0;
  margin-left: 12px;
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.lingyun-page-nav__item--selected .lingyun-page-nav__label {
  font-weight: 600;
}

.lingyun-page-nav__badge {
  flex-shrink: 0;
  margin-left: 8px;
  display: flex;
  align-items: center;
}

/* 全局 tabs 驱动的窄侧栏：图标在上、文字在下 */
.lingyun-page-nav--rail {
  position: relative;
  background-color: transparent;
  border-right: 0;
}

/* 整列悬浮玻璃栏：通高，四周留 8px 安全区；页面背景从玻璃下方透出 */
.lingyun-page-nav--rail .lingyun-page-nav__rail-panel {
  position: absolute;
  top: 8px;
  right: 8px;
  bottom: 8px;
  left: 8px;
  z-index: 0;
  border-radius: 28px;
  pointer-events: none;
  @include lingyun-glass-control;
  border-radius: 28px;
}

.lingyun-page-nav--rail .lingyun-page-nav__head,
.lingyun-page-nav--rail .lingyun-page-nav__scroll {
  position: relative;
  z-index: 1;
}

.lingyun-page-nav--rail .lingyun-page-nav__head {
  padding-left: 4px;
  padding-right: 4px;
}

/* 滚动内容收在玻璃栏的安全区内 */
.lingyun-page-nav--rail .lingyun-page-nav__scroll {
  margin-bottom: 8px;
}

.lingyun-page-nav--rail .lingyun-page-nav__rail-avatar {
  margin: 0 auto;
}

.lingyun-page-nav--rail .lingyun-page-nav__rail-avatar-slot {
  width: 52px;
  height: 52px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-page-nav--rail .lingyun-page-nav__rail-avatar-slot .lingyun-page-nav__slot {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-page-nav--rail .lingyun-page-nav__bar {
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding-top: 6px;
  padding-bottom: 6px;
}

.lingyun-page-nav--rail .lingyun-page-nav__profile {
  flex: none;
  width: 100%;
  justify-content: center;
  gap: 0;
}

.lingyun-page-nav--rail .lingyun-page-nav__section {
  padding: 2px 0 6px;
}

.lingyun-page-nav--rail .lingyun-page-nav__section-title {
  padding: 10px 4px 2px;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-page-nav--rail .lingyun-page-nav__glyph {
  width: 28px;
  height: 28px;
}

.lingyun-page-nav--rail .lingyun-page-nav__item {
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  min-height: 68px;
  margin: 0 12px;
  padding: 6px 2px;
}

.lingyun-page-nav--rail .lingyun-page-nav__label {
  flex: none;
  margin-left: 0;
  margin-top: 2px;
  max-width: 100%;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
}

.lingyun-page-nav--rail .lingyun-page-nav__badge {
  position: absolute;
  top: 4px;
  right: 6px;
  margin-left: 0;
}

.lingyun-page-nav--rail .lingyun-page-nav__indicator {
  left: 12px;
  right: 12px;
}
</style>
