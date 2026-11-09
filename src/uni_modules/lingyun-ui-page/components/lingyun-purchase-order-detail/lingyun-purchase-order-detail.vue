<template>
  <lingyun-app-page
    :show-toolbar="showToolbar"
    :show-back="showBack && showToolbar"
    :show-nav="showNav"
    :show-tabbar="false"
    :title="title"
    :auto-top-inset="scrollUnderToolbar ? false : autoTopInset"
    :show-theme-switch="showThemeSwitch"
    :trailing-buttons="toolbarButtons"
    :trailing-menu-enabled="toolbarMenuEnabled"
    :body-scroll="false"
    :page-scroll="false"
    @back="onBack"
  >
    <view class="lingyun-purchase-order-detail">
      <view class="lingyun-purchase-order-detail__body">
        <scroll-view
          class="lingyun-purchase-order-detail__scroll"
          scroll-y
          :show-scrollbar="false"
          :upper-threshold="2"
          :scroll-into-view="scrollIntoView"
          @scroll="onScroll"
          @scrolltoupper="onScrollToUpper"
        >
          <view id="lingyun-purchase-order-detail-top" class="lingyun-purchase-order-detail__anchor" />
          <view
            v-if="scrollUnderToolbar"
            class="lingyun-purchase-order-detail__top-space"
          />
          <view v-if="loading" class="lingyun-purchase-order-detail__state">
            <lingyun-activity-indicator size="large" />
            <text class="lingyun-purchase-order-detail__state-text">{{ loadingText }}</text>
          </view>

          <view v-else-if="!order" class="lingyun-purchase-order-detail__state lingyun-purchase-order-detail__state--empty">
            <lingyun-empty variant="plain" :title="emptyText" />
          </view>

          <view v-else class="lingyun-purchase-order-detail__content">
            <view v-if="!hasSubOrders" class="lingyun-purchase-order-detail__status" :style="statusCardStyle">
              <view class="lingyun-purchase-order-detail__status-main">
                <view
                  class="lingyun-purchase-order-detail__status-icon"
                  :style="{ backgroundColor: statusMeta.tint }"
                >
                  <lingyun-icon
                    :type="statusMeta.icon"
                    :size="24"
                    :color="statusMeta.color"
                  />
                </view>
                <view class="lingyun-purchase-order-detail__status-text">
                  <text class="lingyun-purchase-order-detail__status-title">{{ statusMeta.text }}</text>
                  <text v-if="statusMeta.hint" class="lingyun-purchase-order-detail__status-hint">
                    {{ statusMeta.hint }}
                  </text>
                  <text
                    v-if="paymentCountdownText"
                    class="lingyun-purchase-order-detail__status-countdown"
                  >
                    {{ paymentCountdownText }}
                  </text>
                </view>
              </view>
              <view class="lingyun-purchase-order-detail__status-amount">
                <text class="lingyun-purchase-order-detail__status-amount-label">{{ totalLabel }}</text>
                <view class="lingyun-purchase-order-detail__status-amount-value">
                  <text class="lingyun-purchase-order-detail__status-currency">{{ currency }}</text>
                  <text class="lingyun-purchase-order-detail__status-number">{{ formatAmount(totalAmount) }}</text>
                </view>
              </view>
            </view>

            <template v-if="hasAddress">
              <lingyun-group-header :title="addressTitle" />
              <view class="lingyun-purchase-order-detail__card lingyun-purchase-order-detail__address">
                <view class="lingyun-purchase-order-detail__address-icon">
                  <lingyun-icon
                    :type="deliveryType === 'pickup' ? 'shop' : 'location'"
                    :size="20"
                    color="var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6))"
                  />
                </view>
                <view class="lingyun-purchase-order-detail__address-body">
                  <view class="lingyun-purchase-order-detail__address-top">
                    <text class="lingyun-purchase-order-detail__address-name">{{ addressName }}</text>
                    <text v-if="addressPhone" class="lingyun-purchase-order-detail__address-phone">
                      {{ addressPhone }}
                    </text>
                  </view>
                  <text class="lingyun-purchase-order-detail__address-main">{{ addressMain }}</text>
                  <text
                    v-if="showAddressMeta"
                    class="lingyun-purchase-order-detail__address-meta"
                  >
                    {{ addressMeta }}
                  </text>
                </view>
              </view>
            </template>

            <template v-if="hasSubOrders">
              <lingyun-group-header :title="`子订货单与物流 · ${subOrders.length} 批`" />
              <view
                v-for="subOrder in subOrders"
                :key="subOrder.key"
                class="lingyun-purchase-order-detail__card lingyun-purchase-order-detail__sub"
                hover-class="lingyun-purchase-order-detail__sub--hover"
                :hover-start-time="20"
                :hover-stay-time="70"
                role="button"
                @click="onSubPurchaseOrderClick(subOrder)"
              >
                <view class="lingyun-purchase-order-detail__sub-head">
                  <view class="lingyun-purchase-order-detail__sub-head-top">
                    <text class="lingyun-purchase-order-detail__sub-number">{{ subOrder.number }}</text>
                    <text
                      class="lingyun-purchase-order-detail__sub-status"
                      :style="{ color: subOrderMeta(subOrder).color }"
                    >{{ subOrderMeta(subOrder).text }}</text>
                  </view>
                  <view
                    v-if="subOrderWarehouseLabel(subOrder) || subOrderEstimate(subOrder)"
                    class="lingyun-purchase-order-detail__sub-meta"
                  >
                    <text
                      v-if="subOrderWarehouseLabel(subOrder)"
                      class="lingyun-purchase-order-detail__sub-warehouse"
                    >{{ subOrderWarehouseLabel(subOrder) }}</text>
                    <text
                      v-if="subOrderEstimate(subOrder)"
                      class="lingyun-purchase-order-detail__sub-estimate"
                    >{{ subOrderEstimate(subOrder) }}</text>
                  </view>
                </view>

                <view
                  v-if="subOrderItems(subOrder).length"
                  class="lingyun-purchase-order-detail__sub-media"
                >
                  <view class="lingyun-purchase-order-detail__sub-thumbs">
                    <view
                      v-for="item in subOrderVisibleThumbs(subOrder)"
                      :key="item.key"
                      class="lingyun-purchase-order-detail__sub-thumb"
                    >
                      <image
                        v-if="item.image"
                        class="lingyun-purchase-order-detail__sub-thumb-img"
                        :src="item.image"
                        mode="aspectFill"
                        lazy-load
                      />
                      <text v-else class="lingyun-purchase-order-detail__sub-thumb-fallback">
                        {{ firstChar(item.name) }}
                      </text>
                    </view>
                    <text
                      v-if="subOrderExtraThumbCount(subOrder)"
                      class="lingyun-purchase-order-detail__sub-thumb-more"
                    >+{{ subOrderExtraThumbCount(subOrder) }}</text>
                  </view>
                  <view class="lingyun-purchase-order-detail__sub-totals">
                    <text class="lingyun-purchase-order-detail__sub-count">
                      共 {{ subOrderItemsCount(subOrder) }} 件
                    </text>
                    <text
                      v-if="subOrderHasAmounts(subOrder)"
                      class="lingyun-purchase-order-detail__sub-total"
                    >{{ currency }}{{ formatAmount(subOrderTotal(subOrder)) }}</text>
                  </view>
                </view>

                <view v-if="latestSubStep(subOrder)" class="lingyun-purchase-order-detail__sub-latest">
                  <view class="lingyun-purchase-order-detail__sub-latest-log">
                    <text class="lingyun-purchase-order-detail__sub-latest-desc">
                      {{ latestSubStep(subOrder)?.description || latestSubStep(subOrder)?.title }}
                    </text>
                    <lingyun-date-text
                      v-if="subOrderLogTimeValue(subOrder)"
                      class="lingyun-purchase-order-detail__sub-latest-time"
                      :value="subOrderLogTimeValue(subOrder)"
                      precision="minute"
                      type="caption2"
                      color="tertiary"
                      :fallback="latestSubStep(subOrder)?.time || ''"
                      :today-text="subOrderLogMonthDay(subOrder)"
                      :yesterday-text="subOrderLogMonthDay(subOrder)"
                      :tomorrow-text="subOrderLogMonthDay(subOrder)"
                    />
                  </view>
                </view>
                <text v-else class="lingyun-purchase-order-detail__sub-empty">暂无物流信息</text>

                <view class="lingyun-purchase-order-detail__sub-more">
                  <text class="lingyun-purchase-order-detail__sub-more-text">查看子订货单详情</text>
                  <lingyun-icon
                    type="right"
                    :size="14"
                    color="var(--lingyun-label-tertiary, rgba(60, 60, 67, 0.3))"
                  />
                </view>
              </view>
            </template>

            <template v-if="!hasSubOrders">
              <lingyun-group-header :title="itemsTitle" />
              <view class="lingyun-purchase-order-detail__card lingyun-purchase-order-detail__items">
                <template v-if="showItemPreview">
                  <view class="lingyun-purchase-order-detail__items-preview">
                    <view class="lingyun-purchase-order-detail__items-thumbs">
                      <view
                        v-for="item in itemPreviewThumbs"
                        :key="item.key"
                        class="lingyun-purchase-order-detail__items-thumb"
                      >
                        <image
                          v-if="item.image"
                          class="lingyun-purchase-order-detail__items-thumb-img"
                          :src="item.image"
                          mode="aspectFill"
                          lazy-load
                        />
                        <text v-else class="lingyun-purchase-order-detail__items-thumb-fallback">
                          {{ firstChar(item.name) }}
                        </text>
                      </view>
                      <text
                        v-if="itemExtraThumbCount"
                        class="lingyun-purchase-order-detail__items-thumb-more"
                      >+{{ itemExtraThumbCount }}</text>
                    </view>
                  </view>
                </template>

                <template v-else>
                  <view
                    v-for="(item, index) in order.items"
                    :key="item.key"
                    class="lingyun-purchase-order-detail__item"
                    :class="{ 'lingyun-purchase-order-detail__item--divided': index > 0 }"
                    hover-class="lingyun-purchase-order-detail__item--hover"
                    :hover-start-time="20"
                    :hover-stay-time="70"
                    role="button"
                    @click="onItemClick(item, index)"
                  >
                    <view class="lingyun-purchase-order-detail__item-image">
                      <image
                        v-if="item.image"
                        class="lingyun-purchase-order-detail__item-image-img"
                        :src="item.image"
                        mode="aspectFill"
                        lazy-load
                      />
                      <text v-else class="lingyun-purchase-order-detail__item-image-fallback">
                        {{ firstChar(item.name) }}
                      </text>
                    </view>
                    <view class="lingyun-purchase-order-detail__item-body">
                      <view class="lingyun-purchase-order-detail__item-title-row">
                        <text class="lingyun-purchase-order-detail__item-name">{{ item.name }}</text>
                      </view>
                      <text v-if="item.specText" class="lingyun-purchase-order-detail__item-spec">
                        {{ item.specText }}
                      </text>
                      <view class="lingyun-purchase-order-detail__item-bottom">
                        <view class="lingyun-purchase-order-detail__item-price">
                          <text class="lingyun-purchase-order-detail__item-currency">{{ currency }}</text>
                          <text class="lingyun-purchase-order-detail__item-amount">{{ formatAmount(item.price) }}</text>
                          <text v-if="item.originalPrice" class="lingyun-purchase-order-detail__item-original">
                            {{ currency }}{{ formatAmount(item.originalPrice) }}
                          </text>
                        </view>
                        <text class="lingyun-purchase-order-detail__item-qty">×{{ item.quantity }}</text>
                      </view>
                    </view>
                  </view>
                </template>

                <view
                  v-if="canToggleItems"
                  class="lingyun-purchase-order-detail__items-toggle"
                  hover-class="lingyun-purchase-order-detail__items-toggle--hover"
                  :hover-start-time="20"
                  :hover-stay-time="70"
                  role="button"
                  @click.stop="toggleItems"
                >
                  <text class="lingyun-purchase-order-detail__items-toggle-text">
                    {{ itemsExpanded ? '收起详情' : '查看详情' }}
                  </text>
                  <lingyun-icon
                    :type="itemsExpanded ? 'up' : 'down'"
                    :size="14"
                    color="primary"
                  />
                </view>
              </view>
            </template>

            <lingyun-group-header title="金额明细" />
            <view class="lingyun-purchase-order-detail__card lingyun-purchase-order-detail__amounts">
              <view
                v-for="row in amountRows"
                :key="row.key"
                class="lingyun-purchase-order-detail__amount-row"
                :class="{ 'lingyun-purchase-order-detail__amount-row--total': row.emphasis }"
              >
                <text class="lingyun-purchase-order-detail__amount-label">{{ row.label }}</text>
                <text class="lingyun-purchase-order-detail__amount-value">{{ row.value }}</text>
              </view>
            </view>

            <template v-if="!hasSubOrders && showLogistics">
              <lingyun-group-header title="物流信息" />
              <view class="lingyun-purchase-order-detail__card lingyun-purchase-order-detail__timeline">
                <view
                  v-if="order.carrier || order.trackingNumber"
                  class="lingyun-purchase-order-detail__logistics-meta"
                >
                  <view v-if="order.carrier" class="lingyun-purchase-order-detail__logistics-row">
                    <text class="lingyun-purchase-order-detail__logistics-label">承运服务商</text>
                    <text class="lingyun-purchase-order-detail__logistics-value">{{ order.carrier }}</text>
                  </view>
                  <view
                    v-if="order.trackingNumber"
                    class="lingyun-purchase-order-detail__logistics-row"
                  >
                    <text class="lingyun-purchase-order-detail__logistics-label">快递单号</text>
                    <view class="lingyun-purchase-order-detail__logistics-value-row">
                      <text class="lingyun-purchase-order-detail__logistics-value">
                        {{ order.trackingNumber }}
                      </text>
                      <view
                        class="lingyun-purchase-order-detail__logistics-copy"
                        role="button"
                        @click.stop="copyTrackingNumber"
                      >
                        <text class="lingyun-purchase-order-detail__logistics-copy-text">复制</text>
                      </view>
                    </view>
                  </view>
                </view>

                <view
                  v-if="timelineSteps.length"
                  class="lingyun-purchase-order-detail__logistics-timeline"
                  :class="{
                    'lingyun-purchase-order-detail__logistics-timeline--divided':
                      order.carrier || order.trackingNumber,
                  }"
                >
                  <view
                    v-for="(step, index) in timelineSteps"
                    :key="step.key || index"
                    class="lingyun-purchase-order-detail__step"
                  >
                    <view class="lingyun-purchase-order-detail__step-rail">
                      <view
                        class="lingyun-purchase-order-detail__step-dot"
                        :class="{ 'lingyun-purchase-order-detail__step-dot--active': isStepActive(step, index) }"
                      />
                      <view
                        v-if="index < timelineSteps.length - 1"
                        class="lingyun-purchase-order-detail__step-line"
                      />
                    </view>
                    <view class="lingyun-purchase-order-detail__step-body">
                      <view class="lingyun-purchase-order-detail__step-head">
                        <text
                          class="lingyun-purchase-order-detail__step-title"
                          :class="{ 'lingyun-purchase-order-detail__step-title--active': isStepActive(step, index) }"
                        >{{ step.title }}</text>
                        <text class="lingyun-purchase-order-detail__step-time">{{ step.time }}</text>
                      </view>
                      <text v-if="step.description" class="lingyun-purchase-order-detail__step-desc">
                        {{ step.description }}
                      </text>
                    </view>
                  </view>
                </view>
              </view>
            </template>

            <lingyun-group-header title="订货单信息" />
            <view class="lingyun-purchase-order-detail__card lingyun-purchase-order-detail__info">
              <view class="lingyun-purchase-order-detail__info-row">
                <text class="lingyun-purchase-order-detail__info-label">订货单编号</text>
                <view class="lingyun-purchase-order-detail__info-value-row">
                  <text class="lingyun-purchase-order-detail__info-value">{{ order.number }}</text>
                  <view
                    class="lingyun-purchase-order-detail__info-copy"
                    role="button"
                    @click.stop="copyOrderNumber"
                  >
                    <text class="lingyun-purchase-order-detail__info-copy-text">复制</text>
                  </view>
                </view>
              </view>
              <view
                v-for="row in orderInfoRows"
                :key="row.label"
                class="lingyun-purchase-order-detail__info-row lingyun-purchase-order-detail__info-row--divided"
              >
                <text class="lingyun-purchase-order-detail__info-label">{{ row.label }}</text>
                <text class="lingyun-purchase-order-detail__info-value">{{ row.value }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view v-if="showActions" class="lingyun-purchase-order-detail__actions">
        <view class="lingyun-purchase-order-detail__actions-inner">
          <view class="lingyun-purchase-order-detail__actions-total">
            <text class="lingyun-purchase-order-detail__actions-total-label">{{ totalLabel }}</text>
            <view class="lingyun-purchase-order-detail__actions-amount">
              <text class="lingyun-purchase-order-detail__actions-currency">{{ currency }}</text>
              <text class="lingyun-purchase-order-detail__actions-number">{{ formatAmount(totalAmount) }}</text>
            </view>
          </view>
          <view class="lingyun-purchase-order-detail__actions-buttons">
            <lingyun-button
              v-for="(action, index) in displayActions"
              :key="action.key"
              :text="action.text"
              :variant="actionVariant(action, index)"
              :role="action.role || 'normal'"
              :disabled="action.disabled"
              size="medium"
              @click="onAction(action)"
            />
          </view>
        </view>
      </view>
    </view>

    <template #trailing-menu="scope">
      <slot
        name="toolbar-menu"
        :button="scope.button"
        :index="scope.index"
        :groupIndex="scope.groupIndex"
        :buttonIndex="scope.buttonIndex"
        :close="scope.close"
      />
    </template>
  </lingyun-app-page>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useLingyunAppPageScroll } from '../../../lingyun-ui/components/lingyun-app-page/useLingyunAppPageScroll'
