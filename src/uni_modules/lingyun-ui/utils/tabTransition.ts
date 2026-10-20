/**
 * 一级 Tab 跨页过渡状态。
 * 页面壳点击 Tab 时记录 from/to，新页面挂载后在短时间内消费一次，
 * 用于 Tab 指示器滑入与内容淡入；reLaunch 本身没有页面动画。
 */
export interface LingyunTabTransition {
  fromKey: string
  toKey: string
  at: number
}

const TRANSITION_TTL = 1500

let pending: LingyunTabTransition | null = null

export function beginLingyunTabTransition(fromKey: string, toKey: string): void {
  pending = {
    fromKey: String(fromKey || ''),
    toKey: String(toKey || ''),
    at: Date.now(),
  }
}

/** 消费一次；超时或目标 key 不匹配时丢弃 */
export function consumeLingyunTabTransition(
  activeKey?: string,
): LingyunTabTransition | null {
  const item = pending
  pending = null
  if (!item) return null
  if (Date.now() - item.at > TRANSITION_TTL) return null
  if (activeKey && item.toKey && String(activeKey) !== item.toKey) return null
  return item
}

export function clearLingyunTabTransition(): void {
  pending = null
}
