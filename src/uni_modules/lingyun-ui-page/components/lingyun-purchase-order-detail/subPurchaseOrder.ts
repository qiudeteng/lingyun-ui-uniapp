import type {
  LingyunPurchaseOrderDetailInfoRow,
  LingyunPurchaseOrderDetailOrder,
  LingyunPurchaseOrderDetailSubOrder,
} from './types'

/**
 * 把「主订货单 + 子订货单」拍平成单订货单详情数据，交给 lingyun-purchase-order-detail 展示。
 * 子订货单详情复用同一套状态头 / 商品 / 金额 / 物流 / 操作布局。
 * 子订货单详情不展示预计送达时间，因此不复制 deliveryTime。
 */
export function buildLingyunPurchaseOrderSubDetail(
  order: LingyunPurchaseOrderDetailOrder,
  subOrder: LingyunPurchaseOrderDetailSubOrder,
): LingyunPurchaseOrderDetailOrder {
  const infoRows: LingyunPurchaseOrderDetailInfoRow[] = [
    { label: '所属订货单', value: order.number },
  ]
  if (subOrder.warehouse) {
    infoRows.push({ label: '发货仓库', value: subOrder.warehouse.name })
    if (subOrder.warehouse.address) {
      infoRows.push({ label: '仓库地址', value: subOrder.warehouse.address })
    }
    if (subOrder.warehouse.phone) {
      infoRows.push({ label: '仓库电话', value: subOrder.warehouse.phone })
    }
  }
  if (subOrder.infoRows) infoRows.push(...subOrder.infoRows)
  if (order.infoRows) infoRows.push(...order.infoRows)

  return {
    key: subOrder.key,
    number: subOrder.number,
    status: subOrder.status,
    statusText: subOrder.statusText,
    statusHint: subOrder.statusHint,
    statusIcon: subOrder.statusIcon,
    statusColor: subOrder.statusColor,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    deliveryType: subOrder.deliveryType || order.deliveryType,
    receiver: order.receiver,
    pickup: order.pickup,
    carrier: subOrder.carrier,
    trackingNumber: subOrder.trackingNumber,
    items:
      subOrder.items && subOrder.items.length ? subOrder.items : order.items,
    amounts: subOrder.amounts || order.amounts,
    paymentMethod: order.paymentMethod,
    remark: order.remark,
    timeline: subOrder.timeline || [],
    actions: subOrder.actions,
    infoRows,
  }
}
