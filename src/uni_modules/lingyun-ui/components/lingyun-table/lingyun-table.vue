<template>
  <view class="lingyun-table" :class="rootClass" :style="fillStyle">
    <view v-if="showToolbar()" class="lingyun-table__toolbar">
      <view class="lingyun-table__toolbar-main">
        <lingyun-icon v-if="icon" :type="icon" :size="22" color="label" />
        <text v-if="title" class="lingyun-table__toolbar-title" :class="{ 'lingyun-table__toolbar-title--gap': !!icon }">{{ title }}</text>
      </view>
      <view class="lingyun-table__toolbar-tools">
        <view
          v-if="showRefresh"
          class="lingyun-table__tool"
          hover-class="lingyun-table__tool--hover"
          :hover-stay-time="70"
          @click="onRefresh"
        >
          <lingyun-icon type="reload" :size="18" color="secondary" />
        </view>
        <lingyun-popover
          v-if="columnPicker"
          v-model="columnPickerOpen"
          placement="bottom"
          :width="220"
          arrow-align="trailing"
        >
          <template #trigger="{ toggle }">
            <view
              class="lingyun-table__tool"
              hover-class="lingyun-table__tool--hover"
              :hover-stay-time="70"
              @click.stop="toggle"
            >
              <lingyun-icon type="list" :size="18" color="secondary" />
            </view>
          </template>
          <scroll-view scroll-y class="lingyun-table__pick-scroll" :style="pickerScrollStyle">
            <view
              v-for="col in columns"
              :key="col.key"
              class="lingyun-table__pick"
              hover-class="lingyun-table__pick--hover"
              :hover-stay-time="70"
              @click.stop="toggleColumn(col.key)"
            >
              <view class="lingyun-table__check" :class="{ 'lingyun-table__check--on': columnShown(col.key) }">
                <lingyun-icon v-if="columnShown(col.key)" type="checkmarkempty" :size="14" color="#ffffff" />
              </view>
              <text class="lingyun-table__pick-text">{{ col.title }}</text>
            </view>
          </scroll-view>
        </lingyun-popover>
        <view
          v-if="exportExcel"
          class="lingyun-table__tool"
          hover-class="lingyun-table__tool--hover"
          :hover-stay-time="70"
          @click="onExportExcel"
        >
          <lingyun-icon type="download" :size="18" color="secondary" />
        </view>
        <slot name="tools" />
      </view>
    </view>
    <view
      class="lingyun-table__head"
      @mousewheel.stop="onTableWheel"
      @wheel.stop="onTableWheel"
      @mouseenter="onTablePointerEnter"
      @pointerenter="onTablePointerEnter"
    >
      <view v-if="leftWidth" class="lingyun-table__side" :style="sideStyle(leftWidth)">
        <view class="lingyun-table__row lingyun-table__row--head">
          <view
            v-if="selection"
            class="lingyun-table__cell lingyun-table__cell--check"
            @click.stop="togglePage"
          >
            <view class="lingyun-table__check" :class="pageCheckClass">
              <lingyun-icon v-if="pageAll" type="checkmarkempty" :size="14" color="#ffffff" />
              <view v-else-if="pageSome" class="lingyun-table__dash" />
            </view>
          </view>
          <view
            v-for="col in leftColumns"
            :key="col.key"
            class="lingyun-table__cell"
            :style="cellStyle(col)"
          >
            <view class="lingyun-table__head-hit" @click="onSort(col)">
              <text class="lingyun-table__head-text">{{ col.title }}</text>
              <text v-if="col.sortable" class="lingyun-table__sort" :class="sortClass(col)">{{
                sortMark(col)
              }}</text>
            </view>
            <view
              v-if="col.filters && col.filters.length"
              class="lingyun-table__filter"
              :class="{ 'lingyun-table__filter--on': filterOn(col) }"
              @click.stop="toggleFilter(col)"
            >
              <text class="lingyun-table__filter-mark">▾</text>
            </view>
          </view>
        </view>
      </view>

      <view class="lingyun-table__clip" :style="centerClipStyle('head')">
        <!-- #ifdef MP-WEIXIN -->
        <view
          class="lingyun-table__x lingyun-table__x--head lingyun-table__x--mp"
          @touchstart="onCenterTouchStart"
          @touchmove.stop="onCenterTouchMove"
          @touchend="onCenterTouchEnd"
          @touchcancel="onCenterTouchEnd"
        >
          <view class="lingyun-table__row lingyun-table__row--head" :style="mpHeadRowStyle">
            <view v-if="colPadLeft" class="lingyun-table__col-pad" :style="colPadLeftStyle" />
            <view
              v-for="col in visibleCenterColumns"
              :key="col.key"
              class="lingyun-table__cell"
              :style="cellStyle(col)"
            >
              <view class="lingyun-table__head-hit" @click="onSort(col)">
                <text class="lingyun-table__head-text">{{ col.title }}</text>
                <text v-if="col.sortable" class="lingyun-table__sort" :class="sortClass(col)">{{
                  sortMark(col)
                }}</text>
              </view>
              <view
                v-if="col.filters && col.filters.length"
                class="lingyun-table__filter"
                :class="{ 'lingyun-table__filter--on': filterOn(col) }"
                @click.stop="toggleFilter(col)"
              >
                <text class="lingyun-table__filter-mark">▾</text>
              </view>
            </view>
            <view v-if="colPadRight" class="lingyun-table__col-pad" :style="colPadRightStyle" />
          </view>
        </view>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <scroll-view
          class="lingyun-table__x lingyun-table__x--head"
          scroll-x
          enable-flex
          :scroll-left="headLeft"
          :show-scrollbar="false"
          @scroll="onHeadScroll"
        >
          <view class="lingyun-table__row lingyun-table__row--head" :style="centerRowStyle">
            <view v-if="colPadLeft" class="lingyun-table__col-pad" :style="colPadLeftStyle" />
            <view
              v-for="col in visibleCenterColumns"
              :key="col.key"
              class="lingyun-table__cell"
              :style="cellStyle(col)"
            >
              <view class="lingyun-table__head-hit" @click="onSort(col)">
                <text class="lingyun-table__head-text">{{ col.title }}</text>
                <text v-if="col.sortable" class="lingyun-table__sort" :class="sortClass(col)">{{
                  sortMark(col)
                }}</text>
              </view>
              <view
                v-if="col.filters && col.filters.length"
                class="lingyun-table__filter"
                :class="{ 'lingyun-table__filter--on': filterOn(col) }"
                @click.stop="toggleFilter(col)"
              >
                <text class="lingyun-table__filter-mark">▾</text>
              </view>
            </view>
            <view v-if="colPadRight" class="lingyun-table__col-pad" :style="colPadRightStyle" />
          </view>
        </scroll-view>
        <!-- #endif -->
      </view>

      <view v-if="rightWidth" class="lingyun-table__side lingyun-table__side--right" :style="sideStyle(rightWidth)">
        <view class="lingyun-table__row lingyun-table__row--head">
          <view
            v-for="col in rightColumns"
            :key="col.key"
            class="lingyun-table__cell"
            :style="cellStyle(col)"
          >
            <view class="lingyun-table__head-hit" @click="onSort(col)">
              <text class="lingyun-table__head-text">{{ col.title }}</text>
              <text v-if="col.sortable" class="lingyun-table__sort" :class="sortClass(col)">{{
                sortMark(col)
              }}</text>
            </view>
            <view
              v-if="col.filters && col.filters.length"
              class="lingyun-table__filter"
              :class="{ 'lingyun-table__filter--on': filterOn(col) }"
              @click.stop="toggleFilter(col)"
            >
              <text class="lingyun-table__filter-mark">▾</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="openColumn" class="lingyun-table__filters">
      <view
        class="lingyun-table__chip"
        :class="{ 'lingyun-table__chip--on': !activeFilterValues.length }"
        @click="clearFilter(openColumn.key)"
      >
        <text class="lingyun-table__chip-text">全部</text>
      </view>
      <view
        v-for="opt in openColumn.filters"
        :key="String(opt.value)"
        class="lingyun-table__chip"
        :class="{ 'lingyun-table__chip--on': filterPicked(openColumn.key, opt.value) }"
        @click="pickFilter(openColumn.key, opt.value)"
      >
        <text class="lingyun-table__chip-text">{{ opt.text }}</text>
      </view>
    </view>

    <view
      class="lingyun-table__body"
      :style="bodyBoxStyle"
      @mousewheel.stop="onTableWheel"
      @wheel.stop="onTableWheel"
      @mouseenter="onTablePointerEnter"
      @pointerenter="onTablePointerEnter"
    >
      <view v-if="!pageRows.length && !loading" class="lingyun-table__empty">
        <slot name="empty">
          <lingyun-empty variant="plain" :title="emptyText" />
        </slot>
      </view>
      <scroll-view
        v-if="pageRows.length && leftWidth"
        class="lingyun-table__y"
        scroll-y
        enable-flex
        :style="sideScrollStyle(leftWidth)"
        :scroll-top="leftTop"
        :show-scrollbar="false"
        @scroll="onLeftScroll"
        @mousewheel.stop="onTableWheel"
        @wheel.stop="onTableWheel"
      >
        <view class="lingyun-table__track" :style="rowTrackStyle">
          <view v-if="rowPadTop" class="lingyun-table__row-pad" :style="rowPadTopStyle" />
          <view
            v-for="item in visibleRows"
            :key="item.index"
            class="lingyun-table__row"
            :class="rowClass(item.index, item.row)"
            @touchstart="onRowPress(item.row)"
            @touchend="onRowRelease"
            @touchcancel="onRowRelease"
            @mousedown="onRowPress(item.row)"
            @mouseup="onRowRelease"
            @mouseleave="onRowRelease"
            @click="onRowClick(item.row)"
          >
            <view v-if="selection" class="lingyun-table__cell lingyun-table__cell--check" @click.stop="toggleRow(item.row)">
              <view class="lingyun-table__check" :class="{ 'lingyun-table__check--on': isSelected(item.row) }">
                <lingyun-icon v-if="isSelected(item.row)" type="checkmarkempty" :size="14" color="#ffffff" />
              </view>
            </view>
            <template v-for="col in leftColumns" :key="col.key">
              <view class="lingyun-table__cell" :style="cellStyle(col)">
                <view class="lingyun-table__value">
                  <slot name="cell" :row="item.row" :column="col" :value="cellValue(item.row, col, item.index)">
                    <text class="lingyun-table__text">{{ cellText(item.row, col, item.index) }}</text>
                  </slot>
                </view>
              </view>
            </template>
          </view>
          <view v-if="rowPadBottom" class="lingyun-table__row-pad" :style="rowPadBottomStyle" />
        </view>
      </scroll-view>

      <view v-if="pageRows.length" class="lingyun-table__clip" :style="centerClipStyle('body')">
        <!-- #ifdef MP-WEIXIN -->
        <view
          class="lingyun-table__x lingyun-table__x--body lingyun-table__x--mp"
          @touchstart="onCenterTouchStart"
          @touchmove.stop="onCenterTouchMove"
          @touchend="onCenterTouchEnd"
          @touchcancel="onCenterTouchEnd"
          @mousewheel.stop="onTableWheel"
          @wheel.stop="onTableWheel"
        >
          <view class="lingyun-table__track" :style="mpBodyTrackStyle">
            <view v-if="rowPadTop" class="lingyun-table__row-pad" :style="rowPadTopStyle" />
            <view
              v-for="item in visibleRows"
              :key="item.index"
              class="lingyun-table__row"
              :style="centerRowStyle"
              :class="rowClass(item.index, item.row)"
              @touchstart="onRowPress(item.row)"
              @touchend="onRowRelease"
              @touchcancel="onRowRelease"
              @mousedown="onRowPress(item.row)"
              @mouseup="onRowRelease"
              @mouseleave="onRowRelease"
              @click="onRowClick(item.row)"
            >
              <view v-if="colPadLeft" class="lingyun-table__col-pad" :style="colPadLeftStyle" />
              <template v-for="(col, colIndex) in centerSlotColumns" :key="col ? col.key : 'pad-' + colIndex">
                <view v-if="col" class="lingyun-table__cell" :style="cellStyle(col)">
                  <view class="lingyun-table__value">
                    <slot name="cell" :row="item.row" :column="col" :value="cellValue(item.row, col, item.index)">
                      <text class="lingyun-table__text">{{ cellText(item.row, col, item.index) }}</text>
                    </slot>
                  </view>
                </view>
              </template>
              <view v-if="colPadRight" class="lingyun-table__col-pad" :style="colPadRightStyle" />
            </view>
            <view v-if="rowPadBottom" class="lingyun-table__row-pad" :style="rowPadBottomStyle" />
          </view>
        </view>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <scroll-view
          class="lingyun-table__x lingyun-table__x--body"
          scroll-x
          scroll-y
          enable-flex
          :style="bodyScrollStyle"
          :scroll-left="bodyLeft"
          :scroll-top="bodyTop"
          :show-scrollbar="false"
          @scroll="onBodyScroll"
        >
          <view class="lingyun-table__track" :style="centerTrackStyle">
            <view v-if="rowPadTop" class="lingyun-table__row-pad" :style="rowPadTopStyle" />
            <view
              v-for="item in visibleRows"
              :key="item.index"
              class="lingyun-table__row"
              :style="centerRowStyle"
              :class="rowClass(item.index, item.row)"
              @touchstart="onRowPress(item.row)"
              @touchend="onRowRelease"
              @touchcancel="onRowRelease"
              @mousedown="onRowPress(item.row)"
              @mouseup="onRowRelease"
              @mouseleave="onRowRelease"
              @click="onRowClick(item.row)"
            >
              <view v-if="colPadLeft" class="lingyun-table__col-pad" :style="colPadLeftStyle" />
              <template v-for="(col, colIndex) in centerSlotColumns" :key="col ? col.key : 'pad-' + colIndex">
                <view v-if="col" class="lingyun-table__cell" :style="cellStyle(col)">
                  <view class="lingyun-table__value">
                    <slot name="cell" :row="item.row" :column="col" :value="cellValue(item.row, col, item.index)">
                      <text class="lingyun-table__text">{{ cellText(item.row, col, item.index) }}</text>
                    </slot>
                  </view>
                </view>
              </template>
              <view v-if="colPadRight" class="lingyun-table__col-pad" :style="colPadRightStyle" />
            </view>
            <view v-if="rowPadBottom" class="lingyun-table__row-pad" :style="rowPadBottomStyle" />
          </view>
        </scroll-view>
        <!-- #endif -->
      </view>

      <scroll-view
        v-if="pageRows.length && rightWidth"
        class="lingyun-table__y lingyun-table__y--right"
        scroll-y
        enable-flex
        :style="sideScrollStyle(rightWidth)"
        :scroll-top="rightTop"
        :show-scrollbar="false"
        @scroll="onRightScroll"
        @mousewheel.stop="onTableWheel"
        @wheel.stop="onTableWheel"
      >
        <view class="lingyun-table__track" :style="rowTrackStyle">
          <view v-if="rowPadTop" class="lingyun-table__row-pad" :style="rowPadTopStyle" />
          <view
            v-for="item in visibleRows"
            :key="item.index"
            class="lingyun-table__row"
            :class="rowClass(item.index, item.row)"
            @touchstart="onRowPress(item.row)"
            @touchend="onRowRelease"
            @touchcancel="onRowRelease"
            @mousedown="onRowPress(item.row)"
            @mouseup="onRowRelease"
            @mouseleave="onRowRelease"
            @click="onRowClick(item.row)"
          >
            <template v-for="(col, colIndex) in rightSlotColumns" :key="col ? col.key : 'pad-' + colIndex">
              <view v-if="col" class="lingyun-table__cell" :style="cellStyle(col)">
                <view class="lingyun-table__value">
                  <slot name="cell" :row="item.row" :column="col" :value="cellValue(item.row, col, item.index)">
                    <text class="lingyun-table__text">{{ cellText(item.row, col, item.index) }}</text>
                  </slot>
                </view>
              </view>
            </template>
          </view>
          <view v-if="rowPadBottom" class="lingyun-table__row-pad" :style="rowPadBottomStyle" />
        </view>
      </scroll-view>
      <!-- #ifdef H5 -->
      <view
        v-if="hBarNeeded"
        class="lingyun-table__hbar"
        :style="hBarStyle"
        @mousedown.stop.prevent="onHBarStart"
      >
        <view class="lingyun-table__hbar-thumb" :style="hThumbStyle" />
      </view>
      <view
        v-if="vBarNeeded"
        class="lingyun-table__vbar"
        :style="vBarStyle"
        @mousedown.stop.prevent="onVBarStart"
      >
        <view class="lingyun-table__vbar-thumb" :style="vThumbStyle" />
      </view>
      <!-- #endif -->
      <view v-if="loading" class="lingyun-table__loading">
        <lingyun-activity-indicator size="small" />
      </view>
    </view>

    <view v-if="showPager" class="lingyun-table__pager">
      <text class="lingyun-table__pager-meta">共 {{ totalCount }} 条</text>
      <view class="lingyun-table__pager-nav">
        <view
          class="lingyun-table__page-btn"
          :class="{ 'lingyun-table__page-btn--off': currentPage <= 1 }"
          @click="goPage(currentPage - 1)"
        >
          <text class="lingyun-table__page-btn-text">上一页</text>
        </view>
        <text class="lingyun-table__page-no">{{ currentPage }} / {{ pageCount }}</text>
        <view
          class="lingyun-table__page-btn"
          :class="{ 'lingyun-table__page-btn--off': currentPage >= pageCount }"
          @click="goPage(currentPage + 1)"
        >
          <text class="lingyun-table__page-btn-text">下一页</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

