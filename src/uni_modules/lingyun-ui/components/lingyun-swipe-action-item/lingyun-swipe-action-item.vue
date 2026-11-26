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

<!-- #ifndef APP -->
<script src="./wx.wxs" module="wxsswipe" lang="wxs"></script>
<!-- #endif -->

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

<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { inject, provide, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import {
  LINGYUN_APP_PAGE_SCROLL_LOCK,
  type LingyunAppPageScrollLock,
} from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

const ROLE_COLORS: Record<string, string> = {
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

type SwipeOptionStyle = {
  backgroundColor?: string
  color?: string
  fontSize?: string | number
  width?: string | number
  minWidth?: string | number
}

type SwipeOptionInput = {
  text?: string
  icon?: string
  iconType?: string
  key?: string | number
  role?: string
  color?: string
  style?: SwipeOptionStyle | null
}

type SwipeOption = {
  text: string
  key: string | number
  role: string
  icon?: string
  iconType?: string
  style?: SwipeOptionStyle | null
}

type SwipeSurface = {
  hideDivider: boolean
  hideDividerFromPrev: boolean
}

type DividerArg = boolean | { hide?: boolean } | null | undefined

type SwipeClickItem = {
  key?: string | number
  text?: string
}

type SwipeSibling = {
  setHideDividerFromPrev?: (hide: boolean) => void
  swipeSurface?: { hideDividerFromPrev?: boolean }
}

type OpenArg = { open?: string } | null | undefined

type SwipeItemApi = {
  swipeSurface: SwipeSurface
  close: () => void
  init?: () => void
  setHideDividerFromPrev?: (hide?: boolean) => void
  setSwipeDividersHidden?: (e?: { hide?: boolean } | null) => void
}

type SwipeActionCtx = {
  children: SwipeItemApi[]
  openItem: SwipeItemApi | null
  closeAll: () => void
  resize: () => void
  closeOther: (vm: SwipeItemApi) => void
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
defineOptions({
  name: 'LingyunSwipeActionItem',
})

const props = defineProps({
  show: { type: String, default: 'none' },
  disabled: { type: Boolean, default: false },
  autoClose: { type: Boolean, default: true },
  closeOnClick: { type: Boolean, default: true },
  threshold: { type: Number, default: 30 },
  leftOptions: {
    type: Array as PropType<Array<string | SwipeOptionInput>>,
    default() {
      return [] as Array<string | SwipeOptionInput>
    },
  },
  rightOptions: {
    type: Array as PropType<Array<string | SwipeOptionInput>>,
    default() {
      return [] as Array<string | SwipeOptionInput>
    },
  },
})

const emit = defineEmits(['click', 'change'])

/** 父容器（lingyun-swipe-action）显式 provide 的上下文，替代原 $parent 链查找 */
const swipeActionCtx = inject<SwipeActionCtx | null>('lingyunSwipeActionCtx', null)

function getSwipeAction(_name: string = 'LingyunSwipeAction'): SwipeActionCtx | null {
  return swipeActionCtx
}

function normalizeOptions(list: unknown): SwipeOption[] {
  if (!Array.isArray(list)) return []
  return list.map((item: unknown, index: number) => {
    if (typeof item === 'string') {
      return { text: item, key: `opt-${index}`, role: 'default' }
    }
    const rec = item as SwipeOptionInput
    return {
      text: rec.text || '',
      icon: rec.icon || '',
      iconType: rec.iconType || '',
      key: rec.key != null ? rec.key : `opt-${index}`,
      role: rec.role || rec.color || 'default',
      style: rec.style || null,
    }
  })
}

function hasIcon(item: SwipeOption | null | undefined): boolean {
  return !!(item && (item.iconType || item.icon))
}

function btnClass(item: SwipeOption | null | undefined): string {
  const role = (item && item.role) || 'default'
  const known = ROLE_COLORS[role] ? role : 'default'
  const onlyIcon = !!(hasIcon(item) && !(item && item.text))
  return [
    `lingyun-swipe-action-item__btn--${known}`,
    onlyIcon ? 'lingyun-swipe-action-item__btn--icon-only' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function btnInlineStyle(item: SwipeOption | null | undefined): Record<string, string | number> {
  const style: Record<string, string | number> = {}
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
}

const normalizedLeft = computed((): SwipeOption[] => normalizeOptions(props.leftOptions))

const normalizedRight = computed((): SwipeOption[] => normalizeOptions(props.rightOptions))

const themeClass = computed((): string => {
  try {
    return useLingyunTheme().rootClass || 'theme-light'
  } catch {
    return 'theme-light'
  }
})

/**
 * 子项登记用的 API 对象：父容器 children 里存的就是它。
 * 先声明、后在各平台分支内填充方法，避免前向引用。
 */
const swipeItemApi = {} as SwipeItemApi
let _isUnmounted = false

/* #ifdef APP-VUE || APP-HARMONY || MP-WEIXIN || H5 */
let isPc: boolean | null = null
// #ifdef H5
function detectPc(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod', 'Mobile', 'Harmony', 'HarmonyOS']
  return !agents.some((a) => ua.indexOf(a) > 0)
}
isPc = detectPc()
// #endif

const is_show = ref<string>('none')
/** 给内部 list-item inject：本行藏线 / 上一行借走本行顶线 */
const swipeSurface = reactive({
  hideDivider: false,
  hideDividerFromPrev: false,
} as SwipeSurface)
/** 刻意不用 ref：容器上下文内部靠对象身份比对（openItem !== vm），
 *  套一层响应式会把对象包成 proxy，导致同一行再次触摸被误判为“其它行”而自关。 */
let swipeaction: SwipeActionCtx | null = null
const clientX = ref(undefined as number | undefined)
const timestamp = ref(0)
const _pageScrollLocked = ref(false)
const lingyunAppPageScrollLock = inject<LingyunAppPageScrollLock | null>(LINGYUN_APP_PAGE_SCROLL_LOCK, null)

/** wxs 中调用 */
function closeSwipe(): void {
  if (props.autoClose && swipeaction) {
    swipeaction.closeOther(swipeItemApi)
  }
}

/**
 * wxs / renderjs：横向确认后锁页面 scroll-view；松手解锁。
 * 无 app-page 包裹时 inject 为空，静默跳过。
 */
function lockPageScroll(): void {
  if (_pageScrollLocked.value) return
  _pageScrollLocked.value = true
  const api = lingyunAppPageScrollLock as LingyunAppPageScrollLock | null
  if (api && typeof api.lock === 'function') api.lock()
}

function unlockPageScroll(): void {
  if (!_pageScrollLocked.value) return
  _pageScrollLocked.value = false
  const api = lingyunAppPageScrollLock as LingyunAppPageScrollLock | null
  if (api && typeof api.unlock === 'function') api.unlock()
}

/**
 * wxs / renderjs：藏本行顶线，并借下一行顶线当「底边」。
 * 下一行用 hideDividerFromPrev，避免和它自己的 hideDivider 互相覆盖（iOS 上下线错乱主因）。
 */
function setSwipeDividersHidden(e?: { hide?: boolean } | null): void {
  const hide = !!(e && e.hide)
  if (swipeSurface.hideDivider !== hide) {
    swipeSurface.hideDivider = hide
  }
  const children = swipeaction && swipeaction.children
  if (!Array.isArray(children)) return
  const i = children.indexOf(swipeItemApi)
  const next = (i >= 0 ? children[i + 1] : null) as SwipeSibling | null
  if (next && typeof next.setHideDividerFromPrev === 'function') {
    next.setHideDividerFromPrev(hide)
  } else if (next && next.swipeSurface && next.swipeSurface.hideDividerFromPrev !== hide) {
    next.swipeSurface.hideDividerFromPrev = hide
  }
}

/** 上一行借/还本行顶部分割线 */
function setHideDividerFromPrev(hide?: boolean): void {
  const next = !!hide
  if (swipeSurface.hideDividerFromPrev !== next) {
    swipeSurface.hideDividerFromPrev = next
  }
}

/** wxs 中调用：开合变化 */
function change(e?: OpenArg): void {
  const open = (e && e.open) || 'none'
  emit('change', open)
  if (is_show.value !== open) {
    is_show.value = open
  }
}

/** 容器互斥 / closeAll 调用 */
function close(): void {
  is_show.value = 'none'
}

function appTouchStart(e: TouchEvent): void {
  if (isPc) return
  const touch = e.changedTouches && e.changedTouches[0]
  if (!touch) return
  clientX.value = touch.clientX
  timestamp.value = Date.now()
}

/**
 * 按钮区的反向滑动 = 收起本行。
 *
 * 必须 catch 住 touchmove：按钮已 catch 掉 touchstart / touchend，若放 move 冒泡到
 * `__box`，手势层会拿上一次手势的残留 startX 算 deltaX 把行推到乱位，且 touchend
 * 被 catch 后永远不归位（表现为「停在滑到的位置 + 灰底铺满整行」）。
 *
 * 但滑开后可拖的内容区只剩几十 px，回拖时手指基本落在按钮上，只拦不处理等于没法取消。
 * 这里改 `is_show` 交给 `showWatch` 带动画归位（不跟手，但方向明确、够果断）；
 * 阈值与点击判定的 40 对齐，超过即不再算点击。
 */
function appTouchMove(e: TouchEvent): void {
  if (isPc) return
  if (is_show.value === 'none') return
  const touch = e.changedTouches && e.changedTouches[0]
  if (!touch || typeof clientX.value !== 'number') return
  const delta = touch.clientX - clientX.value
  const isBack = is_show.value === 'right' ? delta > 40 : delta < -40
  if (isBack) close()
}

function appTouchEnd(e: TouchEvent, index: number, item: SwipeClickItem | null, position: string): void {
  if (isPc) return
  const touch = e.changedTouches && e.changedTouches[0]
  if (!touch) return
  /* 模拟点击，规避 iOS 13 touchend 早于 click 造成的错位 */
  const diff = Math.abs((clientX.value as number) - touch.clientX)
  const time = Date.now() - timestamp.value
  if (diff < 40 && time < 300) {
    emitClick(index, item, position)
  }
}

function onClickForPc(index: number, item: SwipeClickItem | null, position: string): void {
  if (!isPc) return
  // #ifdef H5
  emitClick(index, item, position)
  // #endif
}

function emitClick(index: number, item: SwipeClickItem | null, position: string): void {
  emit('click', {
    content: item,
    index,
    position,
    key: item && item.key,
  })
  if (props.closeOnClick) {
    close()
  }
}

watch(
  (): string => props.show,
  () => {
    is_show.value = props.show
  },
)

onMounted(() => {
  is_show.value = props.show
})

onBeforeUnmount(() => {
  unlockPageScroll()
  /* 卸掉时还回下一行顶线，避免残留 hideDividerFromPrev */
  setSwipeDividersHidden({ hide: false })
})

swipeItemApi.swipeSurface = swipeSurface
swipeItemApi.close = close
swipeItemApi.setHideDividerFromPrev = setHideDividerFromPrev
swipeItemApi.setSwipeDividersHidden = setSwipeDividersHidden

swipeaction = getSwipeAction()
if (swipeaction && Array.isArray(swipeaction.children)) {
  swipeaction.children.push(swipeItemApi)
}
_pageScrollLocked.value = false

/**
 * H5 / 小程序 / app-vue 端 wxs / renderjs 通过 `ownerInstance.callMethod(name)` 回调组件方法，
 * 查的是组件公开实例代理；<script setup> 的顶层绑定不在该代理上，
 * 这里显式挂到 ctx，保持与原选项式 methods 一致的可调用性（change / closeSwipe / setSwipeDividersHidden）。
 */
const wxsInstance = getCurrentInstance()
if (wxsInstance) {
  const wxsCtx = wxsInstance.ctx as Record<string, unknown>
  wxsCtx.change = change
  wxsCtx.closeSwipe = closeSwipe
  wxsCtx.setSwipeDividersHidden = setSwipeDividersHidden
}
/* #endif */

/* #ifndef APP-VUE || APP-HARMONY || MP-WEIXIN || H5 */
const MIN_DISTANCE = 10
const CAPSULE_FADE_PX = 32
const LEAVE_ROW_Y = 40
const CAPSULE_SETTLE_TRANSITION = 'opacity 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'

const instance = getCurrentInstance()

const ani = ref(false)
const left = ref(0)
const moveLeft = ref('translateX(0px)' as string)
const leftWidth = ref(0)
const rightWidth = ref(0)
const direction = ref('' as string)
const deltaX = ref(0)
const deltaY = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)
const x = ref(0)
const buttonShow = ref('none' as string)
const contentOpen = ref(false)
const capsuleProgress = ref(0)
const capsuleTransition = ref('none' as string)
const swipeSurface = reactive({
  hideDivider: false,
  hideDividerFromPrev: false,
} as SwipeSurface)
/** 同上：刻意不用 ref，保留对象身份 */
let swipeaction: SwipeActionCtx | null = null
const timer = ref(undefined as ReturnType<typeof setTimeout> | undefined)
const touching = ref(false)
const startX = ref(0)
const startY = ref(0)
const clientX = ref(undefined as number | undefined)
const timestamp = ref(0)
const _pageScrollLocked = ref(false)
const lingyunAppPageScrollLock = inject<LingyunAppPageScrollLock | null>(LINGYUN_APP_PAGE_SCROLL_LOCK, null)

const rowBgStyle = computed((): { opacity: number; transition: string } => {
  return {
    opacity: capsuleProgress.value,
    transition: capsuleTransition.value,
  }
})

function lockPageScroll(): void {
  if (_pageScrollLocked.value) return
  _pageScrollLocked.value = true
  const api = lingyunAppPageScrollLock as LingyunAppPageScrollLock | null
  if (api && typeof api.lock === 'function') api.lock()
}

function unlockPageScroll(): void {
  if (!_pageScrollLocked.value) return
  _pageScrollLocked.value = false
  const api = lingyunAppPageScrollLock as LingyunAppPageScrollLock | null
  if (api && typeof api.unlock === 'function') api.unlock()
}

function setHideDividerFromPrev(hide?: boolean): void {
  const next = !!hide
  if (swipeSurface.hideDividerFromPrev !== next) {
    swipeSurface.hideDividerFromPrev = next
  }
}

function setSwipeDividersHidden(e?: DividerArg): void {
  const hide = typeof e === 'boolean' ? e : !!(e && e.hide)
  if (swipeSurface.hideDivider !== hide) {
    swipeSurface.hideDivider = hide
  }
  const children = swipeaction && swipeaction.children
  if (!Array.isArray(children)) return
  const i = children.indexOf(swipeItemApi)
  const next = (i >= 0 ? children[i + 1] : null) as SwipeSibling | null
  if (next && typeof next.setHideDividerFromPrev === 'function') {
    next.setHideDividerFromPrev(hide)
  } else if (next && next.swipeSurface && next.swipeSurface.hideDividerFromPrev !== hide) {
    next.swipeSurface.hideDividerFromPrev = hide
  }
}

function init(): void {
  clearTimeout(timer.value)
  timer.value = setTimeout(() => {
    getSelectorQuery()
  }, 80)
  left.value = 0
  x.value = 0
  capsuleProgress.value = 0
  capsuleTransition.value = 'none'
  setSwipeDividersHidden(false)
}

function close(): void {
  openState('none')
}

function closeSwipe(): void {
  if (props.autoClose && swipeaction) {
    swipeaction.closeOther(swipeItemApi)
  }
}

function touchstart(e: TouchEvent): void {
  if (props.disabled) return
  touching.value = true
  ani.value = false
  x.value = left.value || 0
  resetTouchStatus()
  const touch = e.touches[0]!
  startX.value = touch.clientX
  startY.value = touch.clientY
  closeSwipe()
}

function touchmove(e: TouchEvent): void {
  if (props.disabled) return
  if (!touching.value) return
  const touch = e.touches[0]!
  deltaX.value = touch.clientX - startX.value
  deltaY.value = touch.clientY - startY.value
  offsetX.value = Math.abs(deltaX.value)
  offsetY.value = Math.abs(deltaY.value)
  direction.value = direction.value || getDirection(offsetX.value, offsetY.value)
  if (direction.value !== 'horizontal') return
  if (offsetY.value >= LEAVE_ROW_Y) {
    touching.value = false
    unlockPageScroll()
    moveDirection(left.value)
    return
  }
  if (e.preventDefault) e.preventDefault()
  move(x.value + deltaX.value, true)
}

function touchend(): void {
  if (props.disabled) return
  if (!touching.value) return
  touching.value = false
  unlockPageScroll()
  moveDirection(left.value)
}

function touchcancel(): void {
  touchend()
}

function move(value: number | null | undefined, followCapsule?: boolean): void {
  left.value = Math.min(Math.max(value || 0, -rightWidth.value), leftWidth.value)
  if (followCapsule) {
    const abs = Math.abs(left.value)
    capsuleProgress.value = abs >= CAPSULE_FADE_PX ? 1 : abs / CAPSULE_FADE_PX
    capsuleTransition.value = 'none'
    setSwipeDividersHidden(capsuleProgress.value > 0)
  }
}

function moveDirection(leftValue: number): void {
  const threshold = props.threshold
  const isopen = buttonShow.value || 'none'
  const lw = leftWidth.value
  const rw = rightWidth.value
  if (deltaX.value === 0) {
    openState('none')
    return
  }
  if (
    (isopen === 'none' && rw > 0 && -leftValue > threshold) ||
    (isopen !== 'none' && rw > 0 && rw + leftValue < threshold)
  ) {
    openState('right')
  } else if (
    (isopen === 'none' && lw > 0 && leftValue > threshold) ||
    (isopen !== 'none' && lw > 0 && lw - leftValue < threshold)
  ) {
    openState('left')
  } else {
    openState('none')
  }
}

function openState(type: string): void {
  ani.value = true
  let nextLeft = 0
  if (type === 'left') nextLeft = leftWidth.value
  if (type === 'right') nextLeft = -rightWidth.value
  if (buttonShow.value !== type) {
    buttonShow.value = type
    emit('change', type)
  }
  left.value = nextLeft
  contentOpen.value = type !== 'none'
  capsuleProgress.value = type !== 'none' ? 1 : 0
  capsuleTransition.value = CAPSULE_SETTLE_TRANSITION
  setSwipeDividersHidden(type !== 'none')
}

function getDirection(xValue: number, yValue: number): string {
  if (xValue > yValue && xValue > MIN_DISTANCE) return 'horizontal'
  if (yValue > xValue && yValue > MIN_DISTANCE) return 'vertical'
  return ''
}

function resetTouchStatus(): void {
  direction.value = ''
  deltaX.value = 0
  deltaY.value = 0
  offsetX.value = 0
  offsetY.value = 0
}

function getSelectorQuery(): void {
  const query = uni.createSelectorQuery().in(instance?.proxy as never)
  query
    .select('.button-group--left')
    .boundingClientRect()
    .select('.button-group--right')
    .boundingClientRect()
    .exec((ret) => {
      leftWidth.value = (ret && ret[0] && ret[0].width) || 0
      rightWidth.value = (ret && ret[1] && ret[1].width) || 0
    })
}

function appTouchStart(e: TouchEvent): void {
  const touch = e.changedTouches && e.changedTouches[0]
  if (!touch) return
  clientX.value = touch.clientX
  timestamp.value = Date.now()
}

function appTouchMove(e: TouchEvent): void {
  if (buttonShow.value === 'none') return
  const touch = e.changedTouches && e.changedTouches[0]
  if (!touch || typeof clientX.value !== 'number') return
  const delta = touch.clientX - clientX.value
  const isBack = buttonShow.value === 'right' ? delta > 40 : delta < -40
  if (isBack) close()
}

function appTouchEnd(e: TouchEvent, index: number, item: SwipeClickItem | null, position: string): void {
  const touch = e.changedTouches && e.changedTouches[0]
  if (!touch) return
  const diff = Math.abs((clientX.value as number) - touch.clientX)
  const time = Date.now() - timestamp.value
  if (diff < 40 && time < 300) {
    emit('click', { content: item, index, position, key: item && item.key })
    if (props.closeOnClick) close()
  }
}

watch(
  (): string => props.show,
  (val: string) => {
    if (props.autoClose) return
    openState(val)
  },
)
watch(left, (val: number) => {
  moveLeft.value = `translateX(${val}px)`
})
watch(
  (): Array<string | SwipeOptionInput> => props.leftOptions,
  () => {
    init()
  },
)
watch(
  (): Array<string | SwipeOptionInput> => props.rightOptions,
  () => {
    init()
  },
)

onMounted(() => {
  swipeaction = getSwipeAction()
  if (swipeaction && Array.isArray(swipeaction.children)) {
    swipeaction.children.push(swipeItemApi)
  }
  _pageScrollLocked.value = false
  init()
})

onBeforeUnmount(() => {
  unlockPageScroll()
  setSwipeDividersHidden(false)
})

swipeItemApi.swipeSurface = swipeSurface
swipeItemApi.close = close
swipeItemApi.init = init
swipeItemApi.setHideDividerFromPrev = setHideDividerFromPrev
swipeItemApi.setSwipeDividersHidden = setSwipeDividersHidden
/* #endif */

/**
 * lingyunSwipeHost：常量，关掉 list-item hover。
 * lingyunSwipeSurface：可变对象，滑动中藏分割线（本行顶线 + 下一行顶线）。
 */
provide('lingyunSwipeHost', true)
provide('lingyunSwipeSurface', swipeSurface)

function uninstall(): void {
  if (typeof setSwipeDividersHidden === 'function') {
    setSwipeDividersHidden({ hide: false })
  }
  if (!swipeaction || !Array.isArray(swipeaction.children)) return
  const i = swipeaction.children.indexOf(swipeItemApi)
  if (i >= 0) swipeaction.children.splice(i, 1)
}

// #ifdef VUE3
onUnmounted(() => {
  _isUnmounted = true
  uninstall()
})
// #endif
// #ifndef VUE3
onUnmounted(() => {
  if (_isUnmounted) return
  uninstall()
})
// #endif
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