import { parseLingyunDate } from '../../../lingyun-ui/utils/dateFormat'
import type {
  LingyunPurchaseOrderDetailAction,
  LingyunPurchaseOrderDetailActionPayload,
  LingyunPurchaseOrderDetailCopyPayload,
  LingyunPurchaseOrderDetailDeliveryType,
  LingyunPurchaseOrderDetailInfoRow,
  LingyunPurchaseOrderDetailItem,
  LingyunPurchaseOrderDetailItemPayload,
  LingyunPurchaseOrderDetailOrder,
  LingyunPurchaseOrderDetailPaymentTimeoutPayload,
  LingyunPurchaseOrderDetailStatus,
  LingyunPurchaseOrderDetailSubOrder,
  LingyunPurchaseOrderDetailSubOrderPayload,
  LingyunPurchaseOrderDetailTimelineStep,
  LingyunPurchaseOrderDetailToolbarButtons,
} from './types'

interface StatusMeta {
  text: string
  hint: string
  icon: string
  color: string
  tint: string
}

interface AmountRow {
  key: string
  label: string
  value: string
  emphasis?: boolean
}

const STATUS_META: Record<LingyunPurchaseOrderDetailStatus, StatusMeta> = {
  pendingReview: {
    text: '待审核',
    hint: '支付成功，等待商家审核',
    icon: 'compose',
    color: 'var(--lingyun-system-purple, #cb30e0)',
    tint: 'rgba(203, 48, 224, 0.12)',
  },
  pendingPayment: {
    text: '待付款',
    hint: '请在订货单关闭前完成支付',
    icon: 'wallet',
    color: 'var(--lingyun-system-orange, #ff8d28)',
    tint: 'rgba(255, 141, 40, 0.14)',
  },
  pendingShipment: {
    text: '待发货',
    hint: '商家正在准备您的订货单',
    icon: 'cart',
    color: 'var(--lingyun-system-indigo, #6155f5)',
    tint: 'rgba(97, 85, 245, 0.12)',
  },
  shipped: {
    text: '待收货',
    hint: '商品正在配送，请保持电话畅通',
    icon: 'paperplane',
    color: 'var(--lingyun-system-blue, #0088ff)',
    tint: 'rgba(0, 136, 255, 0.12)',
  },
  completed: {
    text: '已完成',
    hint: '感谢您的购买，欢迎再次光临',
    icon: 'checkmarkempty',
    color: 'var(--lingyun-system-green, #34c759)',
    tint: 'rgba(52, 199, 89, 0.12)',
  },
  cancelled: {
    text: '已取消',
    hint: '订货单已关闭，如已支付将原路退款',
    icon: 'close',
    color: 'var(--lingyun-system-gray, #8e8e93)',
    tint: 'rgba(142, 142, 147, 0.14)',
  },
  refund: {
    text: '退款中',
    hint: '退款将原路返回，请留意到账通知',
    icon: 'undo',
    color: 'var(--lingyun-system-red, #ff383c)',
    tint: 'rgba(255, 56, 60, 0.12)',
  },
}

