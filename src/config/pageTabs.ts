/**
 * Demo 站的一级导航清单。
 * 与文档站一致：首页 / 接入 / 组件 / 图表 / 页面。
 * 一级 Tab 下的二级菜单是分组卡片标题，三级菜单是卡片里的按钮；
 * 只有二级菜单时渲染没有标题的卡片。
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

const NAV_ITEMS = new Map(
  LINGYUN_PAGE_NAV.flatMap((section) =>
    section.items.map((item) => [item.url, item] as const),
  ),
)

/** 从组件目录取图标和默认说明，文案与分组按文档站整理 */
function navChild(
  url: string,
  text?: string,
  note?: string,
): LingyunPageTabChild {
  const item = NAV_ITEMS.get(url)
  return {
    key: demoChildKey(url),
    text: text || item?.title || url,
    icon: item?.icon || 'circle',
    url,
    note: note || item?.note || '',
  }
}

function pageChild(
  key: string,
  text: string,
  icon: string,
  url: string,
  note: string,
): LingyunPageTabChild {
  return { key, text, icon, url, note }
}

function group(
  key: string,
  text: string,
  items: LingyunPageTabChild[],
): LingyunPageTabChild {
  return { key, text, children: items }
}

function navGroup(title: string): LingyunPageTabChild[] {
  const section = LINGYUN_PAGE_NAV.find((entry) => entry.title === title)
  return (section ? section.items : []).map((item) => navChild(item.url))
}

/* 接入只有二级菜单：工作台渲染成一张没有标题的卡片 */
const GUIDE_CHILDREN: LingyunPageTabChild[] = [
  navChild('/pages/guide/start', '接入指南'),
  navChild('/pages/demo/screen', '屏幕'),
]

const COMPONENT_CHILDREN: LingyunPageTabChild[] = [
  group('components-nav', '页面与导航', [
    navChild('/pages/demo/app-page', '页面壳'),
    navChild('/pages/demo/responsive', '响应式'),
    navChild('/pages/demo/toolbars', '顶栏'),
    navChild('/pages/demo/tabbars', '底栏'),
    navChild('/pages/demo/search-bar', '搜索栏'),
    navChild('/pages/demo/sidebars', '侧栏浮层'),
  ]),
  group('components-basic', '基础控件', [
    navChild('/pages/demo/layout', '布局'),
    navChild('/pages/demo/buttons', '按钮'),
    navChild('/pages/demo/icons', '图标'),
    navChild('/pages/demo/badges', '角标'),
    navChild('/pages/demo/segmented-controls', '分段控件'),
    navChild('/pages/demo/tags', '标签与胶囊'),
    navChild('/pages/demo/texts', '文本'),
    navChild('/pages/demo/images', '图片'),
    navChild('/pages/demo/avatars', '头像'),
    navChild('/pages/demo/page-controls', '分页点'),
  ]),
  group('components-form', '表单', [
    navChild('/pages/demo/text-fields', '输入框'),
    navChild('/pages/demo/forms', '表单'),
    navChild('/pages/demo/switches', '开关与步进器'),
    navChild('/pages/demo/checks', '复选框与单选'),
    navChild('/pages/demo/sliders', '滑条'),
    navChild('/pages/demo/pickers', '选择器'),
    navChild('/pages/demo/date-time-pickers', '日期与时间'),
  ]),
  group('components-content', '列表与内容', [
    navChild('/pages/demo/lists', '列表'),
    navChild('/pages/demo/sections', '分组卡片'),
    navChild('/pages/demo/tables', '表格'),
    navChild('/pages/demo/swipe-actions', '滑动操作'),
    navChild('/pages/demo/empty', '空状态'),
    navChild('/pages/demo/skeletons', '骨架屏'),
    navChild('/pages/demo/refresh', '下拉刷新'),
    navChild('/pages/demo/grid', '宫格'),
    navChild('/pages/demo/indexed-list', '索引列表'),
  ]),
  group('components-feedback', '反馈', [
    navChild('/pages/demo/activity-indicator', '加载转圈'),
    navChild('/pages/demo/progress', '进度'),
    navChild('/pages/demo/toasts', '轻提示'),
  ]),
  group('components-overlay', '浮层', [
    navChild('/pages/demo/alerts', '弹窗'),
    navChild('/pages/demo/sheets', '底部面板'),
    navChild('/pages/demo/action-sheets', '操作列表'),
    navChild('/pages/demo/activity-views', '分享面板'),
    navChild('/pages/demo/popovers', '气泡'),
    navChild('/pages/demo/menus', '菜单'),
    navChild('/pages/demo/fab', '悬浮按钮'),
    navChild('/pages/demo/goods-nav', '商品导航'),
  ]),
]

/* 图表只有二级菜单：同样是一张没有标题的卡片 */
const CHART_CHILDREN: LingyunPageTabChild[] = navGroup('图表')

const PAGE_CHILDREN: LingyunPageTabChild[] = [
  group('pages-standard', '标准页面', [
    pageChild(
      'page-login',
      '登录',
      'person',
      '/pages/login/login',
      '账号密码登录 · 协议 Sheet',
    ),
    pageChild('page-404', '404', 'info', '/pages/404/404', '缺失页面'),
  ]),
]

export const DEMO_PAGE_TABS: LingyunPageTab[] = [
  {
    key: 'home',
    text: '首页',
    icon: 'home',
    url: '/pages/index/index',
  },
  {
    key: 'guide',
    text: '接入',
    icon: 'info',
    url: '/pages/guide/start',
    children: GUIDE_CHILDREN,
  },
  {
    key: 'components',
    text: '组件',
    icon: 'star',
    url: '/pages/demo/demo',
    children: COMPONENT_CHILDREN,
  },
  {
    key: 'charts',
    text: '图表',
    icon: 'bars',
    url: '/pages/demo/charts/column',
    children: CHART_CHILDREN,
  },
  {
    key: 'pages',
    text: '页面',
    icon: 'list',
    url: '/pages/login/login',
    children: PAGE_CHILDREN,
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
