/**
 * 后台菜单树 → 页面壳配置（一级 Tab、目录分组、工作台分组）。
 *
 * 默认兼容常见后台结构：
 * `{ name, path, meta: { title, icon, activeIcon, hideInMenu }, children }`
 * - `icon` / `activeIcon` 是图片地址时保留为 `iconSrc` / `activeIconSrc`；
 * - 是字形名时直接作为 `icon`；
 * - 两者都没有时按标题关键词与序号取兜底字形。
 *
 * 换算结果可直接交给 `setLingyunPageConfig`（底部 Tab / 宽屏侧栏 / PC 三栏），
 * 目录分组与工作台分组也一并给出，宿主不用每个工程各写一份菜单转换。
 */
import {
  normalizeLingyunPagePath,
  type LingyunPageNavItem,
  type LingyunPageNavSection,
} from './pageNavAdapter'
import type { LingyunPageConfig, LingyunPageTab, LingyunPageTabChild } from './pageLayout'
import { setLingyunPageConfig } from './pageConfig'

/** 常见后台菜单节点；不认识的字段会被忽略 */
export interface LingyunMenuNode {
  name?: string
  path?: string
  meta?: {
    title?: string
    icon?: string
    activeIcon?: string
    hideInMenu?: boolean | number | string
  }
  children?: LingyunMenuNode[]
}

export interface LingyunMenuBuildOptions {
  /** 固定放在第一位的首页 Tab；后台命中 homePath 的节点只贡献图片图标 */
  homeTab?: LingyunPageTab
  /** 首页路径；命中且提供了 homeTab 时，该顶层叶子不再重复生成 Tab */
  homePath?: string
  /** 后台 icon 是图片时，按标题关键词取兜底字形 */
  iconKeywords?: Array<[RegExp, string]>
  /** 关键词都没命中时按序号取用的字形 */
  iconFallbacks?: string[]
  /** 没有可用图标时的兜底字形，默认 circle */
  fallbackIcon?: string
}

export interface LingyunMenuApplyOptions extends LingyunMenuBuildOptions {
  /** 同时写入全局页面壳的工作台地址 */
  workspaceUrl?: string
}

export interface LingyunMenuBuildResult {
  /** 首页 + 一级 Tab，可直接 `setLingyunPageConfig({ tabs })` */
  tabs: LingyunPageTab[]
  /** 一级 Tab key → 工作台分组；工作台按分组画功能入口 */
  groups: Record<string, LingyunPageNavSection[]>
  /** 菜单树直接映射的目录分组；220 完整侧栏 / 首页列表使用 */
  sections: LingyunPageNavSection[]
}

type ResolvedIcons = {
  keywords: Array<[RegExp, string]>
  fallbacks: string[]
  fallbackIcon: string
}

/** 图片图标 / 无图标时的序号兜底字形 */
const DEFAULT_ICON_FALLBACKS = [
  'home',
  'list',
  'shop',
  'calendar',
  'wallet',
  'person',
  'gear',
  'star',
  'tune',
  'location',
]

/** 图片图标转字形时按标题关键词匹配 */
const DEFAULT_ICON_KEYWORDS: Array<[RegExp, string]> = [
  [/订|采购|商品|商城|购物/, 'cart'],
  [/门店|店铺|店务/, 'shop'],
  [/订单|任务|工作/, 'list'],
  [/预约|日历|排班/, 'calendar'],
  [/统计|数据|报表|看板|分析/, 'bars'],
  [/审批|审核/, 'checkbox'],
  [/资产|财务|钱包/, 'wallet'],
  [/系统|设置|配置/, 'gear'],
  [/我的|个人|账号|用户/, 'person'],
  [/通知|消息|提醒/, 'notification'],
]

const DEFAULT_FALLBACK_ICON = 'circle'

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function hidden(menu: LingyunMenuNode): boolean {
  const flag = menu.meta?.hideInMenu
  return flag === true || flag === 1 || flag === '1'
}

function menuUrl(path: unknown): string {
  const raw = text(path)
  if (!raw || raw === '#') return ''
  if (/^https?:\/\//.test(raw)) return raw
  return raw.charAt(0) === '/' ? raw : `/${raw}`
}

function isImageLike(value: string): boolean {
  return (
    /^(https?:)?\/\//.test(value) ||
    value.charAt(0) === '/' ||
    value.startsWith('data:') ||
    /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value)
  )
}

function splitIcon(
  icon: unknown,
  fallbackIcon: string,
): { icon: string; iconSrc: string } {
  const value = text(icon)
  if (!value) return { icon: fallbackIcon, iconSrc: '' }
  if (isImageLike(value)) return { icon: fallbackIcon, iconSrc: value }
  return { icon: value, iconSrc: '' }
}

/** 只取图片地址；后台给字形名时返回空串，交给字形兜底 */
function imageIcon(icon: unknown): string {
  const value = text(icon)
  return value && isImageLike(value) ? value : ''
}

