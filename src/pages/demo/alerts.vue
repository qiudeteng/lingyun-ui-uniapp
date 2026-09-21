<template>
  <lingyun-app-page title="Alerts">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Alerts</text>
        <text class="hero__desc">lingyun-alert · Sketch Alerts/Light</text>
      </view>

      <lingyun-section title="Default（双钮横排）">
        <lingyun-button variant="borderedProminent" size="large" text="打开 Default" @click="openDefault" />
      </lingyun-section>

      <lingyun-section title="Buttons Stacked（三钮竖排）">
        <lingyun-button variant="borderedProminent" size="large" text="打开 Stacked" @click="openStacked" />
      </lingyun-section>

      <lingyun-section title="Input Field × 1">
        <lingyun-button variant="borderedProminent" size="large" text="打开单输入" @click="openInput1" />
      </lingyun-section>

      <lingyun-section title="Input Field × 2">
        <lingyun-button variant="borderedProminent" size="large" text="打开双输入" @click="openInput2" />
      </lingyun-section>

      <lingyun-section v-if="lastAction" title="最近操作" :hint="lastAction" is-last />

      <lingyun-alert
        v-model:show="defaultVisible"
        title="A Short Title Is Best"
        message="A message should be a short, complete sentence."
        :actions="defaultActions"
        @action="onAction"
      />

      <lingyun-alert
        v-model:show="stackedVisible"
        layout="stack"
        title="A Short Title Is Best"
        message="A message should be a short, complete sentence."
        :actions="stackedActions"
        @action="onAction"
      />

      <lingyun-alert
        v-model:show="input1Visible"
        title="A Short Title Is Best"
        message="A message should be a short, complete sentence."
        :inputs="input1Fields"
        :actions="inputActions"
        @update:inputs="onInput1"
        @action="onAction"
      />

      <lingyun-alert
        v-model:show="input2Visible"
        title="A Short Title Is Best"
        message="A message should be a short, complete sentence."
        :inputs="input2Fields"
        :actions="inputActions"
        @update:inputs="onInput2"
        @action="onAction"
      />
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const defaultVisible = ref(false)
  const stackedVisible = ref(false)
  const input1Visible = ref(false)
  const input2Visible = ref(false)
  const lastAction = ref('')

  const defaultActions = [
    { text: 'Secondary', role: 'cancel' as const },
    { text: 'Primary', primary: true },
  ]

  const stackedActions = [
    { text: 'Primary', primary: true },
    { text: 'Destructive', role: 'destructive' as const },
    { text: 'Secondary', role: 'cancel' as const },
  ]

  const inputActions = [
    { text: 'Cancel', role: 'cancel' as const },
    { text: 'Continue', primary: true },
  ]

  const input1Fields = ref([{ key: 'value', placeholder: 'Placeholder', value: '' }])
  const input2Fields = ref([
    { key: 'value', placeholder: 'Value', value: 'Value' },
    { key: 'placeholder', placeholder: 'Placeholder', value: '' },
  ])

  function openDefault(): void {
    defaultVisible.value = true
  }

  function openStacked(): void {
    stackedVisible.value = true
  }

  function openInput1(): void {
    input1Visible.value = true
  }

  function openInput2(): void {
    input2Visible.value = true
  }

  function onInput1(next: Array<{ key?: string; placeholder?: string; value?: string }>): void {
    input1Fields.value = next
  }

  function onInput2(next: Array<{ key?: string; placeholder?: string; value?: string }>): void {
    input2Fields.value = next
  }

  function onAction(payload: {
    action: { text?: string }
    values?: string[]
  }): void {
    const values = (payload.values || []).filter((v) => v != null && String(v).length).join(' · ')
    lastAction.value = values
      ? `${payload.action.text || ''} · ${values}`
      : String(payload.action.text || '')
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
