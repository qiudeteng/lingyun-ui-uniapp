export type LingyunQrcodeEcc = 'L' | 'M' | 'Q' | 'H'

export interface LingyunQrcodeReadyPayload {
  size: number
  version: number
  modules: number
}

export interface LingyunQrcodeErrorPayload {
  message: string
}
