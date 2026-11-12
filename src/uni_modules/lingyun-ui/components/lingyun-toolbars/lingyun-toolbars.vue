<template>
  <view class="lingyun-toolbars" :class="rootClass" :style="rootStyle">
    <view
      class="lingyun-toolbars__chrome"
      :style="chromeStyle"
      aria-hidden="true"
    />

    <!-- 状态栏：与 uni-status-bar 相同，用 JS 真实高度，不用 CSS --status-bar-height -->
    <view
      v-if="safeArea"
      class="lingyun-toolbars__status"
      :style="statusStyle"
      aria-hidden="true"
    />

    <view v-if="showGrabberEffective" class="lingyun-toolbars__grabber" aria-hidden="true" />

    <view
      class="lingyun-toolbars__bar"
      :class="{ 'lingyun-toolbars__bar--search': searching }"
      :style="barStyle"
    >
      <view class="lingyun-toolbars__search" :style="searchLayerStyle">
        <view class="lingyun-toolbars__search-field">
          <lingyun-icon type="search" :size="17" color="secondary" />
          <input
            class="lingyun-toolbars__search-input"
            type="text"
            :value="searchValue"
            :focus="searchFocusReady"
            :disabled="!searching"
            :placeholder="searchPlaceholder"
            placeholder-class="lingyun-toolbars__search-ph"
            confirm-type="search"
            :adjust-position="false"
            :hold-keyboard="false"
            @input="onSearchInput"
            @confirm="onSearchConfirm"
          />
          <view
            v-if="searchValue"
            class="lingyun-toolbars__search-clear"
            hover-class="lingyun-toolbars__search-clear--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            role="button"
            aria-label="清空"
            @click.stop="onSearchClear"
          >
            <lingyun-icon type="clear" :size="17" color="secondary" />
          </view>
        </view>
      </view>

      <view class="lingyun-toolbars__bar-content">
        <view class="lingyun-toolbars__bar-left">
        <view class="lingyun-toolbars__leading">
        <view v-if="windowControls" class="lingyun-toolbars__windows" aria-hidden="true">
          <view class="lingyun-toolbars__window lingyun-toolbars__window--close" />
          <view class="lingyun-toolbars__window lingyun-toolbars__window--min" />
          <view class="lingyun-toolbars__window lingyun-toolbars__window--zoom" />
        </view>
        <view
          v-if="showBackEffective"
          class="lingyun-toolbars__action lingyun-toolbars__action--glass"
          hover-class="lingyun-toolbars__action--hover"
          :hover-start-time="20"
          :hover-stay-time="70"
          role="button"
          aria-label="Back"
          @click.stop="onBack"
        >
          <slot name="back">
            <lingyun-icon class="lingyun-toolbars__glyph" type="left" :size="28" color="label" />
          </slot>
        </view>
        <view
          v-else-if="showCloseEffective"
          class="lingyun-toolbars__action lingyun-toolbars__action--glass"
          hover-class="lingyun-toolbars__action--hover"
          :hover-start-time="20"
          :hover-stay-time="70"
          role="button"
          aria-label="Close"
          @click.stop="onClose"
        >
          <slot name="close">
            <lingyun-icon class="lingyun-toolbars__glyph" type="closeempty" :size="26" color="label" />
          </slot>
        </view>
        <slot name="leading" />
      </view>

      <view v-if="showInlineTitle" class="lingyun-toolbars__title-wrap" :class="titleWrapClass">
        <slot name="title">
          <text class="lingyun-toolbars__title">{{ title }}</text>
        </slot>
        <lingyun-picker
          v-if="pickerActive"
          :model-value="pickerIndex"
          :range="pickerOptions"
          range-key="label"
          :title="pickerTitle"
          :show-search="pickerSearchable"
          :search-placeholder="pickerSearchPlaceholder"
          :disabled="!pickerOptions.length"
          @change="onToolbarPickerChange"
        >
          <template #trigger>
            <view class="lingyun-toolbars__picker">
              <text class="lingyun-toolbars__picker-text">{{ pickerLabel }}</text>
              <lingyun-icon class="lingyun-toolbars__picker-mark" type="bottom" :size="10" color="secondary" />
            </view>
          </template>
        </lingyun-picker>
        <slot v-else-if="showInlineSubtitle" name="subtitle">
          <text class="lingyun-toolbars__subtitle">{{ subtitle }}</text>
        </slot>
      </view>

      <view
        class="lingyun-toolbars__trailing"
        :style="searchable ? undefined : { marginRight: `${rightActionGapPx}px` }"
        :class="{
          'lingyun-toolbars__trailing--menu-open': themeMenuMounted || trailingMenuMounted,
          'lingyun-toolbars__trailing--buttons-hidden': trailingButtonsHidden,
        }"
      >
        <view
          v-for="(group, groupIndex) in renderedGroups"
          :id="trailingGroupId(groupIndex)"
          :key="groupIndex"
          class="lingyun-toolbars__action-group"
          :style="groupIndex > 0 ? { marginLeft: `${gapPx}px` } : undefined"
          :class="{
            'lingyun-toolbars__action-group--single':
              group.length + (themeSwitchEnabled && groupIndex === 0 ? 1 : 0) === 1,
          }"
        >
          <lingyun-theme-action
            v-if="themeSwitchEnabled && groupIndex === 0"
            :grouped="true"
            :icon-size="28"
            :anchor="themeMenuAnchor"
            @menu-open="onThemeMenuOpen"
            @menu-closed="onThemeMenuClosed"
          />
          <view
            v-for="(button, buttonIndex) in group"
            :id="trailingButtonId(groupIndex, buttonIndex)"
            :key="button.key || buttonIndex"
            class="lingyun-toolbars__group-button"
            :class="{ 'lingyun-toolbars__group-button--disabled': button.disabled }"
            hover-class="lingyun-toolbars__group-button--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            role="button"
            :aria-label="button.label || button.key"
            @click.stop="onTrailingButton(button, groupIndex, buttonIndex)"
          >
            <lingyun-icon
              v-if="button.icon"
              :type="button.icon"
              :size="28"
              color="label"
            />
            <text v-else class="lingyun-toolbars__group-text">{{ button.label }}</text>
          </view>
        </view>
        <slot name="trailing" />
        <view
          v-if="showTrailing"
          class="lingyun-toolbars__action lingyun-toolbars__action--prominent"
          hover-class="lingyun-toolbars__action--hover"
          :hover-start-time="20"
          :hover-stay-time="70"
          role="button"
          aria-label="Share"
          @click.stop="onTrailing"
        >
          <!-- 分享：lingyun-icon upload（近似 square.and.arrow.up） -->
          <lingyun-icon class="lingyun-toolbars__glyph" type="upload" :size="26" color="white" />
        </view>
      </view>
      </view>
      <view
        v-if="searchable"
        :id="searchGroupId"
        class="lingyun-toolbars__action-group lingyun-toolbars__action-group--single lingyun-toolbars__search-group"
        :style="{
          marginLeft: `${gapPx}px`,
          marginRight: `${rightActionGapPx}px`,
        }"
        :class="{
          'lingyun-toolbars__search-group--active': searching,
          'lingyun-toolbars__search-group--hidden':
            trailingButtonsHidden || themeMenuMounted || trailingMenuMounted,
        }"
      >
        <view
          class="lingyun-toolbars__group-button"
          hover-class="lingyun-toolbars__group-button--hover"
          :hover-start-time="20"
          :hover-stay-time="70"
          role="button"
          :aria-label="searching ? '取消搜索' : '搜索'"
          @click.stop="onSearchAction"
        >
          <lingyun-icon :type="searching ? 'closeempty' : 'search'" :size="28" color="label" />
        </view>
      </view>
      </view>
    </view>

    <lingyun-popover
      v-if="hasTrailingMenu"
      v-model:show="trailingMenuOpen"
      class="lingyun-toolbars__menu-host"
      :anchor="trailingMenuAnchor"
      placement="bottom"
      :show-arrow="false"
      :width="250"
      variant="menu"
      mask-transparent
      :z-index="1200"
      @closed="onTrailingMenuClosed"
    >
      <slot
        name="trailing-menu"
        :button="trailingMenuButton"
        :index="trailingMenuIndex"
        :groupIndex="trailingMenuGroupIndex"
        :buttonIndex="trailingMenuButtonIndex"
        :close="closeTrailingMenu"
      />
    </lingyun-popover>

    <view v-if="showLargeTitle && !searching" class="lingyun-toolbars__large" :style="largeStyle">
      <slot name="title">
        <text class="lingyun-toolbars__large-title">{{ title }}</text>
      </slot>
      <lingyun-picker
        v-if="pickerActive"
        :model-value="pickerIndex"
        :range="pickerOptions"
        range-key="label"
        :title="pickerTitle"
        :show-search="pickerSearchable"
        :search-placeholder="pickerSearchPlaceholder"
        :disabled="!pickerOptions.length"
        @change="onToolbarPickerChange"
      >
        <template #trigger>
          <view class="lingyun-toolbars__picker lingyun-toolbars__picker--large">
            <text class="lingyun-toolbars__picker-text">{{ pickerLabel }}</text>
            <lingyun-icon class="lingyun-toolbars__picker-mark" type="bottom" :size="12" color="secondary" />
          </view>
        </template>
      </lingyun-picker>
      <slot v-else-if="showLargeSubtitle" name="subtitle">
        <text class="lingyun-toolbars__large-subtitle">{{ subtitle }}</text>
      </slot>
    </view>
    <view
      v-if="segments && segments.length"
      class="lingyun-toolbars__segments"
      :class="{ 'lingyun-toolbars__segments--tabs': segmentControl === 'tabs' }"
      :style="segmentsStyle"
    >
      <lingyun-tabs
        v-if="segmentControl === 'tabs'"
        class="lingyun-toolbars__tabs"
        :items="segmentTabItems"
        :model-value="String(segmentValue ?? '')"
        @update:model-value="onSegmentUpdate"
        @change="onTabsChange"
      />
      <lingyun-segmented-control
        v-else
        class="lingyun-toolbars__segment-control"
        :items="segments"
        :model-value="segmentValue"
        @update:model-value="onSegmentUpdate"
        @change="onSegmentChange"
      />
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import {
  coerceTriFlag,
  getLingyunNavLayout,
  LINGYUN_STATUS_TO_BAR_BOTTOM_PX,
  LINGYUN_TOOLBAR_2LINE_LARGE_EXTRA_PX,
  LINGYUN_TOOLBAR_BAR_DESIGN_PX,
  LINGYUN_TOOLBAR_BAR_PAD_BOTTOM_PX,
  LINGYUN_TOOLBAR_BAR_PAD_TOP_PX,
  LINGYUN_TOOLBAR_GAP_PX,
  LINGYUN_TOOLBAR_LARGE_EXTRA_PX,
  LINGYUN_TOOLBAR_PAD_X_PX,
  LINGYUN_TOOLBAR_WINDOW_CONTROLS_W_PX,
  readLingyunResizeWidth,
} from '@/uni_modules/lingyun-ui/components/lingyun-toolbars/getLingyunNavSafeInset'
import { useLingyunTheme } from '../../utils/theme'
import { useLingyunThemeSwitchVisible } from '../../utils/themeSwitch'
import {
  commitLingyunToolbarPicker,
  lingyunToolbarPicker,
} from '../../utils/toolbarPicker'

