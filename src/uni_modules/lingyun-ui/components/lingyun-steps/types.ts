export type LingyunStepStatus = 'wait' | 'process' | 'finish' | 'error'

export type LingyunStepsDirection = 'horizontal' | 'vertical'

export interface LingyunStepItem {
  key: string
  title: string
  description?: string
  status?: LingyunStepStatus
  disabled?: boolean
}

export interface LingyunStepsChangePayload {
  key: string
  index: number
  item: LingyunStepItem
}
