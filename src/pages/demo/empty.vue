<template>
  <lingyun-app-page title="Empty">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Empty</text>
        <text class="hero__desc">Sketch Empty State · plain / symbol / circle</text>
      </view>

      <lingyun-section title="Title and Subtitle">
        <view class="stage">
          <lingyun-empty
            variant="plain"
            title="No Notes"
            description="Start by adding a note."
            fill
            action-placement="bottom"
          >
            <template #action>
              <lingyun-button variant="borderedProminent" block text="Create Note" @click="onCreate" />
            </template>
          </lingyun-empty>
        </view>
      </lingyun-section>

      <lingyun-section title="Large Symbol">
        <lingyun-empty
          variant="symbol"
          icon="✓"
          icon-color="#FF3B30"
          title="No Reminders"
          description="You've completed all tasks."
          action-placement="bottom"
        >
          <template #action>
            <lingyun-button
              variant="borderedProminent"
              role="destructive"
              block
              text="New Reminder"
              @click="onRemind"
            />
          </template>
        </lingyun-empty>
      </lingyun-section>

      <lingyun-section title="Symbol in Circle" is-last>
        <lingyun-empty
          variant="circle"
          icon="★"
          icon-color="#FFCC00"
          title="VIP"
          description="Quickly access mail from important people in your VIP mailbox."
          action-placement="bottom"
        >
          <template #action>
            <lingyun-button
              variant="borderedProminent"
              role="warning"
              block
              text="Add VIP"
              @click="onVip"
            />
          </template>
        </lingyun-empty>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  function onCreate(): void {
    uni.showToast({ title: 'Create Note', icon: 'none' })
  }

  function onRemind(): void {
    uni.showToast({ title: 'New Reminder', icon: 'none' })
  }

  function onVip(): void {
    uni.showToast({ title: 'Add VIP', icon: 'none' })
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

  .stage {
    min-height: 360px;
    display: flex;
    flex-direction: column;
  }
</style>
