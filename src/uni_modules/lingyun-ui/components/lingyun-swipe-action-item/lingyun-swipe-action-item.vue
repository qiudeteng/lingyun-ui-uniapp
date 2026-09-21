<template>
  <!-- #ifdef APP-VUE || APP-HARMONY || MP-WEIXIN || H5 -->
  <view class="lingyun-swipe-action-item" :class="themeClass">
    <!-- prop 与手势必须同节点（对齐 uni-swipe-action）：change 回写 is_show 会再触发 showWatch 校准位移 -->
    <!-- #ifdef H5 -->
    <view
      class="lingyun-swipe-action-item__box"
      :change:prop="wxsswipe.showWatch"
      :prop="is_show"
      :data-threshold="threshold"
      :data-disabled="disabled"
      @touchstart="wxsswipe.touchstart"
      @touchmove="wxsswipe.touchmove"
      @touchend="wxsswipe.touchend"
      @touchcancel="wxsswipe.touchcancel"
      @mousedown="wxsswipe.mousedown"
      @mousemove="wxsswipe.mousemove"
      @mouseup="wxsswipe.mouseup"
      @mouseleave="wxsswipe.mouseleave"
    >
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <view
      class="lingyun-swipe-action-item__box"
      :change:prop="wxsswipe.showWatch"
      :prop="is_show"
      :data-threshold="threshold"
      :data-disabled="disabled"
      @touchstart="wxsswipe.touchstart"
      @touchmove="wxsswipe.touchmove"
      @touchend="wxsswipe.touchend"
      @touchcancel="wxsswipe.touchcancel"
    >
    <!-- #endif -->
    <!-- #ifndef MP-WEIXIN || H5 -->
    <!-- App 端 WXS 不可用，走 renderjs（对齐 uni-swipe-action） -->
    <view
      class="lingyun-swipe-action-item__box"
      :change:prop="renderswipe.showWatch"
      :prop="is_show"
      :data-threshold="threshold"
      :data-disabled="disabled + ''"
      @touchstart="renderswipe.touchstart"
      @touchmove="renderswipe.touchmove"
      @touchend="renderswipe.touchend"
      @touchcancel="renderswipe.touchcancel"
    >
    <!-- #endif -->
      <!-- 灰胶囊独立背景层：无子节点，圆角只绘制自身、不裁剪子树；类名由 wx.wxs 在定型时切换 -->
      <view class="lingyun-swipe-action-item__row-bg" />

      <view class="lingyun-swipe-action-item__btns button-group--left">
        <slot name="left">
          <view
            v-for="(item, index) in normalizedLeft"
            :key="item.key || index"
            class="lingyun-swipe-action-item__btn"
            :class="btnClass(item)"
            :style="btnInlineStyle(item)"
            @touchstart.stop="appTouchStart"
            @touchmove.stop="appTouchMove"
            @touchend.stop="appTouchEnd($event, index, item, 'left')"
            @click.stop="onClickForPc(index, item, 'left')"
          >
            <view v-if="hasIcon(item)" class="lingyun-swipe-action-item__symbol">
              <lingyun-icon
                v-if="item.iconType"
                class="lingyun-swipe-action-item__uni-icon"
                :type="item.iconType"
                :size="18"
                color="#ffffff"
              />
              <text v-else class="lingyun-swipe-action-item__icon">{{ item.icon }}</text>
            </view>
            <text v-if="item.text" class="lingyun-swipe-action-item__text">{{ item.text }}</text>
          </view>
        </slot>
      </view>

      <!-- 打开态类名由 wx.wxs 直接增删，勿加 Vue class 绑定（否则重渲染会把它冲掉） -->
      <view class="lingyun-swipe-action-item__content">
        <slot />
      </view>


      <view class="lingyun-swipe-action-item__btns button-group--right">
        <slot name="right">
          <view
            v-for="(item, index) in normalizedRight"
            :key="item.key || index"
            class="lingyun-swipe-action-item__btn"
            :class="btnClass(item)"
            :style="btnInlineStyle(item)"
            @touchstart.stop="appTouchStart"
            @touchmove.stop="appTouchMove"
            @touchend.stop="appTouchEnd($event, index, item, 'right')"
            @click.stop="onClickForPc(index, item, 'right')"
          >
            <view v-if="hasIcon(item)" class="lingyun-swipe-action-item__symbol">
              <lingyun-icon
                v-if="item.iconType"
                class="lingyun-swipe-action-item__uni-icon"
                :type="item.iconType"
                :size="18"
                color="#ffffff"
              />
              <text v-else class="lingyun-swipe-action-item__icon">{{ item.icon }}</text>
            </view>
            <text v-if="item.text" class="lingyun-swipe-action-item__text">{{ item.text }}</text>
          </view>
        </slot>
      </view>
    </view>
  </view>
  <!-- #endif -->

  <!-- #ifndef APP-VUE || APP-HARMONY || MP-WEIXIN || H5 -->
  <view class="lingyun-swipe-action-item" :class="themeClass">
    <view
      class="lingyun-swipe-action-item__box"
      :class="{ ani: ani }"
      :style="{ transform: moveLeft }"
      @touchstart="touchstart"
      @touchmove="touchmove"
      @touchend="touchend"
      @touchcancel="touchcancel"
    >
      <view class="lingyun-swipe-action-item__row-bg" :style="rowBgStyle" />
      <view class="lingyun-swipe-action-item__btns button-group--left">
        <slot name="left">
          <view
            v-for="(item, index) in normalizedLeft"
            :key="item.key || index"
            class="lingyun-swipe-action-item__btn"
            :class="btnClass(item)"
            :style="btnInlineStyle(item)"
            @touchstart.stop="appTouchStart"
            @touchmove.stop="appTouchMove"
            @touchend.stop="appTouchEnd($event, index, item, 'left')"
          >
            <view v-if="hasIcon(item)" class="lingyun-swipe-action-item__symbol">
              <lingyun-icon
                v-if="item.iconType"
                class="lingyun-swipe-action-item__uni-icon"
                :type="item.iconType"
                :size="18"
                color="#ffffff"
              />
              <text v-else class="lingyun-swipe-action-item__icon">{{ item.icon }}</text>
            </view>
            <text v-if="item.text" class="lingyun-swipe-action-item__text">{{ item.text }}</text>
          </view>
        </slot>
      </view>
      <view class="lingyun-swipe-action-item__content">
        <slot />
      </view>
      <view class="lingyun-swipe-action-item__btns button-group--right">
        <slot name="right">
          <view
            v-for="(item, index) in normalizedRight"
            :key="item.key || index"
            class="lingyun-swipe-action-item__btn"
            :class="btnClass(item)"
            :style="btnInlineStyle(item)"
            @touchstart.stop="appTouchStart"
            @touchmove.stop="appTouchMove"
            @touchend.stop="appTouchEnd($event, index, item, 'right')"
          >
            <view v-if="hasIcon(item)" class="lingyun-swipe-action-item__symbol">
              <lingyun-icon
                v-if="item.iconType"
                class="lingyun-swipe-action-item__uni-icon"
                :type="item.iconType"
                :size="18"
                color="#ffffff"
              />
              <text v-else class="lingyun-swipe-action-item__icon">{{ item.icon }}</text>
            </view>
            <text v-if="item.text" class="lingyun-swipe-action-item__text">{{ item.text }}</text>
          </view>
        </slot>
      </view>
    </view>
  </view>
  <!-- #endif -->
