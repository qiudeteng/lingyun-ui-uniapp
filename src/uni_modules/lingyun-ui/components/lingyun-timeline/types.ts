export type LingyunTimelineStatus =
  | 'default'
  | 'active'
  | 'success'
  | 'warning'
  | 'error'

export interface LingyunTimelineItem {
  key: string
  title: string
  description?: string
  time?: string
  icon?: string
  color?: string
  status?: LingyunTimelineStatus
}

export interface LingyunTimelineClickPayload {
  key: string
  index: number
  item: LingyunTimelineItem
}
