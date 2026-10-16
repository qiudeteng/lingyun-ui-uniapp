import { createSSRApp } from 'vue'
import App from './App.vue'

import { installSystemInfoSyncCompat } from './utils/system-info'
import { createPiniaStore } from './stores'
import router from './router'
import { lingyunUi } from '@/uni_modules/lingyun-ui'
import { configureLingyunUi } from '@/config/lingyun-ui'
// #ifdef H5
import { installDemoThemeSwitch } from '@/components/demo-theme-switch/mountDemoThemeSwitch'
// #endif

installSystemInfoSyncCompat()

const pinia = createPiniaStore()
export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  configureLingyunUi()
  app.use(lingyunUi)
  // #ifdef H5
  installDemoThemeSwitch(app)
  // #endif
  app.use(router)

  return { app }
}
