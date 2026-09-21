/**
 * lingyun-ui 入口：在 createApp 后 `app.use(lingyunUi)`（须已 `app.use(pinia)`）
 */
import type { App, Plugin } from 'vue'
import { installLingyunFeedback } from './utils/feedback'
// #ifdef H5
import { installLingyunPageNav } from './components/lingyun-page-nav/mountLingyunPageNav'
// #endif

export * from './utils/feedback'

export const lingyunUi: Plugin = {
  install(app: App) {
    installLingyunFeedback(app)
    // #ifdef H5
    installLingyunPageNav(app)
    // #endif
  },
}

export default lingyunUi
