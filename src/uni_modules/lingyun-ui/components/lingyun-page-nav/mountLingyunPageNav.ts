import { h, render, type App, type AppContext } from 'vue'
import LingyunPageNav from './lingyun-page-nav.vue'
import { LINGYUN_PAGE_NAV_WIDTH } from '@/router/pageNav'
import { LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH } from '../lingyun-toolbars/getLingyunNavSafeInset'

let booted = false
/** 当前页 `showNav` 是否允许停靠侧栏。登录等页会关掉。 */
let pageAllowsNav = true
let applyHostVisibility: () => void = () => {}

export function setLingyunH5PageNavAllowed(allowed: boolean): void {
  pageAllowsNav = !!allowed
  applyHostVisibility()
}

/**
 * H5：把侧栏渲染到 body，只创建一次。
 * 必须用当前应用的 appContext，不能再 createApp，否则会拆掉页面。
 */
export function mountLingyunPageNavHost(appContext: AppContext): void {
  if (booted || typeof document === 'undefined' || !appContext) return
  booted = true
  // 让开当前这次页面渲染，避免 render() 把正在挂载的页面冲掉
  setTimeout(() => mountHost(appContext), 0)
}

/** 随 lingyunUi 安装。等根组件挂上再挂侧栏，避免和首屏渲染抢同一个 app。 */
export function installLingyunPageNav(app: App): void {
  let scheduled = false
  app.mixin({
    mounted() {
      if (scheduled) return
      scheduled = true
      const ctx = app._context
      setTimeout(() => mountLingyunPageNavHost(ctx), 0)
    },
  })
}

function mountHost(appContext: AppContext): void {
  const host = document.createElement('div')
  host.id = 'ly-page-nav-host'
  host.style.position = 'fixed'
  host.style.top = '0'
  host.style.bottom = '0'
  host.style.left = '0'
  host.style.width = `${LINGYUN_PAGE_NAV_WIDTH}px`
  host.style.zIndex = '90'
  host.style.display = 'none'
  host.style.flexDirection = 'column'
  document.body.appendChild(host)

  const vnode = h(LingyunPageNav)
  vnode.appContext = appContext
  render(vnode, host)

  applyHostVisibility = () => {
    const wide = window.innerWidth >= LINGYUN_TOOLBAR_REGULAR_MIN_WIDTH
    host.style.display = wide && pageAllowsNav ? 'flex' : 'none'
  }
  applyHostVisibility()
  window.addEventListener('resize', applyHostVisibility)
}
