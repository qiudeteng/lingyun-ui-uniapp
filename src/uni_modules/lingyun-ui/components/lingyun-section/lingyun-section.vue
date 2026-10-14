<template>
  <view
    class="lingyun-section"
    :class="[rootClass, { 'lingyun-section--with-list': withList() }]"
    :style="rootStyle"
    @click="onClick('section')"
  >
    <slot name="cover">
      <view v-if="cover" class="lingyun-section__cover" @click.stop="onClick('cover')">
        <image class="lingyun-section__cover-image" mode="widthFix" :src="cover" />
      </view>
    </slot>

    <view class="lingyun-section__inner" :style="innerStyle()">
      <slot name="title">
        <view
          v-if="showHeader"
          class="lingyun-section__header"
          :style="headerStyle()"
          @click.stop="onClick('title')"
        >
          <view v-if="thumbnail" class="lingyun-section__thumb">
            <image class="lingyun-section__thumb-image" :src="thumbnail" mode="aspectFit" />
          </view>
          <view
            v-if="icon"
            class="lingyun-section__icon"
            :class="iconClass"
            :style="iconBoxStyle"
          >
            <lingyun-image
              :src="icon"
              :size="iconPx"
              shape="rounded"
              radius="sm"
              mode="aspectFill"
              :lazy="false"
              :show-error-placeholder="false"
            />
          </view>
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

      <view v-if="showHeaderLine" class="lingyun-section__rule" :style="ruleStyle()" />

      <view class="lingyun-section__body" :style="bodyStyle()" @click.stop="onClick('content')">
        <slot />
      </view>

      <view
        v-if="$slots.actions"
        class="lingyun-section__actions"
        :style="actionsStyle()"
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

type BoxEdges = { top: string; right: string; bottom: string; left: string }

function parseBox(value: string): BoxEdges {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  const top = parts[0] || '0'
  const right = parts[1] || top
  const bottom = parts[2] || top
  const left = parts[3] || right
  return { top, right, bottom, left }
}

function vnodeName(type: unknown): string {
  if (typeof type === 'string') return type
  if (type && typeof type === 'object') {
    const record = type as { name?: string; __name?: string }
    return record.name || record.__name || ''
  }
  return ''
}

/** 默认插槽里是否放了 lingyun-list / lingyun-table（含包在 view 里的情况） */
function vnodesHaveList(nodes: unknown): boolean {
  if (!nodes) return false
  const list = Array.isArray(nodes) ? nodes : [nodes]
  for (const node of list) {
    if (!node || typeof node !== 'object') continue
    const vnode = node as { type?: unknown; children?: unknown }
    const name = vnodeName(vnode.type).toLowerCase().replace(/-/g, '')
    if (name === 'lingyunlist' || name === 'lingyuntable') return true
    if (Array.isArray(vnode.children) && vnodesHaveList(vnode.children)) return true
  }
  return false
}

function toPx(value: string): number | null {
  const matched = /^(\d+(?:\.\d+)?)px$/.exec(value.trim())
  if (!matched) return null
  return Number(matched[1])
}

/** 左右 margin 从 100% 里扣掉，避免白底比页面宽 */
function insetWidth(margin: string): string {
  const box = parseBox(margin)
  const left = toPx(box.left)
  const right = toPx(box.right)
  if (left == null || right == null) return ''
  const sum = left + right
  return sum > 0 ? `calc(100% - ${sum}px)` : '100%'
}

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
const SECTION_COLOR_GLASS = 'glass'

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
 * @property {String} color 卡片表面：空为不透明分组底；glass 为玻璃；green / blue / orange / yellow / red 为系统色实底
 * @property {String|Number} radius 卡片圆角，同 lingyun-image：none / sm / md / lg / xl / 2xl 或像素。空为 2xl（26）
 * @property {Boolean} headerLine 标题和内容之间是否显示横线，默认否
 * @property {String} cover / thumbnail
 * @property {String} margin / spacing
 * @property {String} padding / bodyPadding 内容区内边距（bodyPadding 优先）。内嵌列表或表格时 body 自动为 0，外壳 spacing 也让出
 * @property {String} headerPadding 标题区内边距（独立于 body）
 * @property {Boolean} isFull 通栏：仅去左右外边距与圆角、左右边线；标题/间距样式不变
 * @property {Boolean} isLast / isShadow / border
 * @event click 点击分区，payload 为 section|cover|title|extra|content|actions
 */
