<template>
  <lingyun-purchase-order-list
    :orders="demoPurchaseOrders"
    @purchase-order-click="onPurchaseOrderClick"
    @action="onAction"
  />
</template>

<script setup lang="ts">
import { demoPurchaseOrders } from './purchaseOrderDemo'
import type {
  LingyunPurchaseOrderListActionPayload,
  LingyunPurchaseOrderListOrderPayload,
} from '@/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-list/types'

function onPurchaseOrderClick(payload: LingyunPurchaseOrderListOrderPayload): void {
  uni.navigateTo({
    url: `/pages/demo/purchase-order-detail?number=${encodeURIComponent(payload.order.number)}`,
  })
}

function onAction(payload: LingyunPurchaseOrderListActionPayload): void {
  uni.showToast({ title: payload.action.text, icon: 'none' })
}
</script>
