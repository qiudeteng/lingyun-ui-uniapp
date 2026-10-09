import type { UserInfo } from '@/stores/user'
import {
  resetLingyunPageNav,
  setLingyunPageNavProfile,
  setLingyunPageNavSections,
  type LingyunPageNavItem,
  type LingyunPageNavSection,
} from '@/router/pageNav'

type RemoteMenu = {
  name?: string
  path?: string
  meta?: {
    title?: string
    icon?: string
    hideInMenu?: boolean | number | string
  }
  children?: RemoteMenu[]
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function hidden(menu: RemoteMenu): boolean {
  const flag = menu.meta?.hideInMenu
  return flag === true || flag === 1 || flag === '1'
}

function menuUrl(path: unknown): string {
  const raw = text(path)
  if (!raw || raw === '#') return ''
  if (/^https?:\/\//.test(raw)) return raw
  return raw.charAt(0) === '/' ? raw : `/${raw}`
}

function splitIcon(icon: unknown): { icon: string; iconSrc: string } {
  const value = text(icon)
  if (!value) return { icon: 'circle', iconSrc: '' }
  if (
    /^(https?:)?\/\//.test(value) ||
    value.charAt(0) === '/' ||
    value.startsWith('data:') ||
    /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value)
  ) {
    return { icon: 'circle', iconSrc: value }
  }
  return { icon: value, iconSrc: '' }
}

function toItem(node: RemoteMenu, url: string): LingyunPageNavItem {
  const glyph = splitIcon(node.meta?.icon)
  return {
    title: text(node.meta?.title) || text(node.name) || url,
    url,
    note: '',
    icon: glyph.icon,
    iconSrc: glyph.iconSrc || undefined,
  }
}

/** 把分组下的叶子页收成侧栏条目。中间层只用来下钻，不单独占一行。 */
function collectItems(nodes: RemoteMenu[]): LingyunPageNavItem[] {
  const items: LingyunPageNavItem[] = []
  for (const node of nodes) {
    if (!node || hidden(node)) continue
    const kids = Array.isArray(node.children) ? node.children : []
    if (kids.length) {
      items.push(...collectItems(kids))
      continue
    }
    const url = menuUrl(node.path)
    if (!url) continue
    items.push(toItem(node, url))
  }
  return items
}

/** 后台 `/core/User/menu` 树 → 侧栏分组。顶层是分组，其下可见叶子进 items。 */
export function menusToPageNavSections(menus: unknown): LingyunPageNavSection[] {
  if (!Array.isArray(menus)) return []
  const sections: LingyunPageNavSection[] = []
  const loose: LingyunPageNavItem[] = []
  for (const menu of menus) {
    if (!menu || typeof menu !== 'object') continue
    const node = menu as RemoteMenu
    if (hidden(node)) continue
    const kids = Array.isArray(node.children) ? node.children : []
    if (!kids.length) {
      const url = menuUrl(node.path)
      if (url) loose.push(toItem(node, url))
      continue
    }
    const items = collectItems(kids)
    if (!items.length) continue
    sections.push({
      title: text(node.meta?.title) || text(node.name) || '菜单',
      items,
    })
  }
  if (loose.length) {
    sections.unshift({ title: '', items: loose })
  }
  return sections
}

function profileFromUser(info: UserInfo | null): { avatar: string; name: string; subtitle: string } {
  if (!info) return { avatar: '', name: '', subtitle: '' }
  const nickname = text(info.nickname)
  const username = text(info.username)
  const typeText = text(info.user_type_text)
  const name = nickname || username
  const subtitle = nickname ? typeText || username : typeText
  return {
    avatar: text(info.avatar),
    name,
    subtitle: name ? subtitle : '',
  }
}

/**
 * 已登录时把用户资料和菜单写进宽屏左栏。
 * 菜单还没回来（null）时保留当前目录，避免先清空再闪一下。
 */
export function syncLingyunPageNav(info: UserInfo | null, menu: unknown): void {
  const profile = profileFromUser(info)
  if (profile.name || profile.avatar) {
    setLingyunPageNavProfile(profile)
  }
  if (Array.isArray(menu)) {
    setLingyunPageNavSections(menusToPageNavSections(menu))
  }
}

export function clearLingyunPageNavSession(): void {
  resetLingyunPageNav()
}
