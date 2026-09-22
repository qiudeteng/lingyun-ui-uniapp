/// <reference types="vite/client" />

export {}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

/** uni-app WXS 模块（如 lingyun-swipe-action-item/wx.wxs） */
declare module '*.wxs' {
  const mod: Record<string, unknown>
  export default mod
}

type LingyunToastCallOptions =
  | string
  | {
      text?: string
      type?: 'default' | 'success' | 'error' | 'loading'
      duration?: number
    }

type LingyunHudCallOptions = string | { text?: string; maskClosable?: boolean }

declare global {
  /** 与 @dcloudio/types 合并：扩展全局 Uni */
  interface Uni {
    showLingyunToast(options?: LingyunToastCallOptions): void
    hideLingyunToast(): void
    showLingyunHud(options?: LingyunHudCallOptions): void
    hideLingyunHud(): void
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $showLingyunToast(options?: LingyunToastCallOptions): void
    $hideLingyunToast(): void
    $showLingyunHud(options?: LingyunHudCallOptions): void
    $hideLingyunHud(): void
  }
}

