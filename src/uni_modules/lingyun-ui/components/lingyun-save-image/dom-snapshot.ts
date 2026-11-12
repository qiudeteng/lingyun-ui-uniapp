/**
 * H5 页面 / 元素截图：克隆 DOM、内联计算样式与资源，再经 SVG foreignObject 光栅化为 PNG。
 * 仅 H5 构建引入（lingyun-save-image 内用 #ifdef H5 包裹），小程序不打包本文件。
 *
 * 约束：
 * - 图片 / 背景图必须内联成 data URL：SVG 以 <img> 渲染时不允许加载外部资源；
 * - 图标字体的 @font-face 同样内联，否则 PUA 字形会变成方框；
 * - 跨域且未开 CORS 的图片无法内联，会在导出结果里缺失（fetch 失败时保留原 URL）。
 */

export interface DomSnapshotOptions {
  pixelRatio?: number
  /** 画布底色；空则取元素自身 / 祖先第一个非透明背景色 */
  background?: string
}

const FONT_FACE_RULE = 5

function isTransparent(color: string): boolean {
  if (!color) return true
  if (color === 'transparent') return true
  return /^rgba\(\s*0,\s*0,\s*0,\s*0\s*\)$/.test(color)
}

function resolveBackgroundColor(element: Element): string {
  let node: Element | null = element
  while (node) {
    const bg = window.getComputedStyle(node).backgroundColor
    if (!isTransparent(bg)) return bg
    node = node.parentElement
  }
  return '#ffffff'
}

