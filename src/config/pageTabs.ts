/**
 * Demo 站的一级导航清单。
 * 底部 Tab 最多 5 项，这里取 5 个一级入口；完整目录通过「目录」Tab 进入。
 */
import type {
  LingyunPageConfig,
  LingyunPageTab,
  LingyunPageTabChild,
} from '@/uni_modules/lingyun-ui'
import { LINGYUN_PAGE_NAV } from '@/router/pageNav'

function demoChildKey(url: string): string {
  return (
    url
      .replace(/^\/pages\/demo\//, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'page'
  )
}

/** 把组件目录里的某一组 demo 转成二级 Tab 数据 */
function demoChildren(title: string): LingyunPageTabChild[] {
  const section = LINGYUN_PAGE_NAV.find((entry) => entry.title === title)
  return (section ? section.items : []).map((item) => ({
    key: demoChildKey(item.url),
    text: item.title,
    icon: item.icon,
    url: item.url,
    note: item.note,
  }))
}

const DIRECTORY_CHILDREN: LingyunPageTabChild[] = [
  {
    key: 'directory',
    text: '组件目录',
    icon: 'list',
    url: '/pages/demo/demo',
    note: '全部组件',
  },
  ...demoChildren('导航与栏'),
  ...demoChildren('反馈与进度'),
  ...demoChildren('浮层与菜单'),
]

export const DEMO_PAGE_TABS: LingyunPageTab[] = [
  {
    key: 'directory',
    text: '目录',
    icon: 'list',
    url: '/pages/demo/demo',
    children: DIRECTORY_CHILDREN,
  },
  {
    key: 'controls',
    text: '控件',
    icon: 'star',
    url: '/pages/demo/buttons',
    children: demoChildren('基础控件'),
  },
  {
    key: 'forms',
    text: '表单',
    icon: 'compose',
    url: '/pages/demo/forms',
    children: demoChildren('表单输入'),
  },
  {
    key: 'content',
    text: '列表',
    icon: 'list',
    url: '/pages/demo/lists',
    children: demoChildren('列表与内容'),
  },
  {
    key: 'charts',
    text: '图表',
    icon: 'bars',
    url: '/pages/demo/charts/column',
    children: demoChildren('图表'),
  },
]

export const DEMO_PAGE_CONFIG: Partial<LingyunPageConfig> = {
  tabs: DEMO_PAGE_TABS,
  workspaceUrl: '/pages/demo/workbench',
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
