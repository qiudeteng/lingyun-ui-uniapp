<template>
  <view class="lingyun-picker" :class="rootClass">
    <view
      class="lingyun-picker__row"
      :class="rowClass"
      @click="open"
    >
      <text v-if="showTriggerTitle" class="lingyun-picker__title">{{ title }}</text>
      <view class="lingyun-picker__value-wrap">
        <text
          class="lingyun-picker__value"
          :class="valueClass"
        >
          {{ displayText || placeholder }}
        </text>
        <lingyun-icon
          v-if="!useCompactTrigger"
          class="lingyun-picker__chevron"
          type="right"
          :size="14"
          color="var(--lingyun-system-gray3, #c7c7cc)"
        />
      </view>
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <root-portal>
      <view
        v-if="sheetMounted"
        class="lingyun-picker-sheet"
        :class="sheetClass"
        :style="sheetRootStyle"
      >
        <view
          class="lingyun-picker-sheet__overlay"
          @click="onCancel"
          @touchmove.stop.prevent
        />
        <view
          class="lingyun-picker-sheet__panel"
          :style="panelStyle"
          role="dialog"
          :aria-modal="'true'"
          @touchmove.stop="onPanelTouchMove"
        >
          <view
            class="lingyun-picker-sheet__chrome"
            @touchstart.passive="onChromeTouchStart"
            @touchmove.stop.prevent="onChromeTouchMove"
            @touchend="onChromeTouchEnd"
            @touchcancel="onChromeTouchEnd"
          >
            <view class="lingyun-picker-sheet__grabber" aria-hidden="true" />
            <view class="lingyun-picker-sheet__toolbar">
              <text class="lingyun-picker-sheet__btn lingyun-picker-sheet__btn--cancel" @click="onCancel">
                {{ cancelText }}
              </text>
              <text v-if="title" class="lingyun-picker-sheet__heading">{{ title }}</text>
              <view v-else class="lingyun-picker-sheet__heading-spacer" />
              <text class="lingyun-picker-sheet__btn lingyun-picker-sheet__btn--done" @click="onConfirm">
                {{ confirmText }}
              </text>
            </view>
          </view>

          <view v-if="useCalendar" class="lingyun-picker-cal" :class="calExtraClass">
            <view
              class="lingyun-picker-cal__swipe"
              @touchstart.passive="onCalTouchStart"
              @touchmove.passive="onCalTouchMove"
              @touchend="onCalTouchEnd"
              @touchcancel="onCalTouchEnd"
            >
              <!-- 日视图 -->
              <template v-if="calMode === 'day'">
                <view class="lingyun-picker-cal__header">
                  <view class="lingyun-picker-cal__title-btn" @click="openMonthView">
                    <text class="lingyun-picker-cal__month">{{ calendarTitle }}</text>
                    <view class="lingyun-picker-cal__disclosure">
                      <lingyun-icon type="bottom" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                  </view>
                  <view class="lingyun-picker-cal__arrows">
                    <view
                      class="lingyun-picker-cal__arrow"
                      :class="{ 'lingyun-picker-cal__arrow--disabled': !canPrevMonth }"
                      @click="shiftMonth(-1)"
                    >
                      <lingyun-icon type="left" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                    <view
                      class="lingyun-picker-cal__arrow"
                      :class="{ 'lingyun-picker-cal__arrow--disabled': !canNextMonth }"
                      @click="shiftMonth(1)"
                    >
                      <lingyun-icon type="right" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                  </view>
                </view>
                <text v-if="isRangeSelect" class="lingyun-picker-cal__range-hint">{{ rangeHintText }}</text>
                <view class="lingyun-picker-cal__body">
                <view class="lingyun-picker-cal__week">
                  <text
                    v-for="w in weekLabels"
                    :key="w"
                    class="lingyun-picker-cal__weekday"
                  >{{ w }}</text>
                </view>
                <view class="lingyun-picker-cal__viewport">
                  <view
                    class="lingyun-picker-cal__track"
                    :class="calTrackClass"
                    :style="calTrackStyle"
                  >
                    <template v-if="calOutCells && calSlideDir < 0">
                      <view class="lingyun-picker-cal__pane">
                        <view
                          v-for="(cell, i) in calendarCells"
                          :key="`in-${i}`"
                          class="lingyun-picker-cal__cell"
                          :class="cellClass(cell)"
                          @click="onSelectDay(cell)"
                        >
                          <lingyun-picker-cal-day
                            v-if="cell"
                            v-bind="dayDecor(cell)"
                          />
                        </view>
                      </view>
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--out">
                        <view
                          v-for="(cell, i) in calOutCells"
                          :key="`out-${i}`"
                          class="lingyun-picker-cal__cell"
                          :class="cellClass(cell)"
                        >
                          <lingyun-picker-cal-day
                            v-if="cell"
                            v-bind="dayDecor(cell)"
                          />
                        </view>
                      </view>
                    </template>
                    <template v-else-if="calOutCells">
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--out">
                        <view
                          v-for="(cell, i) in calOutCells"
                          :key="`out-${i}`"
                          class="lingyun-picker-cal__cell"
                          :class="cellClass(cell)"
                        >
                          <lingyun-picker-cal-day
                            v-if="cell"
                            v-bind="dayDecor(cell)"
                          />
                        </view>
                      </view>
                      <view class="lingyun-picker-cal__pane">
                        <view
                          v-for="(cell, i) in calendarCells"
                          :key="`in-${i}`"
                          class="lingyun-picker-cal__cell"
                          :class="cellClass(cell)"
                          @click="onSelectDay(cell)"
                        >
                          <lingyun-picker-cal-day
                            v-if="cell"
                            v-bind="dayDecor(cell)"
                          />
                        </view>
                      </view>
                    </template>
                    <view v-else class="lingyun-picker-cal__pane">
                      <view
                        v-for="(cell, i) in calendarCells"
                        :key="i"
                        class="lingyun-picker-cal__cell"
                        :class="cellClass(cell)"
                        @click="onSelectDay(cell)"
                      >
                          <lingyun-picker-cal-day
                            v-if="cell"
                            v-bind="dayDecor(cell)"
                          />
                      </view>
                    </view>
                  </view>
                </view>
                </view>
              </template>

              <!-- 月份视图 -->
              <template v-else-if="calMode === 'month'">
                <view class="lingyun-picker-cal__header">
                  <view class="lingyun-picker-cal__title-btn" @click="openYearView">
                    <text class="lingyun-picker-cal__month">{{ viewYear }}年</text>
                    <view class="lingyun-picker-cal__disclosure">
                      <lingyun-icon type="bottom" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                  </view>
                  <view class="lingyun-picker-cal__arrows">
                    <view
                      class="lingyun-picker-cal__arrow"
                      :class="{ 'lingyun-picker-cal__arrow--disabled': !canPrevYear }"
                      @click="shiftYear(-1)"
                    >
                      <lingyun-icon type="left" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                    <view
                      class="lingyun-picker-cal__arrow"
                      :class="{ 'lingyun-picker-cal__arrow--disabled': !canNextYear }"
                      @click="shiftYear(1)"
                    >
                      <lingyun-icon type="right" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                  </view>
                </view>
                <view class="lingyun-picker-cal__body">
                <view class="lingyun-picker-cal__viewport lingyun-picker-cal__viewport--months">
                  <view
                    class="lingyun-picker-cal__track"
                    :class="yearTrackClass"
                    :style="yearTrackStyle"
                  >
                    <template v-if="calOutYear != null && calSlideDir < 0">
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months">
                        <view
                          v-for="m in monthItems"
                          :key="`in-m-${m}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="monthCellClass(m, viewYear)"
                          @click="onSelectMonth(m)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ monthLabel(m) }}</text>
                        </view>
                      </view>
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months lingyun-picker-cal__pane--out">
                        <view
                          v-for="m in monthItems"
                          :key="`out-m-${m}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="monthCellClass(m, calOutYear)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ monthLabel(m) }}</text>
                        </view>
                      </view>
                    </template>
                    <template v-else-if="calOutYear != null">
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months lingyun-picker-cal__pane--out">
                        <view
                          v-for="m in monthItems"
                          :key="`out-m-${m}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="monthCellClass(m, calOutYear)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ monthLabel(m) }}</text>
                        </view>
                      </view>
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months">
                        <view
                          v-for="m in monthItems"
                          :key="`in-m-${m}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="monthCellClass(m, viewYear)"
                          @click="onSelectMonth(m)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ monthLabel(m) }}</text>
                        </view>
                      </view>
                    </template>
                    <view v-else class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months">
                      <view
                        v-for="m in monthItems"
                        :key="`m-${m}`"
                        class="lingyun-picker-cal__month-cell"
                        :class="monthCellClass(m, viewYear)"
                        @click="onSelectMonth(m)"
                      >
                        <text class="lingyun-picker-cal__month-text">{{ monthLabel(m) }}</text>
                      </view>
                    </view>
                  </view>
                </view>
                </view>
              </template>

              <!-- 年份视图 · 3×4 年格；左右滑 / 双箭头翻页（12 年） -->
              <template v-else>
                <view class="lingyun-picker-cal__header">
                  <text class="lingyun-picker-cal__month">{{ yearPageTitle }}</text>
                  <view class="lingyun-picker-cal__arrows">
                    <view
                      class="lingyun-picker-cal__arrow"
                      :class="{ 'lingyun-picker-cal__arrow--disabled': !canPrevDecade }"
                      @click="shiftDecade(-1)"
                    >
                      <lingyun-icon type="left" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                    <view
                      class="lingyun-picker-cal__arrow"
                      :class="{ 'lingyun-picker-cal__arrow--disabled': !canNextDecade }"
                      @click="shiftDecade(1)"
                    >
                      <lingyun-icon type="right" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                  </view>
                </view>
                <view class="lingyun-picker-cal__body">
                <view class="lingyun-picker-cal__viewport lingyun-picker-cal__viewport--months">
                  <view
                    class="lingyun-picker-cal__track"
                    :class="decadeTrackClass"
                    :style="decadeTrackStyle"
                  >
                    <template v-if="calOutDecade != null && calSlideDir < 0">
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months">
                        <view
                          v-for="yr in yearPageItems"
                          :key="`in-y-${yr}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="yearCellClass(yr)"
                          @click="onSelectYear(yr)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ yr }}</text>
                        </view>
                      </view>
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months lingyun-picker-cal__pane--out">
                        <view
                          v-for="yr in yearPageItemsAt(calOutDecade)"
                          :key="`out-y-${yr}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="yearCellClass(yr)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ yr }}</text>
                        </view>
                      </view>
                    </template>
                    <template v-else-if="calOutDecade != null">
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months lingyun-picker-cal__pane--out">
                        <view
                          v-for="yr in yearPageItemsAt(calOutDecade)"
                          :key="`out-y-${yr}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="yearCellClass(yr)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ yr }}</text>
                        </view>
                      </view>
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months">
                        <view
                          v-for="yr in yearPageItems"
                          :key="`in-y-${yr}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="yearCellClass(yr)"
                          @click="onSelectYear(yr)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ yr }}</text>
                        </view>
                      </view>
                    </template>
                    <view v-else class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months">
                      <view
                        v-for="yr in yearPageItems"
                        :key="`y-${yr}`"
                        class="lingyun-picker-cal__month-cell"
                        :class="yearCellClass(yr)"
                        @click="onSelectYear(yr)"
                      >
                        <text class="lingyun-picker-cal__month-text">{{ yr }}</text>
                      </view>
                    </view>
                  </view>
                </view>
                </view>
              </template>
            </view>

            <view v-if="modeKey === 'datetime'" class="lingyun-picker-cal__time-row">
              <text class="lingyun-picker-cal__time-label">时间</text>
              <view class="lingyun-picker-cal__time-controls">
                <view
                  class="lingyun-picker-cal__time-pill"
                  :class="{ 'lingyun-picker-cal__time-pill--active': timeEditing }"
                  @click="toggleTimeEditing"
                >
                  <text class="lingyun-picker-cal__time-pill-text">{{ draftTimeLabel }}</text>
                </view>
                <view v-if="hour12" class="lingyun-picker-cal__ampm">
                  <view
                    class="lingyun-picker-cal__ampm-item"
                    :class="{ 'lingyun-picker-cal__ampm-item--active': !draftIsPm }"
                    @click="setAmPm(false)"
                  >
                    <text class="lingyun-picker-cal__ampm-text">AM</text>
                  </view>
                  <view
                    class="lingyun-picker-cal__ampm-item"
                    :class="{ 'lingyun-picker-cal__ampm-item--active': draftIsPm }"
                    @click="setAmPm(true)"
                  >
                    <text class="lingyun-picker-cal__ampm-text">PM</text>
                  </view>
                </view>
              </view>
            </view>

            <view
              v-if="modeKey === 'datetime' && timeEditing"
              class="lingyun-picker-sheet__wheels-wrap"
            >
              <view
                class="lingyun-picker-sheet__indicator-pill"
                :style="indicatorPillStyle"
                aria-hidden="true"
              />
              <picker-view
                class="lingyun-picker-sheet__view lingyun-picker-sheet__view--time"
                :value="timeDraftIndexes"
                :indicator-style="indicatorStyle"
                :indicator-class="indicatorClass"
                :mask-class="maskClass"
                immediate-change
                @change="onTimePickChange"
              >
                <picker-view-column>
                  <view
                    v-for="(item, rowIndex) in timeHourColumn"
                    :key="`h-${rowIndex}`"
                    class="lingyun-picker-sheet__item"
                  >
                    <text class="lingyun-picker-sheet__item-text">{{ item.label }}</text>
                  </view>
                </picker-view-column>
                <picker-view-column>
                  <view
                    v-for="(item, rowIndex) in timeMinuteColumn"
                    :key="`m-${rowIndex}`"
                    class="lingyun-picker-sheet__item"
                  >
                    <text class="lingyun-picker-sheet__item-text">{{ item.label }}</text>
                  </view>
                </picker-view-column>
              </picker-view>
            </view>
          </view>

          <view v-else class="lingyun-picker-wheels">
            <view v-if="modeKey === 'time' && hour12" class="lingyun-picker-cal__time-row lingyun-picker-cal__time-row--wheels">
              <text class="lingyun-picker-cal__time-label">时段</text>
              <view class="lingyun-picker-cal__ampm">
                <view
                  class="lingyun-picker-cal__ampm-item"
                  :class="{ 'lingyun-picker-cal__ampm-item--active': !draftIsPm }"
                  @click="setAmPm(false)"
                >
                  <text class="lingyun-picker-cal__ampm-text">AM</text>
                </view>
                <view
                  class="lingyun-picker-cal__ampm-item"
                  :class="{ 'lingyun-picker-cal__ampm-item--active': draftIsPm }"
                  @click="setAmPm(true)"
                >
                  <text class="lingyun-picker-cal__ampm-text">PM</text>
                </view>
              </view>
            </view>
            <view class="lingyun-picker-sheet__wheels-wrap">
              <view
                class="lingyun-picker-sheet__indicator-pill"
                :style="indicatorPillStyle"
                aria-hidden="true"
              />
              <picker-view
                class="lingyun-picker-sheet__view"
                :value="draftIndexes"
                :indicator-style="indicatorStyle"
                :indicator-class="indicatorClass"
                :mask-class="maskClass"
                immediate-change
                @change="onPickChange"
              >
                <picker-view-column v-for="(col, colIndex) in columns" :key="colIndex">
                  <view
                    v-for="(item, rowIndex) in col"
                    :key="`${colIndex}-${rowIndex}`"
                    class="lingyun-picker-sheet__item"
                  >
                    <text class="lingyun-picker-sheet__item-text">{{ item.label }}</text>
                  </view>
                </picker-view-column>
              </picker-view>
            </view>
          </view>
        </view>
      </view>
    </root-portal>
    <!-- #endif -->

    <!-- #ifndef MP-WEIXIN -->
    <teleport to="body">
      <view
        v-if="sheetMounted"
        class="lingyun-picker-sheet"
        :class="sheetClass"
        :style="sheetRootStyle"
      >
        <view
          class="lingyun-picker-sheet__overlay"
          @click="onCancel"
          @touchmove.stop.prevent
        />
        <view
          class="lingyun-picker-sheet__panel"
          :style="panelStyle"
          role="dialog"
          :aria-modal="'true'"
          @touchmove.stop="onPanelTouchMove"
        >
          <view
            class="lingyun-picker-sheet__chrome"
            @touchstart.passive="onChromeTouchStart"
            @touchmove.stop.prevent="onChromeTouchMove"
            @touchend="onChromeTouchEnd"
            @touchcancel="onChromeTouchEnd"
          >
            <view class="lingyun-picker-sheet__grabber" aria-hidden="true" />
            <view class="lingyun-picker-sheet__toolbar">
              <text class="lingyun-picker-sheet__btn lingyun-picker-sheet__btn--cancel" @click="onCancel">
                {{ cancelText }}
              </text>
              <text v-if="title" class="lingyun-picker-sheet__heading">{{ title }}</text>
              <view v-else class="lingyun-picker-sheet__heading-spacer" />
              <text class="lingyun-picker-sheet__btn lingyun-picker-sheet__btn--done" @click="onConfirm">
                {{ confirmText }}
              </text>
            </view>
          </view>

          <view v-if="useCalendar" class="lingyun-picker-cal" :class="calExtraClass">
            <view
              class="lingyun-picker-cal__swipe"
              @touchstart.passive="onCalTouchStart"
              @touchmove.passive="onCalTouchMove"
              @touchend="onCalTouchEnd"
              @touchcancel="onCalTouchEnd"
            >
              <!-- 日视图 -->
              <template v-if="calMode === 'day'">
                <view class="lingyun-picker-cal__header">
                  <view class="lingyun-picker-cal__title-btn" @click="openMonthView">
                    <text class="lingyun-picker-cal__month">{{ calendarTitle }}</text>
                    <view class="lingyun-picker-cal__disclosure">
                      <lingyun-icon type="bottom" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                  </view>
                  <view class="lingyun-picker-cal__arrows">
                    <view
                      class="lingyun-picker-cal__arrow"
                      :class="{ 'lingyun-picker-cal__arrow--disabled': !canPrevMonth }"
                      @click="shiftMonth(-1)"
                    >
                      <lingyun-icon type="left" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                    <view
                      class="lingyun-picker-cal__arrow"
                      :class="{ 'lingyun-picker-cal__arrow--disabled': !canNextMonth }"
                      @click="shiftMonth(1)"
                    >
                      <lingyun-icon type="right" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                  </view>
                </view>
                <text v-if="isRangeSelect" class="lingyun-picker-cal__range-hint">{{ rangeHintText }}</text>
                <view class="lingyun-picker-cal__body">
                <view class="lingyun-picker-cal__week">
                  <text
                    v-for="w in weekLabels"
                    :key="w"
                    class="lingyun-picker-cal__weekday"
                  >{{ w }}</text>
                </view>
                <view class="lingyun-picker-cal__viewport">
                  <view
                    class="lingyun-picker-cal__track"
                    :class="calTrackClass"
                    :style="calTrackStyle"
                  >
                    <template v-if="calOutCells && calSlideDir < 0">
                      <view class="lingyun-picker-cal__pane">
                        <view
                          v-for="(cell, i) in calendarCells"
                          :key="`in-${i}`"
                          class="lingyun-picker-cal__cell"
                          :class="cellClass(cell)"
                          @click="onSelectDay(cell)"
                        >
                          <lingyun-picker-cal-day
                            v-if="cell"
                            v-bind="dayDecor(cell)"
                          />
                        </view>
                      </view>
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--out">
                        <view
                          v-for="(cell, i) in calOutCells"
                          :key="`out-${i}`"
                          class="lingyun-picker-cal__cell"
                          :class="cellClass(cell)"
                        >
                          <lingyun-picker-cal-day
                            v-if="cell"
                            v-bind="dayDecor(cell)"
                          />
                        </view>
                      </view>
                    </template>
                    <template v-else-if="calOutCells">
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--out">
                        <view
                          v-for="(cell, i) in calOutCells"
                          :key="`out-${i}`"
                          class="lingyun-picker-cal__cell"
                          :class="cellClass(cell)"
                        >
                          <lingyun-picker-cal-day
                            v-if="cell"
                            v-bind="dayDecor(cell)"
                          />
                        </view>
                      </view>
                      <view class="lingyun-picker-cal__pane">
                        <view
                          v-for="(cell, i) in calendarCells"
                          :key="`in-${i}`"
                          class="lingyun-picker-cal__cell"
                          :class="cellClass(cell)"
                          @click="onSelectDay(cell)"
                        >
                          <lingyun-picker-cal-day
                            v-if="cell"
                            v-bind="dayDecor(cell)"
                          />
                        </view>
                      </view>
                    </template>
                    <view v-else class="lingyun-picker-cal__pane">
                      <view
                        v-for="(cell, i) in calendarCells"
                        :key="i"
                        class="lingyun-picker-cal__cell"
                        :class="cellClass(cell)"
                        @click="onSelectDay(cell)"
                      >
                          <lingyun-picker-cal-day
                            v-if="cell"
                            v-bind="dayDecor(cell)"
                          />
                      </view>
                    </view>
                  </view>
                </view>
                </view>
              </template>

              <!-- 月份视图 -->
              <template v-else-if="calMode === 'month'">
                <view class="lingyun-picker-cal__header">
                  <view class="lingyun-picker-cal__title-btn" @click="openYearView">
                    <text class="lingyun-picker-cal__month">{{ viewYear }}年</text>
                    <view class="lingyun-picker-cal__disclosure">
                      <lingyun-icon type="bottom" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                  </view>
                  <view class="lingyun-picker-cal__arrows">
                    <view
                      class="lingyun-picker-cal__arrow"
                      :class="{ 'lingyun-picker-cal__arrow--disabled': !canPrevYear }"
                      @click="shiftYear(-1)"
                    >
                      <lingyun-icon type="left" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                    <view
                      class="lingyun-picker-cal__arrow"
                      :class="{ 'lingyun-picker-cal__arrow--disabled': !canNextYear }"
                      @click="shiftYear(1)"
                    >
                      <lingyun-icon type="right" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                  </view>
                </view>
                <view class="lingyun-picker-cal__body">
                <view class="lingyun-picker-cal__viewport lingyun-picker-cal__viewport--months">
                  <view
                    class="lingyun-picker-cal__track"
                    :class="yearTrackClass"
                    :style="yearTrackStyle"
                  >
                    <template v-if="calOutYear != null && calSlideDir < 0">
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months">
                        <view
                          v-for="m in monthItems"
                          :key="`in-m-${m}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="monthCellClass(m, viewYear)"
                          @click="onSelectMonth(m)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ monthLabel(m) }}</text>
                        </view>
                      </view>
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months lingyun-picker-cal__pane--out">
                        <view
                          v-for="m in monthItems"
                          :key="`out-m-${m}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="monthCellClass(m, calOutYear)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ monthLabel(m) }}</text>
                        </view>
                      </view>
                    </template>
                    <template v-else-if="calOutYear != null">
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months lingyun-picker-cal__pane--out">
                        <view
                          v-for="m in monthItems"
                          :key="`out-m-${m}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="monthCellClass(m, calOutYear)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ monthLabel(m) }}</text>
                        </view>
                      </view>
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months">
                        <view
                          v-for="m in monthItems"
                          :key="`in-m-${m}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="monthCellClass(m, viewYear)"
                          @click="onSelectMonth(m)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ monthLabel(m) }}</text>
                        </view>
                      </view>
                    </template>
                    <view v-else class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months">
                      <view
                        v-for="m in monthItems"
                        :key="`m-${m}`"
                        class="lingyun-picker-cal__month-cell"
                        :class="monthCellClass(m, viewYear)"
                        @click="onSelectMonth(m)"
                      >
                        <text class="lingyun-picker-cal__month-text">{{ monthLabel(m) }}</text>
                      </view>
                    </view>
                  </view>
                </view>
                </view>
              </template>

              <!-- 年份视图 · 3×4 年格；左右滑 / 双箭头翻页（12 年） -->
              <template v-else>
                <view class="lingyun-picker-cal__header">
                  <text class="lingyun-picker-cal__month">{{ yearPageTitle }}</text>
                  <view class="lingyun-picker-cal__arrows">
                    <view
                      class="lingyun-picker-cal__arrow"
                      :class="{ 'lingyun-picker-cal__arrow--disabled': !canPrevDecade }"
                      @click="shiftDecade(-1)"
                    >
                      <lingyun-icon type="left" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                    <view
                      class="lingyun-picker-cal__arrow"
                      :class="{ 'lingyun-picker-cal__arrow--disabled': !canNextDecade }"
                      @click="shiftDecade(1)"
                    >
                      <lingyun-icon type="right" :size="16" color="var(--lingyun-primary, #007aff)" />
                    </view>
                  </view>
                </view>
                <view class="lingyun-picker-cal__body">
                <view class="lingyun-picker-cal__viewport lingyun-picker-cal__viewport--months">
                  <view
                    class="lingyun-picker-cal__track"
                    :class="decadeTrackClass"
                    :style="decadeTrackStyle"
                  >
                    <template v-if="calOutDecade != null && calSlideDir < 0">
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months">
                        <view
                          v-for="yr in yearPageItems"
                          :key="`in-y-${yr}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="yearCellClass(yr)"
                          @click="onSelectYear(yr)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ yr }}</text>
                        </view>
                      </view>
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months lingyun-picker-cal__pane--out">
                        <view
                          v-for="yr in yearPageItemsAt(calOutDecade)"
                          :key="`out-y-${yr}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="yearCellClass(yr)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ yr }}</text>
                        </view>
                      </view>
                    </template>
                    <template v-else-if="calOutDecade != null">
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months lingyun-picker-cal__pane--out">
                        <view
                          v-for="yr in yearPageItemsAt(calOutDecade)"
                          :key="`out-y-${yr}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="yearCellClass(yr)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ yr }}</text>
                        </view>
                      </view>
                      <view class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months">
                        <view
                          v-for="yr in yearPageItems"
                          :key="`in-y-${yr}`"
                          class="lingyun-picker-cal__month-cell"
                          :class="yearCellClass(yr)"
                          @click="onSelectYear(yr)"
                        >
                          <text class="lingyun-picker-cal__month-text">{{ yr }}</text>
                        </view>
                      </view>
                    </template>
                    <view v-else class="lingyun-picker-cal__pane lingyun-picker-cal__pane--months">
                      <view
                        v-for="yr in yearPageItems"
                        :key="`y-${yr}`"
                        class="lingyun-picker-cal__month-cell"
                        :class="yearCellClass(yr)"
                        @click="onSelectYear(yr)"
                      >
                        <text class="lingyun-picker-cal__month-text">{{ yr }}</text>
                      </view>
                    </view>
                  </view>
                </view>
                </view>
              </template>
            </view>

            <view v-if="modeKey === 'datetime'" class="lingyun-picker-cal__time-row">
              <text class="lingyun-picker-cal__time-label">时间</text>
              <view class="lingyun-picker-cal__time-controls">
                <view
                  class="lingyun-picker-cal__time-pill"
                  :class="{ 'lingyun-picker-cal__time-pill--active': timeEditing }"
                  @click="toggleTimeEditing"
                >
                  <text class="lingyun-picker-cal__time-pill-text">{{ draftTimeLabel }}</text>
                </view>
                <view v-if="hour12" class="lingyun-picker-cal__ampm">
                  <view
                    class="lingyun-picker-cal__ampm-item"
                    :class="{ 'lingyun-picker-cal__ampm-item--active': !draftIsPm }"
                    @click="setAmPm(false)"
                  >
                    <text class="lingyun-picker-cal__ampm-text">AM</text>
                  </view>
                  <view
                    class="lingyun-picker-cal__ampm-item"
                    :class="{ 'lingyun-picker-cal__ampm-item--active': draftIsPm }"
                    @click="setAmPm(true)"
                  >
                    <text class="lingyun-picker-cal__ampm-text">PM</text>
                  </view>
                </view>
              </view>
            </view>

            <view
              v-if="modeKey === 'datetime' && timeEditing"
              class="lingyun-picker-sheet__wheels-wrap"
            >
              <view
                class="lingyun-picker-sheet__indicator-pill"
                :style="indicatorPillStyle"
                aria-hidden="true"
              />
              <picker-view
                class="lingyun-picker-sheet__view lingyun-picker-sheet__view--time"
                :value="timeDraftIndexes"
                :indicator-style="indicatorStyle"
                :indicator-class="indicatorClass"
                :mask-class="maskClass"
                immediate-change
                @change="onTimePickChange"
              >
                <picker-view-column>
                  <view
                    v-for="(item, rowIndex) in timeHourColumn"
                    :key="`h-${rowIndex}`"
                    class="lingyun-picker-sheet__item"
                  >
                    <text class="lingyun-picker-sheet__item-text">{{ item.label }}</text>
                  </view>
                </picker-view-column>
                <picker-view-column>
                  <view
                    v-for="(item, rowIndex) in timeMinuteColumn"
                    :key="`m-${rowIndex}`"
                    class="lingyun-picker-sheet__item"
                  >
                    <text class="lingyun-picker-sheet__item-text">{{ item.label }}</text>
                  </view>
                </picker-view-column>
              </picker-view>
            </view>
          </view>

          <view v-else class="lingyun-picker-wheels">
            <view v-if="modeKey === 'time' && hour12" class="lingyun-picker-cal__time-row lingyun-picker-cal__time-row--wheels">
              <text class="lingyun-picker-cal__time-label">时段</text>
              <view class="lingyun-picker-cal__ampm">
                <view
                  class="lingyun-picker-cal__ampm-item"
                  :class="{ 'lingyun-picker-cal__ampm-item--active': !draftIsPm }"
                  @click="setAmPm(false)"
                >
                  <text class="lingyun-picker-cal__ampm-text">AM</text>
                </view>
                <view
                  class="lingyun-picker-cal__ampm-item"
                  :class="{ 'lingyun-picker-cal__ampm-item--active': draftIsPm }"
                  @click="setAmPm(true)"
                >
                  <text class="lingyun-picker-cal__ampm-text">PM</text>
                </view>
              </view>
            </view>
            <view class="lingyun-picker-sheet__wheels-wrap">
              <view
                class="lingyun-picker-sheet__indicator-pill"
                :style="indicatorPillStyle"
                aria-hidden="true"
              />
              <picker-view
                class="lingyun-picker-sheet__view"
                :value="draftIndexes"
                :indicator-style="indicatorStyle"
                :indicator-class="indicatorClass"
                :mask-class="maskClass"
                immediate-change
                @change="onPickChange"
              >
                <picker-view-column v-for="(col, colIndex) in columns" :key="colIndex">
                  <view
                    v-for="(item, rowIndex) in col"
                    :key="`${colIndex}-${rowIndex}`"
                    class="lingyun-picker-sheet__item"
                  >
                    <text class="lingyun-picker-sheet__item-text">{{ item.label }}</text>
                  </view>
                </picker-view-column>
              </picker-view>
            </view>
          </view>
        </view>
      </view>
    </teleport>
    <!-- #endif -->
  </view>
