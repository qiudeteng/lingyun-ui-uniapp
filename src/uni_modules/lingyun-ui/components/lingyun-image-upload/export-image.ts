import { drawCroppedImage, type CropExportParams } from './crop'

export interface ImageExportOptions {
  imagePath: string
  params: CropExportParams
  quality: number
  canvasId: string
  instance?: unknown
}

export interface ImageExportResult {
  filePath: string
  revoke?: () => void
}

interface CanvasNode {
  width: number
  height: number
  getContext: (type: string) => unknown
  createImage: () => CanvasImage
}

interface CanvasImage {
  src: string
  width?: number
  height?: number
  onload?: () => void
  onerror?: () => void
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片加载失败'))
    image.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob === 'function') {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('图片导出失败'))
        },
        'image/jpeg',
        quality,
      )
      return
    }
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      const [meta, content] = dataUrl.split(',')
      const mime = /data:([^;]+)/.exec(meta)?.[1] || 'image/jpeg'
      const binary = atob(content)
      const bytes = new Uint8Array(binary.length)
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index)
      }
      resolve(new Blob([bytes], { type: mime }))
    } catch (error) {
      reject(error)
    }
  })
}

async function exportH5(options: ImageExportOptions): Promise<ImageExportResult> {
  if (typeof document === 'undefined') throw new Error('当前环境不支持图片导出')
  const canvas = document.createElement('canvas')
  canvas.width = options.params.outputWidth
  canvas.height = options.params.outputHeight
  const context = canvas.getContext('2d')
  if (!context) throw new Error('无法创建画布')
  const image = await loadHtmlImage(options.imagePath)
  drawCroppedImage(context, image, options.params)
  const blob = await canvasToBlob(canvas, options.quality)
  const url = URL.createObjectURL(blob)
  return {
    filePath: url,
    revoke: () => URL.revokeObjectURL(url),
  }
}

function queryCanvasNode(
  instance: unknown,
  canvasId: string,
  scoped: boolean,
): Promise<CanvasNode> {
  return new Promise((resolve, reject) => {
    const base = uni.createSelectorQuery() as unknown as {
      in?: (context: unknown) => typeof base
      select: (selector: string) => {
        fields: (fields: Record<string, boolean>) => {
          exec: (callback: (res: Array<{ node?: CanvasNode }>) => void) => void
        }
      }
    }
    const query = scoped && typeof base.in === 'function' ? base.in(instance) : base
    query
      .select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        const node = res?.[0]?.node
        if (node) resolve(node)
        else reject(new Error('未找到导出画布'))
      })
  })
}

async function selectCanvasNode(instance: unknown, canvasId: string): Promise<CanvasNode> {
  try {
    return await queryCanvasNode(instance, canvasId, true)
  } catch {
    return queryCanvasNode(instance, canvasId, false)
  }
}

function loadCanvasImage(canvas: CanvasNode, src: string): Promise<CanvasImage> {
  return new Promise((resolve, reject) => {
    const image = canvas.createImage()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片加载失败'))
    image.src = src
  })
}

async function exportUni(options: ImageExportOptions): Promise<ImageExportResult> {
  const canvas = await selectCanvasNode(options.instance, options.canvasId)
  canvas.width = options.params.outputWidth
  canvas.height = options.params.outputHeight
  const context = canvas.getContext('2d') as Parameters<typeof drawCroppedImage>[0]
  const image = await loadCanvasImage(canvas, options.imagePath)
  drawCroppedImage(context, image, options.params)

  const filePath = await new Promise<string>((resolve, reject) => {
    ;(
      uni as typeof uni & {
        canvasToTempFilePath: (
          opts: Record<string, unknown>,
          instance?: unknown,
        ) => void
      }
    ).canvasToTempFilePath(
      {
        canvas,
        fileType: 'jpg',
        quality: options.quality,
        success: (res: { tempFilePath?: string }) => {
          if (res?.tempFilePath) resolve(res.tempFilePath)
          else reject(new Error('图片导出失败'))
        },
        fail: (error: { errMsg?: string }) => {
          reject(new Error(error?.errMsg || '图片导出失败'))
        },
      },
      options.instance,
    )
  })

  return { filePath }
}

export async function exportCroppedImage(
  options: ImageExportOptions,
): Promise<ImageExportResult> {
  // #ifdef H5
  return exportH5(options)
  // #endif
  // #ifndef H5
  return exportUni(options)
  // #endif
}
