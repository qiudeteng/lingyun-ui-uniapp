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

    <view class="lingyun-toolbars__bar" :style="barStyle">
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
            <lingyun-icon type="left" :size="20" color="var(--lingyun-label, #000)" />
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
            <lingyun-icon type="closeempty" :size="18" color="var(--lingyun-label, #000)" />
          </slot>
        </view>
        <slot name="leading" />
      </view>

      <view v-if="showInlineTitle" class="lingyun-toolbars__title-wrap" :class="titleWrapClass">
        <slot name="title">
          <text class="lingyun-toolbars__title">{{ title }}</text>
        </slot>
        <slot v-if="showInlineSubtitle" name="subtitle">
          <text class="lingyun-toolbars__subtitle">{{ subtitle }}</text>
        </slot>
      </view>

      <view class="lingyun-toolbars__trailing">
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
          <lingyun-icon type="upload" :size="18" color="#ffffff" />
        </view>
      </view>
    </view>

    <view v-if="showLargeTitle" class="lingyun-toolbars__large" :style="largeStyle">
      <slot name="title">
        <text class="lingyun-toolbars__large-title">{{ title }}</text>
      </slot>
      <slot v-if="showLargeSubtitle" name="subtitle">
        <text class="lingyun-toolbars__large-subtitle">{{ subtitle }}</text>
      </slot>
    </view>
  </view>
</template>

<script>
import { getCurrentInstance } from 'vue'
import { onResize } from '@dcloudio/uni-app'
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
import { useThemeStore } from '@/stores/theme'

/**
 * lingyun-toolbars
 * @description 对齐 Sketch Toolbars。窄屏 iPhone；宽屏（≥700，含折叠屏展开）iPad；Mac 桌面加窗口按钮
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Toolbars%252FLight%252FiPhone
 * @see design/TOOLBARS.md
 *
 * @property {Number} glassProgress 0~1：栏身玻璃强度（0 全透明，1 满液态玻璃）
 * 暗黑：根挂 theme-*，圆钮用浅银霜半透明（勿走 Alert 高 alpha）
 */
export default {
  name: 'LingyunToolbars',
  emits: ['back', 'close', 'trailing'],
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
    fixed: {
      type: Boolean,
      default: false,
    },
    safeArea: {
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
    }
  },
  setup() {
    const instance = getCurrentInstance()
    onResize((res) => {
      const proxy = instance && instance.proxy
      if (proxy && typeof proxy.syncNavLayout === 'function') {
        proxy.syncNavLayout(readLingyunResizeWidth(res))
      }
    })
    return {}
  },
  created() {
    this.syncNavLayout()
  },
  mounted() {
    this.syncNavLayout()
    this.bindResize()
  },
  beforeUnmount() {
    this.unbindResize()
  },
  watch: {
    safeArea() {
      this.syncNavLayout()
    },
  },
  computed: {
    placementKey() {
      return this.placement === 'sheet' ? 'sheet' : 'standard'
    },
    styleKey() {
      const allowed = [
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
    /** 标题层左右让出较宽的一侧，文字仍按栏身几何中心排 */
    titleInsetPx() {
      const action = 44
      let leading = action
      if (this.windowControls) leading += LINGYUN_TOOLBAR_WINDOW_CONTROLS_W_PX + this.gapPx
      return Math.max(leading, action) + this.gapPx
    },
    largeStyle() {
      const extra =
        this.styleKey === 'title2LineLarge' ? this.title2LineLargeExtraPx : this.largeExtraPx
      return {
        minHeight: `${extra}px`,
      }
    },
    /** 内容区最小高度（不含状态栏） */
    contentMinHeightPx() {
      let h = this.barHeightPx
      if (this.showGrabberEffective) h += 16
      if (this.isLarge) {
        h +=
          this.styleKey === 'title2LineLarge' ? this.title2LineLargeExtraPx : this.largeExtraPx
      }
      return h
    },
    rootStyle() {
      const style = {
        minHeight: `${this.contentMinHeightPx}px`,
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
      return style
    },
    showInlineTitle() {
      return !this.isLarge
    },
    showInlineSubtitle() {
      return this.showInlineTitle && this.isTwoLine && !!this.subtitle
    },
    showLargeTitle() {
      return this.isLarge
    },
    showLargeSubtitle() {
      return this.isLarge && this.isTwoLine && !!this.subtitle
    },
    titleWrapClass() {
      return {
        'lingyun-toolbars__title-wrap--left': this.isTitleLeft,
        'lingyun-toolbars__title-wrap--two': this.isTwoLine,
      }
    },
    glassAmount() {
      const n = Number(this.glassProgress)
      if (Number.isNaN(n)) return 0
      return Math.min(1, Math.max(0, n))
    },
    themeClass() {
      try {
        return useThemeStore().rootClass || 'theme-light'
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
    syncNavLayout(windowWidth) {
      const width = Number(windowWidth)
      const layout = getLingyunNavLayout(
        LINGYUN_TOOLBAR_BAR_DESIGN_PX,
        Number.isFinite(width) && width > 0 ? width : undefined,
      )
      let status = this.safeArea ? layout.statusBarHeight : 0
      let bar = layout.barHeight
      let bottomExtra = 0
      this.regular = layout.regular
      this.windowControls = layout.windowControls
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
      this.rightInsetPx = this.safeArea ? layout.rightInset : 0
    },
    bindResize() {
      this._onWindowResize = (res) => {
        this.syncNavLayout(readLingyunResizeWidth(res))
      }
      try {
        if (typeof uni.onWindowResize === 'function') uni.onWindowResize(this._onWindowResize)
      } catch {
        /* 端不支持 */
      }
      // H5 拖窗口不一定走 uni.onWindowResize
      // #ifdef H5
      if (typeof window !== 'undefined') window.addEventListener('resize', this._onWindowResize)
      // #endif
    },
    unbindResize() {
      try {
        if (this._onWindowResize && typeof uni.offWindowResize === 'function') {
          uni.offWindowResize(this._onWindowResize)
        }
      } catch {
        /* 端不支持 */
      }
      // #ifdef H5
      if (typeof window !== 'undefined' && this._onWindowResize) {
        window.removeEventListener('resize', this._onWindowResize)
      }
      // #endif
      this._onWindowResize = null
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
  },
}
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

.lingyun-toolbars__leading,
.lingyun-toolbars__trailing {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--ly-toolbar-gap, #{$ly-toolbar-gap});
  flex-shrink: 0;
  z-index: 1;
  min-width: $ly-toolbar-action;
}

.lingyun-toolbars__trailing {
  justify-content: flex-end;
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
  right: var(--ly-toolbar-title-inset, #{$ly-toolbar-action + $ly-toolbar-gap});
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
    /* 控件钮：小程序也用半透明 regular-bg，勿走 Alert 用的 0.94 实霜 */
    @include lingyun-glass-surface;
    border-radius: $lingyun-glass-radius-pill;
  }

  &--prominent {
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

/* 暗黑圆钮：浅银霜半透明（写死 token，避免吃到 Alert overlay 高 alpha） */
.lingyun-toolbars.theme-dark .lingyun-toolbars__action--glass {
  background-color: #{$lingyun-glass-regular-bg-dark};
  border: #{$lingyun-glass-hairline-dark};
  box-shadow: #{$lingyun-glass-highlight-dark}, #{$lingyun-glass-shadow-dark};
  /* #ifdef H5 || APP-PLUS */
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  /* #endif */
}
</style>
