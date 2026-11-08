export type LingyunBarcodeFormat = 'CODE128' | 'CODE39' | 'EAN13'

export type LingyunBarcodeCharset = 'auto' | 'A' | 'B' | 'C'

export interface LingyunBarcodeReadyPayload {
  format: LingyunBarcodeFormat
  text: string
  modules: number
  width: number
  height: number
}

export interface LingyunBarcodeErrorPayload {
  message: string
}
