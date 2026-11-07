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
    show-toolbar
    :auto-top-inset="false"
    searchable
    title="点单"
    :toolbar-buttons="toolbarButtons"
    toolbar-menu-enabled
    :banner-height="bannerEnabled ? bannerHeight : 0"
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
      </view>
    </template>
    <template #toolbar-menu="{ close }">
      <view class="order-toolbar-filter">
        <text class="order-toolbar-filter__title">加载模式</text>
        <view class="order-toolbar-filter__chips">
          <view
            v-for="option in renderModeOptions"
            :key="option.key"
            class="order-toolbar-filter__chip"
            :class="{ 'order-toolbar-filter__chip--active': renderMode === option.key }"
            hover-class="order-toolbar-filter__chip--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="pickRenderMode(option.key)"
          >
            <text class="order-toolbar-filter__chip-text">{{ option.text }}</text>
          </view>
        </view>
        <view class="order-toolbar-filter__sep" />
        <text class="order-toolbar-filter__title">Banner</text>
        <view class="order-toolbar-filter__row">
          <text class="order-toolbar-filter__row-label">显示 Banner</text>
          <lingyun-switch v-model="bannerEnabled" />
        </view>
        <view v-if="bannerEnabled" class="order-toolbar-filter__slider">
          <view class="order-toolbar-filter__slider-head">
            <text class="order-toolbar-filter__row-label">高度</text>
            <text class="order-toolbar-filter__value">{{ bannerHeight }}px</text>
          </view>
          <lingyun-slider
            v-model="bannerHeight"
            :min="60"
            :max="300"
            :step="10"
            flush
          />
        </view>
        <view class="order-toolbar-filter__actions">
          <view
            class="order-toolbar-filter__done"
            hover-class="order-toolbar-filter__done--hover"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="closeToolbarMenu(close)"
          >
            <text class="order-toolbar-filter__done-text">完成</text>
          </view>
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
  import { onBeforeUnmount, ref } from 'vue'
  import type {
    LingyunOrderCart,
    LingyunOrderCategory,
    LingyunOrderGoods,
    LingyunOrderGoodsAttribute,
    LingyunOrderSpecPayload,
    LingyunOrderStore,
  } from '@/uni_modules/lingyun-ui-page/components/lingyun-order-goods/types'

  const cakeImage = (id: string, width = 480, height = 360): string =>
    `https://images.unsplash.com/${id}?w=${width}&h=${height}&fit=crop&q=80`

  const bannerImage =
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=500&fit=crop&q=80'

  const store: LingyunOrderStore = {
    name: '八喜冰淇淋蛋糕（北京酒仙桥店）',
    logo: cakeImage('photo-1578985545062-69928b1d9587', 160, 160),
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
          images: [
            cakeImage('photo-1578985545062-69928b1d9587'),
            cakeImage('photo-1563729784474-d77dbb933a9e'),
            cakeImage('photo-1519869325930-281384150729'),
          ],
          name: '八喜经典冰淇淋蛋糕',
          price: 168,
          originalPrice: 198,
          salesText: '月售 600+',
          specText: '6 寸 / 约 1.5 磅',
          badge: '招牌',
          description:
            '八喜经典冰淇淋蛋糕选用门店当日现做的蛋糕坯与鲜奶冰淇淋，外层手工抹面，冷链配送到家。\n' +
            '主料：鲜奶冰淇淋、稀奶油、小麦粉、鸡蛋、白砂糖。\n' +
            '过敏原提示：含乳制品、蛋类、小麦制品，可能含坚果碎，请按需选购。\n' +
            '规格：6 寸 / 约 1.5 磅，适合 2-4 人分享；含生日帽、蜡烛与餐具。\n' +
            '保存方式：收到后请立即放入冰箱冷冻保存，建议 2 小时内食用；解冻后请勿重复冷冻。\n' +
            '配送说明：门店周边 5 公里内支持冷链配送，超出范围请选择到店自提；节假日配送时间可能延长。\n' +
            '温馨提示：图片为实物拍摄，蛋糕装饰与颜色以门店实际出品为准；如有生日牌、数字蜡烛等需求，请在下单时备注。',
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
          images: [
            cakeImage('photo-1565958011703-44f9829ba187'),
            cakeImage('photo-1464349095431-e9a21285b5f3'),
            cakeImage('photo-1535141192574-5d4897c12636'),
          ],
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
          images: [
            cakeImage('photo-1488477181946-6428a0291777'),
            cakeImage('photo-1558636508-e0db3814bd1d'),
          ],
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
          images: [
            cakeImage('photo-1624353365286-3f8d62daad51'),
            cakeImage('photo-1578985545062-69928b1d9587'),
            cakeImage('photo-1563729784474-d77dbb933a9e'),
          ],
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

  const categoryAttributes: Record<string, LingyunOrderGoodsAttribute[]> = {
    hot: [
      { label: '主料', value: '鲜奶' },
      { label: '口味', value: '香甜' },
      { label: '口感', value: '绵密' },
      { label: '制作', value: '冷链' },
    ],
    birthday: [
      { label: '主料', value: '鲜奶' },
      { label: '口味', value: '果香' },
      { label: '口感', value: '松软' },
      { label: '制作', value: '现做' },
    ],
    icecream: [
      { label: '主料', value: '冰淇淋' },
      { label: '口味', value: '奶香' },
      { label: '口感', value: '冰爽' },
      { label: '制作', value: '冷链' },
    ],
    dessert: [
      { label: '主料', value: '芝士' },
      { label: '口味', value: '甜' },
      { label: '口感', value: '细腻' },
      { label: '制作', value: '现做' },
    ],
    drink: [
      { label: '主料', value: '当日鲜制' },
      { label: '口味', value: '冰' },
      { label: '口感', value: '清爽' },
      { label: '制作', value: '现制' },
    ],
    gift: [
      { label: '主料', value: '鲜奶' },
      { label: '口味', value: '综合' },
      { label: '口感', value: '丰富' },
      { label: '制作', value: '冷链' },
    ],
    package: [
      { label: '材质', value: '环保' },
      { label: '用途', value: '保温' },
      { label: '规格', value: '标准' },
      { label: '说明', value: '按件' },
    ],
  }

  const categoryIntroductions: Record<string, string> = {
    hot: '八喜门店招牌，鲜奶冰淇淋搭配现烤蛋糕坯，冷链配送；图片为实物拍摄，装饰以门店实际出品为准。',
    birthday: '生日蛋糕支持备注生日牌与蜡烛，门店当日制作、冷藏配送；建议收到后尽快食用。',
    icecream: '冰淇淋蛋糕全程冷链配送，收到后请立即冷藏；含生日餐具与蜡烛，规格以实际下单为准。',
    dessert: '门店现做甜点，冷藏配送；图片为实物拍摄，口味与装饰以门店实际出品为准。',
    drink: '门店现制饮品，建议尽快饮用；冰量与甜度可在备注中说明。',
    gift: '礼盒装需提前 1 天预订，含蛋糕、餐具与生日配件；节日期间请以门店库存为准。',
    package: '门店打包配件，按件下单；规格与数量以商品说明和实际发货为准。',
  }

  categories.forEach((category) => {
    const attrs = categoryAttributes[category.key] || []
    const intro = categoryIntroductions[category.key] || ''
    category.goods.forEach((item) => {
      if (!item.attributes || !item.attributes.length) {
        item.attributes = attrs.map((attr) => ({ ...attr }))
      }
      if (!item.description) {
        item.description = `${item.name}。${intro}`
      }
    })
  })

  const cart = ref<LingyunOrderCart>({})
  type RenderMode = 'auto' | 'all' | 'windowed' | 'category'
  const renderModeOptions: { key: RenderMode; text: string }[] = [
    { key: 'auto', text: '自动加载' },
    { key: 'all', text: '全部加载' },
    { key: 'windowed', text: '分段加载' },
    { key: 'category', text: '按分类加载' },
  ]
  const renderMode = ref<RenderMode>('auto')
  const bannerEnabled = ref(true)
  const bannerHeight = ref(150)
  const categoryLoading = ref(false)
  let lazyTimer: ReturnType<typeof setTimeout> | null = null

  const toolbarButtons = [
    { key: 'filter', icon: 'tune', label: '筛选' },
  ]

  function pickRenderMode(key: RenderMode): void {
    renderMode.value = key
    categoryLoading.value = false
  }

  function closeToolbarMenu(close?: () => void): void {
    if (typeof close === 'function') close()
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

  .order-toolbar-filter {
    padding: 8px 4px 4px;
  }

  .order-toolbar-filter__title {
    display: block;
    padding: 0 8px 8px;
    font-size: 13px;
    font-weight: 600;
    line-height: 16px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .order-toolbar-filter__chips {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 8px;
  }

  .order-toolbar-filter__chip {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
    height: 36px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--lingyun-fill-tertiary, rgba(120, 120, 128, 0.12));
  }

  .order-toolbar-filter__chip--hover {
    opacity: 0.72;
  }

  .order-toolbar-filter__chip--active {
    background-color: var(--lingyun-primary, #0088ff);
  }

  .order-toolbar-filter__chip-text {
    font-size: 14px;
    line-height: 18px;
    color: var(--lingyun-label, #000000);
  }

  .order-toolbar-filter__chip--active .order-toolbar-filter__chip-text {
    color: #ffffff;
    font-weight: 600;
  }

  .order-toolbar-filter__sep {
    height: 1px;
    margin: 14px 8px;
    background-color: var(--lingyun-separator, rgba(0, 0, 0, 0.12));
  }

  .order-toolbar-filter__row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 8px;
  }

  .order-toolbar-filter__row-label {
    flex: 1;
    min-width: 0;
    font-size: 15px;
    line-height: 20px;
    color: var(--lingyun-label, #000000);
  }

  .order-toolbar-filter__slider {
    padding: 8px 8px 0;
  }

  .order-toolbar-filter__slider-head {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2px;
  }

  .order-toolbar-filter__value {
    font-size: 13px;
    line-height: 16px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }

  .order-toolbar-filter__actions {
    display: flex;
    flex-direction: row;
    padding: 12px 8px 4px;
  }

  .order-toolbar-filter__done {
    flex: 1;
    height: 36px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--lingyun-primary, #0088ff);
  }

  .order-toolbar-filter__done--hover {
    opacity: 0.72;
  }

  .order-toolbar-filter__done-text {
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
    color: #ffffff;
  }

</style>
