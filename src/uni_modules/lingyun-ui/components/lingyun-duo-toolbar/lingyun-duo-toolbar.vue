<template>
  <view class="lingyun-duo-toolbar" :class="themeRootClass" :style="rootStyle">
    <view class="lingyun-duo-toolbar__bar">
      <view class="lingyun-duo-toolbar__leading">
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
            <lingyun-icon type="left" :size="28" color="label" />
          </slot>
        </view>
        <slot name="leading" />
      </view>

      <view class="lingyun-duo-toolbar__title-wrap">
        <slot name="title">
          <text class="lingyun-duo-toolbar__title">{{ title }}</text>
        </slot>
      </view>

      <view class="lingyun-duo-toolbar__trailing">
        <slot name="trailing" />
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import {
  LINGYUN_DUO_TOP_BAR_HEIGHT,
  LINGYUN_DUO_TOP_RIGHT_RESERVED,
} from '../../utils/duoMetrics'

/**
 * lingyun-duo-toolbar
 * @description iPhone Duo 内屏竖屏的顶部工具栏：84 高，左标题、右工具组，右上角避开状态/摄像头。
 * 官方组件：Toolbar - Top - iPhone Duo（84 高，padding 24/24/12/20）。
 */
export default defineComponent({
  name: 'LingyunDuoToolbar',
  emits: ['back'],
  props: {
    title: { type: String, default: '' },
    showBack: { type: Boolean, default: false },
    /** 右上角状态/摄像头保留区，官方为 134 */
    rightInset: { type: Number, default: LINGYUN_DUO_TOP_RIGHT_RESERVED },
  },
  computed: {
    themeRootClass() {
      try {
        return useLingyunTheme().rootClass
      } catch {
        return 'theme-light'
      }
    },
    rootStyle(): Record<string, string> {
      return {
        '--ly-duo-toolbar-right': `${Math.max(0, Number(this.rightInset) || 0)}px`,
        '--ly-duo-toolbar-height': `${LINGYUN_DUO_TOP_BAR_HEIGHT}px`,
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
  padding: 24px var(--ly-duo-toolbar-right, 134px) 12px 20px;
  background-color: var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
}

.lingyun-duo-toolbar__leading,
.lingyun-duo-toolbar__trailing {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
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
