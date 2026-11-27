<template>
  <view
    class="lingyun-popover"
    :class="{
      'lingyun-popover--trigger-block': triggerBlock,
      'lingyun-popover--menu-active':
        variant === 'menu' &&
        mounted &&
        !triggerBlock &&
        placement !== 'left' &&
        placement !== 'right' &&
        phase !== '' &&
        phase !== 'leave',
      'lingyun-popover--menu-returning':
        variant === 'menu' &&
        phase === 'leave' &&
        !triggerBlock &&
        placement !== 'left' &&
        placement !== 'right',
    }"
  >
    <view class="lingyun-popover__trigger">
      <slot name="trigger" :show="visible" :toggle="onTriggerClick" />
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <root-portal>
      <view
        v-if="mounted"
        class="lingyun-popover__root"
        :class="rootClass"
        :style="rootStyle"
        @touchmove.stop
      >
        <view v-if="mask" class="lingyun-popover__mask" @click="onMask" @touchmove.stop.prevent />
        <view class="lingyun-popover__lift" :style="liftStyle">
          <view v-if="showArrow" class="lingyun-popover__arrow" :style="arrowStyle">
            <view class="lingyun-popover__arrow-fill" />
            <view class="lingyun-popover__arrow-stroke" />
          </view>
          <view ref="panel" class="lingyun-popover__panel" @transitionend="onPanelTransitionEnd">
            <view class="lingyun-popover__content">
              <slot />
            </view>
          </view>
        </view>
      </view>
    </root-portal>
    <!-- #endif -->

    <!-- H5 / App：Teleport 到 body，避免被 section overflow:hidden 裁切 -->
    <!-- #ifndef MP-WEIXIN -->
    <teleport to="body">
      <view
        v-if="mounted"
        class="lingyun-popover__root"
        :class="rootClass"
        :style="rootStyle"
        @touchmove.stop
      >
        <view v-if="mask" class="lingyun-popover__mask" @click="onMask" @touchmove.stop.prevent />
        <view class="lingyun-popover__lift" :style="liftStyle">
          <view v-if="showArrow" class="lingyun-popover__arrow" :style="arrowStyle">
            <view class="lingyun-popover__arrow-fill" />
            <view class="lingyun-popover__arrow-stroke" />
          </view>
          <view ref="panel" class="lingyun-popover__panel" @transitionend="onPanelTransitionEnd">
            <view class="lingyun-popover__content">
              <slot />
            </view>
          </view>
        </view>
      </view>
    </teleport>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { syncLingyunMpOverlayHold } from '../../utils/mp-overlay-gate'

/**
 * lingyun-popover
 * @see design/POPOVERS.md
 *
 * 进场：对齐 Alert——先测锚点；lift 从 scale(1.16) 弹性缩至 1（不对玻璃做 opacity）
 *
 * 定位：锚点与面板都换算到浮层根（fixed 铺满视口）的坐标系；面板先以 measure 阶段
 * （visibility:hidden、scale 1）挂载量出真实高度，再算方向、位置和箭头。
 * H5 直接同步读 DOM 矩形（浮层 Teleport 到 body，用真实视口坐标）；uni 的 boundingClientRect
 * 会减去 windowTop，所以外部传入的 anchor 在 H5 要补回。
 */
const LEAVE_MS = 240
/* 菜单：从锚点长成玻璃水滴再收回，比普通浮层的缩放入场更长一点 */
const MENU_LEAVE_MS = 340
const MENU_ENTER_SCALE = 0.22
const MENU_LEAVE_SCALE = 0.55
const GAP = 8
const ARROW_W = 22
const ARROW_H = 14
const TIP_GAP = 4
/* 面板圆角（glass surface / menu），箭头底边不能压到圆弧上 */
const PANEL_RADIUS = 16
const PANEL_RADIUS_MENU = 32
const PANEL_MIN_W = 160
const PANEL_MAX_W = 280
/* 全宽菜单在 PC / PAD 的上限，约等于主流手机宽度 */
const FULL_PANEL_MAX_W = 400
const QUERY_TIMEOUT_MS = 600
const EST_PANEL_H = 52

type PopoverPhase = '' | 'measure' | 'enter' | 'open' | 'leave'
type AnchorBox = {
  top?: number
  left?: number
  width?: number
  height?: number
}
type Viewport = { width: number; height: number }
type DomLike = { getBoundingClientRect?: () => { left: number; top: number; width: number; height: number } }

function toDom(ref: unknown): DomLike | null {
  const r = ref as { $el?: DomLike } & DomLike
  if (!r) return null
  if (typeof r.getBoundingClientRect === 'function') return r
  if (r.$el && typeof r.$el.getBoundingClientRect === 'function') return r.$el
  return null
}

defineOptions({
  name: 'LingyunPopover',
})

