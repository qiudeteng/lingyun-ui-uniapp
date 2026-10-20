/**
 * 页面壳布局解析（纯函数，不依赖 Vue / uni）。
 *
 * 布局以设备形态为主、窗口宽度为辅：Duo 不按 669/951 宽度猜，
 * 而是用 formFactor + duoPose 直接选中官方 Standard 结构。
 * 非 Duo 仍沿用宽度门槛：<690 手机、690–1199 平板、≥1200 PC。
 */
import { LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH } from '../components/lingyun-toolbars/getLingyunNavSafeInset'
import {
  LINGYUN_TABBAR_HEIGHT_PX,
  LINGYUN_TABBAR_HEIGHT_SAFE_PX,
} from '../components/lingyun-tabbars/tabbarMetrics'
import {
  LINGYUN_DUO_FOLD_BAND,
  LINGYUN_DUO_RAIL_WIDTH,
  LINGYUN_DUO_TABBAR_HEIGHT,
  LINGYUN_DUO_TABBAR_HEIGHT_NO_SAFE,
} from './duoMetrics'
import {
  LINGYUN_PAGE_NAV_RAIL_WIDTH,
  LINGYUN_PAGE_NAV_WIDTH,
} from './pageNavAdapter'
import {
  LINGYUN_SCREEN_PAD_MIN,
  LINGYUN_SCREEN_PC_MIN,
  type LingyunDuoPose,
  type LingyunFormFactor,
} from './screenResolve'

export type LingyunPageNavMode = 'auto' | 'tabbar' | 'sidebar' | 'none'

export type LingyunLayoutClass =
  | 'mobile'
  | 'tablet'
  | 'desktop'
  | 'duo-outer-portrait'
  | 'duo-outer-landscape'
  | 'duo-inner-portrait'
  | 'duo-inner-portrait-folded'
  | 'duo-inner-landscape'
  | 'duo-inner-landscape-folded'

export type LingyunPageChrome =
  | 'mobile'
  | 'tablet-rail'
  | 'desktop-rail'
  | 'duo-right-rail'
  | 'duo-top-bottom'
  | 'duo-split'

export type LingyunFoldBand = 'none' | 'horizontal' | 'vertical'
export type LingyunRailVariant = 'none' | 'directory' | 'rail'

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
  /** 设备形态；不传时按 width 推断 */
  formFactor?: LingyunFormFactor
  /** Duo 姿态；formFactor=duo 时生效 */
  duoPose?: LingyunDuoPose
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
  layoutClass: LingyunLayoutClass
  chrome: LingyunPageChrome
  navSide: 'left' | 'right' | ''
  railWidth: number
  railVariant: LingyunRailVariant
  toolbarPlacement: 'top' | 'hidden'
  splitView: boolean
  foldBand: LingyunFoldBand
  foldBandSize: number
  navMode: 'tabbar' | 'sidebar' | 'none'
  sidebarVisible: boolean
  tabbarVisible: boolean
  /** 78 / 99；Duo 70 / 95 */
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

function resolveLayoutClass(
  formFactor: LingyunFormFactor,
  duoPose: LingyunDuoPose,
  width: number,
): LingyunLayoutClass {
  if (formFactor === 'duo' && duoPose) {
    return `duo-${duoPose}` as LingyunLayoutClass
  }
  if (formFactor === 'tablet' && width >= LINGYUN_SCREEN_PAD_MIN) return 'tablet'
  if (formFactor === 'desktop' && width >= LINGYUN_SCREEN_PC_MIN) return 'desktop'
  if (formFactor === 'tablet' || formFactor === 'desktop') return 'mobile'
  return 'mobile'
}

function chromeOf(layoutClass: LingyunLayoutClass): LingyunPageChrome {
  if (layoutClass === 'mobile') return 'mobile'
  if (layoutClass === 'tablet') return 'tablet-rail'
  if (layoutClass === 'desktop') return 'desktop-rail'
  if (
    layoutClass === 'duo-inner-portrait' ||
    layoutClass === 'duo-inner-portrait-folded'
  ) {
    return 'duo-top-bottom'
  }
  if (layoutClass === 'duo-inner-landscape-folded') return 'duo-split'
  return 'duo-right-rail'
}

