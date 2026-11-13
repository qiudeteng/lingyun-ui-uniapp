<template>
  <view class="lingyun-bottom-toolbar" :class="rootClass">
    <view v-if="fixed" class="lingyun-bottom-toolbar__spacer" :style="spacerStyle" />
    <view class="lingyun-bottom-toolbar__card" :style="cardStyle">
      <slot />
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue'
import { LINGYUN_APP_PAGE_NAV_INSET } from '../lingyun-app-page/useLingyunAppPageScroll'
import { useLingyunTheme } from '../../utils/theme'

/** 与 lingyun-goods-nav cart 胶囊一致：左右 12，底边 8 */
const EDGE_X_PX = 12
const EDGE_BOTTOM_PX = 8

/**
 * lingyun-bottom-toolbar
 * @description 底部玻璃栏。定位和材质对齐 lingyun-goods-nav 的购物车胶囊，
 * 栏内不预设按钮或排版，内容全部由默认插槽决定。
 *
 * @property {Boolean} fixed 贴底悬浮（默认 true）
 * @property {Boolean} safeArea 底部安全区（默认 true）
 */
export default defineComponent({
  name: 'LingyunBottomToolbar',
  setup() {
    return {
      pageNavInset: inject(LINGYUN_APP_PAGE_NAV_INSET, ref(0)),
    }
  },
  props: {
    fixed: {
      type: Boolean,
      default: true,
    },
    safeArea: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      safeBottom: 0,
      spacerPx: 0,
      _resizeHandler: null as (() => void) | null,
      _measureTimer: null as ReturnType<typeof setTimeout> | null,
    }
  },
  computed: {
    themeClass(): string {
      try {
        return useLingyunTheme().rootClass || 'theme-light'
      } catch {
        return 'theme-light'
      }
    },
    rootClass(): string[] {
      return [
        this.themeClass,
        this.fixed ? 'lingyun-bottom-toolbar--fixed' : '',
      ].filter(Boolean)
    },
    bottomGapPx(): number {
      return EDGE_BOTTOM_PX + (this.safeArea ? this.safeBottom : 0)
    },
    cardStyle(): Record<string, string> {
      if (!this.fixed) {
        return {
          margin: `0 ${EDGE_X_PX}px ${this.bottomGapPx}px`,
        }
      }
      const inset = Math.max(0, Number(this.pageNavInset) || 0)
      return {
        left: `${inset + EDGE_X_PX}px`,
        right: `${EDGE_X_PX}px`,
        bottom: `${this.bottomGapPx}px`,
      }
    },
    spacerStyle(): Record<string, string> {
      return { height: `${this.spacerPx}px` }
    },
  },
  watch: {
    fixed() {
      this.scheduleMeasure()
    },
    safeArea() {
      this.scheduleMeasure()
    },
  },
  mounted() {
    this.syncSafe()
    this.bindResize()
    this.scheduleMeasure()
  },
  updated() {
    this.scheduleMeasure()
  },
  beforeUnmount() {
    this.unbindResize()
    if (this._measureTimer) {
      clearTimeout(this._measureTimer)
      this._measureTimer = null
    }
  },
  methods: {
    syncSafe() {
      try {
        const info =
          typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
        const inset = info && info.safeAreaInsets
        this.safeBottom = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
      } catch {
        this.safeBottom = 0
      }
    },
    bindResize() {
      if (this._resizeHandler) return
      const handler = () => {
        this.syncSafe()
        this.scheduleMeasure()
      }
      this._resizeHandler = handler
      try {
        if (typeof uni.onWindowResize === 'function') uni.onWindowResize(handler)
      } catch {
        /* 端不支持 */
      }
    },
    unbindResize() {
      const handler = this._resizeHandler
      try {
        if (handler && typeof uni.offWindowResize === 'function') uni.offWindowResize(handler)
      } catch {
        /* 端不支持 */
      }
      this._resizeHandler = null
    },
    scheduleMeasure() {
      if (this._measureTimer) return
      this._measureTimer = setTimeout(() => {
        this._measureTimer = null
        this.measure()
      }, 0)
    },
    measure() {
      if (!this.fixed) {
        this.spacerPx = 0
        return
      }
      const query = uni.createSelectorQuery().in(this)
      query
        .select('.lingyun-bottom-toolbar__card')
        .boundingClientRect((rect) => {
          const box = Array.isArray(rect) ? rect[0] : rect
          const height = box && box.height ? Math.ceil(box.height) : 0
          const next = height > 0 ? height + this.bottomGapPx : 0
          if (next !== this.spacerPx) this.spacerPx = next
        })
        .exec()
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

/* 悬浮玻璃胶囊，对齐 lingyun-goods-nav cart：圆角 31，不预设内部排版 */
.lingyun-bottom-toolbar__card {
  box-sizing: border-box;
  width: auto;
  overflow: hidden;
  @include lingyun-glass-surface;
  border-radius: 31px;
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  box-shadow: var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    var(--lingyun-glass-shadow-raised, #{$lingyun-glass-shadow-raised});
}

.lingyun-bottom-toolbar.theme-dark .lingyun-bottom-toolbar__card {
  border: #{$lingyun-glass-hairline-dark};
  background-color: #{$lingyun-glass-overlay-bg-dark};
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-bottom-toolbar--fixed .lingyun-bottom-toolbar__card {
  position: fixed;
  z-index: 900;
}

.lingyun-bottom-toolbar__spacer {
  width: 100%;
}
</style>
