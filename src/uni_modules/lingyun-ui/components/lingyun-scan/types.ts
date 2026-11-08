export interface LingyunScanOptions {
  scanType: string[]
  onlyFromCamera: boolean
  scanText: string
}

export interface LingyunScanResult {
  result: string
  scanType: string
  charSet: string
  path: string
  rawData?: string
}

export type LingyunScanFn = (
  options: LingyunScanOptions,
) => Promise<LingyunScanResult | string> | LingyunScanResult | string

export interface LingyunScanErrorPayload {
  message: string
  error?: unknown
}

export type LingyunScanVariant =
  | 'borderedProminent'
  | 'bordered'
  | 'borderless'
  | 'glass'
