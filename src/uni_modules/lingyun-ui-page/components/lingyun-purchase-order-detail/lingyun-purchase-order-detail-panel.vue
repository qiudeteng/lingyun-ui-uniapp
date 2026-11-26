<template>
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
        v-if="scrollUnderToolbar || topSpace > 0"
        class="lingyun-purchase-order-detail__top-space"
        :style="topSpace > 0 ? { height: `${topSpace}px` } : undefined"
      />
      <view v-if="loading" class="lingyun-purchase-order-detail__state">
        <lingyun-activity-indicator size="large" />
        <text class="lingyun-purchase-order-detail__state-text">{{ loadingText }}</text>
      </view>

      <view v-else-if="!order" class="lingyun-purchase-order-detail__state lingyun-purchase-order-detail__state--empty">
        <lingyun-empty variant="plain" :title="emptyText" />
      </view>

      <view
        v-else
        class="lingyun-purchase-order-detail__content"
        :class="{ 'lingyun-purchase-order-detail__content--with-actions': showActions }"
      >
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
                  <lingyun-image
                    v-if="item.image"
                    :src="item.image"
                    mode="aspectFill"
                    :width="52"
                    :height="52"
                    :radius="10"
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
                    <lingyun-image
                      v-if="item.image"
                      :src="item.image"
                      mode="aspectFill"
                      :width="52"
                      :height="52"
                      :radius="10"
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
                  <lingyun-image
                    v-if="item.image"
                    :src="item.image"
                    mode="aspectFill"
                    :width="72"
                    :height="72"
                    :radius="12"
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
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { type PropType } from 'vue'
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
 * @see doc/page/purchase-order-detail.md
 */
defineOptions({
  name: 'LingyunPurchaseOrderDetailPanel',
})

const props = defineProps({
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
  /** 分栏面板模式：顶部占位高度 px（浮层 toolbar 的高度）；0 用页面壳的 --lingyun-app-page-bar */
  topSpace: { type: Number, default: 0 },
})

const emit = defineEmits([
  'back',
  'action',
  'item-click',
  'sub-purchase-order-click',
  'copy',
  'payment-timeout',
  'scroll',
])

const reportScroll = useLingyunAppPageScroll()

const scrollIntoView = ref('')
const itemsExpanded = ref(false)
const nowTs = ref(Date.now())
const countdownTimer = ref<ReturnType<typeof setInterval> | null>(null)
const paymentTimeoutNotified = ref(false)

/* 以下纯工具函数被 computed 引用，必须先声明 */

function formatAmount(amount: number | undefined): string {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '0'
  const decimals = Number(props.priceDecimals)
  if (Number.isFinite(decimals) && decimals < 0) {
    return String(Number(value.toFixed(2)))
  }
  const fixed = Number.isFinite(decimals)
    ? Math.min(6, Math.max(0, Math.floor(decimals)))
    : 2
  return value.toFixed(fixed)
}

function formatPrice(amount: number | undefined): string {
  return `${props.currency}${formatAmount(amount)}`
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function firstChar(name: string): string {
  return (name || '').trim().slice(0, 1) || '单'
}

function thumbLimit(): number {
  const value = Number(props.maxThumbnails)
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 3
}

/** 从展示时间中只取日期，去掉时分；无法识别日期时返回空 */
function dateToken(value: string): string {
  const raw = String(value || '').trim().replace(/^预计\s*/, '')
  const match = raw.match(
    /^(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}|\d{1,2}月\d{1,2}日)/,
  )
  if (match) return match[1]
  const relative = raw.match(/^(今天|昨天|明天|后天)/)
  return relative ? relative[1] : ''
}

function latestSubStep(
  subOrder: LingyunPurchaseOrderDetailSubOrder,
): LingyunPurchaseOrderDetailTimelineStep | null {
  /* 时间线按新到旧排列，只取最后一条（最新）日志 */
  return (subOrder.timeline || [])[0] || null
}

