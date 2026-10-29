import { createSSRApp } from 'vue'
import App from './App.vue'

import { installSystemInfoSyncCompat } from './utils/system-info'
import { createPiniaStore } from './stores'
import router from './router'
import { lingyunUi, setLingyunThemeSwitchVisible } from '@/uni_modules/lingyun-ui'
import { configureLingyunUi } from '@/config/lingyun-ui'

installSystemInfoSyncCompat()

const pinia = createPiniaStore()
export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  configureLingyunUi()
  setLingyunThemeSwitchVisible(true)
  app.use(lingyunUi)
  app.use(router)

  return { app }
}
