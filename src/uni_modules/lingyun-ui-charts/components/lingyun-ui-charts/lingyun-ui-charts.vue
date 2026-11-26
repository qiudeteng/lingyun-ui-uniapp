<!--
 * lingyun-ui-charts 凌云UI 图表组件
 * 系列色：config.ts
 -->
<template>
  <view class="chartsview" :id="'ChartBoxId'+cid">
    <view v-if="chartLoading" class="chartsview__state">
      <lingyun-activity-indicator />
    </view>
    <view v-if="chartError && errorShow" class="chartsview__state" @tap="reloading">
      <lingyun-empty fill :title="chartErrorTitle" />
    </view>
    <!-- APP和H5采用renderjs渲染图表 -->
    <!-- #ifdef APP-VUE || H5 -->
    <!-- @vue-ignore -->
      <view
        v-on:tap="rdcharts.tap"
        v-on:mousemove="rdcharts.mouseMove"
        v-on:mousedown="rdcharts.mouseDown"
        v-on:mouseup="rdcharts.mouseUp"
        v-on:mouseleave="rdcharts.mouseLeave"
        v-on:touchstart="rdcharts.touchStart"
        v-on:touchmove="rdcharts.touchMove"
        v-on:touchend="rdcharts.touchEnd"
        :id="'UC'+cid"
        :prop="chartsOpts"
        :change:prop="rdcharts.ucinit"
      >
        <canvas
          :id="cid"
          :canvasId="cid"
          :style="{ width: cWidth + 'px', height: cHeight + 'px', background: background }"
          :disable-scroll="disableScroll"
          @error="_error"
          v-show="showchart"
        />
      </view>
    <!-- #endif -->
    <!-- 支付宝小程序 -->
    <!-- #ifdef MP-ALIPAY -->
    <block v-if="ontouch">
      <canvas
        :id="cid"
        :canvasId="cid"
        :width="cWidth * pixel"
        :height="cHeight * pixel"
        :style="{ width: cWidth + 'px', height: cHeight + 'px', background: background }"
        :disable-scroll="disScroll"
        @tap="_tap"
        @touchstart="_touchStart"
        @touchmove="_touchMove"
        @touchend="_touchEnd"
        @error="_error"
        v-show="showchart"
      />
    </block>
    <block v-if="!ontouch">
      <canvas
        :id="cid"
        :canvasId="cid"
        :width="cWidth * pixel"
        :height="cHeight * pixel"
        :style="{ width: cWidth + 'px', height: cHeight + 'px', background: background }"
        :disable-scroll="disScroll"
        @tap="_tap"
        @error="_error"
        v-show="showchart"
      />
    </block>
    <!-- #endif -->
    <!-- 其他小程序通过vue渲染图表 -->
    <!-- #ifdef MP-WEIXIN || MP-BAIDU || MP-QQ || MP-TOUTIAO || MP-KUAISHOU || MP-LARK || MP-JD || MP-360 -->
    <!-- 浮层打开时用截图占位并 hidden canvas，避免微信原生层盖住 Sheet / Picker -->
    <image
      v-if="mpOverlayCover && mpOverlayShot"
      class="chartsview__shot"
      :src="mpOverlayShot"
      :style="{ width: cWidth + 'px', height: cHeight + 'px', background: background }"
      mode="scaleToFill"
    />
    <view
      v-else-if="mpOverlayCover"
      class="chartsview__shot chartsview__shot--empty"
      :style="{ width: cWidth + 'px', height: cHeight + 'px', background: background }"
    />
    <block v-if="useWeixinCanvas2d">
      <view v-if="ontouch" @tap="_tap">
        <canvas
          :id="cid"
          :canvasId="cid"
          :style="{ width: cWidth + 'px', height: cHeight + 'px', background: background }"
          type="2d"
          :disable-scroll="disScroll"
          :hidden="mpOverlayCover || !showchart"
          @touchstart="_touchStart"
          @touchmove="_touchMove"
          @touchend="_touchEnd"
          @error="_error"
        />
      </view>
      <view v-if="!ontouch" @tap="_tap">
        <canvas
          :id="cid"
          :canvasId="cid"
          :style="{ width: cWidth + 'px', height: cHeight + 'px', background: background }"
          type="2d"
          :disable-scroll="disScroll"
          :hidden="mpOverlayCover || !showchart"
          @error="_error"
        />
      </view>
    </block>
    <block v-if="!useWeixinCanvas2d">
      <view v-if="ontouch" @tap="_tap">
        <canvas
          v-if="showchart"
          :id="cid"
          :canvasId="cid"
          :style="{ width: cWidth + 'px', height: cHeight + 'px', background: background }"
          @touchstart="_touchStart"
          @touchmove="_touchMove"
          @touchend="_touchEnd"
          :disable-scroll="disScroll"
          :hidden="mpOverlayCover"
          @error="_error"
        />
      </view>
      <view v-if="!ontouch">
        <canvas
          v-if="showchart"
          :id="cid"
          :canvasId="cid"
          :style="{ width: cWidth + 'px', height: cHeight + 'px', background: background }"
          :disable-scroll="disScroll"
          :hidden="mpOverlayCover"
          @tap="_tap"
          @error="_error"
        />
      </view>
    </block>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, h, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { nextLingyunUid } from '@/uni_modules/lingyun-ui/utils/uid'
// 类型以 any 收口，避免改判断时带偏绘制。
import { useLingyunTheme } from '@/uni_modules/lingyun-ui/utils/theme'
import {
  isLingyunMpOverlayOpen,
  onLingyunMpOverlayChange,
} from '@/uni_modules/lingyun-ui/utils/mp-overlay-gate'
// #ifndef APP-VUE || H5
import LingyunUiCharts from './lingyun-ui-charts'
// #endif
import {
  cfu,
  chartLabelColor,
  chartLabelColorDark,
  chartLabelSecondaryColor,
  chartLabelSecondaryColorDark,
} from './config'

function deepCloneAssign(origin: Record<string, any> = {}, ...args: any[]): Record<string, any> {
  for (let i in args) {
    if (args[i] == null) continue
    for (let key in args[i]) {
      if (args[i].hasOwnProperty(key)) {
        origin[key] = args[i][key] && typeof args[i][key] === 'object' ? deepCloneAssign(Array.isArray(args[i][key]) ? [] : {}, origin[key], args[i][key]) : args[i][key];
      }
    }
  }
  return origin;
}

function formatterAssign(args: any, formatter: Record<string, any>) {
  for (let key in args) {
    if(args.hasOwnProperty(key) && args[key] !== null && typeof args[key] === 'object'){
      formatterAssign(args[key],formatter)
    }else if(key === 'format' && typeof args[key] === 'string'){
      args['formatter'] = formatter[args[key]] ? formatter[args[key]] : undefined;
    }
  }
  return args;
}

var lastMoveTime: number | null = null;
const chartCanvasPrefix = `lychart-${Date.now().toString(36)}`