const statusMeta = computed((): StatusMeta => {
  const fallback = STATUS_META.pendingPayment
  if (!props.order) return fallback
  const meta = STATUS_META[props.order.status] || fallback
  return {
    ...meta,
    text: props.order.statusText || meta.text,
    hint: props.order.statusHint || meta.hint,
    icon: props.order.statusIcon || meta.icon,
    color: props.order.statusColor || meta.color,
  }
})

const statusCardStyle = computed((): Record<string, string> => {
  return {
    background: `linear-gradient(135deg, ${statusMeta.value.tint} 0%, rgba(255, 255, 255, 0) 66%), var(--lingyun-bg-grouped-secondary, #ffffff)`,
  }
})

const totalAmount = computed((): number => {
  const amounts = props.order?.amounts
  if (!amounts) return 0
  return amounts.paid !== undefined ? amounts.paid : amounts.payable
})

const totalLabel = computed((): string => {
  if (!props.order) return ''
  if (props.order.status === 'pendingPayment') {
    return '需付款'
  }
  if (props.order.status === 'cancelled') return '订货单金额'
  return '实付款'
})

const paymentDeadline = computed((): number => {
  if (!props.order || props.order.status !== 'pendingPayment') return 0
  const created = parseLingyunDate(props.order.createdAt)
  if (!created) return 0
  const minutes = Number(props.paymentTimeoutMinutes)
  const timeout = Number.isFinite(minutes) ? Math.max(1, minutes) : 15
  return created.getTime() + timeout * 60 * 1000
})

const paymentRemainMs = computed((): number => {
  if (!paymentDeadline.value) return 0
  return Math.max(0, paymentDeadline.value - nowTs.value)
})

const paymentExpired = computed((): boolean => {
  return paymentDeadline.value > 0 && paymentRemainMs.value <= 0
})

const paymentCountdownText = computed((): string => {
  if (
    !props.order ||
    props.order.status !== 'pendingPayment' ||
    !paymentDeadline.value
  ) {
    return ''
  }
  if (paymentExpired.value) return ''
  const total = Math.floor(paymentRemainMs.value / 1000)
  return `支付剩余 ${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`
})

const deliveryType = computed((): LingyunPurchaseOrderDetailDeliveryType | '' => {
  const order = props.order
  if (!order) return ''
  if (order.deliveryType) return order.deliveryType
  if (order.receiver) return 'delivery'
  if (order.pickup) return 'pickup'
  return ''
})

const hasAddress = computed((): boolean => {
  if (!props.order) return false
  return deliveryType.value === 'delivery'
    ? !!props.order.receiver
    : deliveryType.value === 'pickup'
      ? !!props.order.pickup
      : false
})

const addressTitle = computed((): string => {
  return deliveryType.value === 'pickup' ? '自提信息' : '配送信息'
})

const addressName = computed((): string => {
  if (!props.order) return ''
  if (deliveryType.value === 'pickup') return props.order.pickup?.storeName || ''
  return props.order.receiver?.name || ''
})

const addressPhone = computed((): string => {
  if (!props.order) return ''
  if (deliveryType.value === 'pickup') return props.order.pickup?.phone || ''
  return props.order.receiver?.phone || ''
})

const addressMain = computed((): string => {
  if (!props.order) return ''
  if (deliveryType.value === 'pickup') return props.order.pickup?.address || ''
  return props.order.receiver?.address || ''
})

const addressMeta = computed((): string => {
  if (!props.order) return ''
  if (deliveryType.value === 'pickup') return props.order.pickup?.time || ''
  return props.order.deliveryTime || ''
})

const hasSubOrders = computed((): boolean => {
  return !!(props.order?.subOrders && props.order.subOrders.length)
})

