<!--
 * lingyun-ui-charts 凌云UI 图表组件
 * 系列色：config.ts
 -->
<template>
  <view class="chartsview" :id="'ChartBoxId'+cid">
    <view v-if="mixinDatacomLoading" class="chartsview__state">
      <lingyun-activity-indicator />
    </view>
    <view v-if="mixinDatacomErrorMessage && errorShow" class="chartsview__state" @tap="reloading">
      <lingyun-empty fill :title="chartErrorTitle" />
    </view>
    <!-- APP和H5采用renderjs渲染图表 -->
    <!-- #ifdef APP-VUE || H5 -->
      <view
        v-on:tap="rdcharts.tap"
        v-on:mousemove="rdcharts.mouseMove"
        v-on:mousedown="rdcharts.mouseDown"
        v-on:mouseup="rdcharts.mouseUp"
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
    <block v-if="type2d">
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
    <block v-if="!type2d">
      <view v-if="ontouch" @tap="_tap">
        <canvas
          :id="cid"
          :canvasId="cid"
          :style="{ width: cWidth + 'px', height: cHeight + 'px', background: background }"
          @touchstart="_touchStart"
          @touchmove="_touchMove"
          @touchend="_touchEnd"
          :disable-scroll="disScroll"
          :hidden="mpOverlayCover"
          @error="_error"
          v-if="showchart"
        />
      </view>
      <view v-if="!ontouch" >
        <canvas
          :id="cid"
          :canvasId="cid"
          :style="{ width: cWidth + 'px', height: cHeight + 'px', background: background }"
          :disable-scroll="disScroll"
          :hidden="mpOverlayCover"
          @tap="_tap"
          @error="_error"
          v-if="showchart"
        />
      </view>
    </block>
    <!-- #endif -->
  </view>
</template>

<script lang="ts">
// 类型以 any 收口，避免改判断时带偏绘制。
import { defineComponent } from 'vue'
import { useThemeStore } from '@/stores/theme'
import {
  isLingyunMpOverlayOpen,
  onLingyunMpOverlayChange,
} from '@/uni_modules/lingyun-ui/utils/mp-overlay-gate'
import LingyunUiCharts from './lingyun-ui-charts'
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

// 时间转换函数，为了匹配uniClinetDB读取出的时间与categories不同
function getFormatDate(date: Date) {
	var seperator = "-";
	var year = date.getFullYear();
	var month: string | number = date.getMonth() + 1;
	var strDate: string | number = date.getDate();
	if (month >= 1 && month <= 9) {
			month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
	}
	var currentdate = year + seperator + month + seperator + strDate;
	return currentdate;
}

var lastMoveTime: number | null = null;
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

