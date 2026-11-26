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

          <view
            v-if="contentFill"
            class="lingyun-sheets__body lingyun-sheets__body--fill"
          >
            <view class="lingyun-sheets__body-inner" :style="bodyInnerStyle">
              <slot />
            </view>
          </view>
          <scroll-view
            v-else
            class="lingyun-sheets__body"
            scroll-y
            :show-scrollbar="false"
          >
            <view class="lingyun-sheets__body-inner" :style="bodyInnerStyle">
              <slot />
            </view>
          </scroll-view>
          <view v-if="hasFooter" class="lingyun-sheets__footer" :style="footerStyle">
            <slot name="footer" />
          </view>
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

          <view
            v-if="contentFill"
            class="lingyun-sheets__body lingyun-sheets__body--fill"
          >
            <view class="lingyun-sheets__body-inner" :style="bodyInnerStyle">
              <slot />
            </view>
          </view>
          <scroll-view
            v-else
            class="lingyun-sheets__body"
            scroll-y
            :show-scrollbar="false"
          >
            <view class="lingyun-sheets__body-inner" :style="bodyInnerStyle">
              <slot />
            </view>
          </scroll-view>
          <view v-if="hasFooter" class="lingyun-sheets__footer" :style="footerStyle">
            <slot name="footer" />
          </view>
        </view>
      </view>
    </teleport>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import { inject, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { syncLingyunMpOverlayHold } from '../../utils/mp-overlay-gate'
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

defineOptions({
  name: 'LingyunSheets',
})

const props = defineProps({
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
  /**
   * 内容从面板顶部开始，顶栏（关闭 / 标题）浮在内容上。
   * 适合商品详情这类头图铺满的需求：隐藏 Grabber，body 去掉顶部内边距。
   */
  bleedTop: {
    type: Boolean,
    default: false,
  },
  /**
   * body 不滚动，由内容自行填满 body 高度并在内部滚动（左右分栏、内部滚动详情）。
   * 开启后 body 变成普通 view，高度 100%；内容需自己处理滚动。
   */
  contentFill: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:show', 'update:modelValue', 'close', 'update:detent', 'trailing'])

const appPageScrollLock = inject(LINGYUN_APP_PAGE_SCROLL_LOCK, null)

const slots = useSlots()

const mounted = ref(false)
/** enter | open | leave */
const phase = ref<'' | 'enter' | 'open' | 'leave'>('')
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const enterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const windowHeight = ref(667)
const windowWidth = ref(375)
/** large 顶部留白：状态栏 + 页顶 toolbars 栏身，避免挡住底层导航 */
const largeTopGap = ref(LARGE_TOP_GAP_MIN)
const safeBottom = ref(0)
const dragStartY = ref(0)
const dragDy = ref(0)
const dragging = ref(false)
/** 点遮罩不可关闭时的拒绝反馈 */
const rejectNudge = ref(false)
const nudgeTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _onWindowResize = ref<(() => void) | null>(null)
const _appScrollLocked = ref(false)
const _scrollLocked = ref(false)
const _prevBodyOverflow = ref('')
const _prevBodyOverscroll = ref('')
const _prevHtmlOverscroll = ref('')
const _lingyunMpOverlayHold = ref(false)

const visible = computed((): boolean => {
  if (props.show !== undefined && props.show !== null) return !!props.show
  if (props.modelValue !== undefined && props.modelValue !== null) return !!props.modelValue
  return false
})

/** 顶栏右侧文字最多 2 个字（按 Unicode 码点截断，避免拆开 emoji） */
const trailingTextClipped = computed((): string => {
  const text = String(props.trailingText || '').trim()
  return Array.from(text).slice(0, 2).join('')
})

const hasBuiltInTrailing = computed((): boolean =>
  !!(props.trailingIcon || trailingTextClipped.value),
)

/** 内置 trailing（icon / 文字）优先于 #trailing 插槽与默认分享圆钮；
 *  小程序端插槽是否存在是静态的，不能用来判断“有没有内容” */
const showTrailingEffective = computed((): boolean =>
  props.showTrailing && !hasBuiltInTrailing.value,
)

const detentKey = computed((): string => (props.detent === 'large' ? 'large' : 'medium'))

const reduceMotion = computed((): boolean => {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  } catch {
    /* ignore */
  }
  return false
})

const isLarge = computed((): boolean => detentKey.value === 'large')

/** 宽屏（iPad / 桌面 H5）：走 Sketch iPad 居中卡片，档位不再影响形态 */
const isRegular = computed((): boolean =>
  (Number(windowWidth.value) || 375) >= REGULAR_MIN_WIDTH,
)

/** 宽屏卡片宽：props.width，夹在 [320, 视口 - 64]；0 用默认上限 936 */
const regularWidthPx = computed((): number => {
  const w = Math.max(320, Number(windowWidth.value) || 375)
  const limit = Math.max(320, w - REGULAR_INSET * 2)
  const requested = Number(props.width) || 0
  const base = requested > 0 ? requested : Math.min(REGULAR_MAX_WIDTH, limit)
  return Math.max(320, Math.min(base, limit))
})

/** 宽屏卡片高：props.height，夹在 [240, 视口 - 64]；0 用默认上限 770 */
const regularHeightPx = computed((): number => {
  const h = Math.max(320, Number(windowHeight.value) || 667)
  const limit = Math.max(240, h - REGULAR_INSET * 2)
  const requested = Number(props.height) || 0
  const base = requested > 0 ? requested : Math.min(REGULAR_MAX_HEIGHT, limit)
  return Math.max(240, Math.min(base, limit))
})

const panelHeightPx = computed((): number => {
  const h = Math.max(320, Number(windowHeight.value) || 667)
  if (isRegular.value) {
    return regularHeightPx.value
  }
  if (isLarge.value) {
    const gap = Math.max(LARGE_TOP_GAP_MIN, Number(largeTopGap.value) || LARGE_TOP_GAP_MIN)
    return Math.max(280, Math.round(h - gap))
  }
  return Math.round(h * MEDIUM_RATIO)
})

/** 宽屏水平居中留白；窄屏 medium 内缩 8、large 贴边（Sketch 8 / 0） */
const sideInsetPx = computed((): number => {
  if (!isRegular.value) return isLarge.value ? 0 : INSET_MEDIUM
  const w = Math.max(320, Number(windowWidth.value) || 375)
  const panel = regularWidthPx.value
  return Math.round((w - panel) / 2)
})

/** 宽屏垂直居中；窄屏见 sideInsetPx */
const bottomInsetPx = computed((): number => {
  if (!isRegular.value) return isLarge.value ? 0 : INSET_MEDIUM
  const h = Math.max(320, Number(windowHeight.value) || 667)
  return Math.round((h - panelHeightPx.value) / 2)
})

const panelRadiusPx = computed((): number => {
  if (isRegular.value) return RADIUS_REGULAR
  return isLarge.value ? RADIUS_LARGE : RADIUS_MEDIUM
})

/** iPad 卡片不可换档，不出 Grabber；头图模式顶栏浮在图片上，也不出 Grabber */
const showGrabber = computed((): boolean => !isRegular.value && !props.bleedTop)

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* pinia 未就绪 */
  }
  return [
    themeClass,
    `lingyun-sheets--${detentKey.value}`,
    props.bleedTop ? 'lingyun-sheets--bleed-top' : '',
    phase.value ? `lingyun-sheets--${phase.value}` : '',
    reduceMotion.value ? 'lingyun-sheets--reduce-motion' : '',
    dragging.value ? 'lingyun-sheets--dragging' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const rootStyle = computed((): Record<string, number> => {
  return {
    zIndex: Number(props.zIndex) || 1000,
  }
})

const panelClass = computed((): Record<string, boolean> => {
  return {
    'lingyun-sheets__panel--regular': isRegular.value,
    'lingyun-sheets__panel--large': !isRegular.value && isLarge.value,
    'lingyun-sheets__panel--medium': !isRegular.value && !isLarge.value,
    'lingyun-sheets__panel--nudge': rejectNudge.value && !reduceMotion.value,
  }
})

/** 屏外起点位移：面板高 + 底部留白，否则收起后残留露头 */
const offsetOutPx = computed((): number => panelHeightPx.value + bottomInsetPx.value)

const hasFooter = computed((): boolean => !!(slots && slots.footer))

const panelStyle = computed((): Record<string, string> => {
  const radius = panelRadiusPx.value
  // large 贴边贴底：只圆顶角；medium / iPad 卡片四角同值
  const bottomRadius = !isRegular.value && isLarge.value ? 0 : radius
  const style: Record<string, string> = {
    height: `${panelHeightPx.value}px`,
    left: `${sideInsetPx.value}px`,
    right: `${sideInsetPx.value}px`,
    bottom: `${bottomInsetPx.value}px`,
    borderTopLeftRadius: `${radius}px`,
    borderTopRightRadius: `${radius}px`,
    borderBottomLeftRadius: `${bottomRadius}px`,
    borderBottomRightRadius: `${bottomRadius}px`,
  }
  if (dragging.value) {
    style.transform = `translate3d(0, ${dragDy.value}px, 0)`
    style.transition = 'none'
  } else if (phase.value === 'open') {
    style.transform = 'translate3d(0, 0, 0)'
  } else {
    style.transform = `translate3d(0, ${offsetOutPx.value}px, 0)`
  }
  return style
})

const bodyInnerStyle = computed((): Record<string, string> => {
  const bottom = props.contentFill
    ? 0
    : 16 + (hasFooter.value || !props.safeAreaBottom ? 0 : safeBottom.value)
  return {
    paddingBottom: `${bottom}px`,
  }
})

/** 底部操作区：贴面板底部，安全区由它承接 */
const footerStyle = computed((): Record<string, string> => {
  const bottom = hasFooter.value && props.safeAreaBottom ? safeBottom.value : 0
  return {
    paddingBottom: `${bottom}px`,
  }
})

function syncWindow(): void {
  try {
    const info =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    windowHeight.value = Number(info && info.windowHeight) || 667
    windowWidth.value = Number(info && info.windowWidth) || 375
    const inset = info && info.safeAreaInsets
    safeBottom.value = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
  } catch {
    windowHeight.value = 667
    windowWidth.value = 375
    safeBottom.value = 0
  }
  try {
    // 全屏顶缘落在页面顶栏之下（状态栏 + 栏身），避开微信胶囊
    largeTopGap.value = Math.max(LARGE_TOP_GAP_MIN, getLingyunToolbarStackPx())
  } catch {
    largeTopGap.value = LARGE_TOP_GAP_MIN
  }
}

function bindResize(): void {
  const onWindowResize = () => {
    syncWindow()
  }
  _onWindowResize.value = onWindowResize
  try {
    if (typeof uni.onWindowResize === 'function') uni.onWindowResize(onWindowResize)
  } catch {
    /* 端不支持 */
  }
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
  _onWindowResize.value = null
}

function clearTimers(): void {
  if (leaveTimer.value) {
    clearTimeout(leaveTimer.value)
    leaveTimer.value = null
  }
  if (enterTimer.value) {
    clearTimeout(enterTimer.value)
    enterTimer.value = null
  }
  if (nudgeTimer.value) {
    clearTimeout(nudgeTimer.value)
    nudgeTimer.value = null
  }
  rejectNudge.value = false
}

function openAnim(): void {
  clearTimers()
  mounted.value = true
  dragDy.value = 0
  dragging.value = false
  // enter = 屏外起点（须与 open 不同，否则无滑入动画）
  phase.value = 'enter'
  nextTick(() => {
    const kick = () => {
      enterTimer.value = setTimeout(
        () => {
          phase.value = 'open'
          enterTimer.value = null
        },
        reduceMotion.value ? 16 : ENTER_KICK_MS,
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
}

function closeAnim(): void {
  clearTimers()
  if (!mounted.value) {
    unlockPageScroll()
    return
  }
  phase.value = 'leave'
  leaveTimer.value = setTimeout(
    () => {
      mounted.value = false
      phase.value = ''
      leaveTimer.value = null
      dragDy.value = 0
      dragging.value = false
      unlockPageScroll()
    },
    reduceMotion.value ? 16 : LEAVE_MS,
  )
}

function setVisible(next: boolean): void {
  const val = !!next
  emit('update:show', val)
  emit('update:modelValue', val)
  if (!val) emit('close')
}

function close(): void {
  setVisible(false)
}

function onOverlayClick(): void {
  if (props.maskClosable) {
    close()
    return
  }
  if (phase.value !== 'open') return
  playRejectNudge()
}

/** 点遮罩不可关闭：短震动 + 面板水平轻抖（对齐 Alert 的拒绝反馈） */
function playRejectNudge(): void {
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
  if (reduceMotion.value) return
  rejectNudge.value = false
  nextTick(() => {
    rejectNudge.value = true
    if (nudgeTimer.value) clearTimeout(nudgeTimer.value)
    nudgeTimer.value = setTimeout(() => {
      rejectNudge.value = false
      nudgeTimer.value = null
    }, NUDGE_MS)
  })
}

function onTrailing(): void {
  emit('trailing')
}

/** 打开时锁住底层页面滚动（app-page scroll-view + H5 body），避免内容区滑动穿透 */
function lockPageScroll(): void {
  try {
    const lockApi = appPageScrollLock as LingyunAppPageScrollLock | null
    if (lockApi && typeof lockApi.lock === 'function' && !_appScrollLocked.value) {
      lockApi.lock()
      _appScrollLocked.value = true
    }
  } catch {
    /* 不在 app-page 内 */
  }
  // #ifdef H5
  if (typeof document === 'undefined') return
  if (_scrollLocked.value) return
  const body = document.body
  const html = document.documentElement
  _prevBodyOverflow.value = body.style.overflow
  _prevBodyOverscroll.value = body.style.overscrollBehavior
  _prevHtmlOverscroll.value = html.style.overscrollBehavior
  body.style.overflow = 'hidden'
  body.style.overscrollBehavior = 'none'
  html.style.overscrollBehavior = 'none'
  _scrollLocked.value = true
  // #endif
}

function unlockPageScroll(): void {
  try {
    const lockApi = appPageScrollLock as LingyunAppPageScrollLock | null
    if (_appScrollLocked.value && lockApi && typeof lockApi.unlock === 'function') {
      lockApi.unlock()
    }
    _appScrollLocked.value = false
  } catch {
    _appScrollLocked.value = false
  }
  // #ifdef H5
  if (typeof document === 'undefined') return
  if (!_scrollLocked.value) return
  const body = document.body
  const html = document.documentElement
  body.style.overflow = _prevBodyOverflow.value || ''
  body.style.overscrollBehavior = _prevBodyOverscroll.value || ''
  html.style.overscrollBehavior = _prevHtmlOverscroll.value || ''
  _scrollLocked.value = false
  // #endif
}

/**
 * 面板 touchmove 仅 stop 冒泡，不 prevent —— 否则会掐死内部 scroll-view。
 * 底层滚动靠 lockPageScroll（关 app-page scroll-y）。
 */
function onPanelTouchMove(): void {
  /* stop 已在模板；占位避免空 handler 被优化掉 */
}

function onChromeTouchStart(e: TouchEvent): void {
  const t = e.touches && e.touches[0]
  if (!t) return
  dragStartY.value = t.clientY
  dragDy.value = 0
  dragging.value = true
}

function onChromeTouchMove(e: TouchEvent): void {
  if (!dragging.value) return
  const t = e.touches && e.touches[0]
  if (!t) return
  const dy = t.clientY - dragStartY.value
  dragDy.value = dy > 0 ? dy : 0
}

function onChromeTouchEnd(): void {
  if (!dragging.value) return
  const dy = dragDy.value
  dragging.value = false
  dragDy.value = 0
  if (dy >= DISMISS_DY) {
    close()
  }
}

watch(
  visible,
  (val: boolean) => {
    if (val) {
      syncWindow()
      lockPageScroll()
      openAnim()
    } else {
      closeAnim()
    }
  },
  { immediate: true },
)

watch(
  () => props.detent,
  () => {
    syncWindow()
  },
)

watch(
  phase,
  (value: string) => {
    _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
      !!_lingyunMpOverlayHold.value,
      !!value,
    )
  },
  { immediate: true },
)

onMounted(() => {
  syncWindow()
  bindResize()
})

onBeforeUnmount(() => {
  _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
    !!_lingyunMpOverlayHold.value,
    false,
  )
  clearTimers()
  unbindResize()
  unlockPageScroll()
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

/* 头图模式：内容从面板顶部开始，顶栏（关闭 / 标题）浮在内容上 */
.lingyun-sheets--bleed-top .lingyun-sheets__chrome {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 3;
}

.lingyun-sheets--bleed-top .lingyun-sheets__grabber {
  display: none;
}

.lingyun-sheets--bleed-top .lingyun-sheets__body-inner {
  padding-top: 0;
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

/* contentFill：body 不滚动，内部布局自己填满并处理滚动 */
.lingyun-sheets__body--fill {
  overflow: hidden;
}

.lingyun-sheets__body--fill .lingyun-sheets__body-inner {
  height: 100%;
  min-height: 0;
  padding-top: 0;
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

/* 底部操作区：不参与 body 滚动，始终贴面板底部 */
.lingyun-sheets__footer {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* 内置 trailing 复用 lingyun-button（borderedProminent · medium） */
.lingyun-sheets__trailing-button {
  flex-shrink: 0;
}
</style>