/** 付款 / 审核前不展示预计送达时间 */
const showAddressMeta = computed((): boolean => {
  if (!addressMeta.value) return false
  if (deliveryType.value === 'pickup') return true
  if (hasSubOrders.value) return false
  return (
    props.order?.status !== 'pendingReview' &&
    props.order?.status !== 'pendingPayment'
  )
})

const itemsTitle = computed((): string => {
  const count = (props.order?.items || []).reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  )
  return count > 0 ? `商品清单 · 共 ${count} 件` : '商品清单'
})

const amountRows = computed((): AmountRow[] => {
  const order = props.order
  if (!order) return []
  const amounts = order.amounts
  const rows: AmountRow[] = [
    { key: 'goods', label: '商品合计', value: formatPrice(amounts.goodsTotal) },
  ]
  if (amounts.deliveryFee && amounts.deliveryFee > 0) {
    rows.push({
      key: 'delivery',
      label: '配送费',
      value: formatPrice(amounts.deliveryFee),
    })
  }
  if (amounts.discount && amounts.discount > 0) {
    rows.push({
      key: 'discount',
      label: '优惠',
      value: `-${formatPrice(amounts.discount)}`,
    })
  }
  if (amounts.coupon && amounts.coupon > 0) {
    rows.push({
      key: 'coupon',
      label: '优惠券',
      value: `-${formatPrice(amounts.coupon)}`,
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
    value: formatPrice(paid !== undefined ? paid : amounts.payable),
    emphasis: true,
  })
  return rows
})

const timelineSteps = computed((): LingyunPurchaseOrderDetailTimelineStep[] => {
  return props.order?.timeline || []
})

/** 审核前没有物流进度：待审核 / 待付款不显示时间线 */
const showTimeline = computed((): boolean => {
  if (!props.order || !timelineSteps.value.length) return false
  return (
    props.order.status !== 'pendingReview' &&
    props.order.status !== 'pendingPayment'
  )
})

const showLogistics = computed((): boolean => {
  return (
    showTimeline.value ||
    !!props.order?.carrier ||
    !!props.order?.trackingNumber
  )
})

const subOrders = computed((): LingyunPurchaseOrderDetailSubOrder[] => {
  return props.order?.subOrders || []
})

const orderInfoRows = computed((): LingyunPurchaseOrderDetailInfoRow[] => {
  const order = props.order
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
})

const displayActions = computed((): LingyunPurchaseOrderDetailAction[] => {
  const order = props.order
  if (!order) return []
  if (Array.isArray(order.actions)) return order.actions
  return DEFAULT_ACTIONS[order.status] || []
})

const canToggleItems = computed((): boolean => {
  return (props.order?.items?.length || 0) > 1
})

const showItemPreview = computed((): boolean => {
  return canToggleItems.value && !itemsExpanded.value
})

const itemPreviewThumbs = computed((): LingyunPurchaseOrderDetailItem[] => {
  return (props.order?.items || []).slice(0, thumbLimit())
})

const itemExtraThumbCount = computed((): number => {
  const total = props.order?.items?.length || 0
  return Math.max(0, total - thumbLimit())
})

/** 这些进行中状态不显示底部操作栏；待付款例外，保留取消 / 去支付 */
const isInProgress = computed((): boolean => {
  const status = props.order?.status
  return (
    status === 'pendingShipment' ||
    status === 'shipped' ||
    status === 'refund'
  )
})

const showActions = computed((): boolean => {
  return (
    !!props.order &&
    displayActions.value.length > 0 &&
    !isInProgress.value
  )
})

function stopCountdown(): void {
  if (!countdownTimer.value) return
  clearInterval(countdownTimer.value)
  countdownTimer.value = null
}

function notifyPaymentTimeout(): void {
  if (paymentTimeoutNotified.value || !props.order) return
  paymentTimeoutNotified.value = true
  const payload: LingyunPurchaseOrderDetailPaymentTimeoutPayload = {
    order: props.order,
  }
  emit('payment-timeout', payload)
}

function startCountdown(): void {
  stopCountdown()
  paymentTimeoutNotified.value = false
  if (!props.order || props.order.status !== 'pendingPayment') return
  nowTs.value = Date.now()
  if (!paymentDeadline.value) return
  if (paymentRemainMs.value <= 0) {
    notifyPaymentTimeout()
    return
  }
  countdownTimer.value = setInterval(() => {
    nowTs.value = Date.now()
    if (paymentRemainMs.value <= 0) {
      stopCountdown()
      notifyPaymentTimeout()
    }
  }, 1000)
}

function reportPageScroll(top: number): void {
  reportScroll(top)
}

/** 页面重新进入时回到顶部，避免 H5 恢复上一次的内部 scroll-view 位置 */
function resetScroll(): void {
  reportPageScroll(0)
  scrollIntoView.value = ''
  nextTick(() => {
    scrollIntoView.value = 'lingyun-purchase-order-detail-top'
  })
}

function onScroll(event: { detail?: { scrollTop?: number } }): void {
  const top = Number(event?.detail?.scrollTop)
  if (Number.isFinite(top) && top >= 0) {
    reportPageScroll(top)
    emit('scroll', top)
  }
}

function onScrollToUpper(): void {
  reportPageScroll(0)
}

function onBack(): void {
  emit('back')
  if (!props.autoBack) return
  const pages =
    typeof getCurrentPages === 'function' ? getCurrentPages() : []
  if (pages.length > 1) uni.navigateBack()
}

function isStepActive(step: LingyunPurchaseOrderDetailTimelineStep, index: number): boolean {
  return step.active !== undefined ? step.active : index === 0
}

function subOrderItems(subOrder: LingyunPurchaseOrderDetailSubOrder): LingyunPurchaseOrderDetailItem[] {
  return subOrder.items || []
}

function subOrderVisibleThumbs(
  subOrder: LingyunPurchaseOrderDetailSubOrder,
): LingyunPurchaseOrderDetailItem[] {
  return subOrderItems(subOrder).slice(0, thumbLimit())
}

function subOrderExtraThumbCount(subOrder: LingyunPurchaseOrderDetailSubOrder): number {
  return Math.max(
    0,
    subOrderItems(subOrder).length - thumbLimit(),
  )
}

function subOrderItemsCount(subOrder: LingyunPurchaseOrderDetailSubOrder): number {
  return subOrderItems(subOrder).reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  )
}

