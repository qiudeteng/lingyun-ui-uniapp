export type LingyunToolbarButton = {
  key: string
  icon?: string
  label?: string
  disabled?: boolean
}

/** 一维数组为一组；二维数组按组数生成多个按钮分组容器 */
export type LingyunToolbarButtonGroups = LingyunToolbarButton[] | LingyunToolbarButton[][]
