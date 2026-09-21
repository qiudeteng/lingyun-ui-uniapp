<template>
  <view
    class="lingyun-image"
    :class="rootClass"
    :style="rootStyle"
    @click="onClick"
  >
    <image
      v-if="showImage"
      class="lingyun-image__img"
      :class="{ 'lingyun-image__img--ready': loaded && !failed }"
      :src="displaySrc"
      :mode="resolvedMode"
      :lazy-load="resolvedLazy"
      @load="onLoad"
      @error="onError"
    />

    <view
      v-if="showPlaceholderLayer"
      class="lingyun-image__placeholder"
    >
      <slot v-if="failed" name="error">
        <text class="lingyun-image__placeholder-text">{{ errorText }}</text>
      </slot>
      <slot v-else name="placeholder">
        <view class="lingyun-image__shimmer" aria-hidden="true">
          <view class="lingyun-image__shimmer-band" />
        </view>
      </slot>
    </view>

    <view v-if="$slots.default" class="lingyun-image__overlay">
      <slot />
    </view>
  </view>
</template>

<script>
/**
 * lingyun-image
 * shape=显示形式 · size/width/height=尺寸 · radius=圆角幅度（仅 rounded）
 * @see design/IMAGES.md
 */

const MODE_ALIAS = {
  cover: 'aspectFill',
  contain: 'aspectFit',
  fill: 'scaleToFill',
}

const VALID_MODES = [
  'scaleToFill',
  'aspectFit',
  'aspectFill',
  'widthFix',
  'heightFix',
  'top',
  'bottom',
  'center',
  'left',
  'right',
  'top left',
  'top right',
  'bottom left',
  'bottom right',
]

/** 尺寸档：控制显示宽高（px），不是圆角 */
const SIZE_PRESET = {
  xs: 32,
  sm: 48,
  md: 72,
  lg: 96,
  xl: 120,
}

/** 圆角幅度（仅 shape=rounded） */
const RADIUS_PRESET = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
}

function toCssSize(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback
  if (typeof v === 'number' && Number.isFinite(v)) return `${v}px`
  const s = String(v).trim()
  if (!s) return fallback
  if (/^-?\d+(\.\d+)?$/.test(s)) return `${s}px`
  return s
}

function hasExplicitSize(v) {
  return v !== undefined && v !== null && v !== ''
}

