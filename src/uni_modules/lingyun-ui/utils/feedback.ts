/**
 * lingyun-ui 命令式 Toast / HUD / Alert
 * 经 `app.use(lingyunUi)` 挂到 `uni.showLingyunToast` 等，页面无需 import。
 * 状态 Pinia 单例；宿主在 `lingyun-app-page` → `lingyun-feedback-host`。
 */
import type { App } from 'vue'
import { ref, shallowRef } from 'vue'
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

export type LingyunAlertInput = {
  key?: string
  type?: string
  password?: boolean
  value?: string
  placeholder?: string
  maxlength?: number
}

export type LingyunAlertAction = {
  key?: string
  text: string
  /** cancel / destructive / primary / secondary */
  role?: string
  primary?: boolean
  disabled?: boolean
  /** false：点了不关闭、Promise 也不结束（如先校验输入），之后自己调 hideLingyunAlert */
  close?: boolean
  onClick?: (payload: { action: LingyunAlertAction; index: number; values: string[] }) => void
}

export type LingyunAlertOptions = {
  title?: string
  message?: string
  /** 不传时按 confirmText / cancelText / showCancel 生成 */
  actions?: LingyunAlertAction[]
  confirmText?: string
  cancelText?: string
  /** 不传 actions 时是否带「取消」按钮 */
  showCancel?: boolean
  /** auto / row / stack */
  layout?: string
  /** 最多两行输入框 */
  inputs?: LingyunAlertInput[]
  maskClosable?: boolean
}

export type LingyunAlertResult = {
  /** 点了非 cancel 角色的按钮 */
  confirm: boolean
  /** 点了 cancel 按钮，或点遮罩 / hideLingyunAlert / 被新的 Alert 顶掉 */
  cancel: boolean
  /** 按钮下标；不是点按钮关闭时为 -1 */
  index: number
  action: LingyunAlertAction | null
  /** 输入框的值 */
  values: string[]
}

type AlertProps = {
  title: string
  message: string
  actions: LingyunAlertAction[]
  layout: string
  inputs: LingyunAlertInput[]
  maskClosable: boolean
}

function resolveAlertProps(options: LingyunAlertOptions | string): AlertProps {
  const opts: LingyunAlertOptions =
    typeof options === 'string' ? { message: options } : options || {}
  let actions = Array.isArray(opts.actions) ? opts.actions.filter((a) => a && a.text) : []
  if (!actions.length) {
    actions = [{ text: opts.confirmText || '确定', primary: true }]
    if (opts.showCancel) actions.unshift({ text: opts.cancelText || '取消', role: 'cancel' })
  }
  return {
    title: opts.title || '',
    message: opts.message || '',
    actions,
    layout: opts.layout || 'auto',
    inputs: Array.isArray(opts.inputs) ? opts.inputs.slice(0, 2) : [],
    maskClosable: !!opts.maskClosable,
  }
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

  const alertShow = ref(false)
  /** actions 里可能带 onClick，不做深层响应 */
  const alertProps = shallowRef<AlertProps>(resolveAlertProps({}))
  /** 每次 show 递增：新 Alert 顶掉旧的时重建组件，输入框值不串 */
  const alertEpoch = ref(0)
  let alertResolve: ((result: LingyunAlertResult) => void) | null = null

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

  function dismissed(values: string[] = []): LingyunAlertResult {
    return { confirm: false, cancel: true, index: -1, action: null, values }
  }

  /** 结束当前 Promise；只认第一次 */
  function settleAlert(result: LingyunAlertResult): void {
    const resolve = alertResolve
    alertResolve = null
    if (resolve) resolve(result)
  }

  function showAlert(options: LingyunAlertOptions | string): Promise<LingyunAlertResult> {
    settleAlert(dismissed())
    alertProps.value = resolveAlertProps(options)
    alertEpoch.value += 1
    alertShow.value = true
    return new Promise((resolve) => {
      alertResolve = resolve
    })
  }

  function hideAlert(): void {
    alertShow.value = false
    settleAlert(dismissed())
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
    alertShow,
    alertProps,
    alertEpoch,
    showAlert,
    hideAlert,
    settleAlert,
    dismissed,
  }
})

function feedbackStore() {
  const pinia = getActivePinia()
  if (!pinia) {
    console.warn('[lingyun-ui] Pinia 未就绪，无法显示 Toast/HUD/Alert')
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

/** 打开 Alert；Promise 在关闭时给出点了哪个按钮，不会 reject */
export function showLingyunAlert(options: LingyunAlertOptions | string): Promise<LingyunAlertResult> {
  const store = feedbackStore()
  if (!store) return Promise.resolve({ confirm: false, cancel: true, index: -1, action: null, values: [] })
  return store.showAlert(options)
}

export function hideLingyunAlert(): void {
  feedbackStore()?.hideAlert()
}

type UniFeedback = {
  showLingyunToast: typeof showLingyunToast
  hideLingyunToast: typeof hideLingyunToast
  showLingyunHud: typeof showLingyunHud
  hideLingyunHud: typeof hideLingyunHud
  showLingyunAlert: typeof showLingyunAlert
  hideLingyunAlert: typeof hideLingyunAlert
}

/** 挂到 uni + Vue globalProperties，任意场景可直接调用 */
export function installLingyunFeedback(app?: App): void {
  const api: UniFeedback = {
    showLingyunToast,
    hideLingyunToast,
    showLingyunHud,
    hideLingyunHud,
    showLingyunAlert,
    hideLingyunAlert,
  }

  const u = uni as typeof uni & UniFeedback
  u.showLingyunToast = api.showLingyunToast
  u.hideLingyunToast = api.hideLingyunToast
  u.showLingyunHud = api.showLingyunHud
  u.hideLingyunHud = api.hideLingyunHud
  u.showLingyunAlert = api.showLingyunAlert
  u.hideLingyunAlert = api.hideLingyunAlert

  if (app) {
    app.config.globalProperties.$showLingyunToast = api.showLingyunToast
    app.config.globalProperties.$hideLingyunToast = api.hideLingyunToast
    app.config.globalProperties.$showLingyunHud = api.showLingyunHud
    app.config.globalProperties.$hideLingyunHud = api.hideLingyunHud
    app.config.globalProperties.$showLingyunAlert = api.showLingyunAlert
    app.config.globalProperties.$hideLingyunAlert = api.hideLingyunAlert
  }
}
