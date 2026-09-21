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
        @touchmove.stop.prevent
      >
        <view class="lingyun-popover__mask" @click="onMask" />
        <view class="lingyun-popover__lift" :style="liftStyle">
          <view v-if="showArrow" class="lingyun-popover__arrow" :style="arrowStyle">
            <view class="lingyun-popover__arrow-fill" />
          </view>
          <view class="lingyun-popover__panel">
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
        @touchmove.stop.prevent
      >
        <view class="lingyun-popover__mask" @click="onMask" />
        <view class="lingyun-popover__lift" :style="liftStyle">
          <view v-if="showArrow" class="lingyun-popover__arrow" :style="arrowStyle">
            <view class="lingyun-popover__arrow-fill" />
          </view>
          <view class="lingyun-popover__panel">
            <slot />
          </view>
        </view>
      </view>
    </teleport>
    <!-- #endif -->
  </view>
</template>

<script>
import { useThemeStore } from '@/stores/theme'

/**
 * lingyun-popover
 * @see design/POPOVERS.md
 *
 * 进场：对齐 Alert——先测锚点；lift 从 scale(1.16) 弹性缩至 1（不对玻璃做 opacity）
 */
const LEAVE_MS = 240
const GAP = 8
const ARROW_W = 22
const ARROW_H = 14
const TIP_GAP = 4
const ARROW_INSET = 22
const PANEL_MIN_W = 160
const PANEL_MAX_W = 280
const QUERY_TIMEOUT_MS = 200
const EST_PANEL_H = 52

