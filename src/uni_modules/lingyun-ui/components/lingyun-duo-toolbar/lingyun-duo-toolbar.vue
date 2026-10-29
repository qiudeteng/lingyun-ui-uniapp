<template>
  <view class="lingyun-duo-toolbar" :class="themeRootClass" :style="rootStyle">
    <view class="lingyun-duo-toolbar__bar" :style="barStyle">
      <view v-if="showLeading" class="lingyun-duo-toolbar__leading">
        <slot name="leading">
          <view
            v-if="showBack"
            class="lingyun-duo-toolbar__action"
            hover-class="lingyun-duo-toolbar__action--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            role="button"
            aria-label="Back"
            @click.stop="onBack"
          >
            <slot name="back">
              <lingyun-icon type="left" :size="22" color="label" />
            </slot>
          </view>
        </slot>
      </view>

      <view class="lingyun-duo-toolbar__title-wrap">
        <slot name="title">
          <text class="lingyun-duo-toolbar__title">{{ title }}</text>
        </slot>
      </view>

      <view
        v-if="showTools"
        class="lingyun-duo-toolbar__tools"
        :class="{
          'lingyun-duo-toolbar__tools--single': toolsSingle,
          'lingyun-duo-toolbar__tools--hidden': toolsHidden,
        }"
      >
        <slot name="tools" />
        <slot name="trailing" />
      </view>

      <view
        v-if="statusWidth > 0"
        class="lingyun-duo-toolbar__status"
        :style="{ width: `${statusWidth}px` }"
      >
        <slot name="status" />
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import {
  LINGYUN_DUO_TOP_BAR_HEIGHT,
  LINGYUN_DUO_TOP_RIGHT_RESERVED,
} from '../../utils/duoMetrics'

/**
 * lingyun-duo-toolbar
 * @description iPhone Duo 内屏竖屏的顶部工具栏：84 高，左 Leading、标题、右工具组。
 * 官方组件：Toolbar - Top - iPhone Duo（84 高，padding 24/24/12/20，gap 12）；
 * Leading 48×48，标题 17/22 左对齐，工具组 164×48（3×36，gap 18，左右 10），
 * 状态栏 98×48；rightInset 为状态栏 + 间距 + 右内边距的总宽（默认 134）。
 */
export default defineComponent({
  name: 'LingyunDuoToolbar',
  emits: ['back'],
  props: {
    title: { type: String, default: '' },
    showBack: { type: Boolean, default: false },
    /** 右上角状态/摄像头保留区总宽，官方为 134（状态 98 + 间距 12 + 右内边距 24） */
    rightInset: { type: Number, default: LINGYUN_DUO_TOP_RIGHT_RESERVED },
    /** 页面是否真的提供了工具插槽；小程序 slot 声明也会让 $slots 为真，需显式传 */
    toolsVisible: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    /** 页面是否提供了自定义 Leading；默认返回钮可见时也显示 */
    leadingVisible: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    /** 仅一个工具项时收成 48×48 圆钮 */
    toolsSingle: { type: Boolean, default: false },
    /** 主题菜单打开期间隐去工具组，避免玻璃胶囊从菜单边缘漏出 */
    toolsHidden: { type: Boolean, default: false },
    /** 0 全透明，1 满液态玻璃 */
    glassProgress: { type: Number, default: 0 },
  },
  computed: {
    showLeading(): boolean {
      if (this.leadingVisible !== undefined) {
        return !!this.leadingVisible || this.showBack
      }
      return !!(this.$slots.leading || this.showBack)
    },
    showTools(): boolean {
      return this.toolsVisible !== undefined
        ? !!this.toolsVisible
        : !!(this.$slots.tools || this.$slots.trailing)
    },
    /** 状态栏区域宽度：从 rightInset 里减掉右侧 24 内边距与 12 间距 */
    statusWidth(): number {
      return Math.max(0, (Number(this.rightInset) || 0) - 36)
    },
    themeRootClass() {
      try {
        return useLingyunTheme().rootClass
      } catch {
        return 'theme-light'
      }
    },
    rootStyle(): Record<string, string> {
      return {
        '--ly-duo-toolbar-height': `${LINGYUN_DUO_TOP_BAR_HEIGHT}px`,
      }
    },
    glassAmount(): number {
      const n = Number(this.glassProgress)
      if (Number.isNaN(n)) return 0
      return Math.min(1, Math.max(0, n))
    },
    barStyle(): Record<string, string> {
      const p = this.glassAmount
      const blur = (20 * p).toFixed(2)
      return {
        '--ly-duo-toolbar-glass': String(p),
        backdropFilter: p > 0.01 ? `saturate(180%) blur(${blur}px)` : 'none',
        webkitBackdropFilter:
          p > 0.01 ? `saturate(180%) blur(${blur}px)` : 'none',
      }
    },
  },
  methods: {
    onBack() {
      this.$emit('back')
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-duo-toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--ly-duo-toolbar-height, 84px);
  box-sizing: border-box;
}

.lingyun-duo-toolbar__bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  height: 100%;
  box-sizing: border-box;
  padding: 24px 24px 12px 20px;
  background-color: rgba(255, 255, 255, calc(0.42 * var(--ly-duo-toolbar-glass, 0)));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, calc(0.4 * var(--ly-duo-toolbar-glass, 0))),
    0 1px 0 rgba(60, 60, 67, calc(0.04 * var(--ly-duo-toolbar-glass, 0)));
}

.lingyun-duo-toolbar.theme-dark .lingyun-duo-toolbar__bar {
  background-color: rgba(255, 255, 255, calc(0.14 * var(--ly-duo-toolbar-glass, 0)));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, calc(0.18 * var(--ly-duo-toolbar-glass, 0))),
    0 1px 0 rgba(255, 255, 255, calc(0.06 * var(--ly-duo-toolbar-glass, 0)));
}

.lingyun-duo-toolbar__leading,
.lingyun-duo-toolbar__tools {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
}

.lingyun-duo-toolbar__leading {
  width: 48px;
  flex-basis: 48px;
}

/* 官方 Button Group：164×48 = 3×36 + 2×18 + 2×10；1~3 个 36×36 工具项 */
.lingyun-duo-toolbar__tools {
  height: 48px;
  box-sizing: border-box;
  gap: 18px;
  padding: 0 10px;
  @include lingyun-glass-control;
  border-radius: 9999px;
  transition: opacity 0.12s ease;
}

.lingyun-duo-toolbar__tools--hidden {
  opacity: 0;
  pointer-events: none;
}

.lingyun-duo-toolbar__tools--single {
  padding: 0 6px;
}

.lingyun-duo-toolbar__action {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  @include lingyun-glass-control;
}

.lingyun-duo-toolbar__action--hover {
  transform: scale(0.96);
}

/* 系统状态栏区域：只留位，内容由系统绘制；页面可用 status 插槽自绘 */
.lingyun-duo-toolbar__status {
  height: 48px;
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  box-sizing: border-box;
}

.lingyun-duo-toolbar__title-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.lingyun-duo-toolbar__title {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 17px;
  line-height: 22px;
  font-weight: 600;
  letter-spacing: -0.43px;
  color: var(--lingyun-label, #{$lingyun-label});
}
</style>
