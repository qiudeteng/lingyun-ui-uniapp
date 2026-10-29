<template>
  <lingyun-menu
    v-model:show="open"
    :actions="actions"
    :mask="true"
    mask-transparent
    :z-index="1200"
    @select="onThemeSelect"
  >
    <template #trigger="{ toggle }">
      <view
        class="lingyun-theme-action"
        :class="grouped ? 'lingyun-theme-action--grouped' : 'lingyun-theme-action--standalone'"
        hover-class="lingyun-theme-action--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        aria-label="Appearance"
        @click="toggle"
      >
        <lingyun-icon type="color" :size="iconSize" color="label" />
      </view>
    </template>
  </lingyun-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useLingyunTheme, type LingyunThemePreference } from '../../utils/theme'

/**
 * lingyun-theme-action
 * @description 内置主题切换：放进工具栏 / Duo 工具组；点击弹出浅色 / 暗黑 / 自动菜单。
 * grouped 为 true 时不画玻璃底，由外层工具组提供。
 */
export default defineComponent({
  name: 'LingyunThemeAction',
  props: {
    grouped: { type: Boolean, default: false },
    iconSize: { type: [Number, String], default: 20 },
  },
  data() {
    return {
      open: false,
    }
  },
  computed: {
    theme() {
      return useLingyunTheme()
    },
    actions() {
      const preference = this.theme.preference
      return [
        {
          key: 'light',
          label: '浅色',
          icon: 'circle-filled',
          selected: preference === 'light',
        },
        {
          key: 'dark',
          label: '暗黑',
          icon: 'circle',
          selected: preference === 'dark',
        },
        {
          key: 'system',
          label: '自动',
          icon: 'loop',
          selected: preference === 'system',
        },
      ]
    },
  },
  methods: {
    onThemeSelect(payload: { key?: string }): void {
      const key = payload?.key as LingyunThemePreference | undefined
      if (key === 'light' || key === 'dark' || key === 'system') {
        this.theme.setPreference(key)
      }
      this.open = false
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-theme-action {
  width: 36px;
  height: 36px;
  box-sizing: border-box;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.16s ease;
}

.lingyun-theme-action--standalone {
  @include lingyun-glass-control;
}

.lingyun-theme-action--grouped {
  background-color: transparent;
}

.lingyun-theme-action--hover {
  transform: scale(0.92);
}
</style>
