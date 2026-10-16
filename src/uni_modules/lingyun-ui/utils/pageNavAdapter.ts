import { ref, type Ref } from 'vue'

export const LINGYUN_PAGE_NAV_WIDTH = 220
export const LINGYUN_PAGE_NAV_HOME = '/pages/index/index'
export const LINGYUN_PAGE_NAV_GUEST_HOME = '/pages/demo/demo'

export interface LingyunPageNavItem {
  title: string
  url: string
  note?: string
  icon?: string
  iconSrc?: string
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
