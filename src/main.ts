import { createSSRApp } from 'vue'
import App from './App.vue'

import { installSystemInfoSyncCompat } from './utils/system-info'
import { createPiniaStore } from './stores'
import router from './router'
import { guardColdStart } from './router/guards'
import { lingyunUi } from '@/uni_modules/lingyun-ui'

installSystemInfoSyncCompat()

const pinia = createPiniaStore()
export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  app.use(lingyunUi)
  app.use(router)
  app.mixin({
    onShow() {
      guardColdStart()
    },
  })

  return { app }
}