const DEFAULT_ACTIONS: Record<LingyunPurchaseOrderDetailStatus, LingyunPurchaseOrderDetailAction[]> = {
  pendingReview: [
    { key: 'cancel', text: '取消订货单', variant: 'bordered', role: 'destructive' },
  ],
  pendingPayment: [
    { key: 'cancel', text: '取消订货单', variant: 'bordered', role: 'destructive' },
    { key: 'pay', text: '去支付', variant: 'borderedProminent' },
  ],
  pendingShipment: [
    { key: 'remind', text: '提醒发货', variant: 'borderedProminent' },
  ],
  shipped: [
    { key: 'confirm', text: '确认收货', variant: 'borderedProminent' },
  ],
  completed: [
    { key: 'aftersale', text: '申请售后', variant: 'bordered' },
    { key: 'rebuy', text: '再来一单', variant: 'borderedProminent' },
  ],
  cancelled: [
    { key: 'rebuy', text: '再来一单', variant: 'borderedProminent' },
  ],
  refund: [
    { key: 'refundDetail', text: '退款详情', variant: 'borderedProminent' },
  ],
}

/**
 * lingyun-purchase-order-detail
 * 订货单详情标准页：状态头 + 配送 / 自提 + 商品清单 + 金额 + 物流 + 订货单信息 + 操作栏。
 * 数据驱动，不请求接口；操作 / 商品 / 地址 / 复制抛事件。
 * @see design/pages/demo/purchase-order-detail.md
 */