</template>

<script src="./wx.wxs" module="wxsswipe" lang="wxs"></script>

<script module="renderswipe" lang="renderjs">
import render from './render.js'

export default {
  mounted() {
    this.state = {}
  },
  methods: {
    showWatch(newVal, oldVal, ownerInstance, instance) {
      render.showWatch(newVal, oldVal, ownerInstance, instance, this)
    },
    touchstart(e, ownerInstance) {
      render.touchstart(e, ownerInstance, this)
    },
    touchmove(e, ownerInstance) {
      render.touchmove(e, ownerInstance, this)
    },
    touchend(e, ownerInstance) {
      render.touchend(e, ownerInstance, this)
    },
    touchcancel(e, ownerInstance) {
      render.touchcancel(e, ownerInstance, this)
    },
  },
}
</script>

<script>
import mpWxs from './mp-wxs.js'
import mpJs from './mp-js.js'
import { useThemeStore } from '@/stores/theme'

const ROLE_COLORS = {
  destructive: '#ff383c',
  warning: '#ff8d28',
  success: '#34c759',
  primary: '#0088ff',
  default: '#8e8e93',
  gray: '#8e8e93',
  orange: '#ff8d28',
  red: '#ff383c',
  blue: '#0088ff',
  green: '#34c759',
  purple: '#af52de',
  pink: '#ff2d55',
  indigo: '#5856d6',
  teal: '#5ac8fa',
}

/**
 * lingyun-swipe-action-item
 * @description 对齐 Apple iOS 27 Lists · Rows with Swipe Actions（Sketch）
 * @see design/SWIPE_ACTIONS.md
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists%252FLight%252FRows%2520with%2520Swipe%2520Actions
 *
 * @property {String} show = [none|left|right] 受控开关（autoClose=false 时）
 * @property {Boolean} disabled
 * @property {Boolean} autoClose 打开时是否关闭其它项
 * @property {Boolean} closeOnClick 点击按钮后是否关闭
 * @property {Number} threshold 开启阈值（px）
 * @property {Array} leftOptions / rightOptions [{ text, icon, iconType, key, role|color, style }]
 * @event click { content, index, position, key }
 * @event change none|left|right
 */
