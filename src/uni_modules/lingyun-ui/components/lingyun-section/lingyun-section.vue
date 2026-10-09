<template>
  <view
    class="lingyun-section"
    :class="rootClass"
    :style="rootStyle"
    @click="onClick('section')"
  >
    <slot name="cover">
      <view v-if="cover" class="lingyun-section__cover" @click.stop="onClick('cover')">
        <image class="lingyun-section__cover-image" mode="widthFix" :src="cover" />
      </view>
    </slot>

    <view class="lingyun-section__inner" :style="innerStyle">
      <slot name="title">
        <view
          v-if="showHeader"
          class="lingyun-section__header"
          :style="headerStyle"
          @click.stop="onClick('title')"
        >
          <view v-if="thumbnail" class="lingyun-section__thumb">
            <image class="lingyun-section__thumb-image" :src="thumbnail" mode="aspectFit" />
          </view>
          <lingyun-image
            v-if="icon"
            class="lingyun-section__icon"
            :class="{ 'lingyun-section__icon--small': iconSize === 'small' }"
            :src="icon"
            :size="iconPx"
            shape="rounded"
            radius="sm"
            mode="aspectFill"
            :lazy="false"
            :show-error-placeholder="false"
          />
          <view class="lingyun-section__heading">
            <text v-if="title" class="lingyun-section__title">{{ title }}</text>
            <text v-if="resolvedSubtitle" class="lingyun-section__subtitle">{{
              resolvedSubtitle
            }}</text>
            <text v-if="hint" class="lingyun-section__hint">{{ hint }}</text>
            <slot name="hint" />
          </view>
          <view
            v-if="extra || $slots.extra"
            class="lingyun-section__extra"
            @click.stop="onClick('extra')"
          >
            <slot name="extra">
              <text class="lingyun-section__extra-text">{{ extra }}</text>
            </slot>
          </view>
        </view>
      </slot>

      <view class="lingyun-section__body" :style="bodyStyle" @click.stop="onClick('content')">
        <slot />
      </view>

      <view
        v-if="$slots.actions"
        class="lingyun-section__actions"
        @click.stop="onClick('actions')"
      >
        <slot name="actions" />
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/** 标题左侧图标不接受自定义像素。默认 24，small 16，large 32。 */
const ICON_SMALL = 16
const ICON_DEFAULT = 24
const ICON_LARGE = 32

/** 卡片圆角档，与 lingyun-image 的 radius 相同。不传保持原来的 14。 */
const RADIUS_PRESET: Record<string, number> = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 26,
}
const RADIUS_DEFAULT = 26

function resolveSectionRadius(value: unknown, full: boolean): string {
  if (full) return '0'
  if (value === '' || value == null) return `${RADIUS_DEFAULT}px`
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return `${value}px`
  const text = String(value).trim().toLowerCase()
  if (Object.prototype.hasOwnProperty.call(RADIUS_PRESET, text)) return `${RADIUS_PRESET[text]}px`
  const matched = /^(\d+(?:\.\d+)?)(px)?$/.exec(text)
  if (matched) return `${Number(matched[1])}px`
  return `${RADIUS_DEFAULT}px`
}
const SECTION_COLORS = ['green', 'blue', 'orange', 'yellow', 'red'] as const

/**
 * lingyun-section
 * @description Demo / 业务分组卡片：对齐 Buttons Demo 的玻璃区块，API 参考 uni-card
 * @see src/uni_modules/uni-card/components/uni-card/uni-card.vue
 * @see design/UI_SPEC.md
 *
 * 插槽内布局工具类（见 styles/setting/_section-layout.scss，App 全局注入）：
 * - lingyun-section-row：横向换行 gap 8；相邻行间距 8
 * - lingyun-section-stack：纵向 gap 8
 * - lingyun-section-matrix / lingyun-section-matrix__label：矩阵分组
 *
 * @property {String} title / subtitle（或 subTitle）/ hint / extra
 * @property {String} icon 标题左侧图片地址
 * @property {String} iconSize 图标大小：空为 24，small 为 16，large 为 32
 * @property {String} color 卡片背景：green / blue / orange / yellow / red，走系统色
 * @property {String|Number} radius 卡片圆角，同 lingyun-image：none / sm / md / lg / xl / 2xl 或像素。空为 2xl（26）
 * @property {String} cover / thumbnail
 * @property {String} margin / spacing
 * @property {String} padding / bodyPadding 内容区内边距（bodyPadding 优先）
 * @property {String} headerPadding 标题区内边距（独立于 body）
 * @property {Boolean} isFull 通栏：仅去左右外边距与圆角、左右边线；标题/间距样式不变
 * @property {Boolean} isLast / isShadow / border / glass
 * @event click 点击分区，payload 为 section|cover|title|extra|content|actions
 */
