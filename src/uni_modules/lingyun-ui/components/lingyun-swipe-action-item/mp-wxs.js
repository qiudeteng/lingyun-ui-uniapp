/* #ifdef APP-VUE || APP-HARMONY || MP-WEIXIN || H5 */
import { LINGYUN_APP_PAGE_SCROLL_LOCK } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

let isPc = null
// #ifdef H5
function detectPc() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod', 'Mobile', 'Harmony', 'HarmonyOS']
  return !agents.some((a) => ua.indexOf(a) > 0)
}
isPc = detectPc()
// #endif

/**
 * WXS 跟手端（微信 / H5 / App-Vue），逻辑对齐 `uni-swipe-action` 的 mpwxs.js。
 *
 * 关键约定（勿擅自改，踩坑记录见 design/SWIPE_ACTIONS.md §4.9）：
 * - `is_show` 的 `change:prop` 必须与手势监听挂在**同一个** `__box` 节点上：
 *   `change` 回写 `is_show` 会再触发一次 `showWatch`，由 WXS 重新校准位移，
 *   这个自愈回路正是官方组件在 iOS 上不闪的原因；拆到别的节点反而会坏。
 * - 灰胶囊 opacity 跟手 setStyle（约 32px）；分割线：本行 hideDivider + 下一行 hideDividerFromPrev；list-item 用 class 藏线。
 * - 横向确认后：WXS `return false` + `preventDefault` 拦滚动；**禁止**手势中途改 `scroll-y`。
 * - 纵向位移 ≥ 40px 视为滑出本行，立即按阈值结算；`touchcancel` 与 `touchend` 同等结算。
 */
export default {
  data() {
    return {
      is_show: 'none',
      /** 给内部 list-item inject：本行藏线 / 上一行借走本行顶线 */
      swipeSurface: {
        hideDivider: false,
        hideDividerFromPrev: false,
      },
    }
  },
  inject: {
    lingyunAppPageScrollLock: {
      from: LINGYUN_APP_PAGE_SCROLL_LOCK,
      default: null,
    },
  },
  watch: {
    show() {
      this.is_show = this.show
    },
  },
  created() {
    this.swipeaction = this.getSwipeAction()
    if (this.swipeaction && Array.isArray(this.swipeaction.children)) {
      this.swipeaction.children.push(this)
    }
    this._pageScrollLocked = false
  },
  mounted() {
    this.is_show = this.show
  },
  beforeUnmount() {
    this.unlockPageScroll()
    /* 卸掉时还回下一行顶线，避免残留 hideDividerFromPrev */
    this.setSwipeDividersHidden({ hide: false })
  },
  methods: {
    /** wxs 中调用 */
    closeSwipe() {
      if (this.autoClose && this.swipeaction) {
        this.swipeaction.closeOther(this)
      }
    },
    /**
     * wxs / renderjs：横向确认后锁页面 scroll-view；松手解锁。
     * 无 app-page 包裹时 inject 为空，静默跳过。
     */
    lockPageScroll() {
      if (this._pageScrollLocked) return
      this._pageScrollLocked = true
      const api = this.lingyunAppPageScrollLock
      if (api && typeof api.lock === 'function') api.lock()
    },
    unlockPageScroll() {
      if (!this._pageScrollLocked) return
      this._pageScrollLocked = false
      const api = this.lingyunAppPageScrollLock
      if (api && typeof api.unlock === 'function') api.unlock()
    },
    /**
     * wxs / renderjs：藏本行顶线，并借下一行顶线当「底边」。
     * 下一行用 hideDividerFromPrev，避免和它自己的 hideDivider 互相覆盖（iOS 上下线错乱主因）。
     */
    setSwipeDividersHidden(e) {
      const hide = !!(e && e.hide)
      if (this.swipeSurface.hideDivider !== hide) {
        this.swipeSurface.hideDivider = hide
      }
      const children = this.swipeaction && this.swipeaction.children
      if (!Array.isArray(children)) return
      const i = children.indexOf(this)
      const next = i >= 0 ? children[i + 1] : null
      if (next && typeof next.setHideDividerFromPrev === 'function') {
        next.setHideDividerFromPrev(hide)
      } else if (next && next.swipeSurface && next.swipeSurface.hideDividerFromPrev !== hide) {
        next.swipeSurface.hideDividerFromPrev = hide
      }
    },
    /** 上一行借/还本行顶部分割线 */
    setHideDividerFromPrev(hide) {
      const next = !!hide
      if (this.swipeSurface.hideDividerFromPrev !== next) {
        this.swipeSurface.hideDividerFromPrev = next
      }
    },
    /** wxs 中调用：开合变化 */
    change(e) {
      const open = (e && e.open) || 'none'
      this.$emit('change', open)
      if (this.is_show !== open) {
        this.is_show = open
      }
    },
    /** 容器互斥 / closeAll 调用 */
    close() {
      this.is_show = 'none'
    },
    appTouchStart(e) {
      if (isPc) return
      const touch = e.changedTouches && e.changedTouches[0]
      if (!touch) return
      this.clientX = touch.clientX
      this.timestamp = Date.now()
    },
    /**
     * 按钮区的反向滑动 = 收起本行。
     *
     * 必须 catch 住 touchmove：按钮已 catch 掉 touchstart / touchend，若放 move 冒泡到
     * `__box`，手势层会拿上一次手势的残留 startX 算 deltaX 把行推到乱位，且 touchend
     * 被 catch 后永远不归位（表现为「停在滑到的位置 + 灰底铺满整行」）。
     *
     * 但滑开后可拖的内容区只剩几十 px，回拖时手指基本落在按钮上，只拦不处理等于没法取消。
     * 这里改 `is_show` 交给 `showWatch` 带动画归位（不跟手，但方向明确、够果断）；
     * 阈值与点击判定的 40 对齐，超过即不再算点击。
     */
    appTouchMove(e) {
      if (isPc) return
      if (this.is_show === 'none') return
      const touch = e.changedTouches && e.changedTouches[0]
      if (!touch || typeof this.clientX !== 'number') return
      const delta = touch.clientX - this.clientX
      const isBack = this.is_show === 'right' ? delta > 40 : delta < -40
      if (isBack) this.close()
    },
    appTouchEnd(e, index, item, position) {
      if (isPc) return
      const touch = e.changedTouches && e.changedTouches[0]
      if (!touch) return
      /* 模拟点击，规避 iOS 13 touchend 早于 click 造成的错位 */
      const diff = Math.abs(this.clientX - touch.clientX)
      const time = Date.now() - this.timestamp
      if (diff < 40 && time < 300) {
        this.emitClick(index, item, position)
      }
    },
    onClickForPc(index, item, position) {
      if (!isPc) return
      // #ifdef H5
      this.emitClick(index, item, position)
      // #endif
    },
    emitClick(index, item, position) {
      this.$emit('click', {
        content: item,
        index,
        position,
        key: item && item.key,
      })
      if (this.closeOnClick) {
        this.close()
      }
    },
  },
}
/* #endif */

/* #ifndef APP-VUE || APP-HARMONY || MP-WEIXIN || H5 */
export default {}
/* #endif */
