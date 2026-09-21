<template>
  <view
    class="lingyun-list-item"
    :class="rootClass"
    :hover-class="hoverClass"
    :hover-start-time="0"
    :hover-stay-time="70"
    @click="onClick"
  >
    <!-- 真机/小程序不用 :last-child::after：用顶部分割线（非首行），对齐 uni-list -->
    <!-- 滑动藏线用 class，勿 v-if 反复挂卸载（iOS 易残留错线） -->
    <view
      v-if="!isFirstChild"
      class="lingyun-list-item__divider"
      :class="[dividerLeadingClass, { 'lingyun-list-item__divider--hidden': dividerHiddenBySwipe }]"
    />
    <view class="lingyun-list-item__row">
      <view v-if="showLeading" class="lingyun-list-item__leading" :class="leadingSizeClass">
        <slot name="icon">
          <image
            v-if="thumb"
            class="lingyun-list-item__thumb"
            :src="thumb"
            mode="aspectFill"
          />
        </slot>
      </view>

      <view v-if="!isSlider" class="lingyun-list-item__body">
        <slot>
          <text v-if="title" class="lingyun-list-item__title">{{ title }}</text>
          <text v-if="resolvedNote" class="lingyun-list-item__note">{{ resolvedNote }}</text>
        </slot>
      </view>

      <view v-if="isSlider" class="lingyun-list-item__slider-wrap" @click.stop>
        <lingyun-slider
          flush
          min-glyph="☼"
          max-glyph="☀"
          :model-value="innerSliderValue"
          :min="sliderMin"
          :max="sliderMax"
          :step="sliderStep"
          :disabled="disabled"
          @changing="onSliderChanging"
          @change="onSliderChange"
        />
      </view>

      <!-- disclosure / detail / #extra：不 stop，点箭头也要触发行跳转；stepper / toggle 各自 stop -->
      <view v-if="showTrailing" class="lingyun-list-item__extra">
        <slot name="extra">
          <text v-if="detail" class="lingyun-list-item__detail">{{ detail }}</text>
          <lingyun-icon
            v-if="resolvedAccessory === 'disclosure'"
            class="lingyun-list-item__chevron"
            type="right"
            :size="18"
            color="var(--lingyun-system-gray3, #c7c7cc)"
          />
          <text v-if="resolvedAccessory === 'popup'" class="lingyun-list-item__popup">{{ popupLabel }}</text>
          <view v-if="resolvedAccessory === 'stepper'" class="lingyun-list-item__stepper" @click.stop>
            <view
              class="lingyun-list-item__step"
              :class="{ 'lingyun-list-item__step--disabled': stepperAtMin }"
              hover-class="lingyun-list-item__step--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              @click.stop="onStep(-1)"
            >
              <text class="lingyun-list-item__step-mark">−</text>
            </view>
            <view class="lingyun-list-item__step-div" />
            <view
              class="lingyun-list-item__step"
              :class="{ 'lingyun-list-item__step--disabled': stepperAtMax }"
              hover-class="lingyun-list-item__step--hover"
              :hover-start-time="20"
              :hover-stay-time="70"
              @click.stop="onStep(1)"
            >
              <text class="lingyun-list-item__step-mark">+</text>
            </view>
          </view>
          <view v-if="resolvedAccessory === 'toggle'" class="lingyun-list-item__toggle" @click.stop>
            <switch
              :checked="!!switchChecked"
              :disabled="disabled"
              :color="switchColor"
              @change="onSwitchChange"
            />
          </view>
        </slot>
      </view>
    </view>
  </view>
</template>

<script>
import { useThemeStore } from '@/stores/theme'

/**
 * lingyun-list-item
 * @description 对齐 Apple iOS 27 UI Kit Lists 行（Sketch Grouped）+ HIG。内容层标准材质。
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/085FCFF1-16ED-4956-8035-009960D451C1#Inspect
 * @see https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/3B6E0BA0-E073-4B74-988A-B36E8EF2F5FE#Inspect
 * @see design/LISTS.md
 *
 * @property {String} title 主文 Title（Body 17/22）
 * @property {String} detail 右侧 Detail（Secondary Label）
 * @property {String} note 下方 Subtitle；与 Sketch Lists/Light/Rows/Large 的 Subtitle 对应
 * @property {String} subtitle note 的别名（Sketch 命名）
 * @property {String} thumb 左侧缩略图；有值时作为 #icon 默认内容
 * @property {String} thumbSize = [auto|base|lg] 左侧图规格；默认 auto：有 Subtitle 用 lg 42×42，否则 base 30×30
 * @property {String} accessory = [none|disclosure|popup|stepper|toggle|slider]
 * @property {String} role = [default|destructive]
 * @property {Boolean} clickable
 * @property {Boolean} disabled
 * @property {Boolean} switchChecked
 * @property {Number} stepperValue / stepperMin / stepperMax / stepperStep
 * @property {Number} sliderValue / sliderMin / sliderMax / sliderStep
 * @event {Function} click / switchChange / stepperChange / sliderChange
 */
