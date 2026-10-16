import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLingyunTheme } from '@/uni_modules/lingyun-ui'

export const useThemeStore = defineStore('theme', () => {
  const theme = useLingyunTheme()
  const preference = computed(() => theme.preference)
  const resolved = computed(() => theme.resolved)
  const rootClass = computed(() => theme.rootClass)

  return {
    preference,
    resolved,
    rootClass,
    apply: theme.apply,
    init: theme.init,
    setPreference: theme.setPreference,
    syncFromSystem: theme.syncFromSystem,
  }
})
