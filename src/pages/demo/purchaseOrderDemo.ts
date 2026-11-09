import type {
  LingyunPurchaseOrderDetailItem,
  LingyunPurchaseOrderDetailOrder,
} from '@/uni_modules/lingyun-ui-page/components/lingyun-purchase-order-detail/types'

const cakeImage = (id: string, width = 240, height = 240): string =>
  `https://images.unsplash.com/${id}?w=${width}&h=${height}&fit=crop&q=80`

const pad2 = (value: number): string => (value < 10 ? `0${value}` : String(value))

/** 待付款倒计时演示：下单时间取当前时间往前推，刷新后仍有剩余时间 */
const minutesAgoText = (minutes: number): string => {
  const date = new Date(Date.now() - minutes * 60 * 1000)
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

const classic: LingyunPurchaseOrderDetailItem = {
  key: 'classic',
  name: '八喜经典冰淇淋蛋糕',
  image: cakeImage('photo-1578985545062-69928b1d9587'),
  specText: '6 寸 · 上层草莓 / 下层巧克力',
  price: 168,
  originalPrice: 198,
  quantity: 1,
  tag: '招牌',
}

const choco: LingyunPurchaseOrderDetailItem = {
  key: 'choco',
  name: '巧克力脆皮冰淇淋蛋糕',
  image: cakeImage('photo-1464349095431-e9a21285b5f3'),
  specText: '6 寸 · 约 1.5 磅',
  price: 188,
  quantity: 1,
}

const bulkTemplates: Omit<LingyunPurchaseOrderDetailItem, 'key'>[] = [
  {
    name: '八喜经典冰淇淋蛋糕',
    image: cakeImage('photo-1578985545062-69928b1d9587', 160, 160),
    specText: '6 寸 · 草莓 / 巧克力',
    price: 168,
    quantity: 1,
  },
  {
    name: '巧克力脆皮冰淇淋蛋糕',
    image: cakeImage('photo-1464349095431-e9a21285b5f3', 160, 160),
    specText: '6 寸 · 约 1.5 磅',
    price: 188,
    quantity: 1,
  },
  {
    name: '草莓芝士蛋糕',
    image: cakeImage('photo-1563729784474-d77dbb933a9e', 160, 160),
    specText: '8 寸 · 低糖',
    price: 218,
    quantity: 1,
  },
  {
    name: '抹茶千层蛋糕',
    image: cakeImage('photo-1565958011703-44f9829ba187', 160, 160),
    specText: '6 寸 · 动物奶油',
    price: 198,
    quantity: 1,
  },
  {
    name: '提拉米苏',
    image: cakeImage('photo-1551024506-0bccd828d307', 160, 160),
    specText: '盒装 · 冷藏',
    price: 58,
    quantity: 1,
  },
  {
    name: '芒果慕斯蛋糕',
    image: cakeImage('photo-1571115177098-24ec42ed204d', 160, 160),
    specText: '6 寸 · 新鲜芒果',
    price: 178,
    quantity: 1,
  },
]

/** 大部分真实订货单有几十个产品，列表只展示前几个商品图，详情页展示全部。 */
const bulkItems: LingyunPurchaseOrderDetailItem[] = Array.from(
  { length: 36 },
  (_, index) => {
    const template = bulkTemplates[index % bulkTemplates.length]
    return {
      ...template,
      key: `bulk-${index + 1}`,
      price: template.price + (index % 4) * 5,
    }
  },
)

const bulkGoodsTotal = bulkItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0,
)

const tiramisu: LingyunPurchaseOrderDetailItem = { ...bulkTemplates[4], key: 'tiramisu' }
const mango: LingyunPurchaseOrderDetailItem = { ...bulkTemplates[5], key: 'mango' }
const strawberry: LingyunPurchaseOrderDetailItem = { ...bulkTemplates[2], key: 'strawberry' }

const receiver = {
  name: '邱先生',
  phone: '138****8888',
  address: '北京市朝阳区酒仙桥路 10 号 恒通商务园 B12 座 3 层',
}

const pickup = {
  storeName: '八喜冰淇淋蛋糕（酒仙桥店）',
  address: '北京市朝阳区酒仙桥路 10 号 恒通商务园 B12 座 1 层',
  phone: '010-8888 6666',
  time: '11-09 14:30 前到店自提',
}

