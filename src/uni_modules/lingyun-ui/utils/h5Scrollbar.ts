/**
 * H5 页面级悬浮滚动条。
 *
 * Windows Chrome / Edge 的原生滚动条参与布局宽度，切到有 / 无滚动条的页面时内容会变窄。
 * 页面级这里隐藏 html / body 原生条，改用 fixed 轨道 + 滑块覆盖在视口右侧：
 * - 不参与布局，不挤压页面；
 * - 只处理 document 滚动；
 * - 菜单、表格等内部滚动条不在这里处理。
 */

let installed = false
let rail: HTMLDivElement | null = null
let thumb: HTMLDivElement | null = null
let frame = 0
let dragging = false
let dragOffset = 0
let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function readScrollTop(): number {
  return Number(
    window.scrollY ||
      (document.scrollingElement && document.scrollingElement.scrollTop) ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0,
  )
}

function readContentHeight(): number {
  return Math.max(
    document.documentElement.scrollHeight,
    document.body ? document.body.scrollHeight : 0,
  )
}

function readMaxScroll(): number {
  return Math.max(0, readContentHeight() - window.innerHeight)
}

function isPageScrollLocked(): boolean {
  if (!document.body) return true
  const htmlOverflow = window.getComputedStyle(document.documentElement).overflowY
  const bodyOverflow = window.getComputedStyle(document.body).overflowY
  return htmlOverflow === 'hidden' || bodyOverflow === 'hidden'
}

function update(): void {
  if (!rail || !thumb) return
  frame = 0
  if (isPageScrollLocked()) {
    rail.style.display = 'none'
    return
  }
  const viewH = window.innerHeight
  const total = readContentHeight()
  const maxScroll = Math.max(0, total - viewH)
  if (maxScroll <= 0) {
    rail.style.display = 'none'
    return
  }
  rail.style.display = 'block'
  const railHeight = Math.max(0, rail.getBoundingClientRect().height)
  const thumbHeight = Math.min(
    railHeight,
    Math.max(40, Math.round((railHeight * viewH) / total)),
  )
  const travel = Math.max(0, railHeight - thumbHeight)
  thumb.style.height = `${thumbHeight}px`
  thumb.style.transform = `translateY(${
    (clamp(readScrollTop(), 0, maxScroll) / maxScroll) * travel
  }px)`
}

function queueUpdate(): void {
  if (frame) return
  frame = window.setTimeout(update, 16)
}

function scrollToPointer(clientY: number, offset = 0): void {
  if (!rail || !thumb) return
  const railRect = rail.getBoundingClientRect()
  const thumbHeight = thumb.getBoundingClientRect().height
  const travel = Math.max(0, railRect.height - thumbHeight)
  const maxScroll = readMaxScroll()
  if (!railRect.height || travel <= 0 || maxScroll <= 0) return
  const top = clamp(clientY - railRect.top - offset, 0, travel)
  window.scrollTo(0, (top / travel) * maxScroll)
  queueUpdate()
}

function attach(): void {
  if (!document.body || rail) return
  rail = document.createElement('div')
  rail.className = 'lingyun-h5-scrollbar'
  rail.setAttribute('role', 'scrollbar')
  rail.setAttribute('aria-orientation', 'vertical')
  thumb = document.createElement('div')
  thumb.className = 'lingyun-h5-scrollbar__thumb'
  rail.appendChild(thumb)
  document.body.appendChild(rail)

  window.addEventListener('scroll', queueUpdate, { passive: true })
  window.addEventListener('resize', queueUpdate)
  window.addEventListener('load', queueUpdate, { once: true })
  ;[200, 600, 1200, 2000].forEach((delay) => {
    window.setTimeout(queueUpdate, delay)
  })
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(queueUpdate)
    resizeObserver.observe(document.body)
  }
  mutationObserver = new MutationObserver(queueUpdate)
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  })

  rail.addEventListener('pointerdown', (event: PointerEvent) => {
    if (!rail || !thumb || event.button !== 0) return
    const thumbRect = thumb.getBoundingClientRect()
    const insideThumb =
      event.clientY >= thumbRect.top && event.clientY <= thumbRect.bottom
    dragging = true
    dragOffset = insideThumb
      ? event.clientY - thumbRect.top
      : thumbRect.height / 2
    rail.classList.add('is-dragging')
    try {
      rail.setPointerCapture(event.pointerId)
    } catch {
      /* 旧浏览器忽略 */
    }
    if (!insideThumb) scrollToPointer(event.clientY, dragOffset)
    else queueUpdate()
    event.preventDefault()
  })
  rail.addEventListener('pointermove', (event: PointerEvent) => {
    if (!dragging) return
    scrollToPointer(event.clientY, dragOffset)
    event.preventDefault()
  })
  const endDrag = (): void => {
    if (!dragging) return
    dragging = false
    if (rail) rail.classList.remove('is-dragging')
  }
  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)

  update()
}

/** 安装页面级悬浮滚动条；H5 下由 lingyunUi 自动调用，重复调用无副作用。 */
export function installLingyunH5Scrollbar(): void {
  // #ifdef H5
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (installed) return
  installed = true
  document.documentElement.classList.add('lingyun-h5-scrollbar-hidden')
  if (document.body) attach()
  else window.addEventListener('DOMContentLoaded', attach, { once: true })
  // #endif
}

/** 仅测试 / 热更新时释放；正常业务不需要调用。 */
export function uninstallLingyunH5Scrollbar(): void {
  // #ifdef H5
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }
  if (frame) {
    window.clearTimeout(frame)
    frame = 0
  }
  if (rail && rail.parentNode) rail.parentNode.removeChild(rail)
  rail = null
  thumb = null
  dragging = false
  installed = false
  document.documentElement.classList.remove('lingyun-h5-scrollbar-hidden')
  // #endif
}