</template>

<script>
import { useThemeStore } from '@/stores/theme'
import { LINGYUN_APP_PAGE_SCROLL_LOCK } from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'
import LingyunPickerCalDay from './lingyun-picker-cal-day.vue'
import { lunarDayText } from './lunar.js'

/**
 * lingyun-picker
 * selector / time：滚轮 Sheet；date / datetime：Sketch Compact 日历（+ Time 行）
 * @see design/PICKERS.md · Sketch Examples/Date and Time Picker
 */
const LEAVE_MS = 250
const ENTER_KICK_MS = 48
/** Sketch Sheets/Light/iPhone/Medium Detent：面板左右 + 底部各内缩 8，四角 34 */
const INSET_MEDIUM = 8
const RADIUS = 34
/*
 * 面板宽上限：Sketch Compact 日历 320 宽，滚轮同量级。
 * 宽屏（iPad / 桌面 H5）铺满会把日历拉散，收成居中卡片。
 */
const PANEL_MAX_WIDTH = 420
const DISMISS_DY = 72
const ITEM_H = 36
/** 月历左右滑切换月份阈值 */
const CAL_SWIPE_DX = 48
const CAL_SWIPE_RATIO = 1.2
const CAL_SLIDE_MS = 280
const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六']
const MONTH_CN = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
/** 月份视图标签（对齐 Sketch 缩写风格；中文用 1月…12月） */
const MONTH_SHORT = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const MONTH_ITEMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
/** 年份视图每页年数（3×4，对齐月份格） */
const YEAR_PAGE_SIZE = 12
/** 天视图固定 6 行 × 7 列：月份切换时面板高度不跳 */
const CAL_CELLS = 42

