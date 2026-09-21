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

<script>
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
 * @property {String} cover / thumbnail
 * @property {String} margin / spacing
 * @property {String} padding / bodyPadding 内容区内边距（bodyPadding 优先）
 * @property {String} headerPadding 标题区内边距（独立于 body）
 * @property {Boolean} isFull 通栏：仅去左右外边距与圆角、左右边线；标题/间距样式不变
 * @property {Boolean} isLast / isShadow / border / glass
 * @event click 点击分区，payload 为 section|cover|title|extra|content|actions
 */
export default {
  name: 'LingyunSection',
  emits: ['click'],
  props: {
    title: {
      type: String,
      default: '',
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
  },
  computed: {
    resolvedSubtitle() {
      return this.subtitle || this.subTitle || ''
    },
    showHeader() {
      return !!(
        this.title ||
        this.resolvedSubtitle ||
        this.hint ||
        this.extra ||
        this.thumbnail ||
        this.$slots.hint ||
        this.$slots.extra
      )
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
        'lingyun-section--glass': this.glass,
        'lingyun-section--plain': !this.glass,
      }
    },
    rootStyle() {
      if (this.isFull) {
        /* 左右贴边；保留上间距，避免与上一块粘连 */
        return { margin: '12px 0 0' }
      }
      return { margin: this.margin }
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
    onClick(type) {
      this.$emit('click', type)
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

/* 尺寸：1pt = 1px */
$ly-section-radius: 14px;

.lingyun-section {
  box-sizing: border-box;
  border-radius: $ly-section-radius;
  /* 勿 overflow:hidden：会裁掉同层原生 textarea（Text Fields 多行空白） */
  overflow: visible;
  background-color: var(--lingyun-bg-secondary, #{$lingyun-bg-secondary});
}

.lingyun-section--glass {
  @include lingyun-glass-surface;
  border-radius: $ly-section-radius;
}

.lingyun-section--plain {
  background-color: var(--lingyun-bg-secondary, #{$lingyun-bg-secondary});
}

.lingyun-section--border:not(.lingyun-section--glass) {
  border: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-section--shadow:not(.lingyun-section--glass) {
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

.lingyun-section__title {
  display: block;
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
