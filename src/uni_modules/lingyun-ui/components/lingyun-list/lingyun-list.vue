<template>
  <view class="lingyun-list" :class="rootClass">
    <view v-if="showHeader" class="lingyun-list__header" :class="headerClass">
      <slot name="header">
        <text v-if="header" class="lingyun-list__header-title">{{ header }}</text>
      </slot>
      <view
        v-if="showHeaderAction"
        class="lingyun-list__action"
        hover-class="lingyun-list__action--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        @click="onAction"
      >
        <slot name="header-action">
          <text class="lingyun-list__action-text">{{ headerAction }}</text>
        </slot>
      </view>
    </view>

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

<script>
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
export default {
  name: 'LingyunList',
  emits: ['action'],
  /**
   * 供 list-item 登记「是否首行」，避免小程序上 :last-child / ::after 分割线失效
   *（对齐 uni-list firstChildAppend）
   */
  provide() {
    return {
      lingyunList: this,
    }
  },
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
  created() {
    this.firstChildAppend = false
  },
  computed: {
    showHeader() {
      return !!(this.header || this.$slots.header)
    },
    showHeaderAction() {
      return !!(this.headerAction || this.$slots['header-action'])
    },
    showFooter() {
      return !!(this.footer || this.$slots.footer)
    },
    resolvedHeaderType() {
      const map = {
        extraProminent: 'extra-prominent',
        'extra-prominent': 'extra-prominent',
        prominent: 'prominent',
        nested: 'nested',
      }
      return map[this.headerType] || 'nested'
    },
    rootClass() {
      return [
        this.inset ? 'lingyun-list--inset' : '',
        this.showHeader ? `lingyun-list--header-${this.resolvedHeaderType}` : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    headerClass() {
      return `lingyun-list__header--${this.resolvedHeaderType}`
    },
  },
  methods: {
    onAction() {
      this.$emit('action')
    },
  },
}
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

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    box-sizing: border-box;
    padding: 10px 16px;
  }

  &__header--extra-prominent {
    height: 48px;
  }

  &__header--prominent {
    height: 45px;
  }

  &__header--nested {
    height: 42px;
  }

  &__header-title {
    flex: 1;
    min-width: 0;
    color: var(--lingyun-label, #{$lingyun-label});
  }

  &__header--extra-prominent &__header-title {
    font-size: 20px;
    font-weight: 600;
    line-height: 26px;
    letter-spacing: -0.45px;
  }

  &__header--prominent &__header-title {
    font-size: 17px;
    font-weight: 600;
    line-height: 24px;
    letter-spacing: -0.43px;
  }

  &__header--nested &__header-title {
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: -0.08px;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }

  &__action {
    flex-shrink: 0;
    padding: 2px 0;
  }

  &__action-text {
    font-size: 17px;
    font-weight: 400;
    line-height: 22px;
    color: var(--lingyun-primary, #{$lingyun-primary});
  }

  &__action--hover {
    opacity: 0.55;
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

@media (prefers-reduced-motion: reduce) {
  .lingyun-list__action {
    transition: none;
  }
}
</style>
