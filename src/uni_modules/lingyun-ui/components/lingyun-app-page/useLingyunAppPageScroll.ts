import { inject, provide, type InjectionKey } from 'vue'

export const LINGYUN_APP_PAGE_REPORT_SCROLL: InjectionKey<(scrollTop: number) => void> =
  Symbol('lingyunAppPageReportScroll')

/**
 * 页面把 lingyun-app-page 当根节点时，useLingyunAppPageScroll 跑在祖先里，
 * 收不到子组件的 provide。页面先提供绑定口，app-page 在 setup 里把上报函数交回。
 */
export const LINGYUN_APP_PAGE_BIND_SCROLL: InjectionKey<
  (report: (scrollTop: number) => void) => void
> = Symbol('lingyunAppPageBindScroll')

/** 横向 swipe 锁定 / 解锁页面 scroll-view（iOS 斜滑防上下晃） */
export type LingyunAppPageScrollLock = {
  lock: () => void
  unlock: () => void
}

export const LINGYUN_APP_PAGE_SCROLL_LOCK: InjectionKey<LingyunAppPageScrollLock> = Symbol(
  'lingyunAppPageScrollLock',
)

/** 内层 scroll-view 上报滚动，驱动顶栏玻璃渐变 */
export function useLingyunAppPageScroll(): (scrollTop: number) => void {
  const fromAncestor = inject(LINGYUN_APP_PAGE_REPORT_SCROLL, null)
  if (fromAncestor) return fromAncestor

  let report: (scrollTop: number) => void = () => {}
  provide(LINGYUN_APP_PAGE_BIND_SCROLL, (fn) => {
    report = fn
  })
  return (scrollTop: number) => report(scrollTop)
}
