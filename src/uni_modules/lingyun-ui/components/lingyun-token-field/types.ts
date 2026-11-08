export interface LingyunTokenFieldChangePayload {
  tokens: string[]
}

export interface LingyunTokenFieldAddPayload {
  token: string
  tokens: string[]
}

export interface LingyunTokenFieldRemovePayload {
  token: string
  index: number
  tokens: string[]
}

export type LingyunTokenFieldInvalidReason = 'duplicate' | 'max' | 'custom'

export interface LingyunTokenFieldInvalidPayload {
  value: string
  reason: LingyunTokenFieldInvalidReason
}