const props = defineProps({
  show: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  modelValue: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  /** top | bottom | left | right；空间不够会翻到对侧 */
  placement: { type: String, default: 'bottom' },
  /** 箭头；Sketch Popover 每档都有 Arrow */
  showArrow: { type: Boolean, default: true },
  /** 面板宽（px）。0 表示跟触发器，并限制在 160–280 */
  width: { type: [Number, String] as PropType<number | string>, default: 0 },
  /** 全宽面板：手机铺满可用宽度，PC / PAD 上限 400 */
  fullWidth: { type: Boolean, default: false },
  /** 箭头落在面板哪一侧（面板随之偏移），箭头始终指向触发器：auto / middle 居中，leading 靠前，trailing 靠后 */
  arrowAlign: { type: String, default: 'auto' },
  maskClosable: { type: Boolean, default: true },
  /** 是否显示遮罩；hover 子菜单等场景关闭，避免挡住鼠标 */
  mask: { type: Boolean, default: true },
  /** 遮罩透明但仍拦截点击；用于点击外部关闭、不加暗色 */
  maskTransparent: { type: Boolean, default: false },
  /** 触发器撑满父级；侧栏菜单等需要整宽触发的场景 */
  triggerBlock: { type: Boolean, default: false },
  zIndex: { type: [Number, String] as PropType<number | string>, default: 1100 },
  /** menu：Sketch Menus 面板（圆角 32、内边距 10），给 lingyun-menu 用 */
  variant: { type: String, default: '' },
  /**
   * 锚点矩形（视口坐标 { left, top, width, height }）。传了就指向它，不再测 trigger 插槽；
   * 用于触发点不在本组件里的场景（如表格表头的筛选图标）。
   */
  anchor: { type: Object as PropType<AnchorBox | null>, default: null },
  /** 面板预估高度，用于判断下方放不下时翻到上方。0 用默认值 */
  estimateHeight: { type: Number, default: 0 },
  /** 视口底部安全内缩（px），例如小程序键盘高度；定位时按扣减后的可用高度计算 */
  bottomInset: { type: Number, default: 0 },
  /** 关闭时不播放退场动画，用于菜单之间直接切换，避免两个面板重叠 */
  instantClose: { type: Boolean, default: false },
})

const emit = defineEmits(['update:show', 'update:modelValue', 'close', 'closed'])

const instance = getCurrentInstance()

const mounted = ref(false)
const phase = ref<PopoverPhase>('')
const resolvedPlace = ref('bottom')
const noTrans = ref(false)
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const enterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const openSettleTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const openNotified = ref(false)
const panelTop = ref(0)
const panelLeft = ref(16)
const panelWidth = ref(200)
const arrowOffset = ref(80)
const openSeq = ref(0)
const panelH = ref(0)
const followRaf = ref(0)
const anchorCenterX = ref(0)
const anchorCenterY = ref(0)
const anchorW = ref(0)
const anchorH = ref(0)
const panel = ref<unknown>(null)
const _lingyunMpOverlayHold = ref(false)
const visible = computed((): boolean => {
  if (props.show !== undefined && props.show !== null) return !!props.show
  if (props.modelValue !== undefined && props.modelValue !== null) return !!props.modelValue
  return false
})

const rootStyle = computed((): { zIndex: number } => {
  return { zIndex: Number(props.zIndex) || 1100 }
})

const arrowStyle = computed((): Record<string, string> => {
  const o = `${arrowOffset.value}px`
  /* 压进面板 1px，斜边描边接上面板描边；fill 在底边截掉 1px，不与面板底色叠加 */
  const edge = `${-(ARROW_H - 1)}px`
  if (resolvedPlace.value === 'top') return { left: o, bottom: edge }
  if (resolvedPlace.value === 'left') return { top: o, right: edge }
  if (resolvedPlace.value === 'right') return { top: o, left: edge }
  return { left: o, top: edge }
})

/** 菜单水滴：起始缩放按面板短边折算，让不同长宽的面板都从近似正圆长出来 */
function menuScale(base: number): { x: number; y: number } {
  const w = panelWidth.value
  const h = panelH.value
  if (!(w > 0) || !(h > 0)) return { x: base, y: base }
  const short = Math.min(w, h)
  return { x: (base * short) / w, y: (base * short) / h }
}

