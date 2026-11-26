<template>
  <view class="lingyun-table-filter">
    <lingyun-popover
      v-if="wide"
      placement="bottom"
      :arrow-align="arrowAlign"
      :show="show"
      :anchor="anchor"
      :width="popWidth"
      :estimate-height="popEstimateHeight"
      @update:show="onShowChange"
    >
      <view class="lingyun-table-filter__pop">
        <text class="lingyun-table-filter__pop-title">{{ title }}</text>
        <scroll-view scroll-y class="lingyun-table-filter__pop-body" :style="popBodyStyle" :show-scrollbar="false">
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
        <view class="lingyun-table-filter__pop-foot">
          <view class="lingyun-table-filter__pop-btn">
            <lingyun-button variant="bordered" size="small" block text="取消" @click="close" />
          </view>
          <view class="lingyun-table-filter__pop-btn">
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

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type PropType } from 'vue'
import {
  isWideFilterLayout,
  type LingyunTableFilterAnchor,
  type LingyunTableFilterCondition,
  type LingyunTableFilterOption,
  type LingyunTableFilterResult,
  type LingyunTableFilterType,
} from '../lingyun-table/table-filter'

const POP_WIDTH = 320
/** 标题、底部按钮、面板内边距和箭头合计 */
const POP_CHROME = 120
const POP_BODY_MAX = 420
const POP_BODY_MIN = 200

/**
 * lingyun-table-filter
 * @description 表格列的排序与筛选面板。窄屏为底部 Sheet（右上 ✓ 生效）；
 * 宽屏为带箭头指向 anchor 的 Popover（底部取消 / 确定）。内容见 lingyun-table-filter-form。
 * @see design/TABLES.md
 */
defineOptions({
  name: 'LingyunTableFilter',
})

const props = defineProps({
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
  /** 宽屏 Popover 箭头指向的矩形（视口坐标）。窄屏不用 */
  anchor: { type: Object as PropType<LingyunTableFilterAnchor | null>, default: null },
})

const emit = defineEmits(['update:show', 'confirm'])

const wide = ref(false)
const valid = ref(true)
const submitSeq = ref(0)
const windowWidth = ref(375)
const windowHeight = ref(667)

/** 同一帧里关了又开另一列时 show 不变，按列和外部值一起判断要不要重置草稿 */
const openKey = computed((): string => {
  if (!props.show) return ''
  const cond = props.condition
  const condKey = cond ? `${cond.op}:${cond.value}:${cond.value2 || ''}` : ''
  return [props.type, props.title, props.sortOrder, (props.values || []).join(','), condKey].join('|')
})
const detent = computed((): string => {
  return props.type === 'select' && props.options.length > props.searchThreshold ? 'large' : 'medium'
})
/** 箭头贴在面板靠图标的一端：图标在左半屏，面板向右展开；在右半屏，向左展开 */
const arrowAlign = computed((): string => {
  const a = props.anchor
  if (!a) return 'middle'
  return a.left + a.width / 2 > windowWidth.value / 2 ? 'trailing' : 'leading'
})
const popWidth = computed((): number => {
  return POP_WIDTH
})
const popBodyMax = computed((): number => {
  return Math.max(POP_BODY_MIN, Math.min(POP_BODY_MAX, windowHeight.value - POP_CHROME - 120))
})
const popEstimateHeight = computed((): number => {
  return popBodyMax.value + POP_CHROME
})
const popBodyStyle = computed((): Record<string, string> => {
  return { maxHeight: `${popBodyMax.value}px` }
})

function onShowChange(open: boolean): void {
  emit('update:show', open)
}
function onValid(ok: boolean): void {
  valid.value = ok
}
function submit(): void {
  if (!valid.value) return
  submitSeq.value += 1
}
function close(): void {
  emit('update:show', false)
}
function onConfirm(result: LingyunTableFilterResult): void {
  emit('confirm', result)
  emit('update:show', false)
}

watch(
  openKey,
  (key: string) => {
    if (!key) return
    wide.value = isWideFilterLayout()
    try {
      const info = uni.getWindowInfo()
      windowWidth.value = info.windowWidth || 375
      windowHeight.value = info.windowHeight || 667
    } catch {
      /* 用默认高度 */
    }
  },
  { immediate: true },
)
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-table-filter__pop {
  display: flex;
  flex-direction: column;
}

.lingyun-table-filter__pop-title {
  display: block;
  padding: 0 0 10px;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-table-filter__pop-body {
  box-sizing: border-box;
}

.lingyun-table-filter__pop-foot {
  display: flex;
  flex-direction: row;
  padding-top: 12px;
}

.lingyun-table-filter__pop-btn {
  flex: 1;
  min-width: 0;
}

.lingyun-table-filter__pop-btn + .lingyun-table-filter__pop-btn {
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