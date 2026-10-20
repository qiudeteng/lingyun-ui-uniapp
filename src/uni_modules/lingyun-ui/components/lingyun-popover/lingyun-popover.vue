<template>
  <view class="lingyun-popover">
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
          <view ref="panel" class="lingyun-popover__panel">
            <slot />
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
          <view ref="panel" class="lingyun-popover__panel">
            <slot />
          </view>
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
const GAP = 8
const ARROW_W = 22
const ARROW_H = 14
const TIP_GAP = 4
/* 面板圆角（glass surface / menu），箭头底边不能压到圆弧上 */
const PANEL_RADIUS = 16
const PANEL_RADIUS_MENU = 32
const PANEL_MIN_W = 160
const PANEL_MAX_W = 280
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

export default defineComponent({
  name: 'LingyunPopover',
  mixins: [mpOverlayHoldMixin],
  emits: ['update:show', 'update:modelValue', 'close'],
  props: {
    show: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    modelValue: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    /** top | bottom | left | right；空间不够会翻到对侧 */
    placement: { type: String, default: 'bottom' },
    /** 箭头；Sketch Popover 每档都有 Arrow */
    showArrow: { type: Boolean, default: true },
    /** 面板宽（px）。0 表示跟触发器，并限制在 160–280 */
    width: { type: [Number, String] as PropType<number | string>, default: 0 },
    /** 箭头落在面板哪一侧（面板随之偏移），箭头始终指向触发器：auto / middle 居中，leading 靠前，trailing 靠后 */
    arrowAlign: { type: String, default: 'auto' },
    maskClosable: { type: Boolean, default: true },
    /** 是否显示遮罩；hover 子菜单等场景关闭，避免挡住鼠标 */
    mask: { type: Boolean, default: true },
    /** 遮罩透明但仍拦截点击；用于点击外部关闭、不加暗色 */
    maskTransparent: { type: Boolean, default: false },
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
  },
  data() {
    return {
      mounted: false,
      phase: '' as PopoverPhase,
      resolvedPlace: 'bottom',
      noTrans: false,
      leaveTimer: null as ReturnType<typeof setTimeout> | null,
      enterTimer: null as ReturnType<typeof setTimeout> | null,
      panelTop: 0,
      panelLeft: 16,
      panelWidth: 200,
      arrowOffset: 80,
      openSeq: 0,
      panelH: 0,
      followRaf: 0,
    }
  },
  computed: {
    visible() {
      if (this.show !== undefined && this.show !== null) return !!this.show
      if (this.modelValue !== undefined && this.modelValue !== null) return !!this.modelValue
      return false
    },
    rootClass() {
      let themeClass = 'theme-light'
      try {
        themeClass = useLingyunTheme().rootClass || 'theme-light'
      } catch {
        /* ignore */
      }
      return [
        themeClass,
        this.phase ? `lingyun-popover--${this.phase}` : '',
        `lingyun-popover--place-${this.resolvedPlace}`,
        this.variant === 'menu' ? 'lingyun-popover--menu' : '',
        this.showArrow ? 'lingyun-popover--arrow' : '',
        !this.mask ? 'lingyun-popover--no-mask' : '',
        this.maskTransparent ? 'lingyun-popover--mask-transparent' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    rootStyle() {
      return { zIndex: Number(this.zIndex) || 1100 }
    },
    arrowStyle() {
      const o = `${this.arrowOffset}px`
      /* 压进面板 1px，斜边描边接上面板描边；fill 在底边截掉 1px，不与面板底色叠加 */
      const edge = `${-(ARROW_H - 1)}px`
      if (this.resolvedPlace === 'top') return { left: o, bottom: edge }
      if (this.resolvedPlace === 'left') return { top: o, right: edge }
      if (this.resolvedPlace === 'right') return { top: o, left: edge }
      return { left: o, top: edge }
    },
    liftStyle() {
      /* 对齐 Alert：缩放在 lift，勿对玻璃 panel 做 opacity */
      let scale = 1
      if (this.phase === 'enter') scale = 1.16
      else if (this.phase === 'leave') scale = 0.92
      const leaving = this.phase === 'leave'
      /* 缩放原点放在箭头尖（指向点），缩放过程中箭头始终贴着锚点 */
      const tip = `${this.arrowOffset + ARROW_W / 2}px`
      const place = this.resolvedPlace
      return {
        top: `${this.panelTop}px`,
        left: `${this.panelLeft}px`,
        width: `${this.panelWidth}px`,
        '--ax': `${this.arrowOffset}px`,
        transform: `scale(${scale})`,
        transformOrigin:
          place === 'top'
            ? `${tip} 100%`
            : place === 'left'
              ? `100% ${tip}`
              : place === 'right'
                ? `0 ${tip}`
                : `${tip} 0`,
        transition: this.noTrans
          ? 'none'
          : leaving
            ? 'transform 0.22s cubic-bezier(0.4, 0, 1, 1)'
            : 'transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)',
      }
    },
  },
  watch: {
    visible: {
      immediate: true,
      handler(val: boolean) {
        if (val) this.openAnim()
        else this.closeAnim()
      },
    },
  },
  beforeUnmount() {
    this.clearTimers()
    this.unbindFollow()
  },
  methods: {
    /** H5：遮罩挡不住滚轮 / 惯性滚动，打开期间页面或任意容器滚动、窗口缩放时重新贴锚点 */
    bindFollow() {
      // #ifdef H5
      window.addEventListener('scroll', this.onFollow, true)
      window.addEventListener('resize', this.onFollow)
      // #endif
    },
    unbindFollow() {
      // #ifdef H5
      window.removeEventListener('scroll', this.onFollow, true)
      window.removeEventListener('resize', this.onFollow)
      if (this.followRaf) cancelAnimationFrame(this.followRaf)
      this.followRaf = 0
      // #endif
    },
    onFollow() {
      // #ifdef H5
      if (this.followRaf) return
      this.followRaf = requestAnimationFrame(() => {
        this.followRaf = 0
        if (!this.mounted || this.phase === 'leave' || this.phase === 'measure') return
        const seq = this.openSeq
        this.queryAnchor().then((rect) => {
          if (seq !== this.openSeq || !this.visible) return
          const h = this.panelH || (this.estimateHeight > 0 ? this.estimateHeight : EST_PANEL_H)
          this.applyAnchor(rect, h, this.readViewport())
        })
      })
      // #endif
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
    },
    setVisible(val: boolean) {
      this.$emit('update:show', val)
      this.$emit('update:modelValue', val)
      if (!val) this.$emit('close')
    },
    onTriggerClick() {
      this.setVisible(!this.visible)
    },
    onMask() {
      if (!this.maskClosable) return
      this.setVisible(false)
    },
    readViewport(): Viewport {
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
    },
    normalizeRect(rect: AnchorBox | null, dy = 0): AnchorBox | null {
      if (!rect || rect.top == null) return null
      return {
        left: rect.left ?? 0,
        top: rect.top + dy,
        width: rect.width ?? 0,
        height: rect.height ?? 0,
      }
    },
    /** H5：uni boundingClientRect 减掉的顶部偏移（同 uni-h5 getWindowOffset），用于还原 anchor 到视口坐标 */
    h5WindowTop(): number {
      let top = 0
      // #ifdef H5
      const style = document.documentElement.style
      const read = (name: string) => parseInt((style.getPropertyValue(name).match(/\d+/) || ['0'])[0], 10) || 0
      top = read('--window-top') + read('--top-window-height')
      // #endif
      return top
    },
    queryAnchor(): Promise<AnchorBox | null> {
      // #ifdef H5
      if (this.anchor) return Promise.resolve(this.normalizeRect(this.anchor, this.h5WindowTop()))
      const host = this.$el as { querySelector?: (s: string) => unknown } | null
      const trigger = host && host.querySelector ? toDom(host.querySelector('.lingyun-popover__trigger')) : null
      if (trigger && trigger.getBoundingClientRect) {
        const b = trigger.getBoundingClientRect()
        return Promise.resolve({ left: b.left, top: b.top, width: b.width, height: b.height })
      }
      // #endif
      if (this.anchor) return Promise.resolve(this.normalizeRect(this.anchor))
      return new Promise((resolve) => {
        let settled = false
        const finish = (rect: AnchorBox | null) => {
          if (settled) return
          settled = true
          resolve(this.normalizeRect(rect))
        }
        const timer = setTimeout(() => finish(null), QUERY_TIMEOUT_MS)
        try {
          const q = uni.createSelectorQuery().in(this)
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
    },
    /** measure 阶段（scale 1）量面板真实高度；量不到返回 0 */
    queryPanelHeight(): Promise<number> {
      // #ifndef MP-WEIXIN
      const el = toDom(this.$refs.panel)
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
          const q = uni.createSelectorQuery().in(this)
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
    },
    applyAnchor(trigger: AnchorBox | null, panelH: number, viewport: Viewport) {
      const vw = viewport.width
      const vh = viewport.height
      const height = panelH > 0 ? panelH : EST_PANEL_H
      const along = this.showArrow ? ARROW_H + TIP_GAP : GAP

      if (!trigger || typeof trigger.width !== 'number' || !(trigger.width > 0) || trigger.top == null) {
        this.resolvedPlace = 'bottom'
        this.panelTop = Math.round(vh * 0.28)
        this.panelLeft = 16
        this.panelWidth = this.resolvePanelWidth(0, vw)
        this.arrowOffset = this.resolveArrowOffset(this.panelWidth / 2, this.panelWidth)
        return
      }

      const anchorLeft = trigger.left ?? 0
      const anchorTop = trigger.top
      const anchorWidth = trigger.width
      const anchorHeight = trigger.height ?? 0

      const width = this.resolvePanelWidth(anchorWidth, vw)
      const allowed: string[] = ['top', 'bottom', 'left', 'right']
      let place = allowed.indexOf(this.placement) >= 0 ? this.placement : 'bottom'

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

        let top = anchorTop + anchorHeight / 2 - this.alignTip(height)
        top = Math.max(12, Math.min(top, vh - height - 12))

        this.resolvedPlace = place
        this.panelTop = Math.round(top)
        this.panelLeft = Math.round(left)
        this.panelWidth = Math.round(width)
        this.arrowOffset = this.resolveArrowOffset(
          anchorTop + anchorHeight / 2 - top,
          height,
        )
        return
      }

      let left = anchorLeft + anchorWidth / 2 - this.alignTip(width)
      left = Math.max(12, Math.min(left, vw - width - 12))

      const below = anchorTop + anchorHeight + along
      const above = anchorTop - along - height
      const roomBelow = vh - 12 - (below + height)
      const roomAbove = above - 12
      if (place === 'bottom' && roomBelow < 0 && roomAbove > roomBelow) place = 'top'
      if (place === 'top' && roomAbove < 0 && roomBelow > roomAbove) place = 'bottom'

      let top = place === 'top' ? above : below
      top = Math.max(12, Math.min(top, vh - height - 12))

      this.resolvedPlace = place
      this.panelTop = Math.round(top)
      this.panelLeft = Math.round(left)
      this.panelWidth = Math.round(width)
      this.arrowOffset = this.resolveArrowOffset(
        anchorLeft + anchorWidth / 2 - left,
        width,
      )
    },
    resolvePanelWidth(triggerWidth: number, vw: number): number {
      const raw = Number(this.width)
      const cap = Math.max(PANEL_MIN_W, vw - 24)
      if (raw > 0) return Math.round(Math.min(Math.max(raw, 120), cap))
      const basis = Math.max(Number(triggerWidth) || 0, PANEL_MIN_W)
      return Math.round(Math.min(PANEL_MAX_W, Math.max(PANEL_MIN_W, Math.min(basis, cap))))
    },
    /** 箭头在面板上的理想位置（沿边距离）；面板据此相对锚点偏移，箭头始终指向锚点 */
    /** 箭头尖离面板边缘的最小距离：圆角 + 半个箭头宽 */
    arrowInset(): number {
      return (this.variant === 'menu' ? PANEL_RADIUS_MENU : PANEL_RADIUS) + ARROW_W / 2
    },
    alignTip(span: number): number {
      const align = String(this.arrowAlign || 'auto').toLowerCase()
      const inset = this.arrowInset()
      if (align === 'leading' || align === 'start') return Math.min(inset, span / 2)
      if (align === 'trailing' || align === 'end') return Math.max(span / 2, span - inset)
      return span / 2
    },
    resolveArrowOffset(anchorCenter: number, span: number): number {
      let center = anchorCenter
      const min = Math.min(this.arrowInset(), span / 2)
      const max = Math.max(min, span - min)
      center = Math.max(min, Math.min(center, max))
      return Math.round(center - ARROW_W / 2)
    },
    openAnim() {
      this.clearTimers()
      const seq = ++this.openSeq
      const alive = () => seq === this.openSeq && this.visible
      const estimate = this.estimateHeight > 0 ? this.estimateHeight : EST_PANEL_H
      // 测锚点 → measure 挂载（隐藏、scale 1）量面板高 → 定位 → enter（无过渡）→ open
      this.queryAnchor().then((rect) => {
        if (!alive()) return
        const viewport = this.readViewport()
        this.applyAnchor(rect, estimate, viewport)
        this.noTrans = true
        this.phase = 'measure'
        this.mounted = true
        this.$nextTick(() => {
          this.enterTimer = setTimeout(() => {
            this.enterTimer = null
            if (!alive()) return
            this.queryPanelHeight().then((h) => {
              if (!alive()) return
              this.panelH = h
              this.applyAnchor(rect, h > 0 ? h : estimate, viewport)
              this.phase = 'enter'
              this.bindFollow()
              this.$nextTick(() => {
                this.enterTimer = setTimeout(() => {
                  this.enterTimer = null
                  if (!alive()) return
                  this.noTrans = false
                  this.phase = 'open'
                }, 48)
              })
            })
          }, 16)
        })
      })
    },
    closeAnim() {
      this.clearTimers()
      this.unbindFollow()
      this.openSeq++
      if (!this.mounted || this.phase === 'measure') {
        this.mounted = false
        this.phase = ''
        return
      }
      this.phase = 'leave'
      this.leaveTimer = setTimeout(() => {
        this.mounted = false
        this.phase = ''
        this.leaveTimer = null
      }, LEAVE_MS)
    },
  },
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
}

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
