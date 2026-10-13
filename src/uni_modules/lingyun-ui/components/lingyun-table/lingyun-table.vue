<template>
  <view class="lingyun-table" :class="rootClass">
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
          <view
            v-for="col in centerColumns"
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

    <view v-if="!pageRows.length && !loading" class="lingyun-table__empty">
      <slot name="empty">
        <lingyun-empty variant="plain" :title="emptyText" />
      </slot>
    </view>

    <view v-else class="lingyun-table__body" :style="bodyBoxStyle">
      <scroll-view
        v-if="leftWidth && fixed"
        class="lingyun-table__y"
        scroll-y
        :style="sideScrollStyle(leftWidth)"
        :scroll-top="leftTop"
        :show-scrollbar="false"
        @scroll="onLeftScroll"
      >
        <view
          v-for="(row, index) in pageRows"
          :key="keyOf(row)"
          class="lingyun-table__row"
          :class="rowClass(index, row)"
          @touchstart="onRowPress(row)"
          @touchend="onRowRelease"
          @touchcancel="onRowRelease"
          @mousedown="onRowPress(row)"
          @mouseup="onRowRelease"
          @mouseleave="onRowRelease"
          @click="onRowClick(row)"
        >
          <view v-if="selection" class="lingyun-table__cell lingyun-table__cell--check" @click.stop="toggleRow(row)">
            <view class="lingyun-table__check" :class="{ 'lingyun-table__check--on': isSelected(row) }">
              <lingyun-icon v-if="isSelected(row)" type="checkmarkempty" :size="14" color="#ffffff" />
            </view>
          </view>
          <view v-for="col in leftColumns" :key="col.key" class="lingyun-table__cell" :style="cellStyle(col)">
            <view class="lingyun-table__value">
              <slot name="cell" :row="row" :column="col" :value="cellValue(row, col)">
                <text class="lingyun-table__text">{{ cellText(row, col) }}</text>
              </slot>
            </view>
          </view>
        </view>
      </scroll-view>
      <view v-else-if="leftWidth" class="lingyun-table__side" :style="sideStyle(leftWidth)">
        <view
          v-for="(row, index) in pageRows"
          :key="keyOf(row)"
          class="lingyun-table__row"
          :class="rowClass(index, row)"
          @touchstart="onRowPress(row)"
          @touchend="onRowRelease"
          @touchcancel="onRowRelease"
          @mousedown="onRowPress(row)"
          @mouseup="onRowRelease"
          @mouseleave="onRowRelease"
          @click="onRowClick(row)"
        >
          <view v-if="selection" class="lingyun-table__cell lingyun-table__cell--check" @click.stop="toggleRow(row)">
            <view class="lingyun-table__check" :class="{ 'lingyun-table__check--on': isSelected(row) }">
              <lingyun-icon v-if="isSelected(row)" type="checkmarkempty" :size="14" color="#ffffff" />
            </view>
          </view>
          <view v-for="col in leftColumns" :key="col.key" class="lingyun-table__cell" :style="cellStyle(col)">
            <view class="lingyun-table__value">
              <slot name="cell" :row="row" :column="col" :value="cellValue(row, col)">
                <text class="lingyun-table__text">{{ cellText(row, col) }}</text>
              </slot>
            </view>
          </view>
        </view>
      </view>

      <scroll-view
        class="lingyun-table__x lingyun-table__x--body"
        scroll-x
        :scroll-y="fixed"
        :style="bodyScrollStyle"
        :scroll-left="bodyLeft"
        :scroll-top="bodyTop"
        @scroll="onBodyScroll"
      >
        <view :style="centerRowStyle">
          <view
            v-for="(row, index) in pageRows"
            :key="keyOf(row)"
            class="lingyun-table__row"
            :class="rowClass(index, row)"
            @touchstart="onRowPress(row)"
            @touchend="onRowRelease"
            @touchcancel="onRowRelease"
            @mousedown="onRowPress(row)"
            @mouseup="onRowRelease"
            @mouseleave="onRowRelease"
            @click="onRowClick(row)"
          >
            <view v-for="col in centerColumns" :key="col.key" class="lingyun-table__cell" :style="cellStyle(col)">
              <view class="lingyun-table__value">
                <slot name="cell" :row="row" :column="col" :value="cellValue(row, col)">
                  <text class="lingyun-table__text">{{ cellText(row, col) }}</text>
                </slot>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <scroll-view
        v-if="rightWidth && fixed"
        class="lingyun-table__y lingyun-table__y--right"
        scroll-y
        :style="sideScrollStyle(rightWidth)"
        :scroll-top="rightTop"
        :show-scrollbar="false"
        @scroll="onRightScroll"
      >
        <view
          v-for="(row, index) in pageRows"
          :key="keyOf(row)"
          class="lingyun-table__row"
          :class="rowClass(index, row)"
          @touchstart="onRowPress(row)"
          @touchend="onRowRelease"
          @touchcancel="onRowRelease"
          @mousedown="onRowPress(row)"
          @mouseup="onRowRelease"
          @mouseleave="onRowRelease"
          @click="onRowClick(row)"
        >
          <view v-for="col in rightColumns" :key="col.key" class="lingyun-table__cell" :style="cellStyle(col)">
            <view class="lingyun-table__value">
              <slot name="cell" :row="row" :column="col" :value="cellValue(row, col)">
                <text class="lingyun-table__text">{{ cellText(row, col) }}</text>
              </slot>
            </view>
          </view>
        </view>
      </scroll-view>
      <view v-else-if="rightWidth" class="lingyun-table__side lingyun-table__side--right" :style="sideStyle(rightWidth)">
        <view
          v-for="(row, index) in pageRows"
          :key="keyOf(row)"
          class="lingyun-table__row"
          :class="rowClass(index, row)"
          @touchstart="onRowPress(row)"
          @touchend="onRowRelease"
          @touchcancel="onRowRelease"
          @mousedown="onRowPress(row)"
          @mouseup="onRowRelease"
          @mouseleave="onRowRelease"
          @click="onRowClick(row)"
        >
          <view v-for="col in rightColumns" :key="col.key" class="lingyun-table__cell" :style="cellStyle(col)">
            <view class="lingyun-table__value">
              <slot name="cell" :row="row" :column="col" :value="cellValue(row, col)">
                <text class="lingyun-table__text">{{ cellText(row, col) }}</text>
              </slot>
            </view>
          </view>
        </view>
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
  ],
  props: {
    columns: { type: Array as PropType<LingyunTableColumn[]>, default: () => [] },
    data: { type: Array as PropType<LingyunTableRow[]>, default: () => [] },
    rowKey: { type: String, default: 'id' },
    /**
     * 表体高度。空则跟着行数撑开；传入后表体上下滚动，表头保持在滚动区外面。
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
    }
  },
  computed: {
    rootClass(): string[] {
      return [
        this.stripe ? 'lingyun-table--stripe' : '',
        this.border ? 'lingyun-table--border' : '',
        this.fixed ? 'lingyun-table--fixed' : '',
      ].filter(Boolean)
    },
    fixed(): boolean {
      return parseHeight(this.height) > 0
    },
    bodyHeightPx(): number {
      if (this.fixed) return parseHeight(this.height)
      if (!this.pageRows.length) return this.loading ? 160 : ROW_H
      return this.pageRows.length * ROW_H
    },
    resolvedColumns(): ResolvedColumn[] {
      return (this.columns || []).map((col) => ({
        ...col,
        widthPx: columnWidth(col.width),
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
    bodyBoxStyle(): Record<string, string> {
      return { height: `${this.bodyHeightPx}px` }
    },
    bodyScrollStyle(): Record<string, string> {
      return { height: `${this.bodyHeightPx}px` }
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
  },
  mounted() {
    if (this.remote) this.emitQuery()
  },
  beforeUnmount() {
    if (this.syncTimer) clearTimeout(this.syncTimer)
    if (this.pressTimer) clearTimeout(this.pressTimer)
  },
  methods: {
    sideStyle(width: number): Record<string, string> {
      return { width: `${width}px` }
    },
    sideScrollStyle(width: number): Record<string, string> {
      return { width: `${width}px`, height: `${this.bodyHeightPx}px` }
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
    cellValue(row: LingyunTableRow, col: ResolvedColumn): unknown {
      return row[col.key]
    },
    cellText(row: LingyunTableRow, col: ResolvedColumn): string {
      const value = row[col.key]
      if (col.formatter) return col.formatter(value, row)
      if (value == null) return ''
      return String(value)
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
    onBodyScroll(event: ScrollEvent) {
      const left = event.detail?.scrollLeft || 0
      const top = event.detail?.scrollTop || 0
      this.clearPressIfScrolled(left, top)
      this.bodyLeft = left
      this.bodyTop = top
      if (this.syncSource === 'head' || this.syncSource === 'left' || this.syncSource === 'right') return
      this.headLeft = left
      this.leftTop = top
      this.rightTop = top
      this.armSync('body')
    },
    onHeadScroll(event: ScrollEvent) {
      const left = event.detail?.scrollLeft || 0
      this.headLeft = left
      if (this.syncSource === 'body') return
      this.bodyLeft = left
      this.armSync('head')
    },
    onLeftScroll(event: ScrollEvent) {
      const top = event.detail?.scrollTop || 0
      this.clearPressIfScrolled(this.bodyLeft, top)
      this.leftTop = top
      if (this.syncSource === 'body' || this.syncSource === 'right') return
      this.bodyTop = top
      this.rightTop = top
      this.armSync('left')
    },
    onRightScroll(event: ScrollEvent) {
      const top = event.detail?.scrollTop || 0
      this.clearPressIfScrolled(this.bodyLeft, top)
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

.lingyun-table__head,
.lingyun-table__body {
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: stretch;
}

.lingyun-table__body {
  position: relative;
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
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  z-index: 2;
}

.lingyun-table__side {
  box-shadow: 1px 0 0 var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__side--right {
  box-shadow: -1px 0 0 var(--lingyun-separator, #{$lingyun-separator});
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
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  z-index: 2;
  box-shadow: 1px 0 0 var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__y--right {
  box-shadow: -1px 0 0 var(--lingyun-separator, #{$lingyun-separator});
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
  padding: 12px 0 8px;
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