export default {
  name: 'LingyunListItem',
  emits: ['click', 'switchChange', 'update:switchChecked', 'stepperChange', 'update:stepperValue', 'sliderChange', 'update:sliderValue'],
  inject: {
    lingyunList: {
      default: null,
    },
    /** 是否嵌在 lingyun-swipe-action-item 内（常量，非手势状态） */
    lingyunSwipeHost: {
      default: false,
    },
    /** 滑动表面状态：hideDivider / hideDividerFromPrev 为 true 时藏顶部分割线 */
    lingyunSwipeSurface: {
      default: null,
    },
  },
  props: {
    title: { type: String, default: '' },
    detail: { type: String, default: '' },
    note: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    thumb: { type: String, default: '' },
    thumbSize: { type: String, default: 'auto' },
    accessory: { type: String, default: 'none' },
    role: { type: String, default: 'default' },
    clickable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    switchChecked: { type: Boolean, default: false },
    stepperValue: { type: Number, default: 0 },
    stepperMin: { type: Number, default: 0 },
    stepperMax: { type: Number, default: 10 },
    stepperStep: { type: Number, default: 1 },
    sliderValue: { type: Number, default: 50 },
    sliderMin: { type: Number, default: 0 },
    sliderMax: { type: Number, default: 100 },
    sliderStep: { type: Number, default: 1 },
    popupLabel: { type: String, default: 'Pop-up button' },
  },
  data() {
    return {
      isFirstChild: false,
      sliderDragging: false,
      innerSliderValue: 50,
    }
  },
  watch: {
    sliderValue: {
      immediate: true,
      handler(v) {
        if (this.sliderDragging) return
        const next = Number(v)
        if (!Number.isFinite(next)) return
        if (next === this.innerSliderValue) return
        this.innerSliderValue = next
      },
    },
  },
  created() {
    const list = this.lingyunList
    if (!list) {
      /* 独立使用：默认画顶部分割线，避免单行误伤可用 showDivider=false 语义——无父级时不画 */
      this.isFirstChild = true
      return
    }
    if (!list.firstChildAppend) {
      list.firstChildAppend = true
      this.isFirstChild = true
    }
  },
  computed: {
    /** 本行在滑 / 上一行在滑（借走本行顶线当对方底边） */
    dividerHiddenBySwipe() {
      const s = this.lingyunSwipeSurface
      if (!s) return false
      return !!(s.hideDivider || s.hideDividerFromPrev)
    },
    isDestructive() {
      return this.role === 'destructive'
    },
    resolvedAccessory() {
      const allowed = ['none', 'disclosure', 'popup', 'stepper', 'toggle', 'slider']
      return allowed.includes(this.accessory) ? this.accessory : 'none'
    },
    isSlider() {
      return this.resolvedAccessory === 'slider'
    },
    resolvedNote() {
      return this.note || this.subtitle
    },
    showLeading() {
      return !!(this.thumb || this.$slots.icon)
    },
    resolvedThumbSize() {
      if (this.thumbSize === 'lg' || this.thumbSize === 'base') {
        return this.thumbSize
      }
      /* auto：有 Subtitle（note/subtitle）→ 大图 42；否则小图 30 */
      return this.resolvedNote ? 'lg' : 'base'
    },
    leadingSizeClass() {
      return this.resolvedThumbSize === 'lg'
        ? 'lingyun-list-item__leading--lg'
        : 'lingyun-list-item__leading--base'
    },
    dividerLeadingClass() {
      if (!this.showLeading) return ''
      return this.resolvedThumbSize === 'lg'
        ? 'lingyun-list-item__divider--leading-lg'
        : 'lingyun-list-item__divider--leading'
    },
    showTrailing() {
      if (this.isSlider || this.isDestructive) return false
      if (this.$slots.extra) return true
      if (this.detail) return true
      return ['disclosure', 'popup', 'stepper', 'toggle'].includes(this.resolvedAccessory)
    },
    isInteractive() {
      if (this.disabled) return false
      if (this.isDestructive) return true
      if (this.clickable) return true
      return this.resolvedAccessory === 'disclosure' || this.resolvedAccessory === 'popup'
    },
    hoverClass() {
      /* 滑动行不做按压高亮：微信横向拖动不取消 hover，松手时灰底消失会被看成胶囊闪烁 */
      if (this.lingyunSwipeHost) return ''
      return this.isInteractive ? 'lingyun-list-item--hover' : ''
    },
    themeClass() {
      try {
        return useThemeStore().rootClass || 'theme-light'
      } catch {
        return 'theme-light'
      }
    },
    rootClass() {
      return [
        this.themeClass,
        this.isDestructive ? 'lingyun-list-item--destructive' : '',
        this.disabled ? 'lingyun-list-item--disabled' : '',
        this.isSlider ? 'lingyun-list-item--slider' : '',
        this.resolvedNote ? 'lingyun-list-item--tall' : '',
        this.showLeading ? 'lingyun-list-item--leading' : '',
        this.showLeading && this.resolvedThumbSize === 'lg' ? 'lingyun-list-item--leading-lg' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    stepperAtMin() {
      return this.stepperValue <= this.stepperMin
    },
    stepperAtMax() {
      return this.stepperValue >= this.stepperMax
    },
    switchColor() {
      return '#34c759'
    },
  },
  methods: {
    onClick() {
      if (!this.isInteractive) return
      this.$emit('click')
    },
    onSwitchChange(e) {
      const checked = !!(e && e.detail && e.detail.value)
      this.$emit('update:switchChecked', checked)
      this.$emit('switchChange', e.detail || { value: checked })
    },
    onStep(dir) {
      if (this.disabled) return
      const next = this.stepperValue + dir * this.stepperStep
      const clamped = Math.min(this.stepperMax, Math.max(this.stepperMin, next))
      if (clamped === this.stepperValue) return
      this.$emit('update:stepperValue', clamped)
      this.$emit('stepperChange', clamped)
    },
    onSliderChanging(value) {
      const next = Number(value)
      if (!Number.isFinite(next)) return
      this.sliderDragging = true
      this.$emit('update:sliderValue', next)
    },
    onSliderChange(value) {
      const next = Number(value)
      if (!Number.isFinite(next)) return
      this.sliderDragging = false
      this.innerSliderValue = next
      this.$emit('update:sliderValue', next)
      this.$emit('sliderChange', next)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

/* iOS 27 kit：Regular 52pt、Tall 68pt；左右 16pt；不再用 44pt 行高 */
$ly-row-h: 52px;
$ly-row-h-tall: 68px;
$ly-row-pad-x: 16px;

.lingyun-list-item {
  position: relative;
  box-sizing: border-box;
  height: $ly-row-h;
  background-color: transparent;
  transition: background-color 0.15s ease-out;

  &--hover {
    background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
    transition: background-color 0s;
  }

  &--disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  &--destructive {
    height: $ly-row-h;
  }

  &--tall {
    height: $ly-row-h-tall;
  }

  &--destructive &__title {
    width: 100%;
    text-align: center;
    color: var(--lingyun-error, #{$lingyun-error});
  }

  &__divider {
    position: absolute;
    left: $ly-row-pad-x;
    right: 0;
    top: 0;
    z-index: 1;
    height: 1px;
    transform: scaleY(0.5);
    transform-origin: 0 0;
    background-color: var(--lingyun-separator, #{$lingyun-separator});
    pointer-events: none;
  }

  /* 滑动藏线：保留节点，只藏视觉，避免 iOS v-if 挂卸载残留 */
  &__divider--hidden {
    opacity: 0;
  }

  /* pad 16 + icon 30 + gap 16 */
  &__divider--leading {
    left: 62px;
  }

  /* pad 16 + icon 42 + gap 16 */
  &__divider--leading-lg {
    left: 74px;
  }

  &__row {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
    padding: 0 $ly-row-pad-x;
    box-sizing: border-box;
  }

  /* Sketch List Image：base 30 / lg 42（Header · Image Light） */
  &__leading {
    flex-shrink: 0;
    margin-right: 16px;
    overflow: hidden;
    box-sizing: border-box;

    &--base {
      width: 30px;
      height: 30px;
      border-radius: 7px;
    }

    &--lg {
      width: 42px;
      height: 42px;
      border-radius: 10px;
    }
  }

  &__thumb {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }

  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* Sketch Title+Subtitle Stack gap 为 0；弱端行高偏紧，略增至 2 改善可读 */
    gap: 2px;
  }

  &__title {
    font-size: 17px;
    font-weight: 400;
    /* Sketch 17/22；mp text + overflow 会裁 descender（g/y），行高略放宽 */
    line-height: 24px;
    letter-spacing: -0.43px;
    color: var(--lingyun-label, #{$lingyun-label});
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* Sketch Lists/Light/Rows/Large · Subtitle：15/18 · Secondary Label */
  &__note {
    font-size: 15px;
    font-weight: 400;
    /* 同上：弱端略放宽，避免 g/y 被裁 */
    line-height: 20px;
    letter-spacing: 0;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__extra {
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    margin-left: 8px;
    height: 100%;
  }

  &__detail {
    font-size: 15px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: -0.23px;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }

  &__chevron {
    margin-left: 6px;
    flex-shrink: 0;
  }

  &__popup {
    font-size: 15px;
    font-weight: 400;
    line-height: 20px;
    color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  }

  &__stepper {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    height: 29px;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  }

  &__step {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 29px;
  }

  &__step--hover {
    background-color: var(--lingyun-fill, #{$lingyun-fill});
  }

  &__step--disabled {
    opacity: 0.35;
  }

  &__step-mark {
    font-size: 16px;
    line-height: 1;
    color: var(--lingyun-label, #{$lingyun-label});
  }

  &__step-div {
    width: 1px;
    margin: 5px 0;
    background-color: var(--lingyun-separator, #{$lingyun-separator});
  }

  &__slider-wrap {
    flex: 1;
    min-width: 0;
  }

  :deep(uni-switch),
  :deep(.uni-switch-wrapper) {
    margin: 0;
    flex-shrink: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lingyun-list-item,
  .lingyun-list-item--hover {
    transition: none;
  }
}
</style>