export default defineComponent({
  name: 'LingyunPurchaseOrderDetail',
  emits: [
    'back',
    'action',
    'item-click',
    'sub-purchase-order-click',
    'copy',
    'payment-timeout',
  ],
  setup() {
    const reportScroll = useLingyunAppPageScroll()
    return { reportScroll }
  },
  props: {
    order: {
      type: Object as PropType<LingyunPurchaseOrderDetailOrder | null>,
      default: null,
    },
    loading: { type: Boolean, default: false },
    loadingText: { type: String, default: '加载中…' },
    emptyText: { type: String, default: '订货单不存在' },
    title: { type: String, default: '订货单详情' },
    showToolbar: { type: Boolean, default: true },
    showBack: { type: Boolean, default: true },
    showNav: { type: Boolean, default: true },
    autoTopInset: { type: Boolean, default: true },
    /** 返回钮默认返回上一页；false 时只抛 back，由页面处理 */
    autoBack: { type: Boolean, default: true },
    /** 内层滚动内容从顶栏下方穿过，滚动时顶栏呈现液态玻璃；false 用 app-page 顶栏留白 */
    scrollUnderToolbar: { type: Boolean, default: true },
    /** 页面级主题钮开关：auto 跟随全局，false 只隐藏当前页 */
    showThemeSwitch: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: 'auto',
    },
    toolbarButtons: {
      type: Array as PropType<LingyunPurchaseOrderDetailToolbarButtons>,
      default: () => [],
    },
    toolbarMenuEnabled: { type: Boolean, default: false },
    currency: { type: String, default: '¥' },
    priceDecimals: { type: Number, default: 2 },
    /** 子订货单行横向最多展示的商品图数量，多出的显示 +N */
    maxThumbnails: { type: Number, default: 3 },
    /** 待付款倒计时，单位分钟，从 order.createdAt 起算 */
    paymentTimeoutMinutes: { type: Number, default: 15 },
  },
  data() {
    return {
      scrollIntoView: '',
      itemsExpanded: false,
      nowTs: Date.now(),
      countdownTimer: null as ReturnType<typeof setInterval> | null,
      paymentTimeoutNotified: false,
    }
  },
  watch: {
    'order.number'() {
      this.resetScroll()
      this.itemsExpanded = false
      this.startCountdown()
    },
    'order.status'() {
      this.startCountdown()
    },
  },
  mounted() {
    this.resetScroll()
    this.startCountdown()
  },
  beforeUnmount() {
    this.stopCountdown()
  },
  computed: {
    statusMeta(): StatusMeta {
      const fallback = STATUS_META.pendingPayment
      if (!this.order) return fallback
      const meta = STATUS_META[this.order.status] || fallback
      return {
        ...meta,
        text: this.order.statusText || meta.text,
        hint: this.order.statusHint || meta.hint,
        icon: this.order.statusIcon || meta.icon,
        color: this.order.statusColor || meta.color,
      }
    },
    statusCardStyle(): Record<string, string> {
      return {
        background: `linear-gradient(135deg, ${this.statusMeta.tint} 0%, rgba(255, 255, 255, 0) 66%), var(--lingyun-bg-grouped-secondary, #ffffff)`,
      }
    },
    totalAmount(): number {
      const amounts = this.order?.amounts
      if (!amounts) return 0
      return amounts.paid !== undefined ? amounts.paid : amounts.payable
    },
    totalLabel(): string {
      if (!this.order) return ''
      if (this.order.status === 'pendingPayment') {
        return '需付款'
      }
      if (this.order.status === 'cancelled') return '订货单金额'
      return '实付款'
    },
    paymentDeadline(): number {
      if (!this.order || this.order.status !== 'pendingPayment') return 0
      const created = parseLingyunDate(this.order.createdAt)
      if (!created) return 0
      const minutes = Number(this.paymentTimeoutMinutes)
      const timeout = Number.isFinite(minutes) ? Math.max(1, minutes) : 15
      return created.getTime() + timeout * 60 * 1000
    },
    paymentRemainMs(): number {
      if (!this.paymentDeadline) return 0
      return Math.max(0, this.paymentDeadline - this.nowTs)
    },
    paymentExpired(): boolean {
      return this.paymentDeadline > 0 && this.paymentRemainMs <= 0
    },
    paymentCountdownText(): string {
      if (
        !this.order ||
        this.order.status !== 'pendingPayment' ||
        !this.paymentDeadline
      ) {
        return ''
      }
      if (this.paymentExpired) return ''
      const total = Math.floor(this.paymentRemainMs / 1000)
      return `支付剩余 ${this.pad2(Math.floor(total / 60))}:${this.pad2(total % 60)}`
    },
    deliveryType(): LingyunPurchaseOrderDetailDeliveryType | '' {
      const order = this.order
      if (!order) return ''
      if (order.deliveryType) return order.deliveryType
      if (order.receiver) return 'delivery'
      if (order.pickup) return 'pickup'
      return ''
    },
    hasAddress(): boolean {
      if (!this.order) return false
      return this.deliveryType === 'delivery'
        ? !!this.order.receiver
        : this.deliveryType === 'pickup'
          ? !!this.order.pickup
          : false
    },
    addressTitle(): string {
      return this.deliveryType === 'pickup' ? '自提信息' : '配送信息'
    },
    addressName(): string {
      if (!this.order) return ''
      if (this.deliveryType === 'pickup') return this.order.pickup?.storeName || ''
      return this.order.receiver?.name || ''
    },
    addressPhone(): string {
      if (!this.order) return ''
      if (this.deliveryType === 'pickup') return this.order.pickup?.phone || ''
      return this.order.receiver?.phone || ''
    },
    addressMain(): string {
      if (!this.order) return ''
      if (this.deliveryType === 'pickup') return this.order.pickup?.address || ''
      return this.order.receiver?.address || ''
    },
    addressMeta(): string {
      if (!this.order) return ''
      if (this.deliveryType === 'pickup') return this.order.pickup?.time || ''
      return this.order.deliveryTime || ''
    },
    /** 付款 / 审核前不展示预计送达时间 */
    showAddressMeta(): boolean {
      if (!this.addressMeta) return false
      if (this.deliveryType === 'pickup') return true
      if (this.hasSubOrders) return false
      return (
        this.order?.status !== 'pendingReview' &&
        this.order?.status !== 'pendingPayment'
      )
    },
    itemsTitle(): string {
      const count = (this.order?.items || []).reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0,
      )
      return count > 0 ? `商品清单 · 共 ${count} 件` : '商品清单'
    },
    amountRows(): AmountRow[] {
      const order = this.order
      if (!order) return []
      const amounts = order.amounts
      const rows: AmountRow[] = [
        { key: 'goods', label: '商品合计', value: this.formatPrice(amounts.goodsTotal) },
      ]
      if (amounts.deliveryFee && amounts.deliveryFee > 0) {
        rows.push({
          key: 'delivery',
          label: '配送费',
          value: this.formatPrice(amounts.deliveryFee),
        })
      }
      if (amounts.discount && amounts.discount > 0) {
        rows.push({
          key: 'discount',
          label: '优惠',
          value: `-${this.formatPrice(amounts.discount)}`,
        })
      }
      if (amounts.coupon && amounts.coupon > 0) {
        rows.push({
          key: 'coupon',
          label: '优惠券',
          value: `-${this.formatPrice(amounts.coupon)}`,
        })
      }
      const paid = amounts.paid
      rows.push({
        key: 'total',
        label:
          paid !== undefined
            ? '实付款'
            : order.status === 'pendingPayment'
              ? '需付款'
              : '应付金额',
        value: this.formatPrice(paid !== undefined ? paid : amounts.payable),
        emphasis: true,
      })
      return rows
    },
    timelineSteps(): LingyunPurchaseOrderDetailTimelineStep[] {
      return this.order?.timeline || []
    },
    /** 审核前没有物流进度：待审核 / 待付款不显示时间线 */
    showTimeline(): boolean {
      if (!this.order || !this.timelineSteps.length) return false
      return (
        this.order.status !== 'pendingReview' &&
        this.order.status !== 'pendingPayment'
      )
    },
    showLogistics(): boolean {
      return (
        this.showTimeline ||
        !!this.order?.carrier ||
        !!this.order?.trackingNumber
      )
    },
    hasSubOrders(): boolean {
      return !!(this.order?.subOrders && this.order.subOrders.length)
    },
    subOrders(): LingyunPurchaseOrderDetailSubOrder[] {
      return this.order?.subOrders || []
    },
    orderInfoRows(): LingyunPurchaseOrderDetailInfoRow[] {
      const order = this.order
      if (!order) return []
      const rows: LingyunPurchaseOrderDetailInfoRow[] = [
        { label: '下单时间', value: order.createdAt },
      ]
      if (order.paidAt) rows.push({ label: '支付时间', value: order.paidAt })
      if (order.paymentMethod) {
        rows.push({ label: '支付方式', value: order.paymentMethod })
      }
      if (order.remark) rows.push({ label: '订货单备注', value: order.remark })
      if (order.infoRows) rows.push(...order.infoRows)
      return rows
    },
    displayActions(): LingyunPurchaseOrderDetailAction[] {
      const order = this.order
      if (!order) return []
      if (Array.isArray(order.actions)) return order.actions
      return DEFAULT_ACTIONS[order.status] || []
    },
    canToggleItems(): boolean {
      return (this.order?.items?.length || 0) > 1
    },
    showItemPreview(): boolean {
      return this.canToggleItems && !this.itemsExpanded
    },
    itemPreviewThumbs(): LingyunPurchaseOrderDetailItem[] {
      return (this.order?.items || []).slice(0, this.thumbLimit())
    },
    itemExtraThumbCount(): number {
      const total = this.order?.items?.length || 0
      return Math.max(0, total - this.thumbLimit())
    },
    /** 这些进行中状态不显示底部操作栏；待付款例外，保留取消 / 去支付 */
    isInProgress(): boolean {
      const status = this.order?.status
      return (
        status === 'pendingShipment' ||
        status === 'shipped' ||
        status === 'refund'
      )
    },
    showActions(): boolean {
      return (
        !!this.order &&
        this.displayActions.length > 0 &&
        !this.isInProgress
      )
    },
  },
  methods: {
    startCountdown(): void {
      this.stopCountdown()
      this.paymentTimeoutNotified = false
      if (!this.order || this.order.status !== 'pendingPayment') return
      this.nowTs = Date.now()
      if (!this.paymentDeadline) return
      if (this.paymentRemainMs <= 0) {
        this.notifyPaymentTimeout()
        return
      }
      this.countdownTimer = setInterval(() => {
        this.nowTs = Date.now()
        if (this.paymentRemainMs <= 0) {
          this.stopCountdown()
          this.notifyPaymentTimeout()
        }
      }, 1000)
    },
    stopCountdown(): void {
      if (!this.countdownTimer) return
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    },
    notifyPaymentTimeout(): void {
      if (this.paymentTimeoutNotified || !this.order) return
      this.paymentTimeoutNotified = true
      const payload: LingyunPurchaseOrderDetailPaymentTimeoutPayload = {
        order: this.order,
      }
      this.$emit('payment-timeout', payload)
    },
    onBack(): void {
      this.$emit('back')
      if (!this.autoBack) return
      const pages =
        typeof getCurrentPages === 'function' ? getCurrentPages() : []
      if (pages.length > 1) uni.navigateBack()
    },
    /** 页面重新进入时回到顶部，避免 H5 恢复上一次的内部 scroll-view 位置 */
    resetScroll(): void {
      this.reportPageScroll(0)
      this.scrollIntoView = ''
      this.$nextTick(() => {
        this.scrollIntoView = 'lingyun-purchase-order-detail-top'
      })
    },
    reportPageScroll(top: number): void {
      const report = (this as unknown as {
        reportScroll?: (scrollTop: number) => void
      }).reportScroll
      if (typeof report === 'function') report(top)
    },
    onScroll(event: { detail?: { scrollTop?: number } }): void {
      const top = Number(event?.detail?.scrollTop)
      if (Number.isFinite(top) && top >= 0) this.reportPageScroll(top)
    },
    onScrollToUpper(): void {
      this.reportPageScroll(0)
    },
    formatAmount(amount: number | undefined): string {
      const value = Number(amount)
      if (!Number.isFinite(value)) return '0'
      const decimals = Number(this.priceDecimals)
      if (Number.isFinite(decimals) && decimals < 0) {
        return String(Number(value.toFixed(2)))
      }
      const fixed = Number.isFinite(decimals)
        ? Math.min(6, Math.max(0, Math.floor(decimals)))
        : 2
      return value.toFixed(fixed)
    },
    formatPrice(amount: number | undefined): string {
      return `${this.currency}${this.formatAmount(amount)}`
    },
    firstChar(name: string): string {
      return (name || '').trim().slice(0, 1) || '单'
    },
    isStepActive(step: LingyunPurchaseOrderDetailTimelineStep, index: number): boolean {
      return step.active !== undefined ? step.active : index === 0
    },
    subOrderItems(subOrder: LingyunPurchaseOrderDetailSubOrder): LingyunPurchaseOrderDetailItem[] {
      return subOrder.items || []
    },
    thumbLimit(): number {
      const value = Number(this.maxThumbnails)
      return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 3
    },
    subOrderVisibleThumbs(
      subOrder: LingyunPurchaseOrderDetailSubOrder,
    ): LingyunPurchaseOrderDetailItem[] {
      return this.subOrderItems(subOrder).slice(0, this.thumbLimit())
    },
    subOrderExtraThumbCount(subOrder: LingyunPurchaseOrderDetailSubOrder): number {
      return Math.max(
        0,
        this.subOrderItems(subOrder).length - this.thumbLimit(),
      )
    },
    subOrderItemsCount(subOrder: LingyunPurchaseOrderDetailSubOrder): number {
      return this.subOrderItems(subOrder).reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0,
      )
    },
    subOrderHasAmounts(subOrder: LingyunPurchaseOrderDetailSubOrder): boolean {
      return !!subOrder.amounts
    },
    subOrderTotal(subOrder: LingyunPurchaseOrderDetailSubOrder): number {
      const amounts = subOrder.amounts
      if (!amounts) return 0
      return amounts.paid !== undefined ? amounts.paid : amounts.payable
    },
    subOrderMeta(subOrder: LingyunPurchaseOrderDetailSubOrder): StatusMeta {
      const fallback = STATUS_META.pendingPayment
      const meta = STATUS_META[subOrder.status] || fallback
      return {
        ...meta,
        text: subOrder.statusText || meta.text,
        hint: subOrder.statusHint || meta.hint,
        icon: subOrder.statusIcon || meta.icon,
        color: subOrder.statusColor || meta.color,
      }
    },
    subOrderWarehouseLabel(subOrder: LingyunPurchaseOrderDetailSubOrder): string {
      const name = subOrder.warehouse?.name || ''
      return name ? `发货仓库：${name}` : ''
    },
    subOrderEstimateDate(subOrder: LingyunPurchaseOrderDetailSubOrder): string {
      if (
        subOrder.status !== 'pendingShipment' &&
        subOrder.status !== 'shipped'
      ) {
        return ''
      }
      return this.dateToken(subOrder.deliveryTime || '')
    },
    subOrderEstimate(subOrder: LingyunPurchaseOrderDetailSubOrder): string {
      const date = this.subOrderEstimateDate(subOrder)
      if (!date) return ''
      const label = subOrder.status === 'pendingShipment' ? '发货' : '送达'
      return `预计 ${date} ${label}`
    },
    /** 从展示时间中只取日期，去掉时分；无法识别日期时返回空 */
    dateToken(value: string): string {
      const raw = String(value || '').trim().replace(/^预计\s*/, '')
      const match = raw.match(
        /^(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}|\d{1,2}月\d{1,2}日)/,
      )
      if (match) return match[1]
      const relative = raw.match(/^(今天|昨天|明天|后天)/)
      return relative ? relative[1] : ''
    },
    /** 把时间线里的展示时间补成可解析的完整日期，交给 lingyun-date-text */
    subOrderLogTimeValue(subOrder: LingyunPurchaseOrderDetailSubOrder): string {
      const raw = String(this.latestSubStep(subOrder)?.time || '').trim()
      if (!raw) return ''
      if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(raw)) return raw
      if (/^\d{1,2}[-/.]\d{1,2}/.test(raw)) {
        return `${new Date().getFullYear()}-${raw}`
      }
      const relative = raw.match(/^(今天|昨天|明天)\s*(.*)$/)
      if (relative) {
        const offset =
          relative[1] === '今天' ? 0 : relative[1] === '昨天' ? -1 : 1
        const date = new Date()
        date.setDate(date.getDate() + offset)
        const ymd = `${date.getFullYear()}-${this.pad2(date.getMonth() + 1)}-${this.pad2(date.getDate())}`
        return relative[2] ? `${ymd} ${relative[2]}` : ymd
      }
      return raw
    },
    /** 相对日期文案也显示月-日，保证始终是 MM-DD HH:mm */
    subOrderLogMonthDay(subOrder: LingyunPurchaseOrderDetailSubOrder): string {
      const match = this.subOrderLogTimeValue(subOrder).match(
        /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/,
      )
      if (!match) return ''
      return `${this.pad2(Number(match[2]))}-${this.pad2(Number(match[3]))}`
    },
    pad2(value: number): string {
      return value < 10 ? `0${value}` : String(value)
    },
    latestSubStep(
      subOrder: LingyunPurchaseOrderDetailSubOrder,
    ): LingyunPurchaseOrderDetailTimelineStep | null {
      /* 时间线按新到旧排列，只取最后一条（最新）日志 */
      return (subOrder.timeline || [])[0] || null
    },
    actionVariantIn(
      action: LingyunPurchaseOrderDetailAction,
      index: number,
      list: LingyunPurchaseOrderDetailAction[],
    ): string {
      if (action.variant) return action.variant
      return index === list.length - 1 ? 'borderedProminent' : 'bordered'
    },
    actionVariant(
      action: LingyunPurchaseOrderDetailAction,
      index: number,
    ): string {
      return this.actionVariantIn(action, index, this.displayActions)
    },
    onSubPurchaseOrderClick(subOrder: LingyunPurchaseOrderDetailSubOrder): void {
      if (!this.order) return
      const payload: LingyunPurchaseOrderDetailSubOrderPayload = {
        order: this.order,
        subOrder,
      }
      this.$emit('sub-purchase-order-click', payload)
    },
    onAction(action: LingyunPurchaseOrderDetailAction): void {
      if (!this.order || action.disabled) return
      const payload: LingyunPurchaseOrderDetailActionPayload = {
        key: action.key,
        action,
        order: this.order,
      }
      this.$emit('action', payload)
    },
    toggleItems(): void {
      this.itemsExpanded = !this.itemsExpanded
    },
    onItemClick(item: LingyunPurchaseOrderDetailItem, index: number): void {
      if (!this.order) return
      const payload: LingyunPurchaseOrderDetailItemPayload = {
        item,
        index,
        order: this.order,
      }
      this.$emit('item-click', payload)
    },
    copyTrackingNumber(): void {
      this.copyText(this.order?.trackingNumber || '')
    },
    copyOrderNumber(): void {
      this.copyText(this.order?.number || '')
    },
    copyText(text: string): void {
      if (!text) return
      const payload: LingyunPurchaseOrderDetailCopyPayload = { text }
      try {
        uni.setClipboardData({
          data: text,
          complete: () => this.$emit('copy', payload),
        })
      } catch {
        this.$emit('copy', payload)
      }
    },
  },
})
</script>

