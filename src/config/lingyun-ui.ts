import { toRef } from 'vue'
import {
  configureLingyunPageNav,
  setLingyunPageConfig,
} from '@/uni_modules/lingyun-ui'
import { DEMO_PAGE_CONFIG } from './pageTabs'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { pageRequiresLogin } from '@/router/guards'
import {
  LINGYUN_PAGE_NAV_GUEST_HOME,
  LINGYUN_PAGE_NAV_HOME,
  clearLingyunPageNavIntent,
  getLingyunPageNavIntent,
  getLingyunPageNavProfile,
  getLingyunPageNavScrollTop,
  getLingyunPageNavSections,
  resolveLingyunPageUrl,
  setLingyunPageNavIntent,
  setLingyunPageNavScrollTop,
  useLingyunPageNavIntent,
} from '@/router/pageNav'
import {
  clearLingyunPageHost,
  ensureLingyunWidePageHost,
  hostedFromText,
  hostedPagePath,
  isLingyunTabHostRoute,
  openLingyunHostedPage,
  openLingyunTabHostPage,
  pageHostState,
} from '@/router/pageHost'

/** 把宿主工程的业务状态与路由能力注入 lingyun-ui；组件包本身不反向依赖这些文件。 */
export function configureLingyunUi(): void {
  /*
   * 接入已有型号判断时在这里注入（未接入时页面壳使用 lingyun.formFactor / duoPose 兜底）：
   * configureLingyunLayout({
   *   getFormFactor: () => detectFormFactor(),
   *   getDuoPose: () => detectDuoPose(),
   * })
   */
  configureLingyunPageNav({
    home: LINGYUN_PAGE_NAV_HOME,
    guestHome: LINGYUN_PAGE_NAV_GUEST_HOME,
    isLogin: () => useAuthStore().isLogin,
    pageRequiresLogin,
    getSections: getLingyunPageNavSections,
    getProfile: getLingyunPageNavProfile,
    getStoreOptions: () => useUserStore().storeOptions,
    getStoreName: () => useUserStore().storeName,
    getStoreId: () => useUserStore().storeId,
    selectStore: (id) => useUserStore().selectStore(id),
    resolvePageUrl: resolveLingyunPageUrl,
    openHostedPage: openLingyunHostedPage,
    openTabPage: openLingyunTabHostPage,
    isTabHostPage: isLingyunTabHostRoute,
    clearHostedPage: clearLingyunPageHost,
    getHostedPath: () => pageHostState.path,
    getHostedUrl: () => pageHostState.url,
    ensureWidePageHost: ensureLingyunWidePageHost,
    hostedPagePath,
    hostedFromText,
    getIntent: getLingyunPageNavIntent,
    setIntent: setLingyunPageNavIntent,
    clearIntent: clearLingyunPageNavIntent,
    useIntent: useLingyunPageNavIntent,
    getScrollTop: getLingyunPageNavScrollTop,
    setScrollTop: setLingyunPageNavScrollTop,
    onRouteChange: (cb) => router.onRouteChange((to) => cb(to.path)),
    useHostedPath: () => toRef(pageHostState, 'path'),
  })
  setLingyunPageConfig(DEMO_PAGE_CONFIG)
}
