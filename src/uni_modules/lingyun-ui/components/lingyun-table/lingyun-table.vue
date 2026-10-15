<template>
  <view class="lingyun-table" :class="rootClass" :style="rootStyle">
    <view v-if="showToolbar()" class="lingyun-table__toolbar">
      <view class="lingyun-table__toolbar-main">
        <lingyun-icon v-if="icon" :type="icon" :size="titleIconSize" color="label" />
        <text v-if="title" class="lingyun-table__toolbar-title" :class="{ 'lingyun-table__toolbar-title--gap': !!icon }">{{ title }}</text>
      </view>
      <view class="lingyun-table__toolbar-tools">
        <view
          v-if="showRefresh"
          class="lingyun-table__tool"
          hover-class="lingyun-table__tool--hover"
          :hover-stay-time="70"
          @click="onRefresh"
        >
          <lingyun-icon type="reload" :size="toolIconSize" color="secondary" />
        </view>
        <lingyun-popover
          v-if="columnPicker"
          v-model="columnPickerOpen"
          placement="bottom"
          :width="220"
          arrow-align="trailing"
        >
          <template #trigger="{ toggle }">
            <view
              class="lingyun-table__tool"
              hover-class="lingyun-table__tool--hover"
              :hover-stay-time="70"
              @click.stop="toggle"
            >
              <lingyun-icon type="list" :size="toolIconSize" color="secondary" />
            </view>
          </template>
          <scroll-view scroll-y class="lingyun-table__pick-scroll" :style="pickerScrollStyle">
            <view
              v-for="col in columns"
              :key="col.key"
              class="lingyun-table__pick"
              hover-class="lingyun-table__pick--hover"
              :hover-stay-time="70"
              @click.stop="toggleColumn(col.key)"
            >
              <view class="lingyun-table__check" :class="{ 'lingyun-table__check--on': columnShown(col.key) }">
                <lingyun-icon v-if="columnShown(col.key)" type="checkmarkempty" :size="tickSize" color="#ffffff" />
              </view>
              <text class="lingyun-table__pick-text">{{ col.title }}</text>
            </view>
          </scroll-view>
        </lingyun-popover>
        <view
          v-if="exportExcel"
          class="lingyun-table__tool"
          hover-class="lingyun-table__tool--hover"
          :hover-stay-time="70"
          @click="onExportExcel"
        >
          <lingyun-icon type="download" :size="toolIconSize" color="secondary" />
        </view>
        <slot name="tools" />
      </view>
    </view>
    <view
      v-if="activeFilters.length"
      class="lingyun-table__filters"
      @wheel="onChipsWheel"
      @mousedown="onChipsMouseDown"
    >
      <scroll-view class="lingyun-table__filters-scroll" scroll-x enable-flex :show-scrollbar="false">
        <view class="lingyun-table__filters-track">
          <view
            v-for="item in activeFilters"
            :key="item.key"
            class="lingyun-table__chip"
            hover-class="lingyun-table__chip--hover"
            :hover-stay-time="70"
            @click="onChipTap(item.key)"
          >
            <text class="lingyun-table__chip-text">{{ item.label }}</text>
            <view class="lingyun-table__chip-x" @click.stop="onChipClear(item.key)">
              <lingyun-icon type="closeempty" :size="chipIconSize" color="primary" />
            </view>
          </view>
          <view
            v-if="activeFilters.length > 1"
            class="lingyun-table__chip lingyun-table__chip--clear"
            hover-class="lingyun-table__chip--hover"
            :hover-stay-time="70"
            @click="clearAllFilters"
          >
            <text class="lingyun-table__chip-text lingyun-table__chip-text--clear">清除全部</text>
          </view>
        </view>
      </scroll-view>
    </view>
    <view
      class="lingyun-table__head"
      @mousewheel.stop="onTableWheel"
      @wheel.stop="onTableWheel"
      @mouseenter="onTablePointerEnter"
      @pointerenter="onTablePointerEnter"
    >
      <view v-if="leftWidth" class="lingyun-table__side" :style="sideStyle(leftWidth)">
        <view class="lingyun-table__row lingyun-table__row--head">
          <view
            v-if="selection"
            class="lingyun-table__cell lingyun-table__cell--check"
            @click.stop="togglePage"
          >
            <view class="lingyun-table__check" :class="pageCheckClass">
              <lingyun-icon v-if="pageAll" type="checkmarkempty" :size="tickSize" color="#ffffff" />
              <view v-else-if="pageSome" class="lingyun-table__dash" />
            </view>
          </view>
          <view
            v-for="col in leftColumns"
            :key="col.key"
            class="lingyun-table__cell"
            :style="cellStyle(col)"
          >
            <view class="lingyun-table__head-hit" @click="onHeadTap(col)">
              <text class="lingyun-table__head-text">{{ col.title }}</text>
              <view v-if="col.sortable" class="lingyun-table__sort">
                <view class="lingyun-table__sort-up"><lingyun-icon type="up" :size="sortIconSize" :color="sortColor(col, 'asc')" /></view>
                <view class="lingyun-table__sort-down"><lingyun-icon type="down" :size="sortIconSize" :color="sortColor(col, 'desc')" /></view>
              </view>
            </view>
            <view v-if="filterTypeOf(col)" class="lingyun-table__filter" @click.stop="openFilter(col.key)">
              <lingyun-icon
                :type="filterOn(col.key) ? 'tune-filled' : 'tune'"
                :size="filterIconSize"
                :color="filterOn(col.key) ? 'primary' : 'tertiary'"
              />
            </view>
          </view>
        </view>
      </view>

      <view class="lingyun-table__clip" :style="centerClipStyle('head')">
        <!-- #ifdef MP-WEIXIN -->
        <view
          class="lingyun-table__x lingyun-table__x--head lingyun-table__x--mp"
          @touchstart="tableSync.touchstart"
          @touchmove="tableSync.touchmove"
          @touchend="tableSync.touchend"
          @touchcancel="tableSync.touchcancel"
        >
          <view class="lingyun-table__row lingyun-table__row--head ly-sync-hx" :style="centerRowStyle">
            <view v-if="colPadLeft" class="lingyun-table__col-pad" :style="colPadLeftStyle" />
            <view
              v-for="col in visibleCenterColumns"
              :key="col.key"
              class="lingyun-table__cell"
              :style="cellStyle(col)"
            >
              <view class="lingyun-table__head-hit" @click="onHeadTap(col)">
                <text class="lingyun-table__head-text">{{ col.title }}</text>
                <view v-if="col.sortable" class="lingyun-table__sort">
                  <view class="lingyun-table__sort-up"><lingyun-icon type="up" :size="sortIconSize" :color="sortColor(col, 'asc')" /></view>
                  <view class="lingyun-table__sort-down"><lingyun-icon type="down" :size="sortIconSize" :color="sortColor(col, 'desc')" /></view>
                </view>
              </view>
              <view v-if="filterTypeOf(col)" class="lingyun-table__filter" @click.stop="openFilter(col.key)">
                <lingyun-icon
                  :type="filterOn(col.key) ? 'tune-filled' : 'tune'"
                  :size="filterIconSize"
                  :color="filterOn(col.key) ? 'primary' : 'tertiary'"
                />
              </view>
            </view>
            <view v-if="colPadRight" class="lingyun-table__col-pad" :style="colPadRightStyle" />
          </view>
        </view>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <scroll-view
          class="lingyun-table__x lingyun-table__x--head"
          scroll-x
          enable-flex
          :scroll-left="headLeft"
          :show-scrollbar="false"
          @scroll="onHeadScroll"
        >
          <view class="lingyun-table__row lingyun-table__row--head" :style="centerRowStyle">
            <view v-if="colPadLeft" class="lingyun-table__col-pad" :style="colPadLeftStyle" />
            <view
              v-for="col in visibleCenterColumns"
              :key="col.key"
              class="lingyun-table__cell"
              :style="cellStyle(col)"
            >
              <view class="lingyun-table__head-hit" @click="onHeadTap(col)">
                <text class="lingyun-table__head-text">{{ col.title }}</text>
                <view v-if="col.sortable" class="lingyun-table__sort">
                  <view class="lingyun-table__sort-up"><lingyun-icon type="up" :size="sortIconSize" :color="sortColor(col, 'asc')" /></view>
                  <view class="lingyun-table__sort-down"><lingyun-icon type="down" :size="sortIconSize" :color="sortColor(col, 'desc')" /></view>
                </view>
              </view>
              <view v-if="filterTypeOf(col)" class="lingyun-table__filter" @click.stop="openFilter(col.key)">
                <lingyun-icon
                  :type="filterOn(col.key) ? 'tune-filled' : 'tune'"
                  :size="filterIconSize"
                  :color="filterOn(col.key) ? 'primary' : 'tertiary'"
                />
              </view>
            </view>
            <view v-if="colPadRight" class="lingyun-table__col-pad" :style="colPadRightStyle" />
          </view>
        </scroll-view>
        <!-- #endif -->
      </view>

      <view v-if="rightWidth" class="lingyun-table__side lingyun-table__side--right" :style="sideStyle(rightWidth)">
        <view class="lingyun-table__row lingyun-table__row--head">
          <view
            v-for="col in rightColumns"
            :key="col.key"
            class="lingyun-table__cell"
            :style="cellStyle(col)"
          >
            <view class="lingyun-table__head-hit" @click="onHeadTap(col)">
              <text class="lingyun-table__head-text">{{ col.title }}</text>
              <view v-if="col.sortable" class="lingyun-table__sort">
                <view class="lingyun-table__sort-up"><lingyun-icon type="up" :size="sortIconSize" :color="sortColor(col, 'asc')" /></view>
                <view class="lingyun-table__sort-down"><lingyun-icon type="down" :size="sortIconSize" :color="sortColor(col, 'desc')" /></view>
              </view>
            </view>
            <view v-if="filterTypeOf(col)" class="lingyun-table__filter" @click.stop="openFilter(col.key)">
              <lingyun-icon
                :type="filterOn(col.key) ? 'tune-filled' : 'tune'"
                :size="filterIconSize"
                :color="filterOn(col.key) ? 'primary' : 'tertiary'"
              />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <view
      class="lingyun-table__body"
      :style="bodyBoxStyle"
      :change:prop="tableSync.propWatch"
      :prop="mpSync"
      @touchstart="tableSync.touchstart"
      @touchmove="tableSync.touchmove"
      @touchend="tableSync.touchend"
      @touchcancel="tableSync.touchcancel"
      @mousewheel.stop="onTableWheel"
      @wheel.stop="onTableWheel"
      @mouseenter="onTablePointerEnter"
      @pointerenter="onTablePointerEnter"
    >
    <!-- #endif -->
    <!-- #ifndef MP-WEIXIN -->
    <view
      class="lingyun-table__body"
      :style="bodyBoxStyle"
      @mousewheel.stop="onTableWheel"
      @wheel.stop="onTableWheel"
      @mouseenter="onTablePointerEnter"
      @pointerenter="onTablePointerEnter"
    >
    <!-- #endif -->
      <view v-if="!pageRows.length && !loading" class="lingyun-table__empty">
        <slot name="empty">
          <lingyun-empty variant="plain" :title="emptyText" />
        </slot>
      </view>
      <!-- #ifdef MP-WEIXIN -->
      <view
        v-if="pageRows.length && leftWidth"
        class="lingyun-table__y lingyun-table__y--mp"
        :style="sideScrollStyle(leftWidth)"
      >
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <scroll-view
        v-if="pageRows.length && leftWidth"
        class="lingyun-table__y"
        scroll-y
        enable-flex
        enhanced
        :bounces="false"
        :style="sideScrollStyle(leftWidth)"
        :scroll-top="leftTop"
        :show-scrollbar="false"
        @scroll="onLeftScroll"
        @mousewheel.stop="onTableWheel"
        @wheel.stop="onTableWheel"
      >
      <!-- #endif -->
        <view class="lingyun-table__track ly-sync-y" :style="rowTrackStyle">
          <view v-if="rowPadTop" class="lingyun-table__row-pad" :style="rowPadTopStyle" />
          <view
            v-for="item in visibleRows"
            :key="item.index"
            class="lingyun-table__row"
            :class="rowClass(item.index, item.row)"
            @touchstart="onRowPress(item.row)"
            @touchend="onRowRelease"
            @touchcancel="onRowRelease"
            @mousedown="onRowPress(item.row)"
            @mouseup="onRowRelease"
            @mouseleave="onRowRelease"
            @click="onRowClick(item.row)"
          >
            <view
              v-if="selection"
              class="lingyun-table__cell lingyun-table__cell--check"
              @click.stop="toggleRow(item.row)"
            >
              <view
                v-if="!item.row.__lyIsGroup"
                class="lingyun-table__check"
                :class="{ 'lingyun-table__check--on': isSelected(item.row) }"
              >
                <lingyun-icon v-if="isSelected(item.row)" type="checkmarkempty" :size="tickSize" color="#ffffff" />
              </view>
            </view>
            <template v-for="col in leftColumns" :key="col.key">
              <view class="lingyun-table__cell" :style="cellStyle(col)">
                <view class="lingyun-table__value">
                  <slot name="cell" :row="item.row" :column="col" :value="cellValue(item.row, col, item.index)">
                    <text
                      class="lingyun-table__text"
                      :class="{ 'lingyun-table__text--group': item.row.__lyIsGroup }"
                    >{{ cellText(item.row, col, item.index) }}</text>
                  </slot>
                </view>
              </view>
            </template>
          </view>
          <view v-if="rowPadBottom" class="lingyun-table__row-pad" :style="rowPadBottomStyle" />
        </view>
      <!-- #ifdef MP-WEIXIN -->
      </view>
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      </scroll-view>
      <!-- #endif -->

      <view v-if="pageRows.length" class="lingyun-table__clip" :style="centerClipStyle('body')">
        <!-- #ifdef MP-WEIXIN -->
        <view class="lingyun-table__x lingyun-table__x--body lingyun-table__x--mp">
          <view class="lingyun-table__track ly-sync-xy" :style="centerTrackStyle">
            <view v-if="rowPadTop" class="lingyun-table__row-pad" :style="rowPadTopStyle" />
            <view
              v-for="item in visibleRows"
              :key="item.index"
              class="lingyun-table__row"
              :style="centerRowStyle"
              :class="rowClass(item.index, item.row)"
              @touchstart="onRowPress(item.row)"
              @touchend="onRowRelease"
              @touchcancel="onRowRelease"
              @mousedown="onRowPress(item.row)"
              @mouseup="onRowRelease"
              @mouseleave="onRowRelease"
              @click="onRowClick(item.row)"
            >
              <view v-if="colPadLeft" class="lingyun-table__col-pad" :style="colPadLeftStyle" />
              <template v-for="(col, colIndex) in centerSlotColumns" :key="col ? col.key : 'pad-' + colIndex">
                <view v-if="col" class="lingyun-table__cell" :style="cellStyle(col)">
                  <view class="lingyun-table__value">
                    <slot name="cell" :row="item.row" :column="col" :value="cellValue(item.row, col, item.index)">
                      <text
                        class="lingyun-table__text"
                        :class="{ 'lingyun-table__text--group': item.row.__lyIsGroup }"
                      >{{ cellText(item.row, col, item.index) }}</text>
                    </slot>
                  </view>
                </view>
              </template>
              <view v-if="colPadRight" class="lingyun-table__col-pad" :style="colPadRightStyle" />
            </view>
            <view v-if="rowPadBottom" class="lingyun-table__row-pad" :style="rowPadBottomStyle" />
          </view>
        </view>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <scroll-view
          class="lingyun-table__x lingyun-table__x--body"
          scroll-x
          scroll-y
          enable-flex
          :style="bodyScrollStyle"
          :scroll-left="bodyLeft"
          :scroll-top="bodyTop"
          :show-scrollbar="false"
          @scroll="onBodyScroll"
        >
          <view class="lingyun-table__track" :style="centerTrackStyle">
            <view v-if="rowPadTop" class="lingyun-table__row-pad" :style="rowPadTopStyle" />
            <view
              v-for="item in visibleRows"
              :key="item.index"
              class="lingyun-table__row"
              :style="centerRowStyle"
              :class="rowClass(item.index, item.row)"
              @touchstart="onRowPress(item.row)"
              @touchend="onRowRelease"
              @touchcancel="onRowRelease"
              @mousedown="onRowPress(item.row)"
              @mouseup="onRowRelease"
              @mouseleave="onRowRelease"
              @click="onRowClick(item.row)"
            >
              <view v-if="colPadLeft" class="lingyun-table__col-pad" :style="colPadLeftStyle" />
              <template v-for="(col, colIndex) in centerSlotColumns" :key="col ? col.key : 'pad-' + colIndex">
                <view v-if="col" class="lingyun-table__cell" :style="cellStyle(col)">
                  <view class="lingyun-table__value">
                    <slot name="cell" :row="item.row" :column="col" :value="cellValue(item.row, col, item.index)">
                      <text
                        class="lingyun-table__text"
                        :class="{ 'lingyun-table__text--group': item.row.__lyIsGroup }"
                      >{{ cellText(item.row, col, item.index) }}</text>
                    </slot>
                  </view>
                </view>
              </template>
              <view v-if="colPadRight" class="lingyun-table__col-pad" :style="colPadRightStyle" />
            </view>
            <view v-if="rowPadBottom" class="lingyun-table__row-pad" :style="rowPadBottomStyle" />
          </view>
        </scroll-view>
        <!-- #endif -->
      </view>

      <!-- #ifdef MP-WEIXIN -->
      <view
        v-if="pageRows.length && rightWidth"
        class="lingyun-table__y lingyun-table__y--right lingyun-table__y--mp"
        :style="sideScrollStyle(rightWidth)"
      >
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <scroll-view
        v-if="pageRows.length && rightWidth"
        class="lingyun-table__y lingyun-table__y--right"
        scroll-y
        enable-flex
        enhanced
        :bounces="false"
        :style="sideScrollStyle(rightWidth)"
        :scroll-top="rightTop"
        :show-scrollbar="false"
        @scroll="onRightScroll"
        @mousewheel.stop="onTableWheel"
        @wheel.stop="onTableWheel"
      >
      <!-- #endif -->
        <view class="lingyun-table__track ly-sync-y" :style="rowTrackStyle">
          <view v-if="rowPadTop" class="lingyun-table__row-pad" :style="rowPadTopStyle" />
          <view
            v-for="item in visibleRows"
            :key="item.index"
            class="lingyun-table__row"
            :class="rowClass(item.index, item.row)"
            @touchstart="onRowPress(item.row)"
            @touchend="onRowRelease"
            @touchcancel="onRowRelease"
            @mousedown="onRowPress(item.row)"
            @mouseup="onRowRelease"
            @mouseleave="onRowRelease"
            @click="onRowClick(item.row)"
          >
            <template v-for="(col, colIndex) in rightSlotColumns" :key="col ? col.key : 'pad-' + colIndex">
              <view v-if="col" class="lingyun-table__cell" :style="cellStyle(col)">
                <view class="lingyun-table__value">
                  <slot name="cell" :row="item.row" :column="col" :value="cellValue(item.row, col, item.index)">
                    <text
                      class="lingyun-table__text"
                      :class="{ 'lingyun-table__text--group': item.row.__lyIsGroup }"
                    >{{ cellText(item.row, col, item.index) }}</text>
                  </slot>
                </view>
              </view>
            </template>
          </view>
          <view v-if="rowPadBottom" class="lingyun-table__row-pad" :style="rowPadBottomStyle" />
        </view>
      <!-- #ifdef MP-WEIXIN -->
      </view>
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      </scroll-view>
      <!-- #endif -->
      <view
        v-if="hBarNeeded"
        class="lingyun-table__hbar"
        :class="{ 'lingyun-table__hbar--indicator': !scrollbarHandle }"
        :style="hBarStyle"
        @mousedown.stop.prevent="onHBarStart"
        @touchstart.stop.prevent="onHBarStart"
        @touchmove.stop.prevent="onHBarMove"
        @touchend.stop="onHBarEnd"
        @touchcancel.stop="onHBarEnd"
      >
        <view class="lingyun-table__hbar-thumb ly-sync-hthumb" :style="hThumbStyle" />
      </view>
      <view
        v-if="vBarNeeded"
        class="lingyun-table__vbar"
        :class="{ 'lingyun-table__vbar--indicator': !scrollbarHandle }"
        :style="vBarStyle"
        @mousedown.stop.prevent="onVBarStart"
        @touchstart.stop.prevent="onVBarStart"
        @touchmove.stop.prevent="onVBarMove"
        @touchend.stop="onVBarEnd"
        @touchcancel.stop="onVBarEnd"
      >
        <view class="lingyun-table__vbar-thumb ly-sync-vthumb" :style="vThumbStyle" />
      </view>
      <view v-if="loading" class="lingyun-table__loading">
        <lingyun-activity-indicator size="small" />
      </view>
    </view>

    <view
      v-if="footerRows.length"
      class="lingyun-table__foot"
      @mousewheel.stop="onTableWheel"
      @wheel.stop="onTableWheel"
      @mouseenter="onTablePointerEnter"
      @pointerenter="onTablePointerEnter"
    >
      <view v-for="(foot, footIndex) in footerRows" :key="footIndex" class="lingyun-table__foot-line">
        <view v-if="leftWidth" class="lingyun-table__side" :style="sideStyle(leftWidth)">
          <view class="lingyun-table__row lingyun-table__row--foot">
            <view v-if="selection" class="lingyun-table__cell lingyun-table__cell--check" />
            <view
              v-for="col in leftColumns"
              :key="col.key"
              class="lingyun-table__cell"
              :style="cellStyle(col)"
            >
              <view class="lingyun-table__value">
                <text class="lingyun-table__text lingyun-table__text--foot">{{ footerText(foot, col) }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="lingyun-table__clip" :style="footerClipStyle">
          <!-- #ifdef MP-WEIXIN -->
          <view
            class="lingyun-table__row lingyun-table__row--foot ly-sync-hx"
            :style="footerCenterStyle"
            @touchstart="tableSync.touchstart"
            @touchmove="tableSync.touchmove"
            @touchend="tableSync.touchend"
            @touchcancel="tableSync.touchcancel"
          >
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <view
            class="lingyun-table__row lingyun-table__row--foot"
            :style="footerCenterStyle"
            @touchstart="onCenterTouchStart"
            @touchmove.stop="onCenterTouchMove"
            @touchend="onCenterTouchEnd"
            @touchcancel="onCenterTouchEnd"
          >
          <!-- #endif -->
            <view v-if="colPadLeft" class="lingyun-table__col-pad" :style="colPadLeftStyle" />
            <view
              v-for="col in visibleCenterColumns"
              :key="col.key"
              class="lingyun-table__cell"
              :style="cellStyle(col)"
            >
              <view class="lingyun-table__value">
                <text class="lingyun-table__text lingyun-table__text--foot">{{ footerText(foot, col) }}</text>
              </view>
            </view>
            <view v-if="colPadRight" class="lingyun-table__col-pad" :style="colPadRightStyle" />
          </view>
        </view>
        <view v-if="rightWidth" class="lingyun-table__side lingyun-table__side--right" :style="sideStyle(rightWidth)">
          <view class="lingyun-table__row lingyun-table__row--foot">
            <view
              v-for="col in rightColumns"
              :key="col.key"
              class="lingyun-table__cell"
              :style="cellStyle(col)"
            >
              <view class="lingyun-table__value">
                <text class="lingyun-table__text lingyun-table__text--foot">{{ footerText(foot, col) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showPager" class="lingyun-table__pager">
      <text class="lingyun-table__pager-meta">共 {{ totalCount }} 条</text>
      <view class="lingyun-table__pager-nav">
        <view
          class="lingyun-table__page-btn"
          :class="{ 'lingyun-table__page-btn--off': currentPage <= 1 }"
          @click="goPage(currentPage - 1)"
        >
          <text class="lingyun-table__page-btn-text">上一页</text>
        </view>
        <text class="lingyun-table__page-no">{{ currentPage }} / {{ pageCount }}</text>
        <view
          class="lingyun-table__page-btn"
          :class="{ 'lingyun-table__page-btn--off': currentPage >= pageCount }"
          @click="goPage(currentPage + 1)"
        >
          <text class="lingyun-table__page-btn-text">下一页</text>
        </view>
      </view>
    </view>

    <lingyun-table-filter
      v-if="hasFilterUi"
      :show="filterSheetOpen"
      :title="sheetColumn ? sheetColumn.title : ''"
      :type="sheetColumn ? filterTypeOf(sheetColumn) : ''"
      :options="sheetOptions"
      :values="sheetColumn ? filterMap[sheetColumn.key] || [] : []"
      :condition="sheetColumn ? conditionMap[sheetColumn.key] || null : null"
      :sortable="!!(sheetColumn && sheetColumn.sortable)"
      :sort-order="sheetColumn && sortKey === sheetColumn.key ? sortOrder : ''"
      @update:show="onFilterSheetShow"
      @confirm="onFilterConfirm"
    />
  </view>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import {
  filterConditionLabel,
  makeFilterTest,
  type LingyunTableFilterCondition,
  type LingyunTableFilterOption,
  type LingyunTableFilterResult,
  type LingyunTableFilterType,
} from './table-filter'

export type {
  LingyunTableFilterCondition,
  LingyunTableFilterOp,
  LingyunTableFilterOption,
  LingyunTableFilterResult,
  LingyunTableFilterType,
} from './table-filter'

const COL_W = 120
/** 虚拟窗口按块移动：块内滚动不换行，窗口上下各至少留一块 */
const ROW_BLOCK = 10
/** 横向列窗口按块移动，左右各至少留一块 */
const COL_BLOCK = COL_W * 2
/** 按下行延迟高亮，手势一开始就滚动时不闪 */
const PRESS_DELAY = 90

interface TableMetrics {
  row: number
  head: number
  toolbar: number
  pager: number
  filter: number
  check: number
  index: number
  pick: number
}

/** 紧凑与常规的高度必须和样式里的变量一致，虚拟滚动按同一套像素切行 */
const TABLE_METRICS: Record<'regular' | 'compact', TableMetrics> = {
  regular: { row: 52, head: 44, toolbar: 52, pager: 48, filter: 40, check: 48, index: 64, pick: 44 },
  compact: { row: 36, head: 32, toolbar: 40, pager: 40, filter: 32, check: 40, index: 48, pick: 36 },
}

export type LingyunTableAlign = 'left' | 'center' | 'right'
export type LingyunTableSortOrder = 'asc' | 'desc' | ''

/** 分组行内部标记。业务 data 不要传这个字段 */
export const LINGYUN_TABLE_GROUP = '__lyIsGroup'

export interface LingyunTableColumn {
  key: string
  title: string
  /** 不写时平分剩余宽度 */
  width?: number | string
  /** 不写宽度的列分到的最小宽度，默认 120。剩余宽度不够时按它显示并横向滚动 */
  minWidth?: number | string
  align?: LingyunTableAlign
  /** true 与 left 都固定在左侧 */
  fixed?: 'left' | 'right' | boolean
  /** index 时显示当前顺序的序号，不读行数据 */
  type?: 'index'
  sortable?: boolean
  /** 多选筛选的选项。配了就是 select 筛选 */
  filters?: LingyunTableFilterOption[]
  /** 筛选方式。select 没配 filters 时从数据去重生成选项 */
  filterType?: LingyunTableFilterType
  /** 只开多选筛选、选项从数据里取时写 true，等同 filterType: 'select' */
  filterable?: boolean
  formatter?: (value: unknown, row: LingyunTableRow) => string
}

export type LingyunTableRow = Record<string, unknown>

/**
 * 分组规则。按 field 列归组，在组首插入一行；sum 里的列自动加总。
 * 与 footer 不同：合计由当前筛选结果自动算，不手写。
 */
export interface LingyunTableGroupFields {
  field: string
  sum?: string[]
}

export interface LingyunTableQuery {
  page: number
  pageSize: number
  /** 多选筛选：列 key → 勾选的值 */
  filters: Record<string, string[]>
  /** 数字、文本、日期筛选：列 key → 条件 */
  conditions: Record<string, LingyunTableFilterCondition>
  sortKey: string
  sortOrder: LingyunTableSortOrder
}

interface ResolvedColumn extends LingyunTableColumn {
  widthPx: number
  side: 'left' | 'right' | 'center'
}

type TouchPoint = { clientX?: number; pageX?: number; clientY?: number; pageY?: number }
type ScrollDetail = { scrollLeft?: number; scrollTop?: number }
type ScrollEvent = { detail?: ScrollDetail }

/** 只取写明的宽度，没写或不合法时为 0 */
function explicitWidth(value: number | string | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : 0
  if (typeof value === 'string') {
    const n = parseFloat(value)
    return Number.isFinite(n) && n > 0 ? n : 0
  }
  return 0
}

/** 把 extra 按 weights 比例分下去，取整后的零头补给最后一项，合计正好等于 extra */
function shareOut(weights: number[], extra: number): number[] {
  const total = weights.reduce((sum, w) => sum + w, 0)
  if (total <= 0 || extra <= 0) return weights.map(() => 0)
  let given = 0
  return weights.map((w, i) => {
    if (i === weights.length - 1) return extra - given
    const part = Math.floor((extra * w) / total)
    given += part
    return part
  })
}

/**
 * 列宽分配。avail 为表格宽度减去勾选列。
 * - 有列没写宽度：剩余宽度平分给这些列，每列不小于 minWidth（默认 120），不够时横向滚动。
 * - 都写了宽度且 fit：总宽不足时按宽度比例放大占满；超出时保持原宽度。
 * 序号列不参与分配。
 */
function layoutColumnWidths(
  cols: LingyunTableColumn[],
  avail: number,
  fit: boolean,
  indexWidth: number,
): number[] {
  const widths = cols.map((col) => (col.type === 'index' ? explicitWidth(col.width) || indexWidth : explicitWidth(col.width)))
  const autoIdx: number[] = []
  cols.forEach((col, i) => {
    if (col.type !== 'index' && !widths[i]) autoIdx.push(i)
  })
  const used = widths.reduce((sum, w) => sum + w, 0)
  if (autoIdx.length) {
    const mins = autoIdx.map((i) => explicitWidth(cols[i].minWidth) || COL_W)
    const remain = Math.max(0, avail - used)
    const share = shareOut(
      autoIdx.map(() => 1),
      remain,
    )
    autoIdx.forEach((colIndex, k) => {
      widths[colIndex] = Math.max(mins[k], share[k])
    })
    return widths
  }
  if (!fit || avail <= used) return widths
  const stretchIdx: number[] = []
  cols.forEach((col, i) => {
    if (col.type !== 'index') stretchIdx.push(i)
  })
  const extra = shareOut(
    stretchIdx.map((i) => widths[i]),
    Math.floor(avail - used),
  )
  stretchIdx.forEach((colIndex, k) => {
    widths[colIndex] += extra[k]
  })
  return widths
}

function columnSide(fixed: LingyunTableColumn['fixed']): 'left' | 'right' | 'center' {
  if (fixed === 'right') return 'right'
  if (fixed === 'left' || fixed === true) return 'left'
  return 'center'
}

function parseHeight(value: unknown): number {
  if (value === '' || value == null) return 0
  if (typeof value === 'number') return value > 0 ? value : 0
  const n = parseFloat(String(value))
  return Number.isFinite(n) && n > 0 ? n : 0
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function excelCell(text: string, numeric: boolean): string {
  const type = numeric ? 'Number' : 'String'
  return `<Cell><Data ss:Type="${type}">${escapeXml(text)}</Data></Cell>`
}

function sanitizeFileName(value: string): string {
  const name = value.replace(/[\\/:*?"<>|]/g, '_').trim()
  return name || '表格'
}

interface SortKey {
  empty: boolean
  isNum: boolean
  num: number
  text: string
}

function toSortKey(value: unknown): SortKey {
  if (value == null || value === '') return { empty: true, isNum: false, num: 0, text: '' }
  const text = String(value)
  const trimmed = text.trim()
  const num = typeof value === 'number' ? value : Number(trimmed)
  const isNum = typeof value !== 'boolean' && Number.isFinite(num) && trimmed !== ''
  return { empty: false, isNum, num, text }
}

let zhCollator: Intl.Collator | null | undefined

function compareText(a: string, b: string): number {
  if (zhCollator === undefined) {
    try {
      zhCollator = typeof Intl !== 'undefined' && typeof Intl.Collator === 'function' ? new Intl.Collator('zh') : null
    } catch {
      zhCollator = null
    }
  }
  return zhCollator ? zhCollator.compare(a, b) : a.localeCompare(b)
}

function compareKey(a: SortKey, b: SortKey): number {
  if (a.empty && b.empty) return 0
  if (a.empty) return -1
  if (b.empty) return 1
  if (a.isNum && b.isNum) return a.num - b.num
  return compareText(a.text, b.text)
}

function isGroupRow(row: LingyunTableRow | null | undefined): boolean {
  return !!(row && row[LINGYUN_TABLE_GROUP] === true)
}

function columnFilterType(col: LingyunTableColumn): LingyunTableFilterType | '' {
  if (col.type === 'index') return ''
  if (col.filterType) return col.filterType
  if ((col.filters && col.filters.length) || col.filterable) return 'select'
  return ''
}

interface RowTest {
  key: string
  test: (row: LingyunTableRow) => boolean
}

const EMPTY_OPTION_TEXT = '（空白）'

/** 选项的显示文字：先找列上配置的 filters，再用 formatter，最后用原值 */
function optionTextOf(col: LingyunTableColumn, token: string, sample?: LingyunTableRow): string {
  const preset = (col.filters || []).find((opt) => String(opt.value) === token)
  if (preset) return preset.text
  if (token === '') return EMPTY_OPTION_TEXT
  if (col.formatter && sample) return col.formatter(sample[col.key], sample)
  return token
}

function sameStrings(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((item) => set.has(item))
}

function sameCondition(a: LingyunTableFilterCondition | null | undefined, b: LingyunTableFilterCondition | null | undefined): boolean {
  if (!a || !b) return !a && !b
  return a.op === b.op && a.value === b.value && (a.value2 || '') === (b.value2 || '')
}

function toSumNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value.replace(/,/g, '').trim())
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

interface GroupTotals {
  totals: Map<string, Record<string, number>>
  labels: Map<string, unknown>
}

/** 按分组列算每组合计与组名 */
function groupTotalsOf(source: LingyunTableRow[], field: string, sumKeys: string[]): GroupTotals {
  const totals = new Map<string, Record<string, number>>()
  const labels = new Map<string, unknown>()
  source.forEach((row) => {
    if (isGroupRow(row)) return
    const g = String(row[field] ?? '')
    if (!labels.has(g)) labels.set(g, row[field] ?? '')
    let bag = totals.get(g)
    if (!bag) {
      bag = {}
      sumKeys.forEach((key) => {
        bag![key] = 0
      })
      totals.set(g, bag)
    }
    sumKeys.forEach((key) => {
      bag![key] += toSumNumber(row[key])
    })
  })
  return { totals, labels }
}

/** 按分组列重排，并在组首插入带合计的分组行 */
function expandGroupedRows(
  rows: LingyunTableRow[],
  field: string,
  sumKeys: string[],
  rowKey: string,
  sums: GroupTotals,
): LingyunTableRow[] {
  if (!field || !rows.length) return rows
  const { totals, labels } = sums
  const out: LingyunTableRow[] = []
  let last = '\u0000'
  rows.forEach((row) => {
    if (isGroupRow(row)) {
      out.push(row)
      return
    }
    const g = String(row[field] ?? '')
    if (g !== last) {
      const head: LingyunTableRow = {
        [LINGYUN_TABLE_GROUP]: true,
        [rowKey]: `__ly_group_${g}`,
        [field]: labels.has(g) ? labels.get(g) : g,
      }
      const bag = totals.get(g) || {}
      sumKeys.forEach((key) => {
        head[key] = bag[key] || 0
      })
      out.push(head)
      last = g
    }
    out.push(row)
  })
  return out
}

type SectionMarkHost = {
  $options?: { name?: string }
  $parent?: SectionMarkHost | null
  markEmbeddedList?: (active: boolean) => void
}

/** 小程序上看不到插槽 vnode，表格自己告诉外层 section。 */
function findSectionMarkHost(start: unknown): SectionMarkHost | null {
  let parent = start as SectionMarkHost | null
  while (parent) {
    if (parent.$options && parent.$options.name === 'LingyunSection') return parent
    parent = parent.$parent || null
  }
  return null
}

type WxsHandler = (...args: unknown[]) => unknown

/** 小程序 WXS 模块（table-sync.wxs），模板里按 tableSync.xxx 引用；运行时由编译器注入，不在实例上 */
interface TableSyncModule {
  propWatch: WxsHandler
  touchstart: WxsHandler
  touchmove: WxsHandler
  touchend: WxsHandler
  touchcancel: WxsHandler
}

declare module 'vue' {
  interface ComponentCustomProperties {
    tableSync: TableSyncModule
  }
}

export default defineComponent({
  name: 'LingyunTable',
  options: {
    virtualHost: true,
  },
  emits: [
    'row-click',
    'sort-change',
    'filter-change',
    'page-change',
    'selection-change',
    'update:selectedKeys',
    'update:page',
    'query-change',
    'refresh',
    'export',
  ],
  props: {
    columns: { type: Array as PropType<LingyunTableColumn[]>, default: () => [] },
    data: { type: Array as PropType<LingyunTableRow[]>, default: () => [] },
    rowKey: { type: String, default: 'id' },
    /**
     * 表体高度。传入像素时表体固定为这个高度。
     * 不传时表格占满外层：外层有高度就用外层高度，否则用页面高度。表体在这块区域里滚动。
     */
    height: { type: [Number, String], default: '' },
    stripe: { type: Boolean, default: false },
    /** 单元格竖线，颜色用分割线，不是表格灰网格 */
    border: { type: Boolean, default: false },
    selection: { type: Boolean, default: false },
    selectedKeys: { type: Array as PropType<Array<string | number>>, default: () => [] },
    /** 0 表示不分页 */
    pageSize: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    /** remote 时用外部总数；本地用筛选后的行数 */
    total: { type: Number, default: 0 },
    /**
     * 为真时筛选、排序、分页都不在组件内处理。
     * 查询变化时抛 query-change，由外部异步拉数后回填 data 和 total。
     */
    remote: { type: Boolean, default: false },
    /** remote 请求进行中。空数据时占住表体并转圈，有数据时盖在当前页上 */
    loading: { type: Boolean, default: false },
    /** 标题栏标题。和 icon、工具按钮、tools 插槽任一有值就显示标题栏 */
    title: { type: String, default: '' },
    /** 标题栏图标，取 lingyun-icon 的 type */
    icon: { type: String, default: '' },
    /** 标题栏右侧刷新 */
    showRefresh: { type: Boolean, default: false },
    /** 标题栏右侧选择列 */
    columnPicker: { type: Boolean, default: false },
    /** 标题栏右侧导出 Excel */
    exportExcel: { type: Boolean, default: false },
    emptyText: { type: String, default: '暂无数据' },
    /** 为真时在表体下方、分页上方固定表尾 */
    showFooter: { type: Boolean, default: false },
    /**
     * 表尾行。字段名对应列 key，没写的列留空。
     * 多条就是多行表尾。
     */
    footerData: { type: Array as PropType<LingyunTableRow[]>, default: () => [] },
    /**
     * 分组。按 field 列归组并插入分组行；sum 列自动求和。
     * 分组行带底色，不参与勾选。合计走列 formatter / #cell。
     */
    groupFields: { type: Object as PropType<LingyunTableGroupFields | null>, default: null },
    /**
     * 所有列都写了宽度时，总宽不足表格宽度就按各列宽度比例放大占满；超出时保持原宽度横向滚动。
     * 有列没写宽度时不需要它，这些列本来就会平分剩余宽度。
     */
    fit: { type: Boolean, default: false },
    /** regular 行高 52；compact 行高 36，表头、标题栏、分页和字号一起收紧 */
    size: { type: String as PropType<'regular' | 'compact'>, default: 'regular' },
  },
  data() {
    return {
      innerSelected: [] as string[],
      innerPage: 1,
      sortKey: '',
      sortOrder: '' as LingyunTableSortOrder,
      filterMap: {} as Record<string, string[]>,
      conditionMap: {} as Record<string, LingyunTableFilterCondition>,
      /** 筛选面板对应的列。关面板时保留，收起动画里内容不跳 */
      filterSheetKey: '',
      filterSheetOpen: false,
      /** 打开面板时算好的选项快照 */
      sheetOptions: [] as LingyunTableFilterOption[],
      headLeft: 0,
      bodyLeft: 0,
      bodyTop: 0,
      leftTop: 0,
      rightTop: 0,
      syncSource: '',
      syncTimer: 0,
      pressedKey: '',
      pressTimer: 0,
      pressLeft: 0,
      pressTop: 0,
      viewportBodyPx: 0,
      viewportCenterPx: 0,
      fillHeightPx: 0,
      fillMode: '' as '' | 'page' | 'parent',
      rowStart: 0,
      rowEnd: 0,
      colStart: 0,
      colEnd: 0,
      colPadLeft: 0,
      colPadRight: 0,
      centerClientPx: 0,
      /** 表格实测宽度，列宽按它分配。测到之前用窗口宽度估算 */
      tableWidthPx: 0,
      /** 电脑上用鼠标拖过筛选标签栏，松手那次点击不算点标签 */
      chipsDragged: false,
      chipsDragStop: null as (() => void) | null,
      hBarTimer: 0,
      hDragging: false,
      hDragX: 0,
      hDragLeft: 0,
      vDragging: false,
      vDragY: 0,
      vDragTop: 0,
      vDragMove: null as ((event: MouseEvent) => void) | null,
      vDragUp: null as (() => void) | null,
      hiddenKeys: [] as string[],
      columnPickerOpen: false,
      onResize: null as (() => void) | null,
      hDragMove: null as ((event: MouseEvent) => void) | null,
      hDragUp: null as (() => void) | null,
      centerTouchX: 0,
      centerTouchY: 0,
      centerTouchLeft: 0,
      centerTouchTop: 0,
      centerTouchAxis: '' as '' | 'x' | 'y',
      centerMoved: false,
      glideSamples: [] as Array<{ x: number; y: number; t: number }>,
      glideTimer: 0,
      glideV: 0,
      glideAt: 0,
      gliding: false,
      pageHoldTop: -1,
      pageHoldTimer: 0,
      pressDelayTimer: 0,
      pressPendingKey: '',
      movedTimer: 0,
      /** 小程序：逻辑层要求 WXS 跳到某处时加一 */
      syncSeq: 0,
      syncCmdLeft: 0,
      syncCmdTop: 0,
      /** PC / H5 用可拖句柄；手机小程序只用细指示条 */
      scrollbarHandle: true,
    }
  },
  computed: {
    isCompact(): boolean {
      return this.size === 'compact'
    },
    metrics(): TableMetrics {
      return this.isCompact ? TABLE_METRICS.compact : TABLE_METRICS.regular
    },
    titleIconSize(): number {
      return this.isCompact ? 18 : 22
    },
    toolIconSize(): number {
      return this.isCompact ? 16 : 18
    },
    tickSize(): number {
      return this.isCompact ? 12 : 14
    },
    rootClass(): string[] {
      return [
        this.stripe ? 'lingyun-table--stripe' : '',
        this.border ? 'lingyun-table--border' : '',
        this.isCompact ? 'lingyun-table--compact' : '',
        this.fixed ? 'lingyun-table--fixed' : 'lingyun-table--fill',
      ].filter(Boolean)
    },
    fixed(): boolean {
      return parseHeight(this.height) > 0
    },
    rootStyle(): Record<string, string> {
      const metrics = this.metrics
      const style: Record<string, string> = {
        '--ly-table-row': `${metrics.row}px`,
        '--ly-table-head': `${metrics.head}px`,
        '--ly-table-toolbar': `${metrics.toolbar}px`,
        '--ly-table-pager': `${metrics.pager}px`,
        '--ly-table-filter': `${metrics.filter}px`,
        '--ly-table-check': `${metrics.check}px`,
        '--ly-table-pick': `${metrics.pick}px`,
      }
      if (!this.fixed && this.fillHeightPx > 0) style.height = `${this.fillHeightPx}px`
      return style
    },
    pickerScrollStyle(): Record<string, string> {
      const count = (this.columns || []).length
      const row = this.metrics.pick
      const height = Math.min(280, Math.max(row, count * row))
      return { height: `${height}px` }
    },
    bodyHeightPx(): number {
      if (this.fixed) return parseHeight(this.height)
      return this.viewportBodyPx
    },
    contentHeightPx(): number {
      return this.pageRows.length * this.metrics.row
    },
    rowPadTop(): number {
      return this.rowStart * this.metrics.row
    },
    rowPadBottom(): number {
      return Math.max(0, this.pageRows.length - this.rowEnd) * this.metrics.row
    },
    rowPadTopStyle(): Record<string, string> {
      return { height: `${this.rowPadTop}px` }
    },
    rowPadBottomStyle(): Record<string, string> {
      return { height: `${this.rowPadBottom}px` }
    },
    rowTrackStyle(): Record<string, string> {
      return { height: `${this.contentHeightPx}px` }
    },
    centerTrackStyle(): Record<string, string> {
      return { width: `${this.centerWidth}px`, height: `${this.contentHeightPx}px` }
    },
    colPadLeftStyle(): Record<string, string> {
      return { width: `${this.colPadLeft}px` }
    },
    colPadRightStyle(): Record<string, string> {
      return { width: `${this.colPadRight}px` }
    },
    visibleRows(): Array<{ row: LingyunTableRow; index: number }> {
      const rows = this.pageRows
      const end = Math.min(this.rowEnd, rows.length)
      const items: Array<{ row: LingyunTableRow; index: number }> = []
      for (let i = this.rowStart; i < end; i += 1) items.push({ row: rows[i], index: i })
      return items
    },
    visibleCenterColumns(): ResolvedColumn[] {
      const cols = this.centerColumns
      const end = Math.min(this.colEnd, cols.length)
      if (this.colStart <= 0 && end >= cols.length) return cols
      return cols.slice(this.colStart, end)
    },
    /** 小程序把作用域插槽编成 cell-行号-列号。左中右三块各自从 0 编号会撞成 cell-0-0，这里用空位把列号错开 */
    centerSlotColumns(): Array<ResolvedColumn | null> {
      const cols: Array<ResolvedColumn | null> = []
      for (let i = 0; i < this.leftColumns.length; i += 1) cols.push(null)
      this.visibleCenterColumns.forEach((col) => cols.push(col))
      return cols
    },
    rightSlotColumns(): Array<ResolvedColumn | null> {
      const pad = this.leftColumns.length + this.centerColumns.length
      const cols: Array<ResolvedColumn | null> = []
      for (let i = 0; i < pad; i += 1) cols.push(null)
      this.rightColumns.forEach((col) => cols.push(col))
      return cols
    },
    resolvedColumns(): ResolvedColumn[] {
      const hidden = this.hiddenKeys
      const cols = (this.columns || []).filter((col) => hidden.indexOf(col.key) < 0)
      const avail = this.layoutWidth - (this.selection ? this.metrics.check : 0)
      const widths = layoutColumnWidths(cols, avail, this.fit, this.metrics.index)
      return cols.map((col, i) => ({
        ...col,
        widthPx: widths[i],
        side: columnSide(col.fixed),
      }))
    },
    layoutWidth(): number {
      if (this.tableWidthPx > 0) return this.tableWidthPx
      const info = uni.getWindowInfo()
      return info && info.windowWidth ? Math.floor(info.windowWidth) : 375
    },
    leftColumns(): ResolvedColumn[] {
      return this.resolvedColumns.filter((col) => col.side === 'left')
    },
    rightColumns(): ResolvedColumn[] {
      return this.resolvedColumns.filter((col) => col.side === 'right')
    },
    centerColumns(): ResolvedColumn[] {
      return this.resolvedColumns.filter((col) => col.side === 'center')
    },
    leftWidth(): number {
      const cols = this.leftColumns.reduce((sum, col) => sum + col.widthPx, 0)
      return cols + (this.selection ? this.metrics.check : 0)
    },
    rightWidth(): number {
      return this.rightColumns.reduce((sum, col) => sum + col.widthPx, 0)
    },
    centerWidth(): number {
      const width = this.centerColumns.reduce((sum, col) => sum + col.widthPx, 0)
      return width || COL_W
    },
    centerRowStyle(): Record<string, string> {
      return { width: `${this.centerWidth}px` }
    },
    /** 交给 WXS 的滚动几何。不含当前位置，滚动中逻辑层回写位置不会触发它 */
    mpSync(): Record<string, number> {
      const h = this.hThumbGeo
      const v = this.vThumbGeo
      return {
        seq: this.syncSeq,
        left: this.syncCmdLeft,
        top: this.syncCmdTop,
        maxX: h.max,
        maxY: v.max,
        blockX: COL_BLOCK,
        blockY: ROW_BLOCK * this.metrics.row,
        hTravel: h.travel,
        vTravel: v.travel,
      }
    },
    mpLayoutKey(): string {
      return [
        this.pageRows.length > 0 ? 1 : 0,
        this.leftWidth > 0 ? 1 : 0,
        this.rightWidth > 0 ? 1 : 0,
        this.footerRows.length,
        this.hBarNeeded ? 1 : 0,
        this.vBarNeeded ? 1 : 0,
      ].join('|')
    },
    centerViewPx(): number {
      if (this.centerClientPx > 0) return this.centerClientPx
      return this.viewportCenterPx
    },
    hBarNeeded(): boolean {
      const view = this.centerViewPx
      return view > 0 && this.centerWidth > view + 1
    },
    vBarNeeded(): boolean {
      return this.bodyHeightPx > 0 && this.contentHeightPx > this.bodyHeightPx + 1
    },
    hBarTrackPx(): number {
      // 竖条在整表最右侧，横条只铺中间区，不再给竖条让位
      return Math.max(0, this.centerViewPx)
    },
    vBarTrackPx(): number {
      const gutter = this.hBarNeeded ? (this.scrollbarHandle ? 20 : 6) : 0
      return Math.max(0, this.bodyHeightPx - gutter)
    },
    hBarStyle(): Record<string, string> {
      return {
        left: `${this.leftWidth}px`,
        width: `${this.hBarTrackPx}px`,
      }
    },
    vBarStyle(): Record<string, string> {
      return {
        top: '0',
        right: '0',
        height: `${this.vBarTrackPx}px`,
      }
    },
    hThumbGeo(): { thumb: number; travel: number; max: number } {
      const view = this.centerViewPx
      const content = Math.max(this.centerWidth, view)
      const max = Math.max(0, content - view)
      const track = this.hBarTrackPx
      const thumb = Math.max(40, Math.round((track * view) / Math.max(1, content)))
      return { thumb, travel: Math.max(1, track - thumb), max }
    },
    vThumbGeo(): { thumb: number; travel: number; max: number } {
      const view = this.bodyHeightPx
      const content = Math.max(this.contentHeightPx, view)
      const max = Math.max(0, content - view)
      const track = this.vBarTrackPx
      const thumb = Math.max(40, Math.round((track * view) / Math.max(1, content)))
      return { thumb, travel: Math.max(1, track - thumb), max }
    },
    hThumbStyle(): Record<string, string> {
      const geo = this.hThumbGeo
      const style: Record<string, string> = { width: `${geo.thumb}px` }
      // 小程序由 WXS 移动拇指
      // #ifndef MP-WEIXIN
      const x = geo.max <= 0 ? 0 : Math.round((this.bodyLeft / geo.max) * geo.travel)
      style.transform = `translateX(${x}px)`
      // #endif
      return style
    },
    vThumbStyle(): Record<string, string> {
      const geo = this.vThumbGeo
      const style: Record<string, string> = { height: `${geo.thumb}px` }
      // #ifndef MP-WEIXIN
      const y = geo.max <= 0 ? 0 : Math.round((this.bodyTop / geo.max) * geo.travel)
      style.transform = `translateY(${y}px)`
      // #endif
      return style
    },
    bodyBoxStyle(): Record<string, string> {
      if (this.fixed && this.bodyHeightPx > 0) return { height: `${this.bodyHeightPx}px` }
      if (this.fixed) return { height: '0px' }
      return { flex: '1', height: '0', minHeight: '0' }
    },
    bodyScrollStyle(): Record<string, string> {
      if (this.fixed && this.bodyHeightPx > 0) return { height: `${this.bodyHeightPx}px` }
      // 小程序 scroll-view 要用明确像素。H5 用 100%，跟着表体，给分页留出位置
      // #ifdef MP-WEIXIN
      if (this.bodyHeightPx > 0) return { height: `${this.bodyHeightPx}px` }
      // #endif
      return { height: '100%' }
    },
    columnByKey(): Record<string, LingyunTableColumn> {
      const out: Record<string, LingyunTableColumn> = {}
      ;(this.columns || []).forEach((col) => {
        out[col.key] = col
      })
      return out
    },
    rowTests(): RowTest[] {
      const tests: RowTest[] = []
      const map = this.filterMap
      Object.keys(map).forEach((key) => {
        const picked = map[key]
        if (!picked || !picked.length) return
        const set = new Set(picked)
        tests.push({ key, test: (row) => set.has(String(row[key] ?? '')) })
      })
      const conds = this.conditionMap
      Object.keys(conds).forEach((key) => {
        const col = this.columnByKey[key]
        const type = col ? columnFilterType(col) : ''
        if (!type || type === 'select') return
        const test = makeFilterTest(type, conds[key])
        tests.push({ key, test: (row) => test(row[key]) })
      })
      return tests
    },
    filteredRows(): LingyunTableRow[] {
      const rows = this.data || []
      if (this.remote) return rows
      return this.rowsPassing(rows, this.rowTests)
    },
    hasFilterUi(): boolean {
      return (this.columns || []).some((col) => !!col.sortable || !!columnFilterType(col))
    },
    sheetColumn(): LingyunTableColumn | null {
      if (!this.filterSheetKey) return null
      return this.columnByKey[this.filterSheetKey] || null
    },
    activeFilters(): Array<{ key: string; label: string }> {
      const out: Array<{ key: string; label: string }> = []
      ;(this.columns || []).forEach((col) => {
        const type = columnFilterType(col)
        if (!type) return
        if (type === 'select') {
          const picked = this.filterMap[col.key]
          if (!picked || !picked.length) return
          const texts = picked.slice(0, 2).map((token) => optionTextOf(col, token))
          const more = picked.length > 2 ? ` 等${picked.length}项` : ''
          out.push({ key: col.key, label: `${col.title}：${texts.join('、')}${more}` })
          return
        }
        const cond = this.conditionMap[col.key]
        if (!cond) return
        out.push({ key: col.key, label: `${col.title} ${filterConditionLabel(type, cond)}` })
      })
      return out
    },
    sortIconSize(): number {
      return this.isCompact ? 10 : 12
    },
    filterIconSize(): number {
      return this.isCompact ? 14 : 16
    },
    chipIconSize(): number {
      return this.isCompact ? 12 : 14
    },
    groupFieldKey(): string {
      const field = this.groupFields && this.groupFields.field
      return typeof field === 'string' ? field.trim() : ''
    },
    groupSumKeys(): string[] {
      const field = this.groupFieldKey
      const list = (this.groupFields && this.groupFields.sum) || []
      return list.filter((key) => !!key && key !== field)
    },
    sortedRows(): LingyunTableRow[] {
      const rows = this.filteredRows
      if (this.remote) return rows
      const groupKey = this.groupFieldKey
      const sortKey = this.sortKey
      const dir = this.sortOrder === 'asc' ? 1 : this.sortOrder === 'desc' ? -1 : 0
      const bySort = !!sortKey && dir !== 0
      if (!groupKey && !bySort) return rows
      // 每行只取一次排序键，比较时不再反复读字段和解析数字
      const decorated = rows.map((row, index) => ({
        row,
        index,
        group: groupKey ? toSortKey(row[groupKey]) : null,
        key: bySort ? toSortKey(row[sortKey]) : null,
      }))
      decorated.sort((a, b) => {
        if (a.group && b.group) {
          const byGroup = compareKey(a.group, b.group)
          if (byGroup !== 0) return byGroup
        }
        if (a.key && b.key) {
          const byKey = compareKey(a.key, b.key) * dir
          if (byKey !== 0) return byKey
        }
        return a.index - b.index
      })
      return decorated.map((item) => item.row)
    },
    groupTotals(): GroupTotals | null {
      if (!this.groupFieldKey) return null
      return groupTotalsOf(this.sortedRows, this.groupFieldKey, this.groupSumKeys)
    },
    totalCount(): number {
      if (this.remote) return this.total > 0 ? this.total : 0
      return this.sortedRows.length
    },
    showPager(): boolean {
      return this.pageSize > 0 && this.totalCount > 0
    },
    footerRows(): LingyunTableRow[] {
      if (!this.showFooter) return []
      const rows = this.footerData || []
      return rows.length ? rows : [{}]
    },
    footerClipStyle(): Record<string, string> {
      const style: Record<string, string> = { height: `${this.metrics.row}px` }
      if (this.viewportCenterPx > 0) style.width = `${this.viewportCenterPx}px`
      return style
    },
    footerCenterStyle(): Record<string, string> {
      const style: Record<string, string> = { width: `${this.centerWidth}px` }
      // #ifndef MP-WEIXIN
      style.transform = `translate3d(${-this.bodyLeft}px, 0, 0)`
      // #endif
      return style
    },
    pageCount(): number {
      if (!this.showPager) return 1
      return Math.max(1, Math.ceil(this.totalCount / this.pageSize))
    },
    currentPage(): number {
      return Math.min(this.pageCount, Math.max(1, this.innerPage || 1))
    },
    pageDataRows(): LingyunTableRow[] {
      if (this.remote || !this.showPager) return this.sortedRows
      const start = (this.currentPage - 1) * this.pageSize
      return this.sortedRows.slice(start, start + this.pageSize)
    },
    pageRows(): LingyunTableRow[] {
      const page = this.pageDataRows
      const totals = this.groupTotals
      if (!totals) return page
      return expandGroupedRows(page, this.groupFieldKey, this.groupSumKeys, this.rowKey, totals)
    },
    /** 页内序号：分组行为 0，明细从 1 起。只有序号列且分组时才需要逐行数 */
    rowNumbers(): number[] | null {
      if (!this.groupFieldKey) return null
      if (!this.resolvedColumns.some((col) => col.type === 'index')) return null
      const out: number[] = new Array(this.pageRows.length)
      let n = 0
      this.pageRows.forEach((row, i) => {
        if (isGroupRow(row)) {
          out[i] = 0
          return
        }
        n += 1
        out[i] = n
      })
      return out
    },
    pageKeys(): string[] {
      return this.pageRows.map((row) => this.keyOf(row)).filter(Boolean)
    },
    selectedSet(): Set<string> {
      return new Set(this.innerSelected)
    },
    pageSelectedCount(): number {
      const set = this.selectedSet
      if (!set.size) return 0
      let count = 0
      this.pageKeys.forEach((key) => {
        if (set.has(key)) count += 1
      })
      return count
    },
    pageAll(): boolean {
      return this.pageKeys.length > 0 && this.pageSelectedCount === this.pageKeys.length
    },
    pageSome(): boolean {
      return this.pageSelectedCount > 0 && !this.pageAll
    },
    pageCheckClass(): Record<string, boolean> {
      return {
        'lingyun-table__check--on': this.pageAll,
        'lingyun-table__check--some': this.pageSome,
      }
    },
  },
  watch: {
    page: {
      immediate: true,
      handler(value: number) {
        this.innerPage = value || 1
      },
    },
    selectedKeys: {
      immediate: true,
      handler(value: Array<string | number>) {
        this.innerSelected = (value || []).map((item) => String(item))
      },
    },
    pageRows(next: LingyunTableRow[], prev: LingyunTableRow[]) {
      if (next.length && !(prev && prev.length)) {
        this.bodyTop = 0
        this.leftTop = 0
        this.rightTop = 0
      }
      this.syncRowWindow(this.bodyTop)
    },
    /** 小程序：受 WXS 驱动的节点被重新创建后，让 WXS 把当前位置再写一遍 */
    mpLayoutKey() {
      this.$nextTick(() => this.mpCommand(this.bodyLeft, this.bodyTop))
    },
    centerColumns() {
      this.syncColWindow(this.bodyLeft)
    },
    loading() {
      this.$nextTick(() => this.measureViewport())
    },
    total() {
      this.$nextTick(() => this.measureViewport())
    },
    pageSize() {
      this.$nextTick(() => this.measureViewport())
    },
    'activeFilters.length'() {
      this.$nextTick(() => this.measureViewport())
    },
    size() {
      this.syncRowWindow(this.bodyTop)
      this.$nextTick(() => this.measureViewport())
    },
    showFooter() {
      this.$nextTick(() => this.measureViewport())
    },
    footerData() {
      this.$nextTick(() => this.measureViewport())
    },
    groupFields: {
      deep: true,
      handler() {
        this.syncRowWindow(this.bodyTop)
        this.$nextTick(() => this.measureViewport())
      },
    },
  },
  created() {
    this.syncRowWindow(0)
    this.syncColWindow(0)
    this.scrollbarHandle = this.detectScrollbarHandle()
    const section = findSectionMarkHost(this.$parent)
    if (!section) return
    ;(this as unknown as { embeddedSection?: SectionMarkHost }).embeddedSection = section
    section.markEmbeddedList?.(true)
  },
  mounted() {
    if (this.remote) this.emitQuery()
    this.measureViewport()
    this.onResize = () => {
      if (!this.fixed && this.fillMode === 'page') {
        const info = uni.getWindowInfo()
        const pageH = info && info.windowHeight ? Math.round(info.windowHeight) : 0
        if (pageH > 0) this.fillHeightPx = pageH
      }
      if (!this.fixed && this.fillMode === 'parent') {
        const parentH = this.parentBoxHeight()
        if (parentH >= 80) this.fillHeightPx = parentH
      }
      this.measureViewport()
    }
    uni.onWindowResize(this.onResize)
  },
  beforeUnmount() {
    const section = (this as unknown as { embeddedSection?: SectionMarkHost }).embeddedSection
    section?.markEmbeddedList?.(false)
    this.detachHBarDrag()
    this.detachVBarDrag()
    if (this.chipsDragStop) this.chipsDragStop()
    if (this.syncTimer) clearTimeout(this.syncTimer)
    if (this.pressTimer) clearTimeout(this.pressTimer)
    if (this.hBarTimer) clearTimeout(this.hBarTimer)
    if (this.pageHoldTimer) clearTimeout(this.pageHoldTimer)
    if (this.pressDelayTimer) clearTimeout(this.pressDelayTimer)
    if (this.movedTimer) clearTimeout(this.movedTimer)
    this.stopGlide()
    if (this.onResize) uni.offWindowResize(this.onResize)
  },
  methods: {
    detectScrollbarHandle(): boolean {
      // #ifdef H5
      return true
      // #endif
      // #ifdef MP-WEIXIN
      try {
        const device =
          typeof uni.getDeviceInfo === 'function'
            ? (uni.getDeviceInfo() as { deviceType?: string; platform?: string })
            : null
        if (device?.deviceType === 'pc') return true
        const platform =
          device?.platform ||
          (typeof uni.getSystemInfoSync === 'function' ? uni.getSystemInfoSync().platform : '') ||
          ''
        return platform === 'windows' || platform === 'mac'
      } catch {
        return false
      }
      // #endif
      return true
    },
    sideStyle(width: number): Record<string, string> {
      return { width: `${width}px` }
    },
    sideScrollStyle(width: number): Record<string, string> {
      let height = '100%'
      if (this.fixed && this.bodyHeightPx > 0) height = `${this.bodyHeightPx}px`
      // #ifdef MP-WEIXIN
      if (!this.fixed && this.bodyHeightPx > 0) height = `${this.bodyHeightPx}px`
      // #endif
      return { width: `${width}px`, height }
    },
    guessCenterWidth(): number {
      const info = uni.getWindowInfo()
      const width = info && info.windowWidth ? info.windowWidth : 375
      return Math.max(COL_W, width - this.leftWidth - this.rightWidth)
    },
    syncRowWindow(top: number) {
      const total = this.pageRows.length
      const rowH = this.metrics.row
      const view = this.bodyHeightPx > 0 ? this.bodyHeightPx : rowH * 12
      const blockTop = Math.floor(Math.max(0, top) / (ROW_BLOCK * rowH)) * ROW_BLOCK
      let start = blockTop - ROW_BLOCK
      if (start < 0) start = 0
      let end = blockTop + ROW_BLOCK + Math.ceil(view / rowH) + ROW_BLOCK
      if (end > total) end = total
      if (start > end) start = end
      if (this.rowStart !== start) this.rowStart = start
      if (this.rowEnd !== end) this.rowEnd = end
    },
    syncColWindow(left: number) {
      const cols = this.centerColumns
      const view = this.viewportCenterPx > 0 ? this.viewportCenterPx : this.guessCenterWidth()
      const blockLeft = Math.floor(Math.max(0, left) / COL_BLOCK) * COL_BLOCK
      const startX = Math.max(0, blockLeft - COL_BLOCK)
      const endX = blockLeft + COL_BLOCK + view + COL_BLOCK
      let x = 0
      let start = 0
      let end = 0
      let padLeft = 0
      let padRight = 0
      let started = false
      for (let i = 0; i < cols.length; i += 1) {
        const width = cols[i].widthPx
        const right = x + width
        if (right <= startX) {
          padLeft += width
          start = i + 1
        } else if (x >= endX) {
          padRight += width
        } else {
          started = true
          end = i + 1
        }
        x = right
      }
      if (!started) {
        start = 0
        end = cols.length
        padLeft = 0
        padRight = 0
      }
      if (this.colStart !== start) this.colStart = start
      if (this.colEnd !== end) this.colEnd = end
      if (this.colPadLeft !== padLeft) this.colPadLeft = padLeft
      if (this.colPadRight !== padRight) this.colPadRight = padRight
    },
    parentBoxHeight(): number {
      const el = this.$el as HTMLElement | undefined
      const parent = el && el.style ? el.parentElement : null
      if (!el || !parent || typeof parent.clientHeight !== 'number') return 0
      const prevPos = el.style.position
      const prevH = el.style.height
      el.style.position = 'absolute'
      el.style.height = '0px'
      const parentH = parent.clientHeight
      let siblingH = 0
      const children = parent.children
      for (let i = 0; i < children.length; i += 1) {
        const child = children[i] as HTMLElement
        if (child === el) continue
        siblingH += child.offsetHeight || 0
      }
      el.style.position = prevPos
      el.style.height = prevH
      if (parentH >= 80 && parentH - siblingH >= 40) return Math.round(parentH)
      return 0
    },
    measureViewport() {
      const query = uni.createSelectorQuery().in(this as never)
      query.select('.lingyun-table').boundingClientRect()
      query.select('.lingyun-table__body').boundingClientRect()
      query.select('.lingyun-table__x--body').boundingClientRect()
      query.exec((rects) => {
        const list = (rects || []) as Array<{ height?: number; width?: number } | null>
        this.applyViewport(list[0], list[1], list[2])
      })
    },
    applyViewport(
      table: { height?: number; width?: number } | null,
      body: { height?: number } | null,
      center: { width?: number } | null,
    ) {
      const tableW = table && table.width ? Math.round(table.width) : 0
      // 列宽按向下取整的宽度分，避免小数宽度时多出半像素横向可滚
      const layoutW = table && table.width ? Math.floor(table.width) : 0
      if (layoutW > 1 && this.tableWidthPx !== layoutW) this.tableWidthPx = layoutW
      if (tableW > 1) {
        const pane = Math.max(1, tableW - this.leftWidth - this.rightWidth)
        if (this.viewportCenterPx !== pane) this.viewportCenterPx = pane
      } else if (center && center.width && center.width > 1) {
        const width = Math.round(center.width)
        if (this.viewportCenterPx !== width) this.viewportCenterPx = width
      }
      const client = this.readCenterClient()
      if (client > 0 && this.centerClientPx !== client) this.centerClientPx = client
      this.syncColWindow(this.bodyLeft)
      if (this.fixed) {
        this.syncRowWindow(this.bodyTop)
        return
      }
      const bodyH = body && body.height ? Math.round(body.height) : 0
      const tableH = table && table.height ? Math.round(table.height) : 0
      if ((this.fillMode === 'page' || this.fillMode === 'parent') && this.fillHeightPx > 0) {
        const room = Math.max(48, this.fillHeightPx - this.chromeHeight())
        const next = bodyH >= 48 && bodyH <= room + 8 ? bodyH : room
        if (this.viewportBodyPx !== next) this.viewportBodyPx = next
        this.syncRowWindow(this.bodyTop)
        return
      }
      const parentH = this.parentBoxHeight()
      if (parentH >= 80 && bodyH >= 48) {
        this.fillMode = 'parent'
        if (this.viewportBodyPx !== bodyH) this.viewportBodyPx = bodyH
        this.syncRowWindow(this.bodyTop)
        return
      }
      if (parentH >= 80) {
        this.fillMode = 'parent'
        if (this.fillHeightPx !== parentH) this.fillHeightPx = parentH
        this.$nextTick(() => this.measureViewport())
        return
      }
      const contentH = this.intrinsicHeight()
      if (tableH >= 80 && Math.abs(tableH - contentH) > 12) {
        this.fillMode = 'parent'
        if (this.fillHeightPx !== tableH) this.fillHeightPx = tableH
        const room = Math.max(48, tableH - this.chromeHeight())
        const next = bodyH >= 48 && bodyH <= room + 8 ? bodyH : room
        if (this.viewportBodyPx !== next) this.viewportBodyPx = next
        this.syncRowWindow(this.bodyTop)
        return
      }
      const info = uni.getWindowInfo()
      const pageH = info && info.windowHeight ? Math.round(info.windowHeight) : 0
      if (pageH > 0 && (this.fillMode !== 'page' || this.fillHeightPx !== pageH)) {
        this.fillMode = 'page'
        this.fillHeightPx = pageH
        this.$nextTick(() => this.measureViewport())
      }
    },
    centerClipStyle(part: 'head' | 'body'): Record<string, string> {
      const style: Record<string, string> = {}
      if (this.viewportCenterPx > 0) style.width = `${this.viewportCenterPx}px`
      if (part === 'head') style.height = `${this.metrics.head}px`
      else if (this.bodyHeightPx > 0) style.height = `${this.bodyHeightPx}px`
      return style
    },
    chromeHeight(): number {
      const metrics = this.metrics
      let height = metrics.head
      if (this.showToolbar()) height += metrics.toolbar
      if (this.activeFilters.length) height += metrics.filter
      if (this.showPager) height += metrics.pager
      if (this.footerRows.length) height += this.footerRows.length * metrics.row
      return height
    },
    intrinsicHeight(): number {
      const rows = this.pageRows.length
      return this.chromeHeight() + (rows > 0 ? rows * this.metrics.row : 120)
    },
    cellStyle(col: ResolvedColumn): Record<string, string> {
      const align = col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start'
      return { width: `${col.widthPx}px`, justifyContent: align }
    },
    rowClass(index: number, row: LingyunTableRow): Record<string, boolean> {
      const key = this.keyOf(row)
      const group = isGroupRow(row)
      return {
        'lingyun-table__row--group': group,
        'lingyun-table__row--alt': !group && this.stripe && index % 2 === 1,
        'lingyun-table__row--hover': !group && !!key && this.pressedKey === key,
        'lingyun-table__row--end': index === this.pageRows.length - 1,
        'lingyun-table__row--last': index === this.pageRows.length - 1 && this.contentHeightPx < this.bodyHeightPx,
      }
    },
    onRowPress(row: LingyunTableRow) {
      if (isGroupRow(row)) return
      this.cancelPress()
      this.pressLeft = this.bodyLeft
      this.pressTop = this.bodyTop
      this.pressPendingKey = this.keyOf(row)
      this.pressDelayTimer = setTimeout(() => {
        this.pressDelayTimer = 0
        this.pressedKey = this.pressPendingKey
        this.pressPendingKey = ''
      }, PRESS_DELAY) as unknown as number
    },
    onRowRelease() {
      if (this.pressDelayTimer) {
        clearTimeout(this.pressDelayTimer)
        this.pressDelayTimer = 0
        this.pressedKey = this.pressPendingKey
        this.pressPendingKey = ''
      }
      if (this.pressTimer) clearTimeout(this.pressTimer)
      this.pressTimer = setTimeout(() => {
        this.pressedKey = ''
        this.pressTimer = 0
      }, 80) as unknown as number
    },
    cancelPress() {
      if (this.pressDelayTimer) {
        clearTimeout(this.pressDelayTimer)
        this.pressDelayTimer = 0
      }
      this.pressPendingKey = ''
      if (this.pressTimer) {
        clearTimeout(this.pressTimer)
        this.pressTimer = 0
      }
      if (this.pressedKey) this.pressedKey = ''
    },
    clearPressIfScrolled(left: number, top: number) {
      if (!this.pressedKey && !this.pressPendingKey) return
      if (Math.abs(left - this.pressLeft) <= 8 && Math.abs(top - this.pressTop) <= 8) return
      this.cancelPress()
    },
    queryPayload(): LingyunTableQuery {
      return {
        page: this.currentPage,
        pageSize: this.pageSize,
        filters: this.filtersSnapshot(),
        conditions: this.conditionsSnapshot(),
        sortKey: this.sortKey,
        sortOrder: this.sortOrder,
      }
    },
    emitQuery() {
      if (!this.remote) return
      this.$emit('query-change', this.queryPayload())
    },
    keyOf(row: LingyunTableRow): string {
      if (isGroupRow(row)) return ''
      const value = row[this.rowKey]
      if (value == null || value === '') return ''
      return String(value)
    },
    cellValue(row: LingyunTableRow, col: ResolvedColumn, index = 0): unknown {
      if (isGroupRow(row)) {
        if (col.type === 'index') return ''
        if (col.key === this.groupFieldKey) return row[col.key]
        if (this.groupSumKeys.indexOf(col.key) >= 0) return row[col.key]
        return ''
      }
      if (col.type === 'index') return this.rowNo(index)
      return row[col.key]
    },
    footerText(row: LingyunTableRow, col: ResolvedColumn): string {
      if (!Object.prototype.hasOwnProperty.call(row, col.key)) return ''
      const value = row[col.key]
      if (value == null || value === '') return ''
      return String(value)
    },
    cellText(row: LingyunTableRow, col: ResolvedColumn, index = 0): string {
      if (isGroupRow(row)) {
        if (col.type === 'index') return ''
        if (col.key !== this.groupFieldKey && this.groupSumKeys.indexOf(col.key) < 0) return ''
        const value = row[col.key]
        if (col.formatter) return col.formatter(value, row)
        if (value == null || value === '') return ''
        return String(value)
      }
      if (col.type === 'index') return String(this.rowNo(index))
      const value = row[col.key]
      if (col.formatter) return col.formatter(value, row)
      if (value == null) return ''
      return String(value)
    },
    rowNo(index: number): number {
      const size = this.pageSize > 0 ? this.pageSize : 0
      const base = size > 0 ? (this.currentPage - 1) * size : 0
      const numbers = this.rowNumbers
      if (!numbers) return base + index + 1
      const n = numbers[index] || 0
      return n ? base + n : 0
    },
    showToolbar(): boolean {
      return !!(this.title || this.icon || this.showRefresh || this.columnPicker || this.exportExcel || this.$slots.tools)
    },
    columnShown(key: string): boolean {
      return this.hiddenKeys.indexOf(key) < 0
    },
    toggleColumn(key: string) {
      if (this.columnShown(key)) {
        const visible = (this.columns || []).filter((col) => this.columnShown(col.key))
        if (visible.length <= 1) return
        this.hiddenKeys = this.hiddenKeys.concat(key)
        return
      }
      this.hiddenKeys = this.hiddenKeys.filter((item) => item !== key)
    },
    onRefresh() {
      this.$emit('refresh', this.queryPayload())
    },
    onExportExcel() {
      const filename = sanitizeFileName(this.title || '表格')
      this.saveExcel(this.buildExcelXml(), filename)
      this.$emit('export', { filename: `${filename}.xls` })
    },
    buildExcelXml(): string {
      const cols = this.resolvedColumns
      const totals = this.groupTotals
      const rows = totals
        ? expandGroupedRows(this.sortedRows, this.groupFieldKey, this.groupSumKeys, this.rowKey, totals)
        : this.sortedRows
      const head = cols.map((col) => excelCell(col.title || col.key, false)).join('')
      let dataIndex = 0
      const body = rows
        .map((row) => {
          const cells = cols.map((col) => {
            if (isGroupRow(row)) {
              const text = this.cellText(row, col, 0)
              const value = row[col.key]
              const numeric = typeof value === 'number' && Number.isFinite(value) && !col.formatter
              return excelCell(text, numeric)
            }
            if (col.type === 'index') {
              dataIndex += 1
              return excelCell(String(dataIndex), true)
            }
            const value = row[col.key]
            const text = col.formatter ? col.formatter(value, row) : value == null ? '' : String(value)
            const numeric = typeof value === 'number' && Number.isFinite(value) && !col.formatter
            return excelCell(text, numeric)
          })
          return `<Row>${cells.join('')}</Row>`
        })
        .join('')
      const foot = this.footerRows
        .map((row) => {
          const cells = cols.map((col) => {
            const text = this.footerText(row, col)
            const value = row[col.key]
            const numeric = typeof value === 'number' && Number.isFinite(value)
            return excelCell(text, numeric)
          })
          return `<Row>${cells.join('')}</Row>`
        })
        .join('')
      const sheet = sanitizeFileName(this.title || 'Sheet1').slice(0, 31)
      return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="${escapeXml(sheet)}"><Table><Row>${head}</Row>${body}${foot}</Table></Worksheet>
</Workbook>`
    },
    saveExcel(xml: string, filename: string) {
      const file = `${filename}.xls`
      // #ifdef H5
      const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file
      link.click()
      URL.revokeObjectURL(url)
      // #endif
      // #ifndef H5
      const fs = uni.getFileSystemManager()
      const root = (uni as unknown as { env?: { USER_DATA_PATH?: string } }).env?.USER_DATA_PATH || ''
      if (!root) {
        uni.showToast({ title: '当前端不能保存文件', icon: 'none' })
        return
      }
      fs.writeFile({
        filePath: `${root}/${file}`,
        data: xml,
        encoding: 'utf8',
        success: () => {
          uni.openDocument({
            filePath: `${root}/${file}`,
            fileType: 'xls',
            showMenu: true,
            fail: () => {
              uni.showToast({ title: '已保存，无法打开', icon: 'none' })
            },
          })
        },
        fail: () => {
          uni.showToast({ title: '导出失败', icon: 'none' })
        },
      })
      // #endif
    },
    isSelected(row: LingyunTableRow): boolean {
      const key = this.keyOf(row)
      return !!key && this.selectedSet.has(key)
    },
    emitSelection(next: string[]) {
      this.innerSelected = next
      this.$emit('update:selectedKeys', next)
      this.$emit('selection-change', next)
    },
    toggleRow(row: LingyunTableRow) {
      const key = this.keyOf(row)
      if (!key) return
      const next = this.innerSelected.slice()
      const index = next.indexOf(key)
      if (index >= 0) next.splice(index, 1)
      else next.push(key)
      this.emitSelection(next)
    },
    togglePage() {
      const keys = this.pageKeys
      if (!keys.length) return
      if (this.pageAll) {
        const drop = new Set(keys)
        this.emitSelection(this.innerSelected.filter((key) => !drop.has(key)))
        return
      }
      const next = this.innerSelected.slice()
      const have = new Set(next)
      keys.forEach((key) => {
        if (have.has(key)) return
        have.add(key)
        next.push(key)
      })
      this.emitSelection(next)
    },
    sortColor(col: ResolvedColumn, order: 'asc' | 'desc'): string {
      return this.sortKey === col.key && this.sortOrder === order ? 'primary' : 'tertiary'
    },
    filterTypeOf(col: LingyunTableColumn): LingyunTableFilterType | '' {
      return columnFilterType(col)
    },
    filterOn(key: string): boolean {
      const picked = this.filterMap[key]
      return !!(picked && picked.length) || !!this.conditionMap[key]
    },
    /** 可排序列点表头切换排序；只能筛选的列点表头打开筛选面板 */
    onHeadTap(col: ResolvedColumn) {
      if (col.sortable) {
        this.onSort(col)
        return
      }
      if (columnFilterType(col)) this.openFilter(col.key)
    },
    onSort(col: ResolvedColumn) {
      if (!col.sortable) return
      let order: LingyunTableSortOrder = 'asc'
      if (this.sortKey === col.key) {
        order = this.sortOrder === 'asc' ? 'desc' : this.sortOrder === 'desc' ? '' : 'asc'
      }
      this.applySort(col.key, order)
      this.emitQuery()
    },
    applySort(key: string, order: LingyunTableSortOrder) {
      this.sortKey = order ? key : ''
      this.sortOrder = order
      this.$emit('sort-change', { key: this.sortKey, order })
    },
    rowsPassing(rows: LingyunTableRow[], tests: RowTest[]): LingyunTableRow[] {
      if (!tests.length) return rows
      return rows.filter((row) => {
        for (let i = 0; i < tests.length; i += 1) {
          if (!tests[i].test(row)) return false
        }
        return true
      })
    },
    /**
     * 面板选项：本地模式按「其它列筛选后」的行计数，和 Excel 一致；
     * remote 只看得到当前页，不计数。已勾选但当前数据里没有的值也保留。
     */
    buildFilterOptions(col: LingyunTableColumn): LingyunTableFilterOption[] {
      const source = (this.data || []).filter((row) => !isGroupRow(row))
      const rows = this.remote ? source : this.rowsPassing(source, this.rowTests.filter((item) => item.key !== col.key))
      const counts = new Map<string, number>()
      const samples = new Map<string, LingyunTableRow>()
      rows.forEach((row) => {
        const token = String(row[col.key] ?? '')
        counts.set(token, (counts.get(token) || 0) + 1)
        if (!samples.has(token)) samples.set(token, row)
      })
      const countOf = (token: string): number | undefined => (this.remote ? undefined : counts.get(token) || 0)
      const picked = this.filterMap[col.key] || []
      if (col.filters && col.filters.length) {
        const out = col.filters.map((opt) => ({ text: opt.text, value: opt.value, count: countOf(String(opt.value)) }))
        picked.forEach((token) => {
          if (!out.some((opt) => String(opt.value) === token)) out.push({ text: optionTextOf(col, token), value: token, count: countOf(token) })
        })
        return out
      }
      picked.forEach((token) => {
        if (!counts.has(token)) counts.set(token, 0)
      })
      const tokens = Array.from(counts.keys())
      const keyed = tokens.map((token) => ({
        token,
        sort: toSortKey(samples.has(token) ? samples.get(token)![col.key] : token),
      }))
      keyed.sort((a, b) => compareKey(a.sort, b.sort))
      return keyed.map(({ token }) => ({
        text: optionTextOf(col, token, samples.get(token)),
        value: token,
        count: countOf(token),
      }))
    },
    openFilter(key: string) {
      const col = this.columnByKey[key]
      if (!col) return
      this.cancelPress()
      this.filterSheetKey = key
      this.sheetOptions = columnFilterType(col) === 'select' ? this.buildFilterOptions(col) : []
      this.filterSheetOpen = true
    },
    onFilterSheetShow(open: boolean) {
      this.filterSheetOpen = open
    },
    onFilterConfirm(result: LingyunTableFilterResult) {
      const col = this.sheetColumn
      if (!col) return
      const key = col.key
      let sortChanged = false
      if (col.sortable) {
        const current: LingyunTableSortOrder = this.sortKey === key ? this.sortOrder : ''
        if (result.sortOrder !== current) {
          sortChanged = true
          if (result.sortOrder) this.applySort(key, result.sortOrder)
          else this.applySort('', '')
        }
      }
      const filterChanged = this.setColumnFilter(key, result.values, result.condition)
      if (filterChanged) this.afterFilterChange(key)
      else if (sortChanged) this.emitQuery()
    },
    /** 返回这一列的筛选是否真的变了 */
    setColumnFilter(key: string, values: string[], condition: LingyunTableFilterCondition | null): boolean {
      const prevValues = this.filterMap[key] || []
      const prevCond = this.conditionMap[key] || null
      if (sameStrings(prevValues, values) && sameCondition(prevCond, condition)) return false
      const nextMap = { ...this.filterMap }
      if (values.length) nextMap[key] = values.slice()
      else delete nextMap[key]
      const nextConds = { ...this.conditionMap }
      if (condition) nextConds[key] = { ...condition }
      else delete nextConds[key]
      this.filterMap = nextMap
      this.conditionMap = nextConds
      return true
    },
    filtersSnapshot(): Record<string, string[]> {
      const out: Record<string, string[]> = {}
      Object.keys(this.filterMap).forEach((key) => {
        out[key] = this.filterMap[key].slice()
      })
      return out
    },
    conditionsSnapshot(): Record<string, LingyunTableFilterCondition> {
      const out: Record<string, LingyunTableFilterCondition> = {}
      Object.keys(this.conditionMap).forEach((key) => {
        out[key] = { ...this.conditionMap[key] }
      })
      return out
    },
    /** 筛选变了回到第一页、表体回顶，再统一抛事件 */
    afterFilterChange(key: string) {
      this.innerPage = 1
      this.$emit('update:page', 1)
      this.scrollBodyToTop()
      this.$emit('filter-change', {
        key,
        values: (this.filterMap[key] || []).slice(),
        condition: this.conditionMap[key] ? { ...this.conditionMap[key] } : null,
        filters: this.filtersSnapshot(),
        conditions: this.conditionsSnapshot(),
      })
      this.emitQuery()
    },
    onChipTap(key: string) {
      if (!this.chipsDragged) this.openFilter(key)
    },
    onChipClear(key: string) {
      if (!this.chipsDragged) this.clearColumnFilter(key)
    },
    /** H5：标签栏里真正带横向滚动的节点（uni scroll-view 内层） */
    chipsScroller(host: EventTarget | null): HTMLElement | null {
      // #ifdef H5
      const el = host as HTMLElement | null
      if (!el || typeof el.querySelectorAll !== 'function') return null
      const list = el.querySelectorAll<HTMLElement>('.uni-scroll-view')
      for (let i = 0; i < list.length; i += 1) {
        if (list[i].scrollWidth > list[i].clientWidth + 1) return list[i]
      }
      // #endif
      return null
    },
    /** 电脑上滚轮只有竖向，竖向滚轮也拿来横滚；滚到头时放给页面 */
    onChipsWheel(raw: unknown) {
      const e = raw as WheelEvent
      const box = this.chipsScroller(e.currentTarget)
      if (!box) return
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      const before = box.scrollLeft
      box.scrollLeft = before + delta
      if (box.scrollLeft !== before) e.preventDefault()
    },
    /** 电脑上鼠标按住拖动横滚。手机走 scroll-view 原生滑动 */
    onChipsMouseDown(raw: unknown) {
      // #ifdef H5
      const e = raw as MouseEvent
      if (e.button !== 0) return
      const box = this.chipsScroller(e.currentTarget)
      if (!box) return
      if (this.chipsDragStop) this.chipsDragStop()
      this.chipsDragged = false
      const startX = e.clientX
      const startLeft = box.scrollLeft
      const move = (ev: MouseEvent) => {
        const dx = ev.clientX - startX
        if (Math.abs(dx) > 4) this.chipsDragged = true
        if (this.chipsDragged) box.scrollLeft = startLeft - dx
      }
      const stop = () => {
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseup', stop)
        this.chipsDragStop = null
        // 松手后的 click 同步先到，再复位
        setTimeout(() => {
          this.chipsDragged = false
        }, 0)
      }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', stop)
      this.chipsDragStop = stop
      // #endif
    },
    clearColumnFilter(key: string) {
      if (this.setColumnFilter(key, [], null)) this.afterFilterChange(key)
    },
    clearAllFilters() {
      if (!Object.keys(this.filterMap).length && !Object.keys(this.conditionMap).length) return
      this.filterMap = {}
      this.conditionMap = {}
      this.afterFilterChange('')
    },
    scrollBodyToTop() {
      if (!this.bodyTop && !this.leftTop && !this.rightTop) return
      this.bodyTop = 0
      this.leftTop = 0
      this.rightTop = 0
      this.syncRowWindow(0)
      this.mpCommand(this.bodyLeft, 0)
    },
    goPage(next: number) {
      const page = Math.min(this.pageCount, Math.max(1, next))
      if (page === this.currentPage) return
      this.innerPage = page
      this.bodyTop = 0
      this.leftTop = 0
      this.rightTop = 0
      this.syncRowWindow(0)
      this.mpCommand(this.bodyLeft, 0)
      this.$emit('update:page', page)
      this.$emit('page-change', page)
      this.emitQuery()
    },
    onRowClick(row: LingyunTableRow) {
      if (this.centerMoved || isGroupRow(row)) return
      this.$emit('row-click', row)
    },
    armSync(source: string) {
      this.syncSource = source
      if (this.syncTimer) clearTimeout(this.syncTimer)
      this.syncTimer = setTimeout(() => {
        this.syncSource = ''
        this.syncTimer = 0
      }, 80) as unknown as number
    },
    readCenterClient(): number {
      const el = this.$el as HTMLElement | undefined
      if (!el || typeof el.querySelectorAll !== 'function') return 0
      const nodes = el.querySelectorAll('.lingyun-table__x--body .uni-scroll-view')
      const scroller = nodes[nodes.length - 1] as HTMLElement | undefined
      if (!scroller || !scroller.clientWidth) return 0
      return scroller.clientWidth
    },
    revealHBar(_show?: boolean) {
      // H5 悬浮条常显，这里只用来刷新中间可视宽度
      // #ifdef H5
      const client = this.readCenterClient()
      if (client > 0 && this.centerClientPx !== client) this.centerClientPx = client
      // #endif
    },
    nativePointer(event: unknown): { x: number; y: number; target: Element | null; preventDefault?: () => void } {
      const raw = event as {
        $event?: MouseEvent & { touches?: TouchList; changedTouches?: TouchList }
        touches?: TouchList
        changedTouches?: TouchList
        clientX?: number
        clientY?: number
        pageX?: number
        pageY?: number
        target?: EventTarget | null
        currentTarget?: EventTarget | null
        preventDefault?: () => void
      }
      const native = raw?.$event || raw
      const touch =
        (native.touches && native.touches[0]) ||
        (native.changedTouches && native.changedTouches[0]) ||
        null
      const x = Number((touch && (touch.clientX || touch.pageX)) || native.clientX || native.pageX || 0)
      const y = Number((touch && (touch.clientY || touch.pageY)) || native.clientY || native.pageY || 0)
      const target = (native.currentTarget || native.target || null) as Element | null
      return { x, y, target, preventDefault: native.preventDefault?.bind(native) }
    },
    findBarEl(start: Element | null, className: string): HTMLElement | null {
      let node: Element | null = start
      while (node) {
        if (node instanceof HTMLElement && node.classList.contains(className)) return node
        node = node.parentElement
      }
      return null
    },
    pointerX(event: unknown): number {
      return this.nativePointer(event).x
    },
    pointerY(event: unknown): number {
      return this.nativePointer(event).y
    },
    onHBarStart(event: unknown) {
      if (!this.scrollbarHandle) return
      const point = this.nativePointer(event)
      point.preventDefault?.()
      const track = this.hBarTrackPx
      const view = this.centerViewPx
      const content = Math.max(this.centerWidth, view)
      const max = Math.max(0, content - view)
      const thumb = Math.max(40, Math.round((track * view) / content))
      const travel = Math.max(1, track - thumb)
      // #ifdef H5
      const bar = this.findBarEl(point.target, 'lingyun-table__hbar')
      if (bar && max > 0) {
        const rect = bar.getBoundingClientRect()
        const x = point.x - rect.left
        const thumbLeft = (this.bodyLeft / max) * travel
        if (x < thumbLeft || x > thumbLeft + thumb) {
          const ratio = Math.min(1, Math.max(0, (x - thumb / 2) / travel))
          this.scrollCenterTo(ratio * max)
        }
      }
      // #endif
      this.hDragging = true
      this.hDragX = point.x
      this.hDragLeft = this.bodyLeft
      // #ifdef H5
      if (typeof document === 'undefined') return
      this.detachHBarDrag()
      const move = (e: MouseEvent) => this.onHBarMove(e)
      const up = () => {
        this.detachHBarDrag()
        this.onHBarEnd()
      }
      this.hDragMove = move
      this.hDragUp = up
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
      // #endif
    },
    onHBarMove(event: unknown) {
      if (!this.scrollbarHandle || !this.hDragging) return
      const track = this.hBarTrackPx
      const view = this.centerViewPx
      const content = Math.max(this.centerWidth, view)
      const max = Math.max(0, content - view)
      const thumb = Math.max(40, (track * view) / content)
      const travel = Math.max(1, track - thumb)
      const next = this.hDragLeft + (this.pointerX(event) - this.hDragX) * (max / travel)
      this.scrollCenterTo(Math.min(max, Math.max(0, next)))
    },
    onHBarEnd() {
      this.hDragging = false
    },
    detachHBarDrag() {
      if (typeof document === 'undefined') return
      if (this.hDragMove) document.removeEventListener('mousemove', this.hDragMove)
      if (this.hDragUp) document.removeEventListener('mouseup', this.hDragUp)
      this.hDragMove = null
      this.hDragUp = null
    },
    onVBarStart(event: unknown) {
      if (!this.scrollbarHandle) return
      const point = this.nativePointer(event)
      point.preventDefault?.()
      const track = this.vBarTrackPx
      const view = this.bodyHeightPx
      const content = Math.max(this.contentHeightPx, view)
      const max = Math.max(0, content - view)
      const thumb = Math.max(40, Math.round((track * view) / content))
      const travel = Math.max(1, track - thumb)
      // #ifdef H5
      const bar = this.findBarEl(point.target, 'lingyun-table__vbar')
      if (bar && max > 0) {
        const rect = bar.getBoundingClientRect()
        const y = point.y - rect.top
        const thumbTop = (this.bodyTop / max) * travel
        if (y < thumbTop || y > thumbTop + thumb) {
          const ratio = Math.min(1, Math.max(0, (y - thumb / 2) / travel))
          this.scrollBodyTo(ratio * max)
        }
      }
      // #endif
      this.vDragging = true
      this.vDragY = point.y
      this.vDragTop = this.bodyTop
      // #ifdef H5
      if (typeof document === 'undefined') return
      this.detachVBarDrag()
      const move = (e: MouseEvent) => this.onVBarMove(e)
      const up = () => {
        this.detachVBarDrag()
        this.onVBarEnd()
      }
      this.vDragMove = move
      this.vDragUp = up
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
      // #endif
    },
    onVBarMove(event: unknown) {
      if (!this.scrollbarHandle || !this.vDragging) return
      const track = this.vBarTrackPx
      const view = this.bodyHeightPx
      const content = Math.max(this.contentHeightPx, view)
      const max = Math.max(0, content - view)
      const thumb = Math.max(40, (track * view) / content)
      const travel = Math.max(1, track - thumb)
      const next = this.vDragTop + (this.pointerY(event) - this.vDragY) * (max / travel)
      this.scrollBodyTo(Math.min(max, Math.max(0, next)))
    },
    onVBarEnd() {
      this.vDragging = false
    },
    detachVBarDrag() {
      if (typeof document === 'undefined') return
      if (this.vDragMove) document.removeEventListener('mousemove', this.vDragMove)
      if (this.vDragUp) document.removeEventListener('mouseup', this.vDragUp)
      this.vDragMove = null
      this.vDragUp = null
    },
    scrollCenterTo(left: number) {
      this.syncColWindow(left)
      this.bodyLeft = left
      this.headLeft = left
      this.armSync('body')
      this.mpCommand(left, this.bodyTop)
    },
    /** 小程序：让 WXS 跳到指定位置（滚轮、拖滚动条、翻页） */
    mpCommand(left: number, top: number) {
      // #ifdef MP-WEIXIN
      this.syncCmdLeft = left
      this.syncCmdTop = top
      this.syncSeq += 1
      // #endif
    },
    /** WXS：跨块或停下时回报位置，用来换虚拟窗口 */
    onSyncScroll(event?: { left?: number; top?: number; end?: boolean } | null) {
      const left = Number(event && event.left) || 0
      const top = Number(event && event.top) || 0
      this.clearPressIfScrolled(left, top)
      this.syncRowWindow(top)
      this.syncColWindow(left)
      this.bodyLeft = left
      this.headLeft = left
      this.bodyTop = top
      this.leftTop = top
      this.rightTop = top
    },
    /** WXS：手势确认方向，取消按下高亮，并挡住随后的行点击 */
    onSyncMoveStart() {
      this.cancelPress()
      this.markMoved()
    },
    onSyncTouchEnd(event?: { moved?: boolean } | null) {
      if (event && event.moved) this.markMoved()
    },
    markMoved() {
      this.centerMoved = true
      if (this.movedTimer) clearTimeout(this.movedTimer)
      this.movedTimer = setTimeout(() => {
        this.movedTimer = 0
        this.centerMoved = false
      }, 120) as unknown as number
    },
    onCenterTouchStart(event: { touches?: ArrayLike<TouchPoint>; timeStamp?: number }) {
      const touch = event.touches && event.touches[0]
      if (!touch) return
      this.stopGlide()
      this.glideSamples = []
      this.centerTouchX = touch.clientX || touch.pageX || 0
      this.centerTouchY = touch.clientY || touch.pageY || 0
      this.centerTouchLeft = this.bodyLeft
      this.centerTouchTop = this.bodyTop
      this.centerTouchAxis = ''
      this.noteGlideSample(event)
    },
    onCenterTouchMove(event: { touches?: ArrayLike<TouchPoint>; timeStamp?: number }) {
      const touch = event.touches && event.touches[0]
      if (!touch) return
      const x = touch.clientX || touch.pageX || 0
      const y = touch.clientY || touch.pageY || 0
      const dx = x - this.centerTouchX
      const dy = y - this.centerTouchY
      if (!this.centerTouchAxis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
        this.centerTouchAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        this.centerMoved = true
      }
      this.noteGlideSample(event)
      if (this.centerTouchAxis === 'x') {
        const view = this.centerViewPx
        const max = Math.max(0, this.centerWidth - view)
        const left = Math.min(max, Math.max(0, this.centerTouchLeft - dx))
        this.scrollCenterTo(left)
        this.revealHBar(true)
        return
      }
      this.scrollBodyTo(this.centerTouchTop - dy)
    },
    onCenterTouchEnd(event?: { changedTouches?: ArrayLike<TouchPoint>; timeStamp?: number }) {
      if (event && event.changedTouches && event.changedTouches.length) {
        this.noteGlideSample({ touches: event.changedTouches, timeStamp: event.timeStamp })
      }
      const moved = this.centerMoved
      const axis = this.centerTouchAxis
      const speed = axis ? this.releaseGlideSpeed(axis) : 0
      if (axis && Math.abs(speed) >= 0.08) {
        this.gliding = true
        this.centerTouchAxis = ''
        this.startGlide(axis, speed)
      } else {
        this.centerTouchAxis = ''
        this.gliding = false
      }
      if (!moved) return
      setTimeout(() => {
        this.centerMoved = false
      }, 80)
    },
    noteGlideSample(event: { touches?: ArrayLike<TouchPoint>; timeStamp?: number }) {
      const touch = event.touches && event.touches[0]
      if (!touch) return
      const t = event.timeStamp || Date.now()
      const sample = {
        x: touch.clientX || touch.pageX || 0,
        y: touch.clientY || touch.pageY || 0,
        t,
      }
      const list = this.glideSamples
      list.push(sample)
      const keep = t - 100
      while (list.length > 1 && list[0].t < keep) list.shift()
    },
    releaseGlideSpeed(axis: 'x' | 'y'): number {
      const list = this.glideSamples
      if (list.length < 2) return 0
      const last = list[list.length - 1]
      let first = last
      for (let i = list.length - 1; i >= 0; i -= 1) {
        if (last.t - list[i].t > 90) break
        first = list[i]
      }
      const dt = last.t - first.t
      if (dt < 16) return 0
      const vx = (last.x - first.x) / dt
      const vy = (last.y - first.y) / dt
      return axis === 'x' ? -vx : -vy
    },
    scrollBodyTo(top: number) {
      const max = Math.max(0, this.contentHeightPx - this.bodyHeightPx)
      const next = Math.min(max, Math.max(0, top))
      this.bodyTop = next
      this.leftTop = next
      this.rightTop = next
      this.syncRowWindow(next)
      this.armSync('body')
      this.mpCommand(this.bodyLeft, next)
    },
    stopGlide() {
      if (this.glideTimer) {
        clearTimeout(this.glideTimer)
        this.glideTimer = 0
      }
      this.gliding = false
      this.glideV = 0
    },
    startGlide(axis: 'x' | 'y', speed: number) {
      this.stopGlide()
      this.gliding = true
      this.glideV = Math.max(-2.8, Math.min(2.8, speed))
      this.glideAt = Date.now()
      const step = () => {
        if (!this.gliding) return
        const now = Date.now()
        const dt = Math.min(34, Math.max(1, now - this.glideAt))
        this.glideAt = now
        this.glideV *= Math.exp(-dt / 320)
        const delta = this.glideV * dt
        if (axis === 'x') {
          const before = this.bodyLeft
          const max = Math.max(0, this.centerWidth - this.centerViewPx)
          const next = Math.min(max, Math.max(0, before + delta))
          this.scrollCenterTo(next)
          this.revealHBar(true)
          if (Math.abs(next - before) < 0.5 || Math.abs(this.glideV) < 0.02) {
            this.stopGlide()
            return
          }
        } else {
          const before = this.bodyTop
          const max = Math.max(0, this.contentHeightPx - this.bodyHeightPx)
          const next = Math.min(max, Math.max(0, before + delta))
          this.scrollBodyTo(next)
          if (Math.abs(next - before) < 0.5 || Math.abs(this.glideV) < 0.02) {
            this.stopGlide()
            return
          }
        }
        this.glideTimer = setTimeout(step, 16) as unknown as number
      }
      this.glideTimer = setTimeout(step, 16) as unknown as number
    },
    onTablePointerEnter() {
      // #ifndef MP-WEIXIN
      return
      // #endif
      // #ifdef MP-WEIXIN
      uni.createSelectorQuery().selectViewport().scrollOffset((res) => {
        const offset = res as { scrollTop?: number } | null
        this.pageHoldTop = offset && typeof offset.scrollTop === 'number' ? offset.scrollTop : 0
      }).exec()
      // #endif
    },
    onTableWheel(raw: unknown) {
      // #ifndef MP-WEIXIN
      return
      // #endif
      // #ifdef MP-WEIXIN
      const event = (raw || {}) as {
        deltaX?: number
        deltaY?: number
        shiftKey?: boolean
        detail?: { deltaX?: number; deltaY?: number; wheelDelta?: number; wheelDeltaY?: number; shiftKey?: boolean }
        preventDefault?: () => void
        stopPropagation?: () => void
      }
      event.preventDefault?.()
      event.stopPropagation?.()
      this.stopGlide()
      const detail = event.detail || {}
      let dx = detail.deltaX || event.deltaX || 0
      let dy = detail.deltaY || event.deltaY || 0
      if (!dx && !dy) {
        const legacy = detail.wheelDeltaY || detail.wheelDelta || 0
        if (legacy) dy = -legacy
      }
      const scale = (value: number) => {
        if (!value) return 0
        return Math.abs(value) < 10 ? Math.sign(value) * 48 : value
      }
      dx = scale(dx)
      dy = scale(dy)
      const shift = !!(event.shiftKey || detail.shiftKey)
      if (shift && Math.abs(dy) >= Math.abs(dx)) {
        dx = dy
        dy = 0
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        const before = this.bodyLeft
        const max = Math.max(0, this.centerWidth - this.centerViewPx)
        const next = Math.min(max, Math.max(0, before + dx))
        if (Math.abs(next - before) < 0.5) {
          // 横滚到头：把剩余滚动量交给页面，不再回拉页面位置
          this.chainPageWheel(dy || dx)
          return
        }
        this.scrollCenterTo(next)
        this.revealHBar(true)
        return
      }
      const before = this.bodyTop
      const maxY = Math.max(0, this.contentHeightPx - this.bodyHeightPx)
      const nextY = Math.min(maxY, Math.max(0, before + dy))
      if (Math.abs(nextY - before) < 0.5) {
        // 竖滚到顶/底：只链到页面，避免 hold 与 chain 互相抢造成抖动
        this.chainPageWheel(dy)
        return
      }
      this.scrollBodyTo(nextY)
      // #endif
    },
    chainPageWheel(delta: number) {
      if (!delta) return
      if (this.pageHoldTimer) {
        clearTimeout(this.pageHoldTimer)
        this.pageHoldTimer = 0
      }
      // 以当前真实页滚为准累加，避免陈旧 pageHoldTop 把页面拽回去
      uni.createSelectorQuery().selectViewport().scrollOffset((res) => {
        const offset = res as { scrollTop?: number } | null
        const top = offset && typeof offset.scrollTop === 'number' ? offset.scrollTop : 0
        const next = Math.max(0, top + delta)
        this.pageHoldTop = next
        if (Math.abs(next - top) <= 0.5) return
        this.pageHoldTimer = setTimeout(() => {
          this.pageHoldTimer = 0
          uni.pageScrollTo({ scrollTop: next, duration: 0 })
        }, 0) as unknown as number
      }).exec()
    },
    onBodyScroll(event: ScrollEvent) {
      const left = event.detail?.scrollLeft || 0
      const top = event.detail?.scrollTop || 0
      const leftChanged = Math.abs(left - this.bodyLeft) > 0.5
      this.clearPressIfScrolled(left, top)
      this.syncRowWindow(top)
      this.syncColWindow(left)
      if (this.centerClientPx <= 0) {
        const client = this.readCenterClient()
        if (client > 0) this.centerClientPx = client
      }
      this.bodyLeft = left
      this.bodyTop = top
      this.revealHBar(leftChanged)
      if (this.syncSource === 'head' || this.syncSource === 'left' || this.syncSource === 'right') return
      this.headLeft = left
      this.leftTop = top
      this.rightTop = top
      this.armSync('body')
    },
    onHeadScroll(event: ScrollEvent) {
      const left = event.detail?.scrollLeft || 0
      const changed = Math.abs(left - this.headLeft) > 0.5
      this.syncColWindow(left)
      this.headLeft = left
      this.revealHBar(changed)
      if (this.syncSource === 'body') return
      this.bodyLeft = left
      this.armSync('head')
    },
    onLeftScroll(event: ScrollEvent) {
      if (this.centerTouchAxis || this.gliding) return
      const top = event.detail?.scrollTop || 0
      this.clearPressIfScrolled(this.bodyLeft, top)
      this.syncRowWindow(top)
      this.leftTop = top
      if (this.syncSource === 'body' || this.syncSource === 'right') return
      this.bodyTop = top
      this.rightTop = top
      this.armSync('left')
    },
    onRightScroll(event: ScrollEvent) {
      if (this.centerTouchAxis || this.gliding) return
      const top = event.detail?.scrollTop || 0
      this.clearPressIfScrolled(this.bodyLeft, top)
      this.syncRowWindow(top)
      this.rightTop = top
      if (this.syncSource === 'body' || this.syncSource === 'left') return
      this.bodyTop = top
      this.leftTop = top
      this.armSync('right')
    },
  },
})
</script>

<script src="./table-sync.wxs" module="tableSync" lang="wxs"></script>

<style lang="scss">
@import '../../styles/variables.scss';

$ly-table-row: 52px;
$ly-table-head: 44px;
$ly-table-radius: 26px;

.lingyun-table {
  width: 100%;
  overflow: hidden;
  border-radius: $ly-table-radius;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  box-sizing: border-box;
}

.lingyun-table--fill {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.lingyun-table--fill .lingyun-table__toolbar,
.lingyun-table--fill .lingyun-table__head,
.lingyun-table--fill .lingyun-table__filters,
.lingyun-table--fill .lingyun-table__foot,
.lingyun-table--fill .lingyun-table__pager {
  flex-shrink: 0;
}

.lingyun-table--fill .lingyun-table__body {
  flex: 1;
  min-height: 0;
}

.lingyun-table__track {
  display: flex;
  flex-direction: column;
}

.lingyun-table__toolbar {
  height: var(--ly-table-toolbar, 52px);
  padding: 0 8px 0 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__toolbar-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-table__toolbar-title {
  font-size: 17px;
  line-height: 22px;
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-table__toolbar-title--gap {
  margin-left: 8px;
}

.lingyun-table__toolbar-tools {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
}

.lingyun-table__tool {
  width: 32px;
  height: 32px;
  margin-left: 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-table__tool--hover,
.lingyun-table__pick--hover {
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-table__pick {
  height: var(--ly-table-pick, 44px);
  display: flex;
  flex-direction: row;
  align-items: center;
}

.lingyun-table__pick-text {
  flex: 1;
  min-width: 0;
  margin-left: 10px;
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lingyun-table__row-pad,
.lingyun-table__col-pad {
  flex-shrink: 0;
}

.lingyun-table__head,
.lingyun-table__body {
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: stretch;
}

.lingyun-table__body {
  position: relative;
  overflow: hidden;
}

/* 原生滚动条不占位。H5 横向只留悬浮拖动条，竖向也不留槽，滚到底才能和固定列对齐 */
/* #ifdef H5 */
.lingyun-table__x--body :deep(.uni-scroll-view),
.lingyun-table__y :deep(.uni-scroll-view),
.lingyun-table__y--right :deep(.uni-scroll-view) {
  scrollbar-width: none;
}

.lingyun-table__x--body :deep(.uni-scroll-view)::-webkit-scrollbar,
.lingyun-table__y :deep(.uni-scroll-view)::-webkit-scrollbar,
.lingyun-table__y--right :deep(.uni-scroll-view)::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
/* #endif */

.lingyun-table__hbar,
.lingyun-table__vbar {
  position: absolute;
  z-index: 20;
  box-sizing: border-box;
  pointer-events: auto;
  background-color: transparent;
}

.lingyun-table__hbar {
  bottom: 0;
  height: 20px;
  padding: 5px 2px;
  cursor: pointer;
}

.lingyun-table__vbar {
  top: 0;
  width: 20px;
  padding: 2px 5px;
  cursor: pointer;
}

.lingyun-table__hbar-thumb,
.lingyun-table__vbar-thumb {
  border-radius: 999px;
  background-color: rgba(60, 60, 67, 0.48);
  pointer-events: none;
}

.lingyun-table__hbar-thumb {
  height: 10px;
}

.lingyun-table__vbar-thumb {
  width: 10px;
}

/* 手机小程序：细指示条，只表示位置，不拦截手势 */
.lingyun-table__hbar--indicator {
  height: 6px;
  padding: 2px 0;
  pointer-events: none;
  cursor: default;
}

.lingyun-table__vbar--indicator {
  width: 6px;
  padding: 0 2px;
  pointer-events: none;
  cursor: default;
}

.lingyun-table__hbar--indicator .lingyun-table__hbar-thumb {
  height: 2px;
  background-color: rgba(60, 60, 67, 0.35);
}

.lingyun-table__vbar--indicator .lingyun-table__vbar-thumb {
  width: 2px;
  background-color: rgba(60, 60, 67, 0.35);
}

.lingyun-table__loading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lingyun-fill-quaternary, #{$lingyun-fill-quaternary});
}

.lingyun-table__side {
  position: relative;
  z-index: 4;
  flex-shrink: 0;
  box-sizing: border-box;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  border-right: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__side--right {
  border-right-width: 0;
  border-left: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__x {
  flex: 1;
  width: 0;
  min-width: 0;
  white-space: nowrap;
}

.lingyun-table__clip {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.lingyun-table__clip .lingyun-table__x {
  width: 100%;
  flex: none;
}

.lingyun-table__x--mp {
  height: 100%;
  overflow: hidden;
}

.lingyun-table__x--head {
  height: var(--ly-table-head, #{$ly-table-head});
}

.lingyun-table__y {
  position: relative;
  z-index: 4;
  flex-shrink: 0;
  box-sizing: border-box;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  border-right: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__y--right {
  border-right-width: 0;
  border-left: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

/* 小程序固定列不用原生 scroll-view，和中间区一起由 WXS 位移，这里只负责裁切 */
.lingyun-table__y--mp {
  overflow: hidden;
}

.lingyun-table__row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: var(--ly-table-row, #{$ly-table-row});
  box-sizing: border-box;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}

.lingyun-table__row--head {
  height: var(--ly-table-head, #{$ly-table-head});
  border-bottom: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__body .lingyun-table__row {
  border-bottom: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

/* 最后一行贴着分页或卡片底边时不再画，避免和上边线叠成两道。内容比表体矮时仍画线，把数据和空白分开 */
.lingyun-table__body .lingyun-table__row--end {
  border-bottom-width: 0;
}

.lingyun-table__body .lingyun-table__row--last {
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table--stripe .lingyun-table__row--alt {
  background-color: var(--lingyun-fill-quaternary, #{$lingyun-fill-quaternary});
}

.lingyun-table__row--group {
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-table__row--hover {
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

/* 斑马行选择器更具体，按压色必须写在它后面，并用更深的 Fill，否则和条纹叠成同一档灰 */
.lingyun-table--stripe .lingyun-table__row--alt.lingyun-table__row--hover {
  background-color: var(--lingyun-fill, #{$lingyun-fill});
}

.lingyun-table__cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
  height: 100%;
  padding: 0 12px;
  box-sizing: border-box;
  min-width: 0;
}

.lingyun-table__cell--check {
  width: var(--ly-table-check, 48px);
  padding: 0;
  justify-content: center;
}

.lingyun-table--border .lingyun-table__cell {
  border-right: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

/* 固定列外沿已有 1px 阴影。再画单元格右边线会叠成两像素。最右列贴着表格外缘，不再画右边线 */
.lingyun-table--border .lingyun-table__side .lingyun-table__cell:last-child,
.lingyun-table--border .lingyun-table__y .lingyun-table__cell:last-child {
  border-right-width: 0;
}

.lingyun-table__head-hit {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0;
  flex: 1;
  height: 100%;
}

.lingyun-table__head-text {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

/* 上下两个箭头叠成一组，字形盒比箭头大，靠负边距收紧 */
.lingyun-table__sort {
  flex-shrink: 0;
  margin-left: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.lingyun-table__sort-up,
.lingyun-table__sort-down {
  display: flex;
  height: 7px;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.lingyun-table__filter {
  flex-shrink: 0;
  width: 28px;
  height: 100%;
  margin-right: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-table__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.lingyun-table__text {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 15px;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-table__text--group {
  font-weight: 600;
}

.lingyun-table__check {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  box-sizing: border-box;
  border: 1.5px solid var(--lingyun-separator, #{$lingyun-separator});
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-table__check--on,
.lingyun-table__check--some {
  border-color: var(--lingyun-primary, #{$lingyun-primary});
  background-color: var(--lingyun-primary, #{$lingyun-primary});
}

.lingyun-table__dash {
  width: 10px;
  height: 2px;
  border-radius: 1px;
  background-color: #ffffff;
}

.lingyun-table__filters {
  height: var(--ly-table-filter, 40px);
  box-sizing: border-box;
  border-bottom: 1px solid var(--lingyun-separator, #{$lingyun-separator});
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}

.lingyun-table__filters-scroll {
  width: 100%;
  height: 100%;
  white-space: nowrap;
}

.lingyun-table__filters-track {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  box-sizing: border-box;
}

.lingyun-table__chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 28px;
  padding: 0 4px 0 12px;
  margin-right: 8px;
  box-sizing: border-box;
  border-radius: 14px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-table__chip--clear {
  padding: 0 12px;
  background-color: transparent;
}

.lingyun-table__chip--hover {
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-table__chip-text {
  font-size: 13px;
  line-height: 18px;
  white-space: nowrap;
  color: var(--lingyun-primary, #{$lingyun-primary});
}

.lingyun-table__chip-text--clear {
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table__chip-x {
  width: 24px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-table__empty {
  flex: 1;
  height: 100%;
  min-height: 120px;
  padding: 12px 0 8px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-table__foot {
  flex-shrink: 0;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  border-top: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__foot-line {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
}

.lingyun-table__foot-line + .lingyun-table__foot-line {
  border-top: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__row--foot {
  height: var(--ly-table-row, #{$ly-table-row});
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}

.lingyun-table__text--foot {
  font-weight: 600;
}

.lingyun-table__pager {
  min-height: var(--ly-table-pager, 48px);
  padding: 8px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__pager-meta,
.lingyun-table__page-no {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-table__pager-nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.lingyun-table__page-btn {
  padding: 4px 10px;
  border-radius: 999px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
}

.lingyun-table__page-btn--off {
  opacity: 0.4;
}

.lingyun-table__page-btn-text {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-table--compact .lingyun-table__toolbar {
  padding-left: 12px;
}

.lingyun-table--compact .lingyun-table__toolbar-title {
  font-size: 15px;
  line-height: 20px;
}

.lingyun-table--compact .lingyun-table__tool {
  width: 28px;
  height: 28px;
}

.lingyun-table--compact .lingyun-table__pick-text,
.lingyun-table--compact .lingyun-table__text {
  font-size: 13px;
  line-height: 18px;
}

.lingyun-table--compact .lingyun-table__head-text {
  font-size: 12px;
  line-height: 16px;
}

.lingyun-table--compact .lingyun-table__sort-up,
.lingyun-table--compact .lingyun-table__sort-down {
  height: 6px;
}

.lingyun-table--compact .lingyun-table__filter {
  width: 24px;
}

.lingyun-table--compact .lingyun-table__cell {
  padding: 0 8px;
}

.lingyun-table--compact .lingyun-table__check {
  width: 18px;
  height: 18px;
  border-radius: 5px;
}

.lingyun-table--compact .lingyun-table__dash {
  width: 8px;
}

.lingyun-table--compact .lingyun-table__filters-track {
  padding: 0 8px;
}

.lingyun-table--compact .lingyun-table__chip {
  height: 24px;
  padding-left: 10px;
  border-radius: 12px;
}

.lingyun-table--compact .lingyun-table__chip--clear {
  padding: 0 10px;
}

.lingyun-table--compact .lingyun-table__chip-x {
  height: 24px;
}

.lingyun-table--compact .lingyun-table__chip-text,
.lingyun-table--compact .lingyun-table__pager-meta,
.lingyun-table--compact .lingyun-table__page-no,
.lingyun-table--compact .lingyun-table__page-btn-text {
  font-size: 12px;
  line-height: 16px;
}

.lingyun-table--compact .lingyun-table__pager {
  padding: 4px 8px;
}

.lingyun-table--compact .lingyun-table__page-btn {
  padding: 2px 8px;
}
</style>