function resolveIcons(options: LingyunMenuBuildOptions): ResolvedIcons {
  return {
    keywords:
      options.iconKeywords && options.iconKeywords.length
        ? options.iconKeywords
        : DEFAULT_ICON_KEYWORDS,
    fallbacks:
      options.iconFallbacks && options.iconFallbacks.length
        ? options.iconFallbacks
        : DEFAULT_ICON_FALLBACKS,
    fallbackIcon: options.fallbackIcon || DEFAULT_FALLBACK_ICON,
  }
}

function toItem(
  node: LingyunMenuNode,
  url: string,
  fallbackIcon: string,
): LingyunPageNavItem {
  const glyph = splitIcon(node.meta?.icon, fallbackIcon)
  return {
    title: text(node.meta?.title) || text(node.name) || url,
    url,
    note: '',
    icon: glyph.icon,
    iconSrc: glyph.iconSrc || undefined,
  }
}

/** 分组下的页面收成侧栏一行一个条目；宽屏 220 目录只认分组标题 + 叶子 */
function collectItems(nodes: LingyunMenuNode[], fallbackIcon: string): LingyunPageNavItem[] {
  const items: LingyunPageNavItem[] = []
  for (const node of nodes) {
    if (!node || hidden(node)) continue
    const kids = Array.isArray(node.children) ? node.children : []
    if (kids.length) {
      items.push(...collectItems(kids, fallbackIcon))
      continue
    }
    const url = menuUrl(node.path)
    if (!url) continue
    items.push(toItem(node, url, fallbackIcon))
  }
  return items
}

function tabIcon(node: LingyunMenuNode, index: number, icons: ResolvedIcons): string {
  const value = text(node.meta?.icon)
  if (value && !isImageLike(value)) return value
  const title = text(node.meta?.title) || text(node.name)
  for (const [pattern, icon] of icons.keywords) {
    if (pattern.test(title)) return icon
  }
  return icons.fallbacks[index % icons.fallbacks.length] || icons.fallbackIcon
}

function visibleChildren(node: LingyunMenuNode): LingyunMenuNode[] {
  const kids = Array.isArray(node.children) ? node.children : []
  return kids.filter(
    (kid): kid is LingyunMenuNode =>
      !!kid && typeof kid === 'object' && !hidden(kid as LingyunMenuNode),
  )
}

/** 三级及更深层收成叶子按钮：插件菜单最深画到三级，更深的直接摊平 */
function toLeafChildren(
  nodes: LingyunMenuNode[],
  prefix: string,
  icons: ResolvedIcons,
): LingyunPageTabChild[] {
  const out: LingyunPageTabChild[] = []
  nodes.forEach((node, index) => {
    const kids = visibleChildren(node)
    if (kids.length) {
      out.push(...toLeafChildren(kids, `${prefix}g${index}`, icons))
      return
    }
    const url = menuUrl(node.path)
    if (!url) return
    const glyph = splitIcon(node.meta?.icon, icons.fallbackIcon)
    out.push({
      key: `${prefix}i${index}`,
      text: text(node.meta?.title) || text(node.name) || url,
      icon: glyph.icon,
      iconSrc: glyph.iconSrc || undefined,
      activeIconSrc: imageIcon(node.meta?.activeIcon) || undefined,
      url,
    })
  })
  return out
}

function sectionsFromMenus(
  menus: unknown,
  icons: ResolvedIcons,
): LingyunPageNavSection[] {
  if (!Array.isArray(menus)) return []
  const sections: LingyunPageNavSection[] = []
  const loose: LingyunPageNavItem[] = []
  for (const menu of menus) {
    if (!menu || typeof menu !== 'object') continue
    const node = menu as LingyunMenuNode
    if (hidden(node)) continue
    const kids = Array.isArray(node.children) ? node.children : []
    if (!kids.length) {
      const url = menuUrl(node.path)
      if (url) loose.push(toItem(node, url, icons.fallbackIcon))
      continue
    }
    const items = collectItems(kids, icons.fallbackIcon)
    if (!items.length) continue
    const glyph = splitIcon(node.meta?.icon, icons.fallbackIcon)
    sections.push({
      title: text(node.meta?.title) || text(node.name) || '菜单',
      icon: glyph.iconSrc || undefined,
      items,
    })
  }
  if (loose.length) sections.unshift({ title: '', items: loose })
  return sections
}

/** 后台菜单树 → 220 完整目录分组（不生成一级 Tab） */
export function buildLingyunSectionsFromMenus(
  menus: unknown,
  options: LingyunMenuBuildOptions = {},
): LingyunPageNavSection[] {
  return sectionsFromMenus(menus, resolveIcons(options))
}

/**
 * 后台菜单树 → 页面壳配置。
 * 顶层叶子是一级 Tab；有 children 的顶层节点生成带二级 / 三级菜单的 Tab，
 * 同时给出该 Tab 的工作台分组。传入 homeTab 时固定作为第一个 Tab。
 */