/** 多批配送：审核后拆成两个子订货单，各自有状态与物流。 */
const multiBatchOrder: LingyunPurchaseOrderDetailOrder = {
  key: 'multi-batch',
  number: 'LY202611090001',
  status: 'shipped',
  statusText: '部分发货',
  statusHint: '2 个子订货单，1 个配送中',
  createdAt: '2026-11-09 10:12',
  paidAt: '2026-11-09 10:13',
  deliveryType: 'delivery',
  receiver,
  deliveryTime: '预计 11-09 15:00-15:30 送达',
  items: [classic, choco, tiramisu, mango, strawberry],
  amounts: {
    goodsTotal: 810,
    deliveryFee: 5,
    discount: 20,
    coupon: 10,
    payable: 785,
    paid: 785,
  },
  paymentMethod: '微信支付',
  remark: '请放前台，谢谢',
  infoRows: [{ label: '配送方式', value: '门店配送' }],
  actions: [],
  subOrders: [
    {
      key: 'batch-1',
      number: 'LY202611090001-01',
      status: 'shipped',
      statusHint: '骑手正在送往您的地址',
      deliveryTime: '预计 11-09 15:00-15:30 送达',
      carrier: '顺丰同城',
      trackingNumber: 'SF1234567890',
      warehouse: {
        name: '北京朝阳仓',
        address: '北京市朝阳区酒仙桥路 10 号 恒通商务园 B12 座 1 层',
        phone: '010-8888 6001',
      },
      amounts: { goodsTotal: 622, payable: 622, paid: 622 },
      items: [classic, tiramisu, mango, strawberry],
      timeline: [
        {
          time: '11-09 13:20',
          title: '配送中',
          description: '骑手正在送往您的地址，请保持电话畅通',
          active: true,
        },
        { time: '11-09 12:40', title: '已出库', description: '商品已交给配送员' },
      ],
      actions: [
        { key: 'confirm', text: '确认收货', variant: 'borderedProminent' },
      ],
    },
    {
      key: 'batch-2',
      number: 'LY202611090001-02',
      status: 'pendingShipment',
      statusHint: '商家正在准备这一批商品',
      deliveryTime: '预计 11-09 16:00 前发货',
      warehouse: {
        name: '天津武清仓',
        address: '天津市武清区京津科技谷 8 号',
        phone: '022-8888 6002',
      },
      amounts: { goodsTotal: 188, payable: 188, paid: 188 },
      items: [choco],
      timeline: [],
      actions: [
        { key: 'remind', text: '提醒发货', variant: 'borderedProminent' },
      ],
    },
  ],
}

const pendingPaymentOrder: LingyunPurchaseOrderDetailOrder = {
  key: 'pending-payment',
  number: 'LY202611090002',
  status: 'pendingPayment',
  createdAt: minutesAgoText(1),
  deliveryType: 'delivery',
  receiver,
  items: [classic],
  amounts: { goodsTotal: 168, deliveryFee: 5, payable: 173 },
  remark: '请放前台，谢谢',
}

const pendingShipmentOrder: LingyunPurchaseOrderDetailOrder = {
  key: 'pending-shipment',
  number: 'LY202611090003',
  status: 'pendingShipment',
  createdAt: '2026-11-09 09:12',
  paidAt: '2026-11-09 09:13',
  deliveryType: 'delivery',
  receiver,
  deliveryTime: '预计 11-09 16:00 前发货',
  items: [choco],
  amounts: { goodsTotal: 188, deliveryFee: 5, payable: 193, paid: 193 },
  paymentMethod: '微信支付',
  remark: '请放前台，谢谢',
}

const completedOrder: LingyunPurchaseOrderDetailOrder = {
  key: 'completed',
  number: 'LY202611080006',
  status: 'completed',
  createdAt: '2026-11-08 11:20',
  paidAt: '2026-11-08 11:21',
  deliveryType: 'pickup',
  pickup,
  items: [classic],
  amounts: { goodsTotal: 168, payable: 168, paid: 168 },
  paymentMethod: '微信支付',
  remark: '到店报手机号取货',
  timeline: [
    {
      time: '11-08 14:30',
      title: '已完成',
      description: '商品已自提，感谢您的购买',
      active: true,
    },
    { time: '11-08 12:40', title: '待自提' },
  ],
}

const cancelledOrder: LingyunPurchaseOrderDetailOrder = {
  key: 'cancelled',
  number: 'LY202611080009',
  status: 'cancelled',
  createdAt: '2026-11-08 10:02',
  deliveryType: 'delivery',
  receiver,
  items: [choco],
  amounts: { goodsTotal: 188, deliveryFee: 5, payable: 193 },
  remark: '请放前台，谢谢',
}

const refundOrder: LingyunPurchaseOrderDetailOrder = {
  key: 'refund',
  number: 'LY202611080011',
  status: 'refund',
  createdAt: '2026-11-08 09:30',
  paidAt: '2026-11-08 09:31',
  deliveryType: 'delivery',
  receiver,
  items: [choco],
  amounts: { goodsTotal: 188, deliveryFee: 5, payable: 193, paid: 193 },
  paymentMethod: '微信支付',
  remark: '申请退款',
}

const pendingReviewOrder: LingyunPurchaseOrderDetailOrder = {
  key: 'pending-review',
  number: 'LY202611090010',
  status: 'pendingReview',
  createdAt: '2026-11-09 11:05',
  deliveryType: 'delivery',
  receiver,
  items: bulkItems,
  amounts: {
    goodsTotal: bulkGoodsTotal,
    deliveryFee: 0,
    payable: bulkGoodsTotal,
    paid: bulkGoodsTotal,
  },
  remark: '请按批次发货',
}

export const demoPurchaseOrders: LingyunPurchaseOrderDetailOrder[] = [
  multiBatchOrder,
  pendingReviewOrder,
  pendingPaymentOrder,
  pendingShipmentOrder,
  completedOrder,
  cancelledOrder,
  refundOrder,
]

export function findDemoPurchaseOrder(number?: string): LingyunPurchaseOrderDetailOrder {
  return (
    demoPurchaseOrders.find((order) => order.number === number) || multiBatchOrder
  )
}
