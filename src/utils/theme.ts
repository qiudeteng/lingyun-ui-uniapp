/**
 * 外观主题：浅色 / 暗黑 / 跟随系统
 * - H5：写 documentElement class / data-theme
 * - 小程序：无 DOM，靠页面根节点 `.theme-*`（lingyun-app-page）+ setBackgroundColor
 * - 官方 darkmode：manifest darkmode + theme.json（见 uni-app 暗黑适配指南）
 * CSS 变量见 lingyun-ui/styles/setting/_color.scss
 */
export const THEME_STORAGE_KEY = 'lingyun-theme'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

/** 与 theme.json / System Colors 对齐的原生窗体色 */
export const THEME_NATIVE_CHROME: Record<
  ResolvedTheme,
  {
    backgroundColor: string
    frontColor: '#000000' | '#ffffff'
  }
> = {
  light: {
    backgroundColor: '#f2f2f7',
    frontColor: '#000000',
  },
  dark: {
    /* Grouped Primary：与列表卡面 #1c1c1e 拉开对比 */
    backgroundColor: '#000000',
    frontColor: '#ffffff',
  },
}

function isPreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

/** 读取系统当前外观（需 manifest 对应端 darkmode:true 才有可靠 theme 字段） */
export function getSystemTheme(): ResolvedTheme {
  try {
    const info = uni.getSystemInfoSync() as UniApp.GetSystemInfoResult & {
      osTheme?: string
      hostTheme?: string
      theme?: string
    }
    const os = info.theme || info.osTheme || info.hostTheme
    if (os === 'dark' || os === 'light') return os
  } catch {
    /* ignore */
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return 'light'
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference
}

export function readThemePreference(): ThemePreference {
  try {
    const value = uni.getStorageSync(THEME_STORAGE_KEY)
    if (isPreference(value)) return value
    if (value && typeof value === 'object' && isPreference((value as { preference?: unknown }).preference)) {
      return (value as { preference: ThemePreference }).preference
    }
  } catch {
    /* ignore */
  }
  return 'system'
}

export function writeThemePreference(preference: ThemePreference): void {
  uni.setStorageSync(THEME_STORAGE_KEY, preference)
}

function applyDocumentTheme(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.dataset.theme = theme
  root.classList.remove('theme-light', 'theme-dark')
  root.classList.add(`theme-${theme}`)
  root.style.colorScheme = theme
  if (document.body) {
    document.body.classList.remove('theme-light', 'theme-dark')
    document.body.classList.add(`theme-${theme}`)
  }
}

/** 小程序 / App 窗体背景与导航前景（theme.json 只跟系统；手动切换靠此 API） */
function applyNativePageChrome(theme: ResolvedTheme): void {
  const chrome = THEME_NATIVE_CHROME[theme]
  try {
    uni.setBackgroundColor({
      backgroundColor: chrome.backgroundColor,
      backgroundColorTop: chrome.backgroundColor,
      backgroundColorBottom: chrome.backgroundColor,
    })
  } catch {
    /* 部分端无此 API */
  }
  try {
    uni.setNavigationBarColor({
      frontColor: chrome.frontColor,
      backgroundColor: chrome.backgroundColor,
      animation: {
        duration: 0,
        timingFunc: 'linear',
      },
    })
  } catch {
    /* custom 导航时也可能失败，忽略 */
  }
}

/** 把已解析主题写到运行时（H5 DOM + 各端窗体色） */
export function applyResolvedTheme(theme: ResolvedTheme): void {
  applyDocumentTheme(theme)
  applyNativePageChrome(theme)
}

type ThemeChangePayload = {
  theme?: string
  osTheme?: string
}

/** 监听系统外观变化；返回取消订阅函数 */
export function watchSystemTheme(onChange: (theme: ResolvedTheme) => void): () => void {
  const handle = (payload?: ThemeChangePayload) => {
    const next =
      payload?.theme === 'dark' || payload?.osTheme === 'dark'
        ? 'dark'
        : payload?.theme === 'light' || payload?.osTheme === 'light'
          ? 'light'
          : getSystemTheme()
    onChange(next)
  }

  const listeners: Array<() => void> = []

  const uniOnThemeChange = uni as typeof uni & {
    onThemeChange?: (cb: (res: ThemeChangePayload) => void) => void
    offThemeChange?: (cb: (res: ThemeChangePayload) => void) => void
    onOsThemeChange?: (cb: (res: ThemeChangePayload) => void) => void
    offOsThemeChange?: (cb: (res: ThemeChangePayload) => void) => void
  }

  if (typeof uniOnThemeChange.onThemeChange === 'function') {
    uniOnThemeChange.onThemeChange(handle)
    listeners.push(() => uniOnThemeChange.offThemeChange?.(handle))
  }
  if (typeof uniOnThemeChange.onOsThemeChange === 'function') {
    uniOnThemeChange.onOsThemeChange(handle)
    listeners.push(() => uniOnThemeChange.offOsThemeChange?.(handle))
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onMedia = (event: MediaQueryListEvent) => {
      onChange(event.matches ? 'dark' : 'light')
    }
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onMedia)
      listeners.push(() => mq.removeEventListener('change', onMedia))
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(onMedia)
      listeners.push(() => mq.removeListener(onMedia))
    }
  }

  return () => {
    listeners.forEach((off) => off())
  }
}
