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
    <view class="lingyun-table__head">
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

      <scroll-view
        class="lingyun-table__x lingyun-table__x--head"
        scroll-x
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

    <view class="lingyun-table__body" :style="bodyBoxStyle">
      <view v-if="!pageRows.length && !loading" class="lingyun-table__empty">
        <slot name="empty">
          <lingyun-empty variant="plain" :title="emptyText" />
        </slot>
      </view>
      <scroll-view
        v-if="pageRows.length && leftWidth"
        class="lingyun-table__y"
        scroll-y
        :style="sideScrollStyle(leftWidth)"
        :scroll-top="leftTop"
        :show-scrollbar="false"
        @scroll="onLeftScroll"
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

      <scroll-view
        v-if="pageRows.length"
        class="lingyun-table__x lingyun-table__x--body"
        scroll-x
        scroll-y
        :style="bodyScrollStyle"
        :scroll-left="bodyLeft"
        :scroll-top="bodyTop"
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

      <scroll-view
        v-if="pageRows.length && rightWidth"
        class="lingyun-table__y lingyun-table__y--right"
        scroll-y
        :style="sideScrollStyle(rightWidth)"
        :scroll-top="rightTop"
        :show-scrollbar="false"
        @scroll="onRightScroll"
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
      <view
        v-if="hBarNeeded"
        class="lingyun-table__hbar"
        :class="{ 'lingyun-table__hbar--on': hBarShow }"
        :style="hBarStyle"
        @touchstart.stop="onHBarStart"
        @touchmove.stop.prevent="onHBarMove"
        @touchend.stop="onHBarEnd"
        @mousedown.stop="onHBarStart"
      >
        <view class="lingyun-table__hbar-thumb" :style="hThumbStyle" />
      </view>
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
      hBarShow: false,
      hBarTimer: 0,
      hDragging: false,
      hDragX: 0,
      hDragLeft: 0,
      hiddenKeys: [] as string[],
      columnPickerOpen: false,
      onResize: null as (() => void) | null,
      hDragMove: null as ((event: MouseEvent) => void) | null,
      hDragUp: null as (() => void) | null,
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
    centerViewPx(): number {
      if (this.centerClientPx > 0) return this.centerClientPx
      return this.viewportCenterPx
    },
    hBarNeeded(): boolean {
      const view = this.centerViewPx
      return view > 0 && this.centerWidth > view + 1
    },
    hBarStyle(): Record<string, string> {
      return {
        left: `${this.leftWidth}px`,
        width: `${this.centerViewPx}px`,
      }
    },
    hThumbStyle(): Record<string, string> {
      const view = this.centerViewPx
      const content = Math.max(this.centerWidth, view)
      const max = Math.max(0, content - view)
      const thumb = Math.max(28, Math.round((view * view) / content))
      const travel = Math.max(1, view - thumb)
      const x = max <= 0 ? 0 : Math.round((this.bodyLeft / max) * travel)
      return { width: `${thumb}px`, transform: `translateX(${x}px)` }
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
    if (this.syncTimer) clearTimeout(this.syncTimer)
    if (this.pressTimer) clearTimeout(this.pressTimer)
    if (this.hBarTimer) clearTimeout(this.hBarTimer)
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
      table: { height?: number } | null,
      body: { height?: number } | null,
      center: { width?: number } | null,
    ) {
      if (center && center.width && center.width > 1) {
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
        const chrome = Math.max(44, tableH - bodyH)
        const filled = this.fillMode === 'parent' ? bodyH >= 48 : tableH >= this.fillHeightPx - 16 && bodyH >= 48
        const next = filled ? bodyH : Math.max(48, this.fillHeightPx - chrome)
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
      const info = uni.getWindowInfo()
      const pageH = info && info.windowHeight ? Math.round(info.windowHeight) : 0
      if (pageH > 0 && (this.fillMode !== 'page' || this.fillHeightPx !== pageH)) {
        this.fillMode = 'page'
        this.fillHeightPx = pageH
        this.$nextTick(() => this.measureViewport())
      }
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
    revealHBar(show: boolean) {
      if (!show || !this.hBarNeeded) return
      this.hBarShow = true
      if (this.hDragging) return
      this.scheduleHideHBar()
    },
    scheduleHideHBar() {
      if (this.hBarTimer) clearTimeout(this.hBarTimer)
      this.hBarTimer = setTimeout(() => {
        if (!this.hDragging) this.hBarShow = false
        this.hBarTimer = 0
      }, 700) as unknown as number
    },
    pointerX(event: { touches?: Array<{ clientX?: number; pageX?: number }>; clientX?: number; pageX?: number }): number {
      const touch = event.touches && event.touches[0]
      if (touch) return touch.clientX || touch.pageX || 0
      return event.clientX || event.pageX || 0
    },
    onHBarStart(event: { touches?: Array<{ clientX?: number; pageX?: number }>; clientX?: number; pageX?: number }) {
      this.hDragging = true
      this.hDragX = this.pointerX(event)
      this.hDragLeft = this.bodyLeft
      this.hBarShow = true
      if (this.hBarTimer) {
        clearTimeout(this.hBarTimer)
        this.hBarTimer = 0
      }
      if (event.touches && event.touches.length) return
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
    },
    onHBarMove(event: { touches?: Array<{ clientX?: number; pageX?: number }>; clientX?: number; pageX?: number }) {
      if (!this.hDragging) return
      const view = this.centerViewPx
      const content = Math.max(this.centerWidth, view)
      const max = Math.max(0, content - view)
      const thumb = Math.max(28, (view * view) / content)
      const travel = Math.max(1, view - thumb)
      const next = this.hDragLeft + (this.pointerX(event) - this.hDragX) * (max / travel)
      this.scrollCenterTo(Math.min(max, Math.max(0, next)))
    },
    onHBarEnd() {
      if (!this.hDragging) return
      this.hDragging = false
      this.scheduleHideHBar()
    },
    detachHBarDrag() {
      if (typeof document === 'undefined') return
      if (this.hDragMove) document.removeEventListener('mousemove', this.hDragMove)
      if (this.hDragUp) document.removeEventListener('mouseup', this.hDragUp)
      this.hDragMove = null
      this.hDragUp = null
    },
    scrollCenterTo(left: number) {
      this.syncColWindow(left)
      this.bodyLeft = left
      this.headLeft = left
      this.armSync('body')
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

/* 原生滚动条不占位。横向位置用悬浮条，竖向已经不显示，不再留槽 */
/* #ifdef H5 */
.lingyun-table__x--body .uni-scroll-view {
  scrollbar-width: none;
}

.lingyun-table__x--body .uni-scroll-view::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
/* #endif */

.lingyun-table__hbar {
  position: absolute;
  z-index: 4;
  bottom: 2px;
  height: 14px;
  box-sizing: border-box;
  opacity: 0;
  pointer-events: none;
}

.lingyun-table__hbar--on {
  opacity: 1;
  pointer-events: auto;
}

.lingyun-table__hbar-thumb {
  height: 4px;
  margin-top: 5px;
  border-radius: 999px;
  background-color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
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
  flex-shrink: 0;
  box-sizing: border-box;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  z-index: 2;
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

.lingyun-table__x--head {
  height: $ly-table-head;
}

.lingyun-table__y {
  flex-shrink: 0;
  box-sizing: border-box;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  z-index: 2;
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
