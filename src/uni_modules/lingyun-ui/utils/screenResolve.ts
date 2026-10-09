/**
 * 把设备信息与窗口尺寸收成页面可比较的字符串。
 * 不读 uni、不依赖 Vue，方便单独核对样例。
 *
 * 微信没有折叠状态接口。是否折叠屏优先看机型；手机在同一次会话里短边拉开足够大时，
 * 也记成折叠屏。半折没有系统字段，只在窗口明显只占一半，或展开后变得宽而扁时判断。
 */

/** 与顶栏宽屏门槛一致：窗口宽度达到此值走 pad 档。OPPO Find 展开约 692 */
export const LINGYUN_SCREEN_PAD_MIN = 690

/** 窗口宽度达到此值走 pc 档（iPad 竖屏与常见折叠内屏仍落在 pad） */
export const LINGYUN_SCREEN_PC_MIN = 1200

/** 翻盖外屏短边上限。主屏一般 ≥ 320，外屏更小 */
const FLIP_COVER_SHORT_MAX = 280

/** 左右翻内屏短边。低于此值且不够方，视为合上后的外屏 */
const BOOK_INNER_SHORT_MIN = 600

export type LingyunOs = 'ios' | 'android' | 'harmony' | 'windows' | 'mac' | ''
export type LingyunDevice = 'phone' | 'pad' | 'pc' | ''
export type LingyunScreen = 'phone' | 'pad' | 'pc' | ''
export type LingyunFoldable = 'yes' | 'no' | ''
export type LingyunFold = 'folded' | 'expanded' | 'half' | ''

export type LingyunEnv = {
  /** 当前窗口档。折叠、旋转、拉窗口都会变 */
  screen: LingyunScreen
  /** 操作系统 */
  os: LingyunOs
  /** 是否折叠屏：yes / no。信息还没读到时为 '' */
  foldable: LingyunFoldable
  /** 折叠 / 展开 / 半折叠。不是折叠屏时为 '' */
  fold: LingyunFold
  /** 硬件类型。折叠不会把 phone 改成 pad */
  device: LingyunDevice
}

export type LingyunScreenInput = {
  brand: string
  model: string
  osName: string
  platform: string
  system: string
  deviceType: string
  windowWidth: number
  windowHeight: number
  screenWidth: number
  screenHeight: number
  /** 本次运行见过的最小窗口短边；没有则为 0 */
  minShort: number
  /** 本次运行见过的最大窗口短边；没有则为 0 */
  maxShort: number
}

type FoldKind = 'flip' | 'book' | 'none'

const FLIP_RE =
  /(?:z[\s-]*flip|mix[\s-]*flip|find[\s-]*n\d*[\s-]*flip|pixel[\s-]*flip|razr|sm-f7\d{2}|pocket|pht110|pkh110|pkh120|fcp-an|bal-al)/i

const BOOK_RE =
  /(?:z[\s-]*fold|mate[\s-]*x|mix[\s-]*fold|find[\s-]*n|magic[\s-]*v|pixel[\s-]*fold|sm-f[689]\d{2}|pal-al|tah-an|tet-an|alt-al|grl-al|mgi-an|fri-an|ver-an|flc-an|pgu110|phn110|phu110|cpxd0c|cpx3dc|22061218)/i

function textOf(value: unknown): string {
  return String(value || '').trim()
}

function matchFoldKind(id: string): FoldKind {
  if (FLIP_RE.test(id)) return 'flip'
  if (/flip/i.test(id) && !/fold/i.test(id)) return 'flip'
  if (BOOK_RE.test(id)) return 'book'
  if (/fold/i.test(id)) return 'book'
  return 'none'
}

export function resolveOs(osName: string, platform: string, system: string): LingyunOs {
  const blob = `${osName} ${platform} ${system}`.toLowerCase()
  if (/harmony|ohos|openharmony/.test(blob)) return 'harmony'
  if (/iphone|ipad|ios/.test(blob)) return 'ios'
  if (/android/.test(blob)) return 'android'
  if (/windows|win32|win64/.test(blob)) return 'windows'
  if (/mac/.test(blob)) return 'mac'
  return ''
}

