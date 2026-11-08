/**
 * 图片裁剪 / 旋转的坐标计算。
 *
 * 预览与导使用同一套模型：
 * - stage：编辑器里裁剪舞台的 CSS 像素尺寸
 * - crop：裁剪框在 stage 坐标系中的位置
 * - scale：原图像素 → stage 像素的缩放比（S）
 * - offset：图片中心相对 stage 中心的偏移
 */

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export interface StageSize {
  width: number
  height: number
}

export interface CropTransform {
  imageWidth: number
  imageHeight: number
  rotation: number
  scale: number
  offsetX: number
  offsetY: number
}

export interface CropExportParams {
  outputWidth: number
  outputHeight: number
  pixelRatio: number
  crop: CropRect
  stage: StageSize
  transform: CropTransform
  rotatedWidth: number
  rotatedHeight: number
}

export type CropHandle = 'move' | 'nw' | 'ne' | 'se' | 'sw'

export interface Canvas2DLike {
  save?: () => void
  restore?: () => void
  clearRect?: (x: number, y: number, width: number, height: number) => void
  scale: (x: number, y: number) => void
  translate: (x: number, y: number) => void
  rotate: (angle: number) => void
  drawImage: (
    image: any,
    dx: number,
    dy: number,
    dWidth: number,
    dHeight: number,
  ) => void
}

function clamp(value: number, min: number, max: number): number {
  if (min > max) return (min + max) / 2
  return Math.min(max, Math.max(min, value))
}

/** 解析 cropAspect：支持 1、4/3、'4:3'、'16:9'、'free'。返回 null 表示自由裁剪。 */
export function parseCropAspect(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null
  }
  const text = String(value).trim().toLowerCase()
  if (!text || text === 'free' || text === 'none') return null
  const split = text.includes(':') ? ':' : text.includes('/') ? '/' : ''
  if (split) {
    const parts = text.split(split)
    const width = Number(parts[0])
    const height = Number(parts[1])
    return width > 0 && height > 0 ? width / height : null
  }
  const ratio = Number(text)
  return Number.isFinite(ratio) && ratio > 0 ? ratio : null
}

/** 旋转 90°/270° 后图片的视觉宽高互换。 */
export function rotatedSize(
  width: number,
  height: number,
  rotation: number,
): { width: number; height: number } {
  const normalized = ((rotation % 360) + 360) % 360
  return normalized === 90 || normalized === 270
    ? { width: height, height: width }
    : { width, height }
}

/** 在舞台内居中放一个裁剪框。aspect 为 null 时取可用区域的 86%。 */
export function defaultCropRect(
  stage: StageSize,
  padding = 24,
  aspect: number | null = null,
): CropRect {
  const availableWidth = Math.max(1, stage.width - padding * 2)
  const availableHeight = Math.max(1, stage.height - padding * 2)
  let width = availableWidth
  let height = availableHeight
  if (aspect && aspect > 0) {
    if (availableWidth / availableHeight > aspect) {
      height = availableHeight
      width = height * aspect
    } else {
      width = availableWidth
      height = width / aspect
    }
  } else {
    width = availableWidth * 0.86
    height = availableHeight * 0.86
  }
  return {
    x: (stage.width - width) / 2,
    y: (stage.height - height) / 2,
    width,
    height,
  }
}

/** 让图片刚好盖住裁剪框所需的原图 → 舞台缩放比。 */
export function coverScale(
  crop: CropRect,
  rotatedWidth: number,
  rotatedHeight: number,
): number {
  return Math.max(
    crop.width / Math.max(1, rotatedWidth),
    crop.height / Math.max(1, rotatedHeight),
  )
}

export function maxScale(crop: CropRect, rotatedWidth: number, rotatedHeight: number): number {
  return coverScale(crop, rotatedWidth, rotatedHeight) * 5
}

/** 保证图片始终盖住裁剪框。 */
export function clampOffset(
  offsetX: number,
  offsetY: number,
  stage: StageSize,
  crop: CropRect,
  rotatedWidth: number,
  rotatedHeight: number,
  scale: number,
): { x: number; y: number } {
  const halfWidth = (rotatedWidth * scale) / 2
  const halfHeight = (rotatedHeight * scale) / 2
  const centerX = stage.width / 2
  const centerY = stage.height / 2
  const minX = crop.x + crop.width - centerX - halfWidth
  const maxX = crop.x - centerX + halfWidth
  const minY = crop.y + crop.height - centerY - halfHeight
  const maxY = crop.y - centerY + halfHeight
  return {
    x: clamp(offsetX, minX, maxX),
    y: clamp(offsetY, minY, maxY),
  }
}

