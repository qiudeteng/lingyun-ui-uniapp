<template>
  <view class="lingyun-page-nav" :class="themeRootClass">
    <view class="lingyun-page-nav__head" :style="navHeadStyle">
      <view class="lingyun-page-nav__bar" :style="navBarStyle">
        <view v-if="windowControls" class="lingyun-page-nav__windows" aria-hidden="true">
          <view class="lingyun-page-nav__window lingyun-page-nav__window--close" />
          <view class="lingyun-page-nav__window lingyun-page-nav__window--min" />
          <view class="lingyun-page-nav__window lingyun-page-nav__window--zoom" />
        </view>
        <view v-if="showProfile" class="lingyun-page-nav__profile">
          <view
            v-if="showAvatar"
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
          <view class="lingyun-page-nav__meta">
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
      <view v-if="showStorePicker" class="lingyun-page-nav__store">
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
          class="lingyun-page-nav__item"
          :class="{ 'lingyun-page-nav__item--selected': isNavCurrent(navHome) }"
          hover-class="lingyun-page-nav__item--hover"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="onNavTap(navHome)"
        >
          <lingyun-icon type="home" :size="22" color="var(--lingyun-label, #000)" />
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
            class="lingyun-page-nav__item"
            :class="{ 'lingyun-page-nav__item--selected': isNavCurrent(item.url) }"
            hover-class="lingyun-page-nav__item--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="onNavTap(item.url)"
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
              :size="22"
              color="var(--lingyun-label, #000)"
            />
            <text class="lingyun-page-nav__label">{{ item.title }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, ref, watch, type PropType } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import LingyunIcon from '@/uni_modules/lingyun-ui/components/lingyun-icon/lingyun-icon.vue'
import {
  getLingyunNavLayout,
  LINGYUN_TOOLBAR_BAR_DESIGN_PX,
} from '@/uni_modules/lingyun-ui/components/lingyun-toolbars/getLingyunNavSafeInset'
import {
  LINGYUN_PAGE_NAV_HOME,
  getLingyunPageNavProfile,
  getLingyunPageNavSections,
  clearLingyunPageNavIntent,
  getLingyunPageNavIntent,
  getLingyunPageNavScrollTop,
  normalizeLingyunPagePath,
  resolveLingyunPageUrl,
  setLingyunPageNavIntent,
  setLingyunPageNavScrollTop,
  useLingyunPageNavIntent,
  type LingyunPageNavSection,
} from '@/router/pageNav'
import { clearLingyunPageHost, openLingyunHostedPage, pageHostState } from '@/router/pageHost'
import { LINGYUN_APP_PAGE_SCROLL_LOCKED } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

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
  components: { LingyunIcon },
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
      navHome: LINGYUN_PAGE_NAV_HOME,
      navScrollTop: getLingyunPageNavScrollTop(),
      avatarFailed: false,
      _onHashChange: null as (() => void) | null,
      _expectPath: '',
      _routeSeen: '',
      _routeTimer: null as ReturnType<typeof setTimeout> | null,
      _navScrollSettled: false,
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
    onShow(() => {
      const proxy = instance?.proxy as { syncRoute?: () => void } | null | undefined
      proxy?.syncRoute?.()
    })
    return {}
  },
  computed: {
    navScrollY(): boolean {
      return !(this.pageScrollLocked as boolean)
    },
    themeRootClass() {
      try {
        return useThemeStore().rootClass
      } catch {
        return 'theme-light'
      }
    },
    pageNavSections(): LingyunPageNavSection[] {
      return Array.isArray(this.sections) ? this.sections : getLingyunPageNavSections()
    },
    windowControls() {
      return !!getLingyunNavLayout(LINGYUN_TOOLBAR_BAR_DESIGN_PX).windowControls
    },
    navHeadStyle() {
      return { paddingTop: `${this.statusBarPx}px` }
    },
    profile() {
      return getLingyunPageNavProfile()
    },
    profileAvatar(): string {
      return this.avatar || this.profile.avatar
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
      try {
        const user = useUserStore()
        return user.storeOptions.length > 0 || !!user.storeName
      } catch {
        return false
      }
    },
    storeLabel(): string {
      try {
        return useUserStore().storeName || '请选择门店'
      } catch {
        return '请选择门店'
      }
    },
    storeRange(): { store_id: string | number; store_name: string }[] {
      try {
        return useUserStore().storeOptions.map((item) => ({
          store_id: item.store_id,
          store_name: item.store_name,
        }))
      } catch {
        return []
      }
    },
    storeIndex(): number {
      try {
        const user = useUserStore()
        const idx = user.storeOptions.findIndex(
          (item) => user.storeId != null && String(item.store_id) === String(user.storeId),
        )
        return idx < 0 ? 0 : idx
      } catch {
        return 0
      }
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
  },
  created() {
    this.syncLayout()
    this.syncRoute()
  },
  mounted() {
    this.syncLayout()
    this.syncRoute()
    // 刷新不会走 hashchange。侧栏往往比路由更早挂上，404 的 from 要等路由就绪再写进选中项。
    this._routeSeen = ''
    this.pullRoute(40)
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
      try {
        const item = useUserStore().storeOptions[idx]
        if (!item) return
        useUserStore().selectStore(item.store_id)
      } catch {
        /* 门店状态尚未就绪 */
      }
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
      if (!raw || raw === '/') return normalizeLingyunPagePath(LINGYUN_PAGE_NAV_HOME)
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
      if (pageHostState.path && route === 'pages/404/404') return pageHostState.path
      if (route === 'pages/404/404') {
        if (this.currentPath && this.currentPath !== 'pages/404/404') return this.currentPath
        const from = this.missedMenuPath()
        if (from) return from
      }
      if (pageHostState.path && !route) return pageHostState.path
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
    isNavCurrent(url: string) {
      const selected = pageHostState.path || this.currentPath
      return normalizeLingyunPagePath(url) === selected
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
    onNavTap(url: string) {
      const rawTarget = normalizeLingyunPagePath(url)
      if (!rawTarget) return
      const next = resolveLingyunPageUrl(url)
      const target = normalizeLingyunPagePath(next)
      if (!target) return
      if (pageHostState.path === rawTarget && pageHostState.url === next) return
      if (!pageHostState.path && target === this.currentPath && target === rawTarget) return
      if (pageHostState.path && target !== 'pages/404/404') clearLingyunPageHost()
      this.currentPath = rawTarget
      if (openLingyunHostedPage(next, rawTarget)) return
      const highlight = target === 'pages/404/404' ? rawTarget : target
      this.currentPath = highlight
      setLingyunPageNavIntent(highlight)
      this._expectPath = target
      this.pullRoute()
      uni.redirectTo({
        url: next,
        animationType: 'none',
        animationDuration: 0,
        fail: () => {
          uni.navigateTo({
            url: next,
            animationType: 'none',
            animationDuration: 0,
            fail: () => {
              clearLingyunPageNavIntent()
              this._expectPath = ''
              this.syncRoute()
            },
          })
        },
      })
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
  padding-bottom: 24px;
  box-sizing: border-box;
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
  min-height: 44px;
  margin: 0 8px;
  padding: 0 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 12px;
}

.lingyun-page-nav__item--selected {
  background-color: rgba(120, 120, 128, 0.16);
}

.lingyun-page-nav.theme-dark .lingyun-page-nav__item--selected,
.theme-dark .lingyun-page-nav__item--selected {
  background-color: rgba(120, 120, 128, 0.32);
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
}

.lingyun-page-nav__item--selected .lingyun-page-nav__label {
  font-weight: 600;
}
</style>
