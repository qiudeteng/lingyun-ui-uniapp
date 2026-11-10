<template>
  <lingyun-app-page title="Menus">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Menus</text>
        <text class="hero__desc">lingyun-menu · lingyun-context-menu</text>
      </view>

      <lingyun-section title="Menu" :hint="last">
        <lingyun-menu v-model:show="open" :actions="actions" @select="onSelect">
          <template #trigger>
            <lingyun-button
              variant="borderedProminent"
              text="Open menu"
              @click="open = !open"
            />
          </template>
        </lingyun-menu>
      </lingyun-section>

      <lingyun-section title="Full width" hint="full-width · 手机铺满，PC / PAD 上限 400">
        <lingyun-menu
          v-model:show="fullOpen"
          full-width
          :actions="actions"
          @select="onSelect"
        >
          <template #trigger>
            <lingyun-button
              variant="borderedProminent"
              text="Open full width"
              @click="fullOpen = !fullOpen"
            />
          </template>
        </lingyun-menu>
      </lingyun-section>

      <lingyun-section title="Context · long-press" is-last>
        <lingyun-context-menu :actions="actions" @select="onSelect">
          <view class="card">
            <text class="card__text">Long-press this card</text>
          </view>
        </lingyun-context-menu>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const open = ref(false)
  const fullOpen = ref(false)
  const last = ref('—')
  /** 对齐 Sketch Examples/Menus 那张官方菜单 */
  const actions = [
    {
      type: 'controls',
      items: [
        { key: 'scan', label: 'Scan', icon: 'scan' },
        { key: 'pin', label: 'Pin', icon: 'map-pin' },
        { key: 'trash', label: 'Trash', icon: 'trash', role: 'destructive' },
      ],
    },
    { type: 'separator' },
    { key: 'action', label: 'Action', icon: 'star' },
    { key: 'disabled', label: 'Disabled Action', icon: 'star', disabled: true },
    { key: 'destructive', label: 'Destructive Action', icon: 'star', role: 'destructive' },
    { type: 'separator' },
    { key: 'action-name', label: 'Action Name', icon: 'star' },
    { type: 'separator' },
    { type: 'title', label: 'Section Title' },
    { key: 'submenu', label: 'Submenu', icon: 'star', submenu: true },
    {
      key: 'submenu-sub',
      label: 'Submenu',
      subtitle: 'Subtitle Goes Here',
      icon: 'star',
      submenu: true,
    },
    { key: 'wrapping', label: 'Wrapping\nSubmenu', icon: 'star', submenu: true },
    { type: 'separator' },
    { type: 'title', label: 'Section Title' },
    { key: 'action-bottom', label: 'Action', icon: 'star' },
  ]

  function onSelect(payload: { key?: string }): void {
    last.value = String(payload && payload.key ? payload.key : '—')
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 40px;
    min-height: 100%;
    background: var(--lingyun-bg-grouped-primary, #f2f2f7);
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

  .card {
    padding: 20px 16px;
    border-radius: 12px;
    background: var(--lingyun-bg-grouped-secondary, #ffffff);
  }

  .card__text {
    font-size: 15px;
    color: var(--lingyun-label, #1c1c1e);
  }
</style>
