<template>
  <view class="lingyun-swipe-action">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { provide } from 'vue'

type SwipeChild = {
  close?: () => void
  init?: () => void
}

/**
 * lingyun-swipe-action
 * @description 滑动操作容器：登记子项、互斥关闭。配合 lingyun-swipe-action-item 使用。
 * @see design/SWIPE_ACTIONS.md
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists%252FLight%252FRows%2520with%2520Swipe%2520Actions
 */
defineOptions({
  name: 'LingyunSwipeAction',
})

/**
 * 显式 provide 的容器上下文（替代原子项沿 $parent 链查找）。
 * 注意：这里刻意用普通对象而不是 reactive —— 原实现是在 created() 里把
 * children / openItem 直接挂到实例 ctx（非响应式）上，二者都不参与渲染；
 * 若换成 reactive，openItem 读回的是 proxy 而传入的是原始对象，
 * 同一行再次触摸时 `openItem !== vm` 会误判成不同项而被关闭。
 */
const swipeActionCtx = {
  children: [] as SwipeChild[],
  openItem: null as SwipeChild | null,
  /** 公开：关闭全部已打开项 */
  closeAll() {
    /* 两端都提供 close()：WXS 端改 is_show 交给 showWatch，JS 端直接回弹 */
    this.children.forEach((vm) => {
      if (typeof vm.close === 'function') vm.close()
    })
    this.openItem = null
  },
  /** 公开：动态增删后重置（非 WXS 端） */
  resize() {
    // #ifndef APP-VUE || H5 || MP-WEIXIN || MP-HARMONY
    this.children.forEach((vm) => {
      if (typeof vm.init === 'function') vm.init()
    })
    // #endif
  },
  closeOther(vm: SwipeChild) {
    if (this.openItem && this.openItem !== vm && typeof this.openItem.close === 'function') {
      this.openItem.close()
    }
    this.openItem = vm
  },
}

provide('lingyunSwipeActionCtx', swipeActionCtx)
</script>

<style lang="scss" scoped>
.lingyun-swipe-action {
  width: 100%;
}
</style>