const liftStyle = computed((): Record<string, string> => {
  /*
   * 普通浮层对齐 Alert：缩放在 lift，勿对玻璃 panel 做 opacity。
   * 菜单有锚点矩形时，把面板起始帧直接映射成按钮中心的一颗圆：
   * translate 到按钮中心 + scale(d/面板宽高)，再回到 translate(0,0) scale(1,1)。
   */
  const menu = props.variant === 'menu'
  const menuAnchor = menu && anchorW.value > 0 && anchorH.value > 0
  const leaving = phase.value === 'leave'
  const active = phase.value === 'enter' || leaving
  const tip = `${arrowOffset.value + ARROW_W / 2}px`
  const place = resolvedPlace.value
  let transform = 'scale(1, 1)'
  let transformOrigin =
    place === 'top'
      ? `${tip} 100%`
      : place === 'left'
        ? `100% ${tip}`
        : place === 'right'
          ? `0 ${tip}`
          : `${tip} 0`

  if (menuAnchor) {
    const d = Math.max(48, Math.min(72, Math.max(anchorW.value, anchorH.value)))
    const sx = active && panelWidth.value > 0 ? d / panelWidth.value : 1
    const sy = active ? (panelH.value > 0 ? d / panelH.value : sx) : 1
    const tx = active ? anchorCenterX.value - panelLeft.value - d / 2 : 0
    const ty = active ? anchorCenterY.value - panelTop.value - d / 2 : 0
    transform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`
    transformOrigin = '0 0'
  } else {
    let scaleX = 1
    let scaleY = 1
    if (menu) {
      if (phase.value === 'enter') {
        const scale = menuScale(MENU_ENTER_SCALE)
        scaleX = scale.x
        scaleY = scale.y
      } else if (leaving) {
        const scale = menuScale(MENU_LEAVE_SCALE)
        scaleX = scale.x
        scaleY = scale.y
      }
    } else if (phase.value === 'enter') {
      scaleX = 1.16
      scaleY = 1.16
    } else if (leaving) {
      scaleX = 0.92
      scaleY = 0.92
    }
    transform = `scale(${scaleX}, ${scaleY})`
  }

  const transition = noTrans.value
    ? 'none'
    : leaving
      ? menu
        ? 'transform 0.2s cubic-bezier(0.4, 0, 0.8, 0.6), opacity 0.08s ease-in 0.18s'
        : 'transform 0.22s cubic-bezier(0.4, 0, 1, 1)'
      : menu
        ? 'transform 0.46s cubic-bezier(0.22, 1.32, 0.36, 1)'
        : 'transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)'
  const style: Record<string, string> = {
    top: `${panelTop.value}px`,
    left: `${panelLeft.value}px`,
    width: `${panelWidth.value}px`,
    '--ax': `${arrowOffset.value}px`,
    /* 水滴起始帧用椭圆圆角补偿非等比缩放，视觉上仍是正圆 */
    '--menu-rx': `${panelWidth.value / 2}px`,
    '--menu-ry': `${(panelH.value > 0 ? panelH.value : panelWidth.value) / 2}px`,
    transform,
    transformOrigin,
    transition,
  }
  if (menu) style.opacity = leaving ? '0' : '1'
  return style
})

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* ignore */
  }
  return [
    themeClass,
    phase.value ? `lingyun-popover--${phase.value}` : '',
    `lingyun-popover--place-${resolvedPlace.value}`,
    props.variant === 'menu' ? 'lingyun-popover--menu' : '',
    props.showArrow ? 'lingyun-popover--arrow' : '',
    !props.mask ? 'lingyun-popover--no-mask' : '',
    props.maskTransparent ? 'lingyun-popover--mask-transparent' : '',
    props.triggerBlock ? 'lingyun-popover--trigger-block' : '',
  ]
    .filter(Boolean)
    .join(' ')
})
function clearTimers(): void {
  if (leaveTimer.value) {
    clearTimeout(leaveTimer.value)
    leaveTimer.value = null
  }
  if (enterTimer.value) {
    clearTimeout(enterTimer.value)
    enterTimer.value = null
  }
  if (openSettleTimer.value) {
    clearTimeout(openSettleTimer.value)
    openSettleTimer.value = null
  }
}

function notifyOverlayOpened(): void {
  if (openNotified.value) return
  openNotified.value = true
  if (typeof uni !== 'undefined' && typeof uni.$emit === 'function') {
    uni.$emit('lingyun:overlay-opened')
  }
}

function setVisible(val: boolean): void {
  emit('update:show', val)
  emit('update:modelValue', val)
  if (!val) emit('close')
}

function onTriggerClick(): void {
  setVisible(!visible.value)
}

function onMask(): void {
  if (!props.maskClosable) return
  setVisible(false)
}

function readViewport(): Viewport {
  let width = 0
  let height = 0
  // #ifdef H5
  /* 浮层根 fixed 铺满时不含滚动条，用 clientWidth 而非 innerWidth */
  width = document.documentElement.clientWidth
  height = document.documentElement.clientHeight
  // #endif
  if (!(width > 0) || !(height > 0)) {
    const info = uni.getWindowInfo()
    width = info.windowWidth
    height = info.windowHeight
  }
  return { width: width || 375, height: height || 667 }
}

function normalizeRect(rect: AnchorBox | null, dy = 0): AnchorBox | null {
  if (!rect || rect.top == null) return null
  return {
    left: rect.left ?? 0,
    top: rect.top + dy,
    width: rect.width ?? 0,
    height: rect.height ?? 0,
  }
}

/** H5：uni boundingClientRect 减掉的顶部偏移（同 uni-h5 getWindowOffset），用于还原 anchor 到视口坐标 */
function h5WindowTop(): number {
  let top = 0
  // #ifdef H5
  const style = document.documentElement.style
  const read = (name: string) => parseInt((style.getPropertyValue(name).match(/\d+/) || ['0'])[0], 10) || 0
  top = read('--window-top') + read('--top-window-height')
  // #endif
  return top
}

function resolvePanelWidth(triggerWidth: number, vw: number): number {
  const raw = Number(props.width)
  const cap = Math.max(PANEL_MIN_W, vw - 24)
  if (props.fullWidth) return Math.round(Math.min(FULL_PANEL_MAX_W, cap))
  if (raw > 0) return Math.round(Math.min(Math.max(raw, 120), cap))
  const basis = Math.max(Number(triggerWidth) || 0, PANEL_MIN_W)
  return Math.round(Math.min(PANEL_MAX_W, Math.max(PANEL_MIN_W, Math.min(basis, cap))))
}

/** 箭头在面板上的理想位置（沿边距离）；面板据此相对锚点偏移，箭头始终指向锚点 */
/** 箭头尖离面板边缘的最小距离：圆角 + 半个箭头宽 */
function arrowInset(): number {
  return (props.variant === 'menu' ? PANEL_RADIUS_MENU : PANEL_RADIUS) + ARROW_W / 2
}

function alignTip(span: number): number {
  const align = String(props.arrowAlign || 'auto').toLowerCase()
  const inset = arrowInset()
  if (align === 'leading' || align === 'start') return Math.min(inset, span / 2)
  if (align === 'trailing' || align === 'end') return Math.max(span / 2, span - inset)
  return span / 2
}

function resolveArrowOffset(anchorCenter: number, span: number): number {
  let center = anchorCenter
  const min = Math.min(arrowInset(), span / 2)
  const max = Math.max(min, span - min)
  center = Math.max(min, Math.min(center, max))
  return Math.round(center - ARROW_W / 2)
}

/** measure 阶段（scale 1）量面板真实高度；量不到返回 0 */
function queryPanelHeight(): Promise<number> {
  // #ifndef MP-WEIXIN
  const el = toDom(panel.value)
  if (el && el.getBoundingClientRect) {
    return Promise.resolve(el.getBoundingClientRect().height || 0)
  }
  // #endif
  return new Promise((resolve) => {
    let settled = false
    const finish = (h: number) => {
      if (settled) return
      settled = true
      resolve(h)
    }
    const timer = setTimeout(() => finish(0), QUERY_TIMEOUT_MS)
    try {
      const q = uni.createSelectorQuery().in(instance?.proxy as never)
      q.select('.lingyun-popover__panel').boundingClientRect()
      q.exec((res) => {
        clearTimeout(timer)
        const rect = (Array.isArray(res) ? res[0] : null) as AnchorBox | null
        finish((rect && rect.height) || 0)
      })
    } catch {
      clearTimeout(timer)
      finish(0)
    }
  })
}

function queryAnchor(): Promise<AnchorBox | null> {
  // #ifdef H5
  if (props.anchor) return Promise.resolve(normalizeRect(props.anchor, h5WindowTop()))
  const host = instance?.proxy?.$el as { querySelector?: (s: string) => unknown } | null
  const trigger = host && host.querySelector ? toDom(host.querySelector('.lingyun-popover__trigger')) : null
  if (trigger && trigger.getBoundingClientRect) {
    const b = trigger.getBoundingClientRect()
    return Promise.resolve({ left: b.left, top: b.top, width: b.width, height: b.height })
  }
  // #endif
  if (props.anchor) return Promise.resolve(normalizeRect(props.anchor))
  return new Promise((resolve) => {
    let settled = false
    const finish = (rect: AnchorBox | null) => {
      if (settled) return
      settled = true
      resolve(normalizeRect(rect))
    }
    const timer = setTimeout(() => finish(null), QUERY_TIMEOUT_MS)
    try {
      const q = uni.createSelectorQuery().in(instance?.proxy as never)
      q.select('.lingyun-popover__trigger').boundingClientRect()
      q.exec((res) => {
        clearTimeout(timer)
        finish((Array.isArray(res) ? res[0] : null) as AnchorBox | null)
      })
    } catch {
      clearTimeout(timer)
      finish(null)
    }
  })
}

function applyAnchor(trigger: AnchorBox | null, panelH: number, viewport: Viewport): void {
  const vw = viewport.width
  const inset = Math.max(0, Number(props.bottomInset) || 0)
  const vh = Math.max(0, viewport.height - inset)
  const rawHeight = panelH > 0 ? panelH : EST_PANEL_H
  /* 菜单面板限高视口内（上下各留 12），超出部分由面板内部滚动承载 */
  const height =
    props.variant === 'menu' ? Math.min(rawHeight, Math.max(EST_PANEL_H, vh - 24)) : rawHeight
  const along = props.showArrow ? ARROW_H + TIP_GAP : GAP

  if (!trigger || typeof trigger.width !== 'number' || !(trigger.width > 0) || trigger.top == null) {
    anchorCenterX.value = 0
    anchorCenterY.value = 0
    anchorW.value = 0
    anchorH.value = 0
    resolvedPlace.value = 'bottom'
    panelTop.value = Math.round(vh * 0.28)
    panelLeft.value = 16
    panelWidth.value = resolvePanelWidth(0, vw)
    arrowOffset.value = resolveArrowOffset(panelWidth.value / 2, panelWidth.value)
    return
  }

  const anchorLeft = trigger.left ?? 0
  const anchorTop = trigger.top
  const anchorWidth = trigger.width
  const anchorHeight = trigger.height ?? 0

  anchorCenterX.value = anchorLeft + anchorWidth / 2
  anchorCenterY.value = anchorTop + anchorHeight / 2
  anchorW.value = anchorWidth
  anchorH.value = anchorHeight
  /* 菜单最终面板覆盖触发按钮：按钮被菜单“吃掉”，不再留一条空位 */
  const verticalAlong =
    !props.showArrow && props.variant === 'menu' ? -anchorHeight : along

  const width = resolvePanelWidth(anchorWidth, vw)
  const allowed: string[] = ['top', 'bottom', 'left', 'right']
  let place = allowed.indexOf(props.placement) >= 0 ? props.placement : 'bottom'

  if (place === 'left' || place === 'right') {
    const roomRight = vw - (anchorLeft + anchorWidth) - along - width
    const roomLeft = anchorLeft - along - width
    if (place === 'right' && roomRight < 12 && roomLeft > roomRight) place = 'left'
    if (place === 'left' && roomLeft < 12 && roomRight > roomLeft) place = 'right'

    let left =
      place === 'right'
        ? anchorLeft + anchorWidth + along
        : anchorLeft - width - along
    left = Math.max(12, Math.min(left, vw - width - 12))

    let top = anchorTop + anchorHeight / 2 - alignTip(height)
    top = Math.max(12, Math.min(top, vh - height - 12))

    resolvedPlace.value = place
    panelTop.value = Math.round(top)
    panelLeft.value = Math.round(left)
    panelWidth.value = Math.round(width)
    arrowOffset.value = resolveArrowOffset(
      anchorTop + anchorHeight / 2 - top,
      height,
    )
    return
  }

  let left: number
  if (props.variant === 'menu' && !props.showArrow) {
    /* 菜单贴按钮的左上角或右上角：按钮偏左时左对齐，偏右时右对齐 */
    const roomRight = vw - (anchorLeft + anchorWidth)
    left =
      roomRight >= anchorLeft
        ? anchorLeft
        : anchorLeft + anchorWidth - width
  } else {
    left = anchorLeft + anchorWidth / 2 - alignTip(width)
  }
  left = Math.max(12, Math.min(left, vw - width - 12))

  const below = anchorTop + anchorHeight + verticalAlong
  const above = anchorTop - verticalAlong - height
  const roomBelow = vh - 12 - (below + height)
  const roomAbove = above - 12
  if (place === 'bottom' && roomBelow < 0 && roomAbove > roomBelow) place = 'top'
  if (place === 'top' && roomAbove < 0 && roomBelow > roomAbove) place = 'bottom'

  let top = place === 'top' ? above : below
  top = Math.max(12, Math.min(top, vh - height - 12))

  resolvedPlace.value = place
  panelTop.value = Math.round(top)
  panelLeft.value = Math.round(left)
  panelWidth.value = Math.round(width)
  arrowOffset.value = resolveArrowOffset(
    anchorLeft + anchorWidth / 2 - left,
    width,
  )
}

function onFollow(): void {
  // #ifdef H5
  if (followRaf.value) return
  followRaf.value = requestAnimationFrame(() => {
    followRaf.value = 0
    if (!mounted.value || phase.value === 'leave' || phase.value === 'measure') return
    const seq = openSeq.value
    queryAnchor().then((rect) => {
      if (seq !== openSeq.value || !visible.value) return
      const h = panelH.value || (props.estimateHeight > 0 ? props.estimateHeight : EST_PANEL_H)
      applyAnchor(rect, h, readViewport())
    })
  })
  // #endif
}

/** H5：遮罩挡不住滚轮 / 惯性滚动，打开期间页面或任意容器滚动、窗口缩放时重新贴锚点 */
function bindFollow(): void {
  // #ifdef H5
  window.addEventListener('scroll', onFollow, true)
  window.addEventListener('resize', onFollow)
  // #endif
}

function unbindFollow(): void {
  // #ifdef H5
  window.removeEventListener('scroll', onFollow, true)
  window.removeEventListener('resize', onFollow)
  if (followRaf.value) cancelAnimationFrame(followRaf.value)
  followRaf.value = 0
  // #endif
}

/** 视口底边变化（如小程序键盘抬起）后重新量面板并贴锚点 */
function refreshLayout(): void {
  if (!mounted.value || phase.value === 'leave' || phase.value === 'measure') return
  const seq = openSeq.value
  queryAnchor().then((rect) => {
    if (seq !== openSeq.value || !visible.value) return
    queryPanelHeight().then((h) => {
      if (seq !== openSeq.value || !visible.value) return
      if (h > 0) panelH.value = h
      const height =
        h > 0
          ? h
          : panelH.value || (props.estimateHeight > 0 ? props.estimateHeight : EST_PANEL_H)
      applyAnchor(rect, height, readViewport())
    })
  })
}

function onPanelTransitionEnd(event?: { propertyName?: string; detail?: { propertyName?: string } }): void {
  if (!visible.value || phase.value !== 'open') return
  const property = event?.propertyName || event?.detail?.propertyName
  if (property && property !== 'border-radius' && property !== 'borderRadius') return
  notifyOverlayOpened()
}

function openAnim(): void {
  clearTimers()
  openNotified.value = false
  const seq = ++openSeq.value
  const alive = () => seq === openSeq.value && visible.value
  const estimate = props.estimateHeight > 0 ? props.estimateHeight : EST_PANEL_H
  // 测锚点 → measure 挂载（隐藏、scale 1）量面板高 → 定位 → enter（无过渡）→ open
  queryAnchor().then((rect) => {
    if (!alive()) return
    const viewport = readViewport()
    applyAnchor(rect, estimate, viewport)
    noTrans.value = true
    phase.value = 'measure'
    mounted.value = true
    nextTick(() => {
      enterTimer.value = setTimeout(() => {
        enterTimer.value = null
        if (!alive()) return
        queryPanelHeight().then((h) => {
          if (!alive()) return
          panelH.value = h
          applyAnchor(rect, h > 0 ? h : estimate, viewport)
          phase.value = 'enter'
          bindFollow()
          nextTick(() => {
            enterTimer.value = setTimeout(() => {
              enterTimer.value = null
              if (!alive()) return
              noTrans.value = false
              phase.value = 'open'
              /* transitionend 不可用时兜底通知内容已完成展开 */
              openSettleTimer.value = setTimeout(() => {
                openSettleTimer.value = null
                notifyOverlayOpened()
              }, 900)
            }, 48)
          })
        })
      }, 16)
    })
  })
}

function closeAnim(): void {
  clearTimers()
  unbindFollow()
  openSeq.value++
  const wasMounted = mounted.value
  if (!mounted.value || phase.value === 'measure') {
    mounted.value = false
    phase.value = ''
    if (wasMounted) emit('closed')
    return
  }
  if (props.instantClose) {
    mounted.value = false
    phase.value = ''
    panelH.value = 0
    emit('closed')
    return
  }
  /* 进场途中被关掉也走退场过渡，避免水滴从起始尺寸直接跳走 */
  noTrans.value = false
  phase.value = 'leave'
  leaveTimer.value = setTimeout(() => {
    mounted.value = false
    phase.value = ''
    leaveTimer.value = null
    emit('closed')
  }, props.variant === 'menu' ? MENU_LEAVE_MS : LEAVE_MS)
}

watch(
  visible,
  (val: boolean) => {
    if (val) openAnim()
    else closeAnim()
  },
  { immediate: true },
)

watch(
  () => props.bottomInset,
  () => {
    nextTick(() => refreshLayout())
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

onBeforeUnmount(() => {
  _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
    !!_lingyunMpOverlayHold.value,
    false,
  )
  clearTimers()
  unbindFollow()
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-popover {
  position: relative;
  display: inline-flex;
}

.lingyun-popover__trigger {
  display: inline-flex;
  transition: opacity 0.12s ease;
}

/* 菜单打开期间触发按钮被菜单“吃掉”，关闭动画结束后再恢复 */
.lingyun-popover--menu-active .lingyun-popover__trigger {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

/* 关闭时菜单几乎完全消失后，按钮再淡入；不做下挂小水滴 */
@keyframes lingyun-popover-menu-return {
  0% {
    opacity: 0;
    transform: scale(0.96);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

.lingyun-popover--menu-returning .lingyun-popover__trigger {
  animation: lingyun-popover-menu-return 0.08s ease-out 0.26s both;
  transform-origin: 50% 50%;
}

.lingyun-popover--trigger-block,
.lingyun-popover--trigger-block .lingyun-popover__trigger {
  display: block;
  width: 100%;
}

.lingyun-popover__root {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1100;
}

/* hover 菜单：根层不吃鼠标，只有面板本身可交互 */
.lingyun-popover--no-mask {
  pointer-events: none;
}

.lingyun-popover--no-mask .lingyun-popover__lift {
  pointer-events: auto;
}

/* 点击外部关闭但不压暗页面（需覆盖 theme-dark 的遮罩底色） */
.lingyun-popover--mask-transparent .lingyun-popover__mask,
.lingyun-popover--mask-transparent.theme-dark .lingyun-popover__mask {
  background-color: transparent !important;
}

/* 量面板高度用：不可见、不吃点击；勿改成 opacity（玻璃节点） */
.lingyun-popover--measure {
  visibility: hidden;
}

.lingyun-popover__mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.18);
  opacity: 0;
  transition: opacity 0.28s ease;
}

.lingyun-popover__root.theme-dark .lingyun-popover__mask {
  background-color: rgba(0, 0, 0, 0.42);
}

.lingyun-popover--open .lingyun-popover__mask {
  opacity: 1;
}

.lingyun-popover--leave .lingyun-popover__mask {
  opacity: 0;
  transition: opacity 0.2s ease-in;
}

.lingyun-popover__lift {
  position: absolute;
  box-sizing: border-box;
  will-change: transform;
  overflow: visible;
}

/*
 * 箭头 = 面板的延伸：fill 与面板同底色，clip-path 裁成三角；stroke 是斜边上 1px 的 V 形，
 * 颜色同面板 hairline。箭头压进面板 1px：stroke 画满，两端正好落在面板描边那一行上连成一线；
 * fill 在底边截掉 1px，不与面板底色叠加出亮线。面板描边在箭头处由 mask 挖空（见文末）。
 * fill 不加 backdrop-filter：它只能模糊自身 22×14 的小框，边缘采样发虚，在与面板交界处会出一条暗线。
 */
$popover-panel-bg: rgba(255, 255, 255, 0.72);
$popover-hairline: rgba(255, 255, 255, 0.45);
$popover-hairline-dark: rgba(166, 166, 166, 0.45);

.lingyun-popover__arrow {
  position: absolute;
  width: 22px;
  height: 14px;
  z-index: 2;
}

.lingyun-popover--place-left .lingyun-popover__arrow,
.lingyun-popover--place-right .lingyun-popover__arrow {
  width: 14px;
  height: 22px;
}

.lingyun-popover__arrow-fill,
.lingyun-popover__arrow-stroke {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.lingyun-popover__arrow-fill {
  background-color: $popover-panel-bg;
}

.lingyun-popover__arrow-stroke {
  background-color: $popover-hairline;
}

.lingyun-popover__root.theme-dark .lingyun-popover__arrow-fill {
  background-color: #{$lingyun-glass-overlay-bg-dark};
}

.lingyun-popover__root.theme-dark .lingyun-popover__arrow-stroke {
  background-color: $popover-hairline-dark;
}

/* 尖朝上（面板在下） */
.lingyun-popover--place-bottom .lingyun-popover__arrow-fill {
  -webkit-clip-path: polygon(50% 0, 21.21px 13px, 0.79px 13px);
  clip-path: polygon(50% 0, 21.21px 13px, 0.79px 13px);
}

.lingyun-popover--place-bottom .lingyun-popover__arrow-stroke {
  -webkit-clip-path: polygon(0 14px, 11px 0, 22px 14px, 20.73px 14px, 11px 1.62px, 1.27px 14px);
  clip-path: polygon(0 14px, 11px 0, 22px 14px, 20.73px 14px, 11px 1.62px, 1.27px 14px);
}

/* 尖朝下（面板在上） */
.lingyun-popover--place-top .lingyun-popover__arrow-fill {
  -webkit-clip-path: polygon(0.79px 1px, 21.21px 1px, 50% 100%);
  clip-path: polygon(0.79px 1px, 21.21px 1px, 50% 100%);
}

.lingyun-popover--place-top .lingyun-popover__arrow-stroke {
  -webkit-clip-path: polygon(0 0, 11px 14px, 22px 0, 20.73px 0, 11px 12.38px, 1.27px 0);
  clip-path: polygon(0 0, 11px 14px, 22px 0, 20.73px 0, 11px 12.38px, 1.27px 0);
}

/* 尖朝左（面板在右） */
.lingyun-popover--place-right .lingyun-popover__arrow-fill {
  -webkit-clip-path: polygon(0 50%, 13px 0.79px, 13px 21.21px);
  clip-path: polygon(0 50%, 13px 0.79px, 13px 21.21px);
}

.lingyun-popover--place-right .lingyun-popover__arrow-stroke {
  -webkit-clip-path: polygon(14px 0, 0 11px, 14px 22px, 14px 20.73px, 1.62px 11px, 14px 1.27px);
  clip-path: polygon(14px 0, 0 11px, 14px 22px, 14px 20.73px, 1.62px 11px, 14px 1.27px);
}

/* 尖朝右（面板在左） */
.lingyun-popover--place-left .lingyun-popover__arrow-fill {
  -webkit-clip-path: polygon(100% 50%, 1px 0.79px, 1px 21.21px);
  clip-path: polygon(100% 50%, 1px 0.79px, 1px 21.21px);
}

.lingyun-popover--place-left .lingyun-popover__arrow-stroke {
  -webkit-clip-path: polygon(0 0, 14px 11px, 0 22px, 0 20.73px, 12.38px 11px, 0 1.27px);
  clip-path: polygon(0 0, 14px 11px, 0 22px, 0 20.73px, 12.38px 11px, 0 1.27px);
}

.lingyun-popover__panel {
  border-radius: 14px;
  padding: 12px 14px;
  box-sizing: border-box;
  @include lingyun-glass-surface;
  background-color: $popover-panel-bg;
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  box-shadow:
    var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    var(--lingyun-glass-shadow, #{$lingyun-glass-shadow});
}

/* Sketch Menus/Light/iPhone：250 宽由调用方传入；圆角 32、内边距 10 */
.lingyun-popover--menu .lingyun-popover__panel {
  border-radius: 32px;
  padding: 10px;
  overflow: hidden;
  /* 菜单项超出视口时面板封顶、内部滚动，不再溢出屏幕底边 */
  max-height: calc(100vh - 24px);
  overflow-y: auto;
}

.lingyun-popover__content {
  min-width: 0;
}

/*
 * Menu 入场对齐 iOS 27：面板从按钮位置长成一颗玻璃水滴，再收成 32 圆角；
 * 内容晚一步淡入并去掉模糊。圆角 200 在 250 宽面板上会裁成半圆端，形成水滴轮廓。
 */
.lingyun-popover--menu .lingyun-popover__content {
  transform-origin: 50% 0;
}

.lingyun-popover--menu.lingyun-popover--enter .lingyun-popover__panel {
  border-radius: var(--menu-rx, 200px) / var(--menu-ry, 200px);
  transition: none;
}

.lingyun-popover--menu.lingyun-popover--open .lingyun-popover__panel {
  border-radius: 32px;
  transition: border-radius 0.46s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.lingyun-popover--menu.lingyun-popover--leave .lingyun-popover__panel {
  border-radius: var(--menu-rx, 200px) / var(--menu-ry, 200px);
  box-shadow: none;
  transition: border-radius 0.2s cubic-bezier(0.4, 0, 0.8, 0.6);
}

.lingyun-popover--menu.lingyun-popover--enter .lingyun-popover__content {
  opacity: 0;
  transform: scale(1.03);
  transition: none;
}

.lingyun-popover--menu.lingyun-popover--open .lingyun-popover__content {
  opacity: 1;
  transform: scale(1);
  transition:
    opacity 0.22s ease-out 0.12s,
    transform 0.4s cubic-bezier(0.22, 1.08, 0.36, 1) 0.04s;
}

.lingyun-popover--menu.lingyun-popover--leave .lingyun-popover__content {
  opacity: 0;
  transform: scale(0.985);
  transition:
    opacity 0.14s ease-in,
    transform 0.2s ease-in;
}

/* #ifdef H5 */
.lingyun-popover--menu.lingyun-popover--enter .lingyun-popover__content {
  filter: blur(10px);
}

.lingyun-popover--menu.lingyun-popover--open .lingyun-popover__content {
  filter: blur(0);
  transition:
    opacity 0.22s ease-out 0.12s,
    transform 0.4s cubic-bezier(0.22, 1.08, 0.36, 1) 0.04s,
    filter 0.3s ease-out 0.08s;
}

.lingyun-popover--menu.lingyun-popover--leave .lingyun-popover__content {
  filter: blur(6px);
  transition:
    opacity 0.14s ease-in,
    transform 0.2s ease-in,
    filter 0.16s ease-in;
}
/* #endif */

.lingyun-popover__root.theme-dark .lingyun-popover__panel {
  border: #{$lingyun-glass-hairline-dark};
  background-color: #{$lingyun-glass-overlay-bg-dark};
  box-shadow: #{$lingyun-glass-highlight-dark}, #{$lingyun-glass-shadow-dark};
}

/*
 * 有箭头时：面板描边与内高光挪到 ::before，用 mask 在箭头处挖空（--ax 为箭头在面板上的偏移）。
 * 挖空只到斜边描边内侧（两端各留 1.27px），面板描边伸进箭头脚下，被斜边盖住接成一条线；
 * 半透明箭头盖不住描边，不挖会在箭头底边留一条线。面板自身不留边框，::before 贴着面板盒子画描边，
 * 与箭头同一坐标系（边框宽度在非整数倍屏上会被取整，用负 inset 补会错位）。
 */
.lingyun-popover__root.lingyun-popover--arrow .lingyun-popover__panel {
  position: relative;
  border-width: 0;
  box-shadow: var(--lingyun-glass-shadow, #{$lingyun-glass-shadow});
}

.lingyun-popover__root.theme-dark.lingyun-popover--arrow .lingyun-popover__panel {
  box-shadow: #{$lingyun-glass-shadow-dark};
}

.lingyun-popover--arrow .lingyun-popover__panel::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  border: var(--lingyun-glass-hairline, #{$lingyun-glass-hairline});
  border-radius: inherit;
  box-shadow: var(--lingyun-glass-highlight, #{$lingyun-glass-highlight});
  pointer-events: none;
}

.lingyun-popover__root.theme-dark.lingyun-popover--arrow .lingyun-popover__panel::before {
  border: #{$lingyun-glass-hairline-dark};
  box-shadow: #{$lingyun-glass-highlight-dark};
}

.lingyun-popover--arrow.lingyun-popover--place-bottom .lingyun-popover__panel::before {
  -webkit-mask:
    linear-gradient(to right, #000 calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 20.73px), #000 calc(var(--ax) + 20.73px)) 0 0 / 100% 3px no-repeat,
    linear-gradient(#000, #000) 0 3px / 100% calc(100% - 3px) no-repeat;
  mask:
    linear-gradient(to right, #000 calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 20.73px), #000 calc(var(--ax) + 20.73px)) 0 0 / 100% 3px no-repeat,
    linear-gradient(#000, #000) 0 3px / 100% calc(100% - 3px) no-repeat;
}

.lingyun-popover--arrow.lingyun-popover--place-top .lingyun-popover__panel::before {
  -webkit-mask:
    linear-gradient(to right, #000 calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 20.73px), #000 calc(var(--ax) + 20.73px)) 0 100% / 100% 3px no-repeat,
    linear-gradient(#000, #000) 0 0 / 100% calc(100% - 3px) no-repeat;
  mask:
    linear-gradient(to right, #000 calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 20.73px), #000 calc(var(--ax) + 20.73px)) 0 100% / 100% 3px no-repeat,
    linear-gradient(#000, #000) 0 0 / 100% calc(100% - 3px) no-repeat;
}

.lingyun-popover--arrow.lingyun-popover--place-right .lingyun-popover__panel::before {
  -webkit-mask:
    linear-gradient(to bottom, #000 calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 20.73px), #000 calc(var(--ax) + 20.73px)) 0 0 / 3px 100% no-repeat,
    linear-gradient(#000, #000) 3px 0 / calc(100% - 3px) 100% no-repeat;
  mask:
    linear-gradient(to bottom, #000 calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 20.73px), #000 calc(var(--ax) + 20.73px)) 0 0 / 3px 100% no-repeat,
    linear-gradient(#000, #000) 3px 0 / calc(100% - 3px) 100% no-repeat;
}

.lingyun-popover--arrow.lingyun-popover--place-left .lingyun-popover__panel::before {
  -webkit-mask:
    linear-gradient(to bottom, #000 calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 20.73px), #000 calc(var(--ax) + 20.73px)) 100% 0 / 3px 100% no-repeat,
    linear-gradient(#000, #000) 0 0 / calc(100% - 3px) 100% no-repeat;
  mask:
    linear-gradient(to bottom, #000 calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 1.27px), transparent calc(var(--ax) + 20.73px), #000 calc(var(--ax) + 20.73px)) 100% 0 / 3px 100% no-repeat,
    linear-gradient(#000, #000) 0 0 / calc(100% - 3px) 100% no-repeat;
}
</style>
