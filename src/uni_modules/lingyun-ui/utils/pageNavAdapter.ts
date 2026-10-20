import { ref, type Ref } from 'vue'
import type { LingyunPageBadge } from './pageLayout'

export const LINGYUN_PAGE_NAV_WIDTH = 220
/** 全局 tabs 驱动的窄侧栏：图标在上、文字在下 */
export const LINGYUN_PAGE_NAV_RAIL_WIDTH = 84
export const LINGYUN_PAGE_NAV_HOME = '/pages/index/index'
export const LINGYUN_PAGE_NAV_GUEST_HOME = '/pages/demo/demo'

/** H5 常驻侧栏宿主据此切换宽度；页面内导航直接读组件 computed */
export const lingyunPageNavRail = ref(false)

export function setLingyunPageNavRail(value: boolean): void {
  lingyunPageNavRail.value = !!value
}

export interface LingyunPageNavChild {
  key: string
  title: string
  icon?: string
  url: string
  badge?: LingyunPageBadge
  match?: string | string[]
}

export interface LingyunPageNavItem {
  /** 全局 tabs 驱动的项带 key */
  key?: string
  title: string
  url: string
  note?: string
  icon?: string
  iconSrc?: string
  badge?: LingyunPageBadge
  /** 详情页归入当前项高亮的额外路径 */
  match?: string | string[]
  /** 二级菜单 */
  children?: LingyunPageNavChild[]
  /** 有二级菜单时的固定工作台页 */
  workspaceUrl?: string
}

export interface LingyunPageNavSection {
  title: string
  items: LingyunPageNavItem[]
}

export interface LingyunPageNavProfile {
  avatar?: string
  name?: string
  subtitle?: string
  slotAvatar?: boolean
  slotName?: boolean
  slotSubtitle?: boolean
}

export interface LingyunPageNavStore {
  store_id: string | number
  store_name: string
}

export interface LingyunPageNavAdapter {
  home?: string
  guestHome?: string
  isLogin?: () => boolean
  pageRequiresLogin?: () => boolean
  getSections?: () => LingyunPageNavSection[]
  getProfile?: () => LingyunPageNavProfile
  getStoreOptions?: () => LingyunPageNavStore[]
  getStoreName?: () => string
  getStoreId?: () => string | number | null | undefined
  selectStore?: (id: string | number) => void
  resolvePageUrl?: (url: string) => string
  openHostedPage?: (url: string, highlight?: string) => boolean
  clearHostedPage?: () => void
  getHostedPath?: () => string
  getHostedUrl?: () => string
  ensureWidePageHost?: () => boolean
  hostedPagePath?: () => string
  hostedFromText?: () => string
  getIntent?: () => string
  setIntent?: (url: string) => void
  clearIntent?: () => void
  useIntent?: () => Ref<string>
  getScrollTop?: () => number
  setScrollTop?: (value: number) => void
  /** 订阅路由变化；返回取消订阅函数 */
  onRouteChange?: (cb: (path: string) => void) => (() => void) | void
  /** 小程序宽屏右侧内容路径（pageHostState.path） */
  useHostedPath?: () => Ref<string> | null
}

const fallbackIntent = ref('')
let fallbackScrollTop = 0
let adapter: LingyunPageNavAdapter = {}
let slotOwner = 0
const profileSlots = {
  slotAvatar: false,
  slotName: false,
  slotSubtitle: false,
}

export function configureLingyunPageNav(next: LingyunPageNavAdapter): void {
  adapter = next || {}
}