export function resolveDevice(
  deviceType: string,
  brand: string,
  model: string,
  platform: string,
  os: LingyunOs,
): LingyunDevice {
  const type = deviceType.toLowerCase()
  if (type === 'phone' || type === 'pad' || type === 'pc') return type
  const id = `${brand} ${model}`.trim().toLowerCase()
  const plat = platform.toLowerCase()
  if (/ipad|tablet/.test(id)) return 'pad'
  if (plat === 'devtools') return 'phone'
  if (
    plat === 'windows' ||
    plat === 'mac' ||
    plat === 'macos' ||
    plat === 'linux' ||
    plat === 'ohos_pc' ||
    os === 'windows' ||
    os === 'mac'
  ) {
    return 'pc'
  }
  if (id || plat || os) return 'phone'
  return ''
}

export function resolveScreen(windowWidth: number): LingyunScreen {
  if (!(windowWidth > 0)) return ''
  if (windowWidth >= LINGYUN_SCREEN_PC_MIN) return 'pc'
  if (windowWidth >= LINGYUN_SCREEN_PAD_MIN) return 'pad'
  return 'phone'
}

function resolveKind(
  id: string,
  os: LingyunOs,
  device: LingyunDevice,
  windowWidth: number,
  windowHeight: number,
  minShort: number,
  maxShort: number,
): FoldKind {
  const fromModel = matchFoldKind(id)
  if (fromModel !== 'none') return fromModel
  const phoneLike = device === 'phone' && os !== 'ios' && os !== 'mac' && os !== 'windows'
  if (!phoneLike) return 'none'
  const span = maxShort - minShort
  if (minShort > 0 && minShort < 480 && maxShort >= BOOK_INNER_SHORT_MIN && span >= 180) {
    return 'book'
  }
  const short = Math.min(windowWidth, windowHeight)
  const long = Math.max(windowWidth, windowHeight)
  const ratio = short > 0 ? long / short : 0
  if (short >= BOOK_INNER_SHORT_MIN && ratio > 0 && ratio < 1.45) return 'book'
  return 'none'
}

function isHalf(
  kind: FoldKind,
  windowWidth: number,
  windowHeight: number,
  screenWidth: number,
  screenHeight: number,
): boolean {
  if (!(windowWidth > 0) || !(windowHeight > 0)) return false
  if (kind !== 'flip' && windowWidth >= BOOK_INNER_SHORT_MIN && windowHeight / windowWidth <= 0.72) {
    return true
  }
  if (!(screenWidth > 0) || !(screenHeight > 0)) return false
  const widthRatio = windowWidth / screenWidth
  const heightRatio = windowHeight / screenHeight
  if (widthRatio > 1.08 || heightRatio > 1.08) return false
  if (widthRatio > 0.9 && heightRatio >= 0.4 && heightRatio <= 0.72) return true
  if (heightRatio > 0.9 && widthRatio >= 0.4 && widthRatio <= 0.72) return true
  return false
}

function resolveFold(
  kind: FoldKind,
  windowWidth: number,
  windowHeight: number,
  screenWidth: number,
  screenHeight: number,
): LingyunFold {
  if (kind === 'none') return ''
  if (isHalf(kind, windowWidth, windowHeight, screenWidth, screenHeight)) return 'half'
  const short = Math.min(windowWidth, windowHeight)
  const long = Math.max(windowWidth, windowHeight)
  const ratio = short > 0 ? long / short : 0
  if (kind === 'flip') {
    if (short > 0 && short < FLIP_COVER_SHORT_MAX) return 'folded'
    return 'expanded'
  }
  if (short >= BOOK_INNER_SHORT_MIN) return 'expanded'
  if (ratio > 0 && ratio < 1.45 && short >= 500) return 'expanded'
  return 'folded'
}

export function resolveLingyunSnapshot(input: LingyunScreenInput): LingyunEnv {
  const brand = textOf(input.brand)
  const model = textOf(input.model)
  const platform = textOf(input.platform)
  const os = resolveOs(input.osName, platform, input.system)
  const device = resolveDevice(input.deviceType, brand, model, platform, os)
  const screen = resolveScreen(input.windowWidth)
  const kind = resolveKind(
    `${brand} ${model}`,
    os,
    device,
    input.windowWidth,
    input.windowHeight,
    input.minShort,
    input.maxShort,
  )
  const known = !!(device || os || screen)
  return {
    screen,
    os,
    device,
    foldable: kind === 'none' ? (known ? 'no' : '') : 'yes',
    fold: resolveFold(kind, input.windowWidth, input.windowHeight, input.screenWidth, input.screenHeight),
  }
}