/** 双指缩放时以两指中点为锚点，修正图片偏移。 */
export function zoomOffset(
  anchorX: number,
  anchorY: number,
  stage: StageSize,
  offsetX: number,
  offsetY: number,
  ratio: number,
): { x: number; y: number } {
  const centerX = stage.width / 2
  const centerY = stage.height / 2
  return {
    x: anchorX - centerX - (anchorX - centerX - offsetX) * ratio,
    y: anchorY - centerY - (anchorY - centerY - offsetY) * ratio,
  }
}

/** 自由裁剪：拖动裁剪框或四角手柄。 */
export function resizeCropRect(
  start: CropRect,
  handle: CropHandle,
  deltaX: number,
  deltaY: number,
  stage: StageSize,
  minSize = 40,
): CropRect {
  const right = start.x + start.width
  const bottom = start.y + start.height
  let x = start.x
  let y = start.y
  let width = start.width
  let height = start.height

  if (handle === 'move') {
    x = clamp(start.x + deltaX, 0, stage.width - start.width)
    y = clamp(start.y + deltaY, 0, stage.height - start.height)
    return { x, y, width, height }
  }

  if (handle === 'nw' || handle === 'sw') {
    const nextX = clamp(start.x + deltaX, 0, right - minSize)
    width = right - nextX
    x = nextX
  }
  if (handle === 'ne' || handle === 'se') {
    const nextRight = clamp(right + deltaX, start.x + minSize, stage.width)
    width = nextRight - start.x
  }
  if (handle === 'nw' || handle === 'ne') {
    const nextY = clamp(start.y + deltaY, 0, bottom - minSize)
    height = bottom - nextY
    y = nextY
  }
  if (handle === 'sw' || handle === 'se') {
    const nextBottom = clamp(bottom + deltaY, start.y + minSize, stage.height)
    height = nextBottom - start.y
  }

  return { x, y, width, height }
}

/**
 * 计算导出画布尺寸。
 * k = 1 / S 时输出 1 个像素对应原图 1 个像素；再用最长边上限收口。
 */
export function buildExportParams(
  stage: StageSize,
  crop: CropRect,
  transform: CropTransform,
  outputMaxSize = 2048,
): CropExportParams {
  const rotated = rotatedSize(transform.imageWidth, transform.imageHeight, transform.rotation)
  const longest = Math.max(1, crop.width, crop.height)
  const naturalRatio = transform.scale > 0 ? 1 / transform.scale : 1
  const cap =
    outputMaxSize > 0 ? outputMaxSize / longest : Number.POSITIVE_INFINITY
  const pixelRatio = Math.max(0.01, Math.min(naturalRatio, cap))
  return {
    outputWidth: Math.max(1, Math.round(crop.width * pixelRatio)),
    outputHeight: Math.max(1, Math.round(crop.height * pixelRatio)),
    pixelRatio,
    crop,
    stage,
    transform,
    rotatedWidth: rotated.width,
    rotatedHeight: rotated.height,
  }
}

/** 画布按预览同一套变换绘制裁剪结果。 */
export function drawCroppedImage(
  ctx: Canvas2DLike,
  image: any,
  params: CropExportParams,
): void {
  const { pixelRatio, crop, stage, transform } = params
  ctx.save?.()
  ctx.clearRect?.(0, 0, params.outputWidth, params.outputHeight)
  ctx.scale(pixelRatio, pixelRatio)
  ctx.translate(-crop.x, -crop.y)
  ctx.translate(
    stage.width / 2 + transform.offsetX,
    stage.height / 2 + transform.offsetY,
  )
  ctx.rotate((transform.rotation * Math.PI) / 180)
  ctx.scale(transform.scale, transform.scale)
  ctx.drawImage(
    image,
    -transform.imageWidth / 2,
    -transform.imageHeight / 2,
    transform.imageWidth,
    transform.imageHeight,
  )
  ctx.restore?.()
}