function createChartCanvasId(): string {
  return `${chartCanvasPrefix}-${nextLingyunUid('chartCanvas').toString(36)}`
}

/**
 * 防抖
 *
 * @param { Function } fn 要执行的方法
 * @param { Number } wait  防抖多少毫秒
 *
 * 在 vue 中使用（注意：不能使用箭头函数，否则this指向不对，并且不能再次封装如：
 * move(){  // 错误调用方式
 *   debounce(function () {
 *   console.log(this.title);
 * }, 1000)}）;
 * 应该直接使用：// 正确调用方式
 * move: debounce(function () {
 *   console.log(this.title);
 * }, 1000)
 */
function stableHash(value: unknown): string {
  let h = 5381
  const stack: unknown[] = [value]
  let n = 0
  while (stack.length && n < 2000000) {
    const cur = stack.pop()
    n += 1
    if (cur === null || cur === undefined) {
      h = ((h << 5) + h) ^ 0
      continue
    }
    const kind = typeof cur
    if (kind !== 'object') {
      const text = kind === 'string' ? (cur as string) : String(cur)
      h = ((h << 5) + h) ^ text.length
      for (let i = 0; i < text.length; i++) h = ((h << 5) + h) ^ text.charCodeAt(i)
      continue
    }
    if (Array.isArray(cur)) {
      h = ((h << 5) + h) ^ cur.length
      for (let i = cur.length - 1; i >= 0; i--) stack.push(cur[i])
      continue
    }
    const obj = cur as Record<string, unknown>
    const keys = Object.keys(obj)
    h = ((h << 5) + h) ^ keys.length
    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i]
      for (let c = 0; c < key.length; c++) h = ((h << 5) + h) ^ key.charCodeAt(c)
      stack.push(obj[key])
    }
  }
  return (h >>> 0).toString(36)
}

function debounce(fn: (this: unknown, ...args: any[]) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | false = false;
  return function (this: unknown, ...fnArgs: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = false;
      fn.apply(this, fnArgs);
    }, wait);
  };
}

defineOptions({
  name: 'lingyun-ui-charts',
})

const props = defineProps({
  type: {
    type: String,
    default: null
  },
  canvasId: {
    type: String,
    default: ''
  },
  background: {
    type: String,
    default: 'rgba(0,0,0,0)'
  },
  animation: {
    type: Boolean,
    default: true
  },
  chartData: {
    type: Object,
    default() {
      return {
        categories: [],
        series: []
      };
    }
  },
  opts: {
    type: Object,
    default() {
      return {};
    }
  },
  errorShow: {
    type: Boolean,
    default: true
  },
  errorReload: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String,
    default: null
  },
  inScrollView: {
    type: Boolean,
    default: true
  },
  reshow: {
    type: Boolean,
    default: false
  },
  reload: {
    type: Boolean,
    default: false
  },
  disableScroll: {
    type: Boolean,
    default: false
  },
  optsWatch: {
    type: Boolean,
    default: true
  },
  onzoom: {
    type: Boolean,
    default: false
  },
  ontap: {
    type: Boolean,
    default: true
  },
  ontouch: {
    type: Boolean,
    default: true
  },
  onmouse: {
    type: Boolean,
    default: true
  },
  onmovetip: {
    type: Boolean,
    default: false
  },
  tooltipShow: {
    type: Boolean,
    default: true
  },
  tooltipFormat: {
    type: String,
    default: undefined
  },
  tooltipCustom: {
    type: Object,
    default: undefined
  },
  pageScrollTop: {
    type: Number,
    default: 0
  },
  tapLegend: {
    type: Boolean,
    default: true
  }
})

const instance = getCurrentInstance()
const proxy: any = instance?.proxy

const cid = ref('id')
const chartLoading = ref(false)
const chartError = ref<string | null>(null)
const inAli = ref(false)
const inH5 = ref(false)
const inApp = ref(false)
const inWin = ref(false)
const useWeixinCanvas2d = ref(false)
const disScroll = ref(false)
const openmouse = ref(false)
const pixel = ref(1)
const cWidth = ref(375)
const cHeight = ref(250)
const showchart = ref(false)
const chartsOpts = ref<Record<string, any>>({})
const drawData = ref<Record<string, any>>({})
const lastDrawTime = ref<number | null>(null)
/** 微信：浮层打开时 hidden canvas，截图占位 */
const mpOverlayCover = ref(false)
const mpOverlayShot = ref('')
/** 绘制完成后的最近一帧，浮层打开时可立刻盖住，避免截图前穿透 */
const mpLastShot = ref('')
const _unsubMpOverlay = ref<null | (() => void)>(null)
const _mpOverlayToken = ref(0)
const _mpLastShotTimer = ref(0)
const _resizeHandler = ref<any>(null)
const _tooltipActive = ref(false)
const _pageTouchHandler = ref<any>(null)

cid.value = String(props.canvasId || '').trim() || createChartCanvasId()
let platform = ''
let pixelRatio = 1
if (typeof uni.getDeviceInfo === 'function' && typeof uni.getWindowInfo === 'function') {
  const deviceInfo = uni.getDeviceInfo()
  const windowInfo = uni.getWindowInfo()
  platform = deviceInfo.platform || ''
  pixelRatio = windowInfo.pixelRatio || 1
} else {
  const systemInfo = uni.getSystemInfoSync()
  platform = systemInfo.platform
  pixelRatio = systemInfo.pixelRatio
}
if(platform === 'windows' || platform === 'mac'){
  inWin.value = true;
}
// #ifdef MP-WEIXIN
useWeixinCanvas2d.value = platform !== 'windows' && platform !== 'mac'
if (useWeixinCanvas2d.value) pixel.value = pixelRatio
// #endif
// #ifdef MP-ALIPAY
inAli.value = true;
pixel.value = pixelRatio;
// #endif
disScroll.value = props.disableScroll;

const chartErrorTitle = computed((): string => {
  const msg = props.errorMessage
  if (msg == null || msg === '' || msg === 'null') return '请点击重试'
  return msg
})
const legendTheme = computed((): 'light' | 'dark' => {
  return useLingyunTheme().resolved
})
const optsStamp = computed((): string => {
  return stableHash(props.opts)
})
const chartDataStamp = computed((): string => {
  return stableHash(props.chartData)
})

function emitMsg(msg: any): void {
  instance?.emit(msg.name, msg.params)
}

function hideTooltip(): void {
  if (!_tooltipActive.value) return
  _tooltipActive.value = false
  const chartInstance = cfu.instance[cid.value]
  if (chartInstance && typeof chartInstance.hideToolTip === 'function') {
    chartInstance.hideToolTip()
  }
}

