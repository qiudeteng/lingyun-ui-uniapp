/**
 * lingyun-ui 命令式 Toast / HUD
 * 经 `app.use(lingyunUi)` 挂到 `uni.showLingyunToast` 等，页面无需 import。
 * 状态 Pinia 单例；宿主在 `lingyun-app-page` → `lingyun-feedback-host`。
 */
import type { App } from 'vue'
import { ref } from 'vue'
import { defineStore, getActivePinia } from 'pinia'

export type LingyunToastType = 'default' | 'success' | 'error' | 'loading'

export type LingyunToastOptions = {
  text?: string
  type?: LingyunToastType
  duration?: number
}

export type LingyunHudOptions = {
  text?: string
  maskClosable?: boolean
}

export const useLingyunFeedbackStore = defineStore('lingyunFeedback', () => {
  const toastShow = ref(false)
  const toastText = ref('')
  const toastType = ref<LingyunToastType>('default')
  const toastDuration = ref(2000)
  /** 每次 show 递增，驱动 host 强制重建以重播进场并重置计时 */
  const toastEpoch = ref(0)

  const hudShow = ref(false)
  const hudText = ref('')
  const hudMaskClosable = ref(false)

  function showToast(options: LingyunToastOptions | string): void {
    const opts: LingyunToastOptions =
      typeof options === 'string' ? { text: options } : options || {}
    toastText.value = opts.text || ''
    toastType.value = opts.type || 'default'
    toastDuration.value =
      opts.type === 'loading'
        ? opts.duration != null
          ? opts.duration
          : 0
        : opts.duration != null
          ? opts.duration
          : 2000
    toastEpoch.value += 1
    toastShow.value = true
  }

  function hideToast(): void {
    toastShow.value = false
  }

  function showHud(options: LingyunHudOptions | string = {}): void {
    const opts: LingyunHudOptions =
      typeof options === 'string' ? { text: options } : options || {}
    hudText.value = opts.text || ''
    hudMaskClosable.value = !!opts.maskClosable
    hudShow.value = true
  }

  function hideHud(): void {
    hudShow.value = false
  }

  return {
    toastShow,
    toastText,
    toastType,
    toastDuration,
    toastEpoch,
    hudShow,
    hudText,
    hudMaskClosable,
    showToast,
    hideToast,
    showHud,
    hideHud,
  }
})

function feedbackStore() {
  const pinia = getActivePinia()
  if (!pinia) {
    console.warn('[lingyun-ui] Pinia 未就绪，无法显示 Toast/HUD')
    return null
  }
  return useLingyunFeedbackStore(pinia)
}

export function showLingyunToast(options: LingyunToastOptions | string): void {
  feedbackStore()?.showToast(options)
}

export function hideLingyunToast(): void {
  feedbackStore()?.hideToast()
}

export function showLingyunHud(options: LingyunHudOptions | string = {}): void {
  feedbackStore()?.showHud(options)
}

export function hideLingyunHud(): void {
  feedbackStore()?.hideHud()
}

type UniFeedback = {
  showLingyunToast: typeof showLingyunToast
  hideLingyunToast: typeof hideLingyunToast
  showLingyunHud: typeof showLingyunHud
  hideLingyunHud: typeof hideLingyunHud
}

/** 挂到 uni + Vue globalProperties，任意场景可直接调用 */
export function installLingyunFeedback(app?: App): void {
  const api: UniFeedback = {
    showLingyunToast,
    hideLingyunToast,
    showLingyunHud,
    hideLingyunHud,
  }

  const u = uni as typeof uni & UniFeedback
  u.showLingyunToast = api.showLingyunToast
  u.hideLingyunToast = api.hideLingyunToast
  u.showLingyunHud = api.showLingyunHud
  u.hideLingyunHud = api.hideLingyunHud

  if (app) {
    app.config.globalProperties.$showLingyunToast = api.showLingyunToast
    app.config.globalProperties.$hideLingyunToast = api.hideLingyunToast
    app.config.globalProperties.$showLingyunHud = api.showLingyunHud
    app.config.globalProperties.$hideLingyunHud = api.hideLingyunHud
  }
}
