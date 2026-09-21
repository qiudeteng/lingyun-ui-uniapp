<template>
  <lingyun-app-page title="Pickers">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Pickers</text>
        <text class="hero__desc">selector · data-picker 级联（日期/时间见 Date & Time）</text>
      </view>

      <lingyun-section title="Selector" :hint="`index=${cityIdx}`">
        <lingyun-picker v-model="cityIdx" title="City" :range="cities" />
      </lingyun-section>

      <lingyun-section title="Selector · rangeKey" :hint="fruitHint">
        <lingyun-picker
          v-model="fruitIdx"
          title="水果"
          :range="fruits"
          range-key="label"
        />
      </lingyun-section>

      <lingyun-section title="Data Picker · 级联" :hint="regionHint">
        <lingyun-data-picker v-model="region" title="地区" :localdata="regionTree" />
      </lingyun-section>

      <lingyun-section title="Data Picker · map" :hint="categoryHint" is-last>
        <lingyun-data-picker
          v-model="category"
          title="分类"
          :localdata="categoryTree"
          :map="{ text: 'name', value: 'id', children: 'kids' }"
          separator=" › "
        />
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  const cities = ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen']
  const cityIdx = ref(0)

  const fruits = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '橙子', value: 'orange' },
  ]
  const fruitIdx = ref(0)
  const fruitHint = computed(() => {
    const item = fruits[fruitIdx.value]
    return item ? `${item.label} (${item.value})` : '未选'
  })

  const region = ref(['zj', 'hz', 'xh'])
  const regionTree = [
    {
      text: '浙江',
      value: 'zj',
      children: [
        {
          text: '杭州',
          value: 'hz',
          children: [
            { text: '西湖', value: 'xh' },
            { text: '余杭', value: 'yh' },
            { text: '滨江', value: 'bj' },
          ],
        },
        {
          text: '宁波',
          value: 'nb',
          children: [
            { text: '海曙', value: 'hs' },
            { text: '鄞州', value: 'yz' },
          ],
        },
      ],
    },
    {
      text: '江苏',
      value: 'js',
      children: [
        {
          text: '南京',
          value: 'nj',
          children: [
            { text: '玄武', value: 'xw' },
            { text: '鼓楼', value: 'gl' },
          ],
        },
        {
          text: '苏州',
          value: 'sz',
          children: [
            { text: '姑苏', value: 'gs' },
            { text: '工业园区', value: 'gyy' },
          ],
        },
      ],
    },
  ]

  const regionHint = computed(() =>
    region.value.length ? JSON.stringify(region.value) : '未选',
  )

  const category = ref(['elec', 'phone'])
  const categoryTree = [
    {
      name: '数码',
      id: 'elec',
      kids: [
        { name: '手机', id: 'phone' },
        { name: '平板', id: 'pad' },
        {
          name: '电脑',
          id: 'pc',
          kids: [
            { name: '笔记本', id: 'laptop' },
            { name: '台式', id: 'desktop' },
          ],
        },
      ],
    },
    {
      name: '家居',
      id: 'home',
      kids: [
        { name: '厨房', id: 'kitchen' },
        { name: '清洁', id: 'clean' },
      ],
    },
  ]

  const categoryHint = computed(() =>
    category.value.length ? JSON.stringify(category.value) : '未选',
  )
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 40px;
    min-height: 100%;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .hero {
    padding: 24px 20px 8px;
  }

  .hero__title {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--lingyun-label, #1c1c1e);
  }

  .hero__desc {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    color: var(--lingyun-label-secondary, #6a6a6a);
  }
</style>
