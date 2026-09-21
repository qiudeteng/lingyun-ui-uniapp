/* JS 跟手：非微信 / 非 H5 / 非 APP-VUE 端降级（长列表性能较弱） */
import { LINGYUN_APP_PAGE_SCROLL_LOCK } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'

const MIN_DISTANCE = 10
const CAPSULE_FADE_PX = 32
const LEAVE_ROW_Y = 40
const CAPSULE_SETTLE_TRANSITION = 'opacity 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'

/* #ifndef APP-VUE || APP-HARMONY || MP-WEIXIN || H5 */
export default {
  data() {
    return {
      ani: false,
      left: 0,
      moveLeft: 'translateX(0px)',
      leftWidth: 0,
      rightWidth: 0,
      direction: '',
      deltaX: 0,
      deltaY: 0,
      offsetX: 0,
      offsetY: 0,
      x: 0,
      buttonShow: 'none',
      contentOpen: false,
      capsuleProgress: 0,
      capsuleTransition: 'none',
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
  computed: {
    rowBgStyle() {
      return {
        opacity: this.capsuleProgress,
        transition: this.capsuleTransition,
      }
    },
  },
  watch: {
    show(val) {
      if (this.autoClose) return
      this.openState(val)
    },
    left(val) {
      this.moveLeft = `translateX(${val}px)`
    },
    leftOptions() {
      this.init()
    },
    rightOptions() {
      this.init()
    },
  },
  mounted() {
    this.swipeaction = this.getSwipeAction()
    if (this.swipeaction && Array.isArray(this.swipeaction.children)) {
      this.swipeaction.children.push(this)
    }
    this._pageScrollLocked = false
    this.init()
  },
  beforeUnmount() {
    this.unlockPageScroll()
    this.setSwipeDividersHidden(false)
  },
  methods: {
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
    setHideDividerFromPrev(hide) {
      const next = !!hide
      if (this.swipeSurface.hideDividerFromPrev !== next) {
        this.swipeSurface.hideDividerFromPrev = next
      }
    },
    setSwipeDividersHidden(e) {
      const hide = typeof e === 'boolean' ? e : !!(e && e.hide)
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
    init() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.getSelectorQuery()
      }, 80)
      this.left = 0
      this.x = 0
      this.capsuleProgress = 0
      this.capsuleTransition = 'none'
      this.setSwipeDividersHidden(false)
    },
    close() {
      this.openState('none')
    },
    closeSwipe() {
      if (this.autoClose && this.swipeaction) {
        this.swipeaction.closeOther(this)
      }
    },
    touchstart(e) {
      if (this.disabled) return
      this.touching = true
      this.ani = false
      this.x = this.left || 0
      this.resetTouchStatus()
      const touch = e.touches[0]
      this.startX = touch.clientX
      this.startY = touch.clientY
      this.closeSwipe()
    },
    touchmove(e) {
      if (this.disabled) return
      if (!this.touching) return
      const touch = e.touches[0]
      this.deltaX = touch.clientX - this.startX
      this.deltaY = touch.clientY - this.startY
      this.offsetX = Math.abs(this.deltaX)
      this.offsetY = Math.abs(this.deltaY)
      this.direction = this.direction || this.getDirection(this.offsetX, this.offsetY)
      if (this.direction !== 'horizontal') return
      if (this.offsetY >= LEAVE_ROW_Y) {
        this.touching = false
        this.unlockPageScroll()
        this.moveDirection(this.left)
        return
      }
      if (e.preventDefault) e.preventDefault()
      this.move(this.x + this.deltaX, true)
    },
    touchend() {
      if (this.disabled) return
      if (!this.touching) return
      this.touching = false
      this.unlockPageScroll()
      this.moveDirection(this.left)
    },
    touchcancel() {
      this.touchend()
    },
    move(value, followCapsule) {
      this.left = Math.min(Math.max(value || 0, -this.rightWidth), this.leftWidth)
      if (followCapsule) {
        const abs = Math.abs(this.left)
        this.capsuleProgress = abs >= CAPSULE_FADE_PX ? 1 : abs / CAPSULE_FADE_PX
        this.capsuleTransition = 'none'
        this.setSwipeDividersHidden(this.capsuleProgress > 0)
      }
    },
    moveDirection(left) {
      const threshold = this.threshold
      const isopen = this.buttonShow || 'none'
      const { leftWidth, rightWidth } = this
      if (this.deltaX === 0) {
        this.openState('none')
        return
      }
      if (
        (isopen === 'none' && rightWidth > 0 && -left > threshold) ||
        (isopen !== 'none' && rightWidth > 0 && rightWidth + left < threshold)
      ) {
        this.openState('right')
      } else if (
        (isopen === 'none' && leftWidth > 0 && left > threshold) ||
        (isopen !== 'none' && leftWidth > 0 && leftWidth - left < threshold)
      ) {
        this.openState('left')
      } else {
        this.openState('none')
      }
    },
    openState(type) {
      this.ani = true
      let left = 0
      if (type === 'left') left = this.leftWidth
      if (type === 'right') left = -this.rightWidth
      if (this.buttonShow !== type) {
        this.buttonShow = type
        this.$emit('change', type)
      }
      this.left = left
      this.contentOpen = type !== 'none'
      this.capsuleProgress = type !== 'none' ? 1 : 0
      this.capsuleTransition = CAPSULE_SETTLE_TRANSITION
      this.setSwipeDividersHidden(type !== 'none')
    },
    getDirection(x, y) {
      if (x > y && x > MIN_DISTANCE) return 'horizontal'
      if (y > x && y > MIN_DISTANCE) return 'vertical'
      return ''
    },
    resetTouchStatus() {
      this.direction = ''
      this.deltaX = 0
      this.deltaY = 0
      this.offsetX = 0
      this.offsetY = 0
    },
    getSelectorQuery() {
      const query = uni.createSelectorQuery().in(this)
      query
        .select('.button-group--left')
        .boundingClientRect()
        .select('.button-group--right')
        .boundingClientRect()
        .exec((ret) => {
          this.leftWidth = (ret && ret[0] && ret[0].width) || 0
          this.rightWidth = (ret && ret[1] && ret[1].width) || 0
        })
    },
    appTouchStart(e) {
      const touch = e.changedTouches && e.changedTouches[0]
      if (!touch) return
      this.clientX = touch.clientX
      this.timestamp = Date.now()
    },
    appTouchMove(e) {
      if (this.buttonShow === 'none') return
      const touch = e.changedTouches && e.changedTouches[0]
      if (!touch || typeof this.clientX !== 'number') return
      const delta = touch.clientX - this.clientX
      const isBack = this.buttonShow === 'right' ? delta > 40 : delta < -40
      if (isBack) this.close()
    },
    appTouchEnd(e, index, item, position) {
      const touch = e.changedTouches && e.changedTouches[0]
      if (!touch) return
      const diff = Math.abs(this.clientX - touch.clientX)
      const time = Date.now() - this.timestamp
      if (diff < 40 && time < 300) {
        this.$emit('click', { content: item, index, position, key: item && item.key })
        if (this.closeOnClick) this.close()
      }
    },
  },
}
/* #endif */

/* #ifdef APP-VUE || APP-HARMONY || MP-WEIXIN || H5 */
export default {}
/* #endif */