export default defineComponent({
  name: 'lingyun-ui-charts',
  mixins: [uniCloud.mixinDatacom],
  props: {
    type: {
      type: String,
      default: null
    },
    canvasId: {
      type: String,
      default: 'id'
    },
    canvas2d: {
      type: Boolean,
      default: false
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
      default: false
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
      default: false
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
    startDate: {
      type: String,
      default: undefined
    },
    endDate: {
      type: String,
      default: undefined
    },
    textEnum: {
      type: Array,
      default () {
        return []
      }
    },
    groupEnum: {
      type: Array,
      default () {
        return []
      }
    },
    pageScrollTop: {
      type: Number,
      default: 0
    },
    tapLegend: {
      type: Boolean,
      default: true
    },
    menus: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data(): any {
    return {
      cid: 'id',
      inWx: false,
      inAli: false,
      inTt: false,
      inBd: false,
      inH5: false,
      inApp: false,
      inWin: false,
      type2d: true,
      disScroll: false,
      openmouse: false,
      pixel: 1,
      cWidth: 375,
      cHeight: 250,
      showchart: false,
      chartsOpts: {},
      drawData:{},
      lastDrawTime:null,
      /** 微信：浮层打开时 hidden canvas，截图占位 */
      mpOverlayCover: false,
      mpOverlayShot: '',
      /** 绘制完成后的最近一帧，浮层打开时可立刻盖住，避免截图前穿透 */
      mpLastShot: '',
      _unsubMpOverlay: null as null | (() => void),
      _mpOverlayToken: 0,
      _mpLastShotTimer: 0,
    };
  },
  created(){
    this.cid = this.canvasId
    if (this.canvasId == 'id' || this.canvasId == '') {
      let t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      let len = t.length
      let id = ''
      for (let i = 0; i < 32; i++) {
        id += t.charAt(Math.floor(Math.random() * len))
      }
      this.cid = id
    }
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
      this.inWin = true;
    }
    // #ifdef MP-WEIXIN
    this.inWx = true;
    if (this.canvas2d === false || platform === 'windows' || platform === 'mac') {
      this.type2d = false;
    }else{
      this.type2d = true;
      this.pixel = pixelRatio;
    }
    // #endif
    //非微信小程序端强制关闭canvas2d模式
    // #ifndef MP-WEIXIN
    this.type2d = false;
    // #endif
    // #ifdef  MP-TOUTIAO || MP-LARK || MP-ALIPAY
    this.type2d = this.canvas2d;
    // #endif
    // #ifdef MP-ALIPAY
    this.inAli = true;
    this.pixel = pixelRatio;
    // #endif
    // #ifdef MP-BAIDU
    this.inBd = true;
    // #endif
    // #ifdef MP-TOUTIAO
    this.inTt = true;
    // #endif
    this.disScroll = this.disableScroll;
  },
  mounted() {
    // #ifdef APP-VUE
    this.inApp = true;
    // #endif
    // #ifdef APP-NVUE
    this.inApp = true;
    this.mixinDatacomLoading = false
    this.mixinDatacomErrorMessage = "暂不支持NVUE"
    // #endif
    // #ifdef H5
    this.inH5 = true;
    if(this.inWin === true){
      this.openmouse = this.onmouse;
    }
    // #endif
    this.$nextTick(()=>{
      this.beforeInit();
    })
    // #ifdef MP-WEIXIN
    this._unsubMpOverlay = onLingyunMpOverlayChange((open) => {
      this.onMpOverlayGate(open)
    })
    if (isLingyunMpOverlayOpen()) this.onMpOverlayGate(true)
    // #endif
    // #ifndef MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || APP-VUE
    const time = this.inH5 ? 500 : 200;
    const _this = this;
    uni.onWindowResize(
      debounce(function(res) {
        if (_this.mixinDatacomLoading == true) {
          return;
        }
        let errmsg = _this.mixinDatacomErrorMessage;
        if (errmsg !== null && errmsg !== 'null' && errmsg !== '') {
          return;
        }
        _this.resizeHandler();
      }, time)
    );
    // #endif
  },
  destroyed(){
    // #ifdef MP-WEIXIN
    if (this._unsubMpOverlay) {
      this._unsubMpOverlay()
      this._unsubMpOverlay = null
    }
    if (this._mpLastShotTimer) {
      clearTimeout(this._mpLastShotTimer)
      this._mpLastShotTimer = 0
    }
    this.mpOverlayCover = false
    this.mpOverlayShot = ''
    this.mpLastShot = ''
    // #endif
    delete cfu.option[this.cid]
    delete cfu.instance[this.cid]
    // #ifndef MP-ALIPAY || MP-BAIDU || MP-TOUTIAO
    uni.offWindowResize(()=>{})
    // #endif
  },
  watch: {
    chartDataProps: {
      handler(val, oldval) {
        if (typeof val === 'object') {
          if (JSON.stringify(val) !== JSON.stringify(oldval)) {
            this._clearChart();
            if (val.series && val.series.length > 0) {
              this.beforeInit();
            }else{
              this.mixinDatacomLoading = true;
              this.showchart = false;
              this.mixinDatacomErrorMessage = null;
            }
          }
        } else {
          this.mixinDatacomLoading = false;
          this._clearChart();
          this.showchart = false;
          this.mixinDatacomErrorMessage = '参数错误：chartData数据类型错误';
        }
      },
      immediate: false,
      deep: true
    },
    localdata:{
      handler(val, oldval) {
        if (JSON.stringify(val) !== JSON.stringify(oldval)) {
          if (val.length > 0) {
            this.beforeInit();
          }else{
            this.mixinDatacomLoading = true;
            this._clearChart();
            this.showchart = false;
            this.mixinDatacomErrorMessage = null;
          }
        }
      },
      immediate: false,
      deep: true
    },
    optsProps: {
      handler(val, oldval) {
        if (typeof val === 'object') {
          if (JSON.stringify(val) !== JSON.stringify(oldval) && this.optsWatch == true) {
            this.checkData(this.drawData);
          }
        } else {
          this.mixinDatacomLoading = false;
          this._clearChart();
          this.showchart = false;
          this.mixinDatacomErrorMessage = '参数错误：opts数据类型错误';
        }
      },
      immediate: false,
      deep: true
    },
    reshow(val, oldval) {
      if (val === true && this.mixinDatacomLoading === false) {
        setTimeout(() => {
          this.mixinDatacomErrorMessage = null;
          this.checkData(this.drawData);
        }, 200);
      }
    },
    legendTheme() {
      if (!this.drawData || !this.drawData.series) return
      this.checkData(this.drawData)
    },
    reload(val, oldval) {
      if (val === true) {
        this.showchart = false;
        this.mixinDatacomErrorMessage = null;
        this.reloading();
      }
    },
    mixinDatacomErrorMessage(val, oldval) {
      if (val) {
        this.emitMsg({name: 'error', params: {type:"error", errorShow: this.errorShow, msg: val, id: this.cid}});
        if(this.errorShow){
          console.log('[lingyun-ui-charts]' + val);
        }
      }
    },
    errorMessage(val, oldval) {
      if (val && this.errorShow && val !== null && val !== 'null' && val !== '') {
        this.showchart = false;
        this.mixinDatacomLoading = false;
        this.mixinDatacomErrorMessage = val;
      } else {
        this.showchart = false;
        this.mixinDatacomErrorMessage = null;
        this.reloading();
      }
    }
  },
  computed: {
    chartErrorTitle(): string {
      const msg = this.errorMessage
      if (msg == null || msg === '' || msg === 'null') return '请点击重试'
      return msg
    },
    legendTheme(): 'light' | 'dark' {
      return useThemeStore().resolved
    },
    optsProps() {
      return JSON.parse(JSON.stringify(this.opts));
    },
    chartDataProps() {
      return JSON.parse(JSON.stringify(this.chartData));
    },
  },
  methods: {
    onMpOverlayGate(open: boolean) {
      // #ifndef MP-WEIXIN
      return
      // #endif
      // #ifdef MP-WEIXIN
      if (!open) {
        this._mpOverlayToken += 1
        this.mpOverlayCover = false
        this.mpOverlayShot = ''
        return
      }
      if (this.mpOverlayCover) return
      const token = ++this._mpOverlayToken
      // 有缓存：立刻 hidden + 截图占位，无穿透窗口
      if (this.mpLastShot) {
        this.mpOverlayShot = this.mpLastShot
        this.mpOverlayCover = true
        return
      }
      // 无缓存：先截再藏；超时仍 hidden，宁可空白也不穿透
      const forceTimer = setTimeout(() => {
        if (token !== this._mpOverlayToken) return
        if (!isLingyunMpOverlayOpen()) return
        this.mpOverlayCover = true
      }, 80) as unknown as number
      this.captureMpOverlayShot().then((shot: string) => {
        clearTimeout(forceTimer)
        if (token !== this._mpOverlayToken) return
        if (!isLingyunMpOverlayOpen()) return
        if (shot) {
          this.mpLastShot = shot
          this.mpOverlayShot = shot
        }
        this.mpOverlayCover = true
      })
      // #endif
    },
    scheduleMpLastShot() {
      // #ifndef MP-WEIXIN
      return
      // #endif
      // #ifdef MP-WEIXIN
      if (this.mpOverlayCover) return
      if (this._mpLastShotTimer) clearTimeout(this._mpLastShotTimer)
      this._mpLastShotTimer = setTimeout(() => {
        this._mpLastShotTimer = 0
        if (this.mpOverlayCover || !this.showchart) return
        this.captureMpOverlayShot().then((shot: string) => {
          if (shot && !this.mpOverlayCover) this.mpLastShot = shot
        })
      }, 280) as unknown as number
      // #endif
    },
    captureMpOverlayShot(): Promise<string> {
      return new Promise((resolve) => {
        let done = false
        const finish = (value: string) => {
          if (done) return
          done = true
          resolve(value)
        }
        setTimeout(() => finish(''), 220)
        if (!this.showchart || this.cWidth < 2 || this.cHeight < 2) {
          finish('')
          return
        }
        if (this.type2d) {
          const query = (uni.createSelectorQuery() as any).in(this)
          query
            .select('#' + this.cid)
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
            canvasId: this.cid,
            success: (file: { tempFilePath?: string }) => finish(file.tempFilePath || ''),
            fail: () => finish(''),
          },
          this as any,
        )
      })
    },
    beforeInit(){
      this.mixinDatacomErrorMessage = null;
      if (typeof this.chartData === 'object' && this.chartData != null && this.chartData.series !== undefined && this.chartData.series.length > 0) {
        //拷贝一下chartData，为了opts变更后统一数据来源
        this.drawData = deepCloneAssign({}, this.chartData);
        this.mixinDatacomLoading = false;
        this.showchart = true;
        this.checkData(this.chartData);
      }else if(this.localdata.length>0){
        this.mixinDatacomLoading = false;
        this.showchart = true;
        this.localdataInit(this.localdata);
      }else if(this.collection !== ''){
        this.mixinDatacomLoading = false;
        this.getCloudData();
      }else{
        this.mixinDatacomLoading = true;
      }
    },
    localdataInit(resdata: any){
      //替换enum类型为正确的描述
      if(this.groupEnum.length>0){
        for (let i = 0; i < resdata.length; i++) {
          for (let j = 0; j < this.groupEnum.length; j++) {
            if(resdata[i].group === this.groupEnum[j].value){
              resdata[i].group = this.groupEnum[j].text
            }
          }
        }
      }
      if(this.textEnum.length>0){
        for (let i = 0; i < resdata.length; i++) {
          for (let j = 0; j < this.textEnum.length; j++) {
            if(resdata[i].text === this.textEnum[j].value){
              resdata[i].text = this.textEnum[j].text
            }
          }
        }
      }
      let needCategories = false;
      let tmpData: { categories: any[]; series: any[] } = {categories:[], series:[]}
      let tmpcategories: any[] = []
      let tmpseries: any[] = [];
      //拼接categories
      needCategories = cfu.categories.includes(this.type)
      if(needCategories === true){
        //如果props中的chartData带有categories，则优先使用chartData的categories
        if(this.chartData && this.chartData.categories && this.chartData.categories.length>0){
          tmpcategories = this.chartData.categories
        }else{
          //如果是日期类型的数据，不管是本地数据还是云数据，都按起止日期自动拼接categories
          if(this.startDate && this.endDate){
            let idate: any = new Date(this.startDate)
            let edate: any = new Date(this.endDate)
            while (idate <= edate) {
            	tmpcategories.push(getFormatDate(idate))
            	idate = idate.setDate(idate.getDate() + 1)
            	idate = new Date(idate)
            }
          //否则从结果中去重并拼接categories
          }else{
            let tempckey: Record<string, any> = {};
            resdata.map(function(item: any, index: any) {
              if (item.text != undefined && !tempckey[item.text]) {
                tmpcategories.push(item.text)
                tempckey[item.text] = true
              }
            });
          }
        }
        tmpData.categories = tmpcategories
      }
      //拼接series
      let tempskey: Record<string, any> = {};
      resdata.map(function(item: any, index: any) {
        if (item.group != undefined && !tempskey[item.group]) {
          tmpseries.push({ name: item.group, data: [] });
          tempskey[item.group] = true;
        }
      });
      //如果没有获取到分组名称(可能是带categories的数据，也可能是不带的饼图类)
      if (tmpseries.length == 0) {
        tmpseries = [{ name: '默认分组', data: [] }];
        //如果是需要categories的图表类型
        if(needCategories === true){
          for (let j = 0; j < tmpcategories.length; j++) {
            let seriesdata = 0;
            for (let i = 0; i < resdata.length; i++) {
              if (resdata[i].text == tmpcategories[j]) {
                seriesdata = resdata[i].value;
              }
            }
            tmpseries[0].data.push(seriesdata);
          }
        //如果是饼图类的图表类型
        }else{
          for (let i = 0; i < resdata.length; i++) {
            tmpseries[0].data.push({"name": resdata[i].text,"value": resdata[i].value});
          }
        }
      //如果有分组名
      } else {
        for (let k = 0; k < tmpseries.length; k++) {
          //如果有categories
          if (tmpcategories.length > 0) {
            for (let j = 0; j < tmpcategories.length; j++) {
              let seriesdata = 0;
              for (let i = 0; i < resdata.length; i++) {
                if (tmpseries[k].name == resdata[i].group && resdata[i].text == tmpcategories[j]) {
                  seriesdata = resdata[i].value;
                }
              }
              tmpseries[k].data.push(seriesdata);
            }
          //如果传了group而没有传text，即没有categories（正常情况下这种数据是不符合数据要求规范的）
          } else {
            for (let i = 0; i < resdata.length; i++) {
              if (tmpseries[k].name == resdata[i].group) {
                tmpseries[k].data.push(resdata[i].value);
              }
            }
          }
        }
      }
      tmpData.series = tmpseries
      //拷贝一下chartData，为了opts变更后统一数据来源
      this.drawData = deepCloneAssign({}, tmpData);
      this.checkData(tmpData)
    },
    reloading() {
      if(this.errorReload === false){
        return;
      }
      this.showchart = false;
      this.mixinDatacomErrorMessage = null;
      if (this.collection !== '') {
        this.mixinDatacomLoading = false;
        this.onMixinDatacomPropsChange(true);
      } else {
        this.beforeInit();
      }
    },
    checkData(anyData: any) {
      let cid = this.cid
      if (this.type && cfu.type.includes(this.type)) {
        cfu.option[cid] = deepCloneAssign({}, cfu[this.type], this.opts);
        cfu.option[cid].canvasId = cid;
      } else {
        this.mixinDatacomLoading = false;
        this.showchart = false;
        this.mixinDatacomErrorMessage = '参数错误：props参数中type类型不正确';
      }
      //挂载categories和series
      let newData = deepCloneAssign({}, anyData);
      if (newData.series !== undefined && newData.series.length > 0) {
        this.mixinDatacomErrorMessage = null;
        cfu.option[cid].categories = newData.categories;
        cfu.option[cid].series = newData.series;
        this.$nextTick(()=>{
          this.init()
        })
      }
    },
    resizeHandler() {
      //渲染防抖
      let currTime = Date.now();
      let lastDrawTime = this.lastDrawTime?this.lastDrawTime:currTime-3000;
      let duration = currTime - lastDrawTime;
      if (duration < 1000) return;
      let chartdom = (uni.createSelectorQuery() as any)
        // #ifndef MP-ALIPAY
        .in(this)
        // #endif
        .select('#ChartBoxId'+this.cid)
        .boundingClientRect((data: any) => {
          this.showchart = true;
          if (data.width > 0 && data.height > 0) {
            if (data.width !== this.cWidth || data.height !== this.cHeight) {
              this.checkData(this.drawData)
            }
          }
        })
        .exec();
    },
    getCloudData() {
      if (this.mixinDatacomLoading == true) {
        return;
      }
      this.mixinDatacomLoading = true;
      this.mixinDatacomGet()
        .then((res: any) => {
          this.mixinDatacomResData = res.result.data;
          this.localdataInit(this.mixinDatacomResData);
        })
        .catch((err: any) => {
          this.mixinDatacomLoading = false;
          this.showchart = false;
          this.mixinDatacomErrorMessage = '请求错误：' + err;
        });
    },
    onMixinDatacomPropsChange(needReset: any, changed: any) {
      if (needReset == true && this.collection !== '') {
        this.showchart = false;
        this.mixinDatacomErrorMessage = null;
        this._clearChart();
        this.getCloudData();
      }
    },
    applyLegendTheme(cid: string) {
      const option = cfu.option[cid]
      if (!option) return
      const legend = option.legend && typeof option.legend === 'object' ? option.legend : {}
      const dark = this.legendTheme === 'dark'
      if (legend.fontColor == null || legend.fontColor === '') {
        legend.fontColor = dark ? chartLabelColorDark : chartLabelColor
      }
      if (legend.hiddenFontColor == null || legend.hiddenFontColor === '') {
        legend.hiddenFontColor = dark ? chartLabelSecondaryColorDark : chartLabelSecondaryColor
      }
      option.legend = legend
      if (this.type === 'ring') {
        const userTitle = (this.opts && this.opts.title) || {}
        const userSub = (this.opts && this.opts.subtitle) || {}
        if (!option.title || typeof option.title !== 'object') option.title = {}
        if (!option.subtitle || typeof option.subtitle !== 'object') option.subtitle = {}
        if (!userTitle.color) option.title.color = dark ? chartLabelColorDark : chartLabelColor
        if (!userSub.color) option.subtitle.color = dark ? chartLabelSecondaryColorDark : chartLabelSecondaryColor
      }
    },
    _clearChart() {
      let cid = this.cid
      if (cfu.option[cid] && cfu.option[cid].context) {
        const ctx = cfu.option[cid].context;
        if(typeof ctx === "object" && !!!cfu.option[cid].update){
          ctx.clearRect(0, 0, this.cWidth*this.pixel, this.cHeight*this.pixel);
          ctx.draw();
        }
      }
    },
    init() {
      let cid = this.cid
      let chartdom = (uni.createSelectorQuery() as any)
        // #ifndef MP-ALIPAY
        .in(this)
        // #endif
        .select('#ChartBoxId'+cid)
        .boundingClientRect((data: any) => {
          if (data.width > 0 && data.height > 0) {
            this.mixinDatacomLoading = false;
            this.showchart = true;
            this.lastDrawTime = Date.now();
            this.cWidth = data.width;
            this.cHeight = data.height;
            this.applyLegendTheme(cid)
              // 其它图种用白底给空心点/Y 轴遮挡；词云会铺满画布，默认透明才能透出卡片底，和其它图一致
              cfu.option[cid].background = (this.type === 'word' || this.background != 'rgba(0,0,0,0)')
                ? this.background
                : '#FFFFFF';
              cfu.option[cid].canvas2d = this.type2d;
              cfu.option[cid].pixelRatio = this.pixel;
              cfu.option[cid].animation = this.animation;
              cfu.option[cid].width = data.width * this.pixel;
              cfu.option[cid].height = data.height * this.pixel;
              cfu.option[cid].onzoom = this.onzoom;
              cfu.option[cid].ontap = this.ontap;
              cfu.option[cid].ontouch = this.ontouch;
              cfu.option[cid].onmouse = this.openmouse;
              cfu.option[cid].onmovetip = this.onmovetip;
              cfu.option[cid].tooltipShow = this.tooltipShow;
              cfu.option[cid].tooltipFormat = this.tooltipFormat;
              cfu.option[cid].tooltipCustom = this.tooltipCustom;
              cfu.option[cid].inScrollView = this.inScrollView;
              cfu.option[cid].lastDrawTime = this.lastDrawTime;
              cfu.option[cid].tapLegend = this.tapLegend;
            //如果是H5或者App端，采用renderjs渲染图表
            if (this.inH5 || this.inApp) {
              cfu.option[cid].rotateLock = cfu.option[cid].rotate;
              this.chartsOpts = deepCloneAssign({}, cfu.option[cid]);
            // 小程序端用凌云图表引擎渲染
            } else {
              cfu.option[cid] = formatterAssign(cfu.option[cid],cfu.formatter)
              this.mixinDatacomErrorMessage = null;
              this.mixinDatacomLoading = false;
              this.showchart = true;
              this.$nextTick(()=>{
                if (this.type2d === true) {
                  const query = (uni.createSelectorQuery() as any).in(this)
                  query
                    .select('#' + cid)
                    .fields({ node: true, size: true })
                    .exec((res: any) => {
                      if (res[0]) {
                        const canvas = res[0].node;
                        const ctx = canvas.getContext('2d');
                        cfu.option[cid].context = ctx;
                        cfu.option[cid].rotateLock = cfu.option[cid].rotate;
                        if(cfu.instance[cid] && cfu.option[cid] && cfu.option[cid].update === true){
                          this._updataUChart(cid)
                        }else{
                          canvas.width = data.width * this.pixel;
                          canvas.height = data.height * this.pixel;
                          canvas._width = data.width * this.pixel;
                          canvas._height = data.height * this.pixel;
                          setTimeout(()=>{
                            cfu.option[cid].context.restore();
                            cfu.option[cid].context.save();
                            this._newChart(cid)
                          },100)
                        }
                      } else {
                        this.showchart = false;
                        this.mixinDatacomErrorMessage = '参数错误：开启2d模式后，未获取到dom节点，canvas-id:' + cid;
                      }
                    });
                } else {
                  if(this.inAli){
                    cfu.option[cid].rotateLock = cfu.option[cid].rotate;
                  }
                  cfu.option[cid].context = uni.createCanvasContext(cid, this);
                  if(cfu.instance[cid] && cfu.option[cid] && cfu.option[cid].update === true){
                    this._updataUChart(cid)
                  }else{
                    setTimeout(()=>{
                      cfu.option[cid].context.restore();
                      cfu.option[cid].context.save();
                      this._newChart(cid)
                    },100)
                  }
                }
              })
            }
          } else {
            this.mixinDatacomLoading = false;
            this.showchart = false;
            if (this.reshow == true) {
              this.mixinDatacomErrorMessage = '布局错误：未获取到父元素宽高尺寸！canvas-id:' + cid;
            }
          }
        })
        .exec();
    },
    saveImage(){
    	uni.canvasToTempFilePath({
    	  canvasId: this.cid,
    	  success: res=>{
    	    //#ifdef H5
    			var a = document.createElement("a");
    			a.href = res.tempFilePath;
    			a.download = this.cid;
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
    	},this);
    },
    getImage(){
      if(this.type2d == false){
        uni.canvasToTempFilePath({
          canvasId: this.cid,
          success: res=>{
            this.emitMsg({name: 'getImage', params: {type:"getImage", base64: res.tempFilePath}});
          }
        },this);
      }else{
        const query = (uni.createSelectorQuery() as any).in(this)
        query
          .select('#' + this.cid)
          .fields({ node: true, size: true })
          .exec((res: any) => {
            if (res[0]) {
              const canvas = res[0].node;
              this.emitMsg({name: 'getImage', params: {type:"getImage", base64: canvas.toDataURL('image/png')}});
            }
          });
      }
    },
    // #ifndef APP-VUE || H5
    _newChart(cid: any) {
      if (this.mixinDatacomLoading == true) {
        return;
      }
      this.showchart = true;
      cfu.instance[cid] = new LingyunUiCharts(cfu.option[cid]);
      cfu.instance[cid].addEventListener('renderComplete', () => {
        this.emitMsg({name: 'complete', params: {type:"complete", complete: true, id: cid, opts: cfu.instance[cid].opts}});
        this.scheduleMpLastShot()
        cfu.instance[cid].delEventListener('renderComplete')
      });
      cfu.instance[cid].addEventListener('scrollLeft', () => {
        this.emitMsg({name: 'scrollLeft', params: {type:"scrollLeft", scrollLeft: true, id: cid, opts: cfu.instance[cid].opts}});
      });
      cfu.instance[cid].addEventListener('scrollRight', () => {
        this.emitMsg({name: 'scrollRight', params: {type:"scrollRight", scrollRight: true, id: cid, opts: cfu.instance[cid].opts}});
      });
    },
    _updataUChart(cid: any) {
      cfu.instance[cid].updateData(cfu.option[cid])
      this.scheduleMpLastShot()
    },
    _tooltipDefault(item: any, category: any, index: any, opts: any) {
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
    },
    _showTooltip(e: any) {
      let cid = this.cid
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
          formatter: (item: any, category: any, index: any, opts: any) => {
            if (typeof cfu.option[cid].tooltipFormat === 'string' && cfu.formatter[cfu.option[cid].tooltipFormat]) {
              return cfu.formatter[cfu.option[cid].tooltipFormat](item, category, index, opts);
            } else {
              return this._tooltipDefault(item, category, index, opts);
            }
          }
        });
      } else {
        cfu.instance[cid].showToolTip(e, {
          formatter: (item: any, category: any, index: any, opts: any) => {
            if (typeof cfu.option[cid].tooltipFormat === 'string' && cfu.formatter[cfu.option[cid].tooltipFormat]) {
              return cfu.formatter[cfu.option[cid].tooltipFormat](item, category, index, opts);
            } else {
              return this._tooltipDefault(item, category, index, opts);
            }
          }
        });
      }
    },
    _tap(e: any, move?: any) {
      let cid = this.cid
      let currentIndex = null;
      let legendIndex = null;
      if (this.inScrollView === true || this.inAli) {
        let chartdom = (uni.createSelectorQuery() as any)
          // #ifndef MP-ALIPAY
          .in(this)
          .select('#ChartBoxId'+cid)
          // #endif
          // #ifdef MP-ALIPAY
          .select('#'+this.cid)
          // #endif
          .boundingClientRect((data: any) => {
            e.changedTouches=[];
            if (this.inAli) {
              e.changedTouches.unshift({ x: e.detail.clientX - data.left, y: e.detail.clientY - data.top});
            }else{
              e.changedTouches.unshift({ x: e.detail.x - data.left, y: e.detail.y - data.top - this.pageScrollTop});
            }
            if(move){
              if (this.tooltipShow === true) {
                this._showTooltip(e);
              }
            }else{
              currentIndex = cfu.instance[cid].getCurrentDataIndex(e);
              legendIndex = cfu.instance[cid].getLegendDataIndex(e);
              if(this.tapLegend === true){
                cfu.instance[cid].touchLegend(e);
              }
              if (this.tooltipShow === true) {
                this._showTooltip(e);
              }
              this.emitMsg({name: 'getIndex', params: { type:"getIndex", event:{ x: e.detail.x - data.left, y: e.detail.y - data.top }, currentIndex: currentIndex, legendIndex: legendIndex, id: cid, opts: cfu.instance[cid].opts}});
            }
          })
          .exec();
      } else {
        if(move){
          if (this.tooltipShow === true) {
            this._showTooltip(e);
          }
        }else{
          e.changedTouches=[];
          e.changedTouches.unshift({ x: e.detail.x - e.currentTarget.offsetLeft, y: e.detail.y - e.currentTarget.offsetTop });
          currentIndex = cfu.instance[cid].getCurrentDataIndex(e);
          legendIndex = cfu.instance[cid].getLegendDataIndex(e);
          if(this.tapLegend === true){
            cfu.instance[cid].touchLegend(e);
          }
          if (this.tooltipShow === true) {
            this._showTooltip(e);
          }
          this.emitMsg({name: 'getIndex', params: {type:"getIndex", event:{ x: e.detail.x, y: e.detail.y - e.currentTarget.offsetTop }, currentIndex: currentIndex, legendIndex: legendIndex, id: cid, opts: cfu.instance[cid].opts}});
        }
      }
    },
    _touchStart(e: any) {
      let cid = this.cid
      lastMoveTime=Date.now();
      if(cfu.option[cid].enableScroll === true && e.touches.length == 1){
        cfu.instance[cid].scrollStart(e);
      }
      this.emitMsg({name:'getTouchStart', params:{type:"touchStart", event:e.changedTouches[0], id:cid, opts: cfu.instance[cid].opts}});
    },
    _touchMove(e: any) {
      let cid = this.cid
      let currMoveTime = Date.now();
      let duration = currMoveTime - (lastMoveTime ?? 0);
      let touchMoveLimit = cfu.option[cid].touchMoveLimit || 24;
      if (duration < Math.floor(1000 / touchMoveLimit)) return;//每秒60帧
      lastMoveTime = currMoveTime;
      if(cfu.option[cid].enableScroll === true && e.changedTouches.length == 1){
        cfu.instance[cid].scroll(e);
      }
      if(this.ontap === true && cfu.option[cid].enableScroll === false && this.onmovetip === true){
        this._tap(e,true)
      }
      if(this.ontouch === true && cfu.option[cid].enableScroll === true && this.onzoom === true && e.changedTouches.length == 2){
        cfu.instance[cid].dobuleZoom(e);
      }
      this.emitMsg({name: 'getTouchMove', params: {type:"touchMove", event:e.changedTouches[0], id: cid, opts: cfu.instance[cid].opts}});
    },
    _touchEnd(e: any) {
      let cid = this.cid
      if(cfu.option[cid].enableScroll === true && e.touches.length == 0){
        cfu.instance[cid].scrollEnd(e);
      }
      this.emitMsg({name:'getTouchEnd', params:{type:"touchEnd", event:e.changedTouches[0], id:cid, opts: cfu.instance[cid].opts}});
      if(this.ontap === true && cfu.option[cid].enableScroll === false && this.onmovetip === true){
        this._tap(e,true)
      }
    },
    // #endif
    _error(e: any) {
      this.mixinDatacomErrorMessage = e.detail.errMsg;
    },
    emitMsg(msg: any) {
      this.$emit(msg.name, msg.params);
    },
    toJSON(){
      return this
    }
  }
})
</script>

<!-- #ifdef APP-VUE || H5 -->
<script module="rdcharts" lang="renderjs">
import LingyunUiChartsRD from './lingyun-ui-charts';
import { cfu } from './config';

var that = {};
var rootdom = null;

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
      rid:null
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
  },
  destroyed(){
    delete cfu.option[this.rid]
    delete cfu.instance[this.rid]
  },
  methods: {
    //==============以下是图表引擎的方法====================
    ucinit(newVal, oldVal, owner, instance){
      if(JSON.stringify(newVal) == JSON.stringify(oldVal)){
        return;
      }
      if(!newVal.canvasId){
        return;
      }
      let cid = JSON.parse(JSON.stringify(newVal.canvasId))
      this.rid = cid
      that[cid] = this.$ownerInstance || instance
      cfu.option[cid] = JSON.parse(JSON.stringify(newVal))
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
