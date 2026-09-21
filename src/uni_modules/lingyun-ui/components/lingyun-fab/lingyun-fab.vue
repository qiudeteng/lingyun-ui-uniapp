<template>
  <view class="lingyun-fab" :class="rootClass" :style="anchorStyle">
    <view v-if="menuVisible" class="lingyun-fab__menu" :class="menuClass">
      <view
        v-for="(item, index) in items"
        :key="item.key"
        class="lingyun-fab__item"
        :class="{ 'lingyun-fab__item--disabled': item.disabled }"
        hover-class="lingyun-fab__item--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        @click.stop="onItem(index, item)"
      >
        <image
          v-if="item.iconPath"
          class="lingyun-fab__image"
          :src="item.active && item.selectedIconPath ? item.selectedIconPath : item.iconPath"
          mode="aspectFit"
        />
        <lingyun-icon
          v-else-if="item.icon"
          :type="item.icon"
          :size="20"
          :color="item.active ? 'var(--lingyun-link, #0088ff)' : 'var(--lingyun-label, #000)'"
        />
        <text
          v-if="item.text"
          class="lingyun-fab__label"
          :class="{ 'lingyun-fab__label--active': item.active }"
        >{{ item.text }}</text>
      </view>
    </view>

    <view
      class="lingyun-fab__btn"
      hover-class="lingyun-fab__btn--hover"
      :hover-start-time="20"
      :hover-stay-time="70"
      role="button"
      aria-label="Floating action"
      @click.stop="onFab"
    >
      <view class="lingyun-fab__glyph" :class="{ 'lingyun-fab__glyph--open': menuVisible }">
        <slot name="icon">
          <lingyun-icon :type="icon" :size="22" color="#ffffff" />
        </slot>
      </view>
    </view>
  </view>
</template>

<script>
import { useThemeStore } from '@/stores/theme'

/**
 * lingyun-fab
 * @description 悬浮按钮。位置与展开方式对齐 uni-fab，主钮与菜单走 Liquid Glass。
 * @property {String} horizontal left | right
 * @property {String} vertical bottom | top
 * @property {String} direction vertical | horizontal 菜单相对主钮的方向
 * @property {Array} content { icon, text, iconPath, selectedIconPath, active, disabled }
 * @property {Boolean} popMenu 有菜单时点击主钮是否展开
 * @property {Boolean} show 受控展开
 * @property {String} icon 主钮图标，默认 plusempty
 * @property {Boolean} safeArea 底部加上安全区
 * @event fabClick 点击主钮
 * @event trigger 点击菜单项 { index, item }
 */
const BTN = 56
const GAP = 16

