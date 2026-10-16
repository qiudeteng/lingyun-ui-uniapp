import { configureLingyunPageNav } from '@/uni_modules/lingyun-ui'
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
  openLingyunHostedPage,
  pageHostState,
} from '@/router/pageHost'

/** 把宿主工程的业务状态与路由能力注入 lingyun-ui；组件包本身不反向依赖这些文件。 */
export function configureLingyunUi(): void {
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
  })
}