export type LingyunToolbarButton = {
  key: string
  icon?: string
  label?: string
  disabled?: boolean
}

/** 一维数组为一组；二维数组按子数组拆成多个独立玻璃胶囊 */
export type LingyunToolbarButtonGroups = LingyunToolbarButton[] | LingyunToolbarButton[][]

/**
 * lingyun-toolbars
 * @description 对齐 Sketch Toolbars。窄屏 iPhone；宽屏（≥690，含折叠屏展开）iPad；Mac 桌面加窗口按钮
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Toolbars%252FLight%252FiPhone
 * @see design/TOOLBARS.md
 *
 * @property {Number} glassProgress 0~1：栏身玻璃强度（0 全透明，1 满液态玻璃）
 * 暗黑：根挂 theme-*，圆钮用浅银霜半透明（勿走 Alert 高 alpha）
 */
export default defineComponent({
  name: 'LingyunToolbars',
  emits: [
    'back',
    'close',
    'trailing',
    'trailing-action',
    'update:searching',
    'update:searchValue',
    'search-open',
    'search-cancel',
    'search-input',
    'search',
    'update:segmentValue',
    'segment-click',
    'segment-change',
  ],
  props: {
    placement: {
      type: String,
      default: 'standard',
    },
    titleStyle: {
      type: String,
      default: 'title',
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    /**
     * 副标题位置是否显示全局选择器。默认不显示。
     * 需要的顶栏设为 true；写了 subtitle 也会被忽略。
     */
    subtitlePicker: {
      type: Boolean,
      default: false,
    },
    showBack: {
      default: 'auto',
    },
    showClose: {
      default: 'auto',
    },
    showGrabber: {
      default: 'auto',
    },
    showTrailing: {
      type: Boolean,
      default: true,
    },
    /** 右侧自定义按钮组；一维为一组，二维按组渲染多个玻璃胶囊，点击发 trailing-action */
    trailingButtons: {
      type: Array as PropType<LingyunToolbarButtonGroups>,
      default: () => [],
    },
    /** 外部菜单打开期间隐藏自定义按钮组，避免按钮从浮层边缘露出 */
    trailingButtonsHidden: { type: Boolean, default: false },
    /** 显式启用 #trailing-menu 浮层；小程序插槽检测不可靠，不开启会在点击按钮时弹出空菜单 */
    trailingMenuEnabled: { type: Boolean, default: false },
    /** 页面级主题钮开关：auto 跟随全局；false 只隐藏当前 toolbar，不改进程全局状态 */
    showThemeSwitch: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: 'auto',
    },
    /** 开启顶部搜索：右侧多一个独立搜索按钮，点击进入搜索模式 */
    searchable: { type: Boolean, default: false },
    /** 额外顶部留白（进玻璃内部）：H5 / 微信 PC 分栏页由 lingyun-split-toolbar 传入 */
    topInset: { type: Number, default: 0 },
    /** 搜索模式；输入框替换左侧内容，原搜索按钮变为取消 */
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
    /** auto：Mac 宽屏显示交通灯。停靠左侧导航时由 app-page 关掉。 */
    showWindowControls: {
      default: 'auto',
    },
    fixed: {
      type: Boolean,
      default: false,
    },
    safeArea: {
      type: Boolean,
      default: true,
    },
    /**
     * 右侧微信胶囊避让。默认 true；
     * 分栏里不是整宽的 pane toolbar 设为 false，只保留状态栏占位。
     */
    avoidCapsule: {
      type: Boolean,
      default: true,
    },
    glassProgress: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      statusBarPx: 0,
      barHeightPx: LINGYUN_TOOLBAR_BAR_DESIGN_PX,
      rightInsetPx: 0,
      /** 从状态栏挪到内容行 padding-bottom 的 px；宽屏不用 */
      barBottomExtraPx: 0,
      padXPx: LINGYUN_TOOLBAR_PAD_X_PX,
      padTopPx: LINGYUN_TOOLBAR_BAR_PAD_TOP_PX,
      padBottomPx: LINGYUN_TOOLBAR_BAR_PAD_BOTTOM_PX,
      gapPx: LINGYUN_TOOLBAR_GAP_PX,
      regular: false,
      windowControls: false,
      largeExtraPx: LINGYUN_TOOLBAR_LARGE_EXTRA_PX,
      title2LineLargeExtraPx: LINGYUN_TOOLBAR_2LINE_LARGE_EXTRA_PX,
      /** 搜索滑入结束后再聚焦，避免小程序过渡期间键盘反复触发布局抖动 */
      searchFocusReady: false,
      _searchFocusTimer: null as ReturnType<typeof setTimeout> | null,
      trailingMenuOpen: false,
      trailingMenuMounted: false,
      themeMenuMounted: false,
      trailingMenuAnchor: null as
        | { top: number; left: number; width: number; height: number }
        | null,
      trailingMenuButton: null as LingyunToolbarButton | null,
      trailingMenuIndex: -1,
      trailingMenuGroupIndex: -1,
      trailingMenuButtonIndex: -1,
      themeMenuAnchor: null as { top: number; left: number; width: number; height: number } | null,
      _onWindowResize: null as ((res?: unknown) => void) | null,
      _themeAnchorTimers: [] as ReturnType<typeof setTimeout>[],
    }
  },
  /*
   * 窗口尺寸变化统一走 mounted 里的 bindResize（uni.onWindowResize + H5 resize）。
   * 不再注册 uni-app 的 onResize：在分栏等嵌套组件里注册会中断渲染（小程序白屏）。
   */
  created() {
    this.syncNavLayout()
  },
  mounted() {
    this.syncNavLayout()
    this.scheduleThemeAnchorMeasure()
    this.bindResize()
  },
  beforeUnmount() {
    if (this._searchFocusTimer) {
      clearTimeout(this._searchFocusTimer)
      this._searchFocusTimer = null
    }
    this._themeAnchorTimers.forEach((timer) => clearTimeout(timer))
    this._themeAnchorTimers = []
    this.unbindResize()
  },
  watch: {
    searching: {
      immediate: true,
      handler(val: boolean) {
        if (this._searchFocusTimer) {
          clearTimeout(this._searchFocusTimer)
          this._searchFocusTimer = null
        }
        this.searchFocusReady = false
        if (!val) return
        this._searchFocusTimer = setTimeout(() => {
          this._searchFocusTimer = null
          this.searchFocusReady = true
        }, 360)
      },
    },
    safeArea() {
      this.syncNavLayout()
    },
    avoidCapsule() {
      this.syncNavLayout()
    },
    showWindowControls() {
      this.syncNavLayout()
    },
    themeSwitchEnabled() {
      this.$nextTick(() => this.measureThemeMenuAnchor())
    },
    trailingButtons: {
      deep: true,
      handler() {
        this.$nextTick(() => this.measureThemeMenuAnchor())
      },
    },
  },
  computed: {
    themeSwitchEnabled(): boolean {
      /* 只挂页面级固定顶栏，demo 里的嵌套预览不重复出现主题钮 */
      if (!this.fixed) return false
      if (this.showThemeSwitch === false) return false
      if (this.showThemeSwitch === true) return true
      return useLingyunThemeSwitchVisible().value
    },
    /** 归一化按钮组：一维当作一组，二维按子数组拆组；空组过滤 */
    buttonGroups(): LingyunToolbarButton[][] {
      const raw = this.trailingButtons as unknown
      if (!Array.isArray(raw) || !raw.length) return []
      if (Array.isArray(raw[0])) {
        return (raw as LingyunToolbarButton[][]).filter(
          (group) => Array.isArray(group) && group.length > 0,
        )
      }
      return [raw as LingyunToolbarButton[]]
    },
    /** 实际渲染组：没有数据按钮但开启了主题钮时，仍需一个只放主题钮的胶囊 */
    renderedGroups(): LingyunToolbarButton[][] {
      if (this.buttonGroups.length) return this.buttonGroups
      return this.themeSwitchEnabled ? [[]] : []
    },
    hasTrailingMenu(): boolean {
      /* 小程序里 $slots 检测不可靠：即使页面没传 slot 也可能为 true，必须显式开启 */
      return this.trailingMenuEnabled && !!this.$slots['trailing-menu']
    },
    searchGroupId(): string {
      return 'ly-toolbar-search-group'
    },
    /** 胶囊下才额外留 8；H5/无胶囊直接贴内容区右边距，与普通按钮组一致 */
    rightActionGapPx(): number {
      return this.safeArea && this.rightInsetPx > this.padXPx ? this.gapPx : 0
    },
    placementKey() {
      return this.placement === 'sheet' ? 'sheet' : 'standard'
    },
    styleKey() {
      const allowed: string[] = [
        'title',
        'compactLarge',
        'large',
        'title2Line',
        'title2LineLarge',
        'title2LineLeft',
      ]
      return allowed.includes(this.titleStyle) ? this.titleStyle : 'title'
    },
    isSheet() {
      return this.placementKey === 'sheet'
    },
    isLarge() {
      return this.styleKey === 'large' || this.styleKey === 'title2LineLarge'
    },
    isTwoLine() {
      return (
        this.styleKey === 'title2Line' ||
        this.styleKey === 'title2LineLarge' ||
        this.styleKey === 'title2LineLeft'
      )
    },
    isTitleLeft() {
      return this.styleKey === 'title2LineLeft'
    },
    showGrabberEffective() {
      return coerceTriFlag(this.showGrabber, this.isSheet)
    },
    showBackEffective() {
      return coerceTriFlag(this.showBack, !this.isSheet)
    },
    showCloseEffective() {
      return coerceTriFlag(this.showClose, this.isSheet)
    },
    statusStyle() {
      return {
        height: `${this.statusBarPx}px`,
      }
    },
    barStyle() {
      const padTop = this.padTopPx
      const padBottom = this.padBottomPx + this.barBottomExtraPx
      return {
        height: `${this.barHeightPx}px`,
        minHeight: `${this.barHeightPx}px`,
        paddingTop: `${padTop}px`,
        paddingBottom: `${padBottom}px`,
        '--ly-toolbar-pad-top': `${padTop}px`,
        '--ly-toolbar-pad-bottom': `${padBottom}px`,
      }
    },
    /** 左侧是否有返回 / 关闭 / 交通灯 / 自定义 leading，决定标题要不要让出 44 钮位 */
    hasLeadingContent(): boolean {
      return !!(
        this.showBackEffective ||
        this.showCloseEffective ||
        this.windowControls ||
        this.$slots.leading
      )
    },
    /** 标题层左右让出较宽的一侧，文字仍按栏身几何中心排 */
    titleInsetPx() {
      /* 左对齐两行标题且没有前导内容时，标题直接贴内容边缘，不再预留 44 钮位 */
      if (this.isTitleLeft && !this.hasLeadingContent) return 0
      const action = 44
      let leading = action
      if (this.windowControls) leading += LINGYUN_TOOLBAR_WINDOW_CONTROLS_W_PX + this.gapPx
      return Math.max(leading, action) + this.gapPx
    },
    /** 单组实际占宽（单个 44，多个 36n + 18(n-1) + 20） */
    actionGroupsWidthPx(): number {
      const groups = this.renderedGroups
      let width = 0
      groups.forEach((group, groupIndex) => {
        const count = group.length + (this.themeSwitchEnabled && groupIndex === 0 ? 1 : 0)
        if (!count) return
        width += count === 1 ? 44 : 36 * count + 18 * (count - 1) + 20
      })
      let groupCount = groups.length
      if (this.searchable && !this.searching) {
        width += 44
        groupCount += 1
      }
      if (groupCount > 1) width += this.gapPx * (groupCount - 1)
      return width
    },
    /** 标题右侧要让出右侧按钮组，避免小程序里视觉中心偏右 */
    titleRightInsetPx(): number {
      const group = this.actionGroupsWidthPx
      if (!group) return this.titleInsetPx
      /* 绝对定位的 title 以 padding box 为参照，需补上微信胶囊造成的额外右内边距 */
      const safeExtra = Math.max(0, this.rightInsetPx - this.padXPx)
      return Math.max(this.titleInsetPx, group + this.gapPx + safeExtra)
    },
    largeStyle() {
      const extra =
        this.styleKey === 'title2LineLarge' ? this.title2LineLargeExtraPx : this.largeExtraPx
      return {
        minHeight: `${extra}px`,
      }
    },
    segmentsStyle() {
      /* 胶囊在状态栏行；分段 / Tabs 行在下方，不需要为胶囊让出右侧安全区，铺满整行 */
      const extra = this.safeArea ? Math.max(0, this.rightInsetPx - this.padXPx) : 0
      if (!extra) return {}
      return {
        width: `calc(100% + ${extra}px)`,
        marginRight: `-${extra}px`,
      }
    },
    segmentTabItems() {
      return (this.segments || [])
        .map((item, index) => ({
          key: String(item.key ?? index),
          text: String(item.text ?? item.key ?? ''),
          icon: item.icon,
          badge: item.badge,
          disabled: item.disabled === true,
        }))
        .filter((item) => !!item.text)
    },
    searchLayerStyle() {
      /* 只覆盖搜索按钮左侧区域；搜索/关闭按钮位置固定，不参与动画 */
      const actionWidth = this.searchable
        ? 44 + this.gapPx + this.rightActionGapPx
        : 0
      /* 和右侧 44 高按钮组同一条内容带：顶到 bar 的 padding-top，窄屏 / 宽屏都能对齐 */
      return {
        left: '0px',
        right: `${actionWidth}px`,
        top: `${this.padTopPx}px`,
      }
    },
    /** 内容区最小高度（不含状态栏） */
    contentMinHeightPx() {
      let h = this.barHeightPx
      if (this.showGrabberEffective) h += 16
      if (!this.searching && this.isLarge) {
        h +=
          this.styleKey === 'title2LineLarge' ? this.title2LineLargeExtraPx : this.largeExtraPx
      }
      return h + Math.max(0, Number(this.topInset) || 0)
    },
    rootStyle(): Record<string, string> {
      const style: Record<string, string> = {
        minHeight: `${this.contentMinHeightPx}px`,
      }
      if (this.topInset > 0) {
        style.paddingTop = `${this.topInset}px`
      }
      /*
       * 微信右侧避让胶囊：root paddingRight = rightInset。
       * 标题/Grabber 若按「内容区」绝对居中会偏左；用 --ly-toolbar-center-shift
       * 校正到屏宽几何中心：(rightInset - padX) / 2。
       */
      let centerShift = 0
      const padX = this.padXPx
      style.paddingLeft = `${padX}px`
      style.paddingRight = `${padX}px`
      if (this.safeArea && this.rightInsetPx > padX) {
        style.paddingRight = `${this.rightInsetPx}px`
        centerShift = (this.rightInsetPx - padX) / 2
      }
      style['--ly-toolbar-center-shift'] = `${centerShift}px`
      style['--ly-toolbar-gap'] = `${this.gapPx}px`
      style['--ly-toolbar-title-inset'] = `${this.titleInsetPx}px`
      style['--ly-toolbar-title-inset-right'] = `${this.titleRightInsetPx}px`
      return style
    },
    showInlineTitle() {
      return !this.isLarge
    },
    /** 只有显式打开的顶栏才显示。全局总开关关掉时也不显示。 */
    pickerActive(): boolean {
      const flag = this.subtitlePicker as unknown
      if (flag !== true && flag !== 'true') return false
      return lingyunToolbarPicker.enabled
    },
    pickerOptions() {
      return lingyunToolbarPicker.options
    },
    pickerTitle(): string {
      return lingyunToolbarPicker.title
    },
    pickerSearchable(): boolean {
      return lingyunToolbarPicker.searchable
    },
    pickerSearchPlaceholder(): string {
      return lingyunToolbarPicker.searchPlaceholder
    },
    pickerIndex(): number {
      const current = lingyunToolbarPicker.value
      const index = lingyunToolbarPicker.options.findIndex(
        (item) => current != null && String(item.value) === String(current),
      )
      return index < 0 ? 0 : index
    },
    pickerLabel(): string {
      const current = lingyunToolbarPicker.value
      const hit = lingyunToolbarPicker.options.find(
        (item) => current != null && String(item.value) === String(current),
      )
      return hit?.label || lingyunToolbarPicker.placeholder
    },
    showInlineSubtitle() {
      return this.showInlineTitle && this.isTwoLine && !!this.subtitle && !this.pickerActive
    },
    showLargeTitle() {
      return this.isLarge
    },
    showLargeSubtitle() {
      return this.isLarge && this.isTwoLine && !!this.subtitle && !this.pickerActive
    },
    titleWrapClass() {
      return {
        'lingyun-toolbars__title-wrap--left': this.isTitleLeft,
        'lingyun-toolbars__title-wrap--two': this.isTwoLine || (this.pickerActive && !this.isLarge),
      }
    },
    glassAmount() {
      const n = Number(this.glassProgress)
      if (Number.isNaN(n)) return 0
      return Math.min(1, Math.max(0, n))
    },
    themeClass() {
      try {
        return useLingyunTheme().rootClass || 'theme-light'
      } catch (e) {
        return 'theme-light'
      }
    },
    chromeStyle() {
      const p = this.glassAmount
      const blur = (20 * p).toFixed(2)
      return {
        '--ly-toolbar-glass': String(p),
        backdropFilter: p > 0.01 ? `saturate(180%) blur(${blur}px)` : 'none',
        webkitBackdropFilter: p > 0.01 ? `saturate(180%) blur(${blur}px)` : 'none',
      }
    },
    rootClass() {
      return [
        `lingyun-toolbars--${this.placementKey}`,
        `lingyun-toolbars--${this.styleKey}`,
        this.themeClass,
        {
          'lingyun-toolbars--fixed': this.fixed,
          'lingyun-toolbars--safe': this.safeArea,
          'lingyun-toolbars--grabber': this.showGrabberEffective,
          'lingyun-toolbars--glassed': this.glassAmount > 0.02,
          'lingyun-toolbars--regular': this.regular,
        },
      ]
    },
  },
  methods: {
    syncNavLayout(windowWidth?: number) {
      const width = Number(windowWidth)
      const layout = getLingyunNavLayout(
        LINGYUN_TOOLBAR_BAR_DESIGN_PX,
        Number.isFinite(width) && width > 0 ? width : undefined,
      )
      let status = this.safeArea ? layout.statusBarHeight : 0
      let bar = layout.barHeight
      let bottomExtra = 0
      this.regular = layout.regular
      this.windowControls = coerceTriFlag(this.showWindowControls, layout.windowControls)
      this.padXPx = layout.padX
      this.padTopPx = layout.padTop
      this.padBottomPx = layout.padBottom
      this.gapPx = layout.gap
      this.largeExtraPx = layout.largeExtra
      this.title2LineLargeExtraPx = layout.title2LineLargeExtra
      // 窄屏：状态栏少 5，挪到返回钮所在行的下边距；总高度不变。iPad / Mac 按稿不再挪。
      if (!layout.regular && status > LINGYUN_STATUS_TO_BAR_BOTTOM_PX) {
        bottomExtra = LINGYUN_STATUS_TO_BAR_BOTTOM_PX
        status -= bottomExtra
        bar += bottomExtra
      }
      this.statusBarPx = status
      this.barHeightPx = bar
      this.barBottomExtraPx = bottomExtra
      this.rightInsetPx = this.safeArea && this.avoidCapsule ? layout.rightInset : 0
      this.$nextTick(() => this.measureThemeMenuAnchor())
    },
    /** 主题钮菜单和按钮组一起隐藏，按第一组右上角定位 */
    measureThemeMenuAnchor() {
      if (!this.themeSwitchEnabled) {
        this.themeMenuAnchor = null
        return
      }
      this.resolveElementAnchor(this.trailingGroupId(0), (anchor) => {
        this.themeMenuAnchor = anchor
      })
    },
    scheduleThemeAnchorMeasure() {
      this._themeAnchorTimers.forEach((timer) => clearTimeout(timer))
      this._themeAnchorTimers = [120, 320, 700].map((delay) =>
        setTimeout(() => this.measureThemeMenuAnchor(), delay),
      )
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
      // H5 拖窗口不一定走 uni.onWindowResize
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
    onToolbarPickerChange(payload: { value?: number | string | Array<number | string> }) {
      const index = Number(payload?.value)
      if (!Number.isFinite(index) || index < 0) return
      commitLingyunToolbarPicker(index)
    },
    onBack() {
      this.$emit('back')
    },
    onClose() {
      this.$emit('close')
    },
    onTrailing() {
      this.$emit('trailing')
    },
    onSearchOpen() {
      this.$emit('update:searching', true)
      this.$emit('search-open')
    },
    onSearchAction() {
      if (this.searching) this.onSearchCancel()
      else this.onSearchOpen()
    },
    onSearchCancel() {
      this.$emit('update:searching', false)
      this.$emit('search-cancel', this.searchValue)
    },
    onSearchInput(event?: unknown) {
      const detail = (event as { detail?: { value?: string | number } } | undefined)?.detail
      const value = detail?.value != null ? String(detail.value) : ''
      this.$emit('update:searchValue', value)
      this.$emit('search-input', value)
    },
    onSearchConfirm(event?: unknown) {
      const detail = (event as { detail?: { value?: string | number } } | undefined)?.detail
      const value = detail?.value != null ? String(detail.value) : this.searchValue
      this.$emit('update:searchValue', value)
      this.$emit('search', value)
    },
    onSearchClear() {
      this.$emit('update:searchValue', '')
      this.$emit('search-input', '')
    },
    onSegmentUpdate(value: string | number) {
      this.$emit('update:segmentValue', value)
    },
    onSegmentChange(item: { key?: string | number } | null) {
      const value = item && item.key != null ? item.key : this.segmentValue
      this.$emit('segment-click', { value, item })
      this.$emit('segment-change', { value, item })
    },
    onTabsChange(payload: {
      key?: string | number
      item?: Record<string, unknown> | null
    }) {
      const value =
        payload && payload.key != null ? payload.key : this.segmentValue
      const item = (payload && payload.item) || null
      this.$emit('segment-click', { value, item })
      this.$emit('segment-change', { value, item })
    },
    trailingButtonId(groupIndex: number, buttonIndex: number): string {
      return `ly-toolbar-action-${groupIndex}-${buttonIndex}`
    },
    trailingGroupId(groupIndex: number): string {
      return `ly-toolbar-group-${groupIndex}`
    },
    /** 跨组扁平序号，兼容原有 index 语义 */
    flatButtonIndex(groupIndex: number, buttonIndex: number): number {
      let index = buttonIndex
      for (let i = 0; i < groupIndex; i += 1) {
        index += this.buttonGroups[i] ? this.buttonGroups[i].length : 0
      }
      return index
    },
    resolveElementAnchor(
      id: string,
      done: (anchor: { top: number; left: number; width: number; height: number } | null) => void,
    ) {
      let settled = false
      const finish = (rect: { top?: number; left?: number; width?: number; height?: number } | null) => {
        if (settled) return
        settled = true
        done(
          rect && rect.top != null && rect.left != null
            ? {
                top: rect.top,
                left: rect.left,
                width: rect.width || 0,
                height: rect.height || 0,
              }
            : null,
        )
      }
      // #ifdef H5
      if (typeof document !== 'undefined') {
        const el = document.getElementById(id)
        if (el) {
          finish(el.getBoundingClientRect())
          return
        }
      }
      // #endif
      setTimeout(() => finish(null), 320)
      uni
        .createSelectorQuery()
        .in(this)
        .select(`#${id}`)
        .boundingClientRect()
        .exec((res) => {
          finish((res && res[0]) || null)
        })
    },
    onTrailingButton(button: LingyunToolbarButton, groupIndex: number, buttonIndex: number) {
      if (button.disabled) return
      const index = this.flatButtonIndex(groupIndex, buttonIndex)
      const groupId = this.trailingGroupId(groupIndex)
      /* 点击后整个按钮组隐藏，菜单按组右上角对齐，而不是按单个按钮 */
      this.resolveElementAnchor(groupId, (anchor) => {
        this.$emit('trailing-action', {
          key: button.key,
          button,
          index,
          groupIndex,
          buttonIndex,
          anchor,
        })
        if (!this.hasTrailingMenu || !anchor) return
        this.trailingMenuButton = button
        this.trailingMenuIndex = index
        this.trailingMenuGroupIndex = groupIndex
        this.trailingMenuButtonIndex = buttonIndex
        this.trailingMenuAnchor = anchor
        this.trailingMenuMounted = true
        this.trailingMenuOpen = true
      })
    },
    closeTrailingMenu() {
      this.trailingMenuOpen = false
    },
    onTrailingMenuClosed() {
      this.trailingMenuMounted = false
    },
    onThemeMenuOpen() {
      this.themeMenuMounted = true
    },
    onThemeMenuClosed() {
      this.themeMenuMounted = false
    },
  },
})
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

