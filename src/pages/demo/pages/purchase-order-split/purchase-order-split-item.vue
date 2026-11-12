<template>
  <lingyun-purchase-order-detail
    :order="order"
    :title="pageTitle"
    :show-back="true"
    :show-theme-switch="isSubOrder ? false : 'auto'"
    @action="onAction"
    @item-click="onItemClick"
    @sub-purchase-order-click="onSubPurchaseOrderClick"
    @copy="onCopy"
    @payment-timeout="onPaymentTimeout"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { findDemoPurchaseOrder } from './purchaseOrderDemo'
  import { buildLingyunPurchaseOrderSubDetail } from '@/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-detail/subPurchaseOrder'
  import type {
    LingyunPurchaseOrderDetailActionPayload,
    LingyunPurchaseOrderDetailCopyPayload,
    LingyunPurchaseOrderDetailItemPayload,
    LingyunPurchaseOrderDetailOrder,
    LingyunPurchaseOrderDetailPaymentTimeoutPayload,
    LingyunPurchaseOrderDetailSubOrderPayload,
  } from '@/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-detail/types'

  /** 订货单列表与详情：窄屏（< 900）点卡片进入的独立详情页，也承载子订货单详情 */
  const order = ref<LingyunPurchaseOrderDetailOrder>(findDemoPurchaseOrder())
  const pageTitle = ref('订货单详情')
  const isSubOrder = ref(false)

  onLoad((query?: Record<string, string | undefined>) => {
    const number = String(query?.number || '')
    const subKey = String(query?.sub || '')
    const parent = findDemoPurchaseOrder(number)
    const subOrder = subKey ? (parent.subOrders || []).find((item) => item.key === subKey) : undefined
    if (subOrder) {
      order.value = buildLingyunPurchaseOrderSubDetail(parent, subOrder)
      pageTitle.value = '子订货单详情'
      isSubOrder.value = true
      return
    }
    order.value = parent
    pageTitle.value = '订货单详情'
    isSubOrder.value = false
  })

  function onAction(payload: LingyunPurchaseOrderDetailActionPayload): void {
    uni.showToast({ title: payload.action.text, icon: 'none' })
  }

  function onItemClick(payload: LingyunPurchaseOrderDetailItemPayload): void {
    uni.showToast({ title: payload.item.name, icon: 'none' })
  }

  function onSubPurchaseOrderClick(payload: LingyunPurchaseOrderDetailSubOrderPayload): void {
    uni.navigateTo({
      url: `/pages/demo/pages/purchase-order-split/purchase-order-split-item?number=${encodeURIComponent(payload.order.number)}&sub=${encodeURIComponent(payload.subOrder.key)}`,
    })
  }

  function onPaymentTimeout(payload: LingyunPurchaseOrderDetailPaymentTimeoutPayload): void {
    if (payload.order.number !== order.value.number) return
    order.value = { ...order.value, status: 'cancelled' }
    uni.showToast({ title: '订货单已超时取消', icon: 'none' })
  }

  function onCopy(payload: LingyunPurchaseOrderDetailCopyPayload): void {
    uni.showToast({ title: `已复制 ${payload.text}`, icon: 'none' })
  }
</script>
