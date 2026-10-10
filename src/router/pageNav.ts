import { reactive, ref } from 'vue'
import { routes } from '@/router.config'

/** 宽屏页面壳左侧导航。与首页目录共用，避免两处标题漂移。 */

export const LINGYUN_PAGE_NAV_WIDTH = 220

export const LINGYUN_PAGE_NAV_HOME = '/pages/index/index'

/** 未登录时左侧「首页」打开组件库目录，不进需要登录的业务首页。 */
export const LINGYUN_PAGE_NAV_GUEST_HOME = '/pages/demo/demo'

export interface LingyunPageNavItem {
  title: string
  url: string
  note: string
  /** lingyun-icon 字形。后台图标是图片时留 circle，改走 iconSrc */
  icon: string
  /** 后台菜单图标地址。有值时侧栏画图片，不再用 icon */
  iconSrc?: string
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
      { title: 'Screen', url: '/pages/demo/screen', note: '窗口档 · 系统 · 折叠 · 硬件', icon: 'tune' },
      { title: 'Mobile / PC', url: '/pages/demo/responsive', note: '窄屏与平板、电脑分开展示', icon: 'tune' },
      { title: 'Tab Bars', url: '/pages/demo/tabbars', note: '底部标签栏', icon: 'list' },
      { title: 'Sidebar', url: '/pages/demo/sidebars', note: '悬浮玻璃侧栏', icon: 'bars' },
      { title: 'Search Bar', url: '/pages/demo/search-bar', note: '搜索栏', icon: 'search' },
    ],
  },
  {
    title: '列表与内容',
    items: [
      { title: 'Lists', url: '/pages/demo/lists', note: '分组列表', icon: 'list' },
      { title: 'Grid', url: '/pages/demo/grid', note: '宫格 · 快捷入口', icon: 'bars' },
      { title: 'Layout', url: '/pages/demo/layout', note: '24 分栏 · 间隔 · 偏移', icon: 'bars' },
      { title: 'Indexed List', url: '/pages/demo/indexed-list', note: '索引列表 · 字母跳转', icon: 'list' },
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
      { title: 'Goods Nav', url: '/pages/demo/goods-nav', note: '商品底栏 · 店铺 / 购物车 / 购买', icon: 'cart' },
    ],
  },
  {
    title: '图表',
    items: [
      { title: 'Column', url: '/pages/demo/charts/column', note: '柱状图', icon: 'bars' },
      { title: 'Bar', url: '/pages/demo/charts/bar', note: '条状图', icon: 'bars' },
      { title: 'Line', url: '/pages/demo/charts/line', note: '折线图', icon: 'tune' },
      { title: 'Area', url: '/pages/demo/charts/area', note: '区域图', icon: 'image' },
      { title: 'Pie', url: '/pages/demo/charts/pie', note: '饼图', icon: 'circle' },
      { title: 'Ring', url: '/pages/demo/charts/ring', note: '圆环图', icon: 'loop' },
      { title: 'Rose', url: '/pages/demo/charts/rose', note: '玫瑰图', icon: 'star' },
      { title: 'Funnel', url: '/pages/demo/charts/funnel', note: '漏斗图', icon: 'download' },
      { title: 'Radar', url: '/pages/demo/charts/radar', note: '雷达图', icon: 'flag' },
      { title: 'Gauge', url: '/pages/demo/charts/gauge', note: '仪表盘', icon: 'info' },
      { title: 'Arcbar', url: '/pages/demo/charts/arcbar', note: '圆弧进度', icon: 'loop' },
      { title: 'Mount', url: '/pages/demo/charts/mount', note: '山峰图', icon: 'bars' },
      { title: 'Mix', url: '/pages/demo/charts/mix', note: '混合图', icon: 'tune' },
      { title: 'Scatter', url: '/pages/demo/charts/scatter', note: '散点图', icon: 'circle' },
      { title: 'Bubble', url: '/pages/demo/charts/bubble', note: '气泡图', icon: 'circle' },
      { title: 'Candle', url: '/pages/demo/charts/candle', note: 'K 线图', icon: 'bars' },
      { title: 'Word', url: '/pages/demo/charts/word', note: '词云图', icon: 'font' },
      { title: 'Time Line', url: '/pages/demo/charts/tline', note: '时间轴折线', icon: 'calendar' },
      { title: 'Time Area', url: '/pages/demo/charts/tarea', note: '时间轴区域', icon: 'calendar' },
    ],
  },
]