export default defineComponent({
  name: 'LingyunSection',
  emits: ['click'],
  props: {
    title: {
      type: String,
      default: '',
    },
    /** 标题左侧的图片地址 */
    icon: {
      type: String,
      default: '',
    },
    /**
     * 图标大小。空为默认 24。small 为 16，large 为 32。
     * 不接受像素。
     */
    iconSize: {
      type: String,
      default: '',
      validator: (value: string) => value === '' || value === 'small' || value === 'large',
    },
    subtitle: {
      type: String,
      default: '',
    },
    /** 兼容 uni-card 的 subTitle */
    subTitle: {
      type: String,
      default: '',
    },
    /** 标题下说明（如 Demo 提示） */
    hint: {
      type: String,
      default: '',
    },
    extra: {
      type: String,
      default: '',
    },
    cover: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    /** 内容区（body）内边距；与 bodyPadding 二选一，后者优先 */
    padding: {
      type: String,
      default: '0',
    },
    /** body 内边距（优先于 padding） */
    bodyPadding: {
      type: String,
      default: '',
    },
    /** 标题区（header）内边距；空则只吃外壳 spacing */
    headerPadding: {
      type: String,
      default: '',
    },
    /** 卡片外边距；默认与 Buttons Demo 一致 */
    margin: {
      type: String,
      default: '12px 12px 0',
    },
    /** 卡片内边距（外壳），默认对齐 Buttons Demo */
    spacing: {
      type: String,
      default: '14px 12px 16px',
    },
    /** 通栏：全宽、去圆角与左右边线；不改 title / spacing */
    isFull: {
      type: Boolean,
      default: false,
    },
    /** 末块：加大底外边距 */
    isLast: {
      type: Boolean,
      default: false,
    },
    isShadow: {
      type: Boolean,
      default: true,
    },
    border: {
      type: Boolean,
      default: true,
    },
    /** Liquid Glass 材质（弱端自动降级） */
    glass: {
      type: Boolean,
      default: true,
    },
    /**
     * 卡片背景色。只接受 green、blue、orange、yellow、red。
     * 设了颜色后用对应系统色实底，不再走玻璃。空则保持原来的玻璃底。
     */
    color: {
      type: String,
      default: '',
      validator: (value: string) =>
        value === '' || (SECTION_COLORS as readonly string[]).indexOf(value) >= 0,
    },
    /**
     * 卡片圆角。与 lingyun-image 的 radius 相同：none / sm / md / lg / xl / 2xl，或像素。
     * 空则 2xl（26）。通栏仍是直角。
     */
    radius: { type: [String, Number], default: '' },
  },
  computed: {
    resolvedSubtitle() {
      return this.subtitle || this.subTitle || ''
    },
    showHeader() {
      return !!(
        this.title ||
        this.icon ||
        this.resolvedSubtitle ||
        this.hint ||
        this.extra ||
        this.thumbnail ||
        this.$slots.hint ||
        this.$slots.extra
      )
    },
    iconPx(): number {
      if (this.iconSize === 'small') return ICON_SMALL
      if (this.iconSize === 'large') return ICON_LARGE
      return ICON_DEFAULT
    },
    resolvedColor(): string {
      const value = String(this.color || '').trim()
      return (SECTION_COLORS as readonly string[]).indexOf(value) >= 0 ? value : ''
    },
    resolvedBodyPadding() {
      return this.bodyPadding !== '' ? this.bodyPadding : this.padding
    },
    rootClass() {
      return {
        'lingyun-section--full': this.isFull,
        'lingyun-section--last': this.isLast,
        'lingyun-section--shadow': this.isShadow,
        'lingyun-section--border': this.border,
        'lingyun-section--glass': this.glass && !this.resolvedColor,
        'lingyun-section--plain': !this.glass && !this.resolvedColor,
        'lingyun-section--solid': !!this.resolvedColor,
        [`lingyun-section--color-${this.resolvedColor}`]: !!this.resolvedColor,
      }
    },
    rootStyle() {
      const borderRadius = resolveSectionRadius(this.radius, this.isFull)
      if (this.isFull) {
        /* 左右贴边；保留上间距，避免与上一块粘连 */
        return { margin: '12px 0 0', borderRadius }
      }
      return { margin: this.margin, borderRadius }
    },
    innerStyle() {
      return { padding: this.spacing }
    },
    headerStyle() {
      if (!this.headerPadding) return undefined
      return { padding: this.headerPadding }
    },
    bodyStyle() {
      return { padding: this.resolvedBodyPadding }
    },
  },
  methods: {
    onClick(type: string) {
      this.$emit('click', type)
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

/* 尺寸：1pt = 1px */
$ly-section-radius: 26px;

.lingyun-section {
  box-sizing: border-box;
  border-radius: $ly-section-radius;
  /* 勿 overflow:hidden：会裁掉同层原生 textarea（Text Fields 多行空白） */
  overflow: visible;
  background-color: var(--lingyun-bg-secondary, #{$lingyun-bg-secondary});
  /* 宫格嵌在卡片里时去掉自己的圆角，圆角由这张卡片负责 */
  --lingyun-grid-radius: 0;
}

.lingyun-section--glass {
  @include lingyun-glass-surface;
  border-radius: $ly-section-radius;
}

.lingyun-section--plain {
  background-color: var(--lingyun-bg-secondary, #{$lingyun-bg-secondary});
}

.lingyun-section--solid {
  background-image: none;
  border: 0;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.lingyun-section--color-green,
.lingyun-section--color-blue,
.lingyun-section--color-orange,
.lingyun-section--color-yellow,
.lingyun-section--color-red {
  .lingyun-section__title,
  .lingyun-section__subtitle,
  .lingyun-section__hint,
  .lingyun-section__extra-text {
    color: #ffffff;
  }
}

.lingyun-section--color-green {
  background-color: var(--lingyun-system-green, #{$lingyun-system-green});
}

.lingyun-section--color-blue {
  background-color: var(--lingyun-system-blue, #{$lingyun-system-blue});
}

.lingyun-section--color-orange {
  background-color: var(--lingyun-system-orange, #{$lingyun-system-orange});
}

.lingyun-section--color-yellow {
  background-color: var(--lingyun-system-yellow, #{$lingyun-system-yellow});
}

.lingyun-section--color-red {
  background-color: var(--lingyun-system-red, #{$lingyun-system-red});
}

.lingyun-section--border:not(.lingyun-section--glass):not(.lingyun-section--solid) {
  border: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-section--shadow:not(.lingyun-section--glass):not(.lingyun-section--solid) {
  box-shadow: var(--lingyun-glass-shadow, #{$lingyun-glass-shadow});
}

/* 通栏：全宽 + 去圆角；左右无边线（上下可留 hairline） */
.lingyun-section--full {
  border-radius: 0;
  border-left: none;
  border-right: none;
}

.lingyun-section--full.lingyun-section--glass {
  border-radius: 0;
  border-left: none;
  border-right: none;
}

.lingyun-section--last {
  margin-bottom: 40px !important;
}

.lingyun-section__cover {
  overflow: hidden;
}

.lingyun-section__cover-image {
  display: block;
  width: 100%;
}

.lingyun-section__inner {
  box-sizing: border-box;
}

.lingyun-section__header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.lingyun-section__thumb {
  width: 36px;
  height: 36px;
  margin-right: 10px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 8px;
}

.lingyun-section__thumb-image {
  width: 100%;
  height: 100%;
}

.lingyun-section__heading {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.lingyun-section__icon {
  flex-shrink: 0;
  margin-top: 0;
  margin-right: 6px;
}

.lingyun-section__icon--small {
  margin-top: 2px;
}

.lingyun-section__title {
  display: block;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-section__subtitle {
  display: block;
  margin-top: 2px;
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-section__hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-section__extra {
  flex-shrink: 0;
  margin-left: 8px;
  max-width: 40%;
}

.lingyun-section__extra-text {
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: var(--lingyun-link, #{$lingyun-link});
  text-align: right;
}

.lingyun-section__body {
  box-sizing: border-box;
  width: 100%;
}

.lingyun-section__actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

/*
 * 插槽布局工具类（lingyun-section-row / stack / matrix）在
 * styles/setting/_section-layout.scss，经 App.vue 全局注入。
 * 勿写在本组件：小程序 styleIsolation 下插槽节点吃不到组件 wxss。
 */
</style>
