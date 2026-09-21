<template>
  <view class="lingyun-swipe-action">
    <slot />
  </view>
</template>

<script>
/**
 * lingyun-swipe-action
 * @description 滑动操作容器：登记子项、互斥关闭。配合 lingyun-swipe-action-item 使用。
 * @see design/SWIPE_ACTIONS.md
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols?g=Lists%252FLight%252FRows%2520with%2520Swipe%2520Actions
 */
export default {
  name: 'LingyunSwipeAction',
  created() {
    this.children = []
    this.openItem = null
  },
  methods: {
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
    closeOther(vm) {
      if (this.openItem && this.openItem !== vm && typeof this.openItem.close === 'function') {
        this.openItem.close()
      }
      this.openItem = vm
    },
  },
}
</script>

<style lang="scss" scoped>
.lingyun-swipe-action {
  width: 100%;
}
</style>
