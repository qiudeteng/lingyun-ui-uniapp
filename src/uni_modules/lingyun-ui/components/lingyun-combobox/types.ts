export type LingyunComboboxValue = string | number | null

export interface LingyunComboboxItem {
  label: string
  value: string | number
  description?: string
  disabled?: boolean
}

export interface LingyunComboboxChangePayload {
  value: LingyunComboboxValue
  item: LingyunComboboxItem | null
}