function _setupH5Canvas(chartId: string, w: number, h: number): void {
  // #ifdef H5 || WEB
  /* uni-app x Web never sizes the inner <canvas> bitmap (stays 300x150),
     which stretches the chart; match the bitmap to the layout size first. */
  try {
    const host: any = document.getElementById(chartId)
    const cv: any = host && host.querySelector ? host.querySelector('canvas') : null
    if (cv) {
      const nw = Math.round(w)
      const nh = Math.round(h)
      if (nw > 0 && nh > 0 && (cv.width !== nw || cv.height !== nh)) {
        cv.width = nw
        cv.height = nh
      }
    }
  } catch (e) {
    /* ignore: not a DOM environment */
  }
  // #endif
}

function applyLegendTheme(chartId: string): void {
  const option = cfu.option[chartId]
  if (!option) return
  const legend = option.legend && typeof option.legend === 'object' ? option.legend : {}
  const dark = legendTheme.value === 'dark'
  const label = dark ? chartLabelColorDark : chartLabelColor
  if (legend.fontColor == null || legend.fontColor === '') {
    legend.fontColor = label
  }
  if (legend.hiddenFontColor == null || legend.hiddenFontColor === '') {
    legend.hiddenFontColor = dark ? chartLabelSecondaryColorDark : chartLabelSecondaryColor
  }
  option.legend = legend
  // 浅色沿用引擎默认字色。暗黑才改成白色；用户显式传了颜色时不覆盖。
  if (dark) {
    const userOpts: any = props.opts && typeof props.opts === 'object' ? props.opts : {}
    if (!userOpts.fontColor) option.fontColor = chartLabelColorDark
    if (!userOpts.xAxis || userOpts.xAxis.fontColor == null || userOpts.xAxis.fontColor === '') {
      if (!option.xAxis || typeof option.xAxis !== 'object') option.xAxis = {}
      option.xAxis.fontColor = chartLabelColorDark
    }
    if (!userOpts.yAxis || userOpts.yAxis.fontColor == null || userOpts.yAxis.fontColor === '') {
      if (!option.yAxis || typeof option.yAxis !== 'object') option.yAxis = {}
      option.yAxis.fontColor = chartLabelColorDark
    }
  }
  /* 横向滚动条跟随全局滚动条：轨道透明、圆角滑块，暗黑用浅色 */
  if (option.enableScroll) {
    const scrollAxis =
      option.xAxis && typeof option.xAxis === 'object'
        ? option.xAxis
        : (option.xAxis = {})
    if (scrollAxis.scrollColor == null || scrollAxis.scrollColor === '') {
      scrollAxis.scrollColor = dark ? 'rgba(235, 235, 245, 0.45)' : 'rgba(60, 60, 67, 0.48)'
    }
    if (
      scrollAxis.scrollBackgroundColor == null ||
      scrollAxis.scrollBackgroundColor === ''
    ) {
      scrollAxis.scrollBackgroundColor = 'rgba(0, 0, 0, 0)'
    }
  }
  if (props.type === 'ring') {
    const userTitle: any = (props.opts && props.opts.title) || {}
    const userSub: any = (props.opts && props.opts.subtitle) || {}
    if (!option.title || typeof option.title !== 'object') option.title = {}
    if (!option.subtitle || typeof option.subtitle !== 'object') option.subtitle = {}
    if (!userTitle.color) option.title.color = dark ? chartLabelColorDark : chartLabelColor
    if (!userSub.color) option.subtitle.color = dark ? chartLabelSecondaryColorDark : chartLabelSecondaryColor
  }
}

function _clearChart(): void {
  let chartId = cid.value
  if (cfu.option[chartId] && cfu.option[chartId].context) {
    const ctx = cfu.option[chartId].context;
    if(typeof ctx === "object" && !!!cfu.option[chartId].update){
      ctx.clearRect(0, 0, cWidth.value*pixel.value, cHeight.value*pixel.value);
      ctx.draw();
    }
  }
}

function captureMpOverlayShot(): Promise<string> {
  return new Promise((resolve) => {
    let done = false
    const finish = (value: string) => {
      if (done) return
      done = true
      resolve(value)
    }
    setTimeout(() => finish(''), 220)
    if (!showchart.value || cWidth.value < 2 || cHeight.value < 2) {
      finish('')
      return
    }
    if (useWeixinCanvas2d.value) {
      const query = (uni.createSelectorQuery() as any).in(proxy)
      query
        .select('#' + cid.value)
        .fields({ node: true, size: true })
        .exec((res: any) => {
          const canvas = res && res[0] && res[0].node
          if (!canvas) {
            finish('')
            return
          }
          uni.canvasToTempFilePath({
            canvas,
            success: (file: { tempFilePath?: string }) => finish(file.tempFilePath || ''),
            fail: () => {
              try {
                const dataUrl =
                  typeof canvas.toDataURL === 'function' ? canvas.toDataURL('image/png') : ''
                finish(dataUrl || '')
              } catch {
                finish('')
              }
            },
          } as any)
        })
      return
    }
    uni.canvasToTempFilePath(
      {
        canvasId: cid.value,
        success: (file: { tempFilePath?: string }) => finish(file.tempFilePath || ''),
        fail: () => finish(''),
      },
      proxy,
    )
  })
}

function onMpOverlayGate(open: boolean): void {
  // #ifndef MP-WEIXIN
  return
  // #endif
  // #ifdef MP-WEIXIN
  if (!open) {
    _mpOverlayToken.value += 1
    mpOverlayCover.value = false
    mpOverlayShot.value = ''
    return
  }
  if (mpOverlayCover.value) return
  const token = ++_mpOverlayToken.value
  // 有缓存：立刻 hidden + 截图占位，无穿透窗口
  if (mpLastShot.value) {
    mpOverlayShot.value = mpLastShot.value
    mpOverlayCover.value = true
    return
  }
  // 无缓存：先截再藏；超时仍 hidden，宁可空白也不穿透
  const forceTimer = setTimeout(() => {
    if (token !== _mpOverlayToken.value) return
    if (!isLingyunMpOverlayOpen()) return
    mpOverlayCover.value = true
  }, 80) as unknown as number
  captureMpOverlayShot().then((shot: string) => {
    clearTimeout(forceTimer)
    if (token !== _mpOverlayToken.value) return
    if (!isLingyunMpOverlayOpen()) return
    if (shot) {
      mpLastShot.value = shot
      mpOverlayShot.value = shot
    }
    mpOverlayCover.value = true
  })
  // #endif
}

function scheduleMpLastShot(): void {
  // #ifndef MP-WEIXIN
  return
  // #endif
  // #ifdef MP-WEIXIN
  if (mpOverlayCover.value) return
  if (_mpLastShotTimer.value) clearTimeout(_mpLastShotTimer.value)
  _mpLastShotTimer.value = setTimeout(() => {
    _mpLastShotTimer.value = 0
    if (mpOverlayCover.value || !showchart.value) return
    captureMpOverlayShot().then((shot: string) => {
      if (shot && !mpOverlayCover.value) mpLastShot.value = shot
    })
  }, 280) as unknown as number
  // #endif
}