export function buildLingyunPageFromMenus(
  menus: unknown,
  options: LingyunMenuBuildOptions = {},
): LingyunMenuBuildResult {
  const icons = resolveIcons(options)
  const sections = sectionsFromMenus(menus, icons)
  if (!Array.isArray(menus)) return { tabs: [], groups: {}, sections }

  const tabs: LingyunPageTab[] = []
  const groups: Record<string, LingyunPageNavSection[]> = {}
  const homePath =
    options.homeTab && options.homePath
      ? normalizeLingyunPagePath(options.homePath)
      : ''
  let homeNode: LingyunMenuNode | null = null

  for (const menu of menus) {
    if (!menu || typeof menu !== 'object') continue
    const node = menu as LingyunMenuNode
    if (hidden(node)) continue
    const title = text(node.meta?.title) || text(node.name) || '菜单'
    const key = `t${tabs.length}`
    const kids = visibleChildren(node)

    if (!kids.length) {
      const url = menuUrl(node.path)
      if (!url) continue
      /* 首页工作台自身不再作为 Tab，避免和「工作台」选中态打架 */
      if (homePath && normalizeLingyunPagePath(url) === homePath) {
        homeNode = node
        continue
      }
      tabs.push({
        key,
        text: title,
        icon: tabIcon(node, tabs.length, icons),
        iconSrc: imageIcon(node.meta?.icon) || undefined,
        activeIconSrc: imageIcon(node.meta?.activeIcon) || undefined,
        url,
        children: [],
      })
      continue
    }

    const tabGroups: LingyunPageNavSection[] = []
    const children: LingyunPageTabChild[] = []
    const loose: LingyunPageNavItem[] = []
    kids.forEach((kid, kidIndex) => {
      const kidTitle = text(kid.meta?.title) || text(kid.name) || '功能'
      const kidGlyph = splitIcon(kid.meta?.icon, icons.fallbackIcon)
      const kidKids = visibleChildren(kid)
      if (kidKids.length) {
        const leaves = toLeafChildren(kidKids, `${key}c${kidIndex}`, icons)
        if (!leaves.length) return
        const items = collectItems(kidKids, icons.fallbackIcon)
        if (items.length) {
          tabGroups.push({
            title: kidTitle,
            icon: kidGlyph.iconSrc || undefined,
            items,
          })
        }
        children.push({
          key: `${key}c${kidIndex}`,
          text: kidTitle,
          icon: kidGlyph.icon,
          iconSrc: kidGlyph.iconSrc || undefined,
          activeIconSrc: imageIcon(kid.meta?.activeIcon) || undefined,
          children: leaves,
        })
        return
      }
      const url = menuUrl(kid.path)
      if (!url) return
      const item = toItem(kid, url, icons.fallbackIcon)
      loose.push(item)
      children.push({
        key: `${key}c${kidIndex}`,
        text: item.title,
        icon: item.icon,
        iconSrc: item.iconSrc,
        activeIconSrc: imageIcon(kid.meta?.activeIcon) || undefined,
        url,
      })
    })

    if (!children.length) continue
    if (loose.length) tabGroups.unshift({ title: '', items: loose })
    const firstUrl =
      loose[0]?.url ||
      tabGroups.find((group) => group.items.length)?.items[0]?.url ||
      ''
    if (!firstUrl) continue
    tabs.push({
      key,
      text: title,
      icon: tabIcon(node, tabs.length, icons),
      iconSrc: imageIcon(node.meta?.icon) || undefined,
      activeIconSrc: imageIcon(node.meta?.activeIcon) || undefined,
      url: firstUrl,
      children,
    })
    groups[key] = tabGroups
  }

  if (!tabs.length) return { tabs: [], groups: {}, sections }

  const homeTab: LingyunPageTab | null = options.homeTab
    ? homeNode
      ? {
          ...options.homeTab,
          iconSrc: imageIcon(homeNode.meta?.icon) || undefined,
          activeIconSrc: imageIcon(homeNode.meta?.activeIcon) || undefined,
        }
      : { ...options.homeTab }
    : null

  return {
    tabs: homeTab ? [homeTab, ...tabs] : tabs,
    groups,
    sections,
  }
}

/**
 * 换算并直接写入全局页面壳配置。
 * 传了 workspaceUrl 时一并写入；宿主随后可把 `sections` / `groups` 接到自己的目录或工作台。
 */
export function applyLingyunPageFromMenus(
  menus: unknown,
  options: LingyunMenuApplyOptions = {},
): LingyunMenuBuildResult {
  const result = buildLingyunPageFromMenus(menus, options)
  const config: Partial<LingyunPageConfig> = { tabs: result.tabs }
  if (options.workspaceUrl) config.workspaceUrl = options.workspaceUrl
  setLingyunPageConfig(config)
  return result
}
