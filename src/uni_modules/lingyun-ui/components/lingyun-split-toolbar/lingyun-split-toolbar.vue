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

<script lang="ts">
/**
 * lingyun-split-toolbar · 分栏页专用浮动顶栏
 *
 * 分栏页左右两栏的 toolbar 统一用本组件：内部固定 title2LineLeft、无副标题、
 * 分段控件、非 fixed、不显示窗口按钮 / 主题钮，并统一处理 H5 / 微信 PC 的 12px 顶部补偿。
 * 页面只传业务配置（标题 / 搜索 / 分段 / 自定义按钮），不允许再写 title-style 等展示属性。
 *
 * 用法：放进 lingyun-split-layout 的 #list-header / #detail-header 插槽。
 * 分栏布局组件不内置 toolbar：小程序里在分栏（app-page 插槽）内部渲染 toolbar 并绑事件会中断渲染，
 * 因此 toolbar 由页面用本组件提供，展示样式仍集中在本组件内保证一致。
 *
 * @property {String} title 标题
 * @property {Boolean} showBack 是否显示返回钮
 * @property {Boolean} searchable 开启搜索
 * @property {String} searchPlaceholder 搜索占位
 * @property {Boolean} searching 搜索态（v-model:searching）
 * @property {String} searchValue 搜索关键词（v-model:search-value）
 * @property {Array} segments 分段数据（固定分段控件）
 * @property {String|Number} segmentValue 当前分段（v-model:segment-value）
 * @property {Array} trailingButtons 右侧自定义按钮组
 * @property {Boolean} trailingMenuEnabled 启用 #trailing-menu 浮层
 * @property {Boolean} avoidCapsule 是否避让微信胶囊（宽屏分栏左栏传 false）
 * @property {Number} glassProgress 玻璃强度 0~1
 * @event back / search-open / search-cancel / search-input / search / segment-click / segment-change / trailing-action
 * @event update:searching / update:searchValue / update:segmentValue
 */
import { defineComponent, type PropType } from 'vue'
import { isLingyunWeixinPc } from '../lingyun-toolbars/getLingyunNavSafeInset'

export type LingyunSplitToolbarSegment = {
  key: string
  text?: string
  icon?: string
  badge?: string | number
  disabled?: boolean
}

export type LingyunSplitToolbarButton = {
  key: string
  icon?: string
  label?: string
  disabled?: boolean
}

/** 一维数组为一组；二维数组按子数组拆成多个独立玻璃胶囊 */
export type LingyunSplitToolbarButtonGroups =
  | LingyunSplitToolbarButton[]
  | LingyunSplitToolbarButton[][]

export default defineComponent({
  name: 'LingyunSplitToolbar',
  props: {
    title: { type: String, default: '' },
    /** 副标题位置显示全局选择器。默认关 */
    subtitlePicker: { type: Boolean, default: false },
    showBack: { type: Boolean, default: false },
    searchable: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: '搜索' },
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
    /** 宽屏分栏左栏不是整宽时传 false，窄屏恢复默认 */
    avoidCapsule: { type: Boolean, default: true },
    glassProgress: { type: Number, default: 0 },
  },
  emits: [
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
  ],
  data() {
    return {
      topInset: 0,
    }
  },
  mounted() {
    this.topInset = this.resolveTopInset()
  },
  methods: {
    onToolbarBack(): void {
      this.$emit('back')
    },
    onToolbarSearching(value: boolean): void {
      this.$emit('update:searching', value)
    },
    onToolbarSearchValue(value: string): void {
      this.$emit('update:searchValue', value)
    },
    onToolbarSegmentValue(value: string | number): void {
      this.$emit('update:segmentValue', value)
    },
    onToolbarSearchOpen(): void {
      this.$emit('search-open')
    },
    onToolbarSearchCancel(value: unknown): void {
      this.$emit('search-cancel', value)
    },
    onToolbarSearchInput(value: unknown): void {
      this.$emit('search-input', value)
    },
    onToolbarSearch(value: unknown): void {
      this.$emit('search', value)
    },
    onToolbarSegmentClick(payload: unknown): void {
      this.$emit('segment-click', payload)
    },
    onToolbarSegmentChange(payload: unknown): void {
      this.$emit('segment-change', payload)
    },
    onToolbarTrailingAction(payload: unknown): void {
      this.$emit('trailing-action', payload)
    },
    resolveTopInset(): number {
      // #ifdef H5
      return 12
      // #endif
      // #ifndef H5
      return isLingyunWeixinPc() ? 12 : 0
      // #endif
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

/* 分栏 toolbar 容器：顶部补偿由组件统一加，宽度撑满栏 */
.lingyun-split-toolbar {
  box-sizing: border-box;
  width: 100%;
}
</style>
