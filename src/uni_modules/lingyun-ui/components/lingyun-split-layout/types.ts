/** lingyun-split-layout `layout-change` 事件参数 */
export interface LingyunSplitLayoutChange {
  /** 是否左右分栏 */
  wide: boolean
  /** 左栏浮动头部高度，内容顶部占位用 */
  listTopSpace: number
  /** 右栏浮动头部高度，内容顶部占位用 */
  detailTopSpace: number
}