/** 逐节点把计算样式写成内联样式；主题变量在计算值里已经解析成实际颜色 */
function inlineStyleTree(source: Element, target: Element): void {
  const computed = window.getComputedStyle(source)
  let css = ''
  for (let i = 0; i < computed.length; i += 1) {
    const prop = computed[i]
    css += `${prop}:${computed.getPropertyValue(prop)};`
  }
  target.setAttribute('style', css)
  const sourceChildren = source.children
  const targetChildren = target.children
  const length = Math.min(sourceChildren.length, targetChildren.length)
  for (let i = 0; i < length; i += 1) {
    inlineStyleTree(sourceChildren[i], targetChildren[i])
  }
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

const dataUrlCache = new Map<string, string | null>()

async function fetchAsDataUrl(url: string): Promise<string | null> {
  if (url.startsWith('data:')) return url
  if (dataUrlCache.has(url)) return dataUrlCache.get(url) || null
  let result: string | null = null
  try {
    const res = await fetch(url, { credentials: 'include' })
    if (res.ok) result = await readAsDataUrl(await res.blob())
  } catch {
    result = null
  }
  dataUrlCache.set(url, result)
  return result
}

function absoluteUrl(raw: string): string {
  try {
    return new URL(raw, document.baseURI).href
  } catch {
    return ''
  }
}

/** 克隆里的 canvas 没有像素，用原始 canvas 导出的 PNG 替换成 <img> */
function replaceCanvases(source: Element, target: Element): void {
  const sourceCanvases = Array.from(source.querySelectorAll('canvas'))
  const targetCanvases = Array.from(target.querySelectorAll('canvas'))
  sourceCanvases.forEach((canvas, index) => {
    const clone = targetCanvases[index]
    if (!clone) return
    try {
      const dataUrl = (canvas as HTMLCanvasElement).toDataURL('image/png')
      const img = document.createElement('img')
      img.setAttribute('src', dataUrl)
      img.setAttribute('style', clone.getAttribute('style') || '')
      clone.replaceWith(img)
    } catch {
      /* 画布被跨域内容污染时保持原样（导出会是空白区域） */
    }
  })
}

async function inlineImages(source: Element, target: Element): Promise<void> {
  const sourceImages = Array.from(source.querySelectorAll('img'))
  const targetImages = Array.from(target.querySelectorAll('img'))
  await Promise.all(
    sourceImages.map(async (img, index) => {
      const clone = targetImages[index]
      if (!clone) return
      const raw = (img as HTMLImageElement).currentSrc || img.getAttribute('src') || ''
      if (!raw || raw.startsWith('data:')) return
      const absolute = absoluteUrl(raw)
      if (!absolute) return
      const dataUrl = await fetchAsDataUrl(absolute)
      clone.removeAttribute('srcset')
      if (dataUrl) clone.setAttribute('src', dataUrl)
    }),
  )
}

/** 内联 style 里的 url(...)（uni-image 用 background-image 渲染图片） */
async function inlineCssUrls(target: Element): Promise<void> {
  const nodes = [target, ...Array.from(target.querySelectorAll('[style]'))]
  for (const node of nodes) {
    const style = node.getAttribute('style') || ''
    if (!style.includes('url(')) continue
    const urls = new Set<string>()
    style.replace(/url\((['"]?)([^'")]+)\1\)/g, (match: string, _quote: string, rawUrl: string) => {
      urls.add(rawUrl)
      return match
    })
    for (const rawUrl of urls) {
      if (rawUrl.startsWith('data:') || rawUrl.startsWith('#')) continue
      const absolute = absoluteUrl(rawUrl)
      if (!absolute) continue
      const dataUrl = await fetchAsDataUrl(absolute)
      if (!dataUrl) continue
      const current = node.getAttribute('style') || ''
      node.setAttribute('style', current.split(rawUrl).join(dataUrl))
    }
  }
}

/** 收集文档里的 @font-face，并把字体文件内联成 data URL */
async function collectFontFaceCss(): Promise<string> {
  const rules: string[] = []
  let fontCss = ''
  for (const sheet of Array.from(document.styleSheets)) {
    let cssRules: CSSRuleList | null = null
    try {
      cssRules = sheet.cssRules
    } catch {
      continue
    }
    if (!cssRules) continue
    for (const rule of Array.from(cssRules)) {
      if (rule.type !== FONT_FACE_RULE) continue
      const cssText = (rule as CSSFontFaceRule).cssText
      fontCss += `${cssText}\n`
      rules.push(cssText)
    }
  }
  if (!rules.length) return ''
  const urls = new Set<string>()
  fontCss.replace(/url\((['"]?)([^'")]+)\1\)/g, (match: string, _quote: string, rawUrl: string) => {
    urls.add(rawUrl)
    return match
  })
  for (const rawUrl of urls) {
    if (rawUrl.startsWith('data:')) continue
    const absolute = absoluteUrl(rawUrl)
    if (!absolute) continue
    const dataUrl = await fetchAsDataUrl(absolute)
    if (dataUrl) fontCss = fontCss.split(rawUrl).join(dataUrl)
  }
  return fontCss
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('截图渲染失败'))
    image.src = src
  })
}

/**
 * SVG 必须走 data URL：Chrome 把 blob: SVG（含 foreignObject）当作跨域图片，
 * drawImage 之后画布会被污染，toDataURL 直接抛 SecurityError。
 */
function svgToDataUrl(svg: string): string {
  const bytes = new TextEncoder().encode(svg)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return `data:image/svg+xml;base64,${btoa(binary)}`
}

export async function captureElementToDataUrl(
  element: HTMLElement,
  options: DomSnapshotOptions = {},
): Promise<string> {
  const rect = element.getBoundingClientRect()
  const width = Math.max(1, Math.round(rect.width))
  const height = Math.max(1, Math.round(rect.height))
  if (rect.width < 1 || rect.height < 1) {
    throw new Error('目标元素没有可截图的尺寸')
  }

  const clone = element.cloneNode(true) as HTMLElement
  inlineStyleTree(element, clone)
  replaceCanvases(element, clone)
  await inlineImages(element, clone)
  await inlineCssUrls(clone)

  clone.style.width = `${width}px`
  clone.style.height = `${height}px`
  clone.style.margin = '0'
  clone.style.transform = 'none'

  const fontCss = await collectFontFaceCss()
  const styleElement = document.createElement('style')
  styleElement.textContent = fontCss

  const wrapper = document.createElement('div')
  wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
  wrapper.style.width = `${width}px`
  wrapper.style.height = `${height}px`
  wrapper.style.margin = '0'
  wrapper.style.padding = '0'
  wrapper.style.overflow = 'hidden'
  wrapper.appendChild(styleElement)
  wrapper.appendChild(clone)

  const xhtml = new XMLSerializer().serializeToString(wrapper)
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="0 0 ${width} ${height}"><foreignObject x="0" y="0" width="${width}" height="${height}">` +
    `${xhtml}</foreignObject></svg>`

  const image = await loadImage(svgToDataUrl(svg))
  const ratio = Math.min(3, Math.max(1, Number(options.pixelRatio) || 2))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * ratio))
  canvas.height = Math.max(1, Math.round(height * ratio))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('当前浏览器不支持画布导出')
  const background = options.background || resolveBackgroundColor(element)
  if (!isTransparent(background)) {
    context.fillStyle = background
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
  context.scale(ratio, ratio)
  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/png')
}

export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${fileName || 'lingyun-image'}.png`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