/** 运行时目录。H5 侧栏只挂一次，必须读这份响应式数据，页面 prop 到不了它。 */
const pageNavState = reactive({
  sections: LINGYUN_PAGE_NAV,
  avatar: '',
  name: '',
  subtitle: '',
  slotAvatar: false,
  slotName: false,
  slotSubtitle: false,
})

let pageNavSlotOwner = 0

export interface LingyunPageNavProfile {
  avatar?: string
  name?: string
  subtitle?: string
}

export function getLingyunPageNavSections(): LingyunPageNavSection[] {
  return pageNavState.sections
}

/** 登录后把后台菜单写进来。不传页面 prop 时，宽屏左栏和首页目录都用这份。 */
export function setLingyunPageNavSections(sections: LingyunPageNavSection[]): void {
  pageNavState.sections = Array.isArray(sections) ? sections : []
}

export function getLingyunPageNavProfile(): {
  avatar: string
  name: string
  subtitle: string
  slotAvatar: boolean
  slotName: boolean
  slotSubtitle: boolean
} {
  return pageNavState
}

/** 侧栏顶部默认头像、名称、副标题。页面插槽有内容时盖过这里。 */
export function setLingyunPageNavProfile(profile: LingyunPageNavProfile): void {
  if (!profile) return
  if (profile.avatar !== undefined) pageNavState.avatar = profile.avatar
  if (profile.name !== undefined) pageNavState.name = profile.name
  if (profile.subtitle !== undefined) pageNavState.subtitle = profile.subtitle
}

/** 退出登录后恢复组件库目录，并清掉侧栏顶部的用户资料。 */
export function resetLingyunPageNav(): void {
  pageNavState.sections = LINGYUN_PAGE_NAV
  pageNavState.avatar = ''
  pageNavState.name = ''
  pageNavState.subtitle = ''
}

/** H5 侧栏在 body 上，由当前页声明自己有没有顶部插槽。 */
export function claimLingyunPageNavHeaderSlots(slots: {
  avatar?: boolean
  name?: boolean
  subtitle?: boolean
}): number {
  pageNavSlotOwner += 1
  pageNavState.slotAvatar = !!slots.avatar
  pageNavState.slotName = !!slots.name
  pageNavState.slotSubtitle = !!slots.subtitle
  return pageNavSlotOwner
}

export function releaseLingyunPageNavHeaderSlots(owner: number): void {
  if (owner !== pageNavSlotOwner) return
  pageNavState.slotAvatar = false
  pageNavState.slotName = false
  pageNavState.slotSubtitle = false
}

export function normalizeLingyunPagePath(url: string): string {
  return String(url || '')
    .split('?')[0]
    .replace(/^\//, '')
}

/** 菜单点到未注册页面时打开这一页。 */
export const LINGYUN_PAGE_NOT_FOUND = '/pages/404/404'

/** 路径是否写在 pages.json（经 router.config 生成）里。 */
export function hasLingyunPage(url: string): boolean {
  const path = normalizeLingyunPagePath(url)
  if (!path) return false
  return routes.some((item) => normalizeLingyunPagePath(item.path) === path)
}

/** 已注册则原样打开；否则改去 404，并用 from 带上缺失路径。 */
export function resolveLingyunPageUrl(url: string): string {
  const raw = String(url || '').trim()
  const path = normalizeLingyunPagePath(raw)
  if (!path) return ''
  if (hasLingyunPage(raw)) return raw.charAt(0) === '/' ? raw : `/${raw}`
  return `${LINGYUN_PAGE_NOT_FOUND}?from=${encodeURIComponent(path)}`
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
 * 先用这里的值画选中，避免高亮闪回旧菜单。用 ref，已挂上的侧栏能跟着变。
 */
const pageNavIntentPath = ref('')

export function getLingyunPageNavIntent(): string {
  return pageNavIntentPath.value
}

export function setLingyunPageNavIntent(url: string): void {
  pageNavIntentPath.value = normalizeLingyunPagePath(url)
}

export function clearLingyunPageNavIntent(): void {
  pageNavIntentPath.value = ''
}

export function useLingyunPageNavIntent() {
  return pageNavIntentPath
}