const ROW_H = 52
const CHECK_W = 48
const COL_W = 120
const ROW_OVERSCAN = 8
const COL_OVERSCAN = COL_W * 2

export type LingyunTableAlign = 'left' | 'center' | 'right'
export type LingyunTableSortOrder = 'asc' | 'desc' | ''

export interface LingyunTableFilterOption {
  text: string
  value: string | number
}

export interface LingyunTableColumn {
  key: string
  title: string
  width?: number | string
  align?: LingyunTableAlign
  /** true 与 left 都固定在左侧 */
  fixed?: 'left' | 'right' | boolean
  /** index 时显示当前顺序的序号，不读行数据 */
  type?: 'index'
  sortable?: boolean
  filters?: LingyunTableFilterOption[]
  formatter?: (value: unknown, row: LingyunTableRow) => string
}

export type LingyunTableRow = Record<string, unknown>

export interface LingyunTableQuery {
  page: number
  pageSize: number
  filters: Record<string, string[]>
  sortKey: string
  sortOrder: LingyunTableSortOrder
}

interface ResolvedColumn extends LingyunTableColumn {
  widthPx: number
  side: 'left' | 'right' | 'center'
}

type ScrollDetail = { scrollLeft?: number; scrollTop?: number }
type ScrollEvent = { detail?: ScrollDetail }

function columnWidth(value: number | string | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  if (typeof value === 'string') {
    const n = parseFloat(value)
    if (Number.isFinite(n) && n > 0) return n
  }
  return COL_W
}

