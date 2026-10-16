import { h, render, type App, type AppContext } from 'vue'
import DemoThemeSwitch from './demo-theme-switch.vue'

let mounted = false

/** H5 Demo 工具属于宿主工程，挂到 body，避免发布组件反向依赖业务组件。 */
export function installDemoThemeSwitch(app: App): void {
  let scheduled = false
  app.mixin({
    mounted() {
      if (scheduled) return
      scheduled = true
      const context = app._context
      setTimeout(() => mountDemoThemeSwitch(context), 0)
    },
  })
}

function mountDemoThemeSwitch(appContext: AppContext): void {
  if (mounted || typeof document === 'undefined') return
  mounted = true
  const host = document.createElement('div')
  host.id = 'demo-theme-switch-host'
  document.body.appendChild(host)

  const vnode = h(DemoThemeSwitch)
  vnode.appContext = appContext
  render(vnode, host)
}
