<template>
  <view class="lingyun-list" :class="[rootClass, inSectionClass]">
    <lingyun-group-header
      v-if="showHeader"
      :title="header"
      :type="resolvedHeaderType"
      :action="headerAction"
      @action="onAction"
    >
      <template v-if="$slots.header" #title>
        <slot name="header" />
      </template>
      <template v-if="$slots['header-action']" #action>
        <slot name="header-action" />
      </template>
    </lingyun-group-header>

    <view class="lingyun-list__card">
      <slot />
    </view>

    <view v-if="showFooter" class="lingyun-list__footer">
      <slot name="footer">
        <text class="lingyun-list__footer-text">{{ footer }}</text>
      </slot>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * lingyun-list
 * @description 对齐 Apple iOS 27 UI Kit Lists · Grouped（Sketch）+ HIG。内容层标准材质，禁止每行独立玻璃。
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/085FCFF1-16ED-4956-8035-009960D451C1#Inspect
 * @see https://developer.apple.com/design/human-interface-guidelines/lists
 * @see design/LISTS.md
 *
 * @property {String} header 分组标题
 * @property {String} headerType = [extraProminent|prominent|nested]
 * @property {String} headerAction 标题行右侧操作
 * @property {String} footer 分组页脚
 * @property {Boolean} inset 左右 16pt inset（默认 true）
 * @event {Function} action 点击 headerAction
 */
type SectionHost = {
  $options?: { name?: string }
  $parent?: SectionHost | null
  color?: string
  markEmbeddedList?: (active: boolean) => void
}

/** 插槽内容的父级是包住它的组件。内嵌进 section 时收掉页边 inset，卡片贴齐分组卡片。 */
function findSectionHost(start: SectionHost | null): SectionHost | null {
  let parent = start
  while (parent) {
    if (parent.$options && parent.$options.name === 'LingyunSection') return parent
    parent = parent.$parent || null
  }
  return null
}

export default defineComponent({
  name: 'LingyunList',
  emits: ['action'],
  /**
   * firstChildAppend 不放进 data：非响应式。
   * 行组件用 $parent 查找本实例并只写一次，对齐 uni-list（不用 provide/inject，避免长列表整表重绘）。
   */
  props: {
    header: {
      type: String,
      default: '',
    },
    headerType: {
      type: String,
      default: 'nested',
    },
    headerAction: {
      type: String,
      default: '',
    },
    footer: {
      type: String,
      default: '',
    },
    inset: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      inSection: false,
      /** section 自己有色或玻璃时，列表不再叠第二张卡片 */
      sectionPaintsCard: false,
    }
  },
  created() {
    ;(this as unknown as { firstChildAppend: boolean }).firstChildAppend = false
    const section = findSectionHost(this.$parent as SectionHost | null)
    if (!section) return
    this.inSection = true
    this.sectionPaintsCard = String(section.color || '').trim() !== ''
    ;(this as unknown as { embeddedSection?: SectionHost }).embeddedSection = section
    section.markEmbeddedList?.(true)
  },
  beforeUnmount() {
    const section = (this as unknown as { embeddedSection?: SectionHost }).embeddedSection
    section?.markEmbeddedList?.(false)
  },
  computed: {
    showHeader(): boolean {
      return !!(this.header || this.$slots.header)
    },
    showFooter(): boolean {
      return !!(this.footer || this.$slots.footer)
    },
    resolvedHeaderType(): string {
      const map: Record<string, string> = {
        extraProminent: 'extra-prominent',
        'extra-prominent': 'extra-prominent',
        prominent: 'prominent',
        nested: 'nested',
      }
      return map[this.headerType] || 'nested'
    },
    rootClass(): string {
      return [
        this.inset ? 'lingyun-list--inset' : '',
        this.showHeader ? `lingyun-list--header-${this.resolvedHeaderType}` : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    inSectionClass(): string {
      return [this.inSection ? 'lingyun-list--in-section' : '', this.sectionPaintsCard ? 'lingyun-list--flat-card' : '']
        .filter(Boolean)
        .join(' ')
    },
  },
  methods: {
    onAction() {
      this.$emit('action')
    },
  },
})
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

/* Sketch Grouped：页 inset 16pt；卡片圆角 26pt（Regular 行高 52pt 的半圆胶囊） */
$ly-list-inset: 16px;
$ly-list-radius: 26px;
$ly-list-gap: 8px;

.lingyun-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;

  &--inset {
    padding: 0 $ly-list-inset;
  }

  /* 放进 section：页边 16 交给分组卡片的外边距，行内边距仍是列表自己的 */
  &--in-section#{&}--inset {
    padding-left: 0;
    padding-right: 0;
  }

  &--flat-card &__card {
    background-color: transparent;
    border-radius: 0;
  }

  &__card {
    overflow: hidden;
    background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
    border-radius: $ly-list-radius;
  }

  &__footer {
    box-sizing: border-box;
    min-height: 32px;
    padding: 6px 16px 8px;
  }

  &__footer-text {
    font-size: 13px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: -0.08px;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }

  & + .lingyun-list {
    margin-top: $ly-list-gap;
  }
}
</style>
