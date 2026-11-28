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
      :style="imgStyle"
      :src="displaySrc"
      :mode="resolvedMode"
      :lazy-load="resolvedLazy"
      @load="onLoad"
      @error="onError"
    />

    <view
      v-if="showPlaceholderLayer"
      class="lingyun-image__placeholder"
      :style="imgStyle"
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

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import type { PropType } from 'vue'

/**
 * lingyun-image
 * shape=显示形式 · size/width/height=尺寸 · radius=圆角幅度（仅 rounded）
 * @see design/IMAGES.md
 */

const MODE_ALIAS: Record<string, string> = {
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
] as const

type ImageMode = (typeof VALID_MODES)[number]

/** 尺寸档：控制显示宽高（px），不是圆角 */
const SIZE_PRESET: Record<string, number> = {
  xs: 32,
  sm: 48,
  md: 72,
  lg: 96,
  xl: 120,
}

/** 圆角幅度（仅 shape=rounded） */
const RADIUS_PRESET: Record<string, number> = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 26,
}

function toCssSize(v: string | number | null | undefined, fallback: string): string {
  if (v === undefined || v === null || v === '') return fallback
  if (typeof v === 'number' && Number.isFinite(v)) return `${v}px`
  const s = String(v).trim()
  if (!s) return fallback
  if (/^-?\d+(\.\d+)?$/.test(s)) return `${s}px`
  return s
}

function hasExplicitSize(v: string | number | null | undefined): boolean {
  return v !== undefined && v !== null && v !== ''
}

defineOptions({
  name: 'LingyunImage',
})

const props = defineProps({
  src: { type: String, default: '' },
  mode: { type: String, default: 'aspectFill' },
  lazy: { type: Boolean, default: true },
  lazyLoad: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  /**
   * 显示尺寸档（控制宽高，非圆角）
   * xs=32 / sm=48 / md=72 / lg=96 / xl=120；也可传数字 px
   * 若同时传 width/height，以 width/height 为准
   */
  size: { type: [String, Number] as PropType<string | number>, default: '' },
  width: { type: [String, Number] as PropType<string | number>, default: '' },
  height: { type: [String, Number] as PropType<string | number>, default: '' },
  /**
   * 显示形式：square 直角 · rounded 圆角 · circle 圆形
   */
  shape: { type: String, default: 'rounded' },
  /** @deprecated 请用 shape="circle" */
  circle: { type: Boolean, default: false },
  /** 圆角幅度，仅 shape=rounded 生效；none/sm/md/lg/xl/2xl 或数字 px。默认 2xl（26） */
  radius: { type: [String, Number] as PropType<string | number>, default: '2xl' },
  errorSrc: { type: String, default: '' },
  errorText: { type: String, default: '加载失败' },
  showErrorPlaceholder: { type: Boolean, default: true },
  showLoading: { type: Boolean, default: true },
  fade: { type: Boolean, default: true },
  preview: { type: Boolean, default: false },
  previewUrls: { type: Array as PropType<string[]>, default: () => [] as string[] },
})

const emit = defineEmits(['load', 'error', 'click'])

const instance = getCurrentInstance()
const slots = useSlots()

const loaded = ref(false)
const failed = ref(false)
const useErrorSrc = ref(false)
/**
 * 小程序默认 true：src 照常挂上，由 image 的 lazy-load 在滚进视口（含 scroll-view）时再拉取。
 * H5 在 created 里按 lazy 改成 false，等 IntersectionObserver 进视口再挂 src。
 */
const inView = ref(true)
const _lazyObserver = ref<IntersectionObserver | null>(null)

const resolvedShape = computed(() => {
  if (props.circle) return 'circle'
  const s = String(props.shape || 'rounded').trim().toLowerCase()
  if (s === 'square' || s === 'rect' || s === 'circle' || s === 'rounded') {
    return s === 'rect' ? 'square' : s
  }
  return 'rounded'
})

const isCircle = computed(() => {
  return resolvedShape.value === 'circle'
})

const isSquare = computed(() => {
  return resolvedShape.value === 'square'
})

const resolvedMode = computed((): ImageMode => {
  const raw = (props.mode || 'aspectFill').trim()
  const mapped = MODE_ALIAS[raw] || raw
  const modes: readonly string[] = VALID_MODES
  return modes.indexOf(mapped) >= 0 ? (mapped as ImageMode) : 'aspectFill'
})

const resolvedLazy = computed(() => {
  if (props.lazyLoad !== undefined && props.lazyLoad !== null) return !!props.lazyLoad
  return !!props.lazy
})

const sizePx = computed(() => {
  const s = props.size
  if (!hasExplicitSize(s)) return null
  if (typeof s === 'number' && Number.isFinite(s)) return Math.max(0, s)
  const key = String(s).trim().toLowerCase()
  if (Object.prototype.hasOwnProperty.call(SIZE_PRESET, key)) {
    const preset = SIZE_PRESET[key]
    if (preset != null) return preset
  }
  const n = Number(s)
  if (Number.isFinite(n)) return Math.max(0, n)
  return null
})