function saveImage(): void {
  uni.canvasToTempFilePath({
    canvasId: cid.value,
    success: res=>{
      //#ifdef H5
      var a = document.createElement("a");
      a.href = res.tempFilePath;
      a.download = cid.value;
      a.target = '_blank'
      a.click();
      //#endif
      //#ifndef H5
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function () {
            uni.showToast({
              title: '保存成功',
              duration: 2000
            });
          }
        });
      //#endif
    } 
  },proxy);
}

function getImage(): void {
  if (!useWeixinCanvas2d.value) {
    uni.canvasToTempFilePath({
      canvasId: cid.value,
      success: res=>{
        emitMsg({name: 'getImage', params: {type:"getImage", base64: res.tempFilePath}});
      }
    },proxy);
    return
  }
  const query = (uni.createSelectorQuery() as any).in(proxy)
  query
    .select('#' + cid.value)
    .fields({ node: true, size: true })
    .exec((res: any) => {
      if (res[0]) {
        const canvas = res[0].node;
        emitMsg({name: 'getImage', params: {type:"getImage", base64: canvas.toDataURL('image/png')}});
      }
    });
}

function _error(e: any): void {
  chartError.value = e.detail.errMsg;
}

// #ifndef APP-VUE || H5
function _tooltipDefault(item: any, category: any, index: any, opts: any): any {
  if (category) {
    let data = item.data
    if(typeof item.data === "object"){
      data = item.data.value
    }
    return category + ' ' + item.name + ':' + data;
  } else {
    if (item.properties && item.properties.name) {
      return item.properties.name;
    } else {
      return item.name + ':' + item.data;
    }
  }
}

function _showTooltip(e: any): void {
  let chartId = cid.value
  let tc = cfu.option[chartId].tooltipCustom
  if (tc && tc !== undefined && tc !== null) {
    let offset = undefined;
    if (tc.x >= 0 && tc.y >= 0) {
      offset = { x: tc.x, y: tc.y + 10 };
    }
    cfu.instance[chartId].showToolTip(e, {
      index: tc.index,
      offset: offset,
      textList: tc.textList,
      formatter: (item: any, category: any, index: any, opts: any) => {
        if (typeof cfu.option[chartId].tooltipFormat === 'string' && cfu.formatter[cfu.option[chartId].tooltipFormat]) {
          return cfu.formatter[cfu.option[chartId].tooltipFormat](item, category, index, opts);
        } else {
          return _tooltipDefault(item, category, index, opts);
        }
      }
    });
  } else {
    cfu.instance[chartId].showToolTip(e, {
      formatter: (item: any, category: any, index: any, opts: any) => {
        if (typeof cfu.option[chartId].tooltipFormat === 'string' && cfu.formatter[cfu.option[chartId].tooltipFormat]) {
          return cfu.formatter[cfu.option[chartId].tooltipFormat](item, category, index, opts);
        } else {
          return _tooltipDefault(item, category, index, opts);
        }
      }
    });
  }
  _tooltipActive.value = true
}

function _emitLegendAction(e: any, point: { x: number; y: number }): boolean {
  const chartId = cid.value
  const chartInstance = cfu.instance[chartId]
  if (!chartInstance || typeof chartInstance.getLegendActionData !== 'function') return false
  const action = chartInstance.getLegendActionData(e)
  if (!action) return false
  emitMsg({
    name: 'legendAction',
    params: {
      type: 'legendAction',
      legendIndex: action.index,
      item: action.item,
      column: action.column,
      event: point,
      id: chartId,
      opts: chartInstance.opts,
    },
  })
  return true
}

function _tap(e: any, move?: any): void {
  let chartId = cid.value
  let currentIndex = null;
  let legendIndex = null;
  if (props.inScrollView === true || inAli.value) {
    const originalTouch = e.changedTouches && e.changedTouches[0]
      ? e.changedTouches[0]
      : (e.touches && e.touches[0] ? e.touches[0] : null)
    let chartdom = (uni.createSelectorQuery() as any)
      // #ifndef MP-ALIPAY
      .in(proxy)
      .select('#ChartBoxId'+chartId)
      // #endif
      // #ifdef MP-ALIPAY
      .select('#'+chartId)
      // #endif
      .boundingClientRect()
    chartdom.selectViewport().scrollOffset()
    chartdom.exec((result: any[]) => {
        const data = result && result[0]
        if (!data || !cfu.instance[chartId]) return
        const viewport = result[1] || {}
        const scrollLeft = Number(viewport.scrollLeft) || 0
        const scrollTop = Number(viewport.scrollTop) || Number(props.pageScrollTop) || 0
        const detail = e.detail || {}
        const clientX = originalTouch && Number.isFinite(originalTouch.clientX)
          ? originalTouch.clientX
          : (Number.isFinite(detail.clientX)
              ? detail.clientX
              : (Number(detail.x) || 0) - scrollLeft)
        const clientY = originalTouch && Number.isFinite(originalTouch.clientY)
          ? originalTouch.clientY
          : (Number.isFinite(detail.clientY)
              ? detail.clientY
              : (Number(detail.y) || 0) - scrollTop)
        const point = {
          x: clientX - data.left,
          y: clientY - data.top
        }
        e.changedTouches=[];
        e.changedTouches.unshift(point);
        if(move){
          if (props.tooltipShow === true) {
            _showTooltip(e);
          }
        }else{
          if (_emitLegendAction(e, point)) return
          currentIndex = cfu.instance[chartId].getCurrentDataIndex(e);
          legendIndex = cfu.instance[chartId].getLegendDataIndex(e);
          if(props.tapLegend === true){
            cfu.instance[chartId].touchLegend(e);
          }
          if (props.tooltipShow === true) {
            _showTooltip(e);
          }
          emitMsg({name: 'getIndex', params: { type:"getIndex", event:point, currentIndex: currentIndex, legendIndex: legendIndex, id: chartId, opts: cfu.instance[chartId].opts}});
        }
      });
  } else {
    if(move){
      if (props.tooltipShow === true) {
        _showTooltip(e);
      }
    }else{
      const tapPoint = { x: e.detail.x - e.currentTarget.offsetLeft, y: e.detail.y - e.currentTarget.offsetTop }
      const eventPoint = { x: e.detail.x, y: e.detail.y - e.currentTarget.offsetTop }
      e.changedTouches=[];
      e.changedTouches.unshift(tapPoint);
      if (_emitLegendAction(e, eventPoint)) return
      currentIndex = cfu.instance[chartId].getCurrentDataIndex(e);
      legendIndex = cfu.instance[chartId].getLegendDataIndex(e);
      if(props.tapLegend === true){
        cfu.instance[chartId].touchLegend(e);
      }
      if (props.tooltipShow === true) {
        _showTooltip(e);
      }
      emitMsg({name: 'getIndex', params: {type:"getIndex", event: eventPoint, currentIndex: currentIndex, legendIndex: legendIndex, id: chartId, opts: cfu.instance[chartId].opts}});
    }
  }
}

