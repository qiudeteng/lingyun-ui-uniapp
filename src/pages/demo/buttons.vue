<template>
  <lingyun-app-page title="Buttons">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Buttons</text>
        <text class="hero__desc">lingyun-button · Apple iOS 27 UI Kit</text>
      </view>

      <lingyun-section title="Variant（Sketch Style）">
        <view class="lingyun-section-row">
          <lingyun-button variant="glass" text="Glass" @click="tap('Glass')" />
          <lingyun-button variant="borderedProminent" text="Prominent" @click="tap('Prominent')" />
          <lingyun-button variant="bordered" text="Bordered" @click="tap('Bordered')" />
          <lingyun-button variant="borderless" text="Borderless" @click="tap('Borderless')" />
        </view>
      </lingyun-section>

      <lingyun-section title="Size · Glass">
        <view class="lingyun-section-row">
          <lingyun-button variant="glass" size="large" text="Large" @click="tap('Large')" />
          <lingyun-button variant="glass" size="medium" text="Medium" @click="tap('Medium')" />
          <lingyun-button variant="glass" size="small" text="Small" @click="tap('Small')" />
          <lingyun-button variant="glass" size="mini" text="Mini" @click="tap('Mini')" />
        </view>
      </lingyun-section>

      <lingyun-section title="Size · Bordered Prominent">
        <view class="lingyun-section-row">
          <lingyun-button variant="borderedProminent" size="large" text="Large" @click="tap" />
          <lingyun-button variant="borderedProminent" size="medium" text="Medium" @click="tap" />
          <lingyun-button variant="borderedProminent" size="small" text="Small" @click="tap" />
          <lingyun-button variant="borderedProminent" size="mini" text="Mini" @click="tap" />
        </view>
      </lingyun-section>

      <lingyun-section title="Role">
        <view class="lingyun-section-row">
          <lingyun-button variant="glass" role="normal" text="Normal" @click="tap" />
          <lingyun-button variant="glass" role="cancel" text="Cancel" @click="tap" />
          <lingyun-button variant="glass" role="success" text="Done" @click="tap" />
          <lingyun-button variant="glass" role="warning" text="Review" @click="tap" />
          <lingyun-button variant="glass" role="destructive" text="Delete" @click="tap" />
        </view>
        <view class="lingyun-section-row">
          <lingyun-button variant="borderedProminent" role="normal" text="Save" @click="tap" />
          <lingyun-button variant="borderedProminent" role="success" text="Confirm" @click="tap" />
          <lingyun-button variant="borderedProminent" role="warning" text="Retry" @click="tap" />
          <lingyun-button variant="borderedProminent" role="destructive" text="Delete" @click="tap" />
        </view>
        <view class="lingyun-section-row">
          <lingyun-button variant="bordered" role="success" text="Apply" @click="tap" />
          <lingyun-button variant="bordered" role="warning" text="Hold" @click="tap" />
          <lingyun-button variant="bordered" role="destructive" text="Remove" @click="tap" />
          <lingyun-button variant="borderless" role="success" text="Done" @click="tap" />
          <lingyun-button variant="borderless" role="warning" text="Skip" @click="tap" />
          <lingyun-button variant="borderless" role="destructive" text="Erase" @click="tap" />
        </view>
      </lingyun-section>

      <lingyun-section title="Content · Symbol / Text / Symbol+Text">
        <view class="lingyun-section-row">
          <lingyun-button variant="glass" icon="★" @click="tap('Symbol')" />
          <lingyun-button variant="glass" text="Label" @click="tap('Text')" />
          <lingyun-button variant="glass" icon="★" text="Play" @click="tap('Symbol+Text')" />
        </view>
        <view class="lingyun-section-row">
          <lingyun-button variant="borderedProminent" icon="✓" @click="tap" />
          <lingyun-button variant="borderedProminent" text="Continue" @click="tap" />
          <lingyun-button variant="borderedProminent" icon="→" text="Next" @click="tap" />
        </view>
        <view class="lingyun-section-row">
          <lingyun-button variant="bordered" icon="✎" @click="tap" />
          <lingyun-button variant="bordered" icon="✎" text="Edit" @click="tap" />
          <lingyun-button variant="borderless" icon="›" text="More" @click="tap" />
        </view>
      </lingyun-section>

      <lingyun-section title="States · Idle / Disabled / Loading">
        <view class="lingyun-section-row">
          <lingyun-button variant="glass" text="Idle" @click="tap" />
          <lingyun-button variant="glass" text="Disabled" disabled />
          <lingyun-button variant="glass" text="Loading" :loading="true" />
        </view>
        <view class="lingyun-section-row">
          <lingyun-button variant="borderedProminent" text="Idle" @click="tap" />
          <lingyun-button variant="borderedProminent" text="Disabled" disabled />
          <lingyun-button variant="borderedProminent" text="Saving…" :loading="true" />
        </view>
        <view class="lingyun-section-row">
          <lingyun-button variant="bordered" text="Disabled" disabled />
          <lingyun-button variant="borderless" text="Disabled" disabled />
        </view>
      </lingyun-section>

      <lingyun-section title="Block（通栏）">
        <view class="lingyun-section-stack">
          <lingyun-button variant="glass" block text="Continue" @click="tap" />
          <lingyun-button variant="borderedProminent" block role="success" text="Confirm" @click="tap" />
          <lingyun-button variant="bordered" block role="warning" text="Retry Later" @click="tap" />
          <lingyun-button variant="bordered" block role="cancel" text="Cancel" @click="tap" />
          <lingyun-button variant="glass" block role="destructive" text="Delete Account" @click="tap" />
        </view>
      </lingyun-section>

      <lingyun-section title="Matrix · Variant × Size">
        <view v-for="v in variants" :key="v" class="lingyun-section-matrix">
          <text class="lingyun-section-matrix__label">{{ v }}</text>
          <view class="lingyun-section-row">
            <lingyun-button
              v-for="s in sizes"
              :key="`${v}-${s}`"
              :variant="v"
              :size="s"
              :text="s"
              @click="tap(`${v}/${s}`)"
            />
          </view>
        </view>
      </lingyun-section>

      <lingyun-section title="Alias（兼容）" is-last>
        <view class="lingyun-section-row">
          <lingyun-button variant="filled" text="filled→Prominent" @click="tap" />
          <lingyun-button variant="plain" text="plain→Borderless" @click="tap" />
          <lingyun-button variant="gray" text="gray→Bordered" @click="tap" />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  const variants = ['glass', 'borderedProminent', 'bordered', 'borderless'] as const
  const sizes = ['large', 'medium', 'small', 'mini'] as const

  function tap(name?: string): void {
    uni.showToast({
      title: typeof name === 'string' ? name : 'Tapped',
      icon: 'none',
    })
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