$ly-toolbar-bar: 60px; /* 8 + 44 + 8；真机验收 */
$ly-toolbar-sheet-extra: 16px;
$ly-toolbar-large-extra: 51px;
$ly-toolbar-2line-large-extra: 71px;
$ly-toolbar-pad-x: 16px;
$ly-toolbar-action: 44px;
$ly-toolbar-bar-pad-top: 8px;
$ly-toolbar-bar-pad-bottom: 8px;
$ly-toolbar-gap: 8px;

.lingyun-toolbars {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  padding-left: $ly-toolbar-pad-x;
  padding-right: $ly-toolbar-pad-x;
  background: transparent;
  overflow: visible;

  &--fixed {
    position: fixed;
    top: 0;
    /* 宽屏停靠导航时由 lingyun-app-page 写入，避免顶栏盖住左侧栏 */
    left: var(--lingyun-page-nav-width, 0px);
    right: 0;
    /* 勿 width:100%：fixed 的百分比相对视口，会把栏身撑出内容区，标题偏右 */
    width: auto;
    z-index: 100;
  }
}

.lingyun-toolbars__chrome {
  --ly-toolbar-glass: 0;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  border: none;
  border-radius: 0;
  background-color: rgba(255, 255, 255, calc(0.42 * var(--ly-toolbar-glass, 0)));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, calc(0.4 * var(--ly-toolbar-glass, 0))),
    0 1px 0 rgba(60, 60, 67, calc(0.04 * var(--ly-toolbar-glass, 0)));
}