export default {
  name: 'LingyunFab',
  emits: ['fabClick', 'trigger', 'update:show'],
  props: {
    horizontal: { type: String, default: 'right' },
    vertical: { type: String, default: 'bottom' },
    direction: { type: String, default: 'vertical' },
    content: { type: Array, default: () => [] },
    popMenu: { type: Boolean, default: true },
    show: { type: Boolean, default: false },
    icon: { type: String, default: 'plusempty' },
    safeArea: { type: Boolean, default: true },
    gap: { type: [Number, String], default: GAP },
    zIndex: { type: [Number, String], default: 200 },
    closeOnSelect: { type: Boolean, default: true },
  },
  data() {
    return {
      opened: false,
      safeBottom: 0,
    }
  },
  computed: {
    items() {
      const list = Array.isArray(this.content) ? this.content : []
      return list.map((item, index) => ({
        key: item && item.key != null ? String(item.key) : `fab-${index}`,
        icon: (item && item.icon) || '',
        text: (item && (item.text || item.name)) || '',
        iconPath: (item && item.iconPath) || '',
        selectedIconPath: (item && item.selectedIconPath) || '',
        active: !!(item && item.active),
        disabled: !!(item && item.disabled),
        raw: item,
      }))
    },
    menuVisible() {
      return this.opened && this.popMenu && this.items.length > 0
    },
    themeClass() {
      try {
        return useThemeStore().rootClass || 'theme-light'
      } catch (e) {
        return 'theme-light'
      }
    },
    rootClass() {
      return [
        this.themeClass,
        this.horizontal === 'left' ? 'lingyun-fab--left' : 'lingyun-fab--right',
        this.vertical === 'top' ? 'lingyun-fab--top' : 'lingyun-fab--bottom',
      ]
    },
    menuClass() {
      const horizontalMenu = this.direction === 'horizontal'
      return {
        'lingyun-fab__menu--above': !horizontalMenu && this.vertical !== 'top',
        'lingyun-fab__menu--below': !horizontalMenu && this.vertical === 'top',
        'lingyun-fab__menu--before': horizontalMenu && this.horizontal !== 'left',
        'lingyun-fab__menu--after': horizontalMenu && this.horizontal === 'left',
      }
    },
    anchorStyle() {
      const gap = Math.max(0, Number(this.gap) || GAP)
      const bottomExtra = this.vertical !== 'top' && this.safeArea ? this.safeBottom : 0
      const style = {
        zIndex: Number(this.zIndex) || 200,
        width: `${BTN}px`,
        height: `${BTN}px`,
      }
      if (this.horizontal === 'left') style.left = `${gap}px`
      else style.right = `${gap}px`
      if (this.vertical === 'top') style.top = `${gap}px`
      else style.bottom = `${gap + bottomExtra}px`
      return style
    },
  },
  watch: {
    show: {
      immediate: true,
      handler(val) {
        this.opened = !!val
      },
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
    onFab() {
      this.$emit('fabClick')
      if (!this.popMenu || !this.items.length) return
      this.opened = !this.opened
      this.$emit('update:show', this.opened)
    },
    onItem(index, item) {
      if (!this.opened || item.disabled) return
      this.$emit('trigger', { index, item: item.raw })
      if (this.closeOnSelect) {
        this.opened = false
        this.$emit('update:show', false)
      }
    },
    open() {
      this.opened = true
      this.$emit('update:show', true)
    },
    close() {
      this.opened = false
      this.$emit('update:show', false)
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-fab {
  position: fixed;
  z-index: 200;
  box-sizing: border-box;
}

.lingyun-fab__btn {
  width: 56px;
  height: 56px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-link, #{$lingyun-system-blue});
  box-shadow: 0 8px 20px rgba(0, 136, 255, 0.28);
}

.lingyun-fab__btn--hover {
  transform: scale(0.96);
}

.lingyun-fab__glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.lingyun-fab__glyph--open {
  transform: rotate(45deg);
}

.lingyun-fab__menu {
  position: absolute;
  z-index: 1;
  box-sizing: border-box;
  min-width: 148px;
  padding: 6px;
  overflow: hidden;
  @include lingyun-glass-surface;
  border-radius: 22px;
  box-shadow: var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    0 18px 46px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-fab.theme-dark .lingyun-fab__menu {
  border: #{$lingyun-glass-hairline-dark};
  box-shadow: #{$lingyun-glass-highlight-dark}, 0 18px 48px rgba(0, 0, 0, 0.45);
  background-color: #{$lingyun-glass-overlay-bg-dark};
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-fab__menu--above {
  right: 0;
  bottom: 64px;
}

.lingyun-fab--left .lingyun-fab__menu--above {
  right: auto;
  left: 0;
}

.lingyun-fab__menu--below {
  right: 0;
  top: 64px;
}

.lingyun-fab--left .lingyun-fab__menu--below {
  right: auto;
  left: 0;
}

.lingyun-fab__menu--before {
  right: 64px;
  bottom: 0;
}

.lingyun-fab__menu--after {
  left: 64px;
  bottom: 0;
}

.lingyun-fab--top .lingyun-fab__menu--before,
.lingyun-fab--top .lingyun-fab__menu--after {
  bottom: auto;
  top: 0;
}

.lingyun-fab__item {
  height: 44px;
  padding: 0 12px;
  border-radius: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
}

.lingyun-fab__item--hover {
  background-color: var(--lingyun-fill-tertiary, rgba(118, 118, 128, 0.12));
}

.lingyun-fab__item--disabled {
  opacity: 0.35;
}

.lingyun-fab__image {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.lingyun-fab__label {
  margin-left: 10px;
  font-size: 17px;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
  white-space: nowrap;
}

.lingyun-fab__label:first-child {
  margin-left: 0;
}

.lingyun-fab__label--active {
  color: var(--lingyun-link, #{$lingyun-system-blue});
}
</style>
