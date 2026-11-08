export type LingyunLoadMoreStatus = 'more' | 'loading' | 'nomore' | 'error'

export interface LingyunLoadMorePayload {
  source: 'click' | 'auto'
}