function pad2(n) {
  const v = Number(n) || 0
  return v < 10 ? `0${v}` : String(v)
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

/** 相邻月（delta = ±1），用于天视图补齐首尾空位 */
function shiftMonthYm(y, m, delta) {
  const idx = y * 12 + (m - 1) + delta
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 }
}

function parseYmd(str) {
  const m = String(str || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (!m) return null
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) }
}

function parseYm(str) {
  const m = String(str || '').match(/^(\d{4})-(\d{1,2})$/)
  if (!m) return null
  return { y: Number(m[1]), m: Number(m[2]), d: 1 }
}

function parseYOnly(str) {
  const m = String(str || '').match(/^(\d{4})$/)
  if (!m) return null
  return { y: Number(m[1]), m: 1, d: 1 }
}

function parseHm(str) {
  const m = String(str || '').match(/(?:^|\s)(\d{1,2}):(\d{1,2})\s*$/)
  if (!m) return null
  return { h: Number(m[1]), mi: Number(m[2]) }
}

function parseYmdHm(str) {
  const ymd = parseYmd(str)
  const hm = parseHm(str)
  if (!ymd) return null
  return {
    y: ymd.y,
    m: ymd.m,
    d: ymd.d,
    h: hm ? hm.h : 0,
    mi: hm ? hm.mi : 0,
  }
}

function ymdKey(y, m, d) {
  return `${y}-${pad2(m)}-${pad2(d)}`
}

function compareYmd(a, b) {
  if (a.y !== b.y) return a.y - b.y
  if (a.m !== b.m) return a.m - b.m
  return a.d - b.d
}

/** 解析区间：数组 [start,end] 或字符串 `YYYY-MM-DD ~ YYYY-MM-DD` */
function parseDateRange(val) {
  if (val == null || val === '') return null
  if (Array.isArray(val)) {
    const a = parseYmd(val[0])
    if (!a) return null
    const b = parseYmd(val[1] != null && val[1] !== '' ? val[1] : val[0]) || a
    return compareYmd(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a }
  }
  const str = String(val).trim()
  const parts = str.split(/\s*(?:~|～|—|–|,|→)\s*/)
  if (parts.length >= 2) {
    const a = parseYmd(parts[0])
    const b = parseYmd(parts[1])
    if (a && b) return compareYmd(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a }
  }
  const single = parseYmd(str)
  if (single) return { start: single, end: single }
  return null
}

function sameYmd(a, b) {
  if (!a || !b) return false
  return a.y === b.y && a.m === b.m && a.d === b.d
}

/** 含某日的一周起止；weekStartsOn: 0=周日 … 6=周六（对齐日历表头） */
function weekBoundsForDay(y, m, d, weekStartsOn = 0) {
  const startOn = ((Number(weekStartsOn) % 7) + 7) % 7
  const date = new Date(y, m - 1, d)
  const dow = date.getDay()
  const diff = (dow - startOn + 7) % 7
  const startDate = new Date(y, m - 1, d - diff)
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6)
  return {
    start: {
      y: startDate.getFullYear(),
      m: startDate.getMonth() + 1,
      d: startDate.getDate(),
    },
    end: {
      y: endDate.getFullYear(),
      m: endDate.getMonth() + 1,
      d: endDate.getDate(),
    },
  }
}

