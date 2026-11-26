/**
 * 屏幕亮度读写（小程序 / App）。
 * Web 端不支持，调用会静默失败，不影响预览本身。
 */

type WxBrightness = {
  setScreenBrightness?: (opts: { value: number; fail?: () => void }) => void
  getScreenBrightness?: (opts: {
    success?: (res: { value?: number }) => void
    fail?: () => void
  }) => void
}

function wxBrightness(): WxBrightness | null {
  const host = globalThis as { wx?: WxBrightness }
  return host.wx && typeof host.wx.setScreenBrightness === 'function'
    ? host.wx
    : null
}

/** 读取当前屏幕亮度（0~1）；不支持或失败返回 null */
export function getLingyunScreenBrightness(): Promise<number | null> {
  return new Promise((resolve) => {
    const wx = wxBrightness()
    if (wx && wx.getScreenBrightness) {
      try {
        wx.getScreenBrightness({
          success: (res) => {
            resolve(typeof res.value === 'number' ? res.value : null)
          },
          fail: () => resolve(null),
        })
      } catch {
        resolve(null)
      }
      return
    }
    try {
      ;(uni as unknown as {
        getScreenBrightness: (opts: {
          success?: (res: { value?: number }) => void
          fail?: () => void
        }) => void
      }).getScreenBrightness({
        success: (res) => {
          resolve(typeof res.value === 'number' ? res.value : null)
        },
        fail: () => resolve(null),
      })
    } catch {
      resolve(null)
    }
  })
}

/** 设置屏幕亮度（0~1）；不支持时静默失败 */
export function setLingyunScreenBrightness(value: number): void {
  const safe = Math.min(1, Math.max(0, value))
  const wx = wxBrightness()
  if (wx && wx.setScreenBrightness) {
    try {
      wx.setScreenBrightness({ value: safe, fail: () => {} })
    } catch {
      /* ignore */
    }
    return
  }
  try {
    ;(uni as unknown as {
      setScreenBrightness: (opts: { value: number; fail?: () => void }) => void
    }).setScreenBrightness({ value: safe, fail: () => {} })
  } catch {
    /* ignore */
  }
}