function _touchStart(e: any): void {
  let chartId = cid.value
  lastMoveTime=Date.now();
  if(cfu.option[chartId].enableScroll === true && e.touches.length == 1){
    cfu.instance[chartId].scrollStart(e);
  }
  emitMsg({name:'getTouchStart', params:{type:"touchStart", event:e.changedTouches[0], id:chartId, opts: cfu.instance[chartId].opts}});
}

function _touchMove(e: any): void {
  let chartId = cid.value
  let currMoveTime = Date.now();
  let duration = currMoveTime - (lastMoveTime ?? 0);
  let touchMoveLimit = cfu.option[chartId].touchMoveLimit || 24;
  if (duration < Math.floor(1000 / touchMoveLimit)) return;//每秒60帧
  lastMoveTime = currMoveTime;
  if(cfu.option[chartId].enableScroll === true && e.changedTouches.length == 1){
    cfu.instance[chartId].scroll(e);
  }
  if(props.ontap === true && cfu.option[chartId].enableScroll === false && props.onmovetip === true){
    _tap(e,true)
  }
  if(props.ontouch === true && cfu.option[chartId].enableScroll === true && props.onzoom === true && e.changedTouches.length == 2){
    cfu.instance[chartId].dobuleZoom(e);
  }
  emitMsg({name: 'getTouchMove', params: {type:"touchMove", event:e.changedTouches[0], id: chartId, opts: cfu.instance[chartId].opts}});
}

function _touchEnd(e: any): void {
  let chartId = cid.value
  if(cfu.option[chartId].enableScroll === true && e.touches.length == 0){
    cfu.instance[chartId].scrollEnd(e);
  }
  emitMsg({name:'getTouchEnd', params:{type:"touchEnd", event:e.changedTouches[0], id:chartId, opts: cfu.instance[chartId].opts}});
  if(props.ontap === true && cfu.option[chartId].enableScroll === false && props.onmovetip === true){
    _tap(e,true)
  }
}

function _newChart(chartId: any): void {
  if (chartLoading.value == true) {
    return;
  }
  showchart.value = true;
  cfu.instance[chartId] = new LingyunUiCharts(cfu.option[chartId]);
  cfu.instance[chartId].addEventListener('renderComplete', () => {
    emitMsg({name: 'complete', params: {type:"complete", complete: true, id: chartId, opts: cfu.instance[chartId].opts}});
    scheduleMpLastShot()
    cfu.instance[chartId].delEventListener('renderComplete')
  });
  cfu.instance[chartId].addEventListener('scrollLeft', () => {
    emitMsg({name: 'scrollLeft', params: {type:"scrollLeft", scrollLeft: true, id: chartId, opts: cfu.instance[chartId].opts}});
  });
  cfu.instance[chartId].addEventListener('scrollRight', () => {
    emitMsg({name: 'scrollRight', params: {type:"scrollRight", scrollRight: true, id: chartId, opts: cfu.instance[chartId].opts}});
  });
}

function _updataUChart(chartId: any): void {
  cfu.instance[chartId].updateData(cfu.option[chartId])
  scheduleMpLastShot()
}
// #endif

function init(): void {
  let chartId = cid.value
  let chartdom = (uni.createSelectorQuery() as any)
    // #ifndef MP-ALIPAY
    .in(proxy)
    // #endif
    .select('#ChartBoxId'+chartId)
    .boundingClientRect((data: any) => {
      if (data.width > 0 && data.height > 0) {
        chartLoading.value = false;
        showchart.value = true;
        lastDrawTime.value = Date.now();
        cWidth.value = data.width;
        cHeight.value = data.height;
        // #ifdef H5 || WEB
        _setupH5Canvas(chartId, data.width, data.height)
        // #endif
        applyLegendTheme(chartId)
          // 滚动图会用 background 遮住绘图区两侧；默认色必须跟随主题，避免暗黑下出现白条。
          const transparentBackground = props.background === 'rgba(0,0,0,0)'
            || props.background === 'transparent'
            || props.background === 'none'
          cfu.option[chartId].background = (props.type === 'word' || !transparentBackground)
            ? props.background
            : (legendTheme.value === 'dark' ? '#1c1c1e' : '#FFFFFF');
          cfu.option[chartId].pixelRatio = pixel.value;
          cfu.option[chartId].animation = props.animation;
          cfu.option[chartId].width = data.width * pixel.value;
          cfu.option[chartId].height = data.height * pixel.value;
          cfu.option[chartId].onzoom = props.onzoom;
          cfu.option[chartId].ontap = props.ontap;
          cfu.option[chartId].ontouch = props.ontouch;
          cfu.option[chartId].onmouse = openmouse.value;
          cfu.option[chartId].onmovetip = props.onmovetip;
          cfu.option[chartId].tooltipShow = props.tooltipShow;
          cfu.option[chartId].tooltipFormat = props.tooltipFormat;
          cfu.option[chartId].tooltipCustom = props.tooltipCustom;
          cfu.option[chartId].inScrollView = props.inScrollView;
          cfu.option[chartId].lastDrawTime = lastDrawTime.value;
          cfu.option[chartId].tapLegend = props.tapLegend;
        //如果是H5或者App端，采用renderjs渲染图表
        if (inH5.value || inApp.value) {
          cfu.option[chartId].rotateLock = cfu.option[chartId].rotate;
          cfu.option[chartId].stamp = [
            chartDataStamp.value,
            optsStamp.value,
            legendTheme.value,
            props.background,
            data.width,
            data.height,
          ].join(':');
          chartsOpts.value = deepCloneAssign({}, cfu.option[chartId]);
        // 小程序端用凌云图表引擎渲染
        } else {
          // #ifndef APP-VUE || H5
          cfu.option[chartId] = formatterAssign(cfu.option[chartId],cfu.formatter)
          chartError.value = null;
          chartLoading.value = false;
          showchart.value = true;
          nextTick(()=>{
            if (useWeixinCanvas2d.value) {
              const query = (uni.createSelectorQuery() as any).in(proxy)
              query
                .select('#' + chartId)
                .fields({ node: true, size: true })
                .exec((res: any) => {
                  if (res[0]) {
                    const canvas = res[0].node;
                    const ctx = canvas.getContext('2d');
                    cfu.option[chartId].context = ctx;
                    cfu.option[chartId].rotateLock = cfu.option[chartId].rotate;
                    if(cfu.instance[chartId] && cfu.option[chartId] && cfu.option[chartId].update === true){
                      _updataUChart(chartId)
                    }else{
                      canvas.width = data.width * pixel.value;
                      canvas.height = data.height * pixel.value;
                      canvas._width = data.width * pixel.value;
                      canvas._height = data.height * pixel.value;
                      setTimeout(()=>{
                        cfu.option[chartId].context.restore();
                        cfu.option[chartId].context.save();
                        _newChart(chartId)
                      },100)
                    }
                  } else {
                    showchart.value = false;
                    chartError.value = '初始化失败：未获取到微信 Canvas 2D 节点，canvas-id:' + chartId;
                  }
                });
            } else {
              if(inAli.value){
                cfu.option[chartId].rotateLock = cfu.option[chartId].rotate;
              }
              cfu.option[chartId].context = uni.createCanvasContext(chartId, proxy);
              if(cfu.instance[chartId] && cfu.option[chartId] && cfu.option[chartId].update === true){
                _updataUChart(chartId)
              }else{
                setTimeout(()=>{
                  cfu.option[chartId].context.restore();
                  cfu.option[chartId].context.save();
                  _newChart(chartId)
                },100)
              }
            }
          })
          // #endif
        }
      } else {
        chartLoading.value = false;
        showchart.value = false;
        if (props.reshow == true) {
          chartError.value = '布局错误：未获取到父元素宽高尺寸！canvas-id:' + chartId;
        }
      }
    })
    .exec();
}