export function normalizeLingyunPagePath(url: string): string {
  return String(url || '').split('?')[0].replace(/^\//, '')
}

export function getLingyunPageNavHome(loggedIn = false): string {
  return loggedIn
    ? adapter.home || LINGYUN_PAGE_NAV_HOME
    : adapter.guestHome || LINGYUN_PAGE_NAV_GUEST_HOME
}

export function isLingyunPageNavLoggedIn(): boolean {
  return !!adapter.isLogin?.()
}

export function lingyunPageRequiresLogin(): boolean {
  return !!adapter.pageRequiresLogin?.()
}

export function getLingyunPageNavSections(): LingyunPageNavSection[] {
  return adapter.getSections?.() || []
}

export function getLingyunPageNavProfile(): LingyunPageNavProfile {
  return {
    ...(adapter.getProfile?.() || {}),
    ...profileSlots,
  }
}

export function claimLingyunPageNavHeaderSlots(slots: {
  avatar?: boolean
  name?: boolean
  subtitle?: boolean
}): number {
  slotOwner += 1
  profileSlots.slotAvatar = !!slots.avatar
  profileSlots.slotName = !!slots.name
  profileSlots.slotSubtitle = !!slots.subtitle
  return slotOwner
}

export function releaseLingyunPageNavHeaderSlots(owner: number): void {
  if (owner !== slotOwner) return
  profileSlots.slotAvatar = false
  profileSlots.slotName = false
  profileSlots.slotSubtitle = false
}

export function getLingyunPageNavStoreOptions(): LingyunPageNavStore[] {
  return adapter.getStoreOptions?.() || []
}

export function getLingyunPageNavStoreName(): string {
  return adapter.getStoreName?.() || ''
}

export function getLingyunPageNavStoreId(): string | number | null | undefined {
  return adapter.getStoreId?.()
}

export function selectLingyunPageNavStore(id: string | number): void {
  adapter.selectStore?.(id)
}

export function resolveLingyunPageUrl(url: string): string {
  if (adapter.resolvePageUrl) return adapter.resolvePageUrl(url)
  const path = normalizeLingyunPagePath(url)
  return path ? `/${path}` : ''
}

export function openLingyunHostedPage(url: string, highlight?: string): boolean {
  return !!adapter.openHostedPage?.(url, highlight)
}

export function clearLingyunPageHost(): void {
  adapter.clearHostedPage?.()
}

export function getLingyunHostedPath(): string {
  return adapter.getHostedPath?.() || ''
}

export function getLingyunHostedUrl(): string {
  return adapter.getHostedUrl?.() || ''
}

export function ensureLingyunWidePageHost(): boolean {
  return !!adapter.ensureWidePageHost?.()
}

export function hostedPagePath(): string {
  return adapter.hostedPagePath?.() || ''
}

export function hostedFromText(): string {
  return adapter.hostedFromText?.() || ''
}

export function getLingyunPageNavIntent(): string {
  return adapter.getIntent?.() || fallbackIntent.value
}

export function setLingyunPageNavIntent(url: string): void {
  if (adapter.setIntent) adapter.setIntent(url)
  else fallbackIntent.value = normalizeLingyunPagePath(url)
}

export function clearLingyunPageNavIntent(): void {
  if (adapter.clearIntent) adapter.clearIntent()
  else fallbackIntent.value = ''
}

export function useLingyunPageNavIntent(): Ref<string> {
  return adapter.useIntent?.() || fallbackIntent
}

export function getLingyunPageNavScrollTop(): number {
  return adapter.getScrollTop?.() ?? fallbackScrollTop
}

export function setLingyunPageNavScrollTop(value: number): void {
  if (adapter.setScrollTop) adapter.setScrollTop(value)
  else fallbackScrollTop = Math.max(0, Number(value) || 0)
}

/** 订阅路由变化；宿主未接线时返回 no-op 退订函数 */
export function subscribeLingyunPageRoute(cb: (path: string) => void): () => void {
  const off = adapter.onRouteChange?.(cb)
  return typeof off === 'function' ? off : () => {}
}

/** 小程序宽屏右侧内容路径；未接线时返回 null */
export function useLingyunHostedPath(): Ref<string> | null {
  return adapter.useHostedPath?.() || null
}

/** 当前页面路径：页面栈 → 启动路径 → H5 hash */
export function readLingyunCurrentPagePath(): string {
  try {
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1] as { route?: string } | undefined
    const route = normalizeLingyunPagePath(cur?.route || '')
    if (route) return route
    const launch = uni.getLaunchOptionsSync?.()
    const launchPath = normalizeLingyunPagePath(launch?.path || '')
    if (launchPath) return launchPath
  } catch {
    /* ignore */
  }
  // #ifdef H5
  if (typeof window !== 'undefined') {
    return normalizeLingyunPagePath(
      String(window.location.hash || '').replace(/^#\/?/, ''),
    )
  }
  // #endif
  return ''
}
