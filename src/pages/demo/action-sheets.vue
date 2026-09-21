<template>
  <lingyun-app-page title="Action Sheets">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Action Sheets</text>
        <text class="hero__desc">lingyun-action-sheet · HIG Action Sheets</text>
      </view>

      <lingyun-section title="Default">
        <lingyun-button
          variant="borderedProminent"
          size="large"
          block
          text="打开默认"
          @click="openDefault"
        />
      </lingyun-section>

      <lingyun-section title="With Title / Message">
        <lingyun-button
          variant="borderedProminent"
          size="large"
          block
          text="打开带说明"
          @click="openWithHeader"
        />
      </lingyun-section>

      <lingyun-section title="Destructive" :is-last="!lastAction">
        <lingyun-button
          variant="borderedProminent"
          size="large"
          block
          role="destructive"
          text="打开删除确认"
          @click="openDestructive"
        />
      </lingyun-section>

      <lingyun-section v-if="lastAction" title="最近操作" :hint="lastAction" is-last />
    </view>

    <lingyun-action-sheet
      v-model:show="defaultOpen"
      :actions="defaultActions"
      @action="onAction"
      @cancel="onCancel"
    />

    <lingyun-action-sheet
      v-model:show="headerOpen"
      title="Select an option"
      message="A message should be a short, complete sentence."
      :actions="headerActions"
      @action="onAction"
      @cancel="onCancel"
    />

    <lingyun-action-sheet
      v-model:show="destructiveOpen"
      title="Delete this item?"
      message="This action cannot be undone."
      :actions="destructiveActions"
      cancel-text="Cancel"
      @action="onAction"
      @cancel="onCancel"
    />
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const defaultOpen = ref(false)
  const headerOpen = ref(false)
  const destructiveOpen = ref(false)
  const lastAction = ref('')

  const defaultActions = [
    { text: 'Edit' },
    { text: 'Share' },
    { text: 'Add to Favorites' },
  ]

  const headerActions = [
    { text: 'Option One' },
    { text: 'Option Two' },
    { text: 'Option Three' },
  ]

  const destructiveActions = [
    { text: 'Delete', role: 'destructive' as const },
  ]

  function openDefault(): void {
    defaultOpen.value = true
  }

  function openWithHeader(): void {
    headerOpen.value = true
  }

  function openDestructive(): void {
    destructiveOpen.value = true
  }

  function onAction(payload: { action: { text?: string } }): void {
    lastAction.value = String(payload.action.text || '')
  }

  function onCancel(): void {
    lastAction.value = 'Cancel'
  }
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
