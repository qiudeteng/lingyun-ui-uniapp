<template>
  <lingyun-app-page title="Activity Views">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Activity Views</text>
        <text class="hero__desc">lingyun-activity-view · Sketch Activity Views</text>
      </view>

      <lingyun-section title="Half Height">
        <lingyun-button
          variant="borderedProminent"
          size="large"
          block
          text="打开半高分享"
          @click="halfOpen = true"
        />
      </lingyun-section>

      <lingyun-section title="Full Height" :hint="menuText">
        <lingyun-button
          variant="borderedProminent"
          size="large"
          block
          text="打开全高 · Collaborate"
          @click="fullOpen = true"
        />
      </lingyun-section>

      <lingyun-section v-if="lastAction" title="最近操作" :hint="lastAction" is-last />
    </view>

    <lingyun-activity-view
      v-model:show="halfOpen"
      detent="half"
      title="Title"
      :contacts="contacts"
      :apps="apps"
      :shortcuts="shortcuts"
      :groups="groups"
      @select="onSelect"
    />

    <lingyun-activity-view
      v-model:show="fullOpen"
      detent="full"
      title="Title"
      subtitle="Shared document"
      menu-text="Collaborate"
      menu-icon="staff"
      permission-text="Everyone can make changes"
      :contacts="contacts"
      :apps="apps"
      :shortcuts="shortcuts"
      :groups="groups"
      @select="onSelect"
      @menu="onMenu"
      @permission="onPermission"
    />
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const halfOpen = ref(false)
  const fullOpen = ref(false)
  const lastAction = ref('')
  const menuText = ref('顶栏可切 Collaborate')

  const contacts = [
    { name: 'Ashley Kamin', color: '#0088ff', badge: 'chat', badgeColor: '#34c759' },
    { name: 'Amber Spiers', color: '#ff8d28', badge: 'chat', badgeColor: '#34c759' },
    { name: 'Jordan Lee', color: '#6155f5', badge: 'email', badgeColor: '#0088ff' },
    { name: 'Casey Ng', color: '#cb30e0', badge: 'chat', badgeColor: '#34c759' },
    { name: 'Riley Chen', color: '#00c3d0', badge: 'email', badgeColor: '#0088ff' },
  ]

  const apps = [
    { name: 'AirDrop', icon: 'paperplane', color: '#0088ff' },
    { name: 'Messages', icon: 'chat', color: '#34c759' },
    { name: 'Mail', icon: 'email', color: '#5ac8fa' },
    { name: 'Notes', icon: 'compose', color: '#ffcc00' },
    { name: 'More', icon: 'more', color: '#8e8e93' },
  ]

  const shortcuts = [
    { text: 'Copy', icon: 'paperclip' },
    { text: 'Annotate', icon: 'compose' },
    { text: 'Archive', icon: 'download' },
    { text: 'Lock', icon: 'locked' },
  ]

  const groups = [
    { actions: [{ text: 'Copy', icon: 'paperclip' }] },
    {
      actions: [
        { text: 'Add to Reading List', icon: 'list' },
        { text: 'Add Bookmark', icon: 'star' },
        { text: 'Add to Favorites', icon: 'heart' },
        { text: 'Find on Page', icon: 'search' },
        { text: 'Add to Home Screen', icon: 'home' },
      ],
    },
    {
      actions: [
        { text: 'Markup', icon: 'compose' },
        { text: 'Print', icon: 'download' },
      ],
    },
  ]

  function onSelect(payload: { kind: string; item: { text?: string; name?: string } }): void {
    const label = payload.item.text || payload.item.name || payload.kind
    lastAction.value = `${payload.kind} · ${label}`
  }

  function onMenu(): void {
    menuText.value = '已点 Collaborate'
    lastAction.value = 'menu · Collaborate'
  }

  function onPermission(): void {
    lastAction.value = 'permission · Everyone can make changes'
  }
</script>

<style lang="scss">
  .page {
    box-sizing: border-box;
    padding-bottom: 40px;
    min-height: 100%;
    background:
      radial-gradient(120% 80% at 10% 0%, rgba(0, 136, 255, 0.18), transparent 55%),
      radial-gradient(90% 60% at 50% 100%, rgba(52, 199, 89, 0.12), transparent 45%),
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
