<template>
  <view class="lingyun-sheets-host">
    <!-- 浮层挂载：mp-weixin root-portal / H5+App Teleport，防被 section overflow 裁切 -->
    <!-- #ifdef MP-WEIXIN -->
    <root-portal>
      <view
        v-if="mounted"
        class="lingyun-sheets"
        :class="rootClass"
        :style="rootStyle"
      >
        <view
          class="lingyun-sheets__overlay"
          @click="onOverlayClick"
          @touchmove.stop.prevent
        />

        <view
          class="lingyun-sheets__panel"
          :class="panelClass"
          :style="panelStyle"
          role="dialog"
          :aria-modal="'true'"
          @touchmove.stop="onPanelTouchMove"
        >
          <!-- Grabber + 顶栏：下滑关闭手势区（须 prevent，否则 H5 会连带页面 overscroll） -->
          <view
            class="lingyun-sheets__chrome"
            @touchstart.passive="onChromeTouchStart"
            @touchmove.stop.prevent="onChromeTouchMove"
            @touchend="onChromeTouchEnd"
            @touchcancel="onChromeTouchEnd"
          >
            <view v-if="showGrabber" class="lingyun-sheets__grabber" aria-hidden="true" />
            <lingyun-toolbars
              class="lingyun-sheets__toolbar"
              placement="sheet"
              :title="title"
              :show-back="false"
              :show-close="showClose"
              :show-grabber="false"
              :show-trailing="showTrailingEffective"
              :safe-area="false"
              :fixed="false"
              :glass-progress="0"
              @close="close"
              @trailing="onTrailing"
            >
              <template v-if="$slots.leading" #leading>
                <slot name="leading" />
              </template>
              <template #title>
                <slot name="title">
                  <text class="lingyun-sheets__title">{{ title }}</text>
                </slot>
              </template>
              <template #trailing>
                <lingyun-button
                  v-if="hasBuiltInTrailing"
                  class="lingyun-sheets__trailing-button"
                  variant="borderedProminent"
                  size="medium"
                  :text="trailingTextClipped"
                  :aria-label="trailingTextClipped || trailingIcon || 'Trailing'"
                  @click="onTrailing"
                >
                  <template v-if="trailingIcon" #icon>
                    <lingyun-icon
                      :type="trailingIcon"
                      :size="trailingTextClipped ? 18 : 22"
                      color="white"
                    />
                  </template>
                </lingyun-button>
                <slot v-if="!hasBuiltInTrailing" name="trailing" />
              </template>
            </lingyun-toolbars>
          </view>

          <scroll-view
            class="lingyun-sheets__body"
            scroll-y
            :show-scrollbar="false"
          >
            <view class="lingyun-sheets__body-inner" :style="bodyInnerStyle">
              <slot />
            </view>
          </scroll-view>
        </view>
      </view>
    </root-portal>
    <!-- #endif -->

    <!-- #ifndef MP-WEIXIN -->
    <teleport to="body">
      <view
        v-if="mounted"
        class="lingyun-sheets"
        :class="rootClass"
        :style="rootStyle"
      >
        <view
          class="lingyun-sheets__overlay"
          @click="onOverlayClick"
          @touchmove.stop.prevent
        />

        <view
          class="lingyun-sheets__panel"
          :class="panelClass"
          :style="panelStyle"
          role="dialog"
          :aria-modal="'true'"
          @touchmove.stop="onPanelTouchMove"
        >
          <view
            class="lingyun-sheets__chrome"
            @touchstart.passive="onChromeTouchStart"
            @touchmove.stop.prevent="onChromeTouchMove"
            @touchend="onChromeTouchEnd"
            @touchcancel="onChromeTouchEnd"
          >
            <view v-if="showGrabber" class="lingyun-sheets__grabber" aria-hidden="true" />
            <lingyun-toolbars
              class="lingyun-sheets__toolbar"
              placement="sheet"
              :title="title"
              :show-back="false"
              :show-close="showClose"
              :show-grabber="false"
              :show-trailing="showTrailingEffective"
              :safe-area="false"
              :fixed="false"
              :glass-progress="0"
              @close="close"
              @trailing="onTrailing"
            >
              <template v-if="$slots.leading" #leading>
                <slot name="leading" />
              </template>
              <template #title>
                <slot name="title">
                  <text class="lingyun-sheets__title">{{ title }}</text>
                </slot>
              </template>
              <template #trailing>
                <lingyun-button
                  v-if="hasBuiltInTrailing"
                  class="lingyun-sheets__trailing-button"
                  variant="borderedProminent"
                  size="medium"
                  :text="trailingTextClipped"
                  :aria-label="trailingTextClipped || trailingIcon || 'Trailing'"
                  @click="onTrailing"
                >
                  <template v-if="trailingIcon" #icon>
                    <lingyun-icon
                      :type="trailingIcon"
                      :size="trailingTextClipped ? 18 : 22"
                      color="white"
                    />
                  </template>
                </lingyun-button>
                <slot v-if="!hasBuiltInTrailing" name="trailing" />
              </template>
            </lingyun-toolbars>
          </view>

          <scroll-view
            class="lingyun-sheets__body"
            scroll-y
            :show-scrollbar="false"
          >
            <view class="lingyun-sheets__body-inner" :style="bodyInnerStyle">
              <slot />
            </view>
          </scroll-view>
        </view>
      </view>
    </teleport>
    <!-- #endif -->
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { mpOverlayHoldMixin } from '../../utils/mpOverlayHoldMixin'
import { getLingyunToolbarStackPx, LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH } from '@/uni_modules/lingyun-ui/components/lingyun-toolbars/getLingyunNavSafeInset'
import {
  LINGYUN_APP_PAGE_SCROLL_LOCK,
  type LingyunAppPageScrollLock,
} from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

