import type {
  LingyunTableFilterAnchor,
  LingyunTableFilterCondition,
  LingyunTableFilterOption,
  LingyunTableFilterResult,
  LingyunTableFilterType,
} from './table-filter'

export type {
  LingyunTableFilterAnchor,
  LingyunTableFilterCondition,
  LingyunTableFilterOp,
  LingyunTableFilterOption,
  LingyunTableFilterResult,
  LingyunTableFilterType,
} from './table-filter'

export type LingyunTableAlign = 'left' | 'center' | 'right'
export type LingyunTableSortOrder = 'asc' | 'desc' | ''

/** 分组行内部标记，业务 data 不需要这个字段 */
export const LINGYUN_TABLE_GROUP = '__lyIsGroup'

export interface LingyunTableColumn {
  key: string
  title: string
  /** 只写时平均剩余宽度 */
  width?: number | string
  /** 只写宽度的列分到的最小宽度，默认 120；剩余宽度不够时横向出现省略 */
  minWidth?: number | string
  align?: LingyunTableAlign
  /** true 或 left 均固定到左侧 */
  fixed?: 'left' | 'right' | boolean
  /** index 时显示当前顺序编号，不参与排序 */
  type?: 'index'
  sortable?: boolean
  /** 单选筛选项。传了就走 select 筛选 */
  filters?: LingyunTableFilterOption[]
  /** 筛选方式；select 没有 filters 时自动去重生成选项 */
  filterType?: LingyunTableFilterType
  /** 只声明 select 筛选，选项按数据即时写 true；等同 filterType: 'select' */
  filterable?: boolean
  formatter?: (value: unknown, row: LingyunTableRow) => string
}

export type LingyunTableRow = Record<string, unknown>

/**
 * 分组行。按 field 列分组，组头单独一行，sum 列名自动求和。
 * 与 footer 相同，合计当前筛选结果自动算，无需手写。
 */
export interface LingyunTableGroupFields {
  field: string
  sum?: string[]
}

export interface LingyunTableQuery {
  page: number
  pageSize: number
  /** 单选筛选：列 key → 选中值 */
  filters: Record<string, string[]>
  /** 排序、文本输入等筛选：列 key → 条件 */
  conditions: Record<string, LingyunTableFilterCondition>
  sortKey: string
  sortOrder: LingyunTableSortOrder
}

type WxsHandler = (...args: unknown[]) => unknown

/** 小程序端 WXS 模块（table-sync.wxs），模板里按 tableSync.xxx 调用；运行时才会被注入，类型上允许为空 */
interface TableSyncModule {
  propWatch: WxsHandler
  touchstart: WxsHandler
  touchmove: WxsHandler
  touchend: WxsHandler
  touchcancel: WxsHandler
}

declare module 'vue' {
  interface ComponentCustomProperties {
    tableSync: TableSyncModule
  }
}
