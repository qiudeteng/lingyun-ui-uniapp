<template>
  <view class="lingyun-swiper" :style="rootStyle">
    <view class="lingyun-swiper__ratio">
      <swiper
        class="lingyun-swiper__swiper"
        :current="currentSafe"
        :autoplay="autoplay"
        :interval="interval"
        :duration="duration"
        :circular="circular"
        :indicator-dots="indicator"
        :indicator-color="indicatorColor"
        :indicator-active-color="indicatorActiveColor"
        @change="onSwiperChange"
      >
        <swiper-item
          v-for="(image, index) in images"
          :key="index"
          class="lingyun-swiper__item"
        >
          <image
            class="lingyun-swiper__image"
            :src="image"
            :mode="mode"
            :lazy-load="lazyLoad"
            @click="onImageClick(index, image)"
          />
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

/**
 * lingyun-swiper
 * @description 图片轮播。基于内置 swiper，支持左右滑动、自动轮播、循环、比例与懒加载；
 * 默认不显示圆点，业务可用 #indicator 或外部缩略图作为指示器（配合 v-model:current）。
 * @see design/SWIPER.md
 *
 * @property {Array} images 图片地址数组
 * @property {Number} current 当前下标，支持 v-model:current
 * @property {Boolean} autoplay 自动轮播（默认 false）
 * @property {Number} interval 自动轮播间隔 ms（默认 4000）
 * @property {Number} duration 切换动画时长 ms（默认 300）
 * @property {Boolean} circular 循环（默认 true）
 * @property {Number} ratio 高 / 宽比例（默认 0.75，即 4:3）
 * @property {String} mode 图片裁剪模式（默认 aspectFill）
 * @property {Number} radius 圆角 px（默认 0，由外层裁切）
 * @property {Boolean} indicator 显示内置圆点（默认 false）
 * @property {String} indicatorColor 圆点颜色
 * @property {String} indicatorActiveColor 选中圆点颜色
 * @property {Boolean} lazyLoad 图片懒加载（默认 true）
 * @event update:current 当前下标变化
 * @event change 轮播切换 { current, image }
 * @event click 点击图片 { current, image }
 */
export default defineComponent({
  name: 'LingyunSwiper',
  emits: ['update:current', 'change', 'click'],
  props: {
    images: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    current: {
      type: Number,
      default: 0,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    interval: {
      type: Number,
      default: 4000,
    },
    duration: {
      type: Number,
      default: 300,
    },
    circular: {
      type: Boolean,
      default: true,
    },
    /** 高 / 宽比例；0.75 = 4:3 */
    ratio: {
      type: Number,
      default: 0.75,
    },
    mode: {
      type: String,
      default: 'aspectFill',
    },
    radius: {
      type: Number,
      default: 0,
    },
    indicator: {
      type: Boolean,
      default: false,
    },
    indicatorColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.4)',
    },
    indicatorActiveColor: {
      type: String,
      default: '#ffffff',
    },
    lazyLoad: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    rootStyle(): Record<string, string> {
      const ratio = Number(this.ratio)
      const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 0.75
      return {
        '--ly-swiper-ratio': `${safeRatio * 100}%`,
        '--ly-swiper-radius': `${Math.max(0, Number(this.radius) || 0)}px`,
      }
    },
    imageCount(): number {
      return Array.isArray(this.images) ? this.images.length : 0
    },
    currentSafe(): number {
      const count = this.imageCount
      if (count <= 0) return 0
      const current = Math.floor(Number(this.current) || 0)
      return Math.max(0, Math.min(count - 1, current))
    },
  },
  methods: {
    onSwiperChange(event: { detail?: { current?: number } }): void {
      const current = Math.floor(Number(event && event.detail && event.detail.current) || 0)
      const safe = Math.max(0, Math.min(Math.max(0, this.imageCount - 1), current))
      this.$emit('update:current', safe)
      this.$emit('change', {
        current: safe,
        image: this.images[safe] || '',
      })
    },
    onImageClick(index: number, image: string): void {
      this.$emit('click', { current: index, image })
    },
  },
})
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-swiper {
  width: 100%;
}

.lingyun-swiper__ratio {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: var(--ly-swiper-ratio, 75%);
  overflow: hidden;
  border-radius: var(--ly-swiper-radius, 0);
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-swiper__swiper {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.lingyun-swiper__item {
  width: 100%;
  height: 100%;
}

.lingyun-swiper__image {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