/**
 * lingyun-sheets
 * @description 对齐 Apple iOS 27 UI Kit Sheets（iPhone Light/Dark）+ HIG · 固定档位 MVP
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sheets%252FLight%252FiPhone
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Sheets%252FDark%252FiPhone
 * @see design/SHEETS.md
 *
 * 第一档：medium / large 固定高度；Grabber 区下滑关闭；点遮罩关闭；无跟手换档。
 * 暗黑：根挂 theme-*（小程序 styleIsolation）。
 */
const LEAVE_MS = 250
const ENTER_KICK_MS = 48
const NUDGE_MS = 420
const DISMISS_DY = 72
/** Sketch · Medium Detent：面板左右 + 底部各内缩 8，四角 34（悬浮卡片） */
const INSET_MEDIUM = 8
const RADIUS_MEDIUM = 34
/** Sketch · Large Detent：贴边贴底，顶角 38、底角 0 */
const RADIUS_LARGE = 38
/** Sketch · Medium 面板 451 / 画板 874 */
const MEDIUM_RATIO = 0.516
/** large 顶留白下限（状态栏测量失败时；Sketch 402×874 画板为 62） */
const LARGE_TOP_GAP_MIN = 44
/*
 * Sketch · Sheets/Light/iPad（画板 1210×834）：面板 936×770 居中，
 * 四角 32、上下内缩 32、无 Grabber（不可换档）。宽屏不铺满，否则变成一条横带。
 */
const REGULAR_MIN_WIDTH = LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH
const REGULAR_MAX_WIDTH = 936
const REGULAR_MAX_HEIGHT = 770
const REGULAR_INSET = 32
const RADIUS_REGULAR = 32

