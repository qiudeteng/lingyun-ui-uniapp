/**
 * 挂到带 phase 的浮层：phase 非空时占住 mp-overlay-gate，卸下时释放。
 * 仅影响引用计数；H5 也可跑，图表只在微信端响应。
 */
import { syncLingyunMpOverlayHold } from './mp-overlay-gate'

type HoldHost = {
  phase?: string
  _lingyunMpOverlayHold?: boolean
}

export const mpOverlayHoldMixin = {
  data() {
    return {
      _lingyunMpOverlayHold: false,
    }
  },
  watch: {
    phase: {
      handler(this: HoldHost, value: string) {
        this._lingyunMpOverlayHold = syncLingyunMpOverlayHold(!!this._lingyunMpOverlayHold, !!value)
      },
      immediate: true,
    },
  },
  beforeUnmount(this: HoldHost) {
    this._lingyunMpOverlayHold = syncLingyunMpOverlayHold(!!this._lingyunMpOverlayHold, false)
  },
}
