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
          :hover-class="loading ? 'none' : 'lingyun-table__tool--hover'"
          :hover-stay-time="70"
          @click="onRefresh"
        >
          <view class="lingyun-table__tool-icon" :class="{ 'lingyun-table__tool-icon--spin': loading }">
            <lingyun-icon type="reload" :size="toolIconSize" :color="toolColor" />
          </view>
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
              :hover-class="loading ? 'none' : 'lingyun-table__tool--hover'"
              :hover-stay-time="70"
              @click.stop="loading || toggle()"
            >
              <lingyun-icon type="list" :size="toolIconSize" :color="toolColor" />
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
          :hover-class="loading ? 'none' : 'lingyun-table__tool--hover'"
          :hover-stay-time="70"
          @click="onExportExcel"
        >
          <lingyun-icon type="download" :size="toolIconSize" :color="toolColor" />
        </view>
        <view class="lingyun-table__tools-slot" :class="{ 'lingyun-table__tools-slot--off': loading }">
          <slot name="tools" />
        </view>
      </view>
    </view>
    <view v-if="activeFilters.length" class="lingyun-table__filters">
      <scroll-view class="lingyun-table__filters-scroll" scroll-x enable-flex :show-scrollbar="false">
        <view class="lingyun-table__filters-track">
          <view
            v-for="item in activeFilters"
            :id="filterDomId('c', item.key)"
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
            <view v-if="filterTypeOf(col)" :id="filterDomId('h', col.key)" class="lingyun-table__filter" @click.stop="openFilter(col.key)">
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
              <view v-if="filterTypeOf(col)" :id="filterDomId('h', col.key)" class="lingyun-table__filter" @click.stop="openFilter(col.key)">
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
              <view v-if="filterTypeOf(col)" :id="filterDomId('h', col.key)" class="lingyun-table__filter" @click.stop="openFilter(col.key)">
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
            <view v-if="filterTypeOf(col)" :id="filterDomId('h', col.key)" class="lingyun-table__filter" @click.stop="openFilter(col.key)">
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
                <view v-if="isGroupHead(item.row, col)" class="lingyun-table__fold" :class="{ 'lingyun-table__fold--closed': groupClosed(item.row) }">
                  <lingyun-icon type="down" :size="foldIconSize" color="secondary" />
                </view>
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
                  <view v-if="isGroupHead(item.row, col)" class="lingyun-table__fold" :class="{ 'lingyun-table__fold--closed': groupClosed(item.row) }">
                    <lingyun-icon type="down" :size="foldIconSize" color="secondary" />
                  </view>
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
                  <view v-if="isGroupHead(item.row, col)" class="lingyun-table__fold" :class="{ 'lingyun-table__fold--closed': groupClosed(item.row) }">
                    <lingyun-icon type="down" :size="foldIconSize" color="secondary" />
                  </view>
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
                <view v-if="isGroupHead(item.row, col)" class="lingyun-table__fold" :class="{ 'lingyun-table__fold--closed': groupClosed(item.row) }">
                  <lingyun-icon type="down" :size="foldIconSize" color="secondary" />
                </view>
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

    <view
      v-if="loading"
      class="lingyun-table__loading"
      :style="loadingStyle"
      @click.stop
      @touchstart.stop
      @touchmove.stop.prevent
      @mousewheel.stop.prevent
      @wheel.stop.prevent
    >
      <view class="lingyun-table__loading-wash" />
      <view class="lingyun-table__loading-spin">
        <lingyun-activity-indicator size="small" />
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
      :anchor="filterAnchor"
      @update:show="onFilterSheetShow"
      @confirm="onFilterConfirm"
    />
  </view>
</template>


<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import { inject, type PropType } from 'vue'
import {
  filterConditionLabel,
  isWideFilterLayout,
  makeFilterTest,
} from './table-filter'
import {
  LINGYUN_TABLE_GROUP,
  type LingyunTableAlign,
  type LingyunTableColumn,
  type LingyunTableFilterCondition,
  type LingyunTableFilterType,
  type LingyunTableGroupFields,
  type LingyunTableQuery,
  type LingyunTableRow,
  type LingyunTableSortOrder,
} from './types'

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

/** 分组行上记组名（分组列取值转成字符串），收起 / 展开按它认 */
const GROUP_ID = '__lyGroupId'