export default defineComponent({
  name: 'LingyunSheets',
  mixins: [mpOverlayHoldMixin],
  emits: ['update:show', 'update:modelValue', 'close', 'update:detent', 'trailing'],
  inject: {
    appPageScrollLock: {
      from: LINGYUN_APP_PAGE_SCROLL_LOCK,
      default: null as LingyunAppPageScrollLock | null,
    },
  },
  props: {
    show: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    modelValue: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    title: {
      type: String,
      default: '',
    },
    detent: {
      type: String,
      default: 'medium',
    },
    maskClosable: {
      type: Boolean,
      default: true,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    showTrailing: {
      type: Boolean,
      default: false,
    },
    /** 顶栏右侧内置按钮：图标（lingyun-icon type），可单独使用 */
    trailingIcon: {
      type: String,
      default: '',
    },
    /** 顶栏右侧内置按钮：最多 2 个字，可和 trailingIcon 组合；两者都空时回退 showTrailing */
    trailingText: {
      type: String,
      default: '',
    },
    safeAreaBottom: {
      type: Boolean,
      default: true,
    },
    zIndex: {
      type: [Number, String] as PropType<number | string>,
      default: 1000,
    },
    /** 宽屏（≥690）居中卡片宽度 px；0 = 默认上限（≤936，且不超出视口 - 64） */
    width: {
      type: Number,
      default: 0,
    },
    /** 宽屏（≥690）居中卡片高度 px；0 = 默认上限（≤770，且不超出视口 - 64） */
    height: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      mounted: false,
      /** enter | open | leave */
      phase: '' as '' | 'enter' | 'open' | 'leave',
      leaveTimer: null as ReturnType<typeof setTimeout> | null,
      enterTimer: null as ReturnType<typeof setTimeout> | null,
      windowHeight: 667,
      windowWidth: 375,
      /** large 顶部留白：状态栏 + 页顶 toolbars 栏身，避免挡住底层导航 */
      largeTopGap: LARGE_TOP_GAP_MIN,
      safeBottom: 0,
      dragStartY: 0,
      dragDy: 0,
      dragging: false,
      /** 点遮罩不可关闭时的拒绝反馈 */
      rejectNudge: false,
      nudgeTimer: null as ReturnType<typeof setTimeout> | null,
      _onWindowResize: null as (() => void) | null,
      _appScrollLocked: false,
      _scrollLocked: false,
      _prevBodyOverflow: '',
      _prevBodyOverscroll: '',
      _prevHtmlOverscroll: '',
    }
  },
  computed: {
    visible() {
      if (this.show !== undefined && this.show !== null) return !!this.show
      if (this.modelValue !== undefined && this.modelValue !== null) return !!this.modelValue
      return false
    },
    /** 顶栏右侧文字最多 2 个字（按 Unicode 码点截断，避免拆开 emoji） */
    trailingTextClipped(): string {
      const text = String(this.trailingText || '').trim()
      return Array.from(text).slice(0, 2).join('')
    },
    hasBuiltInTrailing(): boolean {
      return !!(this.trailingIcon || this.trailingTextClipped)
    },
    /** 内置 trailing（icon / 文字）优先于 #trailing 插槽与默认分享圆钮；
     *  小程序端插槽是否存在是静态的，不能用来判断“有没有内容” */
    showTrailingEffective(): boolean {
      return this.showTrailing && !this.hasBuiltInTrailing
    },
    detentKey() {
      return this.detent === 'large' ? 'large' : 'medium'
    },
    reduceMotion() {
      try {
        if (typeof window !== 'undefined' && window.matchMedia) {
          return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        }
      } catch {
        /* ignore */
      }
      return false
    },
    isLarge() {
      return this.detentKey === 'large'
    },
    /** 宽屏（iPad / 桌面 H5）：走 Sketch iPad 居中卡片，档位不再影响形态 */
    isRegular() {
      return (Number(this.windowWidth) || 375) >= REGULAR_MIN_WIDTH
    },
    /** 宽屏卡片宽：props.width，夹在 [320, 视口 - 64]；0 用默认上限 936 */
    regularWidthPx() {
      const w = Math.max(320, Number(this.windowWidth) || 375)
      const limit = Math.max(320, w - REGULAR_INSET * 2)
      const requested = Number(this.width) || 0
      const base = requested > 0 ? requested : Math.min(REGULAR_MAX_WIDTH, limit)
      return Math.max(320, Math.min(base, limit))
    },
    /** 宽屏卡片高：props.height，夹在 [240, 视口 - 64]；0 用默认上限 770 */
    regularHeightPx() {
      const h = Math.max(320, Number(this.windowHeight) || 667)
      const limit = Math.max(240, h - REGULAR_INSET * 2)
      const requested = Number(this.height) || 0
      const base = requested > 0 ? requested : Math.min(REGULAR_MAX_HEIGHT, limit)
      return Math.max(240, Math.min(base, limit))
    },
    panelHeightPx() {
      const h = Math.max(320, Number(this.windowHeight) || 667)
      if (this.isRegular) {
        return this.regularHeightPx
      }
      if (this.isLarge) {
        const gap = Math.max(LARGE_TOP_GAP_MIN, Number(this.largeTopGap) || LARGE_TOP_GAP_MIN)
        return Math.max(280, Math.round(h - gap))
      }
      return Math.round(h * MEDIUM_RATIO)
    },
    /** 宽屏水平居中留白；窄屏 medium 内缩 8、large 贴边（Sketch 8 / 0） */
    sideInsetPx() {
      if (!this.isRegular) return this.isLarge ? 0 : INSET_MEDIUM
      const w = Math.max(320, Number(this.windowWidth) || 375)
      const panel = this.regularWidthPx
      return Math.round((w - panel) / 2)
    },
    /** 宽屏垂直居中；窄屏见 sideInsetPx */
    bottomInsetPx() {
      if (!this.isRegular) return this.isLarge ? 0 : INSET_MEDIUM
      const h = Math.max(320, Number(this.windowHeight) || 667)
      return Math.round((h - this.panelHeightPx) / 2)
    },
    panelRadiusPx() {
      if (this.isRegular) return RADIUS_REGULAR
      return this.isLarge ? RADIUS_LARGE : RADIUS_MEDIUM
    },
    /** iPad 卡片不可换档，不出 Grabber */
    showGrabber() {
      return !this.isRegular
    },
    rootClass() {
      let themeClass = 'theme-light'
      try {
        themeClass = useLingyunTheme().rootClass || 'theme-light'
      } catch {
        /* pinia 未就绪 */
      }
      return [
        themeClass,
        `lingyun-sheets--${this.detentKey}`,
        this.phase ? `lingyun-sheets--${this.phase}` : '',
        this.reduceMotion ? 'lingyun-sheets--reduce-motion' : '',
        this.dragging ? 'lingyun-sheets--dragging' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    rootStyle() {
      return {
        zIndex: Number(this.zIndex) || 1000,
      }
    },
    panelClass() {
      return {
        'lingyun-sheets__panel--regular': this.isRegular,
        'lingyun-sheets__panel--large': !this.isRegular && this.isLarge,
        'lingyun-sheets__panel--medium': !this.isRegular && !this.isLarge,
        'lingyun-sheets__panel--nudge': this.rejectNudge && !this.reduceMotion,
      }
    },
    /** 屏外起点位移：面板高 + 底部留白，否则收起后残留露头 */
    offsetOutPx() {
      return this.panelHeightPx + this.bottomInsetPx
    },
    panelStyle(): Record<string, string> {
      const radius = this.panelRadiusPx
      // large 贴边贴底：只圆顶角；medium / iPad 卡片四角同值
      const bottomRadius = !this.isRegular && this.isLarge ? 0 : radius
      const style: Record<string, string> = {
        height: `${this.panelHeightPx}px`,
        left: `${this.sideInsetPx}px`,
        right: `${this.sideInsetPx}px`,
        bottom: `${this.bottomInsetPx}px`,
        borderTopLeftRadius: `${radius}px`,
        borderTopRightRadius: `${radius}px`,
        borderBottomLeftRadius: `${bottomRadius}px`,
        borderBottomRightRadius: `${bottomRadius}px`,
      }
      if (this.dragging) {
        style.transform = `translate3d(0, ${this.dragDy}px, 0)`
        style.transition = 'none'
      } else if (this.phase === 'open') {
        style.transform = 'translate3d(0, 0, 0)'
      } else {
        style.transform = `translate3d(0, ${this.offsetOutPx}px, 0)`
      }
      return style
    },
    bodyInnerStyle() {
      const bottom = 16 + (this.safeAreaBottom ? this.safeBottom : 0)
      return {
        paddingBottom: `${bottom}px`,
      }
    },
  },
  watch: {
    visible: {
      immediate: true,
      handler(val: boolean) {
        if (val) {
          this.syncWindow()
          this.lockPageScroll()
          this.openAnim()
        } else {
          this.closeAnim()
        }
      },
    },
    detent() {
      this.syncWindow()
    },
  },
  mounted() {
    this.syncWindow()
    this.bindResize()
  },
  beforeUnmount() {
    this.clearTimers()
    this.unbindResize()
    this.unlockPageScroll()
  },
  methods: {
    syncWindow() {
      try {
        const info =
          typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
        this.windowHeight = Number(info && info.windowHeight) || 667
        this.windowWidth = Number(info && info.windowWidth) || 375
        const inset = info && info.safeAreaInsets
        this.safeBottom = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
      } catch {
        this.windowHeight = 667
        this.windowWidth = 375
        this.safeBottom = 0
      }
      try {
        // 全屏顶缘落在页面顶栏之下（状态栏 + 栏身），避开微信胶囊
        this.largeTopGap = Math.max(LARGE_TOP_GAP_MIN, getLingyunToolbarStackPx())
      } catch {
        this.largeTopGap = LARGE_TOP_GAP_MIN
      }
    },
    bindResize() {
      const onWindowResize = () => {
        this.syncWindow()
      }
      this._onWindowResize = onWindowResize
      try {
        if (typeof uni.onWindowResize === 'function') uni.onWindowResize(onWindowResize)
      } catch {
        /* 端不支持 */
      }
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
      this._onWindowResize = null
    },
    clearTimers() {
      if (this.leaveTimer) {
        clearTimeout(this.leaveTimer)
        this.leaveTimer = null
      }
      if (this.enterTimer) {
        clearTimeout(this.enterTimer)
        this.enterTimer = null
      }
      if (this.nudgeTimer) {
        clearTimeout(this.nudgeTimer)
        this.nudgeTimer = null
      }
      this.rejectNudge = false
    },
    openAnim() {
      this.clearTimers()
      this.mounted = true
      this.dragDy = 0
      this.dragging = false
      // enter = 屏外起点（须与 open 不同，否则无滑入动画）
      this.phase = 'enter'
      this.$nextTick(() => {
        const kick = () => {
          this.enterTimer = setTimeout(
            () => {
              this.phase = 'open'
              this.enterTimer = null
            },
            this.reduceMotion ? 16 : ENTER_KICK_MS,
          )
        }
        // 双 rAF：保证先提交 enter 帧再切 open，H5/小程序都能播过渡
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            requestAnimationFrame(kick)
          })
        } else {
          kick()
        }
      })
    },
    closeAnim() {
      this.clearTimers()
      if (!this.mounted) {
        this.unlockPageScroll()
        return
      }
      this.phase = 'leave'
      this.leaveTimer = setTimeout(
        () => {
          this.mounted = false
          this.phase = ''
          this.leaveTimer = null
          this.dragDy = 0
          this.dragging = false
          this.unlockPageScroll()
        },
        this.reduceMotion ? 16 : LEAVE_MS,
      )
    },
    setVisible(next: boolean) {
      const val = !!next
      this.$emit('update:show', val)
      this.$emit('update:modelValue', val)
      if (!val) this.$emit('close')
    },
    close() {
      this.setVisible(false)
    },
    onOverlayClick() {
      if (this.maskClosable) {
        this.close()
        return
      }
      if (this.phase !== 'open') return
      this.playRejectNudge()
    },
    /** 点遮罩不可关闭：短震动 + 面板水平轻抖（对齐 Alert 的拒绝反馈） */
    playRejectNudge() {
      const fireVibrate = (
        options: UniNamespace.VibrateShortOptions & { type?: 'medium' },
        retry = true,
      ) => {
        try {
          const ret = uni.vibrateShort(options) as unknown
          if (ret && typeof (ret as Promise<unknown>).catch === 'function') {
            ;(ret as Promise<unknown>).catch(() => {})
          }
        } catch {
          if (retry) fireVibrate({ fail: () => {} }, false)
        }
      }
      fireVibrate({ type: 'medium', fail: () => {} })
      if (this.reduceMotion) return
      this.rejectNudge = false
      this.$nextTick(() => {
        this.rejectNudge = true
        if (this.nudgeTimer) clearTimeout(this.nudgeTimer)
        this.nudgeTimer = setTimeout(() => {
          this.rejectNudge = false
          this.nudgeTimer = null
        }, NUDGE_MS)
      })
    },
    onTrailing() {
      this.$emit('trailing')
    },
    /** 打开时锁住底层页面滚动（app-page scroll-view + H5 body），避免内容区滑动穿透 */
    lockPageScroll() {
      try {
        const lockApi = this.appPageScrollLock as LingyunAppPageScrollLock | null
        if (lockApi && typeof lockApi.lock === 'function' && !this._appScrollLocked) {
          lockApi.lock()
          this._appScrollLocked = true
        }
      } catch {
        /* 不在 app-page 内 */
      }
      // #ifdef H5
      if (typeof document === 'undefined') return
      if (this._scrollLocked) return
      const body = document.body
      const html = document.documentElement
      this._prevBodyOverflow = body.style.overflow
      this._prevBodyOverscroll = body.style.overscrollBehavior
      this._prevHtmlOverscroll = html.style.overscrollBehavior
      body.style.overflow = 'hidden'
      body.style.overscrollBehavior = 'none'
      html.style.overscrollBehavior = 'none'
      this._scrollLocked = true
      // #endif
    },
    unlockPageScroll() {
      try {
        const lockApi = this.appPageScrollLock as LingyunAppPageScrollLock | null
        if (this._appScrollLocked && lockApi && typeof lockApi.unlock === 'function') {
          lockApi.unlock()
        }
        this._appScrollLocked = false
      } catch {
        this._appScrollLocked = false
      }
      // #ifdef H5
      if (typeof document === 'undefined') return
      if (!this._scrollLocked) return
      const body = document.body
      const html = document.documentElement
      body.style.overflow = this._prevBodyOverflow || ''
      body.style.overscrollBehavior = this._prevBodyOverscroll || ''
      html.style.overscrollBehavior = this._prevHtmlOverscroll || ''
      this._scrollLocked = false
      // #endif
    },
    /**
     * 面板 touchmove 仅 stop 冒泡，不 prevent —— 否则会掐死内部 scroll-view。
     * 底层滚动靠 lockPageScroll（关 app-page scroll-y）。
     */
    onPanelTouchMove() {
      /* stop 已在模板；占位避免空 handler 被优化掉 */
    },
    onChromeTouchStart(e: TouchEvent) {
      const t = e.touches && e.touches[0]
      if (!t) return
      this.dragStartY = t.clientY
      this.dragDy = 0
      this.dragging = true
    },
    onChromeTouchMove(e: TouchEvent) {
      if (!this.dragging) return
      const t = e.touches && e.touches[0]
      if (!t) return
      const dy = t.clientY - this.dragStartY
      this.dragDy = dy > 0 ? dy : 0
    },
    onChromeTouchEnd() {
      if (!this.dragging) return
      const dy = this.dragDy
      this.dragging = false
      this.dragDy = 0
      if (dy >= DISMISS_DY) {
        this.close()
      }
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

/* 组件宿主：不占布局，浮层已 root-portal / Teleport 出去 */
.lingyun-sheets-host {
  position: fixed;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
}

.lingyun-sheets {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  box-sizing: border-box;
  pointer-events: auto;
  overscroll-behavior: none;
}

.lingyun-sheets__overlay {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: var(--lingyun-mask, #{$lingyun-overlay});
  opacity: 0;
  transition: opacity 0.38s cubic-bezier(0.32, 0.72, 0, 1);
  touch-action: none;
  will-change: opacity;
}

/* 入场起点：遮罩仍透明、面板在屏外（位移量含底部内缩，见 panelStyle） */
.lingyun-sheets--enter .lingyun-sheets__overlay {
  opacity: 0;
}

/* 稳态：遮罩淡入 + 面板自底弹簧滑入 */
.lingyun-sheets--open .lingyun-sheets__overlay {
  opacity: 1;
}

/* 退场：略快于入场，ease-in 下滑（系统 dismiss） */
.lingyun-sheets--leave {
  pointer-events: none;
}

.lingyun-sheets--leave .lingyun-sheets__overlay {
  opacity: 0;
  transition: opacity 0.2s ease-in;
}

.lingyun-sheets--leave .lingyun-sheets__panel {
  transition:
    transform 0.24s cubic-bezier(0.4, 0, 1, 1),
    height 0.24s cubic-bezier(0.4, 0, 1, 1),
    left 0.24s cubic-bezier(0.4, 0, 1, 1),
    right 0.24s cubic-bezier(0.4, 0, 1, 1),
    bottom 0.24s cubic-bezier(0.4, 0, 1, 1);
}

.lingyun-sheets__panel {
  position: absolute;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  /* iOS sheet：约 0.42s 减速弹簧曲线 */
  transition:
    transform 0.42s cubic-bezier(0.32, 0.72, 0, 1),
    height 0.38s cubic-bezier(0.32, 0.72, 0, 1),
    left 0.38s cubic-bezier(0.32, 0.72, 0, 1),
    right 0.38s cubic-bezier(0.32, 0.72, 0, 1),
    bottom 0.38s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
  /*
   * 与 Toolbar 同一套活玻璃：surface + 全端 blur；遮罩分担挡字。
   * 圆角与四周内缩由 panelStyle 内联下发（medium 8/34、large 0/38）。
   */
  @include lingyun-glass-surface;
  /* Sketch Medium Detent 投影：0 18 46 rgba(0,0,0,.25) */
  box-shadow: var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    0 18px 46px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-sheets.theme-dark .lingyun-sheets__panel {
  border: #{$lingyun-glass-hairline-dark};
  box-shadow: #{$lingyun-glass-highlight-dark}, 0 18px 48px rgba(0, 0, 0, 0.45);
  background-color: #{$lingyun-glass-overlay-bg-dark};
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

/* 点遮罩不可关闭：面板水平轻抖（同 Alert 拒绝语汇） */
.lingyun-sheets__panel--nudge {
  animation: lingyun-sheets-nudge 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes lingyun-sheets-nudge {
  0%,
  100% {
    transform: translateX(0);
  }
  12% {
    transform: translateX(-11px);
  }
  24% {
    transform: translateX(11px);
  }
  36% {
    transform: translateX(-8px);
  }
  48% {
    transform: translateX(8px);
  }
  60% {
    transform: translateX(-4px);
  }
  72% {
    transform: translateX(4px);
  }
  84% {
    transform: translateX(-2px);
  }
}

/*
 * Sketch Large Detent：贴边贴底 + 不透明分组背景（#FFFFFF / #1C1C1E），
 * 不是玻璃 —— 内容满屏时不需要透底，且避免长表单文字被背景干扰。
 */
.lingyun-sheets__panel--large,
.lingyun-sheets.theme-dark .lingyun-sheets__panel--large {
  border: 0;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.18);
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/*
 * Sketch Sheets/iPad：居中卡片同样是不透明分组背景（#FFFFFF / #1C1C1E），
 * 无描边、无投影；四角 32 与居中留白由 panelStyle 内联下发。
 */
.lingyun-sheets__panel--regular,
.lingyun-sheets.theme-dark .lingyun-sheets__panel--regular {
  border: 0;
  box-shadow: none;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* iPad 无 Grabber，顶栏改由面板顶部内边距 10 撑开（Sketch Sheet padding-top） */
.lingyun-sheets__panel--regular .lingyun-sheets__chrome {
  padding-top: 10px;
}

.lingyun-sheets--reduce-motion .lingyun-sheets__overlay,
.lingyun-sheets--reduce-motion .lingyun-sheets__panel {
  transition-duration: 0.01s !important;
  transition-property: opacity !important;
}

.lingyun-sheets--reduce-motion.lingyun-sheets--enter .lingyun-sheets__panel,
.lingyun-sheets--reduce-motion.lingyun-sheets--leave .lingyun-sheets__panel,
.lingyun-sheets--reduce-motion.lingyun-sheets--open .lingyun-sheets__panel {
  transform: translate3d(0, 0, 0) !important;
}

.lingyun-sheets--reduce-motion .lingyun-sheets__panel--nudge {
  animation: none !important;
}

.lingyun-sheets--dragging .lingyun-sheets__panel {
  transition: none !important;
}

.lingyun-sheets__chrome {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  touch-action: none;
  /* #ifdef H5 */
  user-select: none;
  -webkit-user-select: none;
  /* #endif */
}

.lingyun-sheets__grabber {
  width: 60px;
  height: 4px;
  margin: 5px auto 0;
  border-radius: 2px;
  background-color: #cfcfcf;
}

.lingyun-sheets.theme-dark .lingyun-sheets__grabber {
  background-color: #8e8e93;
}

.lingyun-sheets__toolbar {
  /* 顶栏在玻璃面板内，自身透明 */
  background: transparent !important;
}

.lingyun-sheets__body {
  flex: 1;
  height: 0;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  touch-action: pan-y;
  overscroll-behavior: contain;
}

/* 小程序上转发给顶栏的 title 插槽总是存在，顶栏不会再画默认标题，这里补上同款样式 */
.lingyun-sheets__title {
  display: block;
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

.lingyun-sheets__body-inner {
  box-sizing: border-box;
  padding: 8px 16px 16px;
  min-height: 100%;
}

/* 内置 trailing 复用 lingyun-button（borderedProminent · medium） */
.lingyun-sheets__trailing-button {
  flex-shrink: 0;
}
</style>
