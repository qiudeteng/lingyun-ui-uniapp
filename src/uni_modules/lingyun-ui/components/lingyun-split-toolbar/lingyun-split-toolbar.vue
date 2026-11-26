<template>
  <view class="lingyun-split-toolbar">
    <lingyun-toolbars
      :fixed="false"
      :show-back="showBack"
      :show-trailing="false"
      :show-window-controls="false"
      :show-theme-switch="false"
      title-style="title2LineLeft"
      :title="title"
      :subtitle-picker="subtitlePicker"
      :searchable="searchable"
      :search-placeholder="searchPlaceholder"
      :searching="searching"
      :search-value="searchValue"
      :segments="segments"
      :segment-value="segmentValue"
      segment-control="segmented"
      :trailing-buttons="trailingButtons"
      :trailing-menu-enabled="trailingMenuEnabled"
      :avoid-capsule="avoidCapsule"
      :glass-progress="glassProgress"
      :top-inset="topInset"
      @back="onToolbarBack"
      @update:searching="onToolbarSearching"
      @update:searchValue="onToolbarSearchValue"
      @update:segmentValue="onToolbarSegmentValue"
      @search-open="onToolbarSearchOpen"
      @search-cancel="onToolbarSearchCancel"
      @search-input="onToolbarSearchInput"
      @search="onToolbarSearch"
      @segment-click="onToolbarSegmentClick"
      @segment-change="onToolbarSegmentChange"
      @trailing-action="onToolbarTrailingAction"
      @picker-value="onPickerValue"
    >
      <template #trailing-menu="{ button, index, groupIndex, close }">
        <slot
          name="trailing-menu"
          :button="button"
          :index="index"
          :group-index="groupIndex"
          :close="close"
        />
      </template>
    </lingyun-toolbars>
  </view>
</template>


<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { PropType } from 'vue'
import { isLingyunWeixinPc } from '../lingyun-toolbars/getLingyunNavSafeInset'
import type {
  LingyunSplitToolbarButtonGroups,
  LingyunSplitToolbarSegment,
} from './types'

defineOptions({
  name: 'LingyunSplitToolbar',
})

const props = defineProps({
  title: { type: String, default: '' },
  subtitlePicker: { type: Boolean, default: false },
  showBack: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: '' },
  searching: { type: Boolean, default: false },
  searchValue: { type: String, default: '' },
  segments: {
    type: Array as PropType<LingyunSplitToolbarSegment[]>,
    default: () => [],
  },
  segmentValue: { type: [String, Number] as PropType<string | number>, default: '' },
  trailingButtons: {
    type: Array as PropType<LingyunSplitToolbarButtonGroups>,
    default: () => [],
  },
  trailingMenuEnabled: { type: Boolean, default: false },
  avoidCapsule: { type: Boolean, default: true },
  glassProgress: { type: Number, default: 0 },
})

const emit = defineEmits([
  'back',
  'search-open',
  'search-cancel',
  'search-input',
  'search',
  'segment-click',
  'segment-change',
  'trailing-action',
  'update:searching',
  'update:searchValue',
  'update:segmentValue',
  'picker-value',
])

const topInset = ref(0)

function resolveTopInset(): number {
  // #ifdef H5
  return 12
  // #endif
  // #ifndef H5
  return isLingyunWeixinPc() ? 12 : 0
  // #endif
}

onMounted(() => {
  topInset.value = resolveTopInset()
})

function onToolbarBack(): void {
  emit('back')
}
function onToolbarSearching(value: boolean): void {
  emit('update:searching', value)
}
function onToolbarSearchValue(value: string): void {
  emit('update:searchValue', value)
}
function onToolbarSegmentValue(value: string | number): void {
  emit('update:segmentValue', value)
}
function onToolbarSearchOpen(): void {
  emit('search-open')
}
function onToolbarSearchCancel(value: unknown): void {
  emit('search-cancel', value)
}
function onToolbarSearchInput(value: unknown): void {
  emit('search-input', value)
}
function onToolbarSearch(value: unknown): void {
  emit('search', value)
}
function onToolbarSegmentClick(payload: unknown): void {
  emit('segment-click', payload)
}
function onToolbarSegmentChange(payload: unknown): void {
  emit('segment-change', payload)
}
function onToolbarTrailingAction(payload: unknown): void {
  emit('trailing-action', payload)
}
function onPickerValue(
  value: string | number,
  option: { value: string | number; label: string },
): void {
  emit('picker-value', value, option)
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

/* 分栏 toolbar 容器：顶部补偿由组件统一加，宽度撑满栏 */
.lingyun-split-toolbar {
  box-sizing: border-box;
  width: 100%;
}
</style>