export default defineComponent({
  name: 'LingyunSection',
  emits: ['click'],
  data() {
    return {
      /** 小程序插槽不是函数，列表 / 表格挂上后回写，用来去掉 body 与外壳 spacing */
      embeddedListCount: 0,
    }
  },
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
      default: false,
    },
    border: {
      type: Boolean,
      default: false,
    },
    /**
     * 卡片表面。空为不透明分组底，与 list 卡片同一档。
     * glass 走玻璃。green、blue、orange、yellow、red 为系统色实底，标题改白字。
     */
    color: {
      type: String,
      default: '',
      validator: (value: string) =>
        value === '' ||
        value === SECTION_COLOR_GLASS ||
        (SECTION_COLORS as readonly string[]).indexOf(value) >= 0,
    },
    /**
     * 卡片圆角。与 lingyun-image 的 radius 相同：none / sm / md / lg / xl / 2xl，或像素。
     * 空则 2xl（26）。通栏仍是直角。
     */
    radius: { type: [String, Number], default: '' },
    /** 为真时，在标题和内容之间画一条横线。没有标题时不画 */
    headerLine: { type: Boolean, default: false },
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
    showHeaderLine(): boolean {
      if (!this.headerLine) return false
      return this.showHeader || !!(this.$slots && this.$slots.title)
    },
    iconPx(): number {
      if (this.iconSize === 'small') return ICON_SMALL
      if (this.iconSize === 'large') return ICON_LARGE
      return ICON_DEFAULT
    },
    /**
     * 只有主标题时，图标相对这一行垂直居中。
     * 有副标题时，只有大图标相对主标题和副标题一起居中；小图标和默认图标仍只跟主标题。
     */
    iconClass(): Record<string, boolean> {
      const large = this.iconSize === 'large'
      return {
        'lingyun-section__icon--small': this.iconSize === 'small',
        'lingyun-section__icon--large': large,
        'lingyun-section__icon--pair': large && !!this.resolvedSubtitle,
      }
    },
    /** 图标盒写在真实 view 上。尺寸若只写在 lingyun-image 内部，微信宿主宽度会变成 0。 */
    iconBoxStyle(): Record<string, string> {
      const px = `${this.iconPx}px`
      return { width: px, height: px }
    },
    resolvedColor(): string {
      const value = String(this.color || '').trim()
      return (SECTION_COLORS as readonly string[]).indexOf(value) >= 0 ? value : ''
    },
    isGlass(): boolean {
      return String(this.color || '').trim() === SECTION_COLOR_GLASS
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
        'lingyun-section--glass': this.isGlass,
        'lingyun-section--solid': !!this.resolvedColor,
        'lingyun-section--header-line': this.showHeaderLine,
        [`lingyun-section--color-${this.resolvedColor}`]: !!this.resolvedColor,
      }
    },
    rootStyle() {
      const borderRadius = resolveSectionRadius(this.radius, this.isFull)
      const margin = this.isFull ? '12px 0 0' : this.margin
      const style: Record<string, string> = { margin, borderRadius }
      /* 微信里块级宽度不含 margin，白底会比页面宽出左右外边距 */
      const width = insetWidth(margin)
      if (width) style.width = width
      return style
    },
  },
  methods: {
    /**
     * 小程序里 $slots.default 是 true，不能当函数调用，否则整段渲染中断，白底宽度也会错。
     * H5 仍在渲染时看 vnode；小程序由列表/表格挂载后回写 embeddedListCount。
     */
    markEmbeddedList(active: boolean) {
      const next = this.embeddedListCount + (active ? 1 : -1)
      this.embeddedListCount = next > 0 ? next : 0
    },
    withList(): boolean {
      if (this.embeddedListCount > 0) return true
      const slot = this.$slots.default as unknown
      if (typeof slot !== 'function') return false
      try {
        return vnodesHaveList((slot as () => unknown)())
      } catch {
        return false
      }
    },
    innerStyle() {
      if (this.withList()) return {}
      return { padding: this.spacing }
    },
    headerStyle() {
      if (this.headerPadding) return { padding: this.headerPadding }
      if (!this.withList()) return undefined
      const box = parseBox(this.spacing)
      return { padding: `${box.top} ${box.right} 0 ${box.left}` }
    },
    ruleStyle() {
      if (!this.withList()) return undefined
      const box = parseBox(this.spacing)
      return { marginLeft: box.left, marginRight: box.right }
    },
    bodyStyle() {
      if (this.withList() && this.bodyPadding === '' && this.padding === '0') {
        return { padding: '0' }
      }
      return { padding: this.resolvedBodyPadding }
    },
    actionsStyle() {
      if (!this.withList()) return undefined
      const box = parseBox(this.spacing)
      return { padding: `0 ${box.right} ${box.bottom} ${box.left}` }
    },
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

/* 微信宿主默认 inline。撑成整行后，里面的 margin 才按页面宽度回缩 */
:host {
  display: block;
  width: 100%;
  box-sizing: border-box;
}

.lingyun-section {
  box-sizing: border-box;
  border-radius: $ly-section-radius;
  /* 勿 overflow:hidden：会裁掉同层原生 textarea（Text Fields 多行空白） */
  overflow: visible;
  /* 与 lingyun-list 卡片同一档：分组次级底，浅色为不透明白 */
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  /* 宫格嵌在卡片里时去掉自己的圆角，圆角由这张卡片负责 */
  --lingyun-grid-radius: 0;
}

.lingyun-section--glass {
  @include lingyun-glass-surface;
  border-radius: $ly-section-radius;
}

/* 内嵌列表或表格：header 留在外面，下面整块交给列表 / 表格卡片 */
.lingyun-section--with-list:not(.lingyun-section--glass):not(.lingyun-section--solid) {
  background-color: transparent;
  border: 0;
  box-shadow: none;
}

.lingyun-section--with-list .lingyun-list.lingyun-list--inset {
  padding-left: 0;
  padding-right: 0;
}

.lingyun-section--with-list.lingyun-section--glass,
.lingyun-section--with-list.lingyun-section--solid {
  overflow: hidden;
}

.lingyun-section--with-list.lingyun-section--glass .lingyun-list__card,
.lingyun-section--with-list.lingyun-section--solid .lingyun-list__card,
.lingyun-section--with-list.lingyun-section--glass .lingyun-table,
.lingyun-section--with-list.lingyun-section--solid .lingyun-table {
  background-color: transparent;
  border-radius: 0;
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

.lingyun-section--header-line .lingyun-section__header {
  margin-bottom: 0;
}

.lingyun-section__rule {
  height: 0;
  margin: 12px 0;
  border-top: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-section--solid .lingyun-section__rule {
  border-top-color: rgba(255, 255, 255, 0.35);
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
  /* 24px 相对主标题行高 20px 垂直居中 */
  margin-top: -2px;
  margin-right: 6px;
}

.lingyun-section__icon--small {
  /* 16px 相对主标题行高 20px */
  margin-top: 2px;
}

.lingyun-section__icon--large {
  /* 32px 相对主标题行高 20px */
  margin-top: -6px;
}

/* 大图标有副标题：相对主标题 20 + 间距 2 + 副标题 18 */
.lingyun-section__icon--large.lingyun-section__icon--pair {
  margin-top: 4px;
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