.lingyun-toolbars.theme-dark .lingyun-toolbars__chrome {
  background-color: rgba(255, 255, 255, calc(0.14 * var(--ly-toolbar-glass, 0)));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, calc(0.18 * var(--ly-toolbar-glass, 0))),
    0 1px 0 rgba(255, 255, 255, calc(0.06 * var(--ly-toolbar-glass, 0)));
}

.lingyun-toolbars__status {
  width: 100%;
  flex-shrink: 0;
}

.lingyun-toolbars__grabber {
  position: relative;
  z-index: 1;
  width: 60px;
  height: 4px;
  margin: 5px auto 0;
  border-radius: 2px;
  background-color: #cfcfcf;
  flex-shrink: 0;
  /* 与标题同：避开胶囊后的内容区居中会偏左，校正到屏宽中心 */
  transform: translateX(var(--ly-toolbar-center-shift, 0px));
}

.lingyun-toolbars__bar {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
  height: $ly-toolbar-bar;
  min-height: $ly-toolbar-bar;
  padding-top: $ly-toolbar-bar-pad-top;
  padding-bottom: $ly-toolbar-bar-pad-bottom;
}

.lingyun-toolbars__bar-content {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.lingyun-toolbars__bar-left {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  transition: opacity 0.18s ease;
}

/*
 * 位移动画不能加在这一层。标题是绝对定位，父节点一旦出现 transform
 * 就会变成它的定位参照；宽屏栏身上下内边距不对称（上 0 / 下 10），
 * 参照从整条栏身换成内容行时，标题会在搜索打开和关闭时各跳 5px。
 * 淡出留在这一层，滑动放到标题和按钮自己身上。
 */
.lingyun-toolbars__bar--search .lingyun-toolbars__bar-left {
  opacity: 0;
  pointer-events: none;
}

.lingyun-toolbars__leading,
.lingyun-toolbars__trailing {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--ly-toolbar-gap, #{$ly-toolbar-gap});
  flex-shrink: 0;
  z-index: 1;
  min-width: $ly-toolbar-action;
  transform: translateX(0);
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}

.lingyun-toolbars__bar--search .lingyun-toolbars__leading,
.lingyun-toolbars__bar--search .lingyun-toolbars__trailing,
.lingyun-toolbars__bar--search .lingyun-toolbars__title-wrap {
  transform: translateX(-28px);
}

.lingyun-toolbars__trailing {
  justify-content: flex-end;
  gap: 0;
  transition: opacity 0.12s ease;
}

/* 顶部搜索模式：输入框 + 独立取消组，替换左侧返回/标题和右侧按钮组 */
.lingyun-toolbars__search {
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--ly-toolbar-gap, #{$ly-toolbar-gap});
  height: 44px;
  z-index: 2;
  opacity: 0;
  transform: translateX(calc(100% + 32px));
  pointer-events: none;
  transition:
    opacity 0.2s ease,
    transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}

.lingyun-toolbars__bar--search .lingyun-toolbars__search {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.lingyun-toolbars__search-group {
  flex-shrink: 0;
}

.lingyun-toolbars__search-group--hidden {
  opacity: 0;
  pointer-events: none;
}

.lingyun-toolbars__search-field {
  flex: 1 1 auto;
  min-width: 0;
  height: 44px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border-radius: $lingyun-glass-radius-pill;
  @include lingyun-glass-control;
}

.lingyun-toolbars__search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  padding: 0;
  font-size: 17px;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}

:deep(.lingyun-toolbars__search-ph) {
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  font-size: 17px;
}

.lingyun-toolbars__search-clear {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
}

.lingyun-toolbars__search-clear--hover {
  opacity: 0.6;
}

/* 菜单打开期间整个右侧操作区隐去，避免玻璃胶囊或其它按钮从菜单边缘漏出来 */
.lingyun-toolbars__trailing--menu-open {
  opacity: 0;
  pointer-events: none;
}

/* 页面打开自己的锚点浮层时，只隐藏数据驱动的按钮组，保留自定义 trailing */
.lingyun-toolbars__trailing--buttons-hidden .lingyun-toolbars__action-group {
  opacity: 0;
  pointer-events: none;
}

.lingyun-toolbars__action-group {
  height: 44px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 0 10px;
  flex-shrink: 0;
  transition: opacity 0.12s ease;
  @include lingyun-glass-control;
  border-radius: 9999px;
}

.lingyun-toolbars__action-group--single {
  width: 44px;
  padding: 0 4px;
  gap: 0;
}

.lingyun-toolbars__group-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.12s ease;
}

