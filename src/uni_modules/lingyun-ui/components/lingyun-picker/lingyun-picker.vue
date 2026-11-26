<template>
  <view class="lingyun-picker" :class="rootClass">
    <view v-if="hasTrigger" class="lingyun-picker__trigger" @click="open">
      <slot name="trigger" />
    </view>
    <view
      v-else
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
              <!-- #ifdef MP-WEIXIN -->
              <view class="lingyun-picker-sheet__mp-cols lingyun-picker-sheet__mp-cols--time">
                <scroll-view
                  v-for="(col, colIndex) in timeWheelColumns"
                  :key="`t-${colIndex}`"
                  class="lingyun-picker-sheet__mp-col"
                  style="height: 144px"
                  scroll-y
                  :show-scrollbar="false"
                  :scroll-top="mpTimeWheelTops[colIndex]"
                  :scroll-with-animation="false"
                  @scroll="onMpTimeWheelScroll($event, colIndex)"
                >
                  <view class="lingyun-picker-sheet__mp-pad lingyun-picker-sheet__mp-pad--time" />
                  <view
                    v-for="(item, rowIndex) in col"
                    :key="`t-${colIndex}-${rowIndex}`"
                    class="lingyun-picker-sheet__item"
                  >
                    <text class="lingyun-picker-sheet__item-text">{{ item.label }}</text>
                  </view>
                  <view class="lingyun-picker-sheet__mp-pad lingyun-picker-sheet__mp-pad--time" />
                </scroll-view>
              </view>
              <view class="lingyun-picker-sheet__mp-mask" :class="maskClass" />
              <!-- #endif -->
              <!-- #ifndef MP-WEIXIN -->
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
              <!-- #endif -->
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
              <!-- #ifdef MP-WEIXIN -->
              <view class="lingyun-picker-sheet__mp-cols">
                <scroll-view
                  v-for="(col, colIndex) in columns"
                  :key="colIndex"
                  class="lingyun-picker-sheet__mp-col"
                  style="height: 216px"
                  scroll-y
                  :show-scrollbar="false"
                  :scroll-top="mpWheelTops[colIndex]"
                  :scroll-with-animation="false"
                  @scroll="onMpWheelScroll($event, colIndex)"
                >
                  <view class="lingyun-picker-sheet__mp-pad" />
                  <view
                    v-for="(item, rowIndex) in col"
                    :key="`${colIndex}-${rowIndex}`"
                    class="lingyun-picker-sheet__item"
                  >
                    <text class="lingyun-picker-sheet__item-text">{{ item.label }}</text>
                  </view>
                  <view class="lingyun-picker-sheet__mp-pad" />
                </scroll-view>
              </view>
              <view class="lingyun-picker-sheet__mp-mask" :class="maskClass" />
              <!-- #endif -->
              <!-- #ifndef MP-WEIXIN -->
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
              <!-- #endif -->
            </view>
          </view>
          <view v-if="showSelectorSearch" class="lingyun-picker-sheet__search">
            <lingyun-search-bar
              :model-value="searchQuery"
              :fixed="false"
              :safe-area="false"
              padding="12px 12px 28px"
              :placeholder="searchPlaceholder"
              @update:model-value="onSearchQuery"
            />
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
              <!-- #ifdef MP-WEIXIN -->
              <view class="lingyun-picker-sheet__mp-cols lingyun-picker-sheet__mp-cols--time">
                <scroll-view
                  v-for="(col, colIndex) in timeWheelColumns"
                  :key="`t-${colIndex}`"
                  class="lingyun-picker-sheet__mp-col"
                  style="height: 144px"
                  scroll-y
                  :show-scrollbar="false"
                  :scroll-top="mpTimeWheelTops[colIndex]"
                  :scroll-with-animation="false"
                  @scroll="onMpTimeWheelScroll($event, colIndex)"
                >
                  <view class="lingyun-picker-sheet__mp-pad lingyun-picker-sheet__mp-pad--time" />
                  <view
                    v-for="(item, rowIndex) in col"
                    :key="`t-${colIndex}-${rowIndex}`"
                    class="lingyun-picker-sheet__item"
                  >
                    <text class="lingyun-picker-sheet__item-text">{{ item.label }}</text>
                  </view>
                  <view class="lingyun-picker-sheet__mp-pad lingyun-picker-sheet__mp-pad--time" />
                </scroll-view>
              </view>
              <view class="lingyun-picker-sheet__mp-mask" :class="maskClass" />
              <!-- #endif -->
              <!-- #ifndef MP-WEIXIN -->
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
              <!-- #endif -->
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
              <!-- #ifdef MP-WEIXIN -->
              <view class="lingyun-picker-sheet__mp-cols">
                <scroll-view
                  v-for="(col, colIndex) in columns"
                  :key="colIndex"
                  class="lingyun-picker-sheet__mp-col"
                  style="height: 216px"
                  scroll-y
                  :show-scrollbar="false"
                  :scroll-top="mpWheelTops[colIndex]"
                  :scroll-with-animation="false"
                  @scroll="onMpWheelScroll($event, colIndex)"
                >
                  <view class="lingyun-picker-sheet__mp-pad" />
                  <view
                    v-for="(item, rowIndex) in col"
                    :key="`${colIndex}-${rowIndex}`"
                    class="lingyun-picker-sheet__item"
                  >
                    <text class="lingyun-picker-sheet__item-text">{{ item.label }}</text>
                  </view>
                  <view class="lingyun-picker-sheet__mp-pad" />
                </scroll-view>
              </view>
              <view class="lingyun-picker-sheet__mp-mask" :class="maskClass" />
              <!-- #endif -->
              <!-- #ifndef MP-WEIXIN -->
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
              <!-- #endif -->
            </view>
          </view>
          <view v-if="showSelectorSearch" class="lingyun-picker-sheet__search">
            <lingyun-search-bar
              :model-value="searchQuery"
              :fixed="false"
              :safe-area="false"
              padding="12px 12px 28px"
              :placeholder="searchPlaceholder"
              @update:model-value="onSearchQuery"
            />
          </view>
        </view>
      </view>
    </teleport>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, h, nextTick, onBeforeUnmount, ref, useSlots, watch } from 'vue'
import { inject, type PropType } from 'vue'
import { useLingyunTheme } from '../../utils/theme'
import { syncLingyunMpOverlayHold } from '../../utils/mp-overlay-gate'
import {
  LINGYUN_APP_PAGE_SCROLL_LOCK,
  type LingyunAppPageScrollLock,
} from '@/uni_modules/lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'
import LingyunPickerCalDay from '../lingyun-picker-cal-day/lingyun-picker-cal-day.vue'
import { lunarDayText } from './lunar'
import {
  compareYmd,
  daysInMonth,
  formatHour12,
  pad2,
  parseDateRange,
  parseHm,
  parseYm,
  parseYmd,
  parseYmdHm,
  parseYOnly,
  sameYmd,
  shiftMonthYm,
  toH24,
  weekBoundsForDay,
  ymdKey,
  type CalCell,
  type PickerMark,
  type Ymd,
} from './picker-date'

type PickerColumnItem = { label: string; value: number }
type PickerChangeEvent = { detail?: { value?: Array<number | string> } }
type PickerValue = string | number | string[]

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

defineOptions({
  name: 'LingyunPicker',
})

const props = defineProps({
  modelValue: {
    type: [String, Number, Array] as PropType<PickerValue | undefined>,
    default: undefined,
  },
  value: {
    type: [String, Number, Array] as PropType<PickerValue | undefined>,
    default: undefined,
  },
  mode: { type: String, default: 'selector' },
  range: { type: Array as PropType<unknown[]>, default: () => [] },
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
  minuteInterval: { type: [Number, String] as PropType<number | string>, default: 1 },
  /** 日历日格底部农历 */
  lunar: { type: Boolean, default: false },
  /**
   * 日历标记：
   * { date: 'YYYY-MM-DD', badge?: string, dot?: true|'red'|'orange'|'green' }
   * badge：右上角小字；dot：底部圆点（true/默认=红）
   */
  marks: { type: Array as PropType<PickerMark[]>, default: () => [] },
  /**
   * week 模式周起始：0=周日（默认，对齐表头日一二…）… 6=周六
   */
  weekStartsOn: { type: [Number, String] as PropType<number | string>, default: 0 },
  cancelText: { type: String, default: '取消' },
  confirmText: { type: String, default: '完成' },
  /** selector 滚轮下方搜索框。默认关闭 */
  showSearch: { type: Boolean, default: false },
  /**
   * 微信小程序滚轮经过选项时的轻震动反馈。
   * 自定义 scroll-view 滚轮拿不到原生 picker-view 的系统选择音，用轻震动近似。
   */
  haptic: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: '搜索' },
  zIndex: { type: [Number, String] as PropType<number | string>, default: 1200 },
  variant: { type: String, default: 'auto' },
})

