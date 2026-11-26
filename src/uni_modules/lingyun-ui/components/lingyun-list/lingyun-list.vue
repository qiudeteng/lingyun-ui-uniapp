<template>
  <view class="lingyun-list" :class="[rootClass, inSectionClass]">
    <!-- 插槽按实际使用拆开。小程序会把模板里出现过的 #title / #action 记成已传入 -->
    <lingyun-group-header
      v-if="showPlainHeader"
      :title="header"
      :type="resolvedHeaderType"
      :action="headerAction"
      @action="onAction"
    />
    <lingyun-group-header
      v-else-if="showHeader && headerSlot && !headerActionSlot"
      :type="resolvedHeaderType"
      :action="headerAction"
      @action="onAction"
    >
      <template #title>
        <slot name="header" />
      </template>
    </lingyun-group-header>
    <lingyun-group-header
      v-else-if="showHeader && !headerSlot && headerActionSlot"
      :title="header"
      :type="resolvedHeaderType"
      @action="onAction"
    >
      <template #action>
        <slot name="header-action" />
      </template>
    </lingyun-group-header>
    <lingyun-group-header
      v-else-if="showHeader"
      :type="resolvedHeaderType"
      @action="onAction"
    >
      <template #title>
        <slot name="header" />
      </template>
      <template #action>
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

<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, ref, useSlots } from 'vue'
import { inject } from 'vue'

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
 * @property {Boolean} plain 全宽平铺：去掉分组卡片底色与圆角，行直接铺在页面背景上
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

defineOptions({
  name: 'LingyunList',
})

/**
 * firstChildAppend 不放进 data：非响应式。
 * 行组件用 $parent 查找本实例并只写一次，对齐 uni-list（不用 provide/inject，避免长列表整表重绘）。
 */
const props = defineProps({
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
  /** Apple Plain 列表：全宽平铺，不要分组卡片（无底色 / 无圆角 / 无页边 inset） */
  plain: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['action'])

const slots = useSlots()

const inSection = ref(false)
/** section 自己有色或玻璃时，列表不再叠第二张卡片 */
const sectionPaintsCard = ref(false)

const instance = getCurrentInstance()
let embeddedSection: SectionHost | null = null

/*
 * vapor 下 $parent 链遇到普通 view 会中断，$options.name 也可能读不到，
 * 因此优先用 section provide 的标记；$parent 遍历仅作兜底。
 */
const injectedSectionMark = inject<{
  markEmbeddedList?: (active: boolean) => void
  getColor?: () => string
} | null>('lingyunSectionMark', null)
let injectedMarkEmbeddedList: ((active: boolean) => void) | null = null

if (instance && instance.proxy) {
  // firstChildAppend 非响应式：行组件通过 $parent 只写一次
  ;(instance.proxy as unknown as { firstChildAppend: boolean }).firstChildAppend = false
}

if (injectedSectionMark) {
  inSection.value = true
  const color = injectedSectionMark.getColor ? injectedSectionMark.getColor() : ''
  sectionPaintsCard.value = String(color || '').trim() !== ''
  const mark = injectedSectionMark.markEmbeddedList
  if (mark) {
    injectedMarkEmbeddedList = mark
    mark(true)
  }
} else if (instance && instance.proxy) {
  const section = findSectionHost(
    (instance.proxy.$parent as unknown as SectionHost | null) ?? null,
  )
  if (section) {
    inSection.value = true
    sectionPaintsCard.value = String(section.color || '').trim() !== ''
    embeddedSection = section
    section.markEmbeddedList?.(true)
  }
}

const headerSlot = computed((): boolean => {
  return !!slots.header
})

const headerActionSlot = computed((): boolean => {
  return !!slots['header-action']
})

const showHeader = computed((): boolean => {
  return !!(props.header || headerSlot.value)
})

const showPlainHeader = computed((): boolean => {
  return showHeader.value && !headerSlot.value && !headerActionSlot.value
})

const showFooter = computed((): boolean => {
  return !!(props.footer || slots.footer)
})

const resolvedHeaderType = computed((): string => {
  const map: Record<string, string> = {
    extraProminent: 'extra-prominent',
    'extra-prominent': 'extra-prominent',
    prominent: 'prominent',
    nested: 'nested',
  }
  return map[props.headerType] || 'nested'
})

const rootClass = computed((): string => {
  return [
    props.inset ? 'lingyun-list--inset' : '',
    props.plain ? 'lingyun-list--plain' : '',
    showHeader.value ? `lingyun-list--header-${resolvedHeaderType.value}` : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const inSectionClass = computed((): string => {
  return [inSection.value ? 'lingyun-list--in-section' : '', sectionPaintsCard.value ? 'lingyun-list--flat-card' : '']
    .filter(Boolean)
    .join(' ')
})

function onAction(): void {
  emit('action')
}

onBeforeUnmount(() => {
  injectedMarkEmbeddedList?.(false)
  embeddedSection?.markEmbeddedList?.(false)
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

  /* Plain：全宽平铺，行直接铺在页面背景上，不要卡片材质 */
  &--plain,
  &--plain#{&}--inset,
  &--plain#{&}--in-section {
    padding-left: 0;
    padding-right: 0;
  }

  &--plain &__card {
    background-color: transparent;
    border-radius: 0;
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