function checkData(anyData: any): void {
  let chartId = cid.value
  if (props.type && cfu.type.includes(props.type)) {
    cfu.option[chartId] = deepCloneAssign({}, cfu[props.type as string], props.opts);
    cfu.option[chartId].canvasId = chartId;
  } else {
    chartLoading.value = false;
    showchart.value = false;
    chartError.value = '参数错误：props参数中type类型不正确';
  }
  //挂载categories和series
  let newData = deepCloneAssign({}, anyData);
  if (newData.series !== undefined && newData.series.length > 0) {
    chartError.value = null;
    cfu.option[chartId].categories = newData.categories;
    cfu.option[chartId].series = newData.series;
    nextTick(()=>{
      init()
    })
  }
}

function beforeInit(): void {
  chartError.value = null;
  if (typeof props.chartData === 'object' && props.chartData != null && props.chartData.series !== undefined && props.chartData.series.length > 0) {
    //拷贝一下chartData，为了opts变更后统一数据来源
    drawData.value = deepCloneAssign({}, props.chartData);
    chartLoading.value = false;
    showchart.value = true;
    checkData(props.chartData);
  } else {
    chartLoading.value = true;
  }
}

function reloading(): void {
  if(props.errorReload === false){
    return;
  }
  showchart.value = false;
  chartError.value = null;
  beforeInit();
}

function resizeHandler(): void {
  //渲染防抖
  let currTime = Date.now();
  let lastTime = lastDrawTime.value ? lastDrawTime.value : currTime-3000;
  let duration = currTime - lastTime;
  if (duration < 1000) return;
  let chartdom = (uni.createSelectorQuery() as any)
    // #ifndef MP-ALIPAY
    .in(proxy)
    // #endif
    .select('#ChartBoxId'+cid.value)
    .boundingClientRect((data: any) => {
      showchart.value = true;
      if (data.width > 0 && data.height > 0) {
        if (data.width !== cWidth.value || data.height !== cHeight.value) {
          checkData(drawData.value)
        }
      }
    })
    .exec();
}

function toJSON(): any {
  return proxy
}

watch(chartDataStamp, () => {
  const val = props.chartData
  if (typeof val === 'object' && val != null) {
    _clearChart();
    if (val.series && val.series.length > 0) {
      beforeInit();
    } else {
      chartLoading.value = true;
      showchart.value = false;
      chartError.value = null;
    }
  } else {
    chartLoading.value = false;
    _clearChart();
    showchart.value = false;
    chartError.value = '参数错误：chartData数据类型错误';
  }
})

watch(optsStamp, () => {
  const val = props.opts
  if (typeof val === 'object' && val != null) {
    if (props.optsWatch == true) checkData(drawData.value);
  } else {
    chartLoading.value = false;
    _clearChart();
    showchart.value = false;
    chartError.value = '参数错误：opts数据类型错误';
  }
})

watch(() => props.reshow, (val, oldval) => {
  if (val === true && chartLoading.value === false) {
    setTimeout(() => {
      chartError.value = null;
      checkData(drawData.value);
    }, 200);
  }
})

watch(legendTheme, () => {
  if (!drawData.value || !drawData.value.series) return
  checkData(drawData.value)
})

watch(() => props.reload, (val, oldval) => {
  if (val === true) {
    showchart.value = false;
    chartError.value = null;
    reloading();
  }
})

watch(chartError, (val, oldval) => {
  if (val) {
    emitMsg({name: 'error', params: {type:"error", errorShow: props.errorShow, msg: val, id: cid.value}});
    if(props.errorShow){
      console.log('[lingyun-ui-charts]' + val);
    }
  }
})

watch(() => props.errorMessage, (val, oldval) => {
  if (val && props.errorShow && val !== null && val !== 'null' && val !== '') {
    showchart.value = false;
    chartLoading.value = false;
    chartError.value = val;
  } else {
    showchart.value = false;
    chartError.value = null;
    reloading();
  }
})

onMounted(() => {
  // #ifdef APP-VUE
  inApp.value = true;
  // #endif
  // #ifdef APP-NVUE
  inApp.value = true;
  chartLoading.value = false
  chartError.value = "暂不支持NVUE"
  // #endif
  // #ifdef H5
  inH5.value = true;
  /* H5 桌面端统一启用鼠标：设备模拟器可能把 platform 报成 android，
     但用户仍用鼠标拖图表 / 滚动条；触摸事件仍走 touch 分支。 */
  openmouse.value = props.onmouse;
  // #endif
  nextTick(()=>{
    beforeInit();
  })
  // #ifdef MP-WEIXIN
  _unsubMpOverlay.value = onLingyunMpOverlayChange((open) => {
    onMpOverlayGate(open)
  })
  if (isLingyunMpOverlayOpen()) onMpOverlayGate(true)
  // #endif
  // #ifndef MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || APP-VUE
  const time = inH5.value ? 500 : 200;
  _resizeHandler.value = debounce(function() {
    if (chartLoading.value == true) {
      return;
    }
    let errmsg = chartError.value;
    if (errmsg !== null && errmsg !== 'null' && errmsg !== '') {
      return;
    }
    resizeHandler();
  }, time);
  uni.onWindowResize(_resizeHandler.value);
  // #endif
  _pageTouchHandler.value = () => {
    hideTooltip()
  }
  uni.$on('lingyun:page-touch', _pageTouchHandler.value)
})

onUnmounted(() => {
  // #ifdef MP-WEIXIN
  if (_unsubMpOverlay.value) {
    _unsubMpOverlay.value()
    _unsubMpOverlay.value = null
  }
  if (_mpLastShotTimer.value) {
    clearTimeout(_mpLastShotTimer.value)
    _mpLastShotTimer.value = 0
  }
  mpOverlayCover.value = false
  mpOverlayShot.value = ''
  mpLastShot.value = ''
  // #endif
  delete cfu.option[cid.value]
  delete cfu.instance[cid.value]
  // #ifndef MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || APP-VUE
  if (_resizeHandler.value) {
    uni.offWindowResize(_resizeHandler.value)
    _resizeHandler.value = null
  }
  // #endif
  if (_pageTouchHandler.value) {
    uni.$off('lingyun:page-touch', _pageTouchHandler.value)
    _pageTouchHandler.value = null
  }
})