export function resolveLingyunPageLayout(
  input: LingyunPageLayoutInput,
): LingyunPageLayoutResult {
  const width = Math.max(0, Number(input.width) || 0)
  const wide = width >= LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH
  const fallbackFormFactor: LingyunFormFactor =
    width >= LINGYUN_SCREEN_PC_MIN
      ? 'desktop'
      : width >= LINGYUN_SCREEN_PAD_MIN
        ? 'tablet'
        : 'mobile'
  const formFactor: LingyunFormFactor =
    input.formFactor === 'duo' && !input.duoPose
      ? fallbackFormFactor
      : input.formFactor || fallbackFormFactor
  const duoPose = formFactor === 'duo' ? (input.duoPose || '') : ''
  const layoutClass = resolveLayoutClass(formFactor, duoPose, width)
  const chrome = chromeOf(layoutClass)
  const isDuo = layoutClass.startsWith('duo-')
  const toolbarPlacement: 'top' | 'hidden' =
    chrome === 'duo-right-rail' ? 'hidden' : 'top'

  const safeTabbar =
    input.config.tabbar?.safeArea !== false &&
    input.pageOverride?.tabbarSafeArea !== false &&
    input.safeArea !== false
  const duoBottomBar = chrome === 'duo-top-bottom'
  const tabbarHeightPx = duoBottomBar
    ? safeTabbar
      ? LINGYUN_DUO_TABBAR_HEIGHT
      : LINGYUN_DUO_TABBAR_HEIGHT_NO_SAFE
    : safeTabbar
      ? LINGYUN_TABBAR_HEIGHT_SAFE_PX
      : LINGYUN_TABBAR_HEIGHT_PX

  const foldBand: LingyunFoldBand =
    layoutClass === 'duo-inner-portrait-folded'
      ? 'horizontal'
      : layoutClass === 'duo-inner-landscape-folded'
        ? 'vertical'
        : 'none'
  const splitView = layoutClass === 'duo-inner-landscape-folded'

  const guard =
    !!input.embedded ||
    input.placement === 'sheet' ||
    !!input.grabber ||
    !!input.authHold

  if (guard) {
    return {
      wide,
      layoutClass,
      chrome,
      navSide: '',
      railWidth: 0,
      railVariant: 'none',
      toolbarPlacement,
      splitView: false,
      foldBand: 'none',
      foldBandSize: 0,
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

  if (isDuo) {
    if (mode !== 'none') {
      if (chrome === 'duo-top-bottom') {
        tabbarVisible = showTabbar && hasTabs
      } else if (chrome === 'duo-right-rail') {
        sidebarVisible = showNav && hasTabs
      }
      // duo-split：Tab 隐藏，右侧返回列由 app-page 的 Split View chrome 渲染
    }
  } else if (!hasTabs) {
    // 没有配置 tabs：旧行为不变，窄屏不会凭空出现 Tab。
    const railLayout = layoutClass === 'tablet' || layoutClass === 'desktop'
    sidebarVisible = (mode === 'auto' || mode === 'sidebar') && railLayout && showNav
  } else if (mode === 'tabbar') {
    tabbarVisible = showTabbar
  } else if (mode === 'sidebar') {
    const railLayout = layoutClass === 'tablet' || layoutClass === 'desktop'
    if (railLayout) sidebarVisible = showNav
    else tabbarVisible = showTabbar
  } else if (mode === 'auto') {
    const railLayout = layoutClass === 'tablet' || layoutClass === 'desktop'
    if (railLayout) sidebarVisible = showNav
    else tabbarVisible = showTabbar
  }

  const railVariant: LingyunRailVariant = sidebarVisible
    ? isDuo || hasTabs
      ? 'rail'
      : 'directory'
    : 'none'
  const railWidth = sidebarVisible
    ? isDuo
      ? LINGYUN_DUO_RAIL_WIDTH
      : hasTabs
        ? LINGYUN_PAGE_NAV_RAIL_WIDTH
        : LINGYUN_PAGE_NAV_WIDTH
    : 0
  const navSide: 'left' | 'right' | '' = sidebarVisible
    ? chrome === 'duo-right-rail'
      ? 'right'
      : 'left'
    : ''

  return {
    wide,
    layoutClass,
    chrome,
    navSide,
    railWidth,
    railVariant,
    toolbarPlacement,
    splitView,
    foldBand,
    foldBandSize: foldBand === 'none' ? 0 : LINGYUN_DUO_FOLD_BAND,
    navMode: sidebarVisible ? 'sidebar' : tabbarVisible ? 'tabbar' : 'none',
    sidebarVisible,
    tabbarVisible,
    tabbarHeightPx,
    bottomInsetPx: tabbarVisible ? tabbarHeightPx : 0,
    source: isDuo ? source : hasTabs ? source : 'compat',
  }
}
