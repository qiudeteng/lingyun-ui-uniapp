/**
 * Demo 站的一级导航清单。
 * 底部 Tab 最多 5 项，这里取 5 个一级入口；完整目录通过「目录」Tab 进入。
 */
import type { LingyunPageConfig, LingyunPageTab } from '@/uni_modules/lingyun-ui'

export const DEMO_PAGE_TABS: LingyunPageTab[] = [
  { key: 'directory', text: '目录', icon: 'list', url: '/pages/demo/demo' },
  { key: 'controls', text: '控件', icon: 'star', url: '/pages/demo/buttons' },
  { key: 'forms', text: '表单', icon: 'compose', url: '/pages/demo/forms' },
  { key: 'content', text: '列表', icon: 'list', url: '/pages/demo/lists' },
  { key: 'charts', text: '图表', icon: 'bars', url: '/pages/demo/charts/column' },
]

export const DEMO_PAGE_CONFIG: Partial<LingyunPageConfig> = {
  tabs: DEMO_PAGE_TABS,
  sidebarTitle: '演示导航',
  layout: { navMode: 'auto' },
  pages: {
    '/pages/login/login': { hideTabbar: true, hideNav: true },
    '/pages/login/user-agreement': { hideTabbar: true, hideNav: true },
    '/pages/login/privacy-policy': { hideTabbar: true, hideNav: true },
    '/pages/404/404': { hideTabbar: true, hideNav: true },
    '/pages/demo/search-bar': { hideTabbar: true },
    '/pages/demo/goods-nav': { hideTabbar: true },
    '/pages/demo/tabbars': { hideTabbar: true },
  },
}
