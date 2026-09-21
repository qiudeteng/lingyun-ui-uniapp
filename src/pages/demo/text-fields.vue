<template>
  <lingyun-app-page title="Text Fields">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Text Fields</text>
        <text class="hero__desc">lingyun-text-field · Sketch Text Fields</text>
      </view>

      <lingyun-section title="Default">
        <view class="lingyun-section-stack">
          <lingyun-text-field v-model="basic" placeholder="Placeholder" />
          <lingyun-text-field v-model="withValue" placeholder="Placeholder" clearable />
        </view>
      </lingyun-section>

      <lingyun-section title="Label · Hint · Error">
        <view class="lingyun-section-stack">
          <lingyun-text-field
            v-model="labeled"
            label="Name"
            placeholder="Your name"
            hint="Helper text under the field"
          />
          <lingyun-text-field
            v-model="errored"
            label="Email"
            placeholder="name@example.com"
            error="Enter a valid email address"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="Disabled">
        <lingyun-text-field
          model-value="Read only value"
          label="Disabled"
          disabled
        />
      </lingyun-section>

      <lingyun-section title="Leading · Trailing">
        <lingyun-text-field v-model="withSlots" placeholder="Search contacts">
          <template #leading>
            <lingyun-icon type="search" :size="18" color="var(--lingyun-label-secondary, rgba(60,60,67,0.6))" />
          </template>
          <template #trailing>
            <lingyun-button variant="borderless" size="mini" text="Paste" @click="onPaste" />
          </template>
        </lingyun-text-field>
      </lingyun-section>

      <lingyun-section title="Secure">
        <lingyun-text-field
          v-model="password"
          label="Password"
          placeholder="Required"
          secure
          hint="Tap the eye to show or hide"
        />
      </lingyun-section>

      <lingyun-section title="Multiline" is-last>
        <lingyun-text-field
          v-model="notes"
          label="Notes"
          placeholder="Write something…"
          multiline
          :rows="4"
          hint="Multiline textarea"
        />
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const basic = ref('')
  const withValue = ref('Sample value')
  const labeled = ref('')
  const errored = ref('not-an-email')
  const withSlots = ref('')
  const password = ref('')
  const notes = ref('')

  function onPaste(): void {
    withSlots.value = 'Pasted text'
    uni.showToast({ title: 'Pasted', icon: 'none' })
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
