/** 宽屏页面壳左侧导航。与首页目录共用，避免两处标题漂移。 */

export const LINGYUN_PAGE_NAV_WIDTH = 220

export const LINGYUN_PAGE_NAV_HOME = '/pages/index/index'

export interface LingyunPageNavItem {
  title: string
  url: string
  note: string
  icon: string
}

export interface LingyunPageNavSection {
  title: string
  items: LingyunPageNavItem[]
}

export const LINGYUN_PAGE_NAV: LingyunPageNavSection[] = [
  {
    title: '基础控件',
    items: [
      { title: 'Buttons', url: '/pages/demo/buttons', note: '按钮 · Glass / Prominent', icon: 'circle' },
      { title: 'Icons', url: '/pages/demo/icons', note: '图标字体 · lingyun-icon', icon: 'star' },
      { title: 'Badges', url: '/pages/demo/badges', note: '角标', icon: 'notification' },
      { title: 'Segmented Controls', url: '/pages/demo/segmented-controls', note: '分段控件', icon: 'tune' },
      { title: 'Tags & Chips', url: '/pages/demo/tags', note: '标签 · 筛选胶囊', icon: 'flag' },
      { title: 'Text', url: '/pages/demo/texts', note: '文本 · 字阶 / 颜色', icon: 'font' },
      { title: 'Image', url: '/pages/demo/images', note: '图片 · 懒加载 / 圆角', icon: 'image' },
      { title: 'Avatars', url: '/pages/demo/avatars', note: '头像', icon: 'person' },
      { title: 'Page Control', url: '/pages/demo/page-controls', note: '轮播指示点', icon: 'more' },
    ],
  },
  {
    title: '表单输入',
    items: [
      { title: 'Forms', url: '/pages/demo/forms', note: '表单容器 · Grouped 行布局', icon: 'list' },
      { title: 'Text Fields', url: '/pages/demo/text-fields', note: '输入框 · Label / Secure / Multiline', icon: 'compose' },
      { title: 'Switch & Stepper', url: '/pages/demo/switches', note: '开关与步进器', icon: 'settings' },
      { title: 'Checkbox & Radio', url: '/pages/demo/checks', note: '多选 / 单选 · data 驱动', icon: 'circle' },
      { title: 'Slider', url: '/pages/demo/sliders', note: '滑条', icon: 'tune' },
      { title: 'Pickers', url: '/pages/demo/pickers', note: '选择器 · 级联 data-picker', icon: 'bars' },
      { title: 'Date & Time', url: '/pages/demo/date-time-pickers', note: '日期 / 时间 / 日期时间 · 起止 · 表单', icon: 'calendar' },
    ],
  },
  {
    title: '导航与栏',
    items: [
      { title: 'Toolbars', url: '/pages/demo/toolbars', note: '顶栏 · 滚动玻璃', icon: 'bars' },
      { title: 'Tab Bars', url: '/pages/demo/tabbars', note: '底部标签栏', icon: 'list' },
      { title: 'Sidebar', url: '/pages/demo/sidebars', note: '悬浮玻璃侧栏', icon: 'bars' },
      { title: 'Search Bar', url: '/pages/demo/search-bar', note: '搜索栏', icon: 'search' },
    ],
  },
  {
    title: '列表与内容',
    items: [
      { title: 'Lists', url: '/pages/demo/lists', note: '分组列表', icon: 'list' },
      { title: 'Sections', url: '/pages/demo/sections', note: '分组卡片 · Glass / Plain / 布局', icon: 'list' },
      { title: 'Swipe Actions', url: '/pages/demo/swipe-actions', note: '列表左右滑菜单', icon: 'right' },
      { title: 'Empty', url: '/pages/demo/empty', note: '空态', icon: 'info' },
      { title: 'Skeleton', url: '/pages/demo/skeletons', note: '骨架屏', icon: 'more' },
      { title: 'Refresh', url: '/pages/demo/refresh', note: '下拉刷新', icon: 'refresh' },
    ],
  },
  {
    title: '反馈与进度',
    items: [
      { title: 'Activity Indicator', url: '/pages/demo/activity-indicator', note: '转圈加载', icon: 'loop' },
      { title: 'Progress', url: '/pages/demo/progress', note: '线性 / 环形进度', icon: 'download' },
      { title: 'Toast & HUD', url: '/pages/demo/toasts', note: '轻提示 · 加载遮罩', icon: 'chat' },
    ],
  },
  {
    title: '浮层与菜单',
    items: [
      { title: 'Alerts', url: '/pages/demo/alerts', note: '居中弹窗', icon: 'info' },
      { title: 'Sheets', url: '/pages/demo/sheets', note: '底部 Sheet · medium / large', icon: 'list' },
      { title: 'Action Sheets', url: '/pages/demo/action-sheets', note: '底部操作列表 · Cancel', icon: 'bars' },
      { title: 'Activity Views', url: '/pages/demo/activity-views', note: '分享面板 · 半高 / 全高', icon: 'paperplane' },
      { title: 'Popover', url: '/pages/demo/popovers', note: '锚定浮层', icon: 'chat' },
      { title: 'Menus', url: '/pages/demo/menus', note: '弹出菜单 · 长按', icon: 'more' },
      { title: 'Fab', url: '/pages/demo/fab', note: '悬浮按钮 · 展开菜单', icon: 'plusempty' },
    ],
  },
]

export function normalizeLingyunPagePath(url: string): string {
  return String(url || '')
    .split('?')[0]
    .replace(/^\//, '')
}

/** 侧栏滚动位置。页面 redirect 会重建组件，用模块变量把位置交回去。 */
let pageNavScrollTop = 0

export function getLingyunPageNavScrollTop(): number {
  return pageNavScrollTop
}

export function setLingyunPageNavScrollTop(value: number): void {
  const next = Number(value)
  pageNavScrollTop = Number.isFinite(next) && next > 0 ? next : 0
}

/**
 * 刚点中的路径。小程序 redirect 后新页面的 getCurrentPages 还会停在上一页，
 * 先用这里的值画选中，避免高亮闪回旧菜单。
 */
let pageNavIntentPath = ''

export function getLingyunPageNavIntent(): string {
  return pageNavIntentPath
}

export function setLingyunPageNavIntent(url: string): void {
  pageNavIntentPath = normalizeLingyunPagePath(url)
}

export function clearLingyunPageNavIntent(): void {
  pageNavIntentPath = ''
}