export default {
  name: 'LingyunImage',
  emits: ['load', 'error', 'click'],
  props: {
    src: { type: String, default: '' },
    mode: { type: String, default: 'aspectFill' },
    lazy: { type: Boolean, default: true },
    lazyLoad: { type: Boolean, default: undefined },
    /**
     * 显示尺寸档（控制宽高，非圆角）
     * xs=32 / sm=48 / md=72 / lg=96 / xl=120；也可传数字 px
     * 若同时传 width/height，以 width/height 为准
     */
    size: { type: [String, Number], default: '' },
    width: { type: [String, Number], default: '' },
    height: { type: [String, Number], default: '' },
    /**
     * 显示形式：square 直角 · rounded 圆角 · circle 圆形
     */
    shape: { type: String, default: 'rounded' },
    /** @deprecated 请用 shape="circle" */
    circle: { type: Boolean, default: false },
    /** 圆角幅度，仅 shape=rounded 生效；none/sm/md/lg/xl 或数字 px */
    radius: { type: [String, Number], default: 'md' },
    errorSrc: { type: String, default: '' },
    errorText: { type: String, default: '加载失败' },
    showErrorPlaceholder: { type: Boolean, default: true },
    showLoading: { type: Boolean, default: true },
    fade: { type: Boolean, default: true },
    preview: { type: Boolean, default: false },
    previewUrls: { type: Array, default: () => [] },
  },
  data() {
    return {
      loaded: false,
      failed: false,
      useErrorSrc: false,
    }
  },
  computed: {
    resolvedShape() {
      if (this.circle) return 'circle'
      const s = String(this.shape || 'rounded').trim().toLowerCase()
      if (s === 'square' || s === 'rect' || s === 'circle' || s === 'rounded') {
        return s === 'rect' ? 'square' : s
      }
      return 'rounded'
    },
    isCircle() {
      return this.resolvedShape === 'circle'
    },
    isSquare() {
      return this.resolvedShape === 'square'
    },
    resolvedMode() {
      const raw = (this.mode || 'aspectFill').trim()
      const mapped = MODE_ALIAS[raw] || raw
      return VALID_MODES.indexOf(mapped) >= 0 ? mapped : 'aspectFill'
    },
    resolvedLazy() {
      if (this.lazyLoad !== undefined && this.lazyLoad !== null) return !!this.lazyLoad
      return !!this.lazy
    },
    sizePx() {
      const s = this.size
      if (!hasExplicitSize(s)) return null
      if (typeof s === 'number' && Number.isFinite(s)) return Math.max(0, s)
      const key = String(s).trim().toLowerCase()
      if (Object.prototype.hasOwnProperty.call(SIZE_PRESET, key)) return SIZE_PRESET[key]
      const n = Number(s)
      if (Number.isFinite(n)) return Math.max(0, n)
      return null
    },
    radiusPx() {
      if (this.isCircle || this.isSquare) return 0
      const r = this.radius
      if (typeof r === 'number' && Number.isFinite(r)) return Math.max(0, r)
      const key = String(r || 'md').trim().toLowerCase()
      if (Object.prototype.hasOwnProperty.call(RADIUS_PRESET, key)) return RADIUS_PRESET[key]
      const n = Number(r)
      if (Number.isFinite(n)) return Math.max(0, n)
      return RADIUS_PRESET.md
    },
    boxWidth() {
      if (hasExplicitSize(this.width)) return toCssSize(this.width, '100%')
      if (this.sizePx !== null) return `${this.sizePx}px`
      return '100%'
    },
    boxHeight() {
      if (hasExplicitSize(this.height)) return toCssSize(this.height, 'auto')
      if (this.sizePx !== null) return `${this.sizePx}px`
      if (this.isCircle) return this.boxWidth
      if (this.resolvedMode === 'widthFix') return 'auto'
      return '100%'
    },
    displaySrc() {
      if (this.useErrorSrc && this.errorSrc) return this.errorSrc
      const s = (this.src || '').trim()
      return s
    },
    showImage() {
      if (!this.displaySrc) return false
      if (this.failed) return false
      return true
    },
    showPlaceholderLayer() {
      if (this.failed) {
        if (this.useErrorSrc && this.errorSrc) return false
        return this.showErrorPlaceholder || !!(this.$slots && this.$slots.error)
      }
      if (!this.loaded && this.showLoading) return true
      return false
    },
    rootClass() {
      return [
        `lingyun-image--${this.resolvedShape}`,
        this.fade ? 'lingyun-image--fade' : '',
        this.resolvedMode === 'widthFix' || this.resolvedMode === 'heightFix'
          ? 'lingyun-image--auto-size'
          : '',
      ]
    },
    rootStyle() {
      const style = {
        width: this.boxWidth,
        height: this.boxHeight,
      }
      if (this.isCircle) {
        style.borderRadius = '50%'
      } else if (this.isSquare) {
        style.borderRadius = '0'
      } else {
        style.borderRadius = `${this.radiusPx}px`
      }
      return style
    },
  },
  watch: {
    src() {
      this.resetState()
    },
  },
  methods: {
    resetState() {
      this.loaded = false
      this.failed = false
      this.useErrorSrc = false
    },
    onLoad(e) {
      this.loaded = true
      this.failed = false
      this.$emit('load', e)
    },
    onError(e) {
      if (!this.useErrorSrc && this.errorSrc) {
        this.useErrorSrc = true
        this.loaded = false
        this.failed = false
        return
      }
      this.failed = true
      this.loaded = false
      this.$emit('error', e)
    },
    onClick(e) {
      this.$emit('click', e)
      if (!this.preview) return
      const current = this.displaySrc
      if (!current || this.failed) return
      const urls =
        Array.isArray(this.previewUrls) && this.previewUrls.length
          ? this.previewUrls.filter(Boolean)
          : [current]
      try {
        uni.previewImage({ urls, current })
      } catch (err) {
        /* ignore */
      }
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-image {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  flex-shrink: 0;
}

.lingyun-image__img {
  display: block;
  width: 100%;
  height: 100%;
}

.lingyun-image--auto-size .lingyun-image__img {
  height: auto;
}

.lingyun-image--fade .lingyun-image__img {
  opacity: 0;
}

.lingyun-image--fade .lingyun-image__img--ready {
  opacity: 1;
  transition: opacity 0.22s ease;
}

.lingyun-image__placeholder {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  z-index: 1;
  overflow: hidden;
}

.lingyun-image__placeholder-text {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
  padding: 0 8px;
  text-align: center;
}

/* 骨架式扫光：高光带从左到右（内联，不引用 skeleton 组件） */
.lingyun-image__shimmer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  overflow: hidden;
}

.lingyun-image__shimmer-band {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 45%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.55) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translateX(-120%);
  animation: lingyun-image-shimmer 1.35s ease-in-out infinite;
}

.theme-dark .lingyun-image__shimmer-band,
.lingyun-image.theme-dark .lingyun-image__shimmer-band {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.14) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}

@keyframes lingyun-image-shimmer {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(280%);
  }
}

.lingyun-image__overlay {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
}
</style>
