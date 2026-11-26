export type LingyunGridItemInput = {
  /** lingyun-icon 类型。写图片地址时按图像处理 */
  icon?: string
  /** 改用本地图片。有值时按 lingyun-image 处理 */
  iconSrc?: string
  /** 图标边长（单位 px），优先于公共的 iconSize */
  iconSize?: number | string
  /** 同 lingyun-image 的 shape，仅对图片 */
  shape?: string
  /** 同 lingyun-image 的 radius，仅对图片 */
  radius?: number | string
  text?: string
  color?: string
  info?: string | number | boolean
  /** 页面路径。有值时点击跳转 */
  link?: string
}
