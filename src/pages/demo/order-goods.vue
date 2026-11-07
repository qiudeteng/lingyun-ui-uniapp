<template>
  <lingyun-order-goods
    v-model="cart"
    :store="store"
    :categories="categories"
    :min-price="20"
    :delivery-fee="5"
    :price-decimals="2"
    :render-mode="renderMode"
    :window-size="2"
    :category-loading="categoryLoading"
    banner-height="150"
    @back="goBack"
    @checkout="onCheckout"
    @spec-request="onSpecRequest"
    @cart-clear="onCartClear"
    @category-change="onCategoryChange"
  >
    <template #banner>
      <view class="order-banner">
        <image class="order-banner__bg" :src="bannerImage" mode="aspectFill" />
        <view class="order-banner__shade" />
        <view class="order-banner__copy">
          <text class="order-banner__title">八喜 · 冰淇淋蛋糕</text>
          <text class="order-banner__sub">鲜奶冰淇淋 · 冷链直送</text>
        </view>
      </view>
    </template>
    <template #banner-actions>
      <view class="order-mode" @click="toggleRenderMode">
        <text class="order-mode__text">{{ modeText }}</text>
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
  import { computed, onBeforeUnmount, ref } from 'vue'
  import type {
    LingyunOrderCart,
    LingyunOrderCategory,
    LingyunOrderGoods,
    LingyunOrderSpecPayload,
    LingyunOrderStore,
  } from '@/uni_modules/lingyun-ui-page/components/lingyun-order-goods/types'

  const cakeImage = (id: string): string =>
    `https://images.unsplash.com/${id}?w=200&h=200&fit=crop&q=80`

  const bannerImage =
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=500&fit=crop&q=80'

  const store: LingyunOrderStore = {
    name: '八喜冰淇淋蛋糕（北京酒仙桥店）',
    logo: cakeImage('photo-1578985545062-69928b1d9587'),
    rating: 4.8,
    salesText: '月售 1000+',
    deliveryText: '约 30 分钟',
    notice: '温馨提示：冰淇淋蛋糕请及时冷藏，支持到店自提',
  }

  const categories: LingyunOrderCategory[] = [
    {
      key: 'hot',
      text: '热销',
      title: '热销 · 门店招牌',
      icon: 'fire',
      iconColor: '#ff8d28',
      goods: [
        {
          key: 'hot-classic',
          image: cakeImage('photo-1578985545062-69928b1d9587'),
          name: '八喜经典冰淇淋蛋糕',
          price: 168,
          originalPrice: 198,
          salesText: '月售 600+',
          specText: '6 寸 / 约 1.5 磅',
          badge: '招牌',
        },
        {
          key: 'hot-choco',
          image: cakeImage('photo-1563729784474-d77dbb933a9e'),
          name: '巧克力脆皮冰淇淋蛋糕',
          price: 188,
          originalPrice: 218,
          salesText: '月售 300+',
          specText: '6 寸 / 约 1.5 磅',
        },
      ],
    },
    {
      key: 'birthday',
      text: '生日蛋糕',
      goods: [
        {
          key: 'birthday-strawberry',
          image: cakeImage('photo-1565958011703-44f9829ba187'),
          name: '草莓鲜奶生日蛋糕',
          price: 199,
          salesText: '月售 400+',
          specText: '6 寸 / 2-4 人',
          badge: '人气',
          multiSpec: true,
        },
        {
          key: 'birthday-mango',
          image: cakeImage('photo-1464349095431-e9a21285b5f3'),
          name: '芒果慕斯生日蛋糕',
          price: 218,
          salesText: '月售 300+',
          specText: '6 寸 / 2-4 人',
        },
        {
          key: 'birthday-blueberry',
          image: cakeImage('photo-1535141192574-5d4897c12636'),
          name: '蓝莓芝士生日蛋糕',
          price: 238,
          salesText: '月售 200+',
          specText: '8 寸 / 4-6 人',
        },
        {
          key: 'birthday-choco',
          image: cakeImage('photo-1519869325930-281384150729'),
          name: '巧克力梦想生日蛋糕',
          price: 258,
          salesText: '月售 100+',
          specText: '8 寸 / 4-6 人',
          soldOut: true,
        },
      ],
    },
    {
      key: 'icecream',
      text: '冰淇淋蛋糕',
      goods: [
        {
          key: 'ice-rum',
          image: cakeImage('photo-1488477181946-6428a0291777'),
          name: '朗姆葡萄冰淇淋蛋糕',
          price: 178,
          salesText: '月售 300+',
          specText: '6 寸 / 约 1.5 磅',
        },
        {
          key: 'ice-matcha',
          image: cakeImage('photo-1571115177098-24ec42ed204d'),
          name: '抹茶红豆冰淇淋蛋糕',
          price: 188,
          salesText: '月售 200+',
          specText: '6 寸 / 约 1.5 磅',
        },
        {
          key: 'ice-vanilla',
          image: cakeImage('photo-1558636508-e0db3814bd1d'),
          name: '香草奥利奥冰淇淋蛋糕',
          price: 168,
          salesText: '月售 200+',
          specText: '6 寸 / 约 1.5 磅',
        },
      ],
    },
    {
      key: 'dessert',
      text: '甜点',
      goods: [
        {
          key: 'dessert-tiramisu',
          image: cakeImage('photo-1499636136210-6f4ee915583e'),
          name: '提拉米苏',
          price: 38,
          salesText: '月售 500+',
          specText: '1 份',
        },
        {
          key: 'dessert-tart',
          image: cakeImage('photo-1551024506-0bccd828d307'),
          name: '芝士挞',
          price: 18,
          salesText: '月售 300+',
          specText: '2 个装',
        },
        {
          key: 'dessert-macaron',
          image: cakeImage('photo-1558024920-b41e1887dc32'),
          name: '马卡龙礼盒',
          price: 68,
          salesText: '月售 200+',
          specText: '12 枚装',
        },
      ],
    },
    {
      key: 'drink',
      text: '饮品',
      goods: [
        {
          key: 'drink-americano',
          image: cakeImage('photo-1544145945-f90425340c7e'),
          name: '冰美式',
          price: 18,
          salesText: '月售 300+',
          specText: '冰 / 常温',
        },
        {
          key: 'drink-latte',
          image: cakeImage('photo-1517701604599-bb29b565090c'),
          name: '拿铁',
          price: 22,
          salesText: '月售 500+',
          specText: '350ml',
        },
        {
          key: 'drink-orange',
          image: cakeImage('photo-1613478223719-2ab802602423'),
          name: '鲜榨橙汁',
          price: 26,
          salesText: '月售 200+',
          specText: '350ml',
        },
      ],
    },
    {
      key: 'gift',
      text: '冰淇淋蛋糕礼盒装',
      title: '冰淇淋蛋糕礼盒装 · 需提前 1 天预订',
      goods: [
        {
          key: 'gift-classic',
          image: cakeImage('photo-1624353365286-3f8d62daad51'),
          name: '八喜经典礼盒装',
          price: 268,
          priceUnit: '/盒',
          quantityUnit: '盒',
          multiSpec: true,
          details: ['含 6 寸冰淇淋蛋糕 1 个', '含生日帽、蜡烛、餐具'],
        },
        {
          key: 'gift-party',
          image: cakeImage('photo-1578985545062-69928b1d9587'),
          name: '生日派对礼盒',
          price: 328,
          priceUnit: '/盒',
          quantityUnit: '盒',
          details: ['含 8 寸冰淇淋蛋糕 1 个', '含 6 份餐具、生日帽、蜡烛'],
        },
        {
          key: 'gift-soldout',
          image: cakeImage('photo-1519869325930-281384150729'),
          name: '节日限定礼盒',
          price: 298,
          priceUnit: '/盒',
          quantityUnit: '盒',
          soldOut: true,
          details: [
            '含冰淇淋蛋糕、马卡龙、饮品',
            '需提前 1 天预订，每日限量 20 盒',
          ],
        },
      ],
    },
    {
      key: 'package',
      text: '配件与包装',
      title: '配件与包装 · 按件起订',
      goods: [
        {
          key: 'pkg-bag6',
          image: cakeImage('photo-1551024506-0bccd828d307'),
          name: '6寸保温袋',
          price: 12,
          priceUnit: '/个',
          quantityUnit: '个',
          multiSpec: true,
          details: ['6寸低保温袋，剩余库存：886个', '6寸高保温袋，剩余库存：884个'],
        },
        {
          key: 'pkg-bag8',
          image: cakeImage('photo-1558024920-b41e1887dc32'),
          name: '8寸保温袋',
          price: 16,
          priceUnit: '/个',
          quantityUnit: '个',
          details: ['8寸保温袋，剩余库存：520个', '含冰袋 2 个，冷链配送更稳定'],
        },
        {
          key: 'pkg-candle',
          image: cakeImage('photo-1519869325930-281384150729'),
          name: '生日蜡烛套装',
          price: 5,
          quantityUnit: '套',
          details: ['含数字蜡烛 1 套、火柴 1 盒', '下单请备注生日数字'],
        },
        {
          key: 'pkg-cutlery',
          image: cakeImage('photo-1499636136210-6f4ee915583e'),
          name: '一次性餐具',
          price: 2,
          quantityUnit: '份',
          details: ['含餐盘、叉子、纸巾', '按人数备注份数'],
        },
      ],
    },
  ]

  const cart = ref<LingyunOrderCart>({})
  type RenderMode = 'auto' | 'all' | 'windowed' | 'category'
  const RENDER_MODES: RenderMode[] = ['auto', 'all', 'windowed', 'category']
  const renderMode = ref<RenderMode>('auto')
  const categoryLoading = ref(false)
  let lazyTimer: ReturnType<typeof setTimeout> | null = null

  const modeText = computed(() => {
    if (renderMode.value === 'category') return '按分类加载'
    if (renderMode.value === 'windowed') return '分段加载'
    if (renderMode.value === 'all') return '全部加载'
    return '自动加载'
  })

  function toggleRenderMode(): void {
    const index = RENDER_MODES.indexOf(renderMode.value)
    renderMode.value = RENDER_MODES[(index + 1) % RENDER_MODES.length]
    categoryLoading.value = false
  }

  function onCategoryChange(): void {
    if (renderMode.value !== 'category') return
    categoryLoading.value = true
    clearTimeout(lazyTimer ?? undefined)
    lazyTimer = setTimeout(() => {
      categoryLoading.value = false
      lazyTimer = null
    }, 260)
  }

  onBeforeUnmount(() => {
    clearTimeout(lazyTimer ?? undefined)
    lazyTimer = null
  })

  const specOpen = ref(false)
  const specItem = ref<LingyunOrderGoods | null>(null)
  const specActions = [
    { key: '6', text: '6 寸 · 2-4 人' },
    { key: '8', text: '8 寸 · 4-6 人' },
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

  .order-banner__bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  .order-banner__shade {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      rgba(8, 18, 40, 0.62) 0%,
      rgba(8, 18, 40, 0.2) 62%,
      rgba(8, 18, 40, 0.04) 100%
    );
  }

  .order-banner__copy {
    position: relative;
    z-index: 1;
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

  .order-mode {
    height: 28px;
    padding: 0 12px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.18);
  }

  .order-mode__text {
    font-size: 12px;
    line-height: 16px;
    color: #ffffff;
    white-space: nowrap;
  }

</style>