export default {
  name: 'LingyunSwipeActionItem',
  mixins: [mpWxs, mpJs],
  emits: ['click', 'change'],
  /**
   * lingyunSwipeHost：常量，关掉 list-item hover。
   * lingyunSwipeSurface：可变对象，滑动中藏分割线（本行顶线 + 下一行顶线）。
   */
  provide() {
    return {
      lingyunSwipeHost: true,
      lingyunSwipeSurface: this.swipeSurface,
    }
  },
  props: {
    show: { type: String, default: 'none' },
    disabled: { type: Boolean, default: false },
    autoClose: { type: Boolean, default: true },
    closeOnClick: { type: Boolean, default: true },
    threshold: { type: Number, default: 30 },
    leftOptions: {
      type: Array,
      default() {
        return []
      },
    },
    rightOptions: {
      type: Array,
      default() {
        return []
      },
    },
  },
  computed: {
    normalizedLeft() {
      return this.normalizeOptions(this.leftOptions)
    },
    normalizedRight() {
      return this.normalizeOptions(this.rightOptions)
    },
    themeClass() {
      try {
        return useThemeStore().rootClass || 'theme-light'
      } catch {
        return 'theme-light'
      }
    },
  },
  // #ifdef VUE3
  unmounted() {
    this.__isUnmounted = true
    this.uninstall()
  },
  // #endif
  // #ifndef VUE3
  destroyed() {
    if (this.__isUnmounted) return
    this.uninstall()
  },
  // #endif
  methods: {
    normalizeOptions(list) {
      if (!Array.isArray(list)) return []
      return list.map((item, index) => {
        if (typeof item === 'string') {
          return { text: item, key: `opt-${index}`, role: 'default' }
        }
        return {
          text: item.text || '',
          icon: item.icon || '',
          iconType: item.iconType || '',
          key: item.key != null ? item.key : `opt-${index}`,
          role: item.role || item.color || 'default',
          style: item.style || null,
        }
      })
    },
    hasIcon(item) {
      return !!(item && (item.iconType || item.icon))
    },
    btnClass(item) {
      const role = (item && item.role) || 'default'
      const known = ROLE_COLORS[role] ? role : 'default'
      const onlyIcon = !!(this.hasIcon(item) && !(item && item.text))
      return [
        `lingyun-swipe-action-item__btn--${known}`,
        onlyIcon ? 'lingyun-swipe-action-item__btn--icon-only' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    btnInlineStyle(item) {
      const style = {}
      const custom = (item && item.style) || {}
      const role = (item && item.role) || 'default'
      const bg = custom.backgroundColor || ROLE_COLORS[role] || ROLE_COLORS.default
      style.backgroundColor = bg
      if (custom.color) style.color = custom.color
      if (custom.fontSize) style.fontSize = custom.fontSize
      if (custom.width) style.width = typeof custom.width === 'number' ? `${custom.width}px` : custom.width
      if (custom.minWidth) {
        style.minWidth = typeof custom.minWidth === 'number' ? `${custom.minWidth}px` : custom.minWidth
      }
      return style
    },
    uninstall() {
      if (typeof this.setSwipeDividersHidden === 'function') {
        this.setSwipeDividersHidden({ hide: false })
      }
      if (!this.swipeaction || !Array.isArray(this.swipeaction.children)) return
      const i = this.swipeaction.children.indexOf(this)
      if (i >= 0) this.swipeaction.children.splice(i, 1)
    },
    getSwipeAction(name = 'LingyunSwipeAction') {
      let parent = this.$parent
      while (parent) {
        if (parent.$options && parent.$options.name === name) return parent
        parent = parent.$parent
      }
      return null
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

/* Sketch Trailing · Symbol+Label：胶囊 84×44、间距 10；非整行通栏色块 */
$ly-swipe-btn-h: 44px;
$ly-swipe-btn-min: 84px;
$ly-swipe-btn-icon: 44px;
$ly-swipe-btn-gap: 10px;
$ly-swipe-btn-pad-x: 12px;

/*
 * 结构与每帧开销对齐官方 uni-swipe-action（官方真机无闪烁，差异全部摘除）：
 * ❌ 不要在随 transform 动画的子树上做 overflow 裁剪 / 大圆角
 * ❌ 不要给 __box 加 will-change / backface-visibility / translateZ 等提层写法
 * 视觉差异只允许体现在「按钮胶囊」与「独立背景层画的 Row 灰胶囊」上。
 */
.lingyun-swipe-action-item {
  position: relative;
  overflow: hidden;
  width: 100%;
  /*
   * ❌ 不要给 root 上底色：滑开后露出的按钮区直接透 lingyun-list__card 的卡片色即可。
   * 自己画不透明矩形反而会在卡片首尾行戳出直角（微信 overflow 不保证裁子自定义组件）。
   */
}

.lingyun-swipe-action-item__box {
  position: relative;
  display: flex;
  flex-shrink: 0;
  width: 100%;
}

/*
 * Sketch Row 灰胶囊：浅 #E5E5EA / 暗 #2C2C2E。
 * 独立空节点 + pill；opacity 由 WXS/renderjs 跟手写入（约 32px 内 0→1）。
 * ❌ 不用 --open 类切 opacity（会与 inline 打架）；❌ 不给按钮组叠 scale。
 */
.lingyun-swipe-action-item__row-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: $lingyun-glass-radius-pill;
  background-color: var(--lingyun-swipe-row-bg, #{$lingyun-system-gray5});
  opacity: 0;
  pointer-events: none;
}

.lingyun-swipe-action-item.theme-light .lingyun-swipe-action-item__row-bg {
  background-color: #{$lingyun-system-gray5};
}

.lingyun-swipe-action-item.theme-dark .lingyun-swipe-action-item__row-bg {
  background-color: #{$lingyun-system-gray5-dark};
}

.lingyun-swipe-action-item__content {
  /* relative：盖在 __row-bg 之上（两者同为定位元素，按 DOM 顺序绘制） */
  position: relative;
  width: 100%;
  flex-shrink: 0;
  /* #ifdef H5 */
  cursor: grab;
  /* #endif */

  /* 分割线改由 list-item inject swipeSurface.hideDivider 控制，不再用 --open 切变量 */
}

.lingyun-swipe-action-item__btns {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  gap: $ly-swipe-btn-gap;
  /* #ifdef H5 */
  cursor: pointer;
  /* #endif */
}

/* 定位方式与官方一致；最外侧贴边，靠内容侧留 10 与圆角 Row 分离（对齐 Sketch） */
.button-group--left {
  left: 0;
  padding-left: 0;
  padding-right: $ly-swipe-btn-gap;
  transform: translateX(-100%);
}

.button-group--right {
  right: 0;
  padding-left: $ly-swipe-btn-gap;
  padding-right: 0;
  transform: translateX(100%);
}

.lingyun-swipe-action-item__btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  height: $ly-swipe-btn-h;
  min-width: $ly-swipe-btn-min;
  padding: 0 $ly-swipe-btn-pad-x;
  border-radius: $lingyun-glass-radius-pill;
  background-color: $lingyun-system-gray;
  flex-shrink: 0;
}

.lingyun-swipe-action-item__btn--icon-only {
  width: $ly-swipe-btn-icon;
  min-width: $ly-swipe-btn-icon;
  padding: 0;
}

/* Sketch Symbol：固定正方形，避免文字/emoji 被胶囊横向拉扁 */
.lingyun-swipe-action-item__symbol {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.lingyun-swipe-action-item__uni-icon {
  width: 20px !important;
  height: 20px !important;
  line-height: 20px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-swipe-action-item__icon {
  width: 20px;
  height: 20px;
  font-size: 17px;
  line-height: 20px;
  text-align: center;
  color: #ffffff;
  overflow: hidden;
}

.lingyun-swipe-action-item__text {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: -0.24px;
  color: #ffffff;
}

.lingyun-swipe-action-item__btn--destructive,
.lingyun-swipe-action-item__btn--red {
  background-color: $lingyun-system-red;
}

.lingyun-swipe-action-item__btn--warning,
.lingyun-swipe-action-item__btn--orange {
  background-color: $lingyun-system-orange;
}

.lingyun-swipe-action-item__btn--success,
.lingyun-swipe-action-item__btn--green {
  background-color: $lingyun-system-green;
}

.lingyun-swipe-action-item__btn--primary,
.lingyun-swipe-action-item__btn--blue {
  background-color: $lingyun-system-blue;
}

.lingyun-swipe-action-item__btn--purple {
  background-color: $lingyun-system-purple;
}

.lingyun-swipe-action-item__btn--pink {
  background-color: $lingyun-system-pink;
}

.lingyun-swipe-action-item__btn--indigo {
  background-color: $lingyun-system-indigo;
}

.lingyun-swipe-action-item__btn--teal {
  background-color: $lingyun-system-teal;
}

.lingyun-swipe-action-item__btn--default,
.lingyun-swipe-action-item__btn--gray {
  background-color: $lingyun-system-gray;
}

/* 类名与曲线均对齐官方（wx.wxs / render.js 约定名为 ani，勿改） */
.ani {
  transition-property: transform;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
}
</style>
