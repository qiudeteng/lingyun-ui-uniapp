/**
 * lingyun-ui 入口：在 createApp 后 `app.use(lingyunUi)`。
 */
import type { App, Plugin } from 'vue'
import { installLingyunFeedback } from './utils/feedback'
import { installLingyunScreen } from './utils/screen'
import { useLingyunTheme } from './utils/theme'
// #ifdef H5
import { installLingyunPageNav } from './components/lingyun-page-nav/mountLingyunPageNav'
// #endif

export * from './utils/feedback'
export * from './utils/pageNavAdapter'
export * from './utils/pageConfig'
export * from './utils/pageLayout'
export * from './utils/theme'
export {
  isLingyunWideScreen,
  lingyun,
  refreshLingyunScreen,
} from './utils/screen'
export {
  LINGYUN_TABBAR_CONTENT_HEIGHT_PX,
  LINGYUN_TABBAR_HEIGHT_PX,
  LINGYUN_TABBAR_HEIGHT_SAFE_PX,
  LINGYUN_TABBAR_PAD_BOTTOM_PX,
  LINGYUN_TABBAR_PAD_TOP_PX,
} from './components/lingyun-tabbars/tabbarMetrics'
export type {
  LingyunDevice,
  LingyunEnv,
  LingyunFold,
  LingyunFoldable,
  LingyunOs,
  LingyunScreen,
} from './utils/screen'

export const lingyunUi: Plugin = {
  install(app: App) {
    useLingyunTheme().init()
    installLingyunScreen(app)
    installLingyunFeedback(app)
    // #ifdef H5
    installLingyunPageNav(app)
    // #endif
  },
}

export default lingyunUi
