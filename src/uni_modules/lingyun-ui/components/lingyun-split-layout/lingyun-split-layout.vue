<template>
  <lingyun-app-page
    class="ly-split-layout"
    :class="{ 'ly-split-layout--narrow': !wide }"
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
          <slot name="list-header" />
        </view>
        <view class="ly-split-layout__content">
          <slot name="list" />
        </view>
      </view>

      <!-- 宽屏右侧详情；中屏（有左侧导航、未分栏）由 detailOpen 在内容区滑入，不新开页面 -->
      <view v-if="wide" class="ly-split-layout__divider" />
      <view
        v-if="showDetail"
        class="ly-split-layout__pane ly-split-layout__pane--detail"
        :class="{
          'ly-split-layout__pane--cover': !wide,
          'ly-split-layout__pane--cover-in': !wide && coverIn,
        }"
      >
        <view class="ly-split-layout__header ly-split-layout__header--detail">
          <slot name="detail-header" />
        </view>
        <view class="ly-split-layout__content">
          <slot name="detail" />
        </view>
      </view>
    </view>
  </lingyun-app-page>
</template>

<script lang="ts">
/**
 * lingyun-split-layout
 * 列表 + 详情分栏布局：≥ splitAt 左右分栏（左栏固定 listWidth）。
 * 手机（< 690）只显示左栏，点行由业务打开独立详情页。
 * 中屏（≥ 690 且 < splitAt，左侧导航已出现）不要再 navigateTo：
 * 把 detailOpen 设为 true，详情只在内容区滑入滑出，左侧导航留在原位。
 * 左右栏各自的 toolbar 放在 header 插槽里（绝对定位浮在栏顶），布局负责量高并通过
 * layout-change 事件把 wide / 两栏 topSpace 交给页面（面板的 top-space / 自绘占位）。
 * 插槽不要带作用域参数。微信小程序里作用域插槽在首帧和父级更新时会把插槽内组件的
 * props 清回默认值，顶栏会先空一帧再出现，列表也会闪成空白。
 * 使用约定见 doc/guide/split-pages.md。
 */
import { defineComponent } from 'vue'
import { LINGYUN_SCREEN_PAD_MIN } from '../../utils/screenResolve'
import type { LingyunSplitLayoutChange } from './types'

/** 与 iOS 推入接近的时长；收起后再卸掉节点 */
const COVER_MS = 320

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
    /**
     * 中屏详情是否打开。仅 cover（有左侧导航、未分栏）时生效：
     * 详情盖住内容区并横向滑入，不新开页面，左侧导航不参与动画。
     */
    detailOpen: { type: Boolean, default: false },
  },
  emits: ['wide-change', 'layout-change', 'ready'],
  data() {
    return {
      windowWidth: 0,
      listHeaderHeight: 0,
      detailHeaderHeight: 0,
      /** 中屏详情节点是否挂上（滑出动画结束后才卸） */
      coverMounted: false,
      /** 中屏详情是否已滑到内容区 */
      coverIn: false,
      _measureTimer: null as ReturnType<typeof setTimeout> | null,
      _coverTimer: null as ReturnType<typeof setTimeout> | null,
      _onWindowResize: null as (() => void) | null,
    }
  },
  computed: {
    wide(): boolean {
      return this.windowWidth >= Number(this.splitAt || 900)
    },
    /** 左侧导航已出现、尚未分栏：详情在当前页滑入 */
    cover(): boolean {
      return this.windowWidth >= LINGYUN_SCREEN_PAD_MIN && !this.wide
    },
    showDetail(): boolean {
      return this.wide || this.coverMounted
    },
    listPaneStyle(): Record<string, string> {
      if (!this.wide) return {}
      const width = Math.max(0, Number(this.listWidth) || 375)
      return {
        flex: `0 0 ${width}px`,
        width: `${width}px`,
      }
    },
    layoutState(): LingyunSplitLayoutChange {
      return {
        wide: this.wide,
        cover: this.cover,
        listTopSpace: this.listHeaderHeight,
        detailTopSpace: this.detailHeaderHeight,
      }
    },
  },
  watch: {
    wide(value: boolean) {
      this.$emit('wide-change', value)
      this.syncCover()
      this.scheduleMeasure()
    },
    detailOpen() {
      this.syncCover()
    },
    cover() {
      this.syncCover()
    },
    layoutState(value: LingyunSplitLayoutChange) {
      this.$emit('layout-change', value)
    },
  },
  mounted() {
    this.syncWindowWidth()
    this.syncCover()
    this.$emit('wide-change', this.wide)
    this.$emit('layout-change', this.layoutState)
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
    clearTimeout(this._coverTimer ?? undefined)
    this._measureTimer = null
    this._coverTimer = null
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
    syncCover(): void {
      const open = !!this.detailOpen && this.cover && !this.wide
      clearTimeout(this._coverTimer ?? undefined)
      this._coverTimer = null
      if (open) {
        if (!this.coverMounted) {
          this.coverMounted = true
          this.coverIn = false
          this.$nextTick(() => {
            this._coverTimer = setTimeout(() => {
              this._coverTimer = null
              if (!(this.detailOpen && this.cover && !this.wide)) return
              this.coverIn = true
              this.measureHeaders()
            }, 32)
          })
          return
        }
        this.coverIn = true
        return
      }
      if (!this.coverMounted || this.wide) {
        this.coverIn = false
        this.coverMounted = false
        return
      }
      this.coverIn = false
      this._coverTimer = setTimeout(() => {
        this._coverTimer = null
        if (this.detailOpen && this.cover && !this.wide) return
        this.coverMounted = false
      }, COVER_MS)
    },
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
  position: relative;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  height: 100vh;
  min-height: 0;
  padding: 0;
  overflow: hidden;
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

/*
 * 左栏底色统一由组件提供（对齐列表与详情 demo）：
 * 窄屏整页就是列表页 → Primary 背景；
 * 宽屏左栏是抬升的列表列 → grouped-secondary（浅色白 / 暗黑 #1c1c1e），与右侧详情分层。
 * 页面的插槽内容不要再自己设左栏背景。
 */
.ly-split-layout__pane--list {
  background-color: var(--lingyun-bg-primary, #{$lingyun-bg-primary});
}

.ly-split-layout__page--wide .ly-split-layout__pane--list {
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}

/* 窄屏页面壳背景同样用 Primary，顶栏下不露分组渐变 */
.ly-split-layout--narrow {
  --lingyun-page-background: var(--lingyun-bg-primary, #{$lingyun-bg-primary});
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

/*
 * 中屏详情：只盖住内容区（导航在 app-page 里，是这块的左侧兄弟，不在动画里）。
 * 实底挡住下面的列表；滑入滑出只用 transform，不改玻璃节点的 opacity。
 */
.ly-split-layout__pane--cover {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 6;
  flex: none;
  width: auto;
  background-color: var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
  transform: translateX(100%);
  transition: transform 320ms cubic-bezier(0.32, 0.72, 0, 1);
}

.ly-split-layout__pane--cover-in {
  transform: translateX(0);
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
