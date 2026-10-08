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
          <view v-if="showAvatar" class="lingyun-page-nav__avatar">
            <slot name="avatar">
              <image
                v-if="profileAvatar && !profile.slotAvatar"
                class="lingyun-page-nav__avatar-img"
                :src="profileAvatar"
                mode="aspectFill"
              />
            </slot>
            <!-- #ifdef H5 -->
            <view v-if="profile.slotAvatar" id="ly-nav-slot-avatar" class="lingyun-page-nav__slot" />
            <!-- #endif -->
          </view>
          <view class="lingyun-page-nav__meta">
            <view v-if="showName" class="lingyun-page-nav__name">
              <slot name="name">
                <text v-if="profileName && !profile.slotName" class="lingyun-page-nav__name-text">{{ profileName }}</text>
              </slot>
              <!-- #ifdef H5 -->
              <view v-if="profile.slotName" id="ly-nav-slot-name" class="lingyun-page-nav__slot" />
              <!-- #endif -->
            </view>
            <view
              v-if="showSubtitle"
              class="lingyun-page-nav__subtitle"
              :class="{ 'lingyun-page-nav__subtitle--hang': showName }"
            >
              <slot name="subtitle">
                <text v-if="profileSubtitle && !profile.slotSubtitle" class="lingyun-page-nav__subtitle-text">{{ profileSubtitle }}</text>
              </slot>
              <!-- #ifdef H5 -->
              <view v-if="profile.slotSubtitle" id="ly-nav-slot-subtitle" class="lingyun-page-nav__slot" />
              <!-- #endif -->
            </view>
          </view>
        </view>
        <text v-else class="lingyun-page-nav__title">凌云UI</text>
      </view>
    </view>
    <scroll-view
      class="lingyun-page-nav__scroll"
      scroll-y
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
          v-for="section in pageNavSections"
          :key="section.title"
          class="lingyun-page-nav__section"
        >
          <text class="lingyun-page-nav__section-title">{{ section.title }}</text>
          <view
            v-for="item in section.items"
            :key="item.url"
            class="lingyun-page-nav__item"
            :class="{ 'lingyun-page-nav__item--selected': isNavCurrent(item.url) }"
            hover-class="lingyun-page-nav__item--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="onNavTap(item.url)"
          >
            <lingyun-icon
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
import { defineComponent, getCurrentInstance, type PropType } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
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
  setLingyunPageNavIntent,
  setLingyunPageNavScrollTop,
  type LingyunPageNavSection,
} from '@/router/pageNav'

type NavPage = {
  route?: string
  $page?: { fullPath?: string; route?: string }
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
      _onHashChange: null as (() => void) | null,
      _expectPath: '',
      _routeSeen: '',
      _routeTimer: null as ReturnType<typeof setTimeout> | null,
      _navScrollSettled: false,
    }
  },
  setup() {
    const instance = getCurrentInstance()
    onShow(() => {
      const proxy = instance?.proxy as { syncRoute?: () => void } | null | undefined
      proxy?.syncRoute?.()
    })
    return {}
  },
  computed: {
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
    profileName(): string {
      return this.name || this.profile.name || LINGYUN_PAGE_NAV_TITLE
    },
    profileSubtitle(): string {
      if (this.subtitle) return this.subtitle
      if (this.profile.subtitle) return this.profile.subtitle
      const customName = !!(this.name || this.profile.name || this.profile.slotName || this.$slots.name)
      return customName ? '' : LINGYUN_PAGE_NAV_SUBTITLE
    },
    showAvatar(): boolean {
      return !!(this.profileAvatar || this.$slots.avatar || this.profile.slotAvatar)
    },
    showName(): boolean {
      return !!(this.profileName || this.$slots.name || this.profile.slotName)
    },
    showSubtitle(): boolean {
      return !!(this.profileSubtitle || this.$slots.subtitle || this.profile.slotSubtitle)
    },
    showProfile(): boolean {
      return this.showAvatar || this.showName || this.showSubtitle
    },
    navBarStyle() {
      const h = this.barHeightPx || LINGYUN_TOOLBAR_BAR_DESIGN_PX
      return {
        height: `${h}px`,
        paddingTop: `${this.padTopPx}px`,
        paddingBottom: `${this.padBottomPx}px`,
      }
    },
  },
  created() {
    this.syncLayout()
    this.syncRoute()
  },
  mounted() {
    this.syncLayout()
    this.syncRoute()
    // #ifdef H5
    this._onHashChange = () => {
      if (this._expectPath) return
      this._routeSeen = this.currentPath
      this.pullRoute()
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
    syncRoute() {
      const next = this.readRoute()
      const intent = getLingyunPageNavIntent()
      if (intent && next !== intent) {
        this.currentPath = intent
        return
      }
      if (intent && next === intent) clearLingyunPageNavIntent()
      if (next) this.currentPath = next
    },
    /** 等到 getCurrentPages 跟上再对齐。对不上时保持点中的那一项，不要写回上一页。 */
    pullRoute(left = 8) {
      clearTimeout(this._routeTimer ?? undefined)
      const now = this.readRoute()
      const expect = this._expectPath
      if (expect) {
        if (now === expect) {
          this.currentPath = now
          this._expectPath = ''
          clearLingyunPageNavIntent()
          return
        }
      } else if (now && now !== this._routeSeen) {
        this.currentPath = now
        return
      }
      if (left <= 0) {
        this._expectPath = ''
        return
      }
      this._routeTimer = setTimeout(() => this.pullRoute(left - 1), 16)
    },
    isNavCurrent(url: string) {
      return normalizeLingyunPagePath(url) === this.currentPath
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
      const target = normalizeLingyunPagePath(url)
      if (!target || target === this.currentPath) return
      setLingyunPageNavIntent(target)
      this._expectPath = target
      this.currentPath = target
      this.pullRoute()
      const next = url.charAt(0) === '/' ? url : `/${url}`
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
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 8px;
  box-sizing: border-box;
}

.lingyun-page-nav__bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  gap: 12px;
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
  width: 36px;
  height: 36px;
  border-radius: 18px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-page-nav__avatar-img {
  width: 36px;
  height: 36px;
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
  height: 28px;
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

.lingyun-page-nav__name-text,
.lingyun-page-nav__subtitle-text {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-page-nav__name-text {
  font-size: 22px;
  font-weight: 600;
  line-height: 28px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-page-nav__subtitle--hang {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
}

.lingyun-page-nav__subtitle-text {
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
