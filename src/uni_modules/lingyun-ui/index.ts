/**
 * lingyun-ui 入口：在 createApp 后 `app.use(lingyunUi)`。
 */
import type { App, Plugin } from 'vue'
import { installLingyunFeedback } from './utils/feedback'
import { installLingyunScreen } from './utils/screen'
import { useLingyunTheme } from './utils/theme'
// #ifdef H5
import { installLingyunPageNav } from './components/lingyun-page-nav/mountLingyunPageNav'
import { installLingyunH5Scrollbar } from './utils/h5Scrollbar'
// #endif

export * from './utils/amountFormat'
export * from './utils/dateFormat'
export * from './utils/feedback'
export * from './utils/layoutAdapter'
export * from './utils/pageNavAdapter'
export * from './utils/pageConfig'
export * from './utils/pageLayout'
export * from './utils/pageMenu'
export * from './utils/theme'
export * from './utils/themeSwitch'
export {
  configureLingyunUpload,
  type LingyunUploadAuthorization,
} from './utils/upload'
export {
  closeLingyunContentCover,
  installLingyunContentCovers,
  openLingyunContentCover,
  useLingyunInContentCover,
} from './utils/contentCover'
export {
  commitLingyunToolbarPicker,
  lingyunToolbarPicker,
  setLingyunToolbarPicker,
  setLingyunToolbarPickerEnabled,
  setLingyunToolbarPickerValue,
  type LingyunToolbarPickerConfig,
  type LingyunToolbarPickerOption,
} from './utils/toolbarPicker'
// #ifdef H5
export * from './utils/h5Scrollbar'
// #endif
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
export { isLingyunWeixinPc } from './components/lingyun-toolbars/getLingyunNavSafeInset'
export type {
  LingyunDateSwitcherChange,
  LingyunDateSwitcherLimit,
  LingyunDateSwitcherMode,
  LingyunDateSwitcherPayload,
  LingyunDateSwitcherRange,
  LingyunDateSwitcherValue,
} from './components/lingyun-date-switcher/types'
export type { LingyunSplitLayoutChange } from './components/lingyun-split-layout/types'
export type {
  LingyunDevice,
  LingyunDuoPose,
  LingyunEnv,
  LingyunFold,
  LingyunFoldable,
  LingyunFormFactor,
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
    installLingyunH5Scrollbar()
    // #endif
  },
}

export default lingyunUi
