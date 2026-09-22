/** 栏身左右内边距（iPhone；与样式 $ly-toolbar-pad-x 一致） */
export const LINGYUN_TOOLBAR_PAD_X_PX = 16

/** 真机验收默认栏身高度：8 + 44 + 8 = 60 */
export const LINGYUN_TOOLBAR_BAR_DESIGN_PX = 60

/** 栏身上内边距（iPhone） */
export const LINGYUN_TOOLBAR_BAR_PAD_TOP_PX = 8

/** 栏身下内边距（iPhone，按钮勿贴边） */
export const LINGYUN_TOOLBAR_BAR_PAD_BOTTOM_PX = 8

/** iPhone 操作钮间距 */
export const LINGYUN_TOOLBAR_GAP_PX = 8

/**
 * 宽屏门槛。iPad 竖屏是 768；折叠屏内屏常见 717 左右（如 717×781），
 * 取 700 让展开进入左侧导航。手机竖屏一般 ≤ 430，不会误开。
 */
export const LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH = 700

/** iPad Top 栏身：1210 × 54（内容行 44 顶对齐，下留 10） */
export const LINGYUN_TOOLBAR_BAR_REGULAR_PX = 54

/** iPad 左右内边距 */
export const LINGYUN_TOOLBAR_PAD_X_REGULAR_PX = 20

/** iPad 栏身上内边距（按钮贴齐栏顶） */
export const LINGYUN_TOOLBAR_PAD_TOP_REGULAR_PX = 0

/** iPad 栏身下内边距：54 − 44 */
export const LINGYUN_TOOLBAR_PAD_BOTTOM_REGULAR_PX = 10

/** iPad Leading / Trailing 间距 */
export const LINGYUN_TOOLBAR_GAP_REGULAR_PX = 12

/** Mac 窗口按钮组：41 × 22（Close / Minimize / Expand） */
export const LINGYUN_TOOLBAR_WINDOW_CONTROLS_W_PX = 41

/** iPhone Large 额外高度：111 − 60 */
export const LINGYUN_TOOLBAR_LARGE_EXTRA_PX = 51

/** iPad Large 额外高度：102 − 54 */
export const LINGYUN_TOOLBAR_LARGE_EXTRA_REGULAR_PX = 48

/** Title 2 Line Large 额外高度：iPhone 131 − 60，iPad 125 − 54，同为 71 */
export const LINGYUN_TOOLBAR_2LINE_LARGE_EXTRA_PX = 71

/**
 * 从状态栏挪到内容行下边距的 px（仅有真实状态栏时生效）。
 * 总高度不变：status 少 5，bar 下边距多 5（8→13）。
 */
export const LINGYUN_STATUS_TO_BAR_BOTTOM_PX = 5

/** 操作钮边长，栏身高度至少不低于此值 */
const ACTION_PX = 44

/** 含上下内边距时的栏身最小高度：8 + 44 + 8 = 60 */
export const LINGYUN_TOOLBAR_BAR_MIN_PX =
  ACTION_PX + LINGYUN_TOOLBAR_BAR_PAD_TOP_PX + LINGYUN_TOOLBAR_BAR_PAD_BOTTOM_PX

export type LingyunNavLayout = {
  /** 真实状态栏高度（微信勿用 CSS --status-bar-height，该变量固定 25px） */
  statusBarHeight: number
  /**
   * 导航内容行高度：微信按胶囊推算，但不少于设计高度（60），
   * 以保证上下各 8 内边距，避免 44 钮贴边。
   */
  barHeight: number
  /** 右侧避开胶囊的宽度；无胶囊为 0 */
  rightInset: number
  /** 是否已按微信胶囊算出内容行高（高度仍可能被抬到 ≥ 设计高度） */
  fromCapsule: boolean
  /** 宽屏（折叠屏展开 / iPad / Mac，windowWidth ≥ 700）走 iPad 栏身，不走 iPhone 60 */
  regular: boolean
  padX: number
  padTop: number
  padBottom: number
  gap: number
  /** 仅 Mac 桌面：栏身左侧交通灯。iPad 全屏与微信为 false */
  windowControls: boolean
  /** Large 标题区额外高度 */
  largeExtra: number
  /** Title 2 Line Large 额外高度 */
  title2LineLargeExtra: number
}

function readWindow(): { statusBarHeight: number; windowWidth: number } {
  try {
    const win =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    return {
      statusBarHeight: Number(win.statusBarHeight) || 0,
      windowWidth: Number(win.windowWidth) || 0,
    }
  } catch {
    return { statusBarHeight: 0, windowWidth: 0 }
  }
}

/** 折叠屏 / 旋转回调里的新宽度。getWindowInfo 在展开当下经常还是旧值。 */
export function readLingyunResizeWidth(res?: unknown): number {
  if (!res || typeof res !== 'object') return 0
  const rec = res as { size?: { windowWidth?: number }; windowWidth?: number }
  const fromSize = Number(rec.size && rec.size.windowWidth)
  if (Number.isFinite(fromSize) && fromSize > 0) return fromSize
  const direct = Number(rec.windowWidth)
  return Number.isFinite(direct) && direct > 0 ? direct : 0
}

