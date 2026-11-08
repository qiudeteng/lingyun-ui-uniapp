import { formatToken, getToken } from '@/utils/auth'

export interface LingyunImageUploadTask {
  abort?: () => void
}

export interface LingyunImageUploadFile {
  tempFilePath: string
  name: string
  size: number
}

export type LingyunImageUploadFn = (
  file: LingyunImageUploadFile,
) => Promise<string | { url: string; [key: string]: unknown }>

export interface UploadRequestOptions {
  url: string
  filePath: string
  name: string
  header?: Record<string, string>
  formData?: Record<string, unknown>
  parseResponse?: (raw: unknown) => string
  onProgress?: (progress: number) => void
  onTask?: (task: LingyunImageUploadTask) => void
}

export interface UploadRequestResult {
  url: string
  raw: unknown
}

export function buildUploadHeader(
  custom?: Record<string, string>,
): Record<string, string> {
  const header: Record<string, string> = { ...(custom || {}) }
  const authorization = formatToken(getToken())
  if (authorization && !header.Authorization) header.Authorization = authorization
  return header
}

/** 默认取 data.url，再退 url / data；业务可用 parseResponse 覆盖。 */
export function parseUploadResponse(raw: unknown): string {
  let data: unknown = raw
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {
      throw new Error('上传响应不是合法 JSON')
    }
  }
  const record = data as Record<string, unknown> | null
  const nested = record?.data as Record<string, unknown> | undefined
  const candidates = [nested?.url, record?.url, record?.data]
  for (const value of candidates) {
    if (typeof value === 'string' && value) return value
  }
  throw new Error('上传响应缺少图片地址')
}

export function uploadWithUni(options: UploadRequestOptions): Promise<UploadRequestResult> {
  return new Promise((resolve, reject) => {
    const task = (
      uni as typeof uni & {
        uploadFile: (opts: Record<string, unknown>) => LingyunImageUploadTask
      }
    ).uploadFile({
      url: options.url,
      filePath: options.filePath,
      name: options.name,
      header: buildUploadHeader(options.header),
      formData: options.formData || {},
      success: (response: { data?: unknown }) => {
        try {
          const raw = response?.data
          const url = options.parseResponse
            ? options.parseResponse(raw)
            : parseUploadResponse(raw)
          resolve({ url, raw: response })
        } catch (error) {
          reject(error)
        }
      },
      fail: (error: { errMsg?: string }) => {
        reject(new Error(error?.errMsg || '上传失败'))
      },
    })

    if (!task) return
    options.onTask?.(task)
    const progressTask = task as LingyunImageUploadTask & {
      onProgressUpdate?: (callback: (res: { progress: number }) => void) => void
    }
    if (options.onProgress && typeof progressTask.onProgressUpdate === 'function') {
      progressTask.onProgressUpdate((res) => options.onProgress?.(res.progress))
    }
  })
}

export function isAbortError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error || '')
  return /abort|cancel/i.test(message)
}
