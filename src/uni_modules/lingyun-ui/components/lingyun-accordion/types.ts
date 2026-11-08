export interface LingyunAccordionItem {
  key: string
  title: string
  subtitle?: string
  content?: string
  disabled?: boolean
}

export interface LingyunAccordionChangePayload {
  key: string
  open: boolean
  openKeys: string[]
}
