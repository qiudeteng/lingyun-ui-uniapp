/**
 * 页面壳布局解析（纯函数，不依赖 Vue / uni）。
 *
 * 布局只认传进来的 width，避免 `lingyun.screen` 与页面自身 resize 双来源短暂不一致。
 * 宽屏门槛沿用顶栏的 690，与 design/SIDEBARS.md 的停靠导航一致。
 */
import { LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH } from '../components/lingyun-toolbars/getLingyunNavSafeInset'
import {
  LINGYUN_TABBAR_HEIGHT_PX,
  LINGYUN_TABBAR_HEIGHT_SAFE_PX,
} from '../components/lingyun-tabbars/tabbarMetrics'

export type LingyunPageNavMode = 'auto' | 'tabbar' | 'sidebar' | 'none'

export type LingyunPageBadge =
  | number
  | string
  | boolean
  | {
      text?: string | number
      color?: string
      dot?: boolean
      max?: number | string
    }

export interface LingyunPageTab {
  /** 唯一 key，Tab 选中态与埋点用 */
  key: string
  text: string
  /** lingyun-icon 的 type。iconMode='icon' 时生效 */
  icon?: string
  /** 一级路由 */
  url: string
  badge?: LingyunPageBadge
  /** 详情页归入某个 Tab 的额外高亮路径 */
  match?: string | string[]
}

export interface LingyunPageOverride {
  hideTabbar?: boolean
  hideNav?: boolean
  navMode?: LingyunPageNavMode
  tabbarSafeArea?: boolean
}

export interface LingyunPageConfig {
  /** 为空时完全沿用旧行为：宽屏侧栏、窄屏无导航 */
  tabs: LingyunPageTab[]
  /** tabs 映射为宽屏侧栏时的分组标题 */
  sidebarTitle?: string
  layout?: {
    navMode?: LingyunPageNavMode
  }
  /** key 为 normalize 后的页面路径 */
  pages?: Record<string, LingyunPageOverride>
  tabbar?: {
    safeArea?: boolean
    variant?: 'default' | 'prominent'
  }
}

export interface LingyunPageLayoutInput {
  width: number
  config: LingyunPageConfig
  pageOverride?: LingyunPageOverride | null
  embedded?: boolean
  placement?: string
  grabber?: boolean
  authHold?: boolean
  /** Boolean 或 'auto' */
  showNav?: boolean | string
  /** Boolean 或 'auto' */
  showTabbar?: boolean | string
  navMode?: string
  safeArea?: boolean
}

export type LingyunPageLayoutSource =
  | 'guard'
  | 'prop'
  | 'page'
  | 'global'
  | 'width'
  | 'compat'

export interface LingyunPageLayoutResult {
  /** width >= 690 */
  wide: boolean
  navMode: 'tabbar' | 'sidebar' | 'none'
  sidebarVisible: boolean
  tabbarVisible: boolean
  /** 78 / 99，含设计安全内边距 */
  tabbarHeightPx: number
  /** tabbar 可见时的底部留白 */
  bottomInsetPx: number
  source: LingyunPageLayoutSource
}

function isOff(value: unknown): boolean {
  return value === false || value === 'false'
}

function validMode(value: unknown): LingyunPageNavMode | '' {
  return value === 'auto' || value === 'tabbar' || value === 'sidebar' || value === 'none'
    ? value
    : ''
}

export function resolveLingyunPageLayout(
  input: LingyunPageLayoutInput,
): LingyunPageLayoutResult {
  const wide = Number(input.width) >= LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH
  const safeTabbar =
    input.config.tabbar?.safeArea !== false &&
    input.pageOverride?.tabbarSafeArea !== false &&
    input.safeArea !== false
  const tabbarHeightPx = safeTabbar
    ? LINGYUN_TABBAR_HEIGHT_SAFE_PX
    : LINGYUN_TABBAR_HEIGHT_PX

  const guard =
    !!input.embedded ||
    input.placement === 'sheet' ||
    !!input.grabber ||
    !!input.authHold

  if (guard) {
    return {
      wide,
      navMode: 'none',
      sidebarVisible: false,
      tabbarVisible: false,
      tabbarHeightPx,
      bottomInsetPx: 0,
      source: 'guard',
    }
  }

  const propMode = validMode(input.navMode)
  const pageMode = validMode(input.pageOverride?.navMode)
  const globalMode = validMode(input.config.layout?.navMode)
  const mode: LingyunPageNavMode =
    (propMode && propMode !== 'auto' && propMode) ||
    (pageMode && pageMode !== 'auto' && pageMode) ||
    (globalMode && globalMode !== 'auto' && globalMode) ||
    'auto'
  const source: LingyunPageLayoutSource =
    propMode && propMode !== 'auto'
      ? 'prop'
      : pageMode && pageMode !== 'auto'
        ? 'page'
        : globalMode && globalMode !== 'auto'
          ? 'global'
          : 'width'

  const showNav =
    !isOff(input.showNav) && input.pageOverride?.hideNav !== true
  const showTabbar =
    !isOff(input.showTabbar) && input.pageOverride?.hideTabbar !== true
  const hasTabs = Array.isArray(input.config.tabs) && input.config.tabs.length > 0

  let sidebarVisible = false
  let tabbarVisible = false

  if (!hasTabs) {
    // 没有配置 tabs：旧行为不变，窄屏不会凭空出现 Tab。
    sidebarVisible = (mode === 'auto' || mode === 'sidebar') && wide && showNav
  } else if (mode === 'tabbar') {
    tabbarVisible = showTabbar
  } else if (mode === 'sidebar') {
    if (wide) sidebarVisible = showNav
    else tabbarVisible = showTabbar
  } else if (mode === 'auto') {
    if (wide) sidebarVisible = showNav
    else tabbarVisible = showTabbar
  }

  return {
    wide,
    navMode: sidebarVisible ? 'sidebar' : tabbarVisible ? 'tabbar' : 'none',
    sidebarVisible,
    tabbarVisible,
    tabbarHeightPx,
    bottomInsetPx: tabbarVisible ? tabbarHeightPx : 0,
    source: hasTabs ? source : 'compat',
  }
}
