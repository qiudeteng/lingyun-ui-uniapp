/*
 * renderjs 跟手：App-vue / App-harmony 端（WXS 仅微信小程序与 H5 可用）。
 * 逻辑与 `wx.wxs` 一一对应；差异只在取宽度与改样式走真实 DOM。
 */
const MIN_DISTANCE = 10
const CAPSULE_FADE_PX = 32
/** 横向跟手后纵向超过该值 → 视为滑出本行，立即结算（与 wx.wxs 一致） */
const LEAVE_ROW_Y = 40
const CAPSULE_SETTLE_TRANSITION = 'opacity 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'

const CLASS_BG_OPEN = 'lingyun-swipe-action-item__row-bg--open'

export default {
  getEl(ownerInstance) {
    return ownerInstance.$el || (ownerInstance.$vm && ownerInstance.$vm.$el)
  },

  setDividersHidden(ownerInstance, state, hide) {
    const flag = hide ? 1 : 0
    if (state.dividersHidden === flag) return
    state.dividersHidden = flag
    ownerInstance.callMethod('setSwipeDividersHidden', {
      hide: flag === 1,
    })
  },

  settleGesture(ownerInstance, instance, self) {
    const state = self.state || {}
    if (!state.touching) return
    state.touching = false
    this.moveDirection(state.left, instance, ownerInstance, self)
  },

  capsuleProgressByLeft(left) {
    const abs = left < 0 ? -left : left
    if (abs >= CAPSULE_FADE_PX) return 1
    return abs / CAPSULE_FADE_PX
  },

  setCapsuleOpacity(ownerInstance, state, opacity, animated) {
    let next = opacity
    if (next < 0) next = 0
    if (next > 1) next = 1
    if (!animated && state.capsuleProgress === next) return
    state.capsuleProgress = next
    this.setDividersHidden(ownerInstance, state, next > 0)
    const $el = this.getEl(ownerInstance)
    if (!$el) return
    const bg = $el.querySelector('.lingyun-swipe-action-item__row-bg')
    if (!bg) return
    if (state.bgClassOpen) {
      bg.classList.remove(CLASS_BG_OPEN)
      state.bgClassOpen = 0
    }
    bg.style.opacity = String(next)
    bg.style.transition = animated ? CAPSULE_SETTLE_TRANSITION : 'none'
  },

  showWatch(newVal, oldVal, ownerInstance, instance, self) {
    const state = self.state || {}
    if (!this.getEl(ownerInstance)) return
    this.getDom(instance, ownerInstance, self)
    if (newVal && newVal !== 'none') {
      this.openState(newVal, instance, ownerInstance, self)
      return
    }

    if (state.left) {
      this.openState('none', instance, ownerInstance, self)
    }
    this.resetTouchStatus(instance, self)
  },

  touchstart(e, ownerInstance, self) {
    const instance = e.instance
    const state = self.state || {}
    this.getDom(instance, ownerInstance, self)
    if (this.getDisabledType(instance.getDataset().disabled)) return
    if (state.touching) {
      this.settleGesture(ownerInstance, instance, self)
    }
    /* 标记本次手势已正常起始：没有 touchstart 就不认 move / end，见 touchmove */
    state.touching = true
    instance.requestAnimationFrame(function () {
      instance.removeClass('ani')
      ownerInstance.callMethod('closeSwipe')
    })

    state.x = state.left || 0
    this.stopTouchStart(e, ownerInstance, self)
  },

  touchmove(e, ownerInstance, self) {
    const instance = e.instance
    /* 组件被移除后拿不到实例 */
    if (!instance) return
    const state = self.state || {}
    if (this.getDisabledType(instance.getDataset().disabled)) return
    /*
     * 没收到过 touchstart 就直接丢弃：此时 startX / state.x 还是上一次手势的残留值，
     * 拿它算 deltaX 会把行推到乱位（按钮 stopPropagation 掉 touchstart 时曾出现过）。
     */
    if (!state.touching) return
    this.stopTouchMove(e, self)
    if (state.direction !== 'horizontal') {
      return
    }
    /* 纵向已明显离开本行：立刻结算（避免丢 end 卡半开） */
    if (state.offsetY >= LEAVE_ROW_Y) {
      this.settleGesture(ownerInstance, instance, self)
      if (e.preventDefault) e.preventDefault()
      return false
    }
    if (e.preventDefault) {
      e.preventDefault()
    }
    this.move(state.x + state.deltaX, instance, ownerInstance, self, true)
    return false
  },

  touchend(e, ownerInstance, self) {
    const instance = e.instance
    if (this.getDisabledType(instance.getDataset().disabled)) return
    this.settleGesture(ownerInstance, instance, self)
  },

  touchcancel(e, ownerInstance, self) {
    this.touchend(e, ownerInstance, self)
  },

  move(value, instance, ownerInstance, self, followCapsule) {
    value = value || 0
    const state = self.state || {}
    const leftWidth = state.leftWidth
    const rightWidth = state.rightWidth
    state.left = this.range(value, -rightWidth, leftWidth)
    const progress = followCapsule ? this.capsuleProgressByLeft(state.left) : -1
    const that = this
    instance.requestAnimationFrame(function () {
      instance.setStyle({
        transform: `translateX(${state.left}px)`,
        '-webkit-transform': `translateX(${state.left}px)`,
      })
      if (followCapsule) {
        that.setCapsuleOpacity(ownerInstance, state, progress, false)
      }
    })
  },

  getDom(instance, ownerInstance, self) {
    const state = self.state || {}
    const $el = this.getEl(ownerInstance)
    if (!$el) return
    const leftDom = $el.querySelector('.button-group--left')
    const rightDom = $el.querySelector('.button-group--right')
    state.leftWidth = (leftDom && leftDom.offsetWidth) || 0
    state.rightWidth = (rightDom && rightDom.offsetWidth) || 0
    state.threshold = instance.getDataset().threshold
  },

  getDisabledType(value) {
    /* 兼容 app-vue dataset 取到字符串 */
    return (typeof value === 'string' ? JSON.parse(value) : value) || false
  },

  range(num, min, max) {
    return Math.min(Math.max(num, min), max)
  },

  moveDirection(left, ins, ownerInstance, self) {
    const state = self.state || {}
    const threshold = state.threshold
    const isopen = state.isopen || 'none'
    const leftWidth = state.leftWidth
    const rightWidth = state.rightWidth
    if (state.deltaX === 0) {
      this.openState('none', ins, ownerInstance, self)
      return
    }
    if (
      (isopen === 'none' && rightWidth > 0 && -left > threshold) ||
      (isopen !== 'none' && rightWidth > 0 && rightWidth + left < threshold)
    ) {
      this.openState('right', ins, ownerInstance, self)
    } else if (
      (isopen === 'none' && leftWidth > 0 && left > threshold) ||
      (isopen !== 'none' && leftWidth > 0 && leftWidth - left < threshold)
    ) {
      this.openState('left', ins, ownerInstance, self)
    } else {
      this.openState('none', ins, ownerInstance, self)
    }
  },

  openState(type, ins, ownerInstance, self) {
    const state = self.state || {}
    const leftWidth = state.leftWidth
    const rightWidth = state.rightWidth
    let left = 0
    state.isopen = state.isopen ? state.isopen : 'none'
    switch (type) {
      case 'left':
        left = leftWidth
        break
      case 'right':
        left = -rightWidth
        break
      default:
        left = 0
    }

    if (state.isopen !== type) {
      state.throttle = true
      ownerInstance.callMethod('change', {
        open: type,
      })
    }

    state.isopen = type
    ins.requestAnimationFrame(() => {
      this.setCapsuleOpacity(ownerInstance, state, type !== 'none' ? 1 : 0, true)
      ins.addClass('ani')
      this.move(left, ins, ownerInstance, self, false)
    })
  },

  getDirection(x, y) {
    if (x > y && x > MIN_DISTANCE) {
      return 'horizontal'
    }
    if (y > x && y > MIN_DISTANCE) {
      return 'vertical'
    }
    return ''
  },

  resetTouchStatus(instance, self) {
    const state = self.state || {}
    state.direction = ''
    state.deltaX = 0
    state.deltaY = 0
    state.offsetX = 0
    state.offsetY = 0
  },

  stopTouchStart(event, ownerInstance, self) {
    const state = self.state || {}
    this.resetTouchStatus(event.instance, self)
    const touch = event.touches[0]
    state.startX = touch.clientX
    state.startY = touch.clientY
  },

  stopTouchMove(event, self) {
    const state = self.state || {}
    const touch = event.touches[0]
    state.deltaX = touch.clientX - state.startX
    state.deltaY = touch.clientY - state.startY
    state.offsetY = Math.abs(state.deltaY)
    state.offsetX = Math.abs(state.deltaX)
    state.direction = state.direction || this.getDirection(state.offsetX, state.offsetY)
  },
}
