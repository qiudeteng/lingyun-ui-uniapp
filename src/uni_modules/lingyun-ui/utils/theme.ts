import { computed, ref } from 'vue'

export type LingyunThemePreference = 'light' | 'dark' | 'system'
export type LingyunResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'lingyun-theme'
const preference = ref<LingyunThemePreference>('system')
const resolved = ref<LingyunResolvedTheme>('light')
const rootClass = computed(() => `theme-${resolved.value}`)
let stopSystemWatch: (() => void) | undefined

function isPreference(value: unknown): value is LingyunThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

function systemTheme(): LingyunResolvedTheme {
  try {
    const info =
      typeof uni.getAppBaseInfo === 'function'
        ? uni.getAppBaseInfo()
        : uni.getSystemInfoSync()
    const value = String(
      (info as { theme?: string; osTheme?: string; hostTheme?: string }).theme ||
      (info as { osTheme?: string }).osTheme ||
      (info as { hostTheme?: string }).hostTheme ||
      '',
    )
    if (value === 'dark' || value === 'light') return value
  } catch {
    /* ignore */
  }
  // #ifdef H5
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  // #endif
  return 'light'
}

function resolvePreference(value: LingyunThemePreference): LingyunResolvedTheme {
  return value === 'system' ? systemTheme() : value
}

function readPreference(): LingyunThemePreference {
  try {
    const value = uni.getStorageSync(STORAGE_KEY)
    if (isPreference(value)) return value
    if (value && typeof value === 'object') {
      const nested = (value as { preference?: unknown }).preference
      if (isPreference(nested)) return nested
    }
  } catch {
    /* ignore */
  }
  return 'system'
}

function applyDocument(theme: LingyunResolvedTheme): void {
  // #ifdef H5
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
  // #endif
}

function applyNative(theme: LingyunResolvedTheme): void {
  const backgroundColor = theme === 'dark' ? '#000000' : '#f2f2f7'
  const frontColor = theme === 'dark' ? '#ffffff' : '#000000'
  try {
    uni.setBackgroundColor?.({
      backgroundColor,
      backgroundColorTop: backgroundColor,
      backgroundColorBottom: backgroundColor,
      fail() {},
    })
  } catch {
    /* unsupported */
  }
  try {
    uni.setNavigationBarColor?.({
      frontColor,
      backgroundColor,
      animation: { duration: 0, timingFunc: 'linear' },
      fail() {},
    })
  } catch {
    /* custom navigation or unsupported */
  }
}

function apply(): void {
  resolved.value = resolvePreference(preference.value)
  applyDocument(resolved.value)
  applyNative(resolved.value)
}

function setPreference(value: LingyunThemePreference): void {
  preference.value = value
  try {
    uni.setStorageSync(STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
  apply()
}

function syncFromSystem(): void {
  if (preference.value === 'system') apply()
}

function watchSystem(): () => void {
  const listeners: Array<() => void> = []
  const api = uni as typeof uni & {
    onThemeChange?: (cb: () => void) => void
    offThemeChange?: (cb: () => void) => void
    onOsThemeChange?: (cb: () => void) => void
    offOsThemeChange?: (cb: () => void) => void
  }
  api.onThemeChange?.(syncFromSystem)
  api.onOsThemeChange?.(syncFromSystem)
  if (api.offThemeChange) listeners.push(() => api.offThemeChange?.(syncFromSystem))
  if (api.offOsThemeChange) listeners.push(() => api.offOsThemeChange?.(syncFromSystem))
  // #ifdef H5
  if (typeof window !== 'undefined' && window.matchMedia) {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => syncFromSystem()
    query.addEventListener?.('change', handler)
    listeners.push(() => query.removeEventListener?.('change', handler))
  }
  // #endif
  return () => listeners.forEach((off) => off())
}

function init(): void {
  preference.value = readPreference()
  apply()
  stopSystemWatch?.()
  stopSystemWatch = watchSystem()
}

export function useLingyunTheme() {
  return {
    get preference() {
      return preference.value
    },
    get resolved() {
      return resolved.value
    },
    get rootClass() {
      return rootClass.value
    },
    apply,
    init,
    setPreference,
    syncFromSystem,
  }
}
