<template>
  <lingyun-menu
    v-model:show="open"
    :actions="actions"
    :mask="true"
    mask-transparent
    :z-index="1200"
    :anchor="anchor"
    @select="onThemeSelect"
    @closed="onMenuClosed"
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

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type PropType } from 'vue'
import { useLingyunTheme, type LingyunThemePreference } from '../../utils/theme'

/**
 * lingyun-theme-action
 * @description 内置主题切换：放进工具栏 / Duo 工具组；点击弹出浅色 / 暗黑 / 自动菜单。
 * grouped 为 true 时不画玻璃底，由外层工具组提供。
 */
defineOptions({
  name: 'LingyunThemeAction',
})

defineProps({
  grouped: { type: Boolean, default: false },
  iconSize: { type: [Number, String], default: 20 },
  /** 菜单锚点；按钮组隐藏时由工具栏传入整组右上角，避免按单个按钮定位 */
  anchor: {
    type: Object as PropType<
      { top?: number; left?: number; width?: number; height?: number } | null
    >,
    default: null,
  },
})

const emit = defineEmits(['menu-open', 'menu-closed'])

const open = ref(false)

const theme = computed(() => useLingyunTheme())

const actions = computed(() => {
  const preference = theme.value.preference
  return [
    {
      key: 'light',
      label: '浅色',
      iconClass: 'lingyun-menu__symbol-icon--sun',
      selected: preference === 'light',
    },
    {
      key: 'dark',
      label: '暗黑',
      iconClass: 'lingyun-menu__symbol-icon--moon',
      selected: preference === 'dark',
    },
    {
      key: 'system',
      label: '自动',
      icon: 'loop',
      selected: preference === 'system',
    },
  ]
})

watch(open, (val: boolean) => {
  if (val) emit('menu-open')
})

function onThemeSelect(payload: { key?: string }): void {
  const key = payload?.key as LingyunThemePreference | undefined
  if (key === 'light' || key === 'dark' || key === 'system') {
    theme.value.setPreference(key)
  }
  open.value = false
}

function onMenuClosed(): void {
  emit('menu-closed')
}
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
