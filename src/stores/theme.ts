/**
 * 外观主题 Store
 * preference：用户选择（含跟随系统）；resolved：实际生效的 light / dark
 * 小程序无 document：页面 CSS 靠根节点 theme-*（lingyun-app-page）+ setBackgroundColor
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  applyResolvedTheme,
  readThemePreference,
  resolveTheme,
  watchSystemTheme,
  writeThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from '@/utils/theme'

export const useThemeStore = defineStore('theme', () => {
  const preference = ref<ThemePreference>(readThemePreference())
  const resolved = ref<ResolvedTheme>(resolveTheme(preference.value))
  const rootClass = computed(() => `theme-${resolved.value}`)

  let stopWatch: (() => void) | undefined

  function apply(): void {
    resolved.value = resolveTheme(preference.value)
    applyResolvedTheme(resolved.value)
  }

  function setPreference(next: ThemePreference): void {
    if (preference.value === next) {
      apply()
      return
    }
    preference.value = next
    writeThemePreference(next)
    apply()
  }

  /** 系统主题变化时调用（仅 preference=system 时改 resolved） */
  function syncFromSystem(): void {
    if (preference.value !== 'system') return
    apply()
  }

  function init(): void {
    apply()
    stopWatch?.()
    stopWatch = watchSystemTheme(() => {
      syncFromSystem()
    })
  }

  return {
    preference,
    resolved,
    rootClass,
    setPreference,
    syncFromSystem,
    apply,
    init,
  }
})