function subOrderHasAmounts(subOrder: LingyunPurchaseOrderDetailSubOrder): boolean {
  return !!subOrder.amounts
}

function subOrderTotal(subOrder: LingyunPurchaseOrderDetailSubOrder): number {
  const amounts = subOrder.amounts
  if (!amounts) return 0
  return amounts.paid !== undefined ? amounts.paid : amounts.payable
}

function subOrderMeta(subOrder: LingyunPurchaseOrderDetailSubOrder): StatusMeta {
  const fallback = STATUS_META.pendingPayment
  const meta = STATUS_META[subOrder.status] || fallback
  return {
    ...meta,
    text: subOrder.statusText || meta.text,
    hint: subOrder.statusHint || meta.hint,
    icon: subOrder.statusIcon || meta.icon,
    color: subOrder.statusColor || meta.color,
  }
}

function subOrderWarehouseLabel(subOrder: LingyunPurchaseOrderDetailSubOrder): string {
  const name = subOrder.warehouse?.name || ''
  return name ? `发货仓库：${name}` : ''
}

function subOrderEstimateDate(subOrder: LingyunPurchaseOrderDetailSubOrder): string {
  if (
    subOrder.status !== 'pendingShipment' &&
    subOrder.status !== 'shipped'
  ) {
    return ''
  }
  return dateToken(subOrder.deliveryTime || '')
}

function subOrderEstimate(subOrder: LingyunPurchaseOrderDetailSubOrder): string {
  const date = subOrderEstimateDate(subOrder)
  if (!date) return ''
  const label = subOrder.status === 'pendingShipment' ? '发货' : '送达'
  return `预计 ${date} ${label}`
}