function groupIdOf(row: LingyunTableRow): string {
  return String(row[GROUP_ID] ?? '')
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
        [GROUP_ID]: g,
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

defineOptions({
  name: 'LingyunTable',
  virtualHost: true,
})

const props = defineProps({
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
})

const emit = defineEmits([
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
  'group-toggle',
])

const slots = useSlots()
const instance = getCurrentInstance()

const injectedSectionMark = inject<SectionMarkHost | null>('lingyunSectionMark', null)

const innerSelected = ref<string[]>([])
const innerPage = ref(1)
const sortKey = ref('')
const sortOrder = ref<LingyunTableSortOrder>('')
const filterMap = ref<Record<string, string[]>>({})
const conditionMap = ref<Record<string, LingyunTableFilterCondition>>({})
/** 筛选面板对应的列。关面板时保留，收起动画里内容不跳 */
const filterSheetKey = ref('')
const filterSheetOpen = ref(false)
/** 打开面板时算好的选项快照 */
const sheetOptions = ref<LingyunTableFilterOption[]>([])
/** 宽屏 Popover 箭头指向的筛选图标或标签 */
const filterAnchor = ref<LingyunTableFilterAnchor | null>(null)
const filterOpenSeq = ref(0)
const filterUid = ref(Math.random().toString(36).slice(2, 8))
/** 收起的分组（组名） */
const collapsedGroups = ref<string[]>([])
const headLeft = ref(0)
const bodyLeft = ref(0)
const bodyTop = ref(0)
const leftTop = ref(0)
const rightTop = ref(0)
const syncSource = ref('')
const syncTimer = ref(0)
const pressedKey = ref('')
const pressTimer = ref(0)
const pressLeft = ref(0)
const pressTop = ref(0)
const viewportBodyPx = ref(0)
const viewportCenterPx = ref(0)
const fillHeightPx = ref(0)
const fillMode = ref<'' | 'page' | 'parent'>('')
const rowStart = ref(0)
const rowEnd = ref(0)
const colStart = ref(0)
const colEnd = ref(0)
const colPadLeft = ref(0)
const colPadRight = ref(0)
const centerClientPx = ref(0)
/** 表格实测宽度，列宽按它分配。测到之前用窗口宽度估算 */
const tableWidthPx = ref(0)
/** 电脑上用鼠标拖过筛选标签栏，松手那次点击不算点标签 */
const chipsDragged = ref(false)
const chipsDragStop = ref<(() => void) | null>(null)
const chipsUnbind = ref<(() => void) | null>(null)
const hBarTimer = ref(0)
const hDragging = ref(false)
const hDragX = ref(0)
const hDragLeft = ref(0)
const vDragging = ref(false)
const vDragY = ref(0)
const vDragTop = ref(0)
const vDragMove = ref<((event: MouseEvent) => void) | null>(null)
const vDragUp = ref<(() => void) | null>(null)
const hiddenKeys = ref<string[]>([])
const columnPickerOpen = ref(false)
const onResize = ref<(() => void) | null>(null)
const hDragMove = ref<((event: MouseEvent) => void) | null>(null)
const hDragUp = ref<(() => void) | null>(null)
const centerTouchX = ref(0)
const centerTouchY = ref(0)
const centerTouchLeft = ref(0)
const centerTouchTop = ref(0)
const centerTouchAxis = ref<'' | 'x' | 'y'>('')
const centerMoved = ref(false)
const glideSamples = ref<Array<{ x: number; y: number; t: number }>>([])
const glideTimer = ref(0)
const glideV = ref(0)
const glideAt = ref(0)
const gliding = ref(false)
const pageHoldTop = ref(-1)
const pageHoldTimer = ref(0)
const pressDelayTimer = ref(0)
const pressPendingKey = ref('')
const movedTimer = ref(0)
/** 小程序：逻辑层要求 WXS 跳到某处时加一 */
const syncSeq = ref(0)
const syncCmdLeft = ref(0)
const syncCmdTop = ref(0)
/** PC / H5 用可拖句柄；手机小程序只用细指示条 */
const scrollbarHandle = ref(true)

let embeddedSection: SectionMarkHost | null = null

const isCompact = computed((): boolean => {
  return props.size === 'compact'
})
const metrics = computed((): TableMetrics => {
  return isCompact.value ? TABLE_METRICS.compact : TABLE_METRICS.regular
})
const titleIconSize = computed((): number => {
  return isCompact.value ? 18 : 22
})
const toolIconSize = computed((): number => {
  return isCompact.value ? 16 : 18
})
const tickSize = computed((): number => {
  return isCompact.value ? 12 : 14
})
const sortIconSize = computed((): number => {
  return isCompact.value ? 10 : 12
})
const filterIconSize = computed((): number => {
  return isCompact.value ? 14 : 16
})
const chipIconSize = computed((): number => {
  return isCompact.value ? 12 : 14
})
const foldIconSize = computed((): number => {
  return isCompact.value ? 12 : 14
})
const fixed = computed((): boolean => {
  return parseHeight(props.height) > 0
})
const rootClass = computed((): string[] => {
  return [
    props.stripe ? 'lingyun-table--stripe' : '',
    props.border ? 'lingyun-table--border' : '',
    isCompact.value ? 'lingyun-table--compact' : '',
    fixed.value ? 'lingyun-table--fixed' : 'lingyun-table--fill',
    props.loading ? 'lingyun-table--loading' : '',
  ].filter(Boolean)
})
const toolColor = computed((): string => {
  return props.loading ? 'quaternary' : 'secondary'
})
/** 加载时锁住标题栏以下全部：筛选标签、表头、表体（含固定列）、表尾、分页 */
const loadingStyle = computed((): Record<string, string> => {
  return { top: showToolbar() ? `${metrics.value.toolbar}px` : '0px' }
})
const rootStyle = computed((): Record<string, string> => {
  const metricsValue = metrics.value
  const style: Record<string, string> = {
    '--ly-table-row': `${metricsValue.row}px`,
    '--ly-table-head': `${metricsValue.head}px`,
    '--ly-table-toolbar': `${metricsValue.toolbar}px`,
    '--ly-table-pager': `${metricsValue.pager}px`,
    '--ly-table-filter': `${metricsValue.filter}px`,
    '--ly-table-check': `${metricsValue.check}px`,
    '--ly-table-pick': `${metricsValue.pick}px`,
  }
  if (!fixed.value && fillHeightPx.value > 0) style.height = `${fillHeightPx.value}px`
  return style
})
const pickerScrollStyle = computed((): Record<string, string> => {
  const count = (props.columns || []).length
  const row = metrics.value.pick
  const height = Math.min(280, Math.max(row, count * row))
  return { height: `${height}px` }
})
const bodyHeightPx = computed((): number => {
  if (fixed.value) return parseHeight(props.height)
  return viewportBodyPx.value
})
const rowPadTop = computed((): number => {
  return rowStart.value * metrics.value.row
})
const rowPadTopStyle = computed((): Record<string, string> => {
  return { height: `${rowPadTop.value}px` }
})
const layoutWidth = computed((): number => {
  if (tableWidthPx.value > 0) return tableWidthPx.value
  const info = uni.getWindowInfo()
  return info && info.windowWidth ? Math.floor(info.windowWidth) : 375
})
const resolvedColumns = computed((): ResolvedColumn[] => {
  const hidden = hiddenKeys.value
  const cols = (props.columns || []).filter((col) => hidden.indexOf(col.key) < 0)
  const avail = layoutWidth.value - (props.selection ? metrics.value.check : 0)
  const widths = layoutColumnWidths(cols, avail, props.fit, metrics.value.index)
  return cols.map((col, i) => ({
    ...col,
    widthPx: widths[i],
    side: columnSide(col.fixed),
  }))
})
const leftColumns = computed((): ResolvedColumn[] => {
  return resolvedColumns.value.filter((col) => col.side === 'left')
})
const rightColumns = computed((): ResolvedColumn[] => {
  return resolvedColumns.value.filter((col) => col.side === 'right')
})
const centerColumns = computed((): ResolvedColumn[] => {
  return resolvedColumns.value.filter((col) => col.side === 'center')
})
const visibleCenterColumns = computed((): ResolvedColumn[] => {
  const cols = centerColumns.value
  const end = Math.min(colEnd.value, cols.length)
  if (colStart.value <= 0 && end >= cols.length) return cols
  return cols.slice(colStart.value, end)
})
/** 小程序把作用域插槽编成 cell-行号-列号。左中右三块各自从 0 编号会撞成 cell-0-0，这里用空位把列号错开 */
const centerSlotColumns = computed((): Array<ResolvedColumn | null> => {
  const cols: Array<ResolvedColumn | null> = []
  for (let i = 0; i < leftColumns.value.length; i += 1) cols.push(null)
  visibleCenterColumns.value.forEach((col) => cols.push(col))
  return cols
})
const rightSlotColumns = computed((): Array<ResolvedColumn | null> => {
  const pad = leftColumns.value.length + centerColumns.value.length
  const cols: Array<ResolvedColumn | null> = []
  for (let i = 0; i < pad; i += 1) cols.push(null)
  rightColumns.value.forEach((col) => cols.push(col))
  return cols
})
const leftWidth = computed((): number => {
  const cols = leftColumns.value.reduce((sum, col) => sum + col.widthPx, 0)
  return cols + (props.selection ? metrics.value.check : 0)
})
const rightWidth = computed((): number => {
  return rightColumns.value.reduce((sum, col) => sum + col.widthPx, 0)
})
const centerWidth = computed((): number => {
  const width = centerColumns.value.reduce((sum, col) => sum + col.widthPx, 0)
  return width || COL_W
})
const centerRowStyle = computed((): Record<string, string> => {
  return { width: `${centerWidth.value}px` }
})
const colPadLeftStyle = computed((): Record<string, string> => {
  return { width: `${colPadLeft.value}px` }
})
const colPadRightStyle = computed((): Record<string, string> => {
  return { width: `${colPadRight.value}px` }
})
const centerViewPx = computed((): number => {
  if (centerClientPx.value > 0) return centerClientPx.value
  return viewportCenterPx.value
})
const hBarNeeded = computed((): boolean => {
  const view = centerViewPx.value
  return view > 0 && centerWidth.value > view + 1
})
const hBarTrackPx = computed((): number => {
  // 竖条在整表最右侧，横条只铺中间区，不再给竖条让位
  return Math.max(0, centerViewPx.value)
})
const vBarTrackPx = computed((): number => {
  const gutter = hBarNeeded.value ? (scrollbarHandle.value ? 20 : 6) : 0
  return Math.max(0, bodyHeightPx.value - gutter)
})
const hBarStyle = computed((): Record<string, string> => {
  return {
    left: `${leftWidth.value}px`,
    width: `${hBarTrackPx.value}px`,
  }
})
const vBarStyle = computed((): Record<string, string> => {
  return {
    top: '0',
    right: '0',
    height: `${vBarTrackPx.value}px`,
  }
})
const hThumbGeo = computed((): { thumb: number; travel: number; max: number } => {
  const view = centerViewPx.value
  const content = Math.max(centerWidth.value, view)
  const max = Math.max(0, content - view)
  const track = hBarTrackPx.value
  const thumb = Math.max(40, Math.round((track * view) / Math.max(1, content)))
  return { thumb, travel: Math.max(1, track - thumb), max }
})
const hThumbStyle = computed((): Record<string, string> => {
  const geo = hThumbGeo.value
  const style: Record<string, string> = { width: `${geo.thumb}px` }
  // 小程序由 WXS 移动拇指
  // #ifndef MP-WEIXIN
  const x = geo.max <= 0 ? 0 : Math.round((bodyLeft.value / geo.max) * geo.travel)
  style.transform = `translateX(${x}px)`
  // #endif
  return style
})
const bodyBoxStyle = computed((): Record<string, string> => {
  if (fixed.value && bodyHeightPx.value > 0) return { height: `${bodyHeightPx.value}px` }
  if (fixed.value) return { height: '0px' }
  return { flex: '1', height: '0', minHeight: '0' }
})
const bodyScrollStyle = computed((): Record<string, string> => {
  if (fixed.value && bodyHeightPx.value > 0) return { height: `${bodyHeightPx.value}px` }
  // 小程序 scroll-view 要用明确像素。H5 用 100%，跟着表体，给分页留出位置
  // #ifdef MP-WEIXIN
  if (bodyHeightPx.value > 0) return { height: `${bodyHeightPx.value}px` }
  // #endif
  return { height: '100%' }
})
const columnByKey = computed((): Record<string, LingyunTableColumn> => {
  const out: Record<string, LingyunTableColumn> = {}
  ;(props.columns || []).forEach((col) => {
    out[col.key] = col
  })
  return out
})
const rowTests = computed((): RowTest[] => {
  const tests: RowTest[] = []
  const map = filterMap.value
  Object.keys(map).forEach((key) => {
    const picked = map[key]
    if (!picked || !picked.length) return
    const set = new Set(picked)
    tests.push({ key, test: (row) => set.has(String(row[key] ?? '')) })
  })
  const conds = conditionMap.value
  Object.keys(conds).forEach((key) => {
    const col = columnByKey.value[key]
    const type = col ? columnFilterType(col) : ''
    if (!type || type === 'select') return
    const test = makeFilterTest(type, conds[key])
    tests.push({ key, test: (row) => test(row[key]) })
  })
  return tests
})
const filteredRows = computed((): LingyunTableRow[] => {
  const rows = props.data || []
  if (props.remote) return rows
  return rowsPassing(rows, rowTests.value)
})
const hasFilterUi = computed((): boolean => {
  return (props.columns || []).some((col) => !!col.sortable || !!columnFilterType(col))
})
const sheetColumn = computed((): LingyunTableColumn | null => {
  if (!filterSheetKey.value) return null
  return columnByKey.value[filterSheetKey.value] || null
})
const activeFilters = computed((): Array<{ key: string; label: string }> => {
  const out: Array<{ key: string; label: string }> = []
  ;(props.columns || []).forEach((col) => {
    const type = columnFilterType(col)
    if (!type) return
    if (type === 'select') {
      const picked = filterMap.value[col.key]
      if (!picked || !picked.length) return
      const texts = picked.slice(0, 2).map((token) => optionTextOf(col, token))
      const more = picked.length > 2 ? ` 等${picked.length}项` : ''
      out.push({ key: col.key, label: `${col.title}：${texts.join('、')}${more}` })
      return
    }
    const cond = conditionMap.value[col.key]
    if (!cond) return
    out.push({ key: col.key, label: `${col.title} ${filterConditionLabel(type, cond)}` })
  })
  return out
})
const groupFieldKey = computed((): string => {
  const field = props.groupFields && props.groupFields.field
  return typeof field === 'string' ? field.trim() : ''
})
const groupSumKeys = computed((): string[] => {
  const field = groupFieldKey.value
  const list = (props.groupFields && props.groupFields.sum) || []
  return list.filter((key) => !!key && key !== field)
})
const sortedRows = computed((): LingyunTableRow[] => {
  const rows = filteredRows.value
  if (props.remote) return rows
  const groupKey = groupFieldKey.value
  const sortKeyLocal = sortKey.value
  const dir = sortOrder.value === 'asc' ? 1 : sortOrder.value === 'desc' ? -1 : 0
  const bySort = !!sortKeyLocal && dir !== 0
  if (!groupKey && !bySort) return rows
  // 每行只取一次排序键，比较时不再反复读字段和解析数字
  const decorated = rows.map((row, index) => ({
    row,
    index,
    group: groupKey ? toSortKey(row[groupKey]) : null,
    key: bySort ? toSortKey(row[sortKeyLocal]) : null,
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
})
const groupTotals = computed((): GroupTotals | null => {
  if (!groupFieldKey.value) return null
  return groupTotalsOf(sortedRows.value, groupFieldKey.value, groupSumKeys.value)
})
const totalCount = computed((): number => {
  if (props.remote) return props.total > 0 ? props.total : 0
  return sortedRows.value.length
})
const showPager = computed((): boolean => {
  return props.pageSize > 0 && totalCount.value > 0
})
const footerRows = computed((): LingyunTableRow[] => {
  if (!props.showFooter) return []
  const rows = props.footerData || []
  return rows.length ? rows : [{}]
})
const footerClipStyle = computed((): Record<string, string> => {
  const style: Record<string, string> = { height: `${metrics.value.row}px` }
  if (viewportCenterPx.value > 0) style.width = `${viewportCenterPx.value}px`
  return style
})
const footerCenterStyle = computed((): Record<string, string> => {
  const style: Record<string, string> = { width: `${centerWidth.value}px` }
  // #ifndef MP-WEIXIN
  style.transform = `translate3d(${-bodyLeft.value}px, 0, 0)`
  // #endif
  return style
})
const pageCount = computed((): number => {
  if (!showPager.value) return 1
  return Math.max(1, Math.ceil(totalCount.value / props.pageSize))
})
const currentPage = computed((): number => {
  return Math.min(pageCount.value, Math.max(1, innerPage.value || 1))
})
const pageDataRows = computed((): LingyunTableRow[] => {
  if (props.remote || !showPager.value) return sortedRows.value
  const start = (currentPage.value - 1) * props.pageSize
  return sortedRows.value.slice(start, start + props.pageSize)
})
const groupedRows = computed((): LingyunTableRow[] => {
  const page = pageDataRows.value
  const totals = groupTotals.value
  if (!totals) return page
  return expandGroupedRows(page, groupFieldKey.value, groupSumKeys.value, props.rowKey, totals)
})
const collapsedSet = computed((): Set<string> => {
  return new Set(collapsedGroups.value)
})
/** 实际渲染的行：收起的分组只留分组行 */
const pageRows = computed((): LingyunTableRow[] => {
  const rows = groupedRows.value
  const field = groupFieldKey.value
  const closed = collapsedSet.value
  if (!field || !closed.size) return rows
  return rows.filter((row) => isGroupRow(row) || !closed.has(String(row[field] ?? '')))
})
const contentHeightPx = computed((): number => {
  return pageRows.value.length * metrics.value.row
})
const visibleRows = computed((): Array<{ row: LingyunTableRow; index: number }> => {
  const rows = pageRows.value
  const end = Math.min(rowEnd.value, rows.length)
  const items: Array<{ row: LingyunTableRow; index: number }> = []
  for (let i = rowStart.value; i < end; i += 1) items.push({ row: rows[i], index: i })
  return items
})
const rowPadBottom = computed((): number => {
  return Math.max(0, pageRows.value.length - rowEnd.value) * metrics.value.row
})
const rowPadBottomStyle = computed((): Record<string, string> => {
  return { height: `${rowPadBottom.value}px` }
})
const rowTrackStyle = computed((): Record<string, string> => {
  return { height: `${contentHeightPx.value}px` }
})
const centerTrackStyle = computed((): Record<string, string> => {
  return { width: `${centerWidth.value}px`, height: `${contentHeightPx.value}px` }
})
const vBarNeeded = computed((): boolean => {
  return bodyHeightPx.value > 0 && contentHeightPx.value > bodyHeightPx.value + 1
})
const vThumbGeo = computed((): { thumb: number; travel: number; max: number } => {
  const view = bodyHeightPx.value
  const content = Math.max(contentHeightPx.value, view)
  const max = Math.max(0, content - view)
  const track = vBarTrackPx.value
  const thumb = Math.max(40, Math.round((track * view) / Math.max(1, content)))
  return { thumb, travel: Math.max(1, track - thumb), max }
})
const vThumbStyle = computed((): Record<string, string> => {
  const geo = vThumbGeo.value
  const style: Record<string, string> = { height: `${geo.thumb}px` }
  // #ifndef MP-WEIXIN
  const y = geo.max <= 0 ? 0 : Math.round((bodyTop.value / geo.max) * geo.travel)
  style.transform = `translateY(${y}px)`
  // #endif
  return style
})
/** 交给 WXS 的滚动几何。不含当前位置，滚动中逻辑层回写位置不会触发它 */
const mpSync = computed((): Record<string, number> => {
  const h = hThumbGeo.value
  const v = vThumbGeo.value
  return {
    seq: syncSeq.value,
    left: syncCmdLeft.value,
    top: syncCmdTop.value,
    maxX: h.max,
    maxY: v.max,
    blockX: COL_BLOCK,
    blockY: ROW_BLOCK * metrics.value.row,
    hTravel: h.travel,
    vTravel: v.travel,
  }
})
const mpLayoutKey = computed((): string => {
  return [
    pageRows.value.length > 0 ? 1 : 0,
    leftWidth.value > 0 ? 1 : 0,
    rightWidth.value > 0 ? 1 : 0,
    footerRows.value.length,
    hBarNeeded.value ? 1 : 0,
    vBarNeeded.value ? 1 : 0,
  ].join('|')
})
/** 页内序号：分组行为 0，明细从 1 起，收起的明细也计数，展开收起时序号不变 */
const rowNumbers = computed((): number[] | null => {
  if (!groupFieldKey.value) return null
  if (!resolvedColumns.value.some((col) => col.type === 'index')) return null
  const field = groupFieldKey.value
  const closed = collapsedSet.value
  const out: number[] = []
  let n = 0
  groupedRows.value.forEach((row) => {
    if (isGroupRow(row)) {
      out.push(0)
      return
    }
    n += 1
    if (!closed.has(String(row[field] ?? ''))) out.push(n)
  })
  return out
})
/** 选择按本页全部明细算，收起的也算在内 */
const pageKeys = computed((): string[] => {
  return groupedRows.value.map((row) => keyOf(row)).filter(Boolean)
})
const selectedSet = computed((): Set<string> => {
  return new Set(innerSelected.value)
})
const pageSelectedCount = computed((): number => {
  const set = selectedSet.value
  if (!set.size) return 0
  let count = 0
  pageKeys.value.forEach((key) => {
    if (set.has(key)) count += 1
  })
  return count
})
const pageAll = computed((): boolean => {
  return pageKeys.value.length > 0 && pageSelectedCount.value === pageKeys.value.length
})
const pageSome = computed((): boolean => {
  return pageSelectedCount.value > 0 && !pageAll.value
})
const pageCheckClass = computed((): Record<string, boolean> => {
  return {
    'lingyun-table__check--on': pageAll.value,
    'lingyun-table__check--some': pageSome.value,
  }
})

function detectScrollbarHandle(): boolean {
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
}

function sideStyle(width: number): Record<string, string> {
  return { width: `${width}px` }
}

function sideScrollStyle(width: number): Record<string, string> {
  let height = '100%'
  if (fixed.value && bodyHeightPx.value > 0) height = `${bodyHeightPx.value}px`
  // #ifdef MP-WEIXIN
  if (!fixed.value && bodyHeightPx.value > 0) height = `${bodyHeightPx.value}px`
  // #endif
  return { width: `${width}px`, height }
}

function guessCenterWidth(): number {
  const info = uni.getWindowInfo()
  const width = info && info.windowWidth ? info.windowWidth : 375
  return Math.max(COL_W, width - leftWidth.value - rightWidth.value)
}

function syncRowWindow(top: number): void {
  const total = pageRows.value.length
  const rowH = metrics.value.row
  const view = bodyHeightPx.value > 0 ? bodyHeightPx.value : rowH * 12
  const blockTop = Math.floor(Math.max(0, top) / (ROW_BLOCK * rowH)) * ROW_BLOCK
  let start = blockTop - ROW_BLOCK
  if (start < 0) start = 0
  let end = blockTop + ROW_BLOCK + Math.ceil(view / rowH) + ROW_BLOCK
  if (end > total) end = total
  if (start > end) start = end
  if (rowStart.value !== start) rowStart.value = start
  if (rowEnd.value !== end) rowEnd.value = end
}

function syncColWindow(left: number): void {
  const cols = centerColumns.value
  const view = viewportCenterPx.value > 0 ? viewportCenterPx.value : guessCenterWidth()
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
  if (colStart.value !== start) colStart.value = start
  if (colEnd.value !== end) colEnd.value = end
  if (colPadLeft.value !== padLeft) colPadLeft.value = padLeft
  if (colPadRight.value !== padRight) colPadRight.value = padRight
}

function parentBoxHeight(): number {
  const el = instance?.proxy?.$el as HTMLElement | undefined
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
}

function measureViewport(): void {
  const query = uni.createSelectorQuery().in(instance?.proxy as never)
  query.select('.lingyun-table').boundingClientRect()
  query.select('.lingyun-table__body').boundingClientRect()
  query.select('.lingyun-table__x--body').boundingClientRect()
  query.exec((rects) => {
    const list = (rects || []) as Array<{ height?: number; width?: number } | null>
    applyViewport(list[0], list[1], list[2])
  })
}

function applyViewport(
  table: { height?: number; width?: number } | null,
  body: { height?: number } | null,
  center: { width?: number } | null,
): void {
  const tableW = table && table.width ? Math.round(table.width) : 0
  // 列宽按向下取整的宽度分，避免小数宽度时多出半像素横向可滚
  const layoutW = table && table.width ? Math.floor(table.width) : 0
  if (layoutW > 1 && tableWidthPx.value !== layoutW) tableWidthPx.value = layoutW
  if (tableW > 1) {
    const pane = Math.max(1, tableW - leftWidth.value - rightWidth.value)
    if (viewportCenterPx.value !== pane) viewportCenterPx.value = pane
  } else if (center && center.width && center.width > 1) {
    const width = Math.round(center.width)
    if (viewportCenterPx.value !== width) viewportCenterPx.value = width
  }
  const client = readCenterClient()
  if (client > 0 && centerClientPx.value !== client) centerClientPx.value = client
  syncColWindow(bodyLeft.value)
  if (fixed.value) {
    syncRowWindow(bodyTop.value)
    return
  }
  const bodyH = body && body.height ? Math.round(body.height) : 0
  const tableH = table && table.height ? Math.round(table.height) : 0
  if ((fillMode.value === 'page' || fillMode.value === 'parent') && fillHeightPx.value > 0) {
    const room = Math.max(48, fillHeightPx.value - chromeHeight())
    const next = bodyH >= 48 && bodyH <= room + 8 ? bodyH : room
    if (viewportBodyPx.value !== next) viewportBodyPx.value = next
    syncRowWindow(bodyTop.value)
    return
  }
  const parentH = parentBoxHeight()
  if (parentH >= 80 && bodyH >= 48) {
    fillMode.value = 'parent'
    if (viewportBodyPx.value !== bodyH) viewportBodyPx.value = bodyH
    syncRowWindow(bodyTop.value)
    return
  }
  if (parentH >= 80) {
    fillMode.value = 'parent'
    if (fillHeightPx.value !== parentH) fillHeightPx.value = parentH
    nextTick(() => measureViewport())
    return
  }
  const contentH = intrinsicHeight()
  if (tableH >= 80 && Math.abs(tableH - contentH) > 12) {
    fillMode.value = 'parent'
    if (fillHeightPx.value !== tableH) fillHeightPx.value = tableH
    const room = Math.max(48, tableH - chromeHeight())
    const next = bodyH >= 48 && bodyH <= room + 8 ? bodyH : room
    if (viewportBodyPx.value !== next) viewportBodyPx.value = next
    syncRowWindow(bodyTop.value)
    return
  }
  const info = uni.getWindowInfo()
  const pageH = info && info.windowHeight ? Math.round(info.windowHeight) : 0
  if (pageH > 0 && (fillMode.value !== 'page' || fillHeightPx.value !== pageH)) {
    fillMode.value = 'page'
    fillHeightPx.value = pageH
    nextTick(() => measureViewport())
  }
}

function centerClipStyle(part: 'head' | 'body'): Record<string, string> {
  const style: Record<string, string> = {}
  if (viewportCenterPx.value > 0) style.width = `${viewportCenterPx.value}px`
  if (part === 'head') style.height = `${metrics.value.head}px`
  else if (bodyHeightPx.value > 0) style.height = `${bodyHeightPx.value}px`
  return style
}

function chromeHeight(): number {
  const m = metrics.value
  let height = m.head
  if (showToolbar()) height += m.toolbar
  if (activeFilters.value.length) height += m.filter
  if (showPager.value) height += m.pager
  if (footerRows.value.length) height += footerRows.value.length * m.row
  return height
}

function intrinsicHeight(): number {
  const rows = pageRows.value.length
  return chromeHeight() + (rows > 0 ? rows * metrics.value.row : 120)
}

function cellStyle(col: ResolvedColumn): Record<string, string> {
  const align = col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start'
  return { width: `${col.widthPx}px`, justifyContent: align }
}

function rowClass(index: number, row: LingyunTableRow): Record<string, boolean> {
  const key = keyOf(row)
  const group = isGroupRow(row)
  return {
    'lingyun-table__row--group': group,
    'lingyun-table__row--group-stack': group && isGroupRow(pageRows.value[index + 1]),
    'lingyun-table__row--alt': !group && props.stripe && index % 2 === 1,
    'lingyun-table__row--hover': !group && !!key && pressedKey.value === key,
    'lingyun-table__row--end': index === pageRows.value.length - 1,
    'lingyun-table__row--last': index === pageRows.value.length - 1 && contentHeightPx.value < bodyHeightPx.value,
  }
}

function onRowPress(row: LingyunTableRow): void {
  if (isGroupRow(row)) return
  cancelPress()
  pressLeft.value = bodyLeft.value
  pressTop.value = bodyTop.value
  pressPendingKey.value = keyOf(row)
  pressDelayTimer.value = setTimeout(() => {
    pressDelayTimer.value = 0
    pressedKey.value = pressPendingKey.value
    pressPendingKey.value = ''
  }, PRESS_DELAY) as unknown as number
}

function onRowRelease(): void {
  if (pressDelayTimer.value) {
    clearTimeout(pressDelayTimer.value)
    pressDelayTimer.value = 0
    pressedKey.value = pressPendingKey.value
    pressPendingKey.value = ''
  }
  if (pressTimer.value) clearTimeout(pressTimer.value)
  pressTimer.value = setTimeout(() => {
    pressedKey.value = ''
    pressTimer.value = 0
  }, 80) as unknown as number
}

function cancelPress(): void {
  if (pressDelayTimer.value) {
    clearTimeout(pressDelayTimer.value)
    pressDelayTimer.value = 0
  }
  pressPendingKey.value = ''
  if (pressTimer.value) {
    clearTimeout(pressTimer.value)
    pressTimer.value = 0
  }
  if (pressedKey.value) pressedKey.value = ''
}

function clearPressIfScrolled(left: number, top: number): void {
  if (!pressedKey.value && !pressPendingKey.value) return
  if (Math.abs(left - pressLeft.value) <= 8 && Math.abs(top - pressTop.value) <= 8) return
  cancelPress()
}

function queryPayload(): LingyunTableQuery {
  return {
    page: currentPage.value,
    pageSize: props.pageSize,
    filters: filtersSnapshot(),
    conditions: conditionsSnapshot(),
    sortKey: sortKey.value,
    sortOrder: sortOrder.value,
  }
}

function emitQuery(): void {
  if (!props.remote) return
  emit('query-change', queryPayload())
}

function keyOf(row: LingyunTableRow): string {
  if (isGroupRow(row)) return ''
  const value = row[props.rowKey]
  if (value == null || value === '') return ''
  return String(value)
}

function cellValue(row: LingyunTableRow, col: ResolvedColumn, index = 0): unknown {
  if (isGroupRow(row)) {
    if (col.type === 'index') return ''
    if (col.key === groupFieldKey.value) return row[col.key]
    if (groupSumKeys.value.indexOf(col.key) >= 0) return row[col.key]
    return ''
  }
  if (col.type === 'index') return rowNo(index)
  return row[col.key]
}

function footerText(row: LingyunTableRow, col: ResolvedColumn): string {
  if (!Object.prototype.hasOwnProperty.call(row, col.key)) return ''
  const value = row[col.key]
  if (value == null || value === '') return ''
  return String(value)
}

function cellText(row: LingyunTableRow, col: ResolvedColumn, index = 0): string {
  if (isGroupRow(row)) {
    if (col.type === 'index') return ''
    if (col.key !== groupFieldKey.value && groupSumKeys.value.indexOf(col.key) < 0) return ''
    const value = row[col.key]
    if (col.formatter) return col.formatter(value, row)
    if (value == null || value === '') return ''
    return String(value)
  }
  if (col.type === 'index') return String(rowNo(index))
  const value = row[col.key]
  if (col.formatter) return col.formatter(value, row)
  if (value == null) return ''
  return String(value)
}

function rowNo(index: number): number {
  const size = props.pageSize > 0 ? props.pageSize : 0
  const base = size > 0 ? (currentPage.value - 1) * size : 0
  const numbers = rowNumbers.value
  if (!numbers) return base + index + 1
  const n = numbers[index] || 0
  return n ? base + n : 0
}

function showToolbar(): boolean {
  return !!(props.title || props.icon || props.showRefresh || props.columnPicker || props.exportExcel || slots.tools)
}

function columnShown(key: string): boolean {
  return hiddenKeys.value.indexOf(key) < 0
}

function toggleColumn(key: string): void {
  if (columnShown(key)) {
    const visible = (props.columns || []).filter((col) => columnShown(col.key))
    if (visible.length <= 1) return
    hiddenKeys.value = hiddenKeys.value.concat(key)
    return
  }
  hiddenKeys.value = hiddenKeys.value.filter((item) => item !== key)
}

function onRefresh(): void {
  if (props.loading) return
  emit('refresh', queryPayload())
}

function onExportExcel(): void {
  if (props.loading) return
  const filename = sanitizeFileName(props.title || '表格')
  saveExcel(buildExcelXml(), filename)
  emit('export', { filename: `${filename}.xls` })
}

function buildExcelXml(): string {
  const cols = resolvedColumns.value
  const totals = groupTotals.value
  const rows = totals
    ? expandGroupedRows(sortedRows.value, groupFieldKey.value, groupSumKeys.value, props.rowKey, totals)
    : sortedRows.value
  const head = cols.map((col) => excelCell(col.title || col.key, false)).join('')
  let dataIndex = 0
  const body = rows
    .map((row) => {
      const cells = cols.map((col) => {
        if (isGroupRow(row)) {
          const text = cellText(row, col, 0)
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
  const foot = footerRows.value
    .map((row) => {
      const cells = cols.map((col) => {
        const text = footerText(row, col)
        const value = row[col.key]
        const numeric = typeof value === 'number' && Number.isFinite(value)
        return excelCell(text, numeric)
      })
      return `<Row>${cells.join('')}</Row>`
    })
    .join('')
  const sheet = sanitizeFileName(props.title || 'Sheet1').slice(0, 31)
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="${escapeXml(sheet)}"><Table><Row>${head}</Row>${body}${foot}</Table></Worksheet>
</Workbook>`
}

function saveExcel(xml: string, filename: string): void {
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
}

function isSelected(row: LingyunTableRow): boolean {
  const key = keyOf(row)
  return !!key && selectedSet.value.has(key)
}

function emitSelection(next: string[]): void {
  innerSelected.value = next
  emit('update:selectedKeys', next)
  emit('selection-change', next)
}

function toggleRow(row: LingyunTableRow): void {
  const key = keyOf(row)
  if (!key) return
  const next = innerSelected.value.slice()
  const index = next.indexOf(key)
  if (index >= 0) next.splice(index, 1)
  else next.push(key)
  emitSelection(next)
}

function togglePage(): void {
  const keys = pageKeys.value
  if (!keys.length) return
  if (pageAll.value) {
    const drop = new Set(keys)
    emitSelection(innerSelected.value.filter((key) => !drop.has(key)))
    return
  }
  const next = innerSelected.value.slice()
  const have = new Set(next)
  keys.forEach((key) => {
    if (have.has(key)) return
    have.add(key)
    next.push(key)
  })
  emitSelection(next)
}

function sortColor(col: ResolvedColumn, order: 'asc' | 'desc'): string {
  return sortKey.value === col.key && sortOrder.value === order ? 'primary' : 'tertiary'
}

function filterTypeOf(col: LingyunTableColumn): LingyunTableFilterType | '' {
  return columnFilterType(col)
}

function filterOn(key: string): boolean {
  const picked = filterMap.value[key]
  return !!(picked && picked.length) || !!conditionMap.value[key]
}

/** 可排序列点表头切换排序；只能筛选的列点表头打开筛选面板 */
function onHeadTap(col: ResolvedColumn): void {
  if (col.sortable) {
    onSort(col)
    return
  }
  if (columnFilterType(col)) openFilter(col.key)
}

function onSort(col: ResolvedColumn): void {
  if (!col.sortable) return
  let order: LingyunTableSortOrder = 'asc'
  if (sortKey.value === col.key) {
    order = sortOrder.value === 'asc' ? 'desc' : sortOrder.value === 'desc' ? '' : 'asc'
  }
  applySort(col.key, order)
  emitQuery()
}

function applySort(key: string, order: LingyunTableSortOrder): void {
  sortKey.value = order ? key : ''
  sortOrder.value = order
  emit('sort-change', { key: sortKey.value, order })
}

function rowsPassing(rows: LingyunTableRow[], tests: RowTest[]): LingyunTableRow[] {
  if (!tests.length) return rows
  return rows.filter((row) => {
    for (let i = 0; i < tests.length; i += 1) {
      if (!tests[i].test(row)) return false
    }
    return true
  })
}

/**
 * 面板选项：本地模式按「其它列筛选后」的行计数，和 Excel 一致；
 * remote 只看得到当前页，不计数。已勾选但当前数据里没有的值也保留。
 */
function buildFilterOptions(col: LingyunTableColumn): LingyunTableFilterOption[] {
  const source = (props.data || []).filter((row) => !isGroupRow(row))
  const rows = props.remote ? source : rowsPassing(source, rowTests.value.filter((item) => item.key !== col.key))
  const counts = new Map<string, number>()
  const samples = new Map<string, LingyunTableRow>()
  rows.forEach((row) => {
    const token = String(row[col.key] ?? '')
    counts.set(token, (counts.get(token) || 0) + 1)
    if (!samples.has(token)) samples.set(token, row)
  })
  const countOf = (token: string): number | undefined => (props.remote ? undefined : counts.get(token) || 0)
  const picked = filterMap.value[col.key] || []
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
}

function filterDomId(kind: 'h' | 'c', key: string): string {
  return `lyf-${filterUid.value}-${kind}-${String(key).replace(/[^\w-]/g, '_')}`
}

function openFilter(key: string, from: 'h' | 'c' = 'h'): void {
  const col = columnByKey.value[key]
  if (!col) return
  cancelPress()
  filterSheetKey.value = key
  sheetOptions.value = columnFilterType(col) === 'select' ? buildFilterOptions(col) : []
  if (!isWideFilterLayout()) {
    filterAnchor.value = null
    filterSheetOpen.value = true
    return
  }
  const seq = ++filterOpenSeq.value
  queryFilterAnchor(key, from).then((rect) => {
    if (seq !== filterOpenSeq.value) return
    filterAnchor.value = rect
    filterSheetOpen.value = true
  })
}

/** 宽屏 Popover 的锚点：点了哪个就指向哪个；测不到退回表头 */
function queryFilterAnchor(key: string, from: 'h' | 'c'): Promise<LingyunTableFilterAnchor | null> {
  return new Promise((resolve) => {
    let settled = false
    const finish = (rect: LingyunTableFilterAnchor | null) => {
      if (settled) return
      settled = true
      resolve(rect)
    }
    const timer = setTimeout(() => finish(null), 200)
    const usable = (r: any): LingyunTableFilterAnchor | null =>
      r && r.width > 0 && r.height > 0 ? { left: r.left, top: r.top, width: r.width, height: r.height } : null
    try {
      const q = uni.createSelectorQuery().in(instance?.proxy as never)
      q.select(`#${filterDomId(from, key)}`).boundingClientRect()
      q.select('.lingyun-table__head').boundingClientRect()
      q.exec((res) => {
        clearTimeout(timer)
        const list = Array.isArray(res) ? res : []
        finish(usable(list[0]) || usable(list[1]))
      })
    } catch {
      clearTimeout(timer)
      finish(null)
    }
  })
}

function onFilterSheetShow(open: boolean): void {
  filterSheetOpen.value = open
}

function onFilterConfirm(result: LingyunTableFilterResult): void {
  const col = sheetColumn.value
  if (!col) return
  const key = col.key
  let sortChanged = false
  if (col.sortable) {
    const current: LingyunTableSortOrder = sortKey.value === key ? sortOrder.value : ''
    if (result.sortOrder !== current) {
      sortChanged = true
      if (result.sortOrder) applySort(key, result.sortOrder)
      else applySort('', '')
    }
  }
  const filterChanged = setColumnFilter(key, result.values, result.condition)
  if (filterChanged) afterFilterChange(key)
  else if (sortChanged) emitQuery()
}

/** 返回这一列的筛选是否真的变了 */
function setColumnFilter(key: string, values: string[], condition: LingyunTableFilterCondition | null): boolean {
  const prevValues = filterMap.value[key] || []
  const prevCond = conditionMap.value[key] || null
  if (sameStrings(prevValues, values) && sameCondition(prevCond, condition)) return false
  const nextMap = { ...filterMap.value }
  if (values.length) nextMap[key] = values.slice()
  else delete nextMap[key]
  const nextConds = { ...conditionMap.value }
  if (condition) nextConds[key] = { ...condition }
  else delete nextConds[key]
  filterMap.value = nextMap
  conditionMap.value = nextConds
  return true
}

function filtersSnapshot(): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  Object.keys(filterMap.value).forEach((key) => {
    out[key] = filterMap.value[key].slice()
  })
  return out
}

function conditionsSnapshot(): Record<string, LingyunTableFilterCondition> {
  const out: Record<string, LingyunTableFilterCondition> = {}
  Object.keys(conditionMap.value).forEach((key) => {
    out[key] = { ...conditionMap.value[key] }
  })
  return out
}

/** 筛选变了回到第一页、表体回顶，再统一抛事件 */
function afterFilterChange(key: string): void {
  innerPage.value = 1
  emit('update:page', 1)
  scrollBodyToTop()
  emit('filter-change', {
    key,
    values: (filterMap.value[key] || []).slice(),
    condition: conditionMap.value[key] ? { ...conditionMap.value[key] } : null,
    filters: filtersSnapshot(),
    conditions: conditionsSnapshot(),
  })
  emitQuery()
}

function onChipTap(key: string): void {
  if (!chipsDragged.value) openFilter(key, 'c')
}

function onChipClear(key: string): void {
  if (!chipsDragged.value) clearColumnFilter(key)
}

/**
 * H5：事件落在筛选标签栏里时，返回其中真正横向可滚的节点（uni scroll-view 内层）。
 * uni 包装过的模板事件拿不到 DOM，所以挂原生监听，从 target 往上找。
 */
function chipsScroller(target: EventTarget | null): HTMLElement | null {
  // #ifdef H5
  const el = target as HTMLElement | null
  const bar = el && typeof el.closest === 'function' ? el.closest<HTMLElement>('.lingyun-table__filters') : null
  if (!bar) return null
  const list = bar.querySelectorAll<HTMLElement>('.uni-scroll-view')
  for (let i = 0; i < list.length; i += 1) {
    if (list[i].scrollWidth > list[i].clientWidth + 1) return list[i]
  }
  // #endif
  return null
}

function bindChipsPointer(): void {
  // #ifdef H5
  const root = instance?.proxy?.$el as HTMLElement | null
  if (!root || typeof root.addEventListener !== 'function') return
  const wheel = (e: WheelEvent) => onChipsWheel(e)
  const down = (e: MouseEvent) => onChipsMouseDown(e)
  root.addEventListener('wheel', wheel, { passive: false })
  root.addEventListener('mousedown', down)
  chipsUnbind.value = () => {
    root.removeEventListener('wheel', wheel)
    root.removeEventListener('mousedown', down)
  }
  // #endif
}

/** 电脑上滚轮只有竖向，竖向滚轮也拿来横滚；滚到头时放给页面 */
function onChipsWheel(e: WheelEvent): void {
  const box = chipsScroller(e.target)
  if (!box) return
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
  const before = box.scrollLeft
  box.scrollLeft = before + delta
  if (box.scrollLeft !== before) e.preventDefault()
}

/** 电脑上鼠标按住拖动横滚。手机走 scroll-view 原生滑动 */
function onChipsMouseDown(e: MouseEvent): void {
  // #ifdef H5
  if (e.button !== 0) return
  const box = chipsScroller(e.target)
  if (!box) return
  if (chipsDragStop.value) chipsDragStop.value()
  chipsDragged.value = false
  const startX = e.clientX
  const startLeft = box.scrollLeft
  const move = (ev: MouseEvent) => {
    const dx = ev.clientX - startX
    if (Math.abs(dx) > 4) chipsDragged.value = true
    if (chipsDragged.value) box.scrollLeft = startLeft - dx
  }
  const stop = () => {
    window.removeEventListener('mousemove', move)
    window.removeEventListener('mouseup', stop)
    chipsDragStop.value = null
    // 松手后的 click 同步先到，再复位
    setTimeout(() => {
      chipsDragged.value = false
    }, 0)
  }
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', stop)
  chipsDragStop.value = stop
  // #endif
}

function clearColumnFilter(key: string): void {
  if (setColumnFilter(key, [], null)) afterFilterChange(key)
}

function clearAllFilters(): void {
  if (!Object.keys(filterMap.value).length && !Object.keys(conditionMap.value).length) return
  filterMap.value = {}
  conditionMap.value = {}
  afterFilterChange('')
}

function scrollBodyToTop(): void {
  if (!bodyTop.value && !leftTop.value && !rightTop.value) return
  bodyTop.value = 0
  leftTop.value = 0
  rightTop.value = 0
  syncRowWindow(0)
  mpCommand(bodyLeft.value, 0)
}

function goPage(next: number): void {
  const page = Math.min(pageCount.value, Math.max(1, next))
  if (page === currentPage.value) return
  innerPage.value = page
  bodyTop.value = 0
  leftTop.value = 0
  rightTop.value = 0
  syncRowWindow(0)
  mpCommand(bodyLeft.value, 0)
  emit('update:page', page)
  emit('page-change', page)
  emitQuery()
}

function onRowClick(row: LingyunTableRow): void {
  if (centerMoved.value) return
  if (isGroupRow(row)) {
    toggleGroup(groupIdOf(row))
    return
  }
  emit('row-click', row)
}

function isGroupHead(row: LingyunTableRow, col: ResolvedColumn): boolean {
  return isGroupRow(row) && col.key === groupFieldKey.value
}

function groupClosed(row: LingyunTableRow): boolean {
  return collapsedSet.value.has(groupIdOf(row))
}

/** 点分组行收起 / 展开这一组的明细 */
function toggleGroup(id: string): void {
  const list = collapsedGroups.value
  const at = list.indexOf(id)
  const collapsed = at < 0
  collapsedGroups.value = collapsed ? list.concat(id) : list.filter((item) => item !== id)
  emit('group-toggle', { group: id, collapsed })
  nextTick(() => measureViewport())
}

function armSync(source: string): void {
  syncSource.value = source
  if (syncTimer.value) clearTimeout(syncTimer.value)
  syncTimer.value = setTimeout(() => {
    syncSource.value = ''
    syncTimer.value = 0
  }, 80) as unknown as number
}

function readCenterClient(): number {
  const el = instance?.proxy?.$el as HTMLElement | undefined
  if (!el || typeof el.querySelectorAll !== 'function') return 0
  const nodes = el.querySelectorAll('.lingyun-table__x--body .uni-scroll-view')
  const scroller = nodes[nodes.length - 1] as HTMLElement | undefined
  if (!scroller || !scroller.clientWidth) return 0
  return scroller.clientWidth
}

function revealHBar(_show?: boolean): void {
  // H5 悬浮条常显，这里只用来刷新中间可视宽度
  // #ifdef H5
  const client = readCenterClient()
  if (client > 0 && centerClientPx.value !== client) centerClientPx.value = client
  // #endif
}

function nativePointer(event: unknown): { x: number; y: number; target: Element | null; preventDefault?: () => void } {
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
}

function findBarEl(start: Element | null, className: string): HTMLElement | null {
  let node: Element | null = start
  while (node) {
    if (node instanceof HTMLElement && node.classList.contains(className)) return node
    node = node.parentElement
  }
  return null
}

function pointerX(event: unknown): number {
  return nativePointer(event).x
}

function pointerY(event: unknown): number {
  return nativePointer(event).y
}

function onHBarStart(event: unknown): void {
  if (!scrollbarHandle.value) return
  const point = nativePointer(event)
  point.preventDefault?.()
  const track = hBarTrackPx.value
  const view = centerViewPx.value
  const content = Math.max(centerWidth.value, view)
  const max = Math.max(0, content - view)
  const thumb = Math.max(40, Math.round((track * view) / content))
  const travel = Math.max(1, track - thumb)
  // #ifdef H5
  const bar = findBarEl(point.target, 'lingyun-table__hbar')
  if (bar && max > 0) {
    const rect = bar.getBoundingClientRect()
    const x = point.x - rect.left
    const thumbLeft = (bodyLeft.value / max) * travel
    if (x < thumbLeft || x > thumbLeft + thumb) {
      const ratio = Math.min(1, Math.max(0, (x - thumb / 2) / travel))
      scrollCenterTo(ratio * max)
    }
  }
  // #endif
  hDragging.value = true
  hDragX.value = point.x
  hDragLeft.value = bodyLeft.value
  // #ifdef H5
  if (typeof document === 'undefined') return
  detachHBarDrag()
  const move = (e: MouseEvent) => onHBarMove(e)
  const up = () => {
    detachHBarDrag()
    onHBarEnd()
  }
  hDragMove.value = move
  hDragUp.value = up
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
  // #endif
}

function onHBarMove(event: unknown): void {
  if (!scrollbarHandle.value || !hDragging.value) return
  const track = hBarTrackPx.value
  const view = centerViewPx.value
  const content = Math.max(centerWidth.value, view)
  const max = Math.max(0, content - view)
  const thumb = Math.max(40, (track * view) / content)
  const travel = Math.max(1, track - thumb)
  const next = hDragLeft.value + (pointerX(event) - hDragX.value) * (max / travel)
  scrollCenterTo(Math.min(max, Math.max(0, next)))
}

function onHBarEnd(): void {
  hDragging.value = false
}

function detachHBarDrag(): void {
  if (typeof document === 'undefined') return
  if (hDragMove.value) document.removeEventListener('mousemove', hDragMove.value)
  if (hDragUp.value) document.removeEventListener('mouseup', hDragUp.value)
  hDragMove.value = null
  hDragUp.value = null
}

function onVBarStart(event: unknown): void {
  if (!scrollbarHandle.value) return
  const point = nativePointer(event)
  point.preventDefault?.()
  const track = vBarTrackPx.value
  const view = bodyHeightPx.value
  const content = Math.max(contentHeightPx.value, view)
  const max = Math.max(0, content - view)
  const thumb = Math.max(40, Math.round((track * view) / content))
  const travel = Math.max(1, track - thumb)
  // #ifdef H5
  const bar = findBarEl(point.target, 'lingyun-table__vbar')
  if (bar && max > 0) {
    const rect = bar.getBoundingClientRect()
    const y = point.y - rect.top
    const thumbTop = (bodyTop.value / max) * travel
    if (y < thumbTop || y > thumbTop + thumb) {
      const ratio = Math.min(1, Math.max(0, (y - thumb / 2) / travel))
      scrollBodyTo(ratio * max)
    }
  }
  // #endif
  vDragging.value = true
  vDragY.value = point.y
  vDragTop.value = bodyTop.value
  // #ifdef H5
  if (typeof document === 'undefined') return
  detachVBarDrag()
  const move = (e: MouseEvent) => onVBarMove(e)
  const up = () => {
    detachVBarDrag()
    onVBarEnd()
  }
  vDragMove.value = move
  vDragUp.value = up
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
  // #endif
}

function onVBarMove(event: unknown): void {
  if (!scrollbarHandle.value || !vDragging.value) return
  const track = vBarTrackPx.value
  const view = bodyHeightPx.value
  const content = Math.max(contentHeightPx.value, view)
  const max = Math.max(0, content - view)
  const thumb = Math.max(40, (track * view) / content)
  const travel = Math.max(1, track - thumb)
  const next = vDragTop.value + (pointerY(event) - vDragY.value) * (max / travel)
  scrollBodyTo(Math.min(max, Math.max(0, next)))
}

function onVBarEnd(): void {
  vDragging.value = false
}

function detachVBarDrag(): void {
  if (typeof document === 'undefined') return
  if (vDragMove.value) document.removeEventListener('mousemove', vDragMove.value)
  if (vDragUp.value) document.removeEventListener('mouseup', vDragUp.value)
  vDragMove.value = null
  vDragUp.value = null
}

function scrollCenterTo(left: number): void {
  syncColWindow(left)
  bodyLeft.value = left
  headLeft.value = left
  armSync('body')
  mpCommand(left, bodyTop.value)
}

/** 小程序：让 WXS 跳到指定位置（滚轮、拖滚动条、翻页） */
function mpCommand(left: number, top: number): void {
  // #ifdef MP-WEIXIN
  syncCmdLeft.value = left
  syncCmdTop.value = top
  syncSeq.value += 1
  // #endif
}

/** WXS：跨块或停下时回报位置，用来换虚拟窗口 */
function onSyncScroll(event?: { left?: number; top?: number; end?: boolean } | null): void {
  const left = Number(event && event.left) || 0
  const top = Number(event && event.top) || 0
  clearPressIfScrolled(left, top)
  syncRowWindow(top)
  syncColWindow(left)
  bodyLeft.value = left
  headLeft.value = left
  bodyTop.value = top
  leftTop.value = top
  rightTop.value = top
}

/** WXS：手势确认方向，取消按下高亮，并挡住随后的行点击 */
function onSyncMoveStart(): void {
  cancelPress()
  markMoved()
}

function onSyncTouchEnd(event?: { moved?: boolean } | null): void {
  if (event && event.moved) markMoved()
}

function markMoved(): void {
  centerMoved.value = true
  if (movedTimer.value) clearTimeout(movedTimer.value)
  movedTimer.value = setTimeout(() => {
    movedTimer.value = 0
    centerMoved.value = false
  }, 120) as unknown as number
}

function onCenterTouchStart(event: { touches?: ArrayLike<TouchPoint>; timeStamp?: number }): void {
  const touch = event.touches && event.touches[0]
  if (!touch) return
  stopGlide()
  glideSamples.value = []
  centerTouchX.value = touch.clientX || touch.pageX || 0
  centerTouchY.value = touch.clientY || touch.pageY || 0
  centerTouchLeft.value = bodyLeft.value
  centerTouchTop.value = bodyTop.value
  centerTouchAxis.value = ''
  noteGlideSample(event)
}

function onCenterTouchMove(event: { touches?: ArrayLike<TouchPoint>; timeStamp?: number }): void {
  const touch = event.touches && event.touches[0]
  if (!touch) return
  const x = touch.clientX || touch.pageX || 0
  const y = touch.clientY || touch.pageY || 0
  const dx = x - centerTouchX.value
  const dy = y - centerTouchY.value
  if (!centerTouchAxis.value) {
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
    centerTouchAxis.value = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    centerMoved.value = true
  }
  noteGlideSample(event)
  if (centerTouchAxis.value === 'x') {
    const view = centerViewPx.value
    const max = Math.max(0, centerWidth.value - view)
    const left = Math.min(max, Math.max(0, centerTouchLeft.value - dx))
    scrollCenterTo(left)
    revealHBar(true)
    return
  }
  scrollBodyTo(centerTouchTop.value - dy)
}

function onCenterTouchEnd(event?: { changedTouches?: ArrayLike<TouchPoint>; timeStamp?: number }): void {
  if (event && event.changedTouches && event.changedTouches.length) {
    noteGlideSample({ touches: event.changedTouches, timeStamp: event.timeStamp })
  }
  const moved = centerMoved.value
  const axis = centerTouchAxis.value
  const speed = axis ? releaseGlideSpeed(axis) : 0
  if (axis && Math.abs(speed) >= 0.08) {
    gliding.value = true
    centerTouchAxis.value = ''
    startGlide(axis, speed)
  } else {
    centerTouchAxis.value = ''
    gliding.value = false
  }
  if (!moved) return
  setTimeout(() => {
    centerMoved.value = false
  }, 80)
}

function noteGlideSample(event: { touches?: ArrayLike<TouchPoint>; timeStamp?: number }): void {
  const touch = event.touches && event.touches[0]
  if (!touch) return
  const t = event.timeStamp || Date.now()
  const sample = {
    x: touch.clientX || touch.pageX || 0,
    y: touch.clientY || touch.pageY || 0,
    t,
  }
  const list = glideSamples.value
  list.push(sample)
  const keep = t - 100
  while (list.length > 1 && list[0].t < keep) list.shift()
}

function releaseGlideSpeed(axis: 'x' | 'y'): number {
  const list = glideSamples.value
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
}

function scrollBodyTo(top: number): void {
  const max = Math.max(0, contentHeightPx.value - bodyHeightPx.value)
  const next = Math.min(max, Math.max(0, top))
  bodyTop.value = next
  leftTop.value = next
  rightTop.value = next
  syncRowWindow(next)
  armSync('body')
  mpCommand(bodyLeft.value, next)
}

function stopGlide(): void {
  if (glideTimer.value) {
    clearTimeout(glideTimer.value)
    glideTimer.value = 0
  }
  gliding.value = false
  glideV.value = 0
}

function startGlide(axis: 'x' | 'y', speed: number): void {
  stopGlide()
  gliding.value = true
  glideV.value = Math.max(-2.8, Math.min(2.8, speed))
  glideAt.value = Date.now()
  const step = () => {
    if (!gliding.value) return
    const now = Date.now()
    const dt = Math.min(34, Math.max(1, now - glideAt.value))
    glideAt.value = now
    glideV.value *= Math.exp(-dt / 320)
    const delta = glideV.value * dt
    if (axis === 'x') {
      const before = bodyLeft.value
      const max = Math.max(0, centerWidth.value - centerViewPx.value)
      const next = Math.min(max, Math.max(0, before + delta))
      scrollCenterTo(next)
      revealHBar(true)
      if (Math.abs(next - before) < 0.5 || Math.abs(glideV.value) < 0.02) {
        stopGlide()
        return
      }
    } else {
      const before = bodyTop.value
      const max = Math.max(0, contentHeightPx.value - bodyHeightPx.value)
      const next = Math.min(max, Math.max(0, before + delta))
      scrollBodyTo(next)
      if (Math.abs(next - before) < 0.5 || Math.abs(glideV.value) < 0.02) {
        stopGlide()
        return
      }
    }
    glideTimer.value = setTimeout(step, 16) as unknown as number
  }
  glideTimer.value = setTimeout(step, 16) as unknown as number
}

function onTablePointerEnter(): void {
  // #ifndef MP-WEIXIN
  return
  // #endif
  // #ifdef MP-WEIXIN
  uni.createSelectorQuery().selectViewport().scrollOffset((res) => {
    const offset = res as { scrollTop?: number } | null
    pageHoldTop.value = offset && typeof offset.scrollTop === 'number' ? offset.scrollTop : 0
  }).exec()
  // #endif
}

function onTableWheel(raw: unknown): void {
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
  stopGlide()
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
    const before = bodyLeft.value
    const max = Math.max(0, centerWidth.value - centerViewPx.value)
    const next = Math.min(max, Math.max(0, before + dx))
    if (Math.abs(next - before) < 0.5) {
      // 横滚到头：把剩余滚动量交给页面，不再回拉页面位置
      chainPageWheel(dy || dx)
      return
    }
    scrollCenterTo(next)
    revealHBar(true)
    return
  }
  const before = bodyTop.value
  const maxY = Math.max(0, contentHeightPx.value - bodyHeightPx.value)
  const nextY = Math.min(maxY, Math.max(0, before + dy))
  if (Math.abs(nextY - before) < 0.5) {
    // 竖滚到顶/底：只链到页面，避免 hold 与 chain 互相抢造成抖动
    chainPageWheel(dy)
    return
  }
  scrollBodyTo(nextY)
  // #endif
}

function chainPageWheel(delta: number): void {
  if (!delta) return
  if (pageHoldTimer.value) {
    clearTimeout(pageHoldTimer.value)
    pageHoldTimer.value = 0
  }
  // 以当前真实页滚为准累加，避免陈旧 pageHoldTop 把页面拽回去
  uni.createSelectorQuery().selectViewport().scrollOffset((res) => {
    const offset = res as { scrollTop?: number } | null
    const top = offset && typeof offset.scrollTop === 'number' ? offset.scrollTop : 0
    const next = Math.max(0, top + delta)
    pageHoldTop.value = next
    if (Math.abs(next - top) <= 0.5) return
    pageHoldTimer.value = setTimeout(() => {
      pageHoldTimer.value = 0
      uni.pageScrollTo({ scrollTop: next, duration: 0 })
    }, 0) as unknown as number
  }).exec()
}

function onBodyScroll(event: ScrollEvent): void {
  const left = event.detail?.scrollLeft || 0
  const top = event.detail?.scrollTop || 0
  const leftChanged = Math.abs(left - bodyLeft.value) > 0.5
  clearPressIfScrolled(left, top)
  syncRowWindow(top)
  syncColWindow(left)
  if (centerClientPx.value <= 0) {
    const client = readCenterClient()
    if (client > 0) centerClientPx.value = client
  }
  bodyLeft.value = left
  bodyTop.value = top
  revealHBar(leftChanged)
  if (syncSource.value === 'head' || syncSource.value === 'left' || syncSource.value === 'right') return
  headLeft.value = left
  leftTop.value = top
  rightTop.value = top
  armSync('body')
}

function onHeadScroll(event: ScrollEvent): void {
  const left = event.detail?.scrollLeft || 0
  const changed = Math.abs(left - headLeft.value) > 0.5
  syncColWindow(left)
  headLeft.value = left
  revealHBar(changed)
  if (syncSource.value === 'body') return
  bodyLeft.value = left
  armSync('head')
}

function onLeftScroll(event: ScrollEvent): void {
  if (centerTouchAxis.value || gliding.value) return
  const top = event.detail?.scrollTop || 0
  clearPressIfScrolled(bodyLeft.value, top)
  syncRowWindow(top)
  leftTop.value = top
  if (syncSource.value === 'body' || syncSource.value === 'right') return
  bodyTop.value = top
  rightTop.value = top
  armSync('left')
}

function onRightScroll(event: ScrollEvent): void {
  if (centerTouchAxis.value || gliding.value) return
  const top = event.detail?.scrollTop || 0
  clearPressIfScrolled(bodyLeft.value, top)
  syncRowWindow(top)
  rightTop.value = top
  if (syncSource.value === 'body' || syncSource.value === 'left') return
  bodyTop.value = top
  leftTop.value = top
  armSync('right')
}

watch(
  () => props.page,
  (value: number) => {
    innerPage.value = value || 1
  },
  { immediate: true },
)

watch(
  () => props.selectedKeys,
  (value: Array<string | number>) => {
    innerSelected.value = (value || []).map((item) => String(item))
  },
  { immediate: true },
)

watch(pageRows, (next: LingyunTableRow[], prev: LingyunTableRow[]) => {
  if (next.length && !(prev && prev.length)) {
    bodyTop.value = 0
    leftTop.value = 0
    rightTop.value = 0
  }
  syncRowWindow(bodyTop.value)
})

/** 小程序：受 WXS 驱动的节点被重新创建后，让 WXS 把当前位置再写一遍 */
watch(mpLayoutKey, () => {
  nextTick(() => mpCommand(bodyLeft.value, bodyTop.value))
})

watch(centerColumns, () => {
  syncColWindow(bodyLeft.value)
})

watch(
  () => props.loading,
  (on: boolean) => {
    if (on) {
      columnPickerOpen.value = false
      cancelPress()
    }
    nextTick(() => measureViewport())
  },
)

watch(
  () => props.total,
  () => {
    nextTick(() => measureViewport())
  },
)

watch(
  () => props.pageSize,
  () => {
    nextTick(() => measureViewport())
  },
)

watch(
  () => activeFilters.value.length,
  () => {
    nextTick(() => measureViewport())
  },
)

watch(
  () => props.size,
  () => {
    syncRowWindow(bodyTop.value)
    nextTick(() => measureViewport())
  },
)

watch(
  () => props.showFooter,
  () => {
    nextTick(() => measureViewport())
  },
)

watch(
  () => props.footerData,
  () => {
    nextTick(() => measureViewport())
  },
)

watch(groupFieldKey, () => {
  collapsedGroups.value = []
})

watch(
  () => props.groupFields,
  () => {
    syncRowWindow(bodyTop.value)
    nextTick(() => measureViewport())
  },
  { deep: true },
)

syncRowWindow(0)
syncColWindow(0)
scrollbarHandle.value = detectScrollbarHandle()

onMounted(() => {
  const section = injectedSectionMark || findSectionMarkHost(instance?.parent?.proxy ?? null)
  if (section) {
    embeddedSection = section
    section.markEmbeddedList?.(true)
  }
  if (props.remote) emitQuery()
  measureViewport()
  bindChipsPointer()
  const handler = () => {
    if (!fixed.value && fillMode.value === 'page') {
      const info = uni.getWindowInfo()
      const pageH = info && info.windowHeight ? Math.round(info.windowHeight) : 0
      if (pageH > 0) fillHeightPx.value = pageH
    }
    if (!fixed.value && fillMode.value === 'parent') {
      const parentH = parentBoxHeight()
      if (parentH >= 80) fillHeightPx.value = parentH
    }
    measureViewport()
  }
  onResize.value = handler
  uni.onWindowResize(handler)
})

onBeforeUnmount(() => {
  embeddedSection?.markEmbeddedList?.(false)
  detachHBarDrag()
  detachVBarDrag()
  if (chipsDragStop.value) chipsDragStop.value()
  if (chipsUnbind.value) chipsUnbind.value()
  if (syncTimer.value) clearTimeout(syncTimer.value)
  if (pressTimer.value) clearTimeout(pressTimer.value)
  if (hBarTimer.value) clearTimeout(hBarTimer.value)
  if (pageHoldTimer.value) clearTimeout(pageHoldTimer.value)
  if (pressDelayTimer.value) clearTimeout(pressDelayTimer.value)
  if (movedTimer.value) clearTimeout(movedTimer.value)
  stopGlide()
  if (onResize.value) uni.offWindowResize(onResize.value)
})
</script>

<!-- #ifdef MP-WEIXIN -->
<script src="./table-sync.wxs" module="tableSync" lang="wxs"></script>
<!-- #endif -->

<style lang="scss">
@import '../../styles/variables.scss';

$ly-table-row: 52px;
$ly-table-head: 44px;
$ly-table-radius: 26px;

.lingyun-table {
  position: relative;
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

.lingyun-table__tool-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lingyun-table__tool-icon--spin {
  animation: lingyun-table-spin 0.9s linear infinite;
}

@keyframes lingyun-table-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.lingyun-table__tools-slot {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/* 加载时插槽里的自定义工具也一起变灰、不能点 */
.lingyun-table__tools-slot--off {
  opacity: 0.35;
  pointer-events: none;
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

/* 盖在固定列（4）和滚动条（20）之上；top 由 loadingStyle 让出标题栏 */
.lingyun-table__loading {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 用表格底色半透明盖住内容，浅色发白、暗黑发黑；菊花在它上面不跟着变淡 */
.lingyun-table__loading-wash {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
  opacity: 0.6;
}

.lingyun-table__loading-spin {
  position: relative;
  z-index: 1;
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

/* 分组行用分割线同色作底，和数据行拉开层次。分割线是半透明的，自己的底边线再叠一层会更深，所以去掉 */
.lingyun-table__row.lingyun-table__row--group {
  background-color: var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-table__body .lingyun-table__row.lingyun-table__row--group {
  border-bottom-color: transparent;
}

/* 收起后两条分组行相邻，靠这条线分开 */
.lingyun-table__body .lingyun-table__row.lingyun-table__row--group.lingyun-table__row--group-stack {
  border-bottom-color: var(--lingyun-separator, #{$lingyun-separator});
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

.lingyun-table__row--group {
  cursor: pointer;
}

/* 分组行的展开箭头：展开朝下，收起转到朝右 */
.lingyun-table__fold {
  flex-shrink: 0;
  width: 16px;
  margin-right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.lingyun-table__fold--closed {
  transform: rotate(-90deg);
}

.lingyun-table--compact .lingyun-table__fold {
  width: 14px;
  margin-right: 4px;
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
