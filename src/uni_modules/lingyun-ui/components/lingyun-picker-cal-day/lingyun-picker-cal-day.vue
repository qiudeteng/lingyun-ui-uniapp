<template>
  <view class="lingyun-picker-cal__day-stack" :class="stackClass">
    <text v-if="badgeText" class="lingyun-picker-cal__corner">{{ badgeText }}</text>
    <view class="lingyun-picker-cal__core" :class="coreClass">
      <text class="lingyun-picker-cal__day-text">{{ day }}</text>
      <text v-if="lunar" class="lingyun-picker-cal__lunar">{{ lunar }}</text>
    </view>
    <view
      v-if="dotTone"
      class="lingyun-picker-cal__dot"
      :class="'lingyun-picker-cal__dot--' + dotTone"
      aria-hidden="true"
    />
  </view>
</template>

<script>
export default {
  name: 'LingyunPickerCalDay',
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
  props: {
    day: { type: [Number, String], required: true },
    /** 右上角小字，如「班」「休」 */
    badgeText: { type: String, default: '' },
    /** 数字下方农历 */
    lunar: { type: String, default: '' },
    /** 底部圆点色：red | orange | green；空则不显示 */
    dotTone: { type: String, default: '' },
    selected: { type: Boolean, default: false },
    today: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    /** 相邻月补位日：灰显且不可点，仅用于衔接周 / 区间高亮 */
    outside: { type: Boolean, default: false },
    compact: { type: Boolean, default: false },
    /** label（Sketch 默认）| red（农历/标记态） */
    selectTone: { type: String, default: 'label' },
  },
  computed: {
    stackClass() {
      return {
        'lingyun-picker-cal__day-stack--compact': this.compact,
        'lingyun-picker-cal__day-stack--selected': this.selected,
        'lingyun-picker-cal__day-stack--today': this.today && !this.selected,
        'lingyun-picker-cal__day-stack--disabled': this.disabled,
        'lingyun-picker-cal__day-stack--outside': this.outside,
        'lingyun-picker-cal__day-stack--has-dot': !!this.dotTone,
      }
    },
    coreClass() {
      return {
        'lingyun-picker-cal__core--selected': this.selected,
        'lingyun-picker-cal__core--selected-red': this.selected && this.selectTone === 'red',
        'lingyun-picker-cal__core--today': this.today && !this.selected,
      }
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';

.lingyun-picker-cal__day-stack {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  position: relative;
  border: none;
  border-bottom: none;
}

.lingyun-picker-cal__corner {
  position: absolute;
  top: 1px;
  right: 2px;
  z-index: 1;
  font-size: 9px;
  line-height: 11px;
  font-weight: 500;
  color: var(--lingyun-system-orange, #{$lingyun-system-orange});
  pointer-events: none;
}

.lingyun-picker-cal__core {
  min-width: 40px;
  min-height: 40px;
  padding: 2px 4px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  position: relative;
  flex-shrink: 0;
}

.lingyun-picker-cal__day-stack--compact .lingyun-picker-cal__core {
  min-width: 36px;
  min-height: 36px;
  padding: 1px 3px;
  border-radius: 18px;
}

.lingyun-picker-cal__day-text {
  font-size: 20px;
  line-height: 22px;
  text-align: center;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-picker-cal__day-stack--compact .lingyun-picker-cal__day-text {
  font-size: 17px;
  line-height: 19px;
}

.lingyun-picker-cal__lunar {
  max-width: 40px;
  margin-top: 0;
  font-size: 9px;
  line-height: 11px;
  text-align: center;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lingyun-picker-cal__dot {
  width: 5px;
  height: 5px;
  margin-top: 2px;
  border-radius: 2.5px;
  flex-shrink: 0;
  background-color: var(--lingyun-system-red, #{$lingyun-system-red});
}

.lingyun-picker-cal__dot--red {
  background-color: var(--lingyun-system-red, #{$lingyun-system-red});
}

.lingyun-picker-cal__dot--orange {
  background-color: var(--lingyun-system-orange, #{$lingyun-system-orange});
}

.lingyun-picker-cal__dot--green {
  background-color: var(--lingyun-system-green, #{$lingyun-system-green});
}

.lingyun-picker-cal__core--today {
  background-color: var(--lingyun-primary-soft, #{rgba($lingyun-system-blue, 0.14)});
}

.lingyun-picker-cal__core--today .lingyun-picker-cal__day-text {
  color: var(--lingyun-primary, #{$lingyun-system-blue});
  font-weight: 600;
}

.lingyun-picker-cal__core--today .lingyun-picker-cal__lunar {
  color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-picker-cal__core--selected {
  background-color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-picker-cal__core--selected-red {
  background-color: var(--lingyun-system-red, #{$lingyun-system-red});
}

.lingyun-picker-cal__core--selected .lingyun-picker-cal__day-text,
.lingyun-picker-cal__core--selected .lingyun-picker-cal__lunar {
  /* 反色：浅色模式白字 / 暗黑模式深字（选中底为 Label） */
  color: var(--lingyun-bg-primary, #{$lingyun-bg-primary});
  font-weight: 600;
}

.lingyun-picker-cal__core--selected-red .lingyun-picker-cal__day-text,
.lingyun-picker-cal__core--selected-red .lingyun-picker-cal__lunar {
  color: #ffffff;
}

.lingyun-picker-cal__day-stack--disabled .lingyun-picker-cal__day-text,
.lingyun-picker-cal__day-stack--disabled .lingyun-picker-cal__lunar,
.lingyun-picker-cal__day-stack--disabled .lingyun-picker-cal__corner {
  color: var(--lingyun-label-quaternary, #{$lingyun-label-quaternary});
}

/* 相邻月补位日：比 disabled 稍重，认得出是日期但明显不是本月 */
.lingyun-picker-cal__day-stack--outside .lingyun-picker-cal__day-text,
.lingyun-picker-cal__day-stack--outside .lingyun-picker-cal__lunar,
.lingyun-picker-cal__day-stack--outside .lingyun-picker-cal__corner {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

/* 补位日即使落在选中日 / 今天，也不画实心圈 / 蓝底，避免像可点 */
.lingyun-picker-cal__day-stack--outside .lingyun-picker-cal__core {
  background-color: transparent;
}

.lingyun-picker-cal__day-stack--outside .lingyun-picker-cal__core .lingyun-picker-cal__day-text,
.lingyun-picker-cal__day-stack--outside .lingyun-picker-cal__core .lingyun-picker-cal__lunar {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
  font-weight: 400;
}

.lingyun-picker-cal__day-stack--disabled .lingyun-picker-cal__dot {
  opacity: 0.35;
}
</style>