/**
 * Mac 桌面才显示窗口按钮。iPad（deviceType=pad）与手机、微信都不显示。
 * 微信条件编译直接返回 false，避免开发者工具在 Mac 上误开交通灯。
 */
function isMacDesktop(): boolean {
  // #ifdef MP-WEIXIN
  return false
  // #endif
  // #ifndef MP-WEIXIN
  try {
    const sys =
      typeof uni.getDeviceInfo === 'function' ? uni.getDeviceInfo() : uni.getSystemInfoSync()
    const rec = sys as { osName?: string; platform?: string; deviceType?: string }
    const device = String(rec.deviceType || '').toLowerCase()
    if (device === 'phone' || device === 'pad') return false
    const os = String(rec.osName || rec.platform || '').toLowerCase()
    if (os === 'macos' || os === 'mac' || os.includes('mac')) return true
  } catch {
    /* fall through */
  }
  // #ifdef H5
  if (typeof navigator !== 'undefined') {
    const plat = String(navigator.platform || '')
    const ua = String(navigator.userAgent || '')
    if (/iPhone|iPad|iPod/i.test(ua)) return false
    if (/Mac/i.test(plat) || /Mac OS X/i.test(ua)) return true
  }
  // #endif
  return false
  // #endif
}

/**
 * 自定义导航高度 / 占位，对齐 `uni-nav-bar`：
 * - 状态栏：`uni.getWindowInfo().statusBarHeight`（真机值）
 * - 窄屏：微信内容行与设计 **60** 取大（上下各 8）
 * - 宽屏（≥700）：iPad 栏身 **54**（上 0 / 下 10），Mac 桌面再加窗口按钮
 * @see design/TOOLBARS.md
 */
export function getLingyunNavLayout(
  designBarHeight: number = LINGYUN_TOOLBAR_BAR_DESIGN_PX,
  windowWidthOverride?: number,
): LingyunNavLayout {
  const win = readWindow()
  const windowWidth =
    typeof windowWidthOverride === 'number' && windowWidthOverride > 0
      ? windowWidthOverride
      : win.windowWidth
  const regular = windowWidth >= LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH
  const design = regular ? LINGYUN_TOOLBAR_BAR_REGULAR_PX : designBarHeight
  let statusBarHeight = win.statusBarHeight
  let barHeight = design
  let rightInset = 0
  let fromCapsule = false

  // #ifdef MP-WEIXIN
  try {
    if (typeof uni.getMenuButtonBoundingClientRect === 'function') {
      const menu = uni.getMenuButtonBoundingClientRect()
      if (menu && menu.width > 0 && menu.height > 0 && menu.top != null) {
        const spaceHeight = Math.max(0, menu.top - statusBarHeight)
        barHeight = Math.max(menu.height + spaceHeight * 2, ACTION_PX)
        fromCapsule = true
        if (menu.left > 0 && windowWidth > 0) {
          rightInset = Math.max(0, windowWidth - menu.left)
        }
      }
    }
  } catch {
    // 异常时退回设计高度
  }
  // #endif

  // #ifndef MP-WEIXIN
  barHeight = design
  rightInset = 0
  fromCapsule = false
  // #endif

  if (regular) {
    barHeight = Math.max(barHeight, LINGYUN_TOOLBAR_BAR_REGULAR_PX)
  } else {
    // 窄屏保证能放下上下各 8 + 44 钮（border-box）→ 至少 60
    barHeight = Math.max(barHeight, designBarHeight, LINGYUN_TOOLBAR_BAR_MIN_PX)
  }

  return {
    statusBarHeight,
    barHeight,
    rightInset,
    fromCapsule,
    regular,
    padX: regular ? LINGYUN_TOOLBAR_PAD_X_REGULAR_PX : LINGYUN_TOOLBAR_PAD_X_PX,
    padTop: regular ? LINGYUN_TOOLBAR_PAD_TOP_REGULAR_PX : LINGYUN_TOOLBAR_BAR_PAD_TOP_PX,
    padBottom: regular ? LINGYUN_TOOLBAR_PAD_BOTTOM_REGULAR_PX : LINGYUN_TOOLBAR_BAR_PAD_BOTTOM_PX,
    gap: regular ? LINGYUN_TOOLBAR_GAP_REGULAR_PX : LINGYUN_TOOLBAR_GAP_PX,
    windowControls: regular && isMacDesktop(),
    largeExtra: regular ? LINGYUN_TOOLBAR_LARGE_EXTRA_REGULAR_PX : LINGYUN_TOOLBAR_LARGE_EXTRA_PX,
    title2LineLargeExtra: LINGYUN_TOOLBAR_2LINE_LARGE_EXTRA_PX,
  }
}

/** 页面顶栏占位：状态栏 + 栏身。全屏浮层顶缘落在这之下，避开微信胶囊。 */
export function getLingyunToolbarStackPx(): number {
  const layout = getLingyunNavLayout()
  return (Number(layout.statusBarHeight) || 0) + (Number(layout.barHeight) || 0)
}

/** 三态开关：未传 / auto → 用 fallback；微信上 Boolean 未传常被写成 false，故不要用 Boolean+undefined */
export function coerceTriFlag(value: unknown, fallback: boolean): boolean {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return fallback
}