const emit = defineEmits(['update:modelValue', 'update:value', 'change', 'cancel'])

const appPageScrollLock = inject(LINGYUN_APP_PAGE_SCROLL_LOCK, null) as LingyunAppPageScrollLock | null
const lingyunFormItem = inject('lingyunFormItem', null) as object | null
const slots = useSlots()

const sheetMounted = ref(false)
const phase = ref<'' | 'enter' | 'open' | 'leave'>('')
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const enterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const draftIndexes = ref<number[]>([0])
const draftY = ref(0)
const draftM = ref(1)
const draftD = ref(1)
const draftH = ref(0)
const draftMi = ref(0)
/** daterange / week 草稿起止（ymd 对象） */
const draftRangeStart = ref<Ymd | null>(null)
const draftRangeEnd = ref<Ymd | null>(null)
const viewY = ref(0)
const viewM = ref(1)
const viewYear = ref(0)
const viewDecadeStart = ref(0)
const calMode = ref<'day' | 'month' | 'year'>('day')
const timeEditing = ref(false)
const timeDraftIndexes = ref<number[]>([0, 0])
const safeBottom = ref(0)
const windowWidth = ref(375)
const searchQuery = ref('')
const keyboardHeight = ref(0)
const _onKeyboardHeight = ref<((res: { height?: number }) => void) | null>(null)
const _onVisualViewport = ref<(() => void) | null>(null)
const dragStartY = ref(0)
const dragDy = ref(0)
const dragging = ref(false)
const calStartX = ref(0)
const calStartY = ref(0)
const calDx = ref(0)
const calDy = ref(0)
const calTracking = ref(false)
const calSwiped = ref(false)
const calOutCells = ref<(CalCell | null)[] | null>(null)
const calOutYear = ref<number | null>(null)
const calOutDecade = ref<number | null>(null)
const calSlideDir = ref(0)
const calSlidePhase = ref<'idle' | 'prepare' | 'animating'>('idle')
const calAnimTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const _appScrollLocked = ref(false)
const _scrollLocked = ref(false)
const _prevBodyOverflow = ref('')
const _prevBodyOverscroll = ref('')
const _prevHtmlOverscroll = ref('')
const mpWheelTops = ref<number[]>([])
const mpTimeWheelTops = ref<number[]>([])
const _mpWheelUser = ref(false)
const _mpSnapApplying = ref(false)
const _mpSnapMap = ref<Record<string, ReturnType<typeof setTimeout>>>({})
/** 每列上一次经过的选项，用来只在跨行时触发反馈 */
const _mpLastIndex = ref<Record<string, number>>({})
const _mpLastFeedbackAt = ref(0)
const _lingyunMpOverlayHold = ref(false)

const weekStartIndex = computed((): number => {
  const n = Number(props.weekStartsOn)
  if (Number.isNaN(n)) return 0
  return ((n % 7) + 7) % 7
})

const dateBounds = computed((): { start: Ymd; end: Ymd } => {
  const now = new Date()
  const defStart = `${now.getFullYear() - 80}-01-01`
  const defEnd = `${now.getFullYear() + 20}-12-31`
  const s = parseYmd(props.start) || parseYmd(defStart)
  const e = parseYmd(props.end) || parseYmd(defEnd)
  return {
    start: s || { y: now.getFullYear() - 80, m: 1, d: 1 },
    end: e || { y: now.getFullYear() + 20, m: 12, d: 31 },
  }
})

function clearTimers(): void {
  if (leaveTimer.value) {
    clearTimeout(leaveTimer.value)
    leaveTimer.value = null
  }
  if (enterTimer.value) {
    clearTimeout(enterTimer.value)
    enterTimer.value = null
  }
  if (calAnimTimer.value) {
    clearTimeout(calAnimTimer.value)
    calAnimTimer.value = null
  }
  const snaps = _mpSnapMap.value || {}
  Object.keys(snaps).forEach((key) => {
    const timer = snaps[key]
    if (timer) clearTimeout(timer)
  })
  _mpSnapMap.value = {}
}

function resetCalSlide(): void {
  if (calAnimTimer.value) {
    clearTimeout(calAnimTimer.value)
    calAnimTimer.value = null
  }
  calOutCells.value = null
  calOutYear.value = null
  calOutDecade.value = null
  calSlideDir.value = 0
  calSlidePhase.value = 'idle'
  calSwiped.value = false
  calTracking.value = false
  calMode.value = 'day'
}

function resetCalSlideKeepMode(): void {
  if (calAnimTimer.value) {
    clearTimeout(calAnimTimer.value)
    calAnimTimer.value = null
  }
  calOutCells.value = null
  calOutYear.value = null
  calOutDecade.value = null
  calSlideDir.value = 0
  calSlidePhase.value = 'idle'
  calSwiped.value = false
  calTracking.value = false
}

/**
 * 天视图格子：`{ y, m, d, out }`，共 42 格。
 * 1 号之前与月末之后用**相邻月真实日期**补齐（`out: true`，灰色不可点），
 * 否则周高亮条会在月首 / 月尾断开。
 */
function buildMonthCells(y: number, m: number): (CalCell | null)[] {
  if (!y || !m) return Array(CAL_CELLS).fill(null)
  const firstDow = new Date(y, m - 1, 1).getDay()
  const lead = (((firstDow - weekStartIndex.value) % 7) + 7) % 7
  const cells: CalCell[] = []
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
}

