<template>
  <lingyun-app-page title="Sidebar">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Sidebar</text>
        <text class="hero__desc">lingyun-sidebar · 悬浮玻璃侧栏</text>
        <text class="hero__current">当前：{{ currentLabel }}</text>
      </view>

      <view class="actions">
        <lingyun-button variant="borderedProminent" block text="从左侧打开" @click="openLeading" />
        <lingyun-button variant="bordered" block text="从右侧打开" @click="openTrailing" />
      </view>
    </view>

    <lingyun-sidebar
      v-model:show="open"
      v-model:current="current"
      :title="placement === 'trailing' ? 'Inspector' : 'Library'"
      :placement="placement"
      :sections="sections"
      @select="onSelect"
    />
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  const open = ref(false)
  const current = ref('home')
  const placement = ref<'leading' | 'trailing'>('leading')

  const sections = [
    {
      title: 'Library',
      items: [
        { key: 'home', label: 'Home', icon: 'home' },
        { key: 'inbox', label: 'Inbox', icon: 'email', badge: '3' },
        { key: 'starred', label: 'Starred', icon: 'star' },
      ],
    },
    {
      title: 'Browse',
      items: [
        { key: 'places', label: 'Places', icon: 'location' },
        { key: 'people', label: 'People', icon: 'person' },
        { key: 'settings', label: 'Settings', icon: 'gear', disabled: true },
      ],
    },
  ]

  const currentLabel = computed(() => {
    for (const section of sections) {
      const hit = section.items.find((item) => item.key === current.value)
      if (hit) return hit.label
    }
    return current.value
  })

  function openLeading(): void {
    placement.value = 'leading'
    open.value = true
  }

  function openTrailing(): void {
    placement.value = 'trailing'
    open.value = true
  }

  function onSelect(payload: { key: string }): void {
    uni.showToast({ title: payload.key, icon: 'none' })
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    min-height: 100%;
    padding-bottom: 40px;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(37, 99, 235, 0.28), transparent 55%),
      radial-gradient(100% 70% at 90% 18%, rgba(236, 72, 153, 0.18), transparent 50%),
      radial-gradient(90% 60% at 50% 100%, rgba(245, 158, 11, 0.16), transparent 45%),
      var(--lingyun-bg-grouped-primary, #f2f2f7);
  }

  .hero {
    padding: 24px 20px 8px;
  }

  .hero__title {
    display: block;
    font-size: 28px;
    font-weight: 700;
    line-height: 34px;
    color: var(--lingyun-label, #1c1c1e);
  }

  .hero__desc,
  .hero__current {
    display: block;
    margin-top: 6px;
    font-size: 15px;
    line-height: 20px;
    color: var(--lingyun-label-secondary, rgba(60, 60, 67, 0.6));
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 24px 20px;
  }
</style>
