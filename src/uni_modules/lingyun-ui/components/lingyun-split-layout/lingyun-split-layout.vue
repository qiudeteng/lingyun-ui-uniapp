<template>
  <lingyun-app-page
    class="ly-split-layout"
    :title="title"
    :show-toolbar="false"
    :show-tabbar="showTabbar"
    :show-nav="showNav"
    :body-scroll="false"
    :page-scroll="false"
  >
    <view class="ly-split-layout__page" :class="{ 'ly-split-layout__page--wide': wide }">
      <!-- 左栏 = 独立页面：自己实现列表（含自己的浮动 toolbar） -->
      <view class="ly-split-layout__pane ly-split-layout__pane--list" :style="listPaneStyle">
        <view class="ly-split-layout__header ly-split-layout__header--list">
          <slot name="list-header" :wide="wide" />
        </view>
        <view class="ly-split-layout__content">
          <slot name="list" :wide="wide" :top-space="listHeaderHeight" />
        </view>
      </view>

      <!-- 宽屏右侧详情；窄屏不渲染，由业务在点行时打开独立详情页 -->
      <template v-if="wide">
        <view class="ly-split-layout__divider" />
        <view class="ly-split-layout__pane ly-split-layout__pane--detail">
          <view class="ly-split-layout__header ly-split-layout__header--detail">
            <slot name="detail-header" :wide="wide" :top-space="detailHeaderHeight" />
          </view>
          <view class="ly-split-layout__content">
            <slot name="detail" :wide="wide" :top-space="detailHeaderHeight" />
          </view>
        </view>
      </template>
    </view>
  </lingyun-app-page>
</template>

<script lang="ts">
/**
 * lingyun-split-layout
 * 列表 + 详情分栏布局：≥ splitAt 左右分栏（左栏固定 listWidth），窄屏只显示左栏。
 * 左右栏各自的 toolbar 放在 header 插槽里（绝对定位浮在栏顶），布局负责量高并通过
 * 作用域插槽把 topSpace 交给内容（面板的 top-space / 自绘占位）。
 * 使用约定见 doc/guide/split-pages.md。
 */
import { defineComponent } from 'vue'

function readWindowWidth(): number {
  try {
    const info =
      typeof uni.getWindowInfo === 'function'
        ? uni.getWindowInfo()
        : uni.getSystemInfoSync()
    return Number(info.windowWidth) || 0
  } catch {
    return 0
  }
}

export default defineComponent({
  name: 'LingyunSplitLayout',
  props: {
    /** app-page 标题（分栏时两栏 toolbar 自带标题，这里通常留空） */
    title: { type: String, default: '' },
    /** 分栏门槛：窗口宽度 ≥ 该值左右分栏，窄屏只显示左栏 */
    splitAt: { type: Number, default: 900 },
    /** 宽屏左栏宽度（手机逻辑宽度） */
    listWidth: { type: Number, default: 375 },
    /** 透传 app-page：宽屏是否保留应用导航列 */
    showNav: { type: Boolean, default: true },
    /** 透传 app-page：是否显示底部 Tab（分栏页一般关掉） */
    showTabbar: { type: Boolean, default: false },
  },
  emits: ['wide-change', 'ready'],
  data() {
    return {
      windowWidth: 0,
      listHeaderHeight: 0,
      detailHeaderHeight: 0,
      _measureTimer: null as ReturnType<typeof setTimeout> | null,
      _onWindowResize: null as (() => void) | null,
    }
  },
  computed: {
    wide(): boolean {
      return this.windowWidth >= Number(this.splitAt || 900)
    },
    listPaneStyle(): Record<string, string> {
      if (!this.wide) return {}
      const width = Math.max(0, Number(this.listWidth) || 375)
      return {
        flex: `0 0 ${width}px`,
        width: `${width}px`,
      }
    },
  },
  watch: {
    wide(value: boolean) {
      this.$emit('wide-change', value)
      this.scheduleMeasure()
    },
  },
  mounted() {
    this.syncWindowWidth()
    this.$emit('wide-change', this.wide)
    this._onWindowResize = () => {
      this.syncWindowWidth()
      this.scheduleMeasure()
    }
    try {
      if (typeof uni.onWindowResize === 'function') uni.onWindowResize(this._onWindowResize)
    } catch {
      /* 端不支持 */
    }
    this.$nextTick(() => {
      this.measureHeaders()
      this.scheduleMeasure()
      setTimeout(() => {
        this.measureHeaders()
        this.$emit('ready')
      }, 360)
    })
  },
  updated() {
    /* 插槽内容变化（换标题、切分段）后头部高度可能变化，防抖重测 */
    this.scheduleMeasure()
  },
  beforeUnmount() {
    clearTimeout(this._measureTimer ?? undefined)
    this._measureTimer = null
    const handler = this._onWindowResize
    try {
      if (handler && typeof uni.offWindowResize === 'function') {
        uni.offWindowResize(handler)
      }
    } catch {
      /* 端不支持 */
    }
    this._onWindowResize = null
  },
  methods: {
    syncWindowWidth(): void {
      const width = readWindowWidth()
      if (width > 0) this.windowWidth = width
    },
    scheduleMeasure(): void {
      clearTimeout(this._measureTimer ?? undefined)
      this._measureTimer = setTimeout(() => {
        this._measureTimer = null
        this.measureHeaders()
      }, 120)
    },
    /** 重新测量左右栏浮动头部高度（业务可主动调用，如动态插拔 toolbar 后） */
    measureHeaders(): void {
      const query = uni.createSelectorQuery().in(this as never)
      query
        .select('.ly-split-layout__header--list')
        .boundingClientRect((rect) => {
          const box = Array.isArray(rect) ? rect[0] : rect
          const height = Number(box && box.height) || 0
          if (height !== this.listHeaderHeight) this.listHeaderHeight = height
        })
      query
        .select('.ly-split-layout__header--detail')
        .boundingClientRect((rect) => {
          const box = Array.isArray(rect) ? rect[0] : rect
          const height = Number(box && box.height) || 0
          if (height !== this.detailHeaderHeight) this.detailHeaderHeight = height
        })
      query.exec(() => {})
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

/*
 * 结构样式全部放在本组件专属类上：不要用通用 .page（H5 路由不卸载旧页样式，
 * display:flex / height:100vh 会泄漏到其它页面，详见 doc/guide/split-pages.md）。
 */
.ly-split-layout__page {
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  height: 100vh;
  min-height: 0;
  padding: 0;
}

.ly-split-layout__pane {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 浮动头部：toolbar 盖在内容上方，内容从下方穿过 */
.ly-split-layout__header {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: 4;
}

/*
 * 内容容器：撑满栏内剩余高度并作为定位参照。
 * 小程序里 slot 内容会多一层内部节点、不参与 flex 拉伸，
 * 所以约定插槽内容用绝对定位填满这个容器（见 doc/components/split-layout.md）。
 */
.ly-split-layout__content {
  position: relative;
  flex: 1;
  min-height: 0;
  height: 0;
  overflow: hidden;
}

/* 两栏之间 0.5px 缝隙：透明、透出页面底色，由内容列自身的色差形成边线 */
.ly-split-layout__divider {
  flex: 0 0 1px;
  width: 1px;
  height: 100%;
  background: transparent;
  transform: scaleX(0.5);
  transform-origin: center;
}
</style>
