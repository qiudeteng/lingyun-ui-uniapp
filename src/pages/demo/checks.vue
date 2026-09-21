<template>
  <lingyun-app-page title="Checkbox & Radio">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Checkbox & Radio</text>
        <text class="hero__desc">checkbox · radio · data-checkbox · data-radio</text>
      </view>

      <lingyun-section title="Data Checkbox" :hint="`tags = ${JSON.stringify(tags)}`">
        <lingyun-data-checkbox v-model="tags" :localdata="tagOptions" :min="1" :max="4" />
      </lingyun-section>

      <lingyun-section title="Data Checkbox · map" :hint="`skills = ${JSON.stringify(skills)}`">
        <lingyun-data-checkbox
          v-model="skills"
          :localdata="skillOptions"
          :map="{ text: 'label', value: 'id', disabled: 'off' }"
        />
      </lingyun-section>

      <lingyun-section title="Data Checkbox · 自定义色" :hint="`colors = ${JSON.stringify(colorPicks)}`">
        <lingyun-data-checkbox v-model="colorPicks" :localdata="colorOptions" color="#AF52DE" />
      </lingyun-section>

      <lingyun-section title="Data Radio" :hint="`ship = ${ship}`">
        <lingyun-data-radio v-model="ship" :localdata="shipOptions" />
      </lingyun-section>

      <lingyun-section title="Data Radio · map" :hint="`plan = ${plan}`">
        <lingyun-data-radio
          v-model="plan"
          :localdata="planOptions"
          :map="{ text: 'name', value: 'code', disabled: 'locked' }"
        />
      </lingyun-section>

      <lingyun-section title="Data Radio · 自定义色" :hint="`theme = ${themePick}`">
        <lingyun-data-radio v-model="themePick" :localdata="themeOptions" color="#FF9500" />
      </lingyun-section>

      <lingyun-section title="Checkbox · 单控" :hint="`agree=${agree}`">
        <view class="stack">
          <lingyun-checkbox v-model="agree" label="I agree to the terms" />
          <lingyun-checkbox v-model="newsletter" label="Subscribe to newsletter" />
          <lingyun-checkbox v-model="disabledOn" label="Checked · disabled" disabled />
        </view>
      </lingyun-section>

      <lingyun-section title="Radio · 手写项" :hint="`fruit=${fruit}`" is-last>
        <lingyun-radio-group v-model="fruit">
          <view class="stack">
            <lingyun-radio value="apple" label="Apple" />
            <lingyun-radio value="pear" label="Pear" />
            <lingyun-radio value="orange" label="Orange" />
            <lingyun-radio value="grape" label="Grape" disabled />
          </view>
        </lingyun-radio-group>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const tags = ref(['work', 'home'])
  const tagOptions = [
    { text: 'Work', value: 'work' },
    { text: 'Home', value: 'home' },
    { text: 'Travel', value: 'travel' },
    { text: 'Food', value: 'food' },
    { text: 'Sport', value: 'sport', disabled: true },
  ]

  const skills = ref(['ts'])
  const skillOptions = [
    { label: 'TypeScript', id: 'ts' },
    { label: 'Vue', id: 'vue' },
    { label: 'Swift', id: 'swift', off: true },
    { label: 'Kotlin', id: 'kotlin' },
  ]

  const colorPicks = ref(['a'])
  const colorOptions = [
    { text: 'Option A', value: 'a' },
    { text: 'Option B', value: 'b' },
    { text: 'Option C', value: 'c' },
  ]

  const ship = ref('express')
  const shipOptions = [
    { text: 'Standard (3–5 days)', value: 'standard' },
    { text: 'Express (1–2 days)', value: 'express' },
    { text: 'Same day', value: 'same-day' },
    { text: 'Store pickup', value: 'pickup', disabled: true },
  ]

  const plan = ref('pro')
  const planOptions = [
    { name: 'Free', code: 'free' },
    { name: 'Pro', code: 'pro' },
    { name: 'Team', code: 'team' },
    { name: 'Enterprise', code: 'ent', locked: true },
  ]

  const themePick = ref('orange')
  const themeOptions = [
    { text: 'Blue', value: 'blue' },
    { text: 'Orange', value: 'orange' },
    { text: 'Purple', value: 'purple' },
  ]

  const agree = ref(true)
  const newsletter = ref(false)
  const disabledOn = ref(true)
  const fruit = ref('apple')
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

  .stack {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
  }
</style>