const radiusPx = computed(() => {
  if (isCircle.value || isSquare.value) return 0
  const r = props.radius
  if (typeof r === 'number' && Number.isFinite(r)) return Math.max(0, r)
  const key = String(r || '2xl').trim().toLowerCase()
  if (Object.prototype.hasOwnProperty.call(RADIUS_PRESET, key)) {
    const preset = RADIUS_PRESET[key]
    if (preset != null) return preset
  }
  const n = Number(r)
  if (Number.isFinite(n)) return Math.max(0, n)
  return RADIUS_PRESET['2xl']
})

const boxWidth = computed(() => {
  if (hasExplicitSize(props.width)) return toCssSize(props.width, '100%')
  if (sizePx.value !== null) return `${sizePx.value}px`
  return '100%'
})

const boxHeight = computed(() => {
  if (hasExplicitSize(props.height)) return toCssSize(props.height, 'auto')
  if (sizePx.value !== null) return `${sizePx.value}px`
  if (isCircle.value) return boxWidth.value
  if (resolvedMode.value === 'widthFix') return 'auto'
  return '100%'
})

const displaySrc = computed(() => {
  if (useErrorSrc.value && props.errorSrc) return props.errorSrc
  const s = (props.src || '').trim()
  return s
})

const showImage = computed(() => {
  if (!displaySrc.value) return false
  if (failed.value) return false
  /* H5 的 image 不理会 lazy-load，未进视口前不挂 src；小程序仍交给原生 lazy-load */
  if (resolvedLazy.value && !inView.value) return false
  return true
})

const showPlaceholderLayer = computed(() => {
  if (failed.value) {
    if (useErrorSrc.value && props.errorSrc) return false
    return props.showErrorPlaceholder || !!(slots && slots.error)
  }
  if (!loaded.value && props.showLoading) return true
  return false
})

const rootClass = computed(() => {
  return [
    `lingyun-image--${resolvedShape.value}`,
    props.fade ? 'lingyun-image--fade' : '',
    resolvedMode.value === 'widthFix' || resolvedMode.value === 'heightFix'
      ? 'lingyun-image--auto-size'
      : '',
  ]
})

const rootStyle = computed((): Record<string, string> => {
  const style: Record<string, string> = {
    width: boxWidth.value,
    height: boxHeight.value,
  }
  if (isCircle.value) {
    style.borderRadius = '50%'
  } else if (isSquare.value) {
    style.borderRadius = '0'
  } else {
    style.borderRadius = `${radiusPx.value}px`
  }
  return style
})

/** 圆角直接作用在 image 自身，不依赖父级 overflow 裁剪（小程序端更稳） */
const imgStyle = computed((): Record<string, string> => {
  const style: Record<string, string> = {}
  if (isCircle.value) {
    style.borderRadius = '50%'
  } else if (isSquare.value) {
    style.borderRadius = '0'
  } else {
    style.borderRadius = `${radiusPx.value}px`
  }
  return style
})

function unbindLazy(): void {
  // #ifdef H5
  const observer = _lazyObserver.value
  if (observer) {
    observer.disconnect()
    _lazyObserver.value = null
  }
  // #endif
}

function bindLazy(): void {
  // #ifndef H5
  inView.value = true
  // #endif
  // #ifdef H5
  unbindLazy()
  if (!resolvedLazy.value) {
    inView.value = true
    return
  }
  inView.value = false
  nextTick(() => {
    const el = instance?.proxy?.$el as Element | undefined
    if (!el || typeof IntersectionObserver === 'undefined') {
      inView.value = true
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        inView.value = true
        unbindLazy()
      },
      { root: null, rootMargin: '200px 0px', threshold: 0.01 },
    )
    observer.observe(el)
    _lazyObserver.value = observer
  })
  // #endif
}

function resetState(): void {
  loaded.value = false
  failed.value = false
  useErrorSrc.value = false
}

function onLoad(e: Event): void {
  loaded.value = true
  failed.value = false
  emit('load', e)
}

function onError(e: Event): void {
  if (!useErrorSrc.value && props.errorSrc) {
    useErrorSrc.value = true
    loaded.value = false
    failed.value = false
    return
  }
  failed.value = true
  loaded.value = false
  emit('error', e)
}

function onClick(e: Event): void {
  emit('click', e)
  if (!props.preview) return
  const current = displaySrc.value
  if (!current || failed.value) return
  const urls =
    Array.isArray(props.previewUrls) && props.previewUrls.length
      ? props.previewUrls.filter((url) => Boolean(url))
      : [current]
  try {
    uni.previewImage({ urls, current })
  } catch {
    /* ignore */
  }
}

watch(
  () => props.src,
  () => {
    resetState()
  },
)

watch(resolvedLazy, () => {
  bindLazy()
})

// #ifdef H5
if (resolvedLazy.value) inView.value = false
// #endif

onMounted(() => {
  bindLazy()
})

onBeforeUnmount(() => {
  unbindLazy()
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-image {
  position: relative;
  box-sizing: border-box;
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
  /* 起点终点都收在框外：left 百分比相对容器，小程序端行为稳定；
     transform 百分比在微信 keyframes 里起算基准不稳，且带动画的 transform 会逃逸 overflow 裁剪 */
  left: -45%;
  width: 45%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.55) 50%,
    rgba(255, 255, 255, 0) 100%
  );
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
    left: -45%;
  }
  100% {
    left: 100%;
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
