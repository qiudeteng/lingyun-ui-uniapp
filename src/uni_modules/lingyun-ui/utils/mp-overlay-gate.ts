/**
 * 微信小程序：canvas 等原生层会盖过普通 view 浮层（z-index / root-portal 无效）。
 * 浮层打开时 begin，完全关闭后 end；图表监听后截图并 hidden canvas。
 */

type Listener = (open: boolean) => void

let depth = 0
const listeners = new Set<Listener>()

function emit(): void {
  const open = depth > 0
  listeners.forEach((fn) => {
    try {
      fn(open)
    } catch {
      /* ignore listener errors */
    }
  })
}

/** 浮层进入（enter/open/leave 任一可见阶段）时调用 */
export function beginLingyunMpOverlay(): void {
  depth += 1
  if (depth === 1) emit()
}

/** 浮层完全卸下（phase 清空）时调用 */
export function endLingyunMpOverlay(): void {
  if (depth <= 0) return
  depth -= 1
  if (depth === 0) emit()
}

export function isLingyunMpOverlayOpen(): boolean {
  return depth > 0
}

export function onLingyunMpOverlayChange(fn: Listener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/**
 * 按 shouldHold 同步引用计数。返回最新 hold 状态，便于写回组件 data。
 * @example
 * this._hold = syncLingyunMpOverlayHold(this._hold, !!this.phase)
 */
export function syncLingyunMpOverlayHold(held: boolean, shouldHold: boolean): boolean {
  if (shouldHold === held) return held
  if (shouldHold) beginLingyunMpOverlay()
  else endLingyunMpOverlay()
  return shouldHold
}
