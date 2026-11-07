<template>
  <lingyun-order-goods
    v-model="cart"
    :store="store"
    :categories="categories"
    :min-price="20"
    :delivery-fee="5"
    :price-decimals="2"
    banner-height="150"
    @back="goBack"
    @checkout="onCheckout"
    @spec-request="onSpecRequest"
    @cart-clear="onCartClear"
  >
    <template #banner>
      <view class="order-banner">
        <view class="order-banner__copy">
          <text class="order-banner__title">立冬到 · 吃水饺</text>
          <text class="order-banner__sub">喜家德 · 现包现煮 · 门店直送</text>
        </view>
      </view>
    </template>
  </lingyun-order-goods>

  <lingyun-action-sheet
    v-model:show="specOpen"
    :title="specItem ? specItem.name : '选择规格'"
    message="选择规格后加入购物车"
    :actions="specActions"
    @action="onSpecAction"
    @cancel="specOpen = false"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type {
    LingyunOrderCart,
    LingyunOrderCategory,
    LingyunOrderGoods,
    LingyunOrderSpecPayload,
    LingyunOrderStore,
  } from '@/uni_modules/lingyun-ui-page/components/lingyun-order-goods/types'

  const store: LingyunOrderStore = {
    name: '喜家德虾仁水饺（北京酒仙桥店）',
    rating: 4.8,
    salesText: '月售 1000+',
    deliveryText: '约 23 分钟',
    notice: '温馨提示：请适量点餐，支持到店自提',
  }

  const categories: LingyunOrderCategory[] = [
    {
      key: 'flash',
      text: '神抢手',
      title: '神抢手 · 限时补贴',
      badge: '热',
      goods: [
        {
          key: 'flash-double',
          name: '喜三鲜水饺双人餐',
          price: 35,
          originalPrice: 45,
          salesText: '月售 600+',
          specText: '24 只 / 双人份',
          badge: '招牌',
        },
        {
          key: 'flash-single',
          name: '虾仁水饺单人餐',
          price: 24.9,
          originalPrice: 32,
          salesText: '月售 300+',
          specText: '12 只 / 1 人份',
        },
      ],
    },
    {
      key: 'dumpling',
      text: '水饺',
      goods: [
        {
          key: 'dumpling-three',
          name: '喜三鲜水饺',
          price: 35,
          salesText: '月售 600+ · 门店销量第 2 名',
          specText: '12 只 / 1 人份',
          badge: '招牌',
          multiSpec: true,
        },
        {
          key: 'dumpling-shrimp',
          name: '虾仁水饺',
          price: 32,
          salesText: '月售 400+',
          specText: '12 只 / 1 人份',
        },
        {
          key: 'dumpling-pork',
          name: '猪肉白菜水饺',
          price: 26,
          salesText: '月售 300+',
          specText: '12 只 / 1 人份',
        },
        {
          key: 'dumpling-chive',
          name: '韭菜鸡蛋水饺',
          price: 24,
          salesText: '月售 200+',
          specText: '12 只 / 1 人份',
        },
        {
          key: 'dumpling-beef',
          name: '一品牛肉水饺',
          price: 30,
          salesText: '月售 100+',
          specText: '12 只 / 1 人份',
          soldOut: true,
        },
      ],
    },
    {
      key: 'braise-mild',
      text: '酱卤不辣',
      goods: [
        {
          key: 'braise-platter',
          name: '卤肉拼盘',
          price: 28,
          salesText: '月售 200+',
          specText: '冷盘',
        },
        {
          key: 'braise-beef',
          name: '酱牛肉',
          price: 38,
          salesText: '月售 100+',
          specText: '约 200g',
        },
        {
          key: 'braise-egg',
          name: '卤蛋',
          price: 3,
          salesText: '月售 800+',
          specText: '1 个',
        },
      ],
    },
    {
      key: 'dish',
      text: '菜品',
      goods: [
        {
          key: 'dish-cucumber',
          name: '拍黄瓜',
          price: 12,
          salesText: '月售 500+',
          specText: '凉菜',
        },
        {
          key: 'dish-fungus',
          name: '凉拌木耳',
          price: 14,
          salesText: '月售 200+',
          specText: '凉菜',
        },
        {
          key: 'dish-tomato',
          name: '番茄炒蛋',
          price: 18,
          salesText: '月售 100+',
          specText: '热菜',
        },
        {
          key: 'dish-rice',
          name: '米饭',
          price: 3,
          salesText: '月售 1000+',
          specText: '1 碗',
        },
      ],
    },
    {
      key: 'drink',
      text: '饮品',
      goods: [
        {
          key: 'drink-plum',
          name: '酸梅汤',
          price: 8,
          salesText: '月售 300+',
          specText: '冰 / 常温',
        },
        {
          key: 'drink-cola',
          name: '可口可乐',
          price: 6,
          salesText: '月售 500+',
          specText: '330ml',
        },
        {
          key: 'drink-water',
          name: '矿泉水',
          price: 3,
          salesText: '月售 200+',
          specText: '550ml',
        },
      ],
    },
    {
      key: 'sauce',
      text: '蘸料',
      goods: [
        {
          key: 'sauce-garlic',
          name: '蒜泥蘸料',
          price: 2,
          salesText: '月售 900+',
          specText: '1 份',
        },
        {
          key: 'sauce-chili',
          name: '香辣蘸料',
          price: 2,
          salesText: '月售 700+',
          specText: '1 份',
        },
      ],
    },
    {
      key: 'package',
      text: '包装耗材',
      title: '包装耗材 · 按件起订',
      goods: [
        {
          key: 'bag-8-insulated',
          name: '8寸保温袋',
          price: 269,
          priceUnit: '/件',
          quantityUnit: '件',
          multiSpec: true,
          details: ['8寸低保温袋，剩余库存：886件', '8寸高保温袋，剩余库存：884件'],
        },
        {
          key: 'bag-8-foil',
          name: '8寸高铝箔袋',
          price: 269,
          priceUnit: '/件',
          quantityUnit: '件',
          soldOut: true,
          details: [
            '发货仓库：天通苑仓库-01',
            '规格描述：80个/件',
            '截单时间：2026-11-11 10:30:00',
            '预计 2026-11-26 开始配送，2026-11-26 送达',
          ],
        },
        {
          key: 'bag-4-insulated',
          name: '新4寸保温袋',
          price: 520,
          priceUnit: '/件',
          quantityUnit: '件',
          details: [
            '发货仓库：天通苑仓库-01，剩余库存：4件',
            '规格描述：200个/件',
            '截单时间：2026-11-11 10:30:00',
            '预计 2026-11-26 开始配送，2026-11-26 送达',
          ],
        },
        {
          key: 'bag-6-insulated',
          name: '新6寸低保温袋',
          price: 340,
          priceUnit: '/件',
          quantityUnit: '件',
          details: [
            '发货仓库：天通苑仓库-01',
            '规格描述：100个/件',
            '截单时间：2026-11-11 10:30:00',
            '预计 2026-11-26 开始配送，2026-11-26 送达',
          ],
        },
      ],
    },
  ]

  const cart = ref<LingyunOrderCart>({})

  const specOpen = ref(false)
  const specItem = ref<LingyunOrderGoods | null>(null)
  const specActions = [
    { key: '12', text: '12 只 · 1 人份' },
    { key: '24', text: '24 只 · 2 人份' },
  ]

  function onSpecRequest(payload: LingyunOrderSpecPayload): void {
    specItem.value = payload.item
    specOpen.value = true
  }

  function onSpecAction(payload: { action?: { key?: string | number; text?: string } }): void {
    const item = specItem.value
    const action = payload.action
    specOpen.value = false
    if (!item || !action) return
    const next: LingyunOrderCart = { ...cart.value }
    next[item.key] = (next[item.key] || 0) + 1
    cart.value = next
    uni.showToast({ title: `已选 ${action.text || '规格'}`, icon: 'none' })
    specItem.value = null
  }

  function onCheckout(payload: { totalPrice?: number }): void {
    uni.showToast({ title: `去结算 ¥${payload.totalPrice || 0}`, icon: 'none' })
  }

  function onCartClear(): void {
    uni.showToast({ title: '购物车已清空', icon: 'none' })
  }

  function goBack(): void {
    uni.navigateBack({
      fail: () => {
        uni.reLaunch({ url: '/pages/demo/demo' })
      },
    })
  }
</script>

<style lang="scss">
  @import '@/uni_modules/lingyun-ui/styles/variables.scss';

  .order-banner {
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 32px 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    background:
      radial-gradient(120% 120% at 85% 10%, rgba(255, 255, 255, 0.22), transparent 55%),
      linear-gradient(126deg, #0a84ff 0%, #5e5ce6 58%, #3634a3 100%);
  }

  .order-banner__copy {
    display: flex;
    flex-direction: column;
  }

  .order-banner__title {
    font-size: 24px;
    font-weight: 700;
    line-height: 30px;
    color: #ffffff;
    letter-spacing: 1px;
    text-shadow: 0 2px 10px rgba(90, 30, 0, 0.28);
  }

  .order-banner__sub {
    margin-top: 4px;
    font-size: 13px;
    line-height: 18px;
    color: rgba(255, 255, 255, 0.86);
  }

</style>