export default {
  name: 'LingyunPopover',
  emits: ['update:show', 'update:modelValue', 'close'],
  props: {
    show: { type: Boolean, default: undefined },
    modelValue: { type: Boolean, default: undefined },
    /** top | bottom | left | right；空间不够会翻到对侧 */
    placement: { type: String, default: 'bottom' },
    /** 箭头；Sketch Popover 每档都有 Arrow */
    showArrow: { type: Boolean, default: true },
    /** 面板宽（px）。0 表示跟触发器，并限制在 160–280 */
    width: { type: [Number, String], default: 0 },
    /** auto 指向触发器中心；leading / middle / trailing 固定在边上 */
    arrowAlign: { type: String, default: 'auto' },
    maskClosable: { type: Boolean, default: true },
    zIndex: { type: [Number, String], default: 1100 },
    /** menu：Sketch Menus 面板（圆角 32、内边距 10），给 lingyun-menu 用 */
    variant: { type: String, default: '' },
  },
  data() {
    return {
      mounted: false,
      phase: '',
      resolvedPlace: 'bottom',
      noTrans: false,
      leaveTimer: null,
      enterTimer: null,
      panelTop: 0,
      panelLeft: 16,
      panelWidth: 200,
      arrowOffset: 80,
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
        themeClass = useThemeStore().rootClass || 'theme-light'
      } catch {
        /* ignore */
      }
      return [
        themeClass,
        this.phase ? `lingyun-popover--${this.phase}` : '',
        `lingyun-popover--place-${this.resolvedPlace}`,
        this.variant === 'menu' ? 'lingyun-popover--menu' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    rootStyle() {
      return { zIndex: Number(this.zIndex) || 1100 }
    },
    arrowStyle() {
      const o = `${this.arrowOffset}px`
      const overlap = `${-(ARROW_H - 1)}px`
      if (this.resolvedPlace === 'top') return { left: o, bottom: overlap }
      if (this.resolvedPlace === 'left') return { top: o, right: overlap }
      if (this.resolvedPlace === 'right') return { top: o, left: overlap }
      return { left: o, top: overlap }
    },
    liftStyle() {
      /* 对齐 Alert：缩放在 lift，勿对玻璃 panel 做 opacity */
      let scale = 1
      if (this.phase === 'enter') scale = 1.16
      else if (this.phase === 'leave') scale = 0.92
      const leaving = this.phase === 'leave'
      return {
        top: `${this.panelTop}px`,
        left: `${this.panelLeft}px`,
        width: `${this.panelWidth}px`,
        transform: `scale(${scale})`,
        transformOrigin:
          this.resolvedPlace === 'top'
            ? 'center bottom'
            : this.resolvedPlace === 'left'
              ? 'right center'
              : this.resolvedPlace === 'right'
                ? 'left center'
                : 'center top',
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
      handler(val) {
        if (val) this.openAnim()
        else this.closeAnim()
      },
    },
  },
  beforeUnmount() {
    this.clearTimers()
  },
  methods: {
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
    setVisible(val) {
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
    queryTrigger() {
      return new Promise((resolve) => {
        let settled = false
        const finish = (rect, viewport) => {
          if (settled) return
          settled = true
          resolve({ rect, viewport })
        }
        const timer = setTimeout(() => finish(null, null), QUERY_TIMEOUT_MS)
        try {
          const q = uni.createSelectorQuery().in(this)
          q.select('.lingyun-popover__trigger').boundingClientRect()
          q.selectViewport().boundingClientRect()
          q.exec((res) => {
            clearTimeout(timer)
            const list = Array.isArray(res) ? res : []
            finish(list[0] || null, list[1] || null)
          })
        } catch {
          clearTimeout(timer)
          finish(null, null)
        }
      })
    },
    applyAnchor(trigger, panelH, viewport) {
      const vw = (viewport && viewport.width) || 375
      const vh = (viewport && viewport.height) || 667
      const height = panelH > 0 ? panelH : EST_PANEL_H
      const along = this.showArrow ? ARROW_H + TIP_GAP : GAP

      if (!trigger || !(trigger.width > 0) || trigger.top == null) {
        this.resolvedPlace = 'bottom'
        this.panelTop = Math.round(vh * 0.28)
        this.panelLeft = 16
        this.panelWidth = this.resolvePanelWidth(0, vw)
        this.arrowOffset = this.resolveArrowOffset(this.panelWidth / 2, this.panelWidth)
        return
      }

      const width = this.resolvePanelWidth(trigger ? trigger.width : 0, vw)
      const allowed = ['top', 'bottom', 'left', 'right']
      let place = allowed.indexOf(this.placement) >= 0 ? this.placement : 'bottom'

      if (place === 'left' || place === 'right') {
        const roomRight = vw - (trigger.left + trigger.width) - along - width
        const roomLeft = trigger.left - along - width
        if (place === 'right' && roomRight < 12 && roomLeft >= 12) place = 'left'
        if (place === 'left' && roomLeft < 12 && roomRight >= 12) place = 'right'

        let left =
          place === 'right'
            ? trigger.left + trigger.width + along
            : trigger.left - width - along
        left = Math.max(12, Math.min(left, vw - width - 12))

        let top = trigger.top + trigger.height / 2 - height / 2
        top = Math.max(12, Math.min(top, vh - height - 12))

        this.resolvedPlace = place
        this.panelTop = Math.round(top)
        this.panelLeft = Math.round(left)
        this.panelWidth = Math.round(width)
        this.arrowOffset = this.resolveArrowOffset(
          trigger.top + trigger.height / 2 - top,
          height,
        )
        return
      }

      let left = trigger.left + trigger.width / 2 - width / 2
      left = Math.max(12, Math.min(left, vw - width - 12))

      const below = trigger.top + trigger.height + along
      const above = trigger.top - along - height
      if (place === 'bottom' && below + height > vh - 12 && above >= 12) place = 'top'
      if (place === 'top' && above < 12 && below + height <= vh - 12) place = 'bottom'

      let top = place === 'top' ? above : below
      top = Math.max(12, Math.min(top, vh - height - 12))

      this.resolvedPlace = place
      this.panelTop = Math.round(top)
      this.panelLeft = Math.round(left)
      this.panelWidth = Math.round(width)
      this.arrowOffset = this.resolveArrowOffset(
        trigger.left + trigger.width / 2 - left,
        width,
      )
    },
    resolvePanelWidth(triggerWidth, vw) {
      const raw = Number(this.width)
      const cap = Math.max(PANEL_MIN_W, vw - 24)
      if (raw > 0) return Math.round(Math.min(Math.max(raw, 120), cap))
      const basis = Math.max(Number(triggerWidth) || 0, PANEL_MIN_W)
      return Math.round(Math.min(PANEL_MAX_W, Math.max(PANEL_MIN_W, Math.min(basis, cap))))
    },
    resolveArrowOffset(anchorCenter, span) {
      const align = String(this.arrowAlign || 'auto').toLowerCase()
      let center = anchorCenter
      if (align === 'leading' || align === 'start') center = ARROW_INSET
      else if (align === 'trailing' || align === 'end') center = span - ARROW_INSET
      else if (align === 'middle' || align === 'center') center = span / 2
      const min = Math.min(ARROW_INSET, span / 2)
      const max = Math.max(min, span - min)
      center = Math.max(min, Math.min(center, max))
      return Math.round(center - ARROW_W / 2)
    },
    openAnim() {
      this.clearTimers()
      // 先测锚点 → 无过渡落到 enter（略上方）→ 再开过渡落到 open（从上往下）
      this.queryTrigger().then(({ rect, viewport }) => {
        if (!this.visible) return
        this.applyAnchor(rect, EST_PANEL_H, viewport)
        this.noTrans = true
        this.phase = 'enter'
        this.mounted = true
        this.$nextTick(() => {
          this.enterTimer = setTimeout(() => {
            this.enterTimer = null
            if (!this.visible) return
            this.noTrans = false
            this.phase = 'open'
          }, 48)
        })
      })
    },
    closeAnim() {
      this.clearTimers()
      if (!this.mounted) {
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
}
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

.lingyun-popover__arrow {
  position: absolute;
  width: 0;
  height: 0;
  z-index: 2;
}

.lingyun-popover__arrow-fill {
  position: absolute;
  width: 0;
  height: 0;
}

/* 外层是描边，内层是填充。浅色描边与填充同色；暗黑描边提亮，否则三角贴在深色遮罩上看不见 */
.lingyun-popover--place-bottom .lingyun-popover__arrow {
  border-left: 11px solid transparent;
  border-right: 11px solid transparent;
  border-bottom: 14px solid rgba(255, 255, 255, 0.86);
}

.lingyun-popover--place-bottom .lingyun-popover__arrow-fill {
  left: -8px;
  top: 3px;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 11px solid rgba(255, 255, 255, 0.86);
}

.lingyun-popover--place-top .lingyun-popover__arrow {
  border-left: 11px solid transparent;
  border-right: 11px solid transparent;
  border-top: 14px solid rgba(255, 255, 255, 0.86);
}

.lingyun-popover--place-top .lingyun-popover__arrow-fill {
  left: -8px;
  bottom: 3px;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 11px solid rgba(255, 255, 255, 0.86);
}

.lingyun-popover--place-right .lingyun-popover__arrow {
  border-top: 11px solid transparent;
  border-bottom: 11px solid transparent;
  border-right: 14px solid rgba(255, 255, 255, 0.86);
}

.lingyun-popover--place-right .lingyun-popover__arrow-fill {
  top: -8px;
  left: 3px;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 11px solid rgba(255, 255, 255, 0.86);
}

.lingyun-popover--place-left .lingyun-popover__arrow {
  border-top: 11px solid transparent;
  border-bottom: 11px solid transparent;
  border-left: 14px solid rgba(255, 255, 255, 0.86);
}

.lingyun-popover--place-left .lingyun-popover__arrow-fill {
  top: -8px;
  right: 3px;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 11px solid rgba(255, 255, 255, 0.86);
}

.lingyun-popover__root.theme-dark.lingyun-popover--place-bottom .lingyun-popover__arrow {
  border-bottom-color: rgba(255, 255, 255, 0.92);
}

.lingyun-popover__root.theme-dark.lingyun-popover--place-top .lingyun-popover__arrow {
  border-top-color: rgba(255, 255, 255, 0.92);
}

.lingyun-popover__root.theme-dark.lingyun-popover--place-right .lingyun-popover__arrow {
  border-right-color: rgba(255, 255, 255, 0.92);
}

.lingyun-popover__root.theme-dark.lingyun-popover--place-left .lingyun-popover__arrow {
  border-left-color: rgba(255, 255, 255, 0.92);
}

.lingyun-popover__root.theme-dark.lingyun-popover--place-bottom .lingyun-popover__arrow-fill {
  border-bottom-color: rgba(142, 142, 147, 0.98);
}

.lingyun-popover__root.theme-dark.lingyun-popover--place-top .lingyun-popover__arrow-fill {
  border-top-color: rgba(142, 142, 147, 0.98);
}

.lingyun-popover__root.theme-dark.lingyun-popover--place-right .lingyun-popover__arrow-fill {
  border-right-color: rgba(142, 142, 147, 0.98);
}

.lingyun-popover__root.theme-dark.lingyun-popover--place-left .lingyun-popover__arrow-fill {
  border-left-color: rgba(142, 142, 147, 0.98);
}

.lingyun-popover__panel {
  border-radius: 14px;
  padding: 12px 14px;
  box-sizing: border-box;
  @include lingyun-glass-surface;
  background-color: rgba(255, 255, 255, 0.72);
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
</style>