<style lang="scss">
@import '../../../lingyun-ui/styles/variables.scss';

.lingyun-purchase-order-detail {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  box-sizing: border-box;
  background-color: var(--lingyun-bg-grouped-primary, #{$lingyun-bg-grouped-primary});
}

.lingyun-purchase-order-detail__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.lingyun-purchase-order-detail__scroll {
  height: 100%;
}

.lingyun-purchase-order-detail__anchor {
  height: 0;
}

.lingyun-purchase-order-detail__top-space {
  height: calc(
    var(--lingyun-app-page-bar, 60px) + var(--lingyun-page-nav-safe-top, 0px)
  );
}

.lingyun-purchase-order-detail__content {
  box-sizing: border-box;
  max-width: 720px;
  margin: 0 auto;
  padding: 8px 16px 24px;
}

.lingyun-purchase-order-detail__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 96px 24px;
  box-sizing: border-box;
}

.lingyun-purchase-order-detail__state--empty {
  padding-top: 72px;
}

.lingyun-purchase-order-detail__state-text {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

/* ---------- 状态头 ---------- */

.lingyun-purchase-order-detail__status {
  margin-bottom: 4px;
  padding: 16px;
  border-radius: 20px;
  box-sizing: border-box;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}

.lingyun-purchase-order-detail__status-main {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
}

.lingyun-purchase-order-detail__status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 14px;
}