function slideTrackStyle(hasOut: boolean): Record<string, string> {
  if (!hasOut || !calSlideDir.value) return {}
  const next = calSlideDir.value > 0
  if (calSlidePhase.value === 'prepare') {
    return {
      transform: next ? 'translate3d(0, 0, 0)' : 'translate3d(-50%, 0, 0)',
      transition: 'none',
    }
  }
  if (calSlidePhase.value === 'animating') {
    return {
      transform: next ? 'translate3d(-50%, 0, 0)' : 'translate3d(0, 0, 0)',
      transition: `transform ${CAL_SLIDE_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
    }
  }
  return {}
}

function runCalSlide(afterPrepare?: () => void): void {
  calSlidePhase.value = 'prepare'
  if (typeof afterPrepare === 'function') afterPrepare()
  nextTick(() => {
    const kick = () => {
      calSlidePhase.value = 'animating'
      if (calAnimTimer.value) clearTimeout(calAnimTimer.value)
      calAnimTimer.value = setTimeout(() => {
        calOutCells.value = null
        calOutYear.value = null
        calOutDecade.value = null
        calSlideDir.value = 0
        calSlidePhase.value = 'idle'
        calAnimTimer.value = null
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
}

function buildYearPage(pageStart: number): number[] {
  const { start } = dateBounds.value
  const from = Math.max(start.y, Number(pageStart) || start.y)
  const list: number[] = []
  for (let i = 0; i < YEAR_PAGE_SIZE; i += 1) {
    list.push(from + i)
  }
  return list
}

function decadeStartForYear(year: number): number {
  const { start, end } = dateBounds.value
  const y = Math.min(end.y, Math.max(start.y, Number(year) || start.y))
  const offset = y - start.y
  return start.y + Math.floor(offset / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE
}

function yearPageItemsAt(pageStart: number): number[] {
  return buildYearPage(pageStart)
}

const modeKey = computed((): string => {
  if (
    props.mode === 'date' ||
    props.mode === 'time' ||
    props.mode === 'datetime' ||
    props.mode === 'daterange' ||
    props.mode === 'week'
  ) {
    return props.mode
  }
  return 'selector'
})

const isDateRange = computed((): boolean => modeKey.value === 'daterange')

const isWeek = computed((): boolean => modeKey.value === 'week')

/** 区间高亮（daterange 两点选 / week 整周） */
const isRangeSelect = computed((): boolean => isDateRange.value || isWeek.value)

const current = computed((): PickerValue | undefined => {
  if (props.modelValue !== undefined && props.modelValue !== null) return props.modelValue
  return props.value
})

const resolvedVariant = computed((): string => {
  const v = props.variant
  if (v === 'field' || v === 'cell') return v
  return lingyunFormItem ? 'cell' : 'field'
})

const isCell = computed((): boolean => resolvedVariant.value === 'cell')

const hasTrigger = computed((): boolean => !!slots.trigger)

const showTriggerTitle = computed((): boolean => {
  if (isCell.value) return false
  return !!props.title
})

const useCalendar = computed((): boolean => {
  if (props.pickerStyle === 'wheels') return false
  const calModes =
    modeKey.value === 'date' ||
    modeKey.value === 'datetime' ||
    modeKey.value === 'daterange' ||
    modeKey.value === 'week'
  if (props.pickerStyle === 'calendar') return calModes
  return calModes
})

const useCompactTrigger = computed((): boolean => {
  return (
    modeKey.value === 'date' ||
    modeKey.value === 'time' ||
    modeKey.value === 'datetime' ||
    modeKey.value === 'daterange' ||
    modeKey.value === 'week'
  )
})

const fieldsKey = computed((): string => {
  if (modeKey.value !== 'date') return 'day'
  if (props.fields === 'year' || props.fields === 'month') return props.fields
  return 'day'
})

const displayText = computed((): string => {
  if (modeKey.value === 'selector') {
    const idx = Number(current.value)
    if (Number.isNaN(idx) || idx < 0 || !props.range || !props.range.length) return ''
    const item = props.range[idx]
    if (item == null) return ''
    if (typeof item === 'object' && props.rangeKey) {
      return String((item as Record<string, unknown>)[props.rangeKey] ?? '')
    }
    return String(item)
  }
  if (modeKey.value === 'time' && current.value != null && current.value !== '') {
    const hm = parseHm(current.value)
    if (!hm) return String(current.value)
    if (props.hour12) {
      const { h12, isPm } = formatHour12(hm.h)
      return `${h12}:${pad2(hm.mi)} ${isPm ? 'PM' : 'AM'}`
    }
    return `${pad2(hm.h)}:${pad2(hm.mi)}`
  }
  if (modeKey.value === 'datetime' && current.value != null && current.value !== '') {
    const p = parseYmdHm(current.value)
    if (!p) return String(current.value)
    const datePart = `${p.y}-${pad2(p.m)}-${pad2(p.d)}`
    if (props.hour12) {
      const { h12, isPm } = formatHour12(p.h)
      return `${datePart} ${h12}:${pad2(p.mi)} ${isPm ? 'PM' : 'AM'}`
    }
    return `${datePart} ${pad2(p.h)}:${pad2(p.mi)}`
  }
  if (modeKey.value === 'date' && current.value != null && current.value !== '') {
    if (fieldsKey.value === 'year') {
      const p = parseYOnly(current.value) || parseYmd(current.value) || parseYm(current.value)
      return p ? `${p.y}年` : String(current.value)
    }
    if (fieldsKey.value === 'month') {
      const p = parseYm(current.value) || parseYmd(current.value)
      return p ? `${p.y}年${p.m}月` : String(current.value)
    }
    return String(current.value)
  }
  if (modeKey.value === 'daterange' || modeKey.value === 'week') {
    const parsed = parseDateRange(current.value)
    if (!parsed) return ''
    const a = ymdKey(parsed.start.y, parsed.start.m, parsed.start.d)
    const b = ymdKey(parsed.end.y, parsed.end.m, parsed.end.d)
    return a === b ? a : `${a} → ${b}`
  }
  return current.value != null && current.value !== '' ? String(current.value) : ''
})

const rangeHintText = computed((): string => {
  if (!isRangeSelect.value) return ''
  const s = draftRangeStart.value
  const e = draftRangeEnd.value
  if (isWeek.value) {
    if (!s || !e) return '请选择一周'
    return `${ymdKey(s.y, s.m, s.d)} → ${ymdKey(e.y, e.m, e.d)}`
  }
  if (!s) return '请选择开始日期'
  if (!e) return `开始 ${ymdKey(s.y, s.m, s.d)} · 请选择结束日期`
  return `${ymdKey(s.y, s.m, s.d)} → ${ymdKey(e.y, e.m, e.d)}`
})

const marksMap = computed((): Record<string, PickerMark> => {
  const map: Record<string, PickerMark> = Object.create(null)
  const list = Array.isArray(props.marks) ? props.marks : []
  for (let i = 0; i < list.length; i += 1) {
    const item = list[i]
    if (!item || item.date == null || item.date === '') continue
    const key = String(item.date).slice(0, 10)
    map[key] = item
  }
  return map
})

const calExtraClass = computed((): Record<string, boolean> => {
  const hasMarks = Array.isArray(props.marks) && props.marks.length > 0
  return {
    'lingyun-picker-cal--sub': !!props.lunar || hasMarks,
    'lingyun-picker-cal--range': isRangeSelect.value,
  }
})

const minuteStep = computed((): number => {
  const n = Number(props.minuteInterval) || 1
  const allowed = [1, 5, 10, 15, 30]
  return allowed.includes(n) ? n : 1
})

const rootClass = computed((): string[] => {
  return [
    isCell.value ? 'lingyun-picker--cell' : 'lingyun-picker--field',
    props.disabled ? 'lingyun-picker--disabled' : '',
  ].filter(Boolean)
})

const rowClass = computed((): Record<string, boolean> => {
  return {
    'lingyun-picker__row--disabled': props.disabled,
    'lingyun-picker__row--cell': isCell.value,
  }
})

const valueClass = computed((): Record<string, boolean> => {
  return {
    'lingyun-picker__value--placeholder': !displayText.value,
    'lingyun-picker__value--capsule': useCompactTrigger.value && !!displayText.value,
  }
})

const isDark = computed((): boolean => {
  try {
    return (useLingyunTheme().resolved || 'light') === 'dark'
  } catch {
    return false
  }
})

const themeClass = computed((): string => {
  try {
    return useLingyunTheme().rootClass || 'theme-light'
  } catch {
    return 'theme-light'
  }
})

const reduceMotion = computed((): boolean => {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  } catch {
    /* ignore */
  }
  return false
})

const sheetClass = computed((): string => {
  return [
    themeClass.value,
    phase.value ? `lingyun-picker-sheet--${phase.value}` : '',
    reduceMotion.value ? 'lingyun-picker-sheet--reduce-motion' : '',
    dragging.value ? 'lingyun-picker-sheet--dragging' : '',
    useCalendar.value ? 'lingyun-picker-sheet--calendar' : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const sheetRootStyle = computed((): Record<string, number> => {
  return { zIndex: Number(props.zIndex) || 1200 }
})

/** 宽屏（iPad / 桌面 H5）不铺满：按面板宽上限水平居中 */
const sideInsetPx = computed((): number => {
  const w = Math.max(320, Number(windowWidth.value) || 375)
  return Math.max(INSET_MEDIUM, Math.round((w - PANEL_MAX_WIDTH) / 2))
})

const showSelectorSearch = computed((): boolean => {
  return props.showSearch && modeKey.value === 'selector'
})

const panelBottom = computed((): number => {
  if (showSelectorSearch.value && keyboardHeight.value > 0) return keyboardHeight.value
  return INSET_MEDIUM
})

const panelStyle = computed((): Record<string, string> => {
  const style: Record<string, string> = {
    left: `${sideInsetPx.value}px`,
    right: `${sideInsetPx.value}px`,
    bottom: `${panelBottom.value}px`,
    borderRadius: `${RADIUS}px`,
    paddingBottom: `${Number(safeBottom.value) || 0}px`,
  }
  if (dragging.value) {
    style.transform = `translate3d(0, ${dragDy.value}px, 0)`
    style.transition = 'none'
  }
  return style
})

const indicatorStyle = computed((): string => {
  // 原生选中条透明，改由连续半圆胶囊绘制；边线用 class 清伪元素
  return `height: ${ITEM_H}px; background: transparent; border: 0 solid transparent; border-top: none; border-bottom: none;`
})

const indicatorClass = computed((): string => {
  return 'lingyun-picker-sheet__indicator'
})

const indicatorPillStyle = computed((): Record<string, string | number> => {
  const bg = isDark.value ? 'rgba(120, 120, 128, 0.24)' : 'rgba(120, 120, 128, 0.12)'
  const r = ITEM_H / 2
  return {
    height: `${ITEM_H}px`,
    marginTop: `${-r}px`,
    borderRadius: `${r}px`,
    background: bg,
  }
})

const maskClass = computed((): string => {
  return isDark.value ? 'lingyun-picker-sheet__mask--dark' : 'lingyun-picker-sheet__mask--light'
})

const timeHourColumn = computed((): PickerColumnItem[] => {
  const hours: PickerColumnItem[] = []
  if (props.hour12) {
    for (let h = 1; h <= 12; h += 1) hours.push({ label: String(h), value: h })
  } else {
    for (let h = 0; h < 24; h += 1) hours.push({ label: pad2(h), value: h })
  }
  return hours
})

const timeMinuteColumn = computed((): PickerColumnItem[] => {
  const minutes: PickerColumnItem[] = []
  const step = minuteStep.value
  for (let m = 0; m < 60; m += step) {
    minutes.push({ label: pad2(m), value: m })
  }
  return minutes
})

const timeWheelColumns = computed((): PickerColumnItem[][] => {
  return [timeHourColumn.value, timeMinuteColumn.value]
})

const years = computed((): PickerColumnItem[] => {
  const { start, end } = dateBounds.value
  const list: PickerColumnItem[] = []
  for (let y = start.y; y <= end.y; y += 1) {
    list.push({ label: `${y}年`, value: y })
  }
  return list
})

const columns = computed((): PickerColumnItem[][] => {
  if (modeKey.value === 'selector') {
    const list = Array.isArray(props.range) ? props.range : []
    let items = list.map((item, index) => {
      let label = ''
      if (item != null && typeof item === 'object' && props.rangeKey) {
        label = String((item as Record<string, unknown>)[props.rangeKey] ?? '')
      } else {
        label = item == null ? '' : String(item)
      }
      return { label, value: index }
    })
    const query = showSelectorSearch.value ? String(searchQuery.value || '').trim().toLowerCase() : ''
    if (query) {
      items = items.filter((item) => item.label.toLowerCase().includes(query))
    }
    if (!items.length) return [[{ label: '无匹配', value: -1 }]]
    return [items]
  }
  if (modeKey.value === 'time') {
    return [timeHourColumn.value, timeMinuteColumn.value]
  }
  const fields = props.fields === 'year' || props.fields === 'month' ? props.fields : 'day'
  const yi = draftIndexes.value[0] || 0
  const year = (years.value[yi] && years.value[yi].value) || dateBounds.value.start.y
  const cols = [years.value]
  if (fields === 'year') return cols

  const { start, end } = dateBounds.value
  let monthFrom = 1
  let monthTo = 12
  if (year === start.y) monthFrom = start.m
  if (year === end.y) monthTo = end.m
  const months: PickerColumnItem[] = []
  for (let m = monthFrom; m <= monthTo; m += 1) {
    months.push({ label: `${m}月`, value: m })
  }
  cols.push(months)
  if (fields === 'month') return cols

  const mi = Math.min(draftIndexes.value[1] || 0, months.length - 1)
  const month = (months[mi] && months[mi].value) || monthFrom
  let dayFrom = 1
  let dayTo = daysInMonth(year, month)
  if (year === start.y && month === start.m) dayFrom = start.d
  if (year === end.y && month === end.m) dayTo = Math.min(dayTo, end.d)
  const days: PickerColumnItem[] = []
  for (let d = dayFrom; d <= dayTo; d += 1) {
    days.push({ label: `${d}日`, value: d })
  }
  cols.push(days)
  return cols
})

/** 表头须与格子起始日一致，否则整周高亮会跨两行 */
const weekLabels = computed((): string[] => {
  const start = weekStartIndex.value
  if (!start) return WEEK_LABELS
  return WEEK_LABELS.slice(start).concat(WEEK_LABELS.slice(0, start))
})

const monthItems = computed((): number[] => {
  return MONTH_ITEMS
})

const calendarTitle = computed((): string => {
  const m = MONTH_CN[(viewM.value || 1) - 1] || String(viewM.value)
  return `${viewY.value}年${m}月`
})

const calendarCells = computed((): (CalCell | null)[] => {
  return buildMonthCells(viewY.value, viewM.value)
})

const calTrackClass = computed((): Record<string, boolean> => {
  return {
    'lingyun-picker-cal__track--dual': !!calOutCells.value,
    'lingyun-picker-cal__track--animating': calSlidePhase.value === 'animating',
  }
})

const calTrackStyle = computed((): Record<string, string> => {
  return slideTrackStyle(!!calOutCells.value)
})

const yearTrackClass = computed((): Record<string, boolean> => {
  return {
    'lingyun-picker-cal__track--dual': calOutYear.value != null,
    'lingyun-picker-cal__track--animating': calSlidePhase.value === 'animating',
  }
})

const yearTrackStyle = computed((): Record<string, string> => {
  return slideTrackStyle(calOutYear.value != null)
})

const decadeTrackClass = computed((): Record<string, boolean> => {
  return {
    'lingyun-picker-cal__track--dual': calOutDecade.value != null,
    'lingyun-picker-cal__track--animating': calSlidePhase.value === 'animating',
  }
})

const decadeTrackStyle = computed((): Record<string, string> => {
  return slideTrackStyle(calOutDecade.value != null)
})

const yearPageItems = computed((): number[] => {
  return buildYearPage(viewDecadeStart.value)
})

const yearPageTitle = computed((): string => {
  const { end } = dateBounds.value
  const list = yearPageItems.value.filter((yr) => yr <= end.y)
  if (!list.length) return ''
  const first = list[0]
  const last = list[list.length - 1]
  return first === last ? `${first}年` : `${first}–${last}`
})

const canPrevMonth = computed((): boolean => {
  const { start } = dateBounds.value
  if (viewY.value > start.y) return true
  if (viewY.value === start.y && viewM.value > start.m) return true
  return false
})

const canNextMonth = computed((): boolean => {
  const { end } = dateBounds.value
  if (viewY.value < end.y) return true
  if (viewY.value === end.y && viewM.value < end.m) return true
  return false
})

const canPrevYear = computed((): boolean => {
  return viewYear.value > dateBounds.value.start.y
})

const canNextYear = computed((): boolean => {
  return viewYear.value < dateBounds.value.end.y
})

const canPrevDecade = computed((): boolean => {
  return viewDecadeStart.value > dateBounds.value.start.y
})

const canNextDecade = computed((): boolean => {
  return viewDecadeStart.value + YEAR_PAGE_SIZE <= dateBounds.value.end.y
})

const draftIsPm = computed((): boolean => {
  return draftH.value >= 12
})

const draftTimeLabel = computed((): string => {
  if (props.hour12) {
    const { h12, isPm } = formatHour12(draftH.value)
    return `${h12}:${pad2(draftMi.value)} ${isPm ? 'PM' : 'AM'}`
  }
  return `${pad2(draftH.value)}:${pad2(draftMi.value)}`
})

const todayYmd = computed((): Ymd => {
  const n = new Date()
  return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }
})

function syncSafe(): void {
  try {
    const info =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync()
    const inset = info && info.safeAreaInsets
    safeBottom.value = inset && inset.bottom != null ? Number(inset.bottom) || 0 : 0
    windowWidth.value = Number(info && info.windowWidth) || 375
  } catch {
    safeBottom.value = 0
    windowWidth.value = 375
  }
}

function snapMinute(mi: number): number {
  const step = minuteStep.value
  const snapped = Math.round(mi / step) * step
  return Math.min(60 - step, Math.max(0, snapped))
}

function clampYmdToBounds(ymd: Ymd): Ymd {
  const { start, end } = dateBounds.value
  let y = Number(ymd.y) || start.y
  let m = Number(ymd.m) || 1
  let d = Number(ymd.d) || 1
  if (compareYmd({ y, m, d }, start) < 0) return { ...start }
  if (compareYmd({ y, m, d }, end) > 0) return { ...end }
  const dim = daysInMonth(y, m)
  if (d > dim) d = dim
  return { y, m, d }
}

function bindSearchKeyboard(): void {
  if (!showSelectorSearch.value) return
  if (typeof uni !== 'undefined' && typeof uni.onKeyboardHeightChange === 'function') {
    const onKeyboardHeight = (res: { height?: number }) => {
      keyboardHeight.value = Math.max(0, Number(res && res.height) || 0)
    }
    _onKeyboardHeight.value = onKeyboardHeight
    uni.onKeyboardHeightChange(onKeyboardHeight)
  }
  // #ifdef H5
  const viewport = typeof window === 'undefined' ? null : window.visualViewport
  if (viewport) {
    const onVisualViewport = () => {
      const vv = window.visualViewport
      if (!vv) return
      const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      keyboardHeight.value = covered > 80 ? covered : 0
    }
    _onVisualViewport.value = onVisualViewport
    viewport.addEventListener('resize', onVisualViewport)
    viewport.addEventListener('scroll', onVisualViewport)
  }
  // #endif
}

function unbindSearchKeyboard(): void {
  const onKeyboardHeight = _onKeyboardHeight.value
  if (onKeyboardHeight && typeof uni !== 'undefined' && typeof uni.offKeyboardHeightChange === 'function') {
    uni.offKeyboardHeightChange(onKeyboardHeight)
  }
  _onKeyboardHeight.value = null
  // #ifdef H5
  const onVisualViewport = _onVisualViewport.value
  const viewport = typeof window === 'undefined' ? null : window.visualViewport
  if (onVisualViewport && viewport) {
    viewport.removeEventListener('resize', onVisualViewport)
    viewport.removeEventListener('scroll', onVisualViewport)
  }
  _onVisualViewport.value = null
  // #endif
  keyboardHeight.value = 0
}

function lockPageScroll(): void {
  try {
    const lockApi = appPageScrollLock as LingyunAppPageScrollLock | null
    if (lockApi && typeof lockApi.lock === 'function' && !_appScrollLocked.value) {
      lockApi.lock()
      _appScrollLocked.value = true
    }
  } catch {
    /* ignore */
  }
  // #ifdef H5
  if (typeof document === 'undefined') return
  if (_scrollLocked.value) return
  const body = document.body
  const html = document.documentElement
  _prevBodyOverflow.value = body.style.overflow
  _prevBodyOverscroll.value = body.style.overscrollBehavior
  _prevHtmlOverscroll.value = html.style.overscrollBehavior
  body.style.overflow = 'hidden'
  body.style.overscrollBehavior = 'none'
  html.style.overscrollBehavior = 'none'
  _scrollLocked.value = true
  // #endif
}

function unlockPageScroll(): void {
  try {
    const lockApi = appPageScrollLock as LingyunAppPageScrollLock | null
    if (_appScrollLocked.value && lockApi && typeof lockApi.unlock === 'function') {
      lockApi.unlock()
    }
    _appScrollLocked.value = false
  } catch {
    _appScrollLocked.value = false
  }
  // #ifdef H5
  if (typeof document === 'undefined') return
  if (!_scrollLocked.value) return
  const body = document.body
  const html = document.documentElement
  body.style.overflow = _prevBodyOverflow.value || ''
  body.style.overscrollBehavior = _prevBodyOverscroll.value || ''
  html.style.overscrollBehavior = _prevHtmlOverscroll.value || ''
  _scrollLocked.value = false
  // #endif
}

function closeSheet(after?: () => void): void {
  clearTimers()
  if (!sheetMounted.value) {
    unbindSearchKeyboard()
    unlockPageScroll()
    if (typeof after === 'function') after()
    return
  }
  phase.value = 'leave'
  leaveTimer.value = setTimeout(
    () => {
      sheetMounted.value = false
      phase.value = ''
      dragDy.value = 0
      dragging.value = false
      timeEditing.value = false
      resetCalSlide()
      unbindSearchKeyboard()
      unlockPageScroll()
      leaveTimer.value = null
      if (typeof after === 'function') after()
    },
    reduceMotion.value ? 16 : LEAVE_MS,
  )
}

function onCancel(): void {
  emit('cancel')
  closeSheet()
}

function applyMpWheelTops(indexes?: number[]): void {
  const src = indexes || draftIndexes.value
  mpWheelTops.value = src.map((idx) => Math.max(0, Number(idx) || 0) * ITEM_H)
  src.forEach((idx, colIndex) => {
    _mpLastIndex.value[`main:${colIndex}`] = Math.max(0, Number(idx) || 0)
  })
}

function applyMpTimeWheelTops(indexes?: number[]): void {
  const src = indexes || timeDraftIndexes.value
  mpTimeWheelTops.value = src.map((idx) => Math.max(0, Number(idx) || 0) * ITEM_H)
  src.forEach((idx, colIndex) => {
    _mpLastIndex.value[`time:${colIndex}`] = Math.max(0, Number(idx) || 0)
  })
}

function syncTimeDraftIndexes(): void {
  const mi = snapMinute(draftMi.value)
  draftMi.value = mi
  if (props.hour12) {
    const { h12 } = formatHour12(draftH.value)
    const hi = Math.max(0, timeHourColumn.value.findIndex((x) => x.value === h12))
    const mii = Math.max(0, timeMinuteColumn.value.findIndex((x) => x.value === mi))
    timeDraftIndexes.value = [hi, mii]
  } else {
    timeDraftIndexes.value = [
      Math.min(23, Math.max(0, draftH.value)),
      Math.max(0, timeMinuteColumn.value.findIndex((x) => x.value === mi)),
    ]
  }
  if (!_mpWheelUser.value) applyMpTimeWheelTops(timeDraftIndexes.value)
}

function syncCalendarDraftFromValue(): void {
  const now = new Date()
  const fallback = {
    y: now.getFullYear(),
    m: now.getMonth() + 1,
    d: now.getDate(),
    h: now.getHours(),
    mi: snapMinute(now.getMinutes()),
  }
  let parsed: (Ymd & { h?: number; mi?: number }) | null = null
  if (modeKey.value === 'datetime') parsed = parseYmdHm(current.value)
  else if (modeKey.value === 'daterange' || modeKey.value === 'week') {
    const range = parseDateRange(current.value)
    if (range) {
      if (modeKey.value === 'week') {
        const week = weekBoundsForDay(
          range.start.y,
          range.start.m,
          range.start.d,
          weekStartIndex.value,
        )
        draftRangeStart.value = { ...week.start }
        draftRangeEnd.value = { ...week.end }
        parsed = { ...week.start, h: 0, mi: 0 }
      } else {
        draftRangeStart.value = { ...range.start }
        draftRangeEnd.value = { ...range.end }
        parsed = { ...range.start, h: 0, mi: 0 }
      }
    } else {
      draftRangeStart.value = null
      draftRangeEnd.value = null
    }
  } else if (modeKey.value === 'date') {
    if (fieldsKey.value === 'year') {
      parsed = parseYOnly(current.value) || parseYmd(current.value) || parseYm(current.value)
    } else if (fieldsKey.value === 'month') {
      parsed = parseYm(current.value) || parseYmd(current.value)
    } else {
      parsed = parseYmd(current.value)
    }
    if (parsed) parsed = { ...parsed, h: 0, mi: 0 }
  }
  const base = parsed || fallback
  const clamped = clampYmdToBounds(base)
  const src = {
    ...clamped,
    h: Math.min(23, Math.max(0, base.h != null ? base.h : fallback.h)),
    mi: snapMinute(base.mi != null ? base.mi : fallback.mi),
  }
  draftY.value = src.y
  draftM.value = src.m || 1
  draftD.value = src.d || 1
  draftH.value = src.h
  draftMi.value = src.mi
  viewY.value = draftY.value
  viewM.value = draftM.value
  viewYear.value = draftY.value
  viewDecadeStart.value = decadeStartForYear(draftY.value)
  if (modeKey.value === 'daterange' || modeKey.value === 'week') calMode.value = 'day'
  else if (fieldsKey.value === 'year') calMode.value = 'year'
  else if (fieldsKey.value === 'month') calMode.value = 'month'
  else calMode.value = 'day'
  syncTimeDraftIndexes()
}

function indexesFromValue(): number[] {
  if (modeKey.value === 'selector') {
    const idx = Number(current.value)
    const max = Math.max(0, (props.range && props.range.length ? props.range.length : 1) - 1)
    if (Number.isNaN(idx) || idx < 0) return [0]
    return [Math.min(idx, max)]
  }
  if (modeKey.value === 'time') {
    const hm = parseHm(current.value) || { h: 0, mi: 0 }
    const mi = snapMinute(hm.mi)
    if (props.hour12) {
      const { h12 } = formatHour12(hm.h)
      const hi = Math.max(0, timeHourColumn.value.findIndex((x) => x.value === h12))
      const mii = Math.max(0, timeMinuteColumn.value.findIndex((x) => x.value === mi))
      return [hi, mii]
    }
    return [
      Math.min(23, Math.max(0, hm.h)),
      Math.max(0, timeMinuteColumn.value.findIndex((x) => x.value === mi)),
    ]
  }
  const { start, end } = dateBounds.value
  const now = new Date()
  const today = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() }
  const ymd = clampYmdToBounds(parseYmd(current.value) || today)
  const yi = Math.max(0, years.value.findIndex((x) => x.value === ymd.y))
  const fields = props.fields === 'year' || props.fields === 'month' ? props.fields : 'day'
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
}

function valueFromIndexes(indexes: number[]): PickerValue {
  const cols = columns.value
  if (modeKey.value === 'selector') {
    const col = cols[0] || []
    const item = col[indexes[0] || 0]
    return item ? item.value : 0
  }
  if (modeKey.value === 'time') {
    const hItem = cols[0][indexes[0] || 0]
    const mItem = cols[1][indexes[1] || 0]
    let h = (hItem && hItem.value) || 0
    const mi = (mItem && mItem.value) || 0
    if (props.hour12) {
      h = toH24(h, draftIsPm.value)
    }
    return `${pad2(h)}:${pad2(mi)}`
  }
  const fields = props.fields === 'year' || props.fields === 'month' ? props.fields : 'day'
  const y = (cols[0][indexes[0] || 0] && cols[0][indexes[0] || 0].value) || dateBounds.value.start.y
  if (fields === 'year') return `${y}`
  const m = (cols[1][indexes[1] || 0] && cols[1][indexes[1] || 0].value) || 1
  if (fields === 'month') return `${y}-${pad2(m)}`
  const d = (cols[2][indexes[2] || 0] && cols[2][indexes[2] || 0].value) || 1
  return `${y}-${pad2(m)}-${pad2(d)}`
}

function valueFromCalendar(): PickerValue {
  if (isRangeSelect.value) {
    const s = draftRangeStart.value
    if (!s) {
      if (isWeek.value) {
        const today = clampYmdToBounds(todayYmd.value)
        const week = weekBoundsForDay(today.y, today.m, today.d, weekStartIndex.value)
        return [ymdKey(week.start.y, week.start.m, week.start.d), ymdKey(week.end.y, week.end.m, week.end.d)]
      }
      const today = clampYmdToBounds(todayYmd.value)
      const key = ymdKey(today.y, today.m, today.d)
      return [key, key]
    }
    const e = draftRangeEnd.value || s
    return [ymdKey(s.y, s.m, s.d), ymdKey(e.y, e.m, e.d)]
  }
  if (fieldsKey.value === 'year') return `${draftY.value}`
  if (fieldsKey.value === 'month') return `${draftY.value}-${pad2(draftM.value)}`
  const date = ymdKey(draftY.value, draftM.value, draftD.value)
  if (modeKey.value === 'date') return date
  return `${date} ${pad2(draftH.value)}:${pad2(draftMi.value)}`
}

function confirmCalendarValue(): void {
  const next = valueFromCalendar()
  emit('update:modelValue', next)
  emit('update:value', next)
  emit('change', { value: next })
  closeSheet()
}

function clampDraftToColumns(): void {
  const cols = columns.value
  const next = cols.map((col, i) => {
    const max = Math.max(0, col.length - 1)
    const cur = Number(draftIndexes.value[i]) || 0
    return Math.min(max, Math.max(0, cur))
  })
  const changed =
    next.some((v, i) => v !== (draftIndexes.value[i] || 0)) || next.length !== draftIndexes.value.length
  if (changed) {
    draftIndexes.value = next
    if (!_mpWheelUser.value) applyMpWheelTops(next)
  }
}

function onConfirm(): void {
  if (showSelectorSearch.value) {
    const col = (columns.value[0] || []) as PickerColumnItem[]
    const item = col[draftIndexes.value[0] || 0]
    if (!item || item.value < 0) return
  }
  let next: PickerValue
  if (useCalendar.value) {
    next = valueFromCalendar()
  } else {
    clampDraftToColumns()
    next = valueFromIndexes(draftIndexes.value)
  }
  emit('update:modelValue', next)
  emit('update:value', next)
  emit('change', { value: next })
  closeSheet()
}

function isDayDisabledAt(day: number, y: number, m: number): boolean {
  if (!day) return true
  const cur = { y, m, d: day }
  const { start, end } = dateBounds.value
  return compareYmd(cur, start) < 0 || compareYmd(cur, end) > 0
}

/** @param {{ y: number, m: number, d: number, out: boolean } | null} cell */
function cellClass(cell: CalCell | null): Record<string, boolean> {
  if (!cell) return { 'lingyun-picker-cal__cell--empty': true }
  const { y, m, d } = cell
  const today = d === todayYmd.value.d && y === todayYmd.value.y && m === todayYmd.value.m
  // 相邻月补位格：不可点，但仍参与周 / 区间高亮，条带才不断开
  const disabled = cell.out || isDayDisabledAt(d, y, m)
  if (isRangeSelect.value) {
    const cur = { y, m, d }
    const s = draftRangeStart.value
    const e = draftRangeEnd.value
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
      'lingyun-picker-cal__cell--in-range': !!(inMiddle || (isStart && e && !sameYmd(s, e)) || (isEnd && s && !sameYmd(s, e))),
    }
  }
  const selected = d === draftD.value && y === draftY.value && m === draftM.value
  return {
    'lingyun-picker-cal__cell--selected': selected,
    'lingyun-picker-cal__cell--today': today && !selected,
    'lingyun-picker-cal__cell--disabled': disabled,
    'lingyun-picker-cal__cell--outside': !!cell.out,
  }
}

function dayRangeFlags(day: number, y: number, m: number): {
  selected: boolean
  rangeStart: boolean
  rangeEnd: boolean
  inRange: boolean
} {
  if (!isRangeSelect.value || !day) {
    return { selected: false, rangeStart: false, rangeEnd: false, inRange: false }
  }
  const cur = { y, m, d: day }
  const s = draftRangeStart.value
  const e = draftRangeEnd.value
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
}

/** @param {{ y: number, m: number, d: number, out: boolean } | null} cell */
function dayDecor(cell: CalCell | null): {
  day: string | number
  badgeText: string
  lunar: string
  dotTone: string
  selected: boolean
  today: boolean
  disabled: boolean
  outside: boolean
  compact: boolean
  selectTone: string
} {
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
  const mark = marksMap.value[ymdKey(y, m, day)] || null
  let badgeText = ''
  if (mark) {
    if (typeof mark.badge === 'string' && mark.badge.trim()) {
      badgeText = mark.badge.trim()
    } else if (typeof mark.badgeText === 'string' && mark.badgeText.trim()) {
      badgeText = mark.badgeText.trim()
    }
  }
  let lunar = ''
  if (props.lunar) {
    lunar = lunarDayText(y, m, day)
  }
  let dotTone = ''
  if (mark && mark.dot !== false && mark.dot != null) {
    const raw = mark.dot === true ? 'red' : String(mark.dot).toLowerCase()
    if (raw === 'red' || raw === 'default' || raw === '1') dotTone = 'red'
    else if (raw === 'orange' || raw === 'warning') dotTone = 'orange'
    else if (raw === 'green' || raw === 'success') dotTone = 'green'
  }
  const flags = dayRangeFlags(day, y, m)
  const selected = isRangeSelect.value
    ? flags.selected
    : day === draftD.value && y === draftY.value && m === draftM.value
  const today =
    day === todayYmd.value.d && y === todayYmd.value.y && m === todayYmd.value.m
  const hasMarks = Array.isArray(props.marks) && props.marks.length > 0
  const compact = !!props.lunar || hasMarks
  return {
    day,
    badgeText,
    lunar,
    dotTone,
    selected,
    today,
    disabled: isDayDisabledAt(day, y, m),
    outside: !!cell.out,
    compact,
    selectTone: compact || isRangeSelect.value ? 'red' : 'label',
  }
}

/** @param {{ y: number, m: number, d: number, out: boolean } | null} cell */
function onSelectDay(cell: CalCell | null): void {
  if (calSwiped.value || calSlidePhase.value !== 'idle') {
    calSwiped.value = false
    return
  }
  // 补位格只做视觉衔接，不可选（要跨月请先翻月）
  if (!cell || cell.out) return
  const day = cell.d
  if (isDayDisabledAt(day, cell.y, cell.m)) return
  if (isWeek.value) {
    const week = weekBoundsForDay(cell.y, cell.m, day, weekStartIndex.value)
    draftRangeStart.value = { ...week.start }
    draftRangeEnd.value = { ...week.end }
    draftY.value = cell.y
    draftM.value = cell.m
    draftD.value = day
    return
  }
  if (isDateRange.value) {
    const clicked = { y: cell.y, m: cell.m, d: day }
    const s = draftRangeStart.value
    const e = draftRangeEnd.value
    if (!s || (s && e)) {
      draftRangeStart.value = clicked
      draftRangeEnd.value = null
    } else if (compareYmd(clicked, s) < 0) {
      draftRangeEnd.value = { ...s }
      draftRangeStart.value = clicked
    } else {
      draftRangeEnd.value = clicked
    }
    draftY.value = clicked.y
    draftM.value = clicked.m
    draftD.value = clicked.d
    return
  }
  draftY.value = cell.y
  draftM.value = cell.m
  draftD.value = day
}

function monthLabel(m: number): string {
  return MONTH_SHORT[(m || 1) - 1] || `${m}月`
}

function isMonthDisabled(m: number, y: number): boolean {
  const { start, end } = dateBounds.value
  if (y < start.y || y > end.y) return true
  if (y === start.y && m < start.m) return true
  if (y === end.y && m > end.m) return true
  return false
}

function monthCellClass(m: number, y: number): Record<string, boolean> {
  // 仅高亮「已选日期」所在年月；浏览其它年份时不跟着手动 viewM
  const selected = y === draftY.value && m === draftM.value
  return {
    'lingyun-picker-cal__month-cell--selected': selected,
    'lingyun-picker-cal__month-cell--disabled': isMonthDisabled(m, y),
  }
}

function isYearDisabled(yr: number): boolean {
  const { start, end } = dateBounds.value
  return yr < start.y || yr > end.y
}

function yearCellClass(yr: number): Record<string, boolean> {
  return {
    'lingyun-picker-cal__month-cell--selected': yr === draftY.value,
    'lingyun-picker-cal__month-cell--disabled': isYearDisabled(yr),
  }
}

function openMonthView(): void {
  if (fieldsKey.value === 'year') return
  if (calSlidePhase.value !== 'idle') return
  resetCalSlideKeepMode()
  viewYear.value = viewY.value
  calMode.value = 'month'
}

function openYearView(): void {
  if (calSlidePhase.value !== 'idle') return
  resetCalSlideKeepMode()
  viewDecadeStart.value = decadeStartForYear(viewYear.value)
  calMode.value = 'year'
}

function shiftMonth(delta: number): void {
  if (calMode.value !== 'day') return
  if (calSlidePhase.value !== 'idle') return
  if (delta < 0 && !canPrevMonth.value) return
  if (delta > 0 && !canNextMonth.value) return
  let y = viewY.value
  let m = viewM.value + delta
  if (m < 1) {
    m = 12
    y -= 1
  } else if (m > 12) {
    m = 1
    y += 1
  }
  if (reduceMotion.value) {
    viewY.value = y
    viewM.value = m
    return
  }
  calOutCells.value = buildMonthCells(viewY.value, viewM.value)
  calOutYear.value = null
  calOutDecade.value = null
  calSlideDir.value = delta
  runCalSlide(() => {
    viewY.value = y
    viewM.value = m
  })
}

function shiftYear(delta: number): void {
  if (calMode.value !== 'month') return
  if (calSlidePhase.value !== 'idle') return
  if (delta < 0 && !canPrevYear.value) return
  if (delta > 0 && !canNextYear.value) return
  const next = viewYear.value + delta
  if (reduceMotion.value) {
    viewYear.value = next
    return
  }
  calOutYear.value = viewYear.value
  calOutCells.value = null
  calOutDecade.value = null
  calSlideDir.value = delta
  runCalSlide(() => {
    viewYear.value = next
  })
}

function shiftDecade(delta: number): void {
  if (calMode.value !== 'year') return
  if (calSlidePhase.value !== 'idle') return
  if (delta < 0 && !canPrevDecade.value) return
  if (delta > 0 && !canNextDecade.value) return
  const { start, end } = dateBounds.value
  let next = viewDecadeStart.value + delta * YEAR_PAGE_SIZE
  if (next < start.y) next = start.y
  if (next > end.y) next = decadeStartForYear(end.y)
  if (next === viewDecadeStart.value) return
  if (reduceMotion.value) {
    viewDecadeStart.value = next
    return
  }
  calOutDecade.value = viewDecadeStart.value
  calOutCells.value = null
  calOutYear.value = null
  calSlideDir.value = delta
  runCalSlide(() => {
    viewDecadeStart.value = next
  })
}

function onSelectMonth(m: number): void {
  if (calSwiped.value || calSlidePhase.value !== 'idle') {
    calSwiped.value = false
    return
  }
  if (isMonthDisabled(m, viewYear.value)) return
  viewY.value = viewYear.value
  viewM.value = m
  draftY.value = viewYear.value
  draftM.value = m
  const dim = daysInMonth(viewY.value, viewM.value)
  if (draftD.value > dim) draftD.value = dim
  if (fieldsKey.value === 'month') {
    confirmCalendarValue()
    return
  }
  calMode.value = 'day'
  resetCalSlideKeepMode()
}

function onSelectYear(yr: number): void {
  if (calSwiped.value || calSlidePhase.value !== 'idle') {
    calSwiped.value = false
    return
  }
  if (isYearDisabled(yr)) return
  viewYear.value = yr
  draftY.value = yr
  viewDecadeStart.value = decadeStartForYear(yr)
  if (fieldsKey.value === 'year') {
    confirmCalendarValue()
    return
  }
  calMode.value = 'month'
  resetCalSlideKeepMode()
}

function onCalTouchStart(e: TouchEvent): void {
  const t = e.touches && e.touches[0]
  if (!t) return
  calStartX.value = t.clientX
  calStartY.value = t.clientY
  calDx.value = 0
  calDy.value = 0
  calTracking.value = true
  calSwiped.value = false
}

function onCalTouchMove(e: TouchEvent): void {
  if (!calTracking.value) return
  const t = e.touches && e.touches[0]
  if (!t) return
  calDx.value = t.clientX - calStartX.value
  calDy.value = t.clientY - calStartY.value
}

function onCalTouchEnd(): void {
  if (!calTracking.value) return
  const dx = calDx.value
  const dy = calDy.value
  calTracking.value = false
  calDx.value = 0
  calDy.value = 0
  if (Math.abs(dx) < CAL_SWIPE_DX) return
  if (Math.abs(dx) < Math.abs(dy) * CAL_SWIPE_RATIO) return
  calSwiped.value = true
  const delta = dx < 0 ? 1 : -1
  if (calMode.value === 'year') shiftDecade(delta)
  else if (calMode.value === 'month') shiftYear(delta)
  else shiftMonth(delta)
}

function toggleTimeEditing(): void {
  timeEditing.value = !timeEditing.value
  if (timeEditing.value) syncTimeDraftIndexes()
}

function setAmPm(isPm: boolean): void {
  const { h12 } = formatHour12(draftH.value)
  draftH.value = toH24(h12, isPm)
  syncTimeDraftIndexes()
}

function onTimePickChange(e: PickerChangeEvent): void {
  const raw = (e && e.detail && e.detail.value) || []
  timeDraftIndexes.value = raw.map((n) => Number(n) || 0)
  const hItem = timeHourColumn.value[timeDraftIndexes.value[0] || 0]
  const mItem = timeMinuteColumn.value[timeDraftIndexes.value[1] || 0]
  let h = (hItem && hItem.value) || 0
  if (props.hour12) h = toH24(h, draftIsPm.value)
  draftH.value = h
  draftMi.value = (mItem && mItem.value) || 0
}

function onPickChange(e: PickerChangeEvent): void {
  const raw = (e && e.detail && e.detail.value) || []
  draftIndexes.value = raw.map((n) => Number(n) || 0)
  if (modeKey.value === 'time' && props.hour12) {
    const hItem = timeHourColumn.value[draftIndexes.value[0] || 0]
    const mItem = timeMinuteColumn.value[draftIndexes.value[1] || 0]
    const h12 = (hItem && hItem.value) || 12
    draftH.value = toH24(h12, draftIsPm.value)
    draftMi.value = (mItem && mItem.value) || 0
  }
  nextTick(() => clampDraftToColumns())
}

function openAnim(): void {
  clearTimers()
  sheetMounted.value = true
  dragDy.value = 0
  dragging.value = false
  phase.value = 'enter'
  nextTick(() => {
    const kick = () => {
      enterTimer.value = setTimeout(
        () => {
          phase.value = 'open'
          enterTimer.value = null
        },
        reduceMotion.value ? 16 : ENTER_KICK_MS,
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
}

function open(): void {
  if (props.disabled) return
  searchQuery.value = ''
  timeEditing.value = false
  resetCalSlide()
  if (useCalendar.value) {
    syncCalendarDraftFromValue()
  } else {
    if (modeKey.value === 'time') {
      const hm = parseHm(current.value) || { h: 0, mi: 0 }
      draftH.value = hm.h
      draftMi.value = snapMinute(hm.mi)
    }
    draftIndexes.value = indexesFromValue()
    applyMpWheelTops(draftIndexes.value)
    nextTick(() => clampDraftToColumns())
  }
  syncSafe()
  bindSearchKeyboard()
  lockPageScroll()
  openAnim()
}

function onPanelTouchMove(): void {
  /* stop 已在模板 */
}

function onChromeTouchStart(e: TouchEvent): void {
  const t = e.touches && e.touches[0]
  if (!t) return
  dragStartY.value = t.clientY
  dragDy.value = 0
  dragging.value = true
}

function onChromeTouchMove(e: TouchEvent): void {
  if (!dragging.value) return
  const t = e.touches && e.touches[0]
  if (!t) return
  const dy = t.clientY - dragStartY.value
  dragDy.value = dy > 0 ? dy : 0
}

function onChromeTouchEnd(): void {
  if (!dragging.value) return
  const dy = dragDy.value
  dragging.value = false
  dragDy.value = 0
  if (dy >= DISMISS_DY) {
    onCancel()
  }
}

function onSearchQuery(value: unknown): void {
  const col = (columns.value[0] || []) as PickerColumnItem[]
  const currentItem = col[draftIndexes.value[0] || 0]
  const keep = currentItem && currentItem.value >= 0 ? currentItem.value : Number(current.value)
  searchQuery.value = value == null ? '' : String(value)
  const next = (columns.value[0] || []) as PickerColumnItem[]
  const found = next.findIndex((item) => item.value === keep)
  draftIndexes.value = [found >= 0 ? found : 0]
  applyMpWheelTops(draftIndexes.value)
}

function playMpWheelFeedback(): void {
  if (!props.haptic) return
  // #ifdef MP-WEIXIN
  const now = Date.now()
  if (now - _mpLastFeedbackAt.value < 60) return
  _mpLastFeedbackAt.value = now
  try {
    uni.vibrateShort({ type: 'light' })
  } catch {
    /* 部分基础库 / 设备不支持震动 */
  }
  // #endif
}

function scheduleMpSnap(which: 'main' | 'time', colIndex: number, top: number): void {
  const key = `${which}:${colIndex}`
  const prev = _mpSnapMap.value[key]
  if (prev) clearTimeout(prev)
  _mpSnapMap.value[key] = setTimeout(() => {
    delete _mpSnapMap.value[key]
    _mpWheelUser.value = false
    const snapped = Math.round(Math.max(0, top) / ITEM_H) * ITEM_H
    if (Math.abs(top - snapped) < 0.5) return
    const tops = (which === 'time' ? mpTimeWheelTops.value : mpWheelTops.value).slice()
    const cur = tops[colIndex]
    tops[colIndex] = snapped === cur ? snapped + 0.01 : snapped
    _mpSnapApplying.value = true
    if (which === 'time') mpTimeWheelTops.value = tops
    else mpWheelTops.value = tops
    nextTick(() => {
      _mpSnapApplying.value = false
    })
  }, 80)
}

function onMpColumnScroll(event: unknown, colIndex: number, which: 'main' | 'time'): void {
  if (_mpSnapApplying.value) return
  const detail = (event as { detail?: { scrollTop?: number } } | null)?.detail
  const top = Number(detail && detail.scrollTop) || 0
  const cols = which === 'time' ? timeWheelColumns.value : columns.value
  const col = cols[colIndex] || []
  const max = Math.max(0, col.length - 1)
  const idx = Math.min(max, Math.max(0, Math.round(top / ITEM_H)))
  _mpWheelUser.value = true
  const key = `${which}:${colIndex}`
  const lastIndex = _mpLastIndex.value[key]
  if (lastIndex !== idx) {
    _mpLastIndex.value[key] = idx
    if (lastIndex !== undefined) playMpWheelFeedback()
  }
  if (which === 'time') {
    const next = timeDraftIndexes.value.slice()
    next[colIndex] = idx
    onTimePickChange({ detail: { value: next } })
  } else {
    const next = draftIndexes.value.slice()
    next[colIndex] = idx
    onPickChange({ detail: { value: next } })
  }
  scheduleMpSnap(which, colIndex, top)
}

function onMpWheelScroll(event: unknown, colIndex: number): void {
  onMpColumnScroll(event, colIndex, 'main')
}

function onMpTimeWheelScroll(event: unknown, colIndex: number): void {
  onMpColumnScroll(event, colIndex, 'time')
}

watch(
  phase,
  (value: string) => {
    _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
      !!_lingyunMpOverlayHold.value,
      !!value,
    )
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  _lingyunMpOverlayHold.value = syncLingyunMpOverlayHold(
    !!_lingyunMpOverlayHold.value,
    false,
  )
  clearTimers()
  unbindSearchKeyboard()
  unlockPageScroll()
})

defineExpose({ open, closeSheet, onCancel, onConfirm })
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

.lingyun-picker__trigger {
  width: 100%;
  min-width: 0;
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

.lingyun-picker-sheet__mp-cols {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 216px;
  position: relative;
  z-index: 1;
}

.lingyun-picker-sheet__mp-cols--time {
  height: 144px;
}

.lingyun-picker-sheet__mp-col {
  flex: 1;
  width: 0;
  height: 216px;
}

.lingyun-picker-sheet__mp-cols--time .lingyun-picker-sheet__mp-col {
  height: 144px;
}

.lingyun-picker-sheet__mp-pad {
  height: 90px;
}

.lingyun-picker-sheet__mp-pad--time {
  height: 54px;
}

.lingyun-picker-sheet__mp-mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
}

.lingyun-picker-sheet__search {
  flex-shrink: 0;
  width: 100%;
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