function columnSide(fixed: LingyunTableColumn['fixed']): 'left' | 'right' | 'center' {
  if (fixed === 'right') return 'right'
  if (fixed === 'left' || fixed === true) return 'left'
  return 'center'
}

function parseHeight(value: unknown): number {
  if (value === '' || value == null) return 0
  if (typeof value === 'number') return value > 0 ? value : 0
  const n = parseFloat(String(value))
  return Number.isFinite(n) && n > 0 ? n : 0
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function excelCell(text: string, numeric: boolean): string {
  const type = numeric ? 'Number' : 'String'
  return `<Cell><Data ss:Type="${type}">${escapeXml(text)}</Data></Cell>`
}

function sanitizeFileName(value: string): string {
  const name = value.replace(/[\\/:*?"<>|]/g, '_').trim()
  return name || '表格'
}

function compareValue(a: unknown, b: unknown): number {
  const aEmpty = a == null || a === ''
  const bEmpty = b == null || b === ''
  if (aEmpty && bEmpty) return 0
  if (aEmpty) return -1
  if (bEmpty) return 1
  const na = typeof a === 'number' ? a : Number(String(a).trim())
  const nb = typeof b === 'number' ? b : Number(String(b).trim())
  const aNum = typeof a !== 'boolean' && Number.isFinite(na) && String(a).trim() !== ''
  const bNum = typeof b !== 'boolean' && Number.isFinite(nb) && String(b).trim() !== ''
  if (aNum && bNum) return na - nb
  return String(a).localeCompare(String(b), 'zh')
}

type SectionMarkHost = {
  $options?: { name?: string }
  $parent?: SectionMarkHost | null
  markEmbeddedList?: (active: boolean) => void
}

/** 小程序上看不到插槽 vnode，表格自己告诉外层 section。 */
function findSectionMarkHost(start: unknown): SectionMarkHost | null {
  let parent = start as SectionMarkHost | null
  while (parent) {
    if (parent.$options && parent.$options.name === 'LingyunSection') return parent
    parent = parent.$parent || null
  }
  return null
}

export default defineComponent({
  name: 'LingyunTable',
  options: {
    virtualHost: true,
  },
  emits: [
    'row-click',
    'sort-change',
    'filter-change',
    'page-change',
    'selection-change',
    'update:selectedKeys',
    'update:page',
    'query-change',
    'refresh',
    'export',
  ],
  props: {
    columns: { type: Array as PropType<LingyunTableColumn[]>, default: () => [] },
    data: { type: Array as PropType<LingyunTableRow[]>, default: () => [] },
    rowKey: { type: String, default: 'id' },
    /**
     * 表体高度。传入像素时表体固定为这个高度。
     * 不传时表格占满外层：外层有高度就用外层高度，否则用页面高度。表体在这块区域里滚动。
     */
    height: { type: [Number, String], default: '' },
    stripe: { type: Boolean, default: false },
    /** 单元格竖线，颜色用分割线，不是表格灰网格 */
    border: { type: Boolean, default: false },
    selection: { type: Boolean, default: false },
    selectedKeys: { type: Array as PropType<Array<string | number>>, default: () => [] },
    /** 0 表示不分页 */
    pageSize: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    /** remote 时用外部总数；本地用筛选后的行数 */
    total: { type: Number, default: 0 },
    /**
     * 为真时筛选、排序、分页都不在组件内处理。
     * 查询变化时抛 query-change，由外部异步拉数后回填 data 和 total。
     */
    remote: { type: Boolean, default: false },
    /** remote 请求进行中。空数据时占住表体并转圈，有数据时盖在当前页上 */
    loading: { type: Boolean, default: false },
    /** 标题栏标题。和 icon、工具按钮、tools 插槽任一有值就显示标题栏 */
    title: { type: String, default: '' },
    /** 标题栏图标，取 lingyun-icon 的 type */
    icon: { type: String, default: '' },
    /** 标题栏右侧刷新 */
    showRefresh: { type: Boolean, default: false },
    /** 标题栏右侧选择列 */
    columnPicker: { type: Boolean, default: false },
    /** 标题栏右侧导出 Excel */
    exportExcel: { type: Boolean, default: false },
    emptyText: { type: String, default: '暂无数据' },
  },
  data() {
    return {
      innerSelected: [] as string[],
      innerPage: 1,
      sortKey: '',
      sortOrder: '' as LingyunTableSortOrder,
      filterMap: {} as Record<string, string[]>,
      openFilterKey: '',
      headLeft: 0,
      bodyLeft: 0,
      bodyTop: 0,
      leftTop: 0,
      rightTop: 0,
      syncSource: '',
      syncTimer: 0,
      pressedKey: '',
      pressTimer: 0,
      pressLeft: 0,
      pressTop: 0,
      viewportBodyPx: 0,
      viewportCenterPx: 0,
      fillHeightPx: 0,
      fillMode: '' as '' | 'page' | 'parent',
      rowStart: 0,
      rowEnd: 0,
      colStart: 0,
      colEnd: 0,
      colPadLeft: 0,
      colPadRight: 0,
      centerClientPx: 0,
      hBarTimer: 0,
      hDragging: false,
      hDragX: 0,
      hDragLeft: 0,
      vDragging: false,
      vDragY: 0,
      vDragTop: 0,
      vDragMove: null as ((event: MouseEvent) => void) | null,
      vDragUp: null as (() => void) | null,
      hiddenKeys: [] as string[],
      columnPickerOpen: false,
      onResize: null as (() => void) | null,
      hDragMove: null as ((event: MouseEvent) => void) | null,
      hDragUp: null as (() => void) | null,
      centerTouchX: 0,
      centerTouchY: 0,
      centerTouchLeft: 0,
      centerTouchTop: 0,
      centerTouchAxis: '' as '' | 'x' | 'y',
      centerMoved: false,
      glideSamples: [] as Array<{ x: number; y: number; t: number }>,
      glideTimer: 0,
      glideV: 0,
      glideAt: 0,
      gliding: false,
      pageHoldTop: -1,
    }
  },
  computed: {
    rootClass(): string[] {
      return [
        this.stripe ? 'lingyun-table--stripe' : '',
        this.border ? 'lingyun-table--border' : '',
        this.fixed ? 'lingyun-table--fixed' : 'lingyun-table--fill',
      ].filter(Boolean)
    },
    fixed(): boolean {
      return parseHeight(this.height) > 0
    },
    fillStyle(): Record<string, string> {
      if (this.fixed || this.fillHeightPx <= 0) return {}
      return { height: `${this.fillHeightPx}px` }
    },
    pickerScrollStyle(): Record<string, string> {
      const count = (this.columns || []).length
      const height = Math.min(280, Math.max(44, count * 44))
      return { height: `${height}px` }
    },
    bodyHeightPx(): number {
      if (this.fixed) return parseHeight(this.height)
      return this.viewportBodyPx
    },
    contentHeightPx(): number {
      return this.pageRows.length * ROW_H
    },
    rowPadTop(): number {
      return this.rowStart * ROW_H
    },
    rowPadBottom(): number {
      return Math.max(0, this.pageRows.length - this.rowEnd) * ROW_H
    },
    rowPadTopStyle(): Record<string, string> {
      return { height: `${this.rowPadTop}px` }
    },
    rowPadBottomStyle(): Record<string, string> {
      return { height: `${this.rowPadBottom}px` }
    },
    rowTrackStyle(): Record<string, string> {
      return { height: `${this.contentHeightPx}px` }
    },
    centerTrackStyle(): Record<string, string> {
      return { width: `${this.centerWidth}px`, height: `${this.contentHeightPx}px` }
    },
    colPadLeftStyle(): Record<string, string> {
      return { width: `${this.colPadLeft}px` }
    },
    colPadRightStyle(): Record<string, string> {
      return { width: `${this.colPadRight}px` }
    },
    visibleRows(): Array<{ row: LingyunTableRow; index: number }> {
      const rows = this.pageRows
      const end = Math.min(this.rowEnd, rows.length)
      const items: Array<{ row: LingyunTableRow; index: number }> = []
      for (let i = this.rowStart; i < end; i += 1) items.push({ row: rows[i], index: i })
      return items
    },
    visibleCenterColumns(): ResolvedColumn[] {
      const cols = this.centerColumns
      const end = Math.min(this.colEnd, cols.length)
      if (this.colStart <= 0 && end >= cols.length) return cols
      return cols.slice(this.colStart, end)
    },
    /** 小程序把作用域插槽编成 cell-行号-列号。左中右三块各自从 0 编号会撞成 cell-0-0，这里用空位把列号错开 */
    centerSlotColumns(): Array<ResolvedColumn | null> {
      const cols: Array<ResolvedColumn | null> = []
      for (let i = 0; i < this.leftColumns.length; i += 1) cols.push(null)
      this.visibleCenterColumns.forEach((col) => cols.push(col))
      return cols
    },
    rightSlotColumns(): Array<ResolvedColumn | null> {
      const pad = this.leftColumns.length + this.centerColumns.length
      const cols: Array<ResolvedColumn | null> = []
      for (let i = 0; i < pad; i += 1) cols.push(null)
      this.rightColumns.forEach((col) => cols.push(col))
      return cols
    },
    resolvedColumns(): ResolvedColumn[] {
      const hidden = this.hiddenKeys
      return (this.columns || [])
        .filter((col) => hidden.indexOf(col.key) < 0)
        .map((col) => ({
          ...col,
          widthPx: columnWidth(col.type === 'index' ? (col.width ?? 64) : col.width),
          side: columnSide(col.fixed),
        }))
    },
    leftColumns(): ResolvedColumn[] {
      return this.resolvedColumns.filter((col) => col.side === 'left')
    },
    rightColumns(): ResolvedColumn[] {
      return this.resolvedColumns.filter((col) => col.side === 'right')
    },
    centerColumns(): ResolvedColumn[] {
      return this.resolvedColumns.filter((col) => col.side === 'center')
    },
    leftWidth(): number {
      const cols = this.leftColumns.reduce((sum, col) => sum + col.widthPx, 0)
      return cols + (this.selection ? CHECK_W : 0)
    },
    rightWidth(): number {
      return this.rightColumns.reduce((sum, col) => sum + col.widthPx, 0)
    },
    centerWidth(): number {
      const width = this.centerColumns.reduce((sum, col) => sum + col.widthPx, 0)
      return width || COL_W
    },
    centerRowStyle(): Record<string, string> {
      return { width: `${this.centerWidth}px` }
    },
    mpHeadRowStyle(): Record<string, string> {
      return {
        width: `${this.centerWidth}px`,
        transform: `translate3d(${-this.headLeft}px, 0, 0)`,
      }
    },
    mpBodyTrackStyle(): Record<string, string> {
      const y = this.rowPadTop - this.bodyTop
      return {
        width: `${this.centerWidth}px`,
        height: `${this.contentHeightPx}px`,
        transform: `translate3d(${-this.bodyLeft}px, ${y}px, 0)`,
      }
    },
    centerViewPx(): number {
      if (this.centerClientPx > 0) return this.centerClientPx
      return this.viewportCenterPx
    },
    hBarNeeded(): boolean {
      const view = this.centerViewPx
      return view > 0 && this.centerWidth > view + 1
    },
    vBarNeeded(): boolean {
      return this.bodyHeightPx > 0 && this.contentHeightPx > this.bodyHeightPx + 1
    },
    hBarTrackPx(): number {
      // 竖条在整表最右侧，横条只铺中间区，不再给竖条让位
      return Math.max(0, this.centerViewPx)
    },
    vBarTrackPx(): number {
      const gutter = this.hBarNeeded ? 20 : 0
      return Math.max(0, this.bodyHeightPx - gutter)
    },
    hBarStyle(): Record<string, string> {
      return {
        left: `${this.leftWidth}px`,
        width: `${this.hBarTrackPx}px`,
      }
    },
    vBarStyle(): Record<string, string> {
      return {
        top: '0',
        right: '0',
        height: `${this.vBarTrackPx}px`,
      }
    },
    hThumbStyle(): Record<string, string> {
      const track = this.hBarTrackPx
      const content = Math.max(this.centerWidth, this.centerViewPx)
      const max = Math.max(0, content - this.centerViewPx)
      const thumb = Math.max(40, Math.round((track * this.centerViewPx) / content))
      const travel = Math.max(1, track - thumb)
      const x = max <= 0 ? 0 : Math.round((this.bodyLeft / max) * travel)
      return { width: `${thumb}px`, transform: `translateX(${x}px)` }
    },
    vThumbStyle(): Record<string, string> {
      const track = this.vBarTrackPx
      const content = Math.max(this.contentHeightPx, this.bodyHeightPx)
      const max = Math.max(0, content - this.bodyHeightPx)
      const thumb = Math.max(40, Math.round((track * this.bodyHeightPx) / content))
      const travel = Math.max(1, track - thumb)
      const y = max <= 0 ? 0 : Math.round((this.bodyTop / max) * travel)
      return { height: `${thumb}px`, transform: `translateY(${y}px)` }
    },
    bodyBoxStyle(): Record<string, string> {
      if (this.fixed && this.bodyHeightPx > 0) return { height: `${this.bodyHeightPx}px` }
      if (this.fixed) return { height: '0px' }
      return { flex: '1', height: '0', minHeight: '0' }
    },
    bodyScrollStyle(): Record<string, string> {
      if (this.fixed && this.bodyHeightPx > 0) return { height: `${this.bodyHeightPx}px` }
      // 小程序 scroll-view 要用明确像素。H5 用 100%，跟着表体，给分页留出位置
      // #ifdef MP-WEIXIN
      if (this.bodyHeightPx > 0) return { height: `${this.bodyHeightPx}px` }
      // #endif
      return { height: '100%' }
    },
    filteredRows(): LingyunTableRow[] {
      const rows = this.data || []
      if (this.remote) return rows.slice()
      const map = this.filterMap
      return rows.filter((row) => {
        const keys = Object.keys(map)
        for (let i = 0; i < keys.length; i += 1) {
          const key = keys[i]
          const picked = map[key]
          if (!picked || !picked.length) continue
          if (picked.indexOf(String(row[key] ?? '')) < 0) return false
        }
        return true
      })
    },
    sortedRows(): LingyunTableRow[] {
      const rows = this.filteredRows.slice()
      if (this.remote || !this.sortKey || !this.sortOrder) return rows
      const key = this.sortKey
      const dir = this.sortOrder === 'asc' ? 1 : -1
      rows.sort((a, b) => compareValue(a[key], b[key]) * dir)
      return rows
    },
    totalCount(): number {
      if (this.remote) return this.total > 0 ? this.total : 0
      return this.sortedRows.length
    },
    showPager(): boolean {
      return this.pageSize > 0 && this.totalCount > 0
    },
    pageCount(): number {
      if (!this.showPager) return 1
      return Math.max(1, Math.ceil(this.totalCount / this.pageSize))
    },
    currentPage(): number {
      return Math.min(this.pageCount, Math.max(1, this.innerPage || 1))
    },
    pageRows(): LingyunTableRow[] {
      if (this.remote || !this.showPager) return this.sortedRows
      const start = (this.currentPage - 1) * this.pageSize
      return this.sortedRows.slice(start, start + this.pageSize)
    },
    pageKeys(): string[] {
      return this.pageRows.map((row) => this.keyOf(row)).filter(Boolean)
    },
    pageAll(): boolean {
      return this.pageKeys.length > 0 && this.pageKeys.every((key) => this.innerSelected.indexOf(key) >= 0)
    },
    pageSome(): boolean {
      if (this.pageAll) return false
      return this.pageKeys.some((key) => this.innerSelected.indexOf(key) >= 0)
    },
    pageCheckClass(): Record<string, boolean> {
      return {
        'lingyun-table__check--on': this.pageAll,
        'lingyun-table__check--some': this.pageSome,
      }
    },
    openColumn(): ResolvedColumn | null {
      if (!this.openFilterKey) return null
      return this.resolvedColumns.find((col) => col.key === this.openFilterKey) || null
    },
    activeFilterValues(): string[] {
      if (!this.openFilterKey) return []
      return this.filterMap[this.openFilterKey] || []
    },
  },
  watch: {
    page: {
      immediate: true,
      handler(value: number) {
        this.innerPage = value || 1
      },
    },
    selectedKeys: {
      immediate: true,
      handler(value: Array<string | number>) {
        this.innerSelected = (value || []).map((item) => String(item))
      },
    },
    pageRows() {
      this.syncRowWindow(this.bodyTop)
    },
    centerColumns() {
      this.syncColWindow(this.bodyLeft)
    },
    loading() {
      this.$nextTick(() => this.measureViewport())
    },
    total() {
      this.$nextTick(() => this.measureViewport())
    },
    pageSize() {
      this.$nextTick(() => this.measureViewport())
    },
    openFilterKey() {
      this.$nextTick(() => this.measureViewport())
    },
  },
  created() {
    this.syncRowWindow(0)
    this.syncColWindow(0)
    const section = findSectionMarkHost(this.$parent)
    if (!section) return
    ;(this as unknown as { embeddedSection?: SectionMarkHost }).embeddedSection = section
    section.markEmbeddedList?.(true)
  },
  mounted() {
    if (this.remote) this.emitQuery()
    this.measureViewport()
    this.onResize = () => {
      if (!this.fixed && this.fillMode === 'page') {
        const info = uni.getWindowInfo()
        const pageH = info && info.windowHeight ? Math.round(info.windowHeight) : 0
        if (pageH > 0) this.fillHeightPx = pageH
      }
      if (!this.fixed && this.fillMode === 'parent') {
        const parentH = this.parentBoxHeight()
        if (parentH >= 80) this.fillHeightPx = parentH
      }
      this.measureViewport()
    }
    uni.onWindowResize(this.onResize)
  },
  beforeUnmount() {
    const section = (this as unknown as { embeddedSection?: SectionMarkHost }).embeddedSection
    section?.markEmbeddedList?.(false)
    this.detachHBarDrag()
    this.detachVBarDrag()
    if (this.syncTimer) clearTimeout(this.syncTimer)
    if (this.pressTimer) clearTimeout(this.pressTimer)
    if (this.hBarTimer) clearTimeout(this.hBarTimer)
    this.stopGlide()
    if (this.onResize) uni.offWindowResize(this.onResize)
  },
  methods: {
    sideStyle(width: number): Record<string, string> {
      return { width: `${width}px` }
    },
    sideScrollStyle(width: number): Record<string, string> {
      let height = '100%'
      if (this.fixed && this.bodyHeightPx > 0) height = `${this.bodyHeightPx}px`
      // #ifdef MP-WEIXIN
      if (!this.fixed && this.bodyHeightPx > 0) height = `${this.bodyHeightPx}px`
      // #endif
      return { width: `${width}px`, height }
    },
    guessCenterWidth(): number {
      const info = uni.getWindowInfo()
      const width = info && info.windowWidth ? info.windowWidth : 375
      return Math.max(COL_W, width - this.leftWidth - this.rightWidth)
    },
    syncRowWindow(top: number) {
      const total = this.pageRows.length
      const view = this.bodyHeightPx > 0 ? this.bodyHeightPx : ROW_H * 12
      let start = Math.floor(top / ROW_H) - ROW_OVERSCAN
      if (start < 0) start = 0
      let end = Math.ceil((top + view) / ROW_H) + ROW_OVERSCAN
      if (end > total) end = total
      if (start > end) start = end
      if (this.rowStart !== start) this.rowStart = start
      if (this.rowEnd !== end) this.rowEnd = end
    },
    syncColWindow(left: number) {
      const cols = this.centerColumns
      const view = this.viewportCenterPx > 0 ? this.viewportCenterPx : this.guessCenterWidth()
      const startX = Math.max(0, left - COL_OVERSCAN)
      const endX = left + view + COL_OVERSCAN
      let x = 0
      let start = 0
      let end = 0
      let padLeft = 0
      let padRight = 0
      let started = false
      for (let i = 0; i < cols.length; i += 1) {
        const width = cols[i].widthPx
        const right = x + width
        if (right <= startX) {
          padLeft += width
          start = i + 1
        } else if (x >= endX) {
          padRight += width
        } else {
          started = true
          end = i + 1
        }
        x = right
      }
      if (!started) {
        start = 0
        end = cols.length
        padLeft = 0
        padRight = 0
      }
      if (this.colStart !== start) this.colStart = start
      if (this.colEnd !== end) this.colEnd = end
      if (this.colPadLeft !== padLeft) this.colPadLeft = padLeft
      if (this.colPadRight !== padRight) this.colPadRight = padRight
    },
    parentBoxHeight(): number {
      const el = this.$el as HTMLElement | undefined
      const parent = el && el.style ? el.parentElement : null
      if (!el || !parent || typeof parent.clientHeight !== 'number') return 0
      const prevPos = el.style.position
      const prevH = el.style.height
      el.style.position = 'absolute'
      el.style.height = '0px'
      const parentH = parent.clientHeight
      let siblingH = 0
      const children = parent.children
      for (let i = 0; i < children.length; i += 1) {
        const child = children[i] as HTMLElement
        if (child === el) continue
        siblingH += child.offsetHeight || 0
      }
      el.style.position = prevPos
      el.style.height = prevH
      if (parentH >= 80 && parentH - siblingH >= 40) return Math.round(parentH)
      return 0
    },
    measureViewport() {
      const query = uni.createSelectorQuery().in(this as never)
      query.select('.lingyun-table').boundingClientRect()
      query.select('.lingyun-table__body').boundingClientRect()
      query.select('.lingyun-table__x--body').boundingClientRect()
      query.exec((rects) => {
        const list = (rects || []) as Array<{ height?: number; width?: number } | null>
        this.applyViewport(list[0], list[1], list[2])
      })
    },
    applyViewport(
      table: { height?: number; width?: number } | null,
      body: { height?: number } | null,
      center: { width?: number } | null,
    ) {
      const tableW = table && table.width ? Math.round(table.width) : 0
      if (tableW > 1) {
        const pane = Math.max(1, tableW - this.leftWidth - this.rightWidth)
        if (this.viewportCenterPx !== pane) this.viewportCenterPx = pane
      } else if (center && center.width && center.width > 1) {
        const width = Math.round(center.width)
        if (this.viewportCenterPx !== width) this.viewportCenterPx = width
      }
      const client = this.readCenterClient()
      if (client > 0 && this.centerClientPx !== client) this.centerClientPx = client
      this.syncColWindow(this.bodyLeft)
      if (this.fixed) {
        this.syncRowWindow(this.bodyTop)
        return
      }
      const bodyH = body && body.height ? Math.round(body.height) : 0
      const tableH = table && table.height ? Math.round(table.height) : 0
      if ((this.fillMode === 'page' || this.fillMode === 'parent') && this.fillHeightPx > 0) {
        const room = Math.max(48, this.fillHeightPx - this.chromeHeight())
        const next = bodyH >= 48 && bodyH <= room + 8 ? bodyH : room
        if (this.viewportBodyPx !== next) this.viewportBodyPx = next
        this.syncRowWindow(this.bodyTop)
        return
      }
      const parentH = this.parentBoxHeight()
      if (parentH >= 80 && bodyH >= 48) {
        this.fillMode = 'parent'
        if (this.viewportBodyPx !== bodyH) this.viewportBodyPx = bodyH
        this.syncRowWindow(this.bodyTop)
        return
      }
      if (parentH >= 80) {
        this.fillMode = 'parent'
        if (this.fillHeightPx !== parentH) this.fillHeightPx = parentH
        this.$nextTick(() => this.measureViewport())
        return
      }
      const contentH = this.intrinsicHeight()
      if (tableH >= 80 && Math.abs(tableH - contentH) > 12) {
        this.fillMode = 'parent'
        if (this.fillHeightPx !== tableH) this.fillHeightPx = tableH
        const room = Math.max(48, tableH - this.chromeHeight())
        const next = bodyH >= 48 && bodyH <= room + 8 ? bodyH : room
        if (this.viewportBodyPx !== next) this.viewportBodyPx = next
        this.syncRowWindow(this.bodyTop)
        return
      }
      const info = uni.getWindowInfo()
      const pageH = info && info.windowHeight ? Math.round(info.windowHeight) : 0
      if (pageH > 0 && (this.fillMode !== 'page' || this.fillHeightPx !== pageH)) {
        this.fillMode = 'page'
        this.fillHeightPx = pageH
        this.$nextTick(() => this.measureViewport())
      }
    },
    centerClipStyle(part: 'head' | 'body'): Record<string, string> {
      const style: Record<string, string> = {}
      if (this.viewportCenterPx > 0) style.width = `${this.viewportCenterPx}px`
      if (part === 'head') style.height = '44px'
      else if (this.bodyHeightPx > 0) style.height = `${this.bodyHeightPx}px`
      return style
    },
    chromeHeight(): number {
      let height = 44
      if (this.showToolbar()) height += 52
      if (this.openColumn) height += 40
      if (this.showPager) height += 48
      return height
    },
    intrinsicHeight(): number {
      const rows = this.pageRows.length
      return this.chromeHeight() + (rows > 0 ? rows * 52 : 120)
    },
    cellStyle(col: ResolvedColumn): Record<string, string> {
      const align = col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start'
      return { width: `${col.widthPx}px`, justifyContent: align }
    },
    rowClass(index: number, row: LingyunTableRow): Record<string, boolean> {
      const key = this.keyOf(row)
      return {
        'lingyun-table__row--alt': this.stripe && index % 2 === 1,
        'lingyun-table__row--hover': !!key && this.pressedKey === key,
        'lingyun-table__row--last': index === this.pageRows.length - 1 && this.contentHeightPx < this.bodyHeightPx,
      }
    },
    onRowPress(row: LingyunTableRow) {
      if (this.pressTimer) {
        clearTimeout(this.pressTimer)
        this.pressTimer = 0
      }
      this.pressedKey = this.keyOf(row)
      this.pressLeft = this.bodyLeft
      this.pressTop = this.bodyTop
    },
    onRowRelease() {
      if (this.pressTimer) clearTimeout(this.pressTimer)
      this.pressTimer = setTimeout(() => {
        this.pressedKey = ''
        this.pressTimer = 0
      }, 80) as unknown as number
    },
    clearPressIfScrolled(left: number, top: number) {
      if (!this.pressedKey) return
      if (Math.abs(left - this.pressLeft) <= 8 && Math.abs(top - this.pressTop) <= 8) return
      this.pressedKey = ''
      if (this.pressTimer) {
        clearTimeout(this.pressTimer)
        this.pressTimer = 0
      }
    },
    queryPayload(): LingyunTableQuery {
      const filters: Record<string, string[]> = {}
      const map = this.filterMap
      Object.keys(map).forEach((key) => {
        filters[key] = (map[key] || []).slice()
      })
      return {
        page: this.currentPage,
        pageSize: this.pageSize,
        filters,
        sortKey: this.sortKey,
        sortOrder: this.sortOrder,
      }
    },
    emitQuery() {
      if (!this.remote) return
      this.$emit('query-change', this.queryPayload())
    },
    keyOf(row: LingyunTableRow): string {
      const value = row[this.rowKey]
      if (value == null || value === '') return ''
      return String(value)
    },
    cellValue(row: LingyunTableRow, col: ResolvedColumn, index = 0): unknown {
      if (col.type === 'index') return this.rowNo(index)
      return row[col.key]
    },
    cellText(row: LingyunTableRow, col: ResolvedColumn, index = 0): string {
      if (col.type === 'index') return String(this.rowNo(index))
      const value = row[col.key]
      if (col.formatter) return col.formatter(value, row)
      if (value == null) return ''
      return String(value)
    },
    rowNo(index: number): number {
      const size = this.pageSize > 0 ? this.pageSize : 0
      const base = size > 0 ? (this.currentPage - 1) * size : 0
      return base + index + 1
    },
    showToolbar(): boolean {
      return !!(this.title || this.icon || this.showRefresh || this.columnPicker || this.exportExcel || this.$slots.tools)
    },
    columnShown(key: string): boolean {
      return this.hiddenKeys.indexOf(key) < 0
    },
    toggleColumn(key: string) {
      if (this.columnShown(key)) {
        const visible = (this.columns || []).filter((col) => this.columnShown(col.key))
        if (visible.length <= 1) return
        this.hiddenKeys = this.hiddenKeys.concat(key)
        if (this.openFilterKey === key) this.openFilterKey = ''
        return
      }
      this.hiddenKeys = this.hiddenKeys.filter((item) => item !== key)
    },
    onRefresh() {
      this.$emit('refresh', this.queryPayload())
    },
    onExportExcel() {
      const filename = sanitizeFileName(this.title || '表格')
      this.saveExcel(this.buildExcelXml(), filename)
      this.$emit('export', { filename: `${filename}.xls` })
    },
    buildExcelXml(): string {
      const cols = this.resolvedColumns
      const rows = this.sortedRows
      const head = cols.map((col) => excelCell(col.title || col.key, false)).join('')
      const body = rows
        .map((row, index) => {
          const cells = cols.map((col) => {
            if (col.type === 'index') return excelCell(String(index + 1), true)
            const value = row[col.key]
            const text = col.formatter ? col.formatter(value, row) : value == null ? '' : String(value)
            const numeric = typeof value === 'number' && Number.isFinite(value) && !col.formatter
            return excelCell(text, numeric)
          })
          return `<Row>${cells.join('')}</Row>`
        })
        .join('')
      const sheet = sanitizeFileName(this.title || 'Sheet1').slice(0, 31)
      return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="${escapeXml(sheet)}"><Table><Row>${head}</Row>${body}</Table></Worksheet>
</Workbook>`
    },
    saveExcel(xml: string, filename: string) {
      const file = `${filename}.xls`
      // #ifdef H5
      const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file
      link.click()
      URL.revokeObjectURL(url)
      // #endif
      // #ifndef H5
      const fs = uni.getFileSystemManager()
      const root = (uni as unknown as { env?: { USER_DATA_PATH?: string } }).env?.USER_DATA_PATH || ''
      if (!root) {
        uni.showToast({ title: '当前端不能保存文件', icon: 'none' })
        return
      }
      fs.writeFile({
        filePath: `${root}/${file}`,
        data: xml,
        encoding: 'utf8',
        success: () => {
          uni.openDocument({
            filePath: `${root}/${file}`,
            fileType: 'xls',
            showMenu: true,
            fail: () => {
              uni.showToast({ title: '已保存，无法打开', icon: 'none' })
            },
          })
        },
        fail: () => {
          uni.showToast({ title: '导出失败', icon: 'none' })
        },
      })
      // #endif
    },
    isSelected(row: LingyunTableRow): boolean {
      const key = this.keyOf(row)
      return !!key && this.innerSelected.indexOf(key) >= 0
    },
    emitSelection(next: string[]) {
      this.innerSelected = next
      this.$emit('update:selectedKeys', next)
      this.$emit('selection-change', next)
    },
    toggleRow(row: LingyunTableRow) {
      const key = this.keyOf(row)
      if (!key) return
      const next = this.innerSelected.slice()
      const index = next.indexOf(key)
      if (index >= 0) next.splice(index, 1)
      else next.push(key)
      this.emitSelection(next)
    },
    togglePage() {
      const keys = this.pageKeys
      if (!keys.length) return
      let next = this.innerSelected.slice()
      if (this.pageAll) next = next.filter((key) => keys.indexOf(key) < 0)
      else keys.forEach((key) => { if (next.indexOf(key) < 0) next.push(key) })
      this.emitSelection(next)
    },
    sortMark(col: ResolvedColumn): string {
      if (this.sortKey !== col.key || !this.sortOrder) return '↕'
      return this.sortOrder === 'asc' ? '↑' : '↓'
    },
    sortClass(col: ResolvedColumn): string {
      return this.sortKey === col.key && this.sortOrder ? 'lingyun-table__sort--on' : ''
    },
    onSort(col: ResolvedColumn) {
      if (!col.sortable) return
      let order: LingyunTableSortOrder = 'asc'
      if (this.sortKey === col.key) {
        order = this.sortOrder === 'asc' ? 'desc' : this.sortOrder === 'desc' ? '' : 'asc'
      }
      this.sortKey = order ? col.key : ''
      this.sortOrder = order
      this.$emit('sort-change', { key: this.sortKey, order })
      this.emitQuery()
    },
    filterOn(col: ResolvedColumn): boolean {
      const picked = this.filterMap[col.key]
      return this.openFilterKey === col.key || !!(picked && picked.length)
    },
    toggleFilter(col: ResolvedColumn) {
      this.openFilterKey = this.openFilterKey === col.key ? '' : col.key
    },
    filterPicked(key: string, value: string | number): boolean {
      const picked = this.filterMap[key] || []
      return picked.indexOf(String(value)) >= 0
    },
    emitFilter(key: string) {
      this.innerPage = 1
      this.$emit('update:page', 1)
      this.$emit('filter-change', { key, values: this.filterMap[key] || [], filters: { ...this.filterMap } })
      this.emitQuery()
    },
    clearFilter(key: string) {
      this.filterMap = { ...this.filterMap, [key]: [] }
      this.emitFilter(key)
    },
    pickFilter(key: string, value: string | number) {
      const token = String(value)
      const current = (this.filterMap[key] || []).slice()
      const index = current.indexOf(token)
      if (index >= 0) current.splice(index, 1)
      else current.push(token)
      this.filterMap = { ...this.filterMap, [key]: current }
      this.emitFilter(key)
    },
    goPage(next: number) {
      const page = Math.min(this.pageCount, Math.max(1, next))
      if (page === this.currentPage) return
      this.innerPage = page
      this.bodyTop = 0
      this.leftTop = 0
      this.rightTop = 0
      this.$emit('update:page', page)
      this.$emit('page-change', page)
      this.emitQuery()
    },
    onRowClick(row: LingyunTableRow) {
      if (this.centerMoved) return
      this.$emit('row-click', row)
    },
    armSync(source: string) {
      this.syncSource = source
      if (this.syncTimer) clearTimeout(this.syncTimer)
      this.syncTimer = setTimeout(() => {
        this.syncSource = ''
        this.syncTimer = 0
      }, 80) as unknown as number
    },
    readCenterClient(): number {
      const el = this.$el as HTMLElement | undefined
      if (!el || typeof el.querySelectorAll !== 'function') return 0
      const nodes = el.querySelectorAll('.lingyun-table__x--body .uni-scroll-view')
      const scroller = nodes[nodes.length - 1] as HTMLElement | undefined
      if (!scroller || !scroller.clientWidth) return 0
      return scroller.clientWidth
    },
    revealHBar(_show?: boolean) {
      // H5 悬浮条常显，这里只用来刷新中间可视宽度
      // #ifdef H5
      const client = this.readCenterClient()
      if (client > 0 && this.centerClientPx !== client) this.centerClientPx = client
      // #endif
    },
    nativePointer(event: unknown): { x: number; y: number; target: Element | null; preventDefault?: () => void } {
      const raw = event as {
        $event?: MouseEvent & { touches?: TouchList; changedTouches?: TouchList }
        touches?: TouchList
        changedTouches?: TouchList
        clientX?: number
        clientY?: number
        pageX?: number
        pageY?: number
        target?: EventTarget | null
        currentTarget?: EventTarget | null
        preventDefault?: () => void
      }
      const native = raw?.$event || raw
      const touch =
        (native.touches && native.touches[0]) ||
        (native.changedTouches && native.changedTouches[0]) ||
        null
      const x = Number((touch && (touch.clientX || touch.pageX)) || native.clientX || native.pageX || 0)
      const y = Number((touch && (touch.clientY || touch.pageY)) || native.clientY || native.pageY || 0)
      const target = (native.currentTarget || native.target || null) as Element | null
      return { x, y, target, preventDefault: native.preventDefault?.bind(native) }
    },
    findBarEl(start: Element | null, className: string): HTMLElement | null {
      let node: Element | null = start
      while (node) {
        if (node instanceof HTMLElement && node.classList.contains(className)) return node
        node = node.parentElement
      }
      return null
    },
    pointerX(event: unknown): number {
      return this.nativePointer(event).x
    },
    pointerY(event: unknown): number {
      return this.nativePointer(event).y
    },
    onHBarStart(event: unknown) {
      // #ifdef H5
      const point = this.nativePointer(event)
      point.preventDefault?.()
      const bar = this.findBarEl(point.target, 'lingyun-table__hbar')
      const track = this.hBarTrackPx
      const view = this.centerViewPx
      const content = Math.max(this.centerWidth, view)
      const max = Math.max(0, content - view)
      const thumb = Math.max(40, Math.round((track * view) / content))
      const travel = Math.max(1, track - thumb)
      if (bar && max > 0) {
        const rect = bar.getBoundingClientRect()
        const x = point.x - rect.left
        const thumbLeft = (this.bodyLeft / max) * travel
        if (x < thumbLeft || x > thumbLeft + thumb) {
          const ratio = Math.min(1, Math.max(0, (x - thumb / 2) / travel))
          this.scrollCenterTo(ratio * max)
        }
      }
      this.hDragging = true
      this.hDragX = point.x
      this.hDragLeft = this.bodyLeft
      if (typeof document === 'undefined') return
      this.detachHBarDrag()
      const move = (e: MouseEvent) => this.onHBarMove(e)
      const up = () => {
        this.detachHBarDrag()
        this.onHBarEnd()
      }
      this.hDragMove = move
      this.hDragUp = up
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
      // #endif
    },
    onHBarMove(event: unknown) {
      if (!this.hDragging) return
      const track = this.hBarTrackPx
      const view = this.centerViewPx
      const content = Math.max(this.centerWidth, view)
      const max = Math.max(0, content - view)
      const thumb = Math.max(40, (track * view) / content)
      const travel = Math.max(1, track - thumb)
      const next = this.hDragLeft + (this.pointerX(event) - this.hDragX) * (max / travel)
      this.scrollCenterTo(Math.min(max, Math.max(0, next)))
    },
    onHBarEnd() {
      this.hDragging = false
    },
    detachHBarDrag() {
      if (typeof document === 'undefined') return
      if (this.hDragMove) document.removeEventListener('mousemove', this.hDragMove)
      if (this.hDragUp) document.removeEventListener('mouseup', this.hDragUp)
      this.hDragMove = null
      this.hDragUp = null
    },
    onVBarStart(event: unknown) {
      // #ifdef H5
      const point = this.nativePointer(event)
      point.preventDefault?.()
      const bar = this.findBarEl(point.target, 'lingyun-table__vbar')
      const track = this.vBarTrackPx
      const view = this.bodyHeightPx
      const content = Math.max(this.contentHeightPx, view)
      const max = Math.max(0, content - view)
      const thumb = Math.max(40, Math.round((track * view) / content))
      const travel = Math.max(1, track - thumb)
      if (bar && max > 0) {
        const rect = bar.getBoundingClientRect()
        const y = point.y - rect.top
        const thumbTop = (this.bodyTop / max) * travel
        if (y < thumbTop || y > thumbTop + thumb) {
          const ratio = Math.min(1, Math.max(0, (y - thumb / 2) / travel))
          this.scrollBodyTo(ratio * max)
        }
      }
      this.vDragging = true
      this.vDragY = point.y
      this.vDragTop = this.bodyTop
      if (typeof document === 'undefined') return
      this.detachVBarDrag()
      const move = (e: MouseEvent) => this.onVBarMove(e)
      const up = () => {
        this.detachVBarDrag()
        this.onVBarEnd()
      }
      this.vDragMove = move
      this.vDragUp = up
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
      // #endif
    },
    onVBarMove(event: unknown) {
      if (!this.vDragging) return
      const track = this.vBarTrackPx
      const view = this.bodyHeightPx
      const content = Math.max(this.contentHeightPx, view)
      const max = Math.max(0, content - view)
      const thumb = Math.max(40, (track * view) / content)
      const travel = Math.max(1, track - thumb)
      const next = this.vDragTop + (this.pointerY(event) - this.vDragY) * (max / travel)
      this.scrollBodyTo(Math.min(max, Math.max(0, next)))
    },
    onVBarEnd() {
      this.vDragging = false
    },
    detachVBarDrag() {
      if (typeof document === 'undefined') return
      if (this.vDragMove) document.removeEventListener('mousemove', this.vDragMove)
      if (this.vDragUp) document.removeEventListener('mouseup', this.vDragUp)
      this.vDragMove = null
      this.vDragUp = null
    },
    scrollCenterTo(left: number) {
      this.syncColWindow(left)
      this.bodyLeft = left
      this.headLeft = left
      this.armSync('body')
    },
    onCenterTouchStart(event: { touches?: Array<{ clientX?: number; pageX?: number; clientY?: number; pageY?: number }>; timeStamp?: number }) {
      const touch = event.touches && event.touches[0]
      if (!touch) return
      this.stopGlide()
      this.glideSamples = []
      this.centerTouchX = touch.clientX || touch.pageX || 0
      this.centerTouchY = touch.clientY || touch.pageY || 0
      this.centerTouchLeft = this.bodyLeft
      this.centerTouchTop = this.bodyTop
      this.centerTouchAxis = ''
      this.noteGlideSample(event)
    },
    onCenterTouchMove(event: { touches?: Array<{ clientX?: number; pageX?: number; clientY?: number; pageY?: number }>; timeStamp?: number }) {
      const touch = event.touches && event.touches[0]
      if (!touch) return
      const x = touch.clientX || touch.pageX || 0
      const y = touch.clientY || touch.pageY || 0
      const dx = x - this.centerTouchX
      const dy = y - this.centerTouchY
      if (!this.centerTouchAxis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
        this.centerTouchAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        this.centerMoved = true
      }
      this.noteGlideSample(event)
      if (this.centerTouchAxis === 'x') {
        const view = this.centerViewPx
        const max = Math.max(0, this.centerWidth - view)
        const left = Math.min(max, Math.max(0, this.centerTouchLeft - dx))
        this.scrollCenterTo(left)
        this.revealHBar(true)
        return
      }
      this.scrollBodyTo(this.centerTouchTop - dy)
    },
    onCenterTouchEnd(event?: { changedTouches?: Array<{ clientX?: number; pageX?: number; clientY?: number; pageY?: number }>; timeStamp?: number }) {
      if (event && event.changedTouches && event.changedTouches.length) {
        this.noteGlideSample({ touches: event.changedTouches, timeStamp: event.timeStamp })
      }
      const moved = this.centerMoved
      const axis = this.centerTouchAxis
      const speed = axis ? this.releaseGlideSpeed(axis) : 0
      if (axis && Math.abs(speed) >= 0.08) {
        this.gliding = true
        this.centerTouchAxis = ''
        this.startGlide(axis, speed)
      } else {
        this.centerTouchAxis = ''
        this.gliding = false
      }
      if (!moved) return
      setTimeout(() => {
        this.centerMoved = false
      }, 80)
    },
    noteGlideSample(event: { touches?: Array<{ clientX?: number; pageX?: number; clientY?: number; pageY?: number }>; timeStamp?: number }) {
      const touch = event.touches && event.touches[0]
      if (!touch) return
      const t = event.timeStamp || Date.now()
      const sample = {
        x: touch.clientX || touch.pageX || 0,
        y: touch.clientY || touch.pageY || 0,
        t,
      }
      const list = this.glideSamples
      list.push(sample)
      const keep = t - 100
      while (list.length > 1 && list[0].t < keep) list.shift()
    },
    releaseGlideSpeed(axis: 'x' | 'y'): number {
      const list = this.glideSamples
      if (list.length < 2) return 0
      const last = list[list.length - 1]
      let first = last
      for (let i = list.length - 1; i >= 0; i -= 1) {
        if (last.t - list[i].t > 90) break
        first = list[i]
      }
      const dt = last.t - first.t
      if (dt < 16) return 0
      const vx = (last.x - first.x) / dt
      const vy = (last.y - first.y) / dt
      return axis === 'x' ? -vx : -vy
    },
    scrollBodyTo(top: number) {
      const max = Math.max(0, this.contentHeightPx - this.bodyHeightPx)
      const next = Math.min(max, Math.max(0, top))
      this.bodyTop = next
      this.leftTop = next
      this.rightTop = next
      this.syncRowWindow(next)
      this.armSync('body')
    },
    stopGlide() {
      if (this.glideTimer) {
        clearTimeout(this.glideTimer)
        this.glideTimer = 0
      }
      this.gliding = false
      this.glideV = 0
    },
    startGlide(axis: 'x' | 'y', speed: number) {
      this.stopGlide()
      this.gliding = true
      this.glideV = Math.max(-2.8, Math.min(2.8, speed))
      this.glideAt = Date.now()
      const step = () => {
        if (!this.gliding) return
        const now = Date.now()
        const dt = Math.min(34, Math.max(1, now - this.glideAt))
        this.glideAt = now
        this.glideV *= Math.exp(-dt / 320)
        const delta = this.glideV * dt
        if (axis === 'x') {
          const before = this.bodyLeft
          const max = Math.max(0, this.centerWidth - this.centerViewPx)
          const next = Math.min(max, Math.max(0, before + delta))
          this.scrollCenterTo(next)
          this.revealHBar(true)
          if (Math.abs(next - before) < 0.5 || Math.abs(this.glideV) < 0.02) {
            this.stopGlide()
            return
          }
        } else {
          const before = this.bodyTop
          const max = Math.max(0, this.contentHeightPx - this.bodyHeightPx)
          const next = Math.min(max, Math.max(0, before + delta))
          this.scrollBodyTo(next)
          if (Math.abs(next - before) < 0.5 || Math.abs(this.glideV) < 0.02) {
            this.stopGlide()
            return
          }
        }
        this.glideTimer = setTimeout(step, 16) as unknown as number
      }
      this.glideTimer = setTimeout(step, 16) as unknown as number
    },
    onTablePointerEnter() {
      // #ifndef MP-WEIXIN
      return
      // #endif
      // #ifdef MP-WEIXIN
      uni.createSelectorQuery().selectViewport().scrollOffset((res) => {
        const top = res && typeof res.scrollTop === 'number' ? res.scrollTop : 0
        this.pageHoldTop = top
      }).exec()
      // #endif
    },
    onTableWheel(event: {
      deltaX?: number
      deltaY?: number
      shiftKey?: boolean
      detail?: { deltaX?: number; deltaY?: number; wheelDelta?: number; wheelDeltaY?: number; shiftKey?: boolean }
      preventDefault?: () => void
      stopPropagation?: () => void
    }) {
      // #ifndef MP-WEIXIN
      return
      // #endif
      // #ifdef MP-WEIXIN
      if (event.preventDefault) event.preventDefault()
      if (event.stopPropagation) event.stopPropagation()
      this.stopGlide()
      const detail = event.detail || {}
      let dx = detail.deltaX || event.deltaX || 0
      let dy = detail.deltaY || event.deltaY || 0
      if (!dx && !dy) {
        const legacy = detail.wheelDeltaY || detail.wheelDelta || 0
        if (legacy) dy = -legacy
      }
      const scale = (value: number) => {
        if (!value) return 0
        return Math.abs(value) < 10 ? Math.sign(value) * 48 : value
      }
      dx = scale(dx)
      dy = scale(dy)
      const shift = !!(event.shiftKey || detail.shiftKey)
      if (shift && Math.abs(dy) >= Math.abs(dx)) {
        dx = dy
        dy = 0
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        const before = this.bodyLeft
        const max = Math.max(0, this.centerWidth - this.centerViewPx)
        this.scrollCenterTo(Math.min(max, Math.max(0, before + dx)))
        this.revealHBar(true)
        if (Math.abs(this.bodyLeft - before) < 0.5) this.chainPageWheel(dy || dx)
        else this.holdPageScroll()
        return
      }
      const before = this.bodyTop
      this.scrollBodyTo(before + dy)
      if (Math.abs(this.bodyTop - before) < 0.5) this.chainPageWheel(dy)
      else this.holdPageScroll()
      // #endif
    },
    holdPageScroll() {
      if (this.pageHoldTop < 0) return
      const top = this.pageHoldTop
      setTimeout(() => {
        uni.pageScrollTo({ scrollTop: top, duration: 0 })
      }, 0)
    },
    chainPageWheel(delta: number) {
      if (!delta) return
      const base = this.pageHoldTop
      uni.createSelectorQuery().selectViewport().scrollOffset((res) => {
        const top = res && typeof res.scrollTop === 'number' ? res.scrollTop : 0
        const from = base >= 0 ? base : top
        const next = Math.max(0, from + delta)
        this.pageHoldTop = next
        if (Math.abs(next - top) > 1) uni.pageScrollTo({ scrollTop: next, duration: 0 })
      }).exec()
    },
    onBodyScroll(event: ScrollEvent) {
      const left = event.detail?.scrollLeft || 0
      const top = event.detail?.scrollTop || 0
      const leftChanged = Math.abs(left - this.bodyLeft) > 0.5
      this.clearPressIfScrolled(left, top)
      this.syncRowWindow(top)
      this.syncColWindow(left)
      const client = this.readCenterClient()
      if (client > 0 && this.centerClientPx !== client) this.centerClientPx = client
      this.bodyLeft = left
      this.bodyTop = top
      this.revealHBar(leftChanged)
      if (this.syncSource === 'head' || this.syncSource === 'left' || this.syncSource === 'right') return
      this.headLeft = left
      this.leftTop = top
      this.rightTop = top
      this.armSync('body')
    },
    onHeadScroll(event: ScrollEvent) {
      const left = event.detail?.scrollLeft || 0
      const changed = Math.abs(left - this.headLeft) > 0.5
      this.syncColWindow(left)
      this.headLeft = left
      this.revealHBar(changed)
      if (this.syncSource === 'body') return
      this.bodyLeft = left
      this.armSync('head')
    },
    onLeftScroll(event: ScrollEvent) {
      if (this.centerTouchAxis || this.gliding) return
      const top = event.detail?.scrollTop || 0
      this.clearPressIfScrolled(this.bodyLeft, top)
      this.syncRowWindow(top)
      this.leftTop = top
      if (this.syncSource === 'body' || this.syncSource === 'right') return
      this.bodyTop = top
      this.rightTop = top
      this.armSync('left')
    },
    onRightScroll(event: ScrollEvent) {
      if (this.centerTouchAxis || this.gliding) return
      const top = event.detail?.scrollTop || 0
      this.clearPressIfScrolled(this.bodyLeft, top)
      this.syncRowWindow(top)
      this.rightTop = top
      if (this.syncSource === 'body' || this.syncSource === 'left') return
      this.bodyTop = top
      this.leftTop = top
      this.armSync('right')
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

$ly-table-row: 52px;
$ly-table-head: 44px;
$ly-table-radius: 26px;

.lingyun-table {
  width: 100%;
  overflow: hidden;
  border-radius: $ly-table-radius;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-sizing: border-box;
}

.lingyun-table--fill {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.lingyun-table--fill .lingyun-table__toolbar,
.lingyun-table--fill .lingyun-table__head,
.lingyun-table--fill .lingyun-table__filters,
.lingyun-table--fill .lingyun-table__pager {
  flex-shrink: 0;
}

.lingyun-table--fill .lingyun-table__body {
  flex: 1;
  min-height: 0;
}

.lingyun-table__track {
  display: flex;
  flex-direction: column;
}

.lingyun-table__toolbar {
  height: 52px;
  padding: 0 8px 0 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__toolbar-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-table__toolbar-title {
  font-size: 17px;
  line-height: 22px;
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-table__toolbar-title--gap {
  margin-left: 8px;
}

.lingyun-table__toolbar-tools {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
}

.lingyun-table__tool {
  width: 32px;
  height: 32px;
  margin-left: 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-table__tool--hover,
.lingyun-table__pick--hover {
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-table__pick {
  height: 44px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-table__pick-text {
  flex: 1;
  min-width: 0;
  margin-left: 10px;
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-table__row-pad,
.lingyun-table__col-pad {
  flex-shrink: 0;
}

.lingyun-table__head,
.lingyun-table__body {
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: stretch;
}

.lingyun-table__body {
  position: relative;
  overflow: hidden;
}

/* 原生滚动条不占位。H5 横向只留悬浮拖动条，竖向也不留槽，滚到底才能和固定列对齐 */
/* #ifdef H5 */
.lingyun-table__x--body :deep(.uni-scroll-view),
.lingyun-table__y :deep(.uni-scroll-view),
.lingyun-table__y--right :deep(.uni-scroll-view) {
  scrollbar-width: none;
}

.lingyun-table__x--body :deep(.uni-scroll-view)::-webkit-scrollbar,
.lingyun-table__y :deep(.uni-scroll-view)::-webkit-scrollbar,
.lingyun-table__y--right :deep(.uni-scroll-view)::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
/* #endif */

.lingyun-table__hbar,
.lingyun-table__vbar {
  position: absolute;
  z-index: 20;
  box-sizing: border-box;
  pointer-events: auto;
  background-color: transparent;
}

.lingyun-table__hbar {
  bottom: 0;
  height: 20px;
  padding: 5px 2px;
  cursor: pointer;
}

.lingyun-table__vbar {
  top: 0;
  width: 20px;
  padding: 2px 5px;
  cursor: pointer;
}

.lingyun-table__hbar-thumb,
.lingyun-table__vbar-thumb {
  border-radius: 999px;
  background-color: rgba(60, 60, 67, 0.48);
  pointer-events: none;
}

.lingyun-table__hbar-thumb {
  height: 10px;
}

.lingyun-table__vbar-thumb {
  width: 10px;
}

.lingyun-table__loading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-fill-quaternary, #{$lingyun-fill-quaternary});
}

.lingyun-table__side {
  position: relative;
  z-index: 4;
  flex-shrink: 0;
  box-sizing: border-box;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  border-right: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__side--right {
  border-right-width: 0;
  border-left: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__x {
  flex: 1;
  width: 0;
  min-width: 0;
  white-space: nowrap;
}

.lingyun-table__clip {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.lingyun-table__clip .lingyun-table__x {
  width: 100%;
  flex: none;
}

.lingyun-table__x--mp {
  height: 100%;
  overflow: hidden;
}

.lingyun-table__x--head {
  height: $ly-table-head;
}

.lingyun-table__y {
  position: relative;
  z-index: 4;
  flex-shrink: 0;
  box-sizing: border-box;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  border-right: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__y--right {
  border-right-width: 0;
  border-left: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: $ly-table-row;
  box-sizing: border-box;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}

.lingyun-table__row--head {
  height: $ly-table-head;
  border-bottom: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__row--last {
  border-bottom: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table--stripe .lingyun-table__row--alt {
  background-color: var(--lingyun-fill-quaternary, #{$lingyun-fill-quaternary});
}

.lingyun-table__row--hover {
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

/* 斑马行选择器更具体，按压色必须写在它后面，并用更深的 Fill，否则和条纹叠成同一档灰 */
.lingyun-table--stripe .lingyun-table__row--alt.lingyun-table__row--hover {
  background-color: var(--lingyun-fill, #{$lingyun-fill});
}

.lingyun-table__cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
  height: 100%;
  padding: 0 12px;
  box-sizing: border-box;
  min-width: 0;
}

.lingyun-table__cell--check {
  width: 48px;
  padding: 0;
  justify-content: center;
}

.lingyun-table--border .lingyun-table__cell {
  border-right: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

/* 固定列外沿已有 1px 阴影。再画单元格右边线会叠成两像素。最右列贴着表格外缘，不再画右边线 */
.lingyun-table--border .lingyun-table__side .lingyun-table__cell:last-child,
.lingyun-table--border .lingyun-table__y .lingyun-table__cell:last-child {
  border-right-width: 0;
}

.lingyun-table__head-hit {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0;
  flex: 1;
  height: 100%;
}

.lingyun-table__head-text {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table__sort {
  flex-shrink: 0;
  margin-left: 4px;
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-table__sort--on {
  color: var(--lingyun-primary, #{$lingyun-primary});
}

.lingyun-table__filter {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  margin-left: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-table__filter-mark {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-table__filter--on .lingyun-table__filter-mark {
  color: var(--lingyun-primary, #{$lingyun-primary});
}

.lingyun-table__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.lingyun-table__text {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-table__check {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  box-sizing: border-box;
  border: 1.5px solid var(--lingyun-separator, #{$lingyun-separator});
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-table__check--on,
.lingyun-table__check--some {
  border-color: var(--lingyun-primary, #{$lingyun-primary});
  background-color: var(--lingyun-primary, #{$lingyun-primary});
}

.lingyun-table__dash {
  width: 10px;
  height: 2px;
  border-radius: 1px;
  background-color: #ffffff;
}

.lingyun-table__filters {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px 10px;
  border-bottom: 1px solid var(--lingyun-separator, #{$lingyun-separator});
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}

.lingyun-table__chip {
  padding: 4px 10px;
  border-radius: 999px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-table__chip--on {
  background-color: var(--lingyun-primary, #{$lingyun-primary});
}

.lingyun-table__chip-text {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-table__chip--on .lingyun-table__chip-text {
  color: #ffffff;
}

.lingyun-table__empty {
  flex: 1;
  height: 100%;
  min-height: 120px;
  padding: 12px 0 8px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-table__pager {
  min-height: 48px;
  padding: 8px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__pager-meta,
.lingyun-table__page-no {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table__pager-nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.lingyun-table__page-btn {
  padding: 4px 10px;
  border-radius: 999px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-table__page-btn--off {
  opacity: 0.4;
}

.lingyun-table__page-btn-text {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label, #{$lingyun-label});
}
</style>