.lingyun-purchase-order-detail__status-text {
  flex: 1;
  min-width: 0;
  padding-top: 1px;
}

.lingyun-purchase-order-detail__status-title {
  display: block;
  font-size: 20px;
  line-height: 26px;
  font-weight: 700;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-detail__status-hint {
  display: block;
  margin-top: 3px;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__status-countdown {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  line-height: 18px;
  font-weight: 600;
  color: var(--lingyun-system-orange, #ff8d28);
}

.lingyun-purchase-order-detail__status-amount {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-purchase-order-detail__status-amount-label {
  font-size: 12px;
  line-height: 16px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__status-amount-value {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 1px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-detail__status-currency {
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
}

.lingyun-purchase-order-detail__status-number {
  font-size: 20px;
  line-height: 26px;
  font-weight: 700;
}

/* ---------- 通用卡片 ---------- */

.lingyun-purchase-order-detail__card {
  box-sizing: border-box;
  border-radius: 20px;
  background-color: var(--lingyun-bg-grouped-secondary, #{$lingyun-bg-grouped-secondary});
}

.lingyun-purchase-order-detail__card--hover {
  opacity: 0.92;
}

/* ---------- 配送 / 自提 ---------- */

.lingyun-purchase-order-detail__address {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.lingyun-purchase-order-detail__address-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-purchase-order-detail__address-body {
  flex: 1;
  min-width: 0;
}

.lingyun-purchase-order-detail__address-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.lingyun-purchase-order-detail__address-name {
  flex-shrink: 0;
  font-size: 15px;
  line-height: 22px;
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-detail__address-phone {
  flex-shrink: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__address-main {
  display: block;
  margin-top: 2px;
  font-size: 14px;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-detail__address-meta {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

/* ---------- 子订货单 / 多批配送 ---------- */

.lingyun-purchase-order-detail__sub {
  margin-bottom: 12px;
  padding: 16px;
}

.lingyun-purchase-order-detail__sub--hover {
  opacity: 0.92;
}

.lingyun-purchase-order-detail__sub-meta {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  margin-top: 1px;
}

.lingyun-purchase-order-detail__sub-warehouse {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  word-break: break-all;
}

.lingyun-purchase-order-detail__sub-estimate {
  flex-shrink: 0;
  margin-left: auto;
  font-size: 11px;
  line-height: 16px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
  text-align: right;
}

.lingyun-purchase-order-detail__sub-latest {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-purchase-order-detail__sub-latest-log {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.lingyun-purchase-order-detail__sub-latest-desc {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
  word-break: break-word;
}

.lingyun-purchase-order-detail__sub-latest-time {
  flex-shrink: 0;
  padding-top: 1px;
  text-align: right;
}

.lingyun-purchase-order-detail__sub-empty {
  display: block;
  margin-top: 10px;
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
}

.lingyun-purchase-order-detail__sub-more {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  margin-top: 10px;
}

.lingyun-purchase-order-detail__sub-more-text {
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-system-blue, #{$lingyun-system-blue});
}

.lingyun-purchase-order-detail__sub-head {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.lingyun-purchase-order-detail__sub-head-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.lingyun-purchase-order-detail__sub-number {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-detail__sub-status {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
}

.lingyun-purchase-order-detail__sub-media {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  margin-top: 10px;
}

.lingyun-purchase-order-detail__sub-thumbs {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.lingyun-purchase-order-detail__sub-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 10px;
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-purchase-order-detail__sub-thumb-img {
  display: block;
  width: 100%;
  height: 100%;
}

.lingyun-purchase-order-detail__sub-thumb-fallback {
  font-size: 20px;
  font-weight: 600;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__sub-thumb-more {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 9px;
  flex-shrink: 0;
  border-radius: 14px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  font-size: 12px;
  line-height: 28px;
  font-weight: 600;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__sub-totals {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
  margin-left: auto;
}

.lingyun-purchase-order-detail__sub-count {
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__sub-total {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: var(--lingyun-label, #{$lingyun-label});
}

/* ---------- 商品 ---------- */

.lingyun-purchase-order-detail__items {
  padding: 4px 16px;
}

.lingyun-purchase-order-detail__items-preview {
  padding: 10px 0 4px;
}

.lingyun-purchase-order-detail__items-thumbs {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.lingyun-purchase-order-detail__items-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 10px;
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-purchase-order-detail__items-thumb-img {
  display: block;
  width: 100%;
  height: 100%;
}

.lingyun-purchase-order-detail__items-thumb-fallback {
  font-size: 20px;
  font-weight: 600;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__items-thumb-more {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 9px;
  flex-shrink: 0;
  border-radius: 14px;
  background-color: var(--lingyun-fill-tertiary, #{$lingyun-fill-tertiary});
  font-size: 12px;
  line-height: 28px;
  font-weight: 600;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__items-toggle {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 4px;
  padding: 10px 0 6px;
  border-top: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-purchase-order-detail__items-toggle--hover {
  opacity: 0.7;
}

.lingyun-purchase-order-detail__items-toggle-text {
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-primary, #{$lingyun-primary});
}

.lingyun-purchase-order-detail__item {
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 12px 0;
}

.lingyun-purchase-order-detail__item--divided {
  border-top: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-purchase-order-detail__item--hover {
  opacity: 0.9;
}

.lingyun-purchase-order-detail__item-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 12px;
  background-color: var(--lingyun-fill-secondary, #{$lingyun-fill-secondary});
}

.lingyun-purchase-order-detail__item-image-img {
  display: block;
  width: 100%;
  height: 100%;
}

.lingyun-purchase-order-detail__item-image-fallback {
  font-size: 24px;
  font-weight: 600;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__item-body {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.lingyun-purchase-order-detail__item-title-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
}

.lingyun-purchase-order-detail__item-name {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  line-height: 21px;
  font-weight: 500;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-detail__item-spec {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__item-bottom {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 6px;
}

.lingyun-purchase-order-detail__item-price {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 2px;
  min-width: 0;
}

.lingyun-purchase-order-detail__item-currency {
  font-size: 11px;
  line-height: 16px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-detail__item-amount {
  font-size: 15px;
  line-height: 20px;
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-detail__item-original {
  margin-left: 6px;
  font-size: 11px;
  line-height: 16px;
  color: var(--lingyun-label-tertiary, #{$lingyun-label-tertiary});
  text-decoration: line-through;
}

.lingyun-purchase-order-detail__item-qty {
  flex-shrink: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

/* ---------- 金额 ---------- */

.lingyun-purchase-order-detail__amounts {
  padding: 6px 16px;
}

.lingyun-purchase-order-detail__amount-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  gap: 12px;
}

.lingyun-purchase-order-detail__amount-label {
  font-size: 14px;
  line-height: 22px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__amount-value {
  font-size: 14px;
  line-height: 22px;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-detail__amount-row--total {
  min-height: 42px;
  margin-top: 4px;
  padding-top: 6px;
  border-top: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-purchase-order-detail__amount-row--total .lingyun-purchase-order-detail__amount-label {
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-detail__amount-row--total .lingyun-purchase-order-detail__amount-value {
  font-size: 18px;
  line-height: 26px;
  font-weight: 700;
}

/* ---------- 物流 ---------- */

.lingyun-purchase-order-detail__timeline {
  padding: 12px 16px 6px;
}

.lingyun-purchase-order-detail__logistics-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 2px;
}

.lingyun-purchase-order-detail__logistics-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 24px;
}

.lingyun-purchase-order-detail__logistics-label {
  flex-shrink: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__logistics-value {
  flex: 1;
  min-width: 0;
  text-align: right;
  font-size: 13px;
  line-height: 18px;
  color: var(--lingyun-label, #{$lingyun-label});
  word-break: break-all;
}

.lingyun-purchase-order-detail__logistics-value-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.lingyun-purchase-order-detail__logistics-copy {
  flex-shrink: 0;
}

.lingyun-purchase-order-detail__logistics-copy-text {
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-system-blue, #{$lingyun-system-blue});
}

.lingyun-purchase-order-detail__logistics-timeline--divided {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-purchase-order-detail__step {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.lingyun-purchase-order-detail__step-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12px;
  flex-shrink: 0;
}

.lingyun-purchase-order-detail__step-dot {
  width: 8px;
  height: 8px;
  margin-top: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--lingyun-separator-opaque, #{$lingyun-separator-opaque});
}

.lingyun-purchase-order-detail__step-dot--active {
  width: 10px;
  height: 10px;
  margin-top: 5px;
  background-color: var(--lingyun-system-blue, #{$lingyun-system-blue});
  box-shadow: 0 0 0 3px rgba(0, 136, 255, 0.12);
}

.lingyun-purchase-order-detail__step-line {
  width: 1px;
  flex: 1;
  min-height: 24px;
  margin-top: 4px;
  background-color: var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-purchase-order-detail__step-body {
  flex: 1;
  min-width: 0;
  padding-bottom: 14px;
}

.lingyun-purchase-order-detail__step-head {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.lingyun-purchase-order-detail__step-title {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-detail__step-title--active {
  font-weight: 600;
}

.lingyun-purchase-order-detail__step-time {
  flex-shrink: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__step-desc {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

/* ---------- 订货单信息 ---------- */

.lingyun-purchase-order-detail__info {
  padding: 4px 16px;
}

.lingyun-purchase-order-detail__info-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
}

.lingyun-purchase-order-detail__info-row--divided {
  border-top: 0.5px solid var(--lingyun-separator, #{$lingyun-separator});
}

.lingyun-purchase-order-detail__info-label {
  flex-shrink: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__info-value-row {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.lingyun-purchase-order-detail__info-value {
  min-width: 0;
  text-align: right;
  font-size: 13px;
  line-height: 20px;
  color: var(--lingyun-label, #{$lingyun-label});
  word-break: break-all;
}

.lingyun-purchase-order-detail__info-copy {
  flex-shrink: 0;
  padding: 2px 0 2px 4px;
}

.lingyun-purchase-order-detail__info-copy-text {
  font-size: 12px;
  line-height: 18px;
  color: var(--lingyun-system-blue, #{$lingyun-system-blue});
}

/* ---------- 底部操作栏：悬浮玻璃胶囊 ---------- */

.lingyun-purchase-order-detail__actions {
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
}

.lingyun-purchase-order-detail__actions-inner {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 10px;
  width: 100%;
  min-height: 62px;
  max-width: 720px;
  margin: 0 auto;
  padding: 8px 12px;
  box-sizing: border-box;
  @include lingyun-glass-control;
  border-radius: 31px;
}

.lingyun-purchase-order-detail__actions-total {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.lingyun-purchase-order-detail__actions-total-label {
  font-size: 11px;
  line-height: 14px;
  color: var(--lingyun-label-secondary, #{$lingyun-label-secondary});
}

.lingyun-purchase-order-detail__actions-amount {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 1px;
}

.lingyun-purchase-order-detail__actions-currency {
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-detail__actions-number {
  font-size: 22px;
  line-height: 28px;
  font-weight: 600;
  color: var(--lingyun-label, #{$lingyun-label});
}

.lingyun-purchase-order-detail__actions-buttons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
}
</style>
