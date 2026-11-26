<template>
  <view
    class="lingyun-duo-rail"
    :class="[themeRootClass, `lingyun-duo-rail--${pose}`]"
  >
    <view class="lingyun-duo-rail__top">
      <view v-if="pose === 'outer-portrait'" class="lingyun-duo-rail__camera" />
      <view v-if="pose !== 'outer-landscape'" class="lingyun-duo-rail__status" />

      <view
        v-if="showBack"
        class="lingyun-duo-rail__back"
        hover-class="lingyun-duo-rail__action--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        aria-label="Back"
        @click="onBack"
      >
        <lingyun-icon type="left" :size="22" color="label" />
      </view>

      <view
        v-if="compactTools && toolsAllowed"
        class="lingyun-duo-rail__overflow"
        hover-class="lingyun-duo-rail__action--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        aria-label="More"
        @click="onOverflow"
      >
        <lingyun-icon type="more" :size="26" color="label" />
      </view>
      <view
        v-else-if="toolsAllowed"
        class="lingyun-duo-rail__tools"
        :class="{
          'lingyun-duo-rail__tools--single': toolsSingle,
          'lingyun-duo-rail__tools--hidden': toolsHidden,
        }"
      >
        <slot name="tools" />
      </view>
    </view>

    <view class="lingyun-duo-rail__spacer" />

    <view class="lingyun-duo-rail__bottom">
      <view v-if="tabItems.length" class="lingyun-duo-rail__tabs" :id="tabsId">
        <view
          v-for="item in tabItems"
          :id="itemId(item)"
          :key="item.key"
          class="lingyun-duo-rail__tab"
          :class="{ 'lingyun-duo-rail__tab--active': isActive(item) }"
          hover-class="lingyun-duo-rail__tab--hover"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="onSelect(item)"
        >
          <lingyun-icon
            v-if="item.icon"
            :type="item.icon"
            :size="26"
            :color="isActive(item) ? 'var(--lingyun-system-blue, #0088ff)' : 'var(--lingyun-label, #1a1a1a)'"
          />
          <text v-else class="lingyun-duo-rail__glyph">●</text>
          <view v-if="hasBadge(item)" class="lingyun-duo-rail__badge">
            <lingyun-badge
              :text="badgeText(item)"
              :color="badgeColor(item)"
              :dot="badgeDot(item)"
              :max="badgeMax(item)"
            />
          </view>
        </view>

        <view
          v-if="selectionVisible"
          class="lingyun-duo-rail__selection"
          :class="{ 'lingyun-duo-rail__selection--ready': selectionReady }"
          :style="selectionStyle"
        />
      </view>

      <view
        v-if="showSearch"
        class="lingyun-duo-rail__search"
        hover-class="lingyun-duo-rail__action--hover"
        :hover-start-time="20"
        :hover-stay-time="70"
        role="button"
        aria-label="Search"
        @click="onSearch"
      >
        <lingyun-icon type="search" :size="24" color="label" />
      </view>

      <view v-if="pose === 'outer-landscape'" class="lingyun-duo-rail__camera lingyun-duo-rail__camera--bottom" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import type { PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import {
  LINGYUN_DUO_SIDE_SELECTED_HEIGHT,
  LINGYUN_DUO_SIDE_SELECTED_WIDTH,
} from '../../utils/duoMetrics'

type RailBadge =
  | number
  | string
  | boolean
  | { text?: string | number; color?: string; dot?: boolean; max?: number | string }

type RailItem = {
  key?: string | number
  text?: string
  icon?: string
  badge?: RailBadge | null
  role?: string
}

const TAB_LIMIT = 4

/**
 * lingyun-duo-rail
 * @description iPhone Duo 右侧全高栏（外屏竖/横、内屏横屏）。
 * 官方尺寸：栏宽 84，padding 24/24/24/12，gap 8；工具组 48×164，Tab 组 48×210，搜索 48。
 * 独立页在摄像头 / 状态栏下方显示返回，并隐藏 Tab / 搜索；Tab 根页显示 Tab / 搜索、不显示返回。
 */
defineOptions({
  name: 'LingyunDuoRail',
})

const props = defineProps({
  items: {
    type: Array as PropType<Array<RailItem | null | undefined>>,
    default: () => [],
  },
  modelValue: {
    type: [String, Number] as PropType<string | number | undefined>,
    default: undefined,
  },
  /** outer-portrait / outer-landscape / inner-landscape */
  pose: { type: String, default: 'outer-portrait' },
  /** 外屏横屏：工具收起为「…」 */
  compactTools: { type: Boolean, default: false },
  /** 页面是否真的提供了 duo-tools；小程序 slot 声明也会让 $slots 为真，必须显式传 */
  toolsVisible: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  /** 仅一个工具项时收成 48×48 圆钮 */
  toolsSingle: { type: Boolean, default: false },
  /** 主题菜单打开期间隐去工具组，避免玻璃胶囊从菜单边缘漏出 */
  toolsHidden: { type: Boolean, default: false },
  /** 独立页（非一级 Tab 根页）在摄像头 / 状态栏下方显示返回 */
  showBack: { type: Boolean, default: false },
  /** 一级 Tab 根页显示搜索；普通子页只有返回 */
  showSearch: { type: Boolean, default: false },
})

const emit = defineEmits(['change', 'update:modelValue', 'search', 'overflow', 'back'])

const instance = getCurrentInstance()
const slots = useSlots()

const instanceId = ref(`lyduorail-${Math.random().toString(36).slice(2, 8)}`)
const selectionTop = ref(0)
const selectionVisible = ref(false)
const selectionReady = ref(false)
const _mounted = ref(false)

const themeRootClass = computed(() => {
  try {
    return useLingyunTheme().rootClass
  } catch {
    return 'theme-light'
  }
})

const tabsId = computed((): string => {
  return `${instanceId.value}-tabs`
})

const toolsAllowed = computed((): boolean => {
  return props.toolsVisible !== undefined
    ? !!props.toolsVisible
    : !!slots.tools
})

const tabItems = computed((): RailItem[] => {
  return (props.items || [])
    .filter((item): item is RailItem => !!item && item.role !== 'search')
    .slice(0, TAB_LIMIT)
})

const searchItem = computed((): RailItem | null => {
  return (
    (props.items || []).find(
      (item): item is RailItem => !!item && item.role === 'search',
    ) || null
  )
})

const selectionStyle = computed((): Record<string, string> => {
  return {
    top: `${selectionTop.value}px`,
    width: `${LINGYUN_DUO_SIDE_SELECTED_WIDTH}px`,
    height: `${LINGYUN_DUO_SIDE_SELECTED_HEIGHT}px`,
  }
})

function itemId(item: RailItem | null | undefined): string {
  return `${instanceId.value}-tab-${String(item && item.key)}`
}

function isActive(item: RailItem): boolean {
  return props.modelValue != null && String(props.modelValue) === String(item.key)
}

function hasBadge(item: RailItem): boolean {
  const badge = item.badge
  return badge !== undefined && badge !== null && badge !== false && badge !== ''
}

function badgeText(item: RailItem): string | number {
  const badge = item.badge
  if (badge && typeof badge === 'object') return badge.text != null ? badge.text : ''
  return typeof badge === 'boolean' ? '' : (badge ?? '')
}

function badgeColor(item: RailItem): string | undefined {
  const badge = item.badge
  return badge && typeof badge === 'object' ? badge.color : undefined
}

function badgeDot(item: RailItem): boolean {
  const badge = item.badge
  return badge === true || (!!badge && typeof badge === 'object' && !!badge.dot)
}

function badgeMax(item: RailItem): number | string | undefined {
  const badge = item.badge
  return badge && typeof badge === 'object' ? badge.max : undefined
}

function syncSelection(animate: boolean): void {
  if (!_mounted.value) return
  const active = tabItems.value.find((item) => isActive(item))
  if (!active) {
    selectionVisible.value = false
    selectionReady.value = false
    return
  }
  nextTick(() => {
    uni
      .createSelectorQuery()
      .in(instance?.proxy as never)
      .select(`#${tabsId.value}`)
      .boundingClientRect()
      .select(`#${itemId(active)}`)
      .boundingClientRect()
      .exec((res) => {
        const group = res && res[0]
        const item = res && res[1]
        if (!group || !item || !item.height) {
          setTimeout(() => syncSelection(animate), 50)
          return
        }
        const top =
          item.top -
          group.top -
          (LINGYUN_DUO_SIDE_SELECTED_HEIGHT - item.height) / 2
        selectionTop.value = top
        if (!selectionVisible.value) {
          selectionVisible.value = true
          selectionReady.value = false
          nextTick(() => {
            setTimeout(() => {
              selectionReady.value = true
            }, 20)
          })
          return
        }
        if (!animate) {
          selectionReady.value = false
          nextTick(() => {
            setTimeout(() => {
              selectionReady.value = true
            }, 20)
          })
        }
      })
  })
}

function onSelect(item: RailItem): void {
  emit('change', item)
  emit('update:modelValue', item.key)
}

function onSearch(): void {
  if (searchItem.value) {
    onSelect(searchItem.value)
    return
  }
  emit('search')
}

function onOverflow(): void {
  emit('overflow')
}

function onBack(): void {
  emit('back')
}

watch(
  () => props.modelValue,
  () => {
    syncSelection(true)
  },
)

watch(tabItems, () => {
  syncSelection(false)
})

onMounted(() => {
  _mounted.value = true
  nextTick(() => {
    setTimeout(() => syncSelection(false), 30)
  })
})

onBeforeUnmount(() => {
  _mounted.value = false
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-duo-rail {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  width: 84px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 24px 24px 12px;
  pointer-events: none;
}

.lingyun-duo-rail__top,
.lingyun-duo-rail__bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  pointer-events: auto;
}

.lingyun-duo-rail__top {
  gap: 12px;
}

.lingyun-duo-rail__status {
  width: 48px;
  height: 83px;
}

.lingyun-duo-rail__camera {
  width: 48px;
  height: 42px;
  flex-shrink: 0;
}

.lingyun-duo-rail__camera--bottom {
  margin-top: 8px;
}

.lingyun-duo-rail__overflow {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  @include lingyun-glass-control;
  pointer-events: auto;
}

.lingyun-duo-rail__back {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  @include lingyun-glass-control;
  pointer-events: auto;
}

.lingyun-duo-rail__tools {
  width: 48px;
  height: auto;
  box-sizing: border-box;
  border-radius: 9999px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 10px 0;
  @include lingyun-glass-control;
  border-radius: 9999px;
  transition: opacity 0.12s ease;
}

.lingyun-duo-rail__tools--hidden {
  opacity: 0;
  pointer-events: none;
}

.lingyun-duo-rail__tools--single {
  height: 48px;
  padding: 6px 0;
  gap: 0;
}

.lingyun-duo-rail__action--hover,
.lingyun-duo-rail__tab--hover {
  transform: scale(0.96);
}

.lingyun-duo-rail__spacer {
  flex: 1;
  min-height: 0;
}

.lingyun-duo-rail__bottom {
  gap: 12px;
}

.lingyun-duo-rail__tabs {
  position: relative;
  width: 48px;
  height: 210px;
  box-sizing: border-box;
  border-radius: 9999px;
  padding: 6px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  @include lingyun-glass-control;
  border: 0;
  border-radius: 9999px;
}


.lingyun-duo-rail__tab {
  position: relative;
  z-index: 1;
  width: 48px;
  height: 48px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  transition: color 0.2s ease, transform 0.16s ease;
}

.lingyun-duo-rail__glyph {
  font-size: 26px;
  line-height: 28px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-duo-rail__badge {
  position: absolute;
  top: 2px;
  right: 2px;
  pointer-events: none;
}

.lingyun-duo-rail__selection {
  position: absolute;
  left: 2px;
  z-index: 0;
  border-radius: 9999px;
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
  pointer-events: none;
}

.lingyun-duo-rail__selection--ready {
  transition: top 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.lingyun-duo-rail__search {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  @include lingyun-glass-control;
  pointer-events: auto;
}
</style>
