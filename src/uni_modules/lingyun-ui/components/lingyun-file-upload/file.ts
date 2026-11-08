export interface LingyunUploadedFile {
  url: string
  name: string
  size: number
}

export interface LingyunFilePick {
  tempFilePath: string
  name: string
  size: number
}

export interface LingyunFileChooseOptions {
  count: number
  accept: string[]
}

export type LingyunFileChooseFn = (
  options: LingyunFileChooseOptions,
) => Promise<LingyunFilePick[]> | LingyunFilePick[]

export type LingyunFileKind = 'pdf' | 'word' | 'excel' | 'ppt' | 'archive' | 'other'

const PREVIEWABLE_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
])

const WORD_EXTENSIONS = new Set(['doc', 'docx', 'rtf', 'odt', 'txt', 'pages'])
const EXCEL_EXTENSIONS = new Set(['xls', 'xlsx', 'csv', 'ods', 'numbers'])
const PPT_EXTENSIONS = new Set(['ppt', 'pptx', 'odp', 'key'])
const ARCHIVE_EXTENSIONS = new Set(['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'])

/** accept 支持 'pdf,docx' 或 ['pdf', '.docx']；统一成不带点的小写扩展名。 */
export function normalizeAccept(value: string | string[] | null | undefined): string[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : []
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of raw) {
    const ext = String(item || '').trim().replace(/^\./, '').toLowerCase()
    if (!ext || seen.has(ext)) continue
    seen.add(ext)
    result.push(ext)
  }
  return result
}

/** chooseMessageFile 用不带点的扩展名。 */
export function acceptWithoutDot(accept: string[]): string[] {
  return accept.map((ext) => ext.replace(/^\./, ''))
}

/** chooseFile 用带点的扩展名。 */
export function acceptWithDot(accept: string[]): string[] {
  return accept.map((ext) => `.${ext.replace(/^\./, '')}`)
}

export function basename(path: string): string {
  const clean = String(path || '').split('?')[0].split('#')[0]
  const name = clean.split('/').pop() || ''
  try {
    return decodeURIComponent(name)
  } catch {
    return name
  }
}

export function fileExt(name: string): string {
  const base = basename(name)
  const dot = base.lastIndexOf('.')
  return dot > 0 && dot < base.length - 1 ? base.slice(dot + 1).toLowerCase() : ''
}

export function fileExtLabel(name: string): string {
  const ext = fileExt(name)
  return ext && ext.length <= 4 ? ext.toUpperCase() : ''
}

export function fileKind(name: string): LingyunFileKind {
  const ext = fileExt(name)
  if (ext === 'pdf') return 'pdf'
  if (WORD_EXTENSIONS.has(ext)) return 'word'
  if (EXCEL_EXTENSIONS.has(ext)) return 'excel'
  if (PPT_EXTENSIONS.has(ext)) return 'ppt'
  if (ARCHIVE_EXTENSIONS.has(ext)) return 'archive'
  return 'other'
}

export function isPreviewable(name: string): boolean {
  return PREVIEWABLE_EXTENSIONS.has(fileExt(name))
}

export function formatFileSize(size: number): string {
  const value = Number(size)
  if (!Number.isFinite(value) || value <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let next = value
  let index = 0
  while (next >= 1024 && index < units.length - 1) {
    next /= 1024
    index += 1
  }
  const rounded =
    index === 0
      ? Math.round(next)
      : next >= 10
        ? Math.round(next)
        : Math.round(next * 10) / 10
  return `${rounded} ${units[index]}`
}

export function normalizeUploadedFiles(
  value: Array<LingyunUploadedFile | string> | null | undefined,
): LingyunUploadedFile[] {
  const list = Array.isArray(value) ? value : []
  const seen = new Set<string>()
  const result: LingyunUploadedFile[] = []
  for (const entry of list) {
    let url = ''
    let name = ''
    let size = 0
    if (typeof entry === 'string') {
      url = entry.trim()
      name = basename(url)
    } else if (entry && typeof entry === 'object') {
      const record = entry as {
        url?: unknown
        name?: unknown
        size?: unknown
      }
      url = String(record.url || '').trim()
      name = String(record.name || '').trim()
      size = Number(record.size) || 0
    }
    if (!url || seen.has(url)) continue
    seen.add(url)
    result.push({
      url,
      name: name || basename(url) || url,
      size,
    })
  }
  return result
}

export function sameFileSequence(
  left: LingyunUploadedFile[],
  right: LingyunUploadedFile[],
): boolean {
  if (left.length !== right.length) return false
  return left.every(
    (file, index) =>
      file.url === right[index].url &&
      file.name === right[index].name &&
      file.size === right[index].size,
  )
}
