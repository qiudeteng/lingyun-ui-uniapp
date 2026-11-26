<template>
  <view
    class="lingyun-page-nav"
    :class="[
      themeRootClass,
      {
        'lingyun-page-nav--rail': railMode,
        'lingyun-page-nav--inline': inlineMenuVisible,
      },
    ]"
  >
    <!-- 窄栏通高背景层：实底 + 固定 tint，不随滚动变化 -->
    <view v-if="railMode" class="lingyun-page-nav__rail-panel" />
    <!-- 二级菜单打开时只遮住导航右侧，左侧其它 Tab 仍可直接点击切换 -->
    <!-- #ifdef MP-WEIXIN -->
    <root-portal>
      <view
        v-if="childMenuKey && !inlineMode"
        class="lingyun-page-nav__submenu-mask"
        :style="{ left: railMode ? '84px' : '220px' }"
        @click="closeChildMenu"
      />
    </root-portal>
    <!-- #endif -->
    <!-- #ifndef MP-WEIXIN -->
    <view
      v-if="childMenuKey && !inlineMode"
      class="lingyun-page-nav__submenu-mask"
      :style="{ left: railMode ? '84px' : '220px' }"
      @click="closeChildMenu"
    />
    <!-- #endif -->
    <view class="lingyun-page-nav__rail-col">
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
              :instant-close="instantMenuKey === item.key"
              :actions="childMenuActions(item)"
              :mask="false"
              :trigger-block="true"
              @update:show="onChildMenuShow(item, $event)"
              @select="onChildMenuSelect(item, $event)"
            >
              <template #trigger>
                <view
                  :id="navItemId(item.url)"
                  class="lingyun-page-nav__item"
                  :class="{ 'lingyun-page-nav__item--selected': isRailItemCurrent(item) }"
                  hover-class="lingyun-page-nav__item--hover"
                  :hover-start-time="20"
                  :hover-stay-time="70"
                >
                  <image
                    v-if="item.iconSrc"
                    class="lingyun-page-nav__glyph"
                    :src="
                      isRailItemCurrent(item) && item.activeIconSrc
                        ? item.activeIconSrc
                        : item.iconSrc
                    "
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

    <!-- PC 三栏：窄栏右侧常驻二级 / 三级菜单列，点击一级 Tab 直接换列，不再弹出 menu -->
    <view v-if="inlineMenuVisible" class="lingyun-page-nav__inline-col">
      <view class="lingyun-page-nav__inline-head">
        <text class="lingyun-page-nav__inline-title">{{ inlineMenuTitle }}</text>
      </view>
      <scroll-view
        :key="(inlineMenuItem && inlineMenuItem.key) || inlineMenuTitle"
        class="lingyun-page-nav__inline-scroll"
        :scroll-y="navScrollY"
        :show-scrollbar="false"
      >
        <view class="lingyun-page-nav__inline-body">
          <template
            v-for="(child, childIndex) in inlineMenuChildren"
            :key="child.key + '-' + childIndex"
          >
            <text
              v-if="child.kind === 'title'"
              class="lingyun-page-nav__inline-heading"
            >{{ child.title }}</text>
            <view
              v-else
              class="lingyun-page-nav__inline-item"
              :class="{
                'lingyun-page-nav__inline-item--selected': isChildCurrent(child),
                'lingyun-page-nav__inline-item--plain': !child.icon && !child.iconSrc,
              }"
              hover-class="lingyun-page-nav__inline-item--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              @click="onInlineChildTap(child)"
            >
              <image
                v-if="child.iconSrc"
                class="lingyun-page-nav__glyph"
                :src="
                  isChildCurrent(child) && child.activeIconSrc
                    ? child.activeIconSrc
                    : child.iconSrc
                "
                mode="aspectFit"
              />
              <lingyun-icon
                v-else-if="child.icon"
                :type="child.icon"
                :size="20"
                color="var(--lingyun-label, #000)"
              />
              <text class="lingyun-page-nav__inline-label">{{ child.title }}</text>
              <view v-if="hasItemBadge(child)" class="lingyun-page-nav__badge">
                <lingyun-badge
                  :text="itemBadgeText(child)"
                  :color="itemBadgeColor(child)"
                  :dot="itemBadgeDot(child)"
                  :max="itemBadgeMax(child)"
                />
              </view>
            </view>
          </template>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { inject, type PropType } from 'vue'
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
  lingyunPageNavInline,
  lingyunPageNavRail,
  normalizeLingyunPagePath,
  openLingyunHostedPage,
  openLingyunTabPage,
  resolveLingyunPageUrl,
  selectLingyunPageNavStore,
  setLingyunPageNavInlineMenu,
  setLingyunPageNavIntent,
  setLingyunPageNavScrollTop,
  useLingyunPageNavIntent,
  type LingyunPageNavChild,
  type LingyunPageNavItem,
  type LingyunPageNavSection,
} from '../../utils/pageNavAdapter'
import {
  buildLingyunPageTabWorkspaceUrl,
  buildLingyunPageTabSections,
  findLingyunPageTab,
  getLingyunPageConfig,
  getLingyunWorkspaceTabKey,
  isLingyunWorkspacePath,
  setLingyunWorkspaceTabKey,
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
defineOptions({
  name: 'LingyunPageNav',
})

const props = defineProps({
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
})

const injectedPageScrollLocked = inject(LINGYUN_APP_PAGE_SCROLL_LOCKED, null)
const pageScrollLocked = injectedPageScrollLocked ?? ref(false)

const statusBarPx = ref(0)
const barHeightPx = ref(LINGYUN_TOOLBAR_BAR_DESIGN_PX)
const padTopPx = ref(0)
const padBottomPx = ref(0)
const currentPath = ref(getLingyunPageNavIntent())
const navScrollTop = ref(getLingyunPageNavScrollTop())
const avatarFailed = ref(false)
/** 选中项滑动胶囊 */
const indicatorTop = ref(0)
const indicatorHeight = ref(0)
const indicatorVisible = ref(false)
const indicatorReady = ref(false)
/** 窄栏点击二级菜单 */
const childMenuKey = ref('')
/** PC 三栏：右侧内联菜单列当前展示的一级 Tab key */
const inlineMenuKey = ref('')
/** 切换到另一个二级菜单时，让旧菜单立即关闭，避免两个面板重叠 */
const instantMenuKey = ref('')
const _instantMenuTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _onHashChange = ref<(() => void) | null>(null)
const _expectPath = ref('')
const _routeSeen = ref('')
const _routeTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _navScrollSettled = ref(false)
const _navMounted = ref(false)

const instance = getCurrentInstance()

function isNavCurrent(url: string) {
  const selected = getLingyunHostedPath() || currentPath.value
  return normalizeLingyunPagePath(url) === selected
}
function isNavItemCurrent(item: LingyunPageNavItem) {
  if (isNavCurrent(item.url)) return true
  const selected = normalizeLingyunPagePath(getLingyunHostedPath() || currentPath.value)
  if (isLingyunWorkspacePath(selected)) {
    return !!item.key && item.key === getLingyunWorkspaceTabKey()
  }
  const matches = Array.isArray(item.match) ? item.match : item.match ? [item.match] : []
  return matches.some((match) => normalizeLingyunPagePath(match) === selected)
}
function isChildCurrent(child: LingyunPageNavChild): boolean {
  if (!child.url) return false
  const selected = normalizeLingyunPagePath(getLingyunHostedPath() || currentPath.value)
  if (normalizeLingyunPagePath(child.url) === selected) return true
  const matches = Array.isArray(child.match)
    ? child.match
    : child.match
      ? [child.match]
      : []
  return matches.some((match) => normalizeLingyunPagePath(match) === selected)
}
function hasItemBadge(item: LingyunPageNavItem | LingyunPageNavChild): boolean {
  const badge = item.badge
  return badge !== undefined && badge !== null && badge !== false && badge !== ''
}
function itemBadgeText(item: LingyunPageNavItem | LingyunPageNavChild): string | number {
  const badge = item.badge
  if (badge && typeof badge === 'object') {
    return badge.text != null ? badge.text : ''
  }
  return typeof badge === 'boolean' ? '' : (badge ?? '')
}
function itemBadgeColor(item: LingyunPageNavItem | LingyunPageNavChild): string | undefined {
  const badge = item.badge
  return badge && typeof badge === 'object' ? badge.color : undefined
}
function itemBadgeDot(item: LingyunPageNavItem | LingyunPageNavChild): boolean {
  const badge = item.badge
  return badge === true || (!!badge && typeof badge === 'object' && !!badge.dot)
}
function itemBadgeMax(item: LingyunPageNavItem | LingyunPageNavChild): number | string | undefined {
  const badge = item.badge
  return badge && typeof badge === 'object' ? badge.max : undefined
}

const navScrollY = computed((): boolean => {
  return !pageScrollLocked.value
})
/** 未登录时「首页」进组件演示，登录后仍进业务首页。 */
const navHome = computed((): string => {
  return getLingyunPageNavHome(isLingyunPageNavLoggedIn())
})
const indicatorStyle = computed(() => {
  return {
    top: `${indicatorTop.value}px`,
    height: `${indicatorHeight.value}px`,
  }
})
const themeRootClass = computed(() => {
  try {
    return useLingyunTheme().rootClass
  } catch {
    return 'theme-light'
  }
})
/** 由 lingyun-app-page 统一决定：PC + 全局 tabs 时窄栏 */
const railMode = computed((): boolean => {
  return lingyunPageNavRail.value
})
/** PC 宽屏：窄栏右侧常驻二级 / 三级菜单列 */
const inlineMode = computed((): boolean => {
  return lingyunPageNavInline.value
})
const profile = computed(() => {
  return getLingyunPageNavProfile()
})
/**
 * 小程序父级只要写了 slot="avatar"，子组件 $slots.avatar 就恒为真，
 * 写在 slot 默认内容里的头像和名称不会渲染。是否改用插槽只看页面有没有真的传入。
 */
const useAvatarSlot = computed((): boolean => {
  return !!profile.value.slotAvatar
})
const useNameSlot = computed((): boolean => {
  return !!profile.value.slotName
})
const useSubtitleSlot = computed((): boolean => {
  return !!profile.value.slotSubtitle
})
const profileName = computed((): string => {
  return props.name || profile.value.name || LINGYUN_PAGE_NAV_TITLE
})
const profileSubtitle = computed((): string => {
  if (props.subtitle) return props.subtitle
  if (profile.value.subtitle) return profile.value.subtitle
  const customName = !!(props.name || profile.value.name || useNameSlot.value)
  return customName ? '' : LINGYUN_PAGE_NAV_SUBTITLE
})
const profileAvatar = computed((): string => {
  return props.avatar || profile.value.avatar || ''
})
const avatarInitial = computed((): string => {
  const name = (profileName.value || '').trim()
  return name ? name.slice(0, 1) : ''
})
const railBrand = computed((): string => {
  const name = (profileName.value || '').trim()
  return name ? name.slice(0, 1) : '凌'
})
const showStorePicker = computed((): boolean => {
  return getLingyunPageNavStoreOptions().length > 0 || !!getLingyunPageNavStoreName()
})
const avatarImgStyle = computed((): Record<string, string> => {
  const size = showStorePicker.value ? '52px' : '36px'
  return { width: size, height: size }
})
const storeLabel = computed((): string => {
  return getLingyunPageNavStoreName() || '请选择门店'
})
const storeRange = computed((): { store_id: string | number; store_name: string }[] => {
  return getLingyunPageNavStoreOptions()
})
const storeIndex = computed((): number => {
  const storeId = getLingyunPageNavStoreId()
  const idx = storeRange.value.findIndex(
    (item) => storeId != null && String(item.store_id) === String(storeId),
  )
  return idx < 0 ? 0 : idx
})
const showAvatar = computed((): boolean => {
  return !!(profileAvatar.value || useAvatarSlot.value)
})
const showName = computed((): boolean => {
  return !!(profileName.value || useNameSlot.value)
})
const showSubtitle = computed((): boolean => {
  return !!(profileSubtitle.value || useSubtitleSlot.value)
})
const showProfile = computed((): boolean => {
  return showAvatar.value || showName.value || showSubtitle.value
})
const pageNavSections = computed((): LingyunPageNavSection[] => {
  if (Array.isArray(props.sections)) return props.sections
  const config = getLingyunPageConfig()
  if (config.tabs && config.tabs.length) {
    return buildLingyunPageTabSections(
      config.tabs,
      config.sidebarTitle || '',
      config.workspaceUrl || '',
    )
  }
  return getLingyunPageNavSections()
})
/** 全局一级导航已包含首页时，不再渲染内置「首页」行 */
const showHome = computed((): boolean => {
  if (Array.isArray(props.sections)) return true
  const config = getLingyunPageConfig()
  return !(config.tabs && config.tabs.length)
})
const windowControls = computed(() => {
  return !!getLingyunNavLayout(LINGYUN_TOOLBAR_BAR_DESIGN_PX).windowControls
})
const navHeadStyle = computed(() => {
  /* 宿主已按状态栏留安全区时这里不再重复；窄栏内部再留 8px */
  const railPad = railMode.value ? 8 : 0
  const status = props.hostSafeTop >= 0 ? 0 : statusBarPx.value
  return { paddingTop: `${status + railPad}px` }
})
const inlineNavItems = computed((): LingyunPageNavItem[] => {
  const items: LingyunPageNavItem[] = []
  ;(pageNavSections.value || []).forEach((section) => {
    items.push(...(section.items || []))
  })
  return items
})
/** 内联菜单列当前展示的一级 Tab；用户点选优先，否则跟随当前路由 */
const inlineMenuItem = computed((): LingyunPageNavItem | null => {
  const items = inlineNavItems.value
  if (!items.length) return null
  const picked = items.find((item) => !!item.key && item.key === inlineMenuKey.value)
  if (picked) return picked
  const current = items.find((item) => isNavItemCurrent(item))
  return current || items[0]
})
const inlineMenuTitle = computed((): string => {
  return inlineMenuItem.value ? inlineMenuItem.value.title : ''
})
const inlineMenuChildren = computed((): LingyunPageNavChild[] => {
  const item = inlineMenuItem.value
  return item && Array.isArray(item.children) ? item.children : []
})
/** 当前一级 Tab 没有二级 / 三级菜单时收起菜单列，不占内容区宽度 */
const inlineMenuVisible = computed((): boolean => {
  return inlineMode.value && inlineMenuChildren.value.length > 0
})
const navBarStyle = computed(() => {
  const h = barHeightPx.value || LINGYUN_TOOLBAR_BAR_DESIGN_PX
  return {
    minHeight: `${h}px`,
  }
})

function onAvatarError(): void {
  avatarFailed.value = true
}
function onStorePick(payload: { value?: number | string | string[] }): void {
  const idx = Number(payload?.value)
  if (!Number.isFinite(idx) || idx < 0) return
  const item = storeRange.value[idx]
  if (item) selectLingyunPageNavStore(item.store_id)
}
function syncLayout(): void {
  const layout = getLingyunNavLayout(LINGYUN_TOOLBAR_BAR_DESIGN_PX)
  statusBarPx.value = layout.statusBarHeight || 0
  barHeightPx.value = layout.barHeight
  padTopPx.value = layout.padTop
  padBottomPx.value = layout.padBottom
}
function readRoute(): string {
  try {
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
    const cur = pages[pages.length - 1] as NavPage | undefined
    const raw = (cur && (cur.route || cur.$page?.fullPath || cur.$page?.route)) || ''
    return normalizeLingyunPagePath(raw)
  } catch {
    return ''
  }
}
/** H5 地址栏。`#/` 是首页。hashchange 时路由栈可能还停在 404。 */
function hashRoute(): string {
  // #ifdef H5
  if (typeof window === 'undefined') return ''
  const raw = (window.location.hash || '').replace(/^#/, '').split('?')[0]
  if (!raw || raw === '/') return normalizeLingyunPagePath(navHome.value)
  return normalizeLingyunPagePath(raw)
  // #endif
  // #ifndef H5
  return ''
  // #endif
}
function syncRoute(): void {
  const next = readRoute()
  const intent = getLingyunPageNavIntent()
  const highlight = routeHighlight(next)
  if (intent && highlight !== intent) {
    currentPath.value = intent
    return
  }
  if (intent && highlight === intent) clearLingyunPageNavIntent()
  if (highlight) currentPath.value = highlight
}
/** 等到 getCurrentPages 跟上再对齐。对不上时保持点中的那一项，不要写回上一页。 */
function pullRoute(left = 8): void {
  if (_routeTimer.value != null) clearTimeout(_routeTimer.value)
  const now = readRoute()
  const expect = _expectPath.value
  if (expect) {
    if (now === expect) {
      currentPath.value = routeHighlight(now)
      _expectPath.value = ''
      clearLingyunPageNavIntent()
      return
    }
  } else if (now && now !== _routeSeen.value) {
    const highlight = routeHighlight(now)
    if (now === 'pages/404/404' && (!highlight || highlight === 'pages/404/404')) {
      if (left <= 0) {
        _expectPath.value = ''
        return
      }
      _routeTimer.value = setTimeout(() => pullRoute(left - 1), 16)
      return
    }
    currentPath.value = highlight
    return
  }
  if (left <= 0) {
    _expectPath.value = ''
    return
  }
  _routeTimer.value = setTimeout(() => pullRoute(left - 1), 16)
}
/**
 * 404 对不上菜单项。已有点中的菜单路径就留着；刷新进 404 时才用地址里的 from。
 */
function routeHighlight(route: string): string {
  const hostedPath = getLingyunHostedPath()
  if (hostedPath && route === 'pages/404/404') return hostedPath
  if (route === 'pages/404/404') {
    if (currentPath.value && currentPath.value !== 'pages/404/404') return currentPath.value
    const from = missedMenuPath()
    if (from) return from
  }
  if (hostedPath && !route) return hostedPath
  return route
}
function missedMenuPath(): string {
  let raw = ''
  try {
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
    const cur = pages[pages.length - 1] as NavPage | undefined
    raw = cur?.options?.from || cur?.$page?.options?.from || ''
    if (!raw && cur?.$page?.fullPath) raw = queryValue(cur.$page.fullPath, 'from')
  } catch {
    raw = ''
  }
  // #ifdef H5
  if (!raw && typeof window !== 'undefined') raw = queryValue(window.location.hash || '', 'from')
  // #endif
  if (!raw) return ''
  return normalizeLingyunPagePath(safeDecode(raw))
}
function queryValue(url: string, key: string): string {
  const query = String(url || '').split('?')[1] || ''
  const part = query.split('&').find((item) => item.startsWith(`${key}=`))
  return part ? part.slice(key.length + 1) : ''
}
function safeDecode(value: string): string {
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
}
function navItemId(url: string): string {
  const path = normalizeLingyunPagePath(url)
  return `ly-nav-${path.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}
function selectedNavUrl(): string {
  if (showHome.value && isNavCurrent(navHome.value)) return navHome.value
  for (const section of pageNavSections.value || []) {
    for (const item of section.items || []) {
      if (isRailItemCurrent(item)) return item.url
    }
  }
  return ''
}
/** 路由变化时让内联菜单列跟回当前一级 Tab */
function syncInlineSelection(): void {
  if (!inlineMode.value) {
    inlineMenuKey.value = ''
    return
  }
  const items = inlineNavItems.value
  const current =
    items.find((item) => isNavItemCurrent(item)) || items[0]
  inlineMenuKey.value = current && current.key ? current.key : ''
}
/** 选中胶囊：首次落位不动画，之后上下滑动 */
function syncIndicator(animate = true, retry = 0): void {
  if (!_navMounted.value) return
  const url = selectedNavUrl()
  if (!url) {
    indicatorVisible.value = false
    indicatorReady.value = false
    return
  }
  nextTick(() => {
    uni
      .createSelectorQuery()
      .in(instance?.proxy as never)
      .select('.lingyun-page-nav__body')
      .boundingClientRect()
      .select(`#${navItemId(url)}`)
      .boundingClientRect()
      .exec((res) => {
        const body = res && res[0]
        const item = res && res[1]
        if (!body || !item || !item.height) {
          /* H5 宿主初始 display:none，等侧栏显示后再测量 */
          if (retry < 10) {
            setTimeout(() => syncIndicator(animate, retry + 1), 50)
          }
          return
        }
        indicatorTop.value = item.top - body.top
        indicatorHeight.value = item.height
        if (!indicatorVisible.value) {
          indicatorVisible.value = true
          indicatorReady.value = false
          nextTick(() => {
            setTimeout(() => {
              indicatorReady.value = true
            }, 20)
          })
          return
        }
        if (!animate) {
          indicatorReady.value = false
          nextTick(() => {
            setTimeout(() => {
              indicatorReady.value = true
            }, 20)
          })
        }
      })
  })
}
/** 三栏模式下选中态跟随内联列；其余模式仍按路由 */
function isRailItemCurrent(item: LingyunPageNavItem): boolean {
  if (inlineMode.value) {
    const active = inlineMenuItem.value
    return !!active && !!item.key && active.key === item.key
  }
  return isNavItemCurrent(item)
}
function onNavScroll(event: { detail?: { scrollTop?: number } }): void {
  const y = Number(event && event.detail && event.detail.scrollTop)
  if (!Number.isFinite(y) || y < 0) return
  const saved = getLingyunPageNavScrollTop()
  // 重建时 scroll-view 会先抛一次 0，不能把记住的位置清掉
  if (saved > 40 && y < 1 && !_navScrollSettled.value) return
  _navScrollSettled.value = true
  setLingyunPageNavScrollTop(y)
}
function replacePage(url: string): void {
  uni.redirectTo({
    url,
    fail: () => {
      uni.navigateTo({
        url,
        fail: () => {
          clearLingyunPageNavIntent()
          _expectPath.value = ''
          syncRoute()
        },
      })
    },
  })
}
function childMenuActions(item: LingyunPageNavItem) {
  return (item.children || []).map((child) => ({
    key: child.key,
    label: child.title,
    icon: child.icon,
    iconSrc: child.iconSrc,
    activeIconSrc: child.activeIconSrc,
    kind: child.kind,
    selected: isChildCurrent(child),
  }))
}
function onInlineChildTap(child: LingyunPageNavChild) {
  if (!child || child.kind === 'title' || !child.url) return
  onNavTap(child.url)
}
function onChildMenuShow(item: LingyunPageNavItem, show: boolean) {
  if (!show && childMenuKey.value === item.key) childMenuKey.value = ''
}
function closeChildMenu() {
  childMenuKey.value = ''
}
function onChildMenuSelect(item: LingyunPageNavItem, payload: { key?: string }) {
  const child = (item.children || []).find((entry) => entry.key === payload?.key)
  childMenuKey.value = ''
  if (!child || child.kind === 'title' || !child.url) return
  onNavTap(child.url)
}
function onNavItemTap(item: LingyunPageNavItem) {
  const previous = childMenuKey.value
  const wasOpen = previous === item.key
  childMenuKey.value = ''
  /* PC 三栏：一级 Tab 只切换右侧菜单列，不再弹出 menu */
  if (inlineMode.value) {
    inlineMenuKey.value = item.key || ''
    if (item.children && item.children.length) return
    onNavTap(item.url)
    return
  }
  /* 宽屏左侧（Web 与小程序一致）：有二级菜单点击只弹 menu，再点关闭 */
  if (railMode.value && item.children && item.children.length) {
    if (wasOpen) return
    /* 从一个已打开的菜单切到另一个：旧菜单立即关闭，避免缩放进场重叠 */
    if (previous) {
      instantMenuKey.value = previous
      if (_instantMenuTimer.value != null) clearTimeout(_instantMenuTimer.value)
      _instantMenuTimer.value = setTimeout(() => {
        if (instantMenuKey.value === previous) instantMenuKey.value = ''
        _instantMenuTimer.value = null
      }, 320)
    }
    childMenuKey.value = item.key || ''
    return
  }
  onNavTap(item.url)
}
function onNavTap(url: string) {
  const rawTarget = normalizeLingyunPagePath(url)
  if (!rawTarget) return
  const fromPath = normalizeLingyunPagePath(
    getLingyunHostedPath() || currentPath.value,
  )
  beginLingyunNavTransition(fromPath, rawTarget)
  if (openLingyunHostedPage(url, rawTarget)) {
    currentPath.value = rawTarget
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
  if (!hostedPath && target === currentPath.value && target === rawTarget) {
    clearLingyunNavTransition()
    return
  }
  if (openLingyunHostedPage(next, rawTarget)) {
    currentPath.value = rawTarget
    return
  }
  if (hostedPath) clearLingyunPageHost()
  const highlight = target === 'pages/404/404' ? rawTarget : target
  currentPath.value = highlight
  setLingyunPageNavIntent(highlight)
  _expectPath.value = target
  pullRoute()
  beginLingyunNavTransition(fromPath, target)
  replacePage(next)
}

const intent = useLingyunPageNavIntent()
watch(intent, (value) => {
  if (!value) return
  currentPath.value = value
  _routeSeen.value = value
})
watch(useLingyunWorkspaceTabKey(), () => {
  syncIndicator(false)
})

watch(profileAvatar, () => {
  avatarFailed.value = false
})
watch(railMode, () => {
  nextTick(() => {
    setTimeout(() => syncIndicator(false), 30)
  })
}, { immediate: true })
watch(inlineMode, () => {
  nextTick(() => {
    syncInlineSelection()
  })
}, { immediate: true })
watch(inlineMenuVisible, (value: boolean) => {
  setLingyunPageNavInlineMenu(value)
}, { immediate: true })
watch(currentPath, () => {
  syncInlineSelection()
  syncIndicator(true)
})
watch(inlineMenuKey, () => {
  syncIndicator(true)
})
watch(pageNavSections, () => {
  syncIndicator(false)
})
watch(navHome, () => {
  syncIndicator(false)
})
watch(showHome, () => {
  syncIndicator(false)
})

onShow(() => {
  syncLayout()
  syncRoute()
})

syncLayout()
syncRoute()

onMounted(() => {
  _navMounted.value = true
  syncLayout()
  syncRoute()
  // 刷新不会走 hashchange。侧栏往往比路由更早挂上，404 的 from 要等路由就绪再写进选中项。
  _routeSeen.value = ''
  pullRoute(40)
  nextTick(() => {
    setTimeout(() => syncIndicator(false), 30)
  })
  // #ifdef H5
  const onHashChange = () => {
    if (_routeTimer.value != null) clearTimeout(_routeTimer.value)
    _expectPath.value = ''
    const hashPath = hashRoute()
    if (!hashPath) return
    if (hashPath === 'pages/404/404') {
      const from = missedMenuPath()
      if (from) {
        currentPath.value = from
        _routeSeen.value = from
      }
      return
    }
    /*
     * 一级 Tab 宿主用 ?tab= 记录页内内容。子页 hashchange 不能清宿主，
     * 否则从子页返回时工作台内容会丢；只有回到首页 / 目录时才清空。
     */
    const hash = (typeof window !== 'undefined' && window.location.hash) || ''
    const query = hash.split('?')[1] || ''
    const tabPart = query.split('&').find((item) => item.startsWith('tab='))
    let tabKey = tabPart ? tabPart.slice('tab='.length) : ''
    try {
      tabKey = tabKey ? decodeURIComponent(tabKey) : ''
    } catch {
      /* 保留原始值 */
    }
    if (hashPath === 'pages/index/index' && tabKey) {
      const tab = findLingyunPageTab(tabKey)
      if (tab) {
        setLingyunWorkspaceTabKey(tab.key)
        const target =
          Array.isArray(tab.children) && tab.children.length
            ? buildLingyunPageTabWorkspaceUrl(tab)
            : tab.url
        if (target) openLingyunTabPage(target)
      }
    } else if (
      hashPath === 'pages/index/index' ||
      hashPath === 'pages/demo/demo'
    ) {
      clearLingyunPageHost()
    }
    clearLingyunPageNavIntent()
    currentPath.value = hashPath
    _routeSeen.value = hashPath
  }
  _onHashChange.value = onHashChange
  if (typeof window !== 'undefined') window.addEventListener('hashchange', onHashChange)
  // #endif
  // #ifndef H5
  const saved = getLingyunPageNavScrollTop()
  if (saved > 0) {
    // 只改一个几乎看不见的差值，让小程序应用初始 scroll-top，且不会先跳到顶部
    nextTick(() => {
      navScrollTop.value = saved + 0.01
    })
  }
  // #endif
})

onBeforeUnmount(() => {
  _navMounted.value = false
  if (_routeTimer.value != null) clearTimeout(_routeTimer.value)
  if (_instantMenuTimer.value != null) clearTimeout(_instantMenuTimer.value)
  _instantMenuTimer.value = null
  // #ifdef H5
  if (typeof window !== 'undefined' && _onHashChange.value) {
    window.removeEventListener('hashchange', _onHashChange.value)
  }
  // #endif
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
  /* 右侧与内容区底色一致：视觉上不留边线，白色内容列出现时由白色形成边界 */
  border-right: 1px solid var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
}

/* 二级菜单遮罩：从导航右边缘开始，不挡左侧 Tab；层级在顶栏之上、菜单面板之下 */
.lingyun-page-nav__submenu-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: var(--lingyun-page-nav-width, 220px);
  z-index: 105;
}

.lingyun-page-nav--rail .lingyun-page-nav__submenu-mask {
  left: var(--lingyun-page-nav-width, 84px);
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

/* 全局 tabs 驱动的窄侧栏：图标在上、文字在下；实底 + 顶栏同款玻璃 tint */
.lingyun-page-nav--rail {
  position: relative;
  /* 与内容卡片同色，顶栏玻璃压在卡片上时两边亮度一致 */
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  /* 右边线取内容区底色：白色窄栏与 grouped 内容之间的色差本身就是边界，不再画可见线 */
  border-right: 1px solid var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
}

.lingyun-page-nav--rail .lingyun-page-nav__rail-panel {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: 0;
  /* 固定材质：实底之上叠一层顶栏满玻璃的 tint，不随滚动变化 */
  background-color: rgba(255, 255, 255, 0.42);
}

.lingyun-page-nav--rail.theme-dark .lingyun-page-nav__rail-panel {
  background-color: rgba(255, 255, 255, 0.14);
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

/* 窄栏列：包住 head + scroll，普通模式和窄栏模式都占满 */
.lingyun-page-nav__rail-col {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* PC 三栏：84 窄栏 + 220 内联二级 / 三级菜单列 */
.lingyun-page-nav--inline {
  flex-direction: row;
  /* 菜单列右边线与内容区底色完全一致：没有白色新列时看不出线，白色内容列自己形成边界 */
  border-right: 1px solid var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
}

.lingyun-page-nav--inline .lingyun-page-nav__rail-col {
  flex: 0 0 84px;
  width: 84px;
  /* 与右侧列底色一致：不随菜单列有无改变颜色，白色列之间的 1px 缝隙由底色本身呈现 */
  border-right: 1px solid var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
}

.lingyun-page-nav--inline .lingyun-page-nav__rail-panel {
  right: auto;
  width: 84px;
}

.lingyun-page-nav__inline-col {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  /* 左边线由窄栏的右边线提供，避免三栏时双线 */
  border-left: 0;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}

.lingyun-page-nav__inline-head {
  flex-shrink: 0;
  padding: calc(var(--lingyun-page-nav-safe-top, 0px) + 20px) 20px 8px;
  box-sizing: border-box;
}

.lingyun-page-nav__inline-title {
  display: block;
  font-size: 20px;
  font-weight: 600;
  line-height: 26px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-page-nav__inline-scroll {
  flex: 1;
  height: 0;
  min-height: 0;
  width: 100%;
}

.lingyun-page-nav__inline-body {
  padding: 2px 10px 24px;
  box-sizing: border-box;
}

.lingyun-page-nav__inline-heading {
  display: block;
  padding: 14px 10px 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-page-nav__inline-item {
  min-height: 40px;
  padding: 0 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 10px;
}

.lingyun-page-nav__inline-item--hover {
  background-color: rgba(120, 120, 128, 0.1);
}

.lingyun-page-nav__inline-item--selected {
  background-color: rgba(120, 120, 128, 0.16);
}

.theme-dark .lingyun-page-nav__inline-item--selected {
  background-color: rgba(120, 120, 128, 0.32);
}

.lingyun-page-nav__inline-label {
  flex: 1;
  min-width: 0;
  margin-left: 10px;
  font-size: 15px;
  font-weight: 400;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-page-nav__inline-item--plain .lingyun-page-nav__inline-label {
  margin-left: 0;
}

.lingyun-page-nav__inline-item--selected .lingyun-page-nav__inline-label {
  font-weight: 600;
}

.lingyun-page-nav__inline-item .lingyun-page-nav__badge {
  margin-left: 6px;
}
</style>