defineExpose({
  emitMsg,
  hideTooltip,
  _setupH5Canvas,
  applyLegendTheme,
  _clearChart,
  captureMpOverlayShot,
  onMpOverlayGate,
  scheduleMpLastShot,
  saveImage,
  getImage,
  _error,
  init,
  checkData,
  beforeInit,
  reloading,
  resizeHandler,
  toJSON,
})
</script>

<!-- #ifdef APP-VUE || H5 -->
<script module="rdcharts" lang="renderjs">
import LingyunUiChartsRD from './lingyun-ui-charts';
import { cfu } from './config';

var that = {};
var rootdom = null;
var lastMoveTime = 0;

function moveLimited(cid) {
  var now = Date.now();
  var limit = (cfu.option[cid] && cfu.option[cid].touchMoveLimit) || 24;
  if (now - lastMoveTime < Math.floor(1000 / limit)) return true;
  lastMoveTime = now;
  return false;
}

function rdClone(value) {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) {
    var list = new Array(value.length)
    for (var i = 0; i < value.length; i++) list[i] = rdClone(value[i])
    return list
  }
  var out = {}
  for (var key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) out[key] = rdClone(value[key])
  }
  return out
}

function rdformatterAssign(args,formatter) {
  for (let key in args) {
    if(args.hasOwnProperty(key) && args[key] !== null && typeof args[key] === 'object'){
      rdformatterAssign(args[key],formatter)
    }else if(key === 'format' && typeof args[key] === 'string'){
      args['formatter'] = formatter[args[key]] ? formatter[args[key]] : undefined;
    }
  }
  return args;
}

