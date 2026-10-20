/**
 * 宽屏左侧菜单换页过渡。
 * 与 Tab 跨页过渡分开：侧栏用 from/to 路径，Tab 用 key。
 */
import { normalizeLingyunPagePath } from './pageNavAdapter'

export type LingyunNavDirection = 'top' | 'bottom' | 'left' | 'right'

export interface LingyunNavTransition {
  from: string
  to: string
  direction: LingyunNavDirection
  at: number
}

const TRANSITION_TTL = 1500

let pending: LingyunNavTransition | null = null

export function beginLingyunNavTransition(
  from: string,
  to: string,
  direction: LingyunNavDirection = 'bottom',
): void {
  const fromPath = normalizeLingyunPagePath(from)
  const toPath = normalizeLingyunPagePath(to)
  if (!fromPath || !toPath || fromPath === toPath) {
    pending = null
    return
  }
  pending = { from: fromPath, to: toPath, direction, at: Date.now() }
}

/** 消费一次；超时或目标路径不匹配时丢弃 */
export function consumeLingyunNavTransition(
  activePath: string,
): LingyunNavTransition | null {
  const item = pending
  pending = null
  if (!item) return null
  if (Date.now() - item.at > TRANSITION_TTL) return null
  const active = normalizeLingyunPagePath(activePath)
  if (active && item.to && active !== item.to) return null
  return item
}

export function clearLingyunNavTransition(): void {
  pending = null
}
