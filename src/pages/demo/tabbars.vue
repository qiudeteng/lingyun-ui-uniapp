<template>
  <lingyun-app-page title="Tab Bars">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Tab Bars</text>
        <text class="hero__desc">选组合，底部只渲染当前这一条</text>
      </view>

      <lingyun-form>
        <lingyun-form-group title="组合" :footer="`当前选中：${currentLabel}`">
          <lingyun-form-item label="布局">
            <lingyun-picker v-model="layoutIdx" :range="layoutLabels" />
          </lingyun-form-item>
          <lingyun-form-item label="外观">
            <lingyun-picker v-model="variantIdx" :range="variantLabels" />
          </lingyun-form-item>
          <lingyun-form-item label="角标">
            <lingyun-switch v-model="showBadge" />
          </lingyun-form-item>
        </lingyun-form-group>
      </lingyun-form>
    </view>

    <lingyun-tabbars
      :key="barKey"
      v-model="current"
      :items="items"
      :variant="variant"
    />
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  type TabDemoItem = {
    key: string
    text?: string
    icon?: string
    role?: 'search'
    badge?: number | { text?: number; color?: string; dot?: boolean }
  }

  const layouts = [
    { key: 'five', text: '无搜索 · 5 项' },
    { key: 'four', text: '无搜索 · 4 项' },
    { key: 'fourSearch', text: '4 + 搜索' },
    { key: 'threeSearch', text: '3 + 搜索' },
    { key: 'twoSearch', text: '2 + 搜索' },
    { key: 'oneSearch', text: '1 + 搜索' },
  ] as const

  const variants = [
    { key: 'default', text: 'Default' },
    { key: 'prominent', text: 'Prominent' },
  ] as const

  const layoutLabels = layouts.map((item) => item.text)
  const variantLabels = variants.map((item) => item.text)

  const layoutIdx = ref(0)
  const variantIdx = ref(0)
  const showBadge = ref(true)
  const current = ref('home')

  const layoutKey = computed(() => layouts[layoutIdx.value]?.key ?? 'five')
  const variant = computed(() => variants[variantIdx.value]?.key ?? 'default')
  const barKey = computed(() => `${layoutKey.value}-${variant.value}-${showBadge.value ? 'b' : 'n'}`)

  const items = computed((): TabDemoItem[] => {
    const withSearch = layoutKey.value.endsWith('Search')
    const mainCount =
      layoutKey.value === 'five'
        ? 5
        : layoutKey.value === 'four' || layoutKey.value === 'fourSearch'
          ? 4
          : layoutKey.value === 'threeSearch'
            ? 3
            : layoutKey.value === 'twoSearch'
              ? 2
              : 1

    const catalog: TabDemoItem[] = [
      { key: 'home', text: 'Home', icon: '⌂' },
      { key: 'listen', text: 'Listen', icon: '♪' },
      { key: 'browse', text: 'Browse', icon: '◇', badge: 3 },
      { key: 'radio', text: 'Radio', icon: '◉', badge: { text: 12, color: 'orange' } },
      { key: 'library', text: 'Library', icon: '▤', badge: { color: 'green', dot: true } },
    ]

    const mains = catalog.slice(0, mainCount).map((item) => {
      if (showBadge.value) return { ...item }
      const next = { ...item }
      delete next.badge
      return next
    })

    if (withSearch) {
      mains.push({ key: 'search', role: 'search' })
    }
    return mains
  })

  const currentLabel = computed(() => {
    const item = items.value.find((row) => row.key === current.value)
    if (!item) return '—'
    if (item.role === 'search') return 'Search'
    return item.text || item.key
  })

  watch(
    items,
    (list) => {
      if (!list.some((row) => row.key === current.value)) {
        current.value = list[0]?.key || 'home'
      }
    },
    { immediate: true },
  )
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    min-height: 100%;
    padding-bottom: 130px;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.22), transparent 55%),
      radial-gradient(100% 70% at 90% 20%, rgba(16, 185, 129, 0.16), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.14), transparent 45%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .hero {
    padding: 24px 20px 4px;
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
