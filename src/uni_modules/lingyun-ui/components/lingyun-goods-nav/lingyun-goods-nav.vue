<template>
  <view class="lingyun-goods-nav" :class="rootClass" :style="barStyle">
    <view v-if="options.length" class="lingyun-goods-nav__options">
      <view
        v-for="(item, index) in options"
        :key="item.key"
        class="lingyun-goods-nav__option"
        hover-class="lingyun-goods-nav__option--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        @click="onOption(index, item)"
      >
        <view class="lingyun-goods-nav__icon-wrap">
          <lingyun-icon :type="item.icon" :size="22" color="var(--lingyun-label-glass, #1a1a1a)" />
          <view v-if="hasBadge(item)" class="lingyun-goods-nav__badge">
            <lingyun-badge :text="badgeText(item)" :dot="badgeDot(item)" />
          </view>
        </view>
        <text v-if="item.text" class="lingyun-goods-nav__label">{{ item.text }}</text>
      </view>
    </view>
    <view
      v-if="buttons.length"
      class="lingyun-goods-nav__actions"
      :class="{ 'lingyun-goods-nav__actions--fill': fill || !options.length }"
    >
      <view
        v-for="(item, index) in buttons"
        :key="item.key"
        class="lingyun-goods-nav__btn"
        :class="buttonClass(index)"
        hover-class="lingyun-goods-nav__btn--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        @click="onButton(index, item)"
      >
        <text class="lingyun-goods-nav__btn-text">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * lingyun-goods-nav
 * @description 商品底栏。结构对齐 uni-goods-nav：左侧图标入口 + 右侧胶囊按钮组。
 * 视觉走 Liquid Glass：左侧图标栏用控件玻璃，按钮用系统蓝，禁止红橙渐变实心条。
 * @see design/GOODS_NAV.md
 *
 * @property {Array} options [{ icon, text, info, badge }]
 * @property {Array} buttonGroup [{ text }] 末项为 Bordered Prominent，其余为 Bordered
 * @property {Boolean} fill 按钮组占满剩余宽度（默认 true）
 * @property {Boolean} fixed 贴底悬浮（默认 true）
 * @property {Boolean} safeArea 预留底部安全区（默认 true）
 * @event click 左侧入口 { index, content }
 * @event buttonClick 右侧按钮 { index, content }
 */
export default {
  name: 'LingyunGoodsNav',
  emits: ['click', 'buttonClick'],
  props: {
    options: {
      type: Array,
      default: () => [
        { icon: 'shop', text: '店铺' },
        { icon: 'cart', text: '购物车' },
      ],
    },
    buttonGroup: {
      type: Array,
      default: () => [{ text: '加入购物车' }, { text: '立即购买' }],
    },
    fill: {
      type: Boolean,
      default: true,
    },
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
    }
  },
  computed: {
    rootClass() {
      return [
        this.fixed ? 'lingyun-goods-nav--fixed' : '',
        this.safeArea ? 'lingyun-goods-nav--safe' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    barStyle() {
      if (!this.safeArea) return {}
      return { paddingBottom: `${this.safeBottom}px` }
    },
    buttons() {
      return (this.buttonGroup || [])
        .filter((item) => item && item.text)
        .map((item, index) => ({
          key: item.key != null ? String(item.key) : `btn-${index}`,
          text: String(item.text),
          raw: item,
        }))
    },
  },
  mounted() {
    this.syncSafe()
  },
  methods: {
    syncSafe() {
      try {
        const info =
          typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
        const inset = info && info.safeAreaInsets
        this.safeBottom = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
      } catch (e) {
        this.safeBottom = 0
      }
    },
    badgeRaw(item) {
      if (!item) return ''
      if (item.badge != null && item.badge !== false && item.badge !== '') return item.badge
      if (item.info != null && item.info !== false && item.info !== '' && item.info !== 0) return item.info
      return ''
    },
    hasBadge(item) {
      const raw = this.badgeRaw(item)
      return raw === true || raw === 'dot' || raw === 0 || !!raw
    },
    badgeDot(item) {
      const raw = this.badgeRaw(item)
      return raw === true || raw === 'dot'
    },
    badgeText(item) {
      if (this.badgeDot(item)) return ''
      const raw = this.badgeRaw(item)
      return raw == null ? '' : raw
    },
    buttonClass(index) {
      const last = index === this.buttons.length - 1
      return last ? 'lingyun-goods-nav__btn--prominent' : 'lingyun-goods-nav__btn--bordered'
    },
    onOption(index, item) {
      this.$emit('click', { index, content: item })
    },
    onButton(index, item) {
      this.$emit('buttonClick', { index, content: item.raw })
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-goods-nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-height: 62px;
  padding: 8px 16px 8px 8px;
  gap: 8px;
  pointer-events: auto;

  &--fixed {
    position: fixed;
    left: var(--lingyun-page-nav-width, 0px);
    right: 0;
    bottom: 0;
    z-index: 900;
    width: auto;
  }

  &__options {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    flex: 0 0 auto;
    height: 54px;
    padding: 0 4px;
    box-sizing: border-box;
    @include lingyun-glass-control;
  }

  &__option {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 56px;
    padding: 0 6px;
    box-sizing: border-box;
  }

  &__option--hover {
    opacity: 0.7;
  }

  &__icon-wrap {
    position: relative;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__badge {
    position: absolute;
    top: -8px;
    right: -12px;
    z-index: 1;
    pointer-events: none;
  }

  &__label {
    margin-top: 2px;
    font-size: 10px;
    font-weight: 600;
    line-height: 12px;
    color: var(--lingyun-label-glass, #{$lingyun-label-glass});
  }

  &__actions {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    flex: 0 1 auto;
    height: 46px;
    min-width: 0;
    overflow: hidden;
    border-radius: $lingyun-glass-radius-pill;
  }

  &__actions--fill {
    flex: 1;
  }

  &__btn {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-width: 88px;
    padding: 0 16px;
    box-sizing: border-box;
  }

  &__btn--bordered {
    color: var(--lingyun-primary, #{$lingyun-primary});
    background-color: var(--lingyun-primary-soft, #{rgba($lingyun-primary, 0.14)});
  }

  &__btn--prominent {
    color: #ffffff;
    background-color: var(--lingyun-primary, #{$lingyun-primary});
  }

  &__btn--hover {
    opacity: 0.72;
  }

  &__btn-text {
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
    color: inherit;
  }
}
</style>
