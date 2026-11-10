import { reactive, ref } from 'vue'
import { routes } from '@/router.config'
import { DEMO_PAGE_TABS, getLingyunDemoTabGroups } from '@/config/pageTabs'

/** 宽屏页面壳左侧导航。条目从 pageTabs 的 Tab 数据派生，避免与首页 / Tab 分组漂移。 */

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

function tabNavItems(tabKey: string): LingyunPageNavItem[] {
  const tab = DEMO_PAGE_TABS.find((item) => item.key === tabKey)
  if (!tab) return []
  return getLingyunDemoTabGroups(tab)
    .flatMap((group) => group.items)
    .map((child) => ({
      title: child.text || child.url || '',
      url: child.url || '',
      note: child.note || '',
      icon: child.icon || 'circle',
    }))
    .filter((item) => !!item.url)
}

export const LINGYUN_PAGE_NAV: LingyunPageNavSection[] = [
  { title: '页面', items: [...tabNavItems('guide'), ...tabNavItems('pages')] },
  { title: '组件', items: tabNavItems('components') },
  { title: '图表', items: tabNavItems('charts') },
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
