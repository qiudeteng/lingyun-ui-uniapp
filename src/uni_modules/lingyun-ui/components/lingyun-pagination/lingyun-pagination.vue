<template>
  <view
    v-if="visible"
    class="lingyun-pagination"
    :class="[
      rootClass,
      `lingyun-pagination--${sizeKey}`,
      { 'lingyun-pagination--disabled': disabled },
    ]"
  >
    <text v-if="showTotal" class="lingyun-pagination__total">
      {{ resolvedTotalText }}
    </text>

    <view class="lingyun-pagination__pages">
      <view
        v-if="showPrevNext"
        class="lingyun-pagination__btn lingyun-pagination__btn--nav"
        :class="{ 'lingyun-pagination__btn--off': currentPage <= 1 }"
        role="button"
        aria-label="上一页"
        @click="prev"
      >
        <lingyun-icon type="left" :size="16" color="secondary" />
      </view>

      <template v-if="simple">
        <text class="lingyun-pagination__simple">
          {{ currentPage }} / {{ pageCount }}
        </text>
      </template>
      <template v-else>
        <view
          v-for="item in pageItems"
          :key="item.key"
          class="lingyun-pagination__btn"
          :class="{
            'lingyun-pagination__btn--active': !item.ellipsis && item.page === currentPage,
            'lingyun-pagination__btn--ellipsis': item.ellipsis,
          }"
          :role="item.ellipsis ? 'presentation' : 'button'"
          :aria-current="!item.ellipsis && item.page === currentPage ? 'page' : undefined"
          @click="onItemClick(item)"
        >
          <text class="lingyun-pagination__btn-text">
            {{ item.ellipsis ? '…' : item.page }}
          </text>
        </view>
      </template>

      <view
        v-if="showPrevNext"
        class="lingyun-pagination__btn lingyun-pagination__btn--nav"
        :class="{ 'lingyun-pagination__btn--off': currentPage >= pageCount }"
        role="button"
        aria-label="下一页"
        @click="next"
      >
        <lingyun-icon type="right" :size="16" color="secondary" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import type {
  LingyunPaginationChangePayload,
  LingyunPaginationItem,
  LingyunPaginationSize,
} from './types'

/**
 * lingyun-pagination
 * @description 分页：总数、页码窗口、上一页 / 下一页、简单模式、小尺寸
 * @see design/PAGINATION.md
 */
defineOptions({
  name: 'LingyunPagination',
})

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  pageSize: { type: Number, default: 10 },
  maxButtons: { type: Number, default: 7 },
  size: {
    type: String as PropType<LingyunPaginationSize>,
    default: 'default',
  },
  showTotal: { type: Boolean, default: true },
  totalText: { type: String, default: '' },
  showPrevNext: { type: Boolean, default: true },
  simple: { type: Boolean, default: false },
  hideOnSinglePage: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change'])

const rootClass = computed((): string => {
  let themeClass = 'theme-light'
  try {
    themeClass = useLingyunTheme().rootClass || 'theme-light'
  } catch {
    /* pinia 未就绪 */
  }
  return themeClass
})
const sizeKey = computed((): LingyunPaginationSize => {
  return props.size === 'small' ? 'small' : 'default'
})
const resolvedPageSize = computed((): number => {
  const value = Math.floor(Number(props.pageSize))
  return Number.isFinite(value) && value > 0 ? value : 10
})
const resolvedTotal = computed((): number => {
  const value = Math.floor(Number(props.total))
  return Number.isFinite(value) && value > 0 ? value : 0
})
const pageCount = computed((): number => {
  return Math.max(1, Math.ceil(resolvedTotal.value / resolvedPageSize.value))
})
const currentPage = computed((): number => {
  const value = Math.floor(Number(props.modelValue))
  if (!Number.isFinite(value)) return 1
  return Math.min(pageCount.value, Math.max(1, value))
})
const resolvedTotalText = computed((): string => {
  return props.totalText || `共 ${resolvedTotal.value} 条`
})
const visible = computed((): boolean => {
  return !(props.hideOnSinglePage && pageCount.value <= 1)
})
const pageItems = computed((): LingyunPaginationItem[] => {
  const total = pageCount.value
  const max = Math.max(5, Math.min(11, Math.floor(Number(props.maxButtons)) || 7))
  if (total <= max) {
    return Array.from({ length: total }, (_, index) => ({
      key: `page-${index + 1}`,
      page: index + 1,
      ellipsis: false,
    }))
  }
  const innerCount = max - 4
  let start = Math.max(2, currentPage.value - Math.floor(innerCount / 2))
  let end = start + innerCount - 1
  if (end > total - 2) {
    end = total - 1
    start = end - innerCount + 1
  }
  if (start < 2) start = 2
  const items: LingyunPaginationItem[] = [
    { key: 'page-1', page: 1, ellipsis: false },
  ]
  if (start > 2) {
    items.push({ key: 'ellipsis-left', page: 0, ellipsis: true })
  }
  for (let page = start; page <= end; page += 1) {
    items.push({
      key: `page-${page}`,
      page,
      ellipsis: false,
    })
  }
  if (end < total - 1) {
    items.push({ key: 'ellipsis-right', page: 0, ellipsis: true })
  }
  items.push({
    key: `page-${total}`,
    page: total,
    ellipsis: false,
  })
  return items
})

function go(page: number): void {
  if (props.disabled) return
  const next = Math.min(
    pageCount.value,
    Math.max(1, Math.floor(Number(page)) || 1),
  )
  if (next === currentPage.value) return
  const payload: LingyunPaginationChangePayload = {
    page: next,
    pageSize: resolvedPageSize.value,
    pageCount: pageCount.value,
  }
  emit('update:modelValue', next)
  emit('change', payload)
}

function onItemClick(item: LingyunPaginationItem): void {
  if (props.disabled) return
  if (item.ellipsis) {
    const step = Math.max(1, Math.floor((Math.max(5, props.maxButtons) - 4) / 2))
    go(item.key === 'ellipsis-left' ? currentPage.value - step : currentPage.value + step)
    return
  }
  go(item.page)
}

function prev(): void {
  go(currentPage.value - 1)
}

function next(): void {
  go(currentPage.value + 1)
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-pagination {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  row-gap: 8px;
}

.lingyun-pagination--disabled {
  opacity: 0.4;
  pointer-events: none;
}

.lingyun-pagination__total {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-pagination__pages {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.lingyun-pagination__btn {
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-pagination__btn:hover {
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-pagination__btn--nav {
  padding: 0;
}

.lingyun-pagination__btn--off {
  opacity: 0.3;
  pointer-events: none;
}

.lingyun-pagination__btn--active {
  background-color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-pagination__btn--active .lingyun-pagination__btn-text {
  color: #ffffff;
  font-weight: 600;
}

.lingyun-pagination__btn--ellipsis {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-pagination__btn-text {
  font-size: 15px;
  line-height: 20px;
  color: inherit;
}

.lingyun-pagination__simple {
  padding: 0 8px;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  white-space: nowrap;
}

.lingyun-pagination--small .lingyun-pagination__btn {
  min-width: 28px;
  height: 28px;
  padding: 0 4px;
  border-radius: 7px;
}

.lingyun-pagination--small .lingyun-pagination__btn-text {
  font-size: 13px;
  line-height: 18px;
}

.lingyun-pagination--small .lingyun-pagination__total,
.lingyun-pagination--small .lingyun-pagination__simple {
  font-size: 12px;
  line-height: 16px;
}
</style>
