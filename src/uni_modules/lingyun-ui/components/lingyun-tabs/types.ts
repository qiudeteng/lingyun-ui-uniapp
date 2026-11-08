export interface LingyunTabItem {
  key: string
  text: string
  icon?: string
  badge?: string | number
  disabled?: boolean
}

export type LingyunTabsVariant = 'underline' | 'pill'