function formatHour12(h24) {
  const h = ((Number(h24) % 24) + 24) % 24
  const isPm = h >= 12
  let h12 = h % 12
  if (h12 === 0) h12 = 12
  return { h12, isPm }
}

function toH24(h12, isPm) {
  let h = Number(h12) || 12
  if (h === 12) h = 0
  return isPm ? h + 12 : h
}

export default {
  name: 'LingyunPicker',
  components: { LingyunPickerCalDay },
  emits: ['update:modelValue', 'update:value', 'change', 'cancel'],
  inject: {
    appPageScrollLock: {
      from: LINGYUN_APP_PAGE_SCROLL_LOCK,
      default: null,
    },
    lingyunFormItem: { default: null },
  },
  props: {
    modelValue: { type: [String, Number, Array], default: undefined },
    value: { type: [String, Number, Array], default: undefined },
    mode: { type: String, default: 'selector' },
    range: { type: Array, default: () => [] },
    rangeKey: { type: String, default: '' },
    title: { type: String, default: '' },
    placeholder: { type: String, default: '请选择' },
    disabled: { type: Boolean, default: false },
    start: { type: String, default: '' },
    end: { type: String, default: '' },
    fields: { type: String, default: 'day' },
    /** auto | calendar | wheels */
    pickerStyle: { type: String, default: 'auto' },
    hour12: { type: Boolean, default: false },
    minuteInterval: { type: [Number, String], default: 1 },
    /** 日历日格底部农历 */
    lunar: { type: Boolean, default: false },
    /**
     * 日历标记：
     * { date: 'YYYY-MM-DD', badge?: string, dot?: true|'red'|'orange'|'green' }
     * badge：右上角小字；dot：底部圆点（true/默认=红）
     */
    marks: { type: Array, default: () => [] },
    /**
     * week 模式周起始：0=周日（默认，对齐表头日一二…）… 6=周六
     */
    weekStartsOn: { type: [Number, String], default: 0 },
    cancelText: { type: String, default: '取消' },
    confirmText: { type: String, default: '完成' },
    zIndex: { type: [Number, String], default: 1200 },
    variant: { type: String, default: 'auto' },
  },
  data() {
    return {
      sheetMounted: false,
      phase: '',
      leaveTimer: null,
      enterTimer: null,
      draftIndexes: [0],
      draftY: 0,
      draftM: 1,
      draftD: 1,
      draftH: 0,
      draftMi: 0,
      /** daterange / week 草稿起止（ymd 对象） */
      draftRangeStart: null,
      draftRangeEnd: null,
      viewY: 0,
      viewM: 1,
      viewYear: 0,
      viewDecadeStart: 0,
      calMode: 'day',
      timeEditing: false,
      timeDraftIndexes: [0, 0],
      safeBottom: 0,
      windowWidth: 375,
      dragStartY: 0,
      dragDy: 0,
      dragging: false,
      calStartX: 0,
      calStartY: 0,
      calDx: 0,
      calDy: 0,
      calTracking: false,
      calSwiped: false,
      calOutCells: null,
      calOutYear: null,
      calOutDecade: null,
      calSlideDir: 0,
      calSlidePhase: 'idle',
      calAnimTimer: null,
      _appScrollLocked: false,
      _scrollLocked: false,
      _prevBodyOverflow: '',
      _prevBodyOverscroll: '',
      _prevHtmlOverscroll: '',
    }
  },
  computed: {
    modeKey() {
      if (
        this.mode === 'date' ||
        this.mode === 'time' ||
        this.mode === 'datetime' ||
        this.mode === 'daterange' ||
        this.mode === 'week'
      ) {
        return this.mode
      }
      return 'selector'
    },
    isDateRange() {
      return this.modeKey === 'daterange'
    },
    isWeek() {
      return this.modeKey === 'week'
    },
    /** 区间高亮（daterange 两点选 / week 整周） */
    isRangeSelect() {
      return this.isDateRange || this.isWeek
    },
    weekStartIndex() {
      const n = Number(this.weekStartsOn)
      if (Number.isNaN(n)) return 0
      return ((n % 7) + 7) % 7
    },
    current() {
      if (this.modelValue !== undefined && this.modelValue !== null) return this.modelValue
      return this.value
    },
    resolvedVariant() {
      const v = this.variant
      if (v === 'field' || v === 'cell') return v
      return this.lingyunFormItem ? 'cell' : 'field'
    },
    isCell() {
      return this.resolvedVariant === 'cell'
    },
    showTriggerTitle() {
      if (this.isCell) return false
      return !!this.title
    },
    useCalendar() {
      if (this.pickerStyle === 'wheels') return false
      const calModes =
        this.modeKey === 'date' ||
        this.modeKey === 'datetime' ||
        this.modeKey === 'daterange' ||
        this.modeKey === 'week'
      if (this.pickerStyle === 'calendar') return calModes
      return calModes
    },
    useCompactTrigger() {
      return (
        this.modeKey === 'date' ||
        this.modeKey === 'time' ||
        this.modeKey === 'datetime' ||
        this.modeKey === 'daterange' ||
        this.modeKey === 'week'
      )
    },
    fieldsKey() {
      if (this.modeKey !== 'date') return 'day'
      if (this.fields === 'year' || this.fields === 'month') return this.fields
      return 'day'
    },
    rangeHintText() {
      if (!this.isRangeSelect) return ''
      const s = this.draftRangeStart
      const e = this.draftRangeEnd
      if (this.isWeek) {
        if (!s || !e) return '请选择一周'
        return `${ymdKey(s.y, s.m, s.d)} → ${ymdKey(e.y, e.m, e.d)}`
      }
      if (!s) return '请选择开始日期'
      if (!e) return `开始 ${ymdKey(s.y, s.m, s.d)} · 请选择结束日期`
      return `${ymdKey(s.y, s.m, s.d)} → ${ymdKey(e.y, e.m, e.d)}`
    },
    marksMap() {
      const map = Object.create(null)
      const list = Array.isArray(this.marks) ? this.marks : []
      for (let i = 0; i < list.length; i += 1) {
        const item = list[i]
        if (!item || item.date == null || item.date === '') continue
        const key = String(item.date).slice(0, 10)
        map[key] = item
      }
      return map
    },
    calExtraClass() {
      const hasMarks = Array.isArray(this.marks) && this.marks.length > 0
      return {
        'lingyun-picker-cal--sub': !!this.lunar || hasMarks,
        'lingyun-picker-cal--range': this.isRangeSelect,
      }
    },
    minuteStep() {
      const n = Number(this.minuteInterval) || 1
      const allowed = [1, 5, 10, 15, 30]
      return allowed.includes(n) ? n : 1
    },
    rootClass() {
      return [
        this.isCell ? 'lingyun-picker--cell' : 'lingyun-picker--field',
        this.disabled ? 'lingyun-picker--disabled' : '',
      ].filter(Boolean)
    },
    rowClass() {
      return {
        'lingyun-picker__row--disabled': this.disabled,
        'lingyun-picker__row--cell': this.isCell,
      }
    },
    valueClass() {
      return {
        'lingyun-picker__value--placeholder': !this.displayText,
        'lingyun-picker__value--capsule': this.useCompactTrigger && !!this.displayText,
      }
    },
    isDark() {
      try {
        return (useThemeStore().resolved || 'light') === 'dark'
      } catch {
        return false
      }
    },
    themeClass() {
      try {
        return useThemeStore().rootClass || 'theme-light'
      } catch {
        return 'theme-light'
      }
    },
    reduceMotion() {
      try {
        if (typeof window !== 'undefined' && window.matchMedia) {
          return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        }
      } catch {
        /* ignore */
      }
      return false
    },
    sheetClass() {
      return [
        this.themeClass,
        this.phase ? `lingyun-picker-sheet--${this.phase}` : '',
        this.reduceMotion ? 'lingyun-picker-sheet--reduce-motion' : '',
        this.dragging ? 'lingyun-picker-sheet--dragging' : '',
        this.useCalendar ? 'lingyun-picker-sheet--calendar' : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    sheetRootStyle() {
      return { zIndex: Number(this.zIndex) || 1200 }
    },
    /** 宽屏（iPad / 桌面 H5）不铺满：按面板宽上限水平居中 */
    sideInsetPx() {
      const w = Math.max(320, Number(this.windowWidth) || 375)
      return Math.max(INSET_MEDIUM, Math.round((w - PANEL_MAX_WIDTH) / 2))
    },
    panelStyle() {
      const style = {
        left: `${this.sideInsetPx}px`,
        right: `${this.sideInsetPx}px`,
        bottom: `${INSET_MEDIUM}px`,
        borderRadius: `${RADIUS}px`,
        paddingBottom: `${Number(this.safeBottom) || 0}px`,
      }
      if (this.dragging) {
        style.transform = `translate3d(0, ${this.dragDy}px, 0)`
        style.transition = 'none'
      }
      return style
    },
    indicatorStyle() {
      // 原生选中条透明，改由连续半圆胶囊绘制；边线用 class 清伪元素
      return `height: ${ITEM_H}px; background: transparent; border: 0 solid transparent; border-top: none; border-bottom: none;`
    },
    indicatorClass() {
      return 'lingyun-picker-sheet__indicator'
    },
    indicatorPillStyle() {
      const bg = this.isDark ? 'rgba(120, 120, 128, 0.24)' : 'rgba(120, 120, 128, 0.12)'
      const r = ITEM_H / 2
      return {
        height: `${ITEM_H}px`,
        marginTop: `${-r}px`,
        borderRadius: `${r}px`,
        background: bg,
      }
    },
    maskClass() {
      return this.isDark ? 'lingyun-picker-sheet__mask--dark' : 'lingyun-picker-sheet__mask--light'
    },
    dateBounds() {
      const now = new Date()
      const defStart = `${now.getFullYear() - 80}-01-01`
      const defEnd = `${now.getFullYear() + 20}-12-31`
      const s = parseYmd(this.start) || parseYmd(defStart)
      const e = parseYmd(this.end) || parseYmd(defEnd)
      return { start: s, end: e }
    },
    years() {
      const { start, end } = this.dateBounds
      const list = []
      for (let y = start.y; y <= end.y; y += 1) {
        list.push({ label: `${y}年`, value: y })
      }
      return list
    },
    /** 表头须与格子起始日一致，否则整周高亮会跨两行 */
    weekLabels() {
      const start = this.weekStartIndex
      if (!start) return WEEK_LABELS
      return WEEK_LABELS.slice(start).concat(WEEK_LABELS.slice(0, start))
    },
    monthItems() {
      return MONTH_ITEMS
    },
    calendarTitle() {
      const m = MONTH_CN[(this.viewM || 1) - 1] || String(this.viewM)
      return `${this.viewY}年${m}月`
    },
    calendarCells() {
      return this.buildMonthCells(this.viewY, this.viewM)
    },
    calTrackClass() {
      return {
        'lingyun-picker-cal__track--dual': !!this.calOutCells,
        'lingyun-picker-cal__track--animating': this.calSlidePhase === 'animating',
      }
    },
    calTrackStyle() {
      return this.slideTrackStyle(!!this.calOutCells)
    },
    yearTrackClass() {
      return {
        'lingyun-picker-cal__track--dual': this.calOutYear != null,
        'lingyun-picker-cal__track--animating': this.calSlidePhase === 'animating',
      }
    },
    yearTrackStyle() {
      return this.slideTrackStyle(this.calOutYear != null)
    },
    decadeTrackClass() {
      return {
        'lingyun-picker-cal__track--dual': this.calOutDecade != null,
        'lingyun-picker-cal__track--animating': this.calSlidePhase === 'animating',
      }
    },
    decadeTrackStyle() {
      return this.slideTrackStyle(this.calOutDecade != null)
    },
    yearPageItems() {
      return this.buildYearPage(this.viewDecadeStart)
    },
    yearPageTitle() {
      const { end } = this.dateBounds
      const list = this.yearPageItems.filter((yr) => yr <= end.y)
      if (!list.length) return ''
      const first = list[0]
      const last = list[list.length - 1]
      return first === last ? `${first}年` : `${first}–${last}`
    },
    canPrevMonth() {
      const { start } = this.dateBounds
      if (this.viewY > start.y) return true
      if (this.viewY === start.y && this.viewM > start.m) return true
      return false
    },
    canNextMonth() {
      const { end } = this.dateBounds
      if (this.viewY < end.y) return true
      if (this.viewY === end.y && this.viewM < end.m) return true
      return false
    },
    canPrevYear() {
      return this.viewYear > this.dateBounds.start.y
    },
    canNextYear() {
      return this.viewYear < this.dateBounds.end.y
    },
    canPrevDecade() {
      return this.viewDecadeStart > this.dateBounds.start.y
    },
    canNextDecade() {
      return this.viewDecadeStart + YEAR_PAGE_SIZE <= this.dateBounds.end.y
    },
    draftIsPm() {
      return this.draftH >= 12
    },
    draftTimeLabel() {
      if (this.hour12) {
        const { h12, isPm } = formatHour12(this.draftH)
        return `${h12}:${pad2(this.draftMi)} ${isPm ? 'PM' : 'AM'}`
      }
      return `${pad2(this.draftH)}:${pad2(this.draftMi)}`
    },
    timeHourColumn() {
      const hours = []
      if (this.hour12) {
        for (let h = 1; h <= 12; h += 1) hours.push({ label: String(h), value: h })
      } else {
        for (let h = 0; h < 24; h += 1) hours.push({ label: pad2(h), value: h })
      }
      return hours
    },
    timeMinuteColumn() {
      const minutes = []
      const step = this.minuteStep
      for (let m = 0; m < 60; m += step) {
        minutes.push({ label: pad2(m), value: m })
      }
      return minutes
    },
    columns() {
      if (this.modeKey === 'selector') {
        const list = Array.isArray(this.range) ? this.range : []
        return [
          list.map((item, index) => {
            let label = ''
            if (item != null && typeof item === 'object' && this.rangeKey) {
              label = String(item[this.rangeKey] ?? '')
            } else {
              label = item == null ? '' : String(item)
            }
            return { label, value: index }
          }),
        ]
      }
      if (this.modeKey === 'time') {
        return [this.timeHourColumn, this.timeMinuteColumn]
      }
      const fields = this.fields === 'year' || this.fields === 'month' ? this.fields : 'day'
      const yi = this.draftIndexes[0] || 0
      const year = (this.years[yi] && this.years[yi].value) || this.dateBounds.start.y
      const cols = [this.years]
      if (fields === 'year') return cols

      const { start, end } = this.dateBounds
      let monthFrom = 1
      let monthTo = 12
      if (year === start.y) monthFrom = start.m
      if (year === end.y) monthTo = end.m
      const months = []
      for (let m = monthFrom; m <= monthTo; m += 1) {
        months.push({ label: `${m}月`, value: m })
      }
      cols.push(months)
      if (fields === 'month') return cols

      const mi = Math.min(this.draftIndexes[1] || 0, months.length - 1)
      const month = (months[mi] && months[mi].value) || monthFrom
      let dayFrom = 1
      let dayTo = daysInMonth(year, month)
      if (year === start.y && month === start.m) dayFrom = start.d
      if (year === end.y && month === end.m) dayTo = Math.min(dayTo, end.d)
      const days = []
      for (let d = dayFrom; d <= dayTo; d += 1) {
        days.push({ label: `${d}日`, value: d })
      }
      cols.push(days)
      return cols
    },
    displayText() {
      if (this.modeKey === 'selector') {
        const idx = Number(this.current)
        if (Number.isNaN(idx) || idx < 0 || !this.range || !this.range.length) return ''
        const item = this.range[idx]
        if (item == null) return ''
        if (typeof item === 'object' && this.rangeKey) return String(item[this.rangeKey] ?? '')
        return String(item)
      }
      if (this.modeKey === 'time' && this.current != null && this.current !== '') {
        const hm = parseHm(this.current)
        if (!hm) return String(this.current)
        if (this.hour12) {
          const { h12, isPm } = formatHour12(hm.h)
          return `${h12}:${pad2(hm.mi)} ${isPm ? 'PM' : 'AM'}`
        }
        return `${pad2(hm.h)}:${pad2(hm.mi)}`
      }
      if (this.modeKey === 'datetime' && this.current != null && this.current !== '') {
        const p = parseYmdHm(this.current)
        if (!p) return String(this.current)
        const datePart = `${p.y}-${pad2(p.m)}-${pad2(p.d)}`
        if (this.hour12) {
          const { h12, isPm } = formatHour12(p.h)
          return `${datePart} ${h12}:${pad2(p.mi)} ${isPm ? 'PM' : 'AM'}`
        }
        return `${datePart} ${pad2(p.h)}:${pad2(p.mi)}`
      }
      if (this.modeKey === 'date' && this.current != null && this.current !== '') {
        if (this.fieldsKey === 'year') {
          const p = parseYOnly(this.current) || parseYmd(this.current) || parseYm(this.current)
          return p ? `${p.y}年` : String(this.current)
        }
        if (this.fieldsKey === 'month') {
          const p = parseYm(this.current) || parseYmd(this.current)
          return p ? `${p.y}年${p.m}月` : String(this.current)
        }
        return String(this.current)
      }
      if (this.modeKey === 'daterange' || this.modeKey === 'week') {
        const parsed = parseDateRange(this.current)
        if (!parsed) return ''
        const a = ymdKey(parsed.start.y, parsed.start.m, parsed.start.d)
        const b = ymdKey(parsed.end.y, parsed.end.m, parsed.end.d)
        return a === b ? a : `${a} → ${b}`
      }
      return this.current != null && this.current !== '' ? String(this.current) : ''
    },
    todayYmd() {
      const n = new Date()
      return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }
    },
  },
  beforeUnmount() {
    this.clearTimers()
    this.unlockPageScroll()
  },
  methods: {
    clearTimers() {
      if (this.leaveTimer) {
        clearTimeout(this.leaveTimer)
        this.leaveTimer = null
      }
      if (this.enterTimer) {
        clearTimeout(this.enterTimer)
        this.enterTimer = null
      }
      if (this.calAnimTimer) {
        clearTimeout(this.calAnimTimer)
        this.calAnimTimer = null
      }
    },
    /**
     * 天视图格子：`{ y, m, d, out }`，共 42 格。
     * 1 号之前与月末之后用**相邻月真实日期**补齐（`out: true`，灰色不可点），
     * 否则周高亮条会在月首 / 月尾断开。
     */
    buildMonthCells(y, m) {
      if (!y || !m) return Array(CAL_CELLS).fill(null)
      const firstDow = new Date(y, m - 1, 1).getDay()
      const lead = (((firstDow - this.weekStartIndex) % 7) + 7) % 7
      const cells = []
      if (lead > 0) {
        const prev = shiftMonthYm(y, m, -1)
        const prevDim = daysInMonth(prev.y, prev.m)
        for (let i = lead; i > 0; i -= 1) {
          cells.push({ y: prev.y, m: prev.m, d: prevDim - i + 1, out: true })
        }
      }
      const dim = daysInMonth(y, m)
      for (let d = 1; d <= dim; d += 1) cells.push({ y, m, d, out: false })
      const next = shiftMonthYm(y, m, 1)
      let tail = 1
      while (cells.length < CAL_CELLS) {
        cells.push({ y: next.y, m: next.m, d: tail, out: true })
        tail += 1
      }
      return cells
    },
    resetCalSlide() {
      if (this.calAnimTimer) {
        clearTimeout(this.calAnimTimer)
        this.calAnimTimer = null
      }
      this.calOutCells = null
      this.calOutYear = null
      this.calOutDecade = null
      this.calSlideDir = 0
      this.calSlidePhase = 'idle'
      this.calSwiped = false
      this.calTracking = false
      this.calMode = 'day'
    },
    slideTrackStyle(hasOut) {
      if (!hasOut || !this.calSlideDir) return {}
      const next = this.calSlideDir > 0
      if (this.calSlidePhase === 'prepare') {
        return {
          transform: next ? 'translate3d(0, 0, 0)' : 'translate3d(-50%, 0, 0)',
          transition: 'none',
        }
      }
      if (this.calSlidePhase === 'animating') {
        return {
          transform: next ? 'translate3d(-50%, 0, 0)' : 'translate3d(0, 0, 0)',
          transition: `transform ${CAL_SLIDE_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
        }
      }
      return {}
    },
    runCalSlide(afterPrepare) {
      this.calSlidePhase = 'prepare'
      if (typeof afterPrepare === 'function') afterPrepare()
      this.$nextTick(() => {
        const kick = () => {
          this.calSlidePhase = 'animating'
          if (this.calAnimTimer) clearTimeout(this.calAnimTimer)
          this.calAnimTimer = setTimeout(() => {
            this.calOutCells = null
            this.calOutYear = null
            this.calOutDecade = null
            this.calSlideDir = 0
            this.calSlidePhase = 'idle'
            this.calAnimTimer = null
          }, CAL_SLIDE_MS)
        }
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            requestAnimationFrame(kick)
          })
        } else {
          setTimeout(kick, 16)
        }
      })
    },
    buildYearPage(pageStart) {
      const { start } = this.dateBounds
      const from = Math.max(start.y, Number(pageStart) || start.y)
      const list = []
      for (let i = 0; i < YEAR_PAGE_SIZE; i += 1) {
        list.push(from + i)
      }
      return list
    },
    decadeStartForYear(year) {
      const { start, end } = this.dateBounds
      const y = Math.min(end.y, Math.max(start.y, Number(year) || start.y))
      const offset = y - start.y
      return start.y + Math.floor(offset / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE
    },
    yearPageItemsAt(pageStart) {
      return this.buildYearPage(pageStart)
    },
    syncSafe() {
      try {
        const info =
          typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
        const inset = info && info.safeAreaInsets
        this.safeBottom = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
        this.windowWidth = Number(info && info.windowWidth) || 375
      } catch {
        this.safeBottom = 0
        this.windowWidth = 375
      }
    },
    snapMinute(mi) {
      const step = this.minuteStep
      const snapped = Math.round(mi / step) * step
      return Math.min(60 - step, Math.max(0, snapped))
    },
    indexesFromValue() {
      if (this.modeKey === 'selector') {
        const idx = Number(this.current)
        const max = Math.max(0, (this.range && this.range.length ? this.range.length : 1) - 1)
        if (Number.isNaN(idx) || idx < 0) return [0]
        return [Math.min(idx, max)]
      }
      if (this.modeKey === 'time') {
        const hm = parseHm(this.current) || { h: 0, mi: 0 }
        const mi = this.snapMinute(hm.mi)
        if (this.hour12) {
          const { h12 } = formatHour12(hm.h)
          const hi = Math.max(0, this.timeHourColumn.findIndex((x) => x.value === h12))
          const mii = Math.max(0, this.timeMinuteColumn.findIndex((x) => x.value === mi))
          return [hi, mii]
        }
        return [
          Math.min(23, Math.max(0, hm.h)),
          Math.max(0, this.timeMinuteColumn.findIndex((x) => x.value === mi)),
        ]
      }
      const { start, end } = this.dateBounds
      const now = new Date()
      const today = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() }
      const ymd = this.clampYmdToBounds(parseYmd(this.current) || today)
      const yi = Math.max(0, this.years.findIndex((x) => x.value === ymd.y))
      const fields = this.fields === 'year' || this.fields === 'month' ? this.fields : 'day'
      if (fields === 'year') return [yi]

      let monthFrom = 1
      let monthTo = 12
      if (ymd.y === start.y) monthFrom = start.m
      if (ymd.y === end.y) monthTo = end.m
      const mi = Math.max(0, Math.min(monthTo - monthFrom, ymd.m - monthFrom))
      if (fields === 'month') return [yi, mi]

      let dayFrom = 1
      let dayTo = daysInMonth(ymd.y, ymd.m)
      if (ymd.y === start.y && ymd.m === start.m) dayFrom = start.d
      if (ymd.y === end.y && ymd.m === end.m) dayTo = Math.min(dayTo, end.d)
      const di = Math.max(0, Math.min(dayTo - dayFrom, ymd.d - dayFrom))
      return [yi, mi, di]
    },
    clampYmdToBounds(ymd) {
      const { start, end } = this.dateBounds
      let y = Number(ymd.y) || start.y
      let m = Number(ymd.m) || 1
      let d = Number(ymd.d) || 1
      if (compareYmd({ y, m, d }, start) < 0) return { ...start }
      if (compareYmd({ y, m, d }, end) > 0) return { ...end }
      const dim = daysInMonth(y, m)
      if (d > dim) d = dim
      return { y, m, d }
    },
    syncCalendarDraftFromValue() {
      const now = new Date()
      const fallback = {
        y: now.getFullYear(),
        m: now.getMonth() + 1,
        d: now.getDate(),
        h: now.getHours(),
        mi: this.snapMinute(now.getMinutes()),
      }
      let parsed = null
      if (this.modeKey === 'datetime') parsed = parseYmdHm(this.current)
      else if (this.modeKey === 'daterange' || this.modeKey === 'week') {
        const range = parseDateRange(this.current)
        if (range) {
          if (this.modeKey === 'week') {
            const week = weekBoundsForDay(
              range.start.y,
              range.start.m,
              range.start.d,
              this.weekStartIndex,
            )
            this.draftRangeStart = { ...week.start }
            this.draftRangeEnd = { ...week.end }
            parsed = { ...week.start, h: 0, mi: 0 }
          } else {
            this.draftRangeStart = { ...range.start }
            this.draftRangeEnd = { ...range.end }
            parsed = { ...range.start, h: 0, mi: 0 }
          }
        } else {
          this.draftRangeStart = null
          this.draftRangeEnd = null
        }
      } else if (this.modeKey === 'date') {
        if (this.fieldsKey === 'year') {
          parsed = parseYOnly(this.current) || parseYmd(this.current) || parseYm(this.current)
        } else if (this.fieldsKey === 'month') {
          parsed = parseYm(this.current) || parseYmd(this.current)
        } else {
          parsed = parseYmd(this.current)
        }
        if (parsed) parsed = { ...parsed, h: 0, mi: 0 }
      }
      const base = parsed || fallback
      const clamped = this.clampYmdToBounds(base)
      const src = {
        ...clamped,
        h: Math.min(23, Math.max(0, base.h != null ? base.h : fallback.h)),
        mi: this.snapMinute(base.mi != null ? base.mi : fallback.mi),
      }
      this.draftY = src.y
      this.draftM = src.m || 1
      this.draftD = src.d || 1
      this.draftH = src.h
      this.draftMi = src.mi
      this.viewY = this.draftY
      this.viewM = this.draftM
      this.viewYear = this.draftY
      this.viewDecadeStart = this.decadeStartForYear(this.draftY)
      if (this.modeKey === 'daterange' || this.modeKey === 'week') this.calMode = 'day'
      else if (this.fieldsKey === 'year') this.calMode = 'year'
      else if (this.fieldsKey === 'month') this.calMode = 'month'
      else this.calMode = 'day'
      this.syncTimeDraftIndexes()
    },
    syncTimeDraftIndexes() {
      const mi = this.snapMinute(this.draftMi)
      this.draftMi = mi
      if (this.hour12) {
        const { h12 } = formatHour12(this.draftH)
        const hi = Math.max(0, this.timeHourColumn.findIndex((x) => x.value === h12))
        const mii = Math.max(0, this.timeMinuteColumn.findIndex((x) => x.value === mi))
        this.timeDraftIndexes = [hi, mii]
      } else {
        this.timeDraftIndexes = [
          Math.min(23, Math.max(0, this.draftH)),
          Math.max(0, this.timeMinuteColumn.findIndex((x) => x.value === mi)),
        ]
      }
    },
    valueFromIndexes(indexes) {
      const cols = this.columns
      if (this.modeKey === 'selector') return indexes[0] || 0
      if (this.modeKey === 'time') {
        const hItem = cols[0][indexes[0] || 0]
        const mItem = cols[1][indexes[1] || 0]
        let h = (hItem && hItem.value) || 0
        const mi = (mItem && mItem.value) || 0
        if (this.hour12) {
          h = toH24(h, this.draftIsPm)
        }
        return `${pad2(h)}:${pad2(mi)}`
      }
      const fields = this.fields === 'year' || this.fields === 'month' ? this.fields : 'day'
      const y = (cols[0][indexes[0] || 0] && cols[0][indexes[0] || 0].value) || this.dateBounds.start.y
      if (fields === 'year') return `${y}`
      const m = (cols[1][indexes[1] || 0] && cols[1][indexes[1] || 0].value) || 1
      if (fields === 'month') return `${y}-${pad2(m)}`
      const d = (cols[2][indexes[2] || 0] && cols[2][indexes[2] || 0].value) || 1
      return `${y}-${pad2(m)}-${pad2(d)}`
    },
    valueFromCalendar() {
      if (this.isRangeSelect) {
        const s = this.draftRangeStart
        if (!s) {
          if (this.isWeek) {
            const today = this.clampYmdToBounds(this.todayYmd)
            const week = weekBoundsForDay(today.y, today.m, today.d, this.weekStartIndex)
            return [ymdKey(week.start.y, week.start.m, week.start.d), ymdKey(week.end.y, week.end.m, week.end.d)]
          }
          const today = this.clampYmdToBounds(this.todayYmd)
          const key = ymdKey(today.y, today.m, today.d)
          return [key, key]
        }
        const e = this.draftRangeEnd || s
        return [ymdKey(s.y, s.m, s.d), ymdKey(e.y, e.m, e.d)]
      }
      if (this.fieldsKey === 'year') return `${this.draftY}`
      if (this.fieldsKey === 'month') return `${this.draftY}-${pad2(this.draftM)}`
      const date = ymdKey(this.draftY, this.draftM, this.draftD)
      if (this.modeKey === 'date') return date
      return `${date} ${pad2(this.draftH)}:${pad2(this.draftMi)}`
    },
    confirmCalendarValue() {
      const next = this.valueFromCalendar()
      this.$emit('update:modelValue', next)
      this.$emit('update:value', next)
      this.$emit('change', { value: next })
      this.closeSheet()
    },
    clampDraftToColumns() {
      const cols = this.columns
      const next = cols.map((col, i) => {
        const max = Math.max(0, col.length - 1)
        const cur = Number(this.draftIndexes[i]) || 0
        return Math.min(max, Math.max(0, cur))
      })
      const changed =
        next.some((v, i) => v !== (this.draftIndexes[i] || 0)) || next.length !== this.draftIndexes.length
      if (changed) this.draftIndexes = next
    },
    isDayDisabledAt(day, y, m) {
      if (!day) return true
      const cur = { y, m, d: day }
      const { start, end } = this.dateBounds
      return compareYmd(cur, start) < 0 || compareYmd(cur, end) > 0
    },
    /** @param {{ y: number, m: number, d: number, out: boolean } | null} cell */
    cellClass(cell) {
      if (!cell) return { 'lingyun-picker-cal__cell--empty': true }
      const { y, m, d } = cell
      const today = d === this.todayYmd.d && y === this.todayYmd.y && m === this.todayYmd.m
      // 相邻月补位格：不可点，但仍参与周 / 区间高亮，条带才不断开
      const disabled = cell.out || this.isDayDisabledAt(d, y, m)
      if (this.isRangeSelect) {
        const cur = { y, m, d }
        const s = this.draftRangeStart
        const e = this.draftRangeEnd
        const isStart = s && sameYmd(cur, s)
        const isEnd = e && sameYmd(cur, e)
        let inMiddle = false
        if (s && e && !sameYmd(s, e)) {
          inMiddle = compareYmd(cur, s) > 0 && compareYmd(cur, e) < 0
        }
        const selected = !!(isStart || isEnd)
        return {
          'lingyun-picker-cal__cell--selected': selected,
          'lingyun-picker-cal__cell--today': today && !selected,
          'lingyun-picker-cal__cell--disabled': disabled,
          'lingyun-picker-cal__cell--outside': !!cell.out,
          'lingyun-picker-cal__cell--range-start': !!isStart,
          'lingyun-picker-cal__cell--range-end': !!isEnd,
          'lingyun-picker-cal__cell--in-range': inMiddle || (isStart && e && !sameYmd(s, e)) || (isEnd && s && !sameYmd(s, e)),
        }
      }
      const selected = d === this.draftD && y === this.draftY && m === this.draftM
      return {
        'lingyun-picker-cal__cell--selected': selected,
        'lingyun-picker-cal__cell--today': today && !selected,
        'lingyun-picker-cal__cell--disabled': disabled,
        'lingyun-picker-cal__cell--outside': !!cell.out,
      }
    },
    dayRangeFlags(day, y, m) {
      if (!this.isRangeSelect || !day) {
        return { selected: false, rangeStart: false, rangeEnd: false, inRange: false }
      }
      const cur = { y, m, d: day }
      const s = this.draftRangeStart
      const e = this.draftRangeEnd
      const rangeStart = !!(s && sameYmd(cur, s))
      const rangeEnd = !!(e && sameYmd(cur, e))
      let inRange = false
      if (s && e && !sameYmd(s, e)) {
        inRange = compareYmd(cur, s) > 0 && compareYmd(cur, e) < 0
      }
      return {
        selected: rangeStart || rangeEnd,
        rangeStart,
        rangeEnd,
        inRange,
      }
    },
    /** @param {{ y: number, m: number, d: number, out: boolean } | null} cell */
    dayDecor(cell) {
      if (!cell) {
        return {
          day: '',
          badgeText: '',
          lunar: '',
          dotTone: '',
          selected: false,
          today: false,
          disabled: false,
          outside: false,
          compact: false,
          selectTone: 'label',
        }
      }
      const { y, m, d: day } = cell
      const mark = this.marksMap[ymdKey(y, m, day)] || null
      let badgeText = ''
      if (mark) {
        if (typeof mark.badge === 'string' && mark.badge.trim()) {
          badgeText = mark.badge.trim()
        } else if (typeof mark.badgeText === 'string' && mark.badgeText.trim()) {
          badgeText = mark.badgeText.trim()
        }
      }
      let lunar = ''
      if (this.lunar) {
        lunar = lunarDayText(y, m, day)
      }
      let dotTone = ''
      if (mark && mark.dot !== false && mark.dot != null) {
        const raw = mark.dot === true ? 'red' : String(mark.dot).toLowerCase()
        if (raw === 'red' || raw === 'default' || raw === '1') dotTone = 'red'
        else if (raw === 'orange' || raw === 'warning') dotTone = 'orange'
        else if (raw === 'green' || raw === 'success') dotTone = 'green'
      }
      const flags = this.dayRangeFlags(day, y, m)
      const selected = this.isRangeSelect
        ? flags.selected
        : day === this.draftD && y === this.draftY && m === this.draftM
      const today =
        day === this.todayYmd.d && y === this.todayYmd.y && m === this.todayYmd.m
      const hasMarks = Array.isArray(this.marks) && this.marks.length > 0
      const compact = !!this.lunar || hasMarks
      return {
        day,
        badgeText,
        lunar,
        dotTone,
        selected,
        today,
        disabled: this.isDayDisabledAt(day, y, m),
        outside: !!cell.out,
        compact,
        selectTone: compact || this.isRangeSelect ? 'red' : 'label',
      }
    },
    /** @param {{ y: number, m: number, d: number, out: boolean } | null} cell */
    onSelectDay(cell) {
      if (this.calSwiped || this.calSlidePhase !== 'idle') {
        this.calSwiped = false
        return
      }
      // 补位格只做视觉衔接，不可选（要跨月请先翻月）
      if (!cell || cell.out) return
      const day = cell.d
      if (this.isDayDisabledAt(day, cell.y, cell.m)) return
      if (this.isWeek) {
        const week = weekBoundsForDay(cell.y, cell.m, day, this.weekStartIndex)
        this.draftRangeStart = { ...week.start }
        this.draftRangeEnd = { ...week.end }
        this.draftY = cell.y
        this.draftM = cell.m
        this.draftD = day
        return
      }
      if (this.isDateRange) {
        const clicked = { y: cell.y, m: cell.m, d: day }
        const s = this.draftRangeStart
        const e = this.draftRangeEnd
        if (!s || (s && e)) {
          this.draftRangeStart = clicked
          this.draftRangeEnd = null
        } else if (compareYmd(clicked, s) < 0) {
          this.draftRangeEnd = { ...s }
          this.draftRangeStart = clicked
        } else {
          this.draftRangeEnd = clicked
        }
        this.draftY = clicked.y
        this.draftM = clicked.m
        this.draftD = clicked.d
        return
      }
      this.draftY = cell.y
      this.draftM = cell.m
      this.draftD = day
    },
    shiftMonth(delta) {
      if (this.calMode !== 'day') return
      if (this.calSlidePhase !== 'idle') return
      if (delta < 0 && !this.canPrevMonth) return
      if (delta > 0 && !this.canNextMonth) return
      let y = this.viewY
      let m = this.viewM + delta
      if (m < 1) {
        m = 12
        y -= 1
      } else if (m > 12) {
        m = 1
        y += 1
      }
      if (this.reduceMotion) {
        this.viewY = y
        this.viewM = m
        return
      }
      this.calOutCells = this.buildMonthCells(this.viewY, this.viewM)
      this.calOutYear = null
      this.calOutDecade = null
      this.calSlideDir = delta
      this.runCalSlide(() => {
        this.viewY = y
        this.viewM = m
      })
    },
    openMonthView() {
      if (this.fieldsKey === 'year') return
      if (this.calSlidePhase !== 'idle') return
      this.resetCalSlideKeepMode()
      this.viewYear = this.viewY
      this.calMode = 'month'
    },
    openYearView() {
      if (this.calSlidePhase !== 'idle') return
      this.resetCalSlideKeepMode()
      this.viewDecadeStart = this.decadeStartForYear(this.viewYear)
      this.calMode = 'year'
    },
    resetCalSlideKeepMode() {
      if (this.calAnimTimer) {
        clearTimeout(this.calAnimTimer)
        this.calAnimTimer = null
      }
      this.calOutCells = null
      this.calOutYear = null
      this.calOutDecade = null
      this.calSlideDir = 0
      this.calSlidePhase = 'idle'
      this.calSwiped = false
      this.calTracking = false
    },
    shiftYear(delta) {
      if (this.calMode !== 'month') return
      if (this.calSlidePhase !== 'idle') return
      if (delta < 0 && !this.canPrevYear) return
      if (delta > 0 && !this.canNextYear) return
      const next = this.viewYear + delta
      if (this.reduceMotion) {
        this.viewYear = next
        return
      }
      this.calOutYear = this.viewYear
      this.calOutCells = null
      this.calOutDecade = null
      this.calSlideDir = delta
      this.runCalSlide(() => {
        this.viewYear = next
      })
    },
    shiftDecade(delta) {
      if (this.calMode !== 'year') return
      if (this.calSlidePhase !== 'idle') return
      if (delta < 0 && !this.canPrevDecade) return
      if (delta > 0 && !this.canNextDecade) return
      const { start, end } = this.dateBounds
      let next = this.viewDecadeStart + delta * YEAR_PAGE_SIZE
      if (next < start.y) next = start.y
      if (next > end.y) next = this.decadeStartForYear(end.y)
      if (next === this.viewDecadeStart) return
      if (this.reduceMotion) {
        this.viewDecadeStart = next
        return
      }
      this.calOutDecade = this.viewDecadeStart
      this.calOutCells = null
      this.calOutYear = null
      this.calSlideDir = delta
      this.runCalSlide(() => {
        this.viewDecadeStart = next
      })
    },
    monthLabel(m) {
      return MONTH_SHORT[(m || 1) - 1] || `${m}月`
    },
    isMonthDisabled(m, y) {
      const { start, end } = this.dateBounds
      if (y < start.y || y > end.y) return true
      if (y === start.y && m < start.m) return true
      if (y === end.y && m > end.m) return true
      return false
    },
    monthCellClass(m, y) {
      // 仅高亮「已选日期」所在年月；浏览其它年份时不跟着手动 viewM
      const selected = y === this.draftY && m === this.draftM
      return {
        'lingyun-picker-cal__month-cell--selected': selected,
        'lingyun-picker-cal__month-cell--disabled': this.isMonthDisabled(m, y),
      }
    },
    isYearDisabled(yr) {
      const { start, end } = this.dateBounds
      return yr < start.y || yr > end.y
    },
    yearCellClass(yr) {
      return {
        'lingyun-picker-cal__month-cell--selected': yr === this.draftY,
        'lingyun-picker-cal__month-cell--disabled': this.isYearDisabled(yr),
      }
    },
    onSelectMonth(m) {
      if (this.calSwiped || this.calSlidePhase !== 'idle') {
        this.calSwiped = false
        return
      }
      if (this.isMonthDisabled(m, this.viewYear)) return
      this.viewY = this.viewYear
      this.viewM = m
      this.draftY = this.viewYear
      this.draftM = m
      const dim = daysInMonth(this.viewY, this.viewM)
      if (this.draftD > dim) this.draftD = dim
      if (this.fieldsKey === 'month') {
        this.confirmCalendarValue()
        return
      }
      this.calMode = 'day'
      this.resetCalSlideKeepMode()
    },
    onSelectYear(yr) {
      if (this.calSwiped || this.calSlidePhase !== 'idle') {
        this.calSwiped = false
        return
      }
      if (this.isYearDisabled(yr)) return
      this.viewYear = yr
      this.draftY = yr
      this.viewDecadeStart = this.decadeStartForYear(yr)
      if (this.fieldsKey === 'year') {
        this.confirmCalendarValue()
        return
      }
      this.calMode = 'month'
      this.resetCalSlideKeepMode()
    },
    onCalTouchStart(e) {
      const t = e.touches && e.touches[0]
      if (!t) return
      this.calStartX = t.clientX
      this.calStartY = t.clientY
      this.calDx = 0
      this.calDy = 0
      this.calTracking = true
      this.calSwiped = false
    },
    onCalTouchMove(e) {
      if (!this.calTracking) return
      const t = e.touches && e.touches[0]
      if (!t) return
      this.calDx = t.clientX - this.calStartX
      this.calDy = t.clientY - this.calStartY
    },
    onCalTouchEnd() {
      if (!this.calTracking) return
      const dx = this.calDx
      const dy = this.calDy
      this.calTracking = false
      this.calDx = 0
      this.calDy = 0
      if (Math.abs(dx) < CAL_SWIPE_DX) return
      if (Math.abs(dx) < Math.abs(dy) * CAL_SWIPE_RATIO) return
      this.calSwiped = true
      const delta = dx < 0 ? 1 : -1
      if (this.calMode === 'year') this.shiftDecade(delta)
      else if (this.calMode === 'month') this.shiftYear(delta)
      else this.shiftMonth(delta)
    },
    toggleTimeEditing() {
      this.timeEditing = !this.timeEditing
      if (this.timeEditing) this.syncTimeDraftIndexes()
    },
    setAmPm(isPm) {
      const { h12 } = formatHour12(this.draftH)
      this.draftH = toH24(h12, isPm)
      this.syncTimeDraftIndexes()
    },
    onTimePickChange(e) {
      const raw = (e && e.detail && e.detail.value) || []
      this.timeDraftIndexes = raw.map((n) => Number(n) || 0)
      const hItem = this.timeHourColumn[this.timeDraftIndexes[0] || 0]
      const mItem = this.timeMinuteColumn[this.timeDraftIndexes[1] || 0]
      let h = (hItem && hItem.value) || 0
      if (this.hour12) h = toH24(h, this.draftIsPm)
      this.draftH = h
      this.draftMi = (mItem && mItem.value) || 0
    },
    open() {
      if (this.disabled) return
      this.timeEditing = false
      this.resetCalSlide()
      if (this.useCalendar) {
        this.syncCalendarDraftFromValue()
      } else {
        if (this.modeKey === 'time') {
          const hm = parseHm(this.current) || { h: 0, mi: 0 }
          this.draftH = hm.h
          this.draftMi = this.snapMinute(hm.mi)
        }
        this.draftIndexes = this.indexesFromValue()
        this.$nextTick(() => this.clampDraftToColumns())
      }
      this.syncSafe()
      this.lockPageScroll()
      this.openAnim()
    },
    openAnim() {
      this.clearTimers()
      this.sheetMounted = true
      this.dragDy = 0
      this.dragging = false
      this.phase = 'enter'
      this.$nextTick(() => {
        const kick = () => {
          this.enterTimer = setTimeout(
            () => {
              this.phase = 'open'
              this.enterTimer = null
            },
            this.reduceMotion ? 16 : ENTER_KICK_MS,
          )
        }
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            requestAnimationFrame(kick)
          })
        } else {
          kick()
        }
      })
    },
    closeSheet(after) {
      this.clearTimers()
      if (!this.sheetMounted) {
        this.unlockPageScroll()
        if (typeof after === 'function') after()
        return
      }
      this.phase = 'leave'
      this.leaveTimer = setTimeout(
        () => {
          this.sheetMounted = false
          this.phase = ''
          this.dragDy = 0
          this.dragging = false
          this.timeEditing = false
          this.resetCalSlide()
          this.unlockPageScroll()
          this.leaveTimer = null
          if (typeof after === 'function') after()
        },
        this.reduceMotion ? 16 : LEAVE_MS,
      )
    },
    onPanelTouchMove() {
      /* stop 已在模板 */
    },
    onChromeTouchStart(e) {
      const t = e.touches && e.touches[0]
      if (!t) return
      this.dragStartY = t.clientY
      this.dragDy = 0
      this.dragging = true
    },
    onChromeTouchMove(e) {
      if (!this.dragging) return
      const t = e.touches && e.touches[0]
      if (!t) return
      const dy = t.clientY - this.dragStartY
      this.dragDy = dy > 0 ? dy : 0
    },
    onChromeTouchEnd() {
      if (!this.dragging) return
      const dy = this.dragDy
      this.dragging = false
      this.dragDy = 0
      if (dy >= DISMISS_DY) {
        this.onCancel()
      }
    },
    onPickChange(e) {
      const raw = (e && e.detail && e.detail.value) || []
      this.draftIndexes = raw.map((n) => Number(n) || 0)
      if (this.modeKey === 'time' && this.hour12) {
        const hItem = this.timeHourColumn[this.draftIndexes[0] || 0]
        const mItem = this.timeMinuteColumn[this.draftIndexes[1] || 0]
        const h12 = (hItem && hItem.value) || 12
        this.draftH = toH24(h12, this.draftIsPm)
        this.draftMi = (mItem && mItem.value) || 0
      }
      this.$nextTick(() => this.clampDraftToColumns())
    },
    onCancel() {
      this.$emit('cancel')
      this.closeSheet()
    },
    onConfirm() {
      let next
      if (this.useCalendar) {
        next = this.valueFromCalendar()
      } else {
        this.clampDraftToColumns()
        next = this.valueFromIndexes(this.draftIndexes)
      }
      this.$emit('update:modelValue', next)
      this.$emit('update:value', next)
      this.$emit('change', { value: next })
      this.closeSheet()
    },
    lockPageScroll() {
      try {
        const lockApi = this.appPageScrollLock
        if (lockApi && typeof lockApi.lock === 'function' && !this._appScrollLocked) {
          lockApi.lock()
          this._appScrollLocked = true
        }
      } catch {
        /* ignore */
      }
      // #ifdef H5
      if (typeof document === 'undefined') return
      if (this._scrollLocked) return
      const body = document.body
      const html = document.documentElement
      this._prevBodyOverflow = body.style.overflow
      this._prevBodyOverscroll = body.style.overscrollBehavior
      this._prevHtmlOverscroll = html.style.overscrollBehavior
      body.style.overflow = 'hidden'
      body.style.overscrollBehavior = 'none'
      html.style.overscrollBehavior = 'none'
      this._scrollLocked = true
      // #endif
    },
    unlockPageScroll() {
      try {
        const lockApi = this.appPageScrollLock
        if (this._appScrollLocked && lockApi && typeof lockApi.unlock === 'function') {
          lockApi.unlock()
        }
        this._appScrollLocked = false
      } catch {
        this._appScrollLocked = false
      }
      // #ifdef H5
      if (typeof document === 'undefined') return
      if (!this._scrollLocked) return
      const body = document.body
      const html = document.documentElement
      body.style.overflow = this._prevBodyOverflow || ''
      body.style.overscrollBehavior = this._prevBodyOverscroll || ''
      html.style.overscrollBehavior = this._prevHtmlOverscroll || ''
      this._scrollLocked = false
      // #endif
    },
  },
}
</script>

<style lang="scss">
@import '../../styles/variables.scss';
@import '../../styles/setting/_glass.scss';

.lingyun-picker {
  display: block;
  width: 100%;
  box-sizing: border-box;
}

.lingyun-picker--cell {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.lingyun-picker__row {
  min-height: 52px;
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  border-radius: 26px;
  border: 1px solid transparent;
}

.lingyun-picker__row--cell {
  min-height: 36px;
  width: 100%;
  padding: 0;
  gap: 8px;
  background-color: transparent;
  border-radius: 0;
  border-color: transparent;
  justify-content: flex-end;
}

.lingyun-picker__row--disabled {
  opacity: 0.45;
  pointer-events: none;
}

.lingyun-picker__title {
  flex-shrink: 0;
  font-size: 17px;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-picker__value-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.lingyun-picker__value {
  font-size: 17px;
  line-height: 22px;
  text-align: right;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-picker__value--placeholder {
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-picker__value--capsule {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 17px;
  line-height: 22px;
  font-weight: 400;
  color: var(--lingyun-primary, #{$lingyun-system-blue});
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-picker__chevron {
  flex-shrink: 0;
}

/* —— 弹层 —— */
.lingyun-picker-sheet {
  position: fixed;
  inset: 0;
  z-index: 1200;
  pointer-events: auto;
  box-sizing: border-box;
}

.lingyun-picker-sheet__overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: var(--lingyun-mask, #{$lingyun-overlay});
  opacity: 0;
  transition: opacity 0.38s cubic-bezier(0.32, 0.72, 0, 1);
  touch-action: none;
  will-change: opacity;
}

.lingyun-picker-sheet__panel {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  /* 屏外起点须含底部内缩 8，否则收起后残留露头 */
  transform: translate3d(0, calc(100% + 8px), 0);
  transition: transform 0.42s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
  /* 四周内缩 + 四角 34 由 panelStyle 内联下发（Sketch Medium Detent 悬浮卡片） */
  @include lingyun-glass-surface;
  box-shadow:
    var(--lingyun-glass-highlight, #{$lingyun-glass-highlight}),
    0 18px 46px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-picker-sheet.theme-dark .lingyun-picker-sheet__panel {
  border: #{$lingyun-glass-hairline-dark};
  box-shadow: #{$lingyun-glass-highlight-dark}, 0 18px 48px rgba(0, 0, 0, 0.45);
  background-color: #{$lingyun-glass-overlay-bg-dark};
  backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
  -webkit-backdrop-filter: saturate($lingyun-glass-saturate) blur($lingyun-glass-blur);
}

.lingyun-picker-sheet__grabber {
  width: 60px;
  height: 4px;
  margin: 5px auto 0;
  border-radius: 2px;
  background-color: #cfcfcf;
  flex-shrink: 0;
}

.lingyun-picker-sheet.theme-dark .lingyun-picker-sheet__grabber {
  background-color: #8e8e93;
}

.lingyun-picker-sheet__chrome {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  touch-action: none;
  /* #ifdef H5 */
  user-select: none;
  -webkit-user-select: none;
  /* #endif */
}

.lingyun-picker-sheet__toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 2px 12px 0;
  box-sizing: border-box;
  flex-shrink: 0;
}

.lingyun-picker-sheet__heading,
.lingyun-picker-sheet__heading-spacer {
  flex: 1;
  min-width: 0;
  padding: 0 8px;
}

.lingyun-picker-sheet__heading {
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-picker-sheet__btn {
  flex-shrink: 0;
  min-width: 48px;
  padding: 10px 4px;
  font-size: 17px;
  line-height: 22px;
}

.lingyun-picker-sheet__btn--cancel {
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-picker-sheet__btn--done {
  font-weight: 600;
  text-align: right;
  color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-picker-sheet__view {
  width: 100%;
  height: 216px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  background: transparent;
}

.lingyun-picker-sheet__wheels-wrap {
  position: relative;
  width: 100%;
  flex-shrink: 0;
}

.lingyun-picker-sheet__indicator-pill {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 50%;
  z-index: 0;
  pointer-events: none;
  box-sizing: border-box;
}

.lingyun-picker-sheet__view--time {
  height: 144px;
  margin-top: 4px;
}

.lingyun-picker-sheet__item {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.lingyun-picker-sheet__item-text {
  font-size: 18px;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-picker-sheet__mask--light {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0)),
    linear-gradient(0deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0));
  background-position: top, bottom;
  background-size: 100% 50%;
  background-repeat: no-repeat;
}

.lingyun-picker-sheet__mask--dark {
  background: linear-gradient(180deg, rgba(28, 28, 30, 0.92), rgba(28, 28, 30, 0)),
    linear-gradient(0deg, rgba(28, 28, 30, 0.92), rgba(28, 28, 30, 0));
  background-position: top, bottom;
  background-size: 100% 50%;
  background-repeat: no-repeat;
}

/* 去掉 picker-view 选中行默认上下边线（微信伪元素） */
.lingyun-picker-sheet__indicator {
  border: none !important;
  border-top: none !important;
  border-bottom: none !important;
  background: transparent !important;
}

.lingyun-picker-sheet__indicator::before,
.lingyun-picker-sheet__indicator::after {
  display: none !important;
  border: none !important;
}

/* Compact 日历 · Sketch Date and Time Picker */
.lingyun-picker-cal {
  width: 100%;
  box-sizing: border-box;
  padding: 4px 16px 16px;
}

.lingyun-picker-cal__swipe {
  width: 100%;
}

.lingyun-picker-cal__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  min-height: 44px;
  padding: 0 4px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.lingyun-picker-cal__title-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0;
  height: 100%;
  padding: 0 4px 0 0;
  flex-shrink: 1;
  box-sizing: border-box;
}

.lingyun-picker-cal__month {
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-picker-cal__disclosure {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  flex-shrink: 0;
}

.lingyun-picker-cal__arrows {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.lingyun-picker-cal__arrow {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lingyun-picker-cal__arrow--disabled {
  opacity: 0.28;
  pointer-events: none;
}

.lingyun-picker-cal__week {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
  height: 18px;
  flex-shrink: 0;
  box-sizing: border-box;
}

.lingyun-picker-cal__weekday {
  flex: 1;
  text-align: center;
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

/* 日 / 月 共用内容区高度，切模式不抖：4+18+6+264 = 292 */
.lingyun-picker-cal__body {
  height: 292px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lingyun-picker-cal__viewport {
  width: 100%;
  height: 264px;
  margin-top: 6px;
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
}

.lingyun-picker-cal__viewport--months {
  flex: 1;
  height: auto;
  margin-top: 0;
  min-height: 0;
}

.lingyun-picker-cal__track {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.lingyun-picker-cal__track--dual {
  width: 200%;
}

.lingyun-picker-cal__pane {
  flex: 0 0 50%;
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  box-sizing: border-box;
  align-content: flex-start;
}

.lingyun-picker-cal__pane--months {
  align-content: stretch;
}

.lingyun-picker-cal__track:not(.lingyun-picker-cal__track--dual) .lingyun-picker-cal__pane {
  flex: 0 0 100%;
  width: 100%;
}

.lingyun-picker-cal__pane--out {
  pointer-events: none;
}

.lingyun-picker-cal__cell {
  width: 14.2857%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: none;
  border-bottom: none;
  background: transparent;
  position: relative;
}

.lingyun-picker-cal__range-hint {
  display: block;
  margin: 2px 4px 0;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-picker-cal__cell--in-range {
  background-color: var(--lingyun-primary-soft, #{rgba($lingyun-system-blue, 0.14)});
}

.lingyun-picker-cal__cell--range-start.lingyun-picker-cal__cell--in-range {
  border-top-left-radius: 22px;
  border-bottom-left-radius: 22px;
}

.lingyun-picker-cal__cell--range-end.lingyun-picker-cal__cell--in-range {
  border-top-right-radius: 22px;
  border-bottom-right-radius: 22px;
}

.lingyun-picker-cal__month-cell {
  width: 25%;
  height: 33.333%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.lingyun-picker-cal__month-text {
  font-size: 17px;
  line-height: 22px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-picker-cal__month-cell--selected .lingyun-picker-cal__month-text {
  color: var(--lingyun-primary, #{$lingyun-system-blue});
  font-weight: 600;
}

.lingyun-picker-cal__month-cell--disabled .lingyun-picker-cal__month-text {
  color: var(--lingyun-label-quaternary, #{$lingyun-label-quaternary});
}

.lingyun-picker-cal__time-row--wheels {
  padding: 0 16px;
  margin-top: 0;
}

.lingyun-picker-wheels {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.lingyun-picker-cal__time-row {
  margin-top: 12px;
  padding: 0 4px;
  min-height: 44px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.lingyun-picker-cal__time-label {
  font-size: 17px;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
  flex-shrink: 0;
}

.lingyun-picker-cal__time-controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.lingyun-picker-cal__time-pill {
  padding: 6px 12px;
  border-radius: 8px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-picker-cal__time-pill--active {
  background-color: var(--lingyun-primary-soft, #{rgba($lingyun-system-blue, 0.14)});
}

.lingyun-picker-cal__time-pill-text {
  font-size: 17px;
  line-height: 22px;
  color: var(--lingyun-primary, #{$lingyun-system-blue});
}

.lingyun-picker-cal__ampm {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 2px;
  border-radius: 8px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-picker-cal__ampm-item {
  padding: 4px 10px;
  border-radius: 6px;
}

.lingyun-picker-cal__ampm-item--active {
  background-color: var(--lingyun-bg-primary, #{$lingyun-bg-primary});
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}

.lingyun-picker-sheet.theme-dark .lingyun-picker-cal__ampm-item--active {
  background-color: var(--lingyun-bg-tertiary, #{$lingyun-bg-tertiary-dark});
}

.lingyun-picker-cal__ampm-text {
  font-size: 15px;
  line-height: 20px;
  font-weight: 500;
  color: var(--lingyun-label, #{$lingyun-label});
}

/* 相位 */
.lingyun-picker-sheet--enter .lingyun-picker-sheet__overlay {
  opacity: 0;
}

.lingyun-picker-sheet--enter .lingyun-picker-sheet__panel {
  transform: translate3d(0, calc(100% + 8px), 0);
}

.lingyun-picker-sheet--open .lingyun-picker-sheet__overlay {
  opacity: 1;
}

.lingyun-picker-sheet--open .lingyun-picker-sheet__panel {
  transform: translate3d(0, 0, 0);
}

.lingyun-picker-sheet--leave {
  pointer-events: none;
}

.lingyun-picker-sheet--leave .lingyun-picker-sheet__overlay {
  opacity: 0;
  transition: opacity 0.2s ease-in;
}

.lingyun-picker-sheet--leave .lingyun-picker-sheet__panel {
  transform: translate3d(0, calc(100% + 8px), 0);
  transition: transform 0.24s cubic-bezier(0.4, 0, 1, 1);
}

.lingyun-picker-sheet--reduce-motion .lingyun-picker-sheet__overlay,
.lingyun-picker-sheet--reduce-motion .lingyun-picker-sheet__panel {
  transition-duration: 0.01s !important;
}

.lingyun-picker-sheet--reduce-motion.lingyun-picker-sheet--enter .lingyun-picker-sheet__panel,
.lingyun-picker-sheet--reduce-motion.lingyun-picker-sheet--leave .lingyun-picker-sheet__panel,
.lingyun-picker-sheet--reduce-motion.lingyun-picker-sheet--open .lingyun-picker-sheet__panel {
  transform: translate3d(0, 0, 0) !important;
}

.lingyun-picker-sheet--dragging .lingyun-picker-sheet__panel {
  transition: none !important;
}
</style>