.lingyun-toolbars__group-button--hover {
  transform: scale(0.92);
}

.lingyun-toolbars__group-button--disabled {
  opacity: 0.35;
  pointer-events: none;
}

.lingyun-toolbars__group-text {
  max-width: 36px;
  overflow: hidden;
  font-size: 13px;
  line-height: 16px;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-toolbars__menu-host {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  overflow: visible;
}

.lingyun-toolbars__windows {
  width: 41px;
  height: 22px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  pointer-events: none;
}

.lingyun-toolbars__window {
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

.lingyun-toolbars__title-wrap {
  position: absolute;
  left: var(--ly-toolbar-title-inset, #{$ly-toolbar-action + $ly-toolbar-gap});
  right: var(--ly-toolbar-title-inset-right, var(--ly-toolbar-title-inset, #{$ly-toolbar-action + $ly-toolbar-gap}));
  /* 与栏身设计内边距对齐，标题与 44 钮同一内容带垂直居中 */
  top: var(--ly-toolbar-pad-top, #{$ly-toolbar-bar-pad-top});
  bottom: var(--ly-toolbar-pad-bottom, #{$ly-toolbar-bar-pad-bottom});
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 0;
  /* 微信胶囊右侧 inset 后，校正到屏宽几何中心（左对齐样式见 --left） */
  transform: translateX(var(--ly-toolbar-center-shift, 0px));
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);

  &--left {
    align-items: flex-start;
    pointer-events: auto;
    transform: none;
  }

  &--two {
    justify-content: center;
  }
}

.lingyun-toolbars__title {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--lingyun-label-glass, #{$lingyun-label-glass});
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  text-align: center;
}

.lingyun-toolbars__title-wrap--left .lingyun-toolbars__title {
  text-align: left;
}

.lingyun-toolbars__subtitle {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 1px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
  text-align: center;
}

.lingyun-toolbars__title-wrap--left .lingyun-toolbars__subtitle {
  text-align: left;
}

.lingyun-toolbars__picker {
  max-width: 100%;
  margin-top: 1px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-width: 0;
  pointer-events: auto;
}

.lingyun-toolbars__title-wrap--left .lingyun-toolbars__picker {
  justify-content: flex-start;
}

.lingyun-toolbars__picker--large {
  margin-top: 2px;
}

.lingyun-toolbars__picker-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
}

.lingyun-toolbars__picker--large .lingyun-toolbars__picker-text {
  font-size: 15px;
  line-height: 20px;
}

.lingyun-toolbars__picker-mark {
  flex-shrink: 0;
  margin-left: 2px;
}

.lingyun-toolbars__segments {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  width: 100%;
  height: 56px;
  padding-bottom: 8px;
  display: flex;
  flex-direction: row;
}

/* 同一份 segments 数据用顶部 Tabs 渲染：44 高、贴底；页面额外间距由 app-page 的顶部栈承接 */
.lingyun-toolbars__segments--tabs {
  height: 44px;
  padding-bottom: 0;
  background-color: transparent;
}

.lingyun-toolbars__tabs {
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
}

/* 小程序自定义组件宿主默认按内容收缩，显式拉满整行 */
.lingyun-toolbars__segment-control {
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
}

.lingyun-toolbars__large {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  box-sizing: border-box;
  width: 100%;
  padding: 4px 0 8px;
  min-height: $ly-toolbar-large-extra;
}

.lingyun-toolbars--title2LineLarge .lingyun-toolbars__large {
  min-height: $ly-toolbar-2line-large-extra;
}

.lingyun-toolbars--regular .lingyun-toolbars__large {
  padding: 0 0 7px;
  min-height: 48px;
}

.lingyun-toolbars--regular.lingyun-toolbars--title2LineLarge .lingyun-toolbars__large {
  min-height: 71px;
  padding: 4px 0 8px;
}

.lingyun-toolbars__large-title {
  max-width: 100%;
  color: var(--lingyun-label-glass, #{$lingyun-label-glass});
  font-size: 34px;
  font-weight: 700;
  line-height: 41px;
  letter-spacing: 0.4px;
}

.lingyun-toolbars__large-subtitle {
  max-width: 100%;
  margin-top: 2px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  font-size: 15px;
  font-weight: 400;
  line-height: 20px;
}

/* 左右圆钮里的字形：固定 em 盒，避免图标字体侧轴承把符号挤偏 */
.lingyun-toolbars__glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
  line-height: 1;
  text-align: center;
}

.lingyun-toolbars__action {
  box-sizing: border-box;
  width: $ly-toolbar-action;
  height: $ly-toolbar-action;
  min-width: $ly-toolbar-action;
  min-height: $ly-toolbar-action;
  border-radius: $lingyun-glass-radius-pill;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--glass {
    /* 与右侧按钮组 / tabbar / Duo 工具组统一走控件级玻璃 */
    @include lingyun-glass-control;
    border-radius: $lingyun-glass-radius-pill;
  }

  &--prominent {
    /* 与右侧按钮组、自定义 trailing 之间保持和组间距一致的间距 */
    margin-left: var(--ly-toolbar-gap, #{$ly-toolbar-gap});
    background-color: var(--lingyun-link, #{$lingyun-system-blue});
    border: none;
    box-shadow: var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
      var(--lingyun-glass-shadow-raised, #{$lingyun-glass-shadow-raised});
  }

  &--hover {
    opacity: 0.82;
    transform: scale(0.96);
  }
}
</style>