export default {
  data() {
    return {
      rid:null,
      _tooltipActive: false,
      _outsideCloseHandler: null
    }
  },
  mounted() {
    rootdom = {top:0,left:0}
    // #ifdef H5
    let dm = document.querySelectorAll('uni-main')[0]
    if(dm === undefined){
      dm = document.querySelectorAll('uni-page-wrapper')[0]
    }
    rootdom = {top:dm.offsetTop,left:dm.offsetLeft}
    // #endif
    this.bindOutsideClose()
  },
  destroyed(){
    this.unbindOutsideClose()
    delete cfu.option[this.rid]
    delete cfu.instance[this.rid]
  },
  methods: {
    bindOutsideClose() {
      if (typeof document === 'undefined' || this._outsideCloseHandler) return
      const handler = (event) => {
        const cid = this.rid
        if (!cid || !this._tooltipActive) return
        const el = document.getElementById('UC' + cid)
        const target = event.target
        if (el && target && (el === target || el.contains(target))) return
        this.hideTooltip()
      }
      this._outsideCloseHandler = handler
      document.addEventListener('touchstart', handler, true)
      document.addEventListener('mousedown', handler, true)
    },
    unbindOutsideClose() {
      if (this._outsideCloseHandler && typeof document !== 'undefined') {
        document.removeEventListener('touchstart', this._outsideCloseHandler, true)
        document.removeEventListener('mousedown', this._outsideCloseHandler, true)
      }
      this._outsideCloseHandler = null
    },
    hideTooltip() {
      if (!this._tooltipActive) return
      this._tooltipActive = false
      const cid = this.rid
      const instance = cid && cfu.instance[cid]
      if (instance && typeof instance.hideToolTip === 'function') {
        instance.hideToolTip()
      }
    },
    mouseLeave() {
      this.hideTooltip()
    },
    //==============以下是图表引擎的方法====================
    ucinit(newVal, oldVal, owner, instance){
      if(!newVal || !newVal.canvasId){
        return;
      }
      if(oldVal && newVal.stamp && newVal.stamp === oldVal.stamp){
        return;
      }
      let cid = newVal.canvasId
      this.rid = cid
      that[cid] = this.$ownerInstance || instance
      cfu.option[cid] = rdClone(newVal)
      cfu.option[cid] = rdformatterAssign(cfu.option[cid],cfu.formatter)
      let canvasdom = document.getElementById(cid)
      if(canvasdom && canvasdom.children[0]){
        cfu.option[cid].context = canvasdom.children[0].getContext("2d")
        if(cfu.instance[cid] && cfu.option[cid] && cfu.option[cid].update === true){
          this.updataUChart()
        }else{
          setTimeout(()=>{
            cfu.option[cid].context.restore();
            cfu.option[cid].context.save();
            this.newUChart()
          },100)
        }
      }
    },
    newUChart() {
      let cid = this.rid
      cfu.instance[cid] = new LingyunUiChartsRD(cfu.option[cid])
      cfu.instance[cid].addEventListener('renderComplete', () => {
        that[cid].callMethod('emitMsg',{name:"complete",params:{type:"complete",complete:true,id:cid, opts: cfu.instance[cid].opts}})
        cfu.instance[cid].delEventListener('renderComplete')
      });
      cfu.instance[cid].addEventListener('scrollLeft', () => {
        that[cid].callMethod('emitMsg',{name:"scrollLeft",params:{type:"scrollLeft",scrollLeft:true,id:cid, opts: cfu.instance[cid].opts}})
      });
      cfu.instance[cid].addEventListener('scrollRight', () => {
        that[cid].callMethod('emitMsg',{name:"scrollRight",params:{type:"scrollRight",scrollRight:true,id:cid, opts: cfu.instance[cid].opts}})
      });
    },
    updataUChart() {
      let cid = this.rid
      cfu.instance[cid].updateData(cfu.option[cid])
    },
    tooltipDefault(item, category, index, opts) {
      if (category) {
        let data = item.data
        if(typeof item.data === "object"){
          data = item.data.value
        }
        return category + ' ' + item.name + ':' + data;
      } else {
        if (item.properties && item.properties.name) {
          return item.properties.name ;
        } else {
          return item.name + ':' + item.data;
        }
      }
    },
    showTooltip(e,cid) {
      let tc = cfu.option[cid].tooltipCustom
      if (tc && tc !== undefined && tc !== null) {
        let offset = undefined;
        if (tc.x >= 0 && tc.y >= 0) {
          offset = { x: tc.x, y: tc.y + 10 };
        }
        cfu.instance[cid].showToolTip(e, {
          index: tc.index,
          offset: offset,
          textList: tc.textList,
          formatter: (item, category, index, opts) => {
            if (typeof cfu.option[cid].tooltipFormat === 'string' && cfu.formatter[cfu.option[cid].tooltipFormat]) {
              return cfu.formatter[cfu.option[cid].tooltipFormat](item, category, index, opts);
            } else {
              return this.tooltipDefault(item, category, index, opts);
            }
          }
        });
      } else {
        cfu.instance[cid].showToolTip(e, {
          formatter: (item, category, index, opts) => {
            if (typeof cfu.option[cid].tooltipFormat === 'string' && cfu.formatter[cfu.option[cid].tooltipFormat]) {
              return cfu.formatter[cfu.option[cid].tooltipFormat](item, category, index, opts);
            } else {
              return this.tooltipDefault(item, category, index, opts);
            }
          }
        });
      }
      this._tooltipActive = true
    },
    tap(e) {
      let cid = this.rid
      let ontap = cfu.option[cid].ontap
      let tooltipShow = cfu.option[cid].tooltipShow
      let tapLegend = cfu.option[cid].tapLegend
      if(ontap == false) return;
      let currentIndex=null
      let legendIndex=null
      let rchartdom = document.getElementById('UC'+cid).getBoundingClientRect()
      let tmpe = {}
      if(e.detail.x){//tap或者click的事件
        tmpe = { x: e.detail.x - rchartdom.left, y:e.detail.y - rchartdom.top + rootdom.top}
      }else{//mouse的事件
        tmpe = { x: e.clientX - rchartdom.left, y:e.clientY - rchartdom.top + rootdom.top}
      }
      e.changedTouches = [];
      e.changedTouches.unshift(tmpe)
      const legendAction = cfu.instance[cid].getLegendActionData(e)
      if (legendAction) {
        that[cid].callMethod('emitMsg', {
          name: 'legendAction',
          params: {
            type: 'legendAction',
            legendIndex: legendAction.index,
            item: legendAction.item,
            column: legendAction.column,
            event: tmpe,
            id: cid,
            opts: cfu.instance[cid].opts
          }
        })
        return
      }
      currentIndex=cfu.instance[cid].getCurrentDataIndex(e)
      legendIndex=cfu.instance[cid].getLegendDataIndex(e)
      if(tapLegend === true){
        cfu.instance[cid].touchLegend(e);
      }
      if(tooltipShow==true){
        this.showTooltip(e,cid)
      }
      that[cid].callMethod('emitMsg',{name:"getIndex",params:{type:"getIndex",event:tmpe,currentIndex:currentIndex,legendIndex:legendIndex,id:cid, opts: cfu.instance[cid].opts}})
    },
    touchStart(e) {
      let cid = this.rid
      let ontouch = cfu.option[cid].ontouch
      if(ontouch == false) return;
      if(cfu.option[cid].enableScroll === true && e.touches.length == 1){
        cfu.instance[cid].scrollStart(e);
      }
      that[cid].callMethod('emitMsg',{name:"getTouchStart",params:{type:"touchStart",event:e.changedTouches[0],id:cid, opts: cfu.instance[cid].opts}})
    },
    touchMove(e) {
      let cid = this.rid
      let ontouch = cfu.option[cid].ontouch
      if(ontouch == false) return;
      if(moveLimited(cid)) return;
      if(cfu.option[cid].enableScroll === true && e.changedTouches.length == 1){
        cfu.instance[cid].scroll(e);
      }
      if(cfu.option[cid].ontap === true && cfu.option[cid].enableScroll === false && cfu.option[cid].onmovetip === true){
        let rchartdom = document.getElementById('UC'+cid).getBoundingClientRect()
        let tmpe = { x: e.changedTouches[0].clientX - rchartdom.left, y:e.changedTouches[0].clientY - rchartdom.top + rootdom.top}
        e.changedTouches.unshift(tmpe)
        if(cfu.option[cid].tooltipShow === true){
          this.showTooltip(e,cid)
        }
      }
      if(ontouch === true && cfu.option[cid].enableScroll === true && cfu.option[cid].onzoom === true && e.changedTouches.length == 2){
        cfu.instance[cid].dobuleZoom(e);
      }
      that[cid].callMethod('emitMsg',{name:"getTouchMove",params:{type:"touchMove",event:e.changedTouches[0],id:cid, opts: cfu.instance[cid].opts}})
    },
    touchEnd(e) {
      let cid = this.rid
      let ontouch = cfu.option[cid].ontouch
      if(ontouch == false) return;
      if(cfu.option[cid].enableScroll === true && e.touches.length == 0){
        cfu.instance[cid].scrollEnd(e);
      }
      that[cid].callMethod('emitMsg',{name:"getTouchEnd",params:{type:"touchEnd",event:e.changedTouches[0],id:cid, opts: cfu.instance[cid].opts}})
    },
    mouseDown(e) {
      let cid = this.rid
      let onmouse = cfu.option[cid].onmouse
      if(onmouse == false) return;
      let rchartdom = document.getElementById('UC'+cid).getBoundingClientRect()
      let tmpe = {}
      tmpe = { x: e.clientX - rchartdom.left, y:e.clientY - rchartdom.top + rootdom.top}
      e.changedTouches = [];
      e.changedTouches.unshift(tmpe)
      cfu.instance[cid].scrollStart(e)
      cfu.option[cid].mousedown=true;
      that[cid].callMethod('emitMsg',{name:"getTouchStart",params:{type:"mouseDown",event:tmpe,id:cid, opts: cfu.instance[cid].opts}})
    },
    mouseMove(e) {
      let cid = this.rid
      let onmouse = cfu.option[cid].onmouse
      let tooltipShow = cfu.option[cid].tooltipShow
      if(onmouse == false) return;
      if(moveLimited(cid)) return;
      let rchartdom = document.getElementById('UC'+cid).getBoundingClientRect()
      let tmpe = {}
      tmpe = { x: e.clientX - rchartdom.left, y:e.clientY - rchartdom.top + rootdom.top}
      e.changedTouches = [];
      e.changedTouches.unshift(tmpe)
      if(cfu.option[cid].mousedown){
        cfu.instance[cid].scroll(e)
        that[cid].callMethod('emitMsg',{name:"getTouchMove",params:{type:"mouseMove",event:tmpe,id:cid, opts: cfu.instance[cid].opts}})
      }else if(cfu.instance[cid]){
        if(tooltipShow==true){
          this.showTooltip(e,cid)
        }
      }
    },
    mouseUp(e) {
      let cid = this.rid
      let onmouse = cfu.option[cid].onmouse
      if(onmouse == false) return;
      let rchartdom = document.getElementById('UC'+cid).getBoundingClientRect()
      let tmpe = {}
      tmpe = { x: e.clientX - rchartdom.left, y:e.clientY - rchartdom.top + rootdom.top}
      e.changedTouches = [];
      e.changedTouches.unshift(tmpe)
      cfu.instance[cid].scrollEnd(e)
      cfu.option[cid].mousedown=false;
      that[cid].callMethod('emitMsg',{name:"getTouchEnd",params:{type:"mouseUp",event:tmpe,id:cid, opts: cfu.instance[cid].opts}})
    },
  }
}
</script>
<!-- #endif -->

<style scoped>
.chartsview {
  width: 100%;
  height: 100%;
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  position: relative;
}

.chartsview__state {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.chartsview__shot {
  display: block;
  flex-shrink: 0;
}
</style>
