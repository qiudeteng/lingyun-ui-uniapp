export interface LingyunUploadTask {
  abort?: () => void
}

export interface LingyunUploadFile {
  tempFilePath: string
  name: string
  size: number
}

export type LingyunUploadFn = (
  file: LingyunUploadFile,
) => Promise<string | { url: string; [key: string]: unknown }>

export interface LingyunUploadRequestOptions {
  url: string
  filePath: string
  name: string
  header?: Record<string, string>
  formData?: Record<string, unknown>
  parseResponse?: (raw: unknown) => string
  /** 响应里没有地址时的报错文案；图片/文件上传各自覆盖 */
  missingUrlMessage?: string
  onProgress?: (progress: number) => void
  onTask?: (task: LingyunUploadTask) => void
}

export interface LingyunUploadRequestResult {
  url: string
  raw: unknown
}

/** 宿主提供的上传鉴权头，如 `Bearer xxx`；未登录返回空 */
export type LingyunUploadAuthorization = () => string | null | undefined

let uploadAuthorization: LingyunUploadAuthorization | null = null

/** 宿主在 app 启动时注入登录态；组件包不读取宿主的 token 存储 */
export function configureLingyunUpload(options: {
  getAuthorization?: LingyunUploadAuthorization
}): void {
  uploadAuthorization = options?.getAuthorization || null
}

export function buildUploadHeader(
  custom?: Record<string, string>,
): Record<string, string> {
  const header: Record<string, string> = { ...(custom || {}) }
  const authorization = uploadAuthorization?.()
  if (authorization && !header.Authorization) header.Authorization = authorization
  return header
}

/** 默认取 data.url，再退 url / data；业务可用 parseResponse 覆盖。 */
export function parseUploadResponse(
  raw: unknown,
  missingUrlMessage = '上传响应缺少文件地址',
): string {
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
  throw new Error(missingUrlMessage)
}

export function uploadWithUni(
  options: LingyunUploadRequestOptions,
): Promise<LingyunUploadRequestResult> {
  return new Promise((resolve, reject) => {
    const task = (
      uni as typeof uni & {
        uploadFile: (opts: Record<string, unknown>) => LingyunUploadTask
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
            : parseUploadResponse(raw, options.missingUrlMessage)
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
    const progressTask = task as LingyunUploadTask & {
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
