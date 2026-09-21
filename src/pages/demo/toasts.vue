<template>
  <lingyun-app-page title="Toast & HUD">
    <view class="page">
      <view class="hero">
        <text class="hero__title">Toast & HUD</text>
        <text class="hero__desc">命令式 · uni.showLingyunToast / uni.showLingyunHud</text>
      </view>

      <lingyun-section title="Toast · uni.showLingyunToast">
        <view class="lingyun-section-stack">
          <lingyun-button
            variant="borderedProminent"
            block
            text="Default · uni.showLingyunToast('Saved')"
            @click="toastDefault"
          />
          <lingyun-button
            variant="bordered"
            block
            text="Success · { type: 'success' }"
            @click="toastOk"
          />
          <lingyun-button
            variant="bordered"
            block
            role="destructive"
            text="Error · { type: 'error' }"
            @click="toastErr"
          />
          <lingyun-button
            variant="glass"
            block
            text="Loading · 2s 后 uni.hideLingyunToast"
            @click="toastLoading"
          />
        </view>
      </lingyun-section>

      <lingyun-section title="HUD · uni.showLingyunHud / hideLingyunHud" is-last>
        <view class="lingyun-section-stack">
          <lingyun-button
            variant="borderedProminent"
            block
            text="uni.showLingyunHud · 1.5s 后 hide"
            @click="demoHud"
          />
          <lingyun-button
            variant="bordered"
            block
            text="uni.showLingyunHud({ text, maskClosable })"
            @click="demoHudClosable"
          />
        </view>
      </lingyun-section>
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  function toastDefault(): void {
    uni.showLingyunToast('Saved')
  }

  function toastOk(): void {
    uni.showLingyunToast({ text: 'Success', type: 'success' })
  }

  function toastErr(): void {
    uni.showLingyunToast({
      text: 'Something went wrong',
      type: 'error',
      duration: 2200,
    })
  }

  function toastLoading(): void {
    uni.showLingyunToast({ text: 'Uploading…', type: 'loading' })
    setTimeout(() => {
      uni.hideLingyunToast()
    }, 2000)
  }

  function demoHud(): void {
    uni.showLingyunHud('Loading…')
    setTimeout(() => {
      uni.hideLingyunHud()
    }, 1500)
  }

  function demoHudClosable(): void {
    uni.showLingyunHud({ text: 'Tap mask to close', maskClosable: true })
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
