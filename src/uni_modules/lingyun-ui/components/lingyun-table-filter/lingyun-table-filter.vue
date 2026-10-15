<template>
  <view class="lingyun-table-filter">
    <lingyun-popover
      v-if="wide"
      variant="menu"
      placement="bottom"
      :show-arrow="false"
      :show="show"
      :anchor="anchor"
      :width="menuWidth"
      :estimate-height="menuEstimateHeight"
      @update:show="onShowChange"
    >
      <view class="lingyun-table-filter__menu">
        <text class="lingyun-table-filter__menu-title">{{ title }}</text>
        <scroll-view scroll-y class="lingyun-table-filter__menu-body" :style="menuBodyStyle" :show-scrollbar="false">
          <lingyun-table-filter-form
            compact
            :reset-key="openKey"
            :submit-seq="submitSeq"
            :type="type"
            :options="options"
            :values="values"
            :condition="condition"
            :sortable="sortable"
            :sort-order="sortOrder"
            :search-threshold="searchThreshold"
            @valid="onValid"
            @confirm="onConfirm"
          />
        </scroll-view>
        <view class="lingyun-table-filter__menu-foot">
          <view class="lingyun-table-filter__menu-btn">
            <lingyun-button variant="bordered" size="small" block text="取消" @click="close" />
          </view>
          <view class="lingyun-table-filter__menu-btn">
            <lingyun-button
              variant="borderedProminent"
              size="small"
              block
              text="确定"
              :disabled="!valid"
              @click="submit"
            />
          </view>
        </view>
      </view>
    </lingyun-popover>

    <lingyun-sheets v-else :show="show" :title="title" :detent="detent" @update:show="onShowChange">
      <template #trailing>
        <view
          class="lingyun-table-filter__done"
          :class="{ 'lingyun-table-filter__done--off': !valid }"
          hover-class="lingyun-table-filter__done--hover"
          :hover-stay-time="70"
          role="button"
          aria-label="确定"
          @click.stop="submit"
        >
          <lingyun-icon type="checkmarkempty" :size="24" color="#ffffff" />
        </view>
      </template>
      <lingyun-table-filter-form
        :reset-key="openKey"
        :submit-seq="submitSeq"
        :type="type"
        :options="options"
        :values="values"
        :condition="condition"
        :sortable="sortable"
        :sort-order="sortOrder"
        :search-threshold="searchThreshold"
        @valid="onValid"
        @confirm="onConfirm"
      />
    </lingyun-sheets>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import {
  isWideFilterLayout,
  type LingyunTableFilterAnchor,
  type LingyunTableFilterCondition,
  type LingyunTableFilterOption,
  type LingyunTableFilterResult,
  type LingyunTableFilterType,
} from '../lingyun-table/table-filter'

const MENU_WIDTH = 320
/** 菜单标题、底部按钮和面板内边距合计 */
const MENU_CHROME = 112
const MENU_BODY_MAX = 420
const MENU_BODY_MIN = 200

/**
 * lingyun-table-filter
 * @description 表格列的排序与筛选面板。窄屏为底部 Sheet（右上 ✓ 生效）；
 * 宽屏为贴着 anchor 弹出的菜单（底部取消 / 确定）。内容见 lingyun-table-filter-form。
 * @see design/TABLES.md
 */
export default defineComponent({
  name: 'LingyunTableFilter',
  emits: ['update:show', 'confirm'],
  props: {
    show: { type: Boolean, default: false },
    title: { type: String, default: '' },
    /** 为空时只显示排序 */
    type: { type: String as PropType<LingyunTableFilterType | ''>, default: '' },
    options: { type: Array as PropType<LingyunTableFilterOption[]>, default: () => [] },
    values: { type: Array as PropType<string[]>, default: () => [] },
    condition: { type: Object as PropType<LingyunTableFilterCondition | null>, default: null },
    sortable: { type: Boolean, default: false },
    sortOrder: { type: String as PropType<'asc' | 'desc' | ''>, default: '' },
    /** 选项多于这个数时显示搜索 */
    searchThreshold: { type: Number, default: 8 },
    /** 宽屏菜单指向的矩形（视口坐标）。窄屏不用 */
    anchor: { type: Object as PropType<LingyunTableFilterAnchor | null>, default: null },
  },
  data() {
    return {
      wide: false,
      valid: true,
      submitSeq: 0,
      windowHeight: 667,
    }
  },
  computed: {
    /** 同一帧里关了又开另一列时 show 不变，按列和外部值一起判断要不要重置草稿 */
    openKey(): string {
      if (!this.show) return ''
      const cond = this.condition
      const condKey = cond ? `${cond.op}:${cond.value}:${cond.value2 || ''}` : ''
      return [this.type, this.title, this.sortOrder, (this.values || []).join(','), condKey].join('|')
    },
    detent(): string {
      return this.type === 'select' && this.options.length > this.searchThreshold ? 'large' : 'medium'
    },
    menuWidth(): number {
      return MENU_WIDTH
    },
    menuBodyMax(): number {
      return Math.max(MENU_BODY_MIN, Math.min(MENU_BODY_MAX, this.windowHeight - MENU_CHROME - 120))
    },
    menuEstimateHeight(): number {
      return this.menuBodyMax + MENU_CHROME
    },
    menuBodyStyle(): Record<string, string> {
      return { maxHeight: `${this.menuBodyMax}px` }
    },
  },
  watch: {
    openKey: {
      immediate: true,
      handler(key: string) {
        if (!key) return
        this.wide = isWideFilterLayout()
        try {
          this.windowHeight = uni.getWindowInfo().windowHeight || 667
        } catch {
          /* 用默认高度 */
        }
      },
    },
  },
  methods: {
    onShowChange(open: boolean) {
      this.$emit('update:show', open)
    },
    onValid(ok: boolean) {
      this.valid = ok
    },
    submit() {
      if (!this.valid) return
      this.submitSeq += 1
    },
    close() {
      this.$emit('update:show', false)
    },
    onConfirm(result: LingyunTableFilterResult) {
      this.$emit('confirm', result)
      this.$emit('update:show', false)
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-table-filter__menu {
  display: flex;
  flex-direction: column;
}

.lingyun-table-filter__menu-title {
  display: block;
  padding: 6px 8px 10px;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-table-filter__menu-body {
  padding: 0 6px;
  box-sizing: border-box;
}

.lingyun-table-filter__menu-foot {
  display: flex;
  flex-direction: row;
  padding: 10px 6px 4px;
}

.lingyun-table-filter__menu-btn {
  flex: 1;
  min-width: 0;
}

.lingyun-table-filter__menu-btn + .lingyun-table-filter__menu-btn {
  margin-left: 10px;
}

.lingyun-table-filter__done {
  box-sizing: border-box;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-link, #{$lingyun-link});
  box-shadow: var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    var(--lingyun-glass-shadow-raised, #{$lingyun-glass-shadow-raised});
}

.lingyun-table-filter__done--hover {
  transform: scale(0.96);
}

.lingyun-table-filter__done--off {
  background-color: var(--lingyun-fill, #{$lingyun-fill});
  box-shadow: none;
}
</style>
