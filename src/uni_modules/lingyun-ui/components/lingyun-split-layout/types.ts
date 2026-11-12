/** lingyun-split-layout `layout-change` 事件参数 */
export interface LingyunSplitLayoutChange {
  /** 是否左右分栏（窗口 ≥ splitAt） */
  wide: boolean
  /**
   * 左侧导航已出现、但还没到分栏门槛。
   * 这时点行不要再 navigateTo：新页面会连同左侧导航一起滑入。
   * 把 detailOpen 设为 true，详情在当前页内容区滑入，导航留在原位。
   */
  cover: boolean
  /** 左栏浮动头部高度，内容顶部占位用 */
  listTopSpace: number
  /** 右栏浮动头部高度，内容顶部占位用 */
  detailTopSpace: number
}