/** 把时间线里的展示时间补成可解析的完整日期，交给 lingyun-date-text */
function subOrderLogTimeValue(subOrder: LingyunPurchaseOrderDetailSubOrder): string {
  const raw = String(latestSubStep(subOrder)?.time || '').trim()
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
    const ymd = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
    return relative[2] ? `${ymd} ${relative[2]}` : ymd
  }
  return raw
}

/** 相对日期文案也显示月-日，保证始终是 MM-DD HH:mm */
function subOrderLogMonthDay(subOrder: LingyunPurchaseOrderDetailSubOrder): string {
  const match = subOrderLogTimeValue(subOrder).match(
    /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/,
  )
  if (!match) return ''
  return `${pad2(Number(match[2]))}-${pad2(Number(match[3]))}`
}

function actionVariantIn(
  action: LingyunPurchaseOrderDetailAction,
  index: number,
  list: LingyunPurchaseOrderDetailAction[],
): string {
  if (action.variant) return action.variant
  return index === list.length - 1 ? 'borderedProminent' : 'bordered'
}

function actionVariant(
  action: LingyunPurchaseOrderDetailAction,
  index: number,
): string {
  return actionVariantIn(action, index, displayActions.value)
}

function onSubPurchaseOrderClick(subOrder: LingyunPurchaseOrderDetailSubOrder): void {
  if (!props.order) return
  const payload: LingyunPurchaseOrderDetailSubOrderPayload = {
    order: props.order,
    subOrder,
  }
  emit('sub-purchase-order-click', payload)
}

function onAction(action: LingyunPurchaseOrderDetailAction): void {
  if (!props.order || action.disabled) return
  const payload: LingyunPurchaseOrderDetailActionPayload = {
    key: action.key,
    action,
    order: props.order,
  }
  emit('action', payload)
}

function toggleItems(): void {
  itemsExpanded.value = !itemsExpanded.value
}

function onItemClick(item: LingyunPurchaseOrderDetailItem, index: number): void {
  if (!props.order) return
  const payload: LingyunPurchaseOrderDetailItemPayload = {
    item,
    index,
    order: props.order,
  }
  emit('item-click', payload)
}

function copyText(text: string): void {
  if (!text) return
  const payload: LingyunPurchaseOrderDetailCopyPayload = { text }
  try {
    uni.setClipboardData({
      data: text,
      complete: () => emit('copy', payload),
    })
  } catch {
    emit('copy', payload)
  }
}

function copyTrackingNumber(): void {
  copyText(props.order?.trackingNumber || '')
}

function copyOrderNumber(): void {
  copyText(props.order?.number || '')
}

watch(
  () => props.order?.number,
  () => {
    resetScroll()
    itemsExpanded.value = false
    startCountdown()
  },
)

watch(
  () => props.order?.status,
  () => {
    startCountdown()
  },
)

onMounted(() => {
  resetScroll()
  startCountdown()
})

onBeforeUnmount(() => {
  stopCountdown()
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
  /* 小程序：flex + height:0 才能给内层 scroll-view 定高，百分比高度会被内容撑开、整页滚动 */
  height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lingyun-purchase-order-detail__scroll {
  flex: 1;
  min-height: 0;
  height: 0;
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

/* 有悬浮操作栏时，滚动内容尾部留出胶囊高度，最后一块卡片可以完整滚出 */
.lingyun-purchase-order-detail__content--with-actions {
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
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

/* 底部操作栏：悬浮玻璃胶囊浮在滚动内容上方（不再占一条实底栏的高度），
   内容从下方穿过，玻璃能透出滚动内容 */
.lingyun-purchase-order-detail__actions {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  box-sizing: border-box;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  pointer-events: none;
}

.lingyun-purchase-order-detail__actions-inner {
  pointer-events: auto;
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
